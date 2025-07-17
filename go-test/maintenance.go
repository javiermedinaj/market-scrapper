package main

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"
)

func compressOldData(baseDir string) error {
	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7)

	entries, err := ioutil.ReadDir(filepath.Join(baseDir, "daily"))
	if err != nil {
		return fmt.Errorf("error reading daily directory: %v", err)
	}
	weeklyFiles := make(map[string][]string)

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		date, err := time.Parse("2006-01-02", entry.Name())
		if err != nil {
			log.Printf("Warning: invalid directory name format: %s", entry.Name())
			continue
		}

		if date.Before(sevenDaysAgo) {
			year := date.Format("2006")
			week := fmt.Sprintf("%02d", date.Day()/7+1)
			month := date.Format("01")
			weekKey := fmt.Sprintf("%s-%s-W%s", year, month, week)

			histDir := filepath.Join(baseDir, "historical", year, month)
			if err := os.MkdirAll(histDir, 0755); err != nil {
				return fmt.Errorf("error creating historical directory: %v", err)
			}

			weeklyFiles[weekKey] = append(weeklyFiles[weekKey], entry.Name())

			archiveName := filepath.Join(histDir, fmt.Sprintf("week%s.tar.gz", week))

			if err := compressDirectory(
				filepath.Join(baseDir, "daily", entry.Name()),
				archiveName,
			); err != nil {
				return fmt.Errorf("error compressing directory %s: %v", entry.Name(), err)
			}

			if len(weeklyFiles[weekKey]) == len(entry.Name()) {
				for _, dirName := range weeklyFiles[weekKey] {
					srcPath := filepath.Join(baseDir, "daily", dirName)
					if err := compressDirectory(srcPath, archiveName); err != nil {
						return fmt.Errorf("error compressing directory %s: %v", dirName, err)
					}

					if err := os.RemoveAll(srcPath); err != nil {
						return fmt.Errorf("error removing original directory: %v", err)
					}
				}
				log.Printf("Compressed week %s to %s", week, archiveName)
			}
		}
	}

	return nil
}

func compressDirectory(sourceDir, targetFile string) error {
	file, err := os.Create(targetFile)
	if err != nil {
		return err
	}
	defer file.Close()

	gzw := gzip.NewWriter(file)
	defer gzw.Close()

	tw := tar.NewWriter(gzw)
	defer tw.Close()

	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(info, path)
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}
		header.Name = relPath

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if info.Mode().IsRegular() {
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()
			if _, err := io.Copy(tw, file); err != nil {
				return err
			}
		}

		return nil
	})
}

func RunMaintenance(baseDir string) error {
	return compressOldData(baseDir)
}

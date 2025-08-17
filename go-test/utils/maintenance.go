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
	"strings"
	"time"
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--migrate" {
		log.Println("=== Ejecutando migración de datos existentes ===")
		MigrateExistingData()
		return
	}

	baseDir := "../data"
	log.Println("Iniciando mantenimiento de archivos...")

	if err := RunMaintenance(baseDir); err != nil {
		log.Fatalf("Error en mantenimiento: %v", err)
	}

	log.Println("Mantenimiento completado exitosamente")
}

func compressOldData(baseDir string) error {
	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7)

	dailyDir := filepath.Join(baseDir, "daily")

	if _, err := os.Stat(dailyDir); os.IsNotExist(err) {
		log.Printf("Directorio daily no existe: %s", dailyDir)
		return nil
	}

	entries, err := ioutil.ReadDir(dailyDir)
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
			year, week := date.ISOWeek()
			month := date.Format("01")
			weekKey := fmt.Sprintf("%d-%s-W%02d", year, month, week)

			histDir := filepath.Join(baseDir, "historical", fmt.Sprintf("%d", year), month)
			if err := os.MkdirAll(histDir, 0755); err != nil {
				return fmt.Errorf("error creating historical directory: %v", err)
			}

			weeklyFiles[weekKey] = append(weeklyFiles[weekKey], entry.Name())
			log.Printf("Directorio %s será archivado en semana %s", entry.Name(), weekKey)
		}
	}

	if len(weeklyFiles) == 0 {
		log.Println("No hay archivos antiguos para comprimir")
		return nil
	}

	for weekKey, dirs := range weeklyFiles {
		parts := strings.Split(weekKey, "-")
		if len(parts) < 3 {
			log.Printf("Skipping invalid weekKey: %s", weekKey)
			continue
		}
		year := parts[0]
		month := parts[1]
		week := strings.TrimPrefix(parts[2], "W")

		histDir := filepath.Join(baseDir, "historical", year, month)
		archiveName := filepath.Join(histDir, fmt.Sprintf("week%s.tar.gz", week))

		var srcDirs []string
		for _, d := range dirs {
			srcPath := filepath.Join(dailyDir, d)
			if _, err := os.Stat(srcPath); err == nil {
				srcDirs = append(srcDirs, srcPath)
			} else {
				log.Printf("Warning: directorio no encontrado: %s", srcPath)
			}
		}

		if len(srcDirs) == 0 {
			log.Printf("No hay directorios válidos para la semana %s", weekKey)
			continue
		}

		log.Printf("Creando archivo %s para directorios: %v", archiveName, srcDirs)
		if err := compressDirsToTarGz(srcDirs, archiveName); err != nil {
			return fmt.Errorf("error creating archive %s: %v", archiveName, err)
		}

		if stat, err := os.Stat(archiveName); err != nil || stat.Size() == 0 {
			return fmt.Errorf("archivo comprimido no se creó correctamente: %s", archiveName)
		} else {
			for _, d := range srcDirs {
				log.Printf("Eliminando directorio original: %s", d)
				if err := os.RemoveAll(d); err != nil {
					return fmt.Errorf("error removing original directory %s: %v", d, err)
				}
			}
			log.Printf("✅ Comprimida semana %s a %s (%.2f MB)", weekKey, archiveName, float64(stat.Size())/1024/1024)
		}
	}

	return nil
}

func compressDirsToTarGz(sourceDirs []string, targetFile string) error {
	out, err := os.Create(targetFile)
	if err != nil {
		return err
	}
	defer out.Close()

	gzw := gzip.NewWriter(out)
	defer gzw.Close()

	tw := tar.NewWriter(gzw)
	defer tw.Close()

	totalFiles := 0
	for _, src := range sourceDirs {
		baseDir := filepath.Base(src)
		log.Printf("Comprimiendo directorio: %s", src)

		err := filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			relPath, err := filepath.Rel(src, path)
			if err != nil {
				return err
			}
			archivePath := filepath.ToSlash(filepath.Join(baseDir, relPath))

			header, err := tar.FileInfoHeader(info, "")
			if err != nil {
				return err
			}
			header.Name = archivePath

			if err := tw.WriteHeader(header); err != nil {
				return err
			}

			if info.Mode().IsRegular() {
				f, err := os.Open(path)
				if err != nil {
					return err
				}
				defer f.Close()

				_, err = io.Copy(tw, f)
				if err != nil {
					return err
				}
				totalFiles++
			}
			return nil
		})
		if err != nil {
			return fmt.Errorf("error walking source %s: %v", src, err)
		}
	}

	log.Printf("Archivos comprimidos: %d", totalFiles)
	return nil
}

func RunMaintenance(baseDir string) error {
	return compressOldData(baseDir)
}

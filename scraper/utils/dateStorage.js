import fs from 'fs/promises';
import path from 'path';

export async function saveDataWithDate(data, storeName, baseDir) {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const timeString = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    const dailyDir = path.join(baseDir, 'daily', dateString);
    await fs.mkdir(dailyDir, { recursive: true });
    const filename = `${storeName}-ofertas.json`;
    const filePath = path.join(dailyDir, filename);
    const dataWithMetadata = {
        timestamp: now.toISOString(),
        date: dateString,
        time: timeString,
        store: storeName,
        totalProducts: data.length,
        lastUpdate: now.toISOString(),
        data: data
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataWithMetadata, null, 2));
    
    const todayDir = path.join(baseDir, 'today');
    await fs.mkdir(todayDir, { recursive: true });
    const todayFilePath = path.join(todayDir, `${storeName}-ofertas.json`);
    await fs.writeFile(todayFilePath, JSON.stringify(dataWithMetadata, null, 2));
    
    console.log(`✅ Datos guardados para ${storeName}:`);
    console.log(`   � Día: ${dateString}`);
    console.log(`   � Archivo: ${filePath}`);
    console.log(`   📊 Total productos: ${data.length}`);
    console.log(`   ⏰ Última actualización: ${timeString}`);
    
    return {
        dailyPath: filePath,
        todayPath: todayFilePath,
        date: dateString,
        timestamp: now.toISOString(),
        totalProducts: data.length
    };
}

/**
 * Función para obtener el historial de un store (por días)
 * @param {string} storeName 
 * @param {string} baseDir 
 * @param {number} limit 
 */
export async function getStoreHistory(storeName, baseDir, limit = 10) {
    try {
        const dailyDir = path.join(baseDir, 'daily');
        const dates = await fs.readdir(dailyDir);
        
        const history = [];
        
        const sortedDates = dates
            .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/))
            .sort((a, b) => b.localeCompare(a));
        
        for (const date of sortedDates.slice(0, limit)) {
            try {
                const filePath = path.join(dailyDir, date, `${storeName}-ofertas.json`);
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                
                history.push({
                    date: date,
                    timestamp: data.timestamp,
                    lastUpdate: data.lastUpdate,
                    totalProducts: data.totalProducts,
                    path: filePath,
                    filename: `${storeName}-ofertas.json`
                });
            } catch (fileError) {
                continue;
            }
        }
        
        return history;
    } catch (error) {
        console.error(`Error al obtener historial para ${storeName}:`, error);
        return [];
    }
}

async function scanDirectory(dir, files, storeName) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await scanDirectory(fullPath, files, storeName);
            } else if (entry.isFile() && entry.name.includes(`${storeName}-ofertas`)) {
                try {
                    const content = await fs.readFile(fullPath, 'utf8');
                    const data = JSON.parse(content);
                    files.push({
                        path: fullPath,
                        filename: entry.name,
                        timestamp: data.timestamp,
                        date: data.date,
                        totalProducts: data.totalProducts
                    });
                } catch (parseError) {
                    console.warn(`Error al parsear archivo ${fullPath}:`, parseError);
                }
            }
        }
    } catch (error) {
 
    }
}

/**
 * Función para limpiar archivos antiguos por días
 * @param {string} baseDir - Directorio base
 * @param {number} daysToKeep - Días a mantener (default: 30)
 */
export async function cleanOldFiles(baseDir, daysToKeep = 30) {
    const dailyDir = path.join(baseDir, 'daily');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    
    try {
        const dates = await fs.readdir(dailyDir);
        let deletedDays = 0;
        let deletedFiles = 0;
        
        for (const date of dates) {
            if (date.match(/^\d{4}-\d{2}-\d{2}$/) && date < cutoffDateString) {
                const datePath = path.join(dailyDir, date);
                try {
                    const files = await fs.readdir(datePath);
                    deletedFiles += files.length;
                    
                    await fs.rmdir(datePath, { recursive: true });
                    deletedDays++;
                    
                    console.log(`🗑️  Eliminado día: ${date} (${files.length} archivos)`);
                } catch (deleteError) {
                    console.warn(`⚠️  No se pudo eliminar ${datePath}:`, deleteError.message);
                }
            }
        }
        
        console.log(`🧹 Limpieza completada:`);
        console.log(`   📅 Días eliminados: ${deletedDays}`);
        console.log(`   📄 Archivos eliminados: ${deletedFiles}`);
        console.log(`   📅 Manteniendo archivos desde: ${cutoffDateString}`);
        
    } catch (error) {
        console.error('Error durante la limpieza:', error);
    }
}

async function cleanDirectoryRecursive(dir, cutoffDate) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await cleanDirectoryRecursive(fullPath, cutoffDate);
                
                try {
                    const remainingFiles = await fs.readdir(fullPath);
                    if (remainingFiles.length === 0) {
                        await fs.rmdir(fullPath);
                    }
                } catch (error) {
                }
            } else if (entry.isFile()) {
                try {
                    const content = await fs.readFile(fullPath, 'utf8');
                    const data = JSON.parse(content);
                    const fileDate = new Date(data.timestamp);
                    
                    if (fileDate < cutoffDate) {
                        await fs.unlink(fullPath);
                        console.log(`🗑️  Eliminado: ${fullPath}`);
                    }
                } catch (error) {
                    const stats = await fs.stat(fullPath);
                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(fullPath);
                        console.log(`🗑️  Eliminado (por fecha de modificación): ${fullPath}`);
                    }
                }
            }
        }
    } catch (error) {
        // Directorio no existe, ignorar
    }
}

/**
 * Función para obtener los datos del día actual o los más recientes
 * @param {string} storeName - Nombre del store
 * @param {string} baseDir - Directorio base
 * @param {string} targetDate - Fecha específica (opcional, formato YYYY-MM-DD)
 */
export async function getTodayOrLatestData(storeName, baseDir, targetDate = null) {
    const today = targetDate || new Date().toISOString().split('T')[0];
    
    try {
        const todayPath = path.join(baseDir, 'daily', today, `${storeName}-ofertas.json`);
        const todayData = await fs.readFile(todayPath, 'utf-8');
        return {
            data: JSON.parse(todayData),
            source: 'today',
            date: today,
            path: todayPath
        };
    } catch (todayError) {
        try {
            const dailyDir = path.join(baseDir, 'daily');
            const dates = await fs.readdir(dailyDir);
            
            const sortedDates = dates
                .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/))
                .sort((a, b) => b.localeCompare(a));
            
            for (const date of sortedDates) {
                try {
                    const datePath = path.join(dailyDir, date, `${storeName}-ofertas.json`);
                    const dateData = await fs.readFile(datePath, 'utf-8');
                    return {
                        data: JSON.parse(dateData),
                        source: 'recent',
                        date: date,
                        path: datePath
                    };
                } catch (dateError) {
                    continue; 
                }
            }
            
            throw new Error(`No se encontraron datos para ${storeName}`);
        } catch (recentError) {
            throw new Error(`No se pudieron obtener datos para ${storeName}: ${recentError.message}`);
        }
    }
}

/**
 * Función para obtener todos los datos del día actual o más recientes
 * @param {string} baseDir - Directorio base
 * @param {string} targetDate - Fecha específica (opcional)
 */
export async function getAllTodayOrLatestData(baseDir, targetDate = null) {
    const stores = ['jumbo', 'carrefour', 'dia', 'farma', 'farmacity', 'coto'];
    const result = {};
    
    for (const store of stores) {
        try {
            const storeData = await getTodayOrLatestData(store, baseDir, targetDate);
            result[store] = storeData;
        } catch (error) {
            console.log(`⚠️  No se pudieron obtener datos para ${store}: ${error.message}`);
            result[store] = { error: error.message, hasData: false };
        }
    }
    
    return result;
}

/**
 * Función para listar todos los días disponibles
 * @param {string} baseDir - Directorio base
 */
export async function getAvailableDates(baseDir) {
    try {
        const dailyDir = path.join(baseDir, 'daily');
        const dates = await fs.readdir(dailyDir);
        
        return dates
            .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/))
            .sort((a, b) => b.localeCompare(a)); // Más reciente primero
    } catch (error) {
        return [];
    }
}

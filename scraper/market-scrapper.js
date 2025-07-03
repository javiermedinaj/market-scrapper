
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function updateStaticData() {
  log('\n🔄 Actualizando datos estáticos...', 'cyan');
  try {
    await execCommand('node', ['update-static-data.js', 'update'], {
      cwd: __dirname
    });
    log('✅ Datos estáticos actualizados correctamente\n', 'green');
  } catch (error) {
    log(`❌ Error actualizando datos estáticos: ${error.message}\n`, 'red');
    throw error;
  }
}

async function startFrontend() {
  log('🚀 Iniciando frontend...', 'cyan');
  const frontendPath = path.join(__dirname, '..', 'offers-scrap');
  
  try {
    await execCommand('npm', ['run', 'dev'], {
      cwd: frontendPath
    });
  } catch (error) {
    log(`❌ Error iniciando frontend: ${error.message}`, 'red');
    throw error;
  }
}

async function checkStatus() {
  log('\n📊 Estado del sistema:', 'cyan');
  log('===================', 'cyan');
  
  try {
    await execCommand('node', ['update-static-data.js', 'check'], {
      cwd: __dirname
    });

    log('\n🖥️ Estado del servidor:', 'cyan');
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        log('✅ Servidor backend está funcionando', 'green');
      } else {
        log('⚠️ Servidor backend responde pero con errores', 'yellow');
      }
    } catch (error) {
      log('❌ Servidor backend no está corriendo', 'red');
    }
    
    log('\n🌐 Estado del frontend:', 'cyan');
    try {
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        log('✅ Frontend está funcionando', 'green');
      } else {
        log('⚠️ Frontend responde pero con errores', 'yellow');
      }
    } catch (error) {
      log('❌ Frontend no está corriendo', 'red');
    }
    
  } catch (error) {
    log(`❌ Error verificando estado: ${error.message}`, 'red');
  }
}

async function runAllScrapers() {
  log('\n🤖 Ejecutando todos los scrapers...', 'cyan');
  try {
    await execCommand('node', ['test-all-scrapers.js'], {
      cwd: __dirname
    });
    log('✅ Scrapers ejecutados correctamente', 'green');
    
    await updateStaticData();
  } catch (error) {
    log(`❌ Error ejecutando scrapers: ${error.message}`, 'red');
    throw error;
  }
}

async function quickStart() {
  log('\n🚀 Inicio rápido del Market Scrapper', 'bright');
  log('===================================', 'bright');
  
  try {

    await updateStaticData();

    log('🌐 Iniciando frontend en http://localhost:5173...', 'cyan');
    await startFrontend();
    
  } catch (error) {
    log(`❌ Error en inicio rápido: ${error.message}`, 'red');
    process.exit(1);
  }
}

function showHelp() {
  log('\n🛠️ Market Scrapper - Utilidades', 'bright');
  log('=================================', 'bright');
  log('');
  log('Comandos disponibles:', 'cyan');
  log('  start        - Inicio rápido: actualiza datos y inicia frontend', 'white');
  log('  update       - Actualiza los datos estáticos con los más recientes', 'white');
  log('  check        - Verifica el estado del sistema', 'white');
  log('  scrape       - Ejecuta todos los scrapers y actualiza datos', 'white');
  log('  frontend     - Solo inicia el frontend', 'white');
  log('  help         - Muestra esta ayuda', 'white');
  log('');
  log('Ejemplos:', 'yellow');
  log('  node market-scrapper.js start', 'white');
  log('  node market-scrapper.js update', 'white');
  log('  node market-scrapper.js check', 'white');
  log('');
  log('Notas:', 'magenta');
  log('  - El frontend funciona sin necesidad del servidor backend', 'white');
  log('  - Los datos estáticos se actualizan automáticamente', 'white');
  log('  - El frontend estará disponible en http://localhost:5173', 'white');
}

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'start':
        await quickStart();
        break;
      case 'update':
        await updateStaticData();
        break;
      case 'check':
        await checkStatus();
        break;
      case 'scrape':
        await runAllScrapers();
        break;
      case 'frontend':
        await startFrontend();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

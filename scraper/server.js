import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import searchAllMarkets from './searchers/searchAllMarkets.js';
import { getStoreHistory, getTodayOrLatestData, getAllTodayOrLatestData, getAvailableDates } from './utils/dateStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/offers', async (req, res) => {
  const { date } = req.query; 
  
  try {
    const dataDir = join(__dirname, 'data');
    console.log(`📊 Obteniendo ofertas${date ? ` para ${date}` : ' del día actual o más recientes'}`);
    
    const allData = await getAllTodayOrLatestData(dataDir, date);
    const offersData = {};
    
    for (const [storeName, storeInfo] of Object.entries(allData)) {
      if (storeInfo.data && !storeInfo.error) {
        const products = storeInfo.data.data || [];
        const formattedProducts = {};
        
        products.forEach((product, index) => {
          formattedProducts[index.toString()] = product;
        });
        
        formattedProducts._metadata = {
          source: storeInfo.source,
          date: storeInfo.date,
          lastUpdate: storeInfo.data.lastUpdate || storeInfo.data.timestamp,
          totalProducts: products.length
        };
        
        offersData[storeName] = formattedProducts;
      }
    }
    
    if (Object.keys(offersData).length === 0) {
      console.log('🔄 No hay datos en el nuevo sistema, intentando sistema anterior...');
      
      try {
        const files = await fs.readdir(dataDir);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = await fs.readFile(join(dataDir, file), 'utf-8');
            const storeName = file.split('-')[0];
            const data = JSON.parse(content);
            
            if (Array.isArray(data)) {
              const formattedProducts = {};
              
              data.forEach((product, index) => {
                formattedProducts[index.toString()] = product;
              });
              
              formattedProducts._metadata = {
                source: 'fallback',
                date: new Date().toISOString().split('T')[0],
                lastUpdate: new Date().toISOString(),
                totalProducts: data.length
              };
              
              offersData[storeName] = formattedProducts;
            }
          }
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
    
    console.log(`📊 Enviando datos de ${Object.keys(offersData).length} tiendas`);
    res.json(offersData);
    
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/offers/:store', async (req, res) => {
  const { store } = req.params;
  const { date } = req.query;
  
  try {
    const dataDir = join(__dirname, 'data');
    console.log(`📊 Obteniendo ofertas de ${store}${date ? ` para ${date}` : ' del día actual o más recientes'}`);
    
    const storeData = await getTodayOrLatestData(store, dataDir, date);
    
    const response = {
      ...storeData.data.data || storeData.data,
      _metadata: {
        source: storeData.source,
        date: storeData.date,
        lastUpdate: storeData.data.lastUpdate || storeData.data.timestamp,
        totalProducts: storeData.data.totalProducts || (storeData.data.data ? storeData.data.data.length : 0)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log(`⚠️  Error al obtener datos de ${store}, intentando sistema anterior...`);
    try {
      const filePath = join(__dirname, 'data', `${store}-ofertas.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (fallbackError) {
      console.error(`Error al leer las ofertas de ${store}:`, error);
      res.status(404).json({ error: 'Ofertas no encontradas' });
    }
  }
});

app.get('/api/history/:store', async (req, res) => {
  const { store } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    const dataDir = join(__dirname, 'data');
    const history = await getStoreHistory(store, dataDir, parseInt(limit));
    
    res.json({
      store,
      totalEntries: history.length,
      history
    });
  } catch (error) {
    console.error(`Error al obtener historial para ${store}:`, error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const dataDir = join(__dirname, 'data');
    const stores = ['jumbo', 'carrefour', 'dia', 'farma', 'farmacity', 'coto'];
    const stats = {};

    for (const store of stores) {
      try {
        const history = await getStoreHistory(store, dataDir, 1);
        if (history.length > 0) {
          stats[store] = {
            lastUpdate: history[0].timestamp,
            totalProducts: history[0].totalProducts,
            hasData: true
          };
        } else {
          stats[store] = { hasData: false };
        }
      } catch (error) {
        stats[store] = { hasData: false, error: error.message };
      }
    }

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
  }

  console.log(`Iniciando búsqueda para query: "${query}"`);
  
  try {
      const results = await searchAllMarkets(query);
      console.log(`Búsqueda completada. Resultados: ${results.length}`);
      res.json(results);
  } catch (error) {
      console.error('Error detallado:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
          error: 'Error interno del servidor',
          details: error.message
      });
  }
});

app.get('/api/dates', async (req, res) => {
  try {
    const dataDir = join(__dirname, 'data');
    const dates = await getAvailableDates(dataDir);
    
    res.json({
      totalDates: dates.length,
      dates: dates,
      today: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error al obtener fechas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener fechas' });
  }
});

app.get('/api/date/:date', async (req, res) => {
  const { date } = req.params;
  
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
  }
  
  try {
    const dataDir = join(__dirname, 'data');
    const allData = await getAllTodayOrLatestData(dataDir, date);
    const result = {};
    
    for (const [storeName, storeInfo] of Object.entries(allData)) {
      if (storeInfo.data && !storeInfo.error) {
        result[storeName] = {
          data: storeInfo.data.data || storeInfo.data,
          metadata: {
            date: storeInfo.date,
            lastUpdate: storeInfo.data.lastUpdate || storeInfo.data.timestamp,
            totalProducts: storeInfo.data.totalProducts
          }
        };
      } else {
        result[storeName] = { error: storeInfo.error, hasData: false };
      }
    }
    
    res.json({
      requestedDate: date,
      data: result
    });
    
  } catch (error) {
    console.error(`Error al obtener datos para ${date}:`, error);
    res.status(500).json({ error: 'Error al obtener datos de la fecha' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});



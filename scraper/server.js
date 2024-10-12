import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/offers', async (req, res) => {
  try {
    const dataDir = join(__dirname, 'data');
    const files = await fs.readdir(dataDir);
    const offersData = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(join(dataDir, file), 'utf-8');
        const storeName = file.split('-')[0];
        offersData[storeName] = JSON.parse(content);
      }
    }

    res.json(offersData);
  } catch (error) {
    console.error('Error al leer los archivos de ofertas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/offers/:store', async (req, res) => {
  const { store } = req.params;
  try {
    const filePath = join(__dirname, 'data', `${store}-ofertas.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Error al leer las ofertas de ${store}:`, error);
    res.status(404).json({ error: 'Ofertas no encontradas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
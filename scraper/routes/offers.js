import express from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/:store', async (req, res) => {
  const { store } = req.params;
  try {
    const filePath = join(__dirname, `../data/${store}-ofertas.json`);
    const data = await readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Error reading ${store} offers:`, error);
    res.status(404).json({ error: 'Ofertas no encontradas' });
  }
});

export default router;
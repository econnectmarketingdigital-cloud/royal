import express from 'express';
import { getDb } from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET all etapas (ordered by 'ordem')
router.get('/', authenticateToken, async (req, res) => {
  const db = getDb();
  try {
    const etapas = await db.query('SELECT * FROM funil_etapas ORDER BY ordem ASC');
    res.json({ success: true, data: etapas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new etapa
router.post('/', authenticateToken, requireRole('gestor'), async (req, res) => {
  const db = getDb();
  try {
    const { id, nome, cor, ordem } = req.body;
    if (!id || !nome || !cor || !ordem) {
      return res.status(400).json({ success: false, error: 'Campos incompletos' });
    }

    await db.execute('INSERT INTO funil_etapas (id, nome, cor, ordem) VALUES (?, ?, ?, ?)', [id, nome, cor, ordem]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update etapa
router.put('/:id', authenticateToken, requireRole('gestor'), async (req, res) => {
  const db = getDb();
  try {
    const { nome, cor } = req.body;
    const { id } = req.params;

    await db.execute('UPDATE funil_etapas SET nome = ?, cor = ? WHERE id = ?', [nome, cor, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST reorder
router.post('/reorder', authenticateToken, requireRole('gestor'), async (req, res) => {
  const db = getDb();
  try {
    // orderedIds => array of ids in their new correct order
    const { orderedIds } = req.body;
    
    // Simplest way: execute an update for each
    for (let i = 0; i < orderedIds.length; i++) {
      await db.execute('UPDATE funil_etapas SET ordem = ? WHERE id = ?', [i + 1, orderedIds[i]]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE etapa
router.delete('/:id', authenticateToken, requireRole('gestor'), async (req, res) => {
  const db = getDb();
  try {
    const { id } = req.params;
    // Basic protection
    if (id === 'novo' || id === 'fechado' || id === 'perdido') {
      return res.status(400).json({ success: false, error: 'Estas etapas básicas do sistema não podem ser deletadas.' });
    }
    
    await db.execute('DELETE FROM funil_etapas WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

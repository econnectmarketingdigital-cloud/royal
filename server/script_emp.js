
import { initDatabase } from './database.js';
import crypto from 'crypto';
async function run() {
  const db = await initDatabase();
  
  // Clear units first if exists to avoid FK constraints
  try { await db.execute('DELETE FROM unidades'); } catch(e) {}
  await db.execute('DELETE FROM empreendimentos');
  
  // Insert new ones
  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();
  
  await db.execute(
    'INSERT INTO empreendimentos (id, nome, incorporadora, tipo, faixa_mcmv, ativo) VALUES (?, ?, ?, ?, ?, 1)',
    [id1, 'Residencial MRV Royal', 'MRV', 'Imóvel na Planta', 'Faixa 1']
  );
  await db.execute(
    'INSERT INTO empreendimentos (id, nome, incorporadora, tipo, faixa_mcmv, ativo) VALUES (?, ?, ?, ?, ?, 1)',
    [id2, 'Village Canopus', 'Canopus', 'Imóvel na Planta', 'Faixa 2']
  );
  
  console.log('Empreendimentos updated successfully.');
  process.exit(0);
}
run();


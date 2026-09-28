import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database.js';

const data = JSON.parse(fs.readFileSync('map_data.json', 'utf8'));

const fixChars = (str) => {
  if (!str) return str;
  return str.replace(/\?/g, 'A').replace(/ǟ/g, 'A');
};

async function run() {
  const db = getDb();
  for (const emp of data) {
    const id = uuidv4();
    const nome = fixChars(emp.nome);
    const descricao = fixChars(emp.descricao);
    
    const existing = await db.queryOne('SELECT id FROM empreendimentos WHERE nome = $1', [nome]);
    if (existing) {
      console.log('Skipping ' + nome + ', already exists');
      continue;
    }
    
    await db.execute(`
      INSERT INTO empreendimentos (id, nome, incorporadora, descricao, valor_min, valor_max, tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      id,
      nome,
      emp.incorporadora,
      descricao,
      emp.valor_min,
      emp.valor_min * 1.5,
      emp.tipo
    ]);
    console.log('Inserted ' + nome);
  }
  console.log('Done!');
  process.exit(0);
}

run().catch(console.error);

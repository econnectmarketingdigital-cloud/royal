import { initDatabase } from './database.js';

async function run() {
  const db = await initDatabase();
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS funil_etapas (
      id VARCHAR(50) PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      cor VARCHAR(20) NOT NULL,
      ordem INT NOT NULL
    )
  `);
  
  const existing = await db.query('SELECT COUNT(*) as c FROM funil_etapas');
  if (parseInt(existing[0].c) === 0) {
    const etapas = [
      ['novo', 'Novo', '#3498db', 1],
      ['contato_feito', 'Contato Feito', '#f1c40f', 2],
      ['visita_agendada', 'Visita Agendada', '#9b59b6', 3],
      ['proposta', 'Proposta', '#e67e22', 4],
      ['documentacao', 'Documentação', '#34495e', 5],
      ['fechado', 'Fechado / Ganho', '#2ecc71', 6],
      ['perdido', 'Perdido', '#e74c3c', 7]
    ];
    
    for (const e of etapas) {
      await db.execute('INSERT INTO funil_etapas (id, nome, cor, ordem) VALUES (?, ?, ?, ?)', e);
    }
    console.log('Tabela funil_etapas criada e populada com sucesso!');
  } else {
    console.log('Tabela funil_etapas já existe e já possui dados.');
  }
  process.exit(0);
}
run();

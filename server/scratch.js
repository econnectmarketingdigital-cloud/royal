import { getDb } from './database.js';

async function run() {
  const db = getDb();
  try {
    const isaqueId = 'a9ad8ee0-c243-40df-a6ad-5068e3f20ea9';
    const isaqueLeads = await db.query("SELECT * FROM leads WHERE corretor_id = $1", [isaqueId]);
    const allLeads = await db.query("SELECT l.id, l.nome, l.telefone, l.email, l.corretor_id, l.created_at, u.nome as corretor_nome FROM leads l LEFT JOIN usuarios u ON l.corretor_id = u.id");
    
    let emailOverlap = 0;
    let nameOverlap = 0;
    
    for (const il of isaqueLeads) {
      if (il.email) {
        const matches = allLeads.filter(l => l.email && l.email.toLowerCase() === il.email.toLowerCase());
        if (matches.length > 1) {
          emailOverlap++;
          console.log(`Email overlap for ${il.email}:`, matches.map(m => m.corretor_nome));
        }
      }
      
      if (il.nome) {
        const matches = allLeads.filter(l => l.nome && l.nome.toLowerCase() === il.nome.toLowerCase());
        if (matches.length > 1) {
          nameOverlap++;
          console.log(`Name overlap for ${il.nome}:`, matches.map(m => m.corretor_nome));
        }
      }
    }
    console.log(`Total email overlaps: ${emailOverlap}`);
    console.log(`Total name overlaps: ${nameOverlap}`);
    
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();

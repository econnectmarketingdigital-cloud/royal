
import { initDatabase } from './database.js';
import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

async function run() {
  const db = await initDatabase();
  
  // Iorrana's ID from previous query: 'a83d2287-fdf5-43fe-916d-3032d2a9fd21'
  const corretorId = 'a83d2287-fdf5-43fe-916d-3032d2a9fd21';
  
  const workbook = xlsx.readFile('../Leads trafego IORRANA.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const leads = xlsx.utils.sheet_to_json(sheet);
  
  console.log('Importando ' + leads.length + ' leads para Iorrana...');
  
  let count = 0;
  for (const lead of leads) {
    const nome = lead.saved_name || 'Desconhecido';
    const telefone = lead.formatted_phone || lead.phone_number;
    const origem = 'Planilha Importada';
    
    if (!telefone) continue;
    
    try {
      await db.execute(
        `INSERT INTO leads (id, nome, telefone, corretor_id, origem) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), nome, telefone, corretorId, origem]
      );
      count++;
    } catch (e) {
      // Ignora duplicados ou erros
    }
  }
  
  console.log('Importação concluída! ' + count + ' leads adicionados.');
  process.exit(0);
}

run();

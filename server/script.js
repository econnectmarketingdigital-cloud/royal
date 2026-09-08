
import { initDatabase } from './database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
async function run() {
  const db = await initDatabase();
  await db.execute('DELETE FROM usuarios WHERE email = ?', ['admin@royal.com.br']);
  
  const hash = await bcrypt.hash('@Royal2026', 10);
  const id = crypto.randomUUID();
  await db.execute(
    'INSERT INTO usuarios (id, nome, email, senha_hash, role, ativo, created_at) VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)',
    [id, 'Nayron', 'gestaoroyalimobiliaria@gmail.com', hash, 'gestor']
  );
  console.log('Users updated successfully.');
  process.exit(0);
}
run();


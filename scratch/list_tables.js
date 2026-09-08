import { getDb } from '../server/database.js';

async function run() {
  const db = getDb();
  try {
    const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:");
    console.log(res);

    const users = await db.query("SELECT * FROM usuarios");
    console.log("Users:");
    console.log(users);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();

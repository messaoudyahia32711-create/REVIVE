const { Client } = require('pg');

const connectionString = "postgresql://postgres.cpvvvzgcfwbmqoqwqcpa:yahia7662472@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

async function test() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('CONNECTED successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query Result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('CONNECTION ERROR:', err.message);
    if (err.detail) console.error('DETAIL:', err.detail);
    if (err.hint) console.error('HINT:', err.hint);
    process.exit(1);
  }
}

test();

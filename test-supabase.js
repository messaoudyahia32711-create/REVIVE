const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdnZ2emdjZndibXFvcXdxY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDQ0NDIsImV4cCI6MjA5MTY4MDQ0Mn0.6fXA2lUy4B0mbFILwXLqmNFg0GEsCcxn7Qz5nmzp0bI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdnZ2emdjZndibXFvcXdxY3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEwNDQ0MiwiZXhwIjoyMDkxNjgwNDQyfQ.Fk7LtQJt9zKeayZa6lHcAxJuvytvFdthsMJTkV31FmA';
const URL = 'https://cpvvvzgcfwbmqoqwqcpa.supabase.co';

async function main() {
  // 1. Test service_role key
  console.log('--- Testing service_role key ---');
  let res = await fetch(URL + '/storage/v1/bucket', {
    headers: { 'Authorization': 'Bearer ' + SERVICE_KEY, 'apikey': ANON_KEY }
  });
  const buckets = await res.json();
  console.log('Status:', res.status, JSON.stringify(buckets));

  if (!res.ok) { console.log('ERROR: service_role key failed!'); return; }

  // 2. Create bucket if not exists
  const exists = Array.isArray(buckets) && buckets.find(b => b.name === 'services');
  if (!exists) {
    console.log('--- Creating "services" bucket ---');
    const createRes = await fetch(URL + '/storage/v1/bucket', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'services', name: 'services', public: true, fileSizeLimit: 5242880 })
    });
    console.log('Create:', createRes.status, await createRes.text());
  } else {
    console.log('Bucket "services" already exists!');
  }
  console.log('DONE!');
}

main().catch(e => console.error(e));

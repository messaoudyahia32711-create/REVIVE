import fs from 'fs';

async function main() {
  const fileBuffer = Buffer.from('testing 123'); // Fake image
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('file', blob, 'test.png');

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main();

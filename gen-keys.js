const crypto = require('crypto');
const secret = '4b7fbee5-2ad6-4b9a-b4df-9afe46e9fac6';
const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const anonPayload = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdnZ2emdjZndibXFvcXdxY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkxODgyMTksImV4cCI6MjAwNDc2NDIxOX0';
const servicePayload = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdnZ2emdjZndibXFvcXdxY3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTE4ODIxOSwiZXhwIjoyMDA0NzY0MjE5fQ';

function sign(h, p) {
  const sig = crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64url');
  return h + '.' + p + '.' + sig;
}

console.log('ANON_KEY=' + sign(header, anonPayload));
console.log('SERVICE_ROLE_KEY=' + sign(header, servicePayload));

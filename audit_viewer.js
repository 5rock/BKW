const fs = require('node:fs');
['audit_root.json', 'backend/audit_backend.json', 'frontend/audit_frontend.json'].forEach(f => {
  try {
    const data = JSON.parse(fs.readFileSync(f));
    console.log('---', f, '---');
    if (!data.metadata) {
      console.log('No metadata, audit might be clean or failed to parse.');
      return;
    }
    console.log('Metadata:', data.metadata.vulnerabilities);
    Object.keys(data.vulnerabilities || {}).forEach(k => {
      const v = data.vulnerabilities[k];
      console.log(`- ${k}: ${v.severity} (via ${v.isDirect ? 'direct' : 'transitive'})`);
    });
  } catch(e) {
    console.error('Error reading', f, e.message);
  }
});

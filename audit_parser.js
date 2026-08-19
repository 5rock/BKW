const { execSync } = require('child_process');
const path = require('node:path');

function getAudit(cwd) {
  try {
    const output = execSync('npm audit --json', { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
    return JSON.parse(output);
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch (e) {
        console.log(`Failed to parse stdout for ${cwd}`);
      }
    }
    console.log(`Error running npm audit in ${cwd}: ${err.message}`);
    return null;
  }
}

function printAudit(cwd, data) {
  if (!data) return;
  console.log(`\n===========================================`);
  console.log(`Audit Report for ${cwd}`);
  console.log(`===========================================`);
  const vulns = data.vulnerabilities || {};
  for (const [pkg, info] of Object.entries(vulns)) {
    console.log(`Package: ${pkg}`);
    console.log(`Severity: ${info.severity}`);
    console.log(`Is Direct: ${info.isDirect}`);
    console.log(`Fix Available: ${JSON.stringify(info.fixAvailable)}`);
    if (info.effects && info.effects.length > 0) {
      console.log(`Effects: ${info.effects.join(', ')}`);
    }
    if (info.via && info.via.length > 0) {
      const vias = info.via.map(v => typeof v === 'string' ? v : `${v.title} (${v.range})`).join(' | ');
      console.log(`Via: ${vias}`);
    }
    console.log('-----------------------------------');
  }
}

const rootDir = __dirname;
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');

printAudit(rootDir, getAudit(rootDir));
printAudit(frontendDir, getAudit(frontendDir));
printAudit(backendDir, getAudit(backendDir));

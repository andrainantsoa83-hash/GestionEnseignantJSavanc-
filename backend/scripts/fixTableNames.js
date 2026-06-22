const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'models');
const controllersDir = path.join(__dirname, '..', 'controllers');
const scriptsDir = path.join(__dirname, '..', 'scripts');

const replacements = [
  { old: 'ciscos', new: 'cisco' },
  { old: 'communes', new: 'commune' },
  { old: 'zaps', new: 'zap' },
  { old: 'etablissements', new: 'etablissement' },
  { old: 'enseignants', new: 'enseignant' },
  { old: 'utilisateurs', new: 'utilisateur' },
  { old: 'activity_logs', new: 'activity_log' }
];

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    // Only replace table names in SQL queries to avoid breaking other variables.
    // However, it's safer to just replace all instances of "FROM cisco", "INTO cisco", "UPDATE cisco", etc.
    content = content.replace(new RegExp(`FROM ${r.old}`, 'gi'), `FROM ${r.new}`);
    content = content.replace(new RegExp(`INTO ${r.old}`, 'gi'), `INTO ${r.new}`);
    content = content.replace(new RegExp(`UPDATE ${r.old}`, 'gi'), `UPDATE ${r.new}`);
    content = content.replace(new RegExp(`JOIN ${r.old}`, 'gi'), `JOIN ${r.new}`);
    content = content.replace(new RegExp(`TABLE IF NOT EXISTS ${r.old}`, 'gi'), `TABLE IF NOT EXISTS ${r.new}`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const readDirAndReplace = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readDirAndReplace(fullPath);
    } else if (fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  });
};

readDirAndReplace(modelsDir);
readDirAndReplace(controllersDir);
readDirAndReplace(scriptsDir);

console.log("Renaming complete.");

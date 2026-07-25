const fs = require('fs');
const path = require('path');
const dir = './models';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('Model.js')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // First pattern
    const oldSql1 = /COALESCE\(SUM\(CASE WHEN LOWER\(statut\) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END\), 0\) -\s*COALESCE\(SUM\(CASE WHEN LOWER\(statut\) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END\), 0\)/g;
    const newSql1 = "COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)";
    
    if (oldSql1.test(content)) {
      content = content.replace(oldSql1, newSql1);
      console.log('Updated ' + file + ' (pattern 1)');
    }

    // Second pattern
    const oldSql2 = /SUM\(CASE WHEN LOWER\(statut\) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END\) -\s*SUM\(CASE WHEN LOWER\(statut\) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END\)/g;
    const newSql2 = "COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)";
    
    if (oldSql2.test(content)) {
      content = content.replace(oldSql2, newSql2);
      console.log('Updated ' + file + ' (pattern 2)');
    }

    fs.writeFileSync(path.join(dir, file), content);
  }
});

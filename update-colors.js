const fs = require('fs');
const path = require('path');

const cssFiles = [
  'Fronted/src/index.css',
  'Fronted/src/components/Sidebar/Sidebar.css',
  'Fronted/src/components/Navbar/Navbar.css',
  'Fronted/src/layouts/MainLayout.css',
  'Fronted/src/pages/Cisco.css',
  'Fronted/src/pages/Dashboard.css',
  'Fronted/src/pages/Enseignant.css'
];

const bleuMarine = '#1e293b';
const bleuCiel = '#38bdf8';
const rouge = '#ef4444';
const blanc = '#ffffff';

const colorMap = {
  // Grays to Navy
  '#475569': bleuMarine,
  '#334155': bleuMarine,
  '#64748b': bleuMarine,
  '#94a3b8': bleuMarine,
  '#0f172a': bleuMarine,
  // Exceptions for sidebar which is navy background, needs white or sky blue text
  '#cbd5e1': blanc, 
  
  // Light grays to White
  '#f1f5f9': blanc,
  '#f8fafc': blanc,
  '#eff6ff': blanc,
  '#fffbeb': blanc,
  '#fef2f2': blanc,
  
  // Borders to Navy or Sky Blue
  '#e2e8f0': bleuMarine, 
  
  // Blues
  '#3b82f6': bleuCiel,
  '#2563eb': bleuMarine,
  
  // Others
  '#10b981': bleuCiel,
  '#f59e0b': rouge,
  '#8b5cf6': bleuMarine,
  '#6366f1': bleuMarine,
};

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'gi');
      content = content.replace(regex, newColor);
    }
    
    // Manual tweaks for classes
    content = content.replace(/rgba\(0, 0, 0, [0-9.]+\)/g, bleuMarine);
    
    fs.writeFileSync(file, content);
  }
});

console.log('Colors updated');
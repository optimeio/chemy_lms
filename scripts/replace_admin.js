const fs = require('fs');
const path = require('path');

const adminCssPath = path.join(__dirname, '..', 'frontend', 'src', 'styles', 'AdminPortal.css');

let content = fs.readFileSync(adminCssPath, 'utf8');

// Sidebar
content = content.replace(/background-color: #ffffff;\n  border-right: 1px solid #e2e8f0;\n  display: flex;\n  flex-direction: column;\n  padding: 28px 18px;\n  position: fixed;/g, 
  `background-color: var(--sidebar-bg);\n  border-right: 1px solid var(--border-color);\n  display: flex;\n  flex-direction: column;\n  padding: 28px 18px;\n  position: fixed;`);

content = content.replace(/\.admin-logo-text h2 \{\n  font-size: 15px;\n  font-weight: 800;\n  color: #0f172a;/g, 
  `.admin-logo-text h2 {\n  font-size: 15px;\n  font-weight: 800;\n  color: #ffffff;`);

content = content.replace(/\.admin-menu-item \{\n  width: 100%;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 11px 14px;\n  border: none;\n  background: none;\n  border-radius: 10px;\n  cursor: pointer;\n  color: #64748b;/g,
  `.admin-menu-item {\n  width: 100%;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 11px 14px;\n  border: none;\n  background: none;\n  border-radius: var(--radius-sm);\n  cursor: pointer;\n  color: #ffffff;`);

content = content.replace(/\.admin-menu-item:hover \{\n  background-color: #fdf2f4;\n  color: #722f37;\n\}/g,
  `.admin-menu-item:hover {\n  background-color: var(--dark-teal);\n  color: #ffffff;\n}`);

content = content.replace(/\.admin-menu-item.active \{\n  background: linear-gradient\(135deg, #fdf2f4 0%, #fce7eb 100%\);\n  color: #9b1b30;\n  box-shadow: inset 3px 0 0 #C41E3A;\n\}/g,
  `.admin-menu-item.active {\n  background-color: var(--primary-emerald);\n  color: #ffffff;\n  box-shadow: none;\n}`);

// Cards and hover
content = content.replace(/border-radius: 14px;/g, 'border-radius: var(--radius-lg);');
content = content.replace(/box-shadow: 0 1px 3px rgba\(0, 0, 0, 0.04\);/g, 'box-shadow: var(--shadow-card);');
content = content.replace(/box-shadow: 0 6px 20px rgba\(0, 0, 0, 0.06\);/g, 'box-shadow: var(--shadow-card-hover);');
content = content.replace(/transform: translateY\(-2px\);/g, 'transform: translateY(-8px);');

// Generic red replacements
content = content.replace(/#C41E3A/g, 'var(--primary-emerald)');
content = content.replace(/#722f37/g, 'var(--dark-teal)');
content = content.replace(/#9b1b30/g, 'var(--primary-hover)');
content = content.replace(/#fdf2f4/g, '#ECFDF5');
content = content.replace(/#fce7eb/g, '#CCFBF1');

// Table header
content = content.replace(/background-color: #f8fafc;/g, 'background-color: #F0FDFA;');
content = content.replace(/background-color: #fdf8f9;/g, 'background-color: #ECFDF5;');

fs.writeFileSync(adminCssPath, content, 'utf8');
console.log("Updated AdminPortal.css");

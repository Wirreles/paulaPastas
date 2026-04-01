const fs = require('fs');
const path = require('path');

const dirPath = 'g:/proyectos/paulapastas/paulaPastas/app';
const dirPath2 = 'g:/proyectos/paulapastas/paulaPastas/components';

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('hover-lift')) {
                content = content.replace(/hover-lift/g, 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl');
                fs.writeFileSync(fullPath, content);
                console.log(`Replaced in ${fullPath}`);
            }
        }
    }
}

replaceInFiles(dirPath);
replaceInFiles(dirPath2);
console.log('Finalizado la limpieza de hover-lift');

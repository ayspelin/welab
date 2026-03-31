const fs = require('fs');
const svg = fs.readFileSync('public/turkey_map.svg', 'utf-8');

const regex = /<g id="([^\"]+)" data-city-code="([^\"]+)" data-phone-code="([^\"]+)" data-city-name="([^\"]+)"[^>]*>([\s\S]*?)<\/g>/g;
const provinces = [];
let match;

while ((match = regex.exec(svg)) !== null) {
    const id = match[1];
    const code = match[2];
    const phone = match[3];
    const name = match[4];
    const innerHtml = match[5];
    
    const pathRegex = /d="([^\"]+)"/g;
    let pathMatch;
    const paths = [];
    while ((pathMatch = pathRegex.exec(innerHtml)) !== null) {
        // Remove line breaks or extra spaces from SVG path data and concatenate
        paths.push(pathMatch[1].replace(/\r?\n|\r/g, '').replace(/\s+/g, ' ').trim());
    }
    
    if (paths.length > 0) {
        provinces.push({
            id,
            code,
            phone,
            name,
            path: paths.join(' ')
        });
    }
}

console.log('Extracted ' + provinces.length + ' provinces.');

const tsxPath = 'src/components/TurkeyMap.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf-8');

const newProvincesCode = 'const provinces = [\n' + provinces.map(p => {
    return `    {
        "id": "${p.id}",
        "code": "${p.code}",
        "phone": "${p.phone}",
        "name": "${p.name}",
        "path": "${p.path}"
    }`;
}).join(',\n') + '\n];';

const replaceRegex = /const provinces = \[[\s\S]*?\];/;
const newContent = tsxContent.replace(replaceRegex, newProvincesCode);

if (newContent !== tsxContent && newContent.indexOf('balikesir') > -1) {
    fs.writeFileSync(tsxPath, newContent);
    console.log('Updated TurkeyMap.tsx');
} else {
    console.log('Failed to update or file already updated.');
}

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function convertDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            convertDir(fullPath);
        } else if (file.endsWith('.png')) {
            const output = fullPath.replace('.png', '.webp');

            sharp(fullPath)
                .resize(300, 300, {
                    fit: 'inside' // 🔥 prevents cropping
                })
                .webp({ quality: 70 })
                .toFile(output)
                .then(() => console.log('✅ Converted:', output))
                .catch(err => console.error(err));
        }
    });
}

convertDir('.'); // change path if needed
const fs = require('fs-extra');
const path = require('path');

// Define source and destination paths
const auraSource = path.resolve(__dirname, 'node_modules/@primeng/themes/aura');
const laraSource = path.resolve(__dirname, 'node_modules/@primeng/themes/lara');
const auraDestination = path.resolve(__dirname, 'src/assets/themes/aura');
const laraDestination = path.resolve(__dirname, 'src/assets/themes/lara');

// Ensure destination directories exist
fs.ensureDirSync(auraDestination);
fs.ensureDirSync(laraDestination);

// Copy theme files
fs.copySync(auraSource, auraDestination);
fs.copySync(laraSource, laraDestination);

console.log('Theme files copied successfully!');

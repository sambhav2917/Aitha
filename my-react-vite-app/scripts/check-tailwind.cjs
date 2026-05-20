const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

async function run() {
  const cssPath = path.resolve(__dirname, '../src/index.css');
  const input = fs.readFileSync(cssPath, 'utf8');
  try {
    const result = await postcss([tailwind, autoprefixer]).process(input, { from: cssPath });
    const out = result.css;
    const checks = ['.min-h-screen', '.bg-white', '.flex', '.rounded-lg', '.bg-gray-50'];
    const found = checks.filter((s) => out.includes(s));
    console.log('Tailwind utilities found:', found);
    if (found.length === 0) {
      console.error('No Tailwind utilities detected in processed CSS.');
      process.exitCode = 2;
    } else {
      console.log('Tailwind appears to be generating utilities.');
    }
  } catch (err) {
    console.error('PostCSS processing failed:', err.stack || err.message || err);
    process.exitCode = 3;
  }
}

run();

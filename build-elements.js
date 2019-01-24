const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    const files = [
        './dist/angular-elements-test/runtime.js',
        './dist/angular-elements-test/polyfills.js',
        './dist/angular-elements-test/scripts.js',
        './dist/angular-elements-test/main.js',
    ];

    await fs.ensureDir('elements');
    await concat(files, 'elements/angular-elements-test.js');
})();
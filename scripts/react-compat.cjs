const fs = require('fs');
const path = require('path');

// 1. Patch @inertiajs/react to use useContext instead of React 19's `use`
const inertiaDistPath = path.resolve(__dirname, '..', 'node_modules', '@inertiajs', 'react', 'dist', 'index.js');
if (fs.existsSync(inertiaDistPath)) {
    let content = fs.readFileSync(inertiaDistPath, 'utf8');
    let modified = false;

    if (content.includes('import { use } from "react";')) {
        content = content.replace('import { use } from "react";', 'import { useContext as use } from "react";');
        modified = true;
    }
    if (content.includes('use as use2,')) {
        content = content.replace('use as use2,', 'useContext as use2,');
        modified = true;
    }
    if (content.includes('use as use3,')) {
        content = content.replace('use as use3,', 'useContext as use3,');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(inertiaDistPath, content, 'utf8');
        console.log('[react-compat] Patched @inertiajs/react to use useContext for React 18.');
    }
}

// 2. Patch react package directly for CJS / ESM lexer export compatibility
const reactCjsDev = path.resolve(__dirname, '..', 'node_modules', 'react', 'cjs', 'react.development.js');
if (fs.existsSync(reactCjsDev)) {
    let content = fs.readFileSync(reactCjsDev, 'utf8');
    if (!content.includes('exports.use = useContext;')) {
        content = content.replace('exports.useContext = useContext;', 'exports.useContext = useContext;\nexports.use = useContext;');
        fs.writeFileSync(reactCjsDev, content, 'utf8');
        console.log('[react-compat] Patched react.development.js with exports.use.');
    }
}

const reactCjsProd = path.resolve(__dirname, '..', 'node_modules', 'react', 'cjs', 'react.production.min.js');
if (fs.existsSync(reactCjsProd)) {
    let content = fs.readFileSync(reactCjsProd, 'utf8');
    if (!content.includes('exports.use=')) {
        content = content.replace('exports.useContext=', 'exports.use=exports.useContext=');
        fs.writeFileSync(reactCjsProd, content, 'utf8');
        console.log('[react-compat] Patched react.production.min.js with exports.use.');
    }
}

const reactIndexPath = path.resolve(__dirname, '..', 'node_modules', 'react', 'index.js');
if (fs.existsSync(reactIndexPath)) {
    let content = fs.readFileSync(reactIndexPath, 'utf8');
    if (!content.includes('module.exports.use')) {
        content += '\nif (!module.exports.use) {\n  module.exports.use = module.exports.useContext;\n}\n';
        fs.writeFileSync(reactIndexPath, content, 'utf8');
    }
}

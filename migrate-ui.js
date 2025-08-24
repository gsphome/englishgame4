#!/usr/bin/env node

/**
 * Migration script to switch between old and new UI implementations
 * Usage: node migrate-ui.js [old|new]
 */

const fs = require('fs');
const path = require('path');

const UI_PATH = path.join(__dirname, 'src/js/ui.js');
const OLD_UI_PATH = path.join(__dirname, 'src/js/ui-old.js');
const NEW_UI_PATH = path.join(__dirname, 'src/js/ui-new.js');

function migrateToNew() {
    console.log('🔄 Migrating to new UI implementation...');
    
    // Backup current ui.js as ui-old.js if it doesn't exist
    if (!fs.existsSync(OLD_UI_PATH)) {
        fs.copyFileSync(UI_PATH, OLD_UI_PATH);
        console.log('✅ Backed up current ui.js to ui-old.js');
    }
    
    // Replace ui.js with new implementation
    fs.copyFileSync(NEW_UI_PATH, UI_PATH);
    console.log('✅ Switched to new UI implementation');
    console.log('📝 Note: Some features may not be fully implemented yet');
}

function migrateToOld() {
    console.log('🔄 Migrating to old UI implementation...');
    
    if (!fs.existsSync(OLD_UI_PATH)) {
        console.error('❌ No backup found. Cannot revert to old implementation.');
        process.exit(1);
    }
    
    // Restore old implementation
    fs.copyFileSync(OLD_UI_PATH, UI_PATH);
    console.log('✅ Reverted to old UI implementation');
}

function showStatus() {
    console.log('📊 UI Implementation Status:');
    console.log(`Current ui.js: ${fs.existsSync(UI_PATH) ? '✅' : '❌'}`);
    console.log(`Backup ui-old.js: ${fs.existsSync(OLD_UI_PATH) ? '✅' : '❌'}`);
    console.log(`New ui-new.js: ${fs.existsSync(NEW_UI_PATH) ? '✅' : '❌'}`);
    
    if (fs.existsSync(UI_PATH) && fs.existsSync(NEW_UI_PATH)) {
        const currentContent = fs.readFileSync(UI_PATH, 'utf8');
        const newContent = fs.readFileSync(NEW_UI_PATH, 'utf8');
        const isUsingNew = currentContent === newContent;
        console.log(`Currently using: ${isUsingNew ? 'NEW' : 'OLD'} implementation`);
    }
}

const command = process.argv[2];

switch (command) {
    case 'new':
        migrateToNew();
        break;
    case 'old':
        migrateToOld();
        break;
    case 'status':
    default:
        showStatus();
        console.log('\nUsage: node migrate-ui.js [new|old|status]');
        break;
}
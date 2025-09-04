#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// Read current .env.local file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check current state
const currentState = envContent.includes('VITE_ENABLE_CACHE_LOGS=true');
const newState = !currentState;

// Update or add the flag
if (envContent.includes('VITE_ENABLE_CACHE_LOGS=')) {
  // Replace existing value
  envContent = envContent.replace(
    /VITE_ENABLE_CACHE_LOGS=(true|false)/,
    `VITE_ENABLE_CACHE_LOGS=${newState}`
  );
} else {
  // Add new flag
  envContent += `\n# Cache Logging Control\nVITE_ENABLE_CACHE_LOGS=${newState}\n`;
}

// Write back to file
fs.writeFileSync(envPath, envContent);

console.log(`🔧 Cache logs ${newState ? 'ENABLED' : 'DISABLED'}`);
console.log(`📝 Updated .env.local: VITE_ENABLE_CACHE_LOGS=${newState}`);
console.log(`🔄 Restart your dev server to apply changes`);

if (newState) {
  console.log(`\n✅ Cache logs are now ENABLED`);
  console.log(`   You will see verbose PWA cache information in console`);
} else {
  console.log(`\n🔇 Cache logs are now DISABLED`);
  console.log(`   Console will be cleaner, showing only real errors`);
}
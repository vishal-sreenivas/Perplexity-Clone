#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  Missing .env.local file!\n');
  console.log('To use this application, you need to:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Add your OpenAI API key');
  console.log('\nSee API_KEY_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('OPENAI_API_KEY=sk-')) {
  console.log('\n⚠️  OpenAI API key not configured!\n');
  console.log('Please add your API key to .env.local:');
  console.log('OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx\n');
  console.log('Get your API key from: https://platform.openai.com/api-keys');
  console.log('See API_KEY_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

console.log('✅ Environment configured correctly!\n');

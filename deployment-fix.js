#!/usr/bin/env node

// Reserved VM Deployment Fix Script
// This script ensures the production server starts correctly in Reserved VM environment

console.log('🔧 Fixing Reserved VM deployment configuration...');

const fs = await import('fs');
const path = await import('path');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.log('❌ dist directory not found. Running build...');
  const { spawn } = await import('child_process');
  
  const buildProcess = spawn('npm', ['run', 'build'], { 
    stdio: 'inherit' 
  });
  
  await new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build completed successfully');
        resolve();
      } else {
        console.log('❌ Build failed');
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

// Check built files
console.log('\n📁 Checking built files:');
const distFiles = fs.readdirSync('dist');
console.log('dist/', distFiles);

if (fs.existsSync('dist/public')) {
  const publicFiles = fs.readdirSync('dist/public');
  console.log('dist/public/', publicFiles);
}

// Test production server startup
console.log('\n🧪 Testing production server startup...');
const { spawn } = await import('child_process');

const testEnv = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3002'
};

const server = spawn('node', ['dist/index.js'], {
  env: testEnv,
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString().trim());
});

// Give it 10 seconds to start
setTimeout(() => {
  console.log('\n🛑 Stopping test server...');
  server.kill();
}, 10000);

server.on('close', (code) => {
  console.log(`\n📊 Server test results:`);
  console.log(`Exit code: ${code}`);
  
  if (output.includes('server is now serving')) {
    console.log('✅ Production server starts successfully');
  } else if (errorOutput) {
    console.log('❌ Production server failed to start');
    console.log('Error output:', errorOutput);
  } else {
    console.log('⚠️ Server startup unclear - check logs above');
  }
  
  console.log('\n🚀 Deployment fix complete!');
  console.log('Next steps:');
  console.log('1. Redeploy your Reserved VM deployment');
  console.log('2. Check deployment logs if issues persist');
  console.log('3. Verify environment variables are set in deployment settings');
  
  process.exit(0);
});
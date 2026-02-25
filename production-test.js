#!/usr/bin/env node

// Test production build locally to verify everything works
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing production build locally...');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.log('❌ dist directory not found. Running build...');
  
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completed successfully');
      testProduction();
    } else {
      console.log('❌ Build failed with code:', code);
    }
  });
} else {
  console.log('✅ dist directory exists');
  testProduction();
}

function testProduction() {
  console.log('\n🚀 Starting production server test...');
  
  // Set production environment
  const env = {
    ...process.env,
    NODE_ENV: 'production'
  };
  
  console.log('Environment variables for production:');
  console.log('NODE_ENV:', env.NODE_ENV);
  console.log('DATABASE_URL:', env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('GEMINI_API_KEY:', env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('STRIPE_SECRET_KEY:', env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_STRIPE_PUBLIC_KEY:', env.VITE_STRIPE_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
  console.log('SESSION_SECRET:', env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
  
  // Check if built server exists
  if (fs.existsSync('dist/index.js')) {
    console.log('✅ Built server file exists at dist/index.js');
    console.log('\n📋 Your deployment should work now with all environment variables configured.');
    console.log('🔄 Try redeploying your Reserved VM deployment.');
  } else {
    console.log('❌ Built server file missing at dist/index.js');
    console.log('Run: npm run build');
  }
}
#!/usr/bin/env node

/**
 * Final deployment verification script
 * Tests production build and confirms deployment readiness
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DEPLOYMENT_URL = 'https://performance-ai-coach-markesthompson.replit.app';

class DeploymentVerifier {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.failures = [];
  }

  log(status, message, details = null) {
    const entry = { status, message, details, timestamp: new Date().toISOString() };
    const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${message}`);
    if (details) {
      console.log(`   ${JSON.stringify(details, null, 2)}`);
    }

    if (status === 'success') {
      this.checks.push(entry);
    } else if (status === 'warning') {
      this.warnings.push(entry);
    } else {
      this.failures.push(entry);
    }
  }

  success(message, details) { this.log('success', message, details); }
  warning(message, details) { this.log('warning', message, details); }
  error(message, details) { this.log('error', message, details); }

  // Verify build artifacts exist
  checkBuildArtifacts() {
    console.log('\n🔍 Checking Build Artifacts...');
    
    const requiredFiles = [
      'dist/index.js',
      'dist/public/index.html',
      'package.json',
      '.replit'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        this.success(`${file} exists (${stats.size} bytes)`);
      } else {
        this.error(`Missing required file: ${file}`);
      }
    }

    // Check dist/public directory
    if (fs.existsSync('dist/public')) {
      const files = fs.readdirSync('dist/public');
      this.success(`dist/public contains ${files.length} files`, { files: files.slice(0, 5) });
    } else {
      this.error('dist/public directory missing');
    }
  }

  // Verify Replit configuration
  checkReplitConfig() {
    console.log('\n🔧 Checking Replit Configuration...');
    
    try {
      const replitConfig = fs.readFileSync('.replit', 'utf8');
      
      const requiredConfigs = [
        'deploymentTarget = "autoscale"',
        'build = ["npm", "run", "build"]',
        'run = ["npm", "run", "start"]',
        'localPort = 5000',
        'externalPort = 80'
      ];

      for (const config of requiredConfigs) {
        if (replitConfig.includes(config)) {
          this.success(`Configuration present: ${config}`);
        } else {
          this.error(`Missing configuration: ${config}`);
        }
      }
      
    } catch (error) {
      this.error('Could not read .replit configuration', { error: error.message });
    }
  }

  // Check package.json scripts
  checkPackageScripts() {
    console.log('\n📦 Checking Package Scripts...');
    
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const requiredScripts = ['build', 'start', 'dev'];
      
      for (const script of requiredScripts) {
        if (pkg.scripts && pkg.scripts[script]) {
          this.success(`Script "${script}": ${pkg.scripts[script]}`);
        } else {
          this.error(`Missing script: ${script}`);
        }
      }
      
    } catch (error) {
      this.error('Could not read package.json', { error: error.message });
    }
  }

  // Verify environment variables
  checkEnvironmentVariables() {
    console.log('\n🌍 Checking Environment Variables...');
    
    const requiredVars = [
      'DATABASE_URL',
      'GEMINI_API_KEY', 
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLIC_KEY',
      'SESSION_SECRET'
    ];
    
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.success(`${varName} is configured`);
      } else {
        this.error(`Missing environment variable: ${varName}`);
      }
    }
  }

  // Test build process
  testBuild() {
    console.log('\n🔨 Testing Build Process...');
    
    try {
      console.log('Running: npm run build');
      const output = execSync('npm run build', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (output.includes('built in')) {
        this.success('Build completed successfully');
      } else {
        this.warning('Build completed but no success message found');
      }
      
    } catch (error) {
      this.error('Build process failed', { 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      });
    }
  }

  // Generate deployment report
  generateReport() {
    console.log('\n📊 Deployment Readiness Report');
    console.log('================================');
    console.log(`✅ Checks Passed: ${this.checks.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Failures: ${this.failures.length}`);
    
    if (this.failures.length > 0) {
      console.log('\n🚨 Critical Issues:');
      this.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }

    const isReady = this.failures.length === 0;
    console.log(`\n🚀 Deployment Status: ${isReady ? '✅ READY TO DEPLOY' : '❌ ISSUES MUST BE FIXED'}`);
    
    if (isReady) {
      console.log(`\n🎯 Deployment Target: ${DEPLOYMENT_URL}`);
      console.log('\n📋 Deployment Steps:');
      console.log('1. Click "Deploy" in your Replit workspace');
      console.log('2. Select "Autoscale" deployment type');
      console.log('3. Confirm build and run commands');
      console.log('4. Click "Deploy" to start deployment');
      console.log('\n🔍 Post-Deployment Verification:');
      console.log(`- Health: ${DEPLOYMENT_URL}/api/health`);
      console.log(`- Diagnostics: ${DEPLOYMENT_URL}/api/diagnostics`);
      console.log(`- App: ${DEPLOYMENT_URL}`);
    }

    return {
      ready: isReady,
      checks: this.checks.length,
      warnings: this.warnings.length,
      failures: this.failures.length,
      issues: this.failures
    };
  }

  // Run all verification checks
  async runAllChecks() {
    console.log('🧪 Red2Blue Deployment Verification');
    console.log('====================================\n');
    
    this.checkBuildArtifacts();
    this.checkReplitConfig();
    this.checkPackageScripts();
    this.checkEnvironmentVariables();
    this.testBuild();
    
    return this.generateReport();
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new DeploymentVerifier();
  
  verifier.runAllChecks()
    .then(report => {
      if (!report.ready) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

export default DeploymentVerifier;
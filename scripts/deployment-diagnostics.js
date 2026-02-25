#!/usr/bin/env node

/**
 * Comprehensive deployment diagnostics script
 * Identifies deployment-specific issues that work in preview but fail in production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'GEMINI_API_KEY',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'SESSION_SECRET'
];

const CRITICAL_FILES = [
  'package.json',
  'server/index.ts',
  'server/routes.ts',
  'server/auth.ts',
  'server/storage.ts',
  'server/db.ts',
  'client/src/main.tsx',
  'client/src/App.tsx',
  'shared/schema.ts',
  'vercel.json',
  'tsconfig.json',
  'vite.config.ts'
];

class DeploymentDiagnostics {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  log(type, message, details = null) {
    const entry = { message, details, timestamp: new Date().toISOString() };
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${message}`);
    if (details) {
      console.log(`   Details:`, JSON.stringify(details, null, 2));
    }
    
    this[type === 'error' ? 'issues' : type === 'warning' ? 'warnings' : 'successes'].push(entry);
  }

  success(message, details) {
    this.log('success', message, details);
  }

  warning(message, details) {
    this.log('warning', message, details);
  }

  error(message, details) {
    this.log('error', message, details);
  }

  // Check environment variables
  checkEnvironmentVariables() {
    console.log('\n🔍 Checking Environment Variables...');
    
    const missingVars = [];
    const presentVars = [];
    
    REQUIRED_ENV_VARS.forEach(envVar => {
      if (process.env[envVar]) {
        presentVars.push(envVar);
        this.success(envVar + ' is configured');
      } else {
        missingVars.push(envVar);
        this.error(envVar + ' is missing');
      }
    });

    // Check NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.success(`NODE_ENV: ${nodeEnv}`);

    // Check for deployment-specific environment issues
    if (nodeEnv === 'production' && missingVars.length > 0) {
      this.error('Missing environment variables in production', { missing: missingVars });
    }

    return { missing: missingVars, present: presentVars, nodeEnv };
  }

  // Check file system integrity
  checkFileSystem() {
    console.log('\n📁 Checking File System Integrity...');
    
    const missingFiles = [];
    const presentFiles = [];
    
    CRITICAL_FILES.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        presentFiles.push({ path: filePath, size: stats.size });
        this.success(`${filePath} exists (${stats.size} bytes)`);
      } else {
        missingFiles.push(filePath);
        this.error(`${filePath} is missing`);
      }
    });

    // Check build output directories
    const buildDirs = ['dist', 'dist/client', 'dist/server'];
    buildDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        this.success(`${dir}/ exists with ${files.length} files`);
      } else {
        this.warning(`${dir}/ directory missing (may need build)`);
      }
    });

    return { missing: missingFiles, present: presentFiles };
  }

  // Check package.json and dependencies
  checkPackageIntegrity() {
    console.log('\n📦 Checking Package Integrity...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      this.success('package.json is valid JSON');
      this.success(`Project name: ${packageJson.name}`);
      
      // Check for required scripts
      const requiredScripts = ['dev', 'build', 'start'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts?.[script]) {
          this.success(`Script "${script}" defined: ${packageJson.scripts[script]}`);
        } else {
          this.error(`Script "${script}" missing`);
        }
      });

      // Check for critical dependencies
      const criticalDeps = [
        'express', 'vite', 'react', 'typescript',
        'drizzle-orm', '@neondatabase/serverless',
        'stripe', '@google/generative-ai'
      ];
      
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      criticalDeps.forEach(dep => {
        if (allDeps[dep]) {
          this.success(`Dependency ${dep}: ${allDeps[dep]}`);
        } else {
          this.error(`Critical dependency ${dep} missing`);
        }
      });

      return { valid: true, package: packageJson };
    } catch (error) {
      this.error('package.json is invalid or missing', { error: error.message });
      return { valid: false, error: error.message };
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 Diagnostic Report Summary');
    console.log('================================');
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Critical Issues Found:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
        if (issue.details) {
          console.log(`   ${JSON.stringify(issue.details)}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }

    // Deployment readiness assessment
    const deploymentReady = this.issues.length === 0;
    console.log(`\n🚀 Deployment Status: ${deploymentReady ? '✅ READY' : '❌ ISSUES FOUND'}`);
    
    if (!deploymentReady) {
      console.log('\n💡 Recommended Actions:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. Fix: ${issue.message}`);
      });
    }

    return {
      deploymentReady,
      summary: {
        successes: this.successes.length,
        warnings: this.warnings.length,
        issues: this.issues.length
      },
      issues: this.issues,
      warnings: this.warnings
    };
  }

  // Run all diagnostics
  async runAllDiagnostics() {
    console.log('🔍 Red2Blue Deployment Diagnostics');
    console.log('===================================\n');

    // Run all checks
    this.checkEnvironmentVariables();
    this.checkFileSystem();
    this.checkPackageIntegrity();

    return this.generateReport();
  }
}

// Run diagnostics if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostics = new DeploymentDiagnostics();
  
  diagnostics.runAllDiagnostics()
    .then(report => {
      if (!report.deploymentReady) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Diagnostics failed:', error);
      process.exit(1);
    });
}

export default DeploymentDiagnostics;
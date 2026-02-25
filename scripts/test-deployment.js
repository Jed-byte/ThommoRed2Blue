#!/usr/bin/env node

/**
 * Test all critical systems independently for deployment debugging
 * This script tests each component that could fail during deployment
 */

import http from 'http';
import https from 'https';
import { execSync } from 'child_process';

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.DEPLOYMENT_URL || 'http://localhost:5000',
  timeout: 10000,
  retries: 3
};

class DeploymentTester {
  constructor() {
    this.results = {
      successes: [],
      failures: [],
      warnings: []
    };
  }

  log(type, test, message, details = null) {
    const result = { test, message, details, timestamp: new Date().toISOString() };
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} [${test.toUpperCase()}] ${message}`);
    if (details) {
      console.log(`   Details:`, JSON.stringify(details, null, 2));
    }
    
    this.results[type === 'error' ? 'failures' : type === 'warning' ? 'warnings' : 'successes'].push(result);
  }

  success(test, message, details) {
    this.log('success', test, message, details);
  }

  warning(test, message, details) {
    this.log('warning', test, message, details);
  }

  error(test, message, details) {
    this.log('error', test, message, details);
  }

  // Make HTTP request with retry logic
  async makeRequest(method, path, body = null) {
    for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
      try {
        const url = TEST_CONFIG.baseUrl + path;
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Red2Blue-Deployment-Tester/1.0'
          },
          timeout: TEST_CONFIG.timeout
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const text = await response.text();
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { rawResponse: text };
        }

        return {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          attempt
        };
      } catch (error) {
        if (attempt === TEST_CONFIG.retries) {
          throw error;
        }
        console.log(`   Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Test 1: Basic server connectivity
  async testServerConnectivity() {
    console.log('\n🌐 Testing Server Connectivity...');
    
    try {
      const response = await this.makeRequest('GET', '/api/health');
      
      if (response.ok) {
        this.success('connectivity', 'Server is responding', {
          status: response.status,
          uptime: response.data.uptime,
          environment: response.data.environment
        });
        return true;
      } else {
        this.error('connectivity', `Server returned ${response.status}`, response);
        return false;
      }
    } catch (error) {
      this.error('connectivity', 'Server is not responding', {
        error: error.message,
        baseUrl: TEST_CONFIG.baseUrl
      });
      return false;
    }
  }

  // Test 2: Database connectivity
  async testDatabaseConnectivity() {
    console.log('\n🗄️ Testing Database Connectivity...');
    
    try {
      const response = await this.makeRequest('GET', '/api/health');
      
      if (response.ok && response.data.checks) {
        const dbCheck = response.data.checks.database;
        if (dbCheck) {
          this.success('database', 'Database connection successful');
          return true;
        } else {
          this.error('database', 'Database health check failed');
          return false;
        }
      } else {
        this.warning('database', 'Could not verify database status');
        return false;
      }
    } catch (error) {
      this.error('database', 'Database connectivity test failed', { error: error.message });
      return false;
    }
  }

  // Test 3: Authentication system
  async testAuthenticationSystem() {
    console.log('\n🔐 Testing Authentication System...');
    
    try {
      // Test unauthenticated access (should return 401)
      const authResponse = await this.makeRequest('GET', '/api/auth/me');
      
      if (authResponse.status === 401) {
        this.success('auth', 'Authentication system working (properly rejecting unauthenticated requests)');
        return true;
      } else {
        this.warning('auth', 'Unexpected authentication response', {
          expectedStatus: 401,
          actualStatus: authResponse.status
        });
        return false;
      }
    } catch (error) {
      this.error('auth', 'Authentication system test failed', { error: error.message });
      return false;
    }
  }

  // Test 4: Static file serving
  async testStaticFileServing() {
    console.log('\n📁 Testing Static File Serving...');
    
    try {
      // Test root path (should serve React app)
      const rootResponse = await this.makeRequest('GET', '/');
      
      if (rootResponse.ok) {
        const isHtml = rootResponse.data.rawResponse && 
                      rootResponse.data.rawResponse.includes('<!DOCTYPE html>');
        
        if (isHtml) {
          this.success('static', 'Static files serving correctly');
          return true;
        } else {
          this.error('static', 'Root path not serving HTML', {
            responseType: typeof rootResponse.data.rawResponse,
            snippet: rootResponse.data.rawResponse?.substring(0, 100)
          });
          return false;
        }
      } else {
        this.error('static', `Static file serving failed with status ${rootResponse.status}`);
        return false;
      }
    } catch (error) {
      this.error('static', 'Static file serving test failed', { error: error.message });
      return false;
    }
  }

  // Test 5: API endpoints functionality
  async testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...');
    
    const endpoints = [
      { path: '/api/health', method: 'GET', expectedStatus: 200 },
      { path: '/api/diagnostics', method: 'GET', expectedStatus: 200 },
      { path: '/api/auth/me', method: 'GET', expectedStatus: 401 }
    ];

    let allPassed = true;

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint.method, endpoint.path);
        
        if (response.status === endpoint.expectedStatus) {
          this.success('api', `${endpoint.method} ${endpoint.path} working correctly`);
        } else {
          this.error('api', `${endpoint.method} ${endpoint.path} returned wrong status`, {
            expected: endpoint.expectedStatus,
            actual: response.status
          });
          allPassed = false;
        }
      } catch (error) {
        this.error('api', `${endpoint.method} ${endpoint.path} failed`, { error: error.message });
        allPassed = false;
      }
    }

    return allPassed;
  }

  // Test 6: Environment variables in deployment
  async testEnvironmentVariables() {
    console.log('\n🌍 Testing Environment Variables...');
    
    try {
      const response = await this.makeRequest('GET', '/api/diagnostics');
      
      if (response.ok && response.data.diagnostics) {
        const envResults = response.data.diagnostics.results.filter(r => 
          r.component === 'environment' && r.message.includes('✓')
        );
        
        const requiredVars = ['DATABASE_URL', 'GEMINI_API_KEY', 'STRIPE_SECRET_KEY'];
        const foundVars = envResults.map(r => 
          r.message.match(/✓ (.+) is set/)?.[1]
        ).filter(Boolean);
        
        const missingVars = requiredVars.filter(v => !foundVars.includes(v));
        
        if (missingVars.length === 0) {
          this.success('environment', 'All required environment variables present', { found: foundVars });
          return true;
        } else {
          this.error('environment', 'Missing environment variables', { missing: missingVars });
          return false;
        }
      } else {
        this.warning('environment', 'Could not verify environment variables');
        return false;
      }
    } catch (error) {
      this.error('environment', 'Environment variable test failed', { error: error.message });
      return false;
    }
  }

  // Test 7: Stripe integration
  async testStripeIntegration() {
    console.log('\n💳 Testing Stripe Integration...');
    
    try {
      const response = await this.makeRequest('GET', '/api/diagnostics');
      
      if (response.ok && response.data.diagnostics) {
        const stripeResults = response.data.diagnostics.results.filter(r => 
          r.component === 'stripe'
        );
        
        const stripeInitialized = stripeResults.some(r => 
          r.message.includes('initialized successfully')
        );
        
        if (stripeInitialized) {
          this.success('stripe', 'Stripe integration working');
          return true;
        } else {
          this.error('stripe', 'Stripe initialization issues detected');
          return false;
        }
      } else {
        this.warning('stripe', 'Could not verify Stripe integration');
        return false;
      }
    } catch (error) {
      this.error('stripe', 'Stripe integration test failed', { error: error.message });
      return false;
    }
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Deployment Test Report');
    console.log('===========================');
    console.log(`✅ Passed: ${this.results.successes.length}`);
    console.log(`⚠️ Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Failed: ${this.results.failures.length}`);
    
    if (this.results.failures.length > 0) {
      console.log('\n🚨 Test Failures:');
      this.results.failures.forEach((failure, index) => {
        console.log(`${index + 1}. [${failure.test.toUpperCase()}] ${failure.message}`);
      });
    }

    const deploymentHealthy = this.results.failures.length === 0;
    console.log(`\n🚀 Deployment Health: ${deploymentHealthy ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
    
    return {
      healthy: deploymentHealthy,
      summary: {
        passed: this.results.successes.length,
        warnings: this.results.warnings.length,
        failed: this.results.failures.length
      },
      failures: this.results.failures,
      warnings: this.results.warnings
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Red2Blue Deployment Tests');
    console.log('==============================\n');
    console.log(`Testing deployment at: ${TEST_CONFIG.baseUrl}`);

    // Run tests sequentially to avoid overloading server
    await this.testServerConnectivity();
    await this.testDatabaseConnectivity();
    await this.testAuthenticationSystem();
    await this.testStaticFileServing();
    await this.testAPIEndpoints();
    await this.testEnvironmentVariables();
    await this.testStripeIntegration();

    return this.generateReport();
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DeploymentTester();
  
  tester.runAllTests()
    .then(report => {
      if (!report.healthy) {
        console.log('\n💡 Debugging Tips:');
        console.log('1. Check server logs for detailed error messages');
        console.log('2. Verify environment variables are set correctly');
        console.log('3. Ensure database migrations have run');
        console.log('4. Check that all required files are included in deployment');
        console.log('5. Test locally first with NODE_ENV=production');
        
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

export default DeploymentTester;
// Client-side debugging and diagnostics for deployment issues

interface ClientDiagnostic {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: Date;
}

class ClientDebugger {
  private logs: ClientDiagnostic[] = [];
  private isProduction = import.meta.env.PROD;
  
  log(component: string, status: ClientDiagnostic['status'], message: string, details?: any) {
    const diagnostic: ClientDiagnostic = {
      component,
      status,
      message,
      details,
      timestamp: new Date()
    };
    
    this.logs.push(diagnostic);
    
    // Enhanced console logging with emojis and formatting
    const timestamp = diagnostic.timestamp.toISOString();
    const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    const prefix = `[${timestamp}] ${statusIcon} [CLIENT-${component.toUpperCase()}]`;
    
    console.log(`${prefix} ${message}`);
    if (details) {
      console.log(`${prefix} Details:`, details);
    }
    
    // In production, also try to send to server for debugging
    if (this.isProduction && status === 'error') {
      this.sendToServer(diagnostic);
    }
  }
  
  success(component: string, message: string, details?: any) {
    this.log(component, 'success', message, details);
  }
  
  warning(component: string, message: string, details?: any) {
    this.log(component, 'warning', message, details);
  }
  
  error(component: string, message: string, details?: any) {
    this.log(component, 'error', message, details);
  }
  
  private sendToServer(diagnostic: ClientDiagnostic) {
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostic,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(err => {
        console.error('Failed to send client error to server:', err);
      });
    } catch (error) {
      console.error('Failed to report client error to server:', error);
    }
  }
  
  // Environment diagnostics
  checkEnvironment() {
    this.success('environment', `Environment: ${this.isProduction ? 'production' : 'development'}`);
    this.success('environment', `User Agent: ${navigator.userAgent}`);
    this.success('environment', `Current URL: ${window.location.href}`);
    this.success('environment', `Base URL: ${window.location.origin}`);
    
    // Check environment variables
    const envVars = {
      VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        this.success('environment', `✓ ${key} is available`);
      } else {
        this.error('environment', `✗ ${key} is missing`);
      }
    });
    
    return envVars;
  }
  
  // Network connectivity test
  async checkNetworkConnectivity() {
    try {
      this.log('network', 'success', 'Testing server connectivity...');
      
      const healthResponse = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        this.success('network', 'Server health check passed', health);
        return { healthy: true, health };
      } else {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }
    } catch (error: any) {
      this.error('network', 'Server connectivity failed', {
        error: error.message,
        stack: error.stack
      });
      return { healthy: false, error: error.message };
    }
  }
  
  // Authentication test
  async checkAuthentication() {
    try {
      this.log('auth', 'success', 'Testing authentication status...');
      
      const authResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (authResponse.ok) {
        const user = await authResponse.json();
        this.success('auth', 'User authenticated', { userId: user.id, email: user.email });
        return { authenticated: true, user };
      } else if (authResponse.status === 401) {
        this.warning('auth', 'User not authenticated (expected for logged out users)');
        return { authenticated: false };
      } else {
        throw new Error(`Auth check failed: ${authResponse.status} ${authResponse.statusText}`);
      }
    } catch (error: any) {
      this.error('auth', 'Authentication check failed', {
        error: error.message,
        stack: error.stack
      });
      return { authenticated: false, error: error.message };
    }
  }
  
  // Stripe integration test
  checkStripeIntegration() {
    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!stripeKey) {
        this.error('stripe', 'Stripe public key missing');
        return { available: false, error: 'Missing VITE_STRIPE_PUBLIC_KEY' };
      }
      
      if (!stripeKey.startsWith('pk_')) {
        this.error('stripe', 'Invalid Stripe public key format');
        return { available: false, error: 'Invalid key format' };
      }
      
      this.success('stripe', 'Stripe public key configured correctly', {
        keyPrefix: stripeKey.substring(0, 8) + '...',
        isTest: stripeKey.includes('test')
      });
      
      return { available: true, isTest: stripeKey.includes('test') };
    } catch (error: any) {
      this.error('stripe', 'Stripe integration check failed', {
        error: error.message
      });
      return { available: false, error: error.message };
    }
  }
  
  // DOM and React diagnostics
  checkDOMAndReact() {
    try {
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        this.error('dom', 'Root element #root not found');
        return { domReady: false };
      }
      
      this.success('dom', 'Root element found', {
        hasChildren: rootElement.children.length > 0,
        childCount: rootElement.children.length
      });
      
      // Check if React is loaded
      const hasReact = !!(window as any).React || document.querySelector('[data-reactroot]');
      if (hasReact) {
        this.success('react', 'React appears to be loaded and working');
      } else {
        this.warning('react', 'React may not be loaded yet or failed to initialize');
      }
      
      return { domReady: true, reactLoaded: hasReact };
    } catch (error: any) {
      this.error('dom', 'DOM/React check failed', {
        error: error.message
      });
      return { domReady: false, error: error.message };
    }
  }
  
  // API endpoints test
  async testCriticalEndpoints() {
    const endpoints = [
      '/api/health',
      '/api/diagnostics',
      '/api/auth/me'
    ];
    
    const results: Record<string, any> = {};
    
    for (const endpoint of endpoints) {
      try {
        this.log('api', 'success', `Testing endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
        
        if (response.ok) {
          this.success('api', `✓ ${endpoint} responded successfully`);
        } else {
          this.warning('api', `⚠ ${endpoint} returned ${response.status}`, results[endpoint]);
        }
        
      } catch (error: any) {
        results[endpoint] = { error: error.message };
        this.error('api', `✗ ${endpoint} failed`, { error: error.message });
      }
    }
    
    return results;
  }
  
  getDiagnostics(): ClientDiagnostic[] {
    return [...this.logs];
  }
  
  getFailures(): ClientDiagnostic[] {
    return this.logs.filter(log => log.status === 'error');
  }
  
  // Comprehensive startup diagnostics for client
  async runClientDiagnostics() {
    this.success('startup', '🔍 Running client-side diagnostics...');
    
    const results = {
      environment: this.checkEnvironment(),
      dom: this.checkDOMAndReact(),
      stripe: this.checkStripeIntegration(),
      network: await this.checkNetworkConnectivity(),
      auth: await this.checkAuthentication(),
      endpoints: await this.testCriticalEndpoints()
    };
    
    const failures = this.getFailures();
    const success = failures.length === 0;
    
    if (success) {
      this.success('startup', '🎉 All client diagnostics passed!');
    } else {
      this.error('startup', '💥 Client diagnostics found issues', {
        failureCount: failures.length,
        failures: failures.map(f => f.message)
      });
    }
    
    return { success, results, failures };
  }
}

export const clientDebugger = new ClientDebugger();

// Enhanced error boundary wrapper
export function withClientErrorLogging<T extends (...args: any[]) => any>(
  component: string,
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    try {
      clientDebugger.log(component, 'success', `Starting ${operation}`);
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result
          .then(res => {
            clientDebugger.success(component, `Completed ${operation}`);
            return res;
          })
          .catch(error => {
            clientDebugger.error(component, `Failed ${operation}`, {
              error: error.message,
              stack: error.stack
            });
            throw error;
          });
      } else {
        clientDebugger.success(component, `Completed ${operation}`);
        return result;
      }
    } catch (error: any) {
      clientDebugger.error(component, `Failed ${operation}`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }) as T;
}

// Disabled global error handlers to prevent infinite loops and memory leaks
// window.addEventListener('error', (event) => {
//   clientDebugger.error('global', 'Unhandled JavaScript error', {
//     message: event.message,
//     filename: event.filename,
//     lineno: event.lineno,
//     colno: event.colno,
//     stack: event.error?.stack
//   });
// });

// window.addEventListener('unhandledrejection', (event) => {
//   clientDebugger.error('global', 'Unhandled promise rejection', {
//     reason: event.reason,
//     stack: event.reason?.stack
//   });
// });

// DISABLED: Auto-run diagnostics to prevent white screen crashes and infinite loops
// if (typeof window !== 'undefined') {
//   // Run diagnostics after DOM is loaded
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       setTimeout(() => clientDebugger.runClientDiagnostics(), 1000);
//     });
//   } else {
//     setTimeout(() => clientDebugger.runClientDiagnostics(), 1000);
//   }
// }
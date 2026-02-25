import fs from 'fs';
import path from 'path';

export interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: Date;
}

class DebugLogger {
  private logs: DiagnosticResult[] = [];
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  log(component: string, status: DiagnosticResult['status'], message: string, details?: any) {
    const result: DiagnosticResult = {
      component,
      status,
      message,
      details,
      timestamp: new Date()
    };
    
    this.logs.push(result);
    
    // Always log to console with detailed formatting
    const timestamp = result.timestamp.toISOString();
    const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    const prefix = `[${timestamp}] ${statusIcon} [${component.toUpperCase()}]`;
    
    console.log(`${prefix} ${message}`);
    if (details) {
      console.log(`${prefix} Details:`, JSON.stringify(details, null, 2));
    }
    
    // In production, also log to a file for debugging deployed apps
    if (this.isProduction) {
      this.writeToFile(result);
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
  
  private writeToFile(result: DiagnosticResult) {
    try {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `debug-${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = `${JSON.stringify(result)}\n`;
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('Failed to write debug log to file:', error);
    }
  }
  
  getDiagnostics(): DiagnosticResult[] {
    return [...this.logs];
  }
  
  getFailures(): DiagnosticResult[] {
    return this.logs.filter(log => log.status === 'error');
  }
  
  getWarnings(): DiagnosticResult[] {
    return this.logs.filter(log => log.status === 'warning');
  }
  
  // Environment diagnostics
  checkEnvironment() {
    this.log('environment', 'success', `Environment: ${this.isDevelopment ? 'development' : 'production'}`);
    this.log('environment', 'success', `Node version: ${process.version}`);
    this.log('environment', 'success', `Current working directory: ${process.cwd()}`);
    
    // Check critical environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'GEMINI_API_KEY', 
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLIC_KEY',
      'SESSION_SECRET'
    ];
    
    const envStatus: Record<string, boolean> = {};
    requiredEnvVars.forEach(envVar => {
      const exists = !!process.env[envVar];
      envStatus[envVar] = exists;
      if (exists) {
        this.success('environment', `✓ ${envVar} is set`);
      } else {
        this.error('environment', `✗ ${envVar} is missing`, { variable: envVar });
      }
    });
    
    return envStatus;
  }
  
  // File system diagnostics
  checkFileSystem() {
    const criticalPaths = [
      'package.json',
      'server/index.ts',
      'server/routes.ts',
      'server/auth.ts',
      'server/storage.ts',
      'client/src/main.tsx',
      'client/src/App.tsx',
      'shared/schema.ts'
    ];
    
    const pathStatus: Record<string, boolean> = {};
    criticalPaths.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath);
      const exists = fs.existsSync(fullPath);
      pathStatus[filePath] = exists;
      
      if (exists) {
        const stats = fs.statSync(fullPath);
        this.success('filesystem', `✓ ${filePath} exists (${stats.size} bytes)`);
      } else {
        this.error('filesystem', `✗ ${filePath} missing`, { path: fullPath });
      }
    });
    
    return pathStatus;
  }
  
  // Database connectivity test
  async checkDatabase() {
    try {
      const { db } = await import('./db');
      await db.execute('SELECT 1 as health_check');
      this.success('database', 'Database connection successful');
      return true;
    } catch (error: any) {
      this.error('database', 'Database connection failed', { 
        error: error.message,
        stack: error.stack 
      });
      return false;
    }
  }
  
  // Storage system test
  async checkStorage() {
    try {
      const { storage } = await import('./storage');
      // Test basic storage operations
      const testResult = await storage.getUser(1); // Try to get admin user
      this.success('storage', 'Storage system accessible', { adminUserExists: !!testResult });
      return true;
    } catch (error: any) {
      this.error('storage', 'Storage system failed', { 
        error: error.message,
        stack: error.stack 
      });
      return false;
    }
  }
}

export const debugLogger = new DebugLogger();

// Enhanced error wrapper for critical functions
export function withErrorLogging<T extends (...args: any[]) => any>(
  component: string,
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    try {
      debugLogger.log(component, 'success', `Starting ${operation}`, { args: args.length });
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result
          .then(res => {
            debugLogger.success(component, `Completed ${operation}`);
            return res;
          })
          .catch(error => {
            debugLogger.error(component, `Failed ${operation}`, {
              error: error.message,
              stack: error.stack
            });
            throw error;
          });
      } else {
        debugLogger.success(component, `Completed ${operation}`);
        return result;
      }
    } catch (error: any) {
      debugLogger.error(component, `Failed ${operation}`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }) as T;
}

// Startup diagnostics runner
export async function runStartupDiagnostics(): Promise<{
  success: boolean;
  results: DiagnosticResult[];
  summary: string;
}> {
  debugLogger.log('startup', 'success', '🔍 Running comprehensive startup diagnostics...');
  
  // Environment check
  debugLogger.checkEnvironment();
  
  // File system check
  debugLogger.checkFileSystem();
  
  // Database check
  await debugLogger.checkDatabase();
  
  // Storage check
  await debugLogger.checkStorage();
  
  const results = debugLogger.getDiagnostics();
  const failures = debugLogger.getFailures();
  const warnings = debugLogger.getWarnings();
  
  const success = failures.length === 0;
  const summary = `Diagnostics complete: ${results.length} checks, ${failures.length} failures, ${warnings.length} warnings`;
  
  if (success) {
    debugLogger.success('startup', '🎉 All startup diagnostics passed!');
  } else {
    debugLogger.error('startup', '💥 Startup diagnostics failed', {
      failures: failures.map(f => f.message),
      warnings: warnings.map(w => w.message)
    });
  }
  
  return { success, results, summary };
}
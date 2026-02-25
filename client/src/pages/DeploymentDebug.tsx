import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";
import { clientDebugger } from '@/debug';

interface DiagnosticData {
  timestamp: string;
  environment: string;
  platform: string;
  nodeVersion: string;
  diagnostics: {
    success: boolean;
    results: Array<{
      component: string;
      status: 'success' | 'warning' | 'error';
      message: string;
      details?: any;
      timestamp: string;
    }>;
    summary: string;
  };
  logs: Array<{
    component: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: any;
    timestamp: string;
  }>;
}

interface HealthData {
  status: string;
  timestamp: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  checks: {
    database: boolean;
    storage: boolean;
    auth: boolean;
  };
}

export default function DeploymentDebug() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [clientDiagnostics, setClientDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      clientDebugger.success('debug-page', 'Fetching server diagnostics');
      
      const [diagResponse, healthResponse] = await Promise.all([
        fetch('/api/diagnostics', { credentials: 'include' }),
        fetch('/api/health', { credentials: 'include' })
      ]);

      if (!diagResponse.ok) {
        throw new Error(`Diagnostics API failed: ${diagResponse.status} ${diagResponse.statusText}`);
      }

      if (!healthResponse.ok) {
        throw new Error(`Health API failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }

      const diagData = await diagResponse.json();
      const healthData = await healthResponse.json();

      setDiagnostics(diagData);
      setHealth(healthData);

      // Run fresh client diagnostics
      const clientResults = await clientDebugger.runClientDiagnostics();
      setClientDiagnostics(clientResults);

      clientDebugger.success('debug-page', 'All diagnostics fetched successfully');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch diagnostics';
      setError(errorMsg);
      clientDebugger.error('debug-page', 'Failed to fetch diagnostics', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  const downloadDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      serverDiagnostics: diagnostics,
      serverHealth: health,
      clientDiagnostics: clientDiagnostics,
      clientLogs: clientDebugger.getDiagnostics(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `red2blue-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    clientDebugger.success('debug-page', 'Diagnostics report downloaded');
  };

  if (loading && !diagnostics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading comprehensive diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error && !diagnostics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Diagnostics Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDiagnostics} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Red2Blue Deployment Diagnostics</h1>
          <p className="text-muted-foreground">
            Comprehensive debugging information for deployment issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadDiagnostics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={fetchDiagnostics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health?.status === 'healthy' ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> :
                <XCircle className="h-5 w-5 text-red-500" />
              }
              <span className="font-medium">
                {health?.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Environment: {health?.environment || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diagnostics Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {diagnostics?.diagnostics.success ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> :
                <XCircle className="h-5 w-5 text-red-500" />
              }
              <span className="font-medium">
                {diagnostics?.diagnostics.success ? 'All Systems Go' : 'Issues Found'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {diagnostics?.diagnostics.summary}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Client Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {clientDiagnostics?.success ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> :
                <XCircle className="h-5 w-5 text-red-500" />
              }
              <span className="font-medium">
                {clientDiagnostics?.success ? 'Working' : 'Issues Found'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {clientDiagnostics?.failures?.length || 0} failures detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="server" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="server">Server Diagnostics</TabsTrigger>
          <TabsTrigger value="client">Client Diagnostics</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {diagnostics?.diagnostics.results.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.component.toUpperCase()}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm">{result.message}</p>
                        {result.details && (
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client-Side Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {clientDiagnostics?.failures?.map((failure: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg border-red-200">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{failure.component.toUpperCase()}</span>
                          <Badge variant="destructive">ERROR</Badge>
                        </div>
                        <p className="text-sm">{failure.message}</p>
                        {failure.details && (
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(failure.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Test Results Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(clientDiagnostics?.results || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <h5 className="font-medium capitalize mb-1">{key}</h5>
                          <div className="flex items-center gap-2">
                            {value.healthy !== false && value.available !== false && value.authenticated !== false ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> :
                              <XCircle className="h-4 w-4 text-red-500" />
                            }
                            <span className="text-sm">
                              {typeof value === 'object' ? 
                                (value.error || 'Working') : 
                                String(value)
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge>{health?.environment}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{Math.floor((health?.uptime || 0) / 60)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Node Version:</span>
                  <span>{diagnostics?.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span>{diagnostics?.platform}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(health?.checks || {}).map(([check, status]) => (
                  <div key={check} className="flex justify-between items-center">
                    <span className="capitalize">{check}:</span>
                    <div className="flex items-center gap-2">
                      {status ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> :
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span>{status ? 'Working' : 'Failed'}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(health?.memory || {}).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold">{Math.round((value as number) / 1024 / 1024)}MB</p>
                    <p className="text-sm text-muted-foreground capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {diagnostics?.logs.slice(-50).reverse().map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 border-b">
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.component}
                          </Badge>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
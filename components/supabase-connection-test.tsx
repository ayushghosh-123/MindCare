'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection, verifyUserDataIsolation } from '@/lib/supabase-connection-test';
import type { ConnectionTestResult } from '@/lib/supabase-connection-test';

export function SupabaseConnectionTest() {
  const { user, isLoaded } = useUser();
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isolationResult, setIsolationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      runTests();
    }
  }, [isLoaded, user?.id]);

  const runTests = async () => {
    setTesting(true);
    setLoading(true);
    setTestResult(null);
    setIsolationResult(null);

    try {
      // Test basic connection
      const connectionTest = await testSupabaseConnection(user?.id);
      setTestResult(connectionTest);

      // If connected and user is logged in, test data isolation
      if (connectionTest.connected && user?.id) {
        try {
          const isolation = await verifyUserDataIsolation(user.id);
          setIsolationResult(isolation);
        } catch (isolationError) {
          console.error('Isolation test failed:', isolationError);
          // Set a default isolation result on error
          setIsolationResult({
            healthEntries: { count: 0, allHaveUserId: false },
            chats: { count: 0, allHaveUserId: false },
            journalEntries: { count: 0, allHaveUserId: false }
          });
        }
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      // Set error result
      setTestResult({
        connected: false,
        error: error?.message || 'Failed to run connection test',
        tablesAccessible: {
          health_entries: false,
          chats: false,
          journal_entries: false,
          users: false,
          user_profiles: false
        }
      });
    } finally {
      setLoading(false);
      setTesting(false);
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {testResult?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : testResult ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Verify database connection and user data isolation
            </CardDescription>
          </div>
          <Button
            onClick={runTests}
            disabled={testing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600 mx-auto"></div>
            <p className="text-sm text-slate-600 mt-2">Running tests...</p>
          </div>
        ) : testResult ? (
          <>
            {/* Connection Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Connection Status</span>
                <Badge variant={testResult.connected ? 'default' : 'destructive'}>
                  {testResult.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>

              {testResult.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Error:</p>
                  <p className="text-sm text-red-700">{testResult.error}</p>
                </div>
              )}

              {/* Table Access */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Table Accessibility</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">health_entries</span>
                    <Badge variant={testResult.tablesAccessible.health_entries ? 'default' : 'destructive'}>
                      {testResult.tablesAccessible.health_entries ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">chats</span>
                    <Badge variant={testResult.tablesAccessible.chats ? 'default' : 'destructive'}>
                      {testResult.tablesAccessible.chats ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">journal_entries</span>
                    <Badge variant={testResult.tablesAccessible.journal_entries ? 'default' : 'destructive'}>
                      {testResult.tablesAccessible.journal_entries ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">users</span>
                    <Badge variant={testResult.tablesAccessible.users ? 'default' : 'destructive'}>
                      {testResult.tablesAccessible.users ? '✓' : '✗'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">user_profiles</span>
                    <Badge variant={testResult.tablesAccessible.user_profiles ? 'default' : 'destructive'}>
                      {testResult.tablesAccessible.user_profiles ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Data Counts */}
              {testResult.details && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Data Counts</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {testResult.details.healthEntriesCount !== undefined && (
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-800">Health Entries</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {testResult.details.healthEntriesCount}
                        </div>
                      </div>
                    )}
                    {testResult.details.chatsCount !== undefined && (
                      <div className="p-2 bg-purple-50 rounded">
                        <div className="font-medium text-purple-800">Chat Messages</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {testResult.details.chatsCount}
                        </div>
                      </div>
                    )}
                    {testResult.details.journalEntriesCount !== undefined && (
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-800">Journal Entries</div>
                        <div className="text-2xl font-bold text-green-600">
                          {testResult.details.journalEntriesCount}
                        </div>
                      </div>
                    )}
                    {testResult.details.userProfileCount !== undefined && (
                      <div className="p-2 bg-orange-50 rounded">
                        <div className="font-medium text-orange-800">User Profiles</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {testResult.details.userProfileCount}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Data Isolation */}
              {isolationResult && user && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm">User Data Isolation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">Health Entries</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">
                          {isolationResult.healthEntries.count} entries
                        </span>
                        <Badge
                          variant={isolationResult.healthEntries.allHaveUserId ? 'default' : 'destructive'}
                        >
                          {isolationResult.healthEntries.allHaveUserId ? '✓ Isolated' : '✗ Error'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">Chat Messages</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">
                          {isolationResult.chats.count} messages
                        </span>
                        <Badge
                          variant={isolationResult.chats.allHaveUserId ? 'default' : 'destructive'}
                        >
                          {isolationResult.chats.allHaveUserId ? '✓ Isolated' : '✗ Error'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">Journal Entries</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">
                          {isolationResult.journalEntries.count} entries
                        </span>
                        <Badge
                          variant={isolationResult.journalEntries.allHaveUserId ? 'default' : 'destructive'}
                        >
                          {isolationResult.journalEntries.allHaveUserId ? '✓ Isolated' : '✗ Error'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!user && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please sign in to test user data isolation.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-600">No test results available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


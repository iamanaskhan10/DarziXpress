// /pages/tailor/MyEarnings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Currency, Loader2, AlertTriangle, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select as SimplifiedSelect } from '@/components/ui/select'; // Using simplified HTML select
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for potential order detail view
import { Label } from '@/components/ui/label';

const MyEarnings = () => {
  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState([]); // Stores individual earning records
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = useCallback(async () => {
    if (!authToken || !user || user.userType !== 'tailor') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/earnings/tailor?timeFilter=${encodeURIComponent(timeFilter)}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        if (response.status === 401) { logout(); navigate('/login'); return; }
        const errData = await response.json().catch(() => ({ message: "Failed to fetch earnings" }));
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      setEarnings(data.earnings || []);
      setTotalEarnings(data.totalEarningsInPeriod || 0);
    } catch (err) {
      console.error("MyEarnings fetch error:", err);
      setError(err.message);
      setEarnings([]);
      setTotalEarnings(0);
    } finally {
      setLoading(false);
    }
  }, [authToken, user, timeFilter, logout, navigate]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEarnings();
    }
  }, [authLoading, user, fetchEarnings]);


  if (authLoading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;
  }
  if (!user || user.userType !== 'tailor') {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p>Access Denied. Please login as a Tailor.</p></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      <header className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-bold text-slate-800">Earnings Dashboard</h1>
        <p className="text-md text-slate-600 mt-1">Track your earnings from completed orders.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings ({timeFilter})</CardTitle>
            <Currency className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading && totalEarnings === 0 ? (
              <div className="text-2xl font-bold animate-pulse">PKR ...</div>
            ) : (
              <div className="text-2xl font-bold">PKR {totalEarnings.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              From {earnings.length} completed order(s) in this period.
            </p>
          </CardContent>
        </Card>
        {/* Add more summary cards if needed, e.g., average earning, etc. */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <CardTitle className="text-xl">Earnings History</CardTitle>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <Label htmlFor="timeFilterEarnings" className="sr-only">Filter by Time</Label>
              <SimplifiedSelect
                id="timeFilterEarnings"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="h-10 w-full"
                disabled={loading}
              >
                <option value="All Time">All Time</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </SimplifiedSelect>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
              <AlertTriangle size={32} className="mx-auto mb-2" />
              <p className="font-semibold">Error loading earnings: {error}</p>
              <Button variant="outline" onClick={fetchEarnings} className="mt-3">Try Again</Button>
            </div>
          ) : earnings.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Service(s)</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead className="text-right">Amount Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earningRecord) => (
                    <TableRow key={earningRecord._id || earningRecord.orderIdString}>
                      <TableCell className="font-medium text-indigo-600">
                        {/* Link to the original order if needed */}
                        <Link to={`/tailor/order-details/${earningRecord.order}`}>
                          {earningRecord.orderIdString}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-sm truncate" title={earningRecord.serviceNames?.join(', ')}>
                        {earningRecord.serviceNames?.slice(0, 2).join(', ') || 'N/A'}
                        {earningRecord.serviceNames?.length > 2 && '...'}
                      </TableCell>
                      <TableCell>
                        {new Date(earningRecord.completionDate).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        PKR {earningRecord.earnedAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <CalendarDays size={32} className="mx-auto mb-2 text-slate-400" />
              <p>No earnings found for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyEarnings;
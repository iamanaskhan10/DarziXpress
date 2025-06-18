// /pages/admin/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DollarSign, Users, UserCheck, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/AuthContext"; // Assuming admin uses AuthContext
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Helper to format currency
const formatCurrency = (amount, currency = "PKR") => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'N/A';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, unit = "", color = "text-indigo-600", isLoading }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex-1 min-w-[200px]">
    <div className="flex items-center justify-between mb-1">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {icon && React.cloneElement(icon, { className: `h-5 w-5 text-slate-400` })}
    </div>
    {isLoading ? (
      <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mt-1"></div>
    ) : (
      <h3 className={`text-3xl font-bold ${color}`}>{unit}{value !== null && value !== undefined ? Number(value).toLocaleString() : '0'}</h3>
    )}
  </div>
);

const AdminDashboard = () => {
  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [overviewStats, setOverviewStats] = useState({
    totalPlatformProfit: null,
    totalCustomers: null,
    totalTailors: null,
  });
  const [earningsTrend, setEarningsTrend] = useState([]); // Initialize as empty array
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!authToken || !user || user.userType !== 'admin') {
      // This case should ideally be caught by the checks in the main useEffect
      setLoadingStats(false);
      setLoadingChart(false);
      return;
    }

    setLoadingStats(true);
    setLoadingChart(true);
    setError('');
    console.log("AdminDashboard: Fetching data...");

    try {
      const [statsResponse, earningsResponse] = await Promise.all([
        fetch(`${baseURL}/api/admin/stats/overview`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch(`${baseURL}/api/admin/stats/earnings-trend`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);

      let combinedErrorMessage = "";

      // Process Overview Stats
      if (!statsResponse.ok) {
        const errData = await statsResponse.json().catch(() => ({ message: "Failed to fetch overview stats" }));
        const statsError = `Stats Error: ${statsResponse.status} - ${errData.message}`;
        console.error(statsError);
        combinedErrorMessage += statsError + "\n";
        setOverviewStats({ totalPlatformProfit: 0, totalCustomers: 0, totalTailors: 0 }); // Fallback
      } else {
        const statsData = await statsResponse.json();
        console.log("AdminDashboard: Stats data received:", statsData);
        setOverviewStats({
          totalPlatformProfit: statsData.totalPlatformProfit ?? 0,
          totalCustomers: statsData.totalCustomers ?? 0,
          totalTailors: statsData.totalTailors ?? 0,
        });
      }

      // Process Earnings Trend
      if (!earningsResponse.ok) {
        const errData = await earningsResponse.json().catch(() => ({ message: "Failed to fetch earnings trend" }));
        const earningsError = `Earnings Trend Error: ${earningsResponse.status} - ${errData.message}`;
        console.error(earningsError);
        combinedErrorMessage += earningsError + "\n";
        setEarningsTrend([]); // Fallback
      } else {
        const earningsData = await earningsResponse.json();
        console.log("AdminDashboard: Earnings trend data received:", earningsData);
        if (Array.isArray(earningsData)) {
          setEarningsTrend(earningsData);
        } else {
          console.warn("AdminDashboard: Earnings trend data is not an array:", earningsData);
          setEarningsTrend([]);
        }
      }

      if (combinedErrorMessage) {
        setError(combinedErrorMessage.trim());
      }

    } catch (err) {
      console.error("Error fetching admin dashboard data (catch block):", err);
      setError(err.message || "Failed to load dashboard data.");
      setOverviewStats({ totalPlatformProfit: 0, totalCustomers: 0, totalTailors: 0 });
      setEarningsTrend([]);
    } finally {
      setLoadingStats(false);
      setLoadingChart(false);
    }
  }, [authToken, user]); // Removed logout, navigate as they are stable from context/router

  useEffect(() => {
    if (authLoading) {
      console.log("AdminDashboard: Waiting for AuthContext to load...");
      setLoadingStats(true); // Keep loaders on if auth is still loading
      setLoadingChart(true);
      return;
    }
    if (authToken && user && user.userType === 'admin') {
      fetchDashboardData();
    } else {
      // Auth is ready, but user is not an admin or not logged in
      setError("Access Denied. Admin privileges required.");
      setLoadingStats(false);
      setLoadingChart(false);
      // Consider navigating to login if appropriate, or let the main return handle it
      // if (!authToken) navigate('/login');
    }
  }, [authLoading, authToken, user, fetchDashboardData]);

  // Ensure earningsTrend is always an array for the chart data construction
  const currentEarningsTrend = Array.isArray(earningsTrend) ? earningsTrend : [];

  const earningsChartData = {
    labels: currentEarningsTrend.map(data => data.period || 'N/A'),
    datasets: [
      {
        label: 'Platform Profit',
        data: currentEarningsTrend.map(data => data.profit || 0),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12, family: 'Poppins, sans-serif' }, boxWidth: 15, padding: 20 }
      },
      title: {
        display: true,
        text: 'Platform Earnings Trend',
        font: { size: 18, weight: '600', family: 'Poppins, sans-serif' },
        padding: { top: 10, bottom: 25 }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
            return label;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { family: 'Poppins, sans-serif' },
        bodyFont: { family: 'Poppins, sans-serif' },
        padding: 10,
        cornerRadius: 4,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) { return formatCurrency(value, 'PKR').replace('PKR', '').trim(); },
          font: { family: 'Poppins, sans-serif', size: 11 },
          padding: 10,
        },
        grid: { color: 'rgba(203, 213, 225, 0.3)' }
      },
      x: {
        ticks: { font: { family: 'Poppins, sans-serif', size: 11 } },
        grid: { display: false }
      }
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' }
  };

  // --- UI Rendering Logic ---
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="ml-3 text-slate-600 text-lg">Initializing Admin Session...</p>
      </div>
    );
  }

  // If auth is resolved, but user is not an admin
  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-100 p-8 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        <p className="text-red-600 mt-1 mb-4">{error || "Admin privileges required."}</p>
        <Button onClick={() => { logout(); navigate('/login'); }} variant="outline">Admin Login</Button>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <header className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      </header>

      {/* Display general error if any occurred during data fetching for already authenticated admin */}
      {error && (overviewStats.totalCustomers === null || overviewStats.totalTailors === null || currentEarningsTrend.length === 0) && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
          <p>There was an issue loading some dashboard data: {error}</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-2">Retry Fetch</Button>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="Total Platform Profit"
            value={overviewStats.totalPlatformProfit}
            icon={<DollarSign />}
            unit="PKR "
            color="text-green-600"
            isLoading={loadingStats}
          />
          <StatCard
            title="Total Customers"
            value={overviewStats.totalCustomers}
            icon={<Users />}
            isLoading={loadingStats}
          />
          <StatCard
            title="Total Tailors"
            value={overviewStats.totalTailors}
            icon={<UserCheck />}
            isLoading={loadingStats}
          />
        </div>
      </section>

      <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-700">Earnings Trend</h3>
        <CardDescription className="text-sm text-slate-500 mb-6">
          Monthly platform profit from service commissions.
        </CardDescription>
        {loadingChart ? (
          <div className="h-80 flex items-center justify-center bg-slate-50 rounded-md">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="ml-3 text-slate-500">Loading chart data...</p>
          </div>
        ) : currentEarningsTrend.length === 0 ? ( // If error occurred or no data
          <div className="h-80 flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-4 rounded-md">
            <TrendingUp size={32} className="mb-2" />
            <p>{error && overviewStats.totalCustomers !== null ? "Could not load earnings trend data." : "No earnings data available to display trend yet."}</p>
            {error && overviewStats.totalCustomers !== null && <p className="text-xs text-red-500 mt-1">Error: {error.split('\n').find(line => line.includes("Earnings Trend Error")) || error}</p>}

          </div>
        ) : (
          <div className="relative h-80 md:h-96">
            <Bar options={chartOptions} data={earningsChartData} />
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
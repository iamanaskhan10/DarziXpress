// /pages/tailor/TailorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, List, Info, PlusCircle, PackageCheck, Edit, Loader2 } from 'lucide-react'; // Added more icons
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const TailorDashboard = () => {
  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [tailorName, setTailorName] = useState('');
  const [orderSummary, setOrderSummary] = useState({ activeOrdersCount: 0, lastCompletedOrderDate: null });
  const [serviceSummary, setServiceSummary] = useState({ activeServicesCount: 0, totalServicesCount: 0 });

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth context to load

    if (!authToken || !user || user.userType !== 'tailor') {
      setPageLoading(false);
      logout(); // Ensure logout if not a tailor or no auth
      navigate('/login');
      return;
    }

    const fetchTailorDashboardData = async () => {
      setPageLoading(true);
      setError(null);
      setTailorName(''); // Reset
      setOrderSummary({ activeOrdersCount: 0, lastCompletedOrderDate: null });
      setServiceSummary({ activeServicesCount: 0, totalServicesCount: 0 });


      try {
        // Fetch all data in parallel
        const [profileRes, ordersRes, servicesRes] = await Promise.all([
          fetch('/api/users/profile', { headers: { 'Authorization': `Bearer ${authToken}` } }),
          fetch('/api/orders/tailor-summary', { headers: { 'Authorization': `Bearer ${authToken}` } }),
          fetch('/api/services/tailor-summary', { headers: { 'Authorization': `Bearer ${authToken}` } })
        ]);

        // Process Profile
        if (!profileRes.ok) {
          if (profileRes.status === 401) { logout(); navigate('/login'); return; }
          const profileErr = await profileRes.json().catch(() => ({ message: "Failed to parse profile error" }));
          throw new Error(profileErr.message || `Profile fetch error! Status: ${profileRes.status}`);
        }
        const profileData = await profileRes.json();
        setTailorName(profileData.fullName || 'Tailor');

        // Process Orders Summary
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrderSummary(ordersData || { activeOrdersCount: 0, lastCompletedOrderDate: null });
        } else {
          console.error(`Tailor Orders Summary fetch error! Status: ${ordersRes.status}`);
        }

        // Process Services Summary
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServiceSummary(servicesData || { activeServicesCount: 0, totalServicesCount: 0 });
        } else {
          console.error(`Tailor Services Summary fetch error! Status: ${servicesRes.status}`);
        }

      } catch (err) {
        console.error("TailorDashboard: Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchTailorDashboardData();
  }, [authToken, user, authLoading, navigate, logout]);


  if (authLoading || (pageLoading && !tailorName && !error)) { // Show loading if auth is loading OR page is loading critical data (tailorName)
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="ml-3 text-slate-600 text-lg">Loading Tailor Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <p className="text-red-600 text-lg mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // If auth loaded, but still no valid tailor user after all checks
  if (!user || user.userType !== 'tailor') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <p className="text-slate-600 text-lg mb-4">Access Denied. Please log in as a tailor.</p>
        <Button onClick={() => { logout(); navigate('/login'); }}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto space-y-8"> {/* Increased max-width */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, <span className="text-indigo-600">{tailorName || "Tailor"}!</span>
          </h1>
          <p className="text-md text-slate-600 mt-1">
            Here's an overview of your tailoring business.
          </p>
        </header>

        {/* Key Stats / Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Activity size={18} className="text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderSummary.activeOrdersCount}</div>
              <p className="text-xs text-slate-500">
                {orderSummary.lastCompletedOrderDate
                  ? `Last completed: ${new Date(orderSummary.lastCompletedOrderDate).toLocaleDateString()}`
                  : 'No orders completed yet.'}
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/tailor/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Services</CardTitle>
              <List size={18} className="text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceSummary.activeServicesCount}</div>
              <p className="text-xs text-slate-500">
                Active listings out of {serviceSummary.totalServicesCount} total.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/tailor/listings">Manage Services</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-indigo-600 text-white hover:shadow-lg transition-shadow flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center"> {/* Increased font size */}
                <PlusCircle size={20} className="mr-2" /> {/* Increased icon size */}
                Create New Service
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
<p className="text-sm text-slate-400">
                Attract more customers by showcasing your unique tailoring skills and services.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                onClick={() => navigate('/tailor/post-service')}
                variant="secondary" // Or another variant that looks good on indigo
                className="w-full bg-white text-indigo-600 hover:bg-slate-100"
              >
                <Edit size={16} className="mr-2" /> Post a Service
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Removed Measurements Card */}

        {/* Tips Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2"> {/* Use flex-row for alignment */}
            <Info size={18} className="mr-2 text-yellow-500 flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Tailor Tips & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
              <li>Keep your service descriptions detailed and accurate.</li>
              <li>Upload high-quality images of your work.</li>
              <li>Respond to new order requests promptly to build customer trust.</li>
              <li>Ensure your availability and estimated delivery times are realistic.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TailorDashboard;
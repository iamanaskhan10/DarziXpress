// /pages/customer/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Activity, Ruler as RulerIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CustomerDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { authToken, user, authLoading, logout } = useAuth(); // Get authLoading

    const [userName, setUserName] = useState('');
    const [dashboardMeasurements, setDashboardMeasurements] = useState([]);
    const [recentActivity, setRecentActivity] = useState({ latestOrders: [], activeOrdersCount: 0 });

    const [pageLoading, setPageLoading] = useState(true); // Specific to this page's data fetching
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Wait for AuthContext to finish its initial loading AND ensure we have necessary auth info
        if (authLoading) {
            console.log("Dashboard: AuthContext is still loading. Waiting...");
            // setPageLoading(true); // Keep page loading indicator if auth is not ready
            return; // Wait for AuthContext to be ready
        }

        if (!authToken || !user || !user.userId) {
            console.log("Dashboard: No authToken or user.userId found after AuthContext loaded. Redirecting to login.");
            setPageLoading(false); // No data to fetch
            logout(); // Ensure clean state if somehow inconsistent
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            console.log("Dashboard: Auth ready. Starting to fetch data with user.userId:", user.userId);
            setPageLoading(true); // Start page-specific loading
            setError(null);
            setUserName(''); // Reset for fresh fetch
            setDashboardMeasurements([]);
            setRecentActivity({ latestOrders: [], activeOrdersCount: 0 });

            try {
                // --- Fetch User Profile (Critical) ---
                const fetchUrl = '/api/users/profile'; // Or 'http://localhost:5000/api/users/profile' if not using a proxy
                console.log("Dashboard: Fetching profile from URL:", fetchUrl);
                console.log("Dashboard: Using authToken for profile fetch:", authToken);

                const profileResponse = await fetch(fetchUrl, { // Ensure this URL is correct
                    method: 'GET', // Explicitly set method, though GET is default
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json' // Though not strictly needed for GET, good practice
                    },
                });

                console.log("Dashboard: Profile response status:", profileResponse.status);
                console.log("Dashboard: Profile response OK?:", profileResponse.ok);
                const responseContentType = profileResponse.headers.get("content-type");
                console.log("Dashboard: Profile response Content-Type:", responseContentType);

                if (!profileResponse.ok) {
                    if (profileResponse.status === 401) {
                        console.error("Dashboard: Profile fetch unauthorized (401). Logging out.");
                        logout();
                        navigate('/login');
                        return;
                    }
                    // If not OK, try to read as text first to see what HTML/error it is
                    const errorText = await profileResponse.text();
                    console.error("Dashboard: Profile fetch failed. Server response text:", errorText.substring(0, 500)); // Log first 500 chars
                    throw new Error(`Profile fetch error! Status: ${profileResponse.status}. Response: ${errorText.substring(0, 100)}...`);
                }

                // Only attempt .json() if content type indicates JSON
                if (responseContentType && responseContentType.includes("application/json")) {
                    const profileData = await profileResponse.json();
                    console.log("Dashboard: Profile data fetched successfully:", profileData);
                    setUserName(profileData.fullName || 'Customer');
                } else {
                    const responseText = await profileResponse.text(); // Get the HTML/text content
                    console.error("Dashboard: Profile response was not JSON. Content-Type:", responseContentType, "Response Text:", responseText.substring(0, 500));
                    throw new Error(`Profile response was not JSON. Received: ${responseContentType}`);
                }

                // --- Fetch Latest Measurements ---
                try {
                    const measurementsResponse = await fetch('/api/measurements/latest/2', {
                        headers: { 'Authorization': `Bearer ${authToken}` },
                    });
                    if (measurementsResponse.ok) {
                        const measurementsData = await measurementsResponse.json();
                        setDashboardMeasurements(measurementsData || []);
                    } else {
                        const errorData = await measurementsResponse.json().catch(() => null);
                        console.error(`Dashboard: Measurements fetch error! Status: ${measurementsResponse.status}`, errorData);
                    }
                } catch (measurementsError) {
                    console.error("Dashboard: Exception fetching measurements:", measurementsError);
                }

                // --- Fetch Orders Summary ---
                try {
                    const ordersSummaryResponse = await fetch('/api/orders/my-orders/latest/1', {
                        headers: { 'Authorization': `Bearer ${authToken}` },
                    });
                    if (ordersSummaryResponse.ok) {
                        const ordersData = await ordersSummaryResponse.json();
                        setRecentActivity(ordersData || { latestOrders: [], activeOrdersCount: 0 });
                    } else {
                        const errorData = await ordersSummaryResponse.json().catch(() => null);
                        console.error(`Dashboard: Orders summary fetch error! Status: ${ordersSummaryResponse.status}`, errorData);
                    }
                } catch (ordersError) {
                    console.error("Dashboard: Exception fetching orders summary:", ordersError);
                }

            } catch (err) {
                console.error("Dashboard: Critical error fetching dashboard data:", err);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setPageLoading(false); // Page-specific loading finished
            }
        };

        fetchDashboardData();
    }, [authToken, user, authLoading, navigate, logout]); // Add authLoading to dependencies

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/customer/listing?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Display while AuthContext is determining auth state
    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
                <p className="text-slate-600 text-lg animate-pulse">Initializing session...</p>
            </div>
        );
    }

    // If AuthContext loaded but no user/token (e.g. navigated here directly without login)
    // This also covers the case where the effect exited early due to missing auth info AFTER authLoading was false.
    if (!authToken || !user || !user.userId) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
                <p className="text-slate-600 text-lg mb-4">Please log in to view your dashboard.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
        );
    }

    // Display while this page's specific data is fetching (after auth is confirmed)
    if (pageLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
                <p className="text-slate-600 text-lg animate-pulse">Loading dashboard data...</p>
            </div>
        );
    }

    // If there was a critical error during page data fetching (e.g., profile fetch)
    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
                <p className="text-red-600 text-lg mb-4">Error loading dashboard: {error}</p>
                <Button onClick={() => { setError(null); window.location.reload(); }}>Retry</Button>
            </div>
        );
    }

    const displayUserName = userName || "Customer"; // Fallback if userName somehow remains empty after load

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start bg-slate-50 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-10">
                <section className="text-center bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                        Find Your Perfect Stitching Service
                    </h1>
                    <p className="text-slate-500 mb-6 text-sm sm:text-base">
                        Search for services like "pant coat stitching", "bridal lehenga", or "kurta design".
                    </p>
                    <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <Input
                            id="service-search"
                            type="text"
                            placeholder="E.g., 'Pant Coat Stitching'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full !h-12 !pl-11 !pr-28 !rounded-lg !text-base"
                        />
                        <Button
                            type="submit"
                            className="!absolute !inset-y-1.5 !right-1.5 !h-auto !px-5 !py-2"
                        >
                            Search
                        </Button>
                    </form>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center sm:text-left">
                        Welcome back, <span className="text-indigo-600">{displayUserName}!</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="flex items-center text-sm font-medium">
                                    <RulerIcon size={16} className="mr-2 text-indigo-500" />
                                    My Measurements
                                </CardTitle>
                                <Link to="/customer/measurements">
                                    <Button variant="ghost" size="sm" className="-mr-2 h-8">Manage</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {pageLoading && dashboardMeasurements.length === 0 && userName ? (
                                    <p className="text-sm text-slate-400 animate-pulse">Loading measurements...</p>
                                ) : dashboardMeasurements.length > 0 ? (
                                    <ul className="space-y-2">
                                        {dashboardMeasurements.slice(0, 2).map(m => (
                                            <li key={m._id || m.id} className="text-sm text-slate-600 flex justify-between items-center p-2 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors">
                                                <span>{m.name}</span>
                                                <span className="text-xs text-slate-400">Updated: {new Date(m.lastUpdated).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500">No measurement profiles found. <Link to="/customer/measurements" className="text-indigo-600 hover:underline">Add one now</Link>!</p>
                                )}
                                {!pageLoading && dashboardMeasurements.length > 2 &&
                                    <p
                                        className="text-xs text-indigo-600 hover:underline mt-2 text-center cursor-pointer"
                                        onClick={() => navigate('/customer/measurements')}
                                    >
                                        View all {dashboardMeasurements.length} profiles
                                    </p>
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="flex items-center text-sm font-medium">
                                    <Activity size={16} className="mr-2 text-green-500" />
                                    Recent Activity
                                </CardTitle>
                                <Link to="/customer/orders">
                                    <Button variant="ghost" size="sm" className="-mr-2 h-8">View Orders</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {pageLoading && recentActivity.activeOrdersCount === 0 && recentActivity.latestOrders.length === 0 && userName ? (
                                    <p className="text-sm text-slate-400 animate-pulse">Loading activity...</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-slate-600">
                                            You have <Link to="/customer/orders?status=active" className="font-semibold text-indigo-600 hover:underline">{recentActivity.activeOrdersCount} active order(s)</Link>.
                                        </p>
                                        {recentActivity.latestOrders.length > 0 && recentActivity.latestOrders[0] ? (
                                            <p className="text-sm text-slate-500 mt-1">
                                                Your latest order ({recentActivity.latestOrders[0].orderIdString || recentActivity.latestOrders[0]._id}) was placed on {new Date(recentActivity.latestOrders[0].orderDate).toLocaleDateString()}.
                                            </p>
                                        ) : recentActivity.activeOrdersCount === 0 ? (
                                            <p className="text-sm text-slate-500 mt-1">No recent order activity.</p>
                                        ) : null}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CustomerDashboard;
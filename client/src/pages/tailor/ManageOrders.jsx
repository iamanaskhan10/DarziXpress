// /pages/tailor/ManageOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Box, Eye, Edit2, Loader2, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'; // Changed Truck to XCircle for Cancelled

// ... (other imports: Input, Card, Button, Table, SimplifiedSelect, Label, useAuth) ...
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select as SimplifiedSelect } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';


const getStatusVisuals = (status) => {
    let baseClasses = "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap";
    switch (status) {
        case 'Pending': // Simplified from 'Pending Confirmation'
            return { chip: `${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`, icon: <AlertCircle size={14} /> };
        case 'In Progress':
            return { chip: `${baseClasses} bg-amber-50 text-amber-700 border-amber-200`, icon: <Clock size={14} /> };
        case 'Completed':
            return { chip: `${baseClasses} bg-green-50 text-green-700 border-green-200`, icon: <CheckCircle size={14} /> };
        case 'Cancelled':
            return { chip: `${baseClasses} bg-red-50 text-red-700 border-red-200`, icon: <XCircle size={14} /> }; // Using XCircle for Cancelled
        default: // Fallback for any other statuses that might come from DB initially
            return { chip: `${baseClasses} bg-slate-100 text-slate-700 border-slate-200`, icon: null };
    }
};

// UPDATED available statuses a tailor might set or filter by
const availableStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const ManageOrders = () => {
    const { authToken, user, authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    // ... (filteredOrders, searchQuery, statusFilter, pageLoading, error, updatingStatusId states remain the same)
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchQuery);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchTailorOrders = useCallback(async () => {
        if (!authToken || !user || user.userType !== 'tailor') {
            setPageLoading(false);
            return;
        }
        setPageLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/orders/tailor-orders', { // This endpoint should return orders for the tailor
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) {
                if (response.status === 401) { logout(); navigate('/login'); return; }
                const errData = await response.json().catch(() => ({ message: "Failed to fetch orders" }));
                throw new Error(errData.message || `Error: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data || []);
            // Filtered orders will be updated by its own useEffect
        } catch (err) {
            console.error("ManageOrders fetch error:", err);
            setError(err.message);
            setOrders([]);
        } finally {
            setPageLoading(false);
        }
    }, [authToken, user, logout, navigate]);

    useEffect(() => {
        if (!authLoading) {
            fetchTailorOrders();
        }
    }, [authLoading, fetchTailorOrders]);


    useEffect(() => {
        let currentOrders = [...orders];
        if (debouncedSearchTerm) {
            const lowerQuery = debouncedSearchTerm.toLowerCase();
            currentOrders = currentOrders.filter(order =>
                (order.customer?.fullName?.toLowerCase().includes(lowerQuery)) ||
                (order.orderIdString?.toLowerCase().includes(lowerQuery)) ||
                (order.items?.some(item => item.serviceName.toLowerCase().includes(lowerQuery)))
            );
        }
        if (statusFilter !== 'All') {
            currentOrders = currentOrders.filter(order => order.status === statusFilter);
        }
        setFilteredOrders(currentOrders);
    }, [debouncedSearchTerm, statusFilter, orders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (!authToken) {
            setError("Authentication error. Please log in again.");
            return;
        }
        setUpdatingStatusId(orderId);
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "Failed to update status" }));
                throw new Error(errData.message || `Error: ${response.status}`);
            }
            const updatedOrder = await response.json();
            setOrders(prevOrders => prevOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        } catch (err) {
            console.error("Error updating status:", err);
            alert(`Failed to update status: ${err.message}`);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // ... (loading, error, auth check JSX remains the same) ...
    if (authLoading) { console.log("hello"); }
    if (!user || user.userType !== 'tailor') { /* ... */ }
    if (pageLoading) { /* ... */ }
    if (error) { /* ... */ }


    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto space-y-8">
                <header className="mb-6 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manage Your Orders</h1>
                    <p className="text-md text-slate-600 mt-1">
                        View incoming orders, update their status, and manage your workflow.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <CardTitle className="text-xl">Orders ({filteredOrders.length} of {orders.length})</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                                <div className="relative sm:w-64 md:w-72 flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        type="text"
                                        placeholder="Search by Customer, Order ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-10"
                                    />
                                </div>
                                <div className="flex-grow sm:w-48">
                                    <Label htmlFor="statusFilter" className="sr-only">Filter by status</Label>
                                    <SimplifiedSelect
                                        id="statusFilter"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-10"
                                    >
                                        <option value="All">All Statuses</option>
                                        {availableStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </SimplifiedSelect>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service(s)</TableHead>
                                        <TableHead className="w-[120px]">Order Date</TableHead>
                                        <TableHead className="w-[120px] text-right">Total</TableHead>
                                        <TableHead className="w-[200px]">Status</TableHead>
                                        {/* <TableHead className="w-[100px] text-right">Actions</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map(order => {
                                            const statusVisuals = getStatusVisuals(order.status);
                                            return (
                                                <TableRow key={order._id} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-slate-700">{order.orderIdString}</TableCell>
                                                    <TableCell className="text-slate-600">{order.customer?.fullName || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600 max-w-xs truncate" title={order.items?.map(item => item.serviceName).join(', ') || 'N/A'}>
                                                        {order.items?.length > 0 ? order.items[0].serviceName : 'N/A'}
                                                        {order.items?.length > 1 && ` + ${order.items.length - 1} more`}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-slate-800 font-medium text-right">PKR {order.totalAmount.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center w-full">
                                                            <SimplifiedSelect
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                                disabled={updatingStatusId === order._id}
                                                                // Use a consistent base style for the select, then add status-specific chip styles
                                                                className={`h-9 text-xs min-w-[150px] appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${statusVisuals.chip}`}
                                                            >
                                                                {/* Using updated availableStatuses */}
                                                                {availableStatuses.map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </SimplifiedSelect>
                                                            {updatingStatusId === order._id && <Loader2 className="ml-2 h-4 w-4 animate-spin text-indigo-600" />}
                                                        </div>
                                                    </TableCell>
                                                    {/* <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                                                            <Link to={`/tailor/order-details/${order._id}`}>
                                                                <Eye className="w-4 h-4 mr-1" /> View
                                                            </Link>
                                                        </Button>
                                                    </TableCell> */}
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                                {orders.length === 0 ? "You have no orders yet." : "No orders match your current filters."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default ManageOrders;
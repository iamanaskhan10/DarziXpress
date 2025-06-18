// /pages/customer/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } // Added useNavigate
    from 'react-router-dom';
import { Package, CalendarDays, Clock, CircleCheck, CircleAlert, Trash2, Loader2, AlertTriangle, AlertCircle, CircleDollarSign, CheckCircle } from 'lucide-react'; // Added Trash2, Loader2, AlertTriangle

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

// Helper functions (getStatusChipStyles, getStatusIcon should be the same as before)
const getStatusChipStyles = (status) => {
    // 'Pending', 'In Progress', 'Completed', 'Cancelled'
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
        // case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200'; // Removed if not used
        case 'Completed': // Renamed from Delivered for consistency
        case 'Delivered': // Keep if 'Delivered' can come from DB
            return 'bg-green-100 text-green-700 border-green-200';
        case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
        // case 'Awaiting Payment': return 'bg-orange-100 text-orange-700 border-orange-200'; // Removed
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'Pending': return <AlertCircle size={14} className="text-yellow-600" />;
        case 'In Progress': return <Clock size={14} className="text-amber-600" />;
        // case 'Shipped': return <Truck size={14} className="text-blue-600" />;
        case 'Completed':
        case 'Delivered':
            return <CheckCircle size={14} className="text-green-600" />;
        case 'Cancelled': return <AlertCircle size={14} className="text-red-600" />;
        // case 'Awaiting Payment': return <AlertCircle size={14} className="text-orange-600" />;
        default: return null;
    }
};


// OrderCard component updated
const OrderCard = ({ order, onDeleteOrder, deletingOrderId }) => {
    const canDelete = order.status === 'Pending'; // Example: Only allow deletion for "Pending" orders

    return (
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                        {order.items && order.items.length > 0 ? order.items[0].serviceName : 'Order Details'}
                        {order.items && order.items.length > 1 && ` + ${order.items.length - 1} more`}
                    </CardTitle>
                    <div className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusChipStyles(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                    </div>
                </div>
                <CardDescription className="text-xs">
                    Order ID: <span className="font-medium text-slate-700">{order.orderIdString}</span>
                    {order.tailorName && ` • By: ${order.tailorName}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center">
                        <CalendarDays size={14} className="mr-2 text-slate-500 flex-shrink-0" />
                        <div>
                            <span className="text-slate-600">Ordered:</span>
                            <span className="font-medium ml-1 text-slate-800">{new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {order.status !== 'Completed' && order.status !== 'Cancelled' && order.estimatedDeliveryDate && (
                            <>
                                <Clock size={14} className="mr-2 text-slate-500 flex-shrink-0" />
                                <div>
                                    <span className="text-slate-600">Est. Delivery:</span>
                                    <span className="font-medium ml-1 text-slate-800">{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </>
                        )}
                        {order.status === 'Completed' && order.actualDeliveryDate && (
                            <>
                                <CircleCheck size={14} className="mr-2 text-green-600 flex-shrink-0" />
                                <div>
                                    <span className="text-slate-600">Completed:</span>
                                    <span className="font-medium ml-1 text-slate-800">{new Date(order.actualDeliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </>
                        )}
                        {order.status === 'Cancelled' && (
                            <>
                                <AlertCircle size={14} className="mr-2 text-red-600 flex-shrink-0" />
                                <div>
                                    <span className="text-slate-600">Cancelled</span>
                                    {/* Optionally show cancellation date if available */}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <CircleDollarSign size={14} className="mr-2 text-slate-500 flex-shrink-0" />
                    <div>
                        <span className="text-slate-600">Total:</span>
                        <span className="font-semibold ml-1 text-slate-800">PKR {order.totalAmount ? order.totalAmount.toLocaleString() : 'N/A'}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50 py-3 px-5">
                <div className="flex justify-end items-center w-full"> {/* Changed to justify-end */}
                    {canDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteOrder(order._id)}
                            disabled={deletingOrderId === order._id}
                        >
                            {deletingOrderId === order._id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            ) : (
                                <Trash2 size={14} className="mr-1.5" />
                            )}
                            {deletingOrderId === order._id ? 'Deleting...' : 'Delete Order'}
                        </Button>
                    )}
                    {!canDelete && order.status !== 'Pending' && (
                        <p className="text-xs text-slate-500 italic">
                            This order cannot be deleted as it's {order.status.toLowerCase()}.
                        </p>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};


const Orders = () => {
    const { authToken, user, authLoading, logout } = useAuth(); // Get user and authLoading
    const navigate = useNavigate(); // For redirection

    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'past'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(''); // For errors on actions like delete
    const [actionSuccess, setActionSuccess] = useState('');
    const [deletingOrderId, setDeletingOrderId] = useState(null); // To show loader on specific delete button


    const fetchOrders = useCallback(async () => {
        if (!authToken || !user?.userId) { // Check for user and userId as well
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        setActionError('');
        setActionSuccess('');
        try {
            const response = await fetch('/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) {
                if (response.status === 401) { logout(); navigate('/login'); return; }
                const errData = await response.json().catch(() => ({ message: "Failed to fetch orders" }));
                throw new Error(errData.message || `Error: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data || []);
        } catch (err) {
            setError(err.message);
            setOrders([]);
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    }, [authToken, user, logout, navigate]); // Added user to dependency array

    useEffect(() => {
        if (!authLoading && user) { // Fetch only when auth is resolved and user is present
            fetchOrders();
        } else if (!authLoading && !user && !authToken) { // Auth resolved, but no user/token
            setLoading(false); // Stop loading
            // Optionally navigate to login if this page should always be protected
            // navigate('/login');
        }
    }, [authLoading, user, authToken, fetchOrders]); // Added authToken

    const handleDeleteOrder = async (orderId) => {
        if (!authToken) {
            setActionError("Authentication error. Please log in again.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this order? This action might not be reversible.")) {
            return;
        }
        setDeletingOrderId(orderId);
        setActionError('');
        setActionSuccess('');
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "Failed to delete order" }));
                throw new Error(errData.message);
            }
            setActionSuccess("Order deleted successfully.");
            setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId)); // Optimistic update
        } catch (err) {
            console.error("Error deleting order:", err);
            setActionError(`Failed to delete order: ${err.message}`);
        } finally {
            setDeletingOrderId(null);
        }
    };


    const filteredOrders = useMemo(() => { // useMemo for filteredOrders
        return orders.filter(order => {
            if (filterStatus === 'all') return true;
            // Updated "active" statuses based on your simplified list
            if (filterStatus === 'active') return ['Pending', 'In Progress'].includes(order.status);
            if (filterStatus === 'past') return ['Completed', 'Cancelled'].includes(order.status);
            return true;
        });
    }, [orders, filterStatus]);


    if (authLoading || loading) { // Combined loading state
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="ml-3 text-slate-600 text-lg">
                    {authLoading ? "Initializing..." : "Loading your orders..."}
                </p>
            </div>
        );
    }

    // If auth is loaded, but no authenticated user, prompt to login
    if (!authLoading && (!authToken || !user)) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
                <Package size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-xl font-semibold text-slate-700">View Your Orders</p>
                <p className="text-slate-500 mt-1 mb-4">Please log in to see your order history.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
        );
    }

    if (error) { /* ... error display ... */ }


    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-800">Your Orders</h1>
                    <div className="flex space-x-2">
                        <Button
                            variant={filterStatus === 'all' ? 'default' : 'outline'}
                            size="sm" onClick={() => setFilterStatus('all')}
                        >All</Button>
                        <Button
                            variant={filterStatus === 'active' ? 'default' : 'outline'}
                            size="sm" onClick={() => setFilterStatus('active')}
                        >Active</Button>
                        <Button
                            variant={filterStatus === 'past' ? 'default' : 'outline'}
                            size="sm" onClick={() => setFilterStatus('past')}
                        >Past</Button>
                    </div>
                </header>

                {actionError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center">
                        <AlertTriangle size={18} className="mr-2" /> {actionError}
                    </div>
                )}
                {actionSuccess && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                        {actionSuccess}
                    </div>
                )}


                {filteredOrders.length === 0 && !loading ? ( // Ensure not loading before showing "no orders"
                    <Card className="text-center py-12">
                        <CardContent>
                            <Package size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-xl font-semibold text-slate-700">No Orders Found</p>
                            <p className="text-slate-500 mt-1">
                                {filterStatus === 'all' ? "You haven't placed any orders yet." : `You have no ${filterStatus} orders.`}
                            </p>
                            {filterStatus !== 'all' && (
                                <Button variant="link" onClick={() => setFilterStatus('all')} className="mt-2">
                                    View All Orders
                                </Button>
                            )}
                            {filterStatus === 'all' && (
                                <Button asChild className="mt-4">
                                    <Link to="/customer/listing">Browse Services</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onDeleteOrder={handleDeleteOrder}
                                deletingOrderId={deletingOrderId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
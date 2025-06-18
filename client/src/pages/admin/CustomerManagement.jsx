// /pages/admin/CustomerManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle, Users } from 'lucide-react'; // Removed Pencil
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async () => {
    if (!authToken || !user || user.userType !== 'admin') {
      setError("Admin authentication required or user is not an admin.");
      setPageLoading(false);
      if (!authLoading && (!authToken || !user)) logout();
      return;
    }
    setPageLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/users?userType=customer`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) {
        let errorPayload = { message: `Error fetching customers: ${response.status}` };
        if (response.status === 401 || response.status === 403) {
          logout(); navigate('/login');
          errorPayload.message = "Authentication failed or access denied.";
        } else {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorPayload = await response.json().catch(() => errorPayload);
          } else {
            const textError = await response.text();
            errorPayload.message = `Server error. (Status: ${response.status})`;
            console.error("CustomerManagement: Received non-JSON error response:", textError.substring(0, 200));
          }
        }
        throw new Error(errorPayload.message);
      }
      const data = await response.json();
      setCustomers(data || []); // Ensure it's data.users from backend
    } catch (err) {
      console.error("Error fetching customers (catch block):", err);
      setError(err.message);
      setCustomers([]);
    } finally {
      setPageLoading(false);
    }
  }, [authToken, user, authLoading, logout, navigate]); // Added authLoading

  useEffect(() => {
    if (!authLoading) { // Fetch only when auth context is resolved
      fetchCustomers();
    }
  }, [authLoading, fetchCustomers]);

  // handleEdit function is removed
  // const handleEdit = (customerId) => { ... };

  const handleDelete = async (customerId, customerName) => {
    if (!authToken) { alert("Admin authentication required."); return; }
    if (window.confirm(`Are you sure you want to delete customer: ${customerName} (ID: ${customerId})? This action is permanent.`)) {
      try {
        const response = await fetch(`/api/admin/users/${customerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "Failed to delete customer" }));
          throw new Error(errData.message);
        }
        alert('Customer deleted successfully.');
        setCustomers(prev => prev.filter(c => c._id !== customerId));
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert(`Error deleting customer: ${err.message}`);
      }
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="ml-3 text-slate-600">
          {authLoading ? "Initializing session..." : "Loading Customers..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 p-6 bg-[#f9fafb]">
        <AlertTriangle size={40} className="mb-3" />
        <p className="text-lg font-semibold">Failed to load customer data</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={fetchCustomers} variant="outline">Retry</Button>
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-600 p-6 bg-[#f9fafb]">
        <Users size={40} className="mb-3" />
        <p className="text-lg">Access Denied. Please log in as an Administrator.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Admin Login</Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Users className="mr-3 text-indigo-600 h-7 w-7" />Manage Customers ({customers.length})
        </h1>
        {/* Optionally, an "Add Customer" button if admin can create customers */}
        {/* <Button size="sm"><PlusCircle size={16} className="mr-2"/> Add Customer</Button> */}
      </header>
      {/* TODO: Add search input and other filters if needed */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-4 py-3 font-semibold text-slate-700">Name</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-slate-700">Email</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-slate-700">Phone</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-slate-700">City</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-slate-700 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && !pageLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500 italic">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id} className="border-t border-slate-100 hover:bg-slate-50/50 text-sm">
                  <TableCell className="px-4 py-3 font-medium text-slate-700">{customer.fullName}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{customer.email}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{customer.phoneNumber}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{customer.city}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-center"> {/* Removed gap-3 as only one button */}
                      {/* Edit Button Removed */}
                      {/* <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-800 h-8 w-8" onClick={() => handleEdit(customer._id)}>
                        <Pencil size={16} />
                      </Button> */}
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8" onClick={() => handleDelete(customer._id, customer.fullName)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* TODO: Implement pagination controls if your API supports it */}
    </div>
  );
};

export default CustomerManagement;
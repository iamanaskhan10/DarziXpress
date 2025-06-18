// /pages/admin/TailorManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle, UserCheck } from 'lucide-react'; // Removed Pencil
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'; // Import if needed for redirects
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const TailorManagement = () => {
  const [tailors, setTailors] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken, user, authLoading, logout } = useAuth(); // Get user and authLoading
  const navigate = useNavigate(); // For potential redirects

  const fetchTailors = useCallback(async () => {
    if (!authToken || !user || user.userType !== 'admin') {
      setError("Admin authentication required or user is not an admin.");
      setPageLoading(false);
      if (!authLoading && (!authToken || !user)) logout();
      return;
    }
    setPageLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/users?userType=tailor`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) {
        let errorPayload = { message: `Error fetching tailors: ${response.status}` };
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
            console.error("TailorManagement: Received non-JSON error response:", textError.substring(0, 200));
          }
        }
        throw new Error(errorPayload.message);
      }
      const data = await response.json();
      setTailors(data || []); // Expects { users: [...] }
    } catch (err) {
      console.error("Error fetching tailors:", err);
      setError(err.message);
      setTailors([]);
    } finally {
      setPageLoading(false);
    }
  }, [authToken, user, authLoading, logout, navigate]); // Added authLoading

  useEffect(() => {
    if (!authLoading) { // Fetch only when auth context is resolved
      fetchTailors();
    }
  }, [authLoading, fetchTailors]); // fetchTailors is a dependency

  // handleEdit function is removed
  // const handleEdit = (tailorId) => { ... };

  const handleDelete = async (tailorId, tailorName) => {
    if (!authToken) { alert("Admin authentication required."); return; }
    if (window.confirm(`Are you sure you want to delete tailor: ${tailorName} (ID: ${tailorId})? This action is permanent.`)) {
      try {
        const response = await fetch(`/api/admin/users/${tailorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "Failed to delete tailor" }));
          throw new Error(errData.message);
        }
        alert('Tailor deleted successfully.');
        setTailors(prev => prev.filter(t => t._id !== tailorId));
      } catch (err) {
        console.error("Error deleting tailor:", err);
        alert(`Error deleting tailor: ${err.message}`);
      }
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="ml-3 text-slate-600">
          {authLoading ? "Initializing session..." : "Loading Tailors..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 p-6 bg-[#f9fafb]">
        <AlertTriangle size={40} className="mb-3" />
        <p className="text-lg font-semibold">Failed to load tailor data</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={fetchTailors} variant="outline">Retry</Button>
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-600 p-6 bg-[#f9fafb]">
        <UserCheck size={40} className="mb-3" />
        <p className="text-lg">Access Denied. Please log in as an Administrator.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Admin Login</Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <UserCheck className="mr-3 text-indigo-600 h-7 w-7" />Manage Tailors ({tailors.length})
        </h1>
        {/* Optionally, an "Add Tailor" button if admin can create tailors directly */}
      </header>
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
            {tailors.length === 0 && !pageLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500 italic">
                  No tailors found.
                </TableCell>
              </TableRow>
            ) : (
              tailors.map((tailor) => (
                <TableRow key={tailor._id} className="border-t border-slate-100 hover:bg-slate-50/50 text-sm">
                  <TableCell className="px-4 py-3 font-medium text-slate-700">{tailor.fullName}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{tailor.email}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{tailor.phoneNumber}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600">{tailor.city}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-center"> {/* Removed gap-3 */}
                      {/* Edit Button Removed */}
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8" onClick={() => handleDelete(tailor._id, tailor.fullName)}>
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
      {/* TODO: Implement pagination controls */}
    </div>
  );
};

export default TailorManagement;
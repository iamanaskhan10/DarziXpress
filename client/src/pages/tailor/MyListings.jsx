// /pages/tailor/MyServicesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit3, Trash2, Eye, ListChecks, ImageIcon, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

// ServiceCardTailorView component - REMOVED onToggleActive
const ServiceCardTailorView = ({ service, onEdit, onDelete }) => (
  <Card className="flex flex-col h-full group">
    <div className="relative overflow-hidden rounded-t-lg">
      <img
        src={service.images && service.images.length > 0 ? service.images[0].replace("unsplash.com/photos", "unsplash.com/photo") : '/images/default-service-image.jpg'}
        alt={service.serviceName}
        className="w-full h-40 object-fill transition-transform duration-300 group-hover:scale-105 rounded-t-lg" // Tailwind for image styling
        onError={(e) => e.target.src = '/images/alternateImg.jpg'}
      />

      {!service.isActive && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-white font-semibold px-3 py-1 bg-slate-700/90 rounded text-xs tracking-wider">INACTIVE</span>
        </div>
      )}
    </div>
    <CardHeader className="pb-2 pt-3">
      <CardTitle className="text-md leading-tight line-clamp-2 h-[2.25em] group-hover:text-indigo-600 transition-colors">{service.serviceName}</CardTitle>
      <CardDescription className="text-xs line-clamp-1">Category: {service.category}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow space-y-1 pb-2 text-sm">
      <p><span className="font-medium">Price:</span> PKR {service.price.toLocaleString()} ({service.priceType})</p>
      <p><span className="font-medium">Location:</span> {service.location}</p>
      {service.estimatedDuration && <p><span className="font-medium">Duration:</span> {service.estimatedDuration}</p>}
    </CardContent>
    <CardFooter className="grid grid-cols-2 gap-2 pt-3"> {/* Changed to 2 cols */}
      <Button variant="outline" size="sm" onClick={() => onEdit(service._id)} className="w-full">
        <Edit3 size={14} className="mr-1.5" /> Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(service._id)} className="w-full">
        <Trash2 size={14} className="mr-1.5" /> Delete
      </Button>
    </CardFooter>
  </Card>
);


const MyListings = () => {
  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState(''); // For errors during delete/edit actions
  const [actionSuccess, setActionSuccess] = useState(''); // For success messages


  const fetchMyServices = useCallback(async () => {
    if (!authToken || !user?.userId || user.userType !== 'tailor') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setActionError('');
    setActionSuccess('');
    try {
      const response = await fetch(`/api/services?tailorId=${user.userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        if (response.status === 401) { logout(); navigate('/login'); return; }
        const errData = await response.json().catch(() => ({ message: "Failed to fetch your services" }));
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching my services:', err);
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, user, logout, navigate]);

  useEffect(() => {
    if (!authLoading) {
      fetchMyServices();
    }
  }, [authLoading, fetchMyServices]);

  const handleEditService = (serviceId) => {
    navigate(`/tailor/edit-service/${serviceId}`); // Navigate to your edit service page
  };

  const handleDeleteService = async (serviceId) => {
    if (!authToken) {
      setActionError("Authentication error.");
      return;
    }
    if (window.confirm("Are you sure you want to permanently delete this service listing? This action cannot be undone.")) {
      setActionError('');
      setActionSuccess('');
      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "Failed to delete service." }));
          throw new Error(errData.message);
        }
        setActionSuccess('Service deleted successfully.');
        fetchMyServices(); // Refresh list
      } catch (err) {
        console.error('Error deleting service:', err);
        setActionError(`Failed to delete service: ${err.message}`);
      }
    }
  };

  // Removed handleToggleActive

  if (authLoading) { /* ... loading UI ... */ }
  if (!user || user.userType !== 'tailor') { /* ... access denied UI ... */ }
  // Conditional Rendering for Loading, Error, No Services, and Service List
  let content;
  if (loading) {
    content = (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  } else if (error) {
    content = (
      <Card className="text-center py-10 bg-red-50 border-red-200">
        <CardContent>
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-xl font-semibold text-red-700">Error Loading Services</p>
          <p className="text-red-600 mt-1 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchMyServices} className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  } else if (services.length === 0) {
    content = (
      <Card className="text-center py-20">
        <CardContent>
          <ImageIcon size={60} className="mx-auto text-slate-400 mb-6" />
          <p className="text-xl font-semibold text-slate-700">You haven't posted any services yet.</p>
          <p className="text-slate-500 mt-2 mb-6">
            Click the button below to list your first tailoring service and reach new customers!
          </p>
          <Link to="/tailor/post-service">
            <Button size="lg">
              <PlusCircle size={20} className="mr-2" /> Post Your First Service
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <ServiceCardTailorView
            key={service._id}
            service={service}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        ))}
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center">
              <ListChecks size={30} className="mr-3 text-indigo-600" /> My Posted Services
            </h1>
            <p className="text-md text-slate-600 mt-1">
              Manage all your service listings ({services.length} total).
            </p>
          </div>
          <Link to="/tailor/post-service">
            <Button>
              <PlusCircle size={18} className="mr-2" /> Post New Service
            </Button>
          </Link>
        </header>

        {/* Action messages */}
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

        {/* Removed the filter Card */}
        {content}
      </div>
    </div>
  );
};

export default MyListings;
// /pages/tailor/PostServiceForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select as SimplifiedSelect } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, UploadCloud, Save, Loader2, AlertCircle, X, CheckSquare, Square, Edit3, ArrowLeft } from 'lucide-react'; // Added ArrowLeft

const serviceCategories = [
  "Men's Formal", "Men's Casual", "Men's Ethnic",
  "Women's Formal", "Women's Casual", "Women's Ethnic", "Women's Bridal",
  "Kids Wear", "Alterations", "Custom Design", "Uniforms", "Other"
];
const priceTypes = ["Fixed", "Starting at", "Per Hour", "Per Piece"];

const PostServiceForm = () => {
  const { serviceId } = useParams(); // Get serviceId from URL if present
  const isEditMode = Boolean(serviceId);

  const { authToken, user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceName: '', description: '', category: '', price: '',
    priceType: 'Fixed', estimatedDuration: '', location: '',
    images: [''], tags: '', isActive: true,
  });
  // No imagePreviews state needed anymore
  const [pageLoading, setPageLoading] = useState(isEditMode); // True if editing, to load initial data
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServiceDataForEdit = useCallback(async () => {
    if (!isEditMode || !authToken || !user?.userId || !serviceId) {
      setPageLoading(false); // Ensure loading stops if conditions aren't met
      if (isEditMode && !serviceId) setError("Service ID is missing for editing.");
      return;
    }
    console.log("Edit Mode: Fetching service data for ID:", serviceId);
    setPageLoading(true); setError('');
    try {
      const response = await fetch(`/api/services/${serviceId}`); // Public GET is fine
      if (!response.ok) {
        if (response.status === 404) throw new Error("Service not found or does not exist.");
        const errData = await response.json().catch(() => ({ message: "Failed to fetch service details." }));
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      // Security check: Ensure fetched service belongs to the logged-in tailor
      if (data.tailor._id !== user.userId && data.tailor !== user.userId) {
        throw new Error("You are not authorized to edit this service.");
      }
      setFormData({
        serviceName: data.serviceName || '',
        description: data.description || '',
        category: data.category || '',
        price: data.price?.toString() || '',
        priceType: data.priceType || 'Fixed',
        estimatedDuration: data.estimatedDuration || '',
        location: data.location || '',
        images: data.images && data.images.length > 0 ? [...data.images] : [''],
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (err) {
      console.error('Error fetching service for edit:', err);
      setError(err.message);
      // If fetching fails in edit mode, user might not be able to proceed
    } finally {
      setPageLoading(false);
    }
  }, [isEditMode, serviceId, authToken, user?.userId]); // Removed navigate, logout as they are not direct deps for fetch

  useEffect(() => {
    if (authLoading) return; // Wait for auth context to settle

    if (isEditMode) {
      if (user && authToken) { // Ensure user and token are available
        fetchServiceDataForEdit();
      } else if (!authToken && !authLoading) { // If auth is done loading and still no token
        navigate('/login'); // Redirect if not authenticated
      }
    } else { // Create mode
      setPageLoading(false); // Not loading existing data for create mode
      setFormData(prev => ({
        ...prev, // Keep any partial input if user navigates away and back
        serviceName: prev.serviceName || '',
        description: prev.description || '',
        category: prev.category || '',
        price: prev.price || '',
        priceType: prev.priceType || 'Fixed',
        estimatedDuration: prev.estimatedDuration || '',
        location: prev.location || user?.city || '', // Prefill from user or keep
        images: prev.images?.length > 0 && prev.images[0] !== '' ? prev.images : [''],
        tags: prev.tags || '',
        isActive: prev.isActive !== undefined ? prev.isActive : true,
      }));
    }
  }, [isEditMode, fetchServiceDataForEdit, user, authLoading, authToken, navigate]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageURLChange = (index, value) => {
    const newImageURLs = [...formData.images];
    newImageURLs[index] = value;
    setFormData(prev => ({ ...prev, images: newImageURLs }));
  };

  const addImageURLField = () => {
    if (formData.images.length < 3) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  const removeImageURLField = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else if (formData.images.length === 1) {
      setFormData(prev => ({ ...prev, images: [''] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken || user?.userType !== 'tailor') {
      setError("Authentication required. Please log in as a tailor.");
      return;
    }
    setFormSubmitting(true); setError(''); setSuccess('');

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const validImageURLs = formData.images.filter(url => url && url.trim());

    const servicePayload = {
      serviceName: formData.serviceName,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      priceType: formData.priceType,
      estimatedDuration: formData.estimatedDuration.trim() || undefined, // Send undefined if empty
      location: formData.location,
      images: validImageURLs,
      tags: tagsArray,
      isActive: formData.isActive,
    };

    const url = isEditMode ? `/api/services/${serviceId}` : '/api/services';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(servicePayload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'post'} service.`);
      }
      setSuccess(isEditMode ? 'Service updated successfully!' : 'Service posted successfully! Redirecting...');
      if (!isEditMode) {
        // Reset form only for create mode
        setFormData({
          serviceName: '', description: '', category: '', price: '', priceType: 'Fixed',
          estimatedDuration: '', location: user?.city || '', images: [''], tags: '', isActive: true,
        });
        setTimeout(() => navigate('/tailor/listings'), 1500);
      } else {
        // For edit mode, can optionally refetch or update formData with result
        setFormData(prev => ({ // Merge with existing form data to preserve unsaved changes if any, or use result directly
          ...prev,
          ...result, // Assuming result is the updated service object
          price: result.price?.toString(),
          tags: Array.isArray(result.tags) ? result.tags.join(', ') : '',
          images: result.images && result.images.length > 0 ? [...result.images] : [''],
        }));
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'posting'} service:`, err);
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Initial loading for the whole page (auth check, or fetching data for edit)
  if (authLoading || (isEditMode && pageLoading)) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /> <p className="ml-3">Loading...</p></div>;
  }
  // If auth is loaded, but user is not a tailor or not logged in
  if (!user || user.userType !== 'tailor') {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p>Access Denied. <Link to="/login" className="text-indigo-600 hover:underline">Login as Tailor</Link></p></div>;
  }
  // If in edit mode and an error occurred fetching initial data (and form is not already populated)
  if (isEditMode && error && !formData.serviceName && !formSubmitting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700">Error Loading Service for Editing</h2>
        <p className="text-red-600 mt-1 mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate('/tailor/listings')}>Back to My Services</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {isEditMode && (
          <Button variant="outline" size="sm" onClick={() => navigate('/tailor/listings')} className="mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back to My Services
          </Button>
        )}
        <Card>
          <CardHeader className="text-center">
            {isEditMode ? <Edit3 size={40} className="mx-auto text-indigo-600 mb-2" /> : <PlusCircle size={40} className="mx-auto text-indigo-600 mb-2" />}
            <CardTitle className="text-2xl sm:text-3xl">{isEditMode ? 'Edit Service Listing' : 'Post a New Service'}</CardTitle>
            <CardDescription>
              {isEditMode ? `Update details for "${formData.serviceName || 'your service'}"` : 'Provide details about the tailoring service you offer.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && !success && ( // Show general error if no success message
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center">
                <AlertTriangle size={18} className="mr-2" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="psf-serviceName">Service Name *</Label>
                <Input id="psf-serviceName" name="serviceName" value={formData.serviceName} onChange={handleInputChange} required disabled={formSubmitting} />
              </div>
              <div>
                <Label htmlFor="psf-description">Description *</Label>
                <Textarea id="psf-description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required disabled={formSubmitting} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="psf-category">Category *</Label>
                  <SimplifiedSelect id="psf-category" name="category" value={formData.category} onChange={handleInputChange} required disabled={formSubmitting}>
                    <option value="" disabled>Select a category</option>
                    {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </SimplifiedSelect>
                </div>
                <div>
                  <Label htmlFor="psf-price">Price (PKR) *</Label>
                  <Input id="psf-price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required disabled={formSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="psf-priceType">Price Type</Label>
                  <SimplifiedSelect id="psf-priceType" name="priceType" value={formData.priceType} onChange={handleInputChange} disabled={formSubmitting}>
                    {priceTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </SimplifiedSelect>
                </div>
                <div>
                  <Label htmlFor="psf-estimatedDuration">Estimated Duration</Label>
                  <Input id="psf-estimatedDuration" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleInputChange} placeholder="e.g., 3-5 days" disabled={formSubmitting} />
                </div>
              </div>
              <div>
                <Label htmlFor="psf-location">Service Location *</Label>
                <Input id="psf-location" name="location" value={formData.location} onChange={handleInputChange} required disabled={formSubmitting} />
              </div>

              {/* isActive Toggle - always show, but might be more relevant in edit mode */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="psf-isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-indigo-500" // Adjusted focus
                  disabled={formSubmitting}
                />
                <Label htmlFor="psf-isActive" className="mb-0 select-none cursor-pointer">Make this service listing active</Label>
                {formData.isActive ? <CheckSquare size={18} className="text-green-500" /> : <Square size={18} className="text-slate-400" />}
              </div>

              <div>
                <Label>Service Images (up to 3 URLs, optional)</Label>
                {formData.images.map((imgUrl, index) => (
                  <div key={index} className="flex items-center gap-2 mt-1.5">
                    <Input type="url" value={imgUrl || ''} onChange={(e) => handleImageURLChange(index, e.target.value)} placeholder={`Image URL ${index + 1}`} disabled={formSubmitting} />
                    {(formData.images.length > 1 || (formData.images.length === 1 && (imgUrl || '').trim() !== '')) && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImageURLField(index)} disabled={formSubmitting} className="text-red-500 hover:text-red-700"> <X size={18} /> </Button>
                    )}
                  </div>
                ))}
                {formData.images.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addImageURLField} className="mt-2" disabled={formSubmitting}> <PlusCircle size={16} className="mr-2" /> Add Image URL </Button>
                )}
                <p className="text-xs text-slate-500 mt-1">Provide direct links to your images (e.g., hosted on Imgur, Cloudinary, etc.).</p>
              </div>
              <div>
                <Label htmlFor="psf-tags">Tags (comma-separated, optional)</Label>
                <Input id="psf-tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., suit, formal, wedding" disabled={formSubmitting} />
                <p className="text-xs text-slate-500 mt-1">Helps customers find your service.</p>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" size="lg" disabled={formSubmitting}>
                  {formSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isEditMode ? <Save size={18} className="mr-2" /> : <UploadCloud size={18} className="mr-2" />)}
                  {formSubmitting ? (isEditMode ? 'Saving Changes...' : 'Posting Service...') : (isEditMode ? 'Save Changes' : 'Post Service')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostServiceForm;
// /pages/customer/ServiceDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select as SimplifiedSelect } from '@/components/ui/select'; // Using simplified for now
import {
    Loader2, AlertTriangle, ShoppingCart, Ruler, MapPin, Star, Info, MessageSquare, ArrowLeft, User // Added ArrowLeft and User
} from 'lucide-react'; // <--- ADD ArrowLeft HERE

const ServiceDetailPage = () => {
    const { serviceId } = useParams();
    const { authToken, user, authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [measurementProfiles, setMeasurementProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [notesToTailor, setNotesToTailor] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        address: '', city: '', postalCode: '', country: 'Pakistan' // Default country
    });

    const [pageLoading, setPageLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch Service Details
    const fetchService = useCallback(async () => {
        if (!serviceId) {
            setError("Service ID is missing.");
            setPageLoading(false);
            return;
        }
        try {
            const response = await fetch(`/api/services/${serviceId}`); // Public endpoint
            if (!response.ok) {
                if (response.status === 404) throw new Error("Service not found.");
                const errData = await response.json().catch(() => ({ message: "Failed to fetch service details" }));
                throw new Error(errData.message || `Error: ${response.status}`);
            }
            const data = await response.json();
            setService(data);
        } catch (err) {
            console.error('Error fetching service details:', err);
            setError(err.message);
        }
    }, [serviceId]);

    // Fetch Customer's Measurement Profiles and User's address for prefill
    const fetchCustomerData = useCallback(async () => {
        if (!authToken || !user?.userId) return;
        try {
            // Fetch measurements
            const measResponse = await fetch('/api/measurements', {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (measResponse.ok) {
                const measData = await measResponse.json();
                setMeasurementProfiles(measData || []);
                if (measData && measData.length > 0) {
                    setSelectedProfileId(measData[0]._id); // Pre-select first profile
                }
            } else {
                console.error("Failed to fetch measurement profiles");
            }

            // Fetch user profile for address prefill
            const userProfileResponse = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (userProfileResponse.ok) {
                const userData = await userProfileResponse.json();
                setShippingAddress(prev => ({
                    ...prev,
                    address: userData.address || '',
                    city: userData.city || '',
                    // postalCode: userData.postalCode || '' // if you have postal code in user profile
                }));
            }

        } catch (err) {
            console.error('Error fetching customer data:', err);
            // Non-critical for page load, can still proceed
        }
    }, [authToken, user?.userId]);

    useEffect(() => {
        if (authLoading) return; // Wait for auth context

        const loadData = async () => {
            setPageLoading(true);
            await fetchService(); // Fetch service first
            if (authToken && user?.userId) { // Then customer data if logged in
                await fetchCustomerData();
            }
            setPageLoading(false);
        };
        loadData();
    }, [authLoading, authToken, user?.userId, fetchService, fetchCustomerData]);


    const handleShippingChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        console.log("handlePlaceOrder: Initiated.");

        if (!authToken || !user?.userId) {
            setFormError("Please log in to place an order.");
            navigate('/login', { state: { from: location.pathname } }); // `location` needs to be from `useLocation()`
            return;
        }
        // Use selectedProfileId (the state variable) for the check
        if (!selectedProfileId) {
            setFormError("Please select a measurement profile.");
            return;
        }
        if (!shippingAddress.address.trim() || !shippingAddress.city.trim()) {
            setFormError("Please provide a complete shipping address.");
            return;
        }
        if (!service || !service._id || !service.tailor || !service.price) {
            setFormError("Service details are missing or invalid. Cannot place order.");
            console.error("handlePlaceOrder: Service object is incomplete:", service);
            return;
        }

        setFormSubmitting(true);
        setFormError('');
        setSuccessMessage('');
        console.log("handlePlaceOrder: formSubmitting set to true.");

        const tailorObjectId = typeof service.tailor === 'object' ? service.tailor._id : service.tailor;
        if (!tailorObjectId) {
            setFormError("Tailor information is missing from the service details.");
            console.error("handlePlaceOrder: Tailor ID missing from service.tailor:", service.tailor);
            setFormSubmitting(false);
            return;
        }

        const orderPayload = {
            tailorId: tailorObjectId,
            tailorName: service.tailorName || service.tailor?.fullName,
            serviceId: service._id,
            serviceName: service.serviceName,
            servicePrice: service.price,
            quantity: 1,
            shippingAddress,
            notesToTailor,
            // ---- CORRECTED LINE ----
            selectedMeasurementProfileId: selectedProfileId, // Use the state variable 'selectedProfileId'
        };
        console.log("handlePlaceOrder: Order payload:", JSON.stringify(orderPayload, null, 2));

        try {
            console.log("handlePlaceOrder: Attempting to POST to /api/orders");
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(orderPayload),
            });
            console.log("handlePlaceOrder: Response received, status:", response.status);

            const responseText = await response.text();
            console.log("handlePlaceOrder: Response text:", responseText.substring(0, 200));

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error("handlePlaceOrder: Failed to parse response as JSON.", parseError);
                console.error("handlePlaceOrder: Response was not JSON, actual text:", responseText);
                throw new Error(`Server returned non-JSON response (Status: ${response.status}). Check console for response text.`);
            }

            console.log("handlePlaceOrder: Parsed result:", result);

            if (!response.ok) {
                console.error("handlePlaceOrder: Order placement failed. Result:", result);
                throw new Error(result.message || 'Failed to place order.');
            }

            setSuccessMessage(`Order placed successfully! Your Order ID: ${result.orderIdString}. Redirecting...`);
            console.log("handlePlaceOrder: Order placed successfully.");
            setTimeout(() => {
                navigate('/customer/orders');
            }, 3000);
        } catch (err) {
            console.error('handlePlaceOrder: Catch block error:', err);
            setFormError(err.message || "An unexpected error occurred.");
        } finally {
            console.log("handlePlaceOrder: finally block, setting formSubmitting to false.");
            setFormSubmitting(false);
        }
    };


    if (pageLoading) {
        return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /><p className="ml-3">Loading service...</p></div>;
    }
    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-700">Error</h2>
                <p className="text-red-600 mt-1 mb-4">{error}</p>
                <Button variant="outline" onClick={() => navigate('/customer/listing')}>Back to Listings</Button>
            </div>
        );
    }
    if (!service) {
        return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p>Service details not found.</p></div>;
    }

    // Main render
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back {/* Assuming ArrowLeft from lucide */}
                </Button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Service Images & Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-0">
                                <img
                                    src={service.images && service.images.length > 0 && service.images[0].trim() !== '' ? service.images[0] : 'https://via.placeholder.com/600x400/E2E8F0/94A3B8?text=Service+Image'}
                                    alt={service.serviceName}
                                    className="w-full h-auto max-h-[400px] object-cover rounded-t-lg"
                                />
                                {/* TODO: Image gallery if multiple images */}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">{service.serviceName}</CardTitle>
                                <CardDescription>Category: {service.category}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-slate-700 text-sm leading-relaxed">{service.description}</p>
                                <div className="text-sm space-y-1 pt-2 border-t">
                                    <p><strong className="text-slate-600">Price:</strong> <span className="font-semibold text-indigo-700 text-lg">PKR {service.price.toLocaleString()}</span> ({service.priceType})</p>
                                    {service.estimatedDuration && <p><strong className="text-slate-600">Est. Duration:</strong> {service.estimatedDuration}</p>}
                                    <p><strong className="text-slate-600">Location:</strong> {service.location}</p>
                                </div>
                                {service.tags && service.tags.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <strong className="text-slate-600 text-sm block mb-1.5">Tags:</strong>
                                        <div className="flex flex-wrap gap-2">
                                            {service.tags.map(tag => (
                                                <span key={tag} className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center"><User size={18} className="mr-2 text-slate-500" />Tailor Information</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p><strong className="text-slate-600">Name:</strong> {service.tailor?.fullName || service.tailorName}</p>
                                {service.tailor?.city && <p><strong className="text-slate-600">City:</strong> {service.tailor.city}</p>}
                                {service.tailor?.rating && <p className="flex items-center"><strong className="text-slate-600 mr-1">Rating:</strong> <Star size={14} className="fill-amber-400 text-amber-500 mr-0.5" /> {service.tailor.rating.toFixed(1)}</p>}
                                {/* Add link to tailor's public profile if you have one */}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Form */}
                    <div className="sticky top-24 self-start"> {/* Make order form sticky */}
                        <Card className="shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center"><ShoppingCart size={20} className="mr-2 text-indigo-600" />Place Your Order</CardTitle>
                                <CardDescription>Confirm details to order this service.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {successMessage && <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}
                                {formError && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{formError}</p>}

                                {!authToken || !user ? (
                                    <div className="text-center">
                                        <p className="text-slate-600 mb-3">You need to be logged in to place an order.</p>
                                        <Button asChild><Link to="/login" state={{ from: location.pathname }}>Login to Order</Link></Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                                        <div>
                                            <Label htmlFor="measurementProfile">Select Measurement Profile *</Label>
                                            {measurementProfiles.length > 0 ? (
                                                <SimplifiedSelect
                                                    id="measurementProfile"
                                                    value={selectedProfileId}
                                                    onChange={(e) => setSelectedProfileId(e.target.value)}
                                                    required
                                                    disabled={formSubmitting}
                                                    className="h-10"
                                                >
                                                    <option value="" disabled>Choose your measurements</option>
                                                    {measurementProfiles.map(profile => (
                                                        <option key={profile._id} value={profile._id}>
                                                            {profile.name} (Updated: {new Date(profile.lastUpdated).toLocaleDateString()})
                                                        </option>
                                                    ))}
                                                </SimplifiedSelect>
                                            ) : (
                                                <p className="text-sm text-slate-500 mt-1">
                                                    No measurement profiles found.
                                                    <Link to="/customer/measurements" className="text-indigo-600 hover:underline ml-1">Add one now</Link>.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="notesToTailor">Notes for Tailor (Optional)</Label>
                                            <Textarea
                                                id="notesToTailor"
                                                value={notesToTailor}
                                                onChange={(e) => setNotesToTailor(e.target.value)}
                                                placeholder="Any specific instructions or preferences for the tailor..."
                                                rows={3}
                                                disabled={formSubmitting}
                                            />
                                        </div>

                                        <fieldset className="space-y-2 border p-4 rounded-md">
                                            <legend className="text-sm font-medium text-slate-700 px-1">Shipping Address *</legend>
                                            <div>
                                                <Label htmlFor="shippingAddressStreet">Street Address</Label>
                                                <Input id="shippingAddressStreet" name="address" value={shippingAddress.address} onChange={handleShippingChange} required disabled={formSubmitting} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="shippingAddressCity">City</Label>
                                                    <Input id="shippingAddressCity" name="city" value={shippingAddress.city} onChange={handleShippingChange} required disabled={formSubmitting} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="shippingAddressPostal">Postal Code</Label>
                                                    <Input id="shippingAddressPostal" name="postalCode" value={shippingAddress.postalCode} onChange={handleShippingChange} disabled={formSubmitting} />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <Button type="submit" size="lg" className="w-full" disabled={formSubmitting || !selectedProfileId || !shippingAddress.address.trim() || !shippingAddress.city.trim()}>
                                            {formSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart size={18} className="mr-2" />}
                                            {formSubmitting ? 'Placing Order...' : 'Place Order Now'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;
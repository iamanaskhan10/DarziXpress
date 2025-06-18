// /pages/customer/ServiceListingPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Search as SearchIconLucide, MapPin, DollarSign, Star,
    Filter as FilterIconLucide, X, ShoppingBag, Loader2
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// import { useAuth } from '@/context/AuthContext'; // Not strictly needed for public listing, but useful if actions require auth

// ServiceDisplayCard remains largely the same, but ensure props match API response
const ServiceDisplayCard = ({ service }) => (
    <Card className="flex flex-col transition-shadow hover:shadow-xl group">
        <div className="overflow-hidden">
            <img
                src={service.images && service.images.length > 0 ? service.images[0] : 'https://via.placeholder.com/300x200/E2E8F0/94A3B8?text=Service'}
                alt={service.serviceName}
                className="w-full h-40 object-fill transition-transform duration-300 group-hover:scale-105 rounded-t-lg" // Tailwind for image styling
                onError={(e) => e.target.src = '/images/alternateImg.jpg'}
            />
        </div>
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base leading-tight line-clamp-2 h-[2.5em]">{service.serviceName}</CardTitle> {/* Fixed height for title */}
            <CardDescription className="text-xs line-clamp-1">Category: {service.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 pb-3">
            <div className="text-sm">
                <p className="font-semibold text-indigo-700">PKR {service.price.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{service.priceType} {service.estimatedDuration ? `• ${service.estimatedDuration}` : ''}</p>
            </div>
            <div className="border-t border-slate-100 pt-2 text-xs text-slate-600">
                <p>By: <span className="font-medium text-slate-700">{service.tailorName}</span></p>
                <div className="flex items-center text-slate-500">
                    <MapPin size={12} className="mr-1 flex-shrink-0" /> {service.location}
                    {/* Assuming tailor object is populated with rating if you want to show it here */}
                    {service.tailor?.rating && ( // Check if tailor and rating exist
                        <>
                            <span className="mx-1.5">·</span>
                            <Star size={12} className="mr-0.5 fill-amber-400 text-amber-500" /> {service.tailor.rating.toFixed(1)}
                        </>
                    )}
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Link to={`/customer/service-details/${service._id}`} className="w-full"> {/* Use service._id */}
                <Button variant="secondary" className="w-full hover:bg-indigo-100 hover:text-indigo-700">
                    View Service Details
                </Button>
            </Link>
        </CardFooter>
    </Card>
);


const ServiceListingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterOptions, setFilterOptions] = useState({ locations: [], categories: [] });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalServices: 0 });


    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPriceTier, setSelectedPriceTier] = useState(''); // This will translate to min/maxPrice

    // Price tiers for frontend filter UI
    const priceTiers = [
        { value: '', label: 'Any Price' },
        { value: 'low', label: 'Under PKR 5,000', min: 0, max: 4999 },
        { value: 'mid', label: 'PKR 5,000 - PKR 10,000', min: 5000, max: 10000 },
        { value: 'high', label: 'Over PKR 10,000', min: 10001, max: undefined }, // Max undefined for 'over'
    ];

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [searchTerm]);


    // Effect to get initial search term from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const querySearch = params.get('search');
        const queryLocation = params.get('location');
        const queryCategory = params.get('category');
        const queryPrice = params.get('price');

        setSearchTerm(querySearch || '');
        setSelectedLocation(queryLocation || '');
        setSelectedCategory(queryCategory || '');
        setSelectedPriceTier(queryPrice || '');
        // Initial fetch will be triggered by dependency change on these filters
    }, []); // Only on mount to read initial URL params

    // Central data fetching function
    const fetchServices = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedLocation) params.append('location', selectedLocation);
        if (selectedCategory) params.append('category', selectedCategory);

        const tier = priceTiers.find(t => t.value === selectedPriceTier);
        if (tier) {
            if (tier.min !== undefined) params.append('minPrice', tier.min.toString());
            if (tier.max !== undefined) params.append('maxPrice', tier.max.toString());
        }
        params.append('page', page.toString());
        // params.append('limit', '12'); // Or your desired limit

        // Update URL with current filters
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });


        try {
            const response = await fetch(`/api/services?${params.toString()}`); // Using Vite proxy
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "Failed to fetch services" }));
                throw new Error(errData.message || `Error: ${response.status}`);
            }
            const data = await response.json();
            setServices(data.services || []);
            setFilterOptions(data.filters || { locations: [], categories: [] });
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalServices: data.totalServices
            });
        } catch (err) {
            console.error("ServiceListingPage fetch error:", err);
            setError(err.message);
            setServices([]); // Clear services on error
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, selectedLocation, selectedCategory, selectedPriceTier, navigate, location.pathname]); // Add priceTier

    // Fetch services when filters or page change
    useEffect(() => {
        fetchServices(pagination.currentPage);
    }, [fetchServices, pagination.currentPage]); // pagination.currentPage added


    const handleFilterChange = (setter, value) => {
        setter(value === "ALL" || value === "" ? "" : value); // Treat "ALL" or empty as no filter
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedCategory('');
        setSelectedPriceTier('');
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1
        // Fetch will be triggered by state changes in useEffect for fetchServices
    };

    const activeFilterCount = [debouncedSearchTerm, selectedLocation, selectedCategory, selectedPriceTier].filter(Boolean).length;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                        Discover Tailoring Services
                    </h1>
                    <p className="text-slate-600 text-md">
                        Find stitching for "pant coat", "kurta", "lehenga", and more.
                    </p>
                </header>

                <Card className="p-4 sm:p-6 mb-8 sticky top-[calc(4rem+1px)] z-40 bg-white/80 backdrop-blur-sm"> {/* Navbar is h-16 (4rem) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-4">
                            <Label htmlFor="main-search">Search Services</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIconLucide className="w-4 h-4 text-slate-400" />
                                </div>
                                <Input
                                    id="main-search"
                                    type="text"
                                    placeholder="Search by service, tailor, or category..."
                                    value={searchTerm} // Controlled by searchTerm for immediate UI update
                                    onChange={(e) => setSearchTerm(e.target.value)} // Updates searchTerm, which then updates debouncedSearchTerm
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="location-filter">Location</Label>
                            <Select id="location-filter" value={selectedLocation} onChange={(e) => handleFilterChange(setSelectedLocation, e.target.value)}>
                                <option value="">All Locations</option>
                                {filterOptions.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="category-filter">Category</Label>
                            <Select id="category-filter" value={selectedCategory} onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}>
                                <option value="">All Categories</option>
                                {filterOptions.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="price-filter">Price Range</Label>
                            <Select id="price-filter" value={selectedPriceTier} onChange={(e) => handleFilterChange(setSelectedPriceTier, e.target.value)}>
                                {priceTiers.map(tier => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
                            </Select>
                        </div>

                        {activeFilterCount > 0 ? (
                            <Button variant="outline" onClick={clearFilters} className="self-end h-10">
                                <X size={16} className="mr-2" /> Clear ({activeFilterCount})
                            </Button>
                        ) : <div className="h-10 hidden lg:block"></div> /* Placeholder for alignment */}
                    </div>
                </Card>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-12 text-red-600">
                        <p>Error loading services: {error}</p>
                        <Button variant="outline" onClick={() => fetchServices(1)} className="mt-4">Try Again</Button>
                    </div>
                ) : services.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <FilterIconLucide size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-xl font-semibold text-slate-700 mb-2">No Services Found</p>
                        <p className="text-slate-500 mb-4">Try adjusting your search or filters.</p>
                        {activeFilterCount > 0 && <Button onClick={clearFilters}>Clear All Filters</Button>}
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-600 mb-6 text-center sm:text-left">
                            Showing <span className="font-semibold">{services.length}</span> of <span className="font-semibold text-indigo-600">{pagination.totalServices}</span> service(s).
                            Page <span className="font-semibold">{pagination.currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span>.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {services.map((service) => (
                                <ServiceDisplayCard key={service._id} service={service} /> // Use _id
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-10">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-slate-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ServiceListingPage;
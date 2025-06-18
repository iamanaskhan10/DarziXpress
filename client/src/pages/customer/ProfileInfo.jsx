// /pages/customer/ProfileInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { UserCircle, Edit3, Save, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProfileInfoPage = () => {
    const { authToken, user: authUser, logout } = useAuth(); // Get user from auth context for initial check
    const [profile, setProfile] = useState(null); // Start as null
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
        const fetchProfile = async () => {
            if (!authToken || !authUser?.userId) {
                setLoading(false);
                // navigate to login if not authenticated, handled by protected route usually
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:5000/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                if (!response.ok) {
                    if (response.status === 401) logout(); // Handle session expiry
                    const errData = await response.json().catch(() => ({ message: "Failed to fetch profile" }));
                    throw new Error(errData.message || `Error: ${response.status}`);
                }
                const data = await response.json();
                setProfile(data);
                setFormData({ // Initialize form with fetched data
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '', // Ensure address is in schema
                    city: data.city || '',
                });
            } catch (err) {
                console.error("ProfileInfoPage fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authToken, authUser?.userId, logout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditToggle = () => {
        if (isEditing) { // If was editing and "Cancel" is clicked
            setFormData({ // Reset form to the currently displayed profile data
                fullName: profile?.fullName || '',
                email: profile?.email || '',
                phoneNumber: profile?.phoneNumber || '',
                address: profile?.address || '',
                city: profile?.city || '',
            });
            setError('');
            setSuccessMessage('');
        }
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        // Prepare data to send (only send fields that can be updated)
        const updateData = {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            city: formData.city,
        };

        console.log("ProfileInfoPage handleSubmit: authToken before fetch:", authToken);
        if (!authToken) {
            console.error("ProfileInfoPage handleSubmit: No authToken found! Aborting update.");
            setError("Authentication token is missing. Please log in again.");
            setSaving(false);
            return; // Don't even attempt the fetch
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Error: ${response.status}`);
            }

            setProfile(result.user); // Update local profile state with response from server
            setFormData(result.user); // Also update formData to match
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            // Optionally update user in AuthContext if it stores more than userId/userType
            // auth.setUser(prevUser => ({...prevUser, fullName: result.user.fullName, ...}));
        } catch (err) {
            console.error("ProfileInfoPage update error:", err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p className="animate-pulse">Loading profile...</p></div>;
    }

    if (error && !profile) { // Show main error if profile couldn't be loaded at all
        return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-red-500"><p>Error: {error}</p></div>;
    }

    if (!profile) { // Should be caught by loading or error, but as a fallback
        return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p>Could not load profile information.</p></div>;
    }


    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="items-center text-center">
                        <UserCircle size={64} className="mx-auto text-indigo-500 mb-3" />
                        <CardTitle className="text-2xl">{isEditing ? formData.fullName : profile.fullName}</CardTitle>
                        <CardDescription>{isEditing ? formData.email : profile.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {successMessage && <p className="mb-4 text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}
                        {error && isEditing && <p className="mb-4 text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled={saving} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} readOnly disabled className="bg-slate-100 cursor-not-allowed" />
                                    <p className="text-xs text-slate-500 mt-1">Email address cannot be changed here.</p>
                                </div>
                                <div>
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} disabled={saving} />
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., House 123, Street 4, Sector X" disabled={saving} />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" value={formData.city} onChange={handleChange} disabled={saving} />
                                </div>
                                <div className="flex justify-end space-x-3 pt-3">
                                    <Button type="button" variant="outline" onClick={handleEditToggle} disabled={saving}>Cancel</Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <InfoRow label="Full Name" value={profile.fullName} />
                                <InfoRow label="Email Address" value={profile.email} />
                                <InfoRow label="Phone Number" value={profile.phoneNumber || 'Not provided'} />
                                <InfoRow label="Address" value={profile.address || 'Not provided'} />
                                <InfoRow label="City" value={profile.city || 'Not provided'} />
                                <div className="pt-4 text-right">
                                    <Button onClick={handleEditToggle}>
                                        <Edit3 size={16} className="mr-2" /> Edit Profile
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-slate-100 last:border-b-0">
        <dt className="text-sm font-medium text-slate-600 col-span-1">{label}</dt>
        <dd className="text-sm text-slate-800 col-span-2 break-words">{value}</dd>
    </div>
);

export default ProfileInfoPage;
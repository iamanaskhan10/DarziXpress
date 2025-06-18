// /pages/customer/ChangePasswordPage.jsx
import React, { useState } from 'react';
import { Lock, KeyRound, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ChangePasswordPage = () => {
    const { authToken } = useAuth(); // Get token for API call
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            setLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', { // Or your chosen endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Error: ${response.status}`);
            }

            setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // Optionally, you might want to log the user out or re-issue a token if your security policy requires it
            // For now, just show success message.
        } catch (err) {
            console.error("ChangePasswordPage error:", err);
            setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                <Card>
                    <CardHeader className="text-center">
                        <KeyRound size={48} className="mx-auto text-indigo-500 mb-3" />
                        <CardTitle className="text-2xl">Change Your Password</CardTitle>
                        <CardDescription>
                            Choose a strong password and don't reuse it for other accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {message.text && (
                                <p className={`text-sm p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </p>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock size={16} className="mr-2" />}
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
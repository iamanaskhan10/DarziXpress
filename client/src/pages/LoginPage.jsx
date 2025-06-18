// /pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming Button is correctly imported
import loginIllustration from '@/assets/images/login-illustration.svg';
import { useAuth } from '@/context/AuthContext'; // <--- IMPORT useAuth

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // <--- GET THE login METHOD FROM AuthContext
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // For displaying login errors
    const [loading, setLoading] = useState(false); // For loading state on button

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) { // Check for response.ok AND data.token
                console.log("LoginPage: Login successful, token received:", data.token);

                // --- CRUCIAL CHANGE ---
                login(data.token); // Call AuthContext's login method
                // This will handle localStorage AND update context state

                // Navigate based on user type
                if (data.userType === 'customer') {
                    navigate('/customer/dashboard'); // Ensure this route is correct
                } else if (data.userType === 'tailor') {
                    navigate('/tailor/dashboard'); // Ensure this route is correct
                } else if (data.userType === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/'); // Fallback navigation
                }
            } else {
                // If response is not OK, 'data' should contain the error message from backend
                console.error("LoginPage: Login failed. Server response:", data);
                setError(data.message || 'Invalid credentials or server error.');
            }
        } catch (err) {
            console.error('LoginPage: Error during login fetch:', err);
            setError('Server error, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="flex w-full max-w-5xl lg:max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh]">
                <div className="w-full md:w-1/2 lg:w-[45%] p-8 sm:p-12 flex flex-col overflow-y-auto">
                    <div className="mb-8">
                        <h1
                            className="text-3xl font-extrabold text-indigo-600 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            DarziXpress
                        </h1>
                    </div>
                    <div className="text-left mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-md sm:text-lg text-gray-600 mt-2">Login to continue to DarziXpress.</p>
                    </div>
                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div>
                            {/* Using Label component if you have one, otherwise standard label */}
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input // Assuming Input is your simplified or shadcn component
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        )}
                        <div className="flex items-center justify-end text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded-lg py-3 text-base font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <span
                                className="text-indigo-600 cursor-pointer font-medium hover:underline"
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </span>
                        </p>
                    </form>
                </div>
                <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-indigo-50 items-center justify-center p-10 lg:p-16">
                    <img
                        src={loginIllustration}
                        alt="Login Illustration"
                        className="w-full max-w-md lg:max-w-lg object-contain max-h-full"
                    />
                </div>
            </div>
        </div>
    );
}
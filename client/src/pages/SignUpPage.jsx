import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import signupIllustration from '@/assets/images/signup-illustration.svg';
import { HiEye, HiEyeOff } from 'react-icons/hi'; // Add icons for password visibility

// List of famous Pakistani cities
const pakistaniCities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Abbottabad",
    "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Jhang",
    "Mardan", "Gwadar"
];

export default function SignupPage() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [city, setCity] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState(''); // Phone number error state
    const [cityError, setCityError] = useState(''); // City error state
    const [userType, setUserType] = useState('customer');

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError("Passwords don't match!");
            return;
        }

        if (phoneNumber.length !== 11) {
            setPhoneError("Phone number must be 11 digits.");
            return;
        }

        if (!city) {
            setCityError("Please select your city.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    phoneNumber,
                    city,
                    userType,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                navigate('/login');
            } else {
                console.error(data.message);
                alert(data.message);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Server error, please try again later.');
        }
    };


    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        // Check if password and confirm password match
        if (e.target.value !== password) {
            setPasswordError("Passwords don't match!");
        } else {
            setPasswordError('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="flex w-full max-w-5xl lg:max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh]">
                <div className="w-full md:w-1/2 lg:w-[45%] p-8 sm:p-12 flex flex-col overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-indigo-600 cursor-pointer" onClick={() => navigate('/')}>
                            DarziXpress
                        </h1>
                    </div>

                    <div className="text-left mb-10">
                        <h2 className="text-sm sm:text-xl text-gray-800">Let's craft something new</h2>
                        <p className="text-4xl sm:text-3xl font-bold text-black-600 mt-2">Sign Up to DarziXpress</p>
                    </div>

                    <form onSubmit={handleSignup} className="w-full space-y-5">
                        {/* Full Name Field */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Phone Number Field */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="Enter your phone number"
                                required
                            />
                            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>} {/* Show error message */}
                        </div>

                        {/* City Dropdown */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                            <select
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                required
                            >
                                <option value="" disabled>Select your city</option>
                                {pakistaniCities.sort().map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                            {cityError && <p className="text-red-500 text-xs mt-1">{cityError}</p>} {/* Show error message */}
                        </div>
                        <div>
                            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1.5">User Type</label>
                            <select
                                id="userType"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                required
                            >
                                <option value="customer">Customer</option>
                                <option value="tailor">Tailor</option>
                            </select>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {passwordVisible ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`w-full px-4 py-2.5 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {confirmPasswordVisible ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>} {/* Show error message */}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded-lg py-3 text-base font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            Sign Up
                        </Button>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <span
                                className="text-indigo-600 cursor-pointer font-medium hover:underline"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </span>
                        </p>
                    </form>
                </div>

                <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-indigo-50 items-center justify-center p-10 lg:p-16">
                    <img
                        src={signupIllustration}
                        alt="Signup Illustration"
                        className="w-full max-w-md lg:max-w-lg object-contain max-h-full"
                    />
                </div>
            </div>
        </div>
    );
}

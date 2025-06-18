// CustomerNavbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Icons from lucide-react (npm install lucide-react)
import {
    LayoutDashboard,
    Package,
    ListChecks, // Changed from List for better "listings" context
    UserCircle,
    ChevronDown,
    LogOut,
    Settings,
    Ruler // More appropriate for measurements
} from 'lucide-react';

const CustomerNavbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        // Replace with your actual logout logic
        console.log('User logged out');
        setIsDropdownOpen(false);
        navigate('/login'); // Or your app's login route
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/customer/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'My Orders', path: '/customer/orders', icon: <Package size={18} /> },
        { name: 'Tailor Listings', path: '/customer/listing', icon: <ListChecks size={18} /> },
    ];

    const dropdownItems = [
        { name: 'Profile Info', path: '/customer/profile', icon: <UserCircle size={18} /> },
        { name: 'Measurements', path: '/customer/measurements', icon: <Ruler size={18} /> },
        { name: 'Change Password', path: '/customer/changePassword', icon: <Settings size={18} /> },
    ];

    return (
        <nav className="bg-white text-slate-700 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: DarziXpress Logo & Nav Links */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            DarziXpress
                        </Link>
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                >
                                    {item.icon && <span className="mr-2">{item.icon}</span>}
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Section: Profile Icon with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center p-1.5 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            id="user-menu-button"
                        >
                            <UserCircle size={28} className="text-slate-500" />
                            <ChevronDown size={16} className={`ml-1 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-20 origin-top-right"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                            >

                                <div className="py-1">
                                    {dropdownItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                            role="menuitem"
                                        >
                                            {item.icon && <span className="mr-3 text-slate-400">{item.icon}</span>}
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                        role="menuitem"
                                    >
                                        <LogOut size={18} className="mr-3" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Add a Mobile Menu Button here if you hide navItems on small screens and want them accessible */}
                </div>
            </div>
        </nav>
    );
};

export default CustomerNavbar;
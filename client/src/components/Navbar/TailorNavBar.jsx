import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Ruler,
    List,
    Wallet,
    UserCircle,
    ChevronDown,
    LogOut,
    Settings,
} from 'lucide-react';

const TailorNavbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        console.log('Tailor logged out');
        setIsDropdownOpen(false);
        navigate('/login');
    };

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
        { name: 'Dashboard', path: '/tailor/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Orders', path: '/tailor/orders', icon: <Package size={18} /> },
        { name: 'My Listings', path: '/tailor/listings', icon: <List size={18} /> },
        { name: 'Earnings', path: '/tailor/earnings', icon: <Wallet size={18} /> },
    ];

    const dropdownItems = [
        { name: 'Profile Info', path: '/tailor/profile', icon: <UserCircle size={18} /> },
        { name: 'Change Password', path: '/tailor/changePassword', icon: <Settings size={18} /> },
    ];

    return (
        <nav className="bg-white text-slate-700 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
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

                    {/* Post Your Service Button - Right side with indigo hover effect */}
                    <div className="ml-4 flex-shrink-0">
                        <Link
                            to="/tailor/post-service"
                            className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md transition-all duration-300 hover:bg-indigo-700 hover:scale-105 hover:shadow-lg transform"
                        >
                            Post Your Service
                        </Link>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center p-1.5 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            <UserCircle size={28} className="text-slate-500" />
                            <ChevronDown size={16} className={`ml-1 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-20 origin-top-right">

                                <div className="py-1">
                                    {dropdownItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
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
                                    >
                                        <LogOut size={18} className="mr-3" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TailorNavbar;

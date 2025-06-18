import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCircle,
    Ruler,
    DollarSign,
    LogOut,
    ChevronDown,
    Settings
} from 'lucide-react';

const AdminNavbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Customers', path: '/admin/customers', icon: <UserCircle size={18} /> },
        { name: 'Tailors', path: '/admin/tailors', icon: <Ruler size={18} /> },
    ];

    const dropdownItems = [
        { name: 'Change Password', path: '/admin/changePassword', icon: <Settings size={18} /> },
    ];

    return (
        <nav className="bg-[#f9fafb] border-b border-slate-300 shadow-md sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Main Nav */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="text-2xl font-bold text-slate-800 tracking-tight">
                            DarziXpress <span className="text-indigo-600">Admin</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-5">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-indigo-600 transition-colors"
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Profile Dropdown */}
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
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                                {dropdownItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <LogOut size={18} />
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

export default AdminNavbar;

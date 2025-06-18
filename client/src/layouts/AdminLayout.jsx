import React from 'react';
import AdminNavbar from '../components/Navbar/AdminNavbar';
import { Outlet } from 'react-router-dom';

const CustomerLayout = () => {
    return (
        <div>
            <AdminNavbar />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default CustomerLayout;

import React from 'react';
import CustomerNavbar from '../components/Navbar/CustomerNavBar';
import { Outlet } from 'react-router-dom';

const CustomerLayout = () => {
    return (
        <div>
            <CustomerNavbar />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default CustomerLayout;

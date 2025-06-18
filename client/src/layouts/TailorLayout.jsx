import React from 'react';
import TailorNavbar from '../components/Navbar/TailorNavbar';
import { Outlet } from 'react-router-dom';

const TailorLayout = () => {
    return (
        <div>
            <TailorNavbar />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default TailorLayout;

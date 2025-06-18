import React from 'react';
import { LucideFacebook, LucideInstagram, LucideTwitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-white py-10">
            <div className="container mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">DarziXpress</h3>
                <p className="text-gray-400 mb-6">Tailoring made simple. Quality you can trust.</p>

                <div className="flex justify-center space-x-4 mb-6">
                    <LucideFacebook size={30} className="hover:text-indigo-600 cursor-pointer" />
                    <LucideInstagram size={30} className="hover:text-indigo-600 cursor-pointer" />
                    <LucideTwitter size={30} className="hover:text-indigo-600 cursor-pointer" />
                </div>

                <p className="text-gray-500">&copy; 2025 DarziXpress. All rights reserved.</p>
            </div>
        </footer>
    );
}

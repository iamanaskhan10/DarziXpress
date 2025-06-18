import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/ui/Footer';
import { LucideShoppingBag, LucideScissors, LucideStar } from 'lucide-react';
import heroBg from '@/assets/images/hero-bg.jpg';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStartedClick = () => {
        navigate('/login'); // Redirects to the login page when the button is clicked
    };

    return (
        <div>
            {/* Hero Section */}
            <section
                className="relative min-h-screen bg-cover bg-center text-white"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="absolute inset-0 bg-black/70"></div>
                <div className="relative z-10 container mx-auto px-6 py-32 text-center">
                    <h1 className="text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
                        DarziXpress
                    </h1>
                    <p className="text-xl sm:text-2xl font-light mb-10 text-gray-200">
                        Tailoring made simple. Get your custom outfits tailored perfectly.
                    </p>
                    <Button size="lg" className="bg-indigo-600 text-white rounded-full px-10 py-3 shadow-2xl hover:bg-indigo-700 transition-all" onClick={handleGetStartedClick}>
                        Get Started
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section className="container mx-auto px-6 py-20">
                <h2 className="text-4xl font-extrabold mb-12 text-center text-gray-800">Our Services</h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all p-6 bg-white">
                        <CardContent className="text-center">
                            <LucideScissors size={60} className="mb-4 text-indigo-600 mx-auto" />
                            <h3 className="text-2xl font-semibold mb-2">Custom Tailoring</h3>
                            <p className="text-gray-600">Personalized stitching to match your style.</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all p-6 bg-white">
                        <CardContent className="text-center">
                            <LucideStar size={60} className="mb-4 text-indigo-600 mx-auto" />
                            <h3 className="text-2xl font-semibold mb-2">Premium Quality</h3>
                            <p className="text-gray-600">High-quality materials and craftsmanship.</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all p-6 bg-white">
                        <CardContent className="text-center">
                            <LucideShoppingBag size={60} className="mb-4 text-indigo-600 mx-auto" />
                            <h3 className="text-2xl font-semibold mb-2">Convenient Orders</h3>
                            <p className="text-gray-600">Easy online ordering for a seamless experience.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}

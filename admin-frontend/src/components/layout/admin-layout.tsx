import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { motion } from 'framer-motion';

export function AdminLayout() {
    return (
        <div className="flex min-h-screen relative overflow-hidden bg-black text-foreground font-sans antialiased selection:bg-pink-500/20 selection:text-pink-400">
            {/* Animated background */}
            <div className="fixed inset-0 z-0">
                {/* Gradient orbs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(236,72,153,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 via-black to-purple-900/10"></div>
            </div>

            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <AdminHeader />
                <main className="flex-1 overflow-auto p-6 scroll-smooth">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto w-full space-y-6"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            <style>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}

import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    FileText,
    Flag,
    BarChart3,
    Settings,
    GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: UserCheck, label: 'Creator Applications', path: '/creators' },
    { icon: FileText, label: 'Content', path: '/content' },
    { icon: Flag, label: 'Reports', path: '/reports' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const MIN_WIDTH = 200; // Minimum sidebar width in pixels
const MAX_WIDTH = 400; // Maximum sidebar width in pixels
const DEFAULT_WIDTH = 256; // Default width (w-64 equivalent)

export function AdminSidebar() {
    const location = useLocation();
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;

        const newWidth = e.clientX;
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
            setSidebarWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    // Add and remove event listeners for resizing
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return (
        <aside
            ref={sidebarRef}
            style={{ width: `${sidebarWidth}px` }}
            className="bg-black/60 backdrop-blur-xl border-r border-pink-500/20 flex flex-col h-screen sticky top-0 z-20 relative"
        >
            <div className="p-6 border-b border-pink-500/20">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                    streamit
                </h1>
                <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 font-medium border border-pink-500/30"
                                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-sm"></div>
                            )}
                            <Icon className={cn("w-5 h-5 transition-colors relative z-10 flex-shrink-0", isActive ? "text-pink-400" : "text-gray-400 group-hover:text-gray-200")} />
                            <span className="relative z-10 truncate">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] relative z-10 flex-shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-pink-500/20">
                <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20">
                    <p className="text-xs text-gray-400 text-center break-words">
                        v1.0.0 © 2024 Streamit
                    </p>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                className={cn(
                    "absolute top-0 right-0 bottom-0 w-1 cursor-col-resize group hover:bg-pink-500/50 transition-colors",
                    isResizing && "bg-pink-500"
                )}
            >
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-pink-500/20 backdrop-blur-sm rounded-full p-1 border border-pink-500/30">
                        <GripVertical className="w-3 h-3 text-pink-400" />
                    </div>
                </div>
            </div>
        </aside>
    );
}

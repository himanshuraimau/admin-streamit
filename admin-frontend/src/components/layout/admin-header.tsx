import { Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export function AdminHeader() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-pink-500/20 bg-black/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="w-96">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search anything..."
                        className="pl-9 bg-white/5 border-pink-500/20 focus:border-pink-500/40 text-gray-200 placeholder:text-gray-500 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 pl-2 pr-4 hover:bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center border border-pink-500/30">
                                <User className="w-4 h-4 text-pink-400" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium leading-none text-gray-200">Super Admin</p>
                                <p className="text-xs text-gray-400">admin@streamit.space</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border-pink-500/20">
                        <DropdownMenuLabel className="text-gray-200">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-pink-500/20" />
                        <DropdownMenuItem className="text-gray-300 focus:bg-white/5 focus:text-gray-200">Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 focus:bg-white/5 focus:text-gray-200">Settings</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-pink-500/20" />
                        <DropdownMenuItem onClick={handleLogout} className="text-pink-400 focus:text-pink-400 focus:bg-pink-500/10">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

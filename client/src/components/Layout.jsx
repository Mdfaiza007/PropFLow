import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
// CHANGE 1: "App.Context" se dot hata kar "AppContext" kiya gaya hai
import { useAppContext } from "../context/AppContext"; 
import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    FileText,
    Wrench,
    LogOut,
    User
} from "lucide-react";

const Layout = () => {
    const { user, logout } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // hum role ke hisab se menu set kar rahe hai
    const menuItems = [
        {name: 'Dashboard', path : '/dashboard', icon: <LayoutDashboard size = {20}/>},
        {name: 'Properties', path: '/properties', icon: <Building2 size={20}/>},
        {name: 'Tenants', path: '/tenants', icon: <Users size={20}/>},
        {name: 'Payments', path: '/payments', icon: <CreditCard size={20}/>},
        {name: 'Leases', path: '/leases', icon: <FileText size={20}/>},
        {name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20}/>},
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* side baar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                        <Building2 size={28}/>
                        <span>PropFlow</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                key={item.name}
                                to={item.path}
                                className= {`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                >
                                    <span className= {`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} className="mr-3"/>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Navbar  */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">

                {/* MObile view Placeholder */}
            <div className="md:hidden font-bold text-indigo-600 flex items-center gap-2">
                <Building2 size={24}/> PropFlow
            </div>

            <div className="hidden md:block">
                {/* yaha par search baar add karunga  */}
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                    {location.pathname.replace('/','') || 'Dashboard'}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <Link to='/profile' className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    <User size={16}/>
                </div>
                <div className="hidden md:block text-sm">
                    <p className="font-medium text-gray-700 leading-tight">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</p>
                </div>
                </Link>
            </div>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <Outlet/>  
            </main>
            </div>

        </div>
    );
};

export default Layout;
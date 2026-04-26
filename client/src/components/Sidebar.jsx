import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Wrench, 
  User, 
  LogOut,
  Building
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userRole = (user?.role || '').toLowerCase();

  const roleColors = {
    owner: 'bg-blue-600',
    tenant: 'bg-emerald-600',
    manager: 'bg-violet-600'
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['owner', 'tenant', 'manager'] },
    { name: 'Properties', path: '/properties', icon: <Building2 size={20} />, roles: ['owner', 'manager'] },
    { name: 'Tenants', path: '/tenants', icon: <Users size={20} />, roles: ['owner', 'manager'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} />, roles: ['owner', 'tenant'] },
    { name: 'Leases', path: '/leases', icon: <FileText size={20} />, roles: ['owner', 'tenant', 'manager'] },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} />, roles: ['owner', 'tenant', 'manager'] },
    { name: 'Profile', path: '/profile', icon: <User size={20} />, roles: ['owner', 'tenant', 'manager'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 left-0 transition-all duration-300 z-20">
      <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
        <div className="p-2 bg-indigo-500 rounded-lg">
          <Building size={24} className="text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight">PropFlow</span>
      </div>

      <div className="p-6 border-b border-slate-800 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${roleColors[userRole]}`}>
          {user.name ? user.name.charAt(0) : 'U'}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{user.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full text-white mt-1 inline-block uppercase ${roleColors[userRole]}`}>
            {user.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

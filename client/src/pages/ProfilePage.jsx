import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Bell, Shield, Key, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '+91 7631890685',
    address: 'C-23/37 Mayur Vihar, Delhi, India'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    rentReminder: true,
    maintenanceUpdates: true
  });

  // Explicit mapping for Tailwind to pick up classes
  const themeClasses = {
    Owner: {
      bgMain: 'bg-blue-600',
      textMain: 'text-blue-600',
      bgLight: 'bg-blue-100',
      textLight: 'text-blue-700',
      ringMain: 'focus:ring-blue-600',
      hoverBgMain: 'hover:bg-blue-700'
    },
    Tenant: {
      bgMain: 'bg-emerald-600',
      textMain: 'text-emerald-600',
      bgLight: 'bg-emerald-100',
      textLight: 'text-emerald-700',
      ringMain: 'focus:ring-emerald-600',
      hoverBgMain: 'hover:bg-emerald-700'
    },
    Manager: {
      bgMain: 'bg-violet-600',
      textMain: 'text-violet-600',
      bgLight: 'bg-violet-100',
      textLight: 'text-violet-700',
      ringMain: 'focus:ring-violet-600',
      hoverBgMain: 'hover:bg-violet-700'
    }
  };

  const theme = themeClasses[user.role] || themeClasses['Owner'];

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Mock save
    alert('Profile updated successfully!');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Profile & Settings</h1>
        <p className="text-slate-500">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-24 ${theme.bgMain}`}></div>
            
            <div className="relative mt-8 mb-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white ${theme.bgMain}`}>
                {profile.name.charAt(0)}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.email}</p>
            
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${theme.bgLight} ${theme.textLight} mb-6`}>
              {user.role} Account
            </span>

            <div className="pt-6 border-t border-slate-100 flex justify-between text-sm">
              <div className="text-center">
                <p className="text-slate-500 mb-1">Member Since</p>
                <p className="font-bold text-slate-900">Jan 2024</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 mb-1">Status</p>
                <p className="font-bold text-emerald-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className={`font-bold text-slate-900 mb-4 flex items-center gap-2`}>
              <Shield size={18} className={theme.textMain} /> Security
            </h3>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors mb-2 border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Key size={16} /></div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">Change Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                </div>
              </div>
            </button>
            <div className="pt-4 mt-2 border-t border-slate-100">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className={`font-bold text-slate-900 mb-6 flex items-center gap-2`}>
              <User size={18} className={theme.textMain} /> Personal Information
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 transition-colors ${theme.ringMain}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 transition-colors ${theme.ringMain}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-slate-400" />
                    </div>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 transition-colors ${theme.ringMain}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input type="text" name="address" value={profile.address} onChange={handleProfileChange} className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 transition-colors ${theme.ringMain}`} />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className={`${theme.bgMain} ${theme.hoverBgMain} text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm`}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className={`font-bold text-slate-900 mb-6 flex items-center gap-2`}>
              <Bell size={18} className={theme.textMain} /> Notification Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive updates directly to your inbox</p>
                </div>
                <button onClick={() => toggleNotification('email')} className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? theme.bgMain : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">SMS Alerts</p>
                  <p className="text-sm text-slate-500">Get important alerts via text message</p>
                </div>
                <button onClick={() => toggleNotification('sms')} className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sms ? theme.bgMain : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.sms ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">Rent Reminders</p>
                  <p className="text-sm text-slate-500">Notifications before rent is due</p>
                </div>
                <button onClick={() => toggleNotification('rentReminder')} className={`w-12 h-6 rounded-full transition-colors relative ${notifications.rentReminder ? theme.bgMain : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.rentReminder ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">Maintenance Updates</p>
                  <p className="text-sm text-slate-500">Status changes on repair requests</p>
                </div>
                <button onClick={() => toggleNotification('maintenanceUpdates')} className={`w-12 h-6 rounded-full transition-colors relative ${notifications.maintenanceUpdates ? theme.bgMain : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.maintenanceUpdates ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

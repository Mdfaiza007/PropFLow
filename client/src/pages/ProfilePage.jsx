import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Bell, Shield, Key, LogOut, Camera, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    rentReminder: true,
    maintenanceUpdates: true,
  });

  // Avatar upload states
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePhoto || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null); // { type: 'success'|'error', text: '' }

  // Profile save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const fileInputRef = useRef(null);

  // Theme mapping
  const themeClasses = {
    owner: {
      bgMain: 'bg-blue-600',
      textMain: 'text-blue-600',
      bgLight: 'bg-blue-100',
      textLight: 'text-blue-700',
      ringMain: 'focus:ring-blue-500',
      hoverBgMain: 'hover:bg-blue-700',
      borderMain: 'border-blue-600',
    },
    tenant: {
      bgMain: 'bg-emerald-600',
      textMain: 'text-emerald-600',
      bgLight: 'bg-emerald-100',
      textLight: 'text-emerald-700',
      ringMain: 'focus:ring-emerald-500',
      hoverBgMain: 'hover:bg-emerald-700',
      borderMain: 'border-emerald-600',
    },
    manager: {
      bgMain: 'bg-violet-600',
      textMain: 'text-violet-600',
      bgLight: 'bg-violet-100',
      textLight: 'text-violet-700',
      ringMain: 'focus:ring-violet-500',
      hoverBgMain: 'hover:bg-violet-700',
      borderMain: 'border-violet-600',
    },
  };

  const theme = themeClasses[user?.role?.toLowerCase()] || themeClasses['owner'];
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Owner';

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  // When user picks a file — show preview instantly
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAvatarMsg({ type: 'error', text: 'Sirf JPG, PNG ya WEBP image allowed hai.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Image size 5MB se zyada nahi honi chahiye.' });
      return;
    }

    setAvatarFile(file);
    setAvatarMsg(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Upload to Cloudinary via backend
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setAvatarMsg(null);

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = res.data.data;
      updateUser({ profilePhoto: updatedUser.profilePhoto });
      setAvatarPreview(updatedUser.profilePhoto);
      setAvatarFile(null);
      setAvatarMsg({ type: 'success', text: 'Profile photo successfully update ho gayi! 🎉' });
    } catch (err) {
      setAvatarMsg({
        type: 'error',
        text: err.response?.data?.message || 'Upload failed. Dobara try karein.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile text fields
  const handleSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await api.put('/auth/update-profile', {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      updateUser(res.data.data);
      setProfileMsg({ type: 'success', text: 'Profile successfully save ho gayi!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Update failed. Dobara try karein.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Profile &amp; Settings</h1>
        <p className="text-slate-500">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center relative overflow-hidden">
            {/* Coloured banner */}
            <div className={`absolute top-0 left-0 w-full h-24 ${theme.bgMain}`}></div>

            {/* Avatar + upload overlay */}
            <div className="relative mt-8 mb-4">
              <div className="relative w-24 h-24 mx-auto">
                {/* Avatar circle */}
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg`}
                  />
                ) : (
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white ${theme.bgMain}`}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Camera overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Photo change karein"
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={22} className="text-white" />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Upload button — shows only when new file is picked */}
              {avatarFile && !uploadingAvatar && (
                <div className="mt-3 flex gap-2 justify-center">
                  <button
                    onClick={handleAvatarUpload}
                    className={`${theme.bgMain} ${theme.hoverBgMain} text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm`}
                  >
                    Upload Photo
                  </button>
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(user?.profilePhoto || null);
                      setAvatarMsg(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Uploading spinner */}
              {uploadingAvatar && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading…
                </div>
              )}

              {/* Avatar feedback message */}
              {avatarMsg && (
                <div
                  className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-medium ${
                    avatarMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {avatarMsg.type === 'success' ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {avatarMsg.text}
                </div>
              )}

              <p className="mt-2 text-xs text-slate-400">
                Photo pe click karein ya camera icon press karein
              </p>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.email}</p>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${theme.bgLight} ${theme.textLight} mb-6`}
            >
              {roleLabel} Account
            </span>

            <div className="pt-6 border-t border-slate-100 flex justify-between text-sm">
              <div className="text-center">
                <p className="text-slate-500 mb-1">Member Since</p>
                <p className="font-bold text-slate-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Jan 2024'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 mb-1">Status</p>
                <p className="font-bold text-emerald-600">Active</p>
              </div>
            </div>
          </div>

          {/* Security card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={18} className={theme.textMain} /> Security
            </h3>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors mb-2 border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Key size={16} />
                </div>
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

        {/* ── Right Column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={18} className={theme.textMain} /> Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.ringMain}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email change nahi ki ja sakti</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.ringMain}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location / Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      className={`w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-colors ${theme.ringMain}`}
                    />
                  </div>
                </div>
              </div>

              {/* Profile save feedback */}
              {profileMsg && (
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${
                    profileMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {profileMsg.text}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className={`${theme.bgMain} ${theme.hoverBgMain} text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60`}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell size={18} className={theme.textMain} /> Notification Preferences
            </h3>

            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates directly to your inbox' },
                { key: 'sms', label: 'SMS Alerts', desc: 'Get important alerts via text message' },
                { key: 'rentReminder', label: 'Rent Reminders', desc: 'Notifications before rent is due' },
                { key: 'maintenanceUpdates', label: 'Maintenance Updates', desc: 'Status changes on repair requests' },
              ].map((item, idx, arr) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between py-3 ${idx < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key] ? theme.bgMain : 'bg-slate-200'}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${notifications[item.key] ? 'translate-x-7' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, ArrowRight, UserCircle2, KeyRound } from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('owner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const roles = [
    { id: 'owner', label: 'Owner / Landlord', color: 'text-blue-600', bg: 'bg-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'tenant', label: 'Tenant', color: 'text-emerald-600', bg: 'bg-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'manager', label: 'Property Manager', color: 'text-violet-600', bg: 'bg-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-200' }
  ];

  const currentRoleInfo = roles.find(r => r.id === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const res = await register({ name, email, password, role: activeTab });
        if (!res.success) setError(res.message);
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
              <Building size={32} className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">PropFlow</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Modernize your <br/>
            <span className="text-indigo-400">property management</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            The all-in-one platform for owners, tenants, and managers. Streamline rent, maintenance, and leases with ease.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} PropFlow Inc(Md Faizan). All rights reserved.
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex lg:hidden items-center gap-2 text-slate-900 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                <Building size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PropFlow</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500">
              {isRegistering ? 'Enter your details to get started' : 'Please enter your details to sign in'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">I am a...</label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveTab(role.id)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
                      activeTab === role.id 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {role.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle2 size={20} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors bg-slate-50 focus:bg-white text-slate-900"
                    placeholder="Nhi Btaunga"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle2 size={20} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors bg-slate-50 focus:bg-white text-slate-900"
                  placeholder="nhiBataunga@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {!isRegistering && (
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={20} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors bg-slate-50 focus:bg-white text-slate-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${currentRoleInfo.bg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')} <ArrowRight size={18} />
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
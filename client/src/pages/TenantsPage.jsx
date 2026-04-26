import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, Mail, Phone, Home, FileText, MoreVertical, X } from 'lucide-react';

const TenantsPage = () => {
  const { user } = useAuth();
  const [tenantsList, setTenantsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // We fetch Leases instead of just Tenants because the UI requires Lease Status, Rent, and Dates
  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/leases'); // /leases gives us property, tenant, rent, status
      if (res.data.success) {
        // Map backend lease structure to the UI expected structure
        const mappedData = res.data.data.map(lease => ({
          id: lease._id,
          name: lease.tenant?.name || 'Unknown',
          email: lease.tenant?.email || 'N/A',
          phone: lease.tenant?.phone || 'N/A',
          avatar: lease.tenant?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(lease.tenant?.name || 'User')}&background=random`,
          propertyName: lease.property?.title || 'Unknown Property',
          rent: lease.monthlyRent,
          leaseEnd: new Date(lease.endDate).toLocaleDateString(),
          leaseStatus: lease.status
        }));
        setTenantsList(mappedData);
      }
    } catch (err) {
      console.error("Error fetching tenants/leases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenantsList.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tenant.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : tenant.leaseStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Expiring': return 'bg-amber-100 text-amber-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Draft': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Tenants</h1>
          <p className="text-slate-500">Manage residents and leases</p>
        </div>
        {(user?.role === 'owner' || user?.role === 'Owner') && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Add Tenant (Lease)
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search tenants by name or email..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Expiring', 'Expired', 'Draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors border ${
                filter === f 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No tenants/leases found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative">
              <div className="absolute top-4 right-4">
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6 mt-2">
                <img src={tenant.avatar} alt={tenant.name} className="w-20 h-20 rounded-full mb-3 shadow-sm border-2 border-white object-cover" />
                <h3 className="text-lg font-bold text-slate-900">{tenant.name}</h3>
                <span className={`mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(tenant.leaseStatus)}`}>
                  {tenant.leaseStatus}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Home size={16} className="text-slate-400" />
                  <span className="truncate">{tenant.propertyName}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Rent</p>
                  <p className="font-bold text-slate-900">₹{tenant.rent?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Lease End</p>
                  <p className="font-medium text-slate-700">{tenant.leaseEnd}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Tenant Modal (Placeholder for future API integration) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add New Tenant</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center py-10">
              <p className="text-slate-500 mb-4">To add a tenant, you first need to create a User account for them, then link them to a Property via a Lease agreement.</p>
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
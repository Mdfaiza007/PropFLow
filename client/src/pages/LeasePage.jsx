import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, FileText, Calendar, ShieldCheck, Home, FileSignature, X } from 'lucide-react';

const LeasePage = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Details Modal State
  const [selectedLease, setSelectedLease] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State
  const [properties, setProperties] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [formData, setFormData] = useState({
    property: '',
    tenant: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: ''
  });

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/leases');
      if (res.data.success) {
        const mappedLeases = res.data.data.map(lease => ({
          id: lease._id,
          tenantName: lease.tenant?.name || 'Unknown Tenant',
          propertyName: lease.property?.title || 'Unknown Property',
          startDate: new Date(lease.startDate).toLocaleDateString(),
          endDate: new Date(lease.endDate).toLocaleDateString(),
          rent: lease.monthlyRent,
          status: lease.status,
          documentUrl: lease.documentUrl,
          securityDeposit: lease.securityDeposit,
          signed: lease.signed,
          signedAt: lease.signedAt ? new Date(lease.signedAt).toLocaleDateString() : null
        }));
        setLeases(mappedLeases);
      }
    } catch (err) {
      console.error("Error fetching leases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [propRes, tenantRes] = await Promise.all([
        api.get('/properties').catch(() => ({ data: { data: [] } })),
        api.get('/auth/tenants').catch(() => ({ data: { data: [] } }))
      ]);
      setProperties(propRes.data?.data || []);
      setTenantsList(tenantRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching form data:", err);
    }
  };

  useEffect(() => {
    fetchLeases();
    if (user?.role === 'owner' || user?.role === 'Owner' || user?.role === 'manager' || user?.role === 'Manager') {
      fetchFormData();
    }
  }, [user]);

  const handleSignLease = async (leaseId) => {
    try {
      const res = await api.put(`/leases/${leaseId}/sign`);
      if (res.data.success) {
        alert("Lease signed successfully!");
        fetchLeases();
        if (selectedLease && selectedLease.id === leaseId) {
          setSelectedLease({...selectedLease, status: 'Active', signed: true, signedAt: new Date().toLocaleDateString()});
        }
      }
    } catch (err) {
      alert("Error signing lease: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUploadDocument = async (e, leaseId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const res = await api.post(`/leases/${leaseId}/document`, formData);
      if (res.data.success) {
        alert("Document uploaded successfully!");
        fetchLeases();
        if (selectedLease && selectedLease.id === leaseId) {
          setSelectedLease({...selectedLease, documentUrl: res.data.data.documentUrl});
        }
      }
    } catch (err) {
      alert("Error uploading document: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateLease = async (e) => {
    e.preventDefault();
    if (!formData.property || !formData.tenant) {
      return alert("Please select both a property and a tenant.");
    }
    try {
      const res = await api.post('/leases', {
        property: formData.property,
        tenant: formData.tenant,
        startDate: formData.startDate,
        endDate: formData.endDate,
        monthlyRent: Number(formData.monthlyRent),
        securityDeposit: Number(formData.securityDeposit) || 0
      });
      if (res.data.success) {
        alert("Lease created successfully!");
        setIsAddModalOpen(false);
        setFormData({ property: '', tenant: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '' });
        fetchLeases(); // Refresh list
      }
    } catch (err) {
      alert("Error creating lease: " + (err.response?.data?.message || err.message));
    }
  };

  const visibleLeases = leases.filter(lease => {
    const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : lease.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Expiring': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const calculateDaysRemaining = (endDateStr) => {
    if (!endDateStr || endDateStr === '-') return '-';
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Lease Agreements</h1>
          <p className="text-slate-500">Manage digital leases and documents</p>
        </div>
        {(user?.role === 'owner' || user?.role === 'Owner' || user?.role === 'manager' || user?.role === 'Manager') && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Create Lease
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
            placeholder="Search leases by tenant or property..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Active', 'Expiring', 'Draft', 'Expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors border whitespace-nowrap ${
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : visibleLeases.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No leases found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleLeases.map((lease) => (
            <div key={lease.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${
                  lease.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                  lease.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <FileText size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(lease.status)}`}>
                  {lease.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">{lease.tenantName}</h3>
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-6">
                <Home size={16} className="text-slate-400" /> {lease.propertyName}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12}/> Start Date</p>
                  <p className="font-medium text-slate-900">{lease.startDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12}/> End Date</p>
                  <p className="font-medium text-slate-900">{lease.endDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Rent</p>
                  <p className="font-medium text-slate-900">₹{lease.rent?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Days Remaining</p>
                  <p className={`font-bold ${calculateDaysRemaining(lease.endDate) < 60 ? 'text-red-600' : 'text-slate-900'}`}>
                    {calculateDaysRemaining(lease.endDate)} days
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => { setSelectedLease(lease); setIsDetailsModalOpen(true); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  View Detail
                </button>
                {(lease.status === 'Draft' || lease.status === 'Expiring') && (
                  <button 
                    onClick={() => handleSignLease(lease.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors text-white ${(user?.role === 'tenant' || user?.role === 'Tenant') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <FileSignature size={16} /> Sign Lease
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lease Details Modal */}
      {isDetailsModalOpen && selectedLease && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Lease Agreement</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Home size={14} /> {selectedLease.propertyName}
                </div>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tenant</p>
                  <p className="text-lg font-bold text-slate-900">{selectedLease.tenantName}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${getStatusColor(selectedLease.status)}`}>
                  {selectedLease.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Term Length</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedLease.startDate} <br/>to {selectedLease.endDate}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Financials</p>
                  <p className="font-bold text-blue-600">Rent: ₹{selectedLease.rent?.toLocaleString()}</p>
                  <p className="font-bold text-slate-600 text-sm">Dep: ₹{selectedLease.securityDeposit?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                  <FileText size={16} /> Document & Signature
                </h3>
                
                {selectedLease.signed ? (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
                    <ShieldCheck size={18} /> Signed on {selectedLease.signedAt}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm">
                    Awaiting Signature
                  </div>
                )}

                {selectedLease.documentUrl ? (
                  <a 
                    href={selectedLease.documentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full text-center bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 py-3 rounded-xl font-medium transition-colors"
                  >
                    View / Download Lease Document
                  </a>
                ) : (user?.role === 'owner' || user?.role === 'Owner' || user?.role === 'manager' || user?.role === 'Manager') ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Upload Signed PDF/Image</label>
                    <input 
                      type="file" 
                      accept=".pdf,image/*"
                      onChange={(e) => handleUploadDocument(e, selectedLease.id)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No document has been uploaded yet.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors">
                Close
              </button>
              {(!selectedLease.signed && (selectedLease.status === 'Draft' || selectedLease.status === 'Expiring')) && (
                <button 
                  onClick={() => handleSignLease(selectedLease.id)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                >
                  <FileSignature size={18} /> Sign Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Create New Lease</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleCreateLease}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Property</label>
                  <select required value={formData.property} onChange={e => setFormData({...formData, property: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                    <option value="">-- Choose a Property --</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id}>{p.title} - {p.address}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Tenant</label>
                  <select required value={formData.tenant} onChange={e => setFormData({...formData, tenant: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                    <option value="">-- Choose a Tenant --</option>
                    {tenantsList.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (₹)</label>
                    <input type="number" required value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="e.g. 15000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input type="number" required value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="e.g. 45000" />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Create Lease
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasePage;
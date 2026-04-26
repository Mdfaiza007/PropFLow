import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, Wrench, AlertCircle, CheckCircle2, Clock, MapPin, X } from 'lucide-react';

const MaintenancePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    propertyId: '',
    priority: 'Low',
    description: ''
  });

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/maintenance');
      if (res.data.success) {
        const mappedData = res.data.data.map(req => ({
          id: req._id,
          title: req.title,
          description: req.description,
          priority: req.priority,
          status: req.status,
          photos: req.photos,
          propertyName: req.property?.title || 'Unknown Property',
          tenantName: req.tenant?.name || 'Unknown Tenant',
          date: new Date(req.createdAt).toLocaleDateString()
        }));
        setRequests(mappedData);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchRequests();
    fetchProperties();
  }, []);

  const visibleRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : req.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Assigned': return 'bg-violet-100 text-violet-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.put(`/maintenance/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.propertyId) return alert("Please select a property");
    
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('propertyId', formData.propertyId);
      payload.append('priority', formData.priority);
      payload.append('description', formData.description);
      
      selectedFiles.forEach(file => {
        payload.append('photos', file);
      });

      const res = await api.post('/maintenance', payload);
      
      if (res.data.success) {
        alert("Request submitted successfully!");
        fetchRequests(); // refresh to get populated refs
        setIsSubmitModalOpen(false);
        setFormData({ title: '', propertyId: '', priority: 'Low', description: '' });
        setSelectedFiles([]);
      }
    } catch (err) {
      alert("Error submitting request: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Maintenance</h1>
          <p className="text-slate-500">Track and manage property repairs</p>
        </div>
        {(user?.role === 'tenant' || user?.role === 'Tenant') && (
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Submit Request
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
          <div><p className="text-2xl font-bold text-slate-900">{isLoading ? '-' : requests.filter(r => r.status === 'Pending').length}</p><p className="text-xs text-slate-500">Pending</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wrench size={20} /></div>
          <div><p className="text-2xl font-bold text-slate-900">{isLoading ? '-' : requests.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length}</p><p className="text-xs text-slate-500">In Progress</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div>
          <div><p className="text-2xl font-bold text-slate-900">{isLoading ? '-' : requests.filter(r => r.status === 'Resolved').length}</p><p className="text-xs text-slate-500">Resolved</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
          <div><p className="text-2xl font-bold text-slate-900">{isLoading ? '-' : requests.filter(r => r.priority === 'High' && r.status !== 'Resolved').length}</p><p className="text-xs text-slate-500">High Priority</p></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((f) => (
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-slate-200">ID</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Title</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Property / Tenant</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Priority</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Status</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Date</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading requests...</td>
                </tr>
              ) : visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No maintenance requests found.
                  </td>
                </tr>
              ) : visibleRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">...{req.id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{req.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="flex items-center gap-1 font-medium"><MapPin size={14}/> {req.propertyName}</p>
                    {(user?.role !== 'tenant' && user?.role !== 'Tenant') && <p className="text-xs text-slate-500 ml-5">{req.tenantName}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{req.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Request Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Submit Maintenance Request</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmitRequest}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600" placeholder="e.g. Broken AC" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                  <select required value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white">
                    <option value="">Select a property</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <label key={p} className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors ${formData.priority === p ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={e => setFormData({...formData, priority: e.target.value})} className="mr-2 text-emerald-600 focus:ring-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Photos (Max 3, Optional)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600" placeholder="Describe the issue in detail..."></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Request Detail</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedRequest.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{selectedRequest.date} • ...{selectedRequest.id?.slice(-6)}</p>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm mb-6 border border-slate-100">
                  {selectedRequest.description}
                </div>
                
                {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase">Attached Photos</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedRequest.photos.map((photo, idx) => (
                        <a key={idx} href={photo} target="_blank" rel="noreferrer" className="shrink-0 border border-slate-200 rounded-lg overflow-hidden w-24 h-24 hover:border-emerald-500 transition-colors">
                          <img src={photo} alt="Issue" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Property</p>
                    <p className="font-medium text-slate-900">{selectedRequest.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tenant</p>
                    <p className="font-medium text-slate-900">{selectedRequest.tenantName}</p>
                  </div>
                </div>
              </div>

              {(user?.role === 'manager' || user?.role === 'Manager' || user?.role === 'owner' || user?.role === 'Owner') && (
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-3">Update Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleStatusUpdate(selectedRequest.id, 'In Progress')} className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors">
                      Mark In Progress
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Resolved')} className="px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
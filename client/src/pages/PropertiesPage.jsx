import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, Building2, MapPin, BedDouble, Bath, Maximize, MoreVertical, X } from 'lucide-react';

const PropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Details Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    rent: '',
    type: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    manager: ''
  });

  const [managers, setManagers] = useState([]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/properties');
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagers = async () => {
    if (user?.role === 'owner' || user?.role === 'Owner') {
      try {
        const res = await api.get('/auth/managers');
        if (res.data.success) {
          setManagers(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching managers:", err);
      }
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchManagers();
  }, [user]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        rent: Number(formData.rent),
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        area: formData.area ? Number(formData.area) : undefined,
        manager: formData.manager || undefined
      };
      const res = await api.post('/properties', payload);
      
      if (res.data.success) {
        let updatedProperty = res.data.data;
        
        // Upload photos if selected
        if (selectedFiles.length > 0) {
          const photoData = new FormData();
          selectedFiles.forEach(file => {
            photoData.append('photos', file);
          });
          
          try {
            const photoRes = await api.post(`/properties/${updatedProperty._id}/photos`, photoData);
            if (photoRes.data.success) {
              updatedProperty = photoRes.data.data;
            }
          } catch (photoErr) {
            alert("Property created, but failed to upload photos.");
          }
        }

        setProperties([...properties, updatedProperty]);
        setIsAddModalOpen(false);
        setFormData({ title: '', address: '', rent: '', type: 'Apartment', bedrooms: '', bathrooms: '', area: '', manager: '' });
        setSelectedFiles([]);
      }
    } catch (err) {
      alert("Error adding property: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prop.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : prop.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalProps = properties.length;
  const occupiedProps = properties.filter(p => p.status === 'Occupied').length;
  const vacantProps = properties.filter(p => p.status === 'Vacant').length;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Properties</h1>
          <p className="text-slate-500">Manage your real estate portfolio</p>
        </div>
        {(user?.role === 'owner' || user?.role === 'Owner') && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Add Property
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Properties</p>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : totalProps}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Occupied</p>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : occupiedProps}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Vacant</p>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : vacantProps}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search properties by name or address..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Occupied', 'Vacant'].map((f) => (
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

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No properties found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-48 overflow-hidden relative bg-slate-100">
                <img 
                  src={property.photos && property.photos.length > 0 ? property.photos[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                    property.status === 'Occupied' 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-white/90 text-slate-700'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h3>
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <p className="text-slate-500 text-sm mb-4 flex items-start gap-1">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{property.address}</span>
                </p>
                
                <div className="flex items-center gap-4 py-4 border-y border-slate-100 mb-4">
                  <div className="flex items-center gap-1 text-slate-600 text-sm font-medium">
                    <BedDouble size={18} className="text-slate-400" /> {property.bedrooms || 0}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 text-sm font-medium">
                    <Bath size={18} className="text-slate-400" /> {property.bathrooms || 0}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 text-sm font-medium">
                    <Maximize size={18} className="text-slate-400" /> {property.area || 0} sqft
                  </div>
                </div>

                {(user?.role === 'owner' || user?.role === 'Owner') && property.manager && (
                  <div className="mb-4 flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-medium uppercase">Manager</span>
                    <span className="text-sm font-bold text-slate-800">{property.manager?.name || 'Assigned'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Monthly Rent</p>
                    <p className="text-xl font-bold text-blue-600">₹{property.rent?.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedProperty(property); setIsDetailsModalOpen(true); }}
                    className="text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add New Property</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleAddProperty}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="e.g. Sunshine Apartments" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rent Amount (₹)</label>
                    <input type="number" required value={formData.rent} onChange={e => setFormData({...formData, rent: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Photos (Max 5)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Beds</label>
                    <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Baths</label>
                    <input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sq Ft</label>
                    <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" placeholder="0" />
                  </div>
                </div>
                {(user?.role === 'owner' || user?.role === 'Owner') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Manager (Optional)</label>
                    <select value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                      <option value="">No Manager Assigned</option>
                      {managers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Save Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Property Details Modal */}
      {isDetailsModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedProperty.title}</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={16} /> {selectedProperty.address}
                </div>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  selectedProperty.status === 'Occupied' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedProperty.status}
                </span>
                <p className="text-2xl font-bold text-blue-600">₹{selectedProperty.rent?.toLocaleString()} <span className="text-sm text-slate-500 font-medium">/ month</span></p>
              </div>

              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedProperty.photos.map((photo, idx) => (
                      <a key={idx} href={photo} target="_blank" rel="noreferrer" className="block aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-colors">
                        <img src={photo} alt="Property" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Type</p>
                  <p className="font-bold text-slate-900">{selectedProperty.type}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Bedrooms</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1"><BedDouble size={16} className="text-slate-400"/> {selectedProperty.bedrooms || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Bathrooms</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1"><Bath size={16} className="text-slate-400"/> {selectedProperty.bathrooms || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Area</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1"><Maximize size={16} className="text-slate-400"/> {selectedProperty.area || 0} sqft</p>
                </div>
              </div>

              {(user?.role === 'owner' || user?.role === 'Owner') && selectedProperty.manager && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Management</h3>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedProperty.manager.name ? selectedProperty.manager.name.charAt(0) : 'M'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedProperty.manager.name}</p>
                      <p className="text-sm text-slate-600">{selectedProperty.manager.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
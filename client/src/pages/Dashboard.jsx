import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Building2, Users, IndianRupee, Wrench, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, trend, trendValue, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  
  const [properties, setProperties] = useState([]);
  const [leases, setLeases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propRes, leaseRes, payRes, maintRes] = await Promise.all([
          api.get('/properties').catch(() => ({ data: { data: [] } })),
          api.get('/leases').catch(() => ({ data: { data: [] } })),
          api.get('/payments').catch(() => ({ data: { data: [] } })),
          api.get('/maintenance').catch(() => ({ data: { data: [] } }))
        ]);
        
        setProperties(propRes.data?.data || []);
        setLeases(leaseRes.data?.data || []);
        setPayments(payRes.data?.data || []);
        setMaintenanceRequests(maintRes.data?.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRecentActivity = () => {
    return [
      { id: 1, type: 'payment', text: 'Recent payment activity synced.', time: 'Just now', icon: <IndianRupee size={16} className="text-emerald-600"/>, bg: 'bg-emerald-100' },
      { id: 2, type: 'maintenance', text: 'Dashboard statistics updated.', time: '1 min ago', icon: <Wrench size={16} className="text-amber-600"/>, bg: 'bg-amber-100' }
    ];
  };

  const renderOwnerDashboard = () => {
    const activeTenants = leases.filter(l => l.status === 'Active').length;
    const monthlyRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'Pending').length;

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Properties" value={isLoading ? '-' : properties.length} icon={<Building2 size={24} className="text-blue-600"/>} colorClass="bg-blue-50" />
          <StatCard title="Active Tenants" value={isLoading ? '-' : activeTenants} icon={<Users size={24} className="text-indigo-600"/>} colorClass="bg-indigo-50" />
          <StatCard title="Total Revenue" value={isLoading ? '-' : `₹${monthlyRevenue.toLocaleString()}`} icon={<IndianRupee size={24} className="text-emerald-600"/>} colorClass="bg-emerald-50" />
          <StatCard title="Pending Maintenance" value={isLoading ? '-' : pendingMaintenance} icon={<Wrench size={24} className="text-amber-600"/>} colorClass="bg-amber-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Properties Snapshot</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm font-medium text-slate-500">
                    <th className="pb-3 px-4">Property</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Rent</th>
                    <th className="pb-3 px-4">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                  ) : properties.slice(0, 4).map((prop) => (
                    <tr key={prop._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-900">{prop.title}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {prop.propertyType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">₹{prop.monthlyRent?.toLocaleString()}</td>
                      <td className="py-4 px-4 text-slate-600">{prop.address?.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">System Activity</h2>
            <div className="space-y-6">
              {getRecentActivity().map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">{activity.text}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTenantDashboard = () => {
    const myLease = leases[0]; // the most relevant lease
    const myProperty = myLease?.property;
    const rentDue = myLease?.monthlyRent || 0;
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Rent Due Amount" value={isLoading ? '-' : `₹${rentDue.toLocaleString()}`} icon={<IndianRupee size={24} className="text-emerald-600"/>} colorClass="bg-emerald-50" />
          <StatCard title="Lease Start" value={isLoading ? '-' : (myLease ? new Date(myLease.startDate).toLocaleDateString() : '-')} icon={<Clock size={24} className="text-amber-600"/>} colorClass="bg-amber-50" />
          <StatCard title="Lease Status" value={isLoading ? '-' : (myLease?.status || 'No Active Lease')} icon={<CheckCircle2 size={24} className="text-blue-600"/>} colorClass="bg-blue-50" />
          <StatCard title="My Requests" value={isLoading ? '-' : `${maintenanceRequests.length}`} icon={<Wrench size={24} className="text-violet-600"/>} colorClass="bg-violet-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
              {myProperty?.images?.[0] ? (
                <img src={myProperty.images[0].url} alt="Property" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={48} className="text-slate-300" />
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{myProperty?.title || 'No Property Assigned'}</h2>
              <p className="text-slate-500 mb-6">{myProperty?.address?.street || ''}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Monthly Rent</p>
                  <p className="font-bold text-slate-900">₹{rentDue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Lease Ends</p>
                  <p className="font-bold text-slate-900">{myLease ? new Date(myLease.endDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Payments</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-slate-500 text-center py-4">Loading...</p>
              ) : payments.slice(0, 5).map((pay) => (
                <div key={pay._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                      <IndianRupee size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{pay.month}</p>
                      <p className="text-sm text-slate-500">{pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{pay.amount?.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block ${pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderManagerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Open Requests" value={isLoading ? '-' : maintenanceRequests.filter(r => r.status === 'Pending').length} icon={<AlertCircle size={24} className="text-red-500"/>} colorClass="bg-red-50" />
        <StatCard title="In Progress" value={isLoading ? '-' : maintenanceRequests.filter(r => r.status === 'In Progress').length} icon={<Clock size={24} className="text-amber-600"/>} colorClass="bg-amber-50" />
        <StatCard title="Resolved" value={isLoading ? '-' : maintenanceRequests.filter(r => r.status === 'Resolved').length} icon={<CheckCircle2 size={24} className="text-emerald-600"/>} colorClass="bg-emerald-50" />
        <StatCard title="Total Properties" value={isLoading ? '-' : properties.length} icon={<Building2 size={24} className="text-violet-600"/>} colorClass="bg-violet-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Action Needed (Maintenance)</h2>
          </div>
          <div className="space-y-4">
            {isLoading ? <p>Loading...</p> : maintenanceRequests.filter(r => r.status !== 'Resolved').slice(0, 5).map((req) => (
              <div key={req._id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{req.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{req.property?.title} • {req.tenant?.name}</p>
                <div className="flex gap-2">
                  <button className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700">
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 border border-slate-100 rounded-2xl hover:border-violet-300 hover:shadow-md transition-all group text-left">
              <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Add Tenant</h3>
              <p className="text-sm text-slate-500">Onboard a new resident</p>
            </button>
            <button className="p-6 border border-slate-100 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all group text-left">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <IndianRupee size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Record Payment</h3>
              <p className="text-sm text-slate-500">Log manual rent collection</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.name || 'User'} ({user?.role || 'Role'})</p>
        </div>
      </div>

      {(user?.role === 'owner' || user?.role === 'Owner') && renderOwnerDashboard()}
      {(user?.role === 'tenant' || user?.role === 'Tenant') && renderTenantDashboard()}
      {(user?.role === 'manager' || user?.role === 'Manager') && renderManagerDashboard()}
    </div>
  );
};

export default Dashboard;
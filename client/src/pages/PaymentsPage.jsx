import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, IndianRupee, CreditCard, Building, Banknote, Download, X } from 'lucide-react';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [isLoading, setIsLoading] = useState(true);
  const [leases, setLeases] = useState([]);
  const [initiateData, setInitiateData] = useState({
    leaseId: '',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  });

  const fetchPaymentsAndLeases = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/payments');
      if (res.data.success) {
        const mappedPayments = res.data.data.map(p => ({
          id: p._id,
          leaseId: p.lease?._id || p.lease,
          tenantId: p.tenant?._id || p.tenant,
          propertyId: p.property?._id || p.property,
          ownerId: p.owner,
          tenantName: p.tenant?.name || 'Unknown',
          propertyName: p.property?.title || 'Unknown',
          month: p.month,
          amount: p.amount,
          status: p.status,
          date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-',
          method: p.method || '-'
        }));
        setPayments(mappedPayments);
      }
      if (user?.role === 'tenant' || user?.role === 'Tenant') {
        try {
          const leaseRes = await api.get('/leases');
          if (leaseRes.data.success) {
            setLeases(leaseRes.data.data.filter(l => l.status === 'Active'));
            if (leaseRes.data.data.length > 0) {
              setInitiateData(prev => ({ ...prev, leaseId: leaseRes.data.data[0]._id }));
            }
          }
        } catch (err) {
          console.error("Error fetching leases:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndLeases();
  }, [user]);

  // Filter based on role and search
  const visiblePayments = payments.filter(pay => {
    const matchesSearch = pay.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pay.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : pay.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handlePayClick = (payment) => {
    setSelectedPayment(payment);
    setIsPayModalOpen(true);
  };

  const handleInitiatePay = (e) => {
    e.preventDefault();
    if (!initiateData.leaseId) return alert("No active lease found!");
    
    const lease = leases.find(l => l._id === initiateData.leaseId);
    if (!lease) return;

    setSelectedPayment({
      id: "new",
      leaseId: lease._id,
      tenantId: user.id,
      propertyId: lease.property._id,
      ownerId: lease.owner._id || lease.owner,
      tenantName: user.name,
      propertyName: lease.property.title,
      month: initiateData.month,
      amount: lease.monthlyRent,
      status: 'Pending'
    });
    setIsInitiateModalOpen(false);
    setIsPayModalOpen(true);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (payMethod === 'bank') {
      alert("Bank transfer instructions will be sent to your email.");
      setIsPayModalOpen(false);
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        amount: selectedPayment.amount,
        tenantId: selectedPayment.tenantId,
        propertyId: selectedPayment.propertyId,
        month: selectedPayment.month
      });
      
      if (!orderRes.data.success) {
        return alert("Failed to create Razorpay order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Fallback for dev
        amount: orderRes.data.order.amount,
        currency: "INR",
        name: "PropFlow",
        description: `Rent for ${selectedPayment.month}`,
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          // 2. Verify payment on backend
          try {
            const verifyRes = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentData: {
                lease: selectedPayment.leaseId,
                tenant: selectedPayment.tenantId,
                property: selectedPayment.propertyId,
                owner: selectedPayment.ownerId,
                amount: selectedPayment.amount,
                month: selectedPayment.month
              }
            });
            
            if (verifyRes.data.success) {
              setPayments(payments.map(p => 
                p.id === selectedPayment.id ? { ...p, status: 'Paid', date: new Date().toLocaleDateString(), method: 'Razorpay' } : p
              ));
              alert("Payment Successful!");
              setIsPayModalOpen(false);
            }
          } catch (err) {
            alert("Payment verification failed on server.");
          }
        },
        prefill: {
          name: user?.name || "Tenant",
          email: user?.email || "tenant@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Error initiating payment. Check console for details.");
    }
  };

  const handleManualMarkPaid = async (paymentId) => {
    if(!window.confirm("Mark this payment as paid manually?")) return;
    try {
      const res = await api.put(`/payments/${paymentId}/manual`, { method: 'Cash' });
      if (res.data.success) {
        setPayments(payments.map(p => 
          p.id === paymentId ? { ...p, status: 'Paid', date: new Date().toLocaleDateString(), method: 'Cash' } : p
        ));
      }
    } catch (err) {
      alert("Failed to mark as paid");
    }
  };

  // Stats calculation
  const totalCollected = visiblePayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = visiblePayments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = visiblePayments.length > 0 ? 
    Math.round((visiblePayments.filter(p => p.status === 'Paid').length / visiblePayments.length) * 100) : 0;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Payments</h1>
          <p className="text-slate-500">Track and manage your rent transactions</p>
        </div>
        {(user?.role === 'tenant' || user?.role === 'Tenant') && (
          <button 
            onClick={() => setIsInitiateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Banknote size={20} /> Pay Rent
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Collected</p>
              <p className="text-2xl font-bold text-slate-900">₹{isLoading ? '...' : totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending/Overdue</p>
              <p className="text-2xl font-bold text-slate-900">₹{isLoading ? '...' : totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Collection Rate</p>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : `${collectionRate}%`}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={(user?.role === 'tenant' || user?.role === 'Tenant') ? "Search by month..." : "Search tenant or property..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Paid', 'Pending', 'Overdue'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors border whitespace-nowrap ${
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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-slate-200">ID</th>
                {(user?.role !== 'tenant' && user?.role !== 'Tenant') && <th className="px-6 py-4 font-medium border-b border-slate-200">Tenant</th>}
                <th className="px-6 py-4 font-medium border-b border-slate-200">Property</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Month</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Amount</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Status</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200">Date Paid</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">Loading payments...</td>
                </tr>
              ) : visiblePayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No payments found matching your criteria.
                  </td>
                </tr>
              ) : visiblePayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">...{pay.id.slice(-6)}</td>
                  {(user?.role !== 'tenant' && user?.role !== 'Tenant') && <td className="px-6 py-4 text-sm text-slate-600">{pay.tenantName}</td>}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-slate-400" /> {pay.propertyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{pay.month}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{pay.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(pay.status)}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{pay.date}</td>
                  <td className="px-6 py-4 text-right">
                    {pay.status !== 'Paid' ? (
                      (user?.role === 'tenant' || user?.role === 'Tenant') ? (
                        <button 
                          onClick={() => handlePayClick(pay)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleManualMarkPaid(pay.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300"
                        >
                          Mark Paid
                        </button>
                      )
                    ) : (
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                        <Download size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initiate Payment Modal */}
      {isInitiateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Pay Rent</h2>
              <button onClick={() => setIsInitiateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {leases.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4">You don't have any active leases to pay rent for.</p>
                  <button onClick={() => setIsInitiateModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Close</button>
                </div>
              ) : (
                <form onSubmit={handleInitiatePay} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Lease Property</label>
                    <select 
                      required 
                      value={initiateData.leaseId} 
                      onChange={e => setInitiateData({...initiateData, leaseId: e.target.value})} 
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {leases.map(l => (
                        <option key={l._id} value={l._id}>{l.property?.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rent Month</label>
                    <select 
                      required 
                      value={initiateData.month} 
                      onChange={e => setInitiateData({...initiateData, month: e.target.value})} 
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {/* Generate next 3 months */}
                      {[0, 1, 2].map(offset => {
                        const d = new Date();
                        d.setMonth(d.getMonth() + offset);
                        const monthStr = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                        return <option key={monthStr} value={monthStr}>{monthStr}</option>;
                      })}
                    </select>
                  </div>

                  {initiateData.leaseId && (
                    <div className="bg-emerald-50 p-4 rounded-xl mt-4 border border-emerald-100">
                      <p className="text-emerald-700 text-sm mb-1">Rent Amount to Pay</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        ₹{leases.find(l => l._id === initiateData.leaseId)?.monthlyRent?.toLocaleString() || 0}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsInitiateModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                      Proceed
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {isPayModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Complete Payment</h2>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 text-sm">Amount Due</span>
                  <span className="text-2xl font-bold text-slate-900">₹{selectedPayment.amount?.toLocaleString()}</span>
                </div>
                <p className="text-slate-600 text-sm">{selectedPayment.month} Rent for {selectedPayment.propertyName}</p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Select Payment Method</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payMethod === 'upi' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="payment" value="upi" checked={payMethod === 'upi'} onChange={() => setPayMethod('upi')} className="mr-3 text-emerald-600 focus:ring-emerald-600" />
                      <span className="font-medium text-slate-900">UPI / QR Code (Razorpay)</span>
                    </label>
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payMethod === 'card' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="payment" value="card" checked={payMethod === 'card'} onChange={() => setPayMethod('card')} className="mr-3 text-emerald-600 focus:ring-emerald-600" />
                      <span className="font-medium text-slate-900">Credit / Debit Card (Razorpay)</span>
                    </label>
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payMethod === 'bank' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="payment" value="bank" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} className="mr-3 text-emerald-600 focus:ring-emerald-600" />
                      <span className="font-medium text-slate-900">Bank Transfer (Manual)</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 px-4 rounded-xl transition-colors shadow-sm">
                  Pay ₹{selectedPayment.amount?.toLocaleString()}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
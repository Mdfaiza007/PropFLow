export const properties = [
  { id: 1, name: 'Sunrise Apartments', address: 'Mayur vihar-1,East Delhi', rent: 25000, type: 'Apartment', beds: 2, baths: 2, area: 1200, status: 'Occupied', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Green Valley Villas', address: 'Vasant vihar, South Delhi', rent: 45000, type: 'Villa', beds: 3, baths: 3, area: 2400, status: 'Vacant', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Arsalan Heights', address: '78 Dwarka Sector 11, Delhi', rent: 18000, type: 'Apartment', beds: 1, baths: 1, area: 800, status: 'Occupied', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Doreamon Residency', address: '12 Vasant Kunj, Delhi', rent: 35000, type: 'Apartment', beds: 3, baths: 2, area: 1800, status: 'Occupied', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60' }
];

export const tenants = [
  { id: 1, name: 'Sunny Kumar', email: 'sunny@gmail.com', phone: '+91 98765 43210', propertyId: 1, propertyName: 'India Today Apartments', rent: 22000, leaseStatus: 'Active', leaseEnd: '2026-08-15', avatar: 'https://i.pravatar.cc/150?u=amit' },
  { id: 2, name: 'Ali Zen', email: 'alizen@gmail.com', phone: '+91 91234 56789', propertyId: 69, propertyName: 'Azadar Heights', rent: 18000, leaseStatus: 'Expiring', leaseEnd: '2026-05-01', avatar: 'https://i.pravatar.cc/150?u=neha' },
  { id: 3, name: 'Md Hamza', email: 'doreamon@gmail.com', phone: '+91 99887 76655', propertyId: 4, propertyName: 'Doreamon Residency', rent: 25000, leaseStatus: 'Active', leaseEnd: '2026-01-10', avatar: 'https://i.pravatar.cc/150?u=vikram' }
];

export const payments = [
  { id: 'PAY-101', tenantName: 'Arham Rehan', propertyName: 'Sunrise Apartments', month: 'April 2026', amount: 25000, status: 'Paid', date: '2026-04-02' },
  { id: 'PAY-102', tenantName: 'Arsalan Raza', propertyName: 'Metro Heights', month: 'April 2026', amount: 18000, status: 'Pending', date: '-' },
  { id: 'PAY-103', tenantName: 'Mohammad Faizan', propertyName: 'Faizan Residency', month: 'April 2026', amount: 35000, status: 'Paid', date: '2026-04-05' },
  { id: 'PAY-104', tenantName: 'Mohd Aadil', propertyName: 'Garud Apartments', month: 'March 2026', amount: 25000, status: 'Paid', date: '2026-03-01' },
  { id: 'PAY-105', tenantName: 'Adil Hussain', propertyName: 'Sadhbhavna Apartments', month: 'March 2026', amount: 18000, status: 'Overdue', date: '-' }
];

export const leases = [
  { id: 'L-001', tenantName: 'Md Zayn', propertyName: 'Sunrise Apartments', startDate: '2023-08-15', endDate: '2026-08-15', rent: 25000, deposit: 50000, status: 'Active' },
  { id: 'L-002', tenantName: 'Furkan Ali Sultan', propertyName: 'Arsalan Heights', startDate: '2023-05-01', endDate: '2026-05-01', rent: 18000, deposit: 36000, status: 'Expiring' },
  { id: 'L-003', tenantName: 'Md Hamza', propertyName: 'Doreamon Residency', startDate: '2024-01-10', endDate: '2027-01-10', rent: 35000, deposit: 70000, status: 'Active' },
  { id: 'L-004', tenantName: 'Md Asad', propertyName: 'Green Valley Villas', startDate: '-', endDate: '-', rent: 45000, deposit: 90000, status: 'Draft' }
];

export const maintenanceRequests = [
  { id: 'REQ-01', title: 'Leaking Faucet', propertyName: 'Sunrise Apartments', tenantName: 'Arham Rehan', priority: 'Low', status: 'Resolved', date: '2026-03-20', description: 'Kitchen faucet is leaking continuously.' },
  { id: 'REQ-02', title: 'AC Not Cooling', propertyName: 'Metro Heights', tenantName: 'Arsalan Raza', priority: 'High', status: 'In Progress', date: '2026-04-10', description: 'Living room AC is blowing warm air.' },
  { id: 'REQ-03', title: 'Broken Window', propertyName: 'Royal Residency', tenantName: 'Md Absar', priority: 'Medium', status: 'Pending', date: '2026-04-12', description: 'Bedroom window glass cracked due to storm.' },
  { id: 'REQ-04', title: 'Water Heater Issue', propertyName: 'Sunrise Apartments', tenantName: 'Ali Zen', priority: 'High', status: 'Assigned', date: '2026-04-13', description: 'No hot water in the master bathroom.' }
];

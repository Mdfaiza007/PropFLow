export const initialProperties = [
  {
    id: 'P1',
    name: "Sadhbhawna Apartments",
    address: "East Delhi",
    rent: 25000,
    type: 'Apartment',
    beds: 3,
    baths: 2,
    area: 1500,
    status: 'Active',
    },
  {
    id: 'P2',
    name: "Garud Apartments",
    address: "New Delhi",
    rent: 22000,
    type: 'Apartment',
    beds: 2,
    baths: 2,
    area: 1100,
    status: 'Active',
    },
{ 
    id: 'P3',
    name: "Safina Apartments",
    address: "North East Delhi",
    rent: 15000,
    type: 'Apartment',
    beds: 1,
    baths: 1,
    area: 800,
    status: 'Maintenance',
  }
];

export const initialTenants = [
  {
    id: 'T1',
    name: "Sunny Kumar",
    email: "sunnysingh2525@gmail.com",
    phone: "+91 6236890460",
    propertyId: 'P1',
    rent: 25000,
    leaseEnd: '2026-12-31',
    status: 'Active',
  },
  {
    id: 'T2',
    name: "Ali Zen",
    email: "alizzen69@gmail.com",
    phone: "+91 7654345012",
    propertyId: 'P2',
    rent: 22000,
    leaseEnd: '2026-11-30',
    status: 'Active',
  },
  {
    id: 'T3',
    name: "Md Faizan",
    email: "faizan@gmail.com",
    phone: "+91 9876543210",
    propertyId: 'P3',
    rent: 15000,
    leaseEnd: '2026-12-31',
    status: 'Active',
  },
];

export const initialPayments = [
  {
    id: "PAY-1001",
    tenantId: 'T1',
    propertyId: 'P1',
    month: 'April 2026',
    amount: 25000,
    status: 'Paid',
    date: "2026-04-01",
  },
  {
    id: "PAY-1002",
    tenantId: 'T2',
    propertyId: 'P2',
    month: 'April 2026',
    amount: 22000,
    status: 'Pending',
    date: "2026-04-10",
  },
  {
    id: "PAY-1003",
    tenantId: 'T3',
    propertyId: 'P3',
    month: 'April 2026',
    amount: 15000,
    status: 'Overdue',
    date: "2026-04-20",
  },
];

export const initialLeases = [
  {
    id: "LSE-001",
    tenantId: 'T3',
    propertyId: 'P3',
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    rent: 15000,
    deposit: 30000,
    status: 'Active',
  },
  {
    id: "LSE-002",
    tenantId: 'T1',
    propertyId: 'P1',
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    rent: 25000,
    deposit: 50000,
    status: 'Expiring Soon',
  },
];

export const initialMaintenance = [
  {
    id: "MNT-101",
    title: "Leaking Pipe in Kitchen",
    propertyId: 'P2',
    tenantId: 'T2',
    priority: "High",
    status: "Open",
    date: "2026-04-20",
    description: "Leaking pipe under the sink.",
  },
  {
    id: "MNT-102",
    title: "AC Not Cooling",
    propertyId: 'P1',
    tenantId: 'T1',
    priority: "Medium",
    status: "In Progress",
    date: "2026-04-18",
    description: "Master bedroom AC is blowing warm air.",
  },
];

// Dashboard ke status aur recent activities (Ye Dashboard component me use honge)
export const dashboardStats = {
  totalProperties: 3,
  activeTenants: 45,
  monthlyRevenue: "6.4L",
  pendingMaintenance: 4
};

export const recentActivities = [
  {
    id: 1,
    type: "Payment",
    message: "Rent recieved for unit 102",
    date: "Today 8:00 AM",
    status: "success",
  },
  {
    id: 2,
    type: "Maintenance",
    message: "Plumbing issue in Flat number 155G",
    date: "Yesterday",
    status: "pending",
  },
  {
    id: 3,
    type: "New Tenant",
    message: "Faizan moved to flat number c-23",
    date: "2 days ago",
    status: "info",
  },
];
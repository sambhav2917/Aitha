// 1. In-memory database for Companies
let mockCompanies = [
  { type: 'PAID POC', typeColor: 'bg-blue-100 text-blue-700', name: 'Nexus Dynamics Ltd', state: 'California', country: 'USA', contact: 'Sarah Jenkins', mobile: '+1 415-555-0123', id: 'NX-90432', start: 'Jan 12, 2024', end: 'Jan 12, 2025', status: 'Active', statusActive: true },
  { type: 'LICENSED', typeColor: 'bg-gray-100 text-gray-700', name: 'Vertex Solutions', state: 'Ontario', country: 'Canada', contact: 'Marc-André L.', mobile: '+1 613-555-0199', id: 'VX-11822', start: 'Mar 05, 2023', end: 'Mar 05, 2024', status: 'Non-Active', statusActive: false, redEnd: true },
  { type: 'ENTERPRISE', typeColor: 'bg-indigo-100 text-indigo-700', name: 'Global Reach Corp', state: 'NSW', country: 'Australia', contact: 'David Chen', mobile: '+61 2-5550-1234', id: 'GR-77301', start: 'Aug 20, 2023', end: 'Aug 20, 2026', status: 'Active', statusActive: true },
  { type: 'TRIAL', typeColor: 'bg-gray-200 text-gray-600', name: 'CloudScale Inc', state: 'Berlin', country: 'Germany', contact: 'Elena Schmidt', mobile: '+49 30 1234567', id: 'CS-44192', start: 'Oct 01, 2024', end: 'Nov 01, 2024', status: 'Active', statusActive: true }
];

// 2. Fetch Licenses (Restored full data)
export const fetchLicenses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'N', color: 'bg-indigo-100 text-indigo-700', name: 'Nexus Dynamics', plan: 'ENTERPRISE', key: '•••• - 7X9P', seatsUsed: 420, seatsTotal: 500, renewal: 'Dec 12, 2023', autoRenew: true },
        { id: 'V', color: 'bg-gray-200 text-gray-700', name: 'Vanguard Systems', plan: 'PRO', key: '•••• - M2L1', seatsUsed: 48, seatsTotal: 50, renewal: 'Nov 04, 2023', autoRenew: false, expiring: true },
        { id: 'S', color: 'bg-gray-200 text-gray-700', name: 'Stellar Labs', plan: 'STANDARD', key: '•••• - 99R2', seatsUsed: 5, seatsTotal: 20, renewal: 'Jan 20, 2024', autoRenew: true },
        { id: 'A', color: 'bg-indigo-100 text-indigo-700', name: 'Aura Cloud', plan: 'ENTERPRISE', key: '•••• - XG01', seatsUsed: 850, seatsTotal: 1000, renewal: 'Oct 28, 2023', autoRenew: true },
      ]);
    }, 800); // 800ms loading simulation
  });
};

// 3. Fetch Companies
export const fetchCompanies = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockCompanies]); 
    }, 600); // 600ms loading simulation
  });
};

// 4. Register New Company
export const registerCompany = async (companyData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Format the incoming form data to match our table structure
      const newCompany = {
        type: companyData.accountType,
        typeColor: companyData.accountType === 'ENTERPRISE' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700',
        name: companyData.name,
        state: companyData.state,
        country: companyData.country,
        contact: companyData.contactName,
        mobile: companyData.mobile,
        id: `${companyData.code}-${Math.floor(Math.random() * 10000)}`, // Generate a fake ID
        start: companyData.start || 'Today',
        end: companyData.end || 'Next Year',
        status: 'Active',
        statusActive: true
      };
      
      // Save it to our fake DB
      mockCompanies.unshift(newCompany); // Puts it at the top of the list
      
      resolve({ success: true, data: newCompany });
    }, 1000); // 1 second loading simulation
  });
};

// NEW: Fetch Audit Logs
export const fetchAuditLogs = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, timestamp: '2023-10-24 14:22:10', initials: 'JD', user: 'Jane Doe', action: 'EDIT', module: 'Licenses', description: 'Updated seat count for Enterprise License #LC-8822', ip: '192.168.1.42', avatarColor: 'bg-indigo-100 text-indigo-700' },
        { id: 2, timestamp: '2023-10-24 13:45:02', initials: 'MS', user: 'Mike Smith', action: 'DELETE', module: 'Company', description: 'Removed stale tenant profile "Old-Co Logistics"', ip: '172.16.254.1', avatarColor: 'bg-gray-200 text-gray-700' },
        { id: 3, timestamp: '2023-10-24 12:10:55', initials: 'AL', user: 'Alex Lee', action: 'CREATE', module: 'Settings', description: 'Created new global webhook for "Billing Events"', ip: '10.0.0.12', avatarColor: 'bg-blue-100 text-blue-700' },
        { id: 4, timestamp: '2023-10-24 10:30:11', initials: 'JD', user: 'Jane Doe', action: 'LOGIN', module: 'System', description: 'User login successful from approved device', ip: '192.168.1.42', avatarColor: 'bg-indigo-100 text-indigo-700' },
        { id: 5, timestamp: '2023-10-24 09:15:44', initials: 'SA', user: 'System Admin', action: 'EDIT', module: 'Settings', description: 'Modified firewall outbound rules for Region-US-East', ip: '45.23.112.9', avatarColor: 'bg-red-100 text-red-700' },
      ]);
    }, 600);
  });
};
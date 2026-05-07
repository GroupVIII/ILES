import React from 'react';
import StudentDashboard from './StudentDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import AcademicSupervisorDashboard from './AcademicSupervisorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ user, setAuthData }) => {
  
  const handleLogout = () => {
    // THE FIX: Shred the token from the tab's memory when logging out
    sessionStorage.removeItem('access_token');
    setAuthData(null);
  };

  switch (user.role) {
    case 'STUDENT': 
      return <StudentDashboard user={user} onLogout={handleLogout} />;
    case 'WORKPLACE_SUPERVISOR': 
      return <SupervisorDashboard user={user} onLogout={handleLogout} />;
    case 'ACADEMIC_SUPERVISOR': 
      return <AcademicSupervisorDashboard user={user} onLogout={handleLogout} />;
    case 'ADMIN': 
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    default: 
      return <div style={{ color: 'white', padding: '2rem' }}>Error: Invalid role.</div>;
  }
};

export default Dashboard;
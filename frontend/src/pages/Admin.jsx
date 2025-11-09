import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';

const Admin = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>Access Denied</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
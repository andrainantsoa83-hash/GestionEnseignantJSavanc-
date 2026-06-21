import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="main-wrapper">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default MainLayout;

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};


export default CustomerLayout;

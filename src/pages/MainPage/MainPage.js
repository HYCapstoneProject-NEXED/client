import React from 'react';

function MainPage() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Home</h1>
      <p>Your Token: {token}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default MainPage;

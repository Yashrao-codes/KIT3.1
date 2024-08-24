import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const Login = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogin = () => {
    const newDeviceId = uuidv4();
    localStorage.setItem('deviceId', newDeviceId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('deviceId');
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>You are logged in!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <button onClick={handleLogin}>Login with Device</button>
        </div>
      )}
    </div>
  );
};

export default Login;

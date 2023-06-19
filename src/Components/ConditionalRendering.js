import React, {useState} from 'react';


// ------------ Conditional Rendering Example --------------- //

export default function ConditionalRenderingDemo() {
  
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    const handleLogin = () => {
      setIsLoggedIn(true);
    };
  
    const handleLogout = () => {
      setIsLoggedIn(false);
    };
    let message;
  
    if (isLoggedIn) {
      message = <p>Click on Logout Button For Expire Your Session</p>;
    } else {
      message = <p>Please Login First To Access The Portal</p>
    }
  
    return (
      <>
        <div className='mt-5'>
          {isLoggedIn ? (
            <div>
              <h2>Welcome, User!</h2>
              <button className='btn rounded-pill btn-danger' onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div>
              <h2>Login First!</h2>
              <button className='btn rounded-pill btn-success' onClick={handleLogin}>Login</button>
            </div>
          )}
        </div>
        <div>
          {message}
        </div>
      </>
    );
  }
  
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Header = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data to check if logged in
    fetch(`${backendUrl}/dashboard`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      });
  }, [backendUrl]);

  const handleLogin = () => {
    window.location.href = `${backendUrl}/auth/login`; // Redirect to Discord OAuth2 login
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/logout`, { credentials: 'include', method: 'POST' });
      if (response.ok) {
        setUser(null); // Clear user state
        navigate('/'); // Redirect to the home page
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Print Queue</h1>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="relative inline-block">
              <button
                onClick={toggleDropdown}
                className="text-white font-bold py-2 px-4 rounded hover:bg-gray-700"
              >
                {user.username} <span className="ml-2">▼</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

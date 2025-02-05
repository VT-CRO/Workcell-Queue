import { useState, useEffect } from 'react';
import UploadSection from '../components/UploadSection';
import PrintQueue from '../components/PrintQueue';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null); // Error handling

  useEffect(() => {
    // Fetch user data
    fetch(`${backendUrl}/dashboard`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          setError('Unauthorized access. Please log in.');
          return null;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch user data.');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data); // Set the full user object
        setError(null); // Clear any existing error
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching user data.');
      });

    // Fetch queue data
    fetchQueue();
  }, []);

  const fetchQueue = () => {
    fetch(`${backendUrl}/queue`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch the print queue.');
        }
        return res.json();
      })
      .then((data) => {
        setQueue(data);
        setError(null); // Clear any existing error
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching the print queue.');
      });
  };

  const handleDownload = () => {
    if (user) {
      const downloadUrl = `${backendUrl}/${user.uuid}/api/download`;
      window.location.href = downloadUrl; // Redirect to download URL
    }
  };

  return (
    <section className="container mx-auto p-8 pt-10">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user ? (
        <>
          {/* Updated Download Configuration Button */}
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transition-all duration-200 flex items-center mb-10" // Added 80px of margin below
            onClick={handleDownload}
          >
            Download Configuration
          </button>
          <UploadSection refreshQueue={fetchQueue} />
          <PrintQueue queue={queue} refreshQueue={fetchQueue} user={user} />
        </>
      ) : (
        <p>You must log in to access this page.</p>
      )}
    </section>
  );
};

export default Dashboard;

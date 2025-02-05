import { useState, useEffect } from 'react';
import UploadSection from '../components/UploadSection';
import PrintQueue from '../components/PrintQueue';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState(null); // State for server-specific nickname
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
        setNickname(data.nickname); // Set server-specific nickname
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

  const getDisplayName = (user, nickname) => {
    return nickname || user.username; // Use nickname if it exists, otherwise fallback to username
  };

  return (
    <section className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user ? (
        <>
          <p className="mb-4">Welcome, {getDisplayName(user, nickname)}</p> {/* Render username */}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
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

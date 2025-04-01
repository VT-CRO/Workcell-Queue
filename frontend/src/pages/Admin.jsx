import { useState, useEffect } from 'react';
import UserCard from '../components/UserCard.jsx';


const backendUrl = import.meta.env.VITE_FRONTEND_URL;

const Admin = () => {
  const [Admin, setAdmin] = useState(null);
  const [Stats, setStats] = useState(null);
  const [Error, setError] = useState(null);
  const [isOn, setIsOn] = useState(null);

  const checkQueue = () => {
    fetch(`${backendUrl}/check`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 200) {
          setIsOn(true);
        }
        else {
          setIsOn(false);
        }
      })
  }

  const flipQueue = () => {
    fetch(`${backendUrl}/user/queueToggle`, { credentials: 'include' });
    checkQueue();
  }


  useEffect(() => {
    // Fetch user data
    fetch(`${backendUrl}/users`, { credentials: 'include' })
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
        setAdmin(data);
        setError(null); // Clear any existing error
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching user data.');
      });

    fetch(`${backendUrl}/users/statistics`, { credentials: 'include' })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching user data.');
      });

      checkQueue();
  }, []);


  return (
    <div className="p-6 space-y-6">

      {Admin ? <>
        {/* Stats Display */}
        {(Stats &&
          <div className="flex justify-center items-center">
            <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex space-x-6 items-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">{Stats.totalItemsInQueue}</span>
                <span className="text-gray-600">Total Items in Queue</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">{Stats.totalPrints}</span>
                <span className="text-gray-600">Total Prints</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-purple-600">{Stats.totalWeight.toFixed(3)}</span>
                <span className="text-gray-600">Total weight of prints (g)</span>
              </div>
            </div>
          </div>

        )}

        <div className="flex items-center space-x-4">
          <span>Toggle Queue:</span>
          <button
            onClick={() => flipQueue()}
            className={`relative w-12 h-6 rounded-full transition-colors 
          ${isOn ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform 
            ${isOn ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* User Cards */}

        {Admin.map((admin) => (
          <UserCard key={admin.id} user={admin} />
        ))} </>
        :
        <>You must be an admin to access this page</>}

    </div>
  );
};

export default Admin;

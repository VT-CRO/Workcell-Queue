import { useState, useEffect } from 'react';
import UserCard from '../components/UserCard.jsx';


const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const [Admin, setAdmin] = useState(null);
  const [Users, setUsers] = useState([]);
  const [Error, setError] = useState(null);

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
  }, []);


  return (
    <>
      {Admin ? <> {Admin.map((Admin) => (
        <div key={Admin.id}>
        <UserCard user={Admin} />
        </div>
      ))} </> 
      : 
      <>You must be an admin to access this page</>}
    </>
  );
};

export default Admin;

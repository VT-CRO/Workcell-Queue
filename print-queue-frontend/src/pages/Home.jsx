import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton';

const Home = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    // Check if the user is logged in
    fetch(`${backendUrl}/dashboard`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Not logged in');
        }
      })
      .then(() => {
        navigate('/dashboard'); // Redirect to the dashboard
      })
      .catch(() => {
        // User not logged in, stay on the home page
      });
  }, [backendUrl, navigate]);

  return (
    <section className="container mx-auto p-8 text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to the Print Queue System</h2>
      <p className="mb-6 text-lg">
        Log in with Discord to upload your G-code files and manage the print queue.
      </p>
      <LoginButton />
    </section>
  );
};

export default Home;

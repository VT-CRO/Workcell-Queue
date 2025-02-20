import { useState, useEffect } from 'react';
import UploadSection from '../components/UploadSection';
import PrintQueue from '../components/PrintQueue';
import { IoIosInformationCircleOutline } from "react-icons/io";

const backendUrl = import.meta.env.VITE_FRONTEND_URL;

const ConfigInstructionsModal = ({ onClose }) => {
  const instructions = [
    {
      title: "Step 1: Open Bambu Studio",
      text: (
        <>
          Download from{" "}
          <a
            href="https://download-link.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            here
          </a>
          .
        </>
      ),
      imageUrl:
        "https://user-images.githubusercontent.com/106916061/179006347-497d24c0-9bd6-45b7-8c49-d5cc8ecfe5d7.png",
    },
    {
      title: "Step 2: Add a new printer",
      text: "Under the prepare tab, click on the settings cog.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWZuPtphMBUoLQv1hS7lesOtHqK0kC56jdTVNb",
    },
    {
      title: "Step 3: Add Voron 2.4",
      text: "Scroll down until you see the Voron family and select Voron 2.4 300 0.4mm nozzle.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWZh6l6VMBUoLQv1hS7lesOtHqK0kC56jdTVNb",
    },
    {
      title: "Step 4: Import your downloaded configuration",
      text: "Under File, Import, Import Configs, select the downloaded configuration file.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MW5F16rRDt0dbzc7Vr2yoMTWhkx8UngqP3HLEB",
    },
    {
      title: "Step 5: Apply the printer preset",
      text: "Click on the printer dropdown and select CRO Queue",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWXNI7A3CUy3iM0pFuJrY6dQl8bfVczEwtj4gh",
    },
    {
      title: "Step 6: Apply the filament preset",
      text: "We recommend using the CRO PLA preset that is supplied, but you can also use your own. Just ensure the queue is using that specific filament.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWHJBUblVl16wSAn5XFVhMoObWY39rEgQeqvm4",
    },
    {
      title: "Step 7: Apply the process preset",
      text: "We provide both a standard and strength 0.20mm layer height profile. These are the recommended profiles for the queue, but feel free to use your own/the defaults.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWAHRwOmfa25W4B7HwGiysRYtoq1FKbSNgj3Ce",
    },
    {
      title: "Step 8: Upload to the queue",
      text: "To upload to the queue, you can click on the print button in the top right hand corner.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWFlMuqOxZPDI5wWytdelM4b2RJVaKv97nGi31",
    },
    {
      title: "Step 9: Press print",
      text: "Hit print!",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWs9cXqYSNVebR7uYQ8slJIF36w9cpx1fnikCg",
    },
    {
      title: "Step 10: View your spot in the queue",
      text: "You can check the website to see your spot in the queue.",
      imageUrl:
        "https://n21bs7xowo.ufs.sh/f/k2EZSuqLb2MWAXhNKNfa25W4B7HwGiysRYtoq1FKbSNgj3Ce",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-full">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &#x2715;
        </button>
        <h3 className="text-2xl font-bold mb-4 text-center">
          How to Use Configuration
        </h3>
        <div className="space-y-6">
          {instructions.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center">
              <img
                src={step.imageUrl}
                alt={step.title}
                className="w-64 h-auto rounded-md mb-4 md:mb-0 md:mr-6"
              />
              <div>
                <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const fetchUser = () => {
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
        setUser(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching user data.');
      });
  };

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
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred while fetching the print queue.');
      });
  };

  useEffect(() => {
    fetchUser();
    fetchQueue();
  }, []);

  // Handles the download/update configuration.
  const handleDownload = () => {
    if (user) {
      const downloadUrl = `${backendUrl}/${user.uuid}/api/download`;
      // Redirecting to the download URL.
      // Assuming the backend updates the configVersion when this endpoint is hit.
      window.location.href = downloadUrl;
      setTimeout(() => {
        fetchUser();
      }, 2000);
    }
  };

  return (
    <section className="container mx-auto p-8 pt-10">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user ? (
        <>
          <div className="flex flex-wrap items-center space-x-4 mb-10">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              shadow-md transition-all duration-200 flex items-center"
              onClick={handleDownload}
            >
              Download Configuration
            </button>
            {/* Info button using IoIosInformationCircleOutline */}
            <button
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center 
                         justify-center text-blue-500 hover:bg-gray-300 transition-all 
                         duration-200"
              onClick={() => setShowInstructions(true)}
            >
              <IoIosInformationCircleOutline size={24} />
            </button>
          </div>
          {/* Render UploadSection and PrintQueue only when configuration is up to date */}
          {user.configVersion === user.serverConfigVersion && (
            <>
              <UploadSection refreshQueue={fetchQueue} />
              <PrintQueue queue={queue} refreshQueue={fetchQueue} user={user} />
            </>
          )}
        </>
      ) : (
        <p>You must log in to access this page.</p>
      )}
      {showInstructions && (
        <ConfigInstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </section>
  );
};

export default Dashboard;

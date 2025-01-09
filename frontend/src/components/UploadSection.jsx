import { useState } from 'react';
import PropTypes from 'prop-types';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UploadSection = ({ refreshQueue }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = () => {
    if (!file) return alert('Please select a file first');
    const formData = new FormData();
    formData.append('gcode', file);

    fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        refreshQueue(); // Refresh the queue after successful upload
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Upload G-code</h3>
      <div className="flex items-center space-x-4">
        <input type="file" accept=".gcode" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

UploadSection.propTypes = {
  refreshQueue: PropTypes.func.isRequired,
};

export default UploadSection;

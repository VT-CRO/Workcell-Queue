import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaUpload } from 'react-icons/fa'; // Import the FaUpload icon

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
      .then(() => {
        refreshQueue(); // Refresh the queue after successful upload
        setFile(null); // Reset file input
        document.querySelector('input[type="file"]').value = ''; // Clear file input field
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Upload G-code</h3>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Choose File Button */}
        <div className="relative">
          <input
            type="file"
            accept=".gcode"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transition-all duration-200"
          >
            Choose File
          </label>
        </div>

        {/* Display File Name */}
        {file && (
          <p className="text-gray-700 text-sm sm:text-base break-all">
            {file.name}
          </p>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className={`px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition-all duration-200 flex items-center ${
            !file ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!file} // Disable button if no file is selected
        >
          <FaUpload className="w-5 h-5 mr-2" /> {/* FaUpload icon */}
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

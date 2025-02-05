import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaUpload } from 'react-icons/fa';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UploadSection = ({ refreshQueue }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null); // State for error messages

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Clear any previous error when a new file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('gcode', file);

    try {
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        // Extract the error message from the response
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload the file');
        return;
      }

      const data = await response.json();
      refreshQueue(); // Refresh the queue after successful upload
      setFile(null); // Clear the file input
      document.querySelector('input[type="file"]').value = ''; // Reset the file input field
      setError(null); // Clear any previous error
    } catch (err) {
      console.error(err);
      setError('An error occurred while uploading the file. Please try again.');
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Upload G-code</h3>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
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

        {file && (
          <p className="text-gray-700 text-sm sm:text-base break-all">
            {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          className={`px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition-all duration-200 flex items-center ${
            !file ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!file} // Disable button if no file is selected
        >
          <FaUpload className="w-5 h-5 mr-2" />
          Upload
        </button>
      </div>

      {/* Display error message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

UploadSection.propTypes = {
  refreshQueue: PropTypes.func.isRequired,
};

export default UploadSection;

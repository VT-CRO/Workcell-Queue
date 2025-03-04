import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';
import { FaToggleOff } from 'react-icons/fa';
import { FaToggleOn } from 'react-icons/fa';
import { useState } from 'react';
import Thumbnail from './Thumbnail';
import ToggleOverride from './ToggleOverride';


const PrintQueue = ({ queue, refreshQueue, user }) => {
  const backendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
  const [error, setError] = useState(null); // State for error messages

  
  const handleOverride = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/queue/${id}`, {
        method: 'PATCH', //not DELETE as it was in handleDelete
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Override toggled successfully');
        refreshQueue(); // Refresh the queue after deletion
        setError(null); // Clear any previous error
      } else {
        setError('Failed to toggle override attribute. Please try again.');
        console.error('Failed to toggle override attribute');
      }
    } catch (error) {
      setError('Error toggling override attribute. Please check your connection.');
      console.error('Error toggling override attribute:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/queue/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Item deleted successfully');
        refreshQueue(); // Refresh the queue after deletion
        setError(null); // Clear any previous error
      } else {
        setError('Failed to delete item. Please try again.');
        console.error('Failed to delete item');
      }
    } catch (error) {
      setError('Error deleting item. Please check your connection.');
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="print-queue">
      <h3 className="text-lg font-bold mb-2">Print Queue</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>} {/* Error message */}
      {queue.length > 0 ? (
        <ul>
          {queue.map((item) => (
            <li key={item.id} className="mb-4 flex items-center">
              {/* Thumbnail */}
              <Thumbnail queueItemId={item.id} backendUrl={backendUrl} />

              {/* File details */}
              <div className="ml-4 flex flex-col">


                <div className="flex items-center">
                  {/* File name */}
                  <span
                    className="font-medium"
                    style={{ color: '#000000' }} // Black text for filename
                  >
                    {item.originalFilename}
                  </span>

                  {/* Trash can icon */}                  
                  {(item.uploader === user.username || item.uploader === user.nickname || user.isAdmin === true) && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>                    
                  )}

                  {/* SliderToggle Override */}      
                  {(item.uploader === user.username || item.uploader === user.nickname) && ( //if item.override == true , or if its false etc    
                  //item.override == false


                    <button 
                      onClick={() => handleOverride(item.id) } //; handleOverride(qItemId)
                       
                      className="text-black-500 hover:text-black-700 ml-6"
                      aria-label="Override"
                    >
                      <ToggleOverride over={item.override}/>
                    </button>

                  
                  )}
                         
                  
                  
                </div>
                {/* Uploader details */}
                <span
                  className="text-sm"
                  style={{ color: '#444444' }} // Dark gray text for uploader
                >
                  By {item.uploader}
                </span>
                
              
              </div>
            </li>
            
          ))}
        </ul>
      ) : (
        <p>No items in the queue.</p>
      )}
    </div>
  );
};

PrintQueue.propTypes = {
  queue: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      originalFilename: PropTypes.string.isRequired,
      uploader: PropTypes.string.isRequired,
      uploadedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  refreshQueue: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    nickname: PropTypes.string, // Add nickname as optional
  }).isRequired,
};

export default PrintQueue;

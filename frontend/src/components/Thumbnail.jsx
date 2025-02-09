import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Thumbnail = ({ queueItemId, backendUrl }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await fetch(`${backendUrl}/queue/${queueItemId}/thumbnail`);
        if (response.ok) {
          const data = await response.json();
          setThumbnail(data.thumbnail);
        } else {
          console.error('Failed to fetch thumbnail:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
      }
    };

    fetchThumbnail();
  }, [queueItemId, backendUrl]);

  return (
    <div>
      {thumbnail ? (
        <img
        src={`data:image/png;base64,${thumbnail}`}
        alt="G-code Thumbnail"
        className="w-24 h-24 object-cover rounded-md"
      />
      ) : (
        <img
        src="/nothumbnail.png"
        alt="No Thumbnail Image"
        className="w-24 h-24 object-cover rounded-md"
      />
        
        
      )}
    </div>
  );
};

// Define prop types
Thumbnail.propTypes = {
  queueItemId: PropTypes.string.isRequired,
  backendUrl: PropTypes.string.isRequired,
};

export default Thumbnail;

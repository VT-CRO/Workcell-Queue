import { FaToggleOff } from 'react-icons/fa';
import { FaToggleOn } from 'react-icons/fa';

import { useEffect, useState } from 'react';



const ToggleOverride = ({ qItemId }) => { //THIS IS NOT WORKING YET
    const [isActive, setIsActive] = useState(false); //State for Toggle Slider
   
    const handleOverride = async (qItemId) => {
      try {
        const response = await fetch(`${backendUrl}/queue/${qItemId}`, {
          method: 'DELETE', //will be changed to PATCH
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

   
      <button 
        onClick={() => { setIsActive(!isActive); handleOverride(qItemId)} }
                       
        className="text-black-500 hover:text-black-700 ml-6"
        aria-label="Override"
        >
        {isActive ? <FaToggleOn size={'2em'} />  : <FaToggleOff size={'2em'}/>}
      </button>
      
    );
}
   
   
export default ToggleOverride;
   
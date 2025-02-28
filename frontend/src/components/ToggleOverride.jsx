import PropTypes from 'prop-types';
import { useState } from 'react';

import { FaToggleOff } from 'react-icons/fa';
import { FaToggleOn } from 'react-icons/fa';


const ToggleOverride = ({over}) => { //({qItemId}) no longer needed
    const [isActive, setIsActive] = useState(over); //State for Toggle Slider
   

    return (

   
      <button 
        onClick={() => { setIsActive(!isActive) } } //; handleOverride(qItemId)
                       
        className="text-black-500 hover:text-black-700 ml-6"
        aria-label="Override"
        >
        {isActive ? <FaToggleOn size={'2em'} />  : <FaToggleOff size={'2em'}/>}
      </button>
      
    );
}
   

ToggleOverride.propTypes = {
   over: PropTypes.bool.isRequired
};

   
export default ToggleOverride;
   
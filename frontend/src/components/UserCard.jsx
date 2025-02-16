import { useState } from 'react';

const UserCard = ({ user }) => {
    const [adminLevel, setAdminLevel] = useState(user.adminLevel || 0);

    const handleSliderChange = (event) => {
        setAdminLevel(event.target.value);
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-start space-y-2 w-80 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{user.nickname}</h2>
            <p className="text-gray-500">Username: @{user.username}</p>
            <p className="text-gray-500">Email: {user.email}</p>
            <p className="text-gray-500">Total Prints Queued: {user.totalPrintsQueued}</p>
            <p className="text-sm font-medium text-blue-600">Admin Level: {adminLevel}%</p>
            <div className="flex items-center mt-2 w-full">
                <span className="text-gray-500 mr-2">0%</span>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={adminLevel} 
                    onChange={handleSliderChange} 
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" 
                />
                <span className="text-gray-500 ml-2">100%</span>
            </div>
        </div>
    );
};

export default UserCard;
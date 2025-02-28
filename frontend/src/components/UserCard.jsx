import { useState } from 'react';

const UserCard = ({ user }) => {
    const [adminLevel, setAdminLevel] = useState(user.adminLevel || 0);

    const handleSliderChange = (event) => {
        setAdminLevel(Number(event.target.value));
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-4 flex items-center space-x-6 w-full border border-gray-200">
            <p className="text-lg font-semibold text-gray-800">{user.nickname}</p>
            <p className="text-gray-500">Username: @{user.username}</p>
            <p className="text-gray-500">Email: {user.email}</p>
            <p className="text-gray-500">Total Prints Queued: {user.totalPrintsQueued}</p>
            
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-blue-600">Admin Level: {adminLevel}%</p>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={adminLevel} 
                    onChange={handleSliderChange} 
                    className="w-36 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" 
                />
            </div>
        </div>
    );
};

export default UserCard;

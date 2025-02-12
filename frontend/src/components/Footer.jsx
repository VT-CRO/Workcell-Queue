import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [version, setVersion] = useState("Loading...");
    const backendUrl = import.meta.env.VITE_FRONTEND_URL;
    console.log(backendUrl)

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch(`${backendUrl}/version`);
                if (response.ok) {
                    const data = await response.json();
                    setVersion(data.version);
                } else {
                    console.error("Failed to fetch version:", response.statusText);
                    setVersion("Error fetching version");
                }
            } catch (error) {
                console.error("Error fetching backend version:", error);
                setVersion("Error fetching version");
            }
        };

        fetchVersion();
    }, []);

    return (
        <footer className="bg-gray-900 text-white p-4 text-center">
            <p>VT CRO Print Queue - Backend Version: {version}</p>
        </footer>
    );
};

export default Footer;

import React, { useEffect, useState } from 'react'; // Import useState and useEffect
import { useNavigate } from 'react-router-dom';
import { getUserRoles } from '../../Api/api';

const NotFound = () => {
    const navigate = useNavigate();
    const [userRoles, setUserRoles] = useState([]); // State to store user roles

    useEffect(() => {
        const fetchRoles = async () => {
            const roles = await getUserRoles(); // Fetch roles asynchronously
            setUserRoles(roles); // Set the roles in state
        };
        fetchRoles(); // Call the function
    }, []); 




    const handleHomeClick = () => {
        if (userRoles.includes('manager')) {
            navigate('/staff-home');
        } else if (userRoles.includes('electrical') || userRoles.includes('civil') || userRoles.includes('mechanical')) {
            navigate('/supervisor');
        } else if (userRoles.includes('clerk')) {
            navigate('/clerk-home');
        } else {
            navigate('/user-home'); // Default route if no matching roles are found
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <button onClick={handleHomeClick} className="btn btn-primary">Go Home</button>
        </div>
    );
};

export default NotFound;

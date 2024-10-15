import React, { useEffect, useState } from 'react'; // Import useState and useEffect
import { Link, useNavigate} from 'react-router-dom';
import { getUserRoles } from '../../Api/api';

const ServerError = () => {
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
        navigate('/user-home');
    }
 };

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>500 - Internal Server Error</h1>
            <p>Oops! Something went wrong on our end.</p>
            <Link onClick={handleHomeClick} className="btn btn-primary">Go Home</Link>
        </div>
    );
};

export default ServerError;

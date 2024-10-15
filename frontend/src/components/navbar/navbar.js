import React, { useEffect, useState } from 'react'; // Import useState and useEffect
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance }  from '../../Api/api'

import '../../static/style.css';
import boppLogo from '../../static/pics/bopplogo.png'; 


const getUserRoles = async () => {
    try {
        // API call to fetch roles, assuming axiosInstance is properly configured
        const response = await axiosInstance.get('/roles/');
        
        // Check for successful response
        if (response.status === 200) {
            return response.data.roles || []; // Return roles if available
        } else {
            throw new Error('Failed to fetch user roles'); // Handle failure
        }
    } catch (error) {
        console.error('Error fetching user roles:', error); // Log any errors
        return [];
    }
};

// Navigation bar component
const NavigationBar = () => {
    const navigate = useNavigate(); // React Router hook to navigate between routes
    const location = useLocation(); // Get current location path
    const [userRoles, setUserRoles] = useState([]); // State to store user roles


    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout/', {}, { withCredentials: true });
        
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };


    useEffect(() => {
        const fetchRoles = async () => {
            const roles = await getUserRoles(); // Fetch roles asynchronously
            setUserRoles(roles); // Set the roles in state
        };
        fetchRoles(); // Call the function
    }, []); 


    // Check if the current route is for authentication (login or register)
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

    // Redirect to different homepages based on user roles
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

    // Navigate to the "Work Roles" page if the user is staff
    const handleWorkRolesClick = () => {
        if (userRoles.includes('staff')) {
            navigate('/alljobs');
        } else {
            navigate('/');
        }
    };

    // Determine if the user is logged in based on the availability of roles
    const isLoggedIn = userRoles.length > 0;

    // Only render the navigation bar if the user is not on an authentication route
    return (
        !isAuthRoute && (
            <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
                <Container>
                    {/* Logo and brand */}
                    <Navbar.Brand onClick={handleHomeClick}>
                        <img src={boppLogo} alt="BOPP Logo" />
                        <span className="d-none d-lg-inline">BOPP HOME MAINTENANCE</span> 
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {isLoggedIn && ( // Show navigation links if the user is logged in
                            <Nav className="me-auto">
                                {userRoles.includes('staff') ? (
                                    <>
                                        <Nav.Link 
                                            onClick={handleHomeClick} 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            HOME
                                        </Nav.Link>
                                        <Nav.Link 
                                            onClick={handleWorkRolesClick} 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            WORK ROLES
                                        </Nav.Link>

                                        {/* User Mode dropdown for staff */}
                                        <NavDropdown title="USER MODE" id="basic-nav-dropdown" className="me-4">
                                            <NavDropdown.Item as={Link} to="/jobs/create">CREATE JOB</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/jobs">CHECK JOB STATUS</NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/profile">PROFILE</NavDropdown.Item>
                                        </NavDropdown>
                                    </>
                                ) : (
                                    <>
                                        {/* Non-staff links */}
                                        <Nav.Link 
                                            onClick={handleHomeClick} 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            HOME
                                        </Nav.Link>
                                        <Nav.Link 
                                            as={Link} 
                                            to="/jobs/create" 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            CREATE JOB
                                        </Nav.Link>
                                        <Nav.Link 
                                            as={Link} 
                                            to="/jobs" 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            CHECK JOB STATUS
                                        </Nav.Link>
                                        <Nav.Link 
                                            as={Link} 
                                            to="/profile" 
                                            className="btn btn-secondary rounded-pill text-white me-4"
                                        >
                                            PROFILE
                                        </Nav.Link>
                                    </>
                                )}
                            </Nav>
                        )}
                        {isLoggedIn && ( // Show logout button if the user is logged in
                            <Nav className="ms-auto">
                                <Nav.Link 
                                    onClick={handleLogout} 
                                    className="btn btn-tertiary rounded-pill text-white"
                                >
                                    <i className="fas fa-sign-out-alt me-3"></i>Log Out
                                </Nav.Link>
                            </Nav>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    );
};

export default NavigationBar;
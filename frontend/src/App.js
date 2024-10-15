import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useEffect, useState } from 'react';

import Register from './Pages/auth/Register';
import Login from './Pages/auth/Login';
import JobList from './Pages/PesonalJobList';
import CreateJob from './Pages/CreateJob';
import ManagerHome from './Pages/ManagerHomepage';
import Home from './Pages/UserHomePage';
import ClerkHome from './Pages/ClerkHomepage';
import CreateCustomJob from './Pages/CreateCustomJob';
import SupHome from './Pages/SupervisorHomepage';
import JobStatistics from './components/Statscomponents/jobstat';
import CarouselCards from './components/card/Carouselcards';
import Loading from './components/Error components/loading';
import NavigationBar from './components/navbar/navbar';
import ProtectedRoute from './components/ProtectedRoute';
import StaffJobs from './Pages/Alljobs';
import SupervisorStats from './components/Statscomponents/SupervisorStats';
import Profile from './Pages/UserProfile';
import OTPPasswordReset from './Pages/auth/OtpPasswordReset';

const NotFound = lazy(() => import('./components/Error components/404'));
const ServerError = lazy(() => import('./components/Error components/500'));

const AppRoutes = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false); // State to manage loading screen

    useEffect(() => {
        const handleStartLoading = () => setIsLoading(true);
        const handleStopLoading = () => setIsLoading(false);

        handleStartLoading();
        const timer = setTimeout(() => {
            handleStopLoading();  // Stop loading after a delay to simulate network load
        }, 2000);  // Simulating a 1-second delay for loading

        return () => clearTimeout(timer);  // Cleanup timeout on unmount
    }, [location.pathname]);  // Detect route change based on pathname

    const isAuthRoute = [
        '/login',
        '/register',
        '/',
        '/404',
        '/500',
        '*',
        '/verify-otp',
    ].includes(location.pathname);

    return (
        <div>
            {!isAuthRoute && <NavigationBar />}  {/* Navbar will not be shown on auth and error pages */}
            
            {isLoading ? (  // Show loading while page is loading
                <Loading />
            ) : (
                <Suspense fallback={<Loading />}>  {/* Use Suspense fallback as well */}
                    <main style={{ marginTop: '100px' }}>
                        <Routes>
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/jobs/create" element={<ProtectedRoute element={CreateJob} allowedRoles={['user', 'staff']} />} />
                            <Route path="/jobs/create/custom" element={<ProtectedRoute element={CreateCustomJob} allowedRoles={['user', 'staff']} />} />
                            <Route path="/jobs" element={<ProtectedRoute element={JobList} allowedRoles={['user', 'staff']} />} />
                            <Route path="/clerk-home" element={<ProtectedRoute element={ClerkHome} allowedRoles={['clerk']} />} />
                            <Route path="/supervisor" element={<ProtectedRoute element={SupHome} allowedRoles={['staff']} />} />
                            <Route path="/supervisorstats" element={<ProtectedRoute element={SupervisorStats} allowedRoles={['staff']} />} />
                            <Route path="/jobstats" element={<ProtectedRoute element={JobStatistics} allowedRoles={['staff']} />} />
                            <Route path="/staff-home" element={<ProtectedRoute element={ManagerHome} allowedRoles={['staff']} />} />
                            <Route path="/user-home" element={<ProtectedRoute element={Home} allowedRoles={['user', 'staff']} />} />
                            <Route path="/alljobs" element={<ProtectedRoute element={StaffJobs} allowedRoles={['staff', 'clerk']} />} />
                            <Route path="/jobcaro" element={<ProtectedRoute element={CarouselCards} allowedRoles={['user', 'staff']} />} />
                            <Route path="/profile" element={<ProtectedRoute element={Profile} allowedRoles={['user']} />}/>

                            <Route path="/" element={<Login />} />
                            <Route path="*" element={<NotFound />} /> {/* Catch-all for 404 */}
                            <Route path="/500" element={<ServerError />} /> {/* 500 Error Page */}
                            <Route path="/Otp-Password-Reset" element={<OTPPasswordReset />} />
                        </Routes>
                    </main>
                </Suspense>
            )}
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
};

export default App;

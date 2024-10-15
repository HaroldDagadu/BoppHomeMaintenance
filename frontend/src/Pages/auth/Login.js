import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../Api/api'; // Ensure your axios instance is set up properly
import '../../static/LOGINOUT/css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const getUserRoles = async () => {
    try {
        const response = await axiosInstance.get('/roles/'); // Fetch roles after login
        if (response.status === 200) {
            return response.data.roles || [];
        } else {
            throw new Error('Failed to fetch user roles');
        }
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }
};

const Login = () => {
    const [formData, setFormData] = useState({
        phone_number: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = () => {
        if (!formData.phone_number || !formData.password) {
            return 'Please fill in all fields.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);  // Start loading
        setError('');  // Clear any existing error

        try {
            // Make login request
            const response = await axiosInstance.post('/login/', formData, {
                withCredentials: true  // Ensure cookies are sent with the request
            });

            // Fetch user roles after successful login
            const roles = await getUserRoles();

            // Determine redirect based on user roles
            let redirectPath = '/user-home';
            if (roles.includes('civil') || roles.includes('electrical') || roles.includes('mechanical')) {
                redirectPath = '/supervisor';
            } else if (roles.includes('clerk')) {
                redirectPath = '/clerk-home';
            } else if (roles.includes('manager')) {
                redirectPath = '/staff-home';
            }

            // Navigate to the correct path based on role
            navigate(redirectPath);
        } catch (error) {
            console.error('Login Error:', error);
            if (error.response && error.response.status === 401) {
                setError('Invalid phone number or password.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);  // Stop loading after request is complete
        }
    };

    return (
        <section className="ftco-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center mb-5">
                        <h2 className="heading-section">BOPP MAINTENANCE WEB APPLICATION</h2>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-md-12 col-lg-10">
                        <div className="wrap d-md-flex">
                            <div className="img"></div>
                            <div className="login-wrap p-4 p-md-5">
                                <div className="d-flex">
                                    <div className="w-100">
                                        <h3 className="mb-4">Sign In</h3>
                                    </div>
                                </div>

                                {/* Display error message */}
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="signin-form">
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="phone_number">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            className="form-control"
                                            placeholder="Phone Number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="password">
                                            Password
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                className="form-control"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <span
                                                className="input-group-text"
                                                onClick={toggleShowPassword}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <button
                                            type="submit"
                                            className="form-control btn btn-primary rounded submit px-3"
                                            disabled={loading} // Disable button when loading
                                        >
                                            {loading ? 'Signing In...' : 'Sign In'}
                                        </button>
                                    </div>
                                </form>

                                <p className="text-center">
                                    Not a member? <a href="/register">Sign Up</a>
                                </p>
                                <p className="text-center">
                                    Forgotten Password? <a href="/Otp-Password-Reset">Click here</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;

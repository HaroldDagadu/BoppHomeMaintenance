import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitForm, submitOtp, registerUser, resendOtp } from '../../Services/authservices'; // Fixed file name casing//+

import '../../static/LOGINOUT/css/style.css';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        community: '',
        house_number: '',
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false); 
    const [loading, setLoading] = useState(false);  // Loading state
    const [countdown, setCountdown] = useState(60);
    const [resendAttempts, setResendAttempts] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [message, setMessage] = useState('');
    const [requestId, setRequestId] = useState('');  
    const [prefix, setPrefix] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (showOtpField && countdown > 0) {
            timer = setInterval(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [showOtpField, countdown]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (formData.password !== formData.confirm_password) {
            setErrors({ confirm_password: "Passwords do not match" });
            setLoading(false);
            return;
        }
    
        try {
            const { requestId, prefix } = await submitForm(formData);
            setRequestId(requestId);
            setPrefix(prefix);
            setShowOtpField(true);
            setMessage('OTP has been sent to your phone number.');
        } catch (error) {
            setErrors(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (!otp || !requestId || !prefix) {
            setMessage('OTP, RequestId, and Prefix are required.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await submitOtp({ requestId, prefix, otp_code: otp });
            if (response.verified) {
                setMessage('OTP verified successfully');
                setOtpVerified(true);
                setShowOtpField(false);
            } else {
                setMessage('OTP verification failed. Please try again.');
            }
        } catch (error) {
            setMessage(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            if (!otpVerified) {
                setErrors({ otp: "Please verify your OTP first." });
                setLoading(false);
                return;
            }

            await registerUser(formData);
            setMessage('Registration successful.');
            navigate('/login');
        } catch (error) {
            setErrors(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendAttempts < 3) {
            try {
                await resendOtp(formData.phone_number);
                setResendAttempts(resendAttempts + 1);
                setCountdown(60);
                setCanResend(false);
                setMessage('OTP has been resent.');
            } catch (error) {
                setErrors({ resend: "Failed to resend OTP. Please try again." });
            }
        } else {
            setErrors({ resend: "You have exceeded the maximum number of resend attempts. Please wait 30 minutes." });
            setTimeout(() => setResendAttempts(0), 1800000); 
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
                                        <h3 className="mb-4">Sign Up</h3>
                                    </div>
                                </div>
                                {message && <p style={{ color: 'green' }}>{message}</p>}
                                <form onSubmit={handleSubmit} className="signin-form">
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="first_name">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-control"
                                            placeholder="First Name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}  // Disable after OTP
                                        />
                                        {errors.first_name && <span className="error">{errors.first_name}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="last_name">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-control"
                                            placeholder="Last Name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        />
                                        {errors.last_name && <span className="error">{errors.last_name}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="phone_number">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            className="form-control"
                                            placeholder="Phone Number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        />
                                        {errors.phone_number && <span className="error">{errors.phone_number}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="community">Community</label>
                                        <select
                                            name="community"
                                            className="form-control"
                                            value={formData.community}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        >
                                            <option value="">Select Community</option>
                                            <option value="Mill Village">Mill Village</option>
                                            <option value="Ahinkrom">Ahinkrom</option>
                                            <option value="Edumasi">Edumasi</option>
                                        </select>
                                        {errors.community && <span className="error">{errors.community}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="house_number">House Number</label>
                                        <input
                                            type="text"
                                            name="house_number"
                                            className="form-control"
                                            placeholder="House Number"
                                            value={formData.house_number}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        />
                                        {errors.house_number && <span className="error">{errors.house_number}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        />
                                        {errors.password && <span className="error">{errors.password}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="confirm_password">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            className="form-control"
                                            placeholder="Confirm Password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            required
                                            disabled={showOtpField || otpVerified}
                                        />
                                        {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
                                    </div>

                                    {!showOtpField && !otpVerified && (
                                        <div className="form-group">
                                            <button 
                                                type="submit" 
                                                className="form-control btn btn-primary rounded submit px-3"
                                                disabled={loading}  // Disable button while loading
                                            >
                                                {loading ? 'Submitting...' : 'Sign Up'}
                                            </button>
                                        </div>
                                    )}
                                </form>

                                {showOtpField && !otpVerified && (
                                    <form onSubmit={handleOtpSubmit} className="otp-form">
                                        <div className="form-group mb-3">
                                            <label className="label" htmlFor="otp">OTP</label>
                                            <input
                                                type="text"
                                                name="otp"
                                                className="form-control"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                            {errors.otp && <span className="error">{errors.otp}</span>}
                                        </div>
                                        <div className="form-group">
                                            <button 
                                                type="submit" 
                                                className="form-control btn btn-primary rounded submit px-3"
                                                disabled={loading}
                                            >
                                                {loading ? 'Verifying...' : 'Verify OTP'}
                                            </button>
                                        </div>
                                        {canResend ? (
                                            <button onClick={handleResendOtp} className="btn btn-secondary">Resend OTP</button>
                                        ) : (
                                            <p>Resend OTP in {countdown} seconds</p>
                                        )}
                                        {errors.resend && <span className="error">{errors.resend}</span>}
                                    </form>
                                )}

                                {otpVerified && (
                                    <div className="form-group">
                                        <button 
                                            onClick={handleRegister} 
                                            className="form-control btn btn-primary rounded submit px-3"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registering...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                )}

                                <p className="text-center">
                                    Already a member? <a href="/login">Sign In</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;

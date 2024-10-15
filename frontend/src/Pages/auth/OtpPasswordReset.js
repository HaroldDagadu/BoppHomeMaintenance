import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, resetPassword } from '../../Services/passwordResetService'; // Adjust path accordingly
import '../../static/LOGINOUT/css/style.css';

const OTPPasswordReset = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [requestId, setRequestId] = useState(''); // For tracking OTP session
    const [prefix, setPrefix] = useState(''); // For tracking OTP session
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState(''); // New password state
    const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password state
    const [loading, setLoading] = useState(false); // To handle loading states
    const [error, setError] = useState(''); // Error messages
    const [message, setMessage] = useState(''); // Success messages

    const navigate = useNavigate();

    // Helper function to validate phone number format
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\+?[0-9]{10,13}$/;  // Simple validation for international numbers
        return phoneRegex.test(phone);
    };

    // Handle sending OTP via Hubtel's OTP API
    const handleSendOTP = async () => {
        if (!validatePhoneNumber(phoneNumber.trim())) {
            setError('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { requestId, prefix } = await sendOTP(phoneNumber);  // Call service to send OTP
            setRequestId(requestId);
            setPrefix(prefix);
            setIsOtpSent(true);
            setMessage('OTP has been sent to your phone number.');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification
    const handleVerifyOTP = async () => {
        if (!otp.trim()) {
            setError('Please enter the OTP sent to your phone.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await verifyOTP(phoneNumber, requestId, prefix, otp);  // Call service to verify OTP
            setMessage('OTP verified successfully.');
            setIsOtpVerified(true);  // Set OTP verified flag to true
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle resetting password
    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPassword(phoneNumber, newPassword);  // Call service to reset password
            setMessage('Password has been reset successfully.');
            navigate('/login');  // Redirect to login page after successful password reset
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h3>Reset Password with OTP</h3>

            {/* Phone Number Input - Show only if OTP is not sent */}
            {!isOtpSent && (
                <div className="col-md-4">
                    <div className="form-group mb-3">
                    <h7>Please enter phone number in +233xxxxxxxxx </h7>

                    <label htmlFor="phoneNumber">Phone Number :</label>
                    <input
                        className="form-control"
                         type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number  +233xxxxxxxxx"
                        disabled={loading}
                    />
                    <button className="btn btn-primary" onClick={handleSendOTP} disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </div>
                </div>

            )}

            {/* OTP Input - Show if OTP is sent and not yet verified */}
            {isOtpSent && !isOtpVerified && (
                <div className="col-md-4">
                                        <div className="form-group mb-3">

                    <label htmlFor="otp">Enter OTP:</label>
                    <input
                        className="form-control"
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter the OTP"
                        disabled={loading}
                    />
                    <button className="btn btn-primary" onClick={handleVerifyOTP} disabled={loading}>
                        {loading ? 'Verifying OTP...' : 'Verify OTP'}
                    </button>
                </div>
                </div>

            )}

            {/* Password Reset Fields - Show if OTP is verified */}
            {isOtpVerified && (
                <div className="col-md-4">
                    <h2>Reset Your Password</h2>
                    <div className="form-group mb-3">

                    <label htmlFor="newPassword">New Password:</label>
                    <input
                         className="form-control"
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={loading}
                    />
                    </div>


                    <div className="form-group mb-3">

                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                       className="form-control"
      
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={loading}
                    />
                    </div>

                    <button className="btn btn-primary" onClick={handleResetPassword} disabled={loading}>
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </div>
            )}

            {/* Error and Success Messages */}
            {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
            {message && <p className="message" style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default OTPPasswordReset;

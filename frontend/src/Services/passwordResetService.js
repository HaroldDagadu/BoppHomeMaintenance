// src/services/passwordResetService.js
import { axiosInstance } from '../Api/api'; // Adjust the path accordingly

// Function to send OTP for password reset
export const sendOTP = async (phoneNumber) => {
    try {
        const response = await axiosInstance.post('/otp-login/', {
            phone_number: phoneNumber.trim(),
        });

        // Extract requestId and prefix from the response
        const { requestId, prefix } = response.data;

        if (!requestId || !prefix) {
            throw new Error('Missing requestId or prefix in response.');
        }

        return { requestId, prefix };
    } catch (error) {
        console.error("OTP Send Error:", error.response?.data || error.message);
        throw handleError(error, 'Failed to send OTP. Please try again.');
    }
};

// Function to verify the OTP
export const verifyOTP = async (phoneNumber, requestId, prefix, otp) => {
    try {
        const response = await axiosInstance.post('/verify-otp-password-reset/', {
            phone_number: phoneNumber.trim(),
            requestId: requestId,
            prefix: prefix,
            otp: otp.trim()
        });

        if (!response.data) {
            throw new Error('No response data returned from OTP verification.');
        }

        return response.data;  // Return response data if needed
    } catch (error) {
        console.error("OTP Verification Error:", error.response?.data || error.message);
        throw handleError(error, 'OTP verification failed. Please try again.');
    }
};

// Function to reset password after OTP verification
export const resetPassword = async (phoneNumber, newPassword) => {
    try {
        const response = await axiosInstance.post('/reset-password/', {
            phone_number: phoneNumber.trim(),
            new_password: newPassword.trim()
        });

        if (!response.data) {
            throw new Error('No response data returned from password reset.');
        }

        return response.data;  // Return response data if needed
    } catch (error) {
        console.error("Password Reset Error:", error.response?.data || error.message);
        throw handleError(error, 'Failed to reset password. Please try again.');
    }
};

// Centralized error handling function
const handleError = (error, defaultMessage) => {
    if (error.response) {
        // Server responded with a status other than 2xx
        switch (error.response.status) {
            case 400:
                return new Error(error.response.data.message || 'There was an issue with the request.');
            case 401:
                return new Error('Unauthorized request. Please check your credentials.');
            case 500:
                return new Error('Server error. Please try again later.');
            default:
                return new Error(defaultMessage);
        }
    } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        return new Error('No response from server. Please check your connection.');
    } else {
        // Something else happened in setting up the request
        console.error("Error:", error.message);
        return new Error(defaultMessage);
    }
};

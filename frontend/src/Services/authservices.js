import { axiosInstance } from '../Api/api'; // Adjust the path accordingly

// Service for submitting form data and sending OTP
export const submitForm = async (formData) => {
    try {
        const response = await axiosInstance.post('/verify-num/', formData);
        return response.data; // Return data to be handled by the component
    } catch (error) {
        handleError(error);
    }
};

// Service for submitting OTP
export const submitOtp = async (otpData) => {
    try {
        const response = await axiosInstance.post('/verify-otp/', otpData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Service for registering a user
export const registerUser = async (formData) => {
    try {
        const data = new FormData();
        for (const key in formData) {
            if (formData[key]) {  // Append only fields with values
                data.append(key, formData[key]);
            }
        }

        // Make a POST request with FormData (used for file uploads or mixed content)
        const response = await axiosInstance.post('/register/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',  // Set multipart content-type for file uploads
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Service for resending OTP
export const resendOtp = async (phone_number) => {
    try {
        const response = await axiosInstance.post('/resend-otp/', { phone_number });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Service for logging in a user
export const loginUser = async (formData) => {
    try {
        const response = await axiosInstance.post('token/', formData);

        // Fetch user roles from backend API (assume the token is stored in HttpOnly cookies)
        const rolesResponse = await axiosInstance.get('/roles/');
        const userRoles = rolesResponse.data.roles || [];

        // Determine the redirect path based on user roles
        return determineRedirectPath(userRoles);
    } catch (error) {
        handleLoginError(error);
    }
};

// Centralized error handling function
const handleError = (error) => {
    if (error.response) {
        // Server responded with a status other than 2xx
        console.error("API Error:", error.response.data);
        throw error.response.data; // Throw specific server error message
    } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        throw new Error('No response from server. Please check your connection.');
    } else {
        // Something else happened in setting up the request
        console.error("Error:", error.message);
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

// Centralized error handling for login-specific errors
const handleLoginError = (error) => {
    if (error.response && error.response.status === 401) {
        throw new Error('Invalid phone number or password.');
    } else {
        handleError(error); // Delegate to general error handler
    }
};

// Determine the redirect path based on user roles
const determineRedirectPath = (userRoles) => {
    let redirectPath = '/user-home';
    for (let role of userRoles) {
        switch (role) {
            case 'civil':
            case 'electrical':
            case 'mechanical':
                redirectPath = '/supervisor';
                break;
            case 'clerk':
                redirectPath = '/clerk-home';
                break;
            case 'manager':
                redirectPath = '/staff-home';
                break;
            default:
                break;
        }
    }
    return redirectPath;
};

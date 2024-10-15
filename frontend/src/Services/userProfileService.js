import { axiosInstance } from '../Api/api'; // Import your axios instance

// Function to fetch the current user's profile
export const fetchProfile = async () => {
    try {
        const response = await axiosInstance.get("/user/profile/", {
            withCredentials: true, // Ensures cookies are sent
        });

        // Validate the response data structure
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid profile data received.');
        }

        return response.data; // Return the profile data
    } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        throw new Error('Failed to fetch profile. Please try again later.'); // Rethrow error for handling by the caller
    }
};

// Function to update the user's profile
export const updateProfile = async (profileData) => {
    try {
        // Validate profileData
        if (!profileData || typeof profileData !== 'object') {
            throw new Error('Invalid profile data provided.');
        }

        const response = await axiosInstance.put('/user/profile-update/', profileData); // Adjust the endpoint if needed

        // Validate the response data structure
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response received while updating profile.');
        }

        return response.data; // Return the updated profile data
    } catch (error) {
        console.error('Error updating profile:', error.response?.data || error.message);
        throw new Error('Failed to update profile. Please try again later.'); // Rethrow error for handling by the caller
    }
};

// Function to change the user's password
export const changePassword = async (passwordData) => {
    try {
        // Validate passwordData
        if (!passwordData || typeof passwordData !== 'object') {
            throw new Error('Invalid password data provided.');
        }

        const response = await axiosInstance.put('/user/change-password/', passwordData); // Adjust the endpoint if needed

        // Validate the response data structure
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response received while changing password.');
        }

        return response.data; // Return success confirmation or updated data
    } catch (error) {
        console.error('Error changing password:', error.response?.data || error.message);
        throw new Error('Failed to change password. Please try again later.'); // Rethrow error for handling by the caller
    }
};

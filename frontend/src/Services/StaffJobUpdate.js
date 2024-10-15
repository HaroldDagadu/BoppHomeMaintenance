import { axiosInstance, UserData } from '../Api/api';

export const fetchJobs = async (page, pageSize, categoryKey, statusKey) => {
    try {
        const response = await axiosInstance.get('/alljobs/', {
            params: { page, page_size: pageSize, category: categoryKey, status: statusKey },
        });
        return response.data; // Return the full response data for better handling in the component
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return { results: [], count: 0, message: 'Failed to fetch jobs. Please try again.' }; // Added message for clarity
    }
};

export const fetchJobSuggestions = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/alljobs/', {
            params: { search: searchTerm, page_size: 1000 },
        });
        return response.data.results || []; // Ensure it returns an empty array if no results found
    } catch (error) {
        console.error('Error fetching job suggestions:', error);
        return []; // Return an empty array on error
    }
};

export const updateJob = async (id, updatedJob) => {
    try {
        const formData = new FormData();
        for (const key in updatedJob) {
            if (updatedJob[key]) { // Append only if the value exists
                formData.append(key, updatedJob[key]);
            }
        }
        
        const response = await axiosInstance.put(`/jobs/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        // Check for successful response
        if (response.status === 200) {
            return { success: true, message: 'Job updated successfully.' }; // Return success message
        } else {
            return { success: false, message: 'Failed to update job. Please try again.' };
        }
    } catch (error) {
        console.error('Failed to update job:', error);
        return { success: false, message: 'Error occurred while updating job.' }; // Return specific error message
    }
};

export const fetchUserData = async () => {
    try {
        const data = await UserData();
        return data; // Return user data
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return null; // Return null on error
    }
};

export const fetchJobsForStaff = async () => {
    try {
        const response = await axiosInstance.get('/StaffStats/', {
            withCredentials: true,
        });
        return response.data; // Return the complete response data
    } catch (error) {
        console.error('Error fetching jobs for staff:', error);
        throw handleError(error, 'Failed to fetch jobs for staff. Please try again.'); // Throw a specific error
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
            case 404:
                return new Error('Job not found. Please check the job ID.');
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


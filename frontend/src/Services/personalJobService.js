import { axiosInstance } from '../Api/api'; // Assuming you have set up axiosInstance

const jobService = {
    fetchJobs: async (status, page, search, pageSize = 10) => {
        try {
            const response = await axiosInstance.get('/jobs/', {
                params: {
                    status,
                    search,
                    page,
                    page_size: pageSize,
                },
                withCredentials: true,
            });
            return response.data; // Ensure returning the complete data structure
        } catch (error) {
            console.error("Fetch Jobs Error:", error);
            throw handleError(error, 'Failed to fetch jobs. Please try again.');
        }
    },

    fetchJobSuggestions: async (searchValue) => {
        try {
            const response = await axiosInstance.get('/jobs/', {
                params: { search: searchValue, page_size: 1000 },
                withCredentials: true,
            });
            return response.data.results || []; // Return an empty array if no results
        } catch (error) {
            console.error("Fetch Job Suggestions Error:", error);
            throw handleError(error, 'Failed to fetch job suggestions. Please try again.');
        }
    },

    deleteJob: async (jobId) => {
        try {
            await axiosInstance.delete(`/jobs/${jobId}/delete/`, { withCredentials: true });
            return { success: true, message: 'Job deleted successfully.' }; // Return a success message
        } catch (error) {
            console.error("Delete Job Error:", error);
            throw handleError(error, 'Failed to delete the job. Please try again.');
        }
    },
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

export default jobService;

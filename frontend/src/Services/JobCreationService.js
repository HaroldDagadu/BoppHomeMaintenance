import { axiosInstance } from '../Api/api';

// Function to create a new job
export const createJob = async (formData) => {
    const data = new FormData();

    // Append formData to the FormData object
    for (const key in formData) {
        if (formData[key]) {  // Only append fields with values
            data.append(key, formData[key]);
        }
    }

    try {
        // Make POST request to create a new job
        const response = await axiosInstance.post('/jobs/create/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Check for successful response
        if (response.status === 201) {
            return {
                success: true,
                message: 'Job created successfully',
                jobData: response.data // Return created job data if needed
            };
        } else {
            return {
                success: false,
                message: 'Failed to create the job. Please try again.'
            };
        }
    } catch (error) {
        console.error("Job Creation Error:", error);

        // Handle different error responses
        return handleError(error);
    }
};

// Centralized error handling function
const handleError = (error) => {
    if (error.response) {
        // Server responded with a status other than 2xx
        switch (error.response.status) {
            case 400:
                return {
                    success: false,
                    message: 'There was an issue with the data provided. Please check the form.'
                };
            case 500:
                return {
                    success: false,
                    message: 'Server error. Please try again later.'
                };
            default:
                return {
                    success: false,
                    message: 'An unexpected error occurred. Please try again.'
                };
        }
    } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        return {
            success: false,
            message: 'No response from server. Please check your connection.'
        };
    } else {
        // Something else happened in setting up the request
        console.error("Error:", error.message);
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again.'
        };
    }
};

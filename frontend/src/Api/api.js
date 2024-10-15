import axios from 'axios';

// Use environment variables for base URL
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,  // fallback if .env isn't configured
  withCredentials: true,  // This is crucial for sending cookies
});


// Function to fetch user roles
const getUserRoles = async () => {
  try {
    const response = await axiosInstance.get('/roles/');
    if (response.status === 200) {
      return response.data.roles || [];
    } else {
      console.error('Failed to fetch user roles, status code:', response.status);
      throw new Error('Failed to fetch user roles');
    }
  } catch (error) {
    if (error.response) {
      // Server responded with a status outside 2xx range
      console.error('Error fetching user roles:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received for user roles:', error.request);
    } else {
      // Other errors
      console.error('Error in getUserRoles:', error.message);
    }
    return [];  // Return empty roles in case of failure
  }
};

// Function to fetch user data
const UserData = async () => {
  try {
    const response = await axiosInstance.get('/user/profile/');
    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch user data, status code:', response.status);
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    if (error.response) {
      // Handle HTTP error responses
      if (error.response.status === 401) {
        console.error('Unauthorized: Invalid token. Please log in again.');
        // Optionally trigger a logout or token refresh process here
      } else {
        console.error('Error fetching user data:', error.response.data);
      }
    } else if (error.request) {
      // Handle no response scenario
      console.error('No response received for user data:', error.request);
    } else {
      // Handle any other errors
      console.error('Error in UserData:', error.message);
    }
    throw error;  // Re-throw error for handling upstream
  }
};

export { axiosInstance, getUserRoles, UserData };

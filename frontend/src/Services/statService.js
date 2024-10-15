import { axiosInstance } from '../Api/api'; // Import your axios instance

// Function to fetch jobs and count their statuses
export const fetchJobsWithStatusCount = async () => {
    try {
        const response = await axiosInstance.get('/jobstat/'); // Adjust the endpoint if needed
        const jobsData = response.data;

        // Initialize status count
        const statusCount = {
            pending: 0,
            completed: 0,
            approved: 0,
            rejected: 0,
        };

        // Check if jobsData is empty
        if (jobsData.length === 0) {
            return { jobsData, statusCount }; // Return early if no jobs
        }

        // Count jobs by their status
        jobsData.forEach((job) => {
            if (!job.is_deleted) {
                switch (job.status) {
                    case 'Pending':
                        statusCount.pending += 1;
                        break;
                    case 'Completed':
                        statusCount.completed += 1;
                        break;
                    case 'Approved':
                        statusCount.approved += 1;
                        break;
                    case 'Rejected':
                        statusCount.rejected += 1;
                        break;
                    default:
                        break; // Handle unknown statuses if necessary
                }
            }
        });

        return { jobsData, statusCount }; // Return both jobs data and status count
    } catch (error) {
        console.error('Error fetching jobs:', error.response || error);
        throw new Error('Failed to fetch jobs'); // Rethrow error for handling by the caller
    }
};



// Function to fetch job data and categorize it

export const fetchJobData = async (startDate, endDate) => {
    try {
        // Fetch jobs from the /staff/jobs/ endpoint
        const response = await axiosInstance.get('/StaffStats/', {
            withCredentials: true,  // Ensure that cookies (JWT token) are sent with the request
        });
        const jobs = response.data;

        // Initialize category and community counts
        const categories = {
            civil: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            electrical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            mechanical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            general: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            uncategorized: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        };

        const communityCounts = {
            Edumasi: { total: 0, civil: 0, electrical: 0, mechanical: 0, uncategorized: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
            Ahinkrom: { total: 0, civil: 0, electrical: 0, mechanical: 0, uncategorized: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
            "Mill Village": { total: 0, civil: 0, electrical: 0, mechanical: 0, uncategorized: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
        };

        // Filter jobs by date range if both startDate and endDate are provided
        const filteredJobs = jobs.filter(job => {
            const jobDate = new Date(job.time_added);
            return (!startDate || jobDate >= startDate) && (!endDate || jobDate <= endDate);
        });

        // Iterate over the filtered jobs and categorize the data
        filteredJobs.forEach(job => {
            const status = job.status.toLowerCase();
            const category = job.category ? job.category.toLowerCase() : 'uncategorized';

            // Update category counts
            if (categories[category]) {
                categories[category][status] += 1;
            }
            categories.general[status] += 1;

            // Update community counts
            ['Edumasi', 'Ahinkrom', 'Mill Village'].forEach(community => {
                if (job.community === community || job.user_community === community) {
                    communityCounts[community].total += 1;
                    communityCounts[community][category] += 1;
                    communityCounts[community][status] += 1;
                }
            });
        });

        // Return the formatted category and community data
        return { categories, communityCounts };
    } catch (error) {
        console.error("Error fetching job data:", error);
        throw error;
    }
};



// Function to fetch job data and categorize it
export const fetchJobDataSupe = async () => {
    try {
        const response = await axiosInstance.get('/StaffStats/'); // Adjust the endpoint if needed
        const jobs = response.data;

        const categories = {
            civil: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            electrical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            mechanical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            general: { pending: 0, completed: 0, approved: 0, rejected: 0 },
            uncategorized: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        };

        const communityCounts = {
            Edumasi: {
                total: 0,
                civil: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 },
            },
            Ahinkrom: {
                total: 0,
                civil: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 },
            },
            "Mill Village": {
                total: 0,
                civil: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 },
                uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 },
            },
        };

        // No filtering based on date
        jobs.forEach(job => {
            const status = job.status.toLowerCase();
            const category = job.category.toLowerCase();

            // Categorize job data
            if (categories[category]) {
                categories[category][status] += 1;
            }
            categories.general[status] += 1;

            // Community job data with detailed status by category
            ['Edumasi', 'Ahinkrom', 'Mill Village'].forEach(community => {
                if (job.community === community || job.user_community === community) {
                    communityCounts[community].total += 1;
                    communityCounts[community][category][status] += 1;
                }
            });
        });

        return { categories, communityCounts }; // Return both categories and community counts
    } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error; // Rethrow the error to handle it in the component if needed
    }
};

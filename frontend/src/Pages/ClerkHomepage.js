import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { UserData, axiosInstance } from '../Api/api.js';  // Assuming your API functions are in api.js
import { Button, Row, Col } from 'react-bootstrap';
import Dashboard from '../components/jumbotron/jumbotron.js';
import { JobCard } from '../components/card/card.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../static/style.css";
import {updateJob} from "../Services/StaffJobUpdate";
function ClerkHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [, setError] = useState(null);
  const [jobUpdates, setJobUpdates] = useState({});
  const [, setLoadingJobId] = useState(null);

  // Fetch user data and jobs
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await UserData();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get('/StaffStats/');
        setJobs(response.data);
      } catch (error) {
        setError('Error fetching jobs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle form input changes
  const handleInputChange = (id, field, value) => {
    setJobUpdates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  // Handle job updates
  const handleUpdate = async (id) => {
    setLoadingJobId(id);  // Set the loading state for the specific job
    const updatedJob = jobUpdates[id];
    const success = await updateJob(id, updatedJob);
    
    if (success) {
        alert("Job updated successfully");

        // **Update the local `jobs` state with the updated job:**
        setJobs((prevJobs) => 
          prevJobs.map((job) => 
            job.id === id ? { ...job, ...updatedJob } : job
          )
        );
    } else {
        alert("Failed to update job");
    }
    
    setLoadingJobId(null);  // Clear the loading state after update is complete
};


  // Limit jobs to a maximum of 15 and show "View More" if there are more
  const renderJobs = (category) => {
    if (!Array.isArray(jobs)) {
      return <p>Error: Jobs data is not available or is not in the expected format.</p>;
    }

    const filteredJobs = jobs.filter(
      (job) => job.category === 'Uncategorized' && job.status === 'Pending'
    );

    if (filteredJobs.length === 0) {
      return <p>No jobs available for this category and status.</p>;
    }

    const limitedJobs = filteredJobs.slice(0, 10);

    return (
      <>
        <Row>
          {limitedJobs.map((job) => (
            <Col xs={12} sm={6} md={4} key={job.id} className="mb-4">
              <JobCard
                job={job}
                updates={jobUpdates[job.id] || {}}
                handleInputChange={handleInputChange}
                handleUpdate={handleUpdate}
              />
            </Col>
          ))}
        </Row>

        {/* Display "View More" link if there are more than 15 jobs */}
        {filteredJobs.length > 10 && (
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/alljobs')}>
              There's more! Click here to view all jobs
            </Button>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div>
      <Dashboard />
      <div className="main">
        <br />
        <h2>NEW JOBS</h2>
        <div className="ml-4 mb-4 mt-3">
          {renderJobs('uncategorized')}
        </div>
      </div>
    </div>
  );
}

export default ClerkHome;

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';
import {  UserData, getUserRoles } from '../Api/api.js';  // Ensure getUserRoles is imported
import { JobCard } from '../components/card/card.js';
import Dashboard from '../components/jumbotron/jumbotron.js';
import SupervisorStats from '../components/Statscomponents/SupervisorStats.js';
import {
  updateJob,
  fetchJobsForStaff
} 
from "../Services/StaffJobUpdate";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/style.css';
import '../static/jumbotronscss.scss';

function SupHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [jobUpdates, setJobUpdates] = useState({});
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');
  const [, setLoadingJobId] = useState(null);

  // Fetch user roles and data
  const fetchUserData = useCallback(async () => {
    try {
      const data = await UserData();  // Fetch user data
      setUser(data);

      const userRoles = await getUserRoles();  // Make sure roles are fetched correctly
      if (userRoles.length === 0) throw new Error('No roles found for the user.');

      // Set the user's group based on roles
      const userGroup = userRoles.includes('electrical') ? 'Electrical' :
                        userRoles.includes('civil') ? 'Civil' :
                        userRoles.includes('mechanical') ? 'Mechanical' : null;

      setGroup(userGroup);
    } catch (error) {
      setError('Failed to fetch user data or roles');
      console.error('Failed to fetch user data or roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch jobs for the user's staff group
  const fetchJobs = useCallback(async () => {
    try {
      const jobsData = await fetchJobsForStaff();
      setJobs(jobsData);
    } catch (error) {
      setError('Error fetching jobs. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchJobs();
  }, [fetchUserData, fetchJobs]);

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

  const handleInputChange = useCallback((id, field, value) => {
    setJobUpdates(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      }
    }));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user || !group) {
    return <div>No user data available.</div>;
  }

  const pendingJobs = jobs.filter(job => job.category === group && job.status === 'Pending');
  const limitedJobs = pendingJobs.slice(0, 10);

  return (
    <div>
      <Dashboard />
      <div className='main'>
        <br />
        <div className="App">
          <SupervisorStats />
        </div>
        <hr />
        <h2>New Jobs (Pending) for {group}</h2>
        <Row>
          {pendingJobs.length > 0 ? (
            limitedJobs.map(job => (
              <Col xs={12} sm={6} md={4} key={job.id} className="mb-6 ml-4 ">
                <JobCard
                  job={job}
                  updates={jobUpdates[job.id] || {}}
                  handleInputChange={handleInputChange}
                  handleUpdate={handleUpdate}
                />
              </Col>
            ))
          ) : (
            <p>No new jobs available.</p>
          )}
        </Row>
        {pendingJobs.length > 10 && (
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/alljobs')}>
              There's more! Click here to view all jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupHome;

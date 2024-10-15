import React, { useEffect, useState } from 'react';
import { Spinner, Alert, Row, Carousel } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';  // Required for Chart.js auto-registering elements
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchJobsWithStatusCount } from '../../Services/statService'; // Import the service

function CarouselCards() {
    const [, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]); // For the carousel
    const [jobStatusCount, setJobStatusCount] = useState({
        pending: 0,
        completed: 0,
        approved: 0,
        rejected: 0,
    });

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { jobsData, statusCount } = await fetchJobsWithStatusCount(); // Use the service
                setJobs(jobsData);
                setRecentJobs(jobsData.slice(0, 5)); // Get the most recent 5 jobs for the carousel
                setJobStatusCount(statusCount);
            } catch (error) {
                setError('Failed to load jobs');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const renderRecentJobsCarousel = () => {
        if (recentJobs.length === 0) {
            return <p>No recent jobs available.</p>;
        }

        return (
            <Carousel>
                {recentJobs.map((job, index) => (
                    <Carousel.Item key={index}>
                    {/* eslint-disable-next-line*/}
                        <img
                            className="d-block w-100"
                            src={job.picture || "https://cdn.vectorstock.com/i/1000v/65/30/default-image-icon-missing-picture-page-vector-40546530.avif"}
                            alt="Job image"
                            style={{ height: '300px', objectFit: 'cover' }}
                        />
                        <Carousel.Caption>
                            <h5>{job.job_title}</h5>
                            <p>{job.job_description ? job.job_description.substring(0, 100) + '...' : 'No description available'}</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        );
    };

    const renderBarChart = () => {
        const chartData = {
            labels: ['Pending', 'Completed', 'Approved', 'Rejected'],
            datasets: [
                {
                    label: 'Number of Jobs',
                    data: [jobStatusCount.pending, jobStatusCount.completed, jobStatusCount.approved, jobStatusCount.rejected],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderWidth: 1,
                },
            ],
        };

        const chartOptions = {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        };

        return <Bar data={chartData} options={chartOptions} />;
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
    <Row className="mb-4">
            {/* Updated Jobs Carousel */}
            <div className="col-md-6 mb-4">
                <div className="card">
                    <h5 className="card-header">Recently Updated Jobs</h5>
                    <div className="card-body">
                        {renderRecentJobsCarousel()}
                    </div>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="col-md-6 mb-4">
                <div className="card">
                    <h5 className="card-header">Job Status Distribution</h5>
                    <div className="card-body">
                        {renderBarChart()}
                    </div>
                </div>
            </div>
    </Row>

        </div>
    );
}

export default CarouselCards;

import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Tab, Spinner, Alert, Card, Row, Col, Button, Form, Pagination } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import jobService from '../Services/personalJobService';  // Import the service

function JobList() {
    const [jobs, setJobs] = useState([]);
    const [key, setKey] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const jobRefs = useRef({});
    const pageSize = 10; // Set page size

    useEffect(() => {
        fetchJobs(key, currentPage, searchTerm);
    }, [key, currentPage, searchTerm]);

    const fetchJobs = async (status, page, search) => {
        setLoading(true);
        try {
            const data = await jobService.fetchJobs(status, page, search, pageSize);
            setJobs(data.results);
            setTotalPages(Math.ceil(data.count / pageSize));
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('You are not authorized to view these jobs. Please log in again.');
                window.location.href = '/login';
            } else {
                setError('Failed to load jobs');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobSuggestions = async (searchValue) => {
        if (searchValue.length > 2) {
            try {
                const suggestions = await jobService.fetchJobSuggestions(searchValue);
                setFilteredSuggestions(suggestions);
            } catch (error) {
                console.error('Error fetching suggestions', error);
            }
        } else {
            setFilteredSuggestions([]);
        }
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        fetchJobSuggestions(searchValue);
    };

    const handleSuggestionClick = (job) => {
        setCurrentPage(Math.ceil(jobs.indexOf(job) / pageSize) + 1);
        setKey(job.status.toLowerCase());
        setTimeout(() => {
            if (jobRefs.current[job.id]) {
                jobRefs.current[job.id].scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        setFilteredSuggestions([]);
    };

    const handleDelete = async (jobId) => {
        const confirmed = window.confirm('Are you sure you want to delete this job?');
        if (confirmed) {
            try {
                await jobService.deleteJob(jobId);
                setJobs(jobs.filter(job => job.id !== jobId));
            } catch (error) {
                setError('Failed to delete the job');
                console.error(error);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (filteredSuggestions.length > 0) {
            handleSuggestionClick(filteredSuggestions[0]);
        }
    };

    const renderPagination = () => {
        return (
            <Pagination>
                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
            </Pagination>
        );
    };

    const renderJobList = (status) => {
        if (loading) {
            return <Spinner animation="border" />;
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        const filtered = jobs.filter(job => job.status === status && !job.is_deleted);

        if (filtered.length === 0) {
            return <p>No jobs available for this status.</p>;
        }

        return (
            <div>
                <Row>
                    {filtered.map(job => (
                        <Col xs={12} sm={6} md={4} key={job.id} className="mb-4 mr-3 ml-3" ref={(el) => (jobRefs.current[job.id] = el)}>
                            <Card style={{ width: 'auto', height: 'auto', borderRadius: '10px' }}>
                                <Card.Img
                                    variant="top"
                                    src={job.picture || "https://cdn.vectorstock.com/i/1000v/65/30/default-image-icon-missing-picture-page-vector-40546530.avif"}
                                    alt="Job Picture"
                                    style={{ height: '300px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                                />
                                <Card.Body style={{ paddingLeft: '10px' }}>
                                    <Card.Title>{job.job_title}</Card.Title>
                                    <Card.Text>
                                        {job.id && <><strong>Job ID:</strong> {job.id}<br /></>}
                                        {job.job_description && <><strong>Description:</strong> {job.job_description}<br /></>}
                                        {job.user_name && <><strong>Name:</strong> {job.user_name}<br /></>}
                                        {job.user_phone_number && <><strong>Phone Number:</strong> {job.user_phone_number}<br /></>}
                                        {job.category && <><strong>Category:</strong> {job.category}<br /></>}
                                        {job.status && <><strong>Status:</strong> {job.status}<br /></>}
                                    </Card.Text>
                                    {job.status === 'Pending' && (
                                        <Button variant="danger" onClick={() => handleDelete(job.id)}>Delete</Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {renderPagination()}
            </div>
        );
    };

    return (
        <div>
            <h2>Your Jobs</h2>
            <Form className="mb-3 w-50" onSubmit={handleSearchSubmit}>
                <Form.Control
                    type="text"
                    placeholder="Search by title, description, id"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="mr-2 mb-2"
                />
                {filteredSuggestions.length > 0 && (
                    <ul className="list-group mt-2 position-absolute" style={{ zIndex: 1000, width: '60%' }}>
                        {filteredSuggestions.map(job => (
                            <li
                                key={job.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handleSuggestionClick(job)}
                            >
                                {`Job ID: ${job.id} || Title: ${job.job_title} || Status: ${job.status} || User: ${job.user_name} || User Phone: ${job.user_phone_number}`}
                            </li>
                        ))}
                    </ul>
                )}
            </Form>

            <Tabs id="job-status-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
                <Tab eventKey="pending" title="Pending">
                    {renderJobList('Pending')}
                </Tab>
                <Tab eventKey="completed" title="Completed">
                    {renderJobList('Completed')}
                </Tab>
                <Tab eventKey="rejected" title="Rejected">
                    {renderJobList('Rejected')}
                </Tab>
                <Tab eventKey="approved" title="Approved">
                    {renderJobList('Approved')}
                </Tab>
            </Tabs>
        </div>
    );
}

export default JobList;

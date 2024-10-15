import React, { useEffect, useState, useRef } from "react";
import {
  fetchJobs,
  fetchJobSuggestions,
  updateJob,
} 

from "../Services/StaffJobUpdate";
import { Row, Col, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { JobCard } from "../components/card/card";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../static/style.css";
import { getUserRoles } from "../Api/api";



function StaffJobs() {
  const [userRoles, setUserRoles] = useState([]);
  const [categoryKey, setCategoryKey] = useState("Uncategorized");
  const [statusKey, setStatusKey] = useState("Pending");
  const [jobs, setJobs] = useState([]);
  const [jobUpdates, setJobUpdates] = useState({});
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateSearchOption, setDateSearchOption] = useState("time_added");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const jobRefs = useRef({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(30);
  const [loadingJobId, setLoadingJobId] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await getUserRoles();
      setUserRoles(roles);
      setCategoryKey(initialCategory(roles));
    };
    fetchRoles();
  }, []);

  const initialCategory = (roles) => {
    if (roles.includes("civil")) return "Civil";
    if (roles.includes("electrical")) return "Electrical";
    if (roles.includes("mechanical")) return "Mechanical";
    return "Uncategorized";
  };

  const isManager = userRoles.includes("manager");
  const isClerk = userRoles.includes("clerk");
  

  const allCategories = ["Civil", "Mechanical", "Electrical", "Uncategorized"];
  const allowedCategories = isManager || isClerk 
    ? allCategories 
    : [initialCategory(userRoles)];

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const data = await fetchJobs(
        currentPage,
        jobsPerPage,
        categoryKey,
        statusKey
      );
      setJobs(data.results || []);
      setTotalPages(Math.ceil(data.count / jobsPerPage));
      setLoading(false);
    };
    loadJobs();
  }, [currentPage, categoryKey, statusKey, jobsPerPage]);
  const handleInputChange = (id, field, value) => {
    setJobUpdates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };
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


  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format or empty string for invalid dates
  };

  // Filter jobs based on allowed categories and selected filters
  const filteredJobs = jobs
    .filter(
      (job) =>
        allowedCategories.includes(job.category) && // Filter based on allowed categories
        job.status === statusKey &&
        (!selectedDate ||
          (dateSearchOption === "time_added" &&
            formatDate(job.time_added) === formatDate(selectedDate)) ||
          (dateSearchOption === "work_date" &&
            formatDate(job.work_date) === formatDate(selectedDate))) && // Filter by date
        (job.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.community?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.house_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.approved_by?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.time_added) - new Date(a.time_added)); // Sort by date

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm) {
        const suggestions = await fetchJobSuggestions(searchTerm);
        setFilteredSuggestions(suggestions);
      } else {
        setFilteredSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchTerm]);

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleJobsPerPageChange = (e) => {
    setJobsPerPage(Number(e.target.value)); // Set jobsPerPage from select input
    setCurrentPage(1); // Reset to first page when changing jobs per page
  };

  const handleSuggestionClick = (job) => {
    setCurrentPage(Math.ceil(jobs.indexOf(job) / jobsPerPage) + 1);
    setCategoryKey(job.category);
    setStatusKey(job.status);

    setTimeout(() => {
      if (jobRefs.current[job.id]) {
        jobRefs.current[job.id].scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleJobSelect = (id) => {
    setSelectedJobs(prevSelected =>
        prevSelected.includes(id)
            ? prevSelected.filter(jobId => jobId !== id) // Deselect if already selected
            : [...prevSelected, id] // Select if not already selected
    );
};

  const handlePrint = () => {
    const printableJobs = jobs.filter((job) => selectedJobs.includes(job.id));
    const printWindow = window.open("", "_blank");

    printWindow.document.write("<html><head><title>Print Jobs</title>");
    printWindow.document.write("</head><body>");

    printableJobs.forEach((job) => {
      printWindow.document.write(`
            <div>
                <h3>${job.job_title}</h3>
                ${
                  job.picture
                    ? `<img src="${job.picture}" alt="Job Picture" style="height: 300px; object-fit: cover; border-radius: 15px;" onload="window.print()" />`
                    : `<img src="https://cdn.vectorstock.com/i/1000v/65/30/default-image-icon-missing-picture-page-vector-40546530.avif" alt="No picture available" style="height: 200px; object-fit: cover; border-radius: 15px;" onload="window.print()" />`
                }
                <p>
                    ${job.id ? `<strong>Job ID:</strong> ${job.id}<br />` : ""}
                    ${
                      job.job_description && job.job_description !== "X"
                        ? `<strong>Description:</strong> ${job.job_description}<br />`
                        : ""
                    }
                    ${
                      job.user_name && job.user_name !== "X"
                        ? `<strong>Name:</strong> ${job.user_name}<br />`
                        : ""
                    }
                    ${
                      job.user_phone_number && job.user_phone_number !== "X"
                        ? `<strong>Phone Number:</strong> ${job.user_phone_number}<br />`
                        : ""
                    }
                    ${
                      job.user_community && job.user_community !== "X"
                        ? `<strong>Community:</strong> ${job.user_community}<br />`
                        : ""
                    }
                    ${
                      job.user_house_number && job.user_house_number !== "X"
                        ? `<strong>House Number:</strong> ${job.user_house_number}<br />`
                        : ""
                    }
                    ${
                      job.status && job.status !== "X"
                        ? `<strong>Status:</strong> ${job.status}<br />`
                        : ""
                    }
                    ${
                      job.category && job.category !== "X"
                        ? `<strong>Category:</strong> ${job.category}<br />`
                        : ""
                    }
                    ${
                      job.work_date && job.work_date !== "X"
                        ? `<strong>Work Date:</strong> ${job.work_date}<br />`
                        : ""
                    }
                    ${
                      job.assigned_to && job.assigned_to !== "X"
                        ? `<strong>Assigned To:</strong> ${job.assigned_to}<br />`
                        : ""
                    }
                    ${
                      job.notes && job.notes !== "X"
                        ? `<strong>Notes:</strong> ${job.notes}<br />`
                        : ""
                    }
                    ${
                      job.name === "X" || job.user_name === ""
                        ? ""
                        : `${
                            job.user_name &&
                            job.user_name !== "X" &&
                            job.name &&
                            job.name !== "X"
                              ? `<strong>Job made by:</strong> ${job.user_name} <strong>for</strong> ${job.name}<br />`
                              : ""
                          }`
                    }
                </p>
            </div><hr>`);
    });

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Wait for images to load and then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };




  const renderJobs = () => {
    if (filteredJobs.length === 0)
      return <p>No jobs available for this category/status.</p>;

    return (
      <Row>
        {filteredJobs.map((job) => (
          <Col xs={12} sm={6} md={4} key={job.id} className="mb-4">
            <Form.Check
              type="checkbox"
              label="Select Job To Print"
              checked={selectedJobs.includes(job.id)}
              onChange={() => handleJobSelect(job.id)}
            />
            <JobCard
              job={job}
              updates={jobUpdates[job.id] || {}}
              handleInputChange={handleInputChange}
              handleUpdate={handleUpdate}
              loadingJobId={loadingJobId}
            />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-2">
          {/* Date Picker */}
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="form-control"
            placeholderText="Select a date"
          />
        </div>
        <div className="col-md-2">
          {/* Date Search Option */}
          <select
            className="form-control"
            value={dateSearchOption}
            onChange={(e) => setDateSearchOption(e.target.value)}
          >
            <option value="time_added">Time Added</option>
            <option value="work_date">Work Date</option>
          </select>
        </div>
        <div className="col-md-4 offset-md-2">
          {/* Search Bar */}
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredSuggestions.length > 0 && (
            <ul
              className="list-group mt-2 position-absolute"
              style={{ zIndex: 1000, width: "100%" }}
            >
              {filteredSuggestions.map((job) => (
                <li
                  key={job.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSuggestionClick(job)}
                >
                  {`Job ID: ${job.id} 
                  || Job Title: ${job.job_title}
                  || Name: ${job.user_name}  / ${job.name}
                  || Category: ${job.category}  
                  || Status: ${job.status} `}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-md-2">
            {/* Category Tabs */}
            <ul className="nav nav-pills flex-column">
              {allowedCategories.map((category) => (
                <li className="nav-item" key={category}>
                  {/* eslint-disable-next-line*/}
                  <a
                    className={`nav-link ${
                      categoryKey === category ? "active" : ""
                    }`}
                    onClick={() => setCategoryKey(category)}
                    style={{
                      backgroundColor:
                        categoryKey === category ? "#90EE90" : "",
                    }}
                  >
                    {category}
                  </a>
                </li>
              ))}
              <div className="mt-5 " >
              <Button
                onClick={handlePrint}
                variant="secondary"
                disabled={selectedJobs.length === 0}
              >
                Print 
              </Button>
              </div>
            </ul>
          </div>
          <div className="col-md-10">
            {/* Status Tabs */}
            <ul className="nav nav-pills">
              {["Pending", "Approved", "Rejected", "Completed"].map(
                (status) => (
                  <li className="nav-item" key={status}>
                    {/* eslint-disable-next-line*/}
                    <a
                      className={`nav-link ${
                        statusKey === status ? "active" : ""
                      }`}
                      onClick={() => setStatusKey(status)}
                      style={{
                        backgroundColor: statusKey === status ? "#90EE90" : "",
                      }}
                    >
                      {status}
                    </a>
                  </li>
                )
              )}
            </ul>
            <div className="mt-3">
              {renderJobs()}
              <div className="pagination-controls mt-4">
                <Button
                  variant="secondary"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                <Button
                  variant="secondary"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <div>
                  <h6>Select Jobs Per Page</h6>
                  <select
                    className="form-control"
                    style={{ width: "100px" }}
                    value={jobsPerPage}
                    onChange={handleJobsPerPageChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffJobs;

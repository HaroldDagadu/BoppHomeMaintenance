// src/components/JobCard.js
import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { axiosInstance }  from '../../Api/api'


const getUserRoles = async () => {
  try {
    const response = await axiosInstance.get('/roles/');
    if (response.status === 200) {
      return response.data.roles || [];
    } else {
      throw new Error('Failed to fetch user roles');
    }
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

export const JobCard = ({
  job,
  updates,
  handleInputChange,
  handleUpdate,
  loadingJobId
}) => {
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await getUserRoles();
      setUserRoles(roles);
    };
    fetchRoles();
  }, []);

  const isManager = userRoles.includes("manager");
  const isClerk = userRoles.includes("clerk");
  const isSpecialized = ["civil", "electrical", "mechanical"].some((role) =>
    userRoles.includes(role)
  );

  const renderEditableFields = () => {
    if (isManager) {
      return (
        <>
          <div className="form-group mb-3">
            <label>Category:</label>
            <select
              value={updates.category || job.category}
              onChange={(e) =>
                handleInputChange(job.id, "category", e.target.value)
              }
              className="form-control"
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="Civil">Civil</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label>Status:</label>
            <select
              value={updates.status || job.status}
              onChange={(e) =>
                handleInputChange(job.id, "status", e.target.value)
              }
              className="form-control"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {updates.status === "Approved" && renderApprovalFields()}
          {updates.status === "Rejected" && renderRejectionFields()}
        </>
      );
    } else if (isClerk) {
      return (
        <div className="form-group mb-3">
          <label>Category:</label>
          <select
            value={updates.category || job.category}
            onChange={(e) =>
              handleInputChange(job.id, "category", e.target.value)
            }
            className="form-control"
          >
            <option value="Uncategorized">Uncategorized</option>
            <option value="Civil">Civil</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
          </select>
          <>
          <div className="form-group mb-3">
            <label>Status:</label>
            <select
              value={updates.status || job.status}
              onChange={(e) =>
                handleInputChange(job.id, "status", e.target.value)
              }
              className="form-control"
            >
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {updates.status === "Rejected" && renderRejectionFields()}
        </>
        </div>
        
      );
    } else if (isSpecialized) {
      return (
        <>
          <div className="form-group mb-3">
            <label>Status:</label>
            <select
              value={updates.status || job.status}
              onChange={(e) =>
                handleInputChange(job.id, "status", e.target.value)
              }
              className="form-control"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {updates.status === "Approved" && renderApprovalFields()}
          {updates.status === "Rejected" && renderRejectionFields()}
        </>
      );
    }
    return null;
  };

  const renderApprovalFields = () => (
    <>
      <div className="form-group mb-3">
        <label>Assigned To:</label>
        <input
          type="text"
          value={updates.assigned_to || job.assigned_to || ""}
          onChange={(e) =>
            handleInputChange(job.id, "assigned_to", e.target.value)
          }
          className="form-control"
        />
      </div>
      <div className="form-group mb-3">
        <label>Work Date:</label>
        <input
          type="date"
          value={updates.work_date || job.work_date || ""}
          onChange={(e) =>
            handleInputChange(job.id, "work_date", e.target.value)
          }
          className="form-control"
        />
      </div>
      <div className="form-group mb-3">
        <label>Notes:</label>
        <textarea
          value={updates.notes || job.notes || ""}
          onChange={(e) => handleInputChange(job.id, "notes", e.target.value)}
          className="form-control"
        />
      </div>
    </>
  );

  const renderRejectionFields = () => (
    <div className="form-group mb-3">
      <label>Notes:</label>
      <textarea
        value={updates.notes || job.notes || ""}
        onChange={(e) => handleInputChange(job.id, "notes", e.target.value)}
        className="form-control"
      />

    </div>
  );

  return (
    <Card style={{ borderRadius: "10px" }} className="mb-4">
      <div className="bg-image hover-zoom">
        <Card.Img
          variant="top"
          src={
            job.picture ||
            "https://cdn.vectorstock.com/i/1000v/65/30/default-image-icon-missing-picture-page-vector-40546530.avif"
          }
          alt={job.picture ? "Job Picture" : "No picture available"}
          style={{
            height: "300px",
            objectFit: "cover",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
        />
      </div>
      <Card.Body style={{ paddingLeft: "10px" }}>
        <Card.Title>{job.job_title}</Card.Title>
        {job.name === "X" || job.name === "" ? (
          <Card.Text>
            {job.id && (
              <>
                <strong>Job ID:</strong> {job.id}
                <br />
              </>
            )}
            {job.job_description && job.job_description !== "X" && (
              <>
                <strong>Description:</strong> {job.job_description}
                <br />
              </>
            )}
            {job.user_name && job.user_name !== "X" && (
              <>
                <strong>Name:</strong> {job.user_name}
                <br />
              </>
            )}
            {job.user_phone_number && job.user_phone_number !== "X" && (
              <>
                <strong>Phone Number:</strong> {job.user_phone_number}
                <br />
              </>
            )}
            {job.user_community && job.user_community !== "X" && (
              <>
                <strong>Community:</strong> {job.user_community}
                <br />
              </>
            )}
            {job.user_house_number && job.user_house_number !== "X" && (
              <>
                <strong>House Number:</strong> {job.user_house_number}
                <br />
              </>
            )}
            {job.status && job.status !== "X" && (
              <>
                <strong>Status:</strong> {job.status}
                <br />
              </>
            )}
            {job.category && job.category !== "X" && (
              <>
                <strong>Category:</strong> {job.category}
                <br />
              </>
            )}
            {job.work_date && job.work_date !== "X" && (
              <>
                <strong>Work Date:</strong> {job.work_date}
                <br />
              </>
            )}
            {job.assigned_to && job.assigned_to !== "X" && (
              <>
                <strong>Assigned To:</strong> {job.assigned_to}
                <br />
              </>
            )}
            {job.notes && job.notes !== "X" && (
              <>
                <strong>Notes:</strong> {job.notes}
                <br />
              </>
            )}
          </Card.Text>
        ) : (
          <Card.Text>
            {job.job_description && job.job_description !== "X" && (
              <>
                <strong>Description:</strong> {job.job_description}
                <br />
              </>
            )}
            {job.id && (
              <>
                <strong>Job ID:</strong> {job.id}
                <br />
              </>
            )}
            {job.name && job.name !== "X" && (
              <>
                <strong>Name:</strong> {job.name}
                <br />
              </>
            )}
            {job.phone_number && job.phone_number !== "X" && (
              <>
                <strong>Phone Number:</strong> {job.phone_number}
                <br />
              </>
            )}
            {job.community && job.community !== "X" && (
              <>
                <strong>Community:</strong> {job.community}
                <br />
              </>
            )}
            {job.house_number && job.house_number !== "X" && (
              <>
                <strong>House Number:</strong> {job.house_number}
                <br />
              </>
            )}
            {job.status && job.status !== "X" && (
              <>
                <strong>Status:</strong> {job.status}
                <br />
              </>
            )}
            {job.category && job.category !== "X" && (
              <>
                <strong>Category:</strong> {job.category}
                <br />
              </>
            )}
            {job.work_date && job.work_date !== "X" && (
              <>
                <strong>Work Date:</strong> {job.work_date}
                <br />
              </>
            )}
            {job.user_name &&
              job.user_name !== "X" &&
              job.name &&
              job.name !== "X" && (
                <>
                  <strong>Job made by:</strong> {job.user_name}{" "}
                  <strong>for</strong> {job.name}
                  <br />
                </>
              )}
          </Card.Text>
        )}

        {renderEditableFields()}

        <Button
  variant="primary"
  onClick={() => handleUpdate(job.id)}
  style={{ borderRadius: "10px" }}
  disabled={loadingJobId === job.id}  // Disable the button when the job is updating
>
  {loadingJobId === job.id ? 'Updating...' : 'Update'}  {/* Show loading text */}
</Button>

      </Card.Body>
    </Card>
  );
};

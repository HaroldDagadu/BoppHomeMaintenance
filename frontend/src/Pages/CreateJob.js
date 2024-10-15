import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/LOGINOUT/css/style.css';
import { createJob } from '../Services/JobCreationService';

function CreateJob() {
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        picture: null
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            picture: e.target.files[0]
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.job_title) newErrors.job_title = 'Job title is required';
        if (!formData.job_description) newErrors.job_description = 'Job description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Perform validation before submitting
        if (!validateForm()) {
            return; // Stop if the form is not valid
        }

        setLoading(true);
        setErrors({}); // Reset errors on new submission

        // Call the createJob service
        try {
            const result = await createJob(formData);

            if (result.success) {
                setLoading(false);
                navigate('/jobs'); // Navigate to jobs page
            } else {
                setLoading(false);
                setErrors({ form: result.message }); // Set the error message if job creation fails
            }
        } catch (error) {
            setLoading(false);
            setErrors({ form: 'Failed to create job. Please try again.' }); // General error message
        }
    };

    return (
        <section className="ftco-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center mb-5">
                        <h2 className="heading-section">Create a New Job</h2>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-md-12 col-lg-10">
                        <div className="wrap d-md-flex">
                            <div className="login-wrap p-4 p-md-5">
                                <div className="d-flex">
                                    <div className="w-100">
                                        <h3 className="mb-4">Job Details</h3>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="signin-form">
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="job_title">Job Title</label>
                                        <input
                                            type="text"
                                            name="job_title"
                                            className={`form-control ${errors.job_title ? 'is-invalid' : ''}`} // Highlight input on error
                                            placeholder="Enter Job Title"
                                            value={formData.job_title}
                                            onChange={handleChange}
                                        />
                                        {errors.job_title && <span className="text-danger">{errors.job_title}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="job_description">Job Description</label>
                                        <textarea
                                            name="job_description"
                                            className={`form-control ${errors.job_description ? 'is-invalid' : ''}`} // Highlight input on error
                                            placeholder="Enter Job Description"
                                            value={formData.job_description}
                                            onChange={handleChange}
                                        />
                                        {errors.job_description && <span className="text-danger">{errors.job_description}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="picture">Upload Picture (Optional)</label>
                                        <input
                                            type="file"
                                            name="picture"
                                            className="form-control"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button
                                            type="submit"
                                            className="form-control btn btn-primary rounded submit px-3"
                                            disabled={loading}
                                        >
                                            {loading ? 'Submitting...' : 'Create Job'}
                                        </button>
                                    </div>
                                    {errors.form && <div className="text-danger">{errors.form}</div>}
                                </form>
                                <p className="text-center">
                                    <a href='/jobs'>Back to Jobs List</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CreateJob;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/LOGINOUT/css/style.css';
import { createJob } from '../Services/JobCreationService'; 

function CreateCustomJob() {
    const [formData, setFormData] = useState({
        name: '',
        job_title: '',
        job_description: '',
        phone_number: '',
        community: '',
        house_number: '',
        picture: null
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.job_title) newErrors.job_title = 'Job title is required';
        if (!formData.job_description) newErrors.job_description = 'Job description is required';
        if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
        if (!formData.community) newErrors.community = 'Community is required';
        if (!formData.house_number) newErrors.house_number = 'House number is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Clear previous errors

        // Validate form before submitting
        if (!validateForm()) {
            setLoading(false); // Stop loading if form is not valid
            return;
        }

        // Call the createJob service
        const result = await createJob(formData);

        if (result.success) {
            setLoading(false);
            navigate('/jobs');  // Navigate to jobs page
        } else {
            setLoading(false);
            setErrors({ form: result.message });  // Set the error message if job creation fails
        }
    };

    return (
        <section className="ftco-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center mb-5">
                        <h2 className="heading-section">Create a Custom Job</h2>
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
                                        <label className="label" htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        {errors.name && <span className="text-danger">{errors.name}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="job_title">Job Title</label>
                                        <input
                                            type="text"
                                            name="job_title"
                                            className="form-control"
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
                                            className="form-control"
                                            placeholder="Enter Job Description"
                                            value={formData.job_description}
                                            onChange={handleChange}
                                        />
                                        {errors.job_description && <span className="text-danger">{errors.job_description}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="phone_number">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            className="form-control"
                                            placeholder="Enter Phone Number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                        />
                                        {errors.phone_number && <span className="text-danger">{errors.phone_number}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="community">Community</label>
                                        <select
                                            name="community"
                                            className="form-control"
                                            value={formData.community}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Community</option>
                                            <option value="Mill Village">Mill Village</option>
                                            <option value="Ahinkrom">Ahinkrom</option>
                                            <option value="Edumasi">Edumasi</option>
                                        </select>
                                        {errors.community && <span className="text-danger">{errors.community}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="house_number">House Number</label>
                                        <textarea
                                            name="house_number"
                                            className="form-control"
                                            placeholder="Enter House Number"
                                            value={formData.house_number}
                                            onChange={handleChange}
                                        />
                                        {errors.house_number && <span className="text-danger">{errors.house_number}</span>}
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label" htmlFor="picture">Upload Picture</label>
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
                                            disabled={loading}  // Disable button when loading
                                        >
                                            {loading ? 'Submitting...' : 'Create Job'}  {/* Show loading text */}
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

export default CreateCustomJob;

import React, { useState, useEffect } from 'react';
import '../static/LOGINOUT/css/style.css';
import { fetchProfile, updateProfile, changePassword } from '../Services/userProfileService'; // Import your service functions

const Profile = () => {
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        community: '',
        house_number: ''
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [errors, setErrors] = useState({});


  
    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Function to fetch the current user's profile
    useEffect(() => {
        const getProfile = async () => {
            try {
                const data = await fetchProfile();
                setProfileData(data); // Populate form with current profile data
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        getProfile();
    }, []);

    // Handle input changes for profile
    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    // Handle input changes for password
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission to update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData); // Call service to update profile
            alert('Profile updated successfully!');
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data); // Set validation errors
            } else {
                console.error('Failed to update profile:', error);
            }
        }
    };

    // Handle form submission to change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Check if new password and confirm password match
        if (passwordData.new_password !== passwordData.confirm_new_password) {
            setErrors({ confirm_new_password: "Passwords do not match" });
            return;
        }

        try {
            await changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            }); // Call service to change password
            alert('Password updated successfully!');
            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_new_password: ''
            });
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data); // Set validation errors
            } else {
                console.error('Failed to change password:', error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSubmit}>
                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            className="form-control"
                            value={profileData.first_name}
                            onChange={handleProfileChange}
                            required
                        />
                        {errors.first_name && <span className="text-danger">{errors.first_name}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            className="form-control"
                            value={profileData.last_name}
                            onChange={handleProfileChange}
                            required
                        />
                        {errors.last_name && <span className="text-danger">{errors.last_name}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            className="form-control"
                            value={profileData.phone_number}
                            onChange={handleProfileChange}
                            required
                        />
                        {errors.phone_number && <span className="text-danger">{errors.phone_number}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Community</label>
                        <select
                            name="community"
                            className="form-control"
                            value={profileData.community}
                            onChange={handleProfileChange}
                            required
                        >
                            <option value="">Select Community</option>
                            <option value="Mill Village">Mill Village</option>
                            <option value="Ahinkrom">Ahinkrom</option>
                            <option value="Edumasi">Edumasi</option>
                        </select>
                        {errors.community && <span className="text-danger">{errors.community}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>House Number</label>
                        <input
                            type="text"
                            name="house_number"
                            className="form-control"
                            value={profileData.house_number}
                            onChange={handleProfileChange}
                            required
                        />
                        {errors.house_number && <span className="text-danger">{errors.house_number}</span>}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>

            <hr />

            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Old Password</label>
                        <input
                            type="password"
                            name="old_password"
                            className="form-control"
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {errors.old_password && <span className="text-danger">{errors.old_password}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="new_password"
                            className="form-control"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {errors.new_password && <span className="text-danger">{errors.new_password}</span>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm_new_password"
                            className="form-control"
                            value={passwordData.confirm_new_password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {errors.confirm_new_password && <span className="text-danger">{errors.confirm_new_password}</span>}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Change Password</button>
            </form>
        </div>
    );
};

export default Profile;

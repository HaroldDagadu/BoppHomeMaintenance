import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'chart.js/auto'; // Auto-imports necessary Chart.js modules
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import SupervisorStats from './SupervisorStats';
import { fetchJobData } from '../../Services/statService'; // Import the service

function JobStatistics() {
    const [jobData, setJobData] = useState({
        civil: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        electrical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        mechanical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        uncategorized: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        general: { pending: 0, completed: 0, approved: 0, rejected: 0 }
    });

    const [startDate, setStartDate] = useState(null); // Start date for filtering
    const [endDate, setEndDate] = useState(null); // End date for filtering
    const [communityJobCounts, setCommunityJobCounts] = useState({
        Edumasi: { total: 0, civil: 0, electrical: 0, mechanical: 0, pending: 0, approved: 0, rejected: 0, completed: 0},
        Ahinkrom: { total: 0, civil: 0, electrical: 0, mechanical: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
        "Mill Village": { total: 0, civil: 0, electrical: 0, mechanical: 0, pending: 0, approved: 0, rejected: 0, completed: 0 }
    }); // State to hold job counts for communities

        useEffect(() => {
            const fetchJobs = async () => {
                try {
                    const { categories, communityCounts } = await fetchJobData(startDate, endDate); // Use the service
                    setJobData(categories);
                    setCommunityJobCounts(communityCounts);
                    console.log("Community Job Counts after fetching:", communityCounts); // Debugging log
                } catch (error) {
                    console.error("Error fetching jobs:", error);
                }
            };
    
            fetchJobs();
    }, [startDate, endDate]); // Fetch jobs when date range changes

    // Helper function to generate chart data
    const generateChartData = (categoryData, categoryName) => ({
        labels: ["Pending", "Completed", "Approved", "Rejected"],
        datasets: [
            {
                backgroundColor: ["yellow", "blue", "green", "red"], // Custom colors for each bar
                data: [
                    categoryData.pending,
                    categoryData.completed,
                    categoryData.approved,
                    categoryData.rejected,
                ],
            },
        ],
    });
    
    const options = {
        responsive: true,
        scales: {
            x: {
                barThickness: 50,
                maxBarThickness: 70,
            },
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                display: false, // Hides the legend
            },
        },
    };
    

    const generateGeneralChartData = (jobData) => {
        return {
            labels: ['Civil', 'Electrical', 'Mechanical', 'Uncategorized'],
            datasets: [
                {
                    data: [
                        jobData.civil.pending + jobData.civil.completed + jobData.civil.approved + jobData.civil.rejected,
                        jobData.electrical.pending + jobData.electrical.completed + jobData.electrical.approved + jobData.electrical.rejected,
                        jobData.mechanical.pending + jobData.mechanical.completed + jobData.mechanical.approved + jobData.mechanical.rejected,
                        jobData.uncategorized.pending + jobData.uncategorized.completed + jobData.uncategorized.approved + jobData.uncategorized.rejected
                    ],
                    backgroundColor: "blue",

                }
            ]
        };
    };
    
    const generateCommunityStatusChartData = (communityData, communityName) => ({
        labels: ["Pending", "Approved", "Rejected", "Completed"],
        datasets: [
            {
                label: communityName,
                backgroundColor: ["yellow", "red", "green", "blue"],
                data: [
                    communityData.pending,
                    communityData.approved,
                    communityData.rejected,
                    communityData.completed,

                ]
            }
        ]
    });


    console.log("Community Job Counts:", communityJobCounts); // Debugging log

    return (
        <div className="container">
            <h2>Job Statistics</h2>
            <div className="App">
    <SupervisorStats />
</div>
<div className=" container ml-10 mr-10 ">
<h4>
                        General Statistics
                    </h4>
                </div>
            {/* Date Range Filter */}

            <div className="row mb-4">
                <div className="col-md-6">
                    <label>Start Date:</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="form-control"
                        isClearable
                        placeholderText="Select a start date"
                    />
                </div>
                <div className="col-md-6">
                    <label>End Date:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="form-control"
                        isClearable
                        placeholderText="Select an end date"
                    />
                </div>
            </div>
<hr/>
            <div className="row">
                {/* General Chart Card */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">General Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateChartData(jobData.general, 'General')} options={options} />
                        </div>
                    </div>
                </div>
<div className="col-md-6 mb-4">
    <div className="card">
        <h5 className="card-header">General Job Categories</h5>
        <div className="card-body">
            <Bar data={generateGeneralChartData(jobData)} options={options} />
        </div>
    </div>
</div>

<hr/>
<div>
                    <h4>
                    Dept. Charts by Status
                    </h4>
                </div>

                {/* Civil Chart Card */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Civil Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateChartData(jobData.civil, 'Civil')} options={options} />
                        </div>
                    </div>
                </div>

                {/* Electrical Chart Card */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Electrical Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateChartData(jobData.electrical, 'Electrical')} options={options} />
                        </div>
                    </div>
                </div>

                {/* Mechanical Chart Card */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Mechanical Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateChartData(jobData.mechanical, 'Mechanical')} options={options} />
                        </div>
                    </div>
                </div>

                                {/* Uncategorized Chart Card */}
                                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Uncategorized Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateChartData(jobData.uncategorized, 'Uncategorized')} options={options} />
                        </div>
                    </div>
                </div>
                <hr/>



                <hr/>
                <div>
                    <h4>
                    Community Charts by Status
                    </h4>
                </div>

                {/* Community Charts by Status */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Edumasi Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateCommunityStatusChartData(communityJobCounts.Edumasi, 'Edumasi')} options={options} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Ahinkrom Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateCommunityStatusChartData(communityJobCounts.Ahinkrom, 'Ahinkrom')} options={options} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card">
                        <h5 className="card-header">Mill Village Job Status</h5>
                        <div className="card-body">
                            <Bar data={generateCommunityStatusChartData(communityJobCounts["Mill Village"], 'Mill Village')} options={options} />
                        </div>
                    </div>
                </div>
            </div>
            <hr/>

            {/* Table Card */}
            <div className="col-md-12">
                <div className="card">
                    <h5 className="card-header">Job Status Summary</h5>
                    <div className="card-body">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Pending</th>
                                    <th>Completed</th>
                                    <th>Approved</th>
                                    <th>Rejected</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Civil</td>
                                    <td>{jobData.civil.pending}</td>
                                    <td>{jobData.civil.completed}</td>
                                    <td>{jobData.civil.approved}</td>
                                    <td>{jobData.civil.rejected}</td>
                                    <td>{jobData.civil.pending + jobData.civil.completed + jobData.civil.approved + jobData.civil.rejected}</td> {/* Total for Civil */}

                                </tr>
                                <tr>
                                    <td>Electrical</td>
                                    <td>{jobData.electrical.pending}</td>
                                    <td>{jobData.electrical.completed}</td>
                                    <td>{jobData.electrical.approved}</td>
                                    <td>{jobData.electrical.rejected}</td>
                                    <td>{jobData.electrical.pending + jobData.electrical.completed + jobData.electrical.approved + jobData.electrical.rejected}</td> {/* Total for Electrical */}

                                </tr>
                                <tr>
                                    <td>Mechanical</td>
                                    <td>{jobData.mechanical.pending}</td>
                                    <td>{jobData.mechanical.completed}</td>
                                    <td>{jobData.mechanical.approved}</td>
                                    <td>{jobData.mechanical.rejected}</td>
                                    <td>{jobData.mechanical.pending + jobData.mechanical.completed + jobData.mechanical.approved + jobData.mechanical.rejected}</td> {/* Total for Mechanical */}

                                </tr>
                                <tr>
                                    <td>Uncategorized</td>
                                    <td>{jobData.uncategorized.pending}</td>
                                    <td>{jobData.uncategorized.completed}</td>
                                    <td>{jobData.uncategorized.approved}</td>
                                    <td>{jobData.uncategorized.rejected}</td>
                                    <td>{jobData.uncategorized.pending + jobData.uncategorized.completed + jobData.uncategorized.approved + jobData.uncategorized.rejected}</td> {/* Total for Uncategorized */}

                                </tr>
                                <tr>
                                    <td><strong>General</strong></td>
                                    <td>{jobData.general.pending}</td>
                                    <td>{jobData.general.completed}</td>
                                    <td>{jobData.general.approved}</td>
                                    <td>{jobData.general.rejected}</td>
                                    <td>{jobData.general.pending + jobData.general.completed + jobData.general.approved + jobData.general.rejected}</td> {/* Total for General */}

                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <h5>Community Job Counts</h5>
                            <p>Edumasi: {communityJobCounts.Edumasi.total} (Civil: {communityJobCounts.Edumasi.civil}, Electrical: {communityJobCounts.Edumasi.electrical}, Mechanical: {communityJobCounts.Edumasi.mechanical}, Uncategorized: {communityJobCounts.Edumasi.uncategorized}) </p>
                            <p>Ahinkrom: {communityJobCounts.Ahinkrom.total} (Civil: {communityJobCounts.Ahinkrom.civil}, Electrical: {communityJobCounts.Ahinkrom.electrical}, Mechanical: {communityJobCounts.Ahinkrom.mechanical},Uncategorized: {communityJobCounts.Ahinkrom.uncategorized} )</p>
                            <p>Mill Village: {communityJobCounts["Mill Village"].total} (Civil: {communityJobCounts["Mill Village"].civil}, Electrical: {communityJobCounts["Mill Village"].electrical}, Mechanical: {communityJobCounts["Mill Village"].mechanical}, Uncategorized: {communityJobCounts["Mill Village"].uncategorized} ) </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobStatistics;
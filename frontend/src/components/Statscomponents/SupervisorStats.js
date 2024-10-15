

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Auto-imports necessary Chart.js modules
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { fetchJobDataSupe } from '../../Services/statService';
function SupervisorStats() {
    const [, setJobData] = useState({
        civil: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        electrical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        mechanical: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        uncategorized: { pending: 0, completed: 0, approved: 0, rejected: 0 },
        general: { pending: 0, completed: 0, approved: 0, rejected: 0 }
    });

    const [communityJobCounts, setCommunityJobCounts] = useState({
        Edumasi: { total: 0, civil: { pending: 0, approved: 0, completed: 0, rejected: 0 }, electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 } },
        Ahinkrom: { total: 0, civil: { pending: 0, approved: 0, completed: 0, rejected: 0 }, electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 } },
        "Mill Village": { total: 0, civil: { pending: 0, approved: 0, completed: 0, rejected: 0 }, electrical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, mechanical: { pending: 0, approved: 0, completed: 0, rejected: 0 }, uncategorized: { pending: 0, approved: 0, completed: 0, rejected: 0 } }
    });

    useEffect(() => {
        const loadJobData = async () => {
            try {
                const { categories, communityCounts } = await fetchJobDataSupe(); // Use the service
                setJobData(categories);
                setCommunityJobCounts(communityCounts);
                console.log("Community Job Counts after fetching:", communityCounts); // Debugging log
            } catch (error) {
                console.error("Failed to load job data:", error);
            }
        };

        loadJobData()
    }, []); //
    

    // Generate chart data for each community (Edumasi, Ahinkrom, Mill Village)
    const generateCommunityCategoryChartData = (communityData) => ({
        labels: ["Civil", "Electrical", "Mechanical", "Uncategorized"],
        datasets: [
            {
                label: "Pending",
                backgroundColor: "yellow",
                data: [
                    communityData.civil.pending,
                    communityData.electrical.pending,
                    communityData.mechanical.pending,
                    communityData.uncategorized.pending
                ]
            },
            {
                label: "Approved",
                backgroundColor: "green",
                data: [
                    communityData.civil.approved,
                    communityData.electrical.approved,
                    communityData.mechanical.approved,
                    communityData.uncategorized.approved
                ]
            },
            {
                label: "Completed",
                backgroundColor: "blue",
                data: [
                    communityData.civil.completed,
                    communityData.electrical.completed,
                    communityData.mechanical.completed,
                    communityData.uncategorized.completed
                ]
            },
            {
                label: "Rejected",
                backgroundColor: "red",
                data: [
                    communityData.civil.rejected,
                    communityData.electrical.rejected,
                    communityData.mechanical.rejected,
                    communityData.uncategorized.rejected
                ]
            }
        ]
    });

    const options = {
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        },
        title: {
            display: true,
            text: 'Job Distribution by Category and Status'
        },
        legend: { display: true }
    };

    return (
        <div className=" container ml-9  ">
            <h3>Current Job Overview According to Communities</h3>

            
            {/* Ahinkrom Job Categories by Status */}
            <div className="row ">

            <div className="col-md-6 mb-4">

                <div className="card">
                    <h5 className="card-header">Ahinkrom Job Categories by Status</h5>
                    <div className="card-body">
                        <Bar data={generateCommunityCategoryChartData(communityJobCounts.Ahinkrom)} options={options} />
                    </div>
            </div>
            </div>


            {/* Mill Village Job Categories by Status */}
            <div className="col-md-6 mb-4">

                <div className="card">
                    <h5 className="card-header">Mill Village Job Categories by Status</h5>
                    <div className="card-body">
                        <Bar data={generateCommunityCategoryChartData(communityJobCounts["Mill Village"])} options={options} />
                    </div>
            </div>
            </div>



                        {/* Edumasi Job Categories by Status (Stacked) */}
                        <div className="col-md-6 mb-4">

                        <div className="card">
                    <h5 className="card-header">Edumasi Job Categories by Status</h5>
                    <div className="card-body">
                        <Bar data={generateCommunityCategoryChartData(communityJobCounts.Edumasi)} options={options} />
                    </div>
            </div>
        </div>
                </div>
<hr/>
        </div>

    );
}

export default SupervisorStats;

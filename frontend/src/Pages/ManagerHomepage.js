import React, { useEffect, useState } from 'react';
import { UserData } from '../Api/api.js';  // Assuming your API functions are in api.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/style.css';
import JobStatistics from '../components/Statscomponents/jobstat.js';
import Dashboard from '../components/jumbotron/jumbotron.js';

function ManagerHome() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await UserData();
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();


    }, []);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>No user data available.</div>;
    }


    return (
        <div>

<Dashboard/>

            <div className='main'>
                <br />

     <div className="App">
    <JobStatistics />
</div>


            </div>
        </div>
    );
}

export default ManagerHome;

import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { axiosInstance } from "../../Api/api";
import { useNavigate } from "react-router-dom";

const getUserRoles = async () => {
  try {
    // API call to fetch roles
    const response = await axiosInstance.get("/roles/");
    if (response.status === 200) {
      return response.data.roles || []; // Return roles if available
    } else {
      throw new Error("Failed to fetch user roles");
    }
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
};

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const response = await axiosInstance.get("/user/profile/", {
          withCredentials: true, // Ensures cookies are sent
        });
        setUser(response.data);

        // Fetch user roles and determine group
        const userRoles = await getUserRoles();
        const userGroup = userRoles.includes("electrical")
          ? "Electrical"
          : userRoles.includes("civil")
          ? "Civil"
          : userRoles.includes("mechanical")
          ? "Mechanical"
          : userRoles.includes("manager")
          ? "Manager"
          : userRoles.includes("clerk")
          ? "Technical Clerk"
          : null;
        setGroup(userGroup);

        setLoading(false); // Finished loading once both user and roles are fetched
      } catch (error) {
        console.error("Error fetching user data or roles:", error.response || error);
        setLoading(false);
      }
    };

    fetchUserData(); // Execute the async function to fetch data
  }, []);

  const goToCreateJob = () => navigate("/jobs/create");
  const goToCreateCustomJob = () => navigate("/jobs/create/custom");
  const goToJobStat = () => navigate("/jobstats");
  const goToNewJobs = () => navigate("/alljobs");
  const goToAllJobs = () => {
    navigate("/alljobs");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <article className="full-width-container">
      <figure className="containerFigure" id="containerFigure"></figure>
      <div className="containerContainer" id="containerContainer">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <header className="containerHeader">
                <small className="containerCategory" id="containerCategory">
                  {group} Dashboard
                </small>
                <h1 className="containerTitle" id="containerTitle">
                  Welcome, {user.first_name}{" "}
                  <span className="d-none d-lg-inline">{user.last_name}</span>!
                </h1>
              </header>
              <div className="containerBody" id="containerBody">
                <p>Your user ID is: {user.user_id}</p>
              </div>
              <footer className="containerFooter" id="containerFooter">
                {group === "Technical Clerk" && (
                  <>
                    <span className="d-none d-lg-inline">
                      <Button
                        variant="secondary"
                        onClick={goToCreateJob}
                        className="m-2"
                      >
                        Create Job
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={goToNewJobs}
                        className="m-2"
                      >
                        View New Jobs
                      </Button>
                    </span>

                    <Button
                      variant="secondary"
                      onClick={goToJobStat}
                      className="m-2"
                    >
                      View Stats
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={goToCreateCustomJob}
                      className="m-2"
                    >
                      Create Job For Someone
                    </Button>
                  </>
                )}
                {(group === "Electrical" ||
                  group === "Civil" ||
                  group === "Mechanical") && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={goToCreateJob}
                      className="m-2"
                    >
                      Create Job
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={goToAllJobs}
                      className="m-2"
                    >
                      Update Jobs
                    </Button>
                  </>
                )}
                {group === "Manager" && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={goToCreateJob}
                      className="m-2"
                    >
                      Create Job
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={goToAllJobs}
                      className="m-2"
                    >
                      Update Jobs
                    </Button>
                  </>
                )}
              </footer>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Dashboard;

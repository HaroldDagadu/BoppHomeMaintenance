import React, { useEffect, useState } from "react";
import { Carousel, Card, Row, CardText, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchProfile  } from '../Services/userProfileService'; // Import your service functions

import Jobl from "../components/card/Carouselcards.js";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchProfile(); // Using service to fetch user data
        setUser(userData);
        setLoading(false); // Finished loading
      } catch (error) {
        console.error("Error fetching user data:", error.response || error);
        setError(error); // Handle the error in state
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

  const handleHomeClick = () => {
    navigate("/user-home");
  };
  const handleCreateJob = () => {
    navigate("/jobs/create");
  };
  const handleCheckJob = () => {
    navigate("/jobs");
  };
  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="container">
      <Row className="mb-4">
        <Row className="mb-4">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="cardib">
                <div className="card-body">
                  <Card.Header>
                    <h4 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                      Welcome,{" "}
                      {user.first_name.charAt(0).toUpperCase() +
                        user.first_name.slice(1).toLowerCase()}{" "}
                      {user.last_name.charAt(0).toUpperCase() +
                        user.last_name.slice(1).toLowerCase()}
                      !
                    </h4>
                    <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Your user ID is: {user.user_id}
                    </h5>
                  </Card.Header>
                  <CardText></CardText>
                </div>
              </div>
            </div>

            <Row className="mb-4">
              <div class="mt-5">
                <div className="card">
                  <h5 className="card-header">How to Navigate Web site</h5>
                  <h6 className="card-body">
                    <div>
                      <p>
                        Welcome! Here's a quick guide to help you use the
                        platform.
                      </p>

                      <ol>
                        <li>
                          <h5>Home Button </h5>{" "}
                          <Button
                            className="btn btn-secondary rounded-pill text-white me-4"
                            onClick={handleHomeClick}
                            style={{ borderRadius: "10px" }}
                          >
                            Home
                          </Button>
                          <p>
                            Click the <strong>Home</strong> button on the navbar
                            to return to the homepage, where you'll see:
                          </p>
                          <ul>
                            <li>
                              A job status chart (Pending, Approved, Rejected,
                              Completed).
                            </li>
                            <li>
                              A carousel with sign-up and usage instructions.
                            </li>
                            <li>A carousel of recent jobs.</li>
                          </ul>
                        </li>

                        <li>
                          <h5>Create Job Button </h5>
                          <Button
                            className="btn btn-secondary rounded-pill text-white me-4"
                            onClick={handleCreateJob}
                            style={{ borderRadius: "10px" }}
                          >
                            Create Job
                          </Button>

                          <p>
                            Click the <strong>Create Job</strong> button to fill
                            out a form with job details, including an optional
                            image. Submit to add the job.
                          </p>
                        </li>

                        <li>
                          <h5>Check Job Status Button</h5>
                          <Button
                            className="btn btn-secondary rounded-pill text-white me-4"
                            onClick={handleCheckJob}
                            style={{ borderRadius: "10px" }}
                          >
                            Check Job Status
                          </Button>
                          <p>
                            Click <strong>Check Job Status</strong> on the
                            navbar to view your job's current status: Pending,
                            Approved, Rejected, or Completed.
                          </p>
                        </li>
                        <li>
                          <h5>Profile Button</h5>
                          <Button
                            className="btn btn-secondary rounded-pill text-white me-4"
                            onClick={handleProfile}
                            style={{ borderRadius: "10px" }}
                          >
                            Profile
                          </Button>
                          <p>
                            Click on the <strong>Profile</strong> on the navbar
                            to update your profile details (name, phone,
                            community, etc.) and change your password. It
                            fetches your current info, allows edits, and updates
                            the data when you submit.
                          </p>
                        </li>
                      </ol>

                      <p>
                        Follow these steps to navigate the site and manage your
                        jobs efficiently!
                      </p>
                    </div>
                  </h6>
                </div>
              </div>
            </Row>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <Carousel>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="https://img.freepik.com/free-vector/person-using-cellphone_24908-81268.jpg?t=st=1722886227~exp=1722889827~hmac=2bf8385618181eeed37729e97788d45ba97d0d3df9b526211e13e2ea3da3895a&w=740"
                      alt="Step 1"
                    />
                    <Carousel.Caption>
                      <h3>Step 1</h3>
                      <p>Register and log in to the home maintenance app.</p>
                      <a href="https://www.freepik.com/free-vector/person-using-cellphone_136881395.htm#fromView=search&page=1&position=1&uuid=eb64102c-f577-47c7-b78e-baaf0cd3cea9">
                        Image by gstudioimagen on Freepik
                      </a>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="https://img.freepik.com/free-vector/flat-safer-internet-day-background_23-2151163150.jpg?t=st=1722886399~exp=1722889999~hmac=9ef224403c99a72cf10bdec29ae3f130df1cf70b49336bf70b50278f242f09f3&w=826"
                      alt="Step 2"
                    />
                    <Carousel.Caption>
                      <h3>Step 2</h3>
                      <p>Click on create job to fill form and submit.</p>
                      <a href="https://www.freepik.com/free-vector/flat-safer-internet-day-background_133742364.htm#fromView=image_search_similar&page=2&position=35&uuid=0a592393-88ae-4a52-976a-7ed3e3661f38">
                        Image by freepik
                      </a>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="https://img.freepik.com/free-vector/preferences-concept-illustration_114360-1403.jpg?t=st=1722886454~exp=1722890054~hmac=153e3bacc7bd2f9b396f04e68a27919b6e38b40863b73bc5cac1098e698da70d&w=826"
                      alt="Step 3"
                    />
                    <Carousel.Caption>
                      <h3>Step 3</h3>
                      <p>Track Job and wait for approval.</p>
                      <a href="https://www.freepik.com/free-vector/preferences-concept-illustration_7140416.htm#fromView=search&page=1&position=29&uuid=91df7620-3652-4643-8d97-fc08114627d7">
                        Image by storyset on Freepik
                      </a>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      className="d-block w-100"
                      src="https://img.freepik.com/free-vector/hand-drawn-compliment-illustration_23-2150222601.jpg?t=st=1722886479~exp=1722890079~hmac=3d5b581e4715a88e536282cfabb1e2cfd81f53a15fff5350cfbc8c4b637dde07&w=826"
                      alt="Step 4"
                    />
                    <Carousel.Caption>
                      <h3>Step 4</h3>
                      <p>Maintenance work will be done simple and easy!</p>
                      <a href="https://www.freepik.com/free-vector/hand-drawn-compliment-illustration_38890902.htm#fromView=search&page=2&position=16&uuid=35cc8d7b-d1fb-4d4e-a109-61f97f21cf67">
                        Image by freepik
                      </a>
                    </Carousel.Caption>
                  </Carousel.Item>
                </Carousel>
              </div>
            </div>
          </div>
        </Row>

        <div className="App">
          <Jobl />
        </div>
      </Row>
    </div>
  );
};

export default HomePage;

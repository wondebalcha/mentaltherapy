import React, { useRef, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NavBar.css";
import AuthContext from "../context/AuthContext";
import useAxios from "../utils/useAxios";
import jwtDecode from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faBell,
  faGlobe,
  faUser,
  faBars,
  faNoteSticky,
  faDashboard,
  faCalendar,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";
import { use } from "i18next";
import { Offcanvas, Button, Dropdown } from "react-bootstrap";

export default function NavBar() {
  const { user, logoutUser } = useContext(AuthContext);
  const axios = useAxios();

  const token = localStorage.getItem("authTokens");
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(token));
  const [relationIds, setRelationId] = useState(null);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [currentMessageCount, setCurrentMessageCount] = useState(0); // Define currentMessageCount state
  const [currentNotificationCount, setCurrentNotificationCount] = useState(0); // Define currentMessageCount state
  const location = useLocation();
  const decodedToken = token ? jwtDecode(token) : null;

  const user_type = decodedToken && decodedToken.user_type;
  const user_id = decodedToken && decodedToken.user_id;
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const style = { color: "inherit", textDecoration: "none" };

  useEffect(() => {
    const handleTokenChange = () => {
      const updatedToken = localStorage.getItem("authTokens");
      const updatedIsLoggedIn = Boolean(updatedToken);
      setIsLoggedIn(updatedIsLoggedIn);
    };

    // Listen for changes to the "authTokens" item in local storage
    window.addEventListener("storage", handleTokenChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleTokenChange);
    };
  }, []);

  useEffect(() => {
    const fetchRelationId = async () => {
      try {
        const endpoint = user_type === "patient" ? "patient" : "therapist";
        const transactionType =
          user_type === "patient" ? "debited" : "credited";

        const response = await axios.get(
          `http://127.0.0.1:8000/payment/${endpoint}/${user_id}/${transactionType}`
        );

        // Assuming the response contains an array of relations
        const relationData = response.data;
        // Extract the correct ID based on user type
        const fetchedIds =
          user_type === "patient"
            ? relationData.map((data) => data.therapist)
            : relationData.map((data) => data.patient);

        setRelationId(fetchedIds);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRelationId();
  }, [user_id, user_type]);

  useEffect(() => {
    const updatedToken = localStorage.getItem("authTokens");
    const updatedIsLoggedIn = Boolean(updatedToken);
    setIsLoggedIn(updatedIsLoggedIn);
  }, [window.location.pathname]);

  useEffect(() => {
    const handlePopstate = () => {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === "/login-p";

      if (isLoggedIn && isLoginPage) {
        logoutUser();
        window.location.reload();
      }
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [isLoggedIn, logoutUser]);

  const navbarRef = useRef(null);

  useEffect(() => {
    const handlePopstate = () => {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === "/login-p";
      const updatedToken = localStorage.getItem("authTokens");
      const updatedIsLoggedIn = Boolean(updatedToken);

      if (isLoggedIn && isLoginPage && !updatedIsLoggedIn) {
        logoutUser();
      }
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [isLoggedIn, logoutUser]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const navbarHeight = navbarRef.current.offsetHeight;
    const sectionTop = section.offsetTop - navbarHeight;

    window.scrollTo({
      top: sectionTop,
      behavior: "smooth",
    });
  };

  const fetchMessageCount = async () => {
    try {
      const counterResponse = await axios.get(
        `http://127.0.0.1:8000/session/counter/${user_id}/`
      );
      const messageCount = counterResponse.data.messageCount;
      const messageResponse = await axios.get(
        `http://127.0.0.1:8000/session/all-my-messages/${user_id}/`
      );
      const messages = messageResponse.data;
      const currentMessageCount = messages.length;
      setCurrentMessageCount(currentMessageCount);
      if (currentMessageCount > messageCount) {
        setNewMessageCount(currentMessageCount - messageCount);
      } else {
        setNewMessageCount(0);
      }

      const notificationCount = counterResponse.data.notificationCount;
      const endpoint = user_type === "patient" ? "patient" : "therapist";
      const notificationResponse = await axios.get(
        `http://127.0.0.1:8000/session/${endpoint}/${user_id}/notification/`
      );
      const notifications = notificationResponse.data;
      const currentNotificationCount = notifications.length;
      setCurrentNotificationCount(currentNotificationCount);
      if (currentNotificationCount > notificationCount) {
        setNewNotificationCount(currentNotificationCount - notificationCount);
      } else {
        setNewNotificationCount(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      fetchMessageCount();
      interval = setInterval(fetchMessageCount, 1000); // Fetch message count every 1 second
    }

    return () => clearInterval(interval);
  }, [isLoggedIn, user_id, user_type]);

  const handleNotificationClick = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/session/counter/${user_id}/`, {
        notificationCount: currentNotificationCount,
        user: user_id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessageClick = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/session/counter/${user_id}/`, {
        messageCount: currentMessageCount,
        user: user_id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) { // Set your desired width threshold
        handleCloseOffcanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleCloseOffcanvas]);
  return (
    <>
      <nav ref={navbarRef} className="navBar">
        {isLoggedIn ? (
          <>
            <Link
              to={user_type === "therapist" ? "/dashboard-t" : "/home-p"}
              style={{ textDecoration: "none" }}
            >
              <div className="navImgName">
                <img
                  src="../Images/logo/BunnaLogo.png"
                  alt=""
                  className="bunnaLogo"
                />
                <h3 className="bunnaName">BunnaMind</h3>
              </div>
            </Link>
            <div className="navButton">
              <div className="navButtonFlex">
                {user_type === "patient" && (
                  <Link
                    to="/notification-p"
                    style={{ textDecoration: "none" }}
                    onClick={handleNotificationClick}
                  >
                    <div className="notification">
                      <FontAwesomeIcon
                        icon={faBell}
                        color="beige"
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      {newNotificationCount > 0 && (
                        <span className="badge_notification">
                          {newNotificationCount}
                        </span>
                      )}
                      <h5>Notification</h5>
                    </div>
                  </Link>
                )}
                {user_type === "therapist" && (
                  <Link
                    to="/notification-t"
                    style={{ textDecoration: "none" }}
                    onClick={handleNotificationClick}
                  >
                    <div className="notification">
                      <FontAwesomeIcon
                        icon={faBell}
                        color="beige"
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      {newNotificationCount > 0 && (
                        <span className="badge_notification">
                          {newNotificationCount}
                        </span>
                      )}
                      <h5>Notification</h5>
                    </div>
                  </Link>
                )}
                {relationIds && relationIds.length > 0 ? (
                  <Link
                    to="/message-box"
                    style={{ textDecoration: "none" }}
                    onClick={handleMessageClick}
                  >
                    <div className="message-box">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        color="beige"
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      {newMessageCount > 0 && (
                        <span className="badge_message">{newMessageCount}</span>
                      )}
                      <h5>Message</h5>
                    </div>
                  </Link>
                ) : (
                  ""
                )}
                {user_type === "patient" && (
                  <Link
                    to="/community-space"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="community-space">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        color="beige"
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      <h5>Community Space</h5>
                    </div>
                  </Link>
                )}

                <Link to="/profile" style={{ textDecoration: "none" }}>
                  <div className="profile-button">
                    <FontAwesomeIcon
                      icon={faUser}
                      color="beige"
                      style={{ width: "2.5vw", height: "2.5vw" }}
                    />
                    <h5>Profile</h5>
                  </div>
                </Link>
                {user_type === "patient" && (
                  <h3
                    className="logoutButton"
                    onClick={() => logoutUser(user_type)}
                  >
                    Logout
                  </h3>
                )}
                {user_type === "therapist" && (
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="secondary"
                      id="dropdown-basic"
                      className="custom-toggle-button"
                    >
                      <FontAwesomeIcon icon={faBars} className="icon" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{
                        minWidth: "300px",
                        minHeight: "300px",
                        marginTop:"20px"
                      }}
                    >
                      <div style={{ height: "250px" }}>
                        <Dropdown.Item
                          as={Link}
                          to="/dashboard-t"
                          className="mb-3 fs-5"
                        >
                          <FontAwesomeIcon icon={faDashboard} /> Dashboard
                        </Dropdown.Item>
                        <Dropdown.Item
                          as={Link}
                          to="/appointments-t"
                          className="mb-3 fs-5"
                        >
                          <FontAwesomeIcon icon={faCalendar} /> Appointments
                        </Dropdown.Item>
                        <Dropdown.Item
                          as={Link}
                          to="/records-t"
                          className="mb-3 fs-5"
                        >
                          <FontAwesomeIcon icon={faNoteSticky} /> Record
                        </Dropdown.Item>
                        <Dropdown.Item
                          as={Link}
                          to="/community-space"
                          className="mb-3 fs-5"
                        >
                          <FontAwesomeIcon icon={faGlobe} /> Community Space
                        </Dropdown.Item>
                      </div>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => logoutUser(user_type)}>
                        <FontAwesomeIcon icon={faDoorOpen} />
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/" style={{ textDecoration: "none" }}>
              <div className="navImgName">
                <img
                  src="../Images/logo/BunnaLogo.png"
                  alt=""
                  className="bunnaLogo"
                />
                <h3 className="bunnaName">BunnaMind</h3>
              </div>
            </Link>
            <div className="navLink">
              {location.pathname === "/" && (
                <div className="navLinkFlex">
                  <Link to="/register-t" style={{ textDecoration: "none" }}>
                    <h3>For Therapist</h3>
                  </Link>
                  <h3 onClick={() => scrollToSection("Faq")}>FAQ</h3>
                  <h3 onClick={() => scrollToSection("AboutUs")}>About Us</h3>
                  <h3 onClick={() => scrollToSection("ContactUs")}>
                    Contact Us
                  </h3>
                </div>
              )}
            </div>

            <div className="navButton">
              {location.pathname === "/login-p" ? (
                <div className="navButtonFlex">
                  <Link to="/register-p" style={{ textDecoration: "none" }}>
                    <h3 className="registerButton">Register</h3>
                  </Link>
                </div>
              ) : location.pathname === "/login-t" ? (
                <div className="navButtonFlex">
                  <Link to="/register-t" style={{ textDecoration: "none" }}>
                    <h3 className="registerButton">Register</h3>
                  </Link>
                </div>
              ) : (
                <div className="navButtonFlex">
                  {location.pathname === "/register-t" ? (
                    <Link to="/login-t" style={{ textDecoration: "none" }}>
                      <h3 className="loginButton">Login</h3>{" "}
                    </Link>
                  ) : (
                    <Link to="/login-p" style={{ textDecoration: "none" }}>
                      <h3 className="loginButton">Login</h3>{" "}
                    </Link>
                  )}

                  {location.pathname === "/" && (
                    <Link to="/register-p" style={{ textDecoration: "none" }}>
                      {" "}
                      <h3 className="registerButton">Register</h3>{" "}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <Button
          className="navbar-toggler"
          type="button"
          onClick={handleShowOffcanvas}
          style={{ background: "beige" }}
        >
          <FontAwesomeIcon icon={faBars} />
        </Button>
      </nav>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
        style={{ maxWidth: "250px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {isLoggedIn ? (
            <>
              {user_type === "patient" && (
                <Link
                  to="/notification-p"
                  style={style}
                  onClick={handleNotificationClick}
                >
                  <div className="notification" onClick={handleCloseOffcanvas}>
                    <FontAwesomeIcon
                      icon={faBell}
                      color="beige"
                      style={{ width: "2.5vw", height: "2.5vw" }}
                    />
                    {newNotificationCount > 0 && (
                      <span className="badge_notification">
                        {newNotificationCount}
                      </span>
                    )}
                    <h5>Notification</h5>
                  </div>
                </Link>
              )}
              {user_type === "therapist" && (
                <Link
                  to="/notification-t"
                  style={style}
                  onClick={handleNotificationClick}
                >
                  <div className="notification" onClick={handleCloseOffcanvas}>
                    <FontAwesomeIcon
                      icon={faBell}
                      color="beige"
                      style={{ width: "2.5vw", height: "2.5vw" }}
                    />
                    {newNotificationCount > 0 && (
                      <span className="badge_notification">
                        {newNotificationCount}
                      </span>
                    )}
                    <h5>Notification</h5>
                  </div>
                </Link>
              )}
              {relationIds && relationIds.length > 0 && (
                <Link
                  to="/message-box"
                  style={style}
                  onClick={handleMessageClick}
                >
                  <div className="message-box" onClick={handleCloseOffcanvas}>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      color="beige"
                      style={{ width: "2.5vw", height: "2.5vw" }}
                    />
                    {newMessageCount > 0 && (
                      <span className="badge_message">{newMessageCount}</span>
                    )}
                    <h5>Message</h5>
                  </div>
                </Link>
              )}
              {user_type === "patient" && (
                <Link
                  to="/community-space"
                  style={style}
                  onClick={handleCloseOffcanvas}
                >
                  <div className="community-space">
                    <FontAwesomeIcon
                      icon={faGlobe}
                      color="beige"
                      style={{ width: "2.5vw", height: "2.5vw" }}
                    />
                    <h5>Community Space</h5>
                  </div>
                </Link>
              )}
              <Link to="/profile" style={style} onClick={handleCloseOffcanvas}>
                <div className="profile-button">
                  <FontAwesomeIcon
                    icon={faUser}
                    color="beige"
                    style={{ width: "2.5vw", height: "2.5vw" }}
                  />
                  <h5>Profile</h5>
                </div>
              </Link>
              {user_type === "patient" && (
                <div onClick={handleCloseOffcanvas}>
                  <h4
                    className="logoutButton"
                    onClick={() => logoutUser(user_type)}
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </h4>
                </div>
              )}
              {user_type === "therapist" && (
                <>
                  <Link to="/dashboard-t" onClick={handleCloseOffcanvas}>
                    <div className="menu-link">
                      <FontAwesomeIcon
                        icon={faDashboard}
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      <h5>Dashboard</h5>
                    </div>
                  </Link>
                  <Link to="/appointments-t" onClick={handleCloseOffcanvas}>
                    <div className="menu-link">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      <h5>Appointments</h5>
                    </div>
                  </Link>
                  <Link to="/records-t" onClick={handleCloseOffcanvas}>
                    <div className="menu-link">
                      <FontAwesomeIcon
                        icon={faNoteSticky}
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      <h5>Record</h5>
                    </div>
                  </Link>
                  <Link to="/community-space" onClick={handleCloseOffcanvas}>
                    <div className="menu-link">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        style={{ width: "2.5vw", height: "2.5vw" }}
                      />
                      <h5>Community Space</h5>
                    </div>
                  </Link>
                  <div onClick={handleCloseOffcanvas}>
                    <h4
                      className="logoutButton"
                      onClick={() => logoutUser(user_type)}
                      style={{ cursor: "pointer" }}
                    >
                      Logout
                    </h4>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {location.pathname === "/login-p" ? (
                <div className="navButtonFlex">
                  <Link
                    to="/register-p"
                    style={style}
                    onClick={handleCloseOffcanvas}
                  >
                    <h4 className="registerButton">Register</h4>
                  </Link>
                </div>
              ) : location.pathname === "/login-t" ? (
                <div className="navButtonFlex">
                  <Link
                    to="/register-t"
                    style={style}
                    onClick={handleCloseOffcanvas}
                  >
                    <h4 className="registerButton">Register</h4>
                  </Link>
                </div>
              ) : (
                <div className="navButtonFlex">
                  {location.pathname === "/register-t" ? (
                    <Link
                      to="/login-t"
                      style={style}
                      onClick={handleCloseOffcanvas}
                    >
                      <h4 className="loginButton">Login</h4>
                    </Link>
                  ) : (
                    <Link
                      to="/login-p"
                      style={style}
                      onClick={handleCloseOffcanvas}
                    >
                      <h4 className="loginButton">Login</h4>
                    </Link>
                  )}
                  {location.pathname === "/" && (
                    <Link to="/register-p" style={style}>
                      <h4 className="registerButton">Register</h4>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

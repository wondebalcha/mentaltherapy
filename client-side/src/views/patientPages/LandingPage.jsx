import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import { useTranslation } from "react-i18next";
import jwtDecode from "jwt-decode";
import "../../styles/LandingPage.css";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faVideo,
  faStar,
  faArrowCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  OverlayTrigger,
  Card,
  Button,
  Table,
  Alert,
  Modal,
} from "react-bootstrap";
import moment from "moment";

export default function LandingPage() {
  const [t, i18n] = useTranslation("global");
  const [selectedLanguage, setSelectedLanguage] = useState("english"); // State to store selected language

  useEffect(() => {
    // Check if a language is saved in local storage
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage); // Set selected language from local storage
    }
  }, []);

  const handleChangeLanguage = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
    setSelectedLanguage(language); // Update selected language in state
    localStorage.setItem("preferredLanguage", language); // Save selected language in local storage
  };

  const baseURL = "http://127.0.0.1:8000/core";

  const axios = useAxios();
  let [searchTherapist, setSearchTherapist] = useState({ search: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [recommendedTherapists, setRecommendedTherapists] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [modalBody, setModalBody] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [cancelAppointment, setCancleAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const therapistsPerPage = 9;

  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const history = useHistory();

  //Get user data
  const first_name = decoded.first_name;
  const user_type = decoded.user_type;
  const user_id = decoded.user_id;

  useEffect(() => {
    const patientData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/core/patients/${user_id}`
        );
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = await response.data;
        if (data.prediction_result === "null") {
          window.location.href = "http://localhost:3000/questionnaire";
        }
      } catch (error) {
        console.error("There was a problem fetching the data", error);
      }
    };

    patientData(); // Call the function inside useEffect
  }, []);

  console.log(decoded);

  //Get Therapists data and set the use state
  const therapistsData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/core/therapists");
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setTherapists(data);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
    }
  };

  useEffect(() => {
    therapistsData();
  }, []);

  const handleTherapistSelect = (therapistid) => {
    history.push(`/viewtherapist/${therapistid}`);
  };

  const handleVideo = (appointmentID) => {
    history.push(`/videochat-p/${appointmentID}`);
  };

  const SearchTherapist = async (searchQuery) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/core/search/${searchQuery}`
      );
      if (response.status === 200) {
        if (response.data.length === 0) {
          setSearchResults(["No users found"]);
        } else {
          setSearchResults(response.data);
        }
      } else if (response.status === 404) {
        console.log(response.data.detail);
        setSearchResults(["No users found"]);
      }
    } catch (error) {
      console.error("Error searching therapist:", error);
      setSearchResults(["No users found"]);
    }
  };

  function handelSearch(event) {
    const { value } = event.target;

    setSearchTherapist((prevSetSearchTherapist) => {
      return {
        ...prevSetSearchTherapist,
        search: value,
      };
    });

    // Call the search function directly
    if (value.trim() !== "") {
      // Only call the API if the search query is not empty
      SearchTherapist(value);
    } else {
      // Clear the search results if the search query is empty
      setSearchResults([]);
    }
  }

  useEffect(() => {
    const fetchRecommendedTherapist = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/recommendation/recommend/${user_id}`
        );
        if (response.status === 200) {
          setRecommendedTherapists(response.data);
        } else {
          throw new Error("Failed to fetch recommended therapist");
        }
      } catch (error) {
        console.error("Error fetching recommended therapist:", error);
      }
    };

    fetchRecommendedTherapist();
  }, [user_id]);

  const filteredTherapists = therapists.filter(
    (therapist) => therapist.paymentRate > 0
  );
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/session/patient/${user_id}/appointments`
        );
        const data = await response.data;
        const now = moment();
        // Filter out appointments that are in the past or have ended
        const filteredAppointments = data.filter((appointment) => {
          const appointmentEnd = moment(
            `${appointment.date} ${appointment.end_time}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return appointmentEnd.isAfter(now);
        });
        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleDeleteAppointmentModal = (appointmentID) => {
    setCancleAppointment(appointmentID);
    setModalTitle("Cancle Appointment");
    setModalBody("Are you sure you want to cancle the appointment!");
    setShowModal(true);
  };
  const handleDeleteAppointmentSubmit = async (appointmentID) => {
    const response = await axios.delete(
      `http://127.0.0.1:8000/session/patient/${user_id}/appointments/${appointmentID}`
    );

    if (response.status === 204) {
      setShowModal(false);
      window.location.reload();
    }
  };
  const handleModalClose = () => {
    setShowModal(false);
    window.location.reload(); // Refresh the page
  };

  const isVideoButtonEnabled = (appointmentDate, startTime) => {
    const appointmentDateTime = moment(appointmentDate).set({
      hour: moment(startTime, "HH:mm:ss").hour(),
      minute: moment(startTime, "HH:mm:ss").minute(),
      second: moment(startTime, "HH:mm:ss").second(),
    });
    // Subtract 5 minutes from the appointment time
    const videoAvailableTime = moment(appointmentDateTime).subtract(
      5,
      "minutes"
    );
    return moment().isSameOrAfter(videoAvailableTime);
  };

  // Pagination logic
  const indexOfLastTherapist = currentPage * therapistsPerPage;
  const indexOfFirstTherapist = indexOfLastTherapist - therapistsPerPage;
  const currentTherapists = therapists.slice(
    indexOfFirstTherapist,
    indexOfLastTherapist
  );

  const totalPages = Math.ceil(therapists.length / therapistsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const nextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      window.scrollTo(0, 0); // Scroll to top
      return nextPage;
    });
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => {
      const previousPage = prevPage - 1;
      window.scrollTo(0, 0); // Scroll to top
      return previousPage;
    });
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top
  };


  return (
    <div className="landingPage">
      <div className="languageForTranslate">
        <select
          className="preferedLanguage"
          onChange={handleChangeLanguage}
          value={selectedLanguage} // Set value to the selected language
        >
          <option value="english">Eng</option>
          <option value="amharic">Amh</option>
          <option value="oromo">Oro</option>
          <option value="sumalic">Som</option>
          <option value="tigrigna">Tig</option>
        </select>
      </div>
      <h2 className="hi text-center fw-bold fs-1 mt-3 mb-3">
        {t("landingPage.hiPatientName")}, {first_name}!
      </h2>
      <div className="searchContainer">
        <div className="row m-0 p-0 search d-flex justify-content-around">
          <form
            className="d-flex w-50"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="text"
              placeholder="Search Therapist"
              name="username"
              className="searchBar form-control rounded-0 w-100"
              onChange={handelSearch}
            />
            <button className="searchButton btn btn-secondary rounded-0">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>
        <div className="searchResults mt-4 justify-content-center d-flex">
          {searchResults.length > 0 && (
            <div className="searchResultsContainer w-50 shadow">
              <h2 className="text-center">{t("landingPage.searchResult")}</h2>
              {searchResults.map((user) => {
                if (user.user_type === "therapist") {
                  return (
                    <Link
                      to={`/viewtherapist/${user.user_id}`}
                      className="list-group-item list-group-item-action border-0"
                      key={user.user_id}
                    >
                      <div className="search-result d-flex align-items-start mb-2 hover border p-2">
                        <img
                          src={user.image}
                          className="rounded-circle mr-1"
                          alt="Profile"
                          width={40}
                          height={40}
                        />
                        <div className="flex-grow-1 ms-3">
                          {capitalizeFirstLetter(user.first_name)}{" "}
                          {capitalizeFirstLetter(user.last_name)}
                          <div className="small" style={{ color: "gray" }}>
                            View profile{" "}
                            <FontAwesomeIcon icon={faArrowCircleRight} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                } else {
                  return null; // Skip rendering if user is not a therapist
                }
              })}
            </div>
          )}
        </div>
      </div>

      {appointments.length > 0 && (
        <div className="container mt-4">
          <h2 className="text-center my-4">
            {t("landingPage.upcomingAppointment")}
          </h2>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{t("landingPage.dateAndTime")}</th>
                  <th>{t("landingPage.therapistName")}</th>
                  <th>{t("landingPage.type")}</th>
                  <th>{t("landingPage.action")}</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      {moment(appointment.appointment_date).format(
                        "DD MMM YYYY"
                      )}{" "}
                      ,{" "}
                      {moment(appointment.start_time, "HH:mm:ss").format(
                        "hh:mm A"
                      )}{" "}
                      -{" "}
                      {moment(appointment.end_time, "HH:mm:ss").format(
                        "hh:mm A"
                      )}
                    </td>
                    <td>
                      {appointment.therapist_first_name +
                        " " +
                        appointment.therapist_last_name}
                    </td>
                    <td>
                      {" "}
                      <OverlayTrigger
                        overlay={
                          <Tooltip>
                            {isVideoButtonEnabled(
                              appointment.date,
                              appointment.start_time
                            )
                              ? "Start Video"
                              : "Video will be available at the appointment time"}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleVideo(appointment.id)}
                            disabled={
                              !isVideoButtonEnabled(
                                appointment.date,
                                appointment.start_time
                              )
                            }
                            style={{
                              pointerEvents: isVideoButtonEnabled(
                                appointment.date,
                                appointment.start_time
                              )
                                ? "auto"
                                : "none",
                            }}
                          >
                            <FontAwesomeIcon icon={faVideo} />
                          </button>
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() =>
                          handleDeleteAppointmentModal(appointment.id)
                        }
                      >
                        {t("landingPage.cancel")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      <div className="recommendedTherapists  mt-4">
        <h2 className="text-center">{t("landingPage.recommendTherapist")}</h2>
        <div className="container row ms-sm-0 ms-lg-2 ms-md-2 d-flex align-items-center">
          {recommendedTherapists &&
            recommendedTherapists.map((therapist) => (
              <div className="col-md-4 mb-4" key={therapist.id}>
                <div class="container mt-3">
                  <div class="card card-custom-recomended shadow border-0">
                    <div class="star-rating">
                      <span>
                        <FontAwesomeIcon icon={faStar} color="#f59505a4" />{" "}
                        {therapist.rating.toFixed(1)}
                      </span>
                    </div>
                    <img
                      src={therapist.profile.image}
                      class="profile-img img-fluid"
                      alt="Doctor Image"
                      width="150"
                      height="150"
                    />
                    <div className="d-flex align-items-center justify-content-between px-2">
                      <div>
                        <h5 class="card-title-view ms-2">
                          {capitalizeFirstLetter(therapist.profile.first_name) +
                            " " +
                            capitalizeFirstLetter(therapist.profile.last_name)}
                        </h5>
                        <div class="speciality">{therapist.specialization}</div>
                      </div>
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleTherapistSelect(therapist.profile.user.id)
                        }
                      >
                        <FontAwesomeIcon icon={faArrowCircleRight} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* <div className="feeling text-center">
        <h2 className="mb-3 mt-5">How You feel Today?</h2>
        <div className="how-you-feel row row-auto d-flex m-0 p-0">
          <div className="emoji col col-4 col-auto">
            <h3>😊</h3>
            <h4>Happy</h4>
          </div>
          <div className="emoji col col-4 col-auto">
            <h3>🙂</h3>
            <h4>Normal</h4>
          </div>
          <div className="emoji col col-4 col-auto">
            <h3>😐</h3>
            <h4>Sad</h4>
          </div>
        </div>
      </div> */}

      <div className="ourTherapist mt-4 ">
        <h3 className="text-center">{t("landingPage.ourTherapist")}</h3>
        <div className="container row ms-sm-0 ms-lg-2 ms-md-2 d-flex align-items-center">
          {currentTherapists &&
            currentTherapists.map((therapist) => (
              <div className="col-md-4 mb-4" key={therapist.id}>
                <div class="container mt-3">
                  <div class="card card-custom-recomended shadow border-0">
                    <div class="star-rating">
                      <span>
                        <FontAwesomeIcon icon={faStar} color="#f59505a4" />{" "}
                        {therapist.rating.toFixed(1)}
                      </span>
                    </div>
                    <img
                      src={therapist.profile.image}
                      class="profile-img img-fluid"
                      alt="Doctor Image"
                      width="150"
                      height="150"
                    />
                    <div className="d-flex align-items-center justify-content-between px-2">
                      <div>
                        <h5 class="card-title-view ms-2">
                          {capitalizeFirstLetter(therapist.profile.first_name) +
                            " " +
                            capitalizeFirstLetter(therapist.profile.last_name)}
                        </h5>
                        <div class="speciality">{therapist.specialization}</div>
                      </div>
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleTherapistSelect(therapist.profile.user.id)
                        }
                      >
                        <FontAwesomeIcon icon={faArrowCircleRight} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="d-flex justify-content-center">
          {pageNumbers.map((number) => (
            <Button
              key={number}
              onClick={() => handlePageClick(number)}
              disabled={currentPage === number}
              className={`me-2 ${currentPage === number ? "active" : ""}`}
            >
              {number}
            </Button>
          ))}
        </div>
        <div className="d-flex justify-content-between">
          <Button
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={nextPage}
            disabled={indexOfLastTherapist >= therapists.length}
          >
            Next
          </Button>
        </div>
      </div>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBody}</Modal.Body>
        <Modal.Footer>
          {cancelAppointment ? (
            <Button
              variant="outline-danger"
              onClick={() => handleDeleteAppointmentSubmit(cancelAppointment)}
            >
              {t("landingPage.delete")}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleModalClose}>
              {t("landingPage.close")}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

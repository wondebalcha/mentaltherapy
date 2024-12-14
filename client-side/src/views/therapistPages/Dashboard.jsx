import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useTranslation } from "react-i18next";
import {
  Chart,
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
  PieController,
  ArcElement,
  Tooltip,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCalendarCheck,
  faCalendarMinus,
  faCalendarPlus,
  faEye,
  faTimeline,
  faMessage,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import useAxios from "../../utils/useAxios";
import "../../styles/therapisthome.css";
import jwtDecode from "jwt-decode";
import moment from "moment";

export default function Dashboard() {
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const [t, i18n] = useTranslation("global");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [therapists, setTherapists] = useState([]);
  const axios = useAxios();
  const history = useHistory();

  const therapistsData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/core/therapists/${user_id}`
      );
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
  console.log(therapists);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleChangeLanguage = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    localStorage.setItem("preferredLanguage", language);
  };

  useEffect(() => {
    fetchDateTime();
    const timer = setInterval(fetchDateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const fetchDateTime = () => {
    fetch("https://worldtimeapi.org/api/ip")
      .then((response) => response.json())
      .then((data) => {
        const dateTime = new Date(data.datetime);
        setCurrentDateTime(
          dateTime.toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true, // AM/PM format
          })
        );
      })
      .catch((error) => {
        console.error("Error fetching date and time:", error);
      });
  };

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const barCtx = barChartRef.current.getContext("2d");
    const pieCtx = pieChartRef.current.getContext("2d");

    Chart.register(
      LinearScale,
      BarController,
      CategoryScale,
      BarElement,
      PieController,
      ArcElement,
      Tooltip
    );

    let barChart = null;
    let pieChart = null;

    function createBarChart() {
      const data = {
        labels: ["20-30", "30-50", "50 and above"], // X-axis labels
        datasets: [
          {
            label: "Data",
            data: [10, 30, 40], // Corresponding data values
            backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
            borderColor: "rgba(75, 192, 192, 1)", // Border color
            borderWidth: 1, // Border width
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: "linear",
            beginAtZero: true,
            ticks: {
              stepSize: 10, // Define the step size for the y-axis ticks
            },
            title: {
              display: true,
              text: "Total Patients",
            },
          },
        },
      };

      // Destroy the existing bar chart if it exists
      if (barChart) {
        barChart.destroy();
      }

      // Create a new bar chart
      barChart = new Chart(barCtx, {
        type: "bar",
        data: data,
        options: options,
      });
    }

    function createPieChart() {
      const data = {
        labels: ["Red", "Blue", "Yellow"],
        datasets: [
          {
            label: "# of Votes",
            data: [12, 19, 3],
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
            borderWidth: 0,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                return `${label}: ${value}`;
              },
            },
          },
        },
      };

      // Destroy the existing pie chart if it exists
      if (pieChart) {
        pieChart.destroy();
      }

      // Create a new pie chart
      pieChart = new Chart(pieCtx, {
        type: "pie",
        data: data,
        options: options,
      });
    }

    createBarChart();
    createPieChart();

    // Clean up function to destroy the charts when the component unmounts
    return () => {
      if (barChart) {
        barChart.destroy();
      }
      if (pieChart) {
        pieChart.destroy();
      }
    };
  }, []);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/session/therapist/${user_id}/appointments/`
        );

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Filter appointments for today's date
        const todayAppointments = response.data.filter((appointment) => {
          return appointment.date === today;
        });

        setAppointments(todayAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleAppointment = () => {
    history.push("/appointments-t");
  };

  const handleMessage = (patientId) => {
    history.push(`/message/${patientId}`);
  };

  const getCurrentTime = () => {
    return moment().format("HH:mm:ss");
  };

  return (
    <div className="container-fluid min-vh-100 px-1 m-0">
      <div className="row therapist-home d-flex flex-row m-0">
        <div className="languageForTranslate">
          <select
            className="preferedLanguage"
            onChange={handleChangeLanguage}
            value={selectedLanguage}
          >
            <option value="english">Eng</option>
            <option value="amharic">Amh</option>
            <option value="oromo">Oro</option>
            <option value="sumalic">Som</option>
            <option value="tigrigna">Tig</option>
          </select>
        </div>
        <div className="dashboard row m-0 p-0">
          <div className="main-info col-lg-9 col-md-9 col-sm-12 bg-light">
            <div className="d-flex align-items-center justify-content-between dashboard-header">
              <h2>Dashboard</h2>
              <div className="calendar-container">
                <div className="calendar-icon">
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <div className="datetime">
                  <span>{currentDateTime}</span>
                </div>
              </div>
            </div>

            <div className="row shadow p-0 m-0 rounded mb-5">
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="dashboard-card card d-flex flex-row align-items-center shadow rounded p-1 mb-5 mt-4">
                  <div className="col-auto shadow rounded p-2">
                    <FontAwesomeIcon icon={faTimeline} />
                  </div>
                  <div className="col-auto text-start mt-2 ms-2">
                    <h5 className="fs-6">{t("dashboard.newAppointments")}</h5>
                    <h5>10</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="dashboard-card card d-flex flex-row align-items-center shadow rounded p-1 mb-5 mt-4">
                  <div className="col-auto shadow rounded p-2">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <div className="col-auto text-start mt-2 ms-2">
                    <h5 className="fs-6">{t("dashboard.totalVisitor")}</h5>
                    <h5>10</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="dashboard-card card d-flex flex-row align-items-center shadow rounded p-1 mb-5 mt-4">
                  <div className="col-auto shadow rounded p-2">
                    <FontAwesomeIcon icon={faCalendarCheck} color="green" />
                  </div>
                  <div className="col-auto text-start mt-2 ms-2">
                    <h5 className="fs-6">{t("dashboard.overallBooking")}</h5>
                    <h5>1K</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="dashboard-card card d-flex flex-row align-items-center shadow rounded p-1 mb-5 mt-4">
                  <div className="col-auto shadow rounded p-2">
                    <FontAwesomeIcon icon={faCalendarPlus} color="purple" />
                  </div>
                  <div className="col-auto text-start mt-2 ms-2">
                    <h5 className="fs-6">{t("dashboard.appointmentsToday")}</h5>
                    <h5>3</h5>
                  </div>
                </div>
              </div>
            </div>
            <div className="row ms-1 me-1 mt-4 shadow py-3 px-2 mb-4">
              <h4>{t("dashboard.yourAppointment")}</h4>
              {appointments !== null && appointments !== undefined && (
                <>
                  {appointments.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered mt-2">
                        <thead>
                          <tr>
                            <th className="text-center">
                              {t("appointments.clientName")}
                            </th>
                            <th className="text-center">
                              {t("appointments.dateTime")}
                            </th>
                            <th className="text-center">{t("dashboard.dashboardAction")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td className="text-center">
                                {appointment.patient_first_name}{" "}
                                {appointment.patient_last_name}
                              </td>
                              <td className="text-center">
                                {moment(appointment.date).format("D MMMM YYYY")}
                                ,{" "}
                                {moment(
                                  appointment.start_time,
                                  "HH:mm:ss"
                                ).format("hh:mm A")}{" "}
                                -{" "}
                                {moment(
                                  appointment.end_time,
                                  "HH:mm:ss"
                                ).format("hh:mm A")}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-around">
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() =>
                                      handleMessage(appointment.patientID)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faMessage} />
                                  </button>
                                  {getCurrentTime() > appointment.end_time ? (
                                    <button className="btn btn-outline-success">
                                      {t("dashboard.dashboardPassed")}
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={handleAppointment}
                                    >
                                      {t("dashboard.appointmentPage")}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>{t("appointments.nodateFound")}</p>
                  )}
                </>
              )}
            </div>

            <div className="row justify-content-center gap-3">
              <div className="col-lg-6 mb-4 shadow">
                <canvas ref={barChartRef} />
              </div>
              <div className="col-lg-5 mb-4 shadow">
                <canvas ref={pieChartRef} />
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-3 d-none d-lg-block min-vh-100 shadow">
            {therapists && therapists.profile && (
              <div className="therapist-details-container">
                <div className="therapist-image">
                  <img src={therapists.profile.image} alt="Therapist" />
                </div>
                <div className="therapist-info">
                  <h3 className="therapist-name">
                    {therapists.profile.first_name +
                      " " +
                      therapists.profile.last_name}
                  </h3>
                  <p className="therapist-specialization">
                    {t("dashboard.clinicalPsychologist")}
                  </p>
                  <div className="rating-container">
                    {[...Array(5)].map((_, index) => (
                      <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        className={`star-icon ${
                          index < Math.floor(therapists.rating)
                            ? "filled"
                            : index < Math.ceil(therapists.rating) &&
                              therapists.rating % 1 !== 0
                            ? "half-filled"
                            : ""
                        }`}
                      />
                    ))}
                    <span className="rating">{therapists.rating}</span>
                  </div>
                  <button className="view-reviews-btn">{t("dashboard.viewReviews")}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

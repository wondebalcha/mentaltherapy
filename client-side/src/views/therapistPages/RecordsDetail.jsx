import React, { useState, useEffect } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import jwtDecode from "jwt-decode";
import useAxios from "../../utils/useAxios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faComment,
  faPen,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../../styles/Records.css";
import { useTranslation } from "react-i18next";
import { Tooltip, OverlayTrigger, Button, Modal } from "react-bootstrap";
import { decode } from "punycode";

export default function RecordsDetail() {

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
  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const history = useHistory();
  const first_name = decoded.first_name;
  const last_name = decoded.last_name;
  const therapist_name = first_name + " " + last_name

  const { id } = useParams();
  const axios = useAxios();
  const [patient, setPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [predictionResult, setPredictionResult] = useState([]);
  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
  };

  //edit the note
  const [editMode, setEditMode] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);

  const handleEditClick = (recordId, note) => {
    setRecord(note);
    setEditRecordId(recordId);
    setEditMode(true);
    setShowModal(true);
  };

  const truncateNote = (note, length) => {
    if (note.length <= length) return note;
    return note.substring(0, length) + "...";
  };

  const [expandedNotes, setExpandedNotes] = useState({});

  const handleToggleReadMore = (id) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRecord = (e) => {
    setRecord(e.target.value); // Convert to number
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const patientData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/core/patients/${id}`
      );
      setPatient(response.data);
      setIsLoading(false);
      const appointmentResponse = await axios.get(
        `http://127.0.0.1:8000/session/patient/${response.data.profile.user_id}/appointments/`
      );
      setAppointments(appointmentResponse.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    patientData();
  }, []);

  const patientRecordData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/session/patient/${id}/record`
      );
      setPatientRecords(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };
  useEffect(() => {
    patientRecordData();
  }, []);

  const handleRecordDelete = async (recordId) => {
    const response = await axios.delete(
      `http://127.0.0.1:8000/session/patient/${id}/record/${recordId}`
    );
    console.log(response.data);
    window.location.reload();
  };

  const filteredAppointments = appointments.filter(
    (appointment) => appointment.therapistID === user_id
  );
  const displayPredictionResult = () => {
    return (
      <ul>
        {predictionResult.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const fetchPredictionResult = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/predictions/${id}`
      );
      setPredictionResult(response.data);
    } catch (error) {
      console.error("Error fetching prediction result:", error);
    }
  };

  useEffect(() => {
    fetchPredictionResult();
  }, []);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("note", record);
    formData.append("therapist_name", therapist_name);
    formData.append("patient", id);
    if (photo) {
      formData.append("prescription", photo);
    }
    console.log(id);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/session/patient/${id}/record/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch(error) {
      console.error(
        "Error on submitting record:",
      );
    }
      
      try {
        if (editMode) {
          const response = await axios.put(
            `http://127.0.0.1:8000/session/patient/${id}/record/${editRecordId}/`,
            { note: record, therapist_name: user_id, patient: id }
          );
          console.log("Record updated successfully:", response.data);
        } else {
          const response = await axios.post(
            `http://127.0.0.1:8000/session/patient/${id}/record/`,
            { note: record, therapist_name: user_id, patient: id }
          );
          console.log("Record posted successfully:", response.data);
        }
        setShowModal(false);
        setRecord("");
        setEditMode(false);
        setEditRecordId(null);
        window.location.reload();
    } catch (error) {
      console.error(
        "Error on submitting record:",
        error.response ? error.response.data : error.message
      );
    }
  }; 
    
  const handleVideo = (appointmentID) => {
    history.push(`/videochat-t/${appointmentID}`);
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

  return (
    <div className="therapist-home d-flex flex-column m-0">
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
      <div className="main-content col-lg-12 col-md-12 col-sm-8 px-4 min-vh-100">
        {patient && (
          <div>
            <div className="container-fluid">
              <div className="row shadow mt-4">
                <div className="col-12 d-lg-flex d-sm-block">
                  <div className="content m-0 p-0">
                    <div className="row">
                      <div className="col-12 ms-lg-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mt-1">
                            <strong>{t("record.patient")}</strong> {">"}{" "}
                            <span
                              style={{
                                color: "rgb(70, 30, 30)",
                                fontWeight: "bold",
                              }}
                            >
                              {patient.profile.first_name}{" "}
                              {patient.profile.last_name}
                            </span>
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4" style={{ zIndex: 500 }}>
                      <div className="col-12">
                        <div className="card card-custom p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="d-flex align-items-start mb-3 ">
                              <img
                                src={patient.profile.image}
                                className="rounded-circle me-1"
                                alt="Profile image"
                                width={60}
                              />
                              <div className="ms-3">
                                <h5>
                                  {patient.profile.first_name +
                                    " " +
                                    patient.profile.last_name}
                                </h5>
                                <p className="mt-1">{patient.occupation}</p>
                              </div>
                            </div>
                            <button className="btn border">
                              <FontAwesomeIcon
                                icon={faComment}
                                onClick={() => {
                                  window.location.href = `/message/${patient.profile.user_id}`;
                                }}
                              />
                            </button>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div>
                              <p>
                                <strong>{t("record.patientAge")}: </strong> {patient.profile.age}
                              </p>
                              <p>
                                <strong>{t("record.patientGender")}:</strong>{" "}
                                {patient.profile.gender}
                              </p>
                              <p>
                                <strong>{t("record.patientMartialStatus")}:</strong>{" "}
                                {patient.profile.martial_status}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>{t("record.patientPhone")}:</strong> {patient.profile.phone}
                              </p>
                              <p>
                                <strong>{t("record.patientCity")}: </strong> {patient.profile.city}
                              </p>
                              <p>
                                <strong>{t("record.patientRegion")}:</strong>{" "}
                                {patient.profile.region}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>{t("record.patientPrefered")}: </strong>{" "}
                                {patient.profile.prefered_language}
                              </p>
                              <p>
                                <strong>
                                {t("record.recentPrediction")}:{" "}
                                </strong>{" "}
                                {predictionResult.length > 0 ? (
                                  displayPredictionResult()
                                ) : (
                                  <span>No prediction result available.</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 mt-4">
                        <div className="card card-custom p-4 mb-4">
                          <h5>{t("record.upcomingAppointment")}</h5>
                          {filteredAppointments.length > 0 ? (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>{t("record.appointmentDate")}</th>
                                  <th>{t("record.appointmentTime")}</th>
                                  <th>{t("record.appointmentType")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredAppointments.map((appointment) => (
                                  <tr key={appointment.id}>
                                    <td>
                                      {new Date(
                                        appointment.startDate
                                      ).toLocaleDateString()}
                                    </td>
                                    <td>
                                      {new Date(
                                        appointment.startDate
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </td>
                                    <td>
                                      {" "}
                                      <OverlayTrigger
                                        overlay={
                                          <Tooltip>
                                            {isVideoButtonEnabled(appointment.date, appointment.start_time)
                                              ? "Start Video"
                                              : "Video will be available at the appointment time"}
                                          </Tooltip>
                                        }
                                      >
                                        <span className="d-inline-block">
                                          <button
                                            className="btn btn-success"
                                            onClick={() => handleVideo(appointment.id)}
                                            disabled={!isVideoButtonEnabled(appointment.date, appointment.start_time)}
                                            style={{
                                              pointerEvents: isVideoButtonEnabled(appointment.date, appointment.start_time)
                                                ? "auto"
                                                : "none",
                                            }}
                                          >
                                            <FontAwesomeIcon icon={faVideo} />
                                          </button>
                                        </span>
                                      </OverlayTrigger>
                                      {/* <button
                                        className="btn btn-success"
                                        onClick={() =>
                                          handleVideo(appointment.id)
                                        }
                                      >
                                        <FontAwesomeIcon icon={faVideo} />
                                      </button> */}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>{t("record.noupcomingAppointment")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12 col-sm-12 ms-sm-0 ms-lg-3 mt-4 border shadow min-vh-100">
                    <h6 className="p-2">
                    {t("record.listofRecord")}{" "}
                      {patient.profile.first_name}
                    </h6>
                    <button
                      className="ms-2 mb-3 btn btn-secondary"
                      onClick={handleShow}
                    >
                      {t("record.addNewRecord")} <FontAwesomeIcon icon={faAdd} />
                    </button>
                    {patientRecords &&
                      patientRecords.map((patientRecord) => (
                        <div
                          className="note-card row d-block align-items-start m-3 shadow p-2 rounded"
                          key={patientRecord.id}
                        >
                          <div className="row d-flex justify-content-between">
                            <div className="col">
                              <p className="m-0 p-0">
                                Record {patientRecord.id}
                              </p>
                              <p
                                className="m-0 p-0"
                                style={{
                                  color: "lightgray",
                                  fontWeight: "600",
                                }}
                              >
                                at{" "}
                                {moment(patientRecord.date).format(
                                  "D MMMM YYYY"
                                )}
                              </p>
                            </div>
                            <div className="col d-flex justify-content-around">
                              <FontAwesomeIcon
                                icon={faPen}
                                className="me-1"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleEditClick(
                                    patientRecord.id,
                                    patientRecord.note
                                  )
                                }
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleRecordDelete(patientRecord.id)
                                }
                              />
                            </div>
                          </div>
                          <div className="row d-block align-items-start note-text">
                            {expandedNotes[patientRecord.id]
                              ? patientRecord.note
                              : truncateNote(patientRecord.note, 100)}
                          </div>
                          <div className="row">
                            <span
                              className=""
                              style={{ cursor: "pointer", color: "brown" }}
                              onClick={() =>
                                handleToggleReadMore(patientRecord.id)
                              }
                            >
                              {expandedNotes[patientRecord.id]
                                ? " Show less"
                                : " Read more"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <>
          <Modal
            show={showModal}
            backdrop="static"
            onHide={handleClose}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title centered>
                {editMode ? "Edit Record" : "Add a new record"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="input-group" style={{ width: "100%" }}>
                <textarea
                  placeholder="Start writing..."
                  name="note"
                  className="form-control"
                  onChange={handleRecord}
                  value={record}
                  rows="12" // Increase the number of rows to make it higher
                  cols="8"
                ></textarea>
              </div>
              <div className="row input-group mt-3" style={{ width: "100%" }}>
                <p>Upload a photo of prescription if there is one.</p>
                <input
                  type="file"
                  name="photo"
                  className="form-control"
                  onChange={handlePhotoChange}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="d-flex">
              <Button variant="success" onClick={handleRecordSubmit}>
                {editMode ? "Update" : "Save"}
              </Button>
            </Modal.Footer>
          </Modal>
          {showModal && (
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: "1050" }}
            ></div>
          )}
        </>
      </div>
    </div>
  );
}

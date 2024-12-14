import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useHistory } from "react-router-dom";
import moment from "moment";
import useAxios from "../../utils/useAxios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip, OverlayTrigger, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faVideo } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";
export default function Appointments() {
  const [t, i18n] = useTranslation("global");
  const [selectedLanguage, setSelectedLanguage] = useState("english");

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

  const axios = useAxios();
  const history = useHistory();
  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;

  const [buttonVariant, setButtonVariant] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentRateModal, setShowPaymentRateModal] = useState(false);
  const [modalBody, setModalBody] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    window.location.reload();
  };

  const handleShowPaymentRate = () => setShowPaymentRateModal(true);
  const handlePaymentRateClose = () => {
    setShowPaymentRateModal(false);
  };

  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [showAvalability, setShowAvalability] = useState();
  const [appointments, setAppointments] = useState([]);

  const [therapists, setTherapists] = useState([]);

  // Define state variables for storing the data of the availability being edited
  const [editAvailability, setEditAvailability] = useState(null);
  const [editStartDate, setEditStartDate] = useState(null);
  const [editStartTime, setEditStartTime] = useState(null);
  const [editEndTime, setEditEndTime] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  // Function to handle closing of the edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Function to open the edit modal and set the data of the availability being edited
  const handleEditAvailability = (availability) => {
    const { date, start_time, end_time } = availability;

    const formattedStartDate = moment(date).toDate();
    const formattedStartTime = moment(start_time, "HH:mm:ss").toDate();
    const formattedEndTime = moment(end_time, "HH:mm:ss").toDate();

    // Proceed with setting the edit availability data
    setEditAvailability(availability);
    setEditStartDate(formattedStartDate);
    setEditStartTime(formattedStartTime);
    setEditEndTime(formattedEndTime);
    setShowEditModal(true);
  };

  // Function to update the availability on submit
  const handleUpdateAvailability = async (e) => {
    e.preventDefault()
    // Format the date and time values using moment
    const date = moment(editStartDate).format("YYYY-MM-DD");
    const start_time = moment(editStartTime).format("HH:mm:ss");
    const end_time = moment(editEndTime).format("HH:mm:ss");

    console.log(date, start_time, end_time)
    // Perform validation
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${start_time}`);

    if (selectedDateTime <= now) {
      alert("Please select a date and time in the future.");
      return;
    }

    if (end_time < start_time) {
      alert("The end time must be after the start time.");
      return;
    }
    const overlappingAvailability = showAvalability.some((availability) => {
      // Exclude the availability being edited
      if (availability.id === editAvailability.id) {
        return false;
      }

      const availDate = moment(availability.date);
      const availStart = moment(availability.start_time, "HH:mm:ss");
      const availEnd = moment(availability.end_time, "HH:mm:ss");
      const newStart = moment(start_time, "HH:mm:ss");
      const newEnd = moment(end_time, "HH:mm:ss");

      // Check if the new availability overlaps with existing availability
      return (
        moment(date).isSame(availDate) &&
        ((newStart.isSameOrAfter(availStart) && newStart.isBefore(availEnd)) ||
          (newEnd.isAfter(availStart) && newEnd.isSameOrBefore(availEnd)) ||
          (newStart.isBefore(availStart) && newEnd.isAfter(availEnd)))
      );
    });

    if (overlappingAvailability) {
      alert("The selected time conflicts with an existing availability.");
      return;
    }
    // Send update request to backend
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/session/therapist/${user_id}/availability/${editAvailability.id}/`,
        {
          date,
          start_time,
          end_time,
        }
      );

      console.log(response.data)

      // Handle response
      if (response.status === 200) {
        // Update the availability list with the updated availability
        const updatedAvailability = response.data;
        const updatedAvailabilityList = showAvalability.map((availability) =>
          availability.id === updatedAvailability.id
            ? updatedAvailability
            : availability
        );
        setShowAvalability(updatedAvailabilityList);

        // Close the edit modal
        setShowEditModal(false);

        // Show success message
        setModalTitle("Edit Availability");
        setModalBody("Availability successfully updated!");
        handleShow();
      } else {
        // Show error message
        setModalTitle("Edit Availability");
        setModalBody("Failed to update availability. Please try again.");
        handleShow();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      // Handle error
      // Show error message
      setModalTitle("Edit Availability");
      setModalBody("Failed to update availability. Please try again.");
      handleShow();
    }
  };

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

  const showTherapistAvalability = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/session/therapist/${user_id}/availability/`
      );
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      const now = moment();
      // Filter out appointments that are in the past or have ended
      const filteredAvailabilities = data.filter((availability) => {
        const availabilityEnd = moment(
          `${availability.date} ${availability.end_time}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        return availabilityEnd.isAfter(now);
      });
      setShowAvalability(filteredAvailabilities);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
    }
  };
  const showTherapistAppointments = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/session/therapist/${user_id}/appointments/`
      );
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
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
      console.error("There was a problem fetching the data", error);
    }
  };

  useEffect(() => {
    showTherapistAvalability();
    showTherapistAppointments();
  }, []);

  console.log(appointments);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    const date = moment(startDate).format("YYYY-MM-DD");
    const start_time = moment(startTime).format("HH:mm:ss");
    const end_time = moment(endTime).format("HH:mm:ss");
    const therapist = user_id;

    // Combine the date, start time, and end time into a single datetime string
    const appointmentDateTime = `${date}T${start_time}`;

    // Perform validation
    const now = new Date();
    const selectedDateTime = new Date(appointmentDateTime);

    if (selectedDateTime <= now) {
      alert("Please select a date and time in the future.");
      return;
    }

    if (end_time < start_time) {
      alert("The end time must be after the start time.");
      return;
    }

    // Check for overlapping availabilities
    const overlappingAvailability = showAvalability.some((availability) => {
      const availDate = moment(availability.date);
      const availStart = moment(availability.start_time, "HH:mm:ss");
      const availEnd = moment(availability.end_time, "HH:mm:ss");
      const newDate = moment(date);
      const newStart = moment(start_time, "HH:mm:ss");
      const newEnd = moment(end_time, "HH:mm:ss");

      // Check if the new availability overlaps with existing availability
      return (
        newDate.isSame(availDate) &&
        ((newStart.isSameOrAfter(availStart) && newStart.isBefore(availEnd)) ||
          (newEnd.isAfter(availStart) && newEnd.isSameOrBefore(availEnd)) ||
          (newStart.isBefore(availStart) && newEnd.isAfter(availEnd)))
      );
    });

    if (overlappingAvailability) {
      alert("The selected time conflicts with an existing availability.");
      return;
    }

    // Submit the form or perform further actions
    // ...

    const response = await axios.post(
      `http://127.0.0.1:8000/session/therapist/${user_id}/availability/`,
      {
        therapist,
        date,
        start_time,
        end_time,
      }
    );

    const data = await response.data;
    console.log(data);

    const buttonVariant = response.status === 201 ? "success" : "danger";

    setButtonVariant(buttonVariant);

    if (response.status === 201) {
      // Show success message in the modal body
      setModalTitle("Avalability");
      setModalBody("Availability successfully created!");
      handleShow();
    } else {
      // Show error message in the modal body
      setModalTitle("Avalability");
      setModalBody("Failed to create availability. Please try again.");
      handleShow();
    }
  };

  const handleDeleteAvalabilitySubmit = async (availabilityID) => {
    const response = await axios.delete(
      `http://127.0.0.1:8000/session/therapist/${user_id}/availability/${availabilityID}`
    );

    const buttonVariant = response.status === 204 ? "success" : "danger";

    setButtonVariant(buttonVariant);

    if (response.status == 204) {
      // Show success message in the modal body
      setModalTitle("Avalability");
      setModalBody("Avalability successfully deleted!");
    } else {
      // Show error message in the modal body
      setModalTitle("Avalability");
      setModalBody("Failed to delete avalability. Please try again.");
    }
  };

  const handleMessage = (patientId) => {
    history.push(`/message/${patientId}`);
  };
  const handleVideo = (patientId) => {
    history.push(`/videochat-t/${patientId}`);
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
      <div className="appointment-content container">
        <div className="row gap-5 mt-4">
          <div className="col-lg-5 col-md-12">
            {showAvalability !== null && showAvalability !== undefined && (
              <div className="row shadow py-3 mb-4">
                <div className="col-12">
                  <h4>{t("appointments.listofAvailablity")}</h4>
                  {showAvalability.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Start time</th>
                            <th>End time</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showAvalability.map((availability, index) => (
                            <tr key={`${availability.id}-${index}`}>
                              <td>
                                {moment(availability.date).format(
                                  "D MMMM YYYY"
                                )}
                              </td>
                              <td>
                                {moment(
                                  availability.start_time,
                                  "HH:mm:ss"
                                ).format("hh:mm A")}
                              </td>
                              <td>
                                {moment(
                                  availability.end_time,
                                  "HH:mm:ss"
                                ).format("hh:mm A")}
                              </td>
                              <td>
                                <div className="d-flex">
                                  <button
                                    className="btn btn-success me-2 mb-1 mb-md-0"
                                    onClick={() =>
                                      handleEditAvailability(availability)
                                    }
                                  >
                                    {t("appointments.edit")}
                                  </button>
                                  <button
                                    className="btn btn-danger mb-1 mb-md-0"
                                    onClick={() => {
                                      handleShow();
                                      handleDeleteAvalabilitySubmit(
                                        availability.id
                                      );
                                    }}
                                  >
                                    {t("appointments.delete")}
                                  </button>
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
                </div>
              </div>
            )}

            <div className="col-12 mt-4 mt-lg-0">
              <div className="row shadow py-3 px-2 mb-4">
                <div className="col-12">
                  <h4>{t("appointments.setNewAvalability")}</h4>
                  <div className="row mb-3">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="MMMM d, yyyy"
                      placeholderText={t("appointments.selectDate")}
                      className="form-control"
                      popperClassName="date-picker-popper"
                    />
                  </div>
                  <div className="row mb-3">
                    <DatePicker
                      selected={startTime}
                      onChange={(time) => setStartTime(time)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Start Time"
                      dateFormat="h:mm aa"
                      placeholderText={t("appointments.selectStartTime")}
                      className="form-control"
                      popperClassName="date-picker-popper"
                    />
                  </div>
                  <div className="row mb-3">
                    <DatePicker
                      selected={endTime}
                      onChange={(time) => setEndTime(time)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="End Time"
                      dateFormat="h:mm aa"
                      placeholderText={t("appointments.selectEndTime")}
                      className="form-control"
                      popperClassName="date-picker-popper"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    onClick={
                      therapists.paymentRate === 0
                        ? handleShowPaymentRate
                        : handleAppointmentSubmit
                    }
                  >
                    {t("appointments.saveAvalability")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-md-12 mt-4 mt-lg-0">
            <div className="row shadow py-3 px-2 mb-4">
              <div className="col-12">
                <h4>{t("appointments.scheduleList")}</h4>
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
                              <th className="text-center">Type</th>
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
                                  {moment(appointment.date).format(
                                    "D MMMM YYYY"
                                  )}{" "}
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
                                      className="btn btn-success"
                                      onClick={() =>
                                        handleMessage(appointment.patientID)
                                      }
                                    >
                                      <FontAwesomeIcon icon={faMessage} />
                                    </button>
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
                                          onClick={() =>
                                            handleVideo(appointment.id)
                                          }
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
            </div>
          </div>
        </div>
      </div>

      <>
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title centered>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{modalBody}</p>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-center">
            <Button variant={buttonVariant} onClick={handleClose}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>
        {showModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: "1050" }}
            onClick={handleClose}
          ></div>
        )}
      </>

      <>
        <Modal
          show={showPaymentRateModal}
          onHide={handlePaymentRateClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title centered>Payment rate not set!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Please set your payment rate per month (ETB/month) in the setting
              inorder to post avalability for the patients!
            </p>
          </Modal.Body>
          <Modal.Footer className="d-flex">
            <Button variant="secondary" onClick={handlePaymentRateClose}>
              Cancle
            </Button>
            <Button
              variant="success"
              onClick={() => history.push("/profile")}
            >
              Go to setting
            </Button>
          </Modal.Footer>
        </Modal>
        {showPaymentRateModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: "1050" }}
            onClick={handlePaymentRateClose}
          ></div>
        )}
      </>

      <>
        <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Availability</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Form for editing availability */}
            <div className="row mx-3 mb-3">
              <DatePicker
                selected={editStartDate}
                onChange={(date) => setEditStartDate(date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select Date"
                className="form-control"
                popperClassName="date-picker-popper"
              />
            </div>
            <div className="row mx-3 mb-3">
              <DatePicker
                selected={editStartTime}
                onChange={(time) => setEditStartTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Start Time"
                dateFormat="h:mm aa"
                placeholderText="Select Start Time"
                className="form-control"
                popperClassName="date-picker-popper"
              />
            </div>
            <div className="row mx-3 mb-3">
              <DatePicker
                selected={editEndTime}
                onChange={(time) => setEditEndTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="End Time"
                dateFormat="h:mm aa"
                placeholderText="Select End Time"
                className="form-control"
                popperClassName="date-picker-popper"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button variant="outline-success" onClick={handleUpdateAvailability}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </div>
  );
}

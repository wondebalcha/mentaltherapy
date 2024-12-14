import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "../../styles/Profile.css";
import { useTranslation } from "react-i18next";
import jwtDecode from "jwt-decode";
import useAxios from "../../utils/useAxios";
import { Alert } from "react-bootstrap";

export default function Profile() {
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

  const [activeButton, setActiveButton] = useState("AccountSetting");

  function handleButtonId(buttonId) {
    if (buttonId != activeButton) {
      setActiveButton(buttonId);
    }
  }

  const axios = useAxios();
  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  // const history = useHistory();
  const user_id = decoded.user_id;
  const user_type = decoded.user_type;
  console.log(user_type);

  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const userData = async () => {
    if (user_type === "therapist") {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/core/therapists/${user_id}`
        );
        setUser(response.data);
        setPreviewImage(response.data.profile.image);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    } else if (user_type === "patient") {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/core/patients/${user_id}`
        );
        setUser(response.data);
        setPreviewImage(response.data.profile.image);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    }
  };

  useEffect(() => {
    userData();
  }, [user_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUser((prevPatient) => {
      // Check if the field name exists in the profile object
      if (prevPatient.profile.hasOwnProperty(name)) {
        return {
          ...prevPatient,
          profile: {
            ...prevPatient.profile,
            [name]: value,
          },
        };
      } else {
        // Update fields outside the profile object
        return {
          ...prevPatient,
          [name]: value,
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      profile: { ...user.profile },
    };
    delete updatedUser.profile.user; // Remove the user object
    delete updatedUser.profile.image; // Remove the image field
    delete updatedUser.licenses; // Remove the licenses field

    console.log(updatedUser);

    if (user_type === "therapist") {
      try {
        const test = await axios.patch(
          `http://127.0.0.1:8000/core/therapists/${user_id}/`,
          updatedUser
        );
        alert("Profile updated successfully!");
        console.log(test);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else if (user_type === "therapist") {
      try {
        const test = await axios.patch(
          `http://127.0.0.1:8000/core/patients/${user_id}/`,
          updatedUser
        );
        alert("Profile updated successfully!");
        console.log(test);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    // Log formData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      console.log(formData);
      const response = await axios.put(
        `http://127.0.0.1:8000/core/profile-update/${user_id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data.image);

      if (response.status === 200) {
        alert("Profile picture updated successfully!");
        setPreviewImage(response.data.image);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    // Perform basic validation
    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    const payload = {
      old_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/core/change-password/${user_id}/`,
        payload
      );
      if (response.status === 200) {
        alert("Password changed successfully");
      }
    } catch (error) {
      console.error("There was an error changing the password!", error);
      alert("Failed to change password");
    }
  };

  // things related to payment

  const [paymentChange, setPaymentChange] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [paymentRate, setPaymentRate] = useState({});

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
  }, [paymentChange]);

  const handlePaymentRateChange = (e) => {
    setPaymentRate(parseFloat(e.target.value)); // Convert to number
  };

  const handlePaymentRateSubmit = async (e) => {
    e.preventDefault();

    setPaymentChange(true);

    if (therapists.paymentRate === paymentRate) {
      setAlertVariant("danger");
      setAlertMessage(
        "You don't make an update on your payment rate value, nothing to change!!!"
      );
      return;
    }

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/core/therapists/${user_id}/`,
        { paymentRate: paymentRate }, // Ensure paymentRate is sent as a number
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Payment rate updated successfully:", response.data);
      setAlertVariant("success");
      setAlertMessage("Payment rate updated successfully");
      setPaymentChange(false);
    } catch (error) {
      console.error(
        "Error updating payment rate:",
        error.response ? error.response.data : error.message
      );
      setAlertVariant("danger");
      setAlertMessage("Error updating payment rate");
    }
  };

  useEffect(() => {
    const fetchPaymentRate = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/core/therapists/${user_id}`
        );
        setPaymentRate(response.data.paymentRate);
      } catch (error) {
        console.error("Error fetching payment rate:", error);
      }
    };

    fetchPaymentRate();
  }, []);

  const handleAlertDismiss = () => {
    setAlertMessage(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const { profile } = user;

  console.log(user);

  return (
    <div className="profile-page min-vh-100">
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
      {user && (
        <div className="row row-auto p-0 m-4 d-flex justify-content-between profile-contianer">
          <div className="col col-auto col-lg-3 col-md-3 col-sm-4 mb-3 mt-2 me-5 ms-5 profile-pic-container">
            <div className="card profile-pic-info">
              <div className="card-header text-center profile-pic-info-header">
                <div className="image-container">
                  <img src={previewImage} alt="" className="img-fluid w-100" />
                  <input
                    type="file"
                    accept="image/*"
                    id="profileImageInput"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <button
                    className="camera-button"
                    onClick={() =>
                      document.getElementById("profileImageInput").click()
                    }
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    📷
                  </button>
                </div>
                <h5 className="fs-6">
                  {profile.first_name + " " + profile.last_name}
                </h5>
                <h6 className="fw-light">Client</h6>
              </div>
              <div className="card-body profile-pic-info-body">
                {selectedImage && (
                  <button
                    className="update-button"
                    onClick={handleImageUpload}
                    style={{
                      marginTop: "10px",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      cursor: "pointer",
                    }}
                  >
                    {t("profile.updateProfile")}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col w-100 p-0 mt-2 shadow profile-data-info">
            <div className="card profile-data-card">
              <div className="card-header d-flex align-items-center p-2 m-2 text-center profile-data-header">
                <h6
                  style={{
                    color: `${
                      activeButton === "AccountSetting" ? "black" : "gray"
                    }`,
                    marginRight: "10%",
                    cursor: "pointer",
                  }}
                  onClick={() => handleButtonId("AccountSetting")}
                >
                  {t("profile.accountSetting")}
                </h6>
                <h6
                  style={{
                    color: `${
                      activeButton === "ChangePassword" ? "black" : "gray"
                    }`,
                    marginRight: "10%",
                    cursor: "pointer",
                  }}
                  onClick={() => handleButtonId("ChangePassword")}
                >
                  {t("profile.changePassword")}
                </h6>

                {user_type === "therapist" && (
                  <>
                    <h6
                      style={{
                        color: `${
                          activeButton === "AdditionalInformation"
                            ? "black"
                            : "gray"
                        }`,
                        marginRight: "10%",
                        cursor: "pointer",
                      }}
                      onClick={() => handleButtonId("AdditionalInformation")}
                    >
                      {t("profile.additionalProfile")}
                    </h6>
                    <h6
                      style={{
                        color: `${
                          activeButton === "Balance" ? "black" : "gray"
                        }`,

                        cursor: "pointer",
                      }}
                      onClick={() => handleButtonId("Balance")}
                    >
                      {t("profile.balancedRelated")}
                    </h6>
                  </>
                )}
              </div>
              <div className="card-body profile-data-body">
                {activeButton === "AccountSetting" && (
                  <form onSubmit={handleSubmit}>
                    <div className="row profile-input-row w-100">
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="firstName"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.firstName")}
                        </label>
                        <input
                          name="first_name"
                          type="text"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.firstName")}
                          id="firstName"
                          style={{ width: "auto" }}
                          value={profile.first_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="lastName"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.lastName")}
                        </label>
                        <input
                          name="last_name"
                          type="text"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.lastName")}
                          id="lastName"
                          value={profile.last_name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row profile-input-row w-100">
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="phoneNumber"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.phoneNumber")}
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.phoneNumber")}
                          id="phoneNumber"
                          style={{ width: "auto" }}
                          value={profile.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="email"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.emailAddress")}
                        </label>
                        <input
                          type="email"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.emailAddress")}
                          id="email"
                          value={profile.user.email}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row profile-input-row w-100">
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="gender"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.gender")}
                        </label>
                        <select
                          name="gender"
                          className="form-control w-100 profile-input"
                          id="gender"
                          value={profile.gender}
                          onChange={handleInputChange}
                        >
                          <option value="MALE">{t("profile.male")}</option>
                          <option value="FEMALE">{t("profile.female")}</option>
                        </select>
                      </div>
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="age"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.age")}
                        </label>
                        <input
                          type="number"
                          id="age"
                          placeholder={t("profile.age")}
                          name="age"
                          min={21}
                          max={105}
                          step={1}
                          className="form-control w-100 profile-input"
                          value={profile.age}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row profile-input-row w-100">
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="city"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.city")}
                        </label>
                        <input
                          name="city"
                          type="text"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.city")}
                          id="city"
                          value={profile.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="region"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.region")}
                        </label>
                        <input
                          name="region"
                          type="text"
                          className="form-control w-100 profile-input"
                          placeholder={t("profile.region")}
                          id="region"
                          value={profile.region}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row profile-input-row w-100">
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="martial-status"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1 profile-input"
                        >
                          {t("profile.maritalStatus")}
                        </label>
                        <select
                          name="martial_status"
                          className="form-select w-100 profile-input"
                          id="martial-status"
                          value={profile.martial_status}
                          onChange={handleInputChange}
                        >
                          <option value="SINGLE">{t("profile.single")}</option>
                          <option value="MARRIED">
                            {t("profile.married")}
                          </option>
                          <option value="DIVORCED">
                            {t("profile.divorced")}
                          </option>
                        </select>
                      </div>
                      <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                        <label
                          htmlFor="language-preference"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1"
                        >
                          {t("profile.languagePreference")}
                        </label>
                        <select
                          name="prefered_language"
                          className="form-select w-100 profile-input"
                          id="language-preference"
                          value={profile.prefered_language}
                          onChange={handleInputChange}
                        >
                          <option value="AMHARIC">Amharic</option>
                          <option value="OROMIFA">Oromifa</option>
                          <option value="SOMALLI">Somalli</option>
                          <option value="TIGRIGNA">Tigrigna</option>
                          <option value="ENGLISH">English</option>
                        </select>
                      </div>
                    </div>
                    {user_type === "patient" && (
                      <>
                        <label
                          htmlFor="occupation"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1 "
                        >
                          {t("profile.occupation")}
                        </label>
                        <select
                          name="occupation"
                          className="form-select w-100 mb-4 profile-input"
                          id="occupation"
                          value={user.occupation}
                          onChange={handleInputChange}
                        >
                          <option value="">{t("profile.occupation")}</option>
                          <option value="STUDENT">Student</option>
                          <option value="EMPLOYED">Employed</option>
                          <option value="SELFEMPLOYED">Self-Employed</option>
                          <option value="UNEMPLOYED">Unemployed</option>
                        </select>
                      </>
                    )}
                    {user_type === "therapist" && (
                      <>
                        <label
                          htmlFor="religion"
                          style={{ width: "max-content" }}
                          className="form-label m-0 p-0 ms-2 mb-1 "
                        >
                          {t("profile.religion")}
                        </label>
                        <select
                          name="religion"
                          className="form-select w-100 mb-4 profile-input"
                          id="religion"
                          value={user.religion}
                          onChange={handleInputChange}
                        >
                          <option value="ORTHODOX">Orthodox</option>
                          <option value="PROTESTANT">Protestant</option>
                          <option value="MUSLIM">Muslim</option>
                          <option value="CHATHOLIC">Chatholic</option>
                        </select>
                        <div className="row profile-input-row w-100">
                          <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                            <label
                              htmlFor="specialization"
                              style={{ width: "max-content" }}
                              className="form-label m-0 p-0 ms-2 mb-1"
                            >
                              {t("profile.specialization")}
                            </label>
                            <input
                              name="specialization"
                              type="text"
                              className="form-control w-100 profile-input"
                              placeholder="specialization"
                              id="specialization"
                              value={user.specialization}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col col-auto col-lg-6 mb-3 profile-input-column">
                            <label
                              htmlFor="experience"
                              style={{ width: "max-content" }}
                              className="form-label m-0 p-0 ms-2 mb-1"
                            >
                              {t("profile.experience")}
                            </label>
                            <input
                              type="number"
                              id="experience"
                              placeholder="experience"
                              name="experience"
                              className="form-control"
                              value={user.experience}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      className="btn btn-primary ms-2 profile-button"
                      style={{ width: "25%" }}
                    >
                      {t("profile.update")}
                    </button>
                  </form>
                )}
                {activeButton === "ChangePassword" && (
                  <div>
                    <form onSubmit={handlePasswordSubmit}>
                      <label
                        htmlFor="current-password"
                        style={{ width: "max-content" }}
                        className="form-label m-0 p-0 ms-2 mb-1"
                      >
                        {t("profile.currentPassword")}
                      </label>
                      <input
                        type="password"
                        className="form-control w-100 profile-input mb-3"
                        placeholder={t("profile.currentPassword")}
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <label
                        htmlFor="new-password"
                        style={{ width: "max-content" }}
                        className="form-label m-0 p-0 ms-2 mb-1"
                      >
                        {t("profile.newPassword")}
                      </label>
                      <input
                        type="password"
                        className="form-control w-100 profile-input mb-3"
                        placeholder={t("profile.newPassword")}
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <label
                        htmlFor="confirm-password"
                        style={{ width: "max-content" }}
                        className="form-label m-0 p-0 ms-2 mb-1"
                      >
                        {t("profile.confirmPassword")}
                      </label>
                      <input
                        type="password"
                        className="form-control w-100 profile-input mb-4"
                        placeholder={t("profile.confirmPassword")}
                        id="confirm-password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary ms-1">
                        {t("profile.updatePassword")}
                      </button>
                    </form>
                  </div>
                )}
                {activeButton === "Balance" && (
                  <div className="main-content">
                    <div className="row">
                      <h6>{t("profile.paymentRate")}</h6>
                      {therapists.paymentRate === 0 && (
                        <Alert
                          variant="danger"
                          className="w-50 ms-3"
                          dismissible
                        >
                          <h6>
                          {t("profile.yourPaymentRate1")}
                          </h6>
                        </Alert>
                      )}
                      {alertMessage && (
                        <Alert
                          variant={alertVariant}
                          className="w-50 ms-3"
                          dismissible
                          onClose={handleAlertDismiss}
                        >
                          {alertMessage}
                        </Alert>
                      )}
                      <form
                        onSubmit={handlePaymentRateSubmit}
                        className="d-flex align-items-center"
                      >
                        <div className="input-group" style={{ width: "50%" }}>
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control"
                              id="floatingInput"
                              placeholder={t("profile.enterNumber")}
                              value={paymentRate}
                              onChange={handlePaymentRateChange}
                            />
                            <label
                              htmlFor="floatingInput"
                              style={{ width: "100%" }}
                            >
                              {t("profile.yourPaymentRate2")}
                            </label>
                          </div>
                          <span className="input-group-text">ETH Birr</span>
                        </div>
                        <button className="btn btn-outline-success ms-2">
                        {t("profile.update")}
                        </button>
                      </form>
                    </div>
                    <div className="row">
                      <h6 className="mt-3">{t("profile.withdrawableBalance")}</h6>
                      <div className="input-group" style={{ width: "25%" }}>
                        <input
                          type="number"
                          className="form-control"
                          id="floatingInput"
                          placeholder={t("profile.enterNumber")}
                          value={therapists.withdrawableBalance}
                          readOnly
                        />
                        <span className="input-group-text">ETH Birr</span>
                      </div>
                    </div>

                    <div className="row">
                      <h6 className="mt-3">{t("profile.totalBalance")}</h6>
                      <div className="input-group" style={{ width: "25%" }}>
                        <input
                          type="number"
                          className="form-control"
                          id="floatingInput"
                          placeholder={t("profile.enterNumber")}
                          value={therapists.totalBalance}
                          readOnly
                        />
                        <span className="input-group-text">ETH Birr</span>
                      </div>
                    </div>
                    <div className="row">
                      <button
                        className="btn btn-outline-secondary ms-3 mt-2"
                        style={{ width: "10%" }}
                      >
                        {t("profile.withdraw")}
                      </button>
                    </div>
                  </div>
                )}

                {activeButton === "AdditionalInformation" && (
                  <div>
                    <div className="col mb-3 profile-input-column">
                      <label
                        htmlFor="Bio"
                        style={{ width: "max-content" }}
                        className="form-label m-0 p-0 ms-2 mb-1"
                      >
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        type="text"
                        className="form-control w-100 profile-input"
                        placeholder={t("profile.aboutMe")}
                        id="Bio"
                        style={{ width: "auto", height:"200px" }}
                        value={profile.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <button
                      className="btn btn-outline-success ms-2 profile-button"
                      style={{ width: "25%" }}
                      onClick={handleSubmit}
                    >
                      {t("profile.updateBio")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

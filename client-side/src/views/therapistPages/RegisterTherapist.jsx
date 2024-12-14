import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../styles/therapistregister.css";
import { useTranslation } from "react-i18next";
import AuthContext from "../../context/AuthContext";
import CryptoJS from "crypto-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function RegisterTherapist() {
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

  const [registerTherapistData, setRegisterTherapistData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    username: "",
    password: "",
    confirmPassword: "",
    //image:null,
    bio: "",
    gender: "",
    age: "",
    martialStatus: "",
    languagePreference: "",
    city: "",
    region: "",
    phoneNumber: "",
    specialization: "",
    experience: "",
    religion: "",
    licenses: "",
  });

  const { registerTherapist } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleCheckboxChange(event) {
    setAcceptedTerms(event.target.checked);
  }

  function handleRegisterTherapistData(event) {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setRegisterTherapistData((prevRegisterData) => ({
        ...prevRegisterData,
        [name]: files[0],
      }));
    } else {
      setRegisterTherapistData((prevRegisterData) => ({
        ...prevRegisterData,
        [name]: value,
      }));
    }
  }

  // Function to generate public and private keys
  const generateKeys = () => {
    const publicKey = CryptoJS.lib.WordArray.random(16); // Generate random key for public key
    return {
      publicKey: CryptoJS.enc.Base64.stringify(publicKey),
    };
  };

  const validate = () => {
    const errors = {};
    const phoneRegex = /^(\+251|0)?9\d{8}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(registerTherapistData.phoneNumber)) {
      errors.phoneNumber =
        t("register.ethiopiaPhone");
    }
    if (!registerTherapistData.firstName.match(/^[A-Z][a-z]*$/)) {
      errors.firstName = t("register.firstNameStartCapital");
    }
    if (!registerTherapistData.lastName.match(/^[A-Z][a-z]*$/)) {
      errors.lastName = t("register.eightCharLong");
    }
    if (!passwordRegex.test(registerTherapistData.password)) {
      errors.password =
      t("register.eightCharLong");
    }
    if (!emailRegex.test(registerTherapistData.emailAddress)) {
      errors.emailAddress = t("register.validEmail");
    }

    if (
      registerTherapistData.password !== registerTherapistData.confirmPassword
    ) {
      errors.confirmPassword = t("register.notMatchPassword");
    }
    if (registerTherapistData.age < 21) {
      errors.age = t("register.ageLess");
    }
    if (registerTherapistData.age > 65) {
      errors.age = t("register.ageGreater");
    }
    if (!registerTherapistData.gender) {
      errors.gender = t("register.genderRequired");
    }
    if (!registerTherapistData.martialStatus) {
      errors.martialStatus = t("register.maritalStatusRequired");
    }
    if (!registerTherapistData.languagePreference) {
      errors.languagePreference = t("register.languageRequired");
    }
    if (!registerTherapistData.religion) {
      errors.religion = "Religion is required.";
    }

    return errors;
  };

  const handleRegisterTherapistSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const {
      firstName,
      lastName,
      emailAddress: email,
      username,
      password,
      confirmPassword: password2,
      bio,
      languagePreference: prefered_language,
      age,
      gender,
      martialStatus: martial_status,
      phoneNumber: phone,
      city,
      region,
      specialization,
      experience,
      licenses,
      religion,
    } = registerTherapistData;

    const { publicKey } = generateKeys();
    const therapistData = {
      profile: {
        user: {
          email,
          username,
          password,
          password2,
        },
        user_type: "therapist",
        first_name: firstName,
        last_name: lastName,
        bio,
        prefered_language,
        age,
        gender,
        martial_status,
        phone,
        city,
        region,
        publicKey,
      },
      specialization,
      experience,
      licenses,
      religion,
    };

    registerTherapist(therapistData);
  };

  return (
    <div className="registerTherapist">
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
      <div className="container">
        <div className="welcome-title">
          <h3>{t("register.welcomeTitle")}</h3>
          <p>{t("register.therapistRegisterInfo")}</p>
        </div>
        <div className="reg-thera-form">
          <div className="reg-thera-card-header">
            <h4>{t("register.therapistRegisterHeader")}</h4>
            <h6 className="fw-light mt-2 mb-0">{t("register.therapistRegistartion")}</h6>
          </div>
          <form
            onSubmit={handleRegisterTherapistSubmit}
            encType="multipart/form-data"
          >
            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="text"
                  id="first-name"
                  placeholder={t("register.registerFirstName")}
                  name="firstName"
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.firstName && (
                  <div className="invalid-feedback text-start ms-1">
                    {errors.firstName}
                  </div>
                )}
              </div>
              <div className="input-container">
                <input
                  type="text"
                  id="last-name"
                  placeholder={t("register.registerLastName")}
                  name="lastName"
                  className={`form-control ${
                    errors.lastName ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.lastName && (
                  <div className="invalid-feedback text-start ms-1">
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>
            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="email"
                  id="email-address"
                  placeholder={t("register.registerEmailAddress")}
                  name="emailAddress"
                  className={`form-control ${
                    errors.emailAddress ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.emailAddress && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.emailAddress}
                  </div>
                )}
              </div>
              <div className="input-container">
                <input
                  type="text"
                  id="user-name"
                  placeholder={t("register.registerUserName")}
                  name="username"
                  className="form-control"
                  onChange={handleRegisterTherapistData}
                  required
                />
              </div>
            </div>
            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  placeholder={t("register.registerPassword")}
                  name="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.password && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="input-container">
                <input
                  type="password"
                  id="confirm-password"
                  placeholder={t("register.registerConfirmPassword")}
                  name="confirmPassword"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <select
                  name="gender"
                  className={`formSelect select-arrow  ${
                    errors.gender ? "is-invalid" : ""
                  }`}
                  id="gender"
                  onChange={handleRegisterTherapistData}
                  value={registerTherapistData.gender}
                >
                  <option value="" className="SelectOptionDefault">
                    {t("register.registerGender")}
                  </option>
                  <option value="MALE">
                    {t("register.registerGenderMale")}
                  </option>
                  <option value="FEMALE">
                    {t("register.registerGenderFemale")}
                  </option>
                </select>
                {errors.gender && (
                  <div className="invalid-feedback text-start">
                    {errors.gender}
                  </div>
                )}
              </div>
              <div className="input-container">
                <input
                  type="number"
                  id="age"
                  placeholder={t("register.registerAge")}
                  name="age"
                  step={1}
                  className={`form-control ${errors.age ? "is-invalid" : ""}`}
                  onChange={handleRegisterTherapistData}
                  required
                />
                {errors.age && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.age}
                  </div>
                )}
              </div>
            </div>
            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <select
                  name="martialStatus"
                  className={`formSelect select-arrow  ${
                    errors.martialStatus ? "is-invalid" : ""
                  }`}
                  id="martial-status"
                  onChange={handleRegisterTherapistData}
                >
                  <option value="" className="SelectOptionDefault">
                    {t("register.registerMartialStatus")}
                  </option>
                  <option value="SINGLE">
                    {t("register.registerMartialStatus1")}
                  </option>
                  <option value="MARRIED">
                    {t("register.registerMartialStatus2")}
                  </option>
                  <option value="DIVORCED">
                    {t("register.registerMartialStatus3")}
                  </option>
                </select>
                {errors.martialStatus && (
                  <div className="invalid-feedback text-start">
                    {errors.martialStatus}
                  </div>
                )}
              </div>
              <div className="input-container">
                <select
                  name="languagePreference"
                  className={`formSelect select-arrow  ${
                    errors.languagePreference ? "is-invalid" : ""
                  }`}
                  id="language-preference"
                  onChange={handleRegisterTherapistData}
                >
                  <option value="" className="SelectOptionDefault">
                    {t("register.registerLanguagePreference")}
                  </option>
                  <option value="AMHARIC">Amharic</option>
                  <option value="OROMIFA">Oromifa</option>
                  <option value="SOMALLI">Somalli</option>
                  <option value="TIGRIGNA">Tigrigna</option>
                  <option value="ENGLISH">English</option>
                </select>
                {errors.languagePreference && (
                  <div className="invalid-feedback text-start">
                    {errors.languagePreference}
                  </div>
                )}
              </div>
            </div>

            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder={t("register.registerCity")}
                  className="form-control"
                  onChange={handleRegisterTherapistData}
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="region"
                  placeholder={t("register.registerRegion")}
                  className="form-control"
                  onChange={handleRegisterTherapistData}
                  required
                />
              </div>
            </div>

            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="tel"
                  id="phonenumber"
                  name="phoneNumber"
                  placeholder={t("register.registerPhoneNumber")}
                  className={`form-control ${
                    errors.phoneNumber ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterTherapistData}
                  data-mdb-input-mask="999-999-999?9"
                  required
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback text-start ms-1  w-100">
                    {errors.phoneNumber}
                  </div>
                )}
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="specialization"
                  placeholder={t("register.registerSpecialization")}
                  className="form-control"
                  onChange={handleRegisterTherapistData}
                  required
                />
              </div>
            </div>

            <div className="form-outline d-registerThera d-flex justify-content-between">
              <div className="input-container">
                <input
                  type="text"
                  id="experience"
                  placeholder={t("register.registerExperience")}
                  name="experience"
                  className="form-control"
                  onChange={handleRegisterTherapistData}
                  required
                />
              </div>
              <div className="input-container">
                <select
                  name="religion"
                  className={`formSelect select-arrow ${
                    errors.religion ? "is-invalid" : ""
                  }`}
                  id="religion"
                  onChange={handleRegisterTherapistData}
                >
                  <option value="" className="SelectOptionDefault">
                    {t("register.registerReligion")}
                  </option>
                  <option value="ORTHODOX">Orthodox</option>
                  <option value="PROTESTANT">Protestant</option>
                  <option value="MUSLIM">Muslim</option>
                  <option value="CHATHOLIC">Chatholic</option>
                </select>
                {errors.religion && (
                  <div className="invalid-feedback text-start">
                    {errors.religion}
                  </div>
                )}
              </div>
            </div>

            <div className="form-outline text-start d-block align-items-start">
              <label htmlFor="fileInput">
                {t("register.registerLabelLiscence")}
              </label>
              <input
                type="file"
                id="fileInput"
                className="form-control"
                name="licenses"
                onChange={handleRegisterTherapistData}
                required
              />
            </div>

            <div className="form-check ms-2 d-flex align-items-start">
              <input
                type="checkbox"
                id="terms-and-conditions"
                className={`form-check-input custom-checkbox ${
                  errors.acceptedTerms ? "is-invalid" : ""
                }`}
                checked={acceptedTerms}
                onChange={handleCheckboxChange}
                required
                style={{width:"20px", height:"20px"}}
              />
              <label
                className="form-check-label ms-2"
                htmlFor="terms-and-conditions"
              >
                I accept{" "}
                <Link to="/terms-and-conditions">
                  {t("register.termAndCondition")}
                </Link>
              </label>
            </div>

            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={
                !acceptedTerms ? (
                  <Tooltip id="button-tooltip">
                    {t("register.youAccept")}
                  </Tooltip>
                ) : (
                  <></>
                )
              }
            >
              <span className="d-inline-block w-100">
                <button
                  className="w-100"
                  disabled={!acceptedTerms}
                  style={{ pointerEvents: !acceptedTerms ? "none" : "auto" }}
                >
                  {t("register.registerBtn")}
                </button>
              </span>
            </OverlayTrigger>

            <Link
              to=""
              style={{
                textDecoration: "none",
                color: "brown",
                fontWeight: "500",
              }}
            >
              <p className="p-0 mt-1 mb-1">
                {t("register.registerForgetPassword")}
              </p>
            </Link>
            <p className="mb-1">
              {t("register.registerHaveAccount")}{" "}
              <Link
                to="/login-t"
                style={{
                  textDecoration: "none",
                  color: "brown",
                  fontWeight: "500",
                }}
              >
                {t("register.signin")}
              </Link>
            </p>
            <p className="m-0 p-0">
              <Link
                to="/register-p"
                style={{
                  textDecoration: "none",
                  color: "brown",
                  fontWeight: "500",
                }}
              >
                {t("register.registerClient")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

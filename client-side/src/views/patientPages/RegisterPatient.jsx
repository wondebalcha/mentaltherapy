import React, { useContext, useState, useEffect } from "react";
import "../../styles/RegisterPatient.css";
import { useTranslation } from "react-i18next";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import CryptoJS from "crypto-js";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function RegisterPatient() {
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
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    gender: "",
    age: "",
    martialStatus: "",
    languagePreference: "",
    city: "",
    region: "",
    occupation: "",
    has_paid: false,
  });

  const { registerPatient } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleCheckboxChange(event) {
    setAcceptedTerms(event.target.checked);
  }

  function handleRegisterData(event) {
    const { name, value } = event.target;
    setRegisterData((prevRegisterData) => {
      return {
        ...prevRegisterData,
        [name]: value,
      };
    });
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

    if (!phoneRegex.test(registerData.phoneNumber)) {
      errors.phoneNumber =
        t("register.ethiopiaPhone");
    }
    if (!registerData.firstName.match(/^[A-Z][a-z]*$/)) {
      errors.firstName = t("register.firstNameStartCapital");
    }
    if (!registerData.lastName.match(/^[A-Z][a-z]*$/)) {
      errors.lastName = t("register.LastNameStartCapital");
    }
    if (!passwordRegex.test(registerData.password)) {
      errors.password =
      t("register.eightCharLong");
    }
    if (!emailRegex.test(registerData.emailAddress)) {
      errors.emailAddress = t("register.validEmail");
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = t("register.notMatchPassword");
    }
    if (registerData.age < 21) {
      errors.age = t("register.ageLess");
    }
    if (registerData.age > 65) {
      errors.age = t("register.ageGreater");
    }
    if (!registerData.gender) {
      errors.gender = t("register.genderRequired");
    }
    if (!registerData.martialStatus) {
      errors.martialStatus = t("register.maritalStatusRequired");
    }
    if (!registerData.languagePreference) {
      errors.languagePreference = t("register.languageRequired");
    }
    if (!registerData.occupation) {
      errors.occupation = t("register.occupationRequired");;
    }

    return errors;
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const first_name = registerData.firstName;
    const last_name = registerData.lastName;
    const email = registerData.emailAddress;
    const username = registerData.username;
    const password = registerData.password;
    const password2 = registerData.confirmPassword;
    const prefered_language = registerData.languagePreference;
    const age = registerData.age;
    const gender = registerData.gender;
    const martial_status = registerData.martialStatus;
    const phone = registerData.phoneNumber;
    const city = registerData.city;
    const region = registerData.region;
    const user_type = "patient";
    const occupation = registerData.occupation;
    const has_paid = registerData.has_paid;

    // Generate keys
    const { publicKey } = generateKeys();
    console.log("Public Key:", publicKey);

    const patientData = {
      profile: {
        user: {
          email,
          username,
          password,
          password2,
        },
        first_name,
        last_name,
        prefered_language,
        age,
        gender,
        martial_status,
        phone,
        city,
        region,
        user_type,
        publicKey,
      },
      occupation,
      has_paid,
    };

    console.log(registerData);

    registerPatient(patientData);
  };
  return (
    <div className="register">
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
      <div className="register-welcome-info">
        <h2 className="welcome">{t("register.welcomeTitle")}</h2>
        <p className="register-info">{t("register.patientRegisterInfo")}</p>
      </div>
      <div className="register-card">
        <div className="register-card-header">
          <h4 className="register-card-title">
            {t("register.patientRegisterHeader")}
          </h4>
          <h6 className="fw-light mt-3">{t("register.clientRegistration")}</h6>
        </div>
        <div className="register-form">
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-outline d-flex d-registerThera">
              <div className="input-container">
                <input
                  type="text"
                  id="first-name"
                  placeholder={t("register.registerFirstName")}
                  name="firstName"
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterData}
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
                  onChange={handleRegisterData}
                  required
                />
                {errors.lastName && (
                  <div className="invalid-feedback text-start ms-1">
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div className="form-outline d-registerThera d-flex">
              <div className="input-container">
                <input
                  type="email"
                  id="email-address"
                  placeholder={t("register.registerEmailAddress")}
                  name="emailAddress"
                  className={`form-control ${
                    errors.emailAddress ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterData}
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
                  type="tel"
                  id="phonenumber"
                  name="phoneNumber"
                  placeholder={t("register.registerPhoneNumber")}
                  className={`form-control ${
                    errors.phoneNumber ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterData}
                  data-mdb-input-mask="999-999-999?9"
                  required
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback text-start ms-1  w-100">
                    {errors.phoneNumber}
                  </div>
                )}
              </div>
            </div>

            <input
              type="text"
              id="user-name"
              placeholder={t("register.registerUserName")}
              name="username"
              onChange={handleRegisterData}
              className="form-control"
            />

            <div className="form-outline d-registerThera d-flex">
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  placeholder={t("register.registerPassword")}
                  name="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  onChange={handleRegisterData}
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
                  onChange={handleRegisterData}
                  required
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <div className="form-outline d-flex d-registerThera">
              <div className="input-container">
                <select
                  name="gender"
                  className={`formSelect select-arrow  ${
                    errors.gender ? "is-invalid" : ""
                  }`}
                  id="gender"
                  onChange={handleRegisterData}
                  value={registerData.gender}
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
                  onChange={handleRegisterData}
                  required
                />
                {errors.age && (
                  <div className="invalid-feedback text-start ms-1 w-100">
                    {errors.age}
                  </div>
                )}
              </div>
            </div>

            <div className="form-outline d-flex d-registerThera">
              <div className="input-container">
                <select
                  name="martialStatus"
                  className={`formSelect select-arrow  ${
                    errors.martialStatus ? "is-invalid" : ""
                  }`}
                  id="martial-status"
                  onChange={handleRegisterData}
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
                  onChange={handleRegisterData}
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

            <div className="form-outline d-flex">
              <input
                type="text"
                id="city"
                name="city"
                placeholder={t("register.registerCity")}
                value={registerData.city}
                onChange={handleRegisterData}
                className="form-control"
                required
              />

              <input
                type="text"
                name="region"
                placeholder={t("register.registerRegion")}
                value={registerData.region}
                onChange={handleRegisterData}
                className="form-control"
                required
              />
            </div>
            <div className="form-outline">
              <div className="input-container">
                <select
                  name="occupation"
                  className={`formSelect select-arrow  ${
                    errors.occupation ? "is-invalid" : ""
                  }`}
                  id="occupation"
                  value={registerData.occupation}
                  onChange={handleRegisterData}
                >
                  <option value="">{t("register.registerOccupation")}</option>
                  <option value="STUDENT">Student</option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELFEMPLOYED">Self-Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
                {errors.occupation && (
                  <div className="invalid-feedback text-start">
                    {errors.occupation}
                  </div>
                )}
              </div>
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
              to="#"
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
                to="/login-p"
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
                to="/register-t"
                style={{
                  textDecoration: "none",
                  color: "brown",
                  fontWeight: "500",
                }}
              >
                {t("register.registerTherapist")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

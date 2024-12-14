import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AuthContext from "../../context/AuthContext";
import "../../styles/LoginPatient.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

export default function LoginPatient() {
  const [t, i18n] = useTranslation("global");
  const [selectedLanguage, setSelectedLanguage] = useState("english"); // State to store selected language

  useEffect(() => {
    // Check if a language is saved in local storage
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage); // Set selected language from local storage
    }
  }, [i18n]);

  const handleChangeLanguage = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
    setSelectedLanguage(language); // Update selected language in state
    localStorage.setItem("preferredLanguage", language); // Save selected language in local storage
  };
  const { loginUser } = useContext(AuthContext);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const userType = "patient";

    email.length > 0 && loginUser(email, password, userType);

    console.log(email);
    console.log(password);
  };

  return (
    <div className="login">
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
      <div className="loginImage">
        <img src="../Images/login/LoginImage.png" alt="" />
      </div>
      <div className="loginForm">
        <div className="loginFormLogo">
          <img src="../Images/login/LoginLogo.png" alt="" />
          <h2 className="mb-2">{t("login.patientLoginTitle")}</h2>
          <h5 className="fw-light mb-3 p-0">{t("login.loginClient")}</h5>
        </div>
        <div className="loginCard">
          <form onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder={t("login.patientloginEmailAddress")}
              name="email"
              className="form-control"
              required
            />
            <input
              type="password"
              placeholder={t("login.patientLoginPassword")}
              name="password"
              className="form-control"
            />
            <button className="loginButton">
              {t("login.therapistLoginbtn")}
            </button>

            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <p
                className="mb-1 mt-1 p-0"
                style={{ color: "brown", fontWeight: "500" }}
              >
                {t("register.registerForgetPassword")}
              </p>
            </Link>
            <p className="p-0 m-0">
            {t("login.dontHaveAccount")}{" "}
              <Link
                to="/register-p"
                style={{
                  textDecoration: "none",
                  color: "brown",
                  fontWeight: "500",
                }}
              >
                {t("login.signup")}
              </Link>
            </p>
            <Link to="/login-t" style={{ textDecoration: "none" }}>
              <p
                className="mb-3 mt-2"
                style={{ color: "brown", fontWeight: "500" }}
              >
                {t("login.signinAsTherapist")}
              </p>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

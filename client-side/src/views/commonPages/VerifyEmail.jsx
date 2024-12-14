import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Button, Container, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome,faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const VerifyEmail = () => {
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
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Verifying...");
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/core/verify-email/${uid}/${token}/`)
      .then((response) => {
        setMessage("Email verified successfully!");
        setRedirectUrl(response.data.redirect_url || "/");
      })
      .catch((error) => {
        setMessage("Email verification failed.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uid, token]);

  const handleRedirect = () => {
    window.location.href = redirectUrl;
  };

  return (
    <Container className="text-center min-vh-100" style={{ paddingTop: "7vw", marginTop:"10%" }}>
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
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">{t("verifyEmail.verifingEmail")}</span>
        </Spinner>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-9 col-12 card shadow p-4 mx-3 rounded bg-light border">
            <FontAwesomeIcon icon={faCircleCheck} size="4x" color="green" />
            <div className="card-body text-center">
              <h2 className="card-title">{t("verifyEmail.verification")}</h2>
              <p className="card-text fs-sm-5 fs-5">
                {t("verifyEmail.emailverified")}
              </p>
              <button className="btn btn-outline-secondary" onClick={handleRedirect}>
                <FontAwesomeIcon icon={faHome} /> {t("verifyEmail.gotoHome")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default VerifyEmail;

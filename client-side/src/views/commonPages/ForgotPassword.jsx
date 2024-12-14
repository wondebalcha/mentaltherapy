import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

const ForgotPassword = () => {
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

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/forgot-password/",
        { email }
      );
      setMessage(response.data.message);
      setVariant("success");
    } catch (error) {
      setMessage(error.response.data.error);
      setVariant("danger");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
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
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <h1 className="text-center mb-4">{t("forgotPassword.forgotPasswordTitle")}</h1>
              {message && (
                <Alert variant={variant} className="mt-3" dismissible>
                  {message}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail">
                  <Form.Label>{t("forgotPassword.emailAddress")}</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("forgotPassword.enterYourEmail")}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                {t("forgotPassword.submit")}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;

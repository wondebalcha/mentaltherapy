import React, { useState, useEffect } from "react";
import "../../styles/Questionnaries.css";
import jwtDecode from "jwt-decode";
import useAxios from "../../utils/useAxios";
import ProgressBar from "../../component/ProgressBar.jsx";
import Confetti from "react-confetti";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import {
  faCircleCheck,
  faHeartCircleCheck,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

export default function PredictionQuestionnaire() {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const axios = useAxios();
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
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

  const questions = [
    {
      question: t("questionnaire.questionnaireQuestion1"),
      name: "q1",
    },
    {
      question: t("questionnaire.questionnaireQuestion2"),
      name: "q2",
    },
    {
      question: t("questionnaire.questionnaireQuestion3"),
      name: "q3",
    },
    {
      question: t("questionnaire.questionnaireQuestion4"),
      name: "q4",
    },
    {
      question: t("questionnaire.questionnaireQuestion5"),
      name: "q5",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion6"),
      name: "q6",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion7"),
      name: "q7",
    },
    {
      question: t("questionnaire.questionnaireQuestion8"),
      name: "q8",
    },
    {
      question: t("questionnaire.questionnaireQuestion9"),
      name: "q9",
    },
    {
      question: t("questionnaire.questionnaireQuestion10"),
      name: "q10",
    },
    {
      question: t("questionnaire.questionnaireQuestion11"),
      name: "q11",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion12"),
      name: "q12",
    },
    {
      question: t("questionnaire.questionnaireQuestion13"),
      name: "q13",
    },
    {
      question: t("questionnaire.questionnaireQuestion14"),
      name: "q14",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion15"),
      name: "q15",
    },
    {
      question: t("questionnaire.questionnaireQuestion16"),
      name: "q16",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion17"),
      name: "q17",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion18"),
      name: "q18",
    },
    {
      question: t("questionnaire.questionnaireQuestion19"),
      name: "q19",
    },
    {
      question: t("questionnaire.questionnaireQuestion20"),
      name: "q20",
    },
    {
      question: t("questionnaire.questionnaireQuestion21"),
      name: "q21",
    },
    {
      question: t("questionnaire.questionnaireQuestion22"),
      name: "q22",
    },
    {
      question: t("questionnaire.questionnaireQuestion23"),
      name: "q23",
    },
    {
      question: t("questionnaire.questionnaireQuestion24"),
      name: "q24",
    },
    {
      question: t("questionnaire.questionnaireQuestion25"),
      name: "q25",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion26"),
      name: "q26",
    },
    {
      question:
      t("questionnaire.questionnaireQuestion7"),
      name: "q27",
    },
  ];

  const options = [t("questionnaire.questionnaireOption1"), t("questionnaire.questionnaireOption2"), t("questionnaire.questionnaireOption3"), t("questionnaire.questionnaireOption4")];
  const optionValues = [0, 0, 1, 1];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleQuestionnaireSubmit = async (e) => {
    e.preventDefault();

    const ageData = {
      age: decoded.age, // Assuming decoded.age contains the age value
    };

    // Merge ageData with formData
    const formDataToSend = { ...ageData, ...formData };

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/prediction/predict/${user_id}/`,
        formDataToSend
      );
      console.log("Response from backend:", response.data);
      // Handle the response as needed
      setSuccessMessage("Questionnaire submitted successfully!");
      setShowConfetti(true);
    } catch (error) {
      console.error("Error sending POST request:", error);
      // Handle errors
    }
  };

  const nextStep = () => {
    const currentQuestion = questions[currentStep];
    if (!formData[currentQuestion.name]) {
      alert("Please select an option before proceeding to the next question.");
      return;
    }
    setCurrentStep((prevStep) => Math.min(prevStep + 1, questions.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const renderQuestion = () => {
    const question = questions[currentStep];
    return (
      <div className="mb-4 text-center">
        <h5>{question.question}</h5>
        <div
          className="d-flex flex-column align-items-start mx-auto"
          style={{ maxWidth: "300px" }}
        >
          {options.map((option, index) => (
            <div key={option} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={question.name}
                value={optionValues[index]} // Use the corresponding value from optionValues
                checked={formData[question.name] === optionValues[index]} // Check against integer value
                onChange={handleChange}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  console.log(formData);
  const redirectToHome = () => {
    // Redirect to "/home-p" route
    window.location.href = "/home-p";
  };

  return (
    <div className="questionnaries mt-5 d-flex justify-content-center align-items-center min-vh-100">
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
        {showConfetti && <Confetti />}
        {successMessage ? (
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-9 col-12 card shadow p-4 mx-3 rounded bg-light border">
              <FontAwesomeIcon icon={faCircleCheck} size="4x" color="green" />
              <div className="card-body text-center">
                <h2 className="card-title">{successMessage}</h2>
                <p className="card-text fs-sm-5 fs-5">
                {t("questionnaire.questionnaireSubmittedMessage")}
                </p>
                <button className="btn btn-secondary" onClick={redirectToHome}>
                  <FontAwesomeIcon icon={faHome} /> {t("questionnaire.questionnaireGotoHome")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-center">{t("questionnaire.questionnaireName")}</h2>
            <ProgressBar
              currentStep={currentStep}
              totalSteps={questions.length}
            />
            <form onSubmit={handleQuestionnaireSubmit}>
              {renderQuestion()}
              <div className="d-flex justify-content-around mx-5">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  {t("questionnaire.questionnairePrevious")}
                </button>
                {currentStep < questions.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                  >
                    {t("questionnaire.questionnaireNext")}
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success">
                    {t("questionnaire.questionnaireSubmit")}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

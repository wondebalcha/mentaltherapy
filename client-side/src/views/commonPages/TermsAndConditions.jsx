import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import "../../styles/TermandCondition.css"

const TermsAndConditions = () => {
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
  return (
    <Container className="terms">
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
      <Row className=" justify-content-center">
        <Col md={10}>
          <h1 className="text-center mt-5 mb-4">{t("termsAndConditions.termCondition")}</h1>

          <h2>1. {t("termsAndConditions.termConditionIntroduction")}</h2>
          <p>{t("termsAndConditions.termConditionWelcome")} <strong>BunnaMind</strong>. {t("termsAndConditions.termConditionOverView")}
          </p>

          <h2>2. {t("termsAndConditions.termConditionUserAccount")}</h2>
          
          <h3>2.1. {t("termsAndConditions.termConditionUserAccount1")}</h3>
          <p>{t("termsAndConditions.termConditionUserAccountDesc1")}</p>
          
          <h3>2.2. {t("termsAndConditions.termConditionUserAccount2")}</h3>
          <p>{t("termsAndConditions.termConditionUserAccountDesc2")}</p>
          
          <h3>2.3. {t("termsAndConditions.termConditionUserAccount3")}</h3>
          <p>{t("termsAndConditions.termConditionUserAccountDesc3")}</p>
          
          <h2>3. {t("termsAndConditions.termConditionUserConduct")}</h2>

          <h3>3.1. {t("termsAndConditions.termConditionUserConduct1")}</h3>
          <p>{t("termsAndConditions.termConditionUserConductDesc1")}</p>
          
          <div className='ms-4 mb-2'>
            <li>{t("termsAndConditions.termConditionUserConductDesc2")}</li>
           
            <li>{t("termsAndConditions.termConditionUserConductDesc3")}</li>
            
            <li>{t("termsAndConditions.termConditionUserConductDesc4")}</li>     
          
            <li>{t("termsAndConditions.termConditionUserConductDesc5")}</li>      
           
            <li>{t("termsAndConditions.termConditionUserConductDesc6")}</li>
          </div>
                
                
          <h2>4. {t("termsAndConditions.termConditionIntellectualProperty")}</h2>
          
          <h3>4.1. {t("termsAndConditions.termConditionIntellectualProperty1")}</h3>
          <p>{t("termsAndConditions.termConditionIntellectualPropertyDesc")} <strong>BunnaMind</strong> {t("termsAndConditions.termConditionIntellectualPropertyDesc1")}</p>
          
          <h3>4.2. {t("termsAndConditions.termConditionIntellectualProperty2")}</h3>
          <p>{t("termsAndConditions.termConditionIntellectualPropertyDesc2")}</p>

          <h2>5. {t("termsAndConditions.termConditionDataPrivacy")}</h2>
          <p>{t("termsAndConditions.termConditionDataPrivacyDesc1")}</p>

          <h3>5.1. {t("termsAndConditions.termConditionDataPrivacy1")}</h3>
          <p>{t("termsAndConditions.termConditionDataPrivacyDesc2")}</p>

          <h2>6. {t("termsAndConditions.termConditionBookingAndPayment")}</h2>

          <h3>6.1. {t("termsAndConditions.termConditionBookingAndPayment1")}</h3>
          <p>{t("termsAndConditions.termConditionBookingAndPaymentDesc1")}</p>

          <h3>6.2. {t("termsAndConditions.termConditionBookingAndPayment2")}</h3>
          <p>{t("termsAndConditions.termConditionBookingAndPaymentDesc2")}</p>

          <h3>6.3. {t("termsAndConditions.termConditionBookingAndPayment3")}</h3>
          <p>{t("termsAndConditions.termConditionBookingAndPaymentDesc3")}</p>

          <h2>7. {t("termsAndConditions.termConditionDesclaimer")}</h2>

          <h3>7.1. {t("termsAndConditions.termConditionDesclaimer1")}</h3>
          <p>{t("termsAndConditions.termConditionDesclaimerDesc1")}</p>

          <h3>7.2. {t("termsAndConditions.termConditionDesclaimer1")}</h3>
          <p>{t("termsAndConditions.termConditionDesclaimerDesc1")}</p>

          <h2>8. {t("termsAndConditions.termConditionIndemnification")}</h2>
          <p>{t("termsAndConditions.termConditionIndemnificationDesc")} <strong>BunnaMind</strong>, {t("termsAndConditions.termConditionIndemnificationDesc1")}</p>

          <h2>9. {t("termsAndConditions.termConditionChangeTerm")}</h2>
          <p>{t("termsAndConditions.termConditionChangeTermDesc1")}</p>

          <h2>10. {t("termsAndConditions.termConditionGoverningLaw")}</h2>
          <p>{t("termsAndConditions.termConditionGoverningLawDesc1")}</p>

          <h2>11. {t("termsAndConditions.termConditionContact")}</h2>
          <p>{t("termsAndConditions.termConditionContactDesc1")}

            <ul className='list-unstyled ms-3'>
                <li><strong>BunnaMind</strong></li>
                <li>Email: <a href="mailto:bunnamind@gmail.com">bunnamind@gmail.com</a></li>
                <li>Adama, Ethiopia</li>
            </ul>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsAndConditions;

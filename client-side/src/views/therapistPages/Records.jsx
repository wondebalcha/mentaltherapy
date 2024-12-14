import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import jwtDecode from "jwt-decode";
import { useTranslation } from "react-i18next";
import useAxios from "../../utils/useAxios";

export default function Records() {
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
  const history = useHistory();
  const axios = useAxios();
  
  const [patients, setPatients] = useState([]);
  const [creditedPayments, setCreditedPayments] = useState([]);
  const [relatedPatients, setRelatedPatients] = useState([]);

  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/patients/"
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    const fetchCreditedPayments = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/payment/therapist/${user_id}/credited/`
        );
        setCreditedPayments(response.data);
      } catch (error) {
        console.error("Error fetching credited payments:", error);
      }
    };

    fetchPatients();
    fetchCreditedPayments();
  }, [user_id]);

  useEffect(() => {
    const findRelatedPatients = () => {
      const related = patients.map(patient => {
        const payment = creditedPayments.find(payment => payment.patient === patient.profile.user_id && payment.status === 'success');
        if (payment) {
          return {
            ...patient,
            paymentAmount: payment.amount,
            paymentDate: payment.created_at,
          };
        }
        return null;
      }).filter(patient => patient !== null);
      setRelatedPatients(related);
    };

    findRelatedPatients();
  }, [patients, creditedPayments]);

  console.log(patients);
  console.log(creditedPayments);
  console.log(relatedPatients);

  return (
    <div className="therapist-home d-flex flex-column m-0">
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
      <div className="main-content col-lg-10 col-md-10 col-sm-8 offset-lg-2 offset-md-2 offset-sm-4 min-vh-100" style={{width:"75%"}}>
        <h2>{t("record.recordPayment")}</h2>
        <table className="table table-striped table-bordered table-hover shadow">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>{t("record.recordFirstName")}</th>
              <th>{t("record.recordLastName")}</th>
              <th>{t("record.recordPaymentAmount")}</th>
              <th>{t("record.recordPaymentdate")}</th>
            </tr>
          </thead>
          <tbody>
            {relatedPatients.map(patient => (
              <tr key={patient.profile.id} onClick={()=>history.push(`records-t/${patient.profile.user_id}`)}>
                <td>{patient.profile.user_id}</td>
                <td>{patient.profile.first_name}</td>
                <td>{patient.profile.last_name}</td>
                <td>{patient.paymentAmount} ETB</td>
                <td>{new Date(patient.paymentDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

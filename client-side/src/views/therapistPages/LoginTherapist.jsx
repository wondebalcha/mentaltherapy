import "../../styles/therapistlogin.css"
import React, { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import AuthContext from "../../context/AuthContext";

export default function LoginTherapist() {
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

    const { loginUser } = useContext(AuthContext);

    const handleLoginSubmit= e =>{
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value
        const userType = "therapist"

        email.length > 0 && loginUser(email, password, userType)

        console.log(email)
        console.log(password)
    }

    return (
        <div className='loginTherapist'>
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
                <div className="therapistLogin">
                    <div className="loginTop">
                        <span className="colomnTitle">{t("login.colomnTitle")}</span>
                    </div>
                    <div className="loginRow">
                        <div className="loginLeft">
                            <div className='loginImg'>
                                <img src="../../Images/home/PeopleBean.png" alt="no photo" />
                            </div>
                        </div>
                        <div className="loginRight">
                            <form onSubmit={handleLoginSubmit}>
                                <input
                                    type="email"
                                    className="therapistLoginInput"
                                    placeholder={t("login.therapistLoginEmail")}
                                    name="email"
                                    required
                                />
                                <input
                                    type="Password"
                                    className="therapistLoginInput"
                                    placeholder={t("login.therapistLoginPassword")}
                                    name="password"
                                    required
                                />
                                <button
                                    className="loginbtn"
                                    type="submit"
                                >
                                    {t("login.therapistLoginbtn")}
                                </button>
                            </form>
                            <span className="therapistForgot">{t("login.therapistForgot")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, { createContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { useHistory } from "react-router-dom";
import "../styles/AuthContext.css";
const swal = require("sweetalert2");

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  // Function to generate public and private keys
  const generateKeys = () => {
    const privateKey = "mj5m+1Drbgwywt/wOdoUZA==";
    return {
      privateKey: privateKey,
    };
  };

  // Function to save private key to local storage
  const savePrivateKeyToLocalStorage = (privateKey) => {
    localStorage.setItem("privateKey", privateKey);
  };

  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );

  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const loginUser = async (email, password, userType) => {
    const response = await fetch("http://127.0.0.1:8000/core/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
      console.log("Logged In");
      setAuthTokens(data);
      const decodedToken = jwtDecode(data.access);
      setUser(decodedToken);
      console.log(decodedToken.user_id);
      localStorage.setItem("authTokens", JSON.stringify(data));

      if (decodedToken.is_verified){
        if (userType === "therapist" && decodedToken.user_type === "therapist") {
          history.push("/dashboard-t");
          swal.fire({
            title: "Login Successful",
            icon: "success",
            toast: true,
            timer: 2000,
            position: "top",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
          const { privateKey } = generateKeys();
          console.log("Private Key:", privateKey);
  
          // Save encrypted private key to local storage
          savePrivateKeyToLocalStorage(privateKey);
        } else if (
          userType === "patient" &&
          decodedToken.user_type === "patient"
        ) {
          history.push("/home-p");
          swal.fire({
            title: "Login Successful",
            icon: "success",
            toast: true,
            timer: 2000,
            position: "top",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
  
          const { privateKey } = generateKeys();
          console.log("Private Key:", privateKey);
  
          // Save encrypted private key to local storage
          savePrivateKeyToLocalStorage(privateKey);
        } else {
          console.error("There was a problem fetching the data");
          localStorage.removeItem("authTokens");
          console.log("token cleared");
          // Create the overlay element and add the 'overlay' class
          const overlay = document.createElement("div");
          overlay.classList.add("overlay");
  
          // Append the overlay element to the body
          document.body.appendChild(overlay);
          swal.fire({
            title: "Email or password doesn't exist",
            icon: "error",
            toast: true,
            timer: 2000,
            position: "top",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
            didClose: () => {
              // Remove the overlay element and reset the faded background effect
              overlay.remove();
              window.location.reload();
            },
          });
        }
      } else {
        swal.fire({
          title: "Sorry your email is not verified",
          icon: "error",
          toast: true,
          timer: 2000,
          position: "top",
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
        });
      }

      
    } else {
      console.log(response.status);
      console.log("there was a server issue");
      // Create the overlay element and add the 'overlay' class
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      // Append the overlay element to the body
      document.body.appendChild(overlay);
      swal.fire({
        title: "Email or password does not exist",
        icon: "error",
        toast: true,
        timer: 4000,
        position: "top",
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
        didClose: () => {
          // Remove the overlay element and reset the faded background effect
          overlay.remove();
          window.location.reload();
        },
      });
    }
  };

  const registerPatient = async (patientData) => {
    const { profile, user, occupation } = patientData;
    const response = await fetch(
      "http://127.0.0.1:8000/core/register-patient/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile, user, occupation }),
      }
    );

    const data = await response.json();
    console.log(data);

    if (response.status === 201) {
      
      swal.fire({
        title: "Please verify your email. A verifying link is sent to your email address",
        icon: "success",
        toast: true,
        timer: 2000,
        position: "top",
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    } else if (response.status === 400) {
      if (data.profile && data.profile.user) {
        if (data.profile.user.username) {
          swal.fire({
            title: "Username already exists. Please try another one.",
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        } else if (data.profile.user.email) {
          swal.fire({
            title: "A user with this email already exists.",
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        } else {
          swal.fire({
            title: "An Error Occurred: " + response.status,
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        }
      }
    } else {
      console.log(response.status);
      console.log("there was a server issue");
      swal.fire({
        title: "An Error Occurred: " + response.status,
        icon: "error",
        toast: true,
        timer: 6000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    }
  };

  const registerTherapist = async (therapistData) => {
    const { profile, specialization, experience, licenses, religion } =
      therapistData;

    const formDataToSend = new FormData();

    Object.entries(therapistData).forEach(([key, value]) => {
      if (key === "profile") {
        // Append user fields within profile object
        Object.entries(value.user).forEach(([userKey, userValue]) => {
          formDataToSend.append(`profile.user.${userKey}`, userValue);
        });
      } else {
        formDataToSend.append(key, value);
      }
    });

    // Append nested fields
    Object.entries(therapistData.profile).forEach(([key, value]) => {
      if (typeof value !== "object" || value === null) {
        formDataToSend.append(`profile.${key}`, value);
      }
    });

    formDataToSend.append("specialization", specialization);
    formDataToSend.append("experience", experience);
    formDataToSend.append("licenses", licenses);
    formDataToSend.append("religion", religion);

    const response = await fetch(
      "http://127.0.0.1:8000/core/register-therapist/",
      {
        method: "POST",
        body: formDataToSend,
      }
    );

    const data = await response.json();
    console.log(data);

    if (response.status === 201) {
      
      swal.fire({
        title: "Please verify your email. A verifying link is sent to your email address",
        icon: "success",
        toast: true,
        timer: 2000,
        position: "top",
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    } else if (response.status === 400) {
      if (data.profile && data.profile.user) {
        if (data.profile.user.username) {
          swal.fire({
            title: "Username already exists. Please try another one.",
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        } else if (data.profile.user.email) {
          swal.fire({
            title: "A user with this email already exists.",
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        } else {
          swal.fire({
            title: "An Error Occurred: " + response.status,
            icon: "error",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCancelButton: true,
          });
        }
      }
    } else {
      console.log(response.status);
      console.log("there was a server issue");
      swal.fire({
        title: "An Error Occurred: " + response.status,
        icon: "error",
        toast: true,
        timer: 6000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    }
  };

  const logoutUser = async (user_type) => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("privateKey");
    if (user_type === "patient") {
      history.push("/login-p");
    } else if (user_type === "therapist") {
      history.push("/login-t");
    } else {
      history.push("/login-p");
    }

    swal.fire({
      title: "You have been logged out...",
      icon: "success",
      toast: true,
      timer: 2000,
      position: "top",
      timerProgressBar: true,
      showConfirmButton: false,
      showCancelButton: true,
    });
  };

  const contextData = {
    authTokens,
    setAuthTokens,
    user,
    setUser,
    loginUser,
    registerPatient,
    registerTherapist,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

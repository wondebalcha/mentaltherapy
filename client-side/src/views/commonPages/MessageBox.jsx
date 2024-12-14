import React from "react";
import "../../styles/Message.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useAxios from "../../utils/useAxios";
import { decryptMessage } from "../../utils/cryptoUtils";

import jwtDecode from "jwt-decode";
import { Link } from "react-router-dom/";
import moment from "moment";

function Message() {
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
  const senderPrivateKey = localStorage.getItem("privateKey");
  const baseURL = "http://127.0.0.1:8000/session";
  // Create New State
  const [messages, setMessages] = useState([]);
  const [relationIds, setRelationId] = useState(null);
  const [relationUsers, setRelationUsers] = useState([]); // State to store user information
  const [unreadCount, setUnreadCount] = useState({});
  const [myMessages, setMyMessages] = useState([])
  // Initialize the useAxios Function to post and get data from protected routes
  const axios = useAxios();

  // Get and Decode Token
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  // Get Userdata from decoded token
  const user_id = decoded.user_id;
  const user_type = decoded.user_type;

  console.log(user_id);
  useEffect(() => {
    const fetchRelationId = async () => {
      try {
        const endpoint = user_type === "patient" ? "patient" : "therapist";
        const transactionType =
          user_type === "patient" ? "debited" : "credited";

        const response = await axios.get(
          `http://127.0.0.1:8000/payment/${endpoint}/${user_id}/${transactionType}`
        );

        // Assuming the response contains an array of relations
        const relationData = response.data;
        // Extract the correct ID based on user type
        const fetchedIds =
          user_type === "patient"
            ? relationData.map((data) => data.therapist)
            : relationData.map((data) => data.patient);

        setRelationId(fetchedIds);

        // Fetch user information for each fetched ID based on user type
        const userResponses = await Promise.all(
          fetchedIds.map((id) =>
            axios.get(
              `http://127.0.0.1:8000/core/${
                user_type === "patient" ? "therapists" : "patients"
              }/${id}`
            )
          )
        );

        // Store user information
        const usersData = userResponses.map((response) => response.data);
        setRelationUsers(usersData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRelationId();
  }, [user_id, user_type]);

  useEffect(() => {
    try {
      // Send a get request to the api endpoint to get the message of the logged in user
      axios.get(baseURL + "/my-messages/" + user_id + "/").then((res) => {
        // Set the data that was gotten back from the database via the api to the setMessage state
        const decryptedMessages = res.data.map((message) => ({
          ...message,
          message: decryptMessage(message.message, senderPrivateKey),
        }));
        setMessages(decryptedMessages);
      });
    } catch (error) {
      console.log(error);
    }
  }, [user_id, user_type]);
  

  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/session/all-my-messages/${user_id}/`);
      const messages = res.data;
      setMyMessages(messages)
      const counts = messages.reduce((acc, message) => {
        if (!message.is_read) {
          const senderId = message.sender.id;
          if (!acc[senderId]) {
            acc[senderId] = 0;
          }
          acc[senderId] += 1;
        }
        return acc;
      }, {});
      setUnreadCount(counts);
      console.log(counts[14])
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUnreadCounts(); // Fetch initial counts

    const interval = setInterval(fetchUnreadCounts, 5000); // Fetch counts every 5 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [user_id, axios]);

  const handleMarkSenderMessagesAsRead = async (senderId) => {
    try {
      const messagesToUpdate = myMessages.filter(message => 
        message.sender.id === senderId && 
        message.reciever.id === user_id && 
        !message.is_read
      );
  
      const promises = messagesToUpdate.map(message => 
        axios.patch(`${baseURL}/read-messages/${message.id}`, { is_read: true })
      );
      
      Promise.all(promises);
      console.log(Promise)
  
      // Assuming success, update the UI
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (messagesToUpdate.some(msg => msg.id === message.id)) {
            return { ...message, is_read: true };
          }
          return message;
        })
      );
    } catch (error) {
      console.log("Error marking sender messages as read:", error);
    }
  };
  

  return (
    <div>
      <main className="message shadow">
        <div className="container p-0 ms-3 mt-2">
          <div
            className="card m-0 p-0"
            style={{ position: "fixed", left: 0, right: 0 }}
          >
            <div className="row">
              <div
                className="col-12 col-lg-3 col-xl-3 border-end min-vh-100"
                style={{ background: "#7B6565" }}
              >
                {messages.map((message) => (
                  <Link
                    to={
                      "/message/" +
                      (message.sender.id === user_id
                        ? message.reciever.id
                        : message.sender.id) +
                      "/"
                    }
                    key={message.sender.id}
                    onClick={() => handleMarkSenderMessagesAsRead(message.sender.id)}
                    className="list-group-item list-group-item-action mb-4 ms-3 mt-3 d-flex justify-content-between"
                  >
                    <div className="d-flex align-items-start w-100">
                      {message.sender.id !== user_id && (
                        <img
                          src={message.sender_profile.image}
                          className="rounded-circle me-1"
                          alt="1"
                          width={40}
                          height={40}
                        />
                      )}
                      {message.sender.id === user_id && (
                        <img
                          src={message.reciever_profile.image}
                          className="rounded-circle me-1"
                          alt="2"
                          width={40}
                          height={40}
                        />
                      )}
                      <div className="flex-grow-1 ms-3 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between">
                          <p
                            className="fw-bold m-0 p-0"
                            style={{ color: "white" }}
                          >
                            {message.sender.id === user_id &&
                              (message.reciever_profile.first_name !== null
                                ? message.reciever_profile.first_name +
                                  " " +
                                  message.reciever_profile.last_name
                                : message.reciever.username)}

                            {message.sender.id !== user_id &&
                              message.sender_profile.first_name +
                                " " +
                                message.sender_profile.last_name}
                          </p>
                          <small>
                          {unreadCount[message.sender.id] > 0 && (
                              <div className="badge bg-danger text-white me-4">
                                {unreadCount[message.sender.id]}
                              </div>
                            )}
                            </small>
                        </div>
                        <div
                          className="d-flex align-items-center align-items-center justify-content-between d-flex"
                          style={{
                            color: "white",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <div
                            className="small fw-light fs-7"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <small>
                              {message.message.length > 35
                                ? `${message.message.slice(0, 35)}...`
                                : message.message}
                            </small>
                          </div>
                          <small>
                            <div className="badge bg-success text-white me-2">
                            {moment
                                  .utc(message.date)
                                  .local()
                                  .format("h:mm A")}
                            </div>
                          </small>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {relationIds &&
                  relationIds.map((id) => {
                    const user = relationUsers.find(
                      (user) => user.profile.user_id === id
                    );
                    if (
                      user &&
                      !messages.some(
                        (message) =>
                          message.sender.id === id || message.reciever.id === id
                      )
                    ) {
                      return (
                        <Link
                          to={"/message/" + user.profile.user_id + "/"}
                          className="list-group-item list-group-item-action mb-4 ms-3 mt-3 d-flex justify-content-between"
                          key={user.profile.user_id}
                        >
                          <div className="d-flex align-items-center">
                            <img
                              src={user.profile.image}
                              className="rounded-circle me-3"
                              alt="1"
                              width={40}
                              height={40}
                            />
                            <div
                              className="fw-bold m-0 p-0"
                              style={{ color: "white" }}
                            >
                              {user.profile.first_name} {user.profile.last_name}
                              <div className="small ">
                                <small>No message yet</small>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    } else {
                      return null;
                    }
                  })}
              </div>
              <div className="col-12 col-lg-7 col-xl-9">
                <div
                  className="position-relative"
                  style={{ left: "35%", top: "35%" }}
                >
                  <div className="chat-message-left pb-4">
                    <h5>{t("message.selectMessage")}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Message;

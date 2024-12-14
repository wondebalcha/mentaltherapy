import React, { useState, useEffect, useRef } from "react";
import "../../styles/Message.css";
import useAxios from "../../utils/useAxios";
import { encryptMessage, decryptMessage } from "../../utils/cryptoUtils";
import jwtDecode from "jwt-decode";
import { Link, useParams, Redirect } from "react-router-dom/";
import moment from "moment";
import { useTranslation } from "react-i18next";

export default function Message() {
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

  const baseURL = "http://127.0.0.1:8000/session";
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const [profile, setProfile] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relationChecker, setRelation] = useState();
  let [newMessage, setnewMessage] = useState({ message: "" });
  const chatContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [relationIds, setRelationId] = useState(null);
  const [relationUsers, setRelationUsers] = useState([]); // State to store user information
  const [unreadCount, setUnreadCount] = useState({});
  const [myMessages, setMyMessages] = useState([])

  const axios = useAxios();
  const { id } = useParams();
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const user_type = decoded.user_type;

  // Get sender's private key from local storage or backend
  const senderPrivateKey = localStorage.getItem("privateKey");
  const [receiverPublicKey, setReceiverPublicKey] = useState(null);
  

  useEffect(() => {
    if (profile && profile.profile && profile.profile.publicKey) {
      setReceiverPublicKey(profile.profile.publicKey);
    }
  }, [profile]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);
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

  const paymentChecker = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/payment/therapist/${
          user_type === "therapist" ? user_id : id
        }/credited/`
      );
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setRelation(data);
      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    paymentChecker();
  }, []);

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
  }, [message]);

  // Get all messages for a conversation
  useEffect(() => {
    let interval = setInterval(() => {
      try {
        axios
          .get(baseURL + "/get-messages/" + user_id + "/" + id + "/")
          .then((res) => {
            // Decrypt messages before setting them in state
            const decryptedMessages = res.data.map((message) => {
              try {
                // Decrypt the message
                const decryptedMessage = decryptMessage(
                  message.message,
                  senderPrivateKey
                );
                return {
                  ...message,
                  message: decryptedMessage,
                };
              } catch (error) {
                console.error("Decryption failed for message:", message, error);
                return message; // Return the original message if decryption fails
              }
            });
            setMessage(decryptedMessages);
          });
      } catch (error) {
        console.log(error);
      }
    }, 400);
    return () => {
      clearInterval(interval);
    };
  }, [message]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await axios
          .get(
            `http://127.0.0.1:8000/core/${
              user_type === "patient" ? "therapists" : "patients"
            }/${id}/`
          )
          .then((res) => {
            setProfile(res.data);
          });
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, [id]);

  // capture changes made by the user in those fields and update the component's state accordingly.
  const handleChange = (event) => {
    setnewMessage({
      ...newMessage,
      [event.target.name]: event.target.value,
    });
    setScrollPosition(chatContainerRef.current.scrollHeight);
  };

  // Send Message
  const SendMessage = (e) => {
    e.preventDefault();

    // Encrypt the message with the sender's private key
    const encryptedMessage = encryptMessage(
      newMessage.message,
      senderPrivateKey
    );
    // Encrypt the already encrypted message with the receiver's public key
    const encryptedMessageForReceiver = encryptMessage(
      encryptedMessage,
      receiverPublicKey
    );
    console.log("Receiver:", encryptedMessageForReceiver);

    // Create form data with the encrypted message
    const formdata = new FormData();
    formdata.append("user", user_id);
    formdata.append("sender", user_id);
    formdata.append("reciever", id);
    formdata.append("message", encryptedMessage);
    formdata.append("is_read", false);

    try {
      axios.post(baseURL + "/send-messages/", formdata).then((res) => {
        document.getElementById("text-input").value = "";
        setnewMessage((newMessage = ""));
      });
    } catch (error) {
      console.log("error ===", error);
    }
  };

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

  if (!profile || !profile.profile) {
    return null; // Return null if profile is undefined or doesn't have the necessary properties
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let users_id;
  if (user_type === "patient") {
    users_id = user_id;
  } else {
    users_id = profile.profile.user.id;
  }

  const hasPaid =
    relationChecker?.some(
      (relation) =>
        relation.patient === users_id && relation.status === "success"
    ) ?? null;

  return (
    <div>
      {hasPaid ? (
        <main className="message shadow">
          <div className="container p-0 ms-3 mt-2 ">
            <div
              className="card m-0 p-0"
              style={{ position: "fixed", left: 0, right: 0 }}
            >
              <div className="row d-flex">
                <div
                  className="side-bar col-12 col-lg-3 col-xl-3 border-end min-vh-100 "
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
                            message.sender.id === id ||
                            message.reciever.id === id
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
                                className="rounded-circle me-1"
                                alt="1"
                                width={40}
                                height={40}
                              />
                              <div
                                className="fw-bold m-0 p-0"
                                style={{ color: "white" }}
                              >
                                {user.profile.first_name}{" "}
                                {user.profile.last_name}
                                <div className="small">
                                  <small>@{user.profile.user.username}</small>
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
                <div
                  className="col-12 col-lg-9 col-xl-9 min-vh-100 pe-0"
                  style={{ position: "relative"}}
                >
                  <div
                    className="border-bottom d-lg-block py-3 ps-3"
                    style={{ background: "#7B6565" }}
                  >
                    <div className="d-flex align-items-center py-1">
                      <div className="position-relative">
                        <img
                          src={profile.profile.image}
                          className="rounded-circle me-1"
                          alt="Profile Picture"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="flex-grow-1 ps-3 text-white">
                        <strong>
                          {profile?.profile.first_name +
                            " " +
                            profile?.profile.last_name}
                        </strong>
                        <div className="text-muted small">
                          <em className=" text-white">
                            @{profile.profile.user.username}
                          </em>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="position-relative mt-3 ms-3">
                    <div className="chat-messages" ref={chatContainerRef}>
                      {message
                        .slice()
                        .reverse()
                        .map((message, index) => (
                          <>
                            {message.sender.id !== user_id && (
                              <div
                                className="chat-message-left pb-4 d-flex"
                                key={index}
                              >
                                  
                                <div
                                  className=" message-container rounded"
                                  style={{ background: "#7B6565" }}
                                >
                                  <p className="ps-2 pe-2 pt-2 pb-0"
                                    style={{ color: "#FFFFF0" }}>
                                    {message.message}
                                  </p>
                                  <div className="time-container text-muted small text-nowrap mt-0 ms-5">
                                  {moment
                                  .utc(message.date)
                                  .local()
                                  .format("h:mm A")}
                                  </div>
                                </div>
                              </div>
                            )}
                            {message.sender.id === user_id && (
                              <div
                                className="chat-message-right pb-4 me-3 d-flex" 
                                key={index}
                              >
                                <div
                                  className="message-container rounded"
                                  style={{ background: "#B6836E"}}
                                >
                                  <p className="ps-3 pe-3 pb-0 py-2"
                                      style={{ color: "#FFFFF0 " }}>
                                    {message.message}
                                  </p>
                                  <div className="time-container text-muted small text-nowrap mt-0">
                                  {moment
                                  .utc(message.date)
                                  .local()
                                  .format("h:mm A")}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ))}
                    </div>
                  </div>
                  <div
                    className="p-0"
                    style={{
                      position: "fixed",
                      bottom: 0,
                      width: "100%",
                    }}
                  >
                    <div className="input-group" style={{}}>
                      <form className="d-flex w-100" onSubmit={SendMessage}>
                        <input
                          type="text"
                          className="form-control p-2 rounded-0"
                          placeholder={t("message.typeMessage")}
                          value={newMessage.message}
                          name="message"
                          id="text-input"
                          onChange={handleChange}
                        />
                        <button className="btn btn-primary rounded-0">
                          {t("message.sendMessage")}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <Redirect to={`/viewtherapist/${id}`} />
      )}
    </div>
  );
}

import React, {useState, useEffect}from "react";
import useAxios from "../../utils/useAxios";
import jwtDecode from "jwt-decode";
import moment from "moment";

export default function NotificationTherapist() {
  const axios = useAxios();
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;

  const [notifications, setNotifications] = useState([]);

  const notificationsData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000//session/therapist/${user_id}/notification/`);
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setNotifications(data);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
    }
  };

  useEffect(() => {
    notificationsData();
  }, []);

  console.log(notifications)
  
  return (
    <div className="therapist-home m-0">
      <div className="main-content col-12 min-vh-100">
        {notifications.map((notification)=>(
          <div className="card my-4" key={notification.id}>
            <div className="card-header">
              <div className="card-title fw-bold">{notification.title}</div>
              <div className="card-title fw-light">at {moment(notification.sent_at).format('DD MMM YYYY h:mm A')}</div>
            </div>
            <div className="card-body">
              <p className="card-text">{notification.therapistContent}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

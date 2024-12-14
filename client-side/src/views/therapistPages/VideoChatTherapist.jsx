import React, { Component, useEffect, useState } from "react";
import "../../styles/VideoChat.css";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import jwtDecode from "jwt-decode";
import useAxios from "../../utils/useAxios";

export default function VideoChat() {
  const { id } = useParams();
  const axios = useAxios();

  //Getting the token and decode using jwtDecode
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const user_type = decoded.user_type;

  console.log(user_type);

  const [videoChat, setVideoChat] = useState([]);

  const fetchVideoChat = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/session/therapist/${user_id}/appointments/${id}/`
      );
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setVideoChat(data);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
    }
  };
  useEffect(() => {
    fetchVideoChat();
  }, []);

  console.log(videoChat);

  return (
    <div className="video-chat position-fixed min-vh-100 w-100 align-items-center" style={{background:"#414141"}}>
      <p className="wellcome-video text-center">Welcome to the BunnaMind Video Chat</p>
      <div className="col mx-5">
        <iframe
          title="Video Player"
          src={videoChat.host}
          allow="camera; microphone; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", minHeight: "75vh", border:"1px solid black" }}
          className="col-6 rounded shadow"
        />
      </div>
    </div>
  );
}

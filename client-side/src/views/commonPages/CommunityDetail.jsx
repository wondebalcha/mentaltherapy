import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import "../../styles/CommunitySpace.css";
import useAxios from "../../utils/useAxios";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommenting,
  faPlusSquare,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Modal } from "react-bootstrap";
import jwtDecode from "jwt-decode";
import moment from "moment";

const swal = require("sweetalert2");

export default function CommunityDetail() {
  const baseURL = "http://127.0.0.1:8000/community";
  const token = localStorage.getItem("authTokens");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const axios = useAxios();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [postCommentToDelete, setPostCommentToDelete] = useState(null);
  const [commentSectionOpen, setCommentSectionOpen] = useState({});
  const { id } = useParams();

  const handleShow = () => setShowPostModal(true);

  const handleShowDeletePostModal = (postId) => {
    setPostToDelete(postId);
    setShowDeletePostModal(true);
  };
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
  const handleShowDeleteCommentModal = (postId, commentId) => {
    setCommentToDelete(commentId);
    setPostCommentToDelete(postId);
    setShowDeleteCommentModal(true);
  };

  const handleModalClose = () => {
    setShowPostModal(false);
    window.location.reload();
  };

  const handleDeletePostModalClose = () => {
    setShowDeletePostModal(false);
  };

  const handleDeleteCommentModalClose = () => {
    setShowDeleteCommentModal(false);
  };

  const [createComment, setCreateComment] = useState({
    commenter: user_id,
    content: "",
  });

  function handleCreateComment(event) {
    const { name, value } = event.target;
    setCreateComment((prevCreatePost) => ({
      ...prevCreatePost,
      [name]: value,
    }));
  }

  const handleCreateCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const { commenter, content } = createComment;
    const commentInput = document.getElementById("comment");

    const formCreateComment = new FormData();

    formCreateComment.append("post", postId);
    formCreateComment.append("commenter", commenter);
    formCreateComment.append("content", content);

    try {
      const response = await axios.post(
        `${baseURL}/comment/${postId}/`,
        formCreateComment
      );
      const data = await response.data;
      commentInput.value = "";
      // Ensure the comments for this post exist, then add the new comment
      setComments((prevComments) => {
        return {
          ...prevComments,
          [postId]: prevComments[postId]
            ? [...prevComments[postId], data]
            : [data],
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  const [createPost, setCreatePost] = useState({
    author: user_id,
    title: "",
    content: "",
    postImage: null,
  });

  function handleCreatePost(event) {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setCreatePost((prevCreatePost) => ({
        ...prevCreatePost,
        [name]: files[0],
      }));
    } else {
      setCreatePost((prevCreatePost) => ({
        ...prevCreatePost,
        [name]: value,
      }));
    }
  }

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    const { author, title, content, postImage } = createPost;

    const formCreatePost = new FormData();

    formCreatePost.append("author", author);
    formCreatePost.append("title", title);
    formCreatePost.append("content", content);
    formCreatePost.append("postImage", postImage);

    try {
      const response = await axios.post(
        `${baseURL}/post/${user_id}/`,
        formCreatePost
      );
      const data = await response.data;

      if (response.status == 201) {
        swal.fire({
          title: "Post Published Successfully",
          icon: "success",
          toast: true,
          timer: 3000,
          position: "top",
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        swal.fire({
          title:
            "There is an error while trying to post the content" +
            response.status,
          icon: "error",
          toast: true,
          timer: 3000,
          position: "top",
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
          didClose: () => {
            window.location.reload();
          },
        });
      }

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostLike = async (postId) => {
    const liker = decoded.user_id;

    try {
      // Check if there's an existing like
      const response = await axios.get(`${baseURL}/like/${postId}/`);
      const existingLike = response.data.find((like) => like.liker === liker);

      if (existingLike) {
        // Delete the existing like
        await axios.delete(`${baseURL}/like/${postId}/${liker}/`);
        setLikes((prevLikes) => ({ ...prevLikes, [postId]: false }));
      } else {
        // Create a new like
        await axios.post(`${baseURL}/like/${postId}/`, {
          post: postId,
          liker: liker,
        });
        setLikes((prevLikes) => ({ ...prevLikes, [postId]: true }));
      }
    } catch (error) {
      if (error.response) {
        console.error(
          "There was a problem handling the like",
          error.response.data
        );
        // Display an error message to the user or handle the error in some other way
      } else {
        console.error("There was a problem with the request", error);
        // Display an error message to the user or handle the error in some other way
      }
    }
  };

  const fetchLikes = useCallback(async () => {
    try {
      const likesObj = {};
      for (const post of posts) {
        const response = await axios.get(`${baseURL}/like/${post.id}/`);
        const existingLike = response.data.find(
          (like) => like.liker === decoded.user_id
        );
        likesObj[post.id] = !!existingLike;
      }
      setLikes(likesObj);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [posts, decoded.user_id]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const postData = async () => {
    try {
      const response = await axios.get(`${baseURL}/post/${id}/`);
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setPosts(data);
    } catch (error) {
      console.error("There was a problem fetching the data", error);
    }
  };

  useEffect(() => {
    postData();
  }, [JSON.stringify(likes)]);

  const toggleCommentSection = (postId) => {
    setCommentSectionOpen((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const fetchComments = useCallback(async () => {
    try {
      const commentsObj = {};
      for (const post of posts) {
        const response = await axios.get(`${baseURL}/comment/${post.id}/`);
        commentsObj[post.id] = response.data;
      }
      setComments(commentsObj);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [posts]);

  useEffect(() => {
    fetchComments();
  }, [commentSectionOpen, JSON.stringify(comments)]);

  const handleDeletePost = async (postId) => {
    const response = await axios.delete(`${baseURL}/posts/${postId}/`);
    if (response.status === 204) {
      setShowDeletePostModal(false);
      window.location.reload();
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const response = await axios.delete(
      `${baseURL}/comment/${postId}/${commentId}`
    );
    if (response.status === 204) {
      setShowDeletePostModal(false);
      window.location.reload();
    }
  };

  return (
    <div className="CommunitySpace">
      <div className="languageForTranslate">
        <select
          className="preferedLanguage"
          onChange={handleChangeLanguage}
          value={selectedLanguage} // Set value to the selected language
        >
          <option value="english">English</option>
          <option value="amharic">Amharic</option>
          <option value="oromo">Oromo</option>
          <option value="sumalic">Sumalic</option>
          <option value="tigrigna">Tigrigna</option>
        </select>
      </div>
      <div className="row m-0 p-0 me-5">
        <div className="col col-auto col-md-3 col-sm-2.5 col-lg-2 min-vh-50 shadow"></div>
        <div className="col">
          <button
            className="btn border rounded d-flex align-items-center justify-content-between w-100 ms-4 mt-3 px-2"
            onClick={handleShow}
          >
            <p className="text-center">{t("communitySpace.communitySpaceStart")}</p>
            <FontAwesomeIcon
              icon={faPlusSquare}
              className="fs-3"
              color="gray"
            />
          </button>
          {posts &&
            posts.map((post) => (
              <div className="card mt-4 ms-5 m-0 p-0 mb-5 shadow" key={post.id}>
                <div className="card-header bg-white m-0 p-1">
                  <div className="row d-flex align-items-center m-0 p-0">
                    <div className="col d-flex align-items-center justify-content-between mb-2">
                      <div
                        className="d-flex align-items-center"
                      >
                        <img
                          src={post.image}
                          alt="profile pic"
                          className="img-fluid rounded"
                          width={40}
                        />
                        <h6 className="fw-bold ms-3 d-flex justify-content-between">
                          {post.first_name + " " + post.last_name + " " + `${post.author_id === user_id ? "(You)":""}`}
                          <span className="ms-1 fw-light ms-2">
                            {moment
                              .utc(post.created_at)
                              .local()
                              .startOf("seconds")
                              .fromNow()}
                          </span>
                        </h6>
                      </div>
                      <div className="">
                        {post.author_id === user_id && (
                          <FontAwesomeIcon
                            icon={faTrash}
                            onClick={() => handleShowDeletePostModal(post.id)}
                            className="trash fs-2"
                            color="gray"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <h3>{post.title}</h3>
                  <p
                    className="card-text d-block w-1"
                    style={{ textAlign: "left" }}
                  >
                    {post.content}
                  </p>
                  {post.postImage && (
                    <img
                      src={post.postImage}
                      alt="postImage"
                      className="img-fluid rounded border shadow"
                    />
                  )}
                </div>
                <div className="card-footer">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center"
                      onClick={() => handlePostLike(post.id)}
                    >
                      ({post.likeCount})
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        color={likes[post.id] ? "#643a3a" : "gray"}
                        className="fs-2 ms-1 me-1"
                      />
                      {likes[post.id] ? "Liked" : "Like"}
                    </div>

                    <div
                      className="d-flex"
                      onClick={() => toggleCommentSection(post.id)}
                    >
                      <FontAwesomeIcon
                        icon={faCommenting}
                        color={commentSectionOpen[post.id] ? "#643a3a" : "gray"}
                        className="fs-2 ms-3 me-1"
                      />
                      Comment
                    </div>
                  </div>
                  {commentSectionOpen[post.id] && (
                    <div className="mt-3">
                      {comments[post.id] &&
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="mb-2">
                            <div className="col d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center">
                                <img
                                  src={comment.image}
                                  alt="profile pic"
                                  className="img-fluid rounded"
                                  width={50}
                                  height={40}
                                />
                                <div className="d-flex flex-column justify-content-around">
                                  <h6 className="fw-bold ms-3 d-flex mt-2">
                                    {comment.first_name +
                                      " " +
                                      comment.last_name}
                                    <span className="ms-1 fw-light ms-2">
                                      {moment
                                        .utc(comment.created_at)
                                        .local()
                                        .startOf("seconds")
                                        .fromNow()}
                                    </span>
                                  </h6>
                                  <p className="ms-3">{comment.content}</p>
                                </div>
                              </div>
                              <div>
                                {comment.first_name === decoded.first_name && (
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={() =>
                                      handleShowDeleteCommentModal(
                                        post.id,
                                        comment.id
                                      )
                                    }
                                    className="trash fs-4"
                                    color="gray"
                                    style={{ cursor: "pointer" }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      <form
                        onSubmit={(e) => handleCreateCommentSubmit(e, post.id)}
                      >
                        <input
                          type="text"
                          className="form-control mb-3 pb-4"
                          placeholder={t("communitySpace.communitySpaceWrite1")}
                          name="content"
                          id="comment"
                          onChange={handleCreateComment}
                        />
                        <button className="btn btn-primary ms-1">
                        {t("communitySpace.communitySpaceComment")}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <>
        <Modal show={showPostModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title centered>Create Post</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleCreatePostSubmit}>
            <Modal.Body>
              <label htmlFor="post-title" className="fw-bold">
              {t("communitySpace.communitySpaceTitle")}
              </label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder={t("communitySpace.communitySpaceTitle")}
                name="title"
                id="post-title"
                onChange={handleCreatePost}
              />
              <label htmlFor="post-content" className="fw-bold">
              {t("communitySpace.communitySpaceContent")}
              </label>
              <textarea
                placeholder={t("communitySpace.communitySpaceWrite2")}
                name="content"
                className="form-control mb-3 pb-5"
                id="post-content"
                onChange={handleCreatePost}
              ></textarea>
              <label htmlFor="post-image" className="fw-bold">
              {t("communitySpace.communitySpaceImage")}
              </label>
              <input
                type="file"
                id="post-image"
                className="form-control mb-3"
                name="postImage"
                onChange={handleCreatePost}
              />
            </Modal.Body>
            <Modal.Footer>
              <button
                className="btn border text-center text-white"
                style={{ background: "#683a3a" }}
              >
                
              </button>
            </Modal.Footer>
          </form>
        </Modal>
        {showPostModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: "1050" }}
            onClick={handleModalClose}
          ></div>
        )}
      </>

      <>
        <Modal
          show={showDeletePostModal}
          onHide={handleDeletePostModalClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h5>{t("communitySpace.communitySpaceAskDelete")}</h5>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h6>
            {t("communitySpace.communitySpaceDeleted")}
            </h6>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={handleDeletePostModalClose}
            >
              {t("communitySpace.communitySpaceCancel")}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDeletePost(postToDelete)}
            >
              {t("communitySpace.communitySpaceConfirm")}
            </button>
          </Modal.Footer>
        </Modal>
        {showDeletePostModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: "1050" }}
            onClick={handleDeletePostModalClose}
          ></div>
        )}
      </>

      <>
        <Modal
          show={showDeleteCommentModal}
          onHide={handleDeleteCommentModalClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h5>{t("communitySpace.communitySpaceAskDelete")}</h5>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h6>{t("communitySpace.communitySpaceDeleted")}</h6>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={handleDeleteCommentModalClose}
            >
              {t("communitySpace.communitySpaceCancel")}
            </button>
            <button
              className="btn btn-danger"
              onClick={() =>
                handleDeleteComment(postCommentToDelete, commentToDelete)
              }
            >
              {t("communitySpace.communitySpaceConfirm")}
            </button>
          </Modal.Footer>
        </Modal>
        {showDeletePostModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: "1050" }}
            onClick={handleDeleteCommentModalClose}
          ></div>
        )}
      </>
    </div>
  );
}

import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "CLERK",
    warehouse: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
        setImageFile(file);
      });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("account", new Blob([JSON.stringify(form)], { type: "application/json" }));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("http://localhost:8080/api/accounts/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        navigate("/select-warehouse");
      } else {
        const msg = await res.text();
        alert("Error: " + msg);
      }
    } catch (err) {
      alert("Failed to create account");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" name="username" value={form.username} onChange={handleChange} required /><br />

        <label>Password:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required /><br />

        <label>Role:</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="ADMIN">Admin</option>
          <option value="CLERK">Clerk</option>
        </select><br />

        {form.role === "CLERK" && (
          <>
            <label>Warehouse:</label>
            <input type="text" name="warehouse" value={form.warehouse} onChange={handleChange} required /><br />
          </>
        )}

        <label>Profile Picture:</label><br />
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={useWebcam} /><br />

        <label>
          <input type="checkbox" checked={useWebcam} onChange={() => setUseWebcam(!useWebcam)} />
          Use webcam instead
        </label><br />

        {useWebcam && (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
            />
            <button type="button" onClick={captureFromWebcam}>Capture</button>
          </div>
        )}

        <br />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateAccountPage;

import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./CreateAccountPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "CLERK",
    warehouse: "",
  });
  const [warehouses, setWarehouses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ New loading state
  const webcamRef = useRef(null);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setWarehouses(data))
      .catch((err) => console.error("Failed to load warehouses", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setCaptured(true);
      });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setCaptured(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedUsername = form.username.trim();
    const trimmedPassword = form.password.trim();
    if (!trimmedUsername || !trimmedPassword) {
      toast.error("Username and password cannot be empty.");
      return;
    }

    const payload = {
      ...form,
      username: trimmedUsername,
      password: trimmedPassword,
    };

    const formData = new FormData();
    formData.append("account", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setIsLoading(true); // ✅ block button
      const res = await fetch("https://wims-w48m.onrender.com/api/accounts/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        toast.success("Account created!");
        setTimeout(() => navigate("/select-warehouse"), 1000);
      } else {
        const msg = await res.text();
        toast.error("Error: " + msg);
      }
    } catch (err) {
      console.error("Failed to create account:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false); // ✅ re-enable
    }
  };

  return (
    <div className="account-container">
      <h2 className="account-title">Create Account</h2>
      <form className="account-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <label>Username</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="CLERK">Clerk</option>
            <option value="ADMIN">Admin</option>
          </select>

          {form.role === "CLERK" && (
            <>
              <label>Warehouse</label>
              <select name="warehouse" value={form.warehouse} onChange={handleChange} required>
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.name}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="form-right">
          <label>Profile Picture</label>
          <input type="file" onChange={handleFileChange} disabled={useWebcam} />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useWebcam}
              onChange={() => setUseWebcam((prev) => !prev)}
            />
            Use webcam instead
          </label>

          {useWebcam && (
            <div className="webcam-box">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={300}
                height={220}
              />
            </div>
          )}

          {useWebcam && (
            <>
              <button type="button" className="brown-btn" onClick={captureFromWebcam}>
                Capture
              </button>
              {captured && <p className="captured-indicator">✅ Image Captured</p>}
            </>
          )}
        </div>

        <div className="form-actions">
          <div className="form-button">
            <button type="submit" className="brown-btn wide" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
          <div className="form-button">
            <button type="button" className="brown-btn back" onClick={() => navigate("/select-warehouse")} disabled={isLoading}>
              ← Back
            </button>
          </div>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};
//test
export default CreateAccountPage;

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api.config";
import "./Register.style.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.AUTH}/auth/register`, {
        email,
        password,
      });
      history.push("/login");
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <div className="form-group">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button className="register-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;

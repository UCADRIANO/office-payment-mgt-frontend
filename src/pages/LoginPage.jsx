import React from "react";
import LoginCard from "../components/LoginCard";
import { useNavigate } from "react-router-dom";
import { writeSession } from "../utils/storage";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const handleLogin = (u) => {
    writeSession(u);
    onLogin(u);
    navigate("/dashboard");
  };
  return <LoginCard onLogin={handleLogin} />;
}

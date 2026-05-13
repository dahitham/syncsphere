import React, { useState } from "react";
import API from "../services/api";

export default function Login({ onAuth }) {

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Handle Input Change
  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  // Submit Login / Signup
  const submit = async () => {

    setError("");

    try {

      let response;

      // LOGIN
      if (mode === "login") {

        response = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

      }

      // SIGNUP
      else {

        response = await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

      }

      console.log("SUCCESS:", response.data);

      // Save Token
      localStorage.setItem("token", response.data.token);

      alert(
        mode === "login"
          ? "Login successful"
          : "Signup successful"
      );

      // Send user to parent component
      if (onAuth) {
        onAuth(response.data.user.name);
      }

    } catch (err) {

      console.log("ERROR:", err.response?.data);

      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (

    <div className="auth-page">

      {/* LEFT SIDE */}
      <div
        className="auth-left"
        style={{
          backgroundImage: "url('/team-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        <div>

          <div className="auth-brand">
            SyncSphere
          </div>

          <div className="auth-tagline">
            Team Sync Platform
          </div>

        </div>

        <div className="auth-quote">

          "The measure of intelligence is the ability to change."

          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "rgba(255,255,255,.3)",
            }}
          >
            — Albert Einstein
          </div>

        </div>

        <div className="auth-copyright">
          © 2026 SyncSphere
        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="auth-right">

        <div className="auth-form-wrap fade-in">

          <div className="auth-heading">
            {mode === "login"
              ? "Welcome back"
              : "Create account"}
          </div>

          <div className="auth-sub">
            {mode === "login"
              ? "Sign in to your workspace to continue."
              : "Start collaborating with your team today."}
          </div>


          {/* FULL NAME */}
          {mode === "signup" && (

            <div className="form-group">

              <label className="form-label">
                Full Name
              </label>

              <input
                className="form-input"
                placeholder="Alexandra Chen"
                value={form.name}
                onChange={set("name")}
              />

            </div>

          )}


          {/* EMAIL */}
          <div className="form-group">

            <label className="form-label">
              Email Address
            </label>

            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set("email")}
            />

          </div>


          {/* PASSWORD */}
          <div className="form-group">

            <label className="form-label">
              Password
            </label>

            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submit();
                }
              }}
            />

          </div>


          {/* ERROR */}
          {error && (

            <div
              style={{
                fontSize: 13,
                color: "red",
                marginBottom: 12,
              }}
            >
              {error}
            </div>

          )}


          {/* BUTTON */}
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "13px",
              marginTop: 4,
            }}
            onClick={submit}
          >
            {mode === "login"
              ? "Sign In"
              : "Create Account"} →
          </button>


          {/* SWITCH */}
          <div className="auth-switch-text">

            {mode === "login" ? (

              <>
                Don't have an account?{" "}

                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign up free
                </button>
              </>

            ) : (

              <>
                Already have an account?{" "}

                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Sign in
                </button>
              </>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
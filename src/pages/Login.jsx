const submit = async () => {
  setError("");

  try {
    let response;

    if (mode === "login") {
      response = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
    } else {
      response = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
    }

    console.log("SUCCESS:", response.data);

    localStorage.setItem("token", response.data.token);

    alert(
      mode === "login"
        ? "Login successful"
        : "Signup successful"
    );

  } catch (err) {

    console.log("FULL ERROR:", err);

    console.log("BACKEND ERROR:", err.response);

    setError(
      JSON.stringify(err.response?.data) ||
      "Something went wrong"
    );
  }
};
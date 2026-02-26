document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("inputPass");
    const toggleIcon = document.getElementById("togglePassword");

    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener("click", function () {
            passwordInput.type =
                passwordInput.type === "password" ? "text" : "password";
        });
    }

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("inputEmail");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/docs#/default/login_auth_login_post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Login successful!");

                    // If backend returns JWT token
                    if (data.access_token) {
                        localStorage.setItem("access_token", data.access_token);
                    }

                    window.location.href = "dashboard.html";
                } else {
                    alert(data.detail || "Login failed");
                }

            } catch (error) {
                console.error("Login error:", error);
                alert("Cannot connect to server.");
            }
        });
    }

});
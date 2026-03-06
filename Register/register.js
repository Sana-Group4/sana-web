document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const registerBtn = document.getElementById("registerBtn");

        const password = document.getElementById("password").value;
        const confPassword = document.getElementById("confPassword").value;

        if (password !== confPassword) {
            alert("Passwords do not match");
            return;
        }

        const data = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: password
        };

        try {

            registerBtn.disabled = true;

            const response = await fetch("http://127.0.0.1:8000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Registration failed");
            }

            localStorage.setItem("access_token", result.access_token);

            alert("Account created successfully!");

            window.location.href = "../Login/login.html";

        } catch (error) {
            console.error("Register error:", error);
            alert(error.message);
        } finally {
            registerBtn.disabled = false;
        }
    });

});
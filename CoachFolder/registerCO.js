document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("inputFName").value.trim();
        const lastName = document.getElementById("inputLName").value.trim();
        const email = document.getElementById("inputEmail").value.trim();
        const password = document.getElementById("inputPass").value;
        const confirmPassword = document.getElementById("confPass").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

      
        const username = email.split("@")[0];

        try {
      
            const registerRes = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    username,
                    password
                })
            });

            const registerData = await registerRes.json();

            if (!registerRes.ok) {
                throw new Error(registerData.detail || "Registration failed");
            }

            console.log("Registered:", registerData);

     
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            

            const loginRes = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                throw new Error("Login after register failed");
            }

            const token = loginData.access_token;

            const updateRes = await fetch("http://localhost:8000/api/update_account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    is_coach: true
                })
            });

            const updateData = await updateRes.json();

            if (!updateRes.ok) {
                throw new Error(updateData.detail || "Failed to set coach role");
            }

            console.log("Updated to coach:", updateData);

            alert("Coach account created successfully!");


            window.location.href = "../Login/login.html";

        } catch (err) {
            console.error(err);
            alert(err.message);
        }

    });

});
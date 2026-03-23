document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("inputEmail").value;
        const password = document.getElementById("inputPass").value;

        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        try {
            // LOGIN
            const res = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.detail || "Login failed");
            }

            const token = result.access_token;

            // ✅ store token
            localStorage.setItem("access_token", token);

            // NOW GET USER INFO
            const userRes = await fetch("http://localhost:8000/api/account", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const user = await userRes.json();

            console.log("User:", user);

            // ROLE-BASED REDIRECT
            if (user.is_coach) {
                window.location.href = "../coachHomepage/index.html";
            } else {
                window.location.href = "../src/Client/home/clientlogin.html";
            }

        } catch (err) {
            alert(err.message);
        }
    });

});
document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("inputPass");
    const toggleIcon = document.getElementById("togglePassword");
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("inputEmail");
    const loginBtn = document.getElementById("loginBtn");
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");

    // If already logged in -> go to client home
    const existingToken = localStorage.getItem("access_token");
    if (existingToken) {
        window.location.href = "/Client/home.html";
        return;
    }

    // Toggle password visibility
    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener("click", function () {
            passwordInput.type =
                passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Login submit
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
                // Show spinner
                loginBtn.disabled = true;
                spinner.classList.remove("hidden");
                btnText.textContent = "Logging in...";

                const formData = new URLSearchParams();
                formData.append("grant_type", "password");
                formData.append("username", email);
                formData.append("password", password);

                const response = await fetch("http://127.0.0.1:8000/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error("Invalid email or password.");
                }

                const data = await response.json();

                localStorage.setItem("access_token", data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem("refresh_token", data.refresh_token);
                }

                //Redirect AFTER successful login
                window.location.href ="/coachHomepage.index.html";

            } catch (error) {
                alert(error.message);

                loginBtn.disabled = false;
                spinner.classList.add("hidden");
                btnText.textContent = "Log In";
            }
        });
    }
});



//Automatically attach access token
async function authenticatedFetch(url, options = {}) {

    let accessToken = localStorage.getItem("access_token");

    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${accessToken}`
    };

    let response = await fetch(url, options);

    //If token expired, try refresh
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            accessToken = localStorage.getItem("access_token");

            options.headers["Authorization"] = `Bearer ${accessToken}`;
            response = await fetch(url, options);
        } else {
            logout();
        }
    }

    return response;
}


//refresh token
async function refreshAccessToken() {

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) return false;

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

        if (!response.ok) throw new Error();

        const data = await response.json();

        localStorage.setItem("access_token", data.access_token);

        return true;

    } catch (error) {
        console.error("Refresh failed");
        return false;
    }
}


//logout
function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/coachHomepage/index.html";
}

//user test
async function loadUsers() {
    const response = await authenticatedFetch(
        "http://127.0.0.1:8000/api/users",
        { method: "GET" }
    );

    if (response.ok) {
        const users = await response.json();
        console.log(users);
    } else {
        console.log("Failed to load users");
    }
}

document.addEventListener("DOMContentLoaded", loadUsers);
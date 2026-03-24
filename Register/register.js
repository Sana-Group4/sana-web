
document.addEventListener("DOMContentLoaded", function () {

    // Get the registration form element from the page
    const registerForm = document.getElementById("registerForm");

    // Listen for when the form is submitted
    registerForm.addEventListener("submit", async function (e) {

        // Prevent the browser's default form submission
        e.preventDefault();

        // Get the register button so we can disable it during the request
        const registerBtn = document.getElementById("registerBtn");

        // Get the password and confirmation password values from the form
        const password = document.getElementById("password").value;
        const confPassword = document.getElementById("confPassword").value;

        if (password !== confPassword) {
            alert("Passwords do not match");
            return; // Stop the registration process if they don't match
        }

        // Create a data object containing the user information
        const data = {
            // Get values from input fields and remove extra spaces
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: password
        };

        try {

            // Disable the register button to prevent multiple submissions
            registerBtn.disabled = true;

            // Send a post request to the backend registration endpoint
            const response = await fetch("http://127.0.0.1:8000/auth/register", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

        
            const result = await response.json();

            // If the server returns an error status, throw an error
            if (!response.ok) {
                throw new Error(result.detail || "Registration failed");
            }

            // Save the access token returned by the server in local storage
            localStorage.setItem("access_token", result.access_token);

            // Inform the user that the account was created successfully
            alert("Account created successfully!");

            // Redirect the user to the home page
            window.location.href = "/src/client/home/clientlogin.html";

        } catch (error) {
            // Log the error in the browser console for debugging
            console.error("Register error:", error);

            // Show the error message to the user
            alert(error.message);

        } finally {
            // Re-enable the register button regardless of success or failure
            registerBtn.disabled = false;
        }
    });

});
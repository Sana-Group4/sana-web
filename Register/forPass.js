// Request reset token
async function requestReset() {
    const email = document.getElementById("resetEmail").value.trim();

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(email)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail);
        }

        alert("Reset token: " + result.reset_token);
        // In real app this would be emailed

    } catch (error) {
        alert(error.message);
    }
}


// Submit new password
async function resetPassword() {
    const username = document.getElementById("resetUsername").value.trim();
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                new_password: newPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail);
        }

        alert("Password updated successfully!");
        window.location.href = "/Login/login.html";

    } catch (error) {
        alert(error.message);
    }
}


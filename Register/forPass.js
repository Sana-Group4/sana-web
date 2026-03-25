let reset_token = null;

document.getElementById("emailForm").addEventListener("submit", async function (event) {
            event.preventDefault();

            await requestReset()

            document.getElementById("emailForm").style.display = "none";
            document.getElementById("authCodeForm").style.display = "block";
        });

      
document.getElementById("authCodeForm").addEventListener("submit", async function (event) {
            event.preventDefault();

            await submitCode();

            if (!reset_token){
                window.location.href = "/Login/login.html";
            }
            document.getElementById("authCodeForm").style.display = "none";
            document.getElementById("passwordForm").style.display = "block";
        });

document.getElementById("passwordForm").addEventListener("submit", async function (event) {
            event.preventDefault();

            const pass = document.getElementById("inputPass").value;
            const confirm = document.getElementById("confPass").value;

            if (pass !== confirm) {
                alert("Passwords do not match!");
                return;
            }

            await resetPassword();
            
            window.location.href = "../Login/login.html";
        });
        
document.querySelectorAll(".eye-icon").forEach(icon => {
            icon.addEventListener("click", function () {

                const input = document.getElementById(this.dataset.target);

                if (input.type === "password") {
                    input.type = "text";
                } else {
                    input.type = "password";
                }

            });
        });



// Request reset token
async function requestReset() {
    const email = document.getElementById("email").value.trim();

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/start-passsword-reset/?email="+email, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail);
        }

    } catch (error) {
        alert(error.message);
    }
}

async function submitCode() {
    const code = document.getElementById("code").value;

    try{
        const response = await fetch("http://127.0.0.1:8000/auth/verify-reset-code/?code="+code, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail);
        }

        reset_token = result.reset_token;

    } catch (error) {
         alert(error.message);
    }
}

// Submit new password
async function resetPassword() {
    const newPassword = document.getElementById("confPass").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/finalize-passowrd-reset/?token="+reset_token+"&new_password="+newPassword, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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


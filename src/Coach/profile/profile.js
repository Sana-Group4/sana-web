document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "../../Login/login.html";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/account", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "../../Login/login.html";
      return;
    }

    const user = await res.json();

    console.log("User data:", user);

    // Fill UI
    document.getElementById("profileName").textContent =
      `${user.firstName} ${user.lastName}`;

    document.getElementById("profileId").textContent =
      user.id || "Not set";

    document.getElementById("profileEmail").textContent =
      user.email || "Not set";

    document.getElementById("profilePhone").textContent =
      user.phone || "Not set";

    document.getElementById("profileDob").textContent =
      user.dob || "Not set";

  } catch (err) {
    console.error(err);
    alert("Failed to load profile");
  }
}
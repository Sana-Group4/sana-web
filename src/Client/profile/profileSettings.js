async function loadUserProfile() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/api/account", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch account");
    }

    const user = await res.json();

    console.log("User:", user);

    // ===== SET VALUES =====
    document.getElementById("profileName").textContent =
        `${user.firstName} ${user.lastName}`;

    document.getElementById("profileID").textContent =
        user.id;  

    document.getElementById("profileEmail").textContent =
        user.email || "N/A";

    document.getElementById("profilePhone").textContent =
        user.phone || "Not set";

    document.getElementById("profileDOB").textContent =
        "Not set"; // DOB not provided by API

  } catch (err) {
    console.error("Error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadUserProfile);

async function loadCoachInfo() {

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No token found");
    return;
  }

  try {

    const res = await fetch("http://127.0.0.1:8000/api/account", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Failed to load user:", res.status);
      return;
    }

    const user = await res.json();

    // set name
    document.getElementById("nameText").textContent =
      `${user.firstName} ${user.lastName}`;

  } catch (err) {
    console.error("Error loading user:", err);
  }
}




async function saveCoachInfo() {

  console.log("Save button clicked");

  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Not logged in");
    return;
  }

  
  const data = {
    description: document.getElementById("description")?.value || "",
    specialties: document.getElementById("specialties")?.value || "",
    focus: document.getElementById("focus")?.value || "",
    notes: document.getElementById("notes")?.value || ""
  };

  console.log("Sending data:", data);

  try {

    const res = await fetch("http://127.0.0.1:8000/api/update-coach-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.error("Failed:", res.status);
      alert("Update failed");
      return;
    }

    alert("Coach info saved successfully ✅");

  } catch (err) {
    console.error("Error saving:", err);
    alert("Something went wrong");
  }
}



// INIT

window.addEventListener("DOMContentLoaded", () => {

  loadCoachInfo();

  const btn = document.getElementById("saveBtn");

  if (!btn) {
    console.error("Save button not found");
    return;
  }

  btn.addEventListener("click", saveCoachInfo);

});
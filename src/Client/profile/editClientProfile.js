async function loadProfile() {
  const token = localStorage.getItem("access_token");

  const res = await fetch("http://localhost:8000/api/account", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const user = await res.json();

  document.getElementById("nameText").textContent =
    `${user.firstName} ${user.lastName}`;

  document.getElementById("emailText").textContent = user.email;

  document.getElementById("phone").value =
    user.phone || "";
}



async function savePhone() {
  const token = localStorage.getItem("access_token");
  const phone = document.getElementById("phone").value;

  await fetch("http://localhost:8000/api/update_account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      phone: phone
    })
  });

  alert("Phone updated ✅");
  loadProfile();
}


// EVENT
document.getElementById("saveBtn").addEventListener("click", savePhone);

window.addEventListener("DOMContentLoaded", loadProfile);
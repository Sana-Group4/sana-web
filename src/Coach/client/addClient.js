// =====================
// GLOBAL STATE
// =====================
let removeMode = false;
let selectedClients = new Set();

// =====================
// LOAD CLIENTS ON PAGE LOAD
// =====================
document.addEventListener("DOMContentLoaded", () => {
  loadClients();
});

// =====================
// LOAD CLIENTS FUNCTION
// =====================
async function loadClients() {
  const grid = document.getElementById("clientsGrid");
  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch("http://localhost:8000/api/coach/clients", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const clients = Array.isArray(data) ? data : [data];

    grid.innerHTML = "";

    // No clients
    if (clients.length === 0 || !clients[0].id) {
      grid.innerHTML = "<p>No clients yet</p>";
      return;
    }

    // Render clients
    clients.forEach(client => {
      const card = document.createElement("div");
      card.className = "client-card";

      card.innerHTML = `
        <div class="client-avatar">
          <div class="client-head"></div>
          <div class="client-body"></div>
        </div>
        <span>${client.firstName || client.username}</span>
      `;

      // CLICK FOR REMOVE MODE
      card.addEventListener("click", () => {
        if (!removeMode) return;

        const id = client.id;

        if (selectedClients.has(id)) {
          selectedClients.delete(id);
          card.classList.remove("selected");
        } else {
          selectedClients.add(id);
          card.classList.add("selected");
        }
      });

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Error loading clients</p>";
  }
}

// =====================
// ADD CLIENT
// =====================
document.getElementById("addClientForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const client_id = document.getElementById("clientId").value;
  const token = localStorage.getItem("access_token");

  if (!client_id) {
    alert("Please enter a client ID");
    return;
  }

  try {
    // CHECK FOR DUPLICATES
    const existingRes = await fetch("http://localhost:8000/api/coach/clients", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const existingData = await existingRes.json();
    const existingClients = Array.isArray(existingData) ? existingData : [existingData];

    const alreadyExists = existingClients.some(c => c.id == client_id);

    if (alreadyExists) {
      alert("Client already added");
      return;
    }

    // INVITE CLIENT
    const res = await fetch(`http://localhost:8000/api/client-invite?client_id=${client_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to invite client");
    }

    alert("Client invited successfully");

    // refresh list
    loadClients();

    this.reset();
    document.getElementById("addClientPanel").classList.add("hidden");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// =====================
// TOGGLE REMOVE MODE
// =====================
function toggleRemoveMode() {
  const btn = document.querySelector(".remove-btn");

  // If already in remove mode → confirm removal
  if (removeMode) {
    removeSelectedClients();
    return;
  }

  // Enter remove mode
  removeMode = true;
  selectedClients.clear();

  document.querySelectorAll(".client-card").forEach(card => {
    card.classList.remove("selected");
  });

  btn.classList.add("active");

  alert("Select clients, then press Remove Clients again to confirm");
}

// =====================
// REMOVE SELECTED CLIENTS
// =====================
async function removeSelectedClients() {
  const token = localStorage.getItem("access_token");
  const btn = document.querySelector(".remove-btn");

  // No selection -> EXIT remove mode properly
  if (selectedClients.size === 0) {
    alert("No clients selected");

    removeMode = false;
    btn.classList.remove("active");

    return;
  }

  try {
    for (const id of selectedClients) {
      const res = await fetch(`http://localhost:8000/api/remove-client?client_id=${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to remove client ${id}`);
      }
    }

    alert("Clients removed");

    // RESET STATE
    removeMode = false;
    selectedClients.clear();
    btn.classList.remove("active");

    loadClients();

  } catch (err) {
    console.error(err);
    alert("Failed to remove clients");

    // ALSO EXIT MODE ON ERROR
    removeMode = false;
    selectedClients.clear();
    btn.classList.remove("active");
  }
}
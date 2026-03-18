async function loadClients() {
  const container = document.getElementById("clientsContainer");

  const token = localStorage.getItem("token"); 
  // 
  // const token = "token_here";

  try {

    const res = await fetch("http://localhost:8000/docs#/default/get_coach_clients_api_coach_clients_get", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const clients = await res.json();

    container.innerHTML = "";

    clients.forEach(client => {

      const card = document.createElement("div");
      card.className = "client-card";

      card.innerHTML = `
        <img src="./avatar.jpg" alt="Client Avatar" class="client-avatar">

        <div class="client-details">
          <p class="client-name">${client.firstName} ${client.lastName}</p>
          <p class="client-email">${client.email}</p>
          <p class="client-meta">Last workout: N/A</p>
        </div>

        <a href="#" class="workout-btn">
          View Workouts
        </a>
      `;

      container.appendChild(card);

    });

    // update client count in header
    document.querySelector(".section-title").textContent =
      `My Clients (${clients.length})`;

  } catch (error) {
    console.error("Error loading clients:", error);
  }
}

loadClients();
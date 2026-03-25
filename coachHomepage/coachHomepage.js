document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("clientsContainer");
    const countEl = document.getElementById("clientCount");
    const coachNameEl = document.getElementById("coachName");

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "../Login/login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:8000/api/coach/clients", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        const clients = Array.isArray(data) ? data : [data];

        // update count
        countEl.textContent = clients.length;

        // set coach name from token later
        coachNameEl.textContent = "Coach";

        container.innerHTML = "";

        clients.forEach(client => {

            const card = document.createElement("div");
            card.className = "client-card";

            card.innerHTML = `
                <img src="./avatar.jpg" alt="Client Avatar" class="client-avatar">

                <div class="client-details">
                    <p class="client-name">${client.firstName} ${client.lastName}</p>
                    <p class="client-email">${client.email}</p>
                    <p class="client-meta">@${client.username}</p>
                </div>

                <a href="/CoachAnalytics/index.html?id=${client.id}&name=${client.firstName}" class="workout-btn">
                    View Workouts
                </a>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Failed to load clients</p>";
    }

});
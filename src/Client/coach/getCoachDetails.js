// =========================
// track selected coach for accept/reject actions
let selectedCoachId = null;

async function loadCoachPage() {
  const container = document.getElementById("coachContainer");
  const token = localStorage.getItem("access_token");

  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`
  };

  try {
    //fetch both at same time
    const [coachRes, inviteRes] = await Promise.all([
      fetch("http://localhost:8000/api/client/coaches", { headers }),
      fetch("http://localhost:8000/api/get-coach-invites", { headers })
    ]);

    const coaches = await coachRes.json();
    const invites = await inviteRes.json();

    let html = "";

    
    if (coaches && coaches.length > 0) {
      html += `
        <div class="section-title">Your Coaches</div>
      `;

      html += coaches.map(coach => `
        <div class="coach-card">

          <div class="coach-info-card">
            <div class="coach-avatar">
              <div class="coach-head"></div>
              <div class="coach-body"></div>
            </div>

            <div class="coach-text">
              <h3>${coach.firstName} ${coach.lastName}</h3>
              <p>${coach.email}</p>
            </div>
          </div>

        </div>
      `).join("");
    }


    if (invites && invites.length > 0) {

      html += `
        <div class="section-title">Invitations</div>
      `;

      html += invites.map(invite => `
        <div class="coach-card">

          
          <div class="coach-info-card selectable"
               id="banner-${invite.coach_id}"
               onclick="selectCoach(${invite.coach_id})">

            <div class="coach-avatar">
              <div class="coach-head"></div>
              <div class="coach-body"></div>
            </div>

            <div class="coach-text">
              <h3>Coach</h3>
              <p>ID: ${invite.coach_id}</p>
            </div>
          </div>

          <div class="coach-actions invite-actions">
            <button class="coach-btn"
              onclick="acceptSelected()">
              Accept
            </button>

            <button class="coach-btn reject-btn"
              onclick="rejectSelected()">
              Reject
            </button>
          </div>

        </div>
      `).join("");
    }

    
    if ((!coaches || coaches.length === 0) &&
        (!invites || invites.length === 0)) {

      html = `
        <div class="coach-card">
          <h3>No coaches yet</h3>
          <p>Waiting for invite...</p>
        </div>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    console.error("Error loading coach page:", err);
  }
}



function selectCoach(coachId) {
  const banner = document.getElementById(`banner-${coachId}`);

  // Toggle off
  if (selectedCoachId === coachId) {
    selectedCoachId = null;
    banner.classList.remove("selected");
    return;
  }

  // Clear all
  document.querySelectorAll(".coach-info-card").forEach(b => {
    b.classList.remove("selected");
  });

  selectedCoachId = coachId;
  banner.classList.add("selected");
}



async function acceptSelected() {
  if (!selectedCoachId) return;

  const token = localStorage.getItem("access_token");

  await fetch(`http://localhost:8000/api/accept-invite?coach=${selectedCoachId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  selectedCoachId = null;
  loadCoachPage();
}



async function rejectSelected() {
  if (!selectedCoachId) return;

  const token = localStorage.getItem("access_token");

  await fetch(`http://localhost:8000/api/reject-invite?coach=${selectedCoachId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  selectedCoachId = null;
  loadCoachPage();
}



window.addEventListener("DOMContentLoaded", loadCoachPage);
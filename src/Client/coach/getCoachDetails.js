async function loadCoachPage() {
  const container = document.getElementById("coachContainer");
  const token = localStorage.getItem("access_token");

  if (!container) {
    console.error("coachContainer not found");
    return;
  }

  if (!token) {
    container.innerHTML = `
      <div class="coach-card">
        <p>Please log in first.</p>
      </div>
    `;
    return;
  }

  try {
    const inviteRes = await fetch("http://localhost:8000/api/get-coach-invites", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!inviteRes.ok) {
      throw new Error(`Invite fetch failed: ${inviteRes.status}`);
    }

    const invites = await inviteRes.json();
    console.log("Invites:", invites);

    if (!Array.isArray(invites) || invites.length === 0) {
      container.innerHTML = `
        <div class="coach-card">
          <div class="empty-state">
            <h3>No coach yet</h3>
            <p>Get an invite from a coach to continue.</p>
          </div>
        </div>
      `;
      return;
    }

    const invite = invites[0];

    const coachRes = await fetch(`http://localhost:8000/api/account?id=${invite.coach_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!coachRes.ok) {
      throw new Error(`Coach fetch failed: ${coachRes.status}`);
    }

    const coach = await coachRes.json();
    console.log("Coach account:", coach);

    container.innerHTML = `
      <div class="coach-card">
        <div class="coach-top-row">
          <div class="coach-info-card">
            <div class="coach-avatar">
              <div class="coach-head"></div>
              <div class="coach-body"></div>
            </div>

            <div class="coach-text">
              <h3>${coach.firstName ?? ""} ${coach.lastName ?? ""}</h3>
              <p>${coach.email ?? ""}</p>
            </div>
          </div>

          <div class="coach-actions">
            <button class="coach-btn" type="button" onclick="acceptInvite(${invite.coach_id})">Accept</button>
            <button class="coach-btn" type="button" onclick="rejectInvite(${invite.coach_id})">Reject</button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="coach-card">
        <p>Could not load coach data.</p>
      </div>
    `;
  }
}

async function acceptInvite(coachId) {
  const token = localStorage.getItem("access_token");

  await fetch(`http://localhost:8000/api/accept-invite?coach=${coachId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadCoachPage();
}

async function rejectInvite(coachId) {
  const token = localStorage.getItem("access_token");

  await fetch(`http://localhost:8000/api/reject-invite?coach=${coachId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadCoachPage();
}

document.addEventListener("DOMContentLoaded", loadCoachPage);
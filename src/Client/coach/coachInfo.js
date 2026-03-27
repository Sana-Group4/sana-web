console.log("Coach details page loaded");


const params = new URLSearchParams(window.location.search);
const coachId = params.get("coach_id");

if (!coachId) {
  console.error("coachId is not defined");
}

// =========================
async function loadCoachDetails() {

  const token = localStorage.getItem("access_token");

  try {

    
    const coachRes = await fetch(
      "http://localhost:8000/api/client/coaches",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const coaches = await coachRes.json();

    console.log("Coaches:", coaches);
    console.log("URL coachId:", coachId);

    const coach = coaches.find(c =>
    String(c.id) === String(coachId)
    );

    if (!coach) {
      console.error("Coach not found");
      return;
    }

   
    const detailsRes = await fetch(
      `http://localhost:8000/api/coach-info?coach_id=${coachId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const details = await detailsRes.json();

    console.log("Details:", details);

    

    document.getElementById("coachName").textContent =
      `${coach.firstName} ${coach.lastName}`;

    document.getElementById("coachEmail").textContent =
      coach.email;

    document.getElementById("coachDescription").textContent =
      details.description || "No description available";

    document.getElementById("coachNotes").textContent =
      details.notes || "No notes";

    
    // SPECIALTIES

    const specContainer = document.getElementById("coachSpecialties");
    specContainer.innerHTML = "";

    if (details.specialties) {
      details.specialties.split(",").forEach(s => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = s.trim();
        specContainer.appendChild(tag);
      });
    }


    // FOCUS

    const focusContainer = document.getElementById("coachFocus");
    focusContainer.innerHTML = "";

    if (details.focus) {
      details.focus.split(",").forEach(f => {
        const li = document.createElement("li");
        li.textContent = f.trim();
        focusContainer.appendChild(li);
      });
    }

  } catch (err) {
    console.error("Error loading coach details:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadCoachDetails);
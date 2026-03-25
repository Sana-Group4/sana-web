// Read client id from URL (null if not present — viewing own tasks)
const params = new URLSearchParams(document.location.search);
const clientId = params.get("id") ? Number(params.get("id")) : null;

document.addEventListener("DOMContentLoaded", () => {
  loadActivities();
  setupAddTask();
});

async function loadActivities() {
  const container = document.getElementById("todoContainer");
  const token = localStorage.getItem("access_token");

  if (!container || !token) return;

  try {
    // If coaching a client, fetch their activities; otherwise fetch own
    const url = `http://localhost:8000/api/activities?user_id=${clientId}`

    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const activities = await res.json();
    container.innerHTML = "";

    if (!activities.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No tasks yet</p>
          <span>Add a task to get started</span>
        </div>
      `;
      return;
    }

    activities.forEach(activity => {
      let icon = "⚡";
      switch (activity.activity_type) {
        case "steps":           icon = "👟"; break;
        case "workout_minutes": icon = "🏃"; break;
        case "workout_session": icon = "🏋️"; break;
        case "calories_burned": icon = "🔥"; break;
        case "weight":          icon = "⚖️"; break;
        case "custom":          icon = "⚡"; break;
      }

      const li = document.createElement("li");
      li.className = "item-card";

      let timeText = "";
      if (activity.due_at) {
        const date = new Date(activity.due_at);
        timeText = "At " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      li.innerHTML = `
        <div class="item-left">
          <input type="checkbox" class="task-check" ${activity.status === "completed" ? "checked" : ""}>
          <div class="item-icon">${icon}</div>
          <div class="item-text">
            <p class="item-title">${activity.name}</p>
            <p class="item-sub">${timeText || ""}</p>
          </div>
        </div>
        <span class="item-badge">${activity.target_value ?? ""} ${activity.unit ?? ""}</span>
        <button class="delete-btn">🗑</button>
      `;

      // Checkbox
      const checkbox = li.querySelector(".task-check");
      checkbox.addEventListener("change", () => {
        li.classList.toggle("completed", checkbox.checked);
        const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
        completed[activity.id] = checkbox.checked;
        localStorage.setItem("completedTasks", JSON.stringify(completed));
      });

      const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
      if (completed[activity.id]) {
        li.classList.add("completed");
        li.querySelector(".task-check").checked = true;
      }

      // Delete
      li.querySelector(".delete-btn").addEventListener("click", async () => {
        await fetch(`http://localhost:8000/api/activities/${activity.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        li.remove();
      });

      if (activity.status === "completed") li.classList.add("completed");

      container.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load activities:", err);
  }
}

function setupAddTask() {
  const btn        = document.getElementById("addTaskBtn");
  const table      = document.getElementById("taskTableContainer");
  const saveBtn    = document.getElementById("saveTableTask");
  const nameInput  = document.getElementById("tableName");
  const typeSelect = document.getElementById("tableType");
  const valueInput = document.getElementById("tableValue");
  const unitSelect = document.getElementById("tableUnit");
  const timeInput  = document.getElementById("tableTime");
  const token      = localStorage.getItem("access_token");

  if (!btn || !table) return;

  btn.addEventListener("click", () => table.classList.toggle("hidden"));

  typeSelect.addEventListener("change", () => {
    const type = typeSelect.value;
    if (type === "steps")            unitSelect.value = "steps";
    else if (type === "workout_minutes") unitSelect.value = "minutes";
    else if (type === "calories_burned") unitSelect.value = "kcal";
    else if (type === "weight")      unitSelect.value = "kg";
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value;
    if (!name) return;

    const type  = typeSelect.value;
    const value = valueInput.value;
    const unit  = unitSelect.value;
    const time  = timeInput.value;

    let due_at = null;
    if (time) {
      const today = new Date().toISOString().split("T")[0];
      due_at = `${today}T${time}:00Z`;
    }

    const body = {
      name,
      description: "",
      activity_type: type,
      target_value: value ? Number(value) : null,
      unit: unit || null,
      due_at,
    };

    await fetch("http://localhost:8000/api/activities/?assigned_to="+clientId, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    nameInput.value  = "";
    valueInput.value = "";
    unitSelect.value = "";
    timeInput.value  = "";
    typeSelect.value = "custom";
    table.classList.add("hidden");

    loadActivities();
  });
}
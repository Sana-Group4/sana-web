document.addEventListener("DOMContentLoaded", async () => {


  const list = document.querySelector(".item-list");


  if (!list) {
    console.error("item-list not found");
    return;
  }

  const token = localStorage.getItem("access_token");

  const res = await fetch("http://localhost:8000/api/activities", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const activities = await res.json();


  list.innerHTML = "";

const completed = JSON.parse(localStorage.getItem("completedTasks") || {});

if (!activities.length) {
  list.innerHTML = `
    <div class="empty-state">
      <p>No tasks yet</p>
      <span>Add a task in analytics to get started </span>
    </div>
  `;
  return;
}

activities.forEach(activity => {

    let icon = "⚡";

        switch (activity.activity_type) {
        case "steps":
            icon = "👟";
            break;
        case "workout_minutes":
            icon = "🏃";
            break;
        case "workout_session":
            icon = "🏋️";
            break;
        case "calories_burned":
            icon = "🔥";
            break;
        case "weight":
            icon = "⚖️";
            break;
        case "custom":
            icon = "⚡";
            break;
        }

  const li = document.createElement("li");
  li.className = "item-card";

  let timeText = "";
  if (activity.due_at) {
    const date = new Date(activity.due_at);
    timeText = "At " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  li.innerHTML = `
    <div class="item-left">
      <div class="item-icon">${icon}</div>
      <div class="item-text">
        <p class="item-title">${activity.name}</p>
        <p class="item-sub">${timeText}</p>
      </div>
    </div>
    <span class="item-badge">
      ${activity.target_value ?? ""} ${activity.unit ?? ""}
    </span>
  `;

  
  if (completed[activity.id]) {
    li.classList.add("completed");
  }

  list.appendChild(li);
});

});
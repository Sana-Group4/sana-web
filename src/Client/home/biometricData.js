async function getUserId() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No access token found");
    return null;
  }

  try {
    const res = await fetch("http://localhost:8000/api/account", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to get account");
    }

    const user = await res.json();
    console.log("Logged in user:", user);
    return user.id;
  } catch (err) {
    console.error("Error getting user:", err);
    return null;
  }
}

function getRange() {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - 30); // 30 days safe

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

async function fetchBiometric(userId, type) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No access token found");
    return "--";
  }

  const { start, end } = getRange();

  const url =
    `http://localhost:8000/api/biometrics/vector` +
    `?user_id=${userId}` +
    `&biometric_type=${type}` +
    `&start=${encodeURIComponent(start)}` +
    `&end=${encodeURIComponent(end)}`;

  console.log("Fetching:", url);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch ${type}:`, res.status, errorText);
      return "--";
    }

    const data = await res.json();
    console.log(`${type} response:`, data);

    if (data.y && data.y.length > 0) {
      return data.y[data.y.length - 1];
    }

    return "--";
  } catch (err) {
    console.error(`Error fetching ${type}:`, err);
    return "--";
  }
}

async function loadDashboard() {
  const caloriesEl = document.getElementById("caloriesValue");
  const stepsEl = document.getElementById("stepsValue");
  const workoutEl = document.getElementById("workoutValue");

  if (!caloriesEl || !stepsEl || !workoutEl) {
    console.error("Dashboard elements not found");
    return;
  }

  caloriesEl.textContent = "Loading...";
  stepsEl.textContent = "Loading...";
  workoutEl.textContent = "Push Day - 45 mins";

  const userId = await getUserId();

  if (!userId) {
    caloriesEl.textContent = "--";
    stepsEl.textContent = "--";
    return;
  }

  const [calories, steps] = await Promise.all([
    fetchBiometric(userId, "calories_per_day"),
    fetchBiometric(userId, "steps_per_day")
  ]);

  caloriesEl.textContent = calories;
  stepsEl.textContent = steps;
}

document.addEventListener("DOMContentLoaded", loadDashboard);
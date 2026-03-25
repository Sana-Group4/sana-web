async function getUser() {
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
    return user;
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

async function make_chart(user, data_name){
  let data,goal, title;
  if (data_name == "steps"){
    data = await fetchBiometric(user.id, 'steps_per_day');
    if (data == "--"){
      data = 0
    }
    goal = document.getElementById("step_val").textContent
    title = "Step Goal"
  }
  else if (data_name == "cals"){
    data = await fetchBiometric(user.id, 'calories_per_day');
    if (data == "--"){
      data = 0
    }
    goal = document.getElementById("cal_val").textContent
    title = "Burned Calories Goal"
  }
  const remaining = Number(goal.replace(/,/g, "").trim())-data
  console.log(data)
  console.log(remaining)
  console.log(goal)
  const processed_data = {
    title: title,
    labels:[
      'Current',
      'Remaining'
    ],
    datasets: [{
      data: [data, remaining],
      backgroundColor: [
        '#4f59a5',
        '#a6afe8'
      ],
      hoverOffset: 4
    }]
  }

  new Chart(
    document.getElementById(data_name+"_goal"),
    {
      type: 'doughnut',
      data: processed_data
    }
  )
}

async function loadDashboard() {
  const caloriesEl = document.getElementById("caloriesValue");
  const stepsEl = document.getElementById("stepsValue");
  const workoutEl = document.getElementById("workoutValue");

  if (!localStorage.getItem("cal-goal")){
        localStorage.setItem("cal-goal", 1000);
    }

    if (!localStorage.getItem("step-goal")){
        localStorage.setItem("step-goal", 8000);
    }

  document.getElementById("cal_val").textContent= localStorage.getItem("cal-goal");
  document.getElementById("step_val").textContent= localStorage.getItem("step-goal");

  if (!caloriesEl || !stepsEl || !workoutEl) {
    console.error("Dashboard elements not found");
    return;
  }

  caloriesEl.textContent = "Loading...";
  stepsEl.textContent = "Loading...";
  workoutEl.textContent = "Push Day - 45 mins";

  const user = await getUser();

  if (!user) {
    caloriesEl.textContent = "--";
    stepsEl.textContent = "--";
    return;
  }

  const dateNow = new Date();
  const time = dateNow.getHours()

  const welcome_sub = document.getElementById("welcome-sub");

  if (time >=0 && time <=12){
    welcome_sub.textContent = "Good Morning";
  }
  else if (time >12 && time <=17){
    welcome_sub.textContent = "Good Afternoon";
  }
  else welcome_sub.textContent = "Good Evening";

  document.getElementById("welcome").textContent = "Welcome, " + user.firstName + "!";

  const [calories, steps] = await Promise.all([
    fetchBiometric(user.id, "calories_per_day"),
    fetchBiometric(user.id, "steps_per_day")
  ]);

  caloriesEl.textContent = calories;
  stepsEl.textContent = steps;

  await make_chart(user, "steps")
  await make_chart(user, "cals")
}

document.addEventListener("DOMContentLoaded", loadDashboard);
let params = new URLSearchParams(document.location.search);
let id = Number(params.get("id"));
let client_name = params.get("name");


const day_7 = document.getElementById("7-day");
const day_14 = document.getElementById("14-day");
const day_30 = document.getElementById("30-day");

const heart_rate = document.getElementById("heart_rate_bpm");
const weight = document.getElementById("weight_kg");
const workout = document.getElementById("workout_session");
const steps = document.getElementById("steps_per_day");
const calories = document.getElementById("calories_per_day");

const steps_today = document.getElementById("steps_today");
const cals_today = document.getElementById("cals_today");
const wo_today = document.getElementById("wo_today");
const active_mins = document.getElementById("active_mins");

const graph_title = document.getElementById("graph-title");

day_7.addEventListener("click", () => {
    curr_timescale = 7;
    make_graph(e);
});

day_14.addEventListener("click", () => {
    curr_timescale = 14;
    make_graph();
});

day_30.addEventListener("click", () =>  {
    curr_timescale = 30;
    make_graph();
});

heart_rate.addEventListener("click", () =>{
    curr_data_type = "heart_rate_bpm";
    make_graph();
});

weight.addEventListener("click", () =>{
    curr_data_type = "weight_kg";
    make_graph();
});

workout.addEventListener("click", () =>{
    curr_data_type = "workout_session";
    make_graph();
});

steps.addEventListener("click", () =>{
    curr_data_type = "steps_per_day";
    make_graph();
});

calories.addEventListener("click", () =>{
    curr_data_type = "calories_per_day";
    make_graph();
});

let curr_timescale = 7;
let curr_data_type = "heart_rate_bpm";
let curr_chart = null;

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

function getRange(days) {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - days);

  console.log("Range:", start, end);
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

  const { start, end } = getRange(curr_timescale);

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

    if (data){
        return data
    }
    else{
        return "--";
    }
  } catch (err) {
    console.error(`Error fetching ${type}:`, err);
    return "--";
  }
}

async function fetch_single_Biometric(userId, type) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No access token found");
    return "--";
  }

  const { start, end } = getRange(1);

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
    else{
        return "--";
    }
  } catch (err) {
    console.error(`Error fetching ${type}:`, err);
    return "--";
  }
}

async function load_dashboard(){
    const user = await getUser();

    const dateNow = new Date();
    const time = dateNow.getHours()

    const welcome_sub = document.getElementById("welcome-sub");

    document.getElementById("client-disp").textContent = "Displaying data for your client: " + client_name

    if (time >=0 && time <=12){
        welcome_sub.textContent = "Good Morning";
    }
    else if (time >12 && time <=17){
        welcome_sub.textContent = "Good Afternoon";
    }
    else welcome_sub.textContent = "Good Evening";

    let steps,cals,wo;
    steps = await fetch_single_Biometric(id, "steps_per_day");
    cals = await fetch_single_Biometric(id, "calories_per_day");
    wo = await fetch_single_Biometric(id, "workout_session");

    steps_today.textContent = steps || "--";
    cals_today.textContent = cals || "--";
    wo_today.textContent = wo || "--";
    active_mins.textContent = "--";

    document.getElementById("welcome").textContent = "Welcome, Coach " + user.firstName + "!";
}

function make_line_chart(canvasId, labels, values, title = "") {
    if (curr_chart){
        curr_chart.destroy()
    }

    curr_chart = new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                borderColor: '#4f59a5',
                backgroundColor: '#4f59a571',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            plugins: {
                title: {
                    display: !!title,
                    text: title
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 8  // prevents datetime labels overlapping
                    }
                }
            }
        }
    });
}

function make_bar_chart(canvasId, labels, values, title = "") {
    if (curr_chart) {
        curr_chart.destroy();
    }

    const formattedLabels = labels.map(d => new Date(d).toLocaleString("en-GB", {
        day: "numeric",
        month: "short"
    }));

    curr_chart = new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
            labels: formattedLabels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: '#4f59a571',
                borderColor: '#4f59a5',
                borderWidth: 1,
                maxBarThickness: 60    
            }]
        },
        options: {
            plugins: {
                title: {
                    display: !!title,
                    text: title
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 31
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getDailyMax(labels, values) {
    const dailyMap = {};

    labels.forEach((timestamp, i) => {
        const day = new Date(timestamp).toISOString().split("T")[0];
        if (!dailyMap[day] || values[i] > dailyMap[day]) {
            dailyMap[day] = values[i];
        }
    });

    return {
        t: Object.keys(dailyMap),
        y: Object.values(dailyMap)
    };
}

async function make_graph(){
    let data, title, graph;
    data = await fetchBiometric(id, curr_data_type)

    if (curr_data_type == "heart_rate_bpm"){
        title = "BPM"
        graph_title.innerHTML = "Heart Rate"
        graph = "line"
    }

    if (curr_data_type == "workout_session"){
        title = "workouts"
        graph_title.innerHTML = "Workout Sessions Per Day"
        graph = "bar"
    }

    if (curr_data_type == "weight_kg"){
        title = "Kg"
        graph_title.innerHTML = "Weight"
        graph = "line"
    }

    if (curr_data_type == "steps_per_day"){
        title = "Steps"
        graph_title.innerHTML = "Steps per day"
        graph = "bar"
    }

    if (curr_data_type == "calories_per_day"){
        title = "Kcal"
        graph_title.innerHTML = "Calories Per Day"
        graph = "bar"
    }

    if (graph == "line"){
        const formattedLabels = data.t.map(d => {
        const date = new Date(d);
        return date.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
            });
        }); 
        make_line_chart("analytics-graph", formattedLabels, data.y, title)
    }

    if (graph == "bar"){
        const daily = getDailyMax(data.t, data.y);
        make_bar_chart("analytics-graph", daily.t, daily.y, "Steps per Day");
    }
}

window.onload = async () => {
    await load_dashboard()
    make_graph()};


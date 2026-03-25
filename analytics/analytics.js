
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

const bio_select = document.getElementById("update_bio_type");
const bio_input = document.getElementById("update-bio-val");
const bio_confirm = document.getElementById("bio-add-confirm");

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

bio_confirm.addEventListener("click", () => {
    add_bio();
});

document.getElementById("cal-edit-btn").addEventListener("click", () => {
    makeEditable("cal-goal");
});

document.getElementById("step-edit-btn").addEventListener("click", () => {
    makeEditable("step-goal");
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

    if (time >=0 && time <=12){
        welcome_sub.textContent = "Good Morning";
    }
    else if (time >12 && time <=17){
        welcome_sub.textContent = "Good Afternoon";
    }
    else welcome_sub.textContent = "Good Evening";

    let steps,cals,wo;
    steps = await fetch_single_Biometric(user.id, "steps_per_day");
    cals = await fetch_single_Biometric(user.id, "calories_per_day");
    wo = await fetch_single_Biometric(user.id, "workout_session");

    if (!localStorage.getItem("cal-goal")){
        localStorage.setItem("cal-goal", 1000);
    }

    if (!localStorage.getItem("step-goal")){
        localStorage.setItem("step-goal", 8000);
    }

    document.getElementById("cal-goal").innerText= localStorage.getItem("cal-goal");
    document.getElementById("step-goal").innerText= localStorage.getItem("step-goal");

    console.log(steps);

    steps_today.textContent = steps || "--";
    cals_today.textContent = cals || "--";
    wo_today.textContent = wo || "--";
    active_mins.textContent = "--";

    document.getElementById("welcome").textContent = "Welcome, " + user.firstName + "!";
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
    const user = await getUser();
    console.log(user);
    let data, title, graph;
    data = await fetchBiometric(user.id, curr_data_type)

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

async function add_bio(){
    let type,val,token;
    type = bio_select.options[bio_select.selectedIndex].value;
    val = Number(bio_input.value);
    token = localStorage.getItem("access_token")

    console.log(type);
    console.log(val);

    const user = await getUser();
    console.log(user);

    const now = new Date();
    if (!type || !val){
        alert("data not valid")
        return
    }

    const url =
    `http://localhost:8000/api/biometrics/vector`

    try{
        const res= await fetch(url,{
            method: "POST",
            body:JSON.stringify({
                user_id: user.id,
                biometric_type: type,
                times: [now.toISOString()],
                values: [val]
            }),
            headers:{
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error(response.statusText);
        console.log(res);
        alert("biomarker added succesfully")
    }catch (err){
        alert("error adding biomarker")
    }
}

function makeEditable(spanId) {
    const span = document.getElementById(spanId);
    if (!span) return;

    const original = span.textContent;

    const input = document.createElement("input");
    input.value = original;
    input.style.width = span.offsetWidth + "px";

    span.replaceWith(input);
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirm();
        if (e.key === "Escape") cancel();
    });

    input.addEventListener("blur", confirm);

    function confirm() {
        span.textContent = input.value || original;
        input.replaceWith(span);
        localStorage.setItem(spanId, input.value);
    }

    function cancel() {
        span.textContent = original;
        input.replaceWith(span);
    }
}

window.onload = () => {
    load_dashboard()
    make_graph()};


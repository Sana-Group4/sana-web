console.log("analytics.js loaded");

let curr_timescale = 7;
let curr_data_type = "heart_rate_bpm";
let curr_chart = null;

// ─── API HELPERS ─────────────────────────────────────────────────────────────

async function getUser() {
    const token = localStorage.getItem("access_token");
    if (!token) { console.error("No access token"); return null; }

    try {
        const res = await fetch("http://localhost:8000/api/account", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to get account");
        return await res.json();
    } catch (err) {
        console.error("getUser error:", err);
        return null;
    }
}

function getRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    return { start: start.toISOString(), end: end.toISOString() };
}

async function fetchBiometric(userId, type, days) {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const { start, end } = getRange(days);
    const url = `http://localhost:8000/api/biometrics/vector`
        + `?user_id=${userId}`
        + `&biometric_type=${type}`
        + `&start=${encodeURIComponent(start)}`
        + `&end=${encodeURIComponent(end)}`;

    try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { console.error(`fetchBiometric ${type} failed:`, res.status); return null; }
        return await res.json();
    } catch (err) {
        console.error(`fetchBiometric error:`, err);
        return null;
    }
}

async function fetchLatestBiometric(userId, type) {
    const data = await fetchBiometric(userId, type, 1);
    if (data && data.y && data.y.length > 0) {
        return data.y[data.y.length - 1];
    }
    return "--";
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

async function load_dashboard() {
    const user = await getUser();
    if (!user) { console.error("No user — is access_token set?"); return; }

    // Greeting
    const hour = new Date().getHours();
    const greetingEl = document.getElementById("welcome-sub");
    if (greetingEl) {
        greetingEl.textContent = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    }

    const welcomeEl = document.getElementById("welcome");
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.firstName}!`;

    // Goals
    if (!localStorage.getItem("cal-goal")) localStorage.setItem("cal-goal", 1000);
    if (!localStorage.getItem("step-goal")) localStorage.setItem("step-goal", 8000);
    const calGoalEl = document.getElementById("cal-goal");
    const stepGoalEl = document.getElementById("step-goal");
    if (calGoalEl) calGoalEl.innerText = localStorage.getItem("cal-goal");
    if (stepGoalEl) stepGoalEl.innerText = localStorage.getItem("step-goal");

    // Today's stats
    const [steps, cals, wo] = await Promise.all([
        fetchLatestBiometric(user.id, "steps_per_day"),
        fetchLatestBiometric(user.id, "calories_per_day"),
        fetchLatestBiometric(user.id, "workout_session")
    ]);

    document.getElementById("steps_today").textContent = steps;
    document.getElementById("cals_today").textContent = cals;
    document.getElementById("wo_today").textContent = wo;
    document.getElementById("active_mins").textContent = "--";
}

// ─── CHARTS ──────────────────────────────────────────────────────────────────

function make_line_chart(canvasId, labels, values, title = "") {
    if (curr_chart) curr_chart.destroy();
    curr_chart = new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels,
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
            plugins: { title: { display: !!title, text: title } },
            scales: { x: { ticks: { maxTicksLimit: 8 } } }
        }
    });
}

function make_bar_chart(canvasId, labels, values, title = "") {
    if (curr_chart) curr_chart.destroy();
    const formattedLabels = labels.map(d => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short" }));
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
            plugins: { title: { display: !!title, text: title } },
            scales: { x: { ticks: { maxTicksLimit: 31 } }, y: { beginAtZero: true } }
        }
    });
}

function getDailyMax(labels, values) {
    const dailyMap = {};
    labels.forEach((timestamp, i) => {
        const day = new Date(timestamp).toISOString().split("T")[0];
        if (!dailyMap[day] || values[i] > dailyMap[day]) dailyMap[day] = values[i];
    });
    return { t: Object.keys(dailyMap), y: Object.values(dailyMap) };
}

async function make_graph() {
    const user = await getUser();
    if (!user) { console.error("make_graph: no user"); return; }

    const data = await fetchBiometric(user.id, curr_data_type, curr_timescale);
    if (!data || !data.t || !data.y) { console.error("make_graph: no data returned"); return; }

    const graphTitleEl = document.getElementById("graph-title");

    const config = {
        heart_rate_bpm:   { title: "BPM",    label: "Heart Rate",            type: "line" },
        weight_kg:        { title: "Kg",      label: "Weight",                type: "line" },
        workout_session:  { title: "Workouts",label: "Workout Sessions Per Day", type: "bar" },
        steps_per_day:    { title: "Steps",   label: "Steps Per Day",         type: "bar"  },
        calories_per_day: { title: "Kcal",    label: "Calories Per Day",      type: "bar"  }
    }[curr_data_type];

    if (!config) return;
    if (graphTitleEl) graphTitleEl.textContent = config.label;

    if (config.type === "line") {
        const formattedLabels = data.t.map(d => new Date(d).toLocaleString("en-GB", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        }));
        make_line_chart("analytics-graph", formattedLabels, data.y, config.title);
    } else {
        const daily = getDailyMax(data.t, data.y);
        make_bar_chart("analytics-graph", daily.t, daily.y, config.title);
    }
}

// ─── ADD BIOMETRIC ────────────────────────────────────────────────────────────

async function add_bio() {
    const bio_select = document.getElementById("update_bio_type");
    const bio_input  = document.getElementById("update-bio-val");
    const token      = localStorage.getItem("access_token");

    const type = bio_select.options[bio_select.selectedIndex].value;
    const val  = Number(bio_input.value);

    if (!type || !val) { alert("Data not valid"); return; }

    const user = await getUser();
    if (!user) { alert("Not logged in"); return; }

    try {
        const res = await fetch("http://localhost:8000/api/biometrics/vector", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                user_id: user.id,
                biometric_type: type,
                times: [new Date().toISOString()],
                values: [val]
            })
        });
        if (!res.ok) throw new Error(res.statusText);
        bio_input.value = "";
        alert("Biometric added successfully");
    } catch (err) {
        console.error(err);
        alert("Error adding biometric");
    }
}

// ─── EDITABLE GOALS ──────────────────────────────────────────────────────────

function makeEditable(spanId) {
    const span = document.getElementById(spanId);
    if (!span) return;
    const original = span.textContent;

    const input = document.createElement("input");
    input.value = original;
    input.style.width = "80px";
    span.replaceWith(input);
    input.focus();
    input.select();

    function confirm() {
        span.textContent = input.value || original;
        localStorage.setItem(spanId, span.textContent);
        input.replaceWith(span);
    }
    function cancel() {
        span.textContent = original;
        input.replaceWith(span);
    }

    input.addEventListener("keydown", e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel(); });
    input.addEventListener("blur", confirm);
}

// ─── EVENT LISTENERS + INIT ───────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("7-day").addEventListener("click",  () => { curr_timescale = 7;  make_graph(); });
    document.getElementById("14-day").addEventListener("click", () => { curr_timescale = 14; make_graph(); });
    document.getElementById("30-day").addEventListener("click", () => { curr_timescale = 30; make_graph(); });

    document.getElementById("heart_rate_bpm").addEventListener("click",   () => { curr_data_type = "heart_rate_bpm";   make_graph(); });
    document.getElementById("weight_kg").addEventListener("click",        () => { curr_data_type = "weight_kg";        make_graph(); });
    document.getElementById("workout_session").addEventListener("click",  () => { curr_data_type = "workout_session";  make_graph(); });
    document.getElementById("steps_per_day").addEventListener("click",    () => { curr_data_type = "steps_per_day";    make_graph(); });
    document.getElementById("calories_per_day").addEventListener("click", () => { curr_data_type = "calories_per_day"; make_graph(); });

    document.getElementById("bio-add-confirm").addEventListener("click", add_bio);
    document.getElementById("cal-edit-btn").addEventListener("click",  () => makeEditable("cal-goal"));
    document.getElementById("step-edit-btn").addEventListener("click", () => makeEditable("step-goal"));

    await load_dashboard();
    await make_graph();
});
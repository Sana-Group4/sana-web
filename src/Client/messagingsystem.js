const defaultMessages = [
  {
    id: 1,
    sender: "Sandra",
    text: "Great work on your session today. Keep it up.",
    time: "09:10",
    read: false,
    fromCoach: true
  },
  {
    id: 2,
    sender: "Sandra",
    text: "Don't forget your mobility work this evening.",
    time: "11:45",
    read: false,
    fromCoach: true
  },
  {
    id: 3,
    sender: "Sandra",
    text: "Let me know how you felt after training.",
    time: "13:20",
    read: false,
    fromCoach: true
  }
];

let messages = JSON.parse(localStorage.getItem("sanaMessages")) || defaultMessages;

const messagesList = document.getElementById("messagesList");
const headerUnreadBadge = document.getElementById("headerUnreadBadge");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const addDemoMessageBtn = document.getElementById("addDemoMessageBtn");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

function saveMessages() {
  localStorage.setItem("sanaMessages", JSON.stringify(messages));
}

function getUnreadCount() {
  return messages.filter(message => message.fromCoach && !message.read).length;
}

function updateUnreadBadge() {
  const unreadCount = getUnreadCount();

  if (unreadCount === 0) {
    headerUnreadBadge.textContent = "No unread";
  } else if (unreadCount === 1) {
    headerUnreadBadge.textContent = "1 unread";
  } else {
    headerUnreadBadge.textContent = `${unreadCount} unread`;
  }
}

function renderMessages() {
  messagesList.innerHTML = "";

  if (messages.length === 0) {
    messagesList.innerHTML = `<div class="empty-state">No messages yet.</div>`;
    updateUnreadBadge();
    return;
  }

  messages.forEach(message => {
    const row = document.createElement("div");
    row.className = message.fromCoach ? "message-row coach" : "message-row client";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const text = document.createElement("div");
    text.textContent = message.text;

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const sender = document.createElement("span");
    sender.textContent = message.sender;

    const time = document.createElement("span");
    time.textContent = message.time;

    meta.appendChild(sender);
    meta.appendChild(time);

    if (message.fromCoach && !message.read) {
      const unreadPill = document.createElement("span");
      unreadPill.className = "unread-pill";
      unreadPill.textContent = "Unread";
      meta.appendChild(unreadPill);
    }

    bubble.appendChild(text);
    bubble.appendChild(meta);
    row.appendChild(bubble);
    messagesList.appendChild(row);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
  updateUnreadBadge();
}

function markAllAsRead() {
  messages = messages.map(message => {
    if (message.fromCoach) {
      return { ...message, read: true };
    }
    return message;
  });

  saveMessages();
  renderMessages();
}

function addClientMessage(text) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMessage = {
    id: Date.now(),
    sender: "You",
    text: text,
    time: timeString,
    read: true,
    fromCoach: false
  };

  messages.push(newMessage);
  saveMessages();
  renderMessages();
}

function addDemoCoachMessage() {
  const demoTexts = [
    "Nice work today. Keep following the plan.",
    "Try to get a good stretch in after your workout.",
    "Make sure you stay hydrated this afternoon.",
    "You've been really consistent this week.",
    "Let me know if you want to adjust tomorrow's session."
  ];

  const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMessage = {
    id: Date.now(),
    sender: "Sandra",
    text: randomText,
    time: timeString,
    read: false,
    fromCoach: true
  };

  messages.push(newMessage);
  saveMessages();
  renderMessages();
}

markAllReadBtn.addEventListener("click", () => {
  markAllAsRead();
});

addDemoMessageBtn.addEventListener("click", () => {
  addDemoCoachMessage();
});

messageForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (text === "") {
    return;
  }

  addClientMessage(text);
  messageInput.value = "";
});

saveMessages();
renderMessages();
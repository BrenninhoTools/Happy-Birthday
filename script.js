const button = document.getElementById("wish");
const thanks = document.getElementById("thanks");
const counter = document.getElementById("counter");
const total = document.getElementById("total");
const subtitle = document.getElementById("subtitle");
const title = document.getElementById("title");
const badge = document.getElementById("badge");
const clock = document.getElementById("countdown");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const storageKey = "birthdayWished";
const birthdayMonth = 9;
const birthdayDay = 2;

let pieces = [];
let running = false;
let birthdayMode = false;
let timer = null;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function readWished() {
  try {
    return localStorage.getItem(storageKey) === "yes";
  } catch (error) {
    return false;
  }
}

function saveWished() {
  try {
    localStorage.setItem(storageKey, "yes");
  } catch (error) {}
}

function showThanks(time) {
  button.disabled = true;
  button.textContent = "Wish sent ✅";
  subtitle.hidden = true;
  thanks.hidden = false;
  if (time) {
    counter.hidden = false;
    counter.textContent = "Sent at " + time;
  }
}

function launchConfetti() {
  const colors = ["#ffd93d", "#ff6b6b", "#6bcb77", "#4d96ff", "#ffffff", "#ff9ff3"];
  for (let i = 0; i < 220; i++) {
    pieces.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -16 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(draw);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(function (p) {
    p.vy += 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
  pieces = pieces.filter(function (p) {
    return p.y < canvas.height + 40;
  });
  if (pieces.length) {
    requestAnimationFrame(draw);
  } else {
    running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function nextBirthday(now) {
  const year = now.getFullYear();
  const dayEnd = new Date(year, birthdayMonth, birthdayDay + 1);
  const target = new Date(year, birthdayMonth, birthdayDay);
  if (now >= dayEnd) {
    return new Date(year + 1, birthdayMonth, birthdayDay);
  }
  return target;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function enterBirthdayMode(celebrate) {
  birthdayMode = true;
  clock.hidden = true;
  badge.textContent = "🎉 Today is the day";
  title.textContent = "It's my birthday!";
  if (celebrate) {
    launchConfetti();
  }
}

function tick() {
  const now = new Date();
  const target = nextBirthday(now);
  const diff = target - now;
  if (diff <= 0) {
    if (!birthdayMode) {
      enterBirthdayMode(timer !== null);
    }
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  document.getElementById("days").textContent = pad(Math.floor(totalSeconds / 86400));
  document.getElementById("hours").textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  document.getElementById("minutes").textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  document.getElementById("seconds").textContent = pad(totalSeconds % 60);
}

function visitorId() {
  const key = "birthdayVisitor";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
      localStorage.setItem(key, id);
    }
    return id;
  } catch (error) {
    return Math.random().toString(16).slice(2).padEnd(16, "0");
  }
}

function showTotal(count) {
  if (typeof count !== "number" || count < 1) {
    return;
  }
  total.hidden = false;
  total.textContent = count === 1 ? "1 person sent their wishes 💌" : count + " people sent their wishes 💌";
}

function refreshTotal() {
  fetch("/api/count")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      showTotal(data.count);
    })
    .catch(function () {});
}

function sendWish() {
  fetch("/api/wish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: visitorId() })
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      showTotal(data.count);
    })
    .catch(function () {});
}

button.addEventListener("click", function () {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  saveWished();
  showThanks(time);
  launchConfetti();
  sendWish();
});

window.addEventListener("resize", resize);
resize();
tick();
timer = setInterval(tick, 1000);

if (readWished()) {
  showThanks();
}

refreshTotal();
setInterval(refreshTotal, 15000);

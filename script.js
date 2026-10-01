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

const colors = ["#ffd93d", "#ff4d8d", "#3ddc97", "#4d96ff", "#ffffff", "#ff9ff3", "#c04dff", "#ff9f43"];
const emojis = ["🎉", "🎂", "🥳", "🎈", "🎁", "✨", "🪩", "🍰"];
const ambientEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function ensureRunning() {
  if (!running) {
    running = true;
    requestAnimationFrame(draw);
  }
}

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function burst(x, y, count, angle, spread, power) {
  for (let i = 0; i < count; i++) {
    const direction = angle + (Math.random() - 0.5) * spread;
    const speed = power * (0.35 + Math.random() * 0.65);
    pieces.push({
      x: x,
      y: y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      size: Math.random() * 8 + 5,
      color: randomColor(),
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.35,
      round: Math.random() < 0.3,
      ambient: false,
      phase: 0
    });
  }
  ensureRunning();
}

function spawnAmbient() {
  pieces.push({
    x: Math.random() * canvas.width,
    y: -12,
    vx: (Math.random() - 0.5) * 0.6,
    vy: 1 + Math.random() * 1.8,
    size: Math.random() * 6 + 4,
    color: randomColor(),
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.12,
    round: Math.random() < 0.35,
    ambient: true,
    phase: Math.random() * Math.PI * 2
  });
}

function fireworks() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const rect = button.getBoundingClientRect();
  burst(0, h, 130, -Math.PI / 3, 0.9, 30);
  burst(w, h, 130, (-2 * Math.PI) / 3, 0.9, 30);
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 120, -Math.PI / 2, Math.PI * 2, 16);
}

function floatEmojis(count) {
  const rect = button.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const item = document.createElement("span");
    item.className = "floater";
    item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    item.style.left = rect.left + Math.random() * rect.width + "px";
    item.style.top = rect.top + rect.height / 2 + "px";
    item.style.setProperty("--dx", (Math.random() - 0.5) * 180 + "px");
    item.style.setProperty("--rot", (Math.random() - 0.5) * 90 + "deg");
    item.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(item);
    setTimeout(function () {
      item.remove();
    }, 3200);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let ambientCount = 0;
  pieces.forEach(function (p) {
    if (p.ambient) {
      p.phase += 0.03;
      p.x += p.vx + Math.sin(p.phase) * 0.8;
      p.y += p.vy;
    } else {
      p.vx *= 0.985;
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
    }
    p.rotation += p.spin;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    if (p.round) {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }
    ctx.restore();
  });
  pieces = pieces.filter(function (p) {
    const alive = p.y < canvas.height + 40;
    if (alive && p.ambient) {
      ambientCount++;
    }
    return alive;
  });
  if (ambientEnabled && ambientCount < 70 && Math.random() < 0.3) {
    spawnAmbient();
  }
  if (pieces.length || ambientEnabled) {
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
  subtitle.textContent = "Send me your wishes and join the party";
  document.body.classList.add("live");
  if (celebrate) {
    fireworks();
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
  fireworks();
  floatEmojis(14);
  sendWish();
});

document.addEventListener("click", function (event) {
  if (event.target.closest("button")) {
    return;
  }
  burst(event.clientX, event.clientY, 28, -Math.PI / 2, Math.PI * 1.3, 10);
});

window.addEventListener("resize", resize);
resize();
if (ambientEnabled) {
  ensureRunning();
}
tick();
timer = setInterval(tick, 1000);

if (readWished()) {
  showThanks();
}

refreshTotal();
setInterval(refreshTotal, 15000);

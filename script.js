const button = document.getElementById("wish");
const thanks = document.getElementById("thanks");
const counter = document.getElementById("counter");
const subtitle = document.getElementById("subtitle");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const storageKey = "birthdayWished";

let pieces = [];
let running = false;

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
  const colors = ["#ffd93d", "#ff6b6b", "#6bcB77", "#4d96ff", "#ffffff", "#ff9ff3"];
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

button.addEventListener("click", function () {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  saveWished();
  showThanks(time);
  launchConfetti();
});

window.addEventListener("resize", resize);
resize();

if (readWished()) {
  showThanks();
}

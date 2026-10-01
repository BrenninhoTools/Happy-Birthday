const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const dataFile = path.join(process.env.DATA_DIR || __dirname, "wishes.json");
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"]
};

let wishes = load();

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function save() {
  fs.writeFile(dataFile, JSON.stringify(wishes, null, 2), function () {});
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req, callback) {
  let raw = "";
  let tooLarge = false;
  req.on("data", function (chunk) {
    raw += chunk;
    if (raw.length > 1024) {
      tooLarge = true;
      req.destroy();
    }
  });
  req.on("end", function () {
    if (tooLarge) {
      return callback(null);
    }
    try {
      callback(JSON.parse(raw));
    } catch (error) {
      callback(null);
    }
  });
}

function handleWish(req, res) {
  readBody(req, function (body) {
    const id = body && typeof body.id === "string" ? body.id : "";
    if (!/^[a-zA-Z0-9]{8,64}$/.test(id)) {
      return sendJson(res, 400, { error: "invalid id" });
    }
    if (!wishes[id]) {
      wishes[id] = new Date().toISOString();
      save();
    }
    sendJson(res, 200, { count: Object.keys(wishes).length });
  });
}

const server = http.createServer(function (req, res) {
  const url = req.url.split("?")[0];

  if (url === "/api/count" && req.method === "GET") {
    return sendJson(res, 200, { count: Object.keys(wishes).length });
  }

  if (url === "/api/wish" && req.method === "POST") {
    return handleWish(req, res);
  }

  const entry = files[url];
  if (entry && req.method === "GET") {
    return fs.readFile(path.join(__dirname, entry[0]), function (error, content) {
      if (error) {
        res.writeHead(500);
        return res.end("Server error");
      }
      res.writeHead(200, { "Content-Type": entry[1] });
      res.end(content);
    });
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(port, function () {
  console.log("Birthday site running at http://localhost:" + port);
});

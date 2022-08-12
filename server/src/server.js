require("dotenv").config();
const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const http = require("http");
const { loadPlanets } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

// server.get("/", (req, res) => {});

// server.post("/messages", (req, res) => {});

async function startServer() {
  await mongoConnect();
  await loadPlanets();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();

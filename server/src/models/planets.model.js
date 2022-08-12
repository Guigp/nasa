const { parse } = require("csv-parse"); //recebe a stream de entrada e consegue tratar como objetos javascript
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanets() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "../../data/kepler_data.csv"))
      .pipe(parse({ comment: "#", columns: true })) //pipe serve para ligar uma stream de leitura na entrada para uma stream de escrita para saida
      .on("data", async (data) => {
        if (isHabitable(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, { _id: 0, __v: 0 });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name }, //se não existir dai cria aqui
      { upsert: true }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

//como poderia ser um arquivo gigante se cria stream para otimizar e ir retornando os dados na medida que vai lendo linha a linha

module.exports = {
  loadPlanets,
  getAllPlanets,
};

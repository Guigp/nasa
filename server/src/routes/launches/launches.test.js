const app = require("../../app");
const request = require("supertest");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanets } = require("../../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect(); //primeiro conecta no mongo antes de rodar todos testes, do contrtario da erro pois os testes rodam antes de conectar pois server não é chamado aqui
    await loadPlanets();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET/launches", () => {
    test("It should respond with 200 success", async () => {
      await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST/launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "xxx",
    };

    test("It should respond with 201 success", async () => {
      const response = await await request(app)
        .post("/v1/launches")

        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      //data no servidor é criado um objeto, então para comparar aqui deve fazer o mesmo dai toBe compara como 2 numeros inteiros
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate); //verifica se todos campos do destino estão na origem
    });

    test("It should catch missing required properties", async () => {
      const response = await await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property", //mesma mensagem usada no servidor
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date", //mesma mensagem usada no servidor
      });
    });
  });
});

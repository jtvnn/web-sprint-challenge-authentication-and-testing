// Write your tests here
const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

// Setup and teardown database for testing
beforeAll(async () => {
  await db.migrate.latest();
});

// Clean up database before each test
beforeEach(async () => {
  await db("users").truncate();
});

// Clean up database after all tests
afterAll(async () => {
  await db.destroy();
});

describe("Authentication Endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    test("registers a new user successfully", async () => {
      const newUser = {
        username: "testuser",
        password: "testpass",
      };

      const response = await request(server)
        .post("/api/auth/register")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.username).toBe("testuser");
      expect(response.body.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });
  test("returns error when username is missing", async () => {
    const newUser = {
      password: "testpass",
    };

    const response = await request(server)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toBe("username and password required");
  });
  test("returns error when password is missing", async () => {
    const newUser = {
      username: "testuser",
    };

    const response = await request(server)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toBe("username and password required");
  });
  test("returns error when username is taken", async () => {
    const newUser = {
      username: "testuser",
      password: "testpass",
    };

    // Register user first time
    await request(server).post("/api/auth/register").send(newUser);

    // Try to register same username again
    const response = await request(server)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toBe("username taken");
  });
});

describe("[POST] /api/auth/login", () => {
  beforeEach(async () => {
    // Register a test user before each login test
    await request(server).post("/api/auth/register").send({
      username: "testuser",
      password: "testpass",
    });
  });

  test("logs in a user successfully", async () => {
    const credentials = {
      username: "testuser",
      password: "testpass",
    };

    const response = await request(server)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("welcome, testuser");
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });
  test("returns error when username is missing", async () => {
    const credentials = {
      password: "testpass",
    };

    const response = await request(server)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(400);
    expect(response.body).toBe("username and password required");
  });
  test("returns error when password is missing", async () => {
    const credentials = {
      username: "testuser",
    };

    const response = await request(server)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(400);
    expect(response.body).toBe("username and password required");
  });
});

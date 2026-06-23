/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes app
import app from "../../../src/app.js";

// Models
import { User, Team } from "../../../src/models/index.js";

// Test data
import initialTeams from "../../data/initialTeams.js";
import initialUsers from "../../data/initialUsers.js";

const api = supertest(app);

// Global variables
let adminToken;

// Reset all data on the database tables
before(async () => {
  await setupDb();
  await api.post("/api/reset");

  // Stores all initial users into the database
  for (const user of initialUsers) {
    await api
      .post("/api/users")
      .send(user)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  }

  // Create an admin user
  const adminUser = await User.findOne({
    where: {
      username: initialUsers[0].username,
    },
  });

  // Store the admin status on the database
  adminUser.admin = true;
  await adminUser.save();

  // Login as the admin
  const loginResponse = await api
    .post("/api/login")
    .send({ username: initialUsers[0].username, password: initialUsers[0].password })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  // Store the admin login token
  adminToken = loginResponse.body.token;
});

// Close the database connection after all tests have been finished
after(async () => {
  await dbCleanup();
});

// Tests
describe("the Teams GET route", () => {
  beforeEach(async () => {
    // Remove all teams and users before each test
    await Team.truncate({ restartIdentity: true, cascade: true });

    // Stores all initial teams into the database
    for (const team of initialTeams) {
      await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }
  });

  test("teams are returned as json", async () => {
    await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all teams are returned", async () => {
    const response = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the correct total number of users
    assert.strictEqual(response.body.length, initialTeams.length);
  });

  test("a team can be fetch through its id value", async () => {
    // Get the first team from the initial list
    const teamToView = initialTeams[0];

    const response = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the id and users fields from the returned team
    const { id, users, ...otherFields } = response.body;

    // Assert the data is correct
    assert.deepStrictEqual(otherFields, teamToView);
  });

test("the list of users should be included within the returned team", async () => {
    const team = initialTeams[0];

    // Stores all initial users into a team
    for (const user of initialUsers) {
      await api
        .post("/api/teams/1/users")
        .send({ username: user.username })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }

    // Fetch the team data
    const response = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert all users are included within the response
    assert.strictEqual(initialTeams.length, response.body.users.length);
  });
});

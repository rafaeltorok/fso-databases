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
    .send({
      username: initialUsers[0].username,
      password: initialUsers[0].password,
    })
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
describe("the Teams DELETE route", () => {
  beforeEach(async () => {
    // Remove all teams before each test
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

  test("a team can be removed", async () => {
    // Store the initial amount of teams
    const initialAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Get a team to be removed
    const teamToRemove = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the team
    await api
      .delete(`/api/teams/${teamToRemove.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    // Confirm the team has been removed
    await api.get(`/api/teams/${teamToRemove.body.id}`).expect(404);

    // Store the current amount of teams
    const currentAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the numbers of teams has decreased
    assert.strictEqual(
      currentAmount.body.length,
      initialAmount.body.length - 1,
    );
  });

  test("only an admin can remove a team", async () => {
    // Store the initial amount of teams
    const initialAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Get a team to be removed
    const teamToRemove = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Login as a non-admin user
    const loginResponse = await api
      .post("/api/login")
      .send({
        username: initialUsers[1].username,
        password: initialUsers[1].password,
      })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the team
    await api
      .delete(`/api/teams/${teamToRemove.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Confirm the team has not been removed
    await api
      .get(`/api/teams/${teamToRemove.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Store the current amount of teams
    const currentAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the numbers of teams has not changed
    assert.strictEqual(initialAmount.body.length, currentAmount.body.length);
  });

  test("a non-existing team should return a proper status code", async () => {
    // Store the initial amount of teams
    const initialAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the correct status code is returned
    await api
      .delete("/api/teams/0")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    // Store the current amount of teams
    const currentAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the numbers of teams has not changed
    assert.strictEqual(currentAmount.body.length, initialAmount.body.length);
  });

  test("an invalid id should return a proper error message", async () => {
    // Store the initial amount of teams
    const initialAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the correct status code is returned
    const response = await api
      .delete("/api/teams/team_name")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Store the current amount of teams
    const currentAmount = await api
      .get("/api/teams")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the numbers of teams has not changed
    assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

    // Assert the error message is present
    assert.ok(response.body.error.includes("Invalid ID format"));
  });

  test("removing a team should also remove it from a user's teams list", async () => {
    // Get the user initial list of teams
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Get a team to be removed
    const teamToRemove = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Add a user to a team
    await api
      .post(`/api/teams/${teamToRemove.body.id}/users`)
      .send({ username: originalUserData.body.username })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the user was added to the team
    let currentUserData = await api
      .get(`/api/users/${originalUserData.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(
      currentUserData.body.teams[0].name,
      teamToRemove.body.name,
    );

    // Remove the team
    await api
      .delete(`/api/teams/${teamToRemove.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    // Confirm the team has been removed
    await api.get(`/api/teams/${teamToRemove.body.id}`).expect(404);

    // Get the user current amount of teams
    currentUserData = await api
      .get(`/api/users/${originalUserData.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the team is not present on the user's team list
    assert.ok(
      !currentUserData.body.teams.some((listItem) => {
        return listItem.name === teamToRemove.body.name;
      }),
    );
  });

  test("removing a user should also remove it from the team's list of users", async () => {
    // Get the team initial list of users
    const originalTeamData = await api
      .get("/api/teams/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Get a user to be removed
    // Select the second user, since the first one is the current logged in admin
    const userToRemove = await api
      .get("/api/users/2")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Add the user to the team
    await api
      .post(`/api/teams/${originalTeamData.body.id}/users`)
      .send({ username: userToRemove.body.username })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the user was added to the team
    let currentTeamData = await api
      .get(`/api/teams/${originalTeamData.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(
      currentTeamData.body.users[0].name,
      userToRemove.body.name,
    );

    // Remove the user
    await api
      .delete(`/api/users/${userToRemove.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    // Confirm the user has been removed
    await api.get(`/api/users/${userToRemove.body.id}`).expect(404);

    // Get the team current list of users
    currentTeamData = await api
      .get(`/api/teams/${originalTeamData.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the user is not present on the team's user list
    assert.ok(
      !currentTeamData.body.users.some((listItem) => {
        return listItem.name === userToRemove.body.name;
      }),
    );
  });
});

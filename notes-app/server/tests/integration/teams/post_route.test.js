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

// Constants
import { minTeamNameLength, maxTeamNameLength } from "../../data/minMaxLengths.js";

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
describe("the Teams POST route", () => {
  beforeEach(async () => {
    // Remove all teams before each test
    await Team.truncate({ restartIdentity: true, cascade: true });
  });

  describe("adding new teams", () => {
    test("a new team can be added", async () => {
      const team = initialTeams[0];

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length + 1);

      // Assert the name has been properly added
      assert.strictEqual(team.name, response.body.name);
    });

    test("only an admin can add a new team", async () => {
      const team = initialTeams[0];

      // Login as a non-admin user
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: initialUsers[1].username,
          password: initialUsers[1].password,
        })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

      // Assert an error message is present within the response
      assert.strictEqual(response.body.error, "Operation not allowed");
    });

    test("the name field is required", async () => {
      const team = {
        ...initialTeams[0],
        name: undefined
      };

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

      // Assert an error message is present within the response
      assert.ok(response.body.error.includes("Name is required"));
    });

    test("an empty string should return a proper error message", async () => {
      const team = {
        ...initialTeams[0],
        name: ""
      };

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

      // Assert an error message is present within the response
      assert.ok(response.body.error.includes("Name is required"));
      assert.ok(response.body.error.includes(`Name must be between ${minTeamNameLength} and ${maxTeamNameLength} chars long`));
    });

    test("a name shorter than the min length should return a proper error message", async () => {
      const team = {
        ...initialTeams[0],
        name: "T"
      };

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

      // Assert an error message is present within the response
      assert.ok(response.body.error.includes(`Name must be between ${minTeamNameLength} and ${maxTeamNameLength} chars long`));
    });

    test("a name longer than the max length should return a proper error message", async () => {
      const team = {
        ...initialTeams[0],
        name: "A very long team name designed to surpass the maximum allowed length value for the team post route"
      };

      // Store the initial amount of teams
      const initialAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post("/api/teams")
        .send(team)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const currentAmount = await api.get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount has increased
      assert.strictEqual(currentAmount.body.length, initialAmount.body.length);

      // Assert an error message is present within the response
      assert.ok(response.body.error.includes(`Name must be between ${minTeamNameLength} and ${maxTeamNameLength} chars long`));
    });
  });

  describe("adding users to teams", () => {
    beforeEach(async () => {
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

    test("an user can be added to a team", async () => {
      // Fetch the currently logged in admin user
      const user = initialUsers[0];

      // Store the original team data
      const originalTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add the user to a team
      const response = await api
        .post("/api/teams/1/users")
        .send({ username: user.username })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      // Store the current team data
      const currentTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the number of users on the team has increased
      assert.strictEqual(currentTeam.body.users.length, originalTeam.body.users.length + 1);

      // Assert the response message has the correct data on it
      assert.strictEqual(response.body.message, `${user.name} was added to "${originalTeam.body.name}"`);

      // Assert the user is present on the team's user list
      assert.strictEqual(currentTeam.body.users[0].name, user.name);
    });

    test("multiple users can be added into a team", async () => {
      // Store the original team data
      const originalTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add each user to the team
      for (const user of initialUsers) {
        const response = await api
          .post("/api/teams/1/users")
          .send({ username: user.username })
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        // Assert the response message has the correct data on it
        assert.strictEqual(response.body.message, `${user.name} was added to "${originalTeam.body.name}"`);
      }

      // Store the current team data
      const currentTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the number of users on the team matches the same amount of initial users
      assert.strictEqual(currentTeam.body.users.length, originalTeam.body.users.length + initialUsers.length);

      // Assert each user is present on the team's user list
      for (const user of initialUsers) {
        assert.ok(currentTeam.body.users.some((listItem) => {
          return listItem.name === user.name;
        }));
      }
    });

    test("the same user can be added to multiple teams", async () => {
      const user = initialUsers[0];

      // Stores all the available teams
      const originalTeams = await api
        .get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add each user to the team
      for (const team of originalTeams.body) {
        const response = await api
          .post(`/api/teams/${team.id}/users`)
          .send({ username: user.username })
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(201)
          .expect("Content-Type", /application\/json/);

        // Assert the response message has the correct data on it
        assert.strictEqual(response.body.message, `${user.name} was added to "${team.name}"`);
      }

      // Stores the current teams data
      const currentTeams = await api
        .get("/api/teams")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Assert the user is present on each team
      for (const team of currentTeams.body) {
        assert.ok(team.users.some((listItem) => {
          return listItem.name === user.name;
        }));
      }
    });

    test("adding a non-existing user to a team should return a proper status code", async () => {
      // Store the original team data
      const originalTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add the invalid user to a team
      await api
        .post("/api/teams/1/users")
        .send({ username: "invalid_user@email.com" })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      // Store the current team data
      const currentTeam = await api.get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the number of users on the team has not changed
      assert.strictEqual(currentTeam.body.users.length, originalTeam.body.users.length);
    });

    test("adding a valid user to a non-existing team should return a proper status code", async () => {
      // Get the currently logged in admin user
      const user = await api
        .get("/api/users/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add the user to an invalid team
      await api
        .post("/api/teams/0/users")
        .send({ username: user.body.username })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      // Get the user current data
      const currentUser = await api
        .get("/api/users/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Assert the user has not been added into any teams
      assert.strictEqual(currentUser.body.teams.length, user.body.teams.length);
    });

    test("only an admin can add an user to a team", async () => {
      // Get an user to be added
      const user = initialTeams[0];

      // Login as a non-admin user
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: initialUsers[1].username,
          password: initialUsers[1].password,
        })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Store the original team data
      const originalTeam = await api
        .get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Add a new team
      const response = await api
        .post(`/api/teams/${originalTeam.body.id}/users`)
        .send({ username: user.username })
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      // Get the current team data
      const currentTeam = await api
        .get("/api/teams/1")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Confirm the total amount of users inside the team has not changed
      assert.strictEqual(currentTeam.body.users.length, originalTeam.body.users.length);

      // Assert an error message is present within the response
      assert.strictEqual(response.body.error, "Operation not allowed");
    });
  });
});

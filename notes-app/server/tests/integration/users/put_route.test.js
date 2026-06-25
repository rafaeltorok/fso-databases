/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes app
import app from "../../../src/app.js";

// Models
import { User } from "../../../src/models/index.js";
import initialUsers from "../../data/initialUsers.js";

// Constants
let adminToken;

const api = supertest(app);

// Reset all data on the database tables
before(async () => {
  await setupDb();
  await api.post("/api/reset");
});

// Close the database connection after all tests have been finished
after(async () => {
  await dbCleanup();
});

// Tests
describe("the Users PUT route", () => {
  beforeEach(async () => {
    // Remove all users before each test
    await User.truncate({ restartIdentity: true, cascade: true });

    // Create an admin user
    const adminData = initialUsers[0];

    await api
      .post("/api/users")
      .send(adminData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

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

    // Create a new user to be updated
    const userData = initialUsers[1];

    await api
      .post("/api/users")
      .send(userData)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("an user can be disabled", async () => {
    // Get an user to be disabled
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send({ disabled: true })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been disabled
    assert.strictEqual(putResponse.body.disabled, true);
  });

  test("a disabled user can be re-enabled", async () => {
    // Get an user to be disabled
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    let putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send({ disabled: true })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been disabled
    assert.strictEqual(putResponse.body.disabled, true);

    // Enable the user
    putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send({ disabled: false })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been re-enabled
    assert.strictEqual(putResponse.body.disabled, false);
  });

  test("other parameters should be ignored", async () => {
    const updateData = {
      username: "newusername@example.com",
      name: "New name",
      password: "newpassword",
      disabled: true,
    };

    // Get an user to be disabled
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    let putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send(updateData)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been disabled
    assert.strictEqual(putResponse.body.disabled, true);

    // Remove all unnecessary field from the original object
    const { id, username, name, createdAt, admin, ...otherFields } =
      getResponse.body;

    // Confirm only the disabled field has changed
    assert.deepStrictEqual(putResponse.body, {
      id,
      username,
      name,
      createdAt,
      admin,
      disabled: putResponse.body.disabled,
      updatedAt: putResponse.body.updatedAt,
    });
    assert.notStrictEqual(putResponse.body, getResponse.body);
  });

  test("the updateAt field should be updated after a successful request", async () => {
    // Get an user to be disabled
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send({ disabled: true })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been disabled
    assert.strictEqual(putResponse.body.disabled, true);

    // Remove all unnecessary fields from the response
    const { id, username, name, createdAt, admin, ...otherFields } =
      getResponse.body;

    // Confirm the updateAt field has been updated
    assert.deepStrictEqual(putResponse.body, {
      id,
      username,
      name,
      createdAt,
      admin,
      disabled: putResponse.body.disabled,
      updatedAt: putResponse.body.updatedAt,
    });
    assert.notStrictEqual(
      putResponse.body.updatedAt,
      getResponse.body.updatedAt,
    );
  });

  test("the createdAt field should not be updated", async () => {
    // Get an user to be disabled
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.username}`)
      .send({ disabled: true })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the user has been disabled
    assert.strictEqual(putResponse.body.disabled, true);

    // Confirm the createAt field has not changed
    assert.strictEqual(putResponse.body.createdAt, getResponse.body.createdAt);
  });

  test("a non-boolean value for the disabled field should return a proper error message", async () => {
    // Get an user to be disabled
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${originalUserData.body.username}`)
      .send({ disabled: "true" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Confirm the error message is within the response
    assert.strictEqual(
      putResponse.body.error,
      "The disabled field must be either true or false",
    );

    const currentUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the disabled field has not changed
    assert.strictEqual(
      originalUserData.body.disabled,
      currentUserData.body.disabled,
    );

    // Assert the updatedAt field has not changed
    assert.strictEqual(
      originalUserData.body.updatedAt,
      currentUserData.body.updatedAt,
    );
  });

  test("an undefined parameter should return a proper error message", async () => {
    // Get an user to be disabled
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${originalUserData.body.username}`)
      .send({})
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Confirm the error message is within the response
    assert.strictEqual(
      putResponse.body.error,
      "The disabled field must be either true or false",
    );

    const currentUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the disabled field has not changed
    assert.strictEqual(
      originalUserData.body.disabled,
      currentUserData.body.disabled,
    );

    // Assert the updatedAt field has not changed
    assert.strictEqual(
      originalUserData.body.updatedAt,
      currentUserData.body.updatedAt,
    );
  });

  test("only an admin can disable or enable another user", async () => {
    const adminUser = await User.findOne({
      where: {
        username: initialUsers[0].username,
      },
    });

    // Set the admin status on the database
    adminUser.admin = false;
    await adminUser.save();

    // Login as the non-admin user
    const loginResponse = await api
      .post("/api/login")
      .send({
        username: initialUsers[0].username,
        password: initialUsers[0].password,
      })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Get an user to be disabled
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Disable the user
    const putResponse = await api
      .put(`/api/users/${originalUserData.body.username}`)
      .send({})
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Confirm the error message is within the response
    assert.strictEqual(putResponse.body.error, "Operation not allowed");

    const currentUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the disabled field has not changed
    assert.strictEqual(
      originalUserData.body.disabled,
      currentUserData.body.disabled,
    );
  });
});

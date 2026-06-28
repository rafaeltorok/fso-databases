// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes app
import app from "../../../src/app.js";

// Models
import { Note } from "../../../src/models/index.js";
import initialNotes from "../../data/initialNotes.js";
import initialUsers from "../../data/initialUsers.js";

const api = supertest(app);

// Global variables
let loggedUser;

// Helper functions
async function getAmount(route) {
  const getResponse = await api.get(`/api/${route}`);
  return getResponse.body.length;
}

// Reset all data on the database tables
before(async () => {
  await setupDb();
  await api.post("/api/reset");

  // Create a new user for the tests
  const user = initialUsers[0];

  await api
    .post("/api/users")
    .send(user)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  // Log in the user and store the auth token
  const loginResponse = await api
    .post("/api/login")
    .send({ username: user.username, password: user.password })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  loggedUser = loginResponse.body;
});

// Close the database connection after all tests have been finished
after(async () => {
  await dbCleanup();
});

// Tests
describe("the Notes DELETE route", () => {
  beforeEach(async () => {
    // Remove all notes before each test
    await Note.truncate({ restartIdentity: true, cascade: true });
  });

  test("a note can be removed", async () => {
    const note = initialNotes[0];

    // Store the initial notes length
    const initialAmount = await getAmount("notes");

    // Add a note to be removed
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the notes length has increased
    let currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Remove the note
    await api
      .delete(`/api/notes/${Number(postResponse.body.id)}`)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(204);

    // Assert the notes length has decreased
    currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a user cannot remove another user's note", async () => {
    const note = initialNotes[0];

    // Add a note to be removed
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Store the initial notes length
    const initialAmount = await getAmount("notes");

    // Create a new user
    const anotherUser = initialUsers[1];

    await api
      .post("/api/users")
      .send(anotherUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Log in the user and store the auth token
    const loginResponse = await api
      .post("/api/login")
      .send({ username: anotherUser.username, password: anotherUser.password })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the note
    const deleteResponse = await api
      .delete(`/api/notes/${Number(postResponse.body.id)}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(
      deleteResponse.body.error,
      "Only the note owner can remove it",
    );

    // Assert no notes have been removed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a non-existing id should return a proper status code", async () => {
    await api
      .delete("/api/notes/0")
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(404);
  });

  test("an invalid ID format should return a proper error message", async () => {
    const response = await api
      .delete("/api/notes/my_note")
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.ok(response.body.error.includes("Invalid ID format"));
  });

  test("a negative ID should return a proper error message", async () => {
    const response = await api
      .delete("/api/notes/-1")
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.ok(response.body.error.includes("Invalid ID format"));
  });

  test("a non-authorized user should not be able to delete a note", async () => {
    const note = initialNotes[0];

    // Store the initial notes length
    const initialAmount = await getAmount("notes");

    // Add a note to be removed
    await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the notes length has increased
    let currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Try to delete a note
    const response = await api
      .delete("/api/notes/1")
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(response.body.error, "token missing");

    // Confirm the notes length has not changed
    currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount + 1, currentAmount);
  });
});

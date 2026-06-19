/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes app
import app from "../../../src/app.js";

// Models
import { Note, User } from "../../../src/models/index.js";

// Test data
import initialNotes from "../../data/initialNotes.js";
import initialUsers from "../../data/initialUsers.js";

const api = supertest(app);

// Global variables
let loggedUser;

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
describe("the Notes GET route", () => {
  beforeEach(async () => {
    // Remove all notes before each test
    await Note.truncate({ restartIdentity: true, cascade: true });
    await User.truncate({ restartIdentity: true, cascade: true });

    // Add a new user
    const user = initialUsers[0];
    await api
      .post("/api/users")
      .send(user)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Log in the user
    const loginResponse = await api
      .post("/api/login")
      .send({ username: user.username, password: user.password })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    loggedUser = loginResponse.body;

    // Stores all initial notes into the database
    for (const note of initialNotes) {
      await api
        .post("/api/notes")
        .send(note)
        .set("Authorization", `Bearer ${loggedUser.token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }
  });

  test("notes are returned as json", async () => {
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all notes are returned", async () => {
    const response = await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the correct total number of notes
    assert.strictEqual(response.body.length, initialNotes.length);
  });

  test("all notes should contain the name of the user who added it", async () => {
    // Get all available notes
    const response = await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert each note contains the respective user's name
    for (const note of response.body) {
      assert.strictEqual(note.user.name, loggedUser.name);
    }
  });

  test("fetching a single note should also contain the user's name", async () => {
    // Get the first note from the initial list
    const noteToView = initialNotes[0];

    const response = await api
      .get("/api/notes/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the id and date fields from the note
    const { id, date, ...otherFields } = response.body;

    // Assert the data is correct
    assert.deepStrictEqual(otherFields, {
      ...noteToView,
      user: { name: loggedUser.name },
    });
  });

  test("a note can be fetch through its id value", async () => {
    // Get the first note from the initial list
    const noteToView = initialNotes[0];

    const response = await api
      .get("/api/notes/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the id, user and date fields from the note
    const { id, user, date, ...otherFields } = response.body;

    // Assert the data is correct
    assert.deepStrictEqual(otherFields, noteToView);
  });

  test("a non-existing id should return a proper status code", async () => {
    await api.get("/api/notes/0").expect(404);
  });

  test("an empty notes list should be properly returned", async () => {
    // Empty the table before the test
    await Note.truncate({ restartIdentity: true, cascade: true });

    const response = await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body, []);
  });

  test("the date field should be present within a note", async () => {
    const response = await api
      .get("/api/notes/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the date field is present
    assert.ok("date" in response.body);
  });
});

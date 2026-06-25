/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes List app
import app from "../../../src/app.js";

// Models
import Note from "../../../src/models/note.js";
import initialNotes from "../../data/initialNotes.js";
import initialUsers from "../../data/initialUsers.js";

const api = supertest(app);

// Global variables
let postResponse;
let loggedUser;

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
describe("the Notes PUT route", () => {
  beforeEach(async () => {
    // Remove all notes before each test
    await Note.truncate({ restartIdentity: true, cascade: true });

    // Create a new note to be updated
    const noteData = initialNotes[0];

    postResponse = await api
      .post("/api/notes")
      .send(noteData)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("the importance can be updated", async () => {
    // Get the first note to test
    const note = await api
      .get("/api/notes/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update the importance
    await api
      .put(`/api/notes/${postResponse.body.id}`)
      .send({ important: !note.body.important })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the importance has been correctly updated
    const updatedNote = await api.get(`/api/notes/${postResponse.body.id}`);
    assert.strictEqual(updatedNote.body.important, !note.body.important);
  });

  test("other fields should be ignored when updating", async () => {
    const updatedData = {
      content: "The note has been changed",
      important: !postResponse.body.important,
    };

    // Update the importance
    await api
      .put(`/api/notes/${postResponse.body.id}`)
      .send(updatedData)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert only the important field has been updated
    const updatedNote = await api.get(`/api/notes/${postResponse.body.id}`);

    // Remove the userId and user fields
    const { userId, ...postResponseFields } = postResponse.body;
    const { user, ...updatedNoteFields } = updatedNote.body;

    assert.deepStrictEqual(updatedNoteFields, {
      ...postResponseFields,
      important: !postResponse.body.important,
    });
  });

  test("an empty value should not modify the note", async () => {
    const originalNote = await api.get(`/api/notes/${postResponse.body.id}`);

    // Update the importance
    await api
      .put(`/api/notes/${postResponse.body.id}`)
      .send({})
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the original importance has not been updated
    const currentNote = await api.get(`/api/notes/${postResponse.body.id}`);
    assert.strictEqual(currentNote.body.important, originalNote.body.important);
  });

  test("a non-existing note should return a proper status code", async () => {
    await api
      .put("/api/notes/0")
      .send({ important: true })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(404);
  });

  test("a non-authorized user should not be able to update a note", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/notes/${postResponse.body.id}`)
      .send({ important: true })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "token missing");

    // Assert the original likes counter has not been updated
    const originalNote = await api.get(`/api/notes/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalNote.body.likes);
  });
});

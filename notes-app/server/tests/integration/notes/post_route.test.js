/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "../setup.js";

// Notes List app
import app from "../../../src/app.js";

// Models
import { Note } from "../../../src/models/index.js";
import initialNotes from "../../data/initialNotes.js";
import initialUsers from "../../data/initialUsers.js";

// Constants
import {
  minContentLength,
  maxContentLength,
} from "../../data/minMaxLengths.js";

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
describe("the Notes POST route", () => {
  beforeEach(async () => {
    // Remove all notes before each test
    await Note.truncate({ restartIdentity: true, cascade: true });
  });

  test("a new note can be added", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("notes");

    // POST a new note
    const response = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Get the current amount of objects
    const currentAmount = await getAmount("notes");

    // Assert the number of objects has increased
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Remove the id, userId and date fields from the response
    const { id, userId, date, ...responseFields } = response.body;

    // Assert all fields are correct
    assert.deepStrictEqual(note, responseFields);
  });

  test("the user id who created the note should be within the response", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("notes");

    // POST a new note
    const response = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Get the current amount of objects
    const currentAmount = await getAmount("notes");

    // Assert the number of objects has increased
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Assert the user's id is present
    assert.ok("userId" in response.body);
  });

  test("the user's name who created the note should be present", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("notes");

    // POST a new note
    const response = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Get the current amount of objects
    const currentAmount = await getAmount("notes");

    // Get the newly added note's information
    const getResponse = await api
      .get(`/api/notes/${response.body.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the number of objects has increased
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Assert the user's name is correct
    assert.strictEqual(getResponse.body.user.name, loggedUser.name);
  });

  test("the date should be present withing the new note added", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("notes");

    // POST a new note
    const response = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Get the current amount of objects
    const currentAmount = await getAmount("notes");

    // Assert the number of objects has increased
    assert.strictEqual(initialAmount + 1, currentAmount);

    // Assert the date field is present
    assert.ok("date" in response.body);
  });

  test("the important field should default to false when not present", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // Remove the important field
    const { important, ...otherFields } = note;

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(otherFields)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Assert the total number of objects has increased
    const currentAmount = await getAmount("notes");
    assert.strictEqual(currentAmount, initialAmount + 1);

    // Assert the importance is set to false
    assert.strictEqual(postResponse.body.important, false);
  });

  test("missing the content field should return a proper error message", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // Remove the content field
    const { content, ...otherFields } = note;

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(otherFields)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert.ok(postResponse.body.error.includes("Note's content is required"));

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a non-boolean importance value should return a proper error message", async () => {
    // Get a note from the initial list
    const note = {
      ...initialNotes[0],
      important: "true",
    };

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert.ok(
      postResponse.body.error.includes(
        "The important field must be either true or false",
      ),
    );

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a non-authorized user should not be able to add a new note", async () => {
    // Get a note from the initial list
    const note = initialNotes[0];

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert.strictEqual(postResponse.body.error, "token missing");

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("the content cannot be below the min length value", async () => {
    const note = {
      ...initialNotes[0],
      content: "a",
    };

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert.strictEqual(
      postResponse.body.error,
      `The note's content must be between ${minContentLength} and ${maxContentLength} chars long`,
    );

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("the title cannot exceed the max length value", async () => {
    const note = {
      ...initialNotes[0],
      content: "A very long note that exceeds the max length value for sure",
    };

    // Get the initial number of notes
    const initialAmount = await getAmount("notes");

    // POST a new note
    const postResponse = await api
      .post("/api/notes")
      .send(note)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert.strictEqual(
      postResponse.body.error,
      `The note's content must be between ${minContentLength} and ${maxContentLength} chars long`,
    );

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("notes");
    assert.strictEqual(initialAmount, currentAmount);
  });
});

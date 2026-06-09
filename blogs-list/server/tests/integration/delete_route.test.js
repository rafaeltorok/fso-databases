/* eslint-disable no-unused-vars */

// Test dependencies
import { test, beforeEach, describe, before, after } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import { setupDb, dbCleanup } from "./setup.js";

// Blogs List app
import app from "../../src/app.js";

// Models
import Blog from "../../src/models/blog.js";
import User from "../../src/models/user.js";
import initialBlogs from "../data/initialBlogs.js";
import initialUsers from "../data/initialUsers.js";

const api = supertest(app);

// Helper functions
async function getAmount(route) {
  const getResponse = await api.get(`/api/${route}`);
  return getResponse.body.length;
}

// Reset all data on the database tables
before(async () => {
  await setupDb();
  await api.post("/api/tests/reset");
});

// Close the database connection after all tests have been finished
after(async () => {
  await dbCleanup();
});

// Tests
describe("the Blogs DELETE route", () => {
  beforeEach(async () => {
    // Remove all blogs before each test
    await Blog.truncate({ restartIdentity: true });
  });

  test("a blog can be removed", async () => {
    const blog = initialBlogs[0];

    // Store the initial blogs length
    const initialAmount = await getAmount("blogs");

    // Add a blog to be removed
    const postResponse = await api
      .post("/api/blogs")
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the blogs length has increased
    let currentAmount = await getAmount("blogs");
    assert.strictEqual((initialAmount + 1), currentAmount);

    // Remove the blog
    await api
      .delete(`/api/blogs/${Number(postResponse.body.id)}`)
      .expect(204);

    // Assert the blogs length has decreased
    currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a non-existing id should return a proper status code", async () => {
    await api
      .delete("/api/blogs/0")
      .expect(404);
  });

  test("an invalid ID format should return a proper error message", async () => {
    const response = await api
      .delete("/api/blogs/my_blog")
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(response.body.error, "Invalid ID format");
  });

  test("a negative ID should return a proper error message", async () => {
    const response = await api
      .delete("/api/blogs/-1")
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(response.body.error, "Invalid ID format");
  });
});

describe("the Users DELETE route", () => {
  beforeEach(async () => {
    // Remove all users before each test
    await User.truncate({ restartIdentity: true });
  });

  test("an user can be removed", async () => {
    const user = initialUsers[0];

    // Store the initial blogs length
    const initialAmount = await getAmount("users");

    // Add a blog to be removed
    const postResponse = await api
      .post("/api/users")
      .send(user)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Confirm the users length has increased
    let currentAmount = await getAmount("users");
    assert.strictEqual((initialAmount + 1), currentAmount);

    // Remove the user
    await api
      .delete(`/api/users/${Number(postResponse.body.id)}`)
      .expect(204);

    // Assert the users length has decreased
    currentAmount = await getAmount("users");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a non-existing id should return a proper status code", async () => {
    await api
      .delete("/api/users/0")
      .expect(404);
  });

  test("an invalid ID format should return a proper error message", async () => {
    const response = await api
      .delete("/api/users/newuser")
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(response.body.error, "Invalid ID format");
  });

  test("a negative ID should return a proper error message", async () => {
    const response = await api
      .delete("/api/users/-1")
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(response.body.error, "Invalid ID format");
  });
});

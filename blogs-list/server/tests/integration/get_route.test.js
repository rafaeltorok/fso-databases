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

// Test data
import initialBlogs from "../data/initialBlogs.js";
import initialUsers from "../data/initialUsers.js";

const api = supertest(app);

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
describe("the Blogs GET route", () => {
  beforeEach(async () => {
    // Remove all blogs before each test
    await Blog.truncate({ restartIdentity: true });

    // Stores all initial blogs into the database
    await Blog.bulkCreate(initialBlogs);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the correct total number of blogs
    assert.strictEqual(response.body.length, initialBlogs.length);
  });

  test("a blog can be fetch through its id value", async () => {
    // Get the first blog from the initial list
    const blogToView = initialBlogs[0];

    const response = await api
      .get("/api/blogs/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the id from the blog
    const { id, ...otherFields } = response.body;

    // Assert the data is correct
    assert.deepStrictEqual(otherFields, blogToView);
  });

  test("a non-existing id should return a proper error message", async () => {
    await api
      .get("/api/blogs/0")
      .expect(404);
  });

  test("an empty blogs list should be properly returned", async () => {
    // Empty the table before the test
    await Blog.truncate();

    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body, []);
  });
});

describe("the Users GET route", () => {
  beforeEach(async () => {
    // Remove all users before each test
    await User.truncate({ restartIdentity: true });

    // Stores all initial users into the database
    await User.bulkCreate(initialUsers);
  });

  test("users are returned as json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all users are returned", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the correct total number of users
    assert.strictEqual(response.body.length, initialUsers.length);
  });

  test("an user can be fetch through its id value", async () => {
    // Get the first user from the initial list
    const userToView = initialUsers[0];

    const response = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Remove the id from the user
    const { id, ...otherFields } = response.body;

    // Remove the password field form the original user
    const { password, ...userFields } = userToView;

    // Assert the data is correct
    assert.deepStrictEqual(otherFields, userFields);
  });

  test("a non-existing id should return a proper error message", async () => {
    await api
      .get("/api/users/0")
      .expect(404);
  });

  test("the password field is not returned when fetching all users", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const users = response.body;

    for (const user of users) {
      assert.ok(!("password" in user));
    }
  });

  test("the password field is not returned when fetching a single user", async () => {
    const response = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const user = response.body;

    assert.ok(!("password" in user));
  });

  test("an empty users list should be properly returned", async () => {
    // Empty the table before the test
    await User.truncate();

    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body, []);
  });
});

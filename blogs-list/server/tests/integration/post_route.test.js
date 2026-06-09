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
describe("the Blogs POST route", () => {
  beforeEach(async () => {
    // Remove all blogs before each test
    await Blog.truncate({ restartIdentity: true });
  });

  test("a new blog can be added", async () => {
    // Get a blog from the initial list
    const blog = initialBlogs[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("blogs");

    // POST a new blog
    const response = await api
      .post("/api/blogs")
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Get the current amount of objects
    const currentAmount = await getAmount("blogs");

    // Assert the number of objects has increased
    assert.strictEqual((initialAmount + 1), currentAmount);

    // Remove the id field from the response
    const { id, ...responseFields } = response.body;

    // Assert all fields are correct
    assert.deepStrictEqual(blog, responseFields);
  });

  test("missing the title field should return a proper error message", async () => {
    // Get a blog from the initial list
    const blog = initialBlogs[0];

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // Remove the title field
    const { title, ...otherFields } = blog;

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert(postResponse.body.error, /missing required fields/i);

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("missing the author field should return a proper error message", async () => {
    // Get a blog from the initial list
    const blog = initialBlogs[0];

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // Remove the author field
    const { author, ...otherFields } = blog;

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert(postResponse.body.error, /missing required fields/i);

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("missing the url field should return a proper error message", async () => {
    // Get a blog from the initial list
    const blog = initialBlogs[0];

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // Remove the url field
    const { url, ...otherFields } = blog;

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert(postResponse.body.error, /missing required fields/i);

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("the likes field should default to 0 when not present", async () => {
    // Get a blog from the initial list
    const blog = initialBlogs[0];

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // Remove the likes field
    const { likes, ...otherFields } = blog;

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(otherFields)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Assert the total number of objects has increased
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(currentAmount, (initialAmount + 1));

    // Assert the default amount of likes is correct
    assert.strictEqual(postResponse.body.likes, 0);
  });

  test("a non-numeric amount of likes should return a proper error message", async () => {
    // Get a blog from the initial list
    const blog = {
      ...initialBlogs[0],
      likes: "likes"
    };

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(blog)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert(postResponse.body.error, /invalid number of likes/i);

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("a negative amount of likes should return a proper error message", async () => {
    // Get a blog from the initial list
    const blog = {
      ...initialBlogs[0],
      likes: -1
    };

    // Get the initial number of blogs
    const initialAmount = await getAmount("blogs");

    // POST a new blog
    const postResponse = await api
      .post("/api/blogs")
      .send(blog)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the error response message
    assert(postResponse.body.error, /invalid number of likes/i);

    // Assert the total number of objects has not changed
    const currentAmount = await getAmount("blogs");
    assert.strictEqual(initialAmount, currentAmount);
  });
});

describe("the Users POST route", () => {
  beforeEach(async () => {
    // Remove all users before each test
    await User.truncate({ restartIdentity: true });
  });

  test("a new user can be added", async () => {
    const user = initialUsers[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("users");

    // Create a new user
    const response = await api
      .post("/api/users")
      .send(user)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // Remove the password from the original object
    const { password, ...otherFields } = user;

    // Remove the id from the returned object
    const { id, ...postFields } = response.body;

    // Assert the object data is correct
    assert.deepStrictEqual(otherFields, postFields);

    // Get the current amount of objects
    const currentAmount = await getAmount("users");

    // Assert the number of objects has increased
    assert.strictEqual((initialAmount + 1), currentAmount);
  });

  test("missing the username field should return a proper error message", async () => {
    // Remove the username field
    const { username, ...otherFields } = initialUsers[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("users");

    // Create the user
    const response = await api
      .post("/api/users")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the response error message
    assert(response.body.error, /missing required fields/i);

    // Assert the number of objects has not changed
    const currentAmount = await getAmount("users");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("missing the name field should return a proper error message", async () => {
    // Remove the name field
    const { name, ...otherFields } = initialUsers[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("users");

    // Create the user
    const response = await api
      .post("/api/users")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the response error message
    assert(response.body.error, /missing required fields/i);

    // Assert the number of objects has not changed
    const currentAmount = await getAmount("users");
    assert.strictEqual(initialAmount, currentAmount);
  });

  test("missing the password field should return a proper error message", async () => {
    // Remove the password field
    const { password, ...otherFields } = initialUsers[0];

    // Get the initial amount of objects
    const initialAmount = await getAmount("users");

    // Create the user
    const response = await api
      .post("/api/users")
      .send(otherFields)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert the response error message
    assert(response.body.error, /missing required fields/i);

    // Assert the number of objects has not changed
    const currentAmount = await getAmount("users");
    assert.strictEqual(initialAmount, currentAmount);
  });
});

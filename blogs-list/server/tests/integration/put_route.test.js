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

// Global variables
let postResponse;
let loggedUser;

// Reset all data on the database tables
before(async () => {
  await setupDb();
  await api.post("/api/tests/reset");

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
describe("the Blogs PUT route", () => {
  beforeEach(async () => {
    // Remove all blogs before each test
    await Blog.truncate({ restartIdentity: true, cascade: true });

    // Create a new blog to be updated
    const blogData = initialBlogs[0];

    postResponse = await api
      .post("/api/blogs")
      .send(blogData)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("the amount of likes can be updated", async () => {
    // Update the amount of likes
    await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: 1000 })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the likes counter has been correctly updated
    const updatedBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(updatedBlog.body.likes, 1000);
  });

  test("zero is a valid amount", async () => {
    // Update the amount of likes
    await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: 0 })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the likes counter has been correctly updated
    const updatedBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(updatedBlog.body.likes, 0);
  });

  test("other fields should be ignored when updating", async () => {
    const updatedData = {
      "title": "New title",
      "author": "New author",
      "url": "http://newurl.com",
      "likes": 1
    };

    // Update the amount of likes
    await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send(updatedData)
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert only the likes counter has been updated
    const updatedBlog = await api.get(`/api/blogs/${postResponse.body.id}`);

    // Remove the userId and user fields
    const { userId, ...postResponseFields } = postResponse.body;
    const { user, ...updatedBlogFields } = updatedBlog.body;

    assert.deepStrictEqual(updatedBlogFields, { ...postResponseFields, likes: 1 });
  });

  test("a negative amount should return a proper error message", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: -1 })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid number of likes");

    // Assert the original likes counter has not been updated
    const originalBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalBlog.body.likes);
  });

  test("a non-numeric amount should return a proper error message", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: "likes" })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid number of likes");

    // Assert the original likes counter has not been updated
    const originalBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalBlog.body.likes);
  });

  test("an infinite amount should return a proper error message", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: Infinity })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid number of likes");

    // Assert the original likes counter has not been updated
    const originalBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalBlog.body.likes);
  });

  test("an empty amount should return a proper error message", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({})
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid number of likes");

    // Assert the original likes counter has not been updated
    const originalBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalBlog.body.likes);
  });

  test("a non-existing blog should return a proper status code", async () => {
    await api
      .put("/api/blogs/0")
      .send({ likes: 1 })
      .set("Authorization", `Bearer ${loggedUser.token}`)
      .expect(404);
  });

  test("a non-authorized user should not be able to update a blog", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: 1 })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    // Assert an error message is within the response
    assert.strictEqual(putResponse.body.error, "token missing");

    // Assert the original likes counter has not been updated
    const originalBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.strictEqual(postResponse.body.likes, originalBlog.body.likes);
  });
});

describe("the Users PUT route", () => {
  beforeEach(async () => {
    // Remove all users before each test
    await User.truncate({ restartIdentity: true, cascade: true });

    // Create a new user to be updated
    const userData = initialUsers[0];

    postResponse = await api
      .post("/api/users")
      .send(userData)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("an user's name can be updated", async () => {
    const newName = "New name";

    // Get an user to be updated
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.id}`)
      .send({ name: newName })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the name has been updated
    assert.strictEqual(putResponse.body.name, newName);
    assert.notStrictEqual(putResponse.body.name, getResponse.body.name);
  });

  test("only the name field should be updated when there are other parameters", async () => {
    const updateData = {
      username: "newusername@example.com",
      name: "New name",
      password: "newpassword"
    };

    // Get an user to be updated
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.id}`)
      .send(updateData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm only the name has been updated
    assert.deepStrictEqual(
      putResponse.body,
      { ...getResponse.body, name: updateData.name, updatedAt: putResponse.body.updatedAt }
    );
    assert.notStrictEqual(putResponse.body, getResponse.body);
  });

  test("the updateAt field should be updated after a successful request", async () => {
    const newName = "New name";

    // Get an user to be updated
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.id}`)
      .send({ name: newName })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the updateAt field has been updated
    assert.deepStrictEqual(
      putResponse.body,
      { ...getResponse.body, name: newName, updatedAt: putResponse.body.updatedAt }
    );
    assert.notStrictEqual(putResponse.body.updatedAt, getResponse.body.updatedAt);
  });

  test("the createdAt field should not be updated", async () => {
    const newName = "New name";

    // Get an user to be updated
    const getResponse = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${getResponse.body.id}`)
      .send({ name: newName })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Confirm the createAt field has not changed
    assert.strictEqual(putResponse.body.createdAt, getResponse.body.createdAt);
  });

  test("an empty name should return a proper error message", async () => {
    const newName = "";

    // Get an user to be updated
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${originalUserData.body.id}`)
      .send({ name: newName })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Confirm the error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid user's name");

    const currentUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the original name has not been changed
    assert.strictEqual(originalUserData.body.name, currentUserData.body.name);

    // Assert the updatedAt field has not changed
    assert.strictEqual(originalUserData.body.updatedAt, currentUserData.body.updatedAt);
  });

  test("an undefined parameter should return a proper error message", async () => {
    // Get an user to be updated
    const originalUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Update an user
    const putResponse = await api
      .put(`/api/users/${originalUserData.body.id}`)
      .send({})
      .expect(400)
      .expect("Content-Type", /application\/json/);

    // Confirm the error message is within the response
    assert.strictEqual(putResponse.body.error, "Invalid user's name");

    const currentUserData = await api
      .get("/api/users/1")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert the original name has not been changed
    assert.strictEqual(originalUserData.body.name, currentUserData.body.name);

    // Assert the updatedAt field has not changed
    assert.strictEqual(originalUserData.body.updatedAt, currentUserData.body.updatedAt);
  });
});

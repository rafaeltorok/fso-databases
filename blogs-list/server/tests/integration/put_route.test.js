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
import initialBlogs from "../data/initialBlogs.js";

const api = supertest(app);

// Global variables
let postResponse;

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
describe("the Blogs PUT route", () => {
  beforeEach(async () => {
    // Remove all blogs before each test
    await Blog.truncate({ restartIdentity: true });

    // Create a new blog to be updated
    const blogData = initialBlogs[0];

    postResponse = await api
      .post("/api/blogs")
      .send(blogData)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("the amount of likes can be updated", async () => {
    // Update the amount of likes
    await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: 1000 })
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
      .expect(200)
      .expect("Content-Type", /application\/json/);

    // Assert only the likes counter has been updated
    const updatedBlog = await api.get(`/api/blogs/${postResponse.body.id}`);
    assert.deepStrictEqual(updatedBlog.body, { ...postResponse.body, likes: 1 });
  });

  test("a negative amount should return a proper error message", async () => {
    // Update the amount of likes
    const putResponse = await api
      .put(`/api/blogs/${postResponse.body.id}`)
      .send({ likes: -1 })
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
      .expect(404);
  });
});

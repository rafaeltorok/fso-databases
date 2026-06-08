// Test dependencies
import { test, after, beforeEach, describe } from "node:test";
import assert from "node:assert";
import supertest from "supertest";
import bcrypt from  "bcrypt";

// Blogs List app
import app from "../../app.js";

// Models
import Blog from "../../models/blog.js";
import User from "../../models/user.js";

// Helper functions
import helper from "./integration/test_helper.js";

const api = supertest(app);

// Tests
describe("the Blogs GET route", () => {
  beforeEach(async () => {
    await Blog.destroy();

    // Stores all initial blogs into the database
    const blogObjects = helper.initialBlogs.map(
      (blog) =>
        new Blog({
          ...blog,
        }),
    );

    await Promise.all(blogObjects.map((blog) => blog.save()));
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(resultBlog.body, blogToView);
  });
});

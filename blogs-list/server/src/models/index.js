import Blog from "./blog.js";
import User from "./user.js";

User.hasMany(Blog, {
  onDelete: "CASCADE"
});
Blog.belongsTo(User);

export { Blog, User };

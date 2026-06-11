import Blog from "./blog.js";
import User from "./user.js";

User.hasMany(Blog);
Blog.belongsTo(User);

export { Blog, User };

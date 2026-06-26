import User from "./user.js";
import Blog from "./blog.js";
import ReadingList from "./readingList.js";

User.hasMany(Blog, {
  onDelete: "CASCADE",
});
Blog.belongsTo(User);

User.belongsToMany(Blog, { through: ReadingList, as: "readings" });
Blog.belongsToMany(User, { through: ReadingList, as: "readers" });

export { Blog, User, ReadingList };

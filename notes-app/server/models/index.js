import Note from "./note.js";
import User from "./user.js";

User.hasMany(Note, {
  onDelete: "CASCADE",
});
Note.belongsTo(User);

export { Note, User };

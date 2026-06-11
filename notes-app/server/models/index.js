import Note from "./note.js";
import User from "./user.js";

User.hasMany(Note);
Note.belongsTo(User);

export { Note, User };

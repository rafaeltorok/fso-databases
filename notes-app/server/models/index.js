import Note from "./note.js";
import User from "./user.js";

User.hasMany(Note);
Note.belongsTo(User);

User.sync({ alter: true });
Note.sync({ alter: true });

export { Note, User };

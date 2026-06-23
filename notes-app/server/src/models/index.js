import Note from "./note.js";
import User from "./user.js";
import Team from "./team.js";
import Membership from "./membership.js";
import UserNotes from "./userNotes.js";

Note.belongsTo(User);
User.hasMany(Note, {
  onDelete: "CASCADE",
});

User.belongsToMany(Team, { through: Membership });
Team.belongsToMany(User, { through: Membership });

User.belongsToMany(Note, { through: UserNotes, as: "marked_notes" });
Note.belongsToMany(User, { through: UserNotes, as: "users_marked" });

export { Note, User, Team, Membership, UserNotes };

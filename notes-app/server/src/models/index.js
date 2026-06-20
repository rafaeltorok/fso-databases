import Note from "./note.js";
import User from "./user.js";
import Team from "./team.js";
import Membership from "./membership.js";

Note.belongsTo(User);
User.hasMany(Note, {
  onDelete: "CASCADE",
});

User.belongsToMany(Team, { through: Membership });
Team.belongsToMany(User, { through: Membership });

export { Note, User, Team, Membership };

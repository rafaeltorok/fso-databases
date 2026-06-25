import { Model, DataTypes } from "sequelize";
import sequelize from "../util/db.js";

export default class UserNotes extends Model {}

UserNotes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    note_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "notes", key: "id" },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "user_notes",
  },
);

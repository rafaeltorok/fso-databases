import { Model, DataTypes } from "sequelize";
import { sequelize } from "../util/db.js";

export default class Note extends Model {}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 32],
          msg: "The note's content must be between 3 and 32 chars long",
        },
        notNull: {
          msg: "Note's content is required",
        }
      }
    },
    important: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "note",
  },
);

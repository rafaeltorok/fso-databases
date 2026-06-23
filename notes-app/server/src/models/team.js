import { Model, DataTypes } from "sequelize";
import sequelize from "../util/db.js";

export default class Team extends Model {}

Team.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 32],
        msg: "Name must be between 3 and 32 chars long",
      },
      notNull: {
        msg: "Name is required",
      },
    },
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: "teams",
});

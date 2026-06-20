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
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: "teams",
});

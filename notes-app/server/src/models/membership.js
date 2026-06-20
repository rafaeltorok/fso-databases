import { Model, DataTypes } from "sequelize";
import sequelize from "../util/db.js";

export default class Membership extends Model {};

Membership.init({
  id: {
    type:  DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "teams", key: "id" },
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: "membership",
});

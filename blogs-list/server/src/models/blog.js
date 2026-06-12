// Sequelize dependencies
import { Model, DataTypes } from "sequelize";
import sequelize from "../utils/connectdb.js";

// Blog model
export default class Blog extends Model {}
Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 32],
          msg: "The title must be at least 5 chars long"
        }
      }
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 32],
          msg: "The author name must be at least 3 chars long"
        }
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Invalid URL format"
        }
      }
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: "The likes counter must be a valid number"
        },
        min: {
          args: [0],
          msg: "The likes amount must be a positive number"
        }
      }
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "blog",
  },
);

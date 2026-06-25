import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.createTable("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid email address",
        },
        len: {
          args: [5, 32],
          msg: "The username must be between 5 and 32 chars long",
        },
        notNull: {
          msg: "Username is required",
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 32],
          msg: "The user's name must be between 3 and 32 chars long",
        },
        notNull: {
          msg: "Name is required",
        },
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.createTable("notes", {
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
        },
      },
    },
    important: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("notes");
  await queryInterface.dropTable("users");
}

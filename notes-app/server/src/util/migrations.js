import sequelize from "./db.js";
import { Umzug, SequelizeStorage } from "umzug";

export default async function runMigrations() {
  const migrator = new Umzug({
    migrations: {
      glob: "migrations/*.js",
    },
    storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

  const migrations = await migrator.up();

  console.log("Migrations up to date", {
    files: migrations.map((mig) => mig.name),
  });
}

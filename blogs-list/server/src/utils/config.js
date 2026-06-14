import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3001;

const DATABASE_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_POSTGRES_URI
    : process.env.POSTGRES_URI;

const SECRET = process.env.SECRET || "secret";

export { PORT, DATABASE_URL, SECRET };

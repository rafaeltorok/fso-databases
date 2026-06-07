import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3001;

const DATABASE_URL = process.env.POSTGRES_URI;

export { PORT, DATABASE_URL };

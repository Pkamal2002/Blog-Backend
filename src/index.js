import { config as configDotenv } from 'dotenv';
import connectDB from "./db/dbConnect.js";


configDotenv({ path: './.env' });



connectDB()
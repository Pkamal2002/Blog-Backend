import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import connectDB from './db/dbConnect.js';
import app from './app.js';

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    });
}).catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);  // Exit the process with an error code
});

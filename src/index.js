import { config as configDotenv } from 'dotenv';
import connectDB from "./db/dbConnect.js";


configDotenv({ path: './.env' });



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(` Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.error('Error connecting to the database:', err);
    process.exit(1);  // Exit the process with an error code
})
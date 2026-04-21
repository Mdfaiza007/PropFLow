import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const startApp = async () => {
    app.listen(PORT, () => {
        console.log(`App is running at http://localhost:${PORT}`);
    });
};

startApp();
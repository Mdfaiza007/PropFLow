import express from "express";


const app = express();

app.use(express.json());


app.get('/ping',function(req,res) {
    res.send('pong');
})
app.use((req,res) => {
    res.status(400).json({
        success: false,
        message: "Route not found"
    });
})

export default app;
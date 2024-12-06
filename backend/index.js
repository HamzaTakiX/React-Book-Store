const express = require("express");
const cors = require("cors"); // Importer cors
const app = express();

const bookRouter = require('./routes/book_routes');
const orderRouter = require("./routes/order.routes");
const customerRouter = require("./routes/customer_routes");

const mongoose = require('mongoose');
require("dotenv").config();

// Middleware pour le parsing des JSON
app.use(express.json());

// Middleware pour activer CORS
app.use(cors());

// Définir les routes
app.use("/api/books", bookRouter);
app.use("/api/orders", orderRouter);
app.use("/api/customers", customerRouter);

// Connexion à la base de données MongoDB
mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(process.env.PORT, () => console.log("Server is running"));
    })
    .catch((err) => {
        console.log(err);
    });


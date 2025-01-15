const express = require("express");
const app = express();
const PORT = 3000;

const mongoose = require("mongoose");

const MONGO_URL = "mongodb+srv://kvlchkp:12344321@cluster0.658oc.mongodb.net/";

app.use(express.json());

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const ordersRouter = require("./routes/orders");
app.use("/orders", ordersRouter);

const itemsRouter = require("./routes/items");
app.use("/items", itemsRouter);

app.listen(PORT, async () => {
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";
import config from "config";
import "./utils/dbConnect.js";

import rootRouter from "./controllers/root/index.js"
import adminRouter from "./controllers/admin/index.js";
import fellowRouter from "./controllers/fellow/index.js";
import instructorRouter from "./controllers/instructor/index.js";

const app = express();
const port = process.env.PORT || config.get("PORT");

app.use(express.json());


app.get("/", (req, res) => {
  res.send("Mat8 GMS server!");
});
app.use("/api", rootRouter);
app.use("/api/admin", adminRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/fellow", fellowRouter);



app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});

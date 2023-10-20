import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import authenticationRoutes from "./routes/authenticationRoutes.js";

const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authenticationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

const app = express();
const PORT = 3001;
app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authenticationRoutes);
app.use("/images", imageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

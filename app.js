import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

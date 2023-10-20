import { Router } from "express";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const loginCreds = req.body;
    console.log(loginCreds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const regCreds = req.body;
    console.log(regCreds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

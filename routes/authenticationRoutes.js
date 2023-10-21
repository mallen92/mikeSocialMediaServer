import { Router } from "express";
import * as authenticationService from "../services/authenticationService.js";
import validateRegistration from "../validation/validateRegistration.js";

const router = Router();

router.post("/register", validateRegistration, async (req, res) => {
  try {
    const newUserObj = req.body;
    const response = await authenticationService.registerUser(newUserObj);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const loginCreds = req.body;
    console.log(loginCreds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

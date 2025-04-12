import express from "express";
// import { signup, login, getUser,getUserCount, getOwnerCount, getAllUser, deleteUserById } from "../controllers/userController.js";
import {register, login, getUserProfile, updateUserProfile} from "../controllers/userController.js"
import {authenticateToken} from "../middleware/jwtAuth.js"

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
// router.get("/getUser", authenticateToken, getUser);
// router.get("/getAllUser", getAllUser)
// router.get("/userCount", getUserCount);
// router.get("/ownerCount", getOwnerCount);
// router.delete("/:userId", deleteUserById)


export default router;
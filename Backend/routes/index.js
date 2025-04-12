import express from "express"
import userRoutes from "./userRoutes.js"
import mentorRoutes from "./mentorRoutes.js"
import messageRoutes from "./messageRoutes.js"
import userProfileRoutes from "./userProfileRoutes.js"

const router =  express.Router();

router.use("/users", userRoutes);
router.use("/mentors", mentorRoutes);
router.use("/messages", messageRoutes);
router.use("/profile", userProfileRoutes);

export default router;
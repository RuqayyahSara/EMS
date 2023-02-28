import express from "express";
import bcrypt from "bcrypt";
import {
  loginValidations,
  errorMiddleware,
} from "../../middlewares/validations/index.js";
import generateToken from "../../utils/generateToken.js";

//Models
import fellowModel from "../../models/Fellows/index.js";
import instructorModel from "../../models/Instructor/index.js";
import adminModel from "../../models/Admin/index.js";

const router = express.Router();

/*
    API --> api/login
    Method --> POST
    Route Type --> Public
    Description --> Login All Users & recieve token
*/
router.post("/login", loginValidations(), errorMiddleware, async (req, res) => {
  try {
    const allowedRoles = ["fellow", "admin", "instructor"].includes(
      req.body.role
    );

    if (!allowedRoles)
      return res.status(401).json({ error: "Invalid Credentials" });

      // Fellows
    if (req.body.role == "fellow") {
      
      let fellowData = await fellowModel.findOne({ email: req.body.email });
      if (!fellowData)
        return res.status(404).json({ error: "Invalid Credentials" });

      if (!fellowData.fellowAccepted.email)
        return res
          .status(400)
          .json({ error: "Please accept the invitation on email" });
      if (!fellowData.fellowAccepted.phone)
        return res
          .status(400)
          .json({ error: "Please accept the invitation on phone" });

      let validPassword = await bcrypt.compare(
        req.body.password,
        fellowData.password
      );
      if (!validPassword)
        return res.status(401).json({ error: "Invalid Credentials" });

      let token = generateToken({
        _id: fellowData._id,
        email: fellowData.email,
        role: fellowData.role,
      });

      return res.status(200).json({ token });
    }

    // Admin
    if (req.body.role == "admin") {
      
      let adminData = await adminModel.findOne({ email: req.body.email });
      if (!adminData)
        return res.status(404).json({ error: "Invalid Credentials" });
      let validPassword = await bcrypt.compare(
        req.body.password,
        adminData.password
      );
      if (!validPassword)
        return res.status(401).json({ error: "Invalid Credentials" });

      let token = generateToken({
        _id: adminData._id,
        email: adminData.email,
        role: adminData.role,
      });
      return res.status(200).json({ token });
    }

    // Instructors
    if (req.body.role == "instructor") {
      let instructorData = await instructorModel.findOne({email : req.body.email});

      if (!instructorData)
        return res.status(404).json({ error: "Invalid Credentials" });

        console.log(instructorData);

      let validPassword = await bcrypt.compare(req.body.password, instructorData.password);

      if (!validPassword)
        return res.status(401).json({ error: "Invalid Credentials" });

      let token = generateToken({
        _id: instructorData._id,
        email: instructorData.email,
        role: instructorData.role,
      });
      return res.status(200).json({ token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Issue" });
  }
});

export default router;

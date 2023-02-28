import express from "express";
import bcrypt from "bcrypt";

import fellowModel from "../../models/Fellows/index.js";
import authMiddleware from "../../middlewares/auth/verifyToken.js";
import randomString from "../../utils/randomString.js";
import sendMail from "../../utils/sendMail.js";
const router = express.Router();

/*
    API End Point : /api/fellow/verify/email/:emailtoken
    Method : GET
    Access Type : Public
    Description: Fellow Accepts Invite on Email if both email and phone are verified login Credentials are generated
*/

router.get("/verify/email/:emailToken", async (req, res) => {
  try {
    let token = req.params.emailToken;
    const fellowData = await fellowModel.findOne({
      "fellowVerifyToken.email": token,
    });
    if (!fellowData)
      return res.status(401).json({ error: "Unauthorized Access" });
    if (fellowData.fellowAccepted.email)
      return res.status(200).json({ success: "Fellow Email already Verified." });
    fellowData.fellowAccepted.email = true;
    if (fellowData.fellowAccepted.email && fellowData.fellowAccepted.phone) {
      let password = randomString(8);
      fellowData.password = await bcrypt.hash(password, 12);
      await fellowData.save();
      res.status(200).json({
        success:
          "Invitation Accepted. Please check your Email for Login Credentials",
      });
      sendMail({
        subject: "Login Credentials - GMS App Solutions",
        to: fellowData.email,
        body: `Hi ${fellowData.name}, <br/>Please Use the Below Given Login Credentials to Login.<br/>
                Email : <b>${fellowData.email}</b>
                Password : <b>${password}</b>
                Thank you <br/>
                Team <br/>
                <b> CS.CODE.IN </b>`,
      });
      return;
    }
    await fellowData.save();
    res
      .status(200)
      .json({ success: "Email Verified, Please Verify your Phone too." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
    API End Point : /api/fellow/verify/phone/:phonetoken
    Method : GET
    Access Type : Public
    Description: Fellow Accepts Invite on phone if both email and phone are verified login Credentials are generated
*/

router.get("/verify/phone/:phoneToken", async (req, res) => {
  try {
    let token = req.params.phoneToken;
    const fellowData = await fellowModel.findOne({
      "fellowVerifyToken.phone": token,
    });
    if (!fellowData)
      return res.status(401).json({ error: "Unauthorized Access" });
    if (fellowData.fellowAccepted.phone)
      return res.status(200).json({ success: "Fellow Phone already Verified. " });
    fellowData.fellowAccepted.phone = true;
    if (fellowData.fellowAccepted.email && fellowData.fellowAccepted.phone) {
      let password = randomString(8);
      fellowData.password = await bcrypt.hash(password, 12);
      await fellowData.save();
      res.status(200).json({
        success:
          "Invitation Accepted. Please check your Email for Login Credentials",
      });
      sendMail({
        subject: "Login Credentials - GMS App Solutions",
        to: fellowData.email,
        body: `Hi ${fellowData.name}, <br/>Please Use the Below Given Login Credentials to Login.<br/>
                Email : <b>${fellowData.email}</b>
                Password : <b>${password}</b>
                Thank you <br/>
                Team <br/>
                <b> CS.CODE.IN </b>`,
      });
      return;
    }
    await fellowData.save();
    res
      .status(200)
      .json({ success: "Phone Verified, Please Verify your Email too." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
    API End Point : /api/fellow/mat/:matNumber
    Method : GET
    Access Type : Private
    Description: Fellow can fetch their MGPA
*/

router.get("/mat/:matNumber", authMiddleware, async (req, res) => {
  try {
    if (req.payload.role != "fellow")
      return res.status(401).json({ error: "Unauthorized access" });
    if (req.params.matNumber < 1 || req.params.matNumber > 12)
      return res.status(404).json({ error: "Invalid Mat number" });

    let fellowData = await fellowModel.findById({ _id: req.payload._id });

    let mat = fellowData.mat.find(
      (every) => every.matNumber == req.params.matNumber
    );
    //Check if there exists the MAT scores or not
    if (!mat)
      return res
        .status(404)
        .json({ error: `MAT ${req.params.matNumber} is yet to be updated` });

    let letterGrade;
    mat = mat.toObject();
    mat.courses = mat.courses.map((ele) => {
      ele.gradePoints == 10
        ? (letterGrade = "O")
        : ele.gradePoints == 9
        ? (letterGrade = "A+")
        : ele.gradePoints == 8
        ? (letterGrade = "A")
        : ele.gradePoints == 7
        ? (letterGrade = "B+")
        : ele.gradePoints == 6
        ? (letterGrade = "B")
        : ele.gradePoints == 5
        ? (letterGrade = "C")
        : (letterGrade = "F");
      return {
        ...ele,
        letterGrade,
      };
    });
    return res.status(200).json({ mat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

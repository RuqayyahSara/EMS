import express from "express";
import mongoose from "mongoose";
import { google } from "googleapis"

import authMiddleware from "../../middlewares/auth/verifyToken.js";
import {
  addMatValidatorRules,
  editMatValidatorRules,
  errorMiddleware,
} from "../../middlewares/validations/index.js";
import fellowModel from "../../models/Fellows/index.js";
import instructorModel from "../../models/Instructor/index.js";

let router = express.Router();

/*
    API --> /api/instructor/mat/:fellow_id
    Access --> Private
    Method --> POST
    Description --> Instructor can enter a fellow's MAT marks
*/

router.get(
  "/mat/:fellow_id/:matNumber",
  authMiddleware,
  addMatValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      let _id = mongoose.Types.ObjectId.isValid(req.params.fellow_id);
      // Checking if Instructor exists
      let instructor = await instructorModel.findById(req.payload._id);
      if (!instructor)
        return res.status(404).json({ error: `Unauthorized access !` });

      // Checking if Student exists
      if (!_id) return res.status(404).json({ error: `Invalid Fellow ID!` });

      let fellowData = await fellowModel.findById(req.params.fellow_id);
      if (!fellowData)
        return res.status(400).json({ error: "Fellow does not exist!" });

      // Checking if MAT number already exists
      if (req.params.matNumber > 12 || req.params.matNumber < 1)
        return res.status(404).json({ error: "Choose Valid MAT Number" })
      // Checking if MAT number already exists
      let matIndex = fellowData.mat.findIndex(
        (ele) => ele.matNumber == req.params.matNumber
      );
      if (matIndex !== -1)
        return res.status(401).json({ error: "Mat Score Already Exist!" });

      const auth = new google.auth.GoogleAuth({
        keyFile: "config/credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
      })
      const client = await auth.getClient()
      const googleSheets = google.sheets({ version: "v4", auth: client })
      const spreadsheetId = "1mevSAXhKVx2h81VLng3AWSz3EYhroxCzMuCczi91le0"


      // Get scores
      let sheetData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${req.params.matNumber}!A3:M8`
      })
      sheetData = sheetData.data.values

      // Get Remarks data array
      let remarks = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${req.params.matNumber}!A12:A22`
      })

      // Get overall impressions array
      let impression = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${req.params.matNumber}!B12:B22`
      })

      // Get remaining reattempts

      let reattempts = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${req.params.matNumber}!C12`
      })

      remarks = remarks.data.values.flat()
      impression = impression.data.values.flat()
      reattempts = reattempts.data.values[0][0]

      sheetData = sheetData.map(e => {
        return {
          courseCode: e[0],
          courseName: e[1],
          credits: +e[2],
          labScores: {
            lab1: +e[3],
            lab2: +e[4],
            lab3: +e[5],
            lab4: +e[6],
          },
          labScoreTotal: null,
          finalCI: {
            CI: +e[7],
            IO: +e[8],
            CE: +e[9]
          },
          finalCITotal: null,
          finalInterview: {
            CI: +e[10],
            IO: +e[11],
            CE: +e[12]
          },
          finalInterviewTotal: null,
          gradePoints: null,
          creditPoints: null,
          totalScore: null
        }
      })

      const finalObj = {}
      finalObj.matNumber = +req.params.matNumber
      finalObj.courses = sheetData
      finalObj.totalCreditPoints = null
      finalObj.totalCredits = null
      finalObj.remarks = remarks
      finalObj.overallImpression = impression
      finalObj.mgpa = null
      finalObj.remainingattempts = +reattempts

      fellowData.mat.push(finalObj);
    
      let mat = fellowData.mat[fellowData.mat.length - 1];

      //Calculating Lab Totals & MAT CI Scores & MAT interview Scores
      //Calculating the Total Score in that Subject & Alloting the Grade Points

      mat.courses.forEach((element) => {
        element.labScoreTotal = Object.values(element.labScores).reduce(
          (a, b) => a + b
        );
        element.finalCITotal = Object.values(element.finalCI).reduce(
          (a, b) => a + b
        );
        element.finalInterviewTotal = Object.values(
          element.finalInterview
        ).reduce((a, b) => a + b);
        element.totalScore =
          element.labScoreTotal +
          element.finalCITotal +
          element.finalInterviewTotal;
        if (element.totalScore >= 90) {
          element.gradePoints = 10;
        } else if (element.totalScore >= 80 && element.totalScore < 90) {
          element.gradePoints = 9;
        } else if (element.totalScore >= 70 && element.totalScore < 80) {
          element.gradePoints = 8;
        } else if (element.totalScore >= 60 && element.totalScore < 70) {
          element.gradePoints = 7;
        } else if (element.totalScore >= 50 && element.totalScore < 60) {
          element.gradePoints = 6;
        } else if (element.totalScore >= 40 && element.totalScore < 50) {
          element.gradePoints = 5;
        } else if (element.totalScore < 40) {
          element.gradePoints = 0;
        }
        element.creditPoints = element.credits * element.gradePoints;
      });
      // Calculate MGPA
      mat.courses.forEach((e) => {
        mat.totalCredits += e.credits;
        mat.totalCreditPoints += e.credits * e.gradePoints;
      });

      mat.mgpa = (mat.totalCreditPoints / mat.totalCredits).toPrecision(3);

      // Calculate CGPA - Return MGPA and MAT credits
      let cgpaScores = fellowData.mat.map((e) => ({
        mgpa: e.mgpa,
        credits: e.totalCredits,
      }));

      let creditsTotal = 0;
      cgpaScores.forEach((e) => {
        creditsTotal += e.mgpa * e.credits;
      });
      let cgpaTotal = cgpaScores.reduce((tot, acc) => tot + acc.credits, 0);
      fellowData.cgpa = (creditsTotal / cgpaTotal).toPrecision(3);

      // calculate class rank
      // cgpa array contains cgpa's of all fellows until that MAT number

      //Saving Fellow DATA
      await fellowData.save();

      let cgpas = await fellowModel.find({});

      cgpas.sort((a, b) => {
        return b.cgpa - a.cgpa;
      });

      await fellowModel.findByIdAndUpdate(cgpas[0]._id, { classRank: 1 });
      for (let i = 1; i < cgpas.length; i++) {
        if (cgpas[i].cgpa == cgpas[i - 1].cgpa)
          await fellowModel.findByIdAndUpdate(cgpas[i]._id, {
            classRank: cgpas[i - 1].classRank,
          });
        else
          await fellowModel.findByIdAndUpdate(cgpas[i]._id, {
            classRank: cgpas[i - 1].classRank + 1,
          });
      }
      res.status(200).json({ success: "MGPA added successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  }
);

export default router;

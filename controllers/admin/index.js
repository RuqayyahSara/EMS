import express from "express";
import adminAuth from "../../middlewares/auth/adminAuth.js";
import { addfellowValidations, errorMiddleware } from "../../middlewares/validations/index.js";
import fellowModel from "../../models/Fellows/index.js";
import randStr from "../../utils/randomString.js";
import sendMail from "../../utils/sendMail.js";
import sendSMS from "../../utils/sendSMS.js";
import config from "config";

let route = express.Router();

/*
    API --> /api/admin/fellow
    Method --> POST
    Route Type --> Private
    Description --> Add a fellow
*/
route.post("/fellow", adminAuth, addfellowValidations(), errorMiddleware, async (req, res) => {
    try {


        let fellowData = await fellowModel.findOne({ email: req.body.email });
        if (fellowData) return res.status(400).json({ error: "fellow already exists !" });

        /*
            Passing fellow in the schema
            & doing required things like alloting passwords, etc.
        */

        let fellow = new fellowModel(req.body);
        fellow.password = null;
        fellow.fellowVerifyToken.email = randStr(12);
        fellow.fellowVerifyToken.phone = randStr(12);
        await fellow.save();

        /*
            Sending invitation mail to fellow
        */
        sendMail({
            subject: "fellow Onboard - CS.CODE.IN",
            to: fellow.email,
            body: `Hi ${fellow.name} <br/>
        you're welcome in team. Please <a href='${config.get(
                "URL"
            )}/api/fellow/verify/email/${fellow.fellowVerifyToken.email}'>Click Here </a>
        to verify your Email Address. <br/><br/>
        Thank you <br/>
        <b>Team CS.CODE.IN</b>`,
        });

        sendSMS({
            phone: fellow.phone, body: `Hi ${fellow.name}
        you're welcome in team. Please click ${config.get("URL")}/api/fellow/verify/phone/${fellow.fellowVerifyToken.phone} to verify your Email Address.
        Thank you
        Team CS.CODE.IN`});

        res.status(200).json({ msg: "fellow added successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Issue" });
    }
});

export default route;
import JWT from "jsonwebtoken";
import CryptoJS from "crypto-js";
import config from "config";

function generateToken(payload)
{
    try {
        let token = JWT.sign(payload, config.get("SECRET_KEYS.JWT"), {expiresIn : "1h"});
        token = CryptoJS.AES.encrypt(token, config.get("SECRET_KEYS.CRYPTO")).toString();
        return token;

    } catch (error) {
        console.log(error);
    }
}

export default generateToken;
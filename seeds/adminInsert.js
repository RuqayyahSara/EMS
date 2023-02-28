import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

async function connectDB() {
  try {
    await mongoose.connect(config.get("DB_URL"));
    console.log(`DB Connected`);
  } catch (error) {
    console.log(error);
  }
}
connectDB();


let adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
});

let adminModel =  mongoose.model("Admin", adminSchema, "admin");

async function insertAdmin() {
  try {
    let admin = {
      name: "Prash",
      password: bcrypt.hashSync("Prashanth@123", 12),
      email: "prashanth@code.in",
      phone: "+919441363963",
      role: "admin",
    };

    let adminData = new adminModel(admin);

    await adminData.save();
    console.log(`Admin Added Successfully`);
  } catch (error) {
    console.log(error);
  }
}
insertAdmin();

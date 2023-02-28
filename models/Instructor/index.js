import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
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
    default: "instructor",
  },
});

export default mongoose.model("Instructors", instructorSchema, "instructors");



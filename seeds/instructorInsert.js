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

const instructorsModel =  mongoose.model(
  "Instructors",
  instructorSchema,
  "instructors"
);

async function insertInstructor() {
  try {
    let instructors = [
      {
        name: "Instructor1",
        email: "instructor1@gmail.com",
        phone: "+919441363963",
        password: "Instructor1@123",
      },
      {
        name: "Instructor2",
        email: "instructor2@gmail.com",
        phone: "+919618211627",
        password: "Instructor2@123",
      },
      {
        name: "Instructor3",
        email: "instructor3@gmail.com",
        phone: "+919618211628",
        password: "Instructor3@123",
      },
    ];
    instructors = instructors.map((ele) => {
      return {
        ...ele,
        password: bcrypt.hashSync(ele.password, 12),
      };
    });

    await instructorsModel.insertMany(instructors);
    console.log("Instructor is Successfully Added")
    // If there are multiple instructors we can use recursion or for loop
  } catch (error) {
    console.log(error);
  }
}

insertInstructor();

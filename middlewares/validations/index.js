import { body, validationResult } from "express-validator";

function loginValidations() {
  return [
    body("email", "Invalid email !").isEmail(),
    body("password", "Password is mandatory !").notEmpty(),
    body("role", "Role is mandatory !").notEmpty()
  ];
}

function addfellowValidations() {
  return [
    body("name", "Name is missing").notEmpty(),
    body("email", "Invalid email !").isEmail(),
    body("phone", "Invalid phone number!").isMobilePhone(),
    body("role").custom((value) => {
      if (value != "fellow") {
        throw new Error("Only fellows can be added");
      }
      else {
        return true;
      }
    })
  ];
}

function addMatValidatorRules() {
  return [
    body("matNumber").custom(
      (value) => {
        if (value > 12 || value < 1) {
          throw new Error("Enter Valid MAT number");
        } else {
          return true;
        }
      }
    ),
    body("courses", "Enter Course Credits and Marks").isArray({ min: 1 }),
    body("courses.*.credits").custom((value, { req }) => {
      if (typeof (value) !== "number")
        throw new Error('Enter a valid Number value');
      else
        return true;
    }),
    body("courses.*.labScores.lab1", "Invalid Input Type").isFloat({ min: 0, max: 10 }),
    body("courses.*.labScores.lab2").isFloat({ min: 0, max: 10 }),
    body("courses.*.labScores.lab3").isFloat({ min: 0, max: 10 }),
    body("courses.*.labScores.lab4").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalCI.CI").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalCI.IO").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalCI.CE").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalInterview.CI").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalInterview.IO").isFloat({ min: 0, max: 10 }),
    body("courses.*.finalInterview.CE").isFloat({ min: 0, max: 10 }),
    body("courses.*.courseName", "Course Name is required").notEmpty(),
    body("courses.*.courseCode", "Course Code is required").notEmpty(),
    body("remarks").isArray().notEmpty(),
    body("remarks.*").notEmpty(),
    body("overallImpression").isArray().notEmpty(),
    body("overallImpression.*").notEmpty()
  ]
}

function editMatValidatorRules() {
  let array = addMatValidatorRules()
  return [
    ...array,
    body("remainingAttempts").custom(
      (value) => {
        if (value !== 0 && value !== 1) {
          throw new Error("Enter Remaining Attempts. Value can be 0 or 1.");
        } else {
          return true;
        }
      }
    )
  ]
}

function errorMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

export { loginValidations, errorMiddleware, addfellowValidations, addMatValidatorRules, editMatValidatorRules };

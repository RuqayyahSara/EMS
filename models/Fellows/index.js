import mongoose from "mongoose";

let matSchema = new mongoose.Schema({
    matNumber: {
        type: Number,
        required: true
    },
    courses: [{
        courseName: {
            type: String,
            required: true,
        },
        courseCode: {
            type: String,
            required: true,
        },
        credits: {
            type: Number,
            required: true
        },
        labScores: {
            lab1: {
                type: Number,
                required: true
            },
            lab2: {
                type: Number,
                required: true
            },
            lab3: {
                type: Number,
                required: true
            },
            lab4: {
                type: Number,
                required: true
            }
        },
        labScoreTotal: {
            type: Number,
            default: null
        },
        finalCI: {
            CI: {
                type: Number,
                required: true
            },
            IO: {
                type: Number,
                required: true
            },
            CE: {
                type: Number,
                required: true
            },
        },
        finalCITotal: {
            type: Number,
            default: null
        },
        finalInterview: {
            CI: {
                type: Number,
                required: true
            },
            IO: {
                type: Number,
                required: true
            },
            CE: {
                type: Number,
                required: true
            },
        },
        finalInterviewTotal: {
            type: Number,
            default: null
        },
        gradePoints: {
            type: Number,
            default: null
        },
        creditPoints: {
            type: Number,
            default: null
        },
        totalScore: {
            type: Number,
            default: null
        }
    }],
    totalCreditPoints: {
        type: Number,
        default: null
    },
    totalCredits: {
        type: Number,
        default: null
    },
    remarks: [String],
    overallImpression: [String],
    mgpa: {
        type: Number,
        default: null
    },
    remainingAttempts: {
        type: Number,
        default: 1,
        required: true
    }
})

let fellowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 25,
        minlength: 3
    },
    password: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        default: "fellow"
    },
    fellowVerifyToken: {
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    fellowAccepted: {
        email: {
            type: Boolean,
            default: false
        },
        phone: {
            type: Boolean,
            default: false
        }
    },
    mat: [matSchema],
    cgpa: {
        type: Number,
        default: null
    },
    classRank: {
        type: Number,
        default: null
    }
});

export default mongoose.model("Fellows", fellowSchema, "fellows");
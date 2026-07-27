import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone:{
    type: String,
    required: true,
  },
  company:{
    type: String,
    default: "",
    trim: true,
  },
  profImgURL:{
    type: String,
    default: "",
  },
  createdAt:{
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Contact", contactSchema);
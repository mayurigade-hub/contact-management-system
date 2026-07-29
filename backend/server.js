import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import Contact from "./models/Contact.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(error => console.log(error));


// Adding New Contact
app.post("/contacts", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: "Email already exists" });

    res.status(400).json({ message: error.message });
  }
});

// Getting All Contacts
app.get("/contacts", async (req, res) => {
  console.log(req.query);
  try {
    
    const {name,email,phone} = req.query;

    const filter = {};
    if (name) {
      filter.fullName = { $regex: name, $options: "i" };
    }
    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: "i" };
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Updating Few Details Of Existing Contact
app.patch("/contacts/:id", async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true}
    );

    if (!updatedContact)
      return res.status(404).json({ message: "Contact Not Found" });

    res.json(updatedContact);
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: "Email already exists" });

    res.status(400).json({ message: error.message });
  }
});

//Delting Contact
app.delete("/contacts/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Contact Not Found" });

    res.json({ message: "Contact Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
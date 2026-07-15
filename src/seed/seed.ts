import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Book } from "../models/Book";
import mongoose from "mongoose";

dotenv.config();

const demoBooks = [
  {
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest, Stein",
    subject: "Computer Science",
    edition: "3rd Edition",
    condition: "Good",
    price: 650,
    shortDescription: "The classic CLRS textbook, lightly used, all pages intact.",
    fullDescription:
      "This is the widely-used CLRS algorithms textbook, required for most CSE data structures and algorithms courses. Minor highlighting in chapters 1-4, spine is intact, no torn pages. Great for exam prep and reference.",
    location: "Dhanmondi",
    university: "BUET",
  },
  {
    title: "Principles of Economics",
    author: "N. Gregory Mankiw",
    subject: "Economics",
    edition: "8th Edition",
    condition: "Like New",
    price: 500,
    shortDescription: "Barely used, bought last semester for Econ 101.",
    fullDescription:
      "Used for only one semester. No writing inside, cover is clean. Comes with the original study guide insert. Perfect for BBA or Economics majors starting their intro courses.",
    location: "Banani",
    university: "North South University",
  },
  {
    title: "Digital Design and Computer Architecture",
    author: "Harris & Harris",
    subject: "Electrical & Electronic Engineering",
    edition: "2nd Edition",
    condition: "Fair",
    price: 450,
    shortDescription: "Well-used but complete, some notes in the margins.",
    fullDescription:
      "This copy has handwritten notes throughout which some students find helpful for understanding circuit design examples. Cover has some wear but binding is solid.",
    location: "Mirpur",
    university: "IUT",
  },
  {
    title: "Elementary Linear Algebra",
    author: "Howard Anton",
    subject: "Mathematics",
    edition: "11th Edition",
    condition: "Good",
    price: 380,
    shortDescription: "Standard linear algebra text for engineering students.",
    fullDescription:
      "Covers matrices, vector spaces, eigenvalues in detail with plenty of solved examples. Used for one semester, a few pages have pencil underlines which erase easily.",
    location: "Uttara",
    university: "AIUB",
  },
  {
    title: "Campbell Biology",
    author: "Reece, Urry, Cain",
    subject: "Medical & Pharmacy",
    edition: "11th Edition",
    condition: "Like New",
    price: 900,
    shortDescription: "Heavy, comprehensive biology reference in excellent shape.",
    fullDescription:
      "Barely opened, purchased as a backup copy. All diagrams and pages in full color, no damage. Great as a long-term reference for pharmacy and biology students.",
    location: "Dhanmondi",
    university: "Dhaka University",
  },
  {
    title: "Contracts: Cases and Materials",
    author: "Randy E. Barnett",
    subject: "Law",
    edition: "9th Edition",
    condition: "Good",
    price: 700,
    shortDescription: "Core casebook for contract law courses.",
    fullDescription:
      "Used throughout a full semester of Contract Law. Tabs added for quick navigation between case sections, which will be left in for the next owner.",
    location: "Segunbagicha",
    university: "Dhaka University",
  },
  {
    title: "Structural Analysis",
    author: "R.C. Hibbeler",
    subject: "Civil Engineering",
    edition: "10th Edition",
    condition: "Worn",
    price: 300,
    shortDescription: "Budget option, cover taped but all pages present.",
    fullDescription:
      "This copy has seen heavy use across two semesters. The front cover has been reinforced with tape but every page and diagram is intact and legible.",
    location: "Mohakhali",
    university: "BUET",
  },
  {
    title: "English Grammar in Use",
    author: "Raymond Murphy",
    subject: "English",
    edition: "4th Edition",
    condition: "New",
    price: 350,
    shortDescription: "Unused, still has the plastic wrap.",
    fullDescription:
      "Bought as extra stock for a course that got cancelled. Completely unused, still sealed in original plastic wrap. Comes with the answer key booklet.",
    location: "Gulshan",
    university: "BRAC University",
  },
];

const run = async () => {
  await connectDB();

  const email = "demo@boibazaar.com";
  let demoUser = await User.findOne({ email });

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash("Demo1234!", 10);
    demoUser = await User.create({
      name: "Demo Student",
      email,
      password: hashedPassword,
      university: "Dhaka University",
      phone: "01700000000",
      role: "user",
    });
    console.log("Demo user created: demo@boibazaar.com / Demo1234!");
  } else {
    console.log("Demo user already exists.");
  }

  const adminEmail = "admin@boibazaar.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash("Admin1234!", 10);
    await User.create({
      name: "BoiBazaar Admin",
      email: adminEmail,
      password: hashedAdminPassword,
      university: "",
      role: "admin",
    });
    console.log("Demo admin created: admin@boibazaar.com / Admin1234!");
  } else {
    console.log("Demo admin already exists.");
  }

  await Book.deleteMany({ sellerEmail: email });

  const booksToInsert = demoBooks.map((b) => ({
    ...b,
    sellerId: demoUser!._id,
    sellerName: demoUser!.name,
    sellerEmail: demoUser!.email,
  }));

  await Book.insertMany(booksToInsert);
  console.log(`Inserted ${booksToInsert.length} demo book listings.`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

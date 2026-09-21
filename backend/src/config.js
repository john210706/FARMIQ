require("dotenv").config();
const { PrismaClient, BookingStatus, MachineryStatus, PaymentStatus, Role } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "farmiq-development-secret-change-me";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.includes('replace-'))) throw new Error('Set a unique JWT_SECRET of at least 32 characters');
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

module.exports = { prisma, PORT, JWT_SECRET, FRONTEND_URL, genAI, BookingStatus, MachineryStatus, PaymentStatus, Role };

import http from "http";
import { Server } from "socket.io";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import session from "express-session";

import connectDB from "./config/db.js";
import passport from "./config/passport.js";

/* ================= ROUTES ================= */
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";


/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= ALLOWED FRONTEND ORIGINS ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://sarathi-furniture.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* ================= DATABASE ================= */
connectDB();

/* ================= CORS FIXED ================= */
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );

/* ================= SOCKET IO ================= */
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= SESSION ================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);

/* ================= PASSPORT ================= */
app.use(passport.initialize());
app.use(passport.session());

/* ================= STATIC FOLDER ================= */
// app.use("/uploads", express.static("uploads"));

/* ================= API ROUTES ================= */

/* USER */
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

/* AUTH */
app.use("/api/auth", authRoutes);

/* SHOPPING */
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

/* ADMIN */
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", accountRoutes);
app.use("/api/admin", adminRoutes);

/* NOTIFICATIONS */
app.use("/api/notifications", notificationRoutes);


app.use("/api/payment", paymentRoutes);
app.use("/api/search", searchRoutes);


/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

/* ================= DEFAULT TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
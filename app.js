const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);
require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const fs = require("fs");

const Appointment = require("./models/Appointment");
const User = require("./models/User");

const app = express();

// ROUTES
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const contactRoutes = require("./routes/contactRoutes");


// ================= BASIC SETUP =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// MONGO CONNECTION
const CONFIGURED_MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/kristen-glam-hub";
let dbConnected = false;

console.log("Configured Mongo URI:", CONFIGURED_MONGODB_URI || "<not set>");
console.log("Fallback Mongo URI:", LOCAL_MONGODB_URI);

const connectToMongo = async () => {
  const candidates = [CONFIGURED_MONGODB_URI, LOCAL_MONGODB_URI].filter(Boolean);

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
        bufferCommands: false,
      });
      dbConnected = true;
      console.log("MongoDB connected to:", uri);
      return uri;
    } catch (err) {
      console.error(`MongoDB connection failed for ${uri}:`, err.message);
    }
  }

  throw new Error(
    "Unable to connect to MongoDB. Ensure MongoDB is running or MONGODB_URI is valid."
  );
};

mongoose.connection.on("connected", () => {
  dbConnected = true;
  console.log("🔥 CONNECTED TO DB:", mongoose.connection.name);
});

mongoose.connection.on("disconnected", () => {
  dbConnected = false;
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API working!",
    database: dbConnected ? "connected" : "unavailable",
  });
});

let activeMongoUri = null;

const setupAppAfterDb = () => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: activeMongoUri }),
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
  );

  app.use(flash());

  // Make fresh user data available everywhere, including updated profile photos.
  app.use(async (req, res, next) => {
    try {
      if (!req.session.user?._id) {
        res.locals.user = null;
        return next();
      }

      if (!dbConnected || mongoose.connection.readyState !== 1) {
        res.locals.user = req.session.user;
        return next();
      }

      const freshUser = await User.findById(req.session.user._id)
        .select("name email contact photo")
        .lean();

      if (!freshUser) {
        req.session.user = null;
        res.locals.user = null;
        return next();
      }

      req.session.user = freshUser;
      res.locals.user = freshUser;
      next();
    } catch (err) {
      console.error("User lookup failed:", err.message);
      res.locals.user = req.session.user || null;
      next();
    }
  });

  // PAGES
  app.get("/", (req, res) => {
    res.render("index", {
      success_msg: req.flash("success_msg") || "",
    });
  });

  app.get("/services", (req, res) => res.render("services"));
  app.get("/consultation", (req, res) => res.render("consultation"));

  app.get("/booknow", (req, res) => {
    const smsg = req.flash("success_msg");
    const emsg = req.flash("error_msg");

    res.render("booknow", {
      appointment: null,
      user: req.session.user || null,
      success_msg: smsg.length > 0 ? smsg[0] : null,
      error_msg: emsg.length > 0 ? emsg[0] : null,
    });
  });

  app.get("/edit-appointment/:id", async (req, res) => {
    try {
      const appt = await Appointment.findById(req.params.id);

      if (!appt) {
        req.flash("error_msg", "Appointment not found.");
        return res.redirect("/profile");
      }

      const smsg = req.flash("success_msg");
      const emsg = req.flash("error_msg");

      res.render("booknow", {
        appointment: appt,
        user: req.session.user || null,
        success_msg: smsg.length > 0 ? smsg[0] : null,
        error_msg: emsg.length > 0 ? emsg[0] : null,
      });
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Something went wrong.");
      res.redirect("/profile");
    }
  });

  // BEAUTY PRODUCTS
  app.get("/beautyproducts", (req, res) => {
    const filePath = path.join(__dirname, "products.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return res.send("Error loading products");

      const allProducts = JSON.parse(data);
      const categories = { skin: [], hair: [], nail: [], makeup: [] };

      allProducts.forEach((p) => {
        const name = p.product_name?.toLowerCase() || "";
        const type = p.product_type?.toLowerCase() || "";

        if (type.includes("skin") || name.includes("serum"))
          categories.skin.push(p);
        else if (type.includes("hair") || name.includes("shampoo"))
          categories.hair.push(p);
        else if (type.includes("nail")) categories.nail.push(p);
        else if (type.includes("makeup") || name.includes("lip"))
          categories.makeup.push(p);
      });

      const pickThree = (arr) => arr.slice(0, 3);

      res.render("beautyProducts", {
        categories: {
          skin: pickThree(categories.skin),
          hair: pickThree(categories.hair),
          nail: pickThree(categories.nail),
          makeup: pickThree(categories.makeup),
        },
      });
    });
  });

  // EXPLORE PAGE
  const products = require("./products.json");

  const categoryKeywords = {
    skin: ["skin", "cream", "moisturiser", "serum"],
    hair: ["hair", "shampoo", "oil"],
    nail: ["nail"],
    makeup: ["makeup", "lip", "foundation"],
  };

  app.get("/explore/:category", (req, res) => {
    const cat = req.params.category.toLowerCase();
    const keywords = categoryKeywords[cat] || [];

    const filtered = products.filter((p) => {
      const type = (p.product_type || "").toLowerCase();
      return keywords.some((k) => type.includes(k));
    });

    res.render("explore", { products: filtered, category: cat });
  });

  // ROUTERS
  app.use("/", authRoutes);
  app.use("/", profileRoutes);
  app.use("/", appointmentRoutes);
  app.use("/", cartRoutes);
  app.use("/", orderRoutes);
  app.use("/", addressRoutes);
  app.use("/", wishlistRoutes);
  app.use("/", contactRoutes);

  // ERROR HANDLER
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });
};

const PORT = Number(process.env.PORT) || 4050;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort} instead.`);
      server.close(() => startServer(nextPort));
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

connectToMongo()
  .then((uri) => {
    activeMongoUri = uri;
    setupAppAfterDb();
    startServer(PORT);
  })
  .catch((err) => {
    console.error("Failed to start server because MongoDB is unavailable:", err.message);
    process.exit(1);
  });

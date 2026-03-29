require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const fs = require("fs");

const Appointment = require("./models/Appointment");

const app = express();
// ROUTES
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");

// ================= BASIC SETUP =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MONGO CONNECTION (FIXED!!!)
const MONGODB_URI = process.env.MONGODB_URI;
``;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Error:", err));

mongoose.connection.on("connected", () => {
  console.log("🔥 CONNECTED TO DB:", mongoose.connection.name);
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working!" });
});

// SESSION + FLASH
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(flash());

// Make user available everywhere
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// PAGES
app.get("/", (req, res) => {
  res.render("index", {
    success_msg: req.flash("success_msg") || "",
  });
});

app.get("/services", (req, res) => res.render("services"));
app.get("/contact", (req, res) => res.render("contact"));

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
      appointment: null,
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


// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

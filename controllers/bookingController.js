exports.showBookNow = (req, res) => {
  const fs = require('fs');
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("booknow", {
    user: req.session.user,
    message: null
  });
};

exports.submitBooking = async (req, res) => {
  try {
    // Save appointment to DB...
    req.flash("success_msg", "Appointment booked successfully!");
    return res.redirect("/booknow");
  } catch (err) {
    req.flash("error_msg", "Something went wrong!");
    return res.redirect("/booknow");
  }
};

// READ products.json and send 3 items per category
exports.booknow =  (req, res) => {
  const filePath = path.join(__dirname, "products.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).send("Error loading products.");
    }

    try {
      const allProducts = JSON.parse(data);

      const categories = {
        skin: [],
        hair: [],
        nail: [],
        makeup: [],
      };

      allProducts.forEach((p) => {
        const name = p.product_name?.toLowerCase() || "";
        const type = p.product_type?.toLowerCase() || "";

        if (type.includes("skin") || name.includes("cream") || name.includes("moisturiser") || name.includes("serum")) {
          categories.skin.push(p);
        } else if (type.includes("hair") || name.includes("shampoo") || name.includes("conditioner") || name.includes("oil")) {
          categories.hair.push(p);
        } else if (type.includes("nail")) {
          categories.nail.push(p);
        } else if (type.includes("makeup") || name.includes("lip") || name.includes("foundation") || name.includes("mascara") || name.includes("shadow")) {
          categories.makeup.push(p);
        }
      });

      const pickThree = arr => arr.slice(0, 3);

      const selected = {
        skin: pickThree(categories.skin),
        hair: pickThree(categories.hair),
        nail: pickThree(categories.nail),
        makeup: pickThree(categories.makeup)
      };

      res.render("beautyProducts", { categories: selected });

    } catch (err) {
      console.error("Error parsing products.json:", err);
      res.status(500).send("Error parsing product data.");
    }
  });
};


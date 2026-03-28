const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.showProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const user = req.session.user;

        // Fetch all appointments for this user
        const appointments = await Appointment.find({ email: user.email }).lean();

        res.render("profile", {
            user,
            appointments,   // ⬅ THIS FIXES THE ERROR
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};


exports.showOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id }).sort({ createdAt: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
};

exports.showCart = async (req, res) => {
  // we'll assume cart is stored in session; if stored in DB, fetch from DB
  const cart = req.session.cart || [];
  res.render('cart', { cart });
};

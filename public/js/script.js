document.addEventListener("DOMContentLoaded", function () {
  // ================= API URL =================
  const API_URL = "https://kristen-s-glam-hub.onrender.com";

  // ================= EXISTING CODE =================

  // Welcome alert or intro animation
  console.log("Welcome to LuxeGlow Beauty — where elegance meets artistry!");

  // Example: Fade in headline
  const headline = document.querySelector(".slide-up-down");
  if (headline) {
    headline.style.opacity = 0;
    setTimeout(() => {
      headline.style.transition = "opacity 2s ease";
      headline.style.opacity = 1;
    }, 500);
  }

  // Smooth scroll to booking section on button click
  const bookNowButton = document.querySelector(".booknow");
  if (bookNowButton) {
    bookNowButton.addEventListener("click", function () {
      const bookingSection = document.querySelector("#booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Booking section not found.");
      }
    });
  }

  // Optional: change title color based on time of day
  const hours = new Date().getHours();
  if (headline) {
    if (hours < 12) {
      headline.innerText = "Good Morning, Gorgeous ✨";
    } else if (hours < 18) {
      headline.innerText = "Glow Through the Afternoon ☀️";
    } else {
      headline.innerText = "Evening Elegance Begins 🌙";
    }
  }

  // ================= FETCH EXAMPLE =================
  // ⚡ Example: calling backend API
  // Replace '/api/test' with your actual route

  fetch(`${API_URL}/api/test`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("API response failed");
      }
      return res.json();
    })
    .then((data) => {
      console.log("API Data:", data);
    })
    .catch((err) => {
      console.error("Fetch Error:", err);
    });
});
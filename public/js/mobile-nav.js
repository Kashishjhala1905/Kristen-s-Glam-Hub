document.addEventListener("DOMContentLoaded", () => {
    // Determine the main navigation container
    let nav = document.querySelector("nav");
    if (!nav) {
        nav = document.querySelector(".right"); // for index.ejs
    }
    if (!nav) {
        nav = document.querySelector(".side-panel"); // for profile.ejs
    }

    if (!nav) return;

    // Create mobile top bar with logo and hamburger
    const mobileTopBar = document.createElement("div");
    mobileTopBar.className = "mobile-top-bar";
    mobileTopBar.innerHTML = `
        <img src="/images/logo.png" alt="Glam Hub" class="mobile-logo" onclick="location.href='/'">
        <div class="mobile-hamburger"><i class="fas fa-bars"></i></div>
    `;
    document.body.appendChild(mobileTopBar);

    const hamburger = mobileTopBar.querySelector(".mobile-hamburger");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "mobile-nav-overlay";
    document.body.appendChild(overlay);

    // Add side-nav base class
    nav.classList.add("mobile-side-nav");

    // Toggle function
    const toggleNav = () => {
        nav.classList.toggle("active");
        overlay.classList.toggle("active");
        if (nav.classList.contains("active")) {
            hamburger.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
    };

    hamburger.addEventListener("click", toggleNav);
    overlay.addEventListener("click", toggleNav);

    // Close nav when a link is clicked
    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 760) {
                nav.classList.remove("active");
                overlay.classList.remove("active");
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
});

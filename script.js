document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const menuIcon = navToggle ? navToggle.querySelector("i") : null;

  if (navToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      if (menuIcon) {
        menuIcon.classList.remove("bx-x");
        menuIcon.classList.add("bx-menu");
      }
    };

    const openMenu = () => {
      navLinks.classList.add("active");
      navToggle.setAttribute("aria-expanded", "true");
      if (menuIcon) {
        menuIcon.classList.remove("bx-menu");
        menuIcon.classList.add("bx-x");
      }
    };

    const toggleMenu = () => {
      const isOpen = navLinks.classList.contains("active");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    // Close the menu after a link is picked (single-page anchors, or a real
    // navigation - either way there's no reason to leave it open).
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close on outside click.
    document.addEventListener("click", (event) => {
      if (!navLinks.classList.contains("active")) return;
      const clickedInsideNav = event.target.closest("nav");
      if (!clickedInsideNav) closeMenu();
    });

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    // If the viewport grows past the mobile breakpoint while the menu is
    // open, reset state so it doesn't get stuck open/closed incorrectly.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  initSeeAllButton();
  initCourseSearch();
  initSearchShortcut();
  initCodingModal();
  initCourseFilters();
  initEnrollButtons();
  initContactForm();
  initThemeToggle();
  initFaqAccordion();
});

// "See All Courses" header button -> Courses page.
function initSeeAllButton() {
  const btn = document.getElementById("seeAllBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.location.href = "courses.html";
  });
}

// Live-filters the course grid on the current page as you type in the
// header search bar. No-ops on pages that don't have both elements.
function initCourseSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const grid = document.querySelector(".content .courses");
  if (!input || !grid) return;

  const items = Array.from(grid.querySelectorAll(":scope > .item"));
  let noResultsMsg = null;

  const getNoResultsMsg = () => {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("p");
      noResultsMsg.className = "no-results-msg";
      noResultsMsg.textContent = "No courses match your search.";
      grid.appendChild(noResultsMsg);
    }
    return noResultsMsg;
  };

  const applyFilter = () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const titleEl = item.querySelector(".top .info a, .top h5");
      const title = titleEl ? titleEl.textContent.toLowerCase() : "";
      const matches = query === "" || title.includes(query);
      item.style.display = matches ? "" : "none";
      if (matches) visibleCount += 1;
    });

    getNoResultsMsg().style.display =
      visibleCount === 0 && query !== "" ? "block" : "none";
  };

  input.addEventListener("input", applyFilter);

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyFilter();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (btn) {
    btn.addEventListener("click", () => {
      applyFilter();
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// Press "/" anywhere on the page to jump straight to the search bar, like
// many docs/search-heavy sites do. Ignored while already typing somewhere.
function initSearchShortcut() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/") return;
    const active = document.activeElement;
    const isTyping =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable);
    if (isTyping) return;
    event.preventDefault();
    input.focus();
    input.select();
  });
}

// "What is Coding?" info modal.
function initCodingModal() {
  const openBtn = document.getElementById("whatIsCodingBtn");
  const backdrop = document.getElementById("codingModalBackdrop");
  const closeBtn = document.getElementById("codingModalClose");
  if (!openBtn || !backdrop || !closeBtn) return;

  const modal = backdrop.querySelector(".modal");

  const onKeydown = (event) => {
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab" && modal) {
      const focusable = modal.querySelectorAll("button, a[href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  function openModal() {
    backdrop.classList.add("active");
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    backdrop.classList.remove("active");
    document.removeEventListener("keydown", onKeydown);
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });
  if (modal) {
    modal.addEventListener("click", (event) => event.stopPropagation());
  }
}

function initCourseFilters() {
  const grid = document.querySelector(".course-catalog");
  const filters = document.querySelectorAll("[data-course-filter]");
  if (!grid || !filters.length) return;

  const cards = grid.querySelectorAll(".item");
  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.courseFilter;
      filters.forEach((button) => button.classList.remove("active"));
      filter.classList.add("active");
      cards.forEach((card) => {
        card.hidden = category !== "all" && card.dataset.category !== category;
      });
    });
  });
}

// Course basket: the "Add to basket" buttons on course cards, the full
// basket-summary panel (courses.html only), and the mini dropdown that
// hangs off the basket icon in the nav on every page.
function initEnrollButtons() {
  const getBasket = () => JSON.parse(localStorage.getItem("courseBasket") || "[]");
  const setBasket = (basket) => localStorage.setItem("courseBasket", JSON.stringify(basket));
  const summary = document.querySelector(".basket-summary");
  const message = document.querySelector(".basket-message");
  const clearButton = document.querySelector(".clear-basket");
  const basketLinks = document.querySelectorAll('[aria-label="View course basket"]');
  const dropdowns = document.querySelectorAll(".basket-dropdown");

  const renderBasket = () => {
    const basket = getBasket();

    basketLinks.forEach((link) => {
      link.setAttribute("aria-label", `View course basket (${basket.length} courses)`);
      link.dataset.count = basket.length;
    });

    if (summary && message) {
      summary.hidden = basket.length === 0;
      message.textContent = `${basket.length} course${basket.length === 1 ? "" : "s"} in your basket: ${basket.join(", ")}`;
    }

    document.querySelectorAll("[data-enroll]").forEach((button) => {
      const added = basket.includes(button.dataset.enroll);
      button.textContent = added ? "Added to basket" : "Add to basket";
      button.disabled = added;
    });

    dropdowns.forEach((dropdown) => {
      const list = dropdown.querySelector(".basket-dropdown-list");
      const emptyMsg = dropdown.querySelector(".basket-dropdown-empty");
      if (!list || !emptyMsg) return;
      emptyMsg.hidden = basket.length > 0;
      list.hidden = basket.length === 0;
      list.innerHTML = basket
        .map(
          (course, index) =>
            `<li><span>${course}</span><button type="button" class="basket-dropdown-remove" data-index="${index}" aria-label="Remove ${course} from basket"><i class="bx bx-x" aria-hidden="true"></i></button></li>`
        )
        .join("");
    });
  };

  document.querySelectorAll("[data-enroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const course = button.dataset.enroll;
      const basket = getBasket();
      if (!basket.includes(course)) basket.push(course);
      setBasket(basket);
      renderBasket();
    });
  });

  if (clearButton) clearButton.addEventListener("click", () => { setBasket([]); renderBasket(); });

  dropdowns.forEach((dropdown) => {
    const list = dropdown.querySelector(".basket-dropdown-list");
    if (list) {
      list.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".basket-dropdown-remove");
        if (!removeBtn) return;
        const basket = getBasket();
        basket.splice(Number(removeBtn.dataset.index), 1);
        setBasket(basket);
        renderBasket();
      });
    }

    const dropdownClear = dropdown.querySelector(".basket-dropdown-clear");
    if (dropdownClear) {
      dropdownClear.addEventListener("click", () => {
        setBasket([]);
        renderBasket();
      });
    }
  });

  // Open/close the nav basket dropdown.
  document.querySelectorAll(".basket-wrapper").forEach((wrapper) => {
    const toggle = wrapper.querySelector(".basket-toggle");
    const dropdown = wrapper.querySelector(".basket-dropdown");
    if (!toggle || !dropdown) return;

    const closeDropdown = () => {
      dropdown.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };
    const openDropdown = () => {
      dropdown.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dropdown.hidden) openDropdown(); else closeDropdown();
    });
    dropdown.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDropdown();
    });
  });

  renderBasket();
}

function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.querySelector(".form-status");
    if (message) message.textContent = "Thanks — your message has been received. We'll reply soon.";
    form.reset();
  });
}

// Dark mode toggle. Defaults to the OS-level preference (prefers-color-scheme)
// until the visitor picks explicitly, then remembers that choice.
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const root = document.documentElement;
  const icon = toggle.querySelector("i");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const applyIcon = (isDark) => {
    toggle.setAttribute("aria-pressed", String(isDark));
    if (icon) {
      icon.classList.toggle("bx-moon", !isDark);
      icon.classList.toggle("bx-sun", isDark);
    }
  };

  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (error) {
    stored = null;
  }

  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
    applyIcon(stored === "dark");
  } else {
    applyIcon(prefersDark.matches);
  }

  toggle.addEventListener("click", () => {
    const isDarkNow =
      root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && prefersDark.matches);
    const next = isDarkNow ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      // Ignore write failures (private browsing, storage disabled, etc.) -
      // the toggle still works for the rest of the session.
    }
    applyIcon(next === "dark");
  });

  // If the visitor hasn't picked explicitly, keep the icon in sync when the
  // OS-level theme changes while the page is open (the CSS already follows
  // prefers-color-scheme live; this just keeps the icon/aria-pressed matching).
  prefersDark.addEventListener("change", (event) => {
    if (root.getAttribute("data-theme")) return;
    applyIcon(event.matches);
  });
}

// About page FAQ accordion.
function initFaqAccordion() {
  const toggles = document.querySelectorAll(".faq-toggle");
  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    const answer = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!answer) return;
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
    });
  });
}

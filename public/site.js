(() => {
    const storageKey = "hf-theme";
    const root = document.documentElement;

    function getPreferredTheme() {
        const storedTheme = window.localStorage.getItem(storageKey);
        return storedTheme === "dark" ? "dark" : "light";
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        window.localStorage.setItem(storageKey, theme);

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            const isDark = theme === "dark";
            const icon = button.querySelector("i");
            const label = button.querySelector(".theme-toggle-label");

            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");

            if (icon) {
                icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
            }

            if (label) {
                label.textContent = isDark ? "Light" : "Dark";
            }
        });
    }

    function toggleTheme() {
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    }

    window.toggleMenu = function toggleMenu() {
        const menuList = document.getElementById("menuList");
        if (menuList) {
            menuList.classList.toggle("active");
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(getPreferredTheme());

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.addEventListener("click", toggleTheme);
        });
    });
})();

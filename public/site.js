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

    function createFallingLeaves() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const shell = document.querySelector(".page-shell");

        if (!shell || document.querySelector(".falling-leaves")) {
            return;
        }

        const layer = document.createElement("div");
        layer.className = "falling-leaves";
        layer.setAttribute("aria-hidden", "true");

        const leafCount = 12;

        for (let index = 0; index < leafCount; index += 1) {
            const leaf = document.createElement("span");
            leaf.className = "falling-leaf";
            leaf.style.setProperty("--leaf-left", `${Math.random() * 100}%`);
            leaf.style.setProperty("--leaf-size", `${14 + Math.random() * 18}px`);
            leaf.style.setProperty("--leaf-delay", `${Math.random() * -18}s`);
            leaf.style.setProperty("--leaf-duration", `${15 + Math.random() * 12}s`);
            leaf.style.setProperty("--leaf-sway-duration", `${4 + Math.random() * 4}s`);
            leaf.style.setProperty("--leaf-drift", `${-40 + Math.random() * 80}px`);
            leaf.style.setProperty("--leaf-rotate", `${Math.random() * 180}deg`);
            leaf.style.setProperty("--leaf-opacity", `${0.14 + Math.random() * 0.12}`);
            leaf.style.setProperty("--leaf-opacity-dark", `${0.1 + Math.random() * 0.08}`);
            layer.appendChild(leaf);
        }

        shell.appendChild(layer);
    }

    window.toggleMenu = function toggleMenu() {
        const menuList = document.getElementById("menuList");
        if (menuList) {
            menuList.classList.toggle("active");
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(getPreferredTheme());
        createFallingLeaves();

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.addEventListener("click", toggleTheme);
        });
    });
})();

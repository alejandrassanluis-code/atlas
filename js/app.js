/* ==========================================================
   ATLAS
   app.js
   Arranque y navegación principal
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    init() {

        this.data = AtlasStorage.load();

        this.bindEvents();

        this.render();

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const routeButton =
                    event.target.closest(
                        "[data-route]"
                    );

                if (routeButton) {

                    this.navigate(
                        routeButton.dataset.route
                    );

                    return;

                }

                const addMovementButton =
                    event.target.closest(
                        "[data-action='add-movement']"
                    );

                if (addMovementButton) {

                    this.navigate("movements");

                }

            }
        );

    },

    navigate(route) {

        this.route = route;

        this.render();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },

    render() {

        AtlasUI.render(
            this.route,
            this.data
        );

    },

    save() {

        AtlasStorage.save(
            this.data
        );

        this.render();

    },

    reset() {

        this.data =
            AtlasStorage.reset();

        this.route = "home";

        this.render();

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AtlasApp.init();

    }
);

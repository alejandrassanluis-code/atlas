/* ==========================================================
   ATLAS
   app.js
   Sprint 2.1 — Integración de configuración inicial
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    init() {

        this.data =
            AtlasStorage.load();

        this.bindEvents();

        this.render();

        if (
            AtlasSetup.shouldOpen(
                this.data
            )
        ) {

            AtlasSetup.open(
                this.data,
                updatedData => {

                    this.data =
                        updatedData;

                    this.route =
                        "home";

                    this.render();

                    AtlasUI.toast(
                        "Atlas ya está configurado."
                    );

                }
            );

        }

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

                    event.preventDefault();

                    this.navigate(
                        routeButton
                            .dataset
                            .route
                    );

                    return;

                }

                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!actionButton) {

                    return;

                }

                const action =
                    actionButton
                        .dataset
                        .action;

                switch (action) {

                    case "newMovement":

                        AtlasUI.toast(
                            "El registro de movimientos llegará en el Sprint 2.2."
                        );

                        break;

                    case "editAccounts":

                        AtlasSetup.open(
                            this.data,
                            updatedData => {

                                this.data =
                                    updatedData;

                                this.render();

                                AtlasUI.toast(
                                    "Datos actualizados."
                                );

                            }
                        );

                        break;

                }

            }
        );

    },

    navigate(route) {

        this.route =
            route || "home";

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

        const saved =
            AtlasStorage.save(
                this.data
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudieron guardar los datos."
            );

        }

        return saved;

    },

    updateAccountBalance(
        accountId,
        value
    ) {

        const account =
            this.data.accounts.find(
                item =>
                    item.id === accountId
            );

        if (!account) {

            return false;

        }

        account.balance =
            Number(value) || 0;

        this.save();

        this.render();

        return true;

    },

    updateInvestment(
        accountId,
        invested,
        currentValue
    ) {

        const account =
            this.data.accounts.find(
                item =>
                    item.id === accountId
            );

        if (!account) {

            return false;

        }

        account.invested =
            Number(invested) || 0;

        account.balance =
            Number(currentValue) || 0;

        this.save();

        this.render();

        return true;

    },

    updateSavingGoal(percent) {

        this.data.settings
            .monthlySavingGoal =
            Number(percent) || 0;

        this.save();

        this.render();

    },

    reset() {

        const confirmed =
            AtlasUI.confirm(
                "Reiniciar Atlas",
                "Se eliminarán todos los datos guardados en este dispositivo."
            );

        if (!confirmed) {

            return;

        }

        this.data =
            AtlasStorage.reset();

        this.route =
            "home";

        this.render();

        AtlasSetup.open(
            this.data,
            updatedData => {

                this.data =
                    updatedData;

                this.render();

            }
        );

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AtlasApp.init();

    }
);

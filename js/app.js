/* ==========================================================
   ATLAS
   app.js
   Sprint 3.2 — Selector mensual en Movimientos
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    analysisMonth: null,

    movementsMonth: null,

    init() {

        this.data =
            AtlasStorage.load();

        this.analysisMonth =
            this.currentMonthKey();

        this.movementsMonth =
            this.currentMonthKey();

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

    currentMonthKey() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        return `${year}-${month}`;

    },

    shiftMonth(
        monthKey,
        difference
    ) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(Number);

        if (
            !year ||
            !month
        ) {
            return this.currentMonthKey();
        }

        const date =
            new Date(
                year,
                month - 1 + difference,
                1
            );

        const shiftedYear =
            date.getFullYear();

        const shiftedMonth =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        return (
            `${shiftedYear}-${shiftedMonth}`
        );

    },

    isCurrentAnalysisMonth() {

        return (
            this.analysisMonth ===
            this.currentMonthKey()
        );

    },

    isCurrentMovementsMonth() {

        return (
            this.movementsMonth ===
            this.currentMonthKey()
        );

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
                        routeButton.dataset.route
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
                    actionButton.dataset.action;

                switch (action) {

                    case "newMovement":

                        AtlasMovements.open(
                            this.data,
                            (
                                updatedData,
                                movement
                            ) => {

                                this.data =
                                    updatedData;

                                if (
                                    movement?.date
                                ) {

                                    this.movementsMonth =
                                        String(
                                            movement.date
                                        ).slice(
                                            0,
                                            7
                                        );

                                }

                                this.route =
                                    "movements";

                                this.render();

                                AtlasUI.toast(
                                    "Movimiento guardado."
                                );

                            }
                        );

                        break;

                    case "editAccounts":

                        this.openAccountEditor();

                        break;

                    case "previousAnalysisMonth":

                        this.analysisMonth =
                            this.shiftMonth(
                                this.analysisMonth,
                                -1
                            );

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "nextAnalysisMonth":

                        if (
                            this.isCurrentAnalysisMonth()
                        ) {
                            return;
                        }

                        this.analysisMonth =
                            this.shiftMonth(
                                this.analysisMonth,
                                1
                            );

                        if (
                            this.analysisMonth >
                            this.currentMonthKey()
                        ) {

                            this.analysisMonth =
                                this.currentMonthKey();

                        }

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "currentAnalysisMonth":

                        this.analysisMonth =
                            this.currentMonthKey();

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "previousMovementsMonth":

                        this.movementsMonth =
                            this.shiftMonth(
                                this.movementsMonth,
                                -1
                            );

                        this.route =
                            "movements";

                        this.render();

                        break;

                    case "nextMovementsMonth":

                        if (
                            this.isCurrentMovementsMonth()
                        ) {
                            return;
                        }

                        this.movementsMonth =
                            this.shiftMonth(
                                this.movementsMonth,
                                1
                            );

                        if (
                            this.movementsMonth >
                            this.currentMonthKey()
                        ) {

                            this.movementsMonth =
                                this.currentMonthKey();

                        }

                        this.route =
                            "movements";

                        this.render();

                        break;

                    case "currentMovementsMonth":

                        this.movementsMonth =
                            this.currentMonthKey();

                        this.route =
                            "movements";

                        this.render();

                        break;

                    case "resetAtlas":

                        this.reset();

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
            this.data,
            {
                analysisMonth:
                    this.analysisMonth,

                movementsMonth:
                    this.movementsMonth,

                currentMonth:
                    this.currentMonthKey(),

                isCurrentAnalysisMonth:
                    this.isCurrentAnalysisMonth(),

                isCurrentMovementsMonth:
                    this.isCurrentMovementsMonth()
            }
        );

    },

    hasMovements() {

        return (
            Array.isArray(
                this.data?.movements
            ) &&
            this.data.movements.length > 0
        );

    },

    openAccountEditor() {

        if (this.hasMovements()) {

            AtlasUI.toast(
                "Los saldos ya se calculan con tus movimientos."
            );

            return;

        }

        AtlasSetup.open(
            this.data,
            updatedData => {

                this.data =
                    updatedData;

                this.render();

                AtlasUI.toast(
                    "Saldos iniciales actualizados."
                );

            }
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

        if (this.hasMovements()) {

            AtlasUI.toast(
                "No se pueden modificar saldos iniciales después de registrar movimientos."
            );

            return false;

        }

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

        if (this.hasMovements()) {

            AtlasUI.toast(
                "No se pueden modificar saldos iniciales después de registrar movimientos."
            );

            return false;

        }

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
                "Se eliminarán las cuentas, saldos y movimientos guardados en este dispositivo."
            );

        if (!confirmed) {
            return;
        }

        this.data =
            AtlasStorage.reset();

        this.route =
            "home";

        this.analysisMonth =
            this.currentMonthKey();

        this.movementsMonth =
            this.currentMonthKey();

        this.render();

        AtlasSetup.open(
            this.data,
            updatedData => {

                this.data =
                    updatedData;

                this.render();

                AtlasUI.toast(
                    "Atlas se ha reiniciado."
                );

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

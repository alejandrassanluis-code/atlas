/* ==========================================================
   ATLAS
   app.js
   Sprint 3.4 — Ajustes editables y snapshots
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    analysisMonth: null,

    movementsMonth: null,

    analysisView: "monthly",

    trendsPeriod: 6,

    trendMetric: "savings",

    init() {

        this.data =
            AtlasStorage.load();

        this.analysisMonth =
            this.currentMonthKey();

        this.movementsMonth =
            this.currentMonthKey();

        this.analysisView =
            "monthly";

        this.trendsPeriod =
            6;

        this.trendMetric =
            "savings";

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
            ).padStart(
                2,
                "0"
            );

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
            ).padStart(
                2,
                "0"
            );

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

                        this.openNewMovement();

                        break;

                    case "openSettings":

                    case "editAccounts":

                        this.openSettings();

                        break;

                    case "showMonthlyAnalysis":

                        this.analysisView =
                            "monthly";

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "showTrendsAnalysis":

                        this.analysisView =
                            "trends";

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "setTrendsPeriod":

                        this.setTrendsPeriod(
                            actionButton.dataset.period
                        );

                        break;

                    case "setTrendMetric":

                        this.setTrendMetric(
                            actionButton.dataset.metric
                        );

                        break;

                    case "previousAnalysisMonth":

                        this.analysisMonth =
                            this.shiftMonth(
                                this.analysisMonth,
                                -1
                            );

                        this.analysisView =
                            "monthly";

                        this.route =
                            "analysis";

                        this.render();

                        break;

                    case "nextAnalysisMonth":

                        this.nextAnalysisMonth();

                        break;

                    case "currentAnalysisMonth":

                        this.analysisMonth =
                            this.currentMonthKey();

                        this.analysisView =
                            "monthly";

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

                        this.nextMovementsMonth();

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

    openNewMovement() {

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

                    const movementMonth =
                        String(
                            movement.date
                        ).slice(
                            0,
                            7
                        );

                    this.movementsMonth =
                        movementMonth;

                    this.analysisMonth =
                        movementMonth;

                }

                this.route =
                    "movements";

                this.render();

                AtlasUI.toast(
                    "Movimiento guardado."
                );

            }
        );

    },

    openSettings() {

        AtlasSettings.open(
            this.data,
            updatedData => {

                this.data =
                    updatedData;

                this.render();

            }
        );

    },

    nextAnalysisMonth() {

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

        this.analysisView =
            "monthly";

        this.route =
            "analysis";

        this.render();

    },

    nextMovementsMonth() {

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

    },

    setTrendsPeriod(value) {

        const period =
            Number(value);

        const allowedPeriods = [
            3,
            6,
            12
        ];

        if (
            !allowedPeriods.includes(
                period
            )
        ) {
            return;
        }

        this.trendsPeriod =
            period;

        this.analysisView =
            "trends";

        this.route =
            "analysis";

        this.render();

    },

    setTrendMetric(metric) {

        const allowedMetrics = [
            "savings",
            "income",
            "expenses",
            "invested",
            "cashOutflow",
            "liquidity",
            "investments",
            "debt",
            "netWorth"
        ];

        if (
            !allowedMetrics.includes(
                metric
            )
        ) {
            return;
        }

        this.trendMetric =
            metric;

        this.analysisView =
            "trends";

        this.route =
            "analysis";

        this.render();

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

                analysisView:
                    this.analysisView,

                trendsPeriod:
                    this.trendsPeriod,

                trendMetric:
                    this.trendMetric,

                isCurrentAnalysisMonth:
                    this.isCurrentAnalysisMonth(),

                isCurrentMovementsMonth:
                    this.isCurrentMovementsMonth()
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

    reset() {

        const confirmed =
            AtlasUI.confirm(
                "Reiniciar Atlas",
                "Se eliminarán las cuentas, saldos, movimientos y cierres mensuales guardados en este dispositivo."
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

        this.analysisView =
            "monthly";

        this.trendsPeriod =
            6;

        this.trendMetric =
            "savings";

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

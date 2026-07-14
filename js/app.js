/* ==========================================================
   ATLAS
   app.js
   Sprint 7.3 — Filtros avanzados de movimientos
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    analysisMonth: null,

    movementsMonth: null,

    budgetMonth: null,

    analysisView: "monthly",

    trendsPeriod: 6,

    trendMetric: "savings",

    movementSearch: "",

    movementTypeFilter: "all",

    movementAccountFilter: "all",

    movementMinimumAmount: "",

    movementMaximumAmount: "",

    movementDateFrom: "",

    movementDateTo: "",

    modalObserver: null,

    init() {

        this.data =
            AtlasStorage.load();

        const currentMonth =
            this.currentMonthKey();

        this.analysisMonth =
            currentMonth;

        this.movementsMonth =
            currentMonth;

        this.budgetMonth =
            currentMonth;

        this.analysisView =
            "monthly";

        this.trendsPeriod =
            6;

        this.trendMetric =
            "savings";

        this.resetMovementFiltersState();

        this.bindEvents();

        this.observeModals();

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

    isCurrentBudgetMonth() {

        return (
            this.budgetMonth ===
            this.currentMonthKey()
        );

    },

    resetMovementFiltersState() {

        this.movementSearch =
            "";

        this.movementTypeFilter =
            "all";

        this.movementAccountFilter =
            "all";

        this.movementMinimumAmount =
            "";

        this.movementMaximumAmount =
            "";

        this.movementDateFrom =
            "";

        this.movementDateTo =
            "";

    },

    hasMovementFilters() {

        return Boolean(

            this.movementSearch ||

            this.movementTypeFilter !==
                "all" ||

            this.movementAccountFilter !==
                "all" ||

            this.movementMinimumAmount !==
                "" ||

            this.movementMaximumAmount !==
                "" ||

            this.movementDateFrom ||

            this.movementDateTo

        );

    },

    normalizeMovementSearch(value) {

        return String(
            value || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    },

    normalizeMovementTypeFilter(value) {

        const allowedTypes = [

            "all",

            "income",

            "expense",

            "investment",

            "transfer",

            "debt_payment"

        ];

        return allowedTypes.includes(
            value
        )
            ? value
            : "all";

    },

    normalizeMovementAccountFilter(value) {

        const accountId =
            String(
                value || "all"
            );

        if (
            accountId === "all"
        ) {

            return "all";

        }

        const accountExists =
            (
                this.data?.accounts ||
                []
            ).some(
                account =>
                    account.id ===
                    accountId
            );

        return accountExists
            ? accountId
            : "all";

    },

    normalizeMovementAmount(value) {

        const stringValue =
            String(
                value ?? ""
            )
                .replace(
                    ",",
                    "."
                )
                .trim();

        if (!stringValue) {

            return "";

        }

        const amount =
            Number(
                stringValue
            );

        if (
            !Number.isFinite(
                amount
            ) ||
            amount < 0
        ) {

            return "";

        }

        return String(
            amount
        );

    },

    normalizeMovementDate(value) {

        const date =
            String(
                value || ""
            ).trim();

        if (!date) {

            return "";

        }

        return /^\d{4}-\d{2}-\d{2}$/.test(
            date
        )
            ? date
            : "";

    },

    normalizeMovementDateRange() {

        if (
            this.movementDateFrom &&
            this.movementDateTo &&
            this.movementDateFrom >
                this.movementDateTo
        ) {

            const previousFrom =
                this.movementDateFrom;

            this.movementDateFrom =
                this.movementDateTo;

            this.movementDateTo =
                previousFrom;

        }

    },

    normalizeMovementAmountRange() {

        if (
            this.movementMinimumAmount ===
                "" ||
            this.movementMaximumAmount ===
                ""
        ) {

            return;

        }

        const minimum =
            Number(
                this.movementMinimumAmount
            );

        const maximum =
            Number(
                this.movementMaximumAmount
            );

        if (
            minimum <= maximum
        ) {

            return;

        }

        this.movementMinimumAmount =
            String(
                maximum
            );

        this.movementMaximumAmount =
            String(
                minimum
            );

    },

    readMovementFilters(form) {

        if (!form) {

            return;

        }

        const values =
            new FormData(
                form
            );

        this.movementSearch =
            this.normalizeMovementSearch(
                values.get(
                    "movementSearch"
                )
            );

        this.movementTypeFilter =
            this.normalizeMovementTypeFilter(
                String(
                    values.get(
                        "movementTypeFilter"
                    ) ||
                    "all"
                )
            );

        this.movementAccountFilter =
            this.normalizeMovementAccountFilter(
                String(
                    values.get(
                        "movementAccountFilter"
                    ) ||
                    "all"
                )
            );

        this.movementMinimumAmount =
            this.normalizeMovementAmount(
                values.get(
                    "movementMinimumAmount"
                )
            );

        this.movementMaximumAmount =
            this.normalizeMovementAmount(
                values.get(
                    "movementMaximumAmount"
                )
            );

        this.movementDateFrom =
            this.normalizeMovementDate(
                values.get(
                    "movementDateFrom"
                )
            );

        this.movementDateTo =
            this.normalizeMovementDate(
                values.get(
                    "movementDateTo"
                )
            );

        this.normalizeMovementAmountRange();

        this.normalizeMovementDateRange();

    },

    applyMovementFilters(form) {

        this.readMovementFilters(
            form
        );

        this.route =
            "movements";

        this.render();

    },

    clearMovementFilters() {

        this.resetMovementFiltersState();

        this.route =
            "movements";

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

                    case "applyMovementFilters": {

                        const form =
                            actionButton.closest(
                                "[data-movement-filters-form]"
                            );

                        this.applyMovementFilters(
                            form
                        );

                        break;

                    }

                    case "clearMovementFilters":

                        this.clearMovementFilters();

                        break;

                    case "previousBudgetMonth":

                        this.budgetMonth =
                            this.shiftMonth(
                                this.budgetMonth,
                                -1
                            );

                        this.route =
                            "budgets";

                        this.render();

                        break;

                    case "nextBudgetMonth":

                        this.nextBudgetMonth();

                        break;

                    case "currentBudgetMonth":

                        this.budgetMonth =
                            this.currentMonthKey();

                        this.route =
                            "budgets";

                        this.render();

                        break;

                    case "resetAtlas":

                        this.reset();

                        break;

                }

            }
        );

        document.addEventListener(
            "change",
            event => {

                const typeFilter =
                    event.target.closest(
                        "[data-movement-type-filter]"
                    );

                if (typeFilter) {

                    this.movementTypeFilter =
                        this.normalizeMovementTypeFilter(
                            typeFilter.value
                        );

                    this.route =
                        "movements";

                    this.render();

                    return;

                }

                const accountFilter =
                    event.target.closest(
                        "[data-movement-account-filter]"
                    );

                if (accountFilter) {

                    this.movementAccountFilter =
                        this.normalizeMovementAccountFilter(
                            accountFilter.value
                        );

                    this.route =
                        "movements";

                    this.render();

                    return;

                }

                const advancedFilter =
                    event.target.closest(
                        "[data-movement-advanced-filter]"
                    );

                if (advancedFilter) {

                    const form =
                        advancedFilter.closest(
                            "[data-movement-filters-form]"
                        );

                    this.applyMovementFilters(
                        form
                    );

                }

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const filtersForm =
                    event.target.closest(
                        "[data-movement-filters-form]"
                    );

                if (!filtersForm) {

                    return;

                }

                event.preventDefault();

                this.applyMovementFilters(
                    filtersForm
                );

            }
        );

    },

    observeModals() {

        const modalRoot =
            document.getElementById(
                "modal-root"
            );

        if (!modalRoot) {
            return;
        }

        if (this.modalObserver) {

            this.modalObserver.disconnect();

        }

        this.modalObserver =
            new MutationObserver(
                () => {

                    this.cleanSettingsNotices();

                }
            );

        this.modalObserver.observe(
            modalRoot,
            {
                childList:
                    true,

                subtree:
                    true
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

                    this.budgetMonth =
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

                this.movementAccountFilter =
                    this.normalizeMovementAccountFilter(
                        this.movementAccountFilter
                    );

                this.render();

            }
        );

        this.cleanSettingsNotices();

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

    nextBudgetMonth() {

        if (
            this.isCurrentBudgetMonth()
        ) {
            return;
        }

        this.budgetMonth =
            this.shiftMonth(
                this.budgetMonth,
                1
            );

        if (
            this.budgetMonth >
            this.currentMonthKey()
        ) {

            this.budgetMonth =
                this.currentMonthKey();

        }

        this.route =
            "budgets";

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

        const allowedRoutes = [

            "home",

            "movements",

            "budgets",

            "analysis",

            "ai"

        ];

        this.route =
            allowedRoutes.includes(
                route
            )
                ? route
                : "home";

        this.render();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },

    cleanDashboard() {

        if (
            this.route !==
            "home"
        ) {
            return;
        }

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        const insight =
            app.querySelector(
                ".insight"
            );

        if (insight) {

            const panel =
                insight.closest(
                    ".panel"
                );

            if (panel) {

                panel.remove();

            }

        }

        const dashboard =
            app.querySelector(
                ".app"
            );

        if (!dashboard) {
            return;
        }

        const lastVisibleElement =
            Array.from(
                dashboard.children
            )
                .filter(
                    element =>
                        element.offsetParent !==
                        null
                )
                .pop();

        if (lastVisibleElement) {

            lastVisibleElement.style
                .marginBottom =
                "0";

        }

        dashboard.style.paddingBottom =
            "110px";

        dashboard.style.minHeight =
            "auto";

    },

    enhanceNavigation() {

        const fab =
            document.querySelector(
                ".tabbar .fab"
            );

        if (fab) {

            fab.style.fontSize =
                "38px";

            fab.style.fontWeight =
                "400";

            fab.style.lineHeight =
                "1";

            fab.style.display =
                "flex";

            fab.style.alignItems =
                "center";

            fab.style.justifyContent =
                "center";

            fab.style.paddingBottom =
                "5px";

            fab.style.width =
                "64px";

            fab.style.height =
                "64px";

            fab.style.minWidth =
                "64px";

            fab.style.minHeight =
                "64px";

        }

        document
            .querySelectorAll(
                ".tabbar button:not(.fab) > span"
            )
            .forEach(
                icon => {

                    icon.style.fontSize =
                        "28px";

                    icon.style.lineHeight =
                        "1";

                }
            );

    },

    cleanSettingsNotices() {

        const modalRoot =
            document.getElementById(
                "modal-root"
            );

        if (!modalRoot) {
            return;
        }

        modalRoot
            .querySelectorAll(
                ".atlas-settings-warning"
            )
            .forEach(
                notice => {

                    const text =
                        String(
                            notice.textContent ||
                            ""
                        )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim()
                            .toLowerCase();

                    const isInitialBalanceNotice =
                        text.includes(
                            "los saldos iniciales"
                        ) &&
                        (
                            text.includes(
                                "movimientos"
                            ) ||
                            text.includes(
                                "ya no se pueden editar"
                            )
                        );

                    if (
                        isInitialBalanceNotice
                    ) {

                        notice.remove();

                    }

                }
            );

    },

    applyInterfaceFixes() {

        this.cleanDashboard();

        this.enhanceNavigation();

        this.cleanSettingsNotices();

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

                budgetMonth:
                    this.budgetMonth,

                currentMonth:
                    this.currentMonthKey(),

                analysisView:
                    this.analysisView,

                trendsPeriod:
                    this.trendsPeriod,

                trendMetric:
                    this.trendMetric,

                movementSearch:
                    this.movementSearch,

                movementTypeFilter:
                    this.movementTypeFilter,

                movementAccountFilter:
                    this.movementAccountFilter,

                movementMinimumAmount:
                    this.movementMinimumAmount,

                movementMaximumAmount:
                    this.movementMaximumAmount,

                movementDateFrom:
                    this.movementDateFrom,

                movementDateTo:
                    this.movementDateTo,

                movementFilters: {

                    search:
                        this.movementSearch,

                    type:
                        this.movementTypeFilter,

                    accountId:
                        this.movementAccountFilter,

                    minimumAmount:
                        this.movementMinimumAmount,

                    maximumAmount:
                        this.movementMaximumAmount,

                    dateFrom:
                        this.movementDateFrom,

                    dateTo:
                        this.movementDateTo,

                    active:
                        this.hasMovementFilters()

                },

                isCurrentAnalysisMonth:
                    this.isCurrentAnalysisMonth(),

                isCurrentMovementsMonth:
                    this.isCurrentMovementsMonth(),

                isCurrentBudgetMonth:
                    this.isCurrentBudgetMonth()

            }
        );

        this.applyInterfaceFixes();

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
                "Se eliminarán las cuentas, saldos, movimientos, cierres y configuraciones guardadas en este dispositivo."
            );

        if (!confirmed) {
            return;
        }

        this.data =
            AtlasStorage.reset();

        const currentMonth =
            this.currentMonthKey();

        this.route =
            "home";

        this.analysisMonth =
            currentMonth;

        this.movementsMonth =
            currentMonth;

        this.budgetMonth =
            currentMonth;

        this.analysisView =
            "monthly";

        this.trendsPeriod =
            6;

        this.trendMetric =
            "savings";

        this.resetMovementFiltersState();

        this.render();

        AtlasSetup.open(
            this.data,
            updatedData => {

                this.data =
                    updatedData;

                this.route =
                    "home";

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

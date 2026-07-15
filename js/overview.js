/* ==========================================================
   ATLAS
   overview.js
   Atlas v1.0 — Inicio mensual dinámico
========================================================== */

const AtlasOverviewCards = {

    expandedCard: null,

    selectedMonth: null,

    data: null,

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    currency(value) {

        return AtlasUI.formatCurrency(
            value
        );

    },

    escape(value) {

        return AtlasUI.escapeHtml(
            value
        );

    },

    currentMonthKey() {

        return AtlasCalculations
            .monthKey();

    },

    shiftMonth(
        monthKey,
        difference
    ) {

        return AtlasCalculations
            .shiftMonthKey(
                monthKey,
                difference
            );

    },

    ensureSelectedMonth() {

        const currentMonth =
            this.currentMonthKey();

        if (
            !this.selectedMonth ||
            !/^\d{4}-\d{2}$/.test(
                this.selectedMonth
            )
        ) {

            this.selectedMonth =
                globalThis.AtlasApp
                    ?.analysisMonth ||
                currentMonth;

        }

        if (
            this.selectedMonth >
            currentMonth
        ) {

            this.selectedMonth =
                currentMonth;

        }

    },

    isCurrentSelectedMonth() {

        return (
            this.selectedMonth ===
            this.currentMonthKey()
        );

    },

    synchronizeSelectedMonth() {

        if (
            !globalThis.AtlasApp
        ) {

            return;

        }

        AtlasApp.analysisMonth =
            this.selectedMonth;

        AtlasApp.movementsMonth =
            this.selectedMonth;

        AtlasApp.budgetMonth =
            this.selectedMonth;

    },

    selectPreviousMonth() {

        this.ensureSelectedMonth();

        this.selectedMonth =
            this.shiftMonth(
                this.selectedMonth,
                -1
            );

        this.synchronizeSelectedMonth();

        this.renderDashboard();

    },

    selectNextMonth() {

        this.ensureSelectedMonth();

        if (
            this.isCurrentSelectedMonth()
        ) {

            return;

        }

        const nextMonth =
            this.shiftMonth(
                this.selectedMonth,
                1
            );

        this.selectedMonth =
            nextMonth >
                this.currentMonthKey()
                ? this.currentMonthKey()
                : nextMonth;

        this.synchronizeSelectedMonth();

        this.renderDashboard();

    },

    selectCurrentMonth() {

        this.selectedMonth =
            this.currentMonthKey();

        this.synchronizeSelectedMonth();

        this.renderDashboard();

    },

    openSelectedMonthAnalysis() {

        this.ensureSelectedMonth();

        this.synchronizeSelectedMonth();

        if (
            !globalThis.AtlasApp
        ) {

            return;

        }

        AtlasApp.analysisView =
            "monthly";

        AtlasApp.route =
            "analysis";

        AtlasApp.render();

        window.scrollTo({

            top: 0,

            behavior:
                "smooth"

        });

    },

    accountsByGroup(
        data,
        group
    ) {

        return (
            data?.accounts || []
        )
            .filter(
                account =>
                    account.group ===
                        group &&
                    account.active !==
                        false
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const balanceDifference =
                        Math.abs(
                            this.number(
                                second.balance
                            )
                        ) -
                        Math.abs(
                            this.number(
                                first.balance
                            )
                        );

                    if (
                        balanceDifference !==
                        0
                    ) {

                        return balanceDifference;

                    }

                    return (
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        )
                    );

                }
            );

    },

    relevantLiquidityAccounts(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "liquidity"
            );

        const withBalance =
            accounts.filter(
                account =>
                    Math.abs(
                        this.number(
                            account.balance
                        )
                    ) > 0
            );

        return withBalance.length > 0
            ? withBalance
            : accounts;

    },

    relevantInvestmentAccounts(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "investment"
            );

        const withValue =
            accounts.filter(
                account =>
                    Math.abs(
                        this.number(
                            account.balance
                        )
                    ) > 0 ||
                    Math.abs(
                        this.number(
                            account.invested
                        )
                    ) > 0
            );

        return withValue.length > 0
            ? withValue
            : accounts;

    },

    relevantDebtAccounts(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "debt"
            );

        const withDebt =
            accounts.filter(
                account =>
                    Math.max(
                        0,
                        this.number(
                            account.balance
                        )
                    ) > 0
            );

        return withDebt.length > 0
            ? withDebt
            : accounts;

    },

    liquidityDetails(data) {

        const accounts =
            this.relevantLiquidityAccounts(
                data
            );

        return {

            rows:
                accounts
                    .slice(
                        0,
                        3
                    )
                    .map(
                        account => ({

                            name:
                                account.name,

                            value:
                                this.number(
                                    account.balance
                                ),

                            secondary:
                                ""

                        })
                    ),

            hiddenCount:
                Math.max(
                    0,
                    accounts.length - 3
                ),

            footer:
                ""

        };

    },

    investmentDetails(data) {

        const accounts =
            this.relevantInvestmentAccounts(
                data
            );

        const totalValue =
            accounts.reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    this.number(
                        account.balance
                    ),
                0
            );

        const totalInvested =
            accounts.reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    this.number(
                        account.invested
                    ),
                0
            );

        const gain =
            totalValue -
            totalInvested;

        return {

            rows:
                accounts
                    .slice(
                        0,
                        3
                    )
                    .map(
                        account => ({

                            name:
                                account.name,

                            value:
                                this.number(
                                    account.balance
                                ),

                            secondary:
                                `Aportado ${this.currency(
                                    account.invested
                                )}`

                        })
                    ),

            hiddenCount:
                Math.max(
                    0,
                    accounts.length - 3
                ),

            footer:
                accounts.length > 0
                    ? `Aportado ${this.currency(
                        totalInvested
                    )} · ${
                        gain >= 0
                            ? "Ganancia"
                            : "Pérdida"
                    } ${this.currency(
                        Math.abs(
                            gain
                        )
                    )}`
                    : ""

        };

    },

    debtAccountType(account) {

        if (
            account.type ===
                "credit_card" ||
            account.kind ===
                "credit_card"
        ) {

            return "Tarjeta";

        }

        if (
            account.type ===
                "loan" ||
            account.kind ===
                "loan"
        ) {

            return "Préstamo";

        }

        return "Deuda";

    },

    debtDetails(data) {

        const accounts =
            this.relevantDebtAccounts(
                data
            );

        return {

            rows:
                accounts
                    .slice(
                        0,
                        3
                    )
                    .map(
                        account => ({

                            name:
                                account.name,

                            value:
                                Math.max(
                                    0,
                                    this.number(
                                        account.balance
                                    )
                                ),

                            secondary:
                                this.debtAccountType(
                                    account
                                )

                        })
                    ),

            hiddenCount:
                Math.max(
                    0,
                    accounts.length - 3
                ),

            footer:
                ""

        };

    },

    detailsFor(
        type,
        data
    ) {

        switch (type) {

            case "liquidity":

                return this.liquidityDetails(
                    data
                );

            case "investments":

                return this.investmentDetails(
                    data
                );

            case "debt":

                return this.debtDetails(
                    data
                );

            default:

                return {

                    rows: [],

                    hiddenCount: 0,

                    footer: ""

                };

        }

    },

    detailRows(details) {

        if (
            details.rows.length ===
            0
        ) {

            return `

                <div class="atlas-overview-empty">
                    No hay cuentas configuradas.
                </div>

            `;

        }

        return `

            <div class="atlas-overview-details">

                ${details.rows
                    .map(
                        row => `

                            <div class="atlas-overview-row">

                                <div class="atlas-overview-row-text">

                                    <strong>
                                        ${this.escape(
                                            row.name
                                        )}
                                    </strong>

                                    ${
                                        row.secondary
                                            ? `

                                                <small>
                                                    ${this.escape(
                                                        row.secondary
                                                    )}
                                                </small>

                                            `
                                            : ""
                                    }

                                </div>

                                <strong
                                    class="atlas-overview-row-value"
                                >
                                    ${this.currency(
                                        row.value
                                    )}
                                </strong>

                            </div>

                        `
                    )
                    .join("")}

                ${
                    details.hiddenCount >
                    0
                        ? `

                            <small class="atlas-overview-more">

                                +${details.hiddenCount}
                                ${
                                    details.hiddenCount ===
                                    1
                                        ? "cuenta más"
                                        : "cuentas más"
                                }

                            </small>

                        `
                        : ""
                }

                ${
                    details.footer
                        ? `

                            <small class="atlas-overview-footer">
                                ${this.escape(
                                    details.footer
                                )}
                            </small>

                        `
                        : ""
                }

            </div>

        `;

    },

    interactiveCard({

        type,

        icon,

        label,

        value,

        data

    }) {

        const expanded =
            this.expandedCard ===
            type;

        const details =
            this.detailsFor(
                type,
                data
            );

        return `

            <button
                class="
                    card
                    atlas-overview-card
                    ${
                        expanded
                            ? "atlas-overview-card-expanded"
                            : ""
                    }
                "
                type="button"
                data-overview-card="${type}"
                aria-expanded="${
                    expanded
                        ? "true"
                        : "false"
                }"
            >

                <div class="atlas-overview-head">

                    <div>

                        <div class="label">
                            ${icon}
                            ${label}
                        </div>

                        <div class="num">
                            ${this.currency(
                                value
                            )}
                        </div>

                    </div>

                    <span
                        class="atlas-overview-arrow"
                        aria-hidden="true"
                    >
                        ⌄
                    </span>

                </div>

                ${
                    expanded
                        ? this.detailRows(
                            details
                        )
                        : ""
                }

            </button>

        `;

    },

    monthlyKpi({

        label,

        value,

        color,

        subtitle = ""

    }) {

        return `

            <div class="atlas-home-month-kpi">

                <small class="note">
                    ${label}
                </small>

                <strong
                    style="
                        color:${color};
                    "
                >
                    ${this.currency(
                        value
                    )}
                </strong>

                ${
                    subtitle
                        ? `

                            <small class="atlas-home-month-kpi-subtitle">
                                ${subtitle}
                            </small>

                        `
                        : ""
                }

            </div>

        `;

    },

    monthlyPanel(data) {

        this.ensureSelectedMonth();

        const currentMonth =
            this.currentMonthKey();

        const isCurrentMonth =
            this.selectedMonth ===
            currentMonth;

        const summary =
            AtlasCalculations
                .financialSummary(
                    data,
                    this.selectedMonth
                );

        const income =
            this.number(
                summary.monthlyIncome
            );

        const expenses =
            this.number(
                summary.monthlyExpenses
            );

        const invested =
            this.number(
                summary.monthlyInvested
            );

        const savings =
            this.number(
                summary.monthlySavings
            );

        const savingRate =
            income > 0
                ? (
                    savings /
                    income
                ) * 100
                : 0;

        return `

            <section class="panel atlas-home-month">

                <div class="atlas-home-month-navigation">

                    <button
                        class="atlas-home-month-arrow"
                        type="button"
                        data-overview-month-action="previous"
                        aria-label="Mes anterior"
                    >
                        ‹
                    </button>

                    <button
                        class="atlas-home-month-title"
                        type="button"
                        data-overview-month-action="analysis"
                        aria-label="Abrir análisis de ${
                            this.escape(
                                AtlasUI.formatMonthKey(
                                    this.selectedMonth
                                )
                            )
                        }"
                    >

                        <small class="label">
                            Mes
                        </small>

                        <strong>
                            ${this.escape(
                                AtlasUI.formatMonthKey(
                                    this.selectedMonth
                                )
                            )}
                        </strong>

                        <span>
                            ${
                                isCurrentMonth
                                    ? "Mes actual"
                                    : "Histórico mensual"
                            }
                        </span>

                    </button>

                    <button
                        class="atlas-home-month-arrow"
                        type="button"
                        data-overview-month-action="next"
                        aria-label="Mes siguiente"
                        ${
                            isCurrentMonth
                                ? "disabled"
                                : ""
                        }
                    >
                        ›
                    </button>

                </div>

                ${
                    !isCurrentMonth
                        ? `

                            <button
                                class="atlas-home-month-current"
                                type="button"
                                data-overview-month-action="current"
                            >
                                Volver al mes actual
                            </button>

                        `
                        : ""
                }

                <div class="atlas-home-month-grid">

                    ${this.monthlyKpi({

                        label:
                            "Ingresos",

                        value:
                            income,

                        color:
                            "var(--color-success)"

                    })}

                    ${this.monthlyKpi({

                        label:
                            "Gastos",

                        value:
                            expenses,

                        color:
                            "var(--color-danger)"

                    })}

                    ${this.monthlyKpi({

                        label:
                            "Invertido",

                        value:
                            invested,

                        color:
                            "var(--color-primary)"

                    })}

                    ${this.monthlyKpi({

                        label:
                            "Ahorro",

                        value:
                            savings,

                        color:
                            savings >= 0
                                ? "var(--color-success)"
                                : "var(--color-danger)",

                        subtitle:
                            income > 0
                                ? `${AtlasUI.formatPercent(
                                    savingRate
                                )}`
                                : ""

                    })}

                </div>

            </section>

        `;

    },

    dashboard(data) {

        this.data =
            data;

        this.ensureSelectedMonth();

        const summary =
            AtlasCalculations
                .financialSummary(
                    data
                );

        const cumulativeSavings =
            AtlasUI.cumulativeSavings(
                data
            );

        return `

            <div
                class="
                    app
                    atlas-overview-dashboard
                    ${
                        this.expandedCard
                            ? "atlas-overview-dashboard-expanded"
                            : ""
                    }
                "
            >

                <header class="header atlas-home-header">

                    <div class="brand">

                        <div class="logo atlas-home-logo">
                            A
                        </div>

                        <div>

                            <b>
                                ATLAS
                            </b>

                            <small>
                                ${AtlasUI.shortDate()}
                            </small>

                        </div>

                    </div>

                    <button
                        class="iconbtn atlas-home-settings"
                        type="button"
                        data-action="openSettings"
                        aria-label="Abrir ajustes"
                    >
                        ⚙︎
                    </button>

                </header>

                <section class="hero atlas-home-hero">

                    <div class="eyebrow">
                        Patrimonio neto
                    </div>

                    <div class="value">
                        ${this.currency(
                            summary.netWorth
                        )}
                    </div>

                    <div class="trend">
                        Liquidez + inversiones − deuda
                    </div>

                </section>

                <div class="grid atlas-overview-grid">

                    ${this.interactiveCard({

                        type:
                            "liquidity",

                        icon:
                            "💵",

                        label:
                            "Liquidez",

                        value:
                            summary.liquidity,

                        data

                    })}

                    ${this.interactiveCard({

                        type:
                            "investments",

                        icon:
                            "📈",

                        label:
                            "Inversiones",

                        value:
                            summary.investments,

                        data

                    })}

                    ${this.interactiveCard({

                        type:
                            "debt",

                        icon:
                            "💳",

                        label:
                            "Deuda",

                        value:
                            summary.debt,

                        data

                    })}

                    <button
                        class="card atlas-overview-savings"
                        type="button"
                        data-route="analysis"
                    >

                        <div class="label">
                            🐷 Ahorro acumulado
                        </div>

                        <div
                            class="num"
                            style="
                                color:${
                                    cumulativeSavings >= 0
                                        ? "var(--color-success)"
                                        : "var(--color-danger)"
                                };
                            "
                        >
                            ${this.currency(
                                cumulativeSavings
                            )}
                        </div>

                    </button>

                </div>

                ${this.monthlyPanel(
                    data
                )}

            </div>

        `;

    },

    renderDashboard() {

        if (!this.data) {

            return;

        }

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {

            return;

        }

        app.innerHTML =
            this.dashboard(
                this.data
            );

        document
            .querySelectorAll(
                ".tabbar button[data-route]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.route ===
                            "home"
                    );

                }
            );

        AtlasUI.bindDynamicControls();

    },

    installStyles() {

        const previousStyle =
            document.getElementById(
                "atlas-overview-styles"
            );

        if (previousStyle) {

            previousStyle.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-overview-styles";

        style.textContent = `

            .atlas-overview-dashboard {
                min-height: auto;
                padding-bottom:
                    calc(
                        78px +
                        env(
                            safe-area-inset-bottom
                        )
                    );
            }

            .atlas-home-header {
                margin-bottom: 10px;
            }

            .atlas-home-logo {
                width: 40px;
                height: 40px;
            }

            .atlas-home-settings {
                width: 40px;
                height: 40px;
                font-size: 20px;
            }

            .atlas-home-hero {
                min-height: 0;
                margin-bottom: 10px;
                padding: 14px 18px;
            }

            .atlas-home-hero .eyebrow {
                font-size: 11px;
            }

            .atlas-home-hero .value {
                margin-top: 4px;
                font-size: 34px;
                line-height: 1.05;
            }

            .atlas-home-hero .trend {
                margin-top: 5px;
                font-size: 11px;
            }

            .atlas-overview-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 8px;
                margin:
                    0
                    0
                    9px;
            }

            .atlas-overview-card,
            .atlas-overview-savings {
                min-width: 0;
                min-height: 78px;
                padding: 11px 12px;
                color: inherit;
                text-align: left;
                -webkit-tap-highlight-color:
                    transparent;
            }

            .atlas-overview-card-expanded {
                grid-column:
                    1 / -1;
                min-height: 142px;
                padding:
                    13px
                    14px;
            }

            .atlas-overview-head {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 10px;
            }

            .atlas-overview-card .label,
            .atlas-overview-savings .label {
                font-size: 11px;
                white-space: nowrap;
            }

            .atlas-overview-card .num,
            .atlas-overview-savings .num {
                margin-top: 6px;
                font-size: 20px;
                line-height: 1.05;
            }

            .atlas-overview-card-expanded .num {
                font-size: 22px;
            }

            .atlas-overview-arrow {
                flex: 0 0 auto;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 17px;
                line-height: 1;
                transition:
                    transform
                    0.2s ease;
            }

            .atlas-overview-card-expanded
            .atlas-overview-arrow {
                transform:
                    rotate(
                        180deg
                    );
            }

            .atlas-overview-details {
                display: flex;
                flex-direction: column;
                gap: 7px;
                margin-top: 10px;
                padding-top: 9px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.12
                    );
            }

            .atlas-overview-row {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 12px;
            }

            .atlas-overview-row-text {
                min-width: 0;
            }

            .atlas-overview-row-text strong {
                display: block;
                overflow: hidden;
                color: #f7f8fc;
                font-size: 12px;
                line-height: 1.25;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-overview-row-text small {
                display: block;
                margin-top: 2px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-overview-row-value {
                flex: 0 0 auto;
                color: #f7f8fc;
                font-size: 12px;
                white-space: nowrap;
            }

            .atlas-overview-more {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-overview-footer {
                display: block;
                margin-top: 2px;
                padding-top: 7px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-overview-empty {
                padding:
                    12px
                    0
                    4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 12px;
            }

            .atlas-home-month {
                width: 100%;
                margin: 0;
                padding:
                    11px
                    13px
                    13px;
                color: inherit;
            }

            .atlas-home-month-navigation {
                display: grid;
                grid-template-columns:
                    42px
                    minmax(0, 1fr)
                    42px;
                align-items: center;
                gap: 8px;
            }

            .atlas-home-month-arrow {
                width: 42px;
                height: 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 14px;
                color: #f7f8fc;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.04
                    );
                font-size: 28px;
                line-height: 1;
            }

            .atlas-home-month-arrow:disabled {
                opacity: 0.28;
            }

            .atlas-home-month-title {
                min-width: 0;
                min-height: 46px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding:
                    2px
                    8px;
                color: inherit;
                background: transparent;
                text-align: center;
            }

            .atlas-home-month-title .label {
                font-size: 9px;
            }

            .atlas-home-month-title strong {
                display: block;
                max-width: 100%;
                margin-top: 1px;
                overflow: hidden;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-home-month-title span {
                display: block;
                margin-top: 2px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-home-month-current {
                width: 100%;
                min-height: 32px;
                margin-top: 5px;
                border-radius: 11px;
                color:
                    var(
                        --color-primary
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.08
                    );
                font-size: 10px;
                font-weight: 750;
            }

            .atlas-home-month-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        4,
                        minmax(0, 1fr)
                    );
                gap: 5px;
                margin-top: 9px;
                padding-top: 9px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-home-month-kpi {
                min-width: 0;
                text-align: center;
            }

            .atlas-home-month-kpi > small {
                display: block;
                overflow: hidden;
                font-size: 8px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-home-month-kpi > strong {
                display: block;
                margin-top: 3px;
                overflow: hidden;
                font-size: 11px;
                line-height: 1.1;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-home-month-kpi-subtitle {
                margin-top: 2px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px !important;
            }

            .atlas-overview-dashboard-expanded {
                height: auto !important;
                min-height:
                    calc(
                        100dvh -
                        68px -
                        env(
                            safe-area-inset-bottom
                        )
                    ) !important;
                justify-content:
                    flex-start !important;
                overflow-x: hidden !important;
                overflow-y: auto !important;
                padding-bottom:
                    calc(
                        102px +
                        env(
                            safe-area-inset-bottom
                        )
                    ) !important;
            }

            @media (
                max-width: 360px
            ) {

                .atlas-home-month {
                    padding:
                        10px
                        10px
                        12px;
                }

                .atlas-home-month-navigation {
                    grid-template-columns:
                        38px
                        minmax(0, 1fr)
                        38px;
                    gap: 5px;
                }

                .atlas-home-month-arrow {
                    width: 38px;
                    height: 38px;
                }

                .atlas-home-month-grid {
                    gap: 3px;
                }

                .atlas-home-month-kpi > strong {
                    font-size: 10px;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const monthActionButton =
                    event.target.closest(
                        "[data-overview-month-action]"
                    );

                if (monthActionButton) {

                    event.preventDefault();

                    const action =
                        monthActionButton.dataset
                            .overviewMonthAction;

                    if (
                        action ===
                        "previous"
                    ) {

                        this.selectPreviousMonth();

                        return;

                    }

                    if (
                        action ===
                        "next"
                    ) {

                        this.selectNextMonth();

                        return;

                    }

                    if (
                        action ===
                        "current"
                    ) {

                        this.selectCurrentMonth();

                        return;

                    }

                    if (
                        action ===
                        "analysis"
                    ) {

                        this.openSelectedMonthAnalysis();

                        return;

                    }

                }

                const card =
                    event.target.closest(
                        "[data-overview-card]"
                    );

                if (!card) {

                    return;

                }

                event.preventDefault();

                const type =
                    card.dataset
                        .overviewCard;

                this.expandedCard =
                    this.expandedCard ===
                        type
                        ? null
                        : type;

                this.renderDashboard();

            }
        );

    },

    init() {

        this.installStyles();

        this.bindEvents();

        AtlasUI.dashboard =
            data =>
                this.dashboard(
                    data
                );

    }

};

AtlasOverviewCards.init();

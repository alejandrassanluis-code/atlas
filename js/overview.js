/* ==========================================================
   ATLAS
   overview.js
   Sprint 5.4 — Tarjetas globales interactivas
========================================================== */

const AtlasOverviewCards = {

    expandedCard: null,

    data: null,

    originalDashboard:
        AtlasUI.dashboard.bind(
            AtlasUI
        ),

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

    accountsByGroup(
        data,
        group
    ) {

        return (
            data?.accounts || []
        )
            .filter(
                account =>
                    account.group === group &&
                    account.active !== false
            )
            .sort(
                (a, b) => {

                    const balanceDifference =
                        Math.abs(
                            this.number(
                                b.balance
                            )
                        ) -
                        Math.abs(
                            this.number(
                                a.balance
                            )
                        );

                    if (
                        balanceDifference !== 0
                    ) {

                        return balanceDifference;

                    }

                    return (
                        this.number(
                            a.order
                        ) -
                        this.number(
                            b.order
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
                    .slice(0, 3)
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
                (total, account) =>
                    total +
                    this.number(
                        account.balance
                    ),
                0
            );

        const totalInvested =
            accounts.reduce(
                (total, account) =>
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
                    .slice(0, 3)
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
                        Math.abs(gain)
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
            account.type === "loan" ||
            account.kind === "loan"
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
                    .slice(0, 3)
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
            details.rows.length === 0
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
                    details.hiddenCount > 0
                        ? `

                            <small class="atlas-overview-more">

                                +${details.hiddenCount}
                                ${
                                    details.hiddenCount === 1
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
            this.expandedCard === type;

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

    dashboard(data) {

        this.data =
            data;

        const summary =
            AtlasCalculations
                .financialSummary(
                    data
                );

        const cumulativeSavings =
            AtlasUI.cumulativeSavings(
                data
            );

        const income =
            this.number(
                summary.income
            );

        const expenses =
            this.number(
                summary.expenses
            );

        const invested =
            this.number(
                summary.invested
            );

        const monthlySavings =
            this.number(
                summary.monthlySavings
            );

        const monthlySavingRate =
            income > 0
                ? (
                    monthlySavings /
                    income
                ) * 100
                : 0;

        const monthlySavingColor =
            monthlySavings >= 0
                ? "var(--color-success)"
                : "var(--color-danger)";

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

                <button
                    class="panel atlas-home-month"
                    type="button"
                    data-route="analysis"
                >

                    <div class="atlas-home-month-head">

                        <div>

                            <div class="label">
                                Este mes
                            </div>

                            <strong>
                                ${AtlasUI.currentMonth()}
                            </strong>

                        </div>

                        <div class="atlas-home-month-result">

                            <strong
                                style="
                                    color:
                                        ${monthlySavingColor};
                                "
                            >
                                ${this.currency(
                                    monthlySavings
                                )}
                            </strong>

                            <small class="note">

                                ${
                                    income > 0
                                        ? `${AtlasUI.formatPercent(
                                            monthlySavingRate
                                        )} de ahorro`
                                        : "Ahorro mensual"
                                }

                            </small>

                        </div>

                    </div>

                    <div class="atlas-home-month-grid">

                        <div>

                            <small class="note">
                                Ingresos
                            </small>

                            <strong
                                style="
                                    color:
                                        var(
                                            --color-success
                                        );
                                "
                            >
                                ${this.currency(
                                    income
                                )}
                            </strong>

                        </div>

                        <div>

                            <small class="note">
                                Gastos
                            </small>

                            <strong
                                style="
                                    color:
                                        var(
                                            --color-danger
                                        );
                                "
                            >
                                ${this.currency(
                                    expenses
                                )}
                            </strong>

                        </div>

                        <div>

                            <small class="note">
                                Invertido
                            </small>

                            <strong
                                style="
                                    color:
                                        var(
                                            --color-primary
                                        );
                                "
                            >
                                ${this.currency(
                                    invested
                                )}
                            </strong>

                        </div>

                    </div>

                </button>

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

        if (
            document.getElementById(
                "atlas-overview-styles"
            )
        ) {

            return;

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
                grid-column: 1 / -1;
                min-height: 142px;
                padding: 13px 14px;
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
                padding: 12px 0 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 12px;
            }

            .atlas-home-month {
                display: block;
                width: 100%;
                margin: 0;
                padding: 11px 13px;
                color: inherit;
                text-align: left;
            }

            .atlas-home-month-head {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 10px;
                margin-bottom: 8px;
            }

            .atlas-home-month-head .label {
                font-size: 10px;
            }

            .atlas-home-month-head > div > strong {
                display: block;
                margin-top: 1px;
                font-size: 13px;
            }

            .atlas-home-month-result {
                text-align: right;
            }

            .atlas-home-month-result strong {
                display: block;
                font-size: 16px;
            }

            .atlas-home-month-result small {
                display: block;
                margin-top: 1px;
                font-size: 9px;
            }

            .atlas-home-month-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 7px;
            }

            .atlas-home-month-grid > div {
                min-width: 0;
            }

            .atlas-home-month-grid small {
                display: block;
                font-size: 9px;
            }

            .atlas-home-month-grid strong {
                display: block;
                margin-top: 2px;
                overflow: hidden;
                font-size: 13px;
                text-overflow: ellipsis;
                white-space: nowrap;
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

        `;

        document.head.appendChild(
            style
        );

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

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
                    this.expandedCard === type
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

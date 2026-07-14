/* ==========================================================
   ATLAS
   overview.js
   Sprint 5.4 — Tarjetas globales interactivas
========================================================== */

const AtlasOverviewCards = {

    expandedCard: null,

    data: null,

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    escape(value) {

        return AtlasUI.escapeHtml(
            value
        );

    },

    currency(value) {

        return AtlasUI.formatCurrency(
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

    visibleAccounts(accounts) {

        const accountsWithBalance =
            accounts.filter(
                account =>
                    Math.abs(
                        this.number(
                            account.balance
                        )
                    ) > 0
            );

        const source =
            accountsWithBalance.length > 0
                ? accountsWithBalance
                : accounts;

        return source.slice(
            0,
            3
        );

    },

    liquidityDetails(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "liquidity"
            );

        const visible =
            this.visibleAccounts(
                accounts
            );

        const hiddenCount =
            Math.max(
                0,
                accounts.filter(
                    account =>
                        Math.abs(
                            this.number(
                                account.balance
                            )
                        ) > 0
                ).length -
                visible.length
            );

        return {

            accounts:
                visible.map(
                    account => ({

                        name:
                            account.name,

                        value:
                            this.number(
                                account.balance
                            )

                    })
                ),

            hiddenCount,

            footer:
                ""

        };

    },

    investmentDetails(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "investment"
            );

        const visible =
            this.visibleAccounts(
                accounts
            );

        const relevantAccounts =
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

        const totalInvested =
            relevantAccounts.reduce(
                (total, account) =>
                    total +
                    this.number(
                        account.invested
                    ),
                0
            );

        const currentValue =
            relevantAccounts.reduce(
                (total, account) =>
                    total +
                    this.number(
                        account.balance
                    ),
                0
            );

        const gain =
            currentValue -
            totalInvested;

        const hiddenCount =
            Math.max(
                0,
                relevantAccounts.length -
                visible.length
            );

        return {

            accounts:
                visible.map(
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

            hiddenCount,

            footer:
                totalInvested > 0 ||
                currentValue > 0
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

    debtDetails(data) {

        const accounts =
            this.accountsByGroup(
                data,
                "debt"
            );

        const relevantAccounts =
            accounts.filter(
                account =>
                    Math.max(
                        0,
                        this.number(
                            account.balance
                        )
                    ) > 0
            );

        const source =
            relevantAccounts.length > 0
                ? relevantAccounts
                : accounts;

        const visible =
            source.slice(
                0,
                3
            );

        const hiddenCount =
            Math.max(
                0,
                relevantAccounts.length -
                visible.length
            );

        return {

            accounts:
                visible.map(
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
                            account.type ===
                            "credit_card"
                                ? "Tarjeta"
                                : account.type ===
                                    "loan"
                                    ? "Préstamo"
                                    : "Deuda"

                    })
                ),

            hiddenCount,

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

                    accounts: [],
                    hiddenCount: 0,
                    footer: ""

                };

        }

    },

    detailRows(details) {

        if (
            details.accounts.length === 0
        ) {

            return `

                <div
                    style="
                        padding:10px 0 4px;
                        color:
                            var(
                                --color-text-muted
                            );
                        font-size:12px;
                    "
                >
                    No hay cuentas configuradas.
                </div>

            `;

        }

        return `

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:7px;
                    margin-top:10px;
                    padding-top:9px;
                    border-top:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.12
                        );
                "
            >

                ${details.accounts
                    .map(
                        account => `

                            <div
                                style="
                                    display:flex;
                                    align-items:flex-start;
                                    justify-content:
                                        space-between;
                                    gap:12px;
                                "
                            >

                                <div
                                    style="
                                        min-width:0;
                                    "
                                >

                                    <strong
                                        style="
                                            display:block;
                                            overflow:hidden;
                                            color:#f7f8fc;
                                            font-size:12px;
                                            line-height:1.25;
                                            text-overflow:
                                                ellipsis;
                                            white-space:
                                                nowrap;
                                        "
                                    >
                                        ${this.escape(
                                            account.name
                                        )}
                                    </strong>

                                    ${
                                        account.secondary
                                            ? `

                                                <small
                                                    class="note"
                                                    style="
                                                        display:block;
                                                        margin-top:2px;
                                                        font-size:9px;
                                                    "
                                                >
                                                    ${this.escape(
                                                        account.secondary
                                                    )}
                                                </small>

                                            `
                                            : ""
                                    }

                                </div>

                                <strong
                                    style="
                                        flex:0 0 auto;
                                        color:#f7f8fc;
                                        font-size:12px;
                                        white-space:
                                            nowrap;
                                    "
                                >
                                    ${this.currency(
                                        account.value
                                    )}
                                </strong>

                            </div>

                        `
                    )
                    .join("")}

                ${
                    details.hiddenCount > 0
                        ? `

                            <small
                                class="note"
                                style="
                                    display:block;
                                    margin-top:1px;
                                    font-size:10px;
                                "
                            >
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

                            <small
                                class="note"
                                style="
                                    display:block;
                                    margin-top:2px;
                                    padding-top:7px;
                                    border-top:
                                        1px solid
                                        rgba(
                                            145,
                                            164,
                                            202,
                                            0.1
                                        );
                                    font-size:10px;
                                "
                            >
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
                class="card"
                type="button"
                data-overview-card="${type}"
                aria-expanded="${
                    expanded
                        ? "true"
                        : "false"
                }"
                style="
                    min-width:0;
                    min-height:${
                        expanded
                            ? "132px"
                            : "78px"
                    };
                    grid-column:${
                        expanded
                            ? "1 / -1"
                            : "auto"
                    };
                    padding:${
                        expanded
                            ? "13px 14px"
                            : "11px 12px"
                    };
                    color:inherit;
                    text-align:left;
                    transition:
                        min-height
                        0.2s ease,
                        padding
                        0.2s ease,
                        transform
                        0.16s ease;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        justify-content:
                            space-between;
                        gap:10px;
                    "
                >

                    <div
                        style="
                            min-width:0;
                        "
                    >

                        <div
                            class="label"
                            style="
                                font-size:11px;
                                white-space:nowrap;
                            "
                        >
                            ${icon}
                            ${label}
                        </div>

                        <div
                            class="num"
                            style="
                                margin-top:6px;
                                font-size:${
                                    expanded
                                        ? "22px"
                                        : "20px"
                                };
                                line-height:1.05;
                            "
                        >
                            ${this.currency(
                                value
                            )}
                        </div>

                    </div>

                    <span
                        aria-hidden="true"
                        style="
                            flex:0 0 auto;
                            color:
                                var(
                                    --color-text-muted
                                );
                            font-size:17px;
                            line-height:1;
                            transform:
                                rotate(
                                    ${
                                        expanded
                                            ? "180deg"
                                            : "0deg"
                                    }
                                );
                            transition:
                                transform
                                0.2s ease;
                        "
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
                class="app"
                style="
                    min-height:auto;
                    padding-bottom:
                        calc(
                            78px +
                            env(
                                safe-area-inset-bottom
                            )
                        );
                "
            >

                <header
                    class="header"
                    style="
                        margin-bottom:10px;
                    "
                >

                    <div class="brand">

                        <div
                            class="logo"
                            style="
                                width:40px;
                                height:40px;
                            "
                        >
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
                        class="iconbtn"
                        type="button"
                        data-action="openSettings"
                        aria-label="Abrir ajustes"
                        style="
                            width:40px;
                            height:40px;
                            font-size:20px;
                        "
                    >
                        ⚙︎
                    </button>

                </header>

                <section
                    class="hero"
                    style="
                        min-height:0;
                        padding:14px 18px;
                        margin-bottom:10px;
                    "
                >

                    <div
                        class="eyebrow"
                        style="
                            font-size:11px;
                        "
                    >
                        Patrimonio neto
                    </div>

                    <div
                        class="value"
                        style="
                            margin-top:4px;
                            font-size:34px;
                            line-height:1.05;
                        "
                    >
                        ${this.currency(
                            summary.netWorth
                        )}
                    </div>

                    <div
                        class="trend"
                        style="
                            margin-top:5px;
                            font-size:11px;
                        "
                    >
                        Liquidez + inversiones − deuda
                    </div>

                </section>

                <div
                    class="grid"
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0,1fr)
                            );
                        gap:8px;
                        margin:0 0 9px;
                    "
                >

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
                        class="card"
                        type="button"
                        data-route="analysis"
                        style="
                            min-width:0;
                            min-height:78px;
                            padding:11px 12px;
                            color:inherit;
                            text-align:left;
                        "
                    >

                        <div
                            class="label"
                            style="
                                font-size:11px;
                                white-space:nowrap;
                            "
                        >
                            🐷 Ahorro acumulado
                        </div>

                        <div
                            class="num"
                            style="
                                margin-top:6px;
                                color:${
                                    cumulativeSavings >= 0
                                        ? "var(--color-success)"
                                        : "var(--color-danger)"
                                };
                                font-size:20px;
                                line-height:1.05;
                            "
                        >
                            ${this.currency(
                                cumulativeSavings
                            )}
                        </div>

                    </button>

                </div>

                <button
                    class="panel"
                    type="button"
                    data-route="analysis"
                    style="
                        display:block;
                        width:100%;
                        margin:0;
                        padding:11px 13px;
                        color:inherit;
                        text-align:left;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:
                                space-between;
                            gap:10px;
                            margin-bottom:8px;
                        "
                    >

                        <div>

                            <div
                                class="label"
                                style="
                                    font-size:10px;
                                "
                            >
                                Este mes
                            </div>

                            <strong
                                style="
                                    display:block;
                                    margin-top:1px;
                                    font-size:13px;
                                "
                            >
                                ${AtlasUI.currentMonth()}
                            </strong>

                        </div>

                        <div
                            style="
                                text-align:right;
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    color:
                                        ${monthlySavingColor};
                                    font-size:16px;
                                "
                            >
                                ${this.currency(
                                    monthlySavings
                                )}
                            </strong>

                            <small
                                class="note"
                                style="
                                    display:block;
                                    margin-top:1px;
                                    font-size:9px;
                                "
                            >
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

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    3,
                                    minmax(0,1fr)
                                );
                            gap:7px;
                        "
                    >

                        <div
                            style="
                                min-width:0;
                            "
                        >

                            <small
                                class="note"
                                style="
                                    display:block;
                                    font-size:9px;
                                "
                            >
                                Ingresos
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:2px;
                                    overflow:hidden;
                                    color:
                                        var(
                                            --color-success
                                        );
                                    font-size:13px;
                                    text-overflow:
                                        ellipsis;
                                    white-space:nowrap;
                                "
                            >
                                ${this.currency(
                                    income
                                )}
                            </strong>

                        </div>

                        <div
                            style="
                                min-width:0;
                            "
                        >

                            <small
                                class="note"
                                style="
                                    display:block;
                                    font-size:9px;
                                "
                            >
                                Gastos
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:2px;
                                    overflow:hidden;
                                    color:
                                        var(
                                            --color-danger
                                        );
                                    font-size:13px;
                                    text-overflow:
                                        ellipsis;
                                    white-space:nowrap;
                                "
                            >
                                ${this.currency(
                                    expenses
                                )}
                            </strong>

                        </div>

                        <div
                            style="
                                min-width:0;
                            "
                        >

                            <small
                                class="note"
                                style="
                                    display:block;
                                    font-size:9px;
                                "
                            >
                                Invertido
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:2px;
                                    overflow:hidden;
                                    color:
                                        var(
                                            --color-primary
                                        );
                                    font-size:13px;
                                    text-overflow:
                                        ellipsis;
                                    white-space:nowrap;
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
            AtlasUI.dashboard(
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

    bindCards() {

        document
            .querySelectorAll(
                "[data-overview-card]"
            )
            .forEach(
                card => {

                    if (
                        card.dataset
                            .overviewBound ===
                        "true"
                    ) {

                        return;

                    }

                    card.dataset
                        .overviewBound =
                        "true";

                    card.addEventListener(
                        "click",
                        () => {

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

                }
            );

    }

};


/* ==========================================================
   INTEGRACIÓN CON AtlasUI
========================================================== */

AtlasOverviewCards.originalDashboard =
    AtlasUI.dashboard.bind(
        AtlasUI
    );

AtlasOverviewCards.originalBindDynamicControls =
    AtlasUI.bindDynamicControls.bind(
        AtlasUI
    );

AtlasUI.dashboard = function(data) {

    return AtlasOverviewCards.dashboard(
        data
    );

};

AtlasUI.bindDynamicControls = function() {

    AtlasOverviewCards
        .originalBindDynamicControls();

    AtlasOverviewCards.bindCards();

};

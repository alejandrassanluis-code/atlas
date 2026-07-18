/* ==========================================================
   ATLAS
   movement-summary-periods.js
   Diferencia operaciones reales, resultado económico y caja
========================================================== */

const AtlasMovementSummaryPeriods = {

    initialized:
        false,

    context: {

        data:
            null,

        monthKey:
            ""

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    firstNumber(
        source,
        keys,
        fallback = 0
    ) {

        for (
            const key of keys
        ) {

            const value =
                source?.[key];

            if (
                value !== null &&
                value !== undefined &&
                Number.isFinite(
                    Number(value)
                )
            ) {

                return Number(value);

            }

        }

        return this.number(
            fallback
        );

    },

    financialSummary(
        data,
        monthKey
    ) {

        if (
            typeof AtlasCalculations ===
                "undefined" ||
            typeof AtlasCalculations
                .financialSummary !==
                "function"
        ) {

            return {};

        }

        try {

            return (
                AtlasCalculations
                    .financialSummary(
                        data,
                        monthKey
                    ) ||
                {}
            );

        } catch (error) {

            return {};

        }

    },

    visibleSummary(list) {

        if (
            typeof AtlasMovementFilters
                .movementSummary ===
                "function"
        ) {

            return AtlasMovementFilters
                .movementSummary(
                    list
                );

        }

        return {

            income:
                0,

            expenses:
                0,

            invested:
                0,

            debtPayments:
                0,

            transfers:
                0

        };

    },

    monthlyResults(
        data,
        monthKey
    ) {

        const summary =
            this.financialSummary(
                data,
                monthKey
            );

        const income =
            this.firstNumber(
                summary,
                [
                    "income",
                    "monthlyIncome",
                    "totalIncome"
                ],
                0
            );

        const expenses =
            this.firstNumber(
                summary,
                [
                    "expenses",
                    "monthlyExpenses",
                    "netExpenses",
                    "totalExpenses"
                ],
                0
            );

        const invested =
            this.firstNumber(
                summary,
                [
                    "invested",
                    "monthlyInvested",
                    "monthlyInvestment",
                    "totalInvested"
                ],
                0
            );

        const economicResult =
            this.firstNumber(
                summary,
                [
                    "monthlySavings",
                    "savings",
                    "netSavings"
                ],
                income -
                expenses -
                invested
            );

        const cashResult =
            this.firstNumber(
                summary,
                [
                    "monthlyCashResult",
                    "cashResult",
                    "netCashFlow",
                    "cashFlow",
                    "liquidityResult"
                ],
                economicResult
            );

        return {

            income,

            expenses,

            invested,

            economicResult,

            cashResult

        };

    },

    metricCard(
        icon,
        label,
        value,
        color,
        subtitle = ""
    ) {

        return `

            <article
                class="atlas-movement-summary-card"
            >

                <small>
                    ${icon}
                    ${label}
                </small>

                <strong
                    style="
                        color:${color};
                    "
                >
                    ${AtlasUI.formatCurrency(
                        value
                    )}
                </strong>

                ${
                    subtitle
                        ? `

                            <span
                                class="
                                    atlas-movement-summary-detail
                                "
                            >
                                ${AtlasUI.escapeHtml(
                                    subtitle
                                )}
                            </span>

                        `
                        : ""
                }

            </article>

        `;

    },

    sectionTitle(
        title,
        description
    ) {

        return `

            <div
                style="
                    grid-column:
                        1 / -1;
                    padding:
                        2px
                        2px
                        0;
                "
            >

                <strong
                    style="
                        display:block;
                        font-size:13px;
                    "
                >
                    ${AtlasUI.escapeHtml(
                        title
                    )}
                </strong>

                <small
                    class="note"
                    style="
                        display:block;
                        margin-top:4px;
                        font-size:10px;
                        line-height:1.4;
                    "
                >
                    ${AtlasUI.escapeHtml(
                        description
                    )}
                </small>

            </div>

        `;

    },

    renderSummary(list) {

        const data =
            this.context.data ||
            (
                typeof AtlasApp !==
                    "undefined"
                    ? AtlasApp.data
                    : null
            );

        const monthKey =
            this.context.monthKey ||
            (
                typeof AtlasCalculations !==
                    "undefined"
                    ? AtlasCalculations
                        .monthKey()
                    : ""
            );

        const visible =
            this.visibleSummary(
                list
            );

        const monthly =
            this.monthlyResults(
                data,
                monthKey
            );

        const economicColor =
            monthly.economicResult >= 0
                ? "var(--color-success)"
                : "var(--color-danger)";

        const cashColor =
            monthly.cashResult >= 0
                ? "var(--color-success)"
                : "var(--color-danger)";

        return `

            <section
                class="atlas-movement-summary"
            >

                ${this.sectionTitle(
                    "Operaciones reales mostradas",
                    "Estas cifras corresponden a los movimientos de la lista según su fecha real y los filtros aplicados."
                )}

                ${this.metricCard(
                    "🟢",
                    "Ingresos",
                    visible.income,
                    "var(--color-success)"
                )}

                ${this.metricCard(
                    "🔴",
                    "Gastos netos",
                    visible.expenses,
                    "var(--color-danger)"
                )}

                ${this.metricCard(
                    "📈",
                    "Invertido",
                    visible.invested,
                    "#9d8cff"
                )}

                ${this.metricCard(
                    "💳",
                    "Pagos de deuda",
                    visible.debtPayments,
                    "var(--color-primary)"
                )}

                ${this.sectionTitle(
                    "Resultados completos del mes",
                    "El resultado económico usa el mes imputado. El resultado de caja usa la fecha real del movimiento."
                )}

                ${this.metricCard(
                    "◎",
                    "Resultado económico",
                    monthly.economicResult,
                    economicColor,
                    "Ingresos − gastos − inversión"
                )}

                ${this.metricCard(
                    "💵",
                    "Resultado de caja",
                    monthly.cashResult,
                    cashColor,
                    "Entradas y salidas reales de liquidez"
                )}

            </section>

        `;

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasMovementFilters ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        const originalRender =
            AtlasMovementFilters
                .render
                .bind(
                    AtlasMovementFilters
                );

        AtlasMovementFilters.render = (
            data,
            options = {}
        ) => {

            this.context = {

                data,

                monthKey:
                    options.movementsMonth ||
                    AtlasCalculations
                        .monthKey()

            };

            return originalRender(
                data,
                options
            );

        };

        AtlasMovementFilters.summaryPanel =
            list =>
                this.renderSummary(
                    list
                );

    }

};

AtlasMovementSummaryPeriods.install();

/* ==========================================================
   ATLAS
   analysis.js
   Atlas v1.0 — Análisis financiero avanzado
========================================================== */

const AtlasAnalysisUI = {

    data:
        null,

    options:
        {},

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    currency(value) {

        return AtlasUI.formatCurrency(
            this.number(value)
        );

    },

    percent(value) {

        return AtlasUI.formatPercent(
            this.number(value)
        );

    },

    escape(value) {

        return AtlasUI.escapeHtml(
            value
        );

    },

    formatMonth(monthKey) {

        return AtlasUI.formatMonthKey(
            monthKey
        );

    },

    formatShortMonth(monthKey) {

        return AtlasUI.formatShortMonth(
            monthKey
        );

    },

    clamp(
        value,
        minimum = 0,
        maximum = 100
    ) {

        return Math.max(
            minimum,
            Math.min(
                maximum,
                this.number(value)
            )
        );

    },

    sum(
        collection,
        property
    ) {

        return (
            Array.isArray(collection)
                ? collection
                : []
        ).reduce(
            (
                total,
                item
            ) =>
                total +
                this.number(
                    item?.[property]
                ),
            0
        );

    },

    average(values) {

        const list =
            (
                Array.isArray(values)
                    ? values
                    : []
            ).map(
                value =>
                    this.number(value)
            );

        if (
            list.length === 0
        ) {

            return 0;

        }

        return list.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        ) / list.length;

    },

    median(values) {

        const list =
            (
                Array.isArray(values)
                    ? values
                    : []
            )
                .map(
                    value =>
                        this.number(value)
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        first - second
                );

        if (
            list.length === 0
        ) {

            return 0;

        }

        const middle =
            Math.floor(
                list.length / 2
            );

        if (
            list.length % 2 ===
            0
        ) {

            return (
                list[middle - 1] +
                list[middle]
            ) / 2;

        }

        return list[middle];

    },

    statusColor(
        value,
        positiveIsGood = true
    ) {

        const positive =
            this.number(value) >= 0;

        const good =
            positiveIsGood
                ? positive
                : !positive;

        return good
            ? "var(--color-success)"
            : "var(--color-danger)";

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

            return monthKey;

        }

        const date =
            new Date(
                year,
                month - 1 +
                    this.number(
                        difference
                    ),
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

    metricDefinitions() {

        return {

            savings: {

                label:
                    "Ahorro",

                property:
                    "savings",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            },

            income: {

                label:
                    "Ingresos",

                property:
                    "income",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            },

            expenses: {

                label:
                    "Gasto neto",

                property:
                    "expenses",

                positiveIsGood:
                    false,

                percent:
                    false,

                accumulable:
                    true

            },

            grossExpenses: {

                label:
                    "Gasto bruto",

                property:
                    "grossExpenses",

                positiveIsGood:
                    false,

                percent:
                    false,

                accumulable:
                    true

            },

            reimbursements: {

                label:
                    "Reembolsos",

                property:
                    "reimbursements",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            },

            invested: {

                label:
                    "Invertido",

                property:
                    "invested",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            },

            savingRate: {

                label:
                    "Tasa de ahorro",

                property:
                    "savingRate",

                positiveIsGood:
                    true,

                percent:
                    true,

                accumulable:
                    false

            },

            debtPayments: {

                label:
                    "Pagos de deuda",

                property:
                    "debtPayments",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            },

            cashOutflow: {

                label:
                    "Salidas de caja",

                property:
                    "cashOutflow",

                positiveIsGood:
                    false,

                percent:
                    false,

                accumulable:
                    true

            },

            cashResult: {

                label:
                    "Resultado de caja",

                property:
                    "cashResult",

                positiveIsGood:
                    true,

                percent:
                    false,

                accumulable:
                    true

            }

        };

    },

    metricDefinition(metric) {

        const definitions =
            this.metricDefinitions();

        return (
            definitions[metric] ||
            definitions.savings
        );

    },

    metricValue(
        month,
        definition
    ) {

        return this.number(
            month?.[
                definition.property
            ]
        );

    },

    formatMetric(
        value,
        definition
    ) {

        return definition.percent
            ? this.percent(value)
            : this.currency(value);

    },

    comparisonInformation(
        comparison,
        positiveIsGood = true,
        percentagePoint = false
    ) {

        const difference =
            this.number(
                comparison?.difference
            );

        if (
            Math.abs(difference) <
            0.0001
        ) {

            return {

                icon:
                    "•",

                text:
                    "Sin cambios",

                color:
                    "var(--color-text-muted)"

            };

        }

        const rises =
            difference > 0;

        const good =
            positiveIsGood
                ? rises
                : !rises;

        if (percentagePoint) {

            return {

                icon:
                    rises
                        ? "↑"
                        : "↓",

                text:
                    `${Math.abs(
                        difference
                    ).toFixed(1)} p. p.`,

                color:
                    good
                        ? "var(--color-success)"
                        : "var(--color-danger)"

            };

        }

        const percentage =
            comparison?.percentage;

        return {

            icon:
                rises
                    ? "↑"
                    : "↓",

            text:
                (
                    `${this.currency(
                        Math.abs(
                            difference
                        )
                    )}` +
                    (
                        percentage === null ||
                        percentage === undefined
                            ? " · nuevo"
                            : (
                                ` · ${Math.abs(
                                    this.number(
                                        percentage
                                    )
                                ).toFixed(0)}%`
                            )
                    )
                ),

            color:
                good
                    ? "var(--color-success)"
                    : "var(--color-danger)"

        };

    },

    panelHeader(
        title,
        subtitle = "",
        right = ""
    ) {

        return `

            <div class="panelhead atlas-analysis-panel-head">

                <div>

                    <h2>
                        ${this.escape(title)}
                    </h2>

                    ${
                        subtitle
                            ? `

                                <p class="note">
                                    ${this.escape(
                                        subtitle
                                    )}
                                </p>

                            `
                            : ""
                    }

                </div>

                ${
                    right
                        ? `

                            <div class="atlas-analysis-panel-right">
                                ${right}
                            </div>

                        `
                        : ""
                }

            </div>

        `;

    },

    sectionHeading(
        eyebrow,
        title,
        subtitle = ""
    ) {

        return `

            <div class="atlas-analysis-section-heading">

                <small>
                    ${this.escape(
                        eyebrow
                    )}
                </small>

                <h2>
                    ${this.escape(
                        title
                    )}
                </h2>

                ${
                    subtitle
                        ? `

                            <p class="note">
                                ${this.escape(
                                    subtitle
                                )}
                            </p>

                        `
                        : ""
                }

            </div>

        `;

    },

    emptyState(
        icon,
        title,
        text
    ) {

        return `

            <div class="atlas-analysis-empty">

                <div aria-hidden="true">
                    ${icon}
                </div>

                <strong>
                    ${this.escape(title)}
                </strong>

                <p class="note">
                    ${this.escape(text)}
                </p>

            </div>

        `;

    },

    openAttribute(
        panelId,
        defaultOpen = false
    ) {

        const openPanels =
            Array.isArray(
                this.options
                    ?.analysisOpenPanels
            )
                ? this.options
                    .analysisOpenPanels
                : [];

        if (
            openPanels.includes(
                panelId
            )
        ) {

            return "open";

        }

        return defaultOpen
            ? "open"
            : "";

    },

    tabs(activeView) {

        return `

            <div class="atlas-analysis-tabs">

                <button
                    type="button"
                    data-action="showMonthlyAnalysis"
                    class="${
                        activeView ===
                        "monthly"
                            ? "active"
                            : ""
                    }"
                >
                    Mensual
                </button>

                <button
                    type="button"
                    data-action="showTrendsAnalysis"
                    class="${
                        activeView ===
                        "trends"
                            ? "active"
                            : ""
                    }"
                >
                    Evolución
                </button>

            </div>

        `;

    },

    monthSelector(
        monthKey,
        currentMonth
    ) {

        return AtlasUI.monthSelector({

            monthKey,

            isCurrentMonth:
                monthKey ===
                currentMonth,

            previousAction:
                "previousAnalysisMonth",

            nextAction:
                "nextAnalysisMonth",

            currentAction:
                "currentAnalysisMonth",

            subtitle:
                monthKey ===
                currentMonth
                    ? "Mes actual"
                    : "Análisis histórico"

        });

    },

    modeSelector(mode) {

        return `

            <div class="atlas-analysis-mode">

                <button
                    type="button"
                    data-action="setAnalysisMode"
                    data-mode="real"
                    class="${
                        mode === "real"
                            ? "active"
                            : ""
                    }"
                >
                    Real
                </button>

                <button
                    type="button"
                    data-action="setAnalysisMode"
                    data-mode="forecast"
                    class="${
                        mode === "forecast"
                            ? "active"
                            : ""
                    }"
                >
                    Previsión
                </button>

            </div>

        `;

    },

    summaryMetric(
        title,
        value,
        comparison,
        options = {}
    ) {

        const information =
            this.comparisonInformation(
                comparison,
                options.positiveIsGood !==
                    false,
                options.percentagePoint ===
                    true
            );

        const formatter =
            options.percent
                ? this.percent.bind(this)
                : this.currency.bind(this);

        return `

            <article class="atlas-analysis-metric">

                <span class="atlas-analysis-metric-label">
                    ${options.icon || ""}
                    ${this.escape(title)}
                </span>

                <strong
                    class="atlas-analysis-metric-value"
                    style="
                        color:
                            ${
                                options.color ||
                                "var(--color-text)"
                            };
                    "
                >
                    ${formatter(value)}
                </strong>

                <small
                    style="
                        color:
                            ${information.color};
                    "
                >
                    ${information.icon}
                    ${information.text}
                    vs. mes anterior
                </small>

                ${
                    options.detail
                        ? `

                            <span class="atlas-analysis-metric-detail">
                                ${this.escape(
                                    options.detail
                                )}
                            </span>

                        `
                        : ""
                }

            </article>

        `;

    },

    monthlyDisplaySummary(
        summary,
        forecast,
        mode
    ) {

        if (
            mode !== "forecast"
        ) {

            return {

                monthlyIncome:
                    summary.monthlyIncome,

                monthlyGrossExpenses:
                    summary.monthlyGrossExpenses,

                monthlyReimbursements:
                    summary.monthlyReimbursements,

                monthlyExpenses:
                    summary.monthlyExpenses,

                monthlyInvested:
                    summary.monthlyInvested,

                monthlySavings:
                    summary.monthlySavings,

                monthlySavingRate:
                    summary.monthlySavingRate,

                monthlyCashInflow:
                    summary.monthlyCashInflow,

                monthlyCashOutflow:
                    summary.monthlyCashOutflow,

                monthlyCashResult:
                    summary.monthlyCashResult,

                monthlyDebtPayments:
                    summary.monthlyDebtPayments

            };

        }

        const estimatedIncome =
            this.number(
                forecast?.estimated
                    ?.income
            );

        const estimatedExpenses =
            this.number(
                forecast?.estimated
                    ?.expenses
            );

        const estimatedInvested =
            this.number(
                forecast?.estimated
                    ?.invested
            );

        const estimatedSavings =
            this.number(
                forecast?.estimated
                    ?.savings
            );

        const estimatedCashResult =
            this.number(
                forecast?.estimated
                    ?.cashResult
            );

        const estimatedCashInflow =
            this.number(
                summary.monthlyCashInflow
            ) +
            this.number(
                forecast?.pending
                    ?.income
            );

        const estimatedCashOutflow =
            estimatedCashInflow -
            estimatedCashResult;

        const estimatedSavingRate =
            estimatedIncome > 0
                ? (
                    estimatedSavings /
                    estimatedIncome
                ) * 100
                : 0;

        return {

            monthlyIncome:
                estimatedIncome,

            monthlyGrossExpenses:
                this.number(
                    summary.monthlyGrossExpenses
                ) +
                this.number(
                    forecast?.pending
                        ?.expenses
                ),

            monthlyReimbursements:
                summary.monthlyReimbursements,

            monthlyExpenses:
                estimatedExpenses,

            monthlyInvested:
                estimatedInvested,

            monthlySavings:
                estimatedSavings,

            monthlySavingRate:
                estimatedSavingRate,

            monthlyCashInflow:
                estimatedCashInflow,

            monthlyCashOutflow:
                estimatedCashOutflow,

            monthlyCashResult:
                estimatedCashResult,

            monthlyDebtPayments:
                this.number(
                    summary.monthlyDebtPayments
                ) +
                this.number(
                    forecast?.pending
                        ?.debtPayments
                )

        };

    },

    forecastDetail(
        real,
        pending
    ) {

        const pendingNumber =
            this.number(pending);

        const sign =
            pendingNumber > 0
                ? "+"
                : pendingNumber < 0
                    ? "−"
                    : "";

        return (
            `Real ${this.currency(real)} · ` +
            `Pendiente ${sign}${this.currency(
                Math.abs(
                    pendingNumber
                )
            )}`
        );

    },

    monthlySummary(
        summary,
        comparison,
        forecast,
        mode
    ) {

        const display =
            this.monthlyDisplaySummary(
                summary,
                forecast,
                mode
            );

        const forecastMode =
            mode === "forecast";

        const expenseDetail =
            forecastMode
                ? this.forecastDetail(
                    summary.monthlyExpenses,
                    forecast?.pending
                        ?.expenses
                )
                : (
                    this.number(
                        summary
                            .monthlyReimbursements
                    ) >
                    0
                        ? (
                            `Bruto ${this.currency(
                                summary
                                    .monthlyGrossExpenses
                            )} · ` +
                            `Reembolsos ${this.currency(
                                summary
                                    .monthlyReimbursements
                            )}`
                        )
                        : ""
                );

        return `

            <section class="atlas-analysis-section">

                <div class="atlas-analysis-section-title">

                    <div>

                        <h2>
                            ${
                                forecastMode
                                    ? "Resumen estimado"
                                    : "Resumen financiero"
                            }
                        </h2>

                        <p class="note">
                            ${
                                forecastMode
                                    ? "Movimientos confirmados más propuestas pendientes"
                                    : "Solo movimientos confirmados"
                            }
                        </p>

                    </div>

                    ${
                        forecastMode
                            ? `

                                <span class="atlas-analysis-badge">
                                    Previsión
                                </span>

                            `
                            : ""
                    }

                </div>

                <div class="atlas-analysis-grid">

                    ${this.summaryMetric(
                        "Ingresos",
                        display.monthlyIncome,
                        comparison.income,
                        {
                            icon:
                                "🟢",

                            positiveIsGood:
                                true,

                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary
                                            .monthlyIncome,
                                        forecast
                                            ?.pending
                                            ?.income
                                    )
                                    : ""
                        }
                    )}

                    ${this.summaryMetric(
                        "Gastos netos",
                        display.monthlyExpenses,
                        comparison.expenses,
                        {
                            icon:
                                "🔴",

                            positiveIsGood:
                                false,

                            detail:
                                expenseDetail
                        }
                    )}

                    ${this.summaryMetric(
                        "Invertido",
                        display.monthlyInvested,
                        comparison.invested,
                        {
                            icon:
                                "📈",

                            positiveIsGood:
                                true,

                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary
                                            .monthlyInvested,
                                        forecast
                                            ?.pending
                                            ?.invested
                                    )
                                    : ""
                        }
                    )}

                    ${this.summaryMetric(
                        "Ahorro",
                        display.monthlySavings,
                        comparison.savings,
                        {
                            icon:
                                "💰",

                            positiveIsGood:
                                true,

                            color:
                                this.statusColor(
                                    display
                                        .monthlySavings,
                                    true
                                ),

                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary
                                            .monthlySavings,
                                        forecast
                                            ?.pending
                                            ?.savingsImpact
                                    )
                                    : ""
                        }
                    )}

                    ${this.summaryMetric(
                        "Tasa de ahorro",
                        display.monthlySavingRate,
                        comparison.savingRate,
                        {
                            icon:
                                "🎯",

                            positiveIsGood:
                                true,

                            percent:
                                true,

                            percentagePoint:
                                true,

                            color:
                                this.statusColor(
                                    display
                                        .monthlySavingRate,
                                    true
                                )
                        }
                    )}

                    ${this.summaryMetric(
                        "Resultado de caja",
                        display.monthlyCashResult,
                        comparison.cashResult,
                        {
                            icon:
                                "💧",

                            positiveIsGood:
                                true,

                            color:
                                this.statusColor(
                                    display
                                        .monthlyCashResult,
                                    true
                                ),

                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary
                                            .monthlyCashResult,
                                        forecast
                                            ?.pending
                                            ?.cashResult
                                    )
                                    : (
                                        `Entradas ${this.currency(
                                            summary
                                                .monthlyCashInflow
                                        )} · ` +
                                        `Salidas ${this.currency(
                                            summary
                                                .monthlyCashOutflow
                                        )}`
                                    )
                        }
                    )}

                </div>

            </section>

        `;

    },

    forecastPanel(forecast) {

        const rows = [

            {
                label:
                    "Ingresos",

                real:
                    forecast?.real
                        ?.monthlyIncome,

                pending:
                    forecast?.pending
                        ?.income,

                estimated:
                    forecast?.estimated
                        ?.income
            },

            {
                label:
                    "Gastos",

                real:
                    forecast?.real
                        ?.monthlyExpenses,

                pending:
                    forecast?.pending
                        ?.expenses,

                estimated:
                    forecast?.estimated
                        ?.expenses
            },

            {
                label:
                    "Inversión",

                real:
                    forecast?.real
                        ?.monthlyInvested,

                pending:
                    forecast?.pending
                        ?.invested,

                estimated:
                    forecast?.estimated
                        ?.invested
            },

            {
                label:
                    "Ahorro",

                real:
                    forecast?.real
                        ?.monthlySavings,

                pending:
                    forecast?.pending
                        ?.savingsImpact,

                estimated:
                    forecast?.estimated
                        ?.savings
            }

        ].map(
            row => ({

                ...row,

                real:
                    this.number(row.real),

                pending:
                    this.number(
                        row.pending
                    ),

                estimated:
                    this.number(
                        row.estimated
                    )

            })
        );

        const count =
            this.number(
                forecast?.pending
                    ?.count
            );

        if (
            count === 0
        ) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        "Real frente a previsión",
                        "No hay propuestas pendientes"
                    )}

                    ${this.emptyState(
                        "✓",
                        "Previsión sin cambios",
                        "Las cifras estimadas coinciden con las confirmadas."
                    )}

                </section>

            `;

        }

        const maximum =
            Math.max(
                1,
                ...rows.map(
                    row =>
                        Math.max(
                            Math.abs(
                                row.real
                            ) +
                            Math.abs(
                                row.pending
                            ),
                            Math.abs(
                                row.estimated
                            )
                        )
                )
            );

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Real frente a previsión",
                    (
                        `${count} ` +
                        (
                            count === 1
                                ? "propuesta pendiente"
                                : "propuestas pendientes"
                        )
                    ),
                    `

                        <span class="atlas-analysis-badge">
                            Estimado
                        </span>

                    `
                )}

                <div class="atlas-analysis-forecast-legend">

                    <span class="real">
                        Real
                    </span>

                    <span class="pending">
                        Pendiente
                    </span>

                    <span class="negative">
                        Impacto negativo
                    </span>

                </div>

                <div class="atlas-analysis-forecast-chart">

                    ${rows.map(
                        row => {

                            const realWidth =
                                (
                                    Math.abs(
                                        row.real
                                    ) /
                                    maximum
                                ) * 100;

                            const pendingWidth =
                                (
                                    Math.abs(
                                        row.pending
                                    ) /
                                    maximum
                                ) * 100;

                            return `

                                <article class="atlas-analysis-forecast-row">

                                    <div class="atlas-analysis-forecast-label">

                                        <strong>
                                            ${row.label}
                                        </strong>

                                        <small>
                                            Real
                                            ${this.currency(
                                                row.real
                                            )}
                                            · Pendiente
                                            ${
                                                row.pending >
                                                0
                                                    ? "+"
                                                    : row.pending <
                                                        0
                                                        ? "−"
                                                        : ""
                                            }${this.currency(
                                                Math.abs(
                                                    row.pending
                                                )
                                            )}
                                        </small>

                                    </div>

                                    <div class="atlas-analysis-forecast-track">

                                        <i
                                            class="real"
                                            style="
                                                width:
                                                    ${realWidth}%;
                                            "
                                        ></i>

                                        <i
                                            class="
                                                pending
                                                ${
                                                    row.pending <
                                                    0
                                                        ? "negative"
                                                        : ""
                                                }
                                            "
                                            style="
                                                width:
                                                    ${pendingWidth}%;
                                            "
                                        ></i>

                                    </div>

                                    <div class="atlas-analysis-forecast-result">

                                        <small>
                                            Estimado
                                        </small>

                                        <strong
                                            style="
                                                color:
                                                    ${
                                                        row.label ===
                                                        "Ahorro"
                                                            ? this.statusColor(
                                                                row.estimated,
                                                                true
                                                            )
                                                            : "var(--color-text)"
                                                    };
                                            "
                                        >
                                            ${this.currency(
                                                row.estimated
                                            )}
                                        </strong>

                                    </div>

                                </article>

                            `;

                        }
                    ).join("")}

                </div>

            </section>

        `;

    },

    budgetStatusInformation(status) {

        const statuses = {

            healthy: {

                label:
                    "Dentro del presupuesto",

                color:
                    "var(--color-success)"

            },

            warning: {

                label:
                    "Cerca del límite",

                color:
                    "#f4b95e"

            },

            exceeded: {

                label:
                    "Presupuesto superado",

                color:
                    "var(--color-danger)"

            },

            unbudgeted: {

                label:
                    "Gasto sin presupuesto",

                color:
                    "var(--color-danger)"

            },

            no_budget: {

                label:
                    "Sin presupuesto configurado",

                color:
                    "var(--color-text-muted)"

            }

        };

        return (
            statuses[status] ||
            statuses.no_budget
        );

    },

    budgetPanel(
        budget,
        forecast,
        mode
    ) {

        const forecastMode =
            mode === "forecast";

        const pendingExpenses =
            this.number(
                forecast?.pending
                    ?.expenses
            );

        const displayedSpent =
            this.number(
                budget.totalSpent
            ) +
            (
                forecastMode
                    ? pendingExpenses
                    : 0
            );

        const remaining =
            this.number(
                budget.totalBudget
            ) -
            displayedSpent;

        const usedPercent =
            AtlasCalculations
                .budgetUsedPercent(
                    displayedSpent,
                    budget.totalBudget
                );

        const statusKey =
            AtlasCalculations
                .budgetStatus(
                    this.data,
                    displayedSpent,
                    budget.totalBudget
                );

        const status =
            this.budgetStatusInformation(
                statusKey
            );

        const alerts =
            (
                Array.isArray(
                    budget.categories
                )
                    ? budget.categories
                    : []
            )
                .filter(
                    category =>
                        category.status ===
                            "warning" ||
                        category.status ===
                            "exceeded"
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        this.number(
                            second.usedPercent
                        ) -
                        this.number(
                            first.usedPercent
                        )
                )
                .slice(
                    0,
                    3
                );

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Estado presupuestario",
                    "Situación general del presupuesto del mes seleccionado",
                    `

                        <strong
                            style="
                                color:
                                    ${status.color};
                            "
                        >
                            ${
                                usedPercent ===
                                null
                                    ? "—"
                                    : this.percent(
                                        usedPercent
                                    )
                            }
                        </strong>

                    `
                )}

                <div class="atlas-analysis-budget-summary">

                    <div>

                        <small>
                            Presupuesto
                        </small>

                        <strong>
                            ${this.currency(
                                budget.totalBudget
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            ${
                                forecastMode
                                    ? "Gasto estimado"
                                    : "Gasto real"
                            }
                        </small>

                        <strong>
                            ${this.currency(
                                displayedSpent
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Margen
                        </small>

                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        remaining,
                                        true
                                    )};
                            "
                        >
                            ${this.currency(
                                remaining
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Estado
                        </small>

                        <strong
                            class="atlas-analysis-small-text"
                            style="
                                color:
                                    ${status.color};
                            "
                        >
                            ${status.label}
                        </strong>

                    </div>

                </div>

                <div class="atlas-analysis-budget-progress">

                    <i
                        style="
                            width:
                                ${this.clamp(
                                    usedPercent ===
                                    null
                                        ? 0
                                        : usedPercent
                                )}%;
                            background:
                                ${status.color};
                        "
                    ></i>

                </div>

                ${
                    forecastMode &&
                    pendingExpenses > 0
                        ? `

                            <p class="atlas-analysis-budget-note">
                                Incluye
                                ${this.currency(
                                    pendingExpenses
                                )}
                                de gasto pendiente.
                            </p>

                        `
                        : ""
                }

                ${
                    alerts.length >
                    0
                        ? `

                            <div class="atlas-analysis-alerts">

                                ${alerts.map(
                                    category => {

                                        const categoryStatus =
                                            this
                                                .budgetStatusInformation(
                                                    category.status
                                                );

                                        return `

                                            <div>

                                                <span>
                                                    ${
                                                        category.icon ||
                                                        ""
                                                    }
                                                    ${this.escape(
                                                        category.name
                                                    )}
                                                </span>

                                                <strong
                                                    style="
                                                        color:
                                                            ${categoryStatus.color};
                                                    "
                                                >
                                                    ${
                                                        category.usedPercent ===
                                                        null
                                                            ? "Sin límite"
                                                            : this.percent(
                                                                category
                                                                    .usedPercent
                                                            )
                                                    }
                                                </strong>

                                            </div>

                                        `;

                                    }
                                ).join("")}

                            </div>

                        `
                        : ""
                }

                <button
                    type="button"
                    data-action="openAnalysisBudgets"
                    class="atlas-analysis-primary-link"
                >
                    Ver presupuestos
                </button>

            </section>

        `;

    },

    distributionControls(level) {

        return `

            <div class="atlas-analysis-mini-tabs">

                <button
                    type="button"
                    data-action="setAnalysisDistributionLevel"
                    data-level="category"
                    class="${
                        level ===
                        "category"
                            ? "active"
                            : ""
                    }"
                >
                    Categorías
                </button>

                <button
                    type="button"
                    data-action="setAnalysisDistributionLevel"
                    data-level="subcategory"
                    class="${
                        level ===
                        "subcategory"
                            ? "active"
                            : ""
                    }"
                >
                    Subcategorías
                </button>

            </div>

        `;

    },

    donutChart(items) {

        const positiveItems =
            (
                Array.isArray(items)
                    ? items
                    : []
            ).filter(
                item =>
                    this.number(
                        item.amount
                    ) > 0
            );

        const total =
            this.sum(
                positiveItems,
                "amount"
            );

        if (
            total <= 0
        ) {

            return this.emptyState(
                "◯",
                "Sin distribución",
                "No hay gasto neto positivo en este mes."
            );

        }

        const circumference =
            251.2;

        let offset =
            0;

        const circles =
            positiveItems
                .slice(
                    0,
                    8
                )
                .map(
                    (
                        item,
                        index
                    ) => {

                        const share =
                            (
                                this.number(
                                    item.amount
                                ) /
                                total
                            ) *
                            circumference;

                        const circle = `

                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="
                                    var(
                                        --atlas-chart-${
                                            (
                                                index %
                                                8
                                            ) + 1
                                        }
                                    )
                                "
                                stroke-width="14"
                                stroke-dasharray="
                                    ${share}
                                    ${
                                        circumference -
                                        share
                                    }
                                "
                                stroke-dashoffset="
                                    ${-offset}
                                "
                            ></circle>

                        `;

                        offset +=
                            share;

                        return circle;

                    }
                )
                .join("");

        return `

            <div class="atlas-analysis-donut-wrap">

                <svg
                    class="atlas-analysis-donut"
                    viewBox="0 0 100 100"
                    aria-label="Distribución del gasto"
                >

                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="
                            rgba(
                                255,
                                255,
                                255,
                                0.07
                            )
                        "
                        stroke-width="14"
                    ></circle>

                    ${circles}

                </svg>

                <div class="atlas-analysis-donut-center">

                    <small>
                        Gasto neto
                    </small>

                    <strong>
                        ${this.currency(
                            total
                        )}
                    </strong>

                </div>

            </div>

        `;

    },

    distributionPanel(
        categories,
        subcategories,
        level
    ) {

        const source =
            level === "subcategory"
                ? subcategories
                : categories;

        const items =
            (
                Array.isArray(source)
                    ? source
                    : []
            ).filter(
                item =>
                    this.number(
                        item.amount
                    ) > 0
            );

        const total =
            this.sum(
                items,
                "amount"
            );

        const topThree =
            items
                .slice(
                    0,
                    3
                )
                .reduce(
                    (
                        totalAmount,
                        item
                    ) =>
                        totalAmount +
                        this.number(
                            item.amount
                        ),
                    0
                );

        const concentration =
            total > 0
                ? (
                    topThree /
                    total
                ) * 100
                : 0;

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Distribución del gasto",
                    "Composición del gasto neto confirmado",
                    this.distributionControls(
                        level
                    )
                )}

                ${
                    items.length ===
                    0
                        ? this.emptyState(
                            "🧾",
                            "Sin gastos",
                            "Registra gastos para analizar su distribución."
                        )
                        : `

                            <div class="atlas-analysis-distribution">

                                ${this.donutChart(
                                    items
                                )}

                                <div class="atlas-analysis-distribution-list">

                                    ${items
                                        .slice(
                                            0,
                                            8
                                        )
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const share =
                                                    total >
                                                    0
                                                        ? (
                                                            this.number(
                                                                item.amount
                                                            ) /
                                                            total
                                                        ) * 100
                                                        : 0;

                                                return `

                                                    <div class="atlas-analysis-distribution-row">

                                                        <i
                                                            style="
                                                                background:
                                                                    var(
                                                                        --atlas-chart-${
                                                                            (
                                                                                index %
                                                                                8
                                                                            ) + 1
                                                                        }
                                                                    );
                                                            "
                                                        ></i>

                                                        <div>

                                                            <strong>
                                                                ${this.escape(
                                                                    item.label ||
                                                                    item.category ||
                                                                    "Sin categoría"
                                                                )}
                                                            </strong>

                                                            <small>
                                                                ${share.toFixed(
                                                                    0
                                                                )}%
                                                                · bruto
                                                                ${this.currency(
                                                                    item.grossAmount
                                                                )}

                                                                ${
                                                                    this.number(
                                                                        item.reimbursements
                                                                    ) >
                                                                    0
                                                                        ? (
                                                                            ` · reembolsos ` +
                                                                            `${this.currency(
                                                                                item
                                                                                    .reimbursements
                                                                            )}`
                                                                        )
                                                                        : ""
                                                                }
                                                            </small>

                                                        </div>

                                                        <strong>
                                                            ${this.currency(
                                                                item.amount
                                                            )}
                                                        </strong>

                                                    </div>

                                                `;

                                            }
                                        )
                                        .join("")}

                                </div>

                            </div>

                            <div class="atlas-analysis-inline-facts">

                                <span>
                                    ${
                                        level ===
                                        "category"
                                            ? "Categorías activas"
                                            : "Subcategorías activas"
                                    }
                                    <strong>
                                        ${items.length}
                                    </strong>
                                </span>

                                <span>
                                    Concentración top 3
                                    <strong>
                                        ${this.percent(
                                            concentration
                                        )}
                                    </strong>
                                </span>

                                <span>
                                    Mayor peso
                                    <strong>
                                        ${this.escape(
                                            items[0]
                                                ?.label ||
                                            items[0]
                                                ?.category ||
                                            "—"
                                        )}
                                    </strong>
                                </span>

                            </div>

                        `
                }

            </section>

        `;

    },

    flowPanel(summary) {

        const income =
            this.number(
                summary.monthlyIncome
            );

        if (
            income <= 0
        ) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        "Flujo del dinero",
                        "Relación entre ingresos y destinos del dinero"
                    )}

                    ${this.emptyState(
                        "↔",
                        "Sin ingresos",
                        "El reparto necesita ingresos registrados en el mes."
                    )}

                </section>

            `;

        }

        const values = [

            {
                label:
                    "Gasto",

                amount:
                    this.number(
                        summary
                            .monthlyExpenses
                    ),

                className:
                    "expense"
            },

            {
                label:
                    "Inversión",

                amount:
                    this.number(
                        summary
                            .monthlyInvested
                    ),

                className:
                    "investment"
            },

            {
                label:
                    "Deuda",

                amount:
                    this.number(
                        summary
                            .monthlyDebtPayments
                    ),

                className:
                    "debt"
            },

            {
                label:
                    this.number(
                        summary
                            .monthlySavings
                    ) >=
                    0
                        ? "Ahorro"
                        : "Déficit",

                amount:
                    Math.abs(
                        this.number(
                            summary
                                .monthlySavings
                        )
                    ),

                original:
                    this.number(
                        summary
                            .monthlySavings
                    ),

                className:
                    this.number(
                        summary
                            .monthlySavings
                    ) >=
                    0
                        ? "saving"
                        : "deficit"
            }

        ].filter(
            item =>
                item.amount > 0
        );

        const denominator =
            values.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.amount,
                0
            ) || 1;

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Flujo del dinero",
                    "Relación entre ingresos, gasto, inversión, deuda y ahorro"
                )}

                <div class="atlas-analysis-flow">

                    ${values.map(
                        item => {

                            const share =
                                (
                                    item.amount /
                                    income
                                ) * 100;

                            return `

                                <div
                                    class="${
                                        item.className
                                    }"
                                    style="
                                        flex-grow:
                                            ${
                                                item.amount /
                                                denominator
                                            };
                                    "
                                >

                                    <strong>
                                        ${
                                            item.original <
                                            0
                                                ? "−"
                                                : ""
                                        }${share.toFixed(
                                            0
                                        )}%
                                    </strong>

                                    <small>
                                        ${item.label}
                                    </small>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

                <div class="atlas-analysis-flow-values">

                    <span>
                        Ingresos
                        <strong>
                            ${this.currency(
                                income
                            )}
                        </strong>
                    </span>

                    <span>
                        Gastos
                        <strong>
                            ${this.currency(
                                summary
                                    .monthlyExpenses
                            )}
                        </strong>
                    </span>

                    <span>
                        Inversión
                        <strong>
                            ${this.currency(
                                summary
                                    .monthlyInvested
                            )}
                        </strong>
                    </span>

                    <span>
                        Deuda
                        <strong>
                            ${this.currency(
                                summary
                                    .monthlyDebtPayments
                            )}
                        </strong>
                    </span>

                    <span>
                        Ahorro
                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        summary
                                            .monthlySavings,
                                        true
                                    )};
                            "
                        >
                            ${this.currency(
                                summary
                                    .monthlySavings
                            )}
                        </strong>
                    </span>

                </div>

            </section>

        `;

    },

    recurringRules(data) {

        return Array.isArray(
            data?.catalog
                ?.recurringRules
        )
            ? data.catalog
                .recurringRules
            : [];

    },

    recurringTitle(
        occurrence
    ) {

        const ruleId =
            occurrence?.ruleId ||
            occurrence?.recurringRuleId ||
            "";

        const rule =
            this.recurringRules(
                this.data
            ).find(
                item =>
                    item.id ===
                    ruleId
            );

        return (
            rule?.name ||
            occurrence?.name ||
            occurrence?.title ||
            occurrence?.description ||
            occurrence?.category ||
            "Movimiento recurrente"
        );

    },

    recurringPanel(
        forecast,
        analysisMonth
    ) {

        const pending =
            forecast?.pending || {};

        const count =
            this.number(
                pending.count
            );

        if (
            count === 0
        ) {

            return "";

        }

        const occurrences =
            (
                Array.isArray(
                    pending.occurrences
                )
                    ? pending.occurrences
                    : []
            ).slice(
                0,
                4
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="monthly-recurring"
                ${this.openAttribute(
                    "monthly-recurring"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Recurrentes y previsión
                        </strong>

                        <small>
                            ${count}
                            ${
                                count === 1
                                    ? "movimiento pendiente"
                                    : "movimientos pendientes"
                            }
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-grid">

                        ${this.simpleCard(
                            "Ingresos pendientes",
                            pending.income
                        )}

                        ${this.simpleCard(
                            "Gastos pendientes",
                            pending.expenses
                        )}

                        ${this.simpleCard(
                            "Inversión pendiente",
                            pending.invested
                        )}

                        ${this.simpleCard(
                            "Deuda pendiente",
                            pending.debtPayments
                        )}

                    </div>

                    <div class="atlas-analysis-summary-list">

                        <div>

                            <span>
                                Impacto en ahorro
                            </span>

                            <strong
                                style="
                                    color:
                                        ${this.statusColor(
                                            pending
                                                .savingsImpact,
                                            true
                                        )};
                                "
                            >
                                ${this.currency(
                                    pending
                                        .savingsImpact
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Impacto en caja
                            </span>

                            <strong
                                style="
                                    color:
                                        ${this.statusColor(
                                            pending
                                                .cashResult,
                                            true
                                        )};
                                "
                            >
                                ${this.currency(
                                    pending
                                        .cashResult
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Posibles duplicados
                            </span>

                            <strong>
                                ${this.number(
                                    pending
                                        .possibleDuplicates
                                )}
                            </strong>

                        </div>

                    </div>

                    ${
                        occurrences.length >
                        0
                            ? `

                                <div class="atlas-analysis-upcoming">

                                    <small class="note">
                                        Próximos movimientos
                                    </small>

                                    ${occurrences.map(
                                        occurrence => `

                                            <div>

                                                <span>
                                                    ${this.escape(
                                                        occurrence
                                                            .expectedDate ||
                                                        analysisMonth
                                                    )}
                                                </span>

                                                <strong>
                                                    ${this.escape(
                                                        this.recurringTitle(
                                                            occurrence
                                                        )
                                                    )}
                                                </strong>

                                                <span>
                                                    ${this.currency(
                                                        occurrence
                                                            .expectedAmount
                                                    )}
                                                </span>

                                            </div>

                                        `
                                    ).join("")}

                                </div>

                            `
                            : ""
                    }

                    <button
                        type="button"
                        data-action="openAnalysisPendingMovements"
                        class="atlas-analysis-primary-link"
                    >
                        Revisar pendientes
                    </button>

                </div>

            </details>

        `;

    },

    simpleCard(
        label,
        value
    ) {

        return `

            <article class="atlas-analysis-metric">

                <span class="atlas-analysis-metric-label">
                    ${this.escape(label)}
                </span>

                <strong class="atlas-analysis-metric-value">
                    ${this.currency(value)}
                </strong>

            </article>

        `;

    },

    movementLabel(movement) {

        return (
            movement?.description ||
            movement?.name ||
            movement?.title ||
            movement?.category ||
            "Movimiento"
        );

    },

    activityPanel(activity) {

        const rows = [

            {
                label:
                    "Movimientos",

                value:
                    this.number(
                        activity?.movements
                    )
            },

            {
                label:
                    "Días con actividad",

                value:
                    this.number(
                        activity?.activeDays
                    )
            },

            {
                label:
                    "Gasto medio",

                value:
                    this.currency(
                        activity?.averageExpense
                    )
            },

            {
                label:
                    "Gasto mediano",

                value:
                    this.currency(
                        activity?.medianExpense
                    )
            },

            {
                label:
                    "Mayor ingreso",

                value:
                    this.currency(
                        activity
                            ?.highestIncome
                            ?.amount
                    ),

                detail:
                    this.movementLabel(
                        activity
                            ?.highestIncome
                    )
            },

            {
                label:
                    "Mayor gasto",

                value:
                    this.currency(
                        activity
                            ?.highestExpense
                            ?.amount
                    ),

                detail:
                    this.movementLabel(
                        activity
                            ?.highestExpense
                    )
            },

            {
                label:
                    "Mayor inversión",

                value:
                    this.currency(
                        activity
                            ?.highestInvestment
                            ?.amount
                    ),

                detail:
                    this.movementLabel(
                        activity
                            ?.highestInvestment
                    )
            },

            {
                label:
                    "Mayor pago de deuda",

                value:
                    this.currency(
                        activity
                            ?.highestDebtPayment
                            ?.amount
                    ),

                detail:
                    this.movementLabel(
                        activity
                            ?.highestDebtPayment
                    )
            },

            {
                label:
                    "Cuenta más utilizada",

                value:
                    activity
                        ?.mostUsedAccount
                        ?.account
                        ?.name ||
                    "—",

                detail:
                    activity
                        ?.mostUsedAccount
                        ? (
                            `${this.number(
                                activity
                                    .mostUsedAccount
                                    .count
                            )} movimientos`
                        )
                        : ""
            }

        ];

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="monthly-activity"
                ${this.openAttribute(
                    "monthly-activity"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Actividad del mes
                        </strong>

                        <small>
                            Ritmo, importes y operaciones destacadas
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-card-grid">

                        ${rows.map(
                            row => `

                                <div>

                                    <small>
                                        ${this.escape(
                                            row.label
                                        )}
                                    </small>

                                    <strong>
                                        ${this.escape(
                                            String(
                                                row.value
                                            )
                                        )}
                                    </strong>

                                    ${
                                        row.detail
                                            ? `

                                                <span>
                                                    ${this.escape(
                                                        row.detail
                                                    )}
                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            `
                        ).join("")}

                    </div>

                </div>

            </details>

        `;

    },

    dailyActivityPanel(activity) {

        const daily =
            Array.isArray(
                activity?.daily
            )
                ? activity.daily
                : [];

        const maximum =
            Math.max(
                1,
                ...daily.map(
                    day =>
                        Math.max(
                            0,
                            this.number(
                                day.expenses
                            )
                        )
                )
            );

        const highestDay =
            activity
                ?.highestExpenseDay;

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="monthly-daily"
                ${this.openAttribute(
                    "monthly-daily"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Actividad diaria
                        </strong>

                        <small>
                            Días y picos de gasto neto
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    ${
                        daily.length ===
                        0
                            ? this.emptyState(
                                "▥",
                                "Sin actividad diaria",
                                "No hay movimientos confirmados que representar."
                            )
                            : `

                                <div
                                    class="atlas-analysis-daily-chart"
                                    style="
                                        --atlas-columns:
                                            ${daily.length};
                                    "
                                >

                                    ${daily.map(
                                        day => {

                                            const expenses =
                                                Math.max(
                                                    0,
                                                    this.number(
                                                        day.expenses
                                                    )
                                                );

                                            const height =
                                                expenses >
                                                0
                                                    ? Math.max(
                                                        5,
                                                        (
                                                            expenses /
                                                            maximum
                                                        ) *
                                                        90
                                                    )
                                                    : 2;

                                            return `

                                                <div
                                                    title="
                                                        Día ${day.day}:
                                                        ${this.currency(
                                                            expenses
                                                        )}
                                                    "
                                                >

                                                    <i
                                                        style="
                                                            height:
                                                                ${height}px;
                                                            opacity:
                                                                ${
                                                                    expenses >
                                                                    0
                                                                        ? 0.92
                                                                        : 0.16
                                                                };
                                                        "
                                                    ></i>

                                                    <small>
                                                        ${
                                                            day.day ===
                                                                1 ||
                                                            day.day %
                                                                5 ===
                                                                0 ||
                                                            day.day ===
                                                                daily.length
                                                                ? day.day
                                                                : ""
                                                        }
                                                    </small>

                                                </div>

                                            `;

                                        }
                                    ).join("")}

                                </div>

                            `
                    }

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Día de mayor gasto
                            <strong>
                                ${
                                    highestDay &&
                                    this.number(
                                        highestDay
                                            .expenses
                                    ) >
                                    0
                                        ? (
                                            `${highestDay.day} · ` +
                                            `${this.currency(
                                                highestDay
                                                    .expenses
                                            )}`
                                        )
                                        : "—"
                                }
                            </strong>
                        </span>

                        <span>
                            Racha activa
                            <strong>
                                ${this.number(
                                    activity
                                        ?.longestActiveStreak
                                )}
                                días
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    qualityPanel(
        summary,
        comparison,
        budget,
        categories,
        forecast,
        mode
    ) {

        const display =
            this.monthlyDisplaySummary(
                summary,
                forecast,
                mode
            );

        const insights =
            [];

        if (
            display.monthlySavings >=
            0
        ) {

            insights.push({

                icon:
                    "✓",

                title:
                    "Ahorro positivo",

                text:
                    (
                        `Has conservado ${this.currency(
                            display
                                .monthlySavings
                        )}, un ${this.percent(
                            display
                                .monthlySavingRate
                        )} de los ingresos.`
                    ),

                tone:
                    "good"

            });

        } else {

            insights.push({

                icon:
                    "!",

                title:
                    "Ahorro negativo",

                text:
                    (
                        `El ahorro del mes es ${this.currency(
                            display
                                .monthlySavings
                        )}.`
                    ),

                tone:
                    "bad"

            });

        }

        if (
            this.number(
                budget.totalBudget
            ) >
            0
        ) {

            const spent =
                this.number(
                    budget.totalSpent
                ) +
                (
                    mode ===
                    "forecast"
                        ? this.number(
                            forecast
                                ?.pending
                                ?.expenses
                        )
                        : 0
                );

            const used =
                AtlasCalculations
                    .budgetUsedPercent(
                        spent,
                        budget.totalBudget
                    );

            insights.push({

                icon:
                    this.number(
                        used
                    ) >
                    100
                        ? "!"
                        : "✓",

                title:
                    "Control presupuestario",

                text:
                    (
                        `Has utilizado ${this.percent(
                            used
                        )} del presupuesto mensual.`
                    ),

                tone:
                    this.number(
                        used
                    ) >
                    100
                        ? "bad"
                        : this.number(
                            used
                        ) >=
                        85
                            ? "warning"
                            : "good"

            });

        }

        const topCategory =
            Array.isArray(
                categories
            )
                ? categories[0]
                : null;

        if (
            topCategory &&
            this.number(
                summary.monthlyExpenses
            ) >
            0
        ) {

            const share =
                (
                    this.number(
                        topCategory.amount
                    ) /
                    this.number(
                        summary.monthlyExpenses
                    )
                ) * 100;

            insights.push({

                icon:
                    "•",

                title:
                    "Principal foco de gasto",

                text:
                    (
                        `${topCategory.label} concentra ` +
                        `${this.percent(
                            share
                        )} del gasto neto.`
                    ),

                tone:
                    share >= 50
                        ? "warning"
                        : "neutral"

            });

        }

        if (
            mode === "forecast" &&
            this.number(
                forecast?.pending
                    ?.count
            ) >
            0
        ) {

            const impact =
                this.number(
                    forecast?.pending
                        ?.savingsImpact
                );

            insights.push({

                icon:
                    impact >= 0
                        ? "↗"
                        : "↘",

                title:
                    "Efecto de pendientes",

                text:
                    (
                        `Los movimientos pendientes cambiarían ` +
                        `el ahorro en ${this.currency(
                            impact
                        )}.`
                    ),

                tone:
                    impact >= 0
                        ? "good"
                        : "warning"

            });

        } else {

            const expenseDifference =
                this.number(
                    comparison
                        ?.expenses
                        ?.difference
                );

            if (
                expenseDifference !==
                0
            ) {

                insights.push({

                    icon:
                        expenseDifference >
                        0
                            ? "↑"
                            : "↓",

                    title:
                        "Cambio del gasto",

                    text:
                        (
                            `El gasto neto es ` +
                            `${this.currency(
                                Math.abs(
                                    expenseDifference
                                )
                            )} ` +
                            `${
                                expenseDifference >
                                0
                                    ? "mayor"
                                    : "menor"
                            } que el mes anterior.`
                        ),

                    tone:
                        expenseDifference >
                        0
                            ? "warning"
                            : "good"

                });

            }

        }

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Lectura del mes",
                    "Conclusiones derivadas de los datos seleccionados"
                )}

                <div class="atlas-analysis-insights">

                    ${insights
                        .slice(
                            0,
                            4
                        )
                        .map(
                            insight => `

                                <article class="${
                                    insight.tone
                                }">

                                    <span>
                                        ${insight.icon}
                                    </span>

                                    <div>

                                        <strong>
                                            ${this.escape(
                                                insight.title
                                            )}
                                        </strong>

                                        <p>
                                            ${this.escape(
                                                insight.text
                                            )}
                                        </p>

                                    </div>

                                </article>

                            `
                        )
                        .join("")}

                </div>

            </section>

        `;

    },

    monthlyView(
        data,
        options
    ) {

        const analysisMonth =
            options.analysisMonth ||
            AtlasCalculations
                .monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations
                .monthKey();

        const mode =
            options.analysisMode ||
            "real";

        const distributionLevel =
            options
                .analysisDistributionLevel ||
            "category";

        const summary =
            AtlasCalculations
                .financialSummary(
                    data,
                    analysisMonth
                );

        const comparison =
            AtlasCalculations
                .monthlyComparison(
                    data,
                    analysisMonth
                );

        const forecast =
            AtlasCalculations
                .forecastSummary(
                    data,
                    analysisMonth
                );

        const budget =
            AtlasCalculations
                .budgetSummary(
                    data,
                    analysisMonth
                );

        const categories =
            AtlasCalculations
                .expenseCategories(
                    data,
                    analysisMonth
                );

        const subcategories =
            AtlasCalculations
                .expenseSubcategories(
                    data,
                    analysisMonth
                );

        const activity =
            AtlasCalculations
                .monthlyActivitySummary(
                    data,
                    analysisMonth
                );

        const displaySummary =
            this.monthlyDisplaySummary(
                summary,
                forecast,
                mode
            );

        return `

            <div class="atlas-analysis-context">

                ${this.monthSelector(
                    analysisMonth,
                    currentMonth
                )}

                ${this.modeSelector(
                    mode
                )}

            </div>

            ${this.monthlySummary(
                summary,
                comparison,
                forecast,
                mode
            )}

            ${
                mode ===
                "forecast"
                    ? this.forecastPanel(
                        forecast
                    )
                    : ""
            }

            ${this.budgetPanel(
                budget,
                forecast,
                mode
            )}

            ${this.distributionPanel(
                categories,
                subcategories,
                distributionLevel
            )}

            ${this.flowPanel(
                displaySummary
            )}

            ${this.recurringPanel(
                forecast,
                analysisMonth
            )}

            ${this.activityPanel(
                activity
            )}

            ${this.dailyActivityPanel(
                activity
            )}

            ${this.qualityPanel(
                summary,
                comparison,
                budget,
                categories,
                forecast,
                mode
            )}

        `;

    },

    periodSelector(activePeriod) {

        const periods = [

            {
                value:
                    "3",

                label:
                    "3 meses"
            },

            {
                value:
                    "6",

                label:
                    "6 meses"
            },

            {
                value:
                    "12",

                label:
                    "12 meses"
            },

            {
                value:
                    "all",

                label:
                    "Todo"
            }

        ];

        return `

            <div class="atlas-analysis-period">

                ${periods.map(
                    period => `

                        <button
                            type="button"
                            data-action="setTrendsPeriod"
                            data-period="${
                                period.value
                            }"
                            class="${
                                String(
                                    activePeriod
                                ) ===
                                period.value
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${period.label}
                        </button>

                    `
                ).join("")}

            </div>

        `;

    },

    metricOptions(
        selected,
        allowNone = false,
        excluded = ""
    ) {

        return `

            ${
                allowNone
                    ? `

                        <option
                            value="none"
                            ${
                                selected ===
                                "none"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Sin segunda variable
                        </option>

                    `
                    : ""
            }

            ${Object.entries(
                this.metricDefinitions()
            )
                .filter(
                    ([
                        key
                    ]) =>
                        key !== excluded
                )
                .map(
                    ([
                        key,
                        definition
                    ]) => `

                        <option
                            value="${key}"
                            ${
                                selected ===
                                key
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${definition.label}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    viewSelector(activeMode) {

        const views = [

            {
                value:
                    "monthly",

                label:
                    "Mensual"
            },

            {
                value:
                    "smoothed",

                label:
                    "Media suavizada"
            },

            {
                value:
                    "accumulated",

                label:
                    "Acumulado"
            }

        ];

        return `

            <div class="atlas-analysis-view-selector">

                ${views.map(
                    view => `

                        <button
                            type="button"
                            data-action="setTrendDisplayMode"
                            data-mode="${view.value}"
                            class="${
                                activeMode ===
                                view.value
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${view.label}
                        </button>

                    `
                ).join("")}

            </div>

        `;

    },

    trendsControls(
        period,
        primaryMetric,
        comparisonMetric,
        displayMode
    ) {

        return `

            <section class="atlas-analysis-controls">

                <span class="atlas-analysis-control-label">
                    Periodo
                </span>

                ${this.periodSelector(
                    period
                )}

                <div class="atlas-analysis-selectors">

                    <label>

                        <span>
                            Variable principal
                        </span>

                        <select
                            data-analysis-primary-metric
                        >
                            ${this.metricOptions(
                                primaryMetric
                            )}
                        </select>

                    </label>

                    <label>

                        <span>
                            Segunda variable
                        </span>

                        <select
                            data-analysis-comparison-metric
                        >
                            ${this.metricOptions(
                                comparisonMetric,
                                true,
                                primaryMetric
                            )}
                        </select>

                    </label>

                </div>

                <span class="atlas-analysis-control-label atlas-analysis-control-label-spaced">
                    Vista
                </span>

                ${this.viewSelector(
                    displayMode
                )}

            </section>

        `;

    },

    meaningfulMonths(months) {

        return (
            Array.isArray(months)
                ? months
                : []
        ).filter(
            month => [

                month.income,

                month.expenses,

                month.invested,

                month.savings,

                month.debtPayments,

                month.reimbursements,

                month.cashOutflow

            ].some(
                value =>
                    Math.abs(
                        this.number(value)
                    ) >
                    0.0001
            )
        );

    },

    normalizedMonthSummary(
        summary
    ) {

        return {

            monthKey:
                summary.monthKey,

            income:
                summary.monthlyIncome,

            grossExpenses:
                summary.monthlyGrossExpenses,

            reimbursements:
                summary.monthlyReimbursements,

            expenses:
                summary.monthlyExpenses,

            invested:
                summary.monthlyInvested,

            savings:
                summary.monthlySavings,

            savingRate:
                summary.monthlySavingRate,

            debtPayments:
                summary.monthlyDebtPayments,

            cashOutflow:
                summary.monthlyCashOutflow,

            cashResult:
                summary.monthlyCashResult

        };

    },

    comparisonPeriods(
        data,
        months,
        period
    ) {

        if (
            String(period) ===
            "all"
        ) {

            const meaningful =
                this.meaningfulMonths(
                    months
                );

            if (
                meaningful.length <
                6
            ) {

                return {

                    available:
                        false,

                    current:
                        [],

                    previous:
                        [],

                    currentLabel:
                        "",

                    previousLabel:
                        ""

                };

            }

            const previous =
                meaningful.slice(
                    0,
                    3
                );

            const current =
                meaningful.slice(
                    -3
                );

            return {

                available:
                    true,

                current,

                previous,

                currentLabel:
                    (
                        `${this.formatMonth(
                            current[0]
                                .monthKey
                        )} — ` +
                        `${this.formatMonth(
                            current[
                                current.length -
                                1
                            ].monthKey
                        )}`
                    ),

                previousLabel:
                    (
                        `${this.formatMonth(
                            previous[0]
                                .monthKey
                        )} — ` +
                        `${this.formatMonth(
                            previous[
                                previous.length -
                                1
                            ].monthKey
                        )}`
                    )

            };

        }

        const count =
            Number(period);

        const current =
            months.slice(
                -count
            );

        if (
            current.length ===
            0
        ) {

            return {

                available:
                    false,

                current:
                    [],

                previous:
                    [],

                currentLabel:
                    "",

                previousLabel:
                    ""

            };

        }

        const previousEnd =
            this.shiftMonth(
                current[0]
                    .monthKey,
                -1
            );

        const previousStart =
            this.shiftMonth(
                previousEnd,
                -(count - 1)
            );

        const previous =
            [];

        for (
            let index = 0;
            index < count;
            index += 1
        ) {

            const monthKey =
                this.shiftMonth(
                    previousStart,
                    index
                );

            const summary =
                AtlasCalculations
                    .financialSummary(
                        data,
                        monthKey
                    );

            previous.push(
                this.normalizedMonthSummary(
                    summary
                )
            );

        }

        return {

            available:
                previous.length ===
                current.length,

            current,

            previous,

            currentLabel:
                (
                    `${this.formatMonth(
                        current[0]
                            .monthKey
                    )} — ` +
                    `${this.formatMonth(
                        current[
                            current.length -
                            1
                        ].monthKey
                    )}`
                ),

            previousLabel:
                (
                    `${this.formatMonth(
                        previous[0]
                            .monthKey
                    )} — ` +
                    `${this.formatMonth(
                        previous[
                            previous.length -
                            1
                        ].monthKey
                    )}`
                )

        };

    },

    periodTotals(months) {

        const income =
            this.sum(
                months,
                "income"
            );

        const expenses =
            this.sum(
                months,
                "expenses"
            );

        const invested =
            this.sum(
                months,
                "invested"
            );

        const savings =
            this.sum(
                months,
                "savings"
            );

        const debtPayments =
            this.sum(
                months,
                "debtPayments"
            );

        return {

            income,

            expenses,

            invested,

            savings,

            debtPayments,

            savingRate:
                income > 0
                    ? (
                        savings /
                        income
                    ) * 100
                    : 0

        };

    },

    periodSummaryPanel(
        months,
        periodComparison
    ) {

        const totals =
            this.periodTotals(
                months
            );

        const previousTotals =
            periodComparison.available
                ? this.periodTotals(
                    periodComparison
                        .previous
                )
                : null;

        const cards = [

            {
                label:
                    "Ingresos acumulados",

                value:
                    totals.income,

                previous:
                    previousTotals
                        ?.income,

                positiveIsGood:
                    true
            },

            {
                label:
                    "Gasto neto",

                value:
                    totals.expenses,

                previous:
                    previousTotals
                        ?.expenses,

                positiveIsGood:
                    false
            },

            {
                label:
                    "Invertido",

                value:
                    totals.invested,

                previous:
                    previousTotals
                        ?.invested,

                positiveIsGood:
                    true
            },

            {
                label:
                    "Ahorro acumulado",

                value:
                    totals.savings,

                previous:
                    previousTotals
                        ?.savings,

                positiveIsGood:
                    true
            },

            {
                label:
                    "Tasa media de ahorro",

                value:
                    totals.savingRate,

                previous:
                    previousTotals
                        ?.savingRate,

                positiveIsGood:
                    true,

                percent:
                    true,

                percentagePoint:
                    true
            },

            {
                label:
                    "Deuda pagada",

                value:
                    totals.debtPayments,

                previous:
                    previousTotals
                        ?.debtPayments,

                positiveIsGood:
                    true
            }

        ];

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Resumen del periodo",
                    periodComparison.available
                        ? (
                            `Comparado con ${periodComparison.previousLabel}`
                        )
                        : "Totales del periodo seleccionado"
                )}

                <div class="atlas-analysis-period-summary">

                    ${cards.map(
                        card => {

                            const comparison =
                                card.previous ===
                                    undefined ||
                                card.previous ===
                                    null
                                    ? null
                                    : AtlasCalculations
                                        .metricComparison(
                                            card.value,
                                            card.previous
                                        );

                            const information =
                                comparison
                                    ? this.comparisonInformation(
                                        comparison,
                                        card
                                            .positiveIsGood,
                                        card
                                            .percentagePoint
                                    )
                                    : null;

                            return `

                                <article>

                                    <small>
                                        ${card.label}
                                    </small>

                                    <strong
                                        style="
                                            color:
                                                ${
                                                    card.label.includes(
                                                        "Ahorro"
                                                    )
                                                        ? this.statusColor(
                                                            card.value,
                                                            true
                                                        )
                                                        : "var(--color-text)"
                                                };
                                        "
                                    >
                                        ${
                                            card.percent
                                                ? this.percent(
                                                    card.value
                                                )
                                                : this.currency(
                                                    card.value
                                                )
                                        }
                                    </strong>

                                    ${
                                        information
                                            ? `

                                                <span
                                                    style="
                                                        color:
                                                            ${information.color};
                                                    "
                                                >
                                                    ${information.icon}
                                                    ${information.text}
                                                </span>

                                            `
                                            : `

                                                <span>
                                                    Sin comparación disponible
                                                </span>

                                            `
                                    }

                                </article>

                            `;

                        }
                    ).join("")}

                </div>

            </section>

        `;

    },

    transformValues(
        months,
        definition,
        mode
    ) {

        const raw =
            months.map(
                month =>
                    this.metricValue(
                        month,
                        definition
                    )
            );

        if (
            mode === "monthly"
        ) {

            return raw;

        }

        if (
            mode === "smoothed"
        ) {

            return raw.map(
                (
                    value,
                    index
                ) =>
                    this.average(
                        raw.slice(
                            Math.max(
                                0,
                                index - 2
                            ),
                            index + 1
                        )
                    )
            );

        }

        let accumulated =
            0;

        return raw.map(
            (
                value,
                index
            ) => {

                if (
                    definition.accumulable
                ) {

                    accumulated +=
                        value;

                    return accumulated;

                }

                return this.average(
                    raw.slice(
                        0,
                        index + 1
                    )
                );

            }
        );

    },

    variableStatistics(
        months,
        definition,
        displayMode
    ) {

        const values =
            this.transformValues(
                months,
                definition,
                displayMode
            );

        const first =
            values[0] || 0;

        const latest =
            values[
                values.length - 1
            ] || 0;

        const average =
            this.average(values);

        const maximum =
            values.length >
            0
                ? Math.max(
                    ...values
                )
                : 0;

        const minimum =
            values.length >
            0
                ? Math.min(
                    ...values
                )
                : 0;

        const change =
            latest - first;

        const reference =
            Math.max(
                Math.abs(first),
                Math.abs(average),
                1
            );

        const relative =
            (
                change /
                reference
            ) * 100;

        let classification;

        if (
            values.length <
            2
        ) {

            classification = {

                label:
                    "Sin histórico suficiente",

                detail:
                    "Se necesitan al menos dos meses",

                color:
                    "var(--color-text-muted)"

            };

        } else if (
            Math.abs(relative) <
            5
        ) {

            classification = {

                label:
                    "Sin variación significativa",

                detail:
                    "El cambio del periodo es reducido",

                color:
                    "var(--color-text-muted)"

            };

        } else {

            const improving =
                definition.positiveIsGood
                    ? change > 0
                    : change < 0;

            classification = {

                label:
                    improving
                        ? "Tendencia favorable"
                        : "Tendencia desfavorable",

                detail:
                    (
                        `${change > 0 ? "Aumento" : "Descenso"} ` +
                        `de ${Math.abs(
                            relative
                        ).toFixed(0)}%`
                    ),

                color:
                    improving
                        ? "var(--color-success)"
                        : "var(--color-danger)"

            };

        }

        return {

            values,

            first,

            latest,

            average,

            median:
                this.median(values),

            maximum,

            minimum,

            range:
                maximum -
                minimum,

            change,

            classification

        };

    },

    variableSummaryPanel(
        months,
        definition,
        displayMode
    ) {

        const statistics =
            this.variableStatistics(
                months,
                definition,
                displayMode
            );

        const comparison =
            AtlasCalculations
                .metricComparison(
                    statistics.latest,
                    statistics.first
                );

        const change =
            this.comparisonInformation(
                comparison,
                definition
                    .positiveIsGood,
                definition.percent
            );

        return `

            <section class="atlas-analysis-variable-summary">

                <article class="atlas-analysis-metric atlas-analysis-metric-wide">

                    <span class="atlas-analysis-metric-label">
                        Último dato
                    </span>

                    <strong class="atlas-analysis-metric-value">
                        ${this.formatMetric(
                            statistics.latest,
                            definition
                        )}
                    </strong>

                    <small>
                        ${
                            months.length >
                            0
                                ? this.formatMonth(
                                    months[
                                        months.length -
                                        1
                                    ].monthKey
                                )
                                : "Sin datos"
                        }
                    </small>

                </article>

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Media del periodo
                    </span>

                    <strong class="atlas-analysis-metric-value">
                        ${this.formatMetric(
                            statistics.average,
                            definition
                        )}
                    </strong>

                    <small>
                        ${months.length}
                        ${
                            months.length ===
                            1
                                ? "mes"
                                : "meses"
                        }
                    </small>

                </article>

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Cambio desde el inicio
                    </span>

                    <strong
                        class="atlas-analysis-metric-value atlas-analysis-text-value"
                        style="
                            color:
                                ${change.color};
                        "
                    >
                        ${change.icon}
                        ${change.text}
                    </strong>

                    <small>
                        Primer mes frente al último
                    </small>

                </article>

                <article class="atlas-analysis-metric atlas-analysis-metric-wide">

                    <span class="atlas-analysis-metric-label">
                        Tendencia
                    </span>

                    <strong
                        class="atlas-analysis-metric-value atlas-analysis-text-value"
                        style="
                            color:
                                ${statistics
                                    .classification
                                    .color};
                        "
                    >
                        ${statistics
                            .classification
                            .label}
                    </strong>

                    <small>
                        ${statistics
                            .classification
                            .detail}
                    </small>

                </article>

            </section>

        `;

    },

    chartPoints(
        values,
        minimum,
        maximum,
        width,
        height
    ) {

        const paddingX =
            26;

        const paddingY =
            22;

        const range =
            maximum -
            minimum ||
            1;

        const chartWidth =
            width -
            paddingX *
            2;

        const chartHeight =
            height -
            paddingY *
            2;

        return values.map(
            (
                value,
                index
            ) => ({

                x:
                    values.length ===
                    1
                        ? width / 2
                        : (
                            paddingX +
                            (
                                index /
                                (
                                    values.length -
                                    1
                                )
                            ) *
                            chartWidth
                        ),

                y:
                    paddingY +
                    (
                        (
                            maximum -
                            value
                        ) /
                        range
                    ) *
                    chartHeight,

                value

            })
        );

    },

    polyline(points) {

        return points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ");

    },

    historicalPanel(
        months,
        primaryDefinition,
        secondaryDefinition,
        displayMode
    ) {

        if (
            months.length ===
            0
        ) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        `Evolución de ${primaryDefinition.label.toLowerCase()}`,
                        "Sin periodo disponible"
                    )}

                    ${this.emptyState(
                        "⌁",
                        "Sin histórico",
                        "Todavía no hay meses suficientes para crear la gráfica."
                    )}

                </section>

            `;

        }

        const primaryValues =
            this.transformValues(
                months,
                primaryDefinition,
                displayMode
            );

        const secondaryValues =
            secondaryDefinition
                ? this.transformValues(
                    months,
                    secondaryDefinition,
                    displayMode
                )
                : [];

        const allValues = [

            ...primaryValues,

            ...secondaryValues,

            0

        ];

        let minimum =
            Math.min(
                ...allValues
            );

        let maximum =
            Math.max(
                ...allValues
            );

        if (
            minimum === maximum
        ) {

            const padding =
                Math.max(
                    Math.abs(minimum) *
                        0.15,
                    1
                );

            minimum -=
                padding;

            maximum +=
                padding;

        } else {

            const padding =
                (
                    maximum -
                    minimum
                ) * 0.12;

            minimum -=
                padding;

            maximum +=
                padding;

        }

        const width =
            Math.max(
                320,
                months.length *
                    62
            );

        const height =
            220;

        const primaryPoints =
            this.chartPoints(
                primaryValues,
                minimum,
                maximum,
                width,
                height
            );

        const secondaryPoints =
            secondaryDefinition
                ? this.chartPoints(
                    secondaryValues,
                    minimum,
                    maximum,
                    width,
                    height
                )
                : [];

        const zeroPoint =
            this.chartPoints(
                [0],
                minimum,
                maximum,
                width,
                height
            )[0];

        const flat =
            Math.max(
                ...primaryValues
            ) -
            Math.min(
                ...primaryValues
            ) <
            0.0001;

        const viewLabels = {

            monthly:
                "Valores mensuales",

            smoothed:
                "Media suavizada de hasta tres meses",

            accumulated:
                "Valores acumulados durante el periodo"

        };

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    `Evolución de ${primaryDefinition.label.toLowerCase()}`,
                    (
                        `${this.formatMonth(
                            months[0]
                                .monthKey
                        )} — ` +
                        `${this.formatMonth(
                            months[
                                months.length -
                                1
                            ].monthKey
                        )}`
                    )
                )}

                <div class="atlas-analysis-legend">

                    <span class="primary">
                        ${primaryDefinition.label}
                    </span>

                    ${
                        secondaryDefinition
                            ? `

                                <span class="secondary">
                                    ${secondaryDefinition.label}
                                </span>

                            `
                            : ""
                    }

                    <span class="view">
                        ${
                            viewLabels[
                                displayMode
                            ] ||
                            viewLabels.monthly
                        }
                    </span>

                </div>

                ${
                    flat
                        ? `

                            <div class="atlas-analysis-flat-note">
                                Sin variación significativa
                            </div>

                        `
                        : ""
                }

                <div class="atlas-analysis-chart-scroll">

                    <svg
                        viewBox="
                            0 0
                            ${width}
                            ${height}
                        "
                        style="
                            width:
                                ${width}px;
                        "
                        role="img"
                        aria-label="
                            Evolución de
                            ${primaryDefinition.label}
                        "
                    >

                        <line
                            x1="26"
                            y1="${zeroPoint.y}"
                            x2="${
                                width -
                                26
                            }"
                            y2="${zeroPoint.y}"
                            class="zero"
                        ></line>

                        ${
                            secondaryDefinition
                                ? `

                                    <polyline
                                        points="${
                                            this.polyline(
                                                secondaryPoints
                                            )
                                        }"
                                        class="secondary"
                                    ></polyline>

                                    ${secondaryPoints.map(
                                        (
                                            point,
                                            index
                                        ) => `

                                            <circle
                                                cx="${point.x}"
                                                cy="${point.y}"
                                                r="3.5"
                                                class="secondary-point"
                                            >

                                                <title>
                                                    ${secondaryDefinition.label}
                                                    ·
                                                    ${this.formatMonth(
                                                        months[index]
                                                            .monthKey
                                                    )}:
                                                    ${this.formatMetric(
                                                        point.value,
                                                        secondaryDefinition
                                                    )}
                                                </title>

                                            </circle>

                                        `
                                    ).join("")}

                                `
                                : ""
                        }

                        <polyline
                            points="${
                                this.polyline(
                                    primaryPoints
                                )
                            }"
                            class="primary"
                        ></polyline>

                        ${primaryPoints.map(
                            (
                                point,
                                index
                            ) => `

                                <circle
                                    cx="${point.x}"
                                    cy="${point.y}"
                                    r="4"
                                    class="point"
                                >

                                    <title>
                                        ${primaryDefinition.label}
                                        ·
                                        ${this.formatMonth(
                                            months[index]
                                                .monthKey
                                        )}:
                                        ${this.formatMetric(
                                            point.value,
                                            primaryDefinition
                                        )}
                                    </title>

                                </circle>

                            `
                        ).join("")}

                    </svg>

                    <div
                        class="atlas-analysis-chart-labels"
                        style="
                            width:
                                ${width}px;
                            grid-template-columns:
                                repeat(
                                    ${months.length},
                                    minmax(
                                        0,
                                        1fr
                                    )
                                );
                        "
                    >

                        ${months.map(
                            month => `

                                <span>
                                    ${this.formatShortMonth(
                                        month.monthKey
                                    )}
                                </span>

                            `
                        ).join("")}

                    </div>

                </div>

            </section>

        `;

    },

    statisticsPanel(
        months,
        definition,
        displayMode
    ) {

        const statistics =
            this.variableStatistics(
                months,
                definition,
                displayMode
            );

        const maximumIndex =
            statistics
                .values
                .indexOf(
                    statistics.maximum
                );

        const minimumIndex =
            statistics
                .values
                .indexOf(
                    statistics.minimum
                );

        const rows = [

            definition.accumulable &&
            displayMode ===
            "monthly"
                ? {

                    label:
                        "Total",

                    value:
                        this.formatMetric(
                            statistics
                                .values
                                .reduce(
                                    (
                                        total,
                                        value
                                    ) =>
                                        total +
                                        value,
                                    0
                                ),
                            definition
                        )

                }
                : null,

            {
                label:
                    "Promedio",

                value:
                    this.formatMetric(
                        statistics.average,
                        definition
                    )
            },

            {
                label:
                    "Mediana",

                value:
                    this.formatMetric(
                        statistics.median,
                        definition
                    )
            },

            {
                label:
                    "Máximo",

                value:
                    this.formatMetric(
                        statistics.maximum,
                        definition
                    ),

                detail:
                    maximumIndex >=
                    0
                        ? this.formatMonth(
                            months[
                                maximumIndex
                            ].monthKey
                        )
                        : ""
            },

            {
                label:
                    "Mínimo",

                value:
                    this.formatMetric(
                        statistics.minimum,
                        definition
                    ),

                detail:
                    minimumIndex >=
                    0
                        ? this.formatMonth(
                            months[
                                minimumIndex
                            ].monthKey
                        )
                        : ""
            },

            {
                label:
                    "Rango",

                value:
                    this.formatMetric(
                        statistics.range,
                        definition
                    )
            },

            {
                label:
                    "Meses sobre la media",

                value:
                    (
                        `${statistics.values.filter(
                            value =>
                                value >
                                statistics.average
                        ).length} meses`
                    )
            },

            {
                label:
                    "Meses bajo la media",

                value:
                    (
                        `${statistics.values.filter(
                            value =>
                                value <
                                statistics.average
                        ).length} meses`
                    )
            }

        ].filter(Boolean);

        const panelId =
            (
                `trend-statistics-` +
                `${definition.property}`
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="${panelId}"
                ${this.openAttribute(
                    panelId
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Estadísticas de ${definition.label}
                        </strong>

                        <small>
                            Distribución y extremos de la variable principal
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-card-grid">

                        ${rows.map(
                            row => `

                                <div>

                                    <small>
                                        ${row.label}
                                    </small>

                                    <strong>
                                        ${row.value}
                                    </strong>

                                    ${
                                        row.detail
                                            ? `

                                                <span>
                                                    ${row.detail}
                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            `
                        ).join("")}

                    </div>

                </div>

            </details>

        `;

    },

    variablePeriodComparisonPanel(
        periodComparison,
        definition
    ) {

        const panelId =
            (
                `trend-period-` +
                `${definition.property}`
            );

        if (
            !periodComparison.available
        ) {

            return `

                <details
                    class="panel atlas-analysis-panel atlas-analysis-details"
                    data-analysis-panel="${panelId}"
                    ${this.openAttribute(
                        panelId
                    )}
                >

                    <summary>

                        <div>

                            <strong>
                                Comparación del periodo
                            </strong>

                            <small>
                                No hay historial suficiente
                            </small>

                        </div>

                        <span>
                            +
                        </span>

                    </summary>

                    <div class="atlas-analysis-details-content">

                        ${this.emptyState(
                            "⌛",
                            "Historial insuficiente",
                            "Se necesitan más meses con actividad para comparar periodos equivalentes."
                        )}

                    </div>

                </details>

            `;

        }

        const currentValues =
            periodComparison
                .current
                .map(
                    month =>
                        this.metricValue(
                            month,
                            definition
                        )
                );

        const previousValues =
            periodComparison
                .previous
                .map(
                    month =>
                        this.metricValue(
                            month,
                            definition
                        )
                );

        const currentValue =
            definition.accumulable
                ? currentValues.reduce(
                    (
                        total,
                        value
                    ) =>
                        total + value,
                    0
                )
                : this.average(
                    currentValues
                );

        const previousValue =
            definition.accumulable
                ? previousValues.reduce(
                    (
                        total,
                        value
                    ) =>
                        total + value,
                    0
                )
                : this.average(
                    previousValues
                );

        const information =
            this.comparisonInformation(
                AtlasCalculations
                    .metricComparison(
                        currentValue,
                        previousValue
                    ),
                definition
                    .positiveIsGood,
                definition.percent
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="${panelId}"
                ${this.openAttribute(
                    panelId
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Comparación del periodo
                        </strong>

                        <small>
                            Bloques temporales equivalentes
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-period-comparison">

                        <article>

                            <small>
                                Periodo seleccionado
                            </small>

                            <strong>
                                ${this.formatMetric(
                                    currentValue,
                                    definition
                                )}
                            </strong>

                            <span>
                                ${periodComparison
                                    .currentLabel}
                            </span>

                        </article>

                        <article>

                            <small>
                                Periodo anterior
                            </small>

                            <strong>
                                ${this.formatMetric(
                                    previousValue,
                                    definition
                                )}
                            </strong>

                            <span>
                                ${periodComparison
                                    .previousLabel}
                            </span>

                        </article>

                    </div>

                    <div
                        class="atlas-analysis-period-result"
                        style="
                            color:
                                ${information.color};
                        "
                    >
                        ${information.icon}
                        ${information.text}
                    </div>

                </div>

            </details>

        `;

    },

    twoVariablePanel(
        months,
        primaryDefinition,
        secondaryDefinition
    ) {

        if (
            !secondaryDefinition ||
            months.length ===
            0
        ) {

            return "";

        }

        const primaryValues =
            months.map(
                month =>
                    this.metricValue(
                        month,
                        primaryDefinition
                    )
            );

        const secondaryValues =
            months.map(
                month =>
                    this.metricValue(
                        month,
                        secondaryDefinition
                    )
            );

        const primaryChange =
            primaryValues[
                primaryValues.length -
                1
            ] -
            primaryValues[0];

        const secondaryChange =
            secondaryValues[
                secondaryValues.length -
                1
            ] -
            secondaryValues[0];

        const averageDifference =
            this.average(
                primaryValues.map(
                    (
                        value,
                        index
                    ) =>
                        value -
                        secondaryValues[
                            index
                        ]
                )
            );

        const primaryWins =
            primaryValues.filter(
                (
                    value,
                    index
                ) =>
                    value >
                    secondaryValues[
                        index
                    ]
            ).length;

        const secondaryWins =
            secondaryValues.filter(
                (
                    value,
                    index
                ) =>
                    value <
                    secondaryValues[
                        index
                    ]
            ).length;

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    `${primaryDefinition.label} frente a ${secondaryDefinition.label}`,
                    "Comparación compacta de ambas variables"
                )}

                <div class="atlas-analysis-dual-comparison">

                    <div>

                        <small>
                            Media de ${primaryDefinition.label}
                        </small>

                        <strong>
                            ${this.formatMetric(
                                this.average(
                                    primaryValues
                                ),
                                primaryDefinition
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Media de ${secondaryDefinition.label}
                        </small>

                        <strong>
                            ${this.formatMetric(
                                this.average(
                                    secondaryValues
                                ),
                                secondaryDefinition
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Cambio de ${primaryDefinition.label}
                        </small>

                        <strong>
                            ${this.formatMetric(
                                primaryChange,
                                primaryDefinition
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Cambio de ${secondaryDefinition.label}
                        </small>

                        <strong>
                            ${this.formatMetric(
                                secondaryChange,
                                secondaryDefinition
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Diferencia media
                        </small>

                        <strong>
                            ${this.currency(
                                averageDifference
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Último mes
                        </small>

                        <strong class="atlas-analysis-small-text">
                            ${this.formatMetric(
                                primaryValues[
                                    primaryValues.length -
                                    1
                                ],
                                primaryDefinition
                            )}
                            ·
                            ${this.formatMetric(
                                secondaryValues[
                                    secondaryValues.length -
                                    1
                                ],
                                secondaryDefinition
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            ${primaryDefinition.label} superior
                        </small>

                        <strong>
                            ${primaryWins}
                            meses
                        </strong>

                    </div>

                    <div>

                        <small>
                            ${secondaryDefinition.label} superior
                        </small>

                        <strong>
                            ${secondaryWins}
                            meses
                        </strong>

                    </div>

                </div>

            </section>

        `;

    },

    budgetTrendPanel(budget) {

        const months =
            Array.isArray(
                budget?.months
            )
                ? budget.months
                : [];

        const maximum =
            Math.max(
                100,
                ...months
                    .map(
                        month =>
                            month.usedPercent
                    )
                    .filter(
                        value =>
                            value !==
                                null &&
                            value !==
                                undefined
                    )
                    .map(
                        value =>
                            this.number(value)
                    )
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-budget"
                ${this.openAttribute(
                    "global-budget"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Cumplimiento presupuestario
                        </strong>

                        <small>
                            Interpretación histórica de límites y desviaciones
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    ${
                        months.length ===
                        0
                            ? this.emptyState(
                                "▥",
                                "Sin histórico presupuestario",
                                "No hay meses suficientes para interpretar el cumplimiento."
                            )
                            : `

                                <div
                                    class="atlas-analysis-bar-chart"
                                    style="
                                        --atlas-columns:
                                            ${months.length};
                                    "
                                >

                                    ${months.map(
                                        month => {

                                            const used =
                                                month.usedPercent ===
                                                null
                                                    ? null
                                                    : this.number(
                                                        month
                                                            .usedPercent
                                                    );

                                            const status =
                                                this
                                                    .budgetStatusInformation(
                                                        month.status
                                                    );

                                            return `

                                                <div>

                                                    <strong>
                                                        ${
                                                            used ===
                                                            null
                                                                ? "—"
                                                                : `${used.toFixed(
                                                                    0
                                                                )}%`
                                                        }
                                                    </strong>

                                                    <i
                                                        style="
                                                            height:
                                                                ${Math.max(
                                                                    3,
                                                                    used ===
                                                                    null
                                                                        ? 3
                                                                        : (
                                                                            used /
                                                                            maximum
                                                                        ) *
                                                                        100
                                                                )}px;
                                                            background:
                                                                ${status.color};
                                                        "
                                                    ></i>

                                                    <small>
                                                        ${this.formatShortMonth(
                                                            month.monthKey
                                                        )}
                                                    </small>

                                                </div>

                                            `;

                                        }
                                    ).join("")}

                                </div>

                            `
                    }

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Dentro del límite
                            <strong>
                                ${this.number(
                                    budget
                                        ?.withinBudget
                                )}
                                meses
                            </strong>
                        </span>

                        <span>
                            Superados
                            <strong>
                                ${this.number(
                                    budget
                                        ?.exceeded
                                )}
                                meses
                            </strong>
                        </span>

                        <span>
                            Uso medio
                            <strong>
                                ${this.percent(
                                    budget
                                        ?.averageUsedPercent
                                )}
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    categoryEvolutionPanel(
        trend,
        selectedCategory
    ) {

        const categories =
            Array.isArray(
                trend?.categories
            )
                ? trend.categories
                : [];

        if (
            categories.length ===
            0
        ) {

            return "";

        }

        const selected =
            categories.find(
                category =>
                    category.key ===
                    selectedCategory
            ) ||
            categories[0];

        const monthly =
            Array.isArray(
                selected.monthly
            )
                ? selected.monthly
                : [];

        const maximum =
            Math.max(
                1,
                ...monthly.map(
                    month =>
                        Math.max(
                            0,
                            this.number(
                                month.amount
                            )
                        )
                )
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-categories"
                ${this.openAttribute(
                    "global-categories"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Evolución por categorías
                        </strong>

                        <small>
                            Cambios del gasto durante el periodo
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <label class="atlas-analysis-selector">

                        <span>
                            Categoría
                        </span>

                        <select data-analysis-category>

                            ${categories.map(
                                category => `

                                    <option
                                        value="${
                                            this.escape(
                                                category.key
                                            )
                                        }"
                                        ${
                                            category.key ===
                                            selected.key
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${this.escape(
                                            category.label ||
                                            category.category
                                        )}
                                    </option>

                                `
                            ).join("")}

                        </select>

                    </label>

                    <div
                        class="atlas-analysis-bar-chart"
                        style="
                            --atlas-columns:
                                ${monthly.length};
                        "
                    >

                        ${monthly.map(
                            month => `

                                <div>

                                    <strong>
                                        ${this.currency(
                                            month.amount
                                        )}
                                    </strong>

                                    <i
                                        style="
                                            height:
                                                ${Math.max(
                                                    3,
                                                    (
                                                        Math.max(
                                                            0,
                                                            this.number(
                                                                month.amount
                                                            )
                                                        ) /
                                                        maximum
                                                    ) *
                                                    100
                                                )}px;
                                        "
                                    ></i>

                                    <small>
                                        ${this.formatShortMonth(
                                            month.monthKey
                                        )}
                                    </small>

                                </div>

                            `
                        ).join("")}

                    </div>

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Total
                            <strong>
                                ${this.currency(
                                    selected.amount
                                )}
                            </strong>
                        </span>

                        <span>
                            Media
                            <strong>
                                ${this.currency(
                                    selected.average
                                )}
                            </strong>
                        </span>

                        <span>
                            Mes máximo
                            <strong>
                                ${
                                    selected.maximum
                                        ? this.formatMonth(
                                            selected
                                                .maximum
                                                .monthKey
                                        )
                                        : "—"
                                }
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    investmentPanel(trend) {

        const investment =
            trend?.investment || {};

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-investment"
                ${this.openAttribute(
                    "global-investment"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Evolución de la inversión
                        </strong>

                        <small>
                            Aportaciones, peso y regularidad
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-summary-list">

                        <div>

                            <span>
                                Total aportado
                            </span>

                            <strong>
                                ${this.currency(
                                    investment.total
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Media mensual
                            </span>

                            <strong>
                                ${this.currency(
                                    investment.average
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Meses con inversión
                            </span>

                            <strong>
                                ${this.number(
                                    investment
                                        .monthsWithInvestment
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Regularidad
                            </span>

                            <strong>
                                ${this.percent(
                                    investment
                                        .regularity
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Peso sobre ingresos
                            </span>

                            <strong>
                                ${this.percent(
                                    investment
                                        .incomeShare
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </details>

        `;

    },

    debtPanel(trend) {

        const debt =
            trend?.debt || {};

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-debt"
                ${this.openAttribute(
                    "global-debt"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Evolución de la deuda
                        </strong>

                        <small>
                            Pagos realizados y deuda pendiente
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-summary-list">

                        <div>

                            <span>
                                Total pagado
                            </span>

                            <strong>
                                ${this.currency(
                                    debt.total
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Media mensual
                            </span>

                            <strong>
                                ${this.currency(
                                    debt.average
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Meses con pagos
                            </span>

                            <strong>
                                ${this.number(
                                    debt
                                        .monthsWithPayments
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Deuda actual
                            </span>

                            <strong>
                                ${this.currency(
                                    debt.currentDebt
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </details>

        `;

    },

    consistencyPanel(consistency) {

        const months =
            this.number(
                consistency?.months
            );

        const denominator =
            Math.max(
                1,
                months
            );

        const indicators = [

            {
                label:
                    "Ahorro positivo",

                value:
                    this.number(
                        consistency
                            ?.positiveSavings
                    )
            },

            {
                label:
                    "Dentro del presupuesto",

                value:
                    this.number(
                        consistency
                            ?.withinBudget
                    )
            },

            {
                label:
                    "Con inversión",

                value:
                    this.number(
                        consistency
                            ?.withInvestment
                    )
            },

            {
                label:
                    "Objetivo de ahorro",

                value:
                    this.number(
                        consistency
                            ?.savingTargetMet
                    )
            }

        ];

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-consistency"
                ${this.openAttribute(
                    "global-consistency"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Consistencia financiera
                        </strong>

                        <small>
                            Frecuencia de resultados favorables
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-consistency">

                        ${indicators.map(
                            indicator => {

                                const percentage =
                                    (
                                        indicator.value /
                                        denominator
                                    ) * 100;

                                return `

                                    <div>

                                        <div>

                                            <span>
                                                ${indicator.label}
                                            </span>

                                            <strong>
                                                ${indicator.value}
                                                /
                                                ${months}
                                            </strong>

                                        </div>

                                        <i>

                                            <b
                                                style="
                                                    width:
                                                        ${this.clamp(
                                                            percentage
                                                        )}%;
                                                "
                                            ></b>

                                        </i>

                                    </div>

                                `;

                            }
                        ).join("")}

                    </div>

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Volatilidad del gasto
                            <strong>
                                ${this.percent(
                                    consistency
                                        ?.expenseVolatility
                                )}
                            </strong>
                        </span>

                        <span>
                            Volatilidad del ahorro
                            <strong>
                                ${this.percent(
                                    consistency
                                        ?.savingsVolatility
                                )}
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    bestWorstPanel(trend) {

        const items = [

            {
                label:
                    "Mayor ahorro",

                month:
                    trend
                        ?.bestSavingsMonth,

                property:
                    "savings"
            },

            {
                label:
                    "Peor ahorro",

                month:
                    trend
                        ?.worstSavingsMonth,

                property:
                    "savings"
            },

            {
                label:
                    "Menor gasto",

                month:
                    trend
                        ?.lowestExpenseMonth,

                property:
                    "expenses"
            },

            {
                label:
                    "Mayor inversión",

                month:
                    trend
                        ?.highestInvestmentMonth,

                property:
                    "invested"
            },

            {
                label:
                    "Mejor tasa de ahorro",

                month:
                    trend
                        ?.bestSavingRateMonth,

                property:
                    "savingRate",

                percent:
                    true
            },

            {
                label:
                    "Mayor salida de caja",

                month:
                    trend
                        ?.highestCashOutflowMonth,

                property:
                    "cashOutflow"
            }

        ];

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="global-highlights"
                ${this.openAttribute(
                    "global-highlights"
                )}
            >

                <summary>

                    <div>

                        <strong>
                            Mejores y peores meses
                        </strong>

                        <small>
                            Hitos del periodo seleccionado
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-card-grid">

                        ${items.map(
                            item => `

                                <div>

                                    <small>
                                        ${item.label}
                                    </small>

                                    <strong>
                                        ${
                                            item.percent
                                                ? this.percent(
                                                    item
                                                        .month
                                                        ?.[
                                                            item
                                                                .property
                                                        ]
                                                )
                                                : this.currency(
                                                    item
                                                        .month
                                                        ?.[
                                                            item
                                                                .property
                                                        ]
                                                )
                                        }
                                    </strong>

                                    <span>
                                        ${
                                            item.month
                                                ? this.formatMonth(
                                                    item
                                                        .month
                                                        .monthKey
                                                )
                                                : "Sin datos"
                                        }
                                    </span>

                                </div>

                            `
                        ).join("")}

                    </div>

                </div>

            </details>

        `;

    },

    trendsView(
        data,
        options
    ) {

        const period =
            options.trendsPeriod ||
            6;

        const primaryMetric =
            options.trendMetric ||
            "savings";

        const comparisonMetric =
            options
                .trendComparisonMetric ||
            "none";

        const displayMode =
            options.trendDisplayMode ||
            "monthly";

        const endMonth =
            options.analysisMonth ||
            options.currentMonth ||
            AtlasCalculations
                .monthKey();

        const trend =
            AtlasCalculations
                .trendSummary(
                    data,
                    period,
                    endMonth
                );

        const months =
            Array.isArray(
                trend?.months
            )
                ? trend.months
                : [];

        const primaryDefinition =
            this.metricDefinition(
                primaryMetric
            );

        const secondaryDefinition =
            comparisonMetric ===
                "none" ||
            comparisonMetric ===
                primaryMetric
                ? null
                : this.metricDefinition(
                    comparisonMetric
                );

        const comparisonPeriods =
            this.comparisonPeriods(
                data,
                months,
                period
            );

        const selectedCategory =
            options.trendCategory ||
            trend
                ?.categories
                ?.[0]
                ?.key ||
            "";

        return `

            ${this.trendsControls(
                period,
                primaryMetric,
                comparisonMetric,
                displayMode
            )}

            ${this.periodSummaryPanel(
                months,
                comparisonPeriods
            )}

            ${this.sectionHeading(
                "VARIABLE SELECCIONADA",
                primaryDefinition.label,
                "Lectura detallada de la variable principal"
            )}

            ${this.variableSummaryPanel(
                months,
                primaryDefinition,
                displayMode
            )}

            ${this.historicalPanel(
                months,
                primaryDefinition,
                secondaryDefinition,
                displayMode
            )}

            ${this.statisticsPanel(
                months,
                primaryDefinition,
                displayMode
            )}

            ${this.variablePeriodComparisonPanel(
                comparisonPeriods,
                primaryDefinition
            )}

            ${this.twoVariablePanel(
                months,
                primaryDefinition,
                secondaryDefinition
            )}

            ${this.sectionHeading(
                "VISIÓN GLOBAL DEL PERIODO",
                "Contexto financiero",
                "Presupuestos, categorías, inversión, deuda y consistencia"
            )}

            ${this.budgetTrendPanel(
                trend.budget
            )}

            ${this.categoryEvolutionPanel(
                trend,
                selectedCategory
            )}

            ${this.investmentPanel(
                trend
            )}

            ${this.debtPanel(
                trend
            )}

            ${this.consistencyPanel(
                trend.consistency
            )}

            ${this.bestWorstPanel(
                trend
            )}

        `;

    },

    render(
        data,
        options = {}
    ) {

        this.data =
            data;

        this.options =
            options;

        const activeView =
            options.analysisView ||
            "monthly";

        return `

            <div class="app atlas-analysis-app">

                ${AtlasUI.header()}

                <h1 class="page-title">
                    Análisis
                </h1>

                <p class="subtitle">
                    Entiende tus resultados y su evolución.
                </p>

                ${this.tabs(
                    activeView
                )}

                ${
                    activeView ===
                    "trends"
                        ? this.trendsView(
                            data,
                            options
                        )
                        : this.monthlyView(
                            data,
                            options
                        )
                }

            </div>

        `;

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-analysis-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-analysis-styles";

        style.textContent = `

            .atlas-analysis-app {
                --atlas-chart-1: #4da3ff;
                --atlas-chart-2: #5fd6c1;
                --atlas-chart-3: #a985ff;
                --atlas-chart-4: #f4b95e;
                --atlas-chart-5: #ff7189;
                --atlas-chart-6: #75c46b;
                --atlas-chart-7: #6bc8f2;
                --atlas-chart-8: #d993e8;
                padding-bottom:
                    calc(
                        116px +
                        env(
                            safe-area-inset-bottom
                        )
                    );
            }

            .atlas-analysis-tabs,
            .atlas-analysis-mode,
            .atlas-analysis-period,
            .atlas-analysis-mini-tabs,
            .atlas-analysis-view-selector {
                display: grid;
                gap: 6px;
                padding: 5px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 17px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
            }

            .atlas-analysis-tabs,
            .atlas-analysis-mode {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                margin-bottom: 16px;
            }

            .atlas-analysis-period {
                grid-template-columns:
                    repeat(
                        4,
                        minmax(0, 1fr)
                    );
                margin-bottom: 14px;
            }

            .atlas-analysis-view-selector {
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
            }

            .atlas-analysis-mini-tabs {
                grid-template-columns:
                    repeat(
                        2,
                        auto
                    );
                padding: 3px;
                border-radius: 13px;
            }

            .atlas-analysis-tabs button,
            .atlas-analysis-mode button,
            .atlas-analysis-period button,
            .atlas-analysis-mini-tabs button,
            .atlas-analysis-view-selector button {
                min-width: 0;
                min-height: 42px;
                padding:
                    0
                    8px;
                border-radius: 13px;
                color:
                    var(
                        --color-text-muted
                    );
                background: transparent;
                font-size: 12px;
                font-weight: 750;
                line-height: 1.2;
            }

            .atlas-analysis-mini-tabs button {
                min-height: 32px;
                font-size: 10px;
            }

            .atlas-analysis-tabs button.active,
            .atlas-analysis-mode button.active,
            .atlas-analysis-period button.active,
            .atlas-analysis-mini-tabs button.active,
            .atlas-analysis-view-selector button.active {
                color: #ffffff;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.28
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.17
                    );
            }

            .atlas-analysis-section {
                margin-bottom: 14px;
            }

            .atlas-analysis-section-title {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 12px;
                margin:
                    2px
                    2px
                    11px;
            }

            .atlas-analysis-section-title h2 {
                margin: 0;
                font-size: 17px;
            }

            .atlas-analysis-section-title p {
                margin-top: 4px;
                font-size: 10px;
            }

            .atlas-analysis-section-heading {
                margin:
                    25px
                    3px
                    13px;
            }

            .atlas-analysis-section-heading small {
                color:
                    var(
                        --color-primary
                    );
                font-size: 9px;
                font-weight: 850;
                letter-spacing: 0.12em;
            }

            .atlas-analysis-section-heading h2 {
                margin-top: 5px;
                font-size: 19px;
            }

            .atlas-analysis-section-heading p {
                margin-top: 5px;
                font-size: 10px;
            }

            .atlas-analysis-grid,
            .atlas-analysis-variable-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 10px;
                margin-bottom: 14px;
            }

            .atlas-analysis-metric {
                min-width: 0;
                padding: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.15
                    );
                border-radius: 18px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.028
                    );
            }

            .atlas-analysis-metric-wide {
                grid-column:
                    1 / -1;
            }

            .atlas-analysis-metric-label {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                line-height: 1.35;
            }

            .atlas-analysis-metric-value {
                display: block;
                margin-top: 7px;
                font-size: 19px;
                line-height: 1.12;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-text-value {
                font-size: 15px;
            }

            .atlas-analysis-small-text {
                font-size: 10px !important;
                line-height: 1.4;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-metric small {
                display: block;
                margin-top: 6px;
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-analysis-metric-detail {
                display: block;
                margin-top: 7px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.45;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-panel {
                margin-bottom: 14px;
            }

            .atlas-analysis-panel-head {
                align-items: flex-start;
            }

            .atlas-analysis-panel-head h2,
            .atlas-analysis-panel-head p {
                line-height: 1.4;
            }

            .atlas-analysis-panel-right {
                flex: 0 0 auto;
            }

            .atlas-analysis-badge {
                display: inline-flex;
                align-items: center;
                min-height: 27px;
                padding:
                    0
                    9px;
                border-radius: 99px;
                color: #ffffff;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.15
                    );
                font-size: 9px;
                font-weight: 750;
            }

            .atlas-analysis-empty {
                padding:
                    24px
                    10px;
                text-align: center;
            }

            .atlas-analysis-empty > div {
                margin-bottom: 8px;
                font-size: 27px;
            }

            .atlas-analysis-empty p {
                margin-top: 6px;
                line-height: 1.5;
            }

            .atlas-analysis-forecast-legend {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap:
                    8px
                    13px;
                margin-top: 14px;
            }

            .atlas-analysis-forecast-legend span {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-forecast-legend span::before {
                width: 9px;
                height: 9px;
                border-radius: 3px;
                content: "";
            }

            .atlas-analysis-forecast-legend .real::before {
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-forecast-legend .pending::before {
                background:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-forecast-legend .negative::before {
                background:
                    var(
                        --color-danger
                    );
            }

            .atlas-analysis-forecast-chart {
                display: grid;
                gap: 15px;
                margin-top: 14px;
            }

            .atlas-analysis-forecast-row {
                display: grid;
                grid-template-columns:
                    minmax(
                        82px,
                        1fr
                    )
                    minmax(
                        88px,
                        1.3fr
                    )
                    minmax(
                        67px,
                        auto
                    );
                align-items: center;
                gap: 9px;
            }

            .atlas-analysis-forecast-label strong,
            .atlas-analysis-forecast-label small {
                display: block;
            }

            .atlas-analysis-forecast-label strong {
                font-size: 11px;
            }

            .atlas-analysis-forecast-label small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
            }

            .atlas-analysis-forecast-track {
                display: flex;
                height: 11px;
                overflow: hidden;
                border-radius: 99px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
            }

            .atlas-analysis-forecast-track i {
                display: block;
                flex: 0 0 auto;
                height: 100%;
            }

            .atlas-analysis-forecast-track .real {
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-forecast-track .pending {
                background:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-forecast-track .pending.negative {
                background:
                    var(
                        --color-danger
                    );
            }

            .atlas-analysis-forecast-result {
                min-width: 0;
                text-align: right;
            }

            .atlas-analysis-forecast-result small,
            .atlas-analysis-forecast-result strong {
                display: block;
            }

            .atlas-analysis-forecast-result small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
            }

            .atlas-analysis-forecast-result strong {
                margin-top: 3px;
                font-size: 11px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-budget-summary,
            .atlas-analysis-period-comparison,
            .atlas-analysis-dual-comparison {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 10px;
                margin-top: 15px;
            }

            .atlas-analysis-budget-summary div,
            .atlas-analysis-period-comparison article,
            .atlas-analysis-dual-comparison div {
                min-width: 0;
                padding: 11px;
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-analysis-budget-summary small,
            .atlas-analysis-budget-summary strong,
            .atlas-analysis-period-comparison small,
            .atlas-analysis-period-comparison strong,
            .atlas-analysis-period-comparison span,
            .atlas-analysis-dual-comparison small,
            .atlas-analysis-dual-comparison strong {
                display: block;
            }

            .atlas-analysis-budget-summary small,
            .atlas-analysis-period-comparison small,
            .atlas-analysis-dual-comparison small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
            }

            .atlas-analysis-budget-summary strong,
            .atlas-analysis-period-comparison strong,
            .atlas-analysis-dual-comparison strong {
                margin-top: 5px;
                font-size: 13px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-period-comparison span {
                margin-top: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.4;
            }

            .atlas-analysis-period-result {
                margin-top: 12px;
                padding: 11px;
                border-radius: 13px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
                font-size: 12px;
                font-weight: 750;
                text-align: center;
            }

            .atlas-analysis-budget-progress {
                height: 8px;
                margin-top: 14px;
                overflow: hidden;
                border-radius: 99px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.07
                    );
            }

            .atlas-analysis-budget-progress i {
                display: block;
                height: 100%;
                border-radius: inherit;
            }

            .atlas-analysis-budget-note {
                margin-top: 9px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-analysis-alerts {
                display: grid;
                gap: 8px;
                margin-top: 14px;
                padding-top: 12px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-alerts div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                font-size: 10px;
            }

            .atlas-analysis-primary-link {
                width: 100%;
                min-height: 43px;
                margin-top: 14px;
                border-radius: 14px;
                color: #ffffff;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.18
                    );
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-analysis-distribution {
                display: grid;
                grid-template-columns:
                    124px
                    minmax(
                        0,
                        1fr
                    );
                align-items: center;
                gap: 15px;
                margin-top: 15px;
            }

            .atlas-analysis-donut-wrap {
                position: relative;
                width: 124px;
                height: 124px;
            }

            .atlas-analysis-donut {
                width: 100%;
                height: 100%;
                transform:
                    rotate(
                        -90deg
                    );
            }

            .atlas-analysis-donut-center {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .atlas-analysis-donut-center small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-donut-center strong {
                margin-top: 4px;
                max-width: 82px;
                font-size: 12px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-distribution-list {
                min-width: 0;
            }

            .atlas-analysis-distribution-row {
                display: grid;
                grid-template-columns:
                    8px
                    minmax(
                        0,
                        1fr
                    )
                    auto;
                align-items: center;
                gap: 8px;
                padding:
                    7px
                    0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.08
                    );
            }

            .atlas-analysis-distribution-row:last-child {
                border-bottom: 0;
            }

            .atlas-analysis-distribution-row > i {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .atlas-analysis-distribution-row div {
                min-width: 0;
            }

            .atlas-analysis-distribution-row div strong,
            .atlas-analysis-distribution-row div small {
                display: block;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-distribution-row div strong {
                font-size: 10px;
            }

            .atlas-analysis-distribution-row div small {
                margin-top: 3px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
                line-height: 1.35;
            }

            .atlas-analysis-distribution-row > strong {
                font-size: 10px;
                text-align: right;
            }

            .atlas-analysis-inline-facts {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 8px;
                margin-top: 14px;
                padding-top: 12px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-inline-facts span {
                min-width: 0;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
                text-align: center;
            }

            .atlas-analysis-inline-facts strong {
                display: block;
                margin-top: 4px;
                color:
                    var(
                        --color-text
                    );
                font-size: 10px;
                line-height: 1.35;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-flow {
                display: flex;
                min-height: 80px;
                margin-top: 16px;
                overflow: hidden;
                border-radius: 16px;
            }

            .atlas-analysis-flow div {
                display: flex;
                min-width: 38px;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding:
                    8px
                    4px;
                text-align: center;
            }

            .atlas-analysis-flow strong {
                font-size: 11px;
            }

            .atlas-analysis-flow small {
                margin-top: 5px;
                font-size: 7px;
                line-height: 1.2;
            }

            .atlas-analysis-flow .expense {
                background:
                    rgba(
                        255,
                        113,
                        137,
                        0.3
                    );
            }

            .atlas-analysis-flow .investment {
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.3
                    );
            }

            .atlas-analysis-flow .debt {
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.3
                    );
            }

            .atlas-analysis-flow .saving {
                background:
                    rgba(
                        95,
                        214,
                        193,
                        0.3
                    );
            }

            .atlas-analysis-flow .deficit {
                background:
                    rgba(
                        255,
                        113,
                        137,
                        0.52
                    );
            }

            .atlas-analysis-flow-values {
                display: grid;
                grid-template-columns:
                    repeat(
                        5,
                        minmax(0, 1fr)
                    );
                gap: 5px;
                margin-top: 11px;
            }

            .atlas-analysis-flow-values span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
                line-height: 1.3;
                text-align: center;
            }

            .atlas-analysis-flow-values strong {
                display: block;
                margin-top: 3px;
                color:
                    var(
                        --color-text
                    );
                font-size: 8px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-details {
                padding: 0;
                overflow: hidden;
            }

            .atlas-analysis-details summary {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 14px;
                padding: 17px;
                cursor: pointer;
                list-style: none;
            }

            .atlas-analysis-details summary::-webkit-details-marker {
                display: none;
            }

            .atlas-analysis-details summary div {
                min-width: 0;
            }

            .atlas-analysis-details summary div strong,
            .atlas-analysis-details summary div small {
                display: block;
            }

            .atlas-analysis-details summary div strong {
                font-size: 15px;
                line-height: 1.3;
            }

            .atlas-analysis-details summary div small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-analysis-details summary > span {
                flex: 0 0 auto;
                color:
                    var(
                        --color-primary
                    );
                font-size: 20px;
                transition:
                    transform
                    0.18s ease;
            }

            .atlas-analysis-details[open]
            summary > span {
                transform:
                    rotate(
                        45deg
                    );
            }

            .atlas-analysis-details-content {
                padding:
                    0
                    17px
                    17px;
            }

            .atlas-analysis-summary-list > div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                padding:
                    12px
                    0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-summary-list > div:last-child {
                border-bottom: 0;
            }

            .atlas-analysis-summary-list span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-analysis-summary-list strong {
                font-size: 11px;
                text-align: right;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-upcoming {
                margin-top: 14px;
            }

            .atlas-analysis-upcoming > small {
                display: block;
                margin-bottom: 6px;
            }

            .atlas-analysis-upcoming > div {
                display: grid;
                grid-template-columns:
                    auto
                    minmax(
                        0,
                        1fr
                    )
                    auto;
                gap: 8px;
                padding:
                    10px
                    0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.08
                    );
                font-size: 9px;
            }

            .atlas-analysis-upcoming > div strong {
                overflow-wrap: anywhere;
            }

            .atlas-analysis-card-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 9px;
            }

            .atlas-analysis-card-grid div {
                min-width: 0;
                padding: 11px;
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-analysis-card-grid small,
            .atlas-analysis-card-grid strong,
            .atlas-analysis-card-grid span {
                display: block;
            }

            .atlas-analysis-card-grid small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
            }

            .atlas-analysis-card-grid strong {
                margin-top: 5px;
                font-size: 12px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-card-grid span {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.4;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-daily-chart,
            .atlas-analysis-bar-chart {
                display: grid;
                grid-template-columns:
                    repeat(
                        var(
                            --atlas-columns,
                            6
                        ),
                        minmax(
                            40px,
                            1fr
                        )
                    );
                align-items: end;
                gap: 7px;
                min-height: 128px;
                overflow-x: auto;
                -webkit-overflow-scrolling:
                    touch;
            }

            .atlas-analysis-daily-chart > div,
            .atlas-analysis-bar-chart > div {
                display: flex;
                min-width: 40px;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }

            .atlas-analysis-daily-chart i,
            .atlas-analysis-bar-chart i {
                display: block;
                width: 24px;
                border-radius:
                    7px
                    7px
                    3px
                    3px;
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-daily-chart i {
                width: 8px;
            }

            .atlas-analysis-daily-chart strong,
            .atlas-analysis-bar-chart strong {
                font-size: 8px;
                white-space: nowrap;
            }

            .atlas-analysis-daily-chart small,
            .atlas-analysis-bar-chart small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                white-space: nowrap;
            }

            .atlas-analysis-insights {
                display: grid;
                gap: 9px;
                margin-top: 13px;
            }

            .atlas-analysis-insights article {
                display: flex;
                gap: 11px;
                padding: 12px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
                border-radius: 15px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .atlas-analysis-insights article > span {
                display: flex;
                width: 25px;
                height: 25px;
                flex: 0 0 auto;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
                font-weight: 800;
            }

            .atlas-analysis-insights strong {
                font-size: 11px;
            }

            .atlas-analysis-insights p {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.5;
            }

            .atlas-analysis-insights .good > span {
                color:
                    var(
                        --color-success
                    );
            }

            .atlas-analysis-insights .warning > span {
                color: #f4b95e;
            }

            .atlas-analysis-insights .bad > span {
                color:
                    var(
                        --color-danger
                    );
            }

            .atlas-analysis-controls {
                margin-bottom: 15px;
                padding: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 19px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .atlas-analysis-control-label {
                display: block;
                margin:
                    1px
                    3px
                    7px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                font-weight: 750;
            }

            .atlas-analysis-control-label-spaced {
                margin-top: 14px;
            }

            .atlas-analysis-selectors {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 10px;
            }

            .atlas-analysis-selectors label,
            .atlas-analysis-selector {
                display: flex;
                min-width: 0;
                flex-direction: column;
                gap: 7px;
            }

            .atlas-analysis-selectors span,
            .atlas-analysis-selector > span {
                padding-left: 3px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                font-weight: 700;
            }

            .atlas-analysis-selectors select,
            .atlas-analysis-selector select {
                width: 100%;
                min-height: 47px;
                padding:
                    0
                    12px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.2
                    );
                border-radius: 14px;
                outline: none;
                background: #19243a;
                color: #f7f8fc;
                font-size: 13px;
            }

            .atlas-analysis-period-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 9px;
                margin-top: 14px;
            }

            .atlas-analysis-period-summary article {
                min-width: 0;
                padding: 12px;
                border-radius: 15px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-analysis-period-summary small,
            .atlas-analysis-period-summary strong,
            .atlas-analysis-period-summary span {
                display: block;
            }

            .atlas-analysis-period-summary small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
            }

            .atlas-analysis-period-summary strong {
                margin-top: 6px;
                font-size: 15px;
                line-height: 1.2;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-period-summary span {
                margin-top: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.35;
            }

            .atlas-analysis-legend {
                display: flex;
                flex-wrap: wrap;
                gap:
                    8px
                    13px;
                margin-top: 13px;
            }

            .atlas-analysis-legend span {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-legend span::before {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                content: "";
            }

            .atlas-analysis-legend .primary::before {
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-legend .secondary::before {
                background:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-legend .view::before {
                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.3
                    );
                background: transparent;
            }

            .atlas-analysis-flat-note {
                margin-top: 12px;
                padding:
                    8px
                    10px;
                border-radius: 12px;
                color:
                    var(
                        --color-text-muted
                    );
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
                font-size: 9px;
                text-align: center;
            }

            .atlas-analysis-chart-scroll {
                max-width: 100%;
                margin-top: 12px;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling:
                    touch;
            }

            .atlas-analysis-chart-scroll svg {
                display: block;
                height: 220px;
                max-height: 220px;
            }

            .atlas-analysis-chart-scroll line.zero {
                stroke:
                    rgba(
                        255,
                        255,
                        255,
                        0.16
                    );
                stroke-width: 1;
                stroke-dasharray:
                    5
                    5;
            }

            .atlas-analysis-chart-scroll polyline {
                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .atlas-analysis-chart-scroll .primary {
                stroke:
                    var(
                        --color-primary
                    );
                stroke-width: 3.5;
            }

            .atlas-analysis-chart-scroll .secondary {
                stroke:
                    var(
                        --atlas-chart-3
                    );
                stroke-width: 2.8;
                opacity: 0.92;
            }

            .atlas-analysis-chart-scroll .point {
                fill:
                    var(
                        --color-primary
                    );
                stroke: #19243a;
                stroke-width: 2;
            }

            .atlas-analysis-chart-scroll .secondary-point {
                fill:
                    var(
                        --atlas-chart-3
                    );
                stroke: #19243a;
                stroke-width: 2;
            }

            .atlas-analysis-chart-labels {
                display: grid;
                gap: 0;
                margin-top: 4px;
                padding:
                    0
                    26px;
                box-sizing:
                    border-box;
            }

            .atlas-analysis-chart-labels span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                text-align: center;
                white-space: nowrap;
            }

            .atlas-analysis-consistency {
                display: grid;
                gap: 13px;
            }

            .atlas-analysis-consistency > div > div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                margin-bottom: 7px;
                font-size: 10px;
            }

            .atlas-analysis-consistency i {
                display: block;
                height: 7px;
                overflow: hidden;
                border-radius: 99px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.07
                    );
            }

            .atlas-analysis-consistency b {
                display: block;
                height: 100%;
                border-radius: inherit;
                background:
                    var(
                        --color-primary
                    );
            }

            @media (
                max-width: 390px
            ) {

                .atlas-analysis-distribution {
                    grid-template-columns:
                        104px
                        minmax(
                            0,
                            1fr
                        );
                    gap: 10px;
                }

                .atlas-analysis-donut-wrap {
                    width: 104px;
                    height: 104px;
                }

                .atlas-analysis-forecast-row {
                    grid-template-columns:
                        minmax(
                            76px,
                            1fr
                        )
                        minmax(
                            70px,
                            1fr
                        )
                        minmax(
                            60px,
                            auto
                        );
                    gap: 7px;
                }

            }

            @media (
                max-width: 350px
            ) {

                .atlas-analysis-period {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .atlas-analysis-view-selector,
                .atlas-analysis-selectors {
                    grid-template-columns:
                        1fr;
                }

                .atlas-analysis-distribution {
                    grid-template-columns:
                        1fr;
                }

                .atlas-analysis-donut-wrap {
                    margin:
                        0
                        auto;
                }

                .atlas-analysis-inline-facts {
                    grid-template-columns:
                        1fr;
                }

                .atlas-analysis-forecast-row {
                    grid-template-columns:
                        1fr;
                }

                .atlas-analysis-forecast-result {
                    text-align: left;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    init() {

        this.installStyles();

        const previousRender =
            AtlasUI.render.bind(
                AtlasUI
            );

        AtlasUI.render = (
            route,
            data,
            options = {}
        ) => {

            if (
                route !==
                "analysis"
            ) {

                previousRender(
                    route,
                    data,
                    options
                );

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
                this.render(
                    data,
                    options
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
                                "analysis"
                        );

                    }
                );

            AtlasUI.bindDynamicControls();

        };

    }

};

AtlasAnalysisUI.init();

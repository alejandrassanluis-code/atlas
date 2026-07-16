/* ==========================================================
   ATLAS
   analysis.js
   Atlas v1.0 — Análisis financiero
========================================================== */

const AtlasAnalysisUI = {

    data: null,
    options: {},

    number(value) {

        const result = Number(value);

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
            String(value ?? "")
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
        items,
        property
    ) {

        return (
            Array.isArray(items)
                ? items
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

        const list = (
            Array.isArray(values)
                ? values
                : []
        ).map(
            value =>
                this.number(value)
        );

        if (!list.length) {

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

        const list = (
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

        if (!list.length) {

            return 0;

        }

        const middle =
            Math.floor(
                list.length / 2
            );

        return list.length % 2 === 0
            ? (
                list[middle - 1] +
                list[middle]
            ) / 2
            : list[middle];

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

        return (
            `${date.getFullYear()}-` +
            `${String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}`
        );

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

    metricDefinitions() {

        return {

            savings: {
                label: "Ahorro",
                property: "savings",
                positiveIsGood: true,
                percent: false,
                accumulable: true
            },

            income: {
                label: "Ingresos",
                property: "income",
                positiveIsGood: true,
                percent: false,
                accumulable: true
            },

            expenses: {
                label: "Gasto neto",
                property: "expenses",
                positiveIsGood: false,
                percent: false,
                accumulable: true
            },

            grossExpenses: {
                label: "Gasto bruto",
                property: "grossExpenses",
                positiveIsGood: false,
                percent: false,
                accumulable: true
            },

            reimbursements: {
                label: "Reembolsos",
                property: "reimbursements",
                positiveIsGood: true,
                percent: false,
                accumulable: true
            },

            invested: {
                label: "Invertido",
                property: "invested",
                positiveIsGood: true,
                percent: false,
                accumulable: true
            },

            savingRate: {
                label: "Tasa de ahorro",
                property: "savingRate",
                positiveIsGood: true,
                percent: true,
                accumulable: false
            },

            debtPayments: {
                label: "Pagos de deuda",
                property: "debtPayments",
                positiveIsGood: true,
                percent: false,
                accumulable: true
            },

            cashOutflow: {
                label: "Salidas de caja",
                property: "cashOutflow",
                positiveIsGood: false,
                percent: false,
                accumulable: true
            },

            cashResult: {
                label: "Resultado de caja",
                property: "cashResult",
                positiveIsGood: true,
                percent: false,
                accumulable: true
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

    openAttribute(
        panelId,
        defaultOpen = false
    ) {

        const panels =
            Array.isArray(
                this.options
                    ?.analysisOpenPanels
            )
                ? this.options
                    .analysisOpenPanels
                : [];

        if (
            panels.includes(
                panelId
            )
        ) {

            return "open";

        }

        return defaultOpen
            ? "open"
            : "";

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
                                    ${this.escape(subtitle)}
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

    emptyState(
        icon,
        title,
        text
    ) {

        return `

            <div class="atlas-analysis-empty">

                <span>
                    ${icon}
                </span>

                <strong>
                    ${this.escape(title)}
                </strong>

                <p class="note">
                    ${this.escape(text)}
                </p>

            </div>

        `;

    },

    tabs(activeView) {

        return `

            <div class="atlas-analysis-tabs">

                <button
                    type="button"
                    data-action="showMonthlyAnalysis"
                    class="${
                        activeView === "monthly"
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
                        activeView === "trends"
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
                monthKey === currentMonth,

            previousAction:
                "previousAnalysisMonth",

            nextAction:
                "nextAnalysisMonth",

            currentAction:
                "currentAnalysisMonth",

            subtitle:
                monthKey === currentMonth
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

    comparisonText(
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
                icon: "•",
                text: "Sin cambios",
                color: "var(--color-text-muted)"
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
                            ? ""
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

    forecastDetail(
        real,
        pending
    ) {

        const amount =
            this.number(pending);

        return (
            `Real ${this.currency(real)} · ` +
            `Pendiente ` +
            `${
                amount > 0
                    ? "+"
                    : amount < 0
                        ? "−"
                        : ""
            }` +
            `${this.currency(
                Math.abs(amount)
            )}`
        );

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

        const income =
            this.number(
                forecast?.estimated
                    ?.income
            );

        const expenses =
            this.number(
                forecast?.estimated
                    ?.expenses
            );

        const invested =
            this.number(
                forecast?.estimated
                    ?.invested
            );

        const savings =
            this.number(
                forecast?.estimated
                    ?.savings
            );

        const cashResult =
            this.number(
                forecast?.estimated
                    ?.cashResult
            );

        const cashInflow =
            this.number(
                summary.monthlyCashInflow
            ) +
            this.number(
                forecast?.pending
                    ?.income
            );

        return {

            monthlyIncome:
                income,

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
                expenses,

            monthlyInvested:
                invested,

            monthlySavings:
                savings,

            monthlySavingRate:
                income > 0
                    ? (
                        savings /
                        income
                    ) * 100
                    : 0,

            monthlyCashInflow:
                cashInflow,

            monthlyCashOutflow:
                cashInflow -
                cashResult,

            monthlyCashResult:
                cashResult,

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

    summaryMetric(
        title,
        value,
        comparison,
        options = {}
    ) {

        const information =
            this.comparisonText(
                comparison,
                options.positiveIsGood !== false,
                options.percentagePoint === true
            );

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
                    ${
                        options.percent
                            ? this.percent(value)
                            : this.currency(value)
                    }
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
                                    ? "Confirmados más movimientos pendientes"
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
                            icon: "🟢",
                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary.monthlyIncome,
                                        forecast?.pending
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
                            icon: "🔴",
                            positiveIsGood: false,
                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary.monthlyExpenses,
                                        forecast?.pending
                                            ?.expenses
                                    )
                                    : (
                                        this.number(
                                            summary.monthlyReimbursements
                                        ) > 0
                                            ? (
                                                `Bruto ${this.currency(
                                                    summary.monthlyGrossExpenses
                                                )} · ` +
                                                `Reembolsos ${this.currency(
                                                    summary.monthlyReimbursements
                                                )}`
                                            )
                                            : ""
                                    )
                        }
                    )}

                    ${this.summaryMetric(
                        "Invertido",
                        display.monthlyInvested,
                        comparison.invested,
                        {
                            icon: "📈",
                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary.monthlyInvested,
                                        forecast?.pending
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
                            icon: "💰",
                            color:
                                this.statusColor(
                                    display.monthlySavings
                                ),
                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary.monthlySavings,
                                        forecast?.pending
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
                            icon: "🎯",
                            percent: true,
                            percentagePoint: true,
                            color:
                                this.statusColor(
                                    display.monthlySavingRate
                                )
                        }
                    )}

                    ${this.summaryMetric(
                        "Resultado de caja",
                        display.monthlyCashResult,
                        comparison.cashResult,
                        {
                            icon: "💧",
                            color:
                                this.statusColor(
                                    display.monthlyCashResult
                                ),
                            detail:
                                forecastMode
                                    ? this.forecastDetail(
                                        summary.monthlyCashResult,
                                        forecast?.pending
                                            ?.cashResult
                                    )
                                    : (
                                        `Entradas ${this.currency(
                                            summary.monthlyCashInflow
                                        )} · ` +
                                        `Salidas ${this.currency(
                                            summary.monthlyCashOutflow
                                        )}`
                                    )
                        }
                    )}

                </div>

            </section>

        `;

    },

    budgetStatusInformation(status) {

        const statuses = {

            healthy: {
                label: "Dentro del presupuesto",
                color: "var(--color-success)"
            },

            warning: {
                label: "Cerca del límite",
                color: "#f4b95e"
            },

            exceeded: {
                label: "Presupuesto superado",
                color: "var(--color-danger)"
            },

            unbudgeted: {
                label: "Gasto sin presupuesto",
                color: "var(--color-danger)"
            },

            no_budget: {
                label: "Sin presupuesto configurado",
                color: "var(--color-text-muted)"
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

        const spent =
            this.number(
                budget.totalSpent
            ) +
            (
                forecastMode
                    ? this.number(
                        forecast?.pending
                            ?.expenses
                    )
                    : 0
            );

        const totalBudget =
            this.number(
                budget.totalBudget
            );

        const remaining =
            totalBudget -
            spent;

        const usedPercent =
            AtlasCalculations
                .budgetUsedPercent(
                    spent,
                    totalBudget
                );

        const statusKey =
            AtlasCalculations
                .budgetStatus(
                    this.data,
                    spent,
                    totalBudget
                );

        const status =
            this.budgetStatusInformation(
                statusKey
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
                                usedPercent === null
                                    ? "—"
                                    : this.percent(
                                        usedPercent
                                    )
                            }
                        </strong>
                    `
                )}

                <div class="atlas-analysis-facts">

                    <div>
                        <small>Presupuesto</small>
                        <strong>
                            ${this.currency(totalBudget)}
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
                            ${this.currency(spent)}
                        </strong>
                    </div>

                    <div>
                        <small>Margen</small>
                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        remaining
                                    )};
                            "
                        >
                            ${this.currency(remaining)}
                        </strong>
                    </div>

                    <div>
                        <small>Estado</small>
                        <strong
                            style="
                                color:
                                    ${status.color};
                            "
                        >
                            ${status.label}
                        </strong>
                    </div>

                </div>

                <div class="atlas-analysis-progress">

                    <i
                        style="
                            width:
                                ${this.clamp(
                                    usedPercent === null
                                        ? 0
                                        : usedPercent
                                )}%;
                            background:
                                ${status.color};
                        "
                    ></i>

                </div>

                <button
                    type="button"
                    data-action="openAnalysisBudgets"
                    class="atlas-analysis-link"
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
                        level === "category"
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
                        level === "subcategory"
                            ? "active"
                            : ""
                    }"
                >
                    Subcategorías
                </button>

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

        const items = (
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

        if (!items.length) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        "Distribución del gasto",
                        "Composición del gasto neto confirmado",
                        this.distributionControls(
                            level
                        )
                    )}

                    ${this.emptyState(
                        "🧾",
                        "Sin gastos",
                        "No hay gasto neto positivo en este mes."
                    )}

                </section>

            `;

        }

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Distribución del gasto",
                    "Composición del gasto neto confirmado",
                    this.distributionControls(
                        level
                    )
                )}

                <div class="atlas-analysis-distribution-list">

                    ${items
                        .slice(
                            0,
                            10
                        )
                        .map(
                            (
                                item,
                                index
                            ) => {

                                const share =
                                    total > 0
                                        ? (
                                            this.number(
                                                item.amount
                                            ) /
                                            total
                                        ) * 100
                                        : 0;

                                return `

                                    <article>

                                        <i
                                            style="
                                                background:
                                                    var(
                                                        --atlas-chart-${
                                                            (
                                                                index % 8
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
                                                    item.name ||
                                                    "Sin categoría"
                                                )}
                                            </strong>

                                            <small>
                                                ${share.toFixed(0)}%
                                            </small>

                                            <span>

                                                <b
                                                    style="
                                                        width:
                                                            ${this.clamp(
                                                                share
                                                            )}%;
                                                        background:
                                                            var(
                                                                --atlas-chart-${
                                                                    (
                                                                        index % 8
                                                                    ) + 1
                                                                }
                                                            );
                                                    "
                                                ></b>

                                            </span>

                                        </div>

                                        <strong>
                                            ${this.currency(
                                                item.amount
                                            )}
                                        </strong>

                                    </article>

                                `;

                            }
                        )
                        .join("")}

                </div>

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
                        "Relación entre ingresos y destinos"
                    )}

                    ${this.emptyState(
                        "↔",
                        "Sin ingresos",
                        "No hay ingresos para calcular el reparto."
                    )}

                </section>

            `;

        }

        const rows = [

            {
                label: "Gasto",
                amount:
                    this.number(
                        summary.monthlyExpenses
                    ),
                className: "expense"
            },

            {
                label: "Inversión",
                amount:
                    this.number(
                        summary.monthlyInvested
                    ),
                className: "investment"
            },

            {
                label: "Deuda",
                amount:
                    this.number(
                        summary.monthlyDebtPayments
                    ),
                className: "debt"
            },

            {
                label:
                    this.number(
                        summary.monthlySavings
                    ) >= 0
                        ? "Ahorro"
                        : "Déficit",

                amount:
                    Math.abs(
                        this.number(
                            summary.monthlySavings
                        )
                    ),

                className:
                    this.number(
                        summary.monthlySavings
                    ) >= 0
                        ? "saving"
                        : "deficit"
            }

        ].filter(
            row =>
                row.amount > 0
        );

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Flujo del dinero",
                    "Relación entre ingresos, gasto, inversión, deuda y ahorro"
                )}

                <div class="atlas-analysis-flow">

                    ${rows.map(
                        row => `

                            <article class="${
                                row.className
                            }">

                                <strong>
                                    ${(
                                        (
                                            row.amount /
                                            income
                                        ) * 100
                                    ).toFixed(0)}%
                                </strong>

                                <small>
                                    ${row.label}
                                </small>

                                <span>
                                    ${this.currency(
                                        row.amount
                                    )}
                                </span>

                            </article>

                        `
                    ).join("")}

                </div>

            </section>

        `;

    },

    recurringRules() {

        return Array.isArray(
            this.data?.catalog
                ?.recurringRules
        )
            ? this.data.catalog
                .recurringRules
            : [];

    },

    recurringTitle(occurrence) {

        const ruleId =
            occurrence?.ruleId ||
            occurrence?.recurringRuleId;

        const rule =
            this.recurringRules()
                .find(
                    item =>
                        item.id === ruleId
                );

        return (
            rule?.name ||
            occurrence?.name ||
            occurrence?.title ||
            occurrence?.description ||
            "Movimiento recurrente"
        );

    },

    recurringPanel(
        forecast,
        monthKey
    ) {

        const pending =
            forecast?.pending || {};

        const count =
            this.number(
                pending.count
            );

        if (!count) {

            return "";

        }

        const occurrences = (
            Array.isArray(
                pending.occurrences
            )
                ? pending.occurrences
                : []
        ).slice(
            0,
            6
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
                            ${count} movimientos pendientes
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        <div>
                            <small>Ingresos</small>
                            <strong>
                                ${this.currency(
                                    pending.income
                                )}
                            </strong>
                        </div>

                        <div>
                            <small>Gastos</small>
                            <strong>
                                ${this.currency(
                                    pending.expenses
                                )}
                            </strong>
                        </div>

                        <div>
                            <small>Inversión</small>
                            <strong>
                                ${this.currency(
                                    pending.invested
                                )}
                            </strong>
                        </div>

                        <div>
                            <small>Deuda</small>
                            <strong>
                                ${this.currency(
                                    pending.debtPayments
                                )}
                            </strong>
                        </div>

                    </div>

                    ${
                        occurrences.length
                            ? `
                                <div class="atlas-analysis-recurring-list">

                                    ${occurrences.map(
                                        occurrence => `

                                            <article>

                                                <div>

                                                    <strong>
                                                        ${this.escape(
                                                            this.recurringTitle(
                                                                occurrence
                                                            )
                                                        )}
                                                    </strong>

                                                    <small>
                                                        ${this.escape(
                                                            occurrence.expectedDate ||
                                                            monthKey
                                                        )}
                                                    </small>

                                                </div>

                                                <strong>
                                                    ${this.currency(
                                                        occurrence.expectedAmount
                                                    )}
                                                </strong>

                                            </article>

                                        `
                                    ).join("")}

                                </div>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        data-action="openAnalysisPendingMovements"
                        class="atlas-analysis-link"
                    >
                        Revisar pendientes
                    </button>

                </div>

            </details>

        `;

    },

    activityPanel(activity) {

        const rows = [

            {
                label: "Movimientos",
                value:
                    this.number(
                        activity?.movements
                    )
            },

            {
                label: "Días con actividad",
                value:
                    this.number(
                        activity?.activeDays
                    )
            },

            {
                label: "Gasto medio",
                value:
                    this.currency(
                        activity?.averageExpense
                    )
            },

            {
                label: "Gasto mediano",
                value:
                    this.currency(
                        activity?.medianExpense
                    )
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
                            Ritmo de movimientos confirmados
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        ${rows.map(
                            row => `

                                <div>

                                    <small>
                                        ${row.label}
                                    </small>

                                    <strong>
                                        ${row.value}
                                    </strong>

                                </div>

                            `
                        ).join("")}

                    </div>

                </div>

            </details>

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
            options.analysisDistributionLevel ||
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

        const display =
            this.monthlyDisplaySummary(
                summary,
                forecast,
                mode
            );

        return `

            ${this.monthSelector(
                analysisMonth,
                currentMonth
            )}

            ${this.modeSelector(mode)}

            ${this.monthlySummary(
                summary,
                comparison,
                forecast,
                mode
            )}

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

            ${this.flowPanel(display)}

            ${this.recurringPanel(
                forecast,
                analysisMonth
            )}

            ${this.activityPanel(activity)}

        `;

    },

    periodSelector(period) {

        const periods = [

            {
                value: "3",
                label: "3 meses"
            },

            {
                value: "6",
                label: "6 meses"
            },

            {
                value: "12",
                label: "12 meses"
            },

            {
                value: "all",
                label: "Todo"
            }

        ];

        return `

            <div class="atlas-analysis-period">

                ${periods.map(
                    item => `

                        <button
                            type="button"
                            data-action="setTrendsPeriod"
                            data-period="${item.value}"
                            class="${
                                String(period) ===
                                item.value
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${item.label}
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
                                selected === "none"
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
                                selected === key
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

    viewSelector(displayMode) {

        const modes = [

            {
                value: "monthly",
                label: "Mensual"
            },

            {
                value: "smoothed",
                label: "Media suavizada"
            },

            {
                value: "accumulated",
                label: "Acumulado"
            }

        ];

        return `

            <div class="atlas-analysis-view-selector">

                ${modes.map(
                    mode => `

                        <button
                            type="button"
                            data-action="setTrendDisplayMode"
                            data-mode="${mode.value}"
                            class="${
                                displayMode ===
                                mode.value
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${mode.label}
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

                ${this.periodSelector(period)}

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

                <span class="atlas-analysis-control-label atlas-analysis-control-spaced">
                    Vista
                </span>

                ${this.viewSelector(displayMode)}

            </section>

        `;

    },

    normalizeMonthSummary(
        summary,
        monthKey
    ) {

        return {

            monthKey,

            income:
                this.number(
                    summary.monthlyIncome
                ),

            grossExpenses:
                this.number(
                    summary.monthlyGrossExpenses
                ),

            reimbursements:
                this.number(
                    summary.monthlyReimbursements
                ),

            expenses:
                this.number(
                    summary.monthlyExpenses
                ),

            invested:
                this.number(
                    summary.monthlyInvested
                ),

            savings:
                this.number(
                    summary.monthlySavings
                ),

            savingRate:
                this.number(
                    summary.monthlySavingRate
                ),

            debtPayments:
                this.number(
                    summary.monthlyDebtPayments
                ),

            cashOutflow:
                this.number(
                    summary.monthlyCashOutflow
                ),

            cashResult:
                this.number(
                    summary.monthlyCashResult
                )

        };

    },

    firstDataMonth(data) {

        const movementMonths = (
            Array.isArray(
                data?.movements
            )
                ? data.movements
                : []
        )
            .map(
                movement =>
                    String(
                        movement?.date ||
                        ""
                    ).slice(
                        0,
                        7
                    )
            )
            .filter(
                month =>
                    /^\d{4}-\d{2}$/.test(
                        month
                    )
            )
            .sort();

        if (
            movementMonths.length
        ) {

            return movementMonths[0];

        }

        return (
            this.options.currentMonth ||
            AtlasCalculations.monthKey()
        );

    },

    completeTrendMonths(
        data,
        period,
        currentMonth
    ) {

        let startMonth;

        if (
            String(period) === "all"
        ) {

            startMonth =
                this.firstDataMonth(
                    data
                );

        } else {

            const count =
                Number(period) || 6;

            startMonth =
                this.shiftMonth(
                    currentMonth,
                    -(count - 1)
                );

        }

        if (
            startMonth > currentMonth
        ) {

            startMonth =
                currentMonth;

        }

        const months = [];

        let monthKey =
            startMonth;

        let safety =
            0;

        while (
            monthKey <= currentMonth &&
            safety < 2400
        ) {

            const summary =
                AtlasCalculations
                    .financialSummary(
                        data,
                        monthKey
                    );

            months.push(
                this.normalizeMonthSummary(
                    summary,
                    monthKey
                )
            );

            monthKey =
                this.shiftMonth(
                    monthKey,
                    1
                );

            safety += 1;

        }

        return months;

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

                    accumulated += value;

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

        return {

            income,
            expenses,
            invested,
            savings,

            debtPayments:
                this.sum(
                    months,
                    "debtPayments"
                ),

            savingRate:
                income > 0
                    ? (
                        savings /
                        income
                    ) * 100
                    : 0

        };

    },

    previousPeriodMonths(
        data,
        months,
        period
    ) {

        if (
            String(period) === "all"
        ) {

            const meaningful =
                months.filter(
                    month => [

                        month.income,
                        month.expenses,
                        month.invested,
                        month.savings,
                        month.debtPayments

                    ].some(
                        value =>
                            Math.abs(
                                this.number(value)
                            ) > 0.0001
                    )
                );

            if (
                meaningful.length < 6
            ) {

                return {
                    available: false,
                    current: [],
                    previous: [],
                    currentLabel: "",
                    previousLabel: ""
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

                available: true,
                current,
                previous,

                currentLabel:
                    (
                        `${this.formatMonth(
                            current[0].monthKey
                        )} — ` +
                        `${this.formatMonth(
                            current[
                                current.length - 1
                            ].monthKey
                        )}`
                    ),

                previousLabel:
                    (
                        `${this.formatMonth(
                            previous[0].monthKey
                        )} — ` +
                        `${this.formatMonth(
                            previous[
                                previous.length - 1
                            ].monthKey
                        )}`
                    )

            };

        }

        const count =
            Number(period) || 6;

        const current =
            months.slice(
                -count
            );

        if (!current.length) {

            return {
                available: false,
                current: [],
                previous: [],
                currentLabel: "",
                previousLabel: ""
            };

        }

        const previousEnd =
            this.shiftMonth(
                current[0].monthKey,
                -1
            );

        const previousStart =
            this.shiftMonth(
                previousEnd,
                -(count - 1)
            );

        const previous = [];

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

            previous.push(
                this.normalizeMonthSummary(
                    AtlasCalculations
                        .financialSummary(
                            data,
                            monthKey
                        ),
                    monthKey
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
                        current[0].monthKey
                    )} — ` +
                    `${this.formatMonth(
                        current[
                            current.length - 1
                        ].monthKey
                    )}`
                ),

            previousLabel:
                (
                    `${this.formatMonth(
                        previous[0].monthKey
                    )} — ` +
                    `${this.formatMonth(
                        previous[
                            previous.length - 1
                        ].monthKey
                    )}`
                )

        };

    },

    periodSummaryPanel(
        months,
        comparison
    ) {

        const totals =
            this.periodTotals(
                months
            );

        const previousTotals =
            comparison.available
                ? this.periodTotals(
                    comparison.previous
                )
                : null;

        const cards = [

            {
                label: "Ingresos",
                value: totals.income,
                previous:
                    previousTotals
                        ?.income,
                positiveIsGood: true
            },

            {
                label: "Gasto neto",
                value: totals.expenses,
                previous:
                    previousTotals
                        ?.expenses,
                positiveIsGood: false
            },

            {
                label: "Invertido",
                value: totals.invested,
                previous:
                    previousTotals
                        ?.invested,
                positiveIsGood: true
            },

            {
                label: "Ahorro",
                value: totals.savings,
                previous:
                    previousTotals
                        ?.savings,
                positiveIsGood: true
            },

            {
                label: "Tasa de ahorro",
                value: totals.savingRate,
                previous:
                    previousTotals
                        ?.savingRate,
                positiveIsGood: true,
                percent: true,
                percentagePoint: true
            },

            {
                label: "Deuda pagada",
                value: totals.debtPayments,
                previous:
                    previousTotals
                        ?.debtPayments,
                positiveIsGood: true
            }

        ];

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Resumen del periodo",
                    comparison.available
                        ? (
                            `Comparado con ${comparison.previousLabel}`
                        )
                        : "Totales del periodo seleccionado"
                )}

                <div class="atlas-analysis-facts">

                    ${cards.map(
                        card => {

                            const metricComparison =
                                card.previous === undefined ||
                                card.previous === null
                                    ? null
                                    : AtlasCalculations
                                        .metricComparison(
                                            card.value,
                                            card.previous
                                        );

                            const information =
                                metricComparison
                                    ? this.comparisonText(
                                        metricComparison,
                                        card.positiveIsGood,
                                        card.percentagePoint
                                    )
                                    : null;

                            return `

                                <div>

                                    <small>
                                        ${card.label}
                                    </small>

                                    <strong
                                        style="
                                            color:
                                                ${
                                                    card.label === "Ahorro"
                                                        ? this.statusColor(
                                                            card.value
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

                                    <span
                                        style="
                                            color:
                                                ${
                                                    information
                                                        ?.color ||
                                                    "var(--color-text-muted)"
                                                };
                                        "
                                    >
                                        ${
                                            information
                                                ? (
                                                    `${information.icon} ` +
                                                    `${information.text}`
                                                )
                                                : "Sin comparación"
                                        }
                                    </span>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

            </section>

        `;

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
            values.length
                ? Math.max(
                    ...values
                )
                : 0;

        const minimum =
            values.length
                ? Math.min(
                    ...values
                )
                : 0;

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

            change:
                latest -
                first

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

        const information =
            this.comparisonText(
                comparison,
                definition.positiveIsGood,
                definition.percent
            );

        return `

            <section class="atlas-analysis-variable-summary">

                <article class="atlas-analysis-metric atlas-analysis-wide">

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
                            months.length
                                ? this.formatMonth(
                                    months[
                                        months.length - 1
                                    ].monthKey
                                )
                                : "Sin datos"
                        }
                    </small>

                </article>

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Media
                    </span>

                    <strong class="atlas-analysis-metric-value">
                        ${this.formatMetric(
                            statistics.average,
                            definition
                        )}
                    </strong>

                    <small>
                        ${months.length} meses
                    </small>

                </article>

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Cambio
                    </span>

                    <strong
                        class="atlas-analysis-metric-value atlas-analysis-text-value"
                        style="
                            color:
                                ${information.color};
                        "
                    >
                        ${information.icon}
                        ${information.text}
                    </strong>

                    <small>
                        Primer mes frente al actual
                    </small>

                </article>

            </section>

        `;

    },

    normalizedPoints(
        values,
        width,
        height
    ) {

        const paddingX =
            28;

        const paddingY =
            22;

        let minimum =
            Math.min(
                ...values
            );

        let maximum =
            Math.max(
                ...values
            );

        if (
            minimum === maximum
        ) {

            const padding =
                Math.max(
                    Math.abs(maximum) * 0.15,
                    1
                );

            minimum -= padding;
            maximum += padding;

        } else {

            const padding =
                (
                    maximum -
                    minimum
                ) * 0.12;

            minimum -= padding;
            maximum += padding;

        }

        const range =
            maximum -
            minimum ||
            1;

        const chartWidth =
            width -
            paddingX * 2;

        const chartHeight =
            height -
            paddingY * 2;

        return values.map(
            (
                value,
                index
            ) => ({

                value,

                x:
                    values.length === 1
                        ? width / 2
                        : (
                            paddingX +
                            (
                                index /
                                (
                                    values.length - 1
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
                    chartHeight

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

        if (!months.length) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        "Evolución",
                        "Sin datos"
                    )}

                    ${this.emptyState(
                        "⌁",
                        "Sin histórico",
                        "No hay meses para representar."
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

        const width =
            Math.max(
                340,
                months.length * 58
            );

        const height =
            210;

        const primaryPoints =
            this.normalizedPoints(
                primaryValues,
                width,
                height
            );

        const secondaryPoints =
            secondaryDefinition
                ? this.normalizedPoints(
                    secondaryValues,
                    width,
                    height
                )
                : [];

        const viewLabels = {

            monthly:
                "Valores mensuales",

            smoothed:
                "Media suavizada",

            accumulated:
                "Valores acumulados"

        };

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    secondaryDefinition
                        ? (
                            `${primaryDefinition.label} frente a ` +
                            `${secondaryDefinition.label}`
                        )
                        : (
                            `Evolución de ` +
                            `${primaryDefinition.label.toLowerCase()}`
                        ),
                    (
                        `${this.formatMonth(
                            months[0].monthKey
                        )} — ` +
                        `${this.formatMonth(
                            months[
                                months.length - 1
                            ].monthKey
                        )}`
                    )
                )}

                <div class="atlas-analysis-chart-legend">

                    <span class="atlas-analysis-legend-primary">
                        <i></i>
                        ${primaryDefinition.label}
                    </span>

                    ${
                        secondaryDefinition
                            ? `
                                <span class="atlas-analysis-legend-secondary">
                                    <i></i>
                                    ${secondaryDefinition.label}
                                </span>
                            `
                            : ""
                    }

                    <span class="atlas-analysis-legend-view">
                        <i></i>
                        ${viewLabels[
                            displayMode
                        ]}
                    </span>

                </div>

                ${
                    secondaryDefinition
                        ? `
                            <p class="atlas-analysis-chart-note">
                                Las líneas usan escalas independientes para comparar su evolución.
                            </p>
                        `
                        : ""
                }

                <div class="atlas-analysis-chart-scroll">

                    <div
                        class="atlas-analysis-chart-content"
                        style="
                            width:
                                ${width}px;
                        "
                    >

                        <svg
                            viewBox="
                                0 0
                                ${width}
                                ${height}
                            "
                            role="img"
                            aria-label="
                                Evolución de
                                ${this.escape(
                                    primaryDefinition.label
                                )}
                            "
                        >

                            <line
                                x1="28"
                                y1="${
                                    height / 2
                                }"
                                x2="${
                                    width - 28
                                }"
                                y2="${
                                    height / 2
                                }"
                                class="atlas-analysis-chart-midline"
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
                                            class="atlas-analysis-secondary-line"
                                        ></polyline>

                                        ${secondaryPoints.map(
                                            (
                                                point,
                                                index
                                            ) => `

                                                <circle
                                                    cx="${point.x}"
                                                    cy="${point.y}"
                                                    r="5"
                                                    class="atlas-analysis-secondary-point"
                                                >
                                                    <title>
                                                        ${secondaryDefinition.label}
                                                        ·
                                                        ${this.formatMonth(
                                                            months[index].monthKey
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
                                class="atlas-analysis-primary-line"
                            ></polyline>

                            ${primaryPoints.map(
                                (
                                    point,
                                    index
                                ) => `

                                    <circle
                                        cx="${point.x}"
                                        cy="${point.y}"
                                        r="5.5"
                                        class="atlas-analysis-primary-point"
                                    >
                                        <title>
                                            ${primaryDefinition.label}
                                            ·
                                            ${this.formatMonth(
                                                months[index].monthKey
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
                            class="atlas-analysis-chart-months"
                            style="
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

                        <div
                            class="atlas-analysis-chart-values"
                            style="
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
                                (
                                    month,
                                    index
                                ) => `

                                    <div>

                                        <strong>
                                            ${this.formatMetric(
                                                primaryValues[index],
                                                primaryDefinition
                                            )}
                                        </strong>

                                        ${
                                            secondaryDefinition
                                                ? `
                                                    <span>
                                                        ${this.formatMetric(
                                                            secondaryValues[index],
                                                            secondaryDefinition
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
            statistics.values
                .indexOf(
                    statistics.maximum
                );

        const minimumIndex =
            statistics.values
                .indexOf(
                    statistics.minimum
                );

        const panelId =
            (
                `trend-statistics-` +
                `${definition.property}`
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="${panelId}"
                ${this.openAttribute(panelId)}
            >

                <summary>

                    <div>

                        <strong>
                            Estadísticas de ${definition.label}
                        </strong>

                        <small>
                            Datos de la variable principal
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        <div>

                            <small>Promedio</small>

                            <strong>
                                ${this.formatMetric(
                                    statistics.average,
                                    definition
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Mediana</small>

                            <strong>
                                ${this.formatMetric(
                                    statistics.median,
                                    definition
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Máximo</small>

                            <strong>
                                ${this.formatMetric(
                                    statistics.maximum,
                                    definition
                                )}
                            </strong>

                            <span>
                                ${
                                    maximumIndex >= 0
                                        ? this.formatMonth(
                                            months[
                                                maximumIndex
                                            ].monthKey
                                        )
                                        : "—"
                                }
                            </span>

                        </div>

                        <div>

                            <small>Mínimo</small>

                            <strong>
                                ${this.formatMetric(
                                    statistics.minimum,
                                    definition
                                )}
                            </strong>

                            <span>
                                ${
                                    minimumIndex >= 0
                                        ? this.formatMonth(
                                            months[
                                                minimumIndex
                                            ].monthKey
                                        )
                                        : "—"
                                }
                            </span>

                        </div>

                    </div>

                </div>

            </details>

        `;

    },

    variablePeriodComparisonPanel(
        comparison,
        definition
    ) {

        const panelId =
            (
                `trend-period-` +
                `${definition.property}`
            );

        if (
            !comparison.available
        ) {

            return `

                <details
                    class="panel atlas-analysis-panel atlas-analysis-details"
                    data-analysis-panel="${panelId}"
                    ${this.openAttribute(panelId)}
                >

                    <summary>

                        <div>

                            <strong>
                                Comparación del periodo
                            </strong>

                            <small>
                                Historial insuficiente
                            </small>

                        </div>

                        <span>+</span>

                    </summary>

                    <div class="atlas-analysis-details-content">

                        ${this.emptyState(
                            "⌛",
                            "Sin comparación",
                            "No hay suficiente historial para comparar periodos equivalentes."
                        )}

                    </div>

                </details>

            `;

        }

        const currentValues =
            comparison.current
                .map(
                    month =>
                        this.metricValue(
                            month,
                            definition
                        )
                );

        const previousValues =
            comparison.previous
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
            this.comparisonText(
                AtlasCalculations
                    .metricComparison(
                        currentValue,
                        previousValue
                    ),
                definition.positiveIsGood,
                definition.percent
            );

        return `

            <details
                class="panel atlas-analysis-panel atlas-analysis-details"
                data-analysis-panel="${panelId}"
                ${this.openAttribute(panelId)}
            >

                <summary>

                    <div>

                        <strong>
                            Comparación del periodo
                        </strong>

                        <small>
                            Periodos equivalentes
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        <div>

                            <small>
                                ${comparison.currentLabel}
                            </small>

                            <strong>
                                ${this.formatMetric(
                                    currentValue,
                                    definition
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                ${comparison.previousLabel}
                            </small>

                            <strong>
                                ${this.formatMetric(
                                    previousValue,
                                    definition
                                )}
                            </strong>

                        </div>

                    </div>

                    <div
                        class="atlas-analysis-comparison-result"
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
        secondaryDefinition,
        displayMode
    ) {

        if (
            !secondaryDefinition ||
            !months.length
        ) {

            return "";

        }

        const primaryValues =
            this.transformValues(
                months,
                primaryDefinition,
                displayMode
            );

        const secondaryValues =
            this.transformValues(
                months,
                secondaryDefinition,
                displayMode
            );

        const primaryAverage =
            this.average(
                primaryValues
            );

        const secondaryAverage =
            this.average(
                secondaryValues
            );

        const primaryChange =
            primaryValues[
                primaryValues.length - 1
            ] -
            primaryValues[0];

        const secondaryChange =
            secondaryValues[
                secondaryValues.length - 1
            ] -
            secondaryValues[0];

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    `${primaryDefinition.label} frente a ${secondaryDefinition.label}`,
                    "Comparación de las dos variables seleccionadas"
                )}

                <div class="atlas-analysis-facts">

                    <div>

                        <small>
                            Media de ${primaryDefinition.label}
                        </small>

                        <strong>
                            ${this.formatMetric(
                                primaryAverage,
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
                                secondaryAverage,
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

                </div>

            </section>

        `;

    },

    categoryKey(category) {

        return String(

            category?.key ||

            category?.categoryId ||

            category?.id ||

            category?.label ||

            category?.category ||

            category?.name ||

            ""

        );

    },

    categoryLabel(category) {

        return (

            category?.label ||

            category?.category ||

            category?.name ||

            category?.key ||

            "Sin categoría"

        );

    },

    categoryEvolutionPanel(
        trend,
        selectedCategory
    ) {

        const categories = (
            Array.isArray(
                trend?.categories
            )
                ? trend.categories
                : []
        ).filter(Boolean);

        if (!categories.length) {

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
                                Sin categorías con gasto
                            </small>

                        </div>

                        <span>+</span>

                    </summary>

                    <div class="atlas-analysis-details-content">

                        ${this.emptyState(
                            "🧾",
                            "Sin categorías",
                            "No hay gastos por categoría en el periodo seleccionado."
                        )}

                    </div>

                </details>

            `;

        }

        const selected =
            categories.find(
                category =>
                    this.categoryKey(
                        category
                    ) ===
                    String(
                        selectedCategory ||
                        ""
                    )
            ) ||
            categories[0];

        const selectedKey =
            this.categoryKey(
                selected
            );

        const monthly =
            Array.isArray(
                selected?.monthly
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
                            Categorías con gasto en el periodo
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <label class="atlas-analysis-selector">

                        <span>
                            Categoría
                        </span>

                        <select
                            data-analysis-category
                        >

                            ${categories.map(
                                category => {

                                    const key =
                                        this.categoryKey(
                                            category
                                        );

                                    return `

                                        <option
                                            value="${this.escape(key)}"
                                            ${
                                                key === selectedKey
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${this.escape(
                                                this.categoryLabel(
                                                    category
                                                )
                                            )}
                                        </option>

                                    `;

                                }
                            ).join("")}

                        </select>

                    </label>

                    ${
                        monthly.length
                            ? `
                                <div class="atlas-analysis-category-chart">

                                    ${monthly.map(
                                        month => {

                                            const amount =
                                                this.number(
                                                    month.amount
                                                );

                                            const height =
                                                amount > 0
                                                    ? Math.max(
                                                        5,
                                                        (
                                                            amount /
                                                            maximum
                                                        ) * 92
                                                    )
                                                    : 3;

                                            return `

                                                <article>

                                                    <strong>
                                                        ${this.currency(
                                                            amount
                                                        )}
                                                    </strong>

                                                    <i
                                                        style="
                                                            height:
                                                                ${height}px;
                                                        "
                                                    ></i>

                                                    <small>
                                                        ${this.formatShortMonth(
                                                            month.monthKey
                                                        )}
                                                    </small>

                                                </article>

                                            `;

                                        }
                                    ).join("")}

                                </div>
                            `
                            : this.emptyState(
                                "▥",
                                "Sin datos",
                                "La categoría seleccionada no tiene gasto en este periodo."
                            )
                    }

                    <div class="atlas-analysis-facts">

                        <div>

                            <small>Total</small>

                            <strong>
                                ${this.currency(
                                    selected.amount
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Media mensual</small>

                            <strong>
                                ${this.currency(
                                    selected.average
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Mes máximo</small>

                            <strong>
                                ${
                                    selected.maximum
                                        ?.monthKey
                                        ? this.formatMonth(
                                            selected.maximum
                                                .monthKey
                                        )
                                        : "—"
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </details>

        `;

    },

    budgetTrendPanel(budget) {

        const months =
            Array.isArray(
                budget?.months
            )
                ? budget.months
                : [];

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
                            Situación del presupuesto durante el periodo
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    ${
                        months.length
                            ? `
                                <div class="atlas-analysis-category-chart">

                                    ${months.map(
                                        month => {

                                            const used =
                                                month.usedPercent === null ||
                                                month.usedPercent === undefined
                                                    ? 0
                                                    : this.number(
                                                        month.usedPercent
                                                    );

                                            const status =
                                                this.budgetStatusInformation(
                                                    month.status
                                                );

                                            return `

                                                <article>

                                                    <strong>
                                                        ${
                                                            month.usedPercent === null ||
                                                            month.usedPercent === undefined
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
                                                                    Math.min(
                                                                        100,
                                                                        used
                                                                    )
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

                                                </article>

                                            `;

                                        }
                                    ).join("")}

                                </div>
                            `
                            : this.emptyState(
                                "▥",
                                "Sin histórico",
                                "No hay presupuestos para este periodo."
                            )
                    }

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
                            Aportaciones y regularidad
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        <div>

                            <small>Total aportado</small>

                            <strong>
                                ${this.currency(
                                    investment.total
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Media mensual</small>

                            <strong>
                                ${this.currency(
                                    investment.average
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Meses con inversión</small>

                            <strong>
                                ${this.number(
                                    investment.monthsWithInvestment
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Regularidad</small>

                            <strong>
                                ${this.percent(
                                    investment.regularity
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
                            Pagos realizados y deuda actual
                        </small>

                    </div>

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        <div>

                            <small>Total pagado</small>

                            <strong>
                                ${this.currency(
                                    debt.total
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Media mensual</small>

                            <strong>
                                ${this.currency(
                                    debt.average
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Meses con pagos</small>

                            <strong>
                                ${this.number(
                                    debt.monthsWithPayments
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>Deuda actual</small>

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

        const rows = [

            {
                label: "Ahorro positivo",
                value:
                    this.number(
                        consistency?.positiveSavings
                    )
            },

            {
                label: "Dentro del presupuesto",
                value:
                    this.number(
                        consistency?.withinBudget
                    )
            },

            {
                label: "Con inversión",
                value:
                    this.number(
                        consistency?.withInvestment
                    )
            },

            {
                label: "Objetivo de ahorro",
                value:
                    this.number(
                        consistency?.savingTargetMet
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

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-consistency">

                        ${rows.map(
                            row => `

                                <article>

                                    <div>

                                        <span>
                                            ${row.label}
                                        </span>

                                        <strong>
                                            ${row.value}/${months}
                                        </strong>

                                    </div>

                                    <i>

                                        <b
                                            style="
                                                width:
                                                    ${this.clamp(
                                                        (
                                                            row.value /
                                                            denominator
                                                        ) * 100
                                                    )}%;
                                            "
                                        ></b>

                                    </i>

                                </article>

                            `
                        ).join("")}

                    </div>

                </div>

            </details>

        `;

    },

    bestWorstPanel(trend) {

        const rows = [

            {
                label: "Mayor ahorro",
                month:
                    trend?.bestSavingsMonth,
                property: "savings",
                percent: false
            },

            {
                label: "Peor ahorro",
                month:
                    trend?.worstSavingsMonth,
                property: "savings",
                percent: false
            },

            {
                label: "Menor gasto",
                month:
                    trend?.lowestExpenseMonth,
                property: "expenses",
                percent: false
            },

            {
                label: "Mayor inversión",
                month:
                    trend?.highestInvestmentMonth,
                property: "invested",
                percent: false
            },

            {
                label: "Mejor tasa de ahorro",
                month:
                    trend?.bestSavingRateMonth,
                property: "savingRate",
                percent: true
            },

            {
                label: "Mayor salida de caja",
                month:
                    trend?.highestCashOutflowMonth,
                property: "cashOutflow",
                percent: false
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

                    <span>+</span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-facts">

                        ${rows.map(
                            row => `

                                <div>

                                    <small>
                                        ${row.label}
                                    </small>

                                    <strong>
                                        ${
                                            row.percent
                                                ? this.percent(
                                                    row.month
                                                        ?.[
                                                            row.property
                                                        ]
                                                )
                                                : this.currency(
                                                    row.month
                                                        ?.[
                                                            row.property
                                                        ]
                                                )
                                        }
                                    </strong>

                                    <span>
                                        ${
                                            row.month
                                                ?.monthKey
                                                ? this.formatMonth(
                                                    row.month
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
            options.trendComparisonMetric ||
            "none";

        const displayMode =
            options.trendDisplayMode ||
            "monthly";

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations
                .monthKey();

        const months =
            this.completeTrendMonths(
                data,
                period,
                currentMonth
            );

        const trend =
            AtlasCalculations
                .trendSummary(
                    data,
                    period,
                    currentMonth
                );

        const primaryDefinition =
            this.metricDefinition(
                primaryMetric
            );

        const secondaryDefinition =
            comparisonMetric === "none" ||
            comparisonMetric === primaryMetric
                ? null
                : this.metricDefinition(
                    comparisonMetric
                );

        const comparison =
            this.previousPeriodMonths(
                data,
                months,
                period
            );

        const firstCategory =
            Array.isArray(
                trend?.categories
            )
                ? trend.categories[0]
                : null;

        const selectedCategory =
            options.trendCategory ||
            this.categoryKey(
                firstCategory
            );

        const showCategories =
            [
                "expenses",
                "grossExpenses"
            ].includes(
                primaryMetric
            );

        return `

            ${this.trendsControls(
                period,
                primaryMetric,
                comparisonMetric,
                displayMode
            )}

            ${this.periodSummaryPanel(
                months,
                comparison
            )}

            <div class="atlas-analysis-heading">

                <small>
                    VARIABLE SELECCIONADA
                </small>

                <h2>
                    ${primaryDefinition.label}
                </h2>

                <p class="note">
                    Lectura detallada de la variable principal
                </p>

            </div>

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

            ${
                secondaryDefinition
                    ? this.twoVariablePanel(
                        months,
                        primaryDefinition,
                        secondaryDefinition,
                        displayMode
                    )
                    : ""
            }

            ${this.statisticsPanel(
                months,
                primaryDefinition,
                displayMode
            )}

            ${this.variablePeriodComparisonPanel(
                comparison,
                primaryDefinition
            )}

            <div class="atlas-analysis-heading">

                <small>
                    VISIÓN GLOBAL DEL PERIODO
                </small>

                <h2>
                    Contexto financiero
                </h2>

                <p class="note">
                    Presupuestos, inversión, deuda y consistencia
                </p>

            </div>

            ${this.budgetTrendPanel(
                trend?.budget
            )}

            ${
                showCategories
                    ? this.categoryEvolutionPanel(
                        trend,
                        selectedCategory
                    )
                    : ""
            }

            ${this.investmentPanel(trend)}

            ${this.debtPanel(trend)}

            ${this.consistencyPanel(
                trend?.consistency
            )}

            ${this.bestWorstPanel(trend)}

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

                ${this.tabs(activeView)}

                ${
                    activeView === "trends"
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
                --atlas-chart-3: #b894ff;
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
                        minmax(
                            0,
                            1fr
                        )
                    );
                margin-bottom: 16px;
            }

            .atlas-analysis-period {
                grid-template-columns:
                    repeat(
                        4,
                        minmax(
                            0,
                            1fr
                        )
                    );
                margin-bottom: 14px;
            }

            .atlas-analysis-view-selector {
                grid-template-columns:
                    repeat(
                        3,
                        minmax(
                            0,
                            1fr
                        )
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
                background: transparent;
                color:
                    var(
                        --color-text-muted
                    );
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

            .atlas-analysis-badge {
                display: inline-flex;
                min-height: 27px;
                align-items: center;
                padding:
                    0
                    9px;
                border-radius: 99px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.16
                    );
                color: #ffffff;
                font-size: 9px;
                font-weight: 750;
            }

            .atlas-analysis-grid,
            .atlas-analysis-variable-summary,
            .atlas-analysis-facts {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 10px;
                margin-top: 14px;
            }

            .atlas-analysis-grid,
            .atlas-analysis-variable-summary {
                margin-bottom: 14px;
            }

            .atlas-analysis-metric,
            .atlas-analysis-facts > div {
                min-width: 0;
                padding: 13px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.12
                    );
                border-radius: 16px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-analysis-wide {
                grid-column:
                    1 / -1;
            }

            .atlas-analysis-metric-label,
            .atlas-analysis-facts small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.35;
            }

            .atlas-analysis-metric-value,
            .atlas-analysis-facts strong {
                display: block;
                margin-top: 6px;
                font-size: 17px;
                line-height: 1.2;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-text-value {
                font-size: 13px;
            }

            .atlas-analysis-metric small,
            .atlas-analysis-facts span {
                display: block;
                margin-top: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.4;
                overflow-wrap: anywhere;
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

            .atlas-analysis-panel-right {
                flex: 0 0 auto;
            }

            .atlas-analysis-empty {
                padding:
                    24px
                    10px;
                text-align: center;
            }

            .atlas-analysis-empty > span {
                display: block;
                margin-bottom: 8px;
                font-size: 26px;
            }

            .atlas-analysis-empty p {
                margin-top: 6px;
                line-height: 1.5;
            }

            .atlas-analysis-progress {
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

            .atlas-analysis-progress i {
                display: block;
                height: 100%;
                border-radius: inherit;
            }

            .atlas-analysis-link {
                width: 100%;
                min-height: 43px;
                margin-top: 14px;
                border-radius: 14px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.18
                    );
                color: #ffffff;
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-analysis-distribution-list {
                display: grid;
                gap: 2px;
                margin-top: 14px;
            }

            .atlas-analysis-distribution-list article {
                display: grid;
                grid-template-columns:
                    9px
                    minmax(
                        0,
                        1fr
                    )
                    auto;
                align-items: center;
                gap: 9px;
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
            }

            .atlas-analysis-distribution-list article > i {
                width: 9px;
                height: 9px;
                border-radius: 50%;
            }

            .atlas-analysis-distribution-list article > div {
                min-width: 0;
            }

            .atlas-analysis-distribution-list article strong,
            .atlas-analysis-distribution-list article small {
                display: block;
            }

            .atlas-analysis-distribution-list article strong {
                font-size: 10px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-distribution-list article small {
                margin-top: 3px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-distribution-list article span {
                display: block;
                height: 5px;
                margin-top: 6px;
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

            .atlas-analysis-distribution-list article span b {
                display: block;
                height: 100%;
                border-radius: inherit;
            }

            .atlas-analysis-flow {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 9px;
                margin-top: 14px;
            }

            .atlas-analysis-flow article {
                min-width: 0;
                padding: 13px;
                border-radius: 15px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
            }

            .atlas-analysis-flow article strong,
            .atlas-analysis-flow article small,
            .atlas-analysis-flow article span {
                display: block;
            }

            .atlas-analysis-flow article strong {
                font-size: 17px;
            }

            .atlas-analysis-flow article small {
                margin-top: 3px;
                font-size: 9px;
            }

            .atlas-analysis-flow article span {
                margin-top: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-analysis-flow .expense {
                border-left:
                    3px solid
                    var(
                        --color-danger
                    );
            }

            .atlas-analysis-flow .investment {
                border-left:
                    3px solid
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-flow .debt {
                border-left:
                    3px solid
                    #f4b95e;
            }

            .atlas-analysis-flow .saving {
                border-left:
                    3px solid
                    var(
                        --color-success
                    );
            }

            .atlas-analysis-flow .deficit {
                border-left:
                    3px solid
                    var(
                        --color-danger
                    );
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

            .atlas-analysis-details summary strong,
            .atlas-analysis-details summary small {
                display: block;
            }

            .atlas-analysis-details summary strong {
                font-size: 15px;
                line-height: 1.3;
            }

            .atlas-analysis-details summary small {
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

            .atlas-analysis-recurring-list {
                display: grid;
                margin-top: 14px;
            }

            .atlas-analysis-recurring-list article {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                padding:
                    11px
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

            .atlas-analysis-recurring-list article div {
                min-width: 0;
            }

            .atlas-analysis-recurring-list article strong,
            .atlas-analysis-recurring-list article small {
                display: block;
            }

            .atlas-analysis-recurring-list article strong {
                font-size: 10px;
                overflow-wrap: anywhere;
            }

            .atlas-analysis-recurring-list article small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
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

            .atlas-analysis-control-spaced {
                margin-top: 14px;
            }

            .atlas-analysis-selectors {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
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
                        0.22
                    );
                border-radius: 14px;
                outline: none;
                background: #19243a;
                color: #f7f8fc;
                font-size: 13px;
            }

            .atlas-analysis-heading {
                margin:
                    25px
                    3px
                    13px;
            }

            .atlas-analysis-heading small {
                color:
                    var(
                        --color-primary
                    );
                font-size: 9px;
                font-weight: 850;
                letter-spacing: 0.12em;
            }

            .atlas-analysis-heading h2 {
                margin-top: 5px;
                font-size: 19px;
            }

            .atlas-analysis-heading p {
                margin-top: 5px;
                font-size: 10px;
            }

            .atlas-analysis-chart-legend {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap:
                    9px
                    15px;
                margin-top: 13px;
            }

            .atlas-analysis-chart-legend > span {
                display: inline-flex;
                width: auto;
                height: auto;
                min-width: 0;
                min-height: 0;
                align-items: center;
                gap: 6px;
                padding: 0;
                border: 0;
                border-radius: 0;
                background: transparent;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.2;
            }

            .atlas-analysis-chart-legend > span > i {
                display: block;
                width: 18px;
                height: 3px;
                flex:
                    0
                    0
                    18px;
                border-radius: 99px;
            }

            .atlas-analysis-legend-primary > i {
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-legend-secondary > i {
                background:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-legend-view > i {
                height: 0 !important;
                border-top:
                    1px dashed
                    rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                background: transparent;
            }

            .atlas-analysis-chart-note {
                margin-top: 10px;
                padding:
                    8px
                    10px;
                border-radius: 11px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.45;
            }

            .atlas-analysis-chart-scroll {
                max-width: 100%;
                margin-top: 12px;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling:
                    touch;
            }

            .atlas-analysis-chart-content {
                min-width: 100%;
            }

            .atlas-analysis-chart-content svg {
                display: block;
                width: 100%;
                height: 210px;
            }

            .atlas-analysis-chart-midline {
                stroke:
                    rgba(
                        255,
                        255,
                        255,
                        0.1
                    );
                stroke-width: 1;
                stroke-dasharray:
                    4
                    6;
            }

            .atlas-analysis-chart-content polyline {
                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .atlas-analysis-primary-line {
                stroke:
                    var(
                        --color-primary
                    );
                stroke-width: 4;
                filter:
                    drop-shadow(
                        0
                        0
                        4px
                        rgba(
                            77,
                            163,
                            255,
                            0.35
                        )
                    );
            }

            .atlas-analysis-secondary-line {
                stroke:
                    var(
                        --atlas-chart-3
                    );
                stroke-width: 3.5;
                stroke-dasharray:
                    9
                    5;
                filter:
                    drop-shadow(
                        0
                        0
                        4px
                        rgba(
                            184,
                            148,
                            255,
                            0.3
                        )
                    );
            }

            .atlas-analysis-primary-point {
                fill:
                    var(
                        --color-primary
                    );
                stroke: #19243a;
                stroke-width: 2.5;
            }

            .atlas-analysis-secondary-point {
                fill:
                    var(
                        --atlas-chart-3
                    );
                stroke: #19243a;
                stroke-width: 2.5;
            }

            .atlas-analysis-chart-months,
            .atlas-analysis-chart-values {
                display: grid;
                padding:
                    0
                    28px;
                box-sizing:
                    border-box;
            }

            .atlas-analysis-chart-months {
                margin-top: 4px;
            }

            .atlas-analysis-chart-months span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                text-align: center;
                white-space: nowrap;
            }

            .atlas-analysis-chart-values {
                margin-top: 9px;
            }

            .atlas-analysis-chart-values div {
                min-width: 54px;
                text-align: center;
            }

            .atlas-analysis-chart-values strong,
            .atlas-analysis-chart-values span {
                display: block;
                font-size: 7px;
                line-height: 1.35;
                white-space: nowrap;
            }

            .atlas-analysis-chart-values strong {
                color:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-chart-values span {
                margin-top: 2px;
                color:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-comparison-result {
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

            .atlas-analysis-category-chart {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns:
                    minmax(
                        52px,
                        1fr
                    );
                align-items: end;
                gap: 8px;
                min-height: 135px;
                margin-top: 16px;
                overflow-x: auto;
                -webkit-overflow-scrolling:
                    touch;
            }

            .atlas-analysis-category-chart article {
                display: flex;
                min-width: 52px;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }

            .atlas-analysis-category-chart article strong {
                font-size: 8px;
                white-space: nowrap;
            }

            .atlas-analysis-category-chart article i {
                display: block;
                width: 23px;
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

            .atlas-analysis-category-chart article small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                white-space: nowrap;
            }

            .atlas-analysis-consistency {
                display: grid;
                gap: 14px;
            }

            .atlas-analysis-consistency article > div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                margin-bottom: 7px;
                font-size: 10px;
            }

            .atlas-analysis-consistency article > i {
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

            .atlas-analysis-consistency article > i b {
                display: block;
                height: 100%;
                border-radius: inherit;
                background:
                    var(
                        --color-primary
                    );
            }

            @media (
                max-width: 350px
            ) {

                .atlas-analysis-period {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(
                                0,
                                1fr
                            )
                        );
                }

                .atlas-analysis-selectors,
                .atlas-analysis-view-selector {
                    grid-template-columns:
                        1fr;
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
                route !== "analysis"
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

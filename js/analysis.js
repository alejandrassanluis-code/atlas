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

    state: {

        monthlyMode:
            "real",

        distributionLevel:
            "category",

        trendsPeriod:
            6,

        trendMetric:
            "savings",

        comparisonMetric:
            "none",

        selectedCategory:
            ""

    },

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

    movementLabel(movement) {

        if (!movement) {

            return "Sin datos";

        }

        return (
            movement.description ||
            movement.name ||
            movement.title ||
            movement.category ||
            "Movimiento"
        );

    },

    comparisonInformation(
        comparison,
        positiveIsGood = true,
        isPercentagePoint = false
    ) {

        const difference =
            this.number(
                comparison?.difference
            );

        if (
            difference === 0
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

        let changeText;

        if (isPercentagePoint) {

            changeText =
                `${Math.abs(
                    difference
                ).toFixed(1)} p. p.`;

        } else {

            const percentage =
                comparison?.percentage;

            changeText =
                this.currency(
                    Math.abs(
                        difference
                    )
                );

            if (
                percentage !== null &&
                percentage !== undefined
            ) {

                changeText +=
                    ` · ${Math.abs(
                        this.number(
                            percentage
                        )
                    ).toFixed(0)}%`;

            } else {

                changeText +=
                    " · nuevo";

            }

        }

        return {

            icon:
                rises
                    ? "↑"
                    : "↓",

            text:
                changeText,

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

            <div class="panelhead">

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

    emptyState(
        icon,
        title,
        text
    ) {

        return `

            <div class="atlas-analysis-empty">

                <div>
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

    modeSelector() {

        return `

            <div class="atlas-analysis-mode">

                <button
                    type="button"
                    data-analysis-mode="real"
                    class="${
                        this.state
                            .monthlyMode ===
                        "real"
                            ? "active"
                            : ""
                    }"
                >
                    Real
                </button>

                <button
                    type="button"
                    data-analysis-mode="forecast"
                    class="${
                        this.state
                            .monthlyMode ===
                        "forecast"
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
                options
                    .positiveIsGood !==
                    false,
                options
                    .percentagePoint ===
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

    monthlySummary(
        summary,
        comparison
    ) {

        const expenseDetail =
            summary
                .monthlyReimbursements >
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
                : "";

        return `

            <section class="atlas-analysis-section">

                <div class="atlas-analysis-section-title">

                    <div>

                        <h2>
                            Resumen financiero
                        </h2>

                        <p class="note">
                            Resultado del mes y cambio respecto al anterior
                        </p>

                    </div>

                </div>

                <div class="atlas-analysis-grid">

                    ${this.summaryMetric(
                        "Ingresos",
                        summary.monthlyIncome,
                        comparison.income,
                        {
                            icon:
                                "🟢",
                            positiveIsGood:
                                true
                        }
                    )}

                    ${this.summaryMetric(
                        "Gastos netos",
                        summary.monthlyExpenses,
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
                        summary.monthlyInvested,
                        comparison.invested,
                        {
                            icon:
                                "📈",
                            positiveIsGood:
                                true
                        }
                    )}

                    ${this.summaryMetric(
                        "Ahorro",
                        summary.monthlySavings,
                        comparison.savings,
                        {
                            icon:
                                "💰",
                            positiveIsGood:
                                true,
                            color:
                                this.statusColor(
                                    summary
                                        .monthlySavings,
                                    true
                                )
                        }
                    )}

                    ${this.summaryMetric(
                        "Tasa de ahorro",
                        summary.monthlySavingRate,
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
                                    summary
                                        .monthlySavingRate,
                                    true
                                )
                        }
                    )}

                    ${this.summaryMetric(
                        "Resultado de caja",
                        summary.monthlyCashResult,
                        comparison.cashResult,
                        {
                            icon:
                                "💧",
                            positiveIsGood:
                                true,
                            color:
                                this.statusColor(
                                    summary
                                        .monthlyCashResult,
                                    true
                                ),
                            detail:
                                (
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

    forecastBars(
        forecast
    ) {

        const rows = [

            {
                label:
                    "Ingresos",
                real:
                    forecast.real
                        .monthlyIncome,
                pending:
                    forecast.pending
                        .income,
                estimated:
                    forecast.estimated
                        .income
            },

            {
                label:
                    "Gastos",
                real:
                    forecast.real
                        .monthlyExpenses,
                pending:
                    forecast.pending
                        .expenses,
                estimated:
                    forecast.estimated
                        .expenses
            },

            {
                label:
                    "Inversión",
                real:
                    forecast.real
                        .monthlyInvested,
                pending:
                    forecast.pending
                        .invested,
                estimated:
                    forecast.estimated
                        .invested
            },

            {
                label:
                    "Ahorro",
                real:
                    forecast.real
                        .monthlySavings,
                pending:
                    forecast.pending
                        .savingsImpact,
                estimated:
                    forecast.estimated
                        .savings
            }

        ];

        const maximum =
            Math.max(
                1,
                ...rows.flatMap(
                    row => [
                        Math.abs(
                            row.real
                        ),
                        Math.abs(
                            row.estimated
                        )
                    ]
                )
            );

        return `

            <div class="atlas-analysis-forecast-chart">

                ${rows.map(
                    row => {

                        const realWidth =
                            this.clamp(
                                (
                                    Math.abs(
                                        row.real
                                    ) /
                                    maximum
                                ) * 100
                            );

                        const estimatedWidth =
                            this.clamp(
                                (
                                    Math.abs(
                                        row.estimated
                                    ) /
                                    maximum
                                ) * 100
                            );

                        return `

                            <div class="atlas-analysis-forecast-row">

                                <div class="atlas-analysis-forecast-label">

                                    <strong>
                                        ${row.label}
                                    </strong>

                                    <small>
                                        ${this.currency(
                                            row.real
                                        )}
                                        real ·
                                        ${this.currency(
                                            row.pending
                                        )}
                                        pendiente
                                    </small>

                                </div>

                                <div class="atlas-analysis-forecast-track">

                                    <i
                                        class="estimated"
                                        style="
                                            width:
                                                ${estimatedWidth}%;
                                        "
                                    ></i>

                                    <i
                                        class="real"
                                        style="
                                            width:
                                                ${realWidth}%;
                                        "
                                    ></i>

                                </div>

                                <strong>
                                    ${this.currency(
                                        row.estimated
                                    )}
                                </strong>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        `;

    },

    forecastPanel(forecast) {

        if (
            forecast.pending.count ===
            0
        ) {

            return `

                <section class="panel atlas-analysis-panel">

                    ${this.panelHeader(
                        "Real frente a previsión",
                        "No hay movimientos recurrentes pendientes"
                    )}

                    ${this.emptyState(
                        "✓",
                        "Mes actualizado",
                        "La previsión coincide con los movimientos registrados."
                    )}

                </section>

            `;

        }

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Real frente a previsión",
                    (
                        `${forecast.pending.count} ` +
                        `movimientos pendientes`
                    ),
                    `

                        <span class="atlas-analysis-badge">
                            Estimado
                        </span>

                    `
                )}

                ${this.forecastBars(
                    forecast
                )}

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
        forecast
    ) {

        const estimatedSpent =
            budget.totalSpent +
            forecast.pending.expenses;

        const estimatedRemaining =
            budget.totalBudget -
            estimatedSpent;

        const estimatedUsed =
            AtlasCalculations
                .budgetUsedPercent(
                    estimatedSpent,
                    budget.totalBudget
                );

        const realStatus =
            this.budgetStatusInformation(
                budget.status
            );

        const estimatedStatusKey =
            AtlasCalculations
                .budgetStatus(
                    this.data,
                    estimatedSpent,
                    budget.totalBudget
                );

        const estimatedStatus =
            this.budgetStatusInformation(
                estimatedStatusKey
            );

        const relevantCategories =
            budget.categories
                .filter(
                    category =>
                        category.status ===
                            "exceeded" ||
                        category.status ===
                            "warning"
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
                );

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Estado presupuestario",
                    "Resumen prioritario; el detalle se gestiona en Presupuestos",
                    `

                        <strong
                            style="
                                color:
                                    ${
                                        this.state
                                            .monthlyMode ===
                                        "forecast"
                                            ? estimatedStatus.color
                                            : realStatus.color
                                    };
                            "
                        >
                            ${
                                this.state
                                    .monthlyMode ===
                                "forecast"
                                    ? (
                                        estimatedUsed ===
                                        null
                                            ? "—"
                                            : this.percent(
                                                estimatedUsed
                                            )
                                    )
                                    : (
                                        budget
                                            .usedPercent ===
                                        null
                                            ? "—"
                                            : this.percent(
                                                budget
                                                    .usedPercent
                                            )
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
                            Gasto real
                        </small>

                        <strong>
                            ${this.currency(
                                budget.totalSpent
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Gasto estimado
                        </small>

                        <strong>
                            ${this.currency(
                                estimatedSpent
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Margen estimado
                        </small>

                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        estimatedRemaining,
                                        true
                                    )};
                            "
                        >
                            ${this.currency(
                                estimatedRemaining
                            )}
                        </strong>

                    </div>

                </div>

                <div class="atlas-analysis-budget-progress">

                    <i
                        style="
                            width:
                                ${this.clamp(
                                    estimatedUsed ===
                                    null
                                        ? 100
                                        : estimatedUsed
                                )}%;
                            background:
                                ${estimatedStatus.color};
                        "
                    ></i>

                </div>

                <div class="atlas-analysis-budget-footer">

                    <span
                        style="
                            color:
                                ${estimatedStatus.color};
                        "
                    >
                        ${estimatedStatus.label}
                    </span>

                    <button
                        type="button"
                        data-route="budgets"
                        class="atlas-analysis-link"
                    >
                        Ver presupuestos
                    </button>

                </div>

                ${
                    relevantCategories.length >
                    0
                        ? `

                            <div class="atlas-analysis-alerts">

                                ${relevantCategories
                                    .slice(
                                        0,
                                        3
                                    )
                                    .map(
                                        category => {

                                            const status =
                                                this
                                                    .budgetStatusInformation(
                                                        category
                                                            .status
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
                                                                ${
                                                                    status.color
                                                                };
                                                        "
                                                    >
                                                        ${
                                                            category
                                                                .usedPercent ===
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
                                    )
                                    .join("")}

                            </div>

                        `
                        : ""
                }

            </section>

        `;

    },

    distributionControls() {

        return `

            <div class="atlas-analysis-mini-tabs">

                <button
                    type="button"
                    data-distribution-level="category"
                    class="${
                        this.state
                            .distributionLevel ===
                        "category"
                            ? "active"
                            : ""
                    }"
                >
                    Categorías
                </button>

                <button
                    type="button"
                    data-distribution-level="subcategory"
                    class="${
                        this.state
                            .distributionLevel ===
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
            items.filter(
                item =>
                    this.number(
                        item.amount
                    ) > 0
            );

        const total =
            positiveItems.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    this.number(
                        item.amount
                    ),
                0
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

        let offset = 0;

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
                                item.amount /
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

                        offset += share;

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

    distributionRows(items) {

        const total =
            items.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Math.max(
                        0,
                        this.number(
                            item.amount
                        )
                    ),
                0
            );

        return `

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

                            const percentage =
                                total > 0
                                    ? (
                                        Math.max(
                                            0,
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
                                                item.category
                                            )}
                                        </strong>

                                        <small>
                                            ${percentage.toFixed(
                                                0
                                            )}%
                                            · bruto
                                            ${this.currency(
                                                item.grossAmount
                                            )}

                                            ${
                                                item
                                                    .reimbursements >
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

        `;

    },

    distributionPanel(
        categories,
        subcategories
    ) {

        const items =
            this.state
                .distributionLevel ===
            "subcategory"
                ? subcategories
                : categories;

        const total =
            items.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Math.max(
                        0,
                        this.number(
                            item.amount
                        )
                    ),
                0
            );

        const topThree =
            items
                .slice(
                    0,
                    3
                )
                .reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        Math.max(
                            0,
                            this.number(
                                item.amount
                            )
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
                    "Composición del gasto neto",
                    this.distributionControls()
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

                                ${this.distributionRows(
                                    items
                                )}

                            </div>

                            <div class="atlas-analysis-inline-facts">

                                <span>
                                    ${
                                        this.state
                                            .distributionLevel ===
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
                                        ${
                                            items[0]
                                                ? this.escape(
                                                    items[0]
                                                        .label ||
                                                    items[0]
                                                        .category
                                                )
                                                : "—"
                                        }
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

        const expenseShare =
            income > 0
                ? (
                    summary.monthlyExpenses /
                    income
                ) * 100
                : 0;

        const investmentShare =
            income > 0
                ? (
                    summary.monthlyInvested /
                    income
                ) * 100
                : 0;

        const debtShare =
            income > 0
                ? (
                    summary.monthlyDebtPayments /
                    income
                ) * 100
                : 0;

        const savingShare =
            income > 0
                ? (
                    summary.monthlySavings /
                    income
                ) * 100
                : 0;

        const segments = [

            {
                label:
                    "Gasto",
                value:
                    expenseShare,
                className:
                    "expense"
            },

            {
                label:
                    "Inversión",
                value:
                    investmentShare,
                className:
                    "investment"
            },

            {
                label:
                    "Deuda",
                value:
                    debtShare,
                className:
                    "debt"
            },

            {
                label:
                    "Ahorro",
                value:
                    savingShare,
                className:
                    "saving"
            }

        ];

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Flujo del dinero",
                    "Destino aproximado por cada 100 € de ingresos"
                )}

                ${
                    income <= 0
                        ? this.emptyState(
                            "↔",
                            "Sin ingresos",
                            "El reparto necesita ingresos registrados en el mes."
                        )
                        : `

                            <div class="atlas-analysis-flow">

                                ${segments
                                    .map(
                                        segment => `

                                            <div
                                                class="${
                                                    segment.className
                                                }"
                                                style="
                                                    flex-grow:
                                                        ${Math.max(
                                                            0.4,
                                                            Math.abs(
                                                                segment.value
                                                            )
                                                        )};
                                                "
                                            >
                                                <strong>
                                                    ${segment.value.toFixed(
                                                        0
                                                    )} €
                                                </strong>

                                                <small>
                                                    ${segment.label}
                                                </small>
                                            </div>

                                        `
                                    )
                                    .join("")}

                            </div>

                            <div class="atlas-analysis-flow-values">

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
                                    <strong>
                                        ${this.currency(
                                            summary
                                                .monthlySavings
                                        )}
                                    </strong>
                                </span>

                            </div>

                        `
                }

            </section>

        `;

    },

    recurringPanel(forecast) {

        const pending =
            forecast.pending;

        if (
            pending.count ===
            0
        ) {

            return "";

        }

        const nextDates =
            pending.occurrences
                .slice(
                    0,
                    3
                );

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Recurrentes y previsión
                        </strong>

                        <small>
                            ${pending.count}
                            movimientos pendientes
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-grid atlas-analysis-grid-compact">

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
                                ${pending
                                    .possibleDuplicates}
                            </strong>

                        </div>

                    </div>

                    ${
                        nextDates.length >
                        0
                            ? `

                                <div class="atlas-analysis-upcoming">

                                    <small class="note">
                                        Próximas fechas
                                    </small>

                                    ${nextDates.map(
                                        occurrence => `

                                            <div>

                                                <span>
                                                    ${this.escape(
                                                        occurrence
                                                            .expectedDate ||
                                                        occurrence
                                                            .monthKey ||
                                                        ""
                                                    )}
                                                </span>

                                                <strong>
                                                    ${this.escape(
                                                        occurrence
                                                            .title ||
                                                        occurrence
                                                            .name ||
                                                        occurrence
                                                            .description ||
                                                        "Movimiento recurrente"
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
                        data-action="showPendingMovements"
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
        value,
        subtitle = ""
    ) {

        return `

            <article class="atlas-analysis-metric">

                <span class="atlas-analysis-metric-label">
                    ${this.escape(label)}
                </span>

                <strong class="atlas-analysis-metric-value">
                    ${this.currency(value)}
                </strong>

                ${
                    subtitle
                        ? `

                            <small class="note">
                                ${this.escape(
                                    subtitle
                                )}
                            </small>

                        `
                        : ""
                }

            </article>

        `;

    },

    activityPanel(activity) {

        const accountName =
            activity
                .mostUsedAccount
                ?.account
                ?.name ||
            "—";

        const rows = [

            {
                label:
                    "Movimientos",
                value:
                    activity.movements
            },

            {
                label:
                    "Días con actividad",
                value:
                    activity.activeDays
            },

            {
                label:
                    "Gasto medio",
                value:
                    this.currency(
                        activity.averageExpense
                    )
            },

            {
                label:
                    "Gasto mediano",
                value:
                    this.currency(
                        activity.medianExpense
                    )
            },

            {
                label:
                    "Mayor ingreso",
                value:
                    this.currency(
                        activity
                            .highestIncome
                            ?.amount
                    ),
                detail:
                    this.movementLabel(
                        activity
                            .highestIncome
                    )
            },

            {
                label:
                    "Mayor gasto",
                value:
                    this.currency(
                        activity
                            .highestExpense
                            ?.amount
                    ),
                detail:
                    this.movementLabel(
                        activity
                            .highestExpense
                    )
            },

            {
                label:
                    "Mayor inversión",
                value:
                    this.currency(
                        activity
                            .highestInvestment
                            ?.amount
                    ),
                detail:
                    this.movementLabel(
                        activity
                            .highestInvestment
                    )
            },

            {
                label:
                    "Mayor pago de deuda",
                value:
                    this.currency(
                        activity
                            .highestDebtPayment
                            ?.amount
                    ),
                detail:
                    this.movementLabel(
                        activity
                            .highestDebtPayment
                    )
            },

            {
                label:
                    "Cuenta más utilizada",
                value:
                    accountName,
                detail:
                    activity
                        .mostUsedAccount
                        ? (
                            `${activity
                                .mostUsedAccount
                                .count} movimientos`
                        )
                        : ""
            }

        ];

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

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

                    <div class="atlas-analysis-activity-grid">

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

    dailyChart(activity) {

        const values =
            activity.daily.map(
                day =>
                    Math.max(
                        0,
                        this.number(
                            day.expenses
                        )
                    )
            );

        const maximum =
            Math.max(
                1,
                ...values
            );

        return `

            <div class="atlas-analysis-daily-chart">

                ${activity.daily.map(
                    day => {

                        const height =
                            Math.max(
                                day.expenses > 0
                                    ? 6
                                    : 2,
                                (
                                    Math.max(
                                        0,
                                        day.expenses
                                    ) /
                                    maximum
                                ) * 110
                            );

                        return `

                            <div
                                title="
                                    Día ${day.day}:
                                    ${this.currency(
                                        day.expenses
                                    )}
                                "
                            >

                                <i
                                    style="
                                        height:
                                            ${height}px;
                                        opacity:
                                            ${
                                                day.expenses >
                                                0
                                                    ? 0.9
                                                    : 0.18
                                            };
                                    "
                                ></i>

                                ${
                                    day.day ===
                                        1 ||
                                    day.day % 5 ===
                                        0 ||
                                    day.day ===
                                        activity.daily
                                            .length
                                        ? `

                                            <small>
                                                ${day.day}
                                            </small>

                                        `
                                        : `

                                            <small></small>

                                        `
                                }

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        `;

    },

    dailyActivityPanel(activity) {

        const highestDay =
            activity
                .highestExpenseDay;

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

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

                    ${this.dailyChart(
                        activity
                    )}

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Día de mayor gasto
                            <strong>
                                ${
                                    highestDay &&
                                    highestDay.expenses >
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
                                ${activity
                                    .longestActiveStreak}
                                días
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    monthlyInsights(
        summary,
        comparison,
        budget,
        categories,
        forecast
    ) {

        const insights = [];

        if (
            summary.monthlySavings >
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
                            summary
                                .monthlySavings
                        )}, un ${this.percent(
                            summary
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
                        `El resultado de ahorro es ${this.currency(
                            summary
                                .monthlySavings
                        )}.`
                    ),

                tone:
                    "bad"

            });

        }

        if (
            budget.totalBudget >
            0
        ) {

            insights.push({

                icon:
                    budget.status ===
                    "exceeded"
                        ? "!"
                        : "✓",

                title:
                    "Control presupuestario",

                text:
                    (
                        `Has consumido ${this.percent(
                            budget.usedPercent
                        )} del presupuesto mensual.`
                    ),

                tone:
                    budget.status ===
                    "exceeded"
                        ? "bad"
                        : (
                            budget.status ===
                            "warning"
                                ? "warning"
                                : "good"
                        )

            });

        }

        if (
            categories.length >
            0 &&
            summary.monthlyExpenses >
            0
        ) {

            const top =
                categories[0];

            const share =
                (
                    top.amount /
                    summary.monthlyExpenses
                ) * 100;

            insights.push({

                icon:
                    "•",

                title:
                    "Principal foco de gasto",

                text:
                    (
                        `${top.label} concentra ` +
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
            forecast.pending.count >
            0
        ) {

            const difference =
                forecast.estimated
                    .savings -
                summary.monthlySavings;

            insights.push({

                icon:
                    difference >= 0
                        ? "↗"
                        : "↘",

                title:
                    "Efecto de pendientes",

                text:
                    (
                        `La previsión cambiaría el ahorro en ` +
                        `${this.currency(
                            difference
                        )}.`
                    ),

                tone:
                    difference >= 0
                        ? "good"
                        : "warning"

            });

        } else if (
            comparison.expenses
                .difference !==
            0
        ) {

            insights.push({

                icon:
                    comparison.expenses
                        .difference >
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
                                comparison
                                    .expenses
                                    .difference
                            )
                        )} ` +
                        `${
                            comparison
                                .expenses
                                .difference >
                            0
                                ? "mayor"
                                : "menor"
                        } que el mes anterior.`
                    ),

                tone:
                    comparison.expenses
                        .difference >
                    0
                        ? "warning"
                        : "good"

            });

        }

        return insights
            .slice(
                0,
                4
            );

    },

    qualityPanel(
        summary,
        comparison,
        budget,
        categories,
        forecast
    ) {

        const insights =
            this.monthlyInsights(
                summary,
                comparison,
                budget,
                categories,
                forecast
            );

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Calidad del mes",
                    "Conclusiones derivadas de los datos"
                )}

                <div class="atlas-analysis-insights">

                    ${insights.map(
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
                    ).join("")}

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

        return `

            <div class="atlas-analysis-context">

                ${this.monthSelector(
                    analysisMonth,
                    currentMonth
                )}

                ${this.modeSelector()}

            </div>

            ${this.monthlySummary(
                summary,
                comparison
            )}

            ${
                this.state.monthlyMode ===
                "forecast"
                    ? this.forecastPanel(
                        forecast
                    )
                    : ""
            }

            ${this.budgetPanel(
                budget,
                forecast
            )}

            ${this.distributionPanel(
                categories,
                subcategories
            )}

            ${this.flowPanel(
                summary
            )}

            ${this.recurringPanel(
                forecast
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
                forecast
            )}

        `;

    },

    periodSelector(activePeriod) {

        return `

            <div class="atlas-analysis-period">

                ${[
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
                ].map(
                    item => `

                        <button
                            type="button"
                            data-trends-period="${
                                item.value
                            }"
                            class="${
                                String(
                                    activePeriod
                                ) ===
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
                    false

            },

            income: {

                label:
                    "Ingresos",

                property:
                    "income",

                positiveIsGood:
                    true,

                percent:
                    false

            },

            expenses: {

                label:
                    "Gasto neto",

                property:
                    "expenses",

                positiveIsGood:
                    false,

                percent:
                    false

            },

            grossExpenses: {

                label:
                    "Gasto bruto",

                property:
                    "grossExpenses",

                positiveIsGood:
                    false,

                percent:
                    false

            },

            reimbursements: {

                label:
                    "Reembolsos",

                property:
                    "reimbursements",

                positiveIsGood:
                    true,

                percent:
                    false

            },

            invested: {

                label:
                    "Invertido",

                property:
                    "invested",

                positiveIsGood:
                    true,

                percent:
                    false

            },

            savingRate: {

                label:
                    "Tasa de ahorro",

                property:
                    "savingRate",

                positiveIsGood:
                    true,

                percent:
                    true

            },

            debtPayments: {

                label:
                    "Pagos de deuda",

                property:
                    "debtPayments",

                positiveIsGood:
                    true,

                percent:
                    false

            },

            cashOutflow: {

                label:
                    "Salidas de caja",

                property:
                    "cashOutflow",

                positiveIsGood:
                    false,

                percent:
                    false

            },

            cashResult: {

                label:
                    "Resultado de caja",

                property:
                    "cashResult",

                positiveIsGood:
                    true,

                percent:
                    false

            }

        };

    },

    metricOptions(
        selected,
        allowNone = false
    ) {

        const definitions =
            this.metricDefinitions();

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
                            Sin comparación
                        </option>

                    `
                    : ""
            }

            ${Object.entries(
                definitions
            ).map(
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
            ).join("")}

        `;

    },

    trendsControls(period) {

        return `

            <section class="atlas-analysis-controls">

                ${this.periodSelector(
                    period
                )}

                <div class="atlas-analysis-selectors">

                    <label>

                        <span>
                            Variable principal
                        </span>

                        <select
                            id="atlas-analysis-primary-metric"
                        >
                            ${this.metricOptions(
                                this.state
                                    .trendMetric
                            )}
                        </select>

                    </label>

                    <label>

                        <span>
                            Comparar con
                        </span>

                        <select
                            id="atlas-analysis-comparison-metric"
                        >
                            ${this.metricOptions(
                                this.state
                                    .comparisonMetric,
                                true
                            )}
                        </select>

                    </label>

                </div>

            </section>

        `;

    },

    trendLineChart(
        months,
        primaryDefinition,
        comparisonDefinition,
        statistics
    ) {

        if (
            months.length ===
            0
        ) {

            return this.emptyState(
                "⌁",
                "Sin histórico",
                "Todavía no hay meses suficientes para crear la gráfica."
            );

        }

        const primaryValues =
            months.map(
                month =>
                    this.number(
                        month[
                            primaryDefinition
                                .property
                        ]
                    )
            );

        const secondaryValues =
            comparisonDefinition
                ? months.map(
                    month =>
                        this.number(
                            month[
                                comparisonDefinition
                                    .property
                            ]
                        )
                )
                : [];

        const movingValues =
            statistics
                .movingAverage
                .map(
                    item =>
                        this.number(
                            item.value
                        )
                );

        const allValues = [
            ...primaryValues,
            ...secondaryValues,
            ...movingValues
        ];

        const minimum =
            Math.min(
                0,
                ...allValues
            );

        const maximum =
            Math.max(
                1,
                ...allValues
            );

        const range =
            maximum -
            minimum ||
            1;

        const width =
            680;

        const height =
            240;

        const paddingX =
            28;

        const paddingY =
            24;

        const chartWidth =
            width -
            paddingX *
            2;

        const chartHeight =
            height -
            paddingY *
            2;

        const pointFor =
            (
                value,
                index
            ) => {

                const x =
                    months.length ===
                    1
                        ? width / 2
                        : (
                            paddingX +
                            (
                                index /
                                (
                                    months.length -
                                    1
                                )
                            ) *
                            chartWidth
                        );

                const y =
                    paddingY +
                    (
                        (
                            maximum -
                            value
                        ) /
                        range
                    ) *
                    chartHeight;

                return {
                    x,
                    y
                };

            };

        const polyline =
            values =>
                values.map(
                    (
                        value,
                        index
                    ) => {

                        const point =
                            pointFor(
                                value,
                                index
                            );

                        return (
                            `${point.x},` +
                            `${point.y}`
                        );

                    }
                ).join(" ");

        const zeroY =
            pointFor(
                0,
                0
            ).y;

        return `

            <div class="atlas-analysis-line-chart">

                <svg
                    viewBox="
                        0 0
                        ${width}
                        ${height}
                    "
                    role="img"
                    aria-label="
                        Evolución de
                        ${primaryDefinition.label}
                    "
                >

                    <line
                        x1="${paddingX}"
                        y1="${zeroY}"
                        x2="${
                            width -
                            paddingX
                        }"
                        y2="${zeroY}"
                        class="zero"
                    ></line>

                    <polyline
                        points="${
                            polyline(
                                movingValues
                            )
                        }"
                        class="moving"
                    ></polyline>

                    ${
                        comparisonDefinition
                            ? `

                                <polyline
                                    points="${
                                        polyline(
                                            secondaryValues
                                        )
                                    }"
                                    class="secondary"
                                ></polyline>

                            `
                            : ""
                    }

                    <polyline
                        points="${
                            polyline(
                                primaryValues
                            )
                        }"
                        class="primary"
                    ></polyline>

                    ${primaryValues.map(
                        (
                            value,
                            index
                        ) => {

                            const point =
                                pointFor(
                                    value,
                                    index
                                );

                            return `

                                <circle
                                    cx="${point.x}"
                                    cy="${point.y}"
                                    r="4"
                                    class="point"
                                ></circle>

                            `;

                        }
                    ).join("")}

                </svg>

                <div
                    class="atlas-analysis-chart-labels"
                    style="
                        grid-template-columns:
                            repeat(
                                ${months.length},
                                minmax(
                                    46px,
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

        `;

    },

    trendsSummary(
        trend,
        definition,
        statistics
    ) {

        const latest =
            statistics.latest;

        const first =
            trend.months[0];

        const firstToLast =
            AtlasCalculations
                .metricComparison(
                    latest?.[
                        definition.property
                    ],
                    first?.[
                        definition.property
                    ]
                );

        const change =
            this.comparisonInformation(
                firstToLast,
                definition
                    .positiveIsGood,
                definition.percent
            );

        const classification =
            this.classificationLabel(
                statistics
                    .classification
                    .key
            );

        const valueFormatter =
            definition.percent
                ? this.percent.bind(this)
                : this.currency.bind(this);

        return `

            <section class="atlas-analysis-grid">

                <article class="atlas-analysis-metric atlas-analysis-metric-wide">

                    <span class="atlas-analysis-metric-label">
                        Último dato
                    </span>

                    <strong class="atlas-analysis-metric-value">
                        ${valueFormatter(
                            latest?.[
                                definition.property
                            ]
                        )}
                    </strong>

                    <small>
                        ${
                            latest
                                ? this.formatMonth(
                                    latest.monthKey
                                )
                                : "Sin datos"
                        }
                    </small>

                </article>

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Cambio del periodo
                    </span>

                    <strong
                        class="atlas-analysis-metric-value"
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

                <article class="atlas-analysis-metric">

                    <span class="atlas-analysis-metric-label">
                        Tendencia
                    </span>

                    <strong class="atlas-analysis-metric-value atlas-analysis-text-value">
                        ${classification.label}
                    </strong>

                    <small
                        style="
                            color:
                                ${classification.color};
                        "
                    >
                        ${classification.detail}
                    </small>

                </article>

            </section>

        `;

    },

    classificationLabel(key) {

        const labels = {

            strong_improvement: {

                label:
                    "Mejora fuerte",

                detail:
                    "Avance claro durante el periodo",

                color:
                    "var(--color-success)"

            },

            improvement: {

                label:
                    "Mejorando",

                detail:
                    "Evolución favorable",

                color:
                    "var(--color-success)"

            },

            stable: {

                label:
                    "Estable",

                detail:
                    "Sin cambio sostenido relevante",

                color:
                    "var(--color-text-muted)"

            },

            decline: {

                label:
                    "Empeorando",

                detail:
                    "Evolución desfavorable",

                color:
                    "#f4b95e"

            },

            strong_decline: {

                label:
                    "Deterioro fuerte",

                detail:
                    "Cambio desfavorable acusado",

                color:
                    "var(--color-danger)"

            }

        };

        return (
            labels[key] ||
            labels.stable
        );

    },

    historicalPanel(
        trend,
        definition,
        comparisonDefinition,
        statistics
    ) {

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    `Evolución de ${definition.label.toLowerCase()}`,
                    (
                        `${this.formatMonth(
                            trend.startMonthKey
                        )} — ` +
                        `${this.formatMonth(
                            trend.endMonthKey
                        )}`
                    ),
                    `

                        <div class="atlas-analysis-legend">

                            <span class="primary">
                                ${definition.label}
                            </span>

                            <span class="moving">
                                Media móvil
                            </span>

                            ${
                                comparisonDefinition
                                    ? `

                                        <span class="secondary">
                                            ${
                                                comparisonDefinition
                                                    .label
                                            }
                                        </span>

                                    `
                                    : ""
                            }

                        </div>

                    `
                )}

                ${this.trendLineChart(
                    trend.months,
                    definition,
                    comparisonDefinition,
                    statistics
                )}

            </section>

        `;

    },

    statisticsPanel(
        definition,
        statistics
    ) {

        const formatter =
            definition.percent
                ? this.percent.bind(this)
                : this.currency.bind(this);

        const maximumValue =
            statistics.maximum?.[
                definition.property
            ];

        const minimumValue =
            statistics.minimum?.[
                definition.property
            ];

        const rows = [

            {
                label:
                    "Total",
                value:
                    statistics.total ===
                    null
                        ? "No aplica"
                        : formatter(
                            statistics.total
                        )
            },

            {
                label:
                    "Promedio",
                value:
                    formatter(
                        statistics.average
                    )
            },

            {
                label:
                    "Mediana",
                value:
                    formatter(
                        statistics.median
                    )
            },

            {
                label:
                    "Máximo",
                value:
                    formatter(
                        maximumValue
                    ),
                detail:
                    statistics.maximum
                        ? this.formatMonth(
                            statistics
                                .maximum
                                .monthKey
                        )
                        : ""
            },

            {
                label:
                    "Mínimo",
                value:
                    formatter(
                        minimumValue
                    ),
                detail:
                    statistics.minimum
                        ? this.formatMonth(
                            statistics
                                .minimum
                                .monthKey
                        )
                        : ""
            },

            {
                label:
                    "Rango",
                value:
                    formatter(
                        statistics.range
                    )
            },

            {
                label:
                    "Volatilidad",
                value:
                    this.percent(
                        statistics.volatility
                    )
            },

            {
                label:
                    "Sobre la media",
                value:
                    `${statistics
                        .monthsAboveAverage} meses`
            },

            {
                label:
                    "Bajo la media",
                value:
                    `${statistics
                        .monthsBelowAverage} meses`
            }

        ];

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Estadísticas y tendencia
                        </strong>

                        <small>
                            Distribución, extremos y regularidad
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-statistics">

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

    periodComparisonPanel(
        comparison
    ) {

        const rows = [

            {
                label:
                    "Ingresos",
                comparison:
                    comparison.income,
                positiveIsGood:
                    true
            },

            {
                label:
                    "Gastos",
                comparison:
                    comparison.expenses,
                positiveIsGood:
                    false
            },

            {
                label:
                    "Inversión",
                comparison:
                    comparison.invested,
                positiveIsGood:
                    true
            },

            {
                label:
                    "Ahorro",
                comparison:
                    comparison.savings,
                positiveIsGood:
                    true
            },

            {
                label:
                    "Tasa de ahorro",
                comparison:
                    comparison.savingRate,
                positiveIsGood:
                    true,
                percentagePoint:
                    true
            },

            {
                label:
                    "Deuda pagada",
                comparison:
                    comparison.debtPayments,
                positiveIsGood:
                    true
            }

        ];

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Comparación entre periodos
                        </strong>

                        <small>
                            Periodo actual frente al anterior equivalente
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-comparison-list">

                        ${rows.map(
                            row => {

                                const information =
                                    this
                                        .comparisonInformation(
                                            row.comparison,
                                            row.positiveIsGood,
                                            row.percentagePoint
                                        );

                                return `

                                    <div>

                                        <span>
                                            ${row.label}
                                        </span>

                                        <strong
                                            style="
                                                color:
                                                    ${
                                                        information
                                                            .color
                                                    };
                                            "
                                        >
                                            ${information.icon}
                                            ${information.text}
                                        </strong>

                                    </div>

                                `;

                            }
                        ).join("")}

                    </div>

                </div>

            </details>

        `;

    },

    budgetTrendChart(budget) {

        const maximum =
            Math.max(
                100,
                ...budget.months.map(
                    month =>
                        this.number(
                            month.usedPercent
                        )
                )
            );

        return `

            <div class="atlas-analysis-budget-trend">

                ${budget.months.map(
                    month => {

                        const status =
                            this
                                .budgetStatusInformation(
                                    month.status
                                );

                        const height =
                            (
                                this.number(
                                    month.usedPercent
                                ) /
                                maximum
                            ) * 120;

                        return `

                            <div>

                                <strong>
                                    ${
                                        month.usedPercent ===
                                        null
                                            ? "—"
                                            : `${this.number(
                                                month
                                                    .usedPercent
                                            ).toFixed(
                                                0
                                            )}%`
                                    }
                                </strong>

                                <i
                                    style="
                                        height:
                                            ${Math.max(
                                                3,
                                                height
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

        `;

    },

    budgetTrendPanel(budget) {

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Cumplimiento presupuestario
                        </strong>

                        <small>
                            Control histórico sin repetir la página de Presupuestos
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    ${this.budgetTrendChart(
                        budget
                    )}

                    <div class="atlas-analysis-inline-facts">

                        <span>
                            Dentro del límite
                            <strong>
                                ${budget
                                    .withinBudget}
                                meses
                            </strong>
                        </span>

                        <span>
                            Superados
                            <strong>
                                ${budget.exceeded}
                                meses
                            </strong>
                        </span>

                        <span>
                            Uso medio
                            <strong>
                                ${this.percent(
                                    budget
                                        .averageUsedPercent
                                )}
                            </strong>
                        </span>

                    </div>

                </div>

            </details>

        `;

    },

    categoryEvolutionPanel(trend) {

        if (
            trend.categories.length ===
            0
        ) {

            return "";

        }

        const selectedKey =
            this.state
                .selectedCategory ||
            trend.categories[0].key;

        const selected =
            trend.categories.find(
                category =>
                    category.key ===
                    selectedKey
            ) ||
            trend.categories[0];

        this.state.selectedCategory =
            selected.key;

        const maximum =
            Math.max(
                1,
                ...selected.monthly.map(
                    month =>
                        Math.max(
                            0,
                            month.amount
                        )
                )
            );

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Evolución por categorías
                        </strong>

                        <small>
                            Tendencia de una categoría concreta
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

                        <select id="atlas-analysis-category">

                            ${trend.categories.map(
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

                    <div class="atlas-analysis-category-trend">

                        ${selected.monthly.map(
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
                                                            month
                                                                .amount
                                                        ) /
                                                        maximum
                                                    ) *
                                                    110
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

    investmentDebtPanel(trend) {

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

                <summary>

                    <div>

                        <strong>
                            Inversión y deuda
                        </strong>

                        <small>
                            Regularidad de aportaciones y pagos
                        </small>

                    </div>

                    <span>
                        +
                    </span>

                </summary>

                <div class="atlas-analysis-details-content">

                    <div class="atlas-analysis-dual-summary">

                        <section>

                            <h3>
                                Inversión
                            </h3>

                            <div class="atlas-analysis-summary-list">

                                <div>

                                    <span>
                                        Total aportado
                                    </span>

                                    <strong>
                                        ${this.currency(
                                            trend
                                                .investment
                                                .total
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Media mensual
                                    </span>

                                    <strong>
                                        ${this.currency(
                                            trend
                                                .investment
                                                .average
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Meses con inversión
                                    </span>

                                    <strong>
                                        ${trend
                                            .investment
                                            .monthsWithInvestment}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Regularidad
                                    </span>

                                    <strong>
                                        ${this.percent(
                                            trend
                                                .investment
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
                                            trend
                                                .investment
                                                .incomeShare
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>

                        <section>

                            <h3>
                                Deuda
                            </h3>

                            <div class="atlas-analysis-summary-list">

                                <div>

                                    <span>
                                        Total pagado
                                    </span>

                                    <strong>
                                        ${this.currency(
                                            trend.debt.total
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Media mensual
                                    </span>

                                    <strong>
                                        ${this.currency(
                                            trend
                                                .debt
                                                .average
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Meses con pagos
                                    </span>

                                    <strong>
                                        ${trend
                                            .debt
                                            .monthsWithPayments}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Deuda actual
                                    </span>

                                    <strong>
                                        ${this.currency(
                                            trend
                                                .debt
                                                .currentDebt
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </details>

        `;

    },

    consistencyPanel(consistency) {

        const total =
            Math.max(
                1,
                consistency.months
            );

        const indicators = [

            {
                label:
                    "Ahorro positivo",
                value:
                    consistency
                        .positiveSavings
            },

            {
                label:
                    "Dentro del presupuesto",
                value:
                    consistency
                        .withinBudget
            },

            {
                label:
                    "Con inversión",
                value:
                    consistency
                        .withInvestment
            },

            {
                label:
                    "Objetivo de ahorro",
                value:
                    consistency
                        .savingTargetMet
            }

        ];

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

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
                                        total
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
                                                ${consistency.months}
                                            </strong>

                                        </div>

                                        <i>

                                            <b
                                                style="
                                                    width:
                                                        ${
                                                            percentage
                                                        }%;
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
                                        .expenseVolatility
                                )}
                            </strong>
                        </span>

                        <span>
                            Volatilidad del ahorro
                            <strong>
                                ${this.percent(
                                    consistency
                                        .savingsVolatility
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
                        .bestSavingsMonth,
                property:
                    "savings"
            },

            {
                label:
                    "Peor ahorro",
                month:
                    trend
                        .worstSavingsMonth,
                property:
                    "savings"
            },

            {
                label:
                    "Menor gasto",
                month:
                    trend
                        .lowestExpenseMonth,
                property:
                    "expenses"
            },

            {
                label:
                    "Mayor inversión",
                month:
                    trend
                        .highestInvestmentMonth,
                property:
                    "invested"
            },

            {
                label:
                    "Mejor tasa de ahorro",
                month:
                    trend
                        .bestSavingRateMonth,
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
                        .highestCashOutflowMonth,
                property:
                    "cashOutflow"
            }

        ];

        return `

            <details class="panel atlas-analysis-panel atlas-analysis-details">

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

                    <div class="atlas-analysis-highlights">

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

    accumulatedPanel(trend) {

        const totals =
            trend.totals;

        return `

            <section class="panel atlas-analysis-panel">

                ${this.panelHeader(
                    "Resumen acumulado",
                    "Totales del periodo seleccionado"
                )}

                <div class="atlas-analysis-accumulated">

                    <div>

                        <small>
                            Ingresos
                        </small>

                        <strong>
                            ${this.currency(
                                totals.income
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Gasto neto
                        </small>

                        <strong>
                            ${this.currency(
                                totals.expenses
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Reembolsos
                        </small>

                        <strong>
                            ${this.currency(
                                totals.reimbursements
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Invertido
                        </small>

                        <strong>
                            ${this.currency(
                                totals.invested
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Ahorro
                        </small>

                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        totals.savings,
                                        true
                                    )};
                            "
                        >
                            ${this.currency(
                                totals.savings
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Deuda pagada
                        </small>

                        <strong>
                            ${this.currency(
                                totals.debtPayments
                            )}
                        </strong>

                    </div>

                </div>

            </section>

        `;

    },

    trendsView(
        data,
        options
    ) {

        const optionPeriod =
            options.trendsPeriod;

        const period =
            this.state.trendsPeriod ||
            optionPeriod ||
            6;

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

        const definitions =
            this.metricDefinitions();

        const definition =
            definitions[
                this.state
                    .trendMetric
            ] ||
            definitions.savings;

        const comparisonDefinition =
            this.state
                .comparisonMetric ===
            "none"
                ? null
                : definitions[
                    this.state
                        .comparisonMetric
                ] ||
                null;

        const statistics =
            trend.statistics[
                definition.property
            ];

        return `

            ${this.trendsControls(
                period
            )}

            ${this.trendsSummary(
                trend,
                definition,
                statistics
            )}

            ${this.historicalPanel(
                trend,
                definition,
                comparisonDefinition,
                statistics
            )}

            ${this.statisticsPanel(
                definition,
                statistics
            )}

            ${this.periodComparisonPanel(
                trend.comparison
            )}

            ${this.budgetTrendPanel(
                trend.budget
            )}

            ${this.categoryEvolutionPanel(
                trend
            )}

            ${this.investmentDebtPanel(
                trend
            )}

            ${this.consistencyPanel(
                trend.consistency
            )}

            ${this.bestWorstPanel(
                trend
            )}

            ${this.accumulatedPanel(
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

        if (
            options.trendsPeriod
        ) {

            this.state.trendsPeriod =
                options.trendsPeriod;

        }

        if (
            options.trendMetric
        ) {

            this.state.trendMetric =
                options.trendMetric;

        }

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

    rerender() {

        const app =
            document.getElementById(
                "app"
            );

        if (
            !app ||
            !this.data
        ) {

            return;

        }

        app.innerHTML =
            this.render(
                this.data,
                this.options
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

        this.bindControls();

    },

    bindControls() {

        document
            .querySelectorAll(
                "[data-analysis-mode]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.state
                                .monthlyMode =
                                button.dataset
                                    .analysisMode;

                            this.rerender();

                        }
                    );

                }
            );

        document
            .querySelectorAll(
                "[data-distribution-level]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.state
                                .distributionLevel =
                                button.dataset
                                    .distributionLevel;

                            this.rerender();

                        }
                    );

                }
            );

        document
            .querySelectorAll(
                "[data-trends-period]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const value =
                                button.dataset
                                    .trendsPeriod;

                            this.state
                                .trendsPeriod =
                                value ===
                                "all"
                                    ? "all"
                                    : Number(
                                        value
                                    );

                            this.rerender();

                        }
                    );

                }
            );

        const primaryMetric =
            document.getElementById(
                "atlas-analysis-primary-metric"
            );

        if (primaryMetric) {

            primaryMetric
                .addEventListener(
                    "change",
                    event => {

                        this.state
                            .trendMetric =
                            event.target
                                .value;

                        if (
                            this.state
                                .comparisonMetric ===
                            this.state
                                .trendMetric
                        ) {

                            this.state
                                .comparisonMetric =
                                "none";

                        }

                        this.rerender();

                    }
                );

        }

        const comparisonMetric =
            document.getElementById(
                "atlas-analysis-comparison-metric"
            );

        if (comparisonMetric) {

            comparisonMetric
                .addEventListener(
                    "change",
                    event => {

                        this.state
                            .comparisonMetric =
                            event.target
                                .value;

                        this.rerender();

                    }
                );

        }

        const categorySelector =
            document.getElementById(
                "atlas-analysis-category"
            );

        if (categorySelector) {

            categorySelector
                .addEventListener(
                    "change",
                    event => {

                        this.state
                            .selectedCategory =
                            event.target
                                .value;

                        this.rerender();

                    }
                );

        }

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
                        110px +
                        env(
                            safe-area-inset-bottom
                        )
                    );
            }

            .atlas-analysis-tabs,
            .atlas-analysis-mode,
            .atlas-analysis-period,
            .atlas-analysis-mini-tabs {
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

            .atlas-analysis-tabs {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                margin-bottom: 16px;
            }

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
                margin-bottom: 12px;
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
            .atlas-analysis-mini-tabs button {
                min-height: 42px;
                padding: 0 8px;
                border-radius: 13px;
                color:
                    var(
                        --color-text-muted
                    );
                background: transparent;
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-analysis-mini-tabs button {
                min-height: 32px;
                font-size: 10px;
            }

            .atlas-analysis-tabs button.active,
            .atlas-analysis-mode button.active,
            .atlas-analysis-period button.active,
            .atlas-analysis-mini-tabs button.active {
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

            .atlas-analysis-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 10px;
                margin-bottom: 14px;
            }

            .atlas-analysis-grid-compact {
                margin-bottom: 4px;
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
            }

            .atlas-analysis-metric-value {
                display: block;
                margin-top: 7px;
                overflow: hidden;
                font-size: 19px;
                line-height: 1.1;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-analysis-text-value {
                font-size: 16px;
            }

            .atlas-analysis-metric small {
                display: block;
                margin-top: 6px;
                font-size: 9px;
                line-height: 1.35;
            }

            .atlas-analysis-metric-detail {
                display: block;
                margin-top: 6px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.4;
            }

            .atlas-analysis-panel {
                margin-bottom: 14px;
            }

            .atlas-analysis-panel-right {
                flex: 0 0 auto;
            }

            .atlas-analysis-badge {
                display: inline-flex;
                align-items: center;
                min-height: 27px;
                padding: 0 9px;
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
                padding: 24px 10px;
                text-align: center;
            }

            .atlas-analysis-empty > div {
                margin-bottom: 8px;
                font-size: 27px;
            }

            .atlas-analysis-empty p {
                margin-top: 6px;
            }

            .atlas-analysis-forecast-chart {
                display: grid;
                gap: 16px;
                margin-top: 17px;
            }

            .atlas-analysis-forecast-row {
                display: grid;
                grid-template-columns:
                    minmax(
                        85px,
                        1fr
                    )
                    minmax(
                        90px,
                        1.5fr
                    )
                    auto;
                align-items: center;
                gap: 10px;
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
                line-height: 1.3;
            }

            .atlas-analysis-forecast-row > strong {
                font-size: 11px;
            }

            .atlas-analysis-forecast-track {
                position: relative;
                height: 10px;
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
                position: absolute;
                inset:
                    0
                    auto
                    0
                    0;
                display: block;
                border-radius: inherit;
            }

            .atlas-analysis-forecast-track
            .estimated {
                background:
                    rgba(
                        169,
                        133,
                        255,
                        0.38
                    );
            }

            .atlas-analysis-forecast-track
            .real {
                height: 5px;
                margin-top: 2.5px;
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-budget-summary,
            .atlas-analysis-accumulated {
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
            .atlas-analysis-accumulated div {
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
            .atlas-analysis-accumulated small,
            .atlas-analysis-accumulated strong {
                display: block;
            }

            .atlas-analysis-budget-summary small,
            .atlas-analysis-accumulated small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-analysis-budget-summary strong,
            .atlas-analysis-accumulated strong {
                margin-top: 5px;
                overflow: hidden;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
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

            .atlas-analysis-budget-footer {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                margin-top: 10px;
                font-size: 10px;
                font-weight: 700;
            }

            .atlas-analysis-link {
                padding: 0;
                color:
                    var(
                        --color-primary
                    );
                background: transparent;
                font-size: 10px;
                font-weight: 750;
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

            .atlas-analysis-distribution {
                display: grid;
                grid-template-columns:
                    128px
                    minmax(
                        0,
                        1fr
                    );
                align-items: center;
                gap: 16px;
                margin-top: 15px;
            }

            .atlas-analysis-donut-wrap {
                position: relative;
                width: 128px;
                height: 128px;
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
                font-size: 13px;
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
                padding: 7px 0;
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
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
            }

            .atlas-analysis-distribution-row > strong {
                font-size: 10px;
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
                overflow: hidden;
                color:
                    var(
                        --color-text
                    );
                font-size: 10px;
                text-overflow: ellipsis;
            }

            .atlas-analysis-flow {
                display: flex;
                min-height: 84px;
                margin-top: 16px;
                overflow: hidden;
                border-radius: 16px;
            }

            .atlas-analysis-flow div {
                display: flex;
                min-width: 50px;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 9px 5px;
                text-align: center;
            }

            .atlas-analysis-flow strong {
                font-size: 12px;
            }

            .atlas-analysis-flow small {
                margin-top: 5px;
                font-size: 8px;
            }

            .atlas-analysis-flow
            .expense {
                background:
                    rgba(
                        255,
                        113,
                        137,
                        0.3
                    );
            }

            .atlas-analysis-flow
            .investment {
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.3
                    );
            }

            .atlas-analysis-flow
            .debt {
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.3
                    );
            }

            .atlas-analysis-flow
            .saving {
                background:
                    rgba(
                        95,
                        214,
                        193,
                        0.3
                    );
            }

            .atlas-analysis-flow-values {
                display: grid;
                grid-template-columns:
                    repeat(
                        4,
                        minmax(0, 1fr)
                    );
                gap: 6px;
                margin-top: 11px;
            }

            .atlas-analysis-flow-values span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
                text-align: center;
            }

            .atlas-analysis-flow-values strong {
                display: block;
                margin-top: 3px;
                overflow: hidden;
                color:
                    var(
                        --color-text
                    );
                font-size: 9px;
                text-overflow: ellipsis;
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

            .atlas-analysis-details summary div strong,
            .atlas-analysis-details summary div small {
                display: block;
            }

            .atlas-analysis-details summary div strong {
                font-size: 15px;
            }

            .atlas-analysis-details summary div small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-analysis-details summary > span {
                color:
                    var(
                        --color-primary
                    );
                font-size: 20px;
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

            .atlas-analysis-summary-list > div,
            .atlas-analysis-comparison-list > div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                padding: 12px 0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-summary-list > div:last-child,
            .atlas-analysis-comparison-list > div:last-child {
                border-bottom: 0;
            }

            .atlas-analysis-summary-list span,
            .atlas-analysis-comparison-list span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-analysis-summary-list strong,
            .atlas-analysis-comparison-list strong {
                font-size: 11px;
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
                padding: 10px 0;
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
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
                font-weight: 750;
            }

            .atlas-analysis-activity-grid,
            .atlas-analysis-statistics,
            .atlas-analysis-highlights {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 9px;
            }

            .atlas-analysis-activity-grid div,
            .atlas-analysis-statistics div,
            .atlas-analysis-highlights div {
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

            .atlas-analysis-activity-grid small,
            .atlas-analysis-activity-grid strong,
            .atlas-analysis-activity-grid span,
            .atlas-analysis-statistics small,
            .atlas-analysis-statistics strong,
            .atlas-analysis-statistics span,
            .atlas-analysis-highlights small,
            .atlas-analysis-highlights strong,
            .atlas-analysis-highlights span {
                display: block;
            }

            .atlas-analysis-activity-grid small,
            .atlas-analysis-statistics small,
            .atlas-analysis-highlights small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-activity-grid strong,
            .atlas-analysis-statistics strong,
            .atlas-analysis-highlights strong {
                margin-top: 5px;
                overflow: hidden;
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-analysis-activity-grid span,
            .atlas-analysis-statistics span,
            .atlas-analysis-highlights span {
                margin-top: 4px;
                overflow: hidden;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-analysis-daily-chart {
                display: grid;
                grid-template-columns:
                    repeat(
                        31,
                        minmax(
                            7px,
                            1fr
                        )
                    );
                align-items: end;
                gap: 3px;
                min-height: 145px;
                overflow-x: auto;
            }

            .atlas-analysis-daily-chart > div {
                display: flex;
                min-width: 7px;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                gap: 5px;
            }

            .atlas-analysis-daily-chart i {
                display: block;
                width: 100%;
                min-width: 5px;
                max-width: 10px;
                border-radius:
                    5px
                    5px
                    2px
                    2px;
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-daily-chart small {
                min-height: 10px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
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
                line-height: 1.45;
            }

            .atlas-analysis-insights
            .good > span {
                color:
                    var(
                        --color-success
                    );
            }

            .atlas-analysis-insights
            .warning > span {
                color: #f4b95e;
            }

            .atlas-analysis-insights
            .bad > span {
                color:
                    var(
                        --color-danger
                    );
            }

            .atlas-analysis-controls {
                margin-bottom: 14px;
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
                padding: 0 12px;
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

            .atlas-analysis-legend {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 7px;
                max-width: 150px;
            }

            .atlas-analysis-legend span {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 7px;
            }

            .atlas-analysis-legend span::before {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                content: "";
            }

            .atlas-analysis-legend
            .primary::before {
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-legend
            .secondary::before {
                background:
                    var(
                        --atlas-chart-3
                    );
            }

            .atlas-analysis-legend
            .moving::before {
                background:
                    var(
                        --atlas-chart-2
                    );
            }

            .atlas-analysis-line-chart {
                margin-top: 14px;
                overflow-x: auto;
            }

            .atlas-analysis-line-chart svg {
                width: 100%;
                min-width: 560px;
                height: auto;
            }

            .atlas-analysis-line-chart
            line.zero {
                stroke:
                    rgba(
                        255,
                        255,
                        255,
                        0.13
                    );
                stroke-width: 1;
                stroke-dasharray:
                    5
                    5;
            }

            .atlas-analysis-line-chart
            polyline {
                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .atlas-analysis-line-chart
            .primary {
                stroke:
                    var(
                        --color-primary
                    );
                stroke-width: 4;
            }

            .atlas-analysis-line-chart
            .secondary {
                stroke:
                    var(
                        --atlas-chart-3
                    );
                stroke-width: 3;
                opacity: 0.8;
            }

            .atlas-analysis-line-chart
            .moving {
                stroke:
                    var(
                        --atlas-chart-2
                    );
                stroke-width: 2;
                stroke-dasharray:
                    7
                    6;
                opacity: 0.85;
            }

            .atlas-analysis-line-chart
            .point {
                fill:
                    var(
                        --color-primary
                    );
                stroke: #19243a;
                stroke-width: 2;
            }

            .atlas-analysis-chart-labels {
                display: grid;
                min-width: 560px;
                gap: 3px;
                margin-top: 3px;
            }

            .atlas-analysis-chart-labels span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                text-align: center;
            }

            .atlas-analysis-budget-trend,
            .atlas-analysis-category-trend {
                display: grid;
                grid-template-columns:
                    repeat(
                        var(
                            --atlas-history-columns,
                            6
                        ),
                        minmax(
                            38px,
                            1fr
                        )
                    );
                align-items: end;
                gap: 8px;
                min-height: 170px;
                overflow-x: auto;
            }

            .atlas-analysis-budget-trend > div,
            .atlas-analysis-category-trend > div {
                display: flex;
                min-width: 38px;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                gap: 7px;
            }

            .atlas-analysis-budget-trend strong,
            .atlas-analysis-category-trend strong {
                font-size: 8px;
                white-space: nowrap;
            }

            .atlas-analysis-budget-trend i,
            .atlas-analysis-category-trend i {
                display: block;
                width: 25px;
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

            .atlas-analysis-budget-trend small,
            .atlas-analysis-category-trend small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
            }

            .atlas-analysis-category-trend {
                margin-top: 15px;
            }

            .atlas-analysis-dual-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 14px;
            }

            .atlas-analysis-dual-summary h3 {
                margin-bottom: 7px;
                font-size: 13px;
            }

            .atlas-analysis-consistency {
                display: grid;
                gap: 13px;
            }

            .atlas-analysis-consistency
            > div
            > div {
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
                        108px
                        minmax(
                            0,
                            1fr
                        );
                    gap: 11px;
                }

                .atlas-analysis-donut-wrap {
                    width: 108px;
                    height: 108px;
                }

                .atlas-analysis-dual-summary {
                    grid-template-columns:
                        1fr;
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

            this.bindControls();

            document
                .querySelectorAll(
                    ".atlas-analysis-budget-trend, " +
                    ".atlas-analysis-category-trend"
                )
                .forEach(
                    chart => {

                        chart.style.setProperty(
                            "--atlas-history-columns",
                            Math.max(
                                1,
                                chart.children
                                    .length
                            )
                        );

                    }
                );

        };

    }

};

AtlasAnalysisUI.init();

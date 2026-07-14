/* ==========================================================
   ATLAS
   analysis.js
   Sprint 6.0 — Análisis financiero avanzado
========================================================== */

const AtlasAnalysisUI = {

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

    percent(value) {

        return AtlasUI.formatPercent(
            value
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

    comparisonInformation(
        comparison,
        positiveIsGood = true
    ) {

        const difference =
            this.number(
                comparison?.difference
            );

        const percentage =
            comparison?.percentage;

        if (difference === 0) {

            return {

                icon: "•",

                label:
                    "Sin cambios",

                color:
                    "var(--color-text-muted)"

            };

        }

        const positive =
            difference > 0;

        const good =
            positiveIsGood
                ? positive
                : !positive;

        let percentageText =
            "Nuevo este mes";

        if (
            percentage !== null &&
            percentage !== undefined
        ) {

            percentageText =
                `${Math.abs(
                    this.number(
                        percentage
                    )
                ).toFixed(0)}%`;

        }

        return {

            icon:
                positive
                    ? "↑"
                    : "↓",

            label:
                `${this.currency(
                    Math.abs(
                        difference
                    )
                )} · ${percentageText}`,

            color:
                good
                    ? "var(--color-success)"
                    : "var(--color-danger)"

        };

    },

    monthSelector(
        monthKey,
        currentMonth
    ) {

        const isCurrentMonth =
            monthKey ===
            currentMonth;

        return AtlasUI.monthSelector({

            monthKey,

            isCurrentMonth,

            previousAction:
                "previousAnalysisMonth",

            nextAction:
                "nextAnalysisMonth",

            currentAction:
                "currentAnalysisMonth",

            subtitle:
                isCurrentMonth
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
                    Tendencias
                </button>

            </div>

        `;

    },

    comparisonCard(
        title,
        icon,
        comparison,
        positiveIsGood = true
    ) {

        const information =
            this.comparisonInformation(
                comparison,
                positiveIsGood
            );

        return `

            <article class="atlas-analysis-metric">

                <div class="atlas-analysis-metric-label">
                    ${icon}
                    ${title}
                </div>

                <strong class="atlas-analysis-metric-value">
                    ${this.currency(
                        comparison.current
                    )}
                </strong>

                <small
                    style="
                        color:
                            ${information.color};
                    "
                >
                    ${information.icon}
                    ${information.label}
                </small>

            </article>

        `;

    },

    monthlyHero(
        summary,
        comparison
    ) {

        const savingInformation =
            this.comparisonInformation(
                comparison.savings,
                true
            );

        return `

            <section class="hero atlas-analysis-hero">

                <div>

                    <div class="eyebrow">
                        Ahorro del mes
                    </div>

                    <div
                        class="value"
                        style="
                            color:
                                ${this.statusColor(
                                    summary.monthlySavings,
                                    true
                                )};
                        "
                    >
                        ${this.currency(
                            summary.monthlySavings
                        )}
                    </div>

                    <div
                        class="trend"
                        style="
                            color:
                                ${savingInformation.color};
                        "
                    >
                        ${savingInformation.icon}
                        ${savingInformation.label}
                        frente al mes anterior
                    </div>

                </div>

                <div class="atlas-analysis-rate">

                    <small>
                        Tasa de ahorro
                    </small>

                    <strong
                        style="
                            color:
                                ${this.statusColor(
                                    summary.monthlySavingRate,
                                    true
                                )};
                        "
                    >
                        ${this.percent(
                            summary.monthlySavingRate
                        )}
                    </strong>

                </div>

            </section>

        `;

    },

    monthlyMetrics(comparison) {

        return `

            <section
                class="atlas-analysis-grid"
                aria-label="Comparación mensual"
            >

                ${this.comparisonCard(
                    "Ingresos",
                    "🟢",
                    comparison.income,
                    true
                )}

                ${this.comparisonCard(
                    "Gastos",
                    "🔴",
                    comparison.expenses,
                    false
                )}

                ${this.comparisonCard(
                    "Invertido",
                    "📈",
                    comparison.invested,
                    true
                )}

                ${this.comparisonCard(
                    "Salidas de caja",
                    "💸",
                    comparison.cashOutflow,
                    false
                )}

            </section>

        `;

    },

    budgetStatusInformation(status) {

        const values = {

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
                    "Sin presupuesto",

                color:
                    "var(--color-text-muted)"

            }

        };

        return (
            values[status] ||
            values.no_budget
        );

    },

    budgetProgress(summary) {

        const status =
            this.budgetStatusInformation(
                summary.status
            );

        const used =
            summary.usedPercent === null
                ? 100
                : Math.max(
                    0,
                    Math.min(
                        100,
                        this.number(
                            summary.usedPercent
                        )
                    )
                );

        return `

            <section class="panel atlas-analysis-panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Presupuesto
                        </h2>

                        <p class="note">
                            Gasto real frente al límite mensual
                        </p>

                    </div>

                    <strong
                        style="
                            color:
                                ${status.color};
                        "
                    >
                        ${
                            summary.usedPercent === null
                                ? "—"
                                : this.percent(
                                    summary.usedPercent
                                )
                        }
                    </strong>

                </div>

                <div class="atlas-analysis-budget-values">

                    <div>

                        <small class="note">
                            Gastado
                        </small>

                        <strong>
                            ${this.currency(
                                summary.totalSpent
                            )}
                        </strong>

                    </div>

                    <div>

                        <small class="note">
                            Presupuestado
                        </small>

                        <strong>
                            ${this.currency(
                                summary.totalBudget
                            )}
                        </strong>

                    </div>

                    <div>

                        <small class="note">
                            Disponible
                        </small>

                        <strong
                            style="
                                color:
                                    ${this.statusColor(
                                        summary.remaining,
                                        true
                                    )};
                            "
                        >
                            ${this.currency(
                                summary.remaining
                            )}
                        </strong>

                    </div>

                </div>

                <div class="atlas-analysis-progress">

                    <i
                        style="
                            width:${used}%;
                            background:
                                ${status.color};
                        "
                    ></i>

                </div>

                <small
                    class="atlas-analysis-status"
                    style="
                        color:
                            ${status.color};
                    "
                >
                    ${status.label}
                </small>

            </section>

        `;

    },

    categoryRows(categories) {

        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            return `

                <div class="atlas-analysis-empty">

                    <div>
                        🧾
                    </div>

                    <strong>
                        Sin gastos
                    </strong>

                    <p class="note">
                        Registra gastos para ver su distribución.
                    </p>

                </div>

            `;

        }

        const total =
            categories.reduce(
                (
                    sum,
                    category
                ) =>
                    sum +
                    this.number(
                        category.amount
                    ),
                0
            );

        return `

            <div class="atlas-analysis-categories">

                ${categories
                    .map(
                        category => {

                            const percentage =
                                total > 0
                                    ? (
                                        this.number(
                                            category.amount
                                        ) /
                                        total
                                    ) * 100
                                    : 0;

                            return `

                                <div class="atlas-analysis-category">

                                    <div class="atlas-analysis-category-head">

                                        <div>

                                            <strong>
                                                ${this.escape(
                                                    category.category
                                                )}
                                            </strong>

                                            <small class="note">
                                                ${percentage.toFixed(0)}%
                                                del gasto
                                            </small>

                                        </div>

                                        <strong>
                                            ${this.currency(
                                                category.amount
                                            )}
                                        </strong>

                                    </div>

                                    <div class="atlas-analysis-progress">

                                        <i
                                            style="
                                                width:
                                                    ${Math.min(
                                                        100,
                                                        percentage
                                                    )}%;
                                            "
                                        ></i>

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("")}

            </div>

        `;

    },

    monthlyView(
        data,
        options
    ) {

        const analysisMonth =
            options.analysisMonth ||
            AtlasCalculations.monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

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

        const budget =
            AtlasCalculations
                .budgetSummary(
                    data,
                    analysisMonth
                );

        const movements =
            AtlasCalculations
                .movementsForMonth(
                    data,
                    analysisMonth
                );

        return `

            ${this.monthSelector(
                analysisMonth,
                currentMonth
            )}

            ${this.monthlyHero(
                summary,
                comparison
            )}

            ${this.monthlyMetrics(
                comparison
            )}

            ${this.budgetProgress(
                budget
            )}

            <section class="panel atlas-analysis-panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Gastos por categoría
                        </h2>

                        <p class="note">
                            Distribución del gasto real
                        </p>

                    </div>

                    <strong>
                        ${this.currency(
                            summary.monthlyExpenses
                        )}
                    </strong>

                </div>

                ${this.categoryRows(
                    comparison.categories
                )}

            </section>

            <section class="panel atlas-analysis-panel">

                <div class="panelhead">

                    <h2>
                        Actividad del mes
                    </h2>

                </div>

                <div class="atlas-analysis-summary-list">

                    <div>

                        <span>
                            Movimientos registrados
                        </span>

                        <strong>
                            ${movements.length}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Ingresos
                        </span>

                        <strong
                            style="
                                color:
                                    var(
                                        --color-success
                                    );
                            "
                        >
                            ${this.currency(
                                summary.monthlyIncome
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Gastos
                        </span>

                        <strong
                            style="
                                color:
                                    var(
                                        --color-danger
                                    );
                            "
                        >
                            ${this.currency(
                                summary.monthlyExpenses
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Aportaciones
                        </span>

                        <strong
                            style="
                                color:
                                    var(
                                        --color-primary
                                    );
                            "
                        >
                            ${this.currency(
                                summary.monthlyInvested
                            )}
                        </strong>

                    </div>

                </div>

            </section>

        `;

    },

    periodSelector(activePeriod) {

        return `

            <div class="atlas-analysis-period">

                ${[
                    3,
                    6,
                    12
                ]
                    .map(
                        period => `

                            <button
                                type="button"
                                data-action="setTrendsPeriod"
                                data-period="${period}"
                                class="${
                                    activePeriod === period
                                        ? "active"
                                        : ""
                                }"
                            >
                                ${period} meses
                            </button>

                        `
                    )
                    .join("")}

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

                positiveNegative:
                    true

            },

            income: {

                label:
                    "Ingresos",

                property:
                    "income",

                positiveNegative:
                    false

            },

            expenses: {

                label:
                    "Gastos",

                property:
                    "expenses",

                positiveNegative:
                    false

            },

            invested: {

                label:
                    "Aportaciones",

                property:
                    "invested",

                positiveNegative:
                    false

            },

            cashOutflow: {

                label:
                    "Salidas de caja",

                property:
                    "cashOutflow",

                positiveNegative:
                    false

            }

        };

    },

    metricSelector(activeMetric) {

        const definitions =
            this.metricDefinitions();

        return `

            <label class="atlas-analysis-selector">

                <span>
                    Variable
                </span>

                <select id="atlas-analysis-metric">

                    ${Object.entries(
                        definitions
                    )
                        .map(
                            ([
                                key,
                                definition
                            ]) => `

                                <option
                                    value="${key}"
                                    ${
                                        key === activeMetric
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${definition.label}
                                </option>

                            `
                        )
                        .join("")}

                </select>

            </label>

        `;

    },

    trendChart(
        trend,
        metric
    ) {

        const definition =
            this.metricDefinitions()[
                metric
            ] ||
            this.metricDefinitions()
                .savings;

        const values =
            trend.months.map(
                month => ({

                    monthKey:
                        month.monthKey,

                    value:
                        this.number(
                            month[
                                definition.property
                            ]
                        )

                })
            );

        const maximum =
            Math.max(
                1,
                ...values.map(
                    item =>
                        Math.abs(
                            item.value
                        )
                )
            );

        return `

            <div class="atlas-analysis-chart">

                ${values
                    .map(
                        item => {

                            const height =
                                Math.max(
                                    item.value === 0
                                        ? 5
                                        : 18,
                                    (
                                        Math.abs(
                                            item.value
                                        ) /
                                        maximum
                                    ) * 138
                                );

                            const color =
                                definition
                                    .positiveNegative
                                    ? this.statusColor(
                                        item.value,
                                        true
                                    )
                                    : "var(--color-primary)";

                            return `

                                <div class="atlas-analysis-bar-column">

                                    <small
                                        style="
                                            color:${color};
                                        "
                                    >
                                        ${this.currency(
                                            item.value
                                        )}
                                    </small>

                                    <div
                                        class="atlas-analysis-bar"
                                        style="
                                            height:${height}px;
                                            background:${color};
                                            opacity:${
                                                item.value === 0
                                                    ? "0.25"
                                                    : "0.85"
                                            };
                                        "
                                    ></div>

                                    <strong>
                                        ${this.formatShortMonth(
                                            item.monthKey
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

    trendHighlights(
        trend,
        metric
    ) {

        const definition =
            this.metricDefinitions()[
                metric
            ] ||
            this.metricDefinitions()
                .savings;

        const values =
            trend.months.map(
                month => ({

                    monthKey:
                        month.monthKey,

                    value:
                        this.number(
                            month[
                                definition.property
                            ]
                        )

                })
            );

        const average =
            values.length > 0
                ? (
                    values.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            item.value,
                        0
                    ) /
                    values.length
                )
                : 0;

        const maximum =
            values.reduce(
                (
                    current,
                    item
                ) =>
                    !current ||
                    item.value >
                        current.value
                        ? item
                        : current,
                null
            );

        const minimum =
            values.reduce(
                (
                    current,
                    item
                ) =>
                    !current ||
                    item.value <
                        current.value
                        ? item
                        : current,
                null
            );

        const latest =
            values[
                values.length - 1
            ] || null;

        return `

            <section class="atlas-analysis-grid">

                ${this.highlightCard(
                    "Media",
                    average,
                    `${trend.period} meses`
                )}

                ${this.highlightCard(
                    "Último dato",
                    latest?.value || 0,
                    latest
                        ? this.formatMonth(
                            latest.monthKey
                        )
                        : "Sin datos"
                )}

                ${this.highlightCard(
                    "Máximo",
                    maximum?.value || 0,
                    maximum
                        ? this.formatMonth(
                            maximum.monthKey
                        )
                        : "Sin datos"
                )}

                ${this.highlightCard(
                    "Mínimo",
                    minimum?.value || 0,
                    minimum
                        ? this.formatMonth(
                            minimum.monthKey
                        )
                        : "Sin datos"
                )}

            </section>

        `;

    },

    highlightCard(
        label,
        value,
        subtitle
    ) {

        return `

            <article class="atlas-analysis-metric">

                <div class="atlas-analysis-metric-label">
                    ${label}
                </div>

                <strong class="atlas-analysis-metric-value">
                    ${this.currency(
                        value
                    )}
                </strong>

                <small class="note">
                    ${subtitle}
                </small>

            </article>

        `;

    },

    trendsView(
        data,
        options
    ) {

        const period =
            this.number(
                options.trendsPeriod
            ) || 6;

        const metric =
            options.trendMetric ||
            "savings";

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const trend =
            AtlasCalculations
                .trendSummary(
                    data,
                    period,
                    currentMonth
                );

        const definition =
            this.metricDefinitions()[
                metric
            ] ||
            this.metricDefinitions()
                .savings;

        return `

            ${this.periodSelector(
                period
            )}

            ${this.metricSelector(
                metric
            )}

            <section class="panel atlas-analysis-panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Evolución de
                            ${definition.label.toLowerCase()}
                        </h2>

                        <p class="note">
                            ${this.formatMonth(
                                trend.startMonthKey
                            )}
                            —
                            ${this.formatMonth(
                                trend.endMonthKey
                            )}
                        </p>

                    </div>

                </div>

                ${this.trendChart(
                    trend,
                    metric
                )}

            </section>

            ${this.trendHighlights(
                trend,
                metric
            )}

            <section class="panel atlas-analysis-panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Categorías del periodo
                        </h2>

                        <p class="note">
                            Gastos acumulados
                        </p>

                    </div>

                    <strong>
                        ${this.currency(
                            trend.totals.expenses
                        )}
                    </strong>

                </div>

                ${this.categoryRows(
                    trend.categories
                )}

            </section>

        `;

    },

    render(
        data,
        options = {}
    ) {

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
                    Entiende la evolución de tus finanzas.
                </p>

                ${this.tabs(
                    activeView
                )}

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

        if (
            document.getElementById(
                "atlas-analysis-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-analysis-styles";

        style.textContent = `

            .atlas-analysis-app {
                padding-bottom:
                    calc(
                        110px +
                        env(
                            safe-area-inset-bottom
                        )
                    );
            }

            .atlas-analysis-tabs,
            .atlas-analysis-period {
                display: grid;
                gap: 8px;
                padding: 5px;
                margin-bottom: 16px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 18px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.04
                    );
            }

            .atlas-analysis-tabs {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .atlas-analysis-period {
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
            }

            .atlas-analysis-tabs button,
            .atlas-analysis-period button {
                min-height: 44px;
                border-radius: 14px;
                color:
                    var(
                        --color-text-muted
                    );
                background: transparent;
                font-weight: 750;
            }

            .atlas-analysis-tabs button.active,
            .atlas-analysis-period button.active {
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

            .atlas-analysis-hero {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 18px;
                min-height: 0;
                margin-bottom: 14px;
                padding: 19px;
            }

            .atlas-analysis-hero .value {
                margin-top: 7px;
                font-size: 34px;
                line-height: 1;
            }

            .atlas-analysis-hero .trend {
                margin-top: 8px;
                font-size: 11px;
            }

            .atlas-analysis-rate {
                flex: 0 0 auto;
                padding: 10px 12px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 16px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
                text-align: right;
            }

            .atlas-analysis-rate small,
            .atlas-analysis-rate strong {
                display: block;
            }

            .atlas-analysis-rate small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-analysis-rate strong {
                margin-top: 5px;
                font-size: 18px;
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

            .atlas-analysis-metric-label {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 11px;
            }

            .atlas-analysis-metric-value {
                display: block;
                margin-top: 7px;
                overflow: hidden;
                font-size: 20px;
                line-height: 1.05;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-analysis-metric small {
                display: block;
                margin-top: 6px;
                font-size: 10px;
            }

            .atlas-analysis-panel {
                margin-bottom: 14px;
            }

            .atlas-analysis-budget-values {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 8px;
                margin-top: 15px;
            }

            .atlas-analysis-budget-values div {
                min-width: 0;
            }

            .atlas-analysis-budget-values small,
            .atlas-analysis-budget-values strong {
                display: block;
            }

            .atlas-analysis-budget-values small {
                font-size: 9px;
            }

            .atlas-analysis-budget-values strong {
                margin-top: 4px;
                overflow: hidden;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-analysis-progress {
                height: 7px;
                margin-top: 12px;
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
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-analysis-status {
                display: block;
                margin-top: 8px;
                font-size: 11px;
            }

            .atlas-analysis-categories {
                margin-top: 8px;
            }

            .atlas-analysis-category {
                padding: 13px 0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-category:last-child {
                border-bottom: 0;
            }

            .atlas-analysis-category-head {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 14px;
            }

            .atlas-analysis-category-head div {
                min-width: 0;
            }

            .atlas-analysis-category-head small {
                display: block;
                margin-top: 4px;
                font-size: 10px;
            }

            .atlas-analysis-category-head
            > strong {
                flex: 0 0 auto;
                font-size: 14px;
            }

            .atlas-analysis-summary-list {
                margin-top: 8px;
            }

            .atlas-analysis-summary-list > div {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 14px;
                padding: 14px 0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-analysis-summary-list
            > div:last-child {
                border-bottom: 0;
            }

            .atlas-analysis-summary-list span {
                color:
                    var(
                        --color-text-muted
                    );
            }

            .atlas-analysis-empty {
                padding: 28px 12px;
                text-align: center;
            }

            .atlas-analysis-empty > div {
                margin-bottom: 8px;
                font-size: 28px;
            }

            .atlas-analysis-empty p {
                margin-top: 7px;
            }

            .atlas-analysis-selector {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 14px;
            }

            .atlas-analysis-selector span {
                padding-left: 3px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 11px;
                font-weight: 700;
            }

            .atlas-analysis-selector select {
                width: 100%;
                min-height: 52px;
                padding: 0 15px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.2
                    );
                border-radius: 16px;
                outline: none;
                background: #19243a;
                color: #f7f8fc;
                font-size: 16px;
            }

            .atlas-analysis-chart {
                display: grid;
                grid-template-columns:
                    repeat(
                        var(
                            --atlas-analysis-bars,
                            6
                        ),
                        minmax(
                            42px,
                            1fr
                        )
                    );
                align-items: end;
                gap: 9px;
                min-height: 225px;
                padding-top: 18px;
                overflow-x: auto;
            }

            .atlas-analysis-bar-column {
                min-width: 42px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }

            .atlas-analysis-bar-column small {
                font-size: 9px;
                white-space: nowrap;
            }

            .atlas-analysis-bar-column strong {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-analysis-bar {
                width: 32px;
                border-radius:
                    9px
                    9px
                    4px
                    4px;
            }

        `;

        document.head.appendChild(
            style
        );

    },

    bindMetricSelector() {

        const selector =
            document.getElementById(
                "atlas-analysis-metric"
            );

        if (!selector) {

            return;

        }

        selector.addEventListener(
            "change",
            event => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.dataset.action =
                    "setTrendMetric";

                button.dataset.metric =
                    event.target.value;

                button.style.display =
                    "none";

                document.body.appendChild(
                    button
                );

                button.click();
                button.remove();

            }
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

            this.bindMetricSelector();

            const chart =
                app.querySelector(
                    ".atlas-analysis-chart"
                );

            if (chart) {

                const columns =
                    chart.children.length;

                chart.style.setProperty(
                    "--atlas-analysis-bars",
                    Math.max(
                        1,
                        columns
                    )
                );

            }

        };

    }

};

AtlasAnalysisUI.init();

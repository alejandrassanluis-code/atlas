/* ==========================================================
   ATLAS
   ui.js
   Sprint 3.4 — Ajustes, tendencias y snapshots
========================================================== */

const AtlasUI = {

    _toastTimer: null,

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(
            Number(value) || 0
        );

    },

    formatPercent(value) {

        return `${(
            Number(value) || 0
        ).toFixed(1)}%`;

    },

    escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    },

    shortDate() {

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day: "numeric",
                month: "short"
            }
        )
            .format(new Date())
            .replace(".", "");

    },

    currentMonth() {

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                month: "long"
            }
        )
            .format(new Date())
            .toUpperCase();

    },

    formatMonthKey(monthKey) {

        const [
            year,
            month
        ] = String(monthKey || "")
            .split("-")
            .map(Number);

        if (!year || !month) {
            return "";
        }

        const label =
            new Intl.DateTimeFormat(
                "es-ES",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(
                new Date(
                    year,
                    month - 1,
                    1
                )
            );

        return (
            label.charAt(0).toUpperCase() +
            label.slice(1)
        );

    },

    formatShortMonth(monthKey) {

        const [
            year,
            month
        ] = String(monthKey || "")
            .split("-")
            .map(Number);

        if (!year || !month) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                month: "short"
            }
        )
            .format(
                new Date(
                    year,
                    month - 1,
                    1
                )
            )
            .replace(".", "")
            .toUpperCase();

    },

    formatMovementDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(
                `${dateString}T12:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateString;
        }

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        )
            .format(date)
            .replace(".", "");

    },

    header() {

        return `

            <header class="header">

                <div class="brand">

                    <div class="logo">
                        A
                    </div>

                    <div>

                        <b>
                            ATLAS
                        </b>

                        <small>
                            ${this.shortDate()}
                        </small>

                    </div>

                </div>

                <button
                    class="iconbtn"
                    type="button"
                    data-action="openSettings"
                    aria-label="Abrir ajustes"
                    style="
                        width:46px;
                        height:46px;
                        font-size:23px;
                    "
                >
                    ⚙︎
                </button>

            </header>

        `;

    },

    monthSelector({
        monthKey,
        isCurrentMonth,
        previousAction,
        nextAction,
        currentAction,
        subtitle
    }) {

        return `

            <section
                class="panel"
                style="
                    padding:12px 14px;
                    margin-bottom:18px;
                "
            >

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            46px
                            minmax(0,1fr)
                            46px;
                        align-items:center;
                        gap:10px;
                    "
                >

                    <button
                        class="iconbtn"
                        type="button"
                        data-action="${previousAction}"
                        aria-label="Mes anterior"
                        style="
                            width:46px;
                            height:46px;
                            font-size:28px;
                        "
                    >
                        ‹
                    </button>

                    <div
                        style="
                            text-align:center;
                            min-width:0;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                font-size:17px;
                            "
                        >
                            ${this.formatMonthKey(
                                monthKey
                            )}
                        </strong>

                        <small class="note">
                            ${subtitle}
                        </small>

                    </div>

                    <button
                        class="iconbtn"
                        type="button"
                        data-action="${nextAction}"
                        aria-label="Mes siguiente"
                        ${
                            isCurrentMonth
                                ? "disabled"
                                : ""
                        }
                        style="
                            width:46px;
                            height:46px;
                            font-size:28px;
                            opacity:${
                                isCurrentMonth
                                    ? "0.35"
                                    : "1"
                            };
                        "
                    >
                        ›
                    </button>

                </div>

                ${
                    !isCurrentMonth
                        ? `

                            <button
                                class="secondary"
                                type="button"
                                data-action="${currentAction}"
                                style="
                                    width:100%;
                                    margin-top:10px;
                                "
                            >
                                Volver al mes actual
                            </button>

                        `
                        : ""
                }

            </section>

        `;

    },

    analysisTabs(activeView) {

        return `

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0,1fr)
                        );
                    gap:8px;
                    padding:5px;
                    margin-bottom:18px;
                    border-radius:18px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.04
                        );
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.14
                        );
                "
            >

                <button
                    type="button"
                    data-action="showMonthlyAnalysis"
                    style="
                        min-height:46px;
                        border-radius:14px;
                        font-weight:700;
                        color:${
                            activeView === "monthly"
                                ? "#ffffff"
                                : "var(--color-text-muted)"
                        };
                        background:${
                            activeView === "monthly"
                                ? "rgba(77,163,255,0.18)"
                                : "transparent"
                        };
                        border:${
                            activeView === "monthly"
                                ? "1px solid rgba(77,163,255,0.25)"
                                : "1px solid transparent"
                        };
                    "
                >
                    Mensual
                </button>

                <button
                    type="button"
                    data-action="showTrendsAnalysis"
                    style="
                        min-height:46px;
                        border-radius:14px;
                        font-weight:700;
                        color:${
                            activeView === "trends"
                                ? "#ffffff"
                                : "var(--color-text-muted)"
                        };
                        background:${
                            activeView === "trends"
                                ? "rgba(77,163,255,0.18)"
                                : "transparent"
                        };
                        border:${
                            activeView === "trends"
                                ? "1px solid rgba(77,163,255,0.25)"
                                : "1px solid transparent"
                        };
                    "
                >
                    Tendencias
                </button>

            </div>

        `;

    },

    investmentProfitability(summary) {

        const invested =
            Number(
                summary.investedCapital
            ) || 0;

        const gain =
            Number(
                summary.investmentGain
            ) || 0;

        if (invested <= 0) {
            return 0;
        }

        return (
            gain /
            invested
        ) * 100;

    },

    savingsStatus(data) {

        const calendarConfigured =
            data.settings
                ?.financialCalendarConfigured ===
            true;

        if (!calendarConfigured) {

            return {
                label:
                    "Mes en curso",
                color:
                    "var(--color-text-muted)"
            };

        }

        return {
            label:
                "Calendario activo",
            color:
                "var(--color-success)"
        };

    },

    atlasMessage(data, summary) {

        if (
            summary.liquidity === 0 &&
            summary.investments === 0 &&
            summary.debt === 0 &&
            data.movements.length === 0
        ) {
            return "Configura Atlas para empezar.";
        }

        if (
            summary.monthlySavings < 0
        ) {
            return "Este mes has gastado e invertido más de lo que has ingresado.";
        }

        if (
            summary.monthlySavings === 0
        ) {
            return "Ingresos, gastos e inversiones están equilibrados este mes.";
        }

        return "Atlas está registrando la evolución del mes.";

    },

    dashboard(data) {

        const summary =
            AtlasCalculations
                .financialSummary(
                    data
                );

        const profitability =
            this.investmentProfitability(
                summary
            );

        const savingsStatus =
            this.savingsStatus(data);

        const investmentNote =
            summary.investedCapital > 0
                ? `${
                    profitability >= 0
                        ? "+"
                        : ""
                }${this.formatPercent(
                    profitability
                )}`
                : "Sin aportaciones";

        return `

            <div class="app">

                ${this.header()}

                <section
                    class="hero"
                    style="
                        padding:20px 24px;
                        margin-bottom:18px;
                    "
                >

                    <div class="eyebrow">
                        Patrimonio neto
                    </div>

                    <div
                        class="value"
                        style="
                            margin-top:8px;
                            font-size:42px;
                        "
                    >
                        ${this.formatCurrency(
                            summary.netWorth
                        )}
                    </div>

                    <div
                        class="trend"
                        style="margin-top:8px"
                    >
                        Tu situación financiera actual
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
                        gap:12px;
                        margin-top:18px;
                        margin-bottom:14px;
                    "
                >

                    <button
                        class="card"
                        type="button"
                        data-route="analysis"
                        style="
                            text-align:left;
                            min-width:0;
                            padding:16px;
                        "
                    >

                        <div class="label">
                            💵 Liquidez
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.liquidity
                            )}
                        </div>

                        <div class="note">
                            Disponible
                        </div>

                    </button>

                    <button
                        class="card"
                        type="button"
                        data-route="analysis"
                        style="
                            text-align:left;
                            min-width:0;
                            padding:16px;
                        "
                    >

                        <div class="label">
                            📈 Inversiones
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.investments
                            )}
                        </div>

                        <div class="note">
                            ${investmentNote}
                        </div>

                    </button>

                    <button
                        class="card"
                        type="button"
                        data-route="analysis"
                        style="
                            text-align:left;
                            min-width:0;
                            padding:16px;
                        "
                    >

                        <div class="label">
                            💳 Deuda
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.debt
                            )}
                        </div>

                        <div class="note">
                            ${
                                summary.debt > 0
                                    ? "Pendiente"
                                    : "Sin deuda"
                            }
                        </div>

                    </button>

                    <button
                        class="card"
                        type="button"
                        data-route="analysis"
                        style="
                            text-align:left;
                            min-width:0;
                            padding:16px;
                        "
                    >

                        <div class="label">
                            🐷 Ahorro
                            ${this.currentMonth()}
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.monthlySavings
                            )}
                        </div>

                        <div
                            class="note"
                            style="
                                color:
                                    ${savingsStatus.color};
                            "
                        >
                            ${savingsStatus.label}
                        </div>

                    </button>

                </div>

                <section
                    class="panel"
                    style="
                        padding:16px 18px;
                        margin-top:12px;
                    "
                >

                    <div class="insight">

                        <div class="badge">
                            ✨
                        </div>

                        <div>

                            <div class="label">
                                Atlas
                            </div>

                            <p
                                class="note"
                                style="margin-top:5px"
                            >
                                ${this.atlasMessage(
                                    data,
                                    summary
                                )}
                            </p>

                        </div>

                    </div>

                </section>

            </div>

        `;

    },

    movementLabel(movement) {

        if (
            movement.kind ===
            "debt_payment"
        ) {
            return "Pago de deuda";
        }

        const labels = {
            income:
                "Ingreso",
            expense:
                "Gasto",
            transfer:
                "Traspaso",
            investment:
                "Inversión"
        };

        return (
            labels[movement.type] ||
            "Movimiento"
        );

    },

    movementAmount(movement) {

        if (
            movement.type ===
            "income"
        ) {
            return `+${this.formatCurrency(
                movement.amount
            )}`;
        }

        if (
            movement.type ===
            "transfer"
        ) {
            return this.formatCurrency(
                movement.amount
            );
        }

        return `−${this.formatCurrency(
            movement.amount
        )}`;

    },

    movementColor(movement) {

        if (
            movement.type ===
            "income"
        ) {
            return "var(--color-success)";
        }

        if (
            movement.type ===
            "transfer"
        ) {
            return "var(--color-primary)";
        }

        return "var(--color-danger)";

    },

    movements(
        data,
        options = {}
    ) {

        const movementsMonth =
            options.movementsMonth ||
            AtlasCalculations.monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const isCurrentMonth =
            movementsMonth ===
            currentMonth;

        const list =
            data.movements
                .filter(
                    movement =>
                        String(
                            movement.date || ""
                        ).slice(0, 7) ===
                        movementsMonth
                )
                .sort(
                    (a, b) => {

                        const dateComparison =
                            String(
                                b.date || ""
                            ).localeCompare(
                                String(
                                    a.date || ""
                                )
                            );

                        if (
                            dateComparison !== 0
                        ) {
                            return dateComparison;
                        }

                        return String(
                            b.createdAt || ""
                        ).localeCompare(
                            String(
                                a.createdAt || ""
                            )
                        );

                    }
                );

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Movimientos
                </h1>

                <p class="subtitle">
                    Consulta y edita las operaciones de cada mes.
                </p>

                ${this.monthSelector({
                    monthKey:
                        movementsMonth,

                    isCurrentMonth,

                    previousAction:
                        "previousMovementsMonth",

                    nextAction:
                        "nextMovementsMonth",

                    currentAction:
                        "currentMovementsMonth",

                    subtitle:
                        `${list.length} ${
                            list.length === 1
                                ? "movimiento"
                                : "movimientos"
                        }`
                })}

                <section class="panel">

                    ${
                        list.length === 0
                            ? `

                                <div
                                    style="
                                        text-align:center;
                                        padding:28px 14px;
                                    "
                                >

                                    <div
                                        style="
                                            font-size:30px;
                                            margin-bottom:10px;
                                        "
                                    >
                                        🗓️
                                    </div>

                                    <strong>
                                        Sin movimientos
                                    </strong>

                                    <p
                                        class="note"
                                        style="
                                            margin-top:8px;
                                        "
                                    >
                                        No hay actividad registrada en
                                        ${this.formatMonthKey(
                                            movementsMonth
                                        )}.
                                    </p>

                                </div>

                            `
                            : `

                                <div class="list">

                                    ${list
                                        .map(
                                            movement => `

                                                <button
                                                    class="row"
                                                    type="button"
                                                    data-movement-id="${
                                                        movement.id
                                                    }"
                                                    style="
                                                        width:100%;
                                                        border:0;
                                                        background:
                                                            transparent;
                                                        color:inherit;
                                                        text-align:left;
                                                        cursor:pointer;
                                                    "
                                                >

                                                    <div>

                                                        <b>
                                                            ${this.escapeHtml(
                                                                movement.category ||
                                                                this.movementLabel(
                                                                    movement
                                                                )
                                                            )}
                                                        </b>

                                                        <small>
                                                            ${this.formatMovementDate(
                                                                movement.date
                                                            )}
                                                            ·
                                                            ${this.movementLabel(
                                                                movement
                                                            )}
                                                        </small>

                                                        ${
                                                            movement.note
                                                                ? `

                                                                    <small>
                                                                        ${this.escapeHtml(
                                                                            movement.note
                                                                        )}
                                                                    </small>

                                                                `
                                                                : ""
                                                        }

                                                    </div>

                                                    <strong
                                                        style="
                                                            color:
                                                                ${this.movementColor(
                                                                    movement
                                                                )};
                                                            white-space:
                                                                nowrap;
                                                        "
                                                    >
                                                        ${this.movementAmount(
                                                            movement
                                                        )}
                                                    </strong>

                                                </button>

                                            `
                                        )
                                        .join("")}

                                </div>

                            `
                    }

                </section>

                <button
                    class="primary"
                    type="button"
                    data-action="newMovement"
                >
                    Nuevo movimiento
                </button>

            </div>

        `;

    },

    comparisonText(
        comparison,
        positiveIsGood = true
    ) {

        const difference =
            Number(
                comparison?.difference
            ) || 0;

        const percentage =
            comparison?.percentage;

        if (difference === 0) {

            return {
                icon:
                    "•",
                text:
                    "Sin cambios",
                color:
                    "var(--color-text-muted)"
            };

        }

        const isPositive =
            difference > 0;

        const isGood =
            positiveIsGood
                ? isPositive
                : !isPositive;

        const percentageText =
            percentage === null
                ? "Nuevo este mes"
                : `${
                    Math.abs(
                        percentage
                    ).toFixed(0)
                }%`;

        return {
            icon:
                isPositive
                    ? "↑"
                    : "↓",

            text:
                `${
                    this.formatCurrency(
                        Math.abs(
                            difference
                        )
                    )
                } · ${percentageText}`,

            color:
                isGood
                    ? "var(--color-success)"
                    : "var(--color-danger)"
        };

    },

    comparisonCard(
        label,
        comparison,
        positiveIsGood = true
    ) {

        const result =
            this.comparisonText(
                comparison,
                positiveIsGood
            );

        return `

            <div
                class="card"
                style="
                    min-width:0;
                    padding:16px;
                "
            >

                <div class="label">
                    ${label}
                </div>

                <div class="num">
                    ${this.formatCurrency(
                        comparison.current
                    )}
                </div>

                <div
                    class="note"
                    style="
                        color:${result.color};
                    "
                >
                    ${result.icon}
                    ${result.text}
                </div>

            </div>

        `;

    },

    categoryRows(categories) {

        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            return `

                <div
                    style="
                        text-align:center;
                        padding:24px 12px;
                    "
                >

                    <div
                        style="
                            font-size:28px;
                            margin-bottom:8px;
                        "
                    >
                        🧾
                    </div>

                    <strong>
                        Sin gastos por categoría
                    </strong>

                    <p
                        class="note"
                        style="
                            margin-top:8px;
                        "
                    >
                        Registra gastos para ver su distribución.
                    </p>

                </div>

            `;

        }

        const total =
            categories.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        return `

            <div class="list">

                ${categories
                    .map(
                        item => {

                            const percentage =
                                total > 0
                                    ? (
                                        Number(
                                            item.amount || 0
                                        ) /
                                        total
                                    ) * 100
                                    : 0;

                            return `

                                <div
                                    style="
                                        padding:14px 0;
                                        border-bottom:
                                            1px solid
                                            rgba(
                                                145,
                                                164,
                                                202,
                                                0.12
                                            );
                                    "
                                >

                                    <div
                                        style="
                                            display:flex;
                                            justify-content:
                                                space-between;
                                            align-items:center;
                                            gap:14px;
                                        "
                                    >

                                        <div
                                            style="
                                                min-width:0;
                                            "
                                        >

                                            <b>
                                                ${this.escapeHtml(
                                                    item.category
                                                )}
                                            </b>

                                            <small
                                                class="note"
                                                style="
                                                    display:block;
                                                    margin-top:3px;
                                                "
                                            >
                                                ${percentage.toFixed(0)}%
                                                del gasto
                                            </small>

                                        </div>

                                        <strong
                                            style="
                                                white-space:nowrap;
                                            "
                                        >
                                            ${this.formatCurrency(
                                                item.amount
                                            )}
                                        </strong>

                                    </div>

                                    <div
                                        class="progress"
                                        style="
                                            margin-top:10px;
                                        "
                                    >

                                        <i
                                            style="
                                                width:${
                                                    Math.min(
                                                        100,
                                                        percentage
                                                    )
                                                }%;
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

    monthlyAnalysis(
        data,
        options = {}
    ) {

        const analysisMonth =
            options.analysisMonth ||
            AtlasCalculations.monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const isCurrentMonth =
            analysisMonth ===
            currentMonth;

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

        const monthMovements =
            AtlasCalculations
                .movementsForMonth(
                    data,
                    analysisMonth
                );

        const savingComparison =
            this.comparisonText(
                comparison.savings,
                true
            );

        const rateComparison =
            this.comparisonText(
                comparison.savingRate,
                true
            );

        return `

            ${this.monthSelector({
                monthKey:
                    analysisMonth,

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
                        : "Histórico mensual"
            })}

            <section
                class="panel"
                style="
                    margin-bottom:18px;
                "
            >

                <div class="panelhead">

                    <div>

                        <h2>
                            Comparativa mensual
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Frente a
                            ${this.formatMonthKey(
                                comparison.previousMonthKey
                            )}
                        </p>

                    </div>

                </div>

                <div
                    class="grid"
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0,1fr)
                            );
                        gap:12px;
                        margin-top:14px;
                    "
                >

                    ${this.comparisonCard(
                        "🟢 Ingresos",
                        comparison.income,
                        true
                    )}

                    ${this.comparisonCard(
                        "🔴 Gastos",
                        comparison.expenses,
                        false
                    )}

                    ${this.comparisonCard(
                        "📈 Invertido",
                        comparison.invested,
                        true
                    )}

                    ${this.comparisonCard(
                        "💸 Salidas de caja",
                        comparison.cashOutflow,
                        false
                    )}

                </div>

            </section>

            <section class="panel">

                <div class="panelhead">

                    <h2>
                        Resultado del mes
                    </h2>

                </div>

                <div
                    class="list"
                    style="
                        margin-top:8px;
                    "
                >

                    <div class="row">

                        <div>

                            <b>
                                Ahorro mensual
                            </b>

                            <small>
                                Ingresos − gastos − inversión
                            </small>

                            <small
                                style="
                                    color:
                                        ${savingComparison.color};
                                    margin-top:4px;
                                "
                            >
                                ${savingComparison.icon}
                                ${savingComparison.text}
                            </small>

                        </div>

                        <strong
                            style="
                                color:${
                                    summary.monthlySavings >= 0
                                        ? "var(--color-success)"
                                        : "var(--color-danger)"
                                };
                            "
                        >
                            ${this.formatCurrency(
                                summary.monthlySavings
                            )}
                        </strong>

                    </div>

                    <div class="row">

                        <div>

                            <b>
                                Tasa de ahorro
                            </b>

                            <small>
                                Porcentaje sobre ingresos
                            </small>

                            <small
                                style="
                                    color:
                                        ${rateComparison.color};
                                    margin-top:4px;
                                "
                            >
                                ${rateComparison.icon}
                                ${rateComparison.text}
                            </small>

                        </div>

                        <strong>
                            ${this.formatPercent(
                                summary.monthlySavingRate
                            )}
                        </strong>

                    </div>

                    <div class="row">

                        <div>

                            <b>
                                Movimientos
                            </b>

                            <small>
                                Registros del mes
                            </small>

                        </div>

                        <strong>
                            ${monthMovements.length}
                        </strong>

                    </div>

                </div>

            </section>

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Gastos por categoría
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Distribución del consumo real
                        </p>

                    </div>

                </div>

                ${this.categoryRows(
                    comparison.categories
                )}

            </section>

        `;

    },

    trendPeriodSelector(activePeriod) {

        return `

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0,1fr)
                        );
                    gap:8px;
                    margin-bottom:14px;
                "
            >

                ${[
                    3,
                    6,
                    12
                ].map(period => `

                    <button
                        type="button"
                        data-action="setTrendsPeriod"
                        data-period="${period}"
                        style="
                            min-height:44px;
                            border-radius:14px;
                            font-weight:700;
                            color:${
                                activePeriod === period
                                    ? "#ffffff"
                                    : "var(--color-text-muted)"
                            };
                            background:${
                                activePeriod === period
                                    ? "rgba(77,163,255,0.18)"
                                    : "rgba(255,255,255,0.03)"
                            };
                            border:
                                1px solid
                                ${
                                    activePeriod === period
                                        ? "rgba(77,163,255,0.3)"
                                        : "rgba(145,164,202,0.12)"
                                };
                        "
                    >
                        ${period} meses
                    </button>

                `).join("")}

            </div>

        `;

    },

    trendMetricDefinitions() {

        return {

            savings: {
                label: "Ahorro",
                property: "savings",
                source: "movements",
                positiveNegative: true
            },

            income: {
                label: "Ingresos",
                property: "income",
                source: "movements"
            },

            expenses: {
                label: "Gastos",
                property: "expenses",
                source: "movements"
            },

            invested: {
                label: "Aportaciones",
                property: "invested",
                source: "movements"
            },

            cashOutflow: {
                label: "Salidas de caja",
                property: "cashOutflow",
                source: "movements"
            },

            liquidity: {
                label: "Liquidez",
                property: "liquidity",
                source: "snapshots",
                positiveNegative: true
            },

            investments: {
                label: "Valor inversiones",
                property: "investments",
                source: "snapshots",
                positiveNegative: true
            },

            debt: {
                label: "Deuda",
                property: "debt",
                source: "snapshots"
            },

            netWorth: {
                label: "Patrimonio neto",
                property: "netWorth",
                source: "snapshots",
                positiveNegative: true
            }

        };

    },

    trendMetricSelector(activeMetric) {

        const definitions =
            this.trendMetricDefinitions();

        return `

            <label
                style="
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                    margin-bottom:18px;
                "
            >

                <span
                    class="label"
                    style="
                        padding-left:3px;
                    "
                >
                    Variable
                </span>

                <select
                    id="trend-metric-selector"
                    style="
                        width:100%;
                        min-height:52px;
                        padding:0 15px;
                        border-radius:16px;
                        border:
                            1px solid
                            rgba(
                                145,
                                164,
                                202,
                                0.2
                            );
                        background:#19243a;
                        color:#f7f8fc;
                        font-size:16px;
                    "
                >

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

    snapshotForMonth(
        data,
        monthKey
    ) {

        if (
            !Array.isArray(
                data.snapshots
            )
        ) {
            return null;
        }

        return (
            data.snapshots.find(
                snapshot =>
                    snapshot.monthKey ===
                    monthKey
            ) ||
            null
        );

    },

    trendSeries(
        data,
        trend,
        metric
    ) {

        const definitions =
            this.trendMetricDefinitions();

        const definition =
            definitions[metric] ||
            definitions.savings;

        return trend.months.map(
            month => {

                if (
                    definition.source ===
                    "snapshots"
                ) {

                    const snapshot =
                        this.snapshotForMonth(
                            data,
                            month.monthKey
                        );

                    return {
                        monthKey:
                            month.monthKey,

                        value:
                            snapshot
                                ? Number(
                                    snapshot[
                                        definition.property
                                    ]
                                ) || 0
                                : null
                    };

                }

                return {
                    monthKey:
                        month.monthKey,

                    value:
                        Number(
                            month[
                                definition.property
                            ]
                        ) || 0
                };

            }
        );

    },

    trendChart(
        data,
        trend,
        metric
    ) {

        const definitions =
            this.trendMetricDefinitions();

        const definition =
            definitions[metric] ||
            definitions.savings;

        const series =
            this.trendSeries(
                data,
                trend,
                metric
            );

        const available =
            series.filter(
                item =>
                    item.value !== null
            );

        if (
            available.length === 0
        ) {

            return `

                <div
                    style="
                        text-align:center;
                        padding:34px 12px 24px;
                    "
                >

                    <div
                        style="
                            font-size:32px;
                            margin-bottom:10px;
                        "
                    >
                        📸
                    </div>

                    <strong>
                        Sin cierres mensuales
                    </strong>

                    <p
                        class="note"
                        style="
                            margin-top:8px;
                            line-height:1.5;
                        "
                    >
                        Guarda un cierre mensual desde Ajustes
                        para ver la evolución de
                        ${definition.label.toLowerCase()}.
                    </p>

                </div>

            `;

        }

        const maximum =
            Math.max(
                1,
                ...available.map(
                    item =>
                        Math.abs(
                            item.value
                        )
                )
            );

        return `

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            ${Math.max(
                                1,
                                series.length
                            )},
                            minmax(34px,1fr)
                        );
                    align-items:end;
                    gap:8px;
                    min-height:220px;
                    padding-top:18px;
                    overflow-x:auto;
                "
            >

                ${series
                    .map(
                        item => {

                            if (
                                item.value === null
                            ) {

                                return `

                                    <div
                                        style="
                                            min-width:34px;
                                            display:flex;
                                            flex-direction:column;
                                            align-items:center;
                                            justify-content:flex-end;
                                            gap:8px;
                                        "
                                    >

                                        <small class="note">
                                            —
                                        </small>

                                        <div
                                            style="
                                                width:100%;
                                                max-width:34px;
                                                height:5px;
                                                border-radius:99px;
                                                background:
                                                    rgba(
                                                        145,
                                                        164,
                                                        202,
                                                        0.18
                                                    );
                                            "
                                        ></div>

                                        <small
                                            class="note"
                                            style="
                                                font-size:10px;
                                            "
                                        >
                                            ${this.formatShortMonth(
                                                item.monthKey
                                            )}
                                        </small>

                                    </div>

                                `;

                            }

                            const height =
                                Math.max(
                                    item.value === 0
                                        ? 5
                                        : 16,
                                    (
                                        Math.abs(
                                            item.value
                                        ) /
                                        maximum
                                    ) * 132
                                );

                            const barColor =
                                definition
                                    .positiveNegative
                                    ? (
                                        item.value >= 0
                                            ? "var(--color-success)"
                                            : "var(--color-danger)"
                                    )
                                    : "var(--color-primary)";

                            return `

                                <div
                                    style="
                                        min-width:34px;
                                        display:flex;
                                        flex-direction:column;
                                        align-items:center;
                                        justify-content:flex-end;
                                        gap:8px;
                                    "
                                >

                                    <small
                                        style="
                                            color:${barColor};
                                            font-size:10px;
                                            white-space:nowrap;
                                        "
                                    >
                                        ${this.formatCurrency(
                                            item.value
                                        )}
                                    </small>

                                    <div
                                        style="
                                            width:100%;
                                            max-width:34px;
                                            height:${height}px;
                                            border-radius:
                                                10px 10px 4px 4px;
                                            background:${barColor};
                                            opacity:${
                                                item.value === 0
                                                    ? "0.25"
                                                    : "0.85"
                                            };
                                        "
                                    ></div>

                                    <small
                                        class="note"
                                        style="
                                            font-size:10px;
                                        "
                                    >
                                        ${this.formatShortMonth(
                                            item.monthKey
                                        )}
                                    </small>

                                </div>

                            `;

                        }
                    )
                    .join("")}

            </div>

        `;

    },

    trendAverage(
        data,
        trend,
        metric
    ) {

        const values =
            this.trendSeries(
                data,
                trend,
                metric
            )
                .filter(
                    item =>
                        item.value !== null
                )
                .map(
                    item =>
                        item.value
                );

        if (
            values.length === 0
        ) {
            return null;
        }

        return (
            values.reduce(
                (total, value) =>
                    total + value,
                0
            ) /
            values.length
        );

    },

    trendSummaryRows(
        data,
        trend,
        metric
    ) {

        const definition =
            this.trendMetricDefinitions()[
                metric
            ] ||
            this.trendMetricDefinitions()
                .savings;

        const series =
            this.trendSeries(
                data,
                trend,
                metric
            )
                .filter(
                    item =>
                        item.value !== null
                );

        const average =
            this.trendAverage(
                data,
                trend,
                metric
            );

        const latest =
            series.length > 0
                ? series[
                    series.length - 1
                ]
                : null;

        const highest =
            series.length > 0
                ? series.reduce(
                    (best, item) =>
                        item.value >
                        best.value
                            ? item
                            : best
                )
                : null;

        const lowest =
            series.length > 0
                ? series.reduce(
                    (worst, item) =>
                        item.value <
                        worst.value
                            ? item
                            : worst
                )
                : null;

        return `

            <div class="list">

                <div class="row">

                    <div>

                        <b>
                            Media del periodo
                        </b>

                        <small>
                            ${definition.label}
                        </small>

                    </div>

                    <strong>
                        ${
                            average === null
                                ? "—"
                                : this.formatCurrency(
                                    average
                                )
                        }
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Último dato
                        </b>

                        <small>
                            ${
                                latest
                                    ? this.formatMonthKey(
                                        latest.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong>
                        ${
                            latest
                                ? this.formatCurrency(
                                    latest.value
                                )
                                : "—"
                        }
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Máximo
                        </b>

                        <small>
                            ${
                                highest
                                    ? this.formatMonthKey(
                                        highest.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong>
                        ${
                            highest
                                ? this.formatCurrency(
                                    highest.value
                                )
                                : "—"
                        }
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Mínimo
                        </b>

                        <small>
                            ${
                                lowest
                                    ? this.formatMonthKey(
                                        lowest.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong>
                        ${
                            lowest
                                ? this.formatCurrency(
                                    lowest.value
                                )
                                : "—"
                        }
                    </strong>

                </div>

            </div>

        `;

    },

    trendsAnalysis(
        data,
        options = {}
    ) {

        const trendsPeriod =
            Number(
                options.trendsPeriod
            ) || 6;

        const trendMetric =
            options.trendMetric ||
            "savings";

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const trend =
            AtlasCalculations
                .trendSummary(
                    data,
                    trendsPeriod,
                    currentMonth
                );

        const definition =
            this.trendMetricDefinitions()[
                trendMetric
            ] ||
            this.trendMetricDefinitions()
                .savings;

        return `

            ${this.trendPeriodSelector(
                trendsPeriod
            )}

            ${this.trendMetricSelector(
                trendMetric
            )}

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Evolución de
                            ${definition.label.toLowerCase()}
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            ${
                                this.formatMonthKey(
                                    trend.startMonthKey
                                )
                            }
                            —
                            ${
                                this.formatMonthKey(
                                    trend.endMonthKey
                                )
                            }
                        </p>

                    </div>

                </div>

                ${this.trendChart(
                    data,
                    trend,
                    trendMetric
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <h2>
                        Resumen de la variable
                    </h2>

                </div>

                ${this.trendSummaryRows(
                    data,
                    trend,
                    trendMetric
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Categorías del periodo
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Gastos acumulados
                        </p>

                    </div>

                </div>

                ${this.categoryRows(
                    trend.categories
                )}

            </section>

        `;

    },

    analysis(
        data,
        options = {}
    ) {

        const activeView =
            options.analysisView ||
            "monthly";

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Análisis
                </h1>

                <p class="subtitle">
                    Consulta un mes concreto o la evolución de varios meses.
                </p>

                ${this.analysisTabs(
                    activeView
                )}

                ${
                    activeView === "trends"
                        ? this.trendsAnalysis(
                            data,
                            options
                        )
                        : this.monthlyAnalysis(
                            data,
                            options
                        )
                }

            </div>

        `;

    },

    ai(data) {

        const summary =
            AtlasCalculations
                .financialSummary(
                    data
                );

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Atlas IA
                </h1>

                <p class="subtitle">
                    Interpretación, predicciones y recomendaciones financieras.
                </p>

                <section
                    class="hero"
                    style="
                        padding:22px;
                        margin-bottom:18px;
                    "
                >

                    <div
                        style="
                            font-size:30px;
                            margin-bottom:12px;
                        "
                    >
                        ✦
                    </div>

                    <div class="eyebrow">
                        Primer análisis
                    </div>

                    <div
                        style="
                            margin-top:10px;
                            font-size:18px;
                            line-height:1.5;
                        "
                    >
                        ${this.atlasMessage(
                            data,
                            summary
                        )}
                    </div>

                </section>

                <section class="panel">

                    <div class="panelhead">

                        <h2>
                            Próximamente
                        </h2>

                    </div>

                    <div class="list">

                        <div class="row">

                            <div>

                                <b>
                                    Resumen inteligente
                                </b>

                                <small>
                                    Qué ha ocurrido y por qué
                                </small>

                            </div>

                            <span>
                                ✨
                            </span>

                        </div>

                        <div class="row">

                            <div>

                                <b>
                                    Predicción de cierre
                                </b>

                                <small>
                                    Ahorro estimado al final del mes
                                </small>

                            </div>

                            <span>
                                🔮
                            </span>

                        </div>

                        <div class="row">

                            <div>

                                <b>
                                    Preguntas financieras
                                </b>

                                <small>
                                    Consulta tus datos con lenguaje natural
                                </small>

                            </div>

                            <span>
                                💬
                            </span>

                        </div>

                    </div>

                </section>

            </div>

        `;

    },

    render(
        route,
        data,
        options = {}
    ) {

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        switch (route) {

            case "movements":

                app.innerHTML =
                    this.movements(
                        data,
                        options
                    );

                break;

            case "analysis":

                app.innerHTML =
                    this.analysis(
                        data,
                        options
                    );

                break;

            case "ai":

                app.innerHTML =
                    this.ai(data);

                break;

            default:

                app.innerHTML =
                    this.dashboard(data);

        }

        document
            .querySelectorAll(
                ".tabbar button[data-route]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.route ===
                            route
                    );

                }
            );

        this.bindDynamicControls();

    },

    bindDynamicControls() {

        const trendSelector =
            document.getElementById(
                "trend-metric-selector"
            );

        if (trendSelector) {

            trendSelector.addEventListener(
                "change",
                event => {

                    const metric =
                        event.target.value;

                    const virtualButton =
                        document.createElement(
                            "button"
                        );

                    virtualButton.dataset.action =
                        "setTrendMetric";

                    virtualButton.dataset.metric =
                        metric;

                    virtualButton.style.display =
                        "none";

                    document.body.appendChild(
                        virtualButton
                    );

                    virtualButton.click();

                    virtualButton.remove();

                }
            );

        }

    },

    toast(message) {

        const root =
            document.getElementById(
                "toast-root"
            );

        if (!root) {
            return;
        }

        root.innerHTML = `

            <div class="toast">
                ${this.escapeHtml(message)}
            </div>

        `;

        clearTimeout(
            this._toastTimer
        );

        this._toastTimer =
            setTimeout(
                () => {

                    root.innerHTML = "";

                },
                2500
            );

    },

    confirm(title, message) {

        return window.confirm(
            `${title}\n\n${message}`
        );

    },

    loading(show = true) {

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        app.style.opacity =
            show
                ? "0.55"
                : "1";

    }

};

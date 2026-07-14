/* ==========================================================
   ATLAS
   ui.js
   Sprint 3.2 — Comparativas mensuales y categorías
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

        if (
            !year ||
            !month
        ) {
            return "";
        }

        const date =
            new Date(
                year,
                month - 1,
                1
            );

        const label =
            new Intl.DateTimeFormat(
                "es-ES",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(date);

        return (
            label.charAt(0).toUpperCase() +
            label.slice(1)
        );

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
                    data-route="settings"
                    aria-label="Abrir ajustes"
                >
                    ⚙︎
                </button>

            </header>

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
                label: "Mes en curso",
                color:
                    "var(--color-text-muted)"
            };

        }

        return {
            label: "Calendario activo",
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

    settings(data) {

        const liquidity =
            data.accounts.filter(
                account =>
                    account.group ===
                    "liquidity"
            );

        const investments =
            data.accounts.filter(
                account =>
                    account.group ===
                    "investment"
            );

        const debts =
            data.accounts.filter(
                account =>
                    account.group ===
                    "debt"
            );

        const renderGroup =
            (
                title,
                accounts
            ) => `

                <div class="group-title">
                    ${title}
                </div>

                ${accounts
                    .map(
                        account => `

                            <div class="account">

                                <div class="accounttop">

                                    <div>

                                        <strong>
                                            ${this.escapeHtml(
                                                account.name
                                            )}
                                        </strong>

                                        <div class="note">
                                            ${this.escapeHtml(
                                                account.type
                                            )}
                                        </div>

                                    </div>

                                    <div class="balance">
                                        ${this.formatCurrency(
                                            account.balance
                                        )}
                                    </div>

                                </div>

                            </div>

                        `
                    )
                    .join("")}

            `;

        const hasMovements =
            Array.isArray(
                data.movements
            ) &&
            data.movements.length > 0;

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Ajustes
                </h1>

                <p class="subtitle">
                    Consulta tus cuentas y objetivo de ahorro.
                </p>

                ${renderGroup(
                    "💵 Liquidez",
                    liquidity
                )}

                ${renderGroup(
                    "📈 Inversiones",
                    investments
                )}

                ${renderGroup(
                    "💳 Deudas",
                    debts
                )}

                <section class="panel">

                    <div class="panelhead">

                        <h2>
                            Objetivo de ahorro
                        </h2>

                    </div>

                    <div class="goal">

                        <div class="goalrow">

                            <span>
                                Objetivo mensual
                            </span>

                            <strong>
                                ${
                                    data.settings
                                        .monthlySavingGoal
                                }%
                            </strong>

                        </div>

                        <div class="progress">

                            <i
                                style="
                                    width:${
                                        Math.min(
                                            100,
                                            Number(
                                                data.settings
                                                    .monthlySavingGoal
                                            ) || 0
                                        )
                                    }%;
                                "
                            ></i>

                        </div>

                    </div>

                </section>

                <button
                    class="primary"
                    type="button"
                    data-action="editAccounts"
                >
                    ${
                        hasMovements
                            ? "Saldos calculados por Atlas"
                            : "Editar saldos iniciales"
                    }
                </button>

                ${
                    hasMovements
                        ? `

                            <p
                                class="note"
                                style="
                                    text-align:center;
                                    margin-top:12px;
                                "
                            >
                                Los saldos se actualizan mediante movimientos.
                            </p>

                        `
                        : ""
                }

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
            income: "Ingreso",
            expense: "Gasto",
            transfer: "Traspaso",
            investment: "Inversión"
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

    movements(data) {

        const list =
            [...data.movements]
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
                    Toca un movimiento para editarlo o eliminarlo.
                </p>

                <section class="panel">

                    ${
                        list.length === 0
                            ? `

                                <div class="list">

                                    <div class="row">

                                        <div>

                                            <b>
                                                Todavía no hay movimientos
                                            </b>

                                            <small>
                                                Aquí aparecerá tu actividad financiera.
                                            </small>

                                        </div>

                                    </div>

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
                icon: "•",
                text: "Sin cambios",
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

    analysis(data, options = {}) {

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

        const categories =
            comparison.categories;

        const savingRate =
            summary.monthlyIncome > 0
                ? summary.monthlySavingRate
                : 0;

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

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Análisis
                </h1>

                <p class="subtitle">
                    Consulta los datos y comparativas de cada mes.
                </p>

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
                                44px
                                minmax(0,1fr)
                                44px;
                            align-items:center;
                            gap:10px;
                        "
                    >

                        <button
                            class="iconbtn"
                            type="button"
                            data-action="previousAnalysisMonth"
                            aria-label="Mes anterior"
                            style="
                                width:44px;
                                height:44px;
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
                                    analysisMonth
                                )}
                            </strong>

                            <small class="note">
                                ${
                                    isCurrentMonth
                                        ? "Mes actual"
                                        : `${monthMovements.length} movimientos`
                                }
                            </small>

                        </div>

                        <button
                            class="iconbtn"
                            type="button"
                            data-action="nextAnalysisMonth"
                            aria-label="Mes siguiente"
                            ${
                                isCurrentMonth
                                    ? "disabled"
                                    : ""
                            }
                            style="
                                width:44px;
                                height:44px;
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
                                    data-action="currentAnalysisMonth"
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
                                    frente al mes anterior
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
                                    frente al mes anterior
                                </small>

                            </div>

                            <strong>
                                ${this.formatPercent(
                                    savingRate
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
                        categories
                    )}

                </section>

                ${
                    monthMovements.length === 0
                        ? `

                            <section
                                class="panel"
                                style="
                                    margin-top:14px;
                                    text-align:center;
                                    padding:24px 18px;
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
                                        analysisMonth
                                    )}.
                                </p>

                            </section>

                        `
                        : ""
                }

                ${
                    isCurrentMonth
                        ? `

                            <section class="panel">

                                <div class="panelhead">

                                    <h2>
                                        Situación actual
                                    </h2>

                                </div>

                                <div class="list">

                                    <div class="row">

                                        <div>

                                            <b>
                                                Liquidez
                                            </b>

                                            <small>
                                                Dinero disponible
                                            </small>

                                        </div>

                                        <strong>
                                            ${this.formatCurrency(
                                                summary.liquidity
                                            )}
                                        </strong>

                                    </div>

                                    <div class="row">

                                        <div>

                                            <b>
                                                Inversiones
                                            </b>

                                            <small>
                                                Valor actual
                                            </small>

                                        </div>

                                        <strong>
                                            ${this.formatCurrency(
                                                summary.investments
                                            )}
                                        </strong>

                                    </div>

                                    <div class="row">

                                        <div>

                                            <b>
                                                Deuda
                                            </b>

                                            <small>
                                                Saldo pendiente
                                            </small>

                                        </div>

                                        <strong>
                                            ${this.formatCurrency(
                                                summary.debt
                                            )}
                                        </strong>

                                    </div>

                                    <div class="row">

                                        <div>

                                            <b>
                                                Patrimonio neto
                                            </b>

                                            <small>
                                                Liquidez + inversiones − deuda
                                            </small>

                                        </div>

                                        <strong
                                            style="
                                                color:${
                                                    summary.netWorth >= 0
                                                        ? "var(--color-success)"
                                                        : "var(--color-danger)"
                                                };
                                            "
                                        >
                                            ${this.formatCurrency(
                                                summary.netWorth
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </section>

                        `
                        : ""
                }

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

            case "settings":

                app.innerHTML =
                    this.settings(data);

                break;

            case "movements":

                app.innerHTML =
                    this.movements(data);

                break;

            case "analysis":

                app.innerHTML =
                    this.analysis(
                        data,
                        options
                    );

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

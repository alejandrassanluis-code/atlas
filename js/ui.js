/* ==========================================================
   ATLAS
   ui.js
   Sprint 3.3 — Análisis mensual y tendencias
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
                    data-route="settings"
                    aria-label="Abrir ajustes"
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
                        data-action="${previousAction}"
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

            ${
                monthMovements.length === 0
                    ? `

                        <section
                            class="panel"
                            style="
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
                                Sin actividad registrada
                            </strong>

                            <p
                                class="note"
                                style="
                                    margin-top:8px;
                                "
                            >
                                No hay datos financieros en
                                ${this.formatMonthKey(
                                    analysisMonth
                                )}.
                            </p>

                        </section>

                    `
                    : ""
            }

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
                    margin-bottom:18px;
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

    trendMetricRows(trend) {

        return `

            <div class="list">

                <div class="row">

                    <div>

                        <b>
                            Ingresos medios
                        </b>

                        <small>
                            Promedio mensual
                        </small>

                    </div>

                    <strong>
                        ${this.formatCurrency(
                            trend.averages.income
                        )}
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Gastos medios
                        </b>

                        <small>
                            Promedio mensual
                        </small>

                    </div>

                    <strong>
                        ${this.formatCurrency(
                            trend.averages.expenses
                        )}
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Ahorro medio
                        </b>

                        <small>
                            Promedio mensual
                        </small>

                    </div>

                    <strong
                        style="
                            color:${
                                trend.averages.savings >= 0
                                    ? "var(--color-success)"
                                    : "var(--color-danger)"
                            };
                        "
                    >
                        ${this.formatCurrency(
                            trend.averages.savings
                        )}
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Tasa media de ahorro
                        </b>

                        <small>
                            Sobre los ingresos
                        </small>

                    </div>

                    <strong>
                        ${this.formatPercent(
                            trend.averages.savingRate
                        )}
                    </strong>

                </div>

            </div>

        `;

    },

    trendBars(
        months,
        property,
        positiveNegative = false
    ) {

        const values =
            months.map(
                month =>
                    Number(
                        month[property]
                    ) || 0
            );

        const maximum =
            Math.max(
                1,
                ...values.map(
                    value =>
                        Math.abs(value)
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
                                months.length
                            )},
                            minmax(26px,1fr)
                        );
                    align-items:end;
                    gap:8px;
                    min-height:190px;
                    padding-top:14px;
                    overflow-x:auto;
                "
            >

                ${months
                    .map(
                        month => {

                            const value =
                                Number(
                                    month[property]
                                ) || 0;

                            const height =
                                Math.max(
                                    value === 0
                                        ? 4
                                        : 14,
                                    (
                                        Math.abs(value) /
                                        maximum
                                    ) * 120
                                );

                            const barColor =
                                positiveNegative
                                    ? (
                                        value >= 0
                                            ? "var(--color-success)"
                                            : "var(--color-danger)"
                                    )
                                    : "var(--color-primary)";

                            return `

                                <div
                                    style="
                                        min-width:30px;
                                        display:flex;
                                        flex-direction:column;
                                        align-items:center;
                                        justify-content:flex-end;
                                        gap:7px;
                                    "
                                >

                                    <small
                                        style="
                                            color:
                                                ${barColor};
                                            font-size:10px;
                                            white-space:nowrap;
                                        "
                                    >
                                        ${this.formatCurrency(
                                            value
                                        )}
                                    </small>

                                    <div
                                        style="
                                            width:100%;
                                            max-width:34px;
                                            height:${height}px;
                                            border-radius:
                                                10px 10px 4px 4px;
                                            background:
                                                ${barColor};
                                            opacity:${
                                                value === 0
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
                                            month.monthKey
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

    trendHighlights(trend) {

        const best =
            trend.bestSavingsMonth;

        const worst =
            trend.worstSavingsMonth;

        const highestExpenses =
            trend.highestExpenseMonth;

        return `

            <div class="list">

                <div class="row">

                    <div>

                        <b>
                            Mejor mes de ahorro
                        </b>

                        <small>
                            ${
                                best
                                    ? this.formatMonthKey(
                                        best.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong
                        style="
                            color:
                                var(--color-success);
                        "
                    >
                        ${
                            best
                                ? this.formatCurrency(
                                    best.savings
                                )
                                : "—"
                        }
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Peor mes de ahorro
                        </b>

                        <small>
                            ${
                                worst
                                    ? this.formatMonthKey(
                                        worst.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong
                        style="
                            color:
                                var(--color-danger);
                        "
                    >
                        ${
                            worst
                                ? this.formatCurrency(
                                    worst.savings
                                )
                                : "—"
                        }
                    </strong>

                </div>

                <div class="row">

                    <div>

                        <b>
                            Mes con más gastos
                        </b>

                        <small>
                            ${
                                highestExpenses
                                    ? this.formatMonthKey(
                                        highestExpenses.monthKey
                                    )
                                    : "Sin datos"
                            }
                        </small>

                    </div>

                    <strong>
                        ${
                            highestExpenses
                                ? this.formatCurrency(
                                    highestExpenses.expenses
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

        const hasActivity =
            trend.months.some(
                month =>
                    month.movements > 0
            );

        return `

            ${this.trendPeriodSelector(
                trendsPeriod
            )}

            <section
                class="panel"
                style="
                    margin-bottom:18px;
                "
            >

                <div class="panelhead">

                    <div>

                        <h2>
                            Resumen del periodo
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

                ${this.trendMetricRows(
                    trend
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Evolución del ahorro
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Resultado mensual
                        </p>

                    </div>

                </div>

                ${this.trendBars(
                    trend.months,
                    "savings",
                    true
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Evolución de gastos
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Consumo real por mes
                        </p>

                    </div>

                </div>

                ${this.trendBars(
                    trend.months,
                    "expenses"
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Evolución de ingresos
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Ingresos registrados por mes
                        </p>

                    </div>

                </div>

                ${this.trendBars(
                    trend.months,
                    "income"
                )}

            </section>

            <section class="panel">

                <div class="panelhead">

                    <h2>
                        Meses destacados
                    </h2>

                </div>

                ${this.trendHighlights(
                    trend
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

            ${
                !hasActivity
                    ? `

                        <section
                            class="panel"
                            style="
                                text-align:center;
                                padding:26px 18px;
                            "
                        >

                            <div
                                style="
                                    font-size:30px;
                                    margin-bottom:10px;
                                "
                            >
                                📊
                            </div>

                            <strong>
                                Todavía no hay histórico
                            </strong>

                            <p
                                class="note"
                                style="
                                    margin-top:8px;
                                "
                            >
                                Las tendencias aparecerán cuando
                                existan movimientos en varios meses.
                            </p>

                        </section>

                    `
                    : ""
            }

            <section class="panel">

                <div class="panelhead">

                    <div>

                        <h2>
                            Patrimonio histórico
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:5px;
                            "
                        >
                            Pendiente de snapshots mensuales
                        </p>

                    </div>

                </div>

                <p class="note">
                    La evolución histórica de liquidez, inversiones,
                    deuda y patrimonio se añadirá cuando Atlas guarde
                    una fotografía de los saldos al cierre de cada mes.
                </p>

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

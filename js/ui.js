/* ==========================================================
   ATLAS
   ui.js
   Sprint 2.3 — Historial editable de movimientos
========================================================== */

const AtlasUI = {

    _toastTimer: null,

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0
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
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

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

    savingsStatus(data, summary) {

        const calendarConfigured =
            data.settings
                ?.financialCalendarConfigured ===
            true;

        if (!calendarConfigured) {

            return {
                label:
                    "Mes en curso",
                icon:
                    "",
                color:
                    "var(--color-text-muted)",
                objectiveProgress:
                    null
            };

        }

        const income =
            Number(
                summary.monthlyIncome
            ) || 0;

        const savings =
            Number(
                summary.monthlySavings
            ) || 0;

        const goalPercent =
            Number(
                data.settings
                    .monthlySavingGoal
            ) || 0;

        if (income <= 0) {

            return {
                label:
                    "Sin ingresos registrados",
                icon:
                    "⚪",
                color:
                    "var(--color-text-muted)",
                objectiveProgress:
                    0
            };

        }

        const targetSavings =
            income *
            (
                goalPercent /
                100
            );

        const plannedIncomeToDate =
            Number(
                data.settings
                    ?.plannedIncomeToDate
            ) || income;

        const plannedExpensesToDate =
            Number(
                data.settings
                    ?.plannedExpensesToDate
            ) || 0;

        const plannedInvestmentToDate =
            Number(
                data.settings
                    ?.plannedInvestmentToDate
            ) || 0;

        const expectedSavingsToday =
            plannedIncomeToDate -
            plannedExpensesToDate -
            plannedInvestmentToDate;

        const objectiveProgress =
            targetSavings > 0
                ? (
                    savings /
                    targetSavings
                ) * 100
                : 0;

        if (
            expectedSavingsToday <= 0
        ) {

            return {
                label:
                    "En línea",
                icon:
                    "🟢",
                color:
                    "var(--color-success)",
                objectiveProgress
            };

        }

        const pace =
            savings /
            expectedSavingsToday;

        if (pace >= 1.1) {

            return {
                label:
                    "Vas por delante",
                icon:
                    "🟢",
                color:
                    "var(--color-success)",
                objectiveProgress
            };

        }

        if (pace >= 0.9) {

            return {
                label:
                    "En línea",
                icon:
                    "🟢",
                color:
                    "var(--color-success)",
                objectiveProgress
            };

        }

        if (pace >= 0.75) {

            return {
                label:
                    "Vigila el gasto",
                icon:
                    "🟡",
                color:
                    "var(--color-warning)",
                objectiveProgress
            };

        }

        if (pace >= 0.5) {

            return {
                label:
                    "Ritmo insuficiente",
                icon:
                    "🟠",
                color:
                    "var(--color-warning)",
                objectiveProgress
            };

        }

        return {
            label:
                "Requiere atención",
            icon:
                "🔴",
            color:
                "var(--color-danger)",
            objectiveProgress
        };

    },

    atlasMessage(data, summary) {

        if (
            summary.liquidity === 0 &&
            summary.investments === 0 &&
            summary.debt === 0
        ) {
            return "Configura Atlas para empezar.";
        }

        const status =
            this.savingsStatus(
                data,
                summary
            );

        const messages = {

            "Mes en curso":
                "Atlas está registrando la evolución del mes.",

            "Sin ingresos registrados":
                "Registra tus ingresos para analizar el mes.",

            "Vas por delante":
                "Vas por delante del ritmo previsto este mes.",

            "En línea":
                "Todo va según lo previsto este mes.",

            "Vigila el gasto":
                "El gasto está ligeramente por encima del ritmo previsto.",

            "Ritmo insuficiente":
                "Necesitas moderar el gasto para alcanzar tu objetivo.",

            "Requiere atención":
                "El ritmo de gasto actual pone en riesgo tu objetivo."

        };

        return (
            messages[
                status.label
            ] ||
            "Atlas está analizando tu situación financiera."
        );

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
            this.savingsStatus(
                data,
                summary
            );

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

        const savingsDetail =
            savingsStatus
                .objectiveProgress ===
            null
                ? savingsStatus.label
                : `

                    ${savingsStatus.icon}

                    ${savingsStatus.label}

                    <br>

                    ${Math.max(
                        0,
                        Math.min(
                            999,
                            savingsStatus
                                .objectiveProgress
                        )
                    ).toFixed(0)}% objetivo

                `;

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
                        style="
                            margin-top:8px;
                        "
                    >
                        ${
                            summary.netWorth === 0
                                ? "Configura Atlas para empezar."
                                : "Tu situación financiera actual"
                        }
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
                        data-focus="liquidity"
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
                        data-focus="investments"
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
                        data-focus="debt"
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

                        <div
                            class="note"
                            style="
                                color:${
                                    summary.debt > 0
                                        ? "var(--color-text-muted)"
                                        : "var(--color-success)"
                                };
                            "
                        >
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
                        data-focus="savings"
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
                            ${savingsDetail}
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
                                style="
                                    margin-top:5px;
                                "
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

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Ajustes
                </h1>

                <p class="subtitle">
                    Configura tus cuentas, saldos y objetivos.
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
                                            data.settings
                                                .monthlySavingGoal
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
                    Editar saldos
                </button>

            </div>

        `;

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

        const movementLabel =
            movement => {

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
                    labels[
                        movement.type
                    ] ||
                    "Movimiento"
                );

            };

        const movementAmount =
            movement => {

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

            };

        const movementColor =
            movement => {

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

            };

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
                                                Aquí aparecerán tus ingresos,
                                                gastos, traspasos, inversiones
                                                y pagos de deuda.
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
                                                            ${
                                                                this.escapeHtml(
                                                                    movement
                                                                        .category ||
                                                                    movementLabel(
                                                                        movement
                                                                    )
                                                                )
                                                            }
                                                        </b>

                                                        <small>
                                                            ${
                                                                this.formatMovementDate(
                                                                    movement.date
                                                                )
                                                            }
                                                            ·
                                                            ${
                                                                movementLabel(
                                                                    movement
                                                                )
                                                            }
                                                        </small>

                                                        ${
                                                            movement.note
                                                                ? `

                                                                    <small>
                                                                        ${
                                                                            this.escapeHtml(
                                                                                movement.note
                                                                            )
                                                                        }
                                                                    </small>

                                                                `
                                                                : ""
                                                        }

                                                    </div>

                                                    <strong
                                                        style="
                                                            color:
                                                                ${
                                                                    movementColor(
                                                                        movement
                                                                    )
                                                                };
                                                            white-space:
                                                                nowrap;
                                                        "
                                                    >
                                                        ${
                                                            movementAmount(
                                                                movement
                                                            )
                                                        }
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

    analysis(data) {

        const summary =
            AtlasCalculations
                .financialSummary(
                    data
                );

        return `

            <div class="app">

                ${this.header()}

                <h1 class="page-title">
                    Análisis
                </h1>

                <p class="subtitle">
                    Evolución y distribución de tu patrimonio.
                </p>

                <div
                    class="grid"
                    style="
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0,1fr)
                            );
                        gap:12px;
                    "
                >

                    <div class="card">

                        <div class="label">
                            Patrimonio
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.netWorth
                            )}
                        </div>

                    </div>

                    <div class="card">

                        <div class="label">
                            Liquidez
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.liquidity
                            )}
                        </div>

                    </div>

                    <div class="card">

                        <div class="label">
                            Inversiones
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.investments
                            )}
                        </div>

                    </div>

                    <div class="card">

                        <div class="label">
                            Deuda
                        </div>

                        <div class="num">
                            ${this.formatCurrency(
                                summary.debt
                            )}
                        </div>

                    </div>

                </div>

                <section class="panel">

                    <div class="panelhead">

                        <h2>
                            Evolución
                        </h2>

                    </div>

                    <div class="chart">

                        <div class="bars">

                            <div
                                class="bar"
                                style="
                                    height:45%;
                                "
                            ></div>

                            <div
                                class="bar"
                                style="
                                    height:58%;
                                "
                            ></div>

                            <div
                                class="bar"
                                style="
                                    height:52%;
                                "
                            ></div>

                            <div
                                class="bar"
                                style="
                                    height:72%;
                                "
                            ></div>

                            <div
                                class="bar"
                                style="
                                    height:64%;
                                "
                            ></div>

                            <div
                                class="bar"
                                style="
                                    height:82%;
                                "
                            ></div>

                        </div>

                    </div>

                    <p class="note">
                        El histórico real se activará al registrar datos.
                    </p>

                </section>

            </div>

        `;

    },

    render(route, data) {

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
                    this.analysis(data);

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

                    root.innerHTML =
                        "";

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

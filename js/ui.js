/* ==========================================================
   ATLAS
   ui.js
   Sprint 1.5 — Dashboard definitivo
========================================================== */

const AtlasUI = {

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0);

    },

    formatPercent(value) {

        return `${(Number(value) || 0).toFixed(1)}%`;

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

    header() {

        return `

<header class="header">

    <div class="brand">

        <div class="logo">
            A
        </div>

        <div>

            <b>ATLAS</b>

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
            Number(summary.investedCapital) || 0;

        const gain =
            Number(summary.investmentGain) || 0;

        if (invested <= 0) {

            return 0;

        }

        return (gain / invested) * 100;

    },

    savingsStatus(data, summary) {

        const income =
            Number(summary.monthlyIncome) || 0;

        const expenses =
            Number(summary.monthlyExpenses) || 0;

        const invested =
            Number(summary.monthlyInvested) || 0;

        const savings =
            Number(summary.monthlySavings) || 0;

        const goalPercent =
            Number(
                data.settings.monthlySavingGoal
            ) || 0;

        if (income <= 0) {

            return {
                label: "Sin ingresos registrados",
                color: "var(--color-text-muted)",
                icon: "⚪",
                objectiveProgress: 0
            };

        }

        const targetSavings =
            income * (goalPercent / 100);

        const spendableAmount =
            Math.max(
                0,
                income -
                targetSavings -
                invested
            );

        const today =
            new Date();

        const daysInMonth =
            new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
            ).getDate();

        const monthProgress =
            today.getDate() / daysInMonth;

        const expectedExpensesToday =
            spendableAmount * monthProgress;

        const expenseRatio =
            expectedExpensesToday > 0
                ? expenses / expectedExpensesToday
                : 0;

        const objectiveProgress =
            targetSavings > 0
                ? (savings / targetSavings) * 100
                : 0;

        if (expenseRatio <= 0.9) {

            return {
                label: "Vas por delante",
                color: "var(--color-success)",
                icon: "🟢",
                objectiveProgress
            };

        }

        if (expenseRatio <= 1.05) {

            return {
                label: "En línea",
                color: "var(--color-success)",
                icon: "🟢",
                objectiveProgress
            };

        }

        if (expenseRatio <= 1.2) {

            return {
                label: "Vigila el gasto",
                color: "var(--color-warning)",
                icon: "🟡",
                objectiveProgress
            };

        }

        if (expenseRatio <= 1.4) {

            return {
                label: "Ritmo insuficiente",
                color: "var(--color-warning)",
                icon: "🟠",
                objectiveProgress
            };

        }

        return {
            label: "Requiere atención",
            color: "var(--color-danger)",
            icon: "🔴",
            objectiveProgress
        };

    },

    atlasMessage(data, summary) {

        if (summary.netWorth === 0) {

            return "Configura tus saldos iniciales para comenzar.";

        }

        const status =
            this.savingsStatus(
                data,
                summary
            );

        if (
            status.label ===
            "Sin ingresos registrados"
        ) {

            return "Registra tus ingresos para analizar el mes.";

        }

        if (
            status.label ===
            "Vas por delante"
        ) {

            return "Vas por delante del ritmo previsto este mes.";

        }

        if (
            status.label ===
            "En línea"
        ) {

            return "Todo va según lo previsto este mes.";

        }

        if (
            status.label ===
            "Vigila el gasto"
        ) {

            return "El gasto está ligeramente por encima del ritmo previsto.";

        }

        if (
            status.label ===
            "Ritmo insuficiente"
        ) {

            return "Necesitas moderar el gasto para alcanzar tu objetivo.";

        }

        return "El ritmo de gasto actual pone en riesgo tu objetivo.";

    },

    dashboard(data) {

        const summary =
            AtlasCalculations
                .financialSummary(data);

        const profitability =
            this.investmentProfitability(
                summary
            );

        const savingsStatus =
            this.savingsStatus(
                data,
                summary
            );

        const objectiveProgress =
            Math.max(
                0,
                Math.min(
                    999,
                    savingsStatus.objectiveProgress
                )
            );

        return `

<div class="app">

${this.header()}

<section class="hero">

    <div class="eyebrow">
        Patrimonio neto
    </div>

    <div class="value">
        ${
            summary.netWorth === 0
                ? "—"
                : this.formatCurrency(
                    summary.netWorth
                )
        }
    </div>

    <div class="trend">

        ${
            summary.netWorth === 0
                ? "Configura tus saldos iniciales"
                : "Tu situación financiera actual"
        }

    </div>

</section>

<div class="grid">

    <button
        class="card"
        type="button"
        data-route="analysis"
        data-focus="liquidity"
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

            ${
                summary.investedCapital > 0
                    ? `${profitability >= 0 ? "+" : ""}${this.formatPercent(
                        profitability
                    )}`
                    : "Sin aportaciones"
            }

        </div>

    </button>

    <button
        class="card"
        type="button"
        data-route="analysis"
        data-focus="debt"
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
        data-focus="savings"
    >

        <div class="label">
            🐷 Ahorro ${this.currentMonth()}
        </div>

        <div class="num">
            ${this.formatCurrency(
                summary.monthlySavings
            )}
        </div>

        <div
            class="note"
            style="color:${savingsStatus.color}"
        >

            ${savingsStatus.icon}
            ${savingsStatus.label}

            <br>

            ${objectiveProgress.toFixed(0)}%
            objetivo

        </div>

    </button>

</div>

<section class="panel">

    <div class="insight">

        <div class="badge">
            ✨
        </div>

        <div>

            <div class="label">
                Atlas
            </div>

            <p class="note">
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
            (title, accounts) => `

<div class="group-title">
    ${title}
</div>

${accounts.map(account => `

    <div class="account">

        <div class="accounttop">

            <div>

                <strong>
                    ${account.name}
                </strong>

                <div class="note">
                    ${account.type}
                </div>

            </div>

            <div class="balance">
                ${this.formatCurrency(
                    account.balance
                )}
            </div>

        </div>

    </div>

`).join("")}

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
                ${data.settings.monthlySavingGoal}%
            </strong>

        </div>

        <div class="progress">

            <i
                style="width:${Math.min(
                    100,
                    data.settings.monthlySavingGoal
                )}%"
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

    movements() {

        return `

<div class="app">

${this.header()}

<h1 class="page-title">
    Movimientos
</h1>

<p class="subtitle">
    Registra y consulta tu actividad financiera.
</p>

<section class="panel">

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
                .financialSummary(data);

        return `

<div class="app">

${this.header()}

<h1 class="page-title">
    Análisis
</h1>

<p class="subtitle">
    Evolución y distribución de tu patrimonio.
</p>

<div class="grid">

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
                style="height:45%"
            ></div>

            <div
                class="bar"
                style="height:58%"
            ></div>

            <div
                class="bar"
                style="height:52%"
            ></div>

            <div
                class="bar"
                style="height:72%"
            ></div>

            <div
                class="bar"
                style="height:64%"
            ></div>

            <div
                class="bar"
                style="height:82%"
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

        switch (route) {

            case "settings":

                document
                    .getElementById("app")
                    .innerHTML =
                    this.settings(data);

                break;

            case "movements":

                document
                    .getElementById("app")
                    .innerHTML =
                    this.movements(data);

                break;

            case "analysis":

                document
                    .getElementById("app")
                    .innerHTML =
                    this.analysis(data);

                break;

            default:

                document
                    .getElementById("app")
                    .innerHTML =
                    this.dashboard(data);

        }

        document
            .querySelectorAll(
                ".tabbar button[data-route]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.route === route
                );

            });

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
    ${message}
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
            document.getElementById("app");

        if (!app) {

            return;

        }

        app.style.opacity =
            show ? "0.55" : "1";

    }

};

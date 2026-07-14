/* ==========================================================
   ATLAS
   ui.js
   Sprint 1
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

    today() {

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(new Date());

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
                ${this.today()}
            </small>

        </div>

    </div>

    <button
        class="iconbtn"
        data-route="settings">

        ⚙︎

    </button>

</header>

`;

    },

    dashboard(summary) {

        return `

<div class="app">

${this.header()}

<section class="hero">

    <div class="eyebrow">

        Patrimonio Neto

    </div>

    <div class="value">

        ${this.formatCurrency(summary.netWorth)}

    </div>

    <div class="trend">

        ${
            summary.netWorth === 0

            ? "Configura tus saldos iniciales"

            : "Fotografía completa de tu patrimonio"

        }

    </div>

</section>

<div class="grid">

<div class="card">

<div class="label">

Liquidez

</div>

<div class="num">

${this.formatCurrency(summary.liquidity)}

</div>

<div class="note">

BBVA + Trade Republic efectivo

</div>

</div>

<div class="card">

<div class="label">

Inversiones

</div>

<div class="num">

${this.formatCurrency(summary.investments)}

</div>

<div class="note">

ETFs + Revolut Bot

</div>

</div>

<div class="card">

<div class="label">

Deudas

</div>

<div class="num">

${this.formatCurrency(summary.debt)}

</div>

<div class="note">

Préstamo y tarjetas

</div>

</div>

<div class="card">

<div class="label">

Ahorro mensual

</div>

<div class="num">

${this.formatCurrency(summary.monthlySavings)}

</div>

<div class="note">

Ingresos − Gastos − Inversión

</div>

</div>

</div>

<section class="panel">

<div class="panelhead">

<h2>

Objetivo mensual

</h2>

<button
class="link"
data-route="settings">

Editar

</button>

</div>

<div class="goal">

<div class="goalrow">

<span>

Objetivo

</span>

<strong>

${summary.monthlySavingsRate.toFixed(1)}%

</strong>

</div>

<div class="progress">

<i
style="width:${Math.max(
0,
Math.min(
100,
summary.monthlySavingsRate
)
)}%">

</i>

</div>

</div>

</section>

<section class="panel">

<div class="panelhead">

<h2>

Atlas dice

</h2>

</div>

<div class="insight">

<div class="badge">

✦

</div>

<div>

<p class="note">

${
summary.netWorth === 0

?

`Introduce el saldo inicial de tus cuentas para que Atlas empiece a calcular tu patrimonio.`

:

`Atlas ya está calculando automáticamente tu liquidez, inversiones, deudas y patrimonio.`

}

</p>

</div>

</div>

</section>

<button
class="primary"
data-route="settings">

Configurar Atlas

</button>

</div>

`;

    },
       settings(data) {

        const liquidity =
            data.accounts.filter(a => a.group === "liquidity");

        const investments =
            data.accounts.filter(a => a.group === "investment");

        const debts =
            data.accounts.filter(a => a.group === "debt");

        const renderGroup = (title, accounts) => `

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

                            ${this.formatCurrency(account.balance)}

                        </div>

                    </div>

                </div>

            `).join("")}

        `;

        return `

<div class="app">

${this.header()}

<h1 class="page-title">

Configuración

</h1>

<p class="subtitle">

Introduce los saldos iniciales de todas tus cuentas.

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
style="width:${data.settings.monthlySavingGoal}%">

</i>

</div>

</div>

</section>

<button
class="primary"
data-action="editAccounts">

Editar saldos

</button>

</div>

`;

    },

    movements(data) {

        return `

<div class="app">

${this.header()}

<h1 class="page-title">

Movimientos

</h1>

<p class="subtitle">

Aquí aparecerán todos los movimientos financieros.

</p>

<section class="panel">

<div class="list">

<div class="row">

<div>

<b>

Todavía no hay movimientos

</b>

<small>

En el Sprint 2 podrás registrar ingresos,
gastos, traspasos, inversiones y pagos
de préstamo.

</small>

</div>

</div>

</div>

</section>

<button
class="primary"
data-action="newMovement">

Nuevo movimiento

</button>

</div>

`;

    },
       analysis(data) {

        const summary =
            AtlasCalculations.financialSummary(data);

        return `

<div class="app">

${this.header()}

<h1 class="page-title">

Análisis

</h1>

<p class="subtitle">

Resumen financiero actual.

</p>

<section class="panel">

<div class="panelhead">

<h2>

Indicadores

</h2>

</div>

<div class="grid">

<div class="card">

<div class="label">

Patrimonio

</div>

<div class="num">

${this.formatCurrency(summary.netWorth)}

</div>

</div>

<div class="card">

<div class="label">

Liquidez

</div>

<div class="num">

${this.formatCurrency(summary.liquidity)}

</div>

</div>

<div class="card">

<div class="label">

Invertido

</div>

<div class="num">

${this.formatCurrency(summary.investments)}

</div>

</div>

<div class="card">

<div class="label">

Deuda

</div>

<div class="num">

${this.formatCurrency(summary.debt)}

</div>

</div>

</div>

</section>

<section class="panel">

<div class="panelhead">

<h2>

Evolución

</h2>

</div>

<div class="chart">

<div class="bars">

<div class="bar" style="height:45%"></div>

<div class="bar" style="height:58%"></div>

<div class="bar" style="height:52%"></div>

<div class="bar" style="height:72%"></div>

<div class="bar" style="height:64%"></div>

<div class="bar" style="height:82%"></div>

</div>

</div>

<p class="note">

En el Sprint 2 este gráfico mostrará la evolución real de tu patrimonio.

</p>

</section>

<section class="panel">

<div class="panelhead">

<h2>

Atlas dice

</h2>

</div>

<div class="insight">

<div class="badge">

📊

</div>

<div>

<p class="note">

Tu patrimonio se calculará utilizando:

<br><br>

Liquidez +

Inversiones −

Deudas.

</p>

</div>

</div>

</section>

</div>

`;

    },

    render(route,data){

        switch(route){

            case "settings":
                document.getElementById("app").innerHTML =
                    this.settings(data);
                break;

            case "movements":
                document.getElementById("app").innerHTML =
                    this.movements(data);
                break;

            case "analysis":
                document.getElementById("app").innerHTML =
                    this.analysis(data);
                break;

            default:
                document.getElementById("app").innerHTML =
                    this.dashboard(
                        AtlasCalculations.financialSummary(data)
                    );

        }

        document
            .querySelectorAll("[data-route]")
            .forEach(button=>{

                button.classList.toggle(
                    "active",
                    button.dataset.route===route
                );

            });

    },
       toast(message) {

        const root =
            document.getElementById("toast-root");

        if (!root) return;

        root.innerHTML = `
            <div class="toast">
                ${message}
            </div>
        `;

        clearTimeout(this._toastTimer);

        this._toastTimer = setTimeout(() => {

            root.innerHTML = "";

        }, 2500);

    },

    confirm(title, message) {

        return window.confirm(
            `${title}\n\n${message}`
        );

    },

    loading(show = true) {

        const app =
            document.getElementById("app");

        if (!app) return;

        app.style.opacity =
            show ? "0.55" : "1";

    }

};

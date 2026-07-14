/* ==========================================================
   ATLAS
   ui.js
   Interfaz y pantallas
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

    todayLabel() {

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day: "numeric",
                month: "long"
            }
        ).format(new Date());

    },

    header() {

        return `

            <header class="app-header">

                <div class="brand">

                    <div class="brand__mark">
                        A
                    </div>

                    <div>

                        <div class="brand__name">
                            ATLAS
                        </div>

                        <div class="brand__subtitle">
                            ${this.todayLabel()}
                        </div>

                    </div>

                </div>

                <button
                    class="icon-button"
                    type="button"
                    data-route="settings"
                    aria-label="Abrir ajustes"
                >
                    ⚙︎
                </button>

            </header>

        `;

    },

    home(data) {

        const summary =
            AtlasCalculations.financialSummary(data);

        const savingsRate =
            Math.max(
                0,
                Math.min(
                    100,
                    summary.monthlySavingsRate
                )
            );

        return `

            <main class="page">

                ${this.header()}

                <section class="hero-card">

                    <div class="eyebrow">
                        Patrimonio neto
                    </div>

                    <div class="hero-value">
                        ${this.formatCurrency(summary.netWorth)}
                    </div>

                    <div class="hero-trend">

                        ${
                            summary.netWorth === 0
                                ? "Configura tus saldos iniciales"
                                : "Fotografía global de tu situación financiera"
                        }

                    </div>

                </section>

                <section class="grid-2 home-kpis">

                    <article class="metric-card">

                        <div class="metric-card__label">
                            Liquidez
                        </div>

                        <div class="metric-card__value">
                            ${this.formatCurrency(summary.liquidity)}
                        </div>

                        <div class="metric-card__note">
                            BBVA y Trade Republic efectivo
                        </div>

                    </article>

                    <article class="metric-card">

                        <div class="metric-card__label">
                            Inversiones
                        </div>

                        <div class="metric-card__value">
                            ${this.formatCurrency(summary.investments)}
                        </div>

                        <div class="metric-card__note">
                            ETFs y Revolut Bot
                        </div>

                    </article>

                    <article class="metric-card">

                        <div class="metric-card__label">
                            Deudas
                        </div>

                        <div class="metric-card__value">
                            ${this.formatCurrency(summary.debt)}
                        </div>

                        <div class="metric-card__note">
                            Préstamo y tarjetas
                        </div>

                    </article>

                    <article class="metric-card">

                        <div class="metric-card__label">
                            Ahorro del mes
                        </div>

                        <div class="metric-card__value">
                            ${this.formatCurrency(summary.monthlySavings)}
                        </div>

                        <div class="metric-card__note">
                            Ingresos − gastos − inversión
                        </div>

                    </article>

                </section>

                <section class="panel">

                    <div class="panel__header">

                        <h2 class="panel__title">
                            Objetivo mensual
                        </h2>

                        <button
                            class="panel__action"
                            type="button"
                            data-route="settings"
                        >
                            Configurar
                        </button>

                    </div>

                    <div class="progress">

                        <div
                            class="progress__bar"
                            style="width:${savingsRate}%"
                        ></div>

                    </div>

                    <p class="metric-card__note">

                        Tasa de ahorro actual:
                        ${this.formatPercent(
                            summary.monthlySavingsRate
                        )}

                    </p>

                </section>

                <section class="panel home-insight">

                    <div class="panel__header">

                        <h2 class="panel__title">
                            Atlas dice
                        </h2>

                    </div>

                    <div class="insight">

                        <div class="insight__badge">
                            ✦
                        </div>

                        <p class="insight__text">

                            ${
                                summary.netWorth === 0
                                    ? "Introduce tus saldos iniciales para comenzar a analizar tu patrimonio."
                                    : "Atlas ya está calculando tu patrimonio, liquidez, inversiones y deuda."
                            }

                        </p>

                    </div>

                </section>

                <button
                    class="primary-button"
                    type="button"
                    data-route="settings"
                >
                    Configurar cuentas
                </button>

            </main>

        `;

    },

    movements() {

        return this.placeholder(
            "Movimientos",
            "Registra ingresos, gastos, traspasos y pagos."
        );

    },

    analysis() {

        return this.placeholder(
            "Análisis",
            "Evoluciones, tendencias y comparativas."
        );

    },

    settings(data) {

        const accounts = data.accounts
            .map(account => `

                <article class="account-card">

                    <div class="account-card__top">

                        <div>

                            <div class="account-card__name">

                                ${account.icon || "•"}
                                ${account.name}

                            </div>

                            <div class="account-card__type">
                                ${account.type}
                            </div>

                        </div>

                        <div class="account-card__balance">

                            ${this.formatCurrency(
                                account.balance
                            )}

                        </div>

                    </div>

                </article>

            `)
            .join("");

        return `

            <main class="page">

                ${this.header()}

                <section class="page__intro">

                    <div>

                        <h1 class="page__title">
                            Ajustes
                        </h1>

                        <p class="page__subtitle">
                            Configura saldos, cuentas y objetivos.
                        </p>

                    </div>

                </section>

                <section class="account-group">
                    ${accounts}
                </section>

            </main>

        `;

    },

    placeholder(title, subtitle) {

        return `

            <main class="page">

                ${this.header()}

                <section class="page__intro">

                    <div>

                        <h1 class="page__title">
                            ${title}
                        </h1>

                        <p class="page__subtitle">
                            ${subtitle}
                        </p>

                    </div>

                </section>

                <section class="panel empty-state">

                    Esta sección se activará en los siguientes pasos.

                </section>

            </main>

        `;

    },

    render(route, data) {

        const pages = {

            home: () =>
                this.home(data),

            movements: () =>
                this.movements(data),

            analysis: () =>
                this.analysis(data),

            settings: () =>
                this.settings(data)

        };

        const page =
            pages[route] || pages.home;

        document.getElementById("app").innerHTML =
            page();

        document
            .querySelectorAll(".tabbar__item")
            .forEach(button => {

                button.classList.toggle(
                    "is-active",
                    button.dataset.route === route
                );

            });

    }

};

/* ==========================================================
   ATLAS
   setup.js
   Sprint 2.1 — Configuración inicial
========================================================== */

const AtlasSetup = {

    data: null,

    step: 0,

    steps: [
        "welcome",
        "liquidity",
        "investments",
        "debts"
    ],

    open(data) {

        this.data = data;

        this.step = 0;

        this.hideNavigation();

        this.render();

    },

    hideNavigation() {

        const tabbar =
            document.querySelector(".tabbar");

        if (tabbar) {

            tabbar.style.display = "none";

        }

    },

    showNavigation() {

        const tabbar =
            document.querySelector(".tabbar");

        if (tabbar) {

            tabbar.style.display = "flex";

        }

    },

    currentStep() {

        return this.steps[this.step];

    },

    render() {

        const app =
            document.getElementById("app");

        if (!app) {

            return;

        }

        switch (this.currentStep()) {

            case "liquidity":

                app.innerHTML =
                    this.liquidityScreen();

                break;

            case "investments":

                app.innerHTML =
                    this.investmentsScreen();

                break;

            case "debts":

                app.innerHTML =
                    this.debtsScreen();

                break;

            default:

                app.innerHTML =
                    this.welcomeScreen();

        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },

    shell(content) {

        return `

<div class="app">

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
                    Configuración inicial
                </small>

            </div>

        </div>

    </header>

    ${content}

</div>

`;

    },

    progress() {

        if (this.step === 0) {

            return "";

        }

        const percentage =
            ((this.step) / 3) * 100;

        return `

<div
    class="progress"
    style="margin-bottom:24px"
>
    <i
        style="width:${percentage}%"
    ></i>
</div>

`;

    },

    welcomeScreen() {

        return this.shell(`

<section
    class="hero"
    style="
        padding:28px 24px;
        margin-top:22px;
    "
>

    <div class="eyebrow">
        Bienvenido a Atlas
    </div>

    <div
        class="value"
        style="
            font-size:38px;
            line-height:1.1;
        "
    >
        Tu patrimonio,
        en un solo lugar.
    </div>

    <div
        class="trend"
        style="
            color:var(--color-text-secondary);
            line-height:1.5;
        "
    >
        Configuraremos tus cuentas,
        inversiones y deudas.
    </div>

</section>

<section class="panel">

    <div class="insight">

        <div class="badge">
            ✨
        </div>

        <div>

            <div class="label">
                Solo una vez
            </div>

            <p class="note">

                Introduce tus saldos actuales.
                Después podrás modificarlos
                desde Ajustes.

            </p>

        </div>

    </div>

</section>

<button
    class="primary"
    type="button"
    data-setup-action="start"
>
    Empezar
</button>

`);

    },

    liquidityScreen() {

        const accounts =
            this.data.accounts.filter(
                account =>
                    account.group === "liquidity"
            );

        return this.shell(`

${this.progress()}

<h1 class="page-title">
    💵 Liquidez
</h1>

<p class="subtitle">
    Introduce el saldo disponible actual
    de cada cuenta.
</p>

<div class="form">

    ${accounts.map(account => `

        <div class="field">

            <label>
                ${account.name}
            </label>

            <input
                class="field-control"
                type="number"
                inputmode="decimal"
                step="0.01"
                min="0"
                value="${Number(account.balance) || ""}"
                placeholder="0,00 €"
                data-setup-account="${account.id}"
                data-setup-field="balance"
            >

        </div>

    `).join("")}

</div>

<div
    style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:24px;
    "
>

    <button
        class="card"
        type="button"
        data-setup-action="back"
        style="
            min-height:52px;
            text-align:center;
        "
    >
        Atrás
    </button>

    <button
        class="primary"
        type="button"
        data-setup-action="next"
        style="margin-top:0"
    >
        Siguiente
    </button>

</div>

`);

    },

    investmentsScreen() {

        const accounts =
            this.data.accounts.filter(
                account =>
                    account.group === "investment"
            );

        return this.shell(`

${this.progress()}

<h1 class="page-title">
    📈 Inversiones
</h1>

<p class="subtitle">
    Indica cuánto has aportado
    y el valor actual de cada inversión.
</p>

<div class="form">

    ${accounts.map(account => `

        <section
            class="panel"
            style="margin-top:0"
        >

            <div class="panelhead">

                <h2>
                    ${account.name}
                </h2>

            </div>

            <div class="field">

                <label>
                    Capital aportado
                </label>

                <input
                    class="field-control"
                    type="number"
                    inputmode="decimal"
                    step="0.01"
                    min="0"
                    value="${Number(account.invested) || ""}"
                    placeholder="0,00 €"
                    data-setup-account="${account.id}"
                    data-setup-field="invested"
                >

            </div>

            <div
                class="field"
                style="margin-top:14px"
            >

                <label>
                    Valor actual
                </label>

                <input
                    class="field-control"
                    type="number"
                    inputmode="decimal"
                    step="0.01"
                    min="0"
                    value="${Number(account.balance) || ""}"
                    placeholder="0,00 €"
                    data-setup-account="${account.id}"
                    data-setup-field="balance"
                >

            </div>

        </section>

    `).join("")}

</div>

<div
    style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:24px;
    "
>

    <button
        class="card"
        type="button"
        data-setup-action="back"
        style="
            min-height:52px;
            text-align:center;
        "
    >
        Atrás
    </button>

    <button
        class="primary"
        type="button"
        data-setup-action="next"
        style="margin-top:0"
    >
        Siguiente
    </button>

</div>

`);

    },

    debtsScreen() {

        const accounts =
            this.data.accounts.filter(
                account =>
                    account.group === "debt"
            );

        return this.shell(`

${this.progress()}

<h1 class="page-title">
    💳 Deudas
</h1>

<p class="subtitle">
    Introduce el importe pendiente.
    Usa siempre cantidades positivas.
</p>

<div class="form">

    ${accounts.map(account => `

        <div class="field">

            <label>
                ${account.name}
            </label>

            <input
                class="field-control"
                type="number"
                inputmode="decimal"
                step="0.01"
                min="0"
                value="${Math.abs(
                    Number(account.balance) || 0
                ) || ""}"
                placeholder="0,00 €"
                data-setup-account="${account.id}"
                data-setup-field="balance"
            >

        </div>

    `).join("")}

</div>

<div
    style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:24px;
    "
>

    <button
        class="card"
        type="button"
        data-setup-action="back"
        style="
            min-height:52px;
            text-align:center;
        "
    >
        Atrás
    </button>

    <button
        class="primary"
        type="button"
        data-setup-action="finish"
        style="margin-top:0"
    >
        Finalizar
    </button>

</div>

`);

    },

    captureValues() {

        document
            .querySelectorAll(
                "[data-setup-account]"
            )
            .forEach(input => {

                const account =
                    this.data.accounts.find(
                        item =>
                            item.id ===
                            input.dataset.setupAccount
                    );

                if (!account) {

                    return;

                }

                const field =
                    input.dataset.setupField;

                const normalizedValue =
                    String(input.value || "")
                        .replace(",", ".");

                const value =
                    Number(normalizedValue) || 0;

                account[field] = value;

            });

    },

    next() {

        this.captureValues();

        if (
            this.step <
            this.steps.length - 1
        ) {

            this.step += 1;

        }

        this.render();

    },

    back() {

        this.captureValues();

        if (this.step > 0) {

            this.step -= 1;

        }

        this.render();

    },

    finish() {

        this.captureValues();

        this.data.initialized = true;

        AtlasStorage.save(this.data);

        this.showNavigation();

        AtlasApp.data = this.data;

        AtlasApp.route = "home";

        AtlasApp.render();

        AtlasUI.toast(
            "Atlas ya está configurado."
        );

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-setup-action]"
                    );

                if (!button) {

                    return;

                }

                event.preventDefault();

                switch (
                    button.dataset.setupAction
                ) {

                    case "start":

                        this.step = 1;

                        this.render();

                        break;

                    case "next":

                        this.next();

                        break;

                    case "back":

                        this.back();

                        break;

                    case "finish":

                        this.finish();

                        break;

                }

            }
        );

    },

    init() {

        this.bindEvents();

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AtlasSetup.init();

    }
);

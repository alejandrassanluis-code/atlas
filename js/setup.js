/* ==========================================================
   ATLAS
   setup.js
   Sprint 2.1 — Configuración inicial
========================================================== */

const AtlasSetup = {

    step: 0,

    data: null,

    onComplete: null,

    steps: [
        "welcome",
        "liquidity",
        "investments",
        "debts",
        "goal"
    ],

    shouldOpen(data) {
        return data.initialized !== true;
    },

    open(data, onComplete) {
        this.data = data;
        this.onComplete = onComplete;
        this.step = 0;
        this.render();
    },

    close() {
        const root =
            document.getElementById("modal-root");

        if (root) {
            root.innerHTML = "";
        }
    },

    get currentStep() {
        return this.steps[this.step];
    },

    account(id) {
        return this.data.accounts.find(
            account => account.id === id
        );
    },

    numberValue(id) {
        const input =
            document.getElementById(id);

        if (!input) {
            return 0;
        }

        return Number(
            String(input.value)
                .replace(",", ".")
        ) || 0;
    },

    moneyInput({
        id,
        label,
        value = 0,
        help = ""
    }) {
        return `
            <div style="margin-bottom:16px">

                <label
                    for="${id}"
                    style="
                        display:block;
                        margin-bottom:7px;
                        color:var(--color-text-secondary);
                        font-size:12px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.6px;
                    "
                >
                    ${label}
                </label>

                <div
                    style="
                        position:relative;
                    "
                >

                    <input
                        id="${id}"
                        type="number"
                        inputmode="decimal"
                        step="0.01"
                        value="${Number(value) || 0}"
                        style="
                            width:100%;
                            min-height:52px;
                            padding:0 44px 0 14px;
                            border-radius:14px;
                            border:1px solid var(--color-border-strong);
                            background:var(--color-background-secondary);
                            color:var(--color-text);
                            font-size:17px;
                            outline:none;
                        "
                    >

                    <span
                        style="
                            position:absolute;
                            right:15px;
                            top:50%;
                            transform:translateY(-50%);
                            color:var(--color-text-muted);
                            font-weight:700;
                        "
                    >
                        €
                    </span>

                </div>

                ${
                    help
                        ? `
                            <div
                                style="
                                    margin-top:6px;
                                    color:var(--color-text-muted);
                                    font-size:12px;
                                    line-height:1.4;
                                "
                            >
                                ${help}
                            </div>
                        `
                        : ""
                }

            </div>
        `;
    },

    progress() {
        const visibleSteps =
            this.steps.length - 1;

        const current =
            Math.max(0, this.step);

        const percentage =
            this.step === 0
                ? 0
                : (
                    current /
                    visibleSteps
                ) * 100;

        return `
            <div
                style="
                    height:6px;
                    margin-bottom:22px;
                    overflow:hidden;
                    border-radius:999px;
                    background:rgba(255,255,255,.07);
                "
            >
                <div
                    style="
                        width:${Math.min(
                            100,
                            percentage
                        )}%;
                        height:100%;
                        border-radius:999px;
                        background:var(--gradient-primary);
                        transition:width .25s ease;
                    "
                ></div>
            </div>
        `;
    },

    shell(content) {
        return `
            <div
                style="
                    position:fixed;
                    inset:0;
                    z-index:3000;
                    display:flex;
                    align-items:flex-end;
                    background:rgba(3,7,18,.76);
                    backdrop-filter:blur(10px);
                "
            >

                <section
                    style="
                        width:100%;
                        max-width:680px;
                        max-height:94vh;
                        margin:0 auto;
                        padding:
                            18px
                            20px
                            calc(
                                22px +
                                env(safe-area-inset-bottom)
                            );
                        overflow-y:auto;
                        border-radius:28px 28px 0 0;
                        background:var(--color-background-secondary);
                        border:1px solid var(--color-border-strong);
                        box-shadow:0 -24px 60px rgba(0,0,0,.45);
                    "
                >

                    <div
                        style="
                            width:42px;
                            height:5px;
                            margin:0 auto 18px;
                            border-radius:999px;
                            background:rgba(255,255,255,.18);
                        "
                    ></div>

                    ${this.progress()}

                    ${content}

                </section>

            </div>
        `;
    },

    buttons({
        back = true,
        nextLabel = "Siguiente",
        nextAction = "next"
    } = {}) {
        return `
            <div
                style="
                    display:grid;
                    grid-template-columns:
                        ${back ? "1fr 1.6fr" : "1fr"};
                    gap:10px;
                    margin-top:22px;
                "
            >

                ${
                    back
                        ? `
                            <button
                                type="button"
                                data-setup-action="back"
                                style="
                                    min-height:52px;
                                    border-radius:15px;
                                    border:1px solid var(--color-border-strong);
                                    background:var(--color-surface);
                                    color:var(--color-text-secondary);
                                    font-weight:700;
                                "
                            >
                                Atrás
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    data-setup-action="${nextAction}"
                    style="
                        min-height:52px;
                        border-radius:15px;
                        background:var(--gradient-primary);
                        color:white;
                        font-weight:800;
                        box-shadow:var(--shadow-md);
                    "
                >
                    ${nextLabel}
                </button>

            </div>
        `;
    },

    welcome() {
        return this.shell(`
            <div
                style="
                    padding:8px 4px 4px;
                    text-align:center;
                "
            >

                <div
                    style="
                        width:72px;
                        height:72px;
                        margin:0 auto 20px;
                        display:grid;
                        place-items:center;
                        border-radius:24px;
                        background:
                            linear-gradient(
                                145deg,
                                #17233B,
                                #0E1628
                            );
                        border:1px solid var(--color-border-strong);
                        color:var(--color-accent);
                        font-size:38px;
                        font-weight:900;
                        box-shadow:var(--shadow-md);
                    "
                >
                    A
                </div>

                <h1
                    style="
                        margin:0;
                        font-size:30px;
                        letter-spacing:-1px;
                    "
                >
                    Bienvenida a Atlas
                </h1>

                <p
                    style="
                        margin:12px auto 0;
                        max-width:420px;
                        color:var(--color-text-muted);
                        line-height:1.6;
                    "
                >
                    Configuraremos tu liquidez,
                    inversiones y deudas para crear
                    tu fotografía financiera inicial.
                </p>

                <div style="margin-top:28px">

                    ${this.buttons({
                        back: false,
                        nextLabel: "Empezar"
                    })}

                </div>

            </div>
        `);
    },

    liquidity() {
        return this.shell(`
            <div>

                <div
                    style="
                        color:var(--color-primary);
                        font-size:13px;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.8px;
                    "
                >
                    Paso 1 de 4
                </div>

                <h2
                    style="
                        margin:7px 0 6px;
                        font-size:26px;
                    "
                >
                    💵 Liquidez
                </h2>

                <p
                    style="
                        margin:0 0 22px;
                        color:var(--color-text-muted);
                        line-height:1.5;
                    "
                >
                    Introduce el saldo actual disponible
                    en cada cuenta.
                </p>

                ${this.moneyInput({
                    id: "setup-bbva-nomina",
                    label: "BBVA Cuenta Nómina",
                    value:
                        this.account("bbva_nomina")
                            ?.balance
                })}

                ${this.moneyInput({
                    id: "setup-bbva-secundaria",
                    label: "BBVA Cuenta Secundaria",
                    value:
                        this.account("bbva_secundaria")
                            ?.balance
                })}

                ${this.moneyInput({
                    id: "setup-trade-cash",
                    label: "Trade Republic Efectivo",
                    value:
                        this.account("trade_cash")
                            ?.balance
                })}

                ${this.buttons()}

            </div>
        `);
    },

    investments() {
        return this.shell(`
            <div>

                <div
                    style="
                        color:var(--color-primary);
                        font-size:13px;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.8px;
                    "
                >
                    Paso 2 de 4
                </div>

                <h2
                    style="
                        margin:7px 0 6px;
                        font-size:26px;
                    "
                >
                    📈 Inversiones
                </h2>

                <p
                    style="
                        margin:0 0 22px;
                        color:var(--color-text-muted);
                        line-height:1.5;
                    "
                >
                    Separa el capital aportado del valor
                    actual para calcular la rentabilidad.
                </p>

                <div class="panel" style="margin-top:0">

                    <div
                        style="
                            margin-bottom:16px;
                            font-weight:800;
                        "
                    >
                        Trade Republic ETFs
                    </div>

                    ${this.moneyInput({
                        id: "setup-trade-invested",
                        label: "Capital aportado",
                        value:
                            this.account("trade_etfs")
                                ?.invested,
                        help:
                            "Total de dinero que has aportado."
                    })}

                    ${this.moneyInput({
                        id: "setup-trade-value",
                        label: "Valor actual",
                        value:
                            this.account("trade_etfs")
                                ?.balance,
                        help:
                            "Valor de mercado que aparece actualmente."
                    })}

                </div>

                <div class="panel">

                    <div
                        style="
                            margin-bottom:16px;
                            font-weight:800;
                        "
                    >
                        Revolut Bot
                    </div>

                    ${this.moneyInput({
                        id: "setup-revolut-invested",
                        label: "Capital aportado",
                        value:
                            this.account("revolut_bot")
                                ?.invested,
                        help:
                            "Total aportado al bot de inversión."
                    })}

                    ${this.moneyInput({
                        id: "setup-revolut-value",
                        label: "Valor actual",
                        value:
                            this.account("revolut_bot")
                                ?.balance,
                        help:
                            "Valor actual mostrado por Revolut."
                    })}

                </div>

                ${this.buttons()}

            </div>
        `);
    },

    debts() {
        return this.shell(`
            <div>

                <div
                    style="
                        color:var(--color-primary);
                        font-size:13px;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.8px;
                    "
                >
                    Paso 3 de 4
                </div>

                <h2
                    style="
                        margin:7px 0 6px;
                        font-size:26px;
                    "
                >
                    💳 Deudas
                </h2>

                <p
                    style="
                        margin:0 0 22px;
                        color:var(--color-text-muted);
                        line-height:1.5;
                    "
                >
                    Introduce importes pendientes como
                    números positivos.
                </p>

                ${this.moneyInput({
                    id: "setup-loan-car",
                    label: "Préstamo coche pendiente",
                    value:
                        Math.abs(
                            Number(
                                this.account("loan_car")
                                    ?.balance
                            ) || 0
                        )
                })}

                ${this.moneyInput({
                    id: "setup-amex",
                    label: "American Express pendiente",
                    value:
                        Math.abs(
                            Number(
                                this.account("amex")
                                    ?.balance
                            ) || 0
                        ),
                    help:
                        "Déjalo a cero si todavía no hay compras pendientes."
                })}

                ${this.moneyInput({
                    id: "setup-bbva-credit",
                    label: "Tarjeta Crédito BBVA pendiente",
                    value:
                        Math.abs(
                            Number(
                                this.account("bbva_credit")
                                    ?.balance
                            ) || 0
                        )
                })}

                ${this.buttons()}

            </div>
        `);
    },

    goal() {
        const goal =
            Number(
                this.data.settings
                    .monthlySavingGoal
            ) || 25;

        return this.shell(`
            <div>

                <div
                    style="
                        color:var(--color-primary);
                        font-size:13px;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.8px;
                    "
                >
                    Paso 4 de 4
                </div>

                <h2
                    style="
                        margin:7px 0 6px;
                        font-size:26px;
                    "
                >
                    🐷 Objetivo de ahorro
                </h2>

                <p
                    style="
                        margin:0 0 22px;
                        color:var(--color-text-muted);
                        line-height:1.5;
                    "
                >
                    Define qué porcentaje de tus ingresos
                    quieres ahorrar cada mes.
                </p>

                <div class="panel" style="margin-top:0">

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            margin-bottom:18px;
                        "
                    >

                        <span>
                            Objetivo mensual
                        </span>

                        <strong
                            id="setup-goal-label"
                            style="
                                color:var(--color-primary);
                                font-size:22px;
                            "
                        >
                            ${goal}%
                        </strong>

                    </div>

                    <input
                        id="setup-goal"
                        type="range"
                        min="0"
                        max="70"
                        step="1"
                        value="${goal}"
                        style="
                            width:100%;
                            accent-color:var(--color-primary);
                        "
                    >

                    <p
                        style="
                            margin:16px 0 0;
                            color:var(--color-text-muted);
                            font-size:13px;
                            line-height:1.5;
                        "
                    >
                        Atlas utilizará este objetivo
                        para evaluar tu ritmo de gasto
                        durante el mes.
                    </p>

                </div>

                ${this.buttons({
                    nextLabel: "Finalizar configuración",
                    nextAction: "finish"
                })}

            </div>
        `);
    },

    saveCurrentStep() {
        switch (this.currentStep) {

            case "liquidity":

                this.account("bbva_nomina").balance =
                    this.numberValue(
                        "setup-bbva-nomina"
                    );

                this.account("bbva_secundaria").balance =
                    this.numberValue(
                        "setup-bbva-secundaria"
                    );

                this.account("trade_cash").balance =
                    this.numberValue(
                        "setup-trade-cash"
                    );

                break;

            case "investments":

                this.account("trade_etfs").invested =
                    this.numberValue(
                        "setup-trade-invested"
                    );

                this.account("trade_etfs").balance =
                    this.numberValue(
                        "setup-trade-value"
                    );

                this.account("revolut_bot").invested =
                    this.numberValue(
                        "setup-revolut-invested"
                    );

                this.account("revolut_bot").balance =
                    this.numberValue(
                        "setup-revolut-value"
                    );

                break;

            case "debts":

                this.account("loan_car").balance =
                    this.numberValue(
                        "setup-loan-car"
                    );

                this.account("amex").balance =
                    this.numberValue(
                        "setup-amex"
                    );

                this.account("bbva_credit").balance =
                    this.numberValue(
                        "setup-bbva-credit"
                    );

                break;

            case "goal":

                this.data.settings
                    .monthlySavingGoal =
                    this.numberValue(
                        "setup-goal"
                    );

                break;

        }
    },

    next() {
        this.saveCurrentStep();

        if (
            this.step <
            this.steps.length - 1
        ) {
            this.step += 1;
            this.render();
        }
    },

    back() {
        this.saveCurrentStep();

        if (this.step > 0) {
            this.step -= 1;
            this.render();
        }
    },

    finish() {
        this.saveCurrentStep();

        this.data.initialized = true;

        AtlasStorage.save(
            this.data
        );

        this.close();

        if (
            typeof this.onComplete ===
            "function"
        ) {
            this.onComplete(
                this.data
            );
        }
    },

    render() {
        const root =
            document.getElementById(
                "modal-root"
            );

        if (!root) {
            return;
        }

        const screens = {
            welcome:
                () => this.welcome(),

            liquidity:
                () => this.liquidity(),

            investments:
                () => this.investments(),

            debts:
                () => this.debts(),

            goal:
                () => this.goal()
        };

        root.innerHTML =
            screens[this.currentStep]();

        const goalInput =
            document.getElementById(
                "setup-goal"
            );

        const goalLabel =
            document.getElementById(
                "setup-goal-label"
            );

        if (
            goalInput &&
            goalLabel
        ) {
            goalInput.addEventListener(
                "input",
                () => {
                    goalLabel.textContent =
                        `${goalInput.value}%`;
                }
            );
        }
    }

};

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

        const action =
            button.dataset.setupAction;

        if (action === "next") {
            AtlasSetup.next();
        }

        if (action === "back") {
            AtlasSetup.back();
        }

        if (action === "finish") {
            AtlasSetup.finish();
        }

    }
);

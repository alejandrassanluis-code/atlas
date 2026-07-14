/* ==========================================================
   ATLAS
   setup.js
   Sprint 4.0 — Configuración inicial estable
========================================================== */

const AtlasSetup = {

    data: null,

    workingData: null,

    onComplete: null,

    currentStep: 0,

    saving: false,

    steps: [
        "liquidity",
        "investments",
        "debts",
        "goal"
    ],

    shouldOpen(data) {

        return (
            !data ||
            data.initialized !== true
        );

    },

    open(
        data,
        onComplete
    ) {

        this.data =
            data;

        this.workingData =
            this.clone(
                data
            );

        this.onComplete =
            onComplete;

        this.currentStep =
            0;

        this.saving =
            false;

        this.render();

    },

    root() {

        return document.getElementById(
            "modal-root"
        );

    },

    clone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    escape(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    },

    accountsByGroup(group) {

        return this.workingData.accounts
            .filter(
                account =>
                    account.group === group
            )
            .sort(
                (a, b) =>
                    this.number(
                        a.order
                    ) -
                    this.number(
                        b.order
                    )
            );

    },

    progressPercent() {

        return (
            (
                this.currentStep + 1
            ) /
            this.steps.length
        ) * 100;

    },

    styles() {

        return `

            <style>

                body.atlas-setup-open {
                    overflow: hidden;
                }

                .atlas-setup-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 4000;
                    background:
                        rgba(
                            3,
                            7,
                            18,
                            0.82
                        );
                    backdrop-filter:
                        blur(10px);
                    -webkit-backdrop-filter:
                        blur(10px);
                }

                .atlas-setup-sheet {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 4001;
                    max-height: 94vh;
                    overflow-y: auto;
                    padding:
                        12px
                        22px
                        calc(
                            28px +
                            env(
                                safe-area-inset-bottom
                            )
                        );
                    border-radius:
                        30px
                        30px
                        0
                        0;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.24
                        );
                    background:
                        #11192e;
                    box-shadow:
                        0 -24px 70px
                        rgba(
                            0,
                            0,
                            0,
                            0.5
                        );
                }

                .atlas-setup-handle {
                    width: 46px;
                    height: 5px;
                    margin:
                        0
                        auto
                        24px;
                    border-radius: 99px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.22
                        );
                }

                .atlas-setup-progress {
                    height: 7px;
                    margin-bottom: 25px;
                    overflow: hidden;
                    border-radius: 99px;
                    background:
                        rgba(
                            145,
                            164,
                            202,
                            0.13
                        );
                }

                .atlas-setup-progress i {
                    display: block;
                    height: 100%;
                    border-radius: inherit;
                    background:
                        linear-gradient(
                            90deg,
                            #55b6ff,
                            #3789f5
                        );
                    transition:
                        width
                        0.2s
                        ease;
                }

                .atlas-setup-step {
                    margin-bottom: 10px;
                    color: #55b6ff;
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .atlas-setup-title {
                    margin:
                        0
                        0
                        10px;
                    color: #f7f8fc;
                    font-size: 32px;
                    line-height: 1.15;
                    letter-spacing: -0.7px;
                }

                .atlas-setup-description {
                    margin:
                        0
                        0
                        24px;
                    color: #98a2bb;
                    font-size: 17px;
                    line-height: 1.5;
                }

                .atlas-setup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                }

                .atlas-setup-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .atlas-setup-field > span {
                    color: #cbd3e6;
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 0.7px;
                    text-transform: uppercase;
                }

                .atlas-setup-input-wrap {
                    position: relative;
                }

                .atlas-setup-input-wrap input {
                    width: 100%;
                    min-height: 58px;
                    padding:
                        0
                        46px
                        0
                        15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.25
                        );
                    border-radius: 17px;
                    outline: none;
                    background: #121b31;
                    color: #f7f8fc;
                    font-size: 19px;
                }

                .atlas-setup-input-wrap input:focus {
                    border-color: #4da3ff;
                    box-shadow:
                        0 0 0 3px
                        rgba(
                            77,
                            163,
                            255,
                            0.12
                        );
                }

                .atlas-setup-symbol {
                    position: absolute;
                    top: 50%;
                    right: 16px;
                    transform:
                        translateY(-50%);
                    color: #98a2bb;
                    font-size: 18px;
                    font-weight: 700;
                    pointer-events: none;
                }

                .atlas-setup-investment {
                    padding: 16px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius: 20px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                }

                .atlas-setup-investment h3 {
                    margin:
                        0
                        0
                        14px;
                    color: #f7f8fc;
                    font-size: 16px;
                }

                .atlas-setup-investment-fields {
                    display: grid;
                    gap: 14px;
                }

                .atlas-setup-actions {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 0.7fr)
                        minmax(0, 1.15fr);
                    gap: 12px;
                    margin-top: 26px;
                }

                .atlas-setup-back,
                .atlas-setup-next {
                    min-height: 58px;
                    border-radius: 18px;
                    font-size: 17px;
                    font-weight: 800;
                }

                .atlas-setup-back {
                    color: #cbd3e6;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.22
                        );
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.035
                        );
                }

                .atlas-setup-next {
                    color: #ffffff;
                    background:
                        linear-gradient(
                            135deg,
                            #55b6ff,
                            #2879ed
                        );
                    box-shadow:
                        0 14px 30px
                        rgba(
                            40,
                            121,
                            237,
                            0.24
                        );
                }

                .atlas-setup-next:disabled {
                    opacity: 0.55;
                }

                .atlas-setup-note {
                    margin-top: 10px;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.45;
                }

            </style>

        `;

    },

    stepInformation() {

        const information = {

            liquidity: {
                icon:
                    "💵",

                title:
                    "Liquidez",

                description:
                    "Introduce el saldo actual disponible en cada cuenta."
            },

            investments: {
                icon:
                    "📈",

                title:
                    "Inversiones",

                description:
                    "Indica cuánto has aportado y cuánto valen actualmente."
            },

            debts: {
                icon:
                    "💳",

                title:
                    "Deudas",

                description:
                    "Introduce el importe pendiente de préstamos y tarjetas."
            },

            goal: {
                icon:
                    "🎯",

                title:
                    "Objetivo de ahorro",

                description:
                    "Elige qué porcentaje de tus ingresos quieres ahorrar e invertir."
            }

        };

        return information[
            this.steps[
                this.currentStep
            ]
        ];

    },

    currencyField(
        name,
        label,
        value
    ) {

        return `

            <label class="atlas-setup-field">

                <span>
                    ${this.escape(label)}
                </span>

                <div class="atlas-setup-input-wrap">

                    <input
                        name="${this.escape(name)}"
                        type="number"
                        inputmode="decimal"
                        step="0.01"
                        value="${this.escape(
                            this.number(value)
                        )}"
                    >

                    <b class="atlas-setup-symbol">
                        €
                    </b>

                </div>

            </label>

        `;

    },

    liquidityFields() {

        return this.accountsByGroup(
            "liquidity"
        )
            .map(
                account =>
                    this.currencyField(
                        `balance_${account.id}`,
                        account.name,
                        account.balance
                    )
            )
            .join("");

    },

    investmentFields() {

        return this.accountsByGroup(
            "investment"
        )
            .map(
                account => `

                    <section class="atlas-setup-investment">

                        <h3>
                            ${this.escape(
                                account.name
                            )}
                        </h3>

                        <div
                            class="atlas-setup-investment-fields"
                        >

                            ${this.currencyField(
                                `invested_${account.id}`,
                                "Capital aportado",
                                account.invested
                            )}

                            ${this.currencyField(
                                `balance_${account.id}`,
                                "Valor actual",
                                account.balance
                            )}

                        </div>

                    </section>

                `
            )
            .join("");

    },

    debtFields() {

        return this.accountsByGroup(
            "debt"
        )
            .map(
                account =>
                    this.currencyField(
                        `balance_${account.id}`,
                        account.name,
                        account.balance
                    )
            )
            .join("");

    },

    goalFields() {

        const goal =
            this.number(
                this.workingData.settings
                    ?.monthlySavingGoal
            ) || 20;

        return `

            <label class="atlas-setup-field">

                <span>
                    Objetivo mensual
                </span>

                <div class="atlas-setup-input-wrap">

                    <input
                        name="monthlySavingGoal"
                        type="number"
                        inputmode="decimal"
                        min="0"
                        max="100"
                        step="0.5"
                        value="${this.escape(goal)}"
                        required
                    >

                    <b class="atlas-setup-symbol">
                        %
                    </b>

                </div>

            </label>

            <p class="atlas-setup-note">
                Podrás modificar este objetivo más adelante desde Ajustes.
            </p>

        `;

    },

    currentFields() {

        const step =
            this.steps[
                this.currentStep
            ];

        switch (step) {

            case "liquidity":
                return this.liquidityFields();

            case "investments":
                return this.investmentFields();

            case "debts":
                return this.debtFields();

            case "goal":
                return this.goalFields();

            default:
                return "";

        }

    },

    render() {

        const root =
            this.root();

        if (!root) {
            return;
        }

        const information =
            this.stepInformation();

        const isLastStep =
            this.currentStep ===
            this.steps.length - 1;

        document.body.classList.add(
            "atlas-setup-open"
        );

        root.innerHTML = `

            ${this.styles()}

            <div
                class="atlas-setup-backdrop"
            ></div>

            <section
                class="atlas-setup-sheet"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="atlas-setup-handle"
                ></div>

                <div class="atlas-setup-progress">

                    <i
                        style="
                            width:
                                ${this.progressPercent()}%;
                        "
                    ></i>

                </div>

                <div class="atlas-setup-step">
                    Paso
                    ${this.currentStep + 1}
                    de
                    ${this.steps.length}
                </div>

                <h2 class="atlas-setup-title">
                    ${information.icon}
                    ${information.title}
                </h2>

                <p class="atlas-setup-description">
                    ${information.description}
                </p>

                <form
                    class="atlas-setup-form"
                    data-atlas-setup-form
                >

                    ${this.currentFields()}

                    <div class="atlas-setup-actions">

                        <button
                            class="atlas-setup-back"
                            type="button"
                            data-setup-action="back"
                        >
                            Atrás
                        </button>

                        <button
                            class="atlas-setup-next"
                            type="submit"
                            data-setup-action="next"
                        >
                            ${
                                isLastStep
                                    ? "Terminar"
                                    : "Siguiente"
                            }
                        </button>

                    </div>

                </form>

            </section>

        `;

    },

    saveCurrentStep(form) {

        const values =
            new FormData(form);

        const step =
            this.steps[
                this.currentStep
            ];

        if (
            step === "liquidity" ||
            step === "debts"
        ) {

            const group =
                step === "liquidity"
                    ? "liquidity"
                    : "debt";

            this.accountsByGroup(
                group
            ).forEach(
                account => {

                    account.balance =
                        this.number(
                            values.get(
                                `balance_${account.id}`
                            )
                        );

                    account.updatedAt =
                        new Date()
                            .toISOString();

                }
            );

            return true;

        }

        if (
            step === "investments"
        ) {

            this.accountsByGroup(
                "investment"
            ).forEach(
                account => {

                    account.invested =
                        this.number(
                            values.get(
                                `invested_${account.id}`
                            )
                        );

                    account.balance =
                        this.number(
                            values.get(
                                `balance_${account.id}`
                            )
                        );

                    account.valueUpdatedAt =
                        new Date()
                            .toISOString();

                    account.updatedAt =
                        new Date()
                            .toISOString();

                }
            );

            return true;

        }

        if (
            step === "goal"
        ) {

            const goal =
                Number(
                    values.get(
                        "monthlySavingGoal"
                    )
                );

            if (
                !Number.isFinite(goal) ||
                goal < 0 ||
                goal > 100
            ) {

                AtlasUI.toast(
                    "Introduce un objetivo entre 0 y 100."
                );

                return false;

            }

            this.workingData.settings =
                this.workingData.settings ||
                {};

            this.workingData.settings
                .monthlySavingGoal =
                goal;

            return true;

        }

        return true;

    },

    next(form) {

        if (this.saving) {
            return;
        }

        const valid =
            this.saveCurrentStep(
                form
            );

        if (!valid) {
            return;
        }

        const isLastStep =
            this.currentStep ===
            this.steps.length - 1;

        if (!isLastStep) {

            this.currentStep += 1;

            this.render();

            return;

        }

        this.finish(form);

    },

    back(form) {

        if (this.saving) {
            return;
        }

        this.saveCurrentStep(
            form
        );

        if (
            this.currentStep > 0
        ) {

            this.currentStep -= 1;

            this.render();

            return;

        }

        AtlasUI.toast(
            "Completa la configuración inicial para empezar."
        );

    },

    finish(form) {

        this.saving =
            true;

        const button =
            form.querySelector(
                "[data-setup-action='next']"
            );

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Guardando…";

        }

        this.workingData.initialized =
            true;

        this.workingData.updatedAt =
            new Date()
                .toISOString();

        const saved =
            AtlasStorage.save(
                this.workingData
            );

        if (!saved) {

            this.saving =
                false;

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Terminar";

            }

            AtlasUI.toast(
                "No se pudo guardar la configuración."
            );

            return;

        }

        const completedData =
            AtlasStorage.load();

        const callback =
            this.onComplete;

        this.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                completedData
            );

        }

    },

    close() {

        const root =
            this.root();

        if (root) {
            root.innerHTML = "";
        }

        document.body.classList.remove(
            "atlas-setup-open"
        );

        this.saving =
            false;

    },

    bindEvents() {

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-atlas-setup-form]"
                    );

                if (!form) {
                    return;
                }

                event.preventDefault();

                this.next(form);

            }
        );

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-setup-action='back']"
                    );

                if (!button) {
                    return;
                }

                const form =
                    button.closest(
                        "[data-atlas-setup-form]"
                    );

                if (!form) {
                    return;
                }

                event.preventDefault();

                this.back(form);

            }
        );

    }

};

AtlasSetup.bindEvents();

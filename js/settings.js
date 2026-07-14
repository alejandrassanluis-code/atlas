/* ==========================================================
   ATLAS
   settings.js
   Sprint 5.2 — Edición de presupuestos
========================================================== */

const AtlasSettings = {

    data: null,
    onComplete: null,
    saving: false,

    open(
        data,
        onComplete,
        section = "menu"
    ) {

        this.data = data;
        this.onComplete = onComplete;
        this.saving = false;

        switch (section) {

            case "initial_balances":

                this.openInitialBalances();

                break;

            case "goal":

                this.renderSavingGoal();

                break;

            case "budgets":

                this.renderBudgets();

                break;

            case "accounts":

                this.renderAccountNames();

                break;

            case "investments":

                this.renderInvestmentValues();

                break;

            case "snapshot":

                this.renderSnapshot();

                break;

            default:

                this.renderMenu();

        }

    },

    root() {

        return document.getElementById(
            "modal-root"
        );

    },

    cloneData() {

        return JSON.parse(
            JSON.stringify(
                this.data
            )
        );

    },

    escape(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    hasMovements() {

        return (
            Array.isArray(
                this.data?.movements
            ) &&
            this.data.movements.length > 0
        );

    },

    currentMonthKey() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}`;

    },

    formatMonthKey(monthKey) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(Number);

        if (
            !year ||
            !month
        ) {

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
            label.charAt(0)
                .toUpperCase() +
            label.slice(1)
        );

    },

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
            this.number(value)
        );

    },

    accountsByGroup(
        group,
        data = this.data
    ) {

        return (
            data?.accounts || []
        )
            .filter(
                account =>
                    account.group === group
            )
            .sort(
                (a, b) =>
                    this.number(a.order) -
                    this.number(b.order)
            );

    },

    liquidityAccounts(
        data = this.data
    ) {

        return this.accountsByGroup(
            "liquidity",
            data
        );

    },

    investmentAccounts(
        data = this.data
    ) {

        return this.accountsByGroup(
            "investment",
            data
        );

    },

    debtAccounts(
        data = this.data
    ) {

        return this.accountsByGroup(
            "debt",
            data
        );

    },

    expenseCategories() {

        const categories =
            this.data?.catalog
                ?.categories
                ?.expense;

        return Array.isArray(categories)
            ? categories
            : [];

    },

    categoryBudgets() {

        const budgets =
            this.data?.catalog
                ?.budgets
                ?.categoryBudgets;

        return Array.isArray(budgets)
            ? budgets
            : [];

    },

    findCategoryBudget(categoryId) {

        return this
            .categoryBudgets()
            .find(
                budget =>
                    budget.categoryId ===
                    categoryId
            ) || null;

    },

    styles() {

        return `

            <style>

                body.atlas-settings-open {
                    overflow: hidden;
                }

                .atlas-settings-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 3100;
                    background:
                        rgba(
                            3,
                            7,
                            18,
                            0.78
                        );
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter:
                        blur(8px);
                }

                .atlas-settings-sheet {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 3101;
                    max-height: 92vh;
                    overflow-y: auto;
                    -webkit-overflow-scrolling:
                        touch;
                    padding:
                        12px
                        22px
                        calc(
                            24px +
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
                    background: #11192e;
                    box-shadow:
                        0 -20px 60px
                        rgba(
                            0,
                            0,
                            0,
                            0.45
                        );
                    animation:
                        atlasSettingsUp
                        0.24s ease;
                }

                @keyframes atlasSettingsUp {

                    from {
                        opacity: 0;
                        transform:
                            translateY(30px);
                    }

                    to {
                        opacity: 1;
                        transform:
                            translateY(0);
                    }

                }

                .atlas-settings-handle {
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

                .atlas-settings-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .atlas-settings-header h2 {
                    margin: 0;
                    color: #f7f8fc;
                    font-size: 27px;
                    line-height: 1.15;
                }

                .atlas-settings-header p {
                    margin:
                        8px
                        0
                        0;
                    color: #98a2bb;
                    line-height: 1.45;
                }

                .atlas-settings-back {
                    width: 42px;
                    height: 42px;
                    flex: 0 0 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: -5px;
                    border-radius: 14px;
                    color: #f7f8fc;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.06
                        );
                    font-size: 34px;
                }

                .atlas-settings-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .atlas-settings-option {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 16px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.2
                        );
                    border-radius: 20px;
                    background: #19243a;
                    color: #f7f8fc;
                    text-align: left;
                }

                .atlas-settings-option:active {
                    transform:
                        scale(0.985);
                }

                .atlas-settings-icon {
                    width: 48px;
                    height: 48px;
                    flex: 0 0 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                    background:
                        rgba(
                            77,
                            163,
                            255,
                            0.11
                        );
                    font-size: 23px;
                }

                .atlas-settings-option strong {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 16px;
                }

                .atlas-settings-option small {
                    display: block;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .atlas-settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .atlas-settings-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .atlas-settings-field > span {
                    color: #c8d0e3;
                    font-size: 13px;
                    font-weight: 700;
                }

                .atlas-settings-field input,
                .atlas-settings-field select {
                    width: 100%;
                    min-height: 54px;
                    padding:
                        0
                        15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.22
                        );
                    border-radius: 16px;
                    outline: none;
                    background: #19243a;
                    color: #f7f8fc;
                    font-size: 16px;
                }

                .atlas-settings-field input:focus,
                .atlas-settings-field select:focus {
                    border-color: #4da3ff;
                    box-shadow:
                        0 0 0 3px
                        rgba(
                            77,
                            163,
                            255,
                            0.13
                        );
                }

                .atlas-settings-account {
                    padding: 15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius: 18px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                }

                .atlas-settings-account-head {
                    display: flex;
                    justify-content:
                        space-between;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 12px;
                }

                .atlas-settings-account-head small {
                    color: #98a2bb;
                    white-space: nowrap;
                }

                .atlas-settings-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    overflow: hidden;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.14
                        );
                    border-radius: 18px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.03
                        );
                }

                .atlas-settings-summary-row {
                    display: flex;
                    justify-content:
                        space-between;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    background: #19243a;
                }

                .atlas-settings-summary-row span {
                    color: #98a2bb;
                }

                .atlas-budget-card {
                    padding: 15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.17
                        );
                    border-radius: 19px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                }

                .atlas-budget-head {
                    display: flex;
                    align-items: center;
                    justify-content:
                        space-between;
                    gap: 14px;
                    margin-bottom: 14px;
                }

                .atlas-budget-title {
                    min-width: 0;
                }

                .atlas-budget-title strong {
                    display: block;
                    font-size: 16px;
                }

                .atlas-budget-title small {
                    display: block;
                    margin-top: 4px;
                    color: #98a2bb;
                    font-size: 12px;
                }

                .atlas-budget-fields {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr)
                        minmax(0, 1fr);
                    gap: 10px;
                }

                .atlas-budget-toggle {
                    position: relative;
                    width: 52px;
                    height: 30px;
                    flex: 0 0 52px;
                }

                .atlas-budget-toggle input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .atlas-budget-toggle span {
                    position: absolute;
                    inset: 0;
                    border-radius: 99px;
                    background:
                        rgba(
                            145,
                            164,
                            202,
                            0.24
                        );
                    transition:
                        0.2s ease;
                }

                .atlas-budget-toggle span::after {
                    content: "";
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #ffffff;
                    transition:
                        0.2s ease;
                }

                .atlas-budget-toggle input:checked + span {
                    background: #2879ed;
                }

                .atlas-budget-toggle input:checked + span::after {
                    transform:
                        translateX(22px);
                }

                .atlas-budget-recommended {
                    margin-top: 11px;
                    color: #98a2bb;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .atlas-settings-primary,
                .atlas-settings-secondary {
                    width: 100%;
                    min-height: 56px;
                    border-radius: 17px;
                    font-size: 16px;
                    font-weight: 750;
                }

                .atlas-settings-primary {
                    margin-top: 4px;
                    color: #ffffff;
                    background:
                        linear-gradient(
                            135deg,
                            #4da3ff,
                            #2879ed
                        );
                }

                .atlas-settings-primary:disabled {
                    opacity: 0.55;
                }

                .atlas-settings-secondary {
                    margin-top: 10px;
                    color: #98a2bb;
                    background: transparent;
                }

                .atlas-settings-warning {
                    margin: 0;
                    padding: 13px 14px;
                    border-radius: 16px;
                    color: #f4b95e;
                    background:
                        rgba(
                            244,
                            185,
                            94,
                            0.08
                        );
                    border:
                        1px solid
                        rgba(
                            244,
                            185,
                            94,
                            0.17
                        );
                    font-size: 13px;
                    line-height: 1.5;
                }

            </style>

        `;

    },

    renderSheet(content) {

        const root =
            this.root();

        if (!root) {

            return;

        }

        document.body.classList.add(
            "atlas-settings-open"
        );

        root.innerHTML = `

            ${this.styles()}

            <div
                class="atlas-settings-backdrop"
                data-settings-action="close"
            ></div>

            <section
                class="atlas-settings-sheet"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="atlas-settings-handle"
                ></div>

                ${content}

            </section>

        `;

    },

    optionButton(
        section,
        icon,
        title,
        description
    ) {

        return `

            <button
                class="atlas-settings-option"
                type="button"
                data-settings-section="${section}"
            >

                <span
                    class="atlas-settings-icon"
                >
                    ${icon}
                </span>

                <span>

                    <strong>
                        ${title}
                    </strong>

                    <small>
                        ${description}
                    </small>

                </span>

            </button>

        `;

    },

    renderMenu() {

        const canEditInitialBalances =
            !this.hasMovements();

        this.renderSheet(`

            <div class="atlas-settings-header">

                <div>

                    <h2>
                        Configurar Atlas
                    </h2>

                    <p>
                        Modifica tus datos y preferencias financieras.
                    </p>

                </div>

            </div>

            <div class="atlas-settings-menu">

                ${
                    canEditInitialBalances
                        ? this.optionButton(
                            "initial_balances",
                            "💶",
                            "Saldos iniciales",
                            "Introduce o corrige liquidez, inversiones y deudas antes de registrar movimientos."
                        )
                        : ""
                }

                ${this.optionButton(
                    "goal",
                    "🎯",
                    "Objetivo de ahorro",
                    "Cambia el porcentaje mensual que quieres ahorrar."
                )}

                ${this.optionButton(
                    "budgets",
                    "📊",
                    "Presupuestos",
                    "Configura el límite mensual de cada categoría de gasto."
                )}

                ${this.optionButton(
                    "accounts",
                    "🏦",
                    "Nombres de cuentas",
                    "Cambia cómo aparecen tus cuentas en Atlas."
                )}

                ${this.optionButton(
                    "investments",
                    "📈",
                    "Valor de inversiones",
                    "Actualiza cuánto valen actualmente tus inversiones."
                )}

                ${this.optionButton(
                    "snapshot",
                    "📸",
                    "Cierre mensual",
                    "Guarda liquidez, inversiones, deuda y patrimonio del mes."
                )}

            </div>

            <button
                class="atlas-settings-secondary"
                type="button"
                data-settings-action="close"
            >
                Cerrar
            </button>

        `);

    },

    headerBlock(
        title,
        description
    ) {

        return `

            <div class="atlas-settings-header">

                <button
                    class="atlas-settings-back"
                    type="button"
                    data-settings-action="menu"
                    aria-label="Volver"
                >
                    ‹
                </button>

                <div>

                    <h2>
                        ${title}
                    </h2>

                    <p>
                        ${description}
                    </p>

                </div>

            </div>

        `;

    },

    openInitialBalances() {

        if (this.hasMovements()) {

            AtlasUI.toast(
                "Los saldos iniciales ya están bloqueados."
            );

            this.renderMenu();

            return;

        }

        const callback =
            this.onComplete;

        const currentData =
            this.data;

        this.close();

        AtlasSetup.openInitialBalances(
            currentData,
            updatedData => {

                this.data =
                    updatedData;

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        updatedData
                    );

                }

            }
        );

    },

    renderSavingGoal() {

        const goal =
            this.number(
                this.data.settings
                    ?.monthlySavingGoal
            );

        this.renderSheet(`

            ${this.headerBlock(
                "Objetivo de ahorro",
                "Puedes modificar este objetivo en cualquier momento."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="goal"
            >

                <label class="atlas-settings-field">

                    <span>
                        Porcentaje mensual
                    </span>

                    <input
                        name="monthlySavingGoal"
                        type="number"
                        inputmode="decimal"
                        min="0"
                        max="100"
                        step="0.5"
                        value="${this.escape(
                            goal
                        )}"
                        required
                    >

                </label>

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Guardar objetivo
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    budgetCard(category) {

        const budget =
            this.findCategoryBudget(
                category.id
            ) || {};

        const mode =
            budget.mode ||
            "percentage";

        const active =
            budget.active !== false;

        const recommended =
            this.number(
                budget.recommendedPercent ??
                category.recommendedPercent
            );

        const target =
            this.number(
                budget.targetPercent ??
                recommended
            );

        const fixed =
            this.number(
                budget.fixedAmount
            );

        return `

            <div
                class="atlas-budget-card"
                data-budget-card="${this.escape(
                    category.id
                )}"
            >

                <div class="atlas-budget-head">

                    <div class="atlas-budget-title">

                        <strong>
                            ${this.escape(
                                category.icon
                            )}
                            ${this.escape(
                                category.name
                            )}
                        </strong>

                        <small>
                            Recomendado:
                            ${recommended}%
                        </small>

                    </div>

                    <label class="atlas-budget-toggle">

                        <input
                            name="budget_active_${this.escape(
                                category.id
                            )}"
                            type="checkbox"
                            ${
                                active
                                    ? "checked"
                                    : ""
                            }
                        >

                        <span></span>

                    </label>

                </div>

                <div class="atlas-budget-fields">

                    <label class="atlas-settings-field">

                        <span>
                            Tipo de límite
                        </span>

                        <select
                            name="budget_mode_${this.escape(
                                category.id
                            )}"
                            data-budget-mode="${this.escape(
                                category.id
                            )}"
                        >

                            <option
                                value="percentage"
                                ${
                                    mode ===
                                    "percentage"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Porcentaje
                            </option>

                            <option
                                value="fixed"
                                ${
                                    mode ===
                                        "fixed" ||
                                    mode ===
                                        "fixed_amount"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Importe fijo
                            </option>

                        </select>

                    </label>

                    <label class="atlas-settings-field">

                        <span
                            data-budget-value-label="${this.escape(
                                category.id
                            )}"
                        >
                            ${
                                mode === "percentage"
                                    ? "Porcentaje"
                                    : "Importe mensual"
                            }
                        </span>

                        <input
                            name="budget_value_${this.escape(
                                category.id
                            )}"
                            type="number"
                            inputmode="decimal"
                            min="0"
                            step="0.5"
                            value="${this.escape(
                                mode === "percentage"
                                    ? target
                                    : fixed
                            )}"
                            required
                        >

                    </label>

                </div>

                <div class="atlas-budget-recommended">

                    Con porcentaje, el límite cambia según
                    los ingresos reales del mes. Con importe
                    fijo, el límite se mantiene estable.

                </div>

            </div>

        `;

    },

    renderBudgets() {

        const categories =
            this.expenseCategories()
                .filter(
                    category =>
                        category.active !== false
                )
                .sort(
                    (a, b) =>
                        this.number(a.order) -
                        this.number(b.order)
                );

        this.renderSheet(`

            ${this.headerBlock(
                "Presupuestos",
                "Configura el límite mensual de cada categoría."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="budgets"
            >

                <p class="atlas-settings-warning">

                    Los presupuestos solo sirven como guía.
                    Atlas no bloqueará un gasto aunque se
                    supere el límite.

                </p>

                ${categories
                    .map(
                        category =>
                            this.budgetCard(
                                category
                            )
                    )
                    .join("")}

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="restoreBudgets"
                    style="
                        margin-top:0;
                        border:
                            1px solid
                            rgba(
                                145,
                                164,
                                202,
                                0.16
                            );
                    "
                >
                    Restaurar recomendados
                </button>

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Guardar presupuestos
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    renderAccountNames() {

        const groups = [

            {
                title: "Liquidez",
                accounts:
                    this.liquidityAccounts()
            },

            {
                title: "Inversiones",
                accounts:
                    this.investmentAccounts()
            },

            {
                title: "Deudas",
                accounts:
                    this.debtAccounts()
            }

        ];

        this.renderSheet(`

            ${this.headerBlock(
                "Nombres de cuentas",
                "Cambiar el nombre no modifica saldos ni movimientos."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="accounts"
            >

                ${groups
                    .map(
                        group => `

                            <div>

                                <strong
                                    style="
                                        display:block;
                                        margin-bottom:10px;
                                    "
                                >
                                    ${group.title}
                                </strong>

                                <div
                                    style="
                                        display:flex;
                                        flex-direction:column;
                                        gap:10px;
                                    "
                                >

                                    ${group.accounts
                                        .map(
                                            account => `

                                                <label
                                                    class="atlas-settings-field"
                                                >

                                                    <span>
                                                        ${this.escape(
                                                            account.name
                                                        )}
                                                    </span>

                                                    <input
                                                        name="account_${this.escape(
                                                            account.id
                                                        )}"
                                                        type="text"
                                                        value="${this.escape(
                                                            account.name
                                                        )}"
                                                        maxlength="50"
                                                        required
                                                    >

                                                </label>

                                            `
                                        )
                                        .join("")}

                                </div>

                            </div>

                        `
                    )
                    .join("")}

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Guardar nombres
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    renderInvestmentValues() {

        const accounts =
            this.investmentAccounts();

        this.renderSheet(`

            ${this.headerBlock(
                "Valor de inversiones",
                "Actualiza el valor actual sin registrar un ingreso."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="investments"
            >

                ${accounts
                    .map(
                        account => {

                            const invested =
                                this.number(
                                    account.invested
                                );

                            const value =
                                this.number(
                                    account.balance
                                );

                            const gain =
                                value -
                                invested;

                            return `

                                <div
                                    class="atlas-settings-account"
                                >

                                    <div
                                        class="atlas-settings-account-head"
                                    >

                                        <strong>
                                            ${this.escape(
                                                account.name
                                            )}
                                        </strong>

                                        <small>
                                            ${
                                                gain >= 0
                                                    ? "+"
                                                    : ""
                                            }${this.formatCurrency(
                                                gain
                                            )}
                                        </small>

                                    </div>

                                    <div
                                        class="atlas-settings-summary"
                                        style="
                                            margin-bottom:12px;
                                        "
                                    >

                                        <div
                                            class="atlas-settings-summary-row"
                                        >

                                            <span>
                                                Capital aportado
                                            </span>

                                            <strong>
                                                ${this.formatCurrency(
                                                    invested
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    <label
                                        class="atlas-settings-field"
                                    >

                                        <span>
                                            Valor actual
                                        </span>

                                        <input
                                            name="investment_${this.escape(
                                                account.id
                                            )}"
                                            type="number"
                                            inputmode="decimal"
                                            min="0"
                                            step="0.01"
                                            value="${this.escape(
                                                value
                                            )}"
                                            required
                                        >

                                    </label>

                                </div>

                            `;

                        }
                    )
                    .join("")}

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Actualizar valores
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    snapshotTotals(
        data = this.data
    ) {

        const liquidity =
            this.liquidityAccounts(data)
                .reduce(
                    (total, account) =>
                        total +
                        this.number(
                            account.balance
                        ),
                    0
                );

        const investments =
            this.investmentAccounts(data)
                .reduce(
                    (total, account) =>
                        total +
                        this.number(
                            account.balance
                        ),
                    0
                );

        const investedCapital =
            this.investmentAccounts(data)
                .reduce(
                    (total, account) =>
                        total +
                        this.number(
                            account.invested
                        ),
                    0
                );

        const debt =
            this.debtAccounts(data)
                .reduce(
                    (total, account) =>
                        total +
                        Math.max(
                            0,
                            this.number(
                                account.balance
                            )
                        ),
                    0
                );

        return {

            liquidity,

            investments,

            investedCapital,

            investmentGain:
                investments -
                investedCapital,

            debt,

            netWorth:
                liquidity +
                investments -
                debt

        };

    },

    renderSnapshot() {

        const monthKey =
            this.currentMonthKey();

        const totals =
            this.snapshotTotals();

        const existing =
            Array.isArray(
                this.data.snapshots
            )
                ? this.data.snapshots.find(
                    snapshot =>
                        snapshot.monthKey ===
                        monthKey
                )
                : null;

        this.renderSheet(`

            ${this.headerBlock(
                "Cierre mensual",
                "Guarda una fotografía de tus saldos para las tendencias."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="snapshot"
            >

                <label class="atlas-settings-field">

                    <span>
                        Mes del cierre
                    </span>

                    <input
                        name="monthKey"
                        type="month"
                        value="${this.escape(
                            monthKey
                        )}"
                        max="${this.escape(
                            monthKey
                        )}"
                        required
                    >

                </label>

                <div class="atlas-settings-summary">

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Liquidez
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.liquidity
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Inversiones
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.investments
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Ganancia inversiones
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.investmentGain
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Deuda
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.debt
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Patrimonio neto
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.netWorth
                            )}
                        </strong>

                    </div>

                </div>

                ${
                    existing
                        ? `

                            <p class="atlas-settings-warning">
                                Ya existe un cierre para
                                ${this.formatMonthKey(
                                    monthKey
                                )}.
                                Al guardar se actualizará.
                            </p>

                        `
                        : ""
                }

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    ${
                        existing
                            ? "Actualizar cierre"
                            : "Guardar cierre mensual"
                    }
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    disableSaveButton(form) {

        const button =
            form.querySelector(
                "[data-settings-save]"
            );

        if (!button) {

            return;

        }

        button.disabled =
            true;

        button.dataset.previousText =
            button.textContent;

        button.textContent =
            "Guardando…";

    },

    restoreSaveButton(form) {

        const button =
            form.querySelector(
                "[data-settings-save]"
            );

        if (!button) {

            return;

        }

        button.disabled =
            false;

        button.textContent =
            button.dataset.previousText ||
            "Guardar";

    },

    saveUpdatedData(
        updatedData,
        message,
        form
    ) {

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "No se pudieron guardar los cambios."
            );

            return false;

        }

        this.data =
            AtlasStorage.load();

        const callback =
            this.onComplete;

        this.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                this.data
            );

        }

        AtlasUI.toast(
            message
        );

        return true;

    },

    saveGoal(form) {

        const values =
            new FormData(form);

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

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "Introduce un objetivo entre 0 y 100."
            );

            return;

        }

        const updatedData =
            this.cloneData();

        updatedData.settings =
            updatedData.settings || {};

        updatedData.settings
            .monthlySavingGoal =
            goal;

        this.saveUpdatedData(
            updatedData,
            "Objetivo actualizado.",
            form
        );

    },

    saveBudgets(form) {

        const values =
            new FormData(form);

        const updatedData =
            this.cloneData();

        const categories =
            updatedData.catalog
                ?.categories
                ?.expense || [];

        const budgets =
            updatedData.catalog
                ?.budgets;

        if (!budgets) {

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "No se encontró la configuración de presupuestos."
            );

            return;

        }

        if (
            !Array.isArray(
                budgets.categoryBudgets
            )
        ) {

            budgets.categoryBudgets =
                [];

        }

        let totalPercentage = 0;

        for (
            const category of
            categories
        ) {

            let budget =
                budgets.categoryBudgets
                    .find(
                        item =>
                            item.categoryId ===
                            category.id
                    );

            if (!budget) {

                budget = {

                    categoryId:
                        category.id,

                    mode:
                        "percentage",

                    recommendedPercent:
                        this.number(
                            category.recommendedPercent
                        ),

                    targetPercent:
                        this.number(
                            category.recommendedPercent
                        ),

                    fixedAmount:
                        null,

                    active:
                        false,

                    subcategories:
                        []

                };

                budgets.categoryBudgets
                    .push(budget);

            }

            const active =
                values.has(
                    `budget_active_${category.id}`
                );

            const mode =
                String(
                    values.get(
                        `budget_mode_${category.id}`
                    ) ||
                    "percentage"
                );

            const value =
                Number(
                    values.get(
                        `budget_value_${category.id}`
                    )
                );

            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                this.saving =
                    false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    `Revisa el presupuesto de ${category.name}.`
                );

                return;

            }

            budget.active =
                active;

            if (
                mode === "fixed"
            ) {

                budget.mode =
                    "fixed";

                budget.fixedAmount =
                    value;

            } else {

                if (value > 100) {

                    this.saving =
                        false;

                    this.restoreSaveButton(
                        form
                    );

                    AtlasUI.toast(
                        `El porcentaje de ${category.name} no puede superar el 100%.`
                    );

                    return;

                }

                budget.mode =
                    "percentage";

                budget.targetPercent =
                    value;

                if (active) {

                    totalPercentage +=
                        value;

                }

            }

        }

        if (
            totalPercentage > 100
        ) {

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "La suma de los presupuestos porcentuales supera el 100%."
            );

            return;

        }

        updatedData.catalog.updatedAt =
            new Date()
                .toISOString();

        this.saveUpdatedData(
            updatedData,
            "Presupuestos actualizados.",
            form
        );

    },

    saveAccountNames(form) {

        const values =
            new FormData(form);

        const updatedData =
            this.cloneData();

        updatedData.accounts.forEach(
            account => {

                const value =
                    String(
                        values.get(
                            `account_${account.id}`
                        ) || ""
                    ).trim();

                if (value) {

                    account.name =
                        value;

                    account.updatedAt =
                        new Date()
                            .toISOString();

                }

            }
        );

        this.saveUpdatedData(
            updatedData,
            "Nombres actualizados.",
            form
        );

    },

    saveInvestmentValues(form) {

        const values =
            new FormData(form);

        const updatedData =
            this.cloneData();

        const accounts =
            this.investmentAccounts(
                updatedData
            );

        for (
            const account of
            accounts
        ) {

            const value =
                Number(
                    values.get(
                        `investment_${account.id}`
                    )
                );

            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                this.saving =
                    false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    "Introduce valores de inversión válidos."
                );

                return;

            }

            account.balance =
                value;

            account.valueUpdatedAt =
                new Date()
                    .toISOString();

            account.updatedAt =
                new Date()
                    .toISOString();

        }

        this.saveUpdatedData(
            updatedData,
            "Valores de inversión actualizados.",
            form
        );

    },

    createSnapshot(
        data,
        monthKey
    ) {

        const totals =
            this.snapshotTotals(
                data
            );

        const now =
            new Date()
                .toISOString();

        return {

            id:
                `snapshot_${monthKey}`,

            type:
                "calendar_month",

            monthKey,

            liquidity:
                totals.liquidity,

            investments:
                totals.investments,

            investedCapital:
                totals.investedCapital,

            investmentGain:
                totals.investmentGain,

            debt:
                totals.debt,

            netWorth:
                totals.netWorth,

            accounts:
                data.accounts.map(
                    account => ({

                        accountId:
                            account.id,

                        group:
                            account.group,

                        balance:
                            this.number(
                                account.balance
                            ),

                        invested:
                            this.number(
                                account.invested
                            )

                    })
                ),

            investmentAccounts:
                this.investmentAccounts(
                    data
                ).map(
                    account => ({

                        accountId:
                            account.id,

                        invested:
                            this.number(
                                account.invested
                            ),

                        value:
                            this.number(
                                account.balance
                            ),

                        gain:
                            this.number(
                                account.balance
                            ) -
                            this.number(
                                account.invested
                            )

                    })
                ),

            createdAt:
                now,

            updatedAt:
                now

        };

    },

    saveSnapshot(form) {

        const values =
            new FormData(form);

        const monthKey =
            String(
                values.get(
                    "monthKey"
                ) || ""
            );

        if (
            !/^\d{4}-\d{2}$/.test(
                monthKey
            )
        ) {

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "Selecciona un mes válido."
            );

            return;

        }

        if (
            monthKey >
            this.currentMonthKey()
        ) {

            this.saving =
                false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "No puedes guardar un cierre futuro."
            );

            return;

        }

        const updatedData =
            this.cloneData();

        if (
            !Array.isArray(
                updatedData.snapshots
            )
        ) {

            updatedData.snapshots =
                [];

        }

        const existingIndex =
            updatedData.snapshots
                .findIndex(
                    snapshot =>
                        snapshot.monthKey ===
                        monthKey &&
                        snapshot.type ===
                        "calendar_month"
                );

        const snapshot =
            this.createSnapshot(
                updatedData,
                monthKey
            );

        if (existingIndex >= 0) {

            snapshot.createdAt =
                updatedData.snapshots[
                    existingIndex
                ].createdAt ||
                snapshot.createdAt;

            updatedData.snapshots[
                existingIndex
            ] = snapshot;

        } else {

            updatedData.snapshots.push(
                snapshot
            );

        }

        updatedData.snapshots.sort(
            (a, b) =>
                String(
                    a.monthKey
                ).localeCompare(
                    String(
                        b.monthKey
                    )
                )
        );

        this.saveUpdatedData(
            updatedData,
            "Cierre mensual guardado.",
            form
        );

    },

    restoreRecommendedBudgets() {

        const updatedData =
            this.cloneData();

        const categories =
            updatedData.catalog
                ?.categories
                ?.expense || [];

        const budgets =
            updatedData.catalog
                ?.budgets;

        if (!budgets) {

            return;

        }

        budgets.categoryBudgets =
            categories.map(
                category => {

                    const current =
                        budgets.categoryBudgets
                            ?.find(
                                item =>
                                    item.categoryId ===
                                    category.id
                            );

                    return {

                        categoryId:
                            category.id,

                        mode:
                            "percentage",

                        recommendedPercent:
                            this.number(
                                category.recommendedPercent
                            ),

                        targetPercent:
                            this.number(
                                category.recommendedPercent
                            ),

                        fixedAmount:
                            null,

                        active:
                            this.number(
                                category.recommendedPercent
                            ) > 0,

                        subcategories:
                            Array.isArray(
                                current?.subcategories
                            )
                                ? current.subcategories
                                : []

                    };

                }
            );

        this.data =
            updatedData;

        this.renderBudgets();

        AtlasUI.toast(
            "Valores recomendados restaurados. Pulsa Guardar presupuestos."
        );

    },

    updateBudgetMode(select) {

        const categoryId =
            select.dataset
                .budgetMode;

        const card =
            select.closest(
                "[data-budget-card]"
            );

        if (!card) {

            return;

        }

        const label =
            card.querySelector(
                `[data-budget-value-label="${categoryId}"]`
            );

        const input =
            card.querySelector(
                `[name="budget_value_${categoryId}"]`
            );

        if (
            !label ||
            !input
        ) {

            return;

        }

        if (
            select.value ===
            "fixed"
        ) {

            label.textContent =
                "Importe mensual";

            input.step =
                "0.01";

            const currentValue =
                Number(
                    input.value
                );

            if (
                !Number.isFinite(
                    currentValue
                )
            ) {

                input.value =
                    "0";

            }

        } else {

            label.textContent =
                "Porcentaje";

            input.step =
                "0.5";

            const category =
                this.expenseCategories()
                    .find(
                        item =>
                            item.id ===
                            categoryId
                    );

            if (
                Number(input.value) >
                100
            ) {

                input.value =
                    String(
                        this.number(
                            category
                                ?.recommendedPercent
                        )
                    );

            }

        }

    },

    submit(form) {

        if (this.saving) {

            return;

        }

        this.saving =
            true;

        this.disableSaveButton(
            form
        );

        const type =
            form.dataset
                .settingsForm;

        switch (type) {

            case "goal":

                this.saveGoal(form);

                break;

            case "budgets":

                this.saveBudgets(form);

                break;

            case "accounts":

                this.saveAccountNames(
                    form
                );

                break;

            case "investments":

                this.saveInvestmentValues(
                    form
                );

                break;

            case "snapshot":

                this.saveSnapshot(form);

                break;

            default:

                this.saving =
                    false;

                this.restoreSaveButton(
                    form
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
            "atlas-settings-open"
        );

        this.saving =
            false;

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const sectionButton =
                    event.target.closest(
                        "[data-settings-section]"
                    );

                if (sectionButton) {

                    this.open(
                        this.data,
                        this.onComplete,
                        sectionButton.dataset
                            .settingsSection
                    );

                    return;

                }

                const actionButton =
                    event.target.closest(
                        "[data-settings-action]"
                    );

                if (!actionButton) {

                    return;

                }

                const action =
                    actionButton.dataset
                        .settingsAction;

                if (
                    action === "close"
                ) {

                    this.close();

                    return;

                }

                if (
                    action === "menu"
                ) {

                    this.renderMenu();

                    return;

                }

                if (
                    action ===
                    "restoreBudgets"
                ) {

                    const confirmed =
                        window.confirm(
                            "¿Restaurar todos los presupuestos recomendados?"
                        );

                    if (confirmed) {

                        this.restoreRecommendedBudgets();

                    }

                }

            }
        );

        document.addEventListener(
            "change",
            event => {

                const budgetMode =
                    event.target.closest(
                        "[data-budget-mode]"
                    );

                if (budgetMode) {

                    this.updateBudgetMode(
                        budgetMode
                    );

                }

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-settings-form]"
                    );

                if (!form) {

                    return;

                }

                event.preventDefault();

                this.submit(form);

            }
        );

    }

};

AtlasSettings.bindEvents();

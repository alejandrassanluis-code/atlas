/* ==========================================================
   ATLAS
   settings.js
   Atlas v1.0 — Ajustes con movimientos recurrentes
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

            case "recurring":
                this.renderRecurringRules();
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

        const result = Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    nullableNumber(value) {

        const text =
            String(
                value ?? ""
            ).trim();

        if (!text) {

            return null;

        }

        const number =
            Number(
                text.replace(
                    ",",
                    "."
                )
            );

        return Number.isFinite(number)
            ? number
            : null;

    },

    round(value) {

        return Math.round(
            this.number(value) * 100
        ) / 100;

    },

    now() {

        return new Date()
            .toISOString();

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

        const now = new Date();

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

    expenseCategories(
        data = this.data
    ) {

        const categories =
            data?.catalog
                ?.categories
                ?.expense;

        return Array.isArray(categories)
            ? categories
            : [];

    },

    categoryBudgets(
        data = this.data
    ) {

        const budgets =
            data?.catalog
                ?.budgets
                ?.categoryBudgets;

        return Array.isArray(budgets)
            ? budgets
            : [];

    },

    recurringRules(
        data = this.data
    ) {

        const rules =
            data?.catalog
                ?.recurringRules;

        return Array.isArray(rules)
            ? rules
            : [];

    },

    findCategoryBudget(
        categoryId,
        data = this.data
    ) {

        return this
            .categoryBudgets(data)
            .find(
                budget =>
                    budget.categoryId ===
                    categoryId
            ) || null;

    },

    findSubcategoryBudget(
        categoryId,
        subcategoryId,
        data = this.data
    ) {

        const categoryBudget =
            this.findCategoryBudget(
                categoryId,
                data
            );

        if (
            !Array.isArray(
                categoryBudget
                    ?.subcategories
            )
        ) {

            return null;

        }

        return (
            categoryBudget
                .subcategories
                .find(
                    budget =>
                        budget.subcategoryId ===
                        subcategoryId
                ) ||
            null
        );

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
                    margin: 8px 0 0;
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

                .atlas-settings-menu,
                .atlas-settings-form {
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
                    transform: scale(0.985);
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
                    padding: 0 15px;
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

                .atlas-settings-account,
                .atlas-budget-card,
                .atlas-recurring-card {
                    padding: 15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
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

                .atlas-settings-account-head,
                .atlas-budget-head,
                .atlas-recurring-head {
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

                .atlas-budget-title,
                .atlas-recurring-title {
                    min-width: 0;
                }

                .atlas-budget-title strong,
                .atlas-recurring-title strong {
                    display: block;
                    font-size: 16px;
                }

                .atlas-budget-title small,
                .atlas-recurring-title small {
                    display: block;
                    margin-top: 4px;
                    color: #98a2bb;
                    font-size: 12px;
                    line-height: 1.4;
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
                    transition: 0.2s ease;
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
                    transition: 0.2s ease;
                }

                .atlas-budget-toggle
                input:checked + span {
                    background: #2879ed;
                }

                .atlas-budget-toggle
                input:checked + span::after {
                    transform:
                        translateX(22px);
                }

                .atlas-budget-fields,
                .atlas-recurring-fields {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                }

                .atlas-budget-distribution {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.12
                        );
                }

                .atlas-budget-subcategories {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    margin-top: 12px;
                }

                .atlas-budget-subcategory {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr)
                        112px;
                    align-items: center;
                    gap: 10px;
                    padding: 11px;
                    border-radius: 15px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.035
                        );
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.1
                        );
                }

                .atlas-budget-subcategory strong {
                    display: block;
                    font-size: 13px;
                    line-height: 1.3;
                }

                .atlas-budget-subcategory small {
                    display: block;
                    margin-top: 3px;
                    color: #98a2bb;
                    font-size: 11px;
                }

                .atlas-budget-subcategory input {
                    width: 100%;
                    min-height: 44px;
                    padding: 0 10px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.2
                        );
                    border-radius: 13px;
                    outline: none;
                    background: #19243a;
                    color: #f7f8fc;
                    font-size: 15px;
                    text-align: right;
                }

                .atlas-budget-help,
                .atlas-recurring-help {
                    margin-top: 10px;
                    color: #98a2bb;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .atlas-recurring-card {
                    transition:
                        opacity
                        0.2s ease;
                }

                .atlas-recurring-card[data-inactive="true"] {
                    opacity: 0.72;
                }

                .atlas-recurring-fields {
                    margin-top: 12px;
                }

                .atlas-recurring-fields .atlas-settings-field {
                    min-width: 0;
                }

                .atlas-recurring-wide {
                    grid-column:
                        1 / -1;
                }

                .atlas-recurring-checkboxes {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 9px;
                    margin-top: 12px;
                }

                .atlas-recurring-checkbox {
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 11px 12px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.14
                        );
                    border-radius: 14px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                    color: #c8d0e3;
                    font-size: 12px;
                    font-weight: 650;
                }

                .atlas-recurring-checkbox input {
                    width: 18px;
                    height: 18px;
                    flex: 0 0 18px;
                    accent-color: #4da3ff;
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

                @media (
                    max-width: 390px
                ) {

                    .atlas-settings-sheet {
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .atlas-budget-fields,
                    .atlas-recurring-fields,
                    .atlas-recurring-checkboxes {
                        grid-template-columns:
                            minmax(0, 1fr);
                    }

                    .atlas-recurring-wide {
                        grid-column: auto;
                    }

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
                            "Introduce o corrige tus saldos antes de registrar movimientos."
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
                    "Configura categorías y subcategorías de gasto."
                )}

                ${this.optionButton(
                    "recurring",
                    "🔁",
                    "Recurrentes",
                    "Configura nómina, alquiler, cuotas, seguros y otros movimientos periódicos."
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
                    "Guarda liquidez, inversiones, deuda y patrimonio."
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

    automaticSubcategoryValue(
        category,
        categoryValue,
        subcategory
    ) {

        const subcategories =
            (
                category.subcategories ||
                []
            ).filter(
                item =>
                    item.active !== false
            );

        const totalWeight =
            subcategories.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Math.max(
                        0,
                        this.number(
                            item.recommendedPercent
                        )
                    ),
                0
            );

        if (
            totalWeight <= 0
        ) {

            return 0;

        }

        const weight =
            Math.max(
                0,
                this.number(
                    subcategory
                        .recommendedPercent
                )
            );

        return this.round(
            this.number(
                categoryValue
            ) *
            (
                weight /
                totalWeight
            )
        );

    },

    budgetSubcategoryRows(
        category,
        budget,
        mode,
        distributionMode
    ) {

        const categoryValue =
            mode === "percentage"
                ? this.number(
                    budget.targetPercent ??
                    category.recommendedPercent
                )
                : this.number(
                    budget.fixedAmount
                );

        return (
            category.subcategories || []
        )
            .filter(
                subcategory =>
                    subcategory.active !==
                    false
            )
            .map(
                subcategory => {

                    const saved =
                        this.findSubcategoryBudget(
                            category.id,
                            subcategory.id
                        );

                    const automaticValue =
                        this.automaticSubcategoryValue(
                            category,
                            categoryValue,
                            subcategory
                        );

                    let value =
                        automaticValue;

                    if (
                        distributionMode ===
                        "manual"
                    ) {

                        value =
                            mode ===
                            "percentage"
                                ? this.number(
                                    saved
                                        ?.targetPercent ??
                                    automaticValue
                                )
                                : this.number(
                                    saved
                                        ?.fixedAmount ??
                                    automaticValue
                                );

                    }

                    return `

                        <div
                            class="atlas-budget-subcategory"
                        >

                            <div>

                                <strong>
                                    ${this.escape(
                                        subcategory.icon
                                    )}
                                    ${this.escape(
                                        subcategory.name
                                    )}
                                </strong>

                                <small>
                                    Recomendado:
                                    ${this.number(
                                        subcategory
                                            .recommendedPercent
                                    )}%
                                </small>

                            </div>

                            <input
                                name="subcategory_value_${this.escape(
                                    category.id
                                )}_${this.escape(
                                    subcategory.id
                                )}"
                                type="number"
                                inputmode="decimal"
                                min="0"
                                step="${
                                    mode ===
                                    "percentage"
                                        ? "0.1"
                                        : "0.01"
                                }"
                                value="${this.escape(
                                    value
                                )}"
                                ${
                                    distributionMode ===
                                    "automatic"
                                        ? "readonly"
                                        : ""
                                }
                                data-budget-subcategory-input
                            >

                        </div>

                    `;

                }
            )
            .join("");

    },

    budgetCard(category) {

        const budget =
            this.findCategoryBudget(
                category.id
            ) || {};

        const mode =
            budget.mode === "fixed" ||
            budget.mode ===
                "fixed_amount"
                ? "fixed"
                : "percentage";

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

        const distributionMode =
            budget.distributionMode ||
            "automatic";

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
                                    "fixed"
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
                                mode ===
                                "percentage"
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
                            step="${
                                mode ===
                                "percentage"
                                    ? "0.5"
                                    : "0.01"
                            }"
                            value="${this.escape(
                                mode ===
                                "percentage"
                                    ? target
                                    : fixed
                            )}"
                            required
                            data-budget-category-value="${this.escape(
                                category.id
                            )}"
                        >

                    </label>

                </div>

                <div class="atlas-budget-distribution">

                    <label class="atlas-settings-field">

                        <span>
                            Reparto entre subcategorías
                        </span>

                        <select
                            name="budget_distribution_${this.escape(
                                category.id
                            )}"
                            data-budget-distribution="${this.escape(
                                category.id
                            )}"
                        >

                            <option
                                value="automatic"
                                ${
                                    distributionMode ===
                                    "automatic"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Automático proporcional
                            </option>

                            <option
                                value="manual"
                                ${
                                    distributionMode ===
                                    "manual"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Manual
                            </option>

                        </select>

                    </label>

                    <div
                        class="atlas-budget-subcategories"
                        data-budget-subcategories="${this.escape(
                            category.id
                        )}"
                    >

                        ${this.budgetSubcategoryRows(
                            category,
                            budget,
                            mode,
                            distributionMode
                        )}

                    </div>

                    <div class="atlas-budget-help">

                        ${
                            distributionMode ===
                            "automatic"
                                ? "Atlas reparte el límite proporcionalmente según los valores recomendados."
                                : "La suma de las subcategorías no puede superar el límite de la categoría."
                        }

                    </div>

                </div>

            </div>

        `;

    },

    renderBudgets() {

        const categories =
            this.expenseCategories()
                .filter(
                    category =>
                        category.active !==
                        false
                )
                .sort(
                    (a, b) =>
                        this.number(a.order) -
                        this.number(b.order)
                );

        this.renderSheet(`

            ${this.headerBlock(
                "Presupuestos",
                "Configura categorías y reparte cada límite entre sus subcategorías."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="budgets"
            >

                <p class="atlas-settings-warning">

                    Los presupuestos son orientativos.
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

    recurringKind(rule) {

        return (
            rule?.kind ||
            rule?.type ||
            "expense"
        );

    },

    recurringKindLabel(rule) {

        const labels = {

            income:
                "Ingreso",

            expense:
                "Gasto",

            investment:
                "Inversión",

            transfer:
                "Traspaso",

            debt_payment:
                "Pago de deuda",

            reimbursement:
                "Reembolso"

        };

        return (
            labels[
                this.recurringKind(
                    rule
                )
            ] ||
            "Movimiento"
        );

    },

    recurringIcon(rule) {

        const icons = {

            income:
                "🟢",

            expense:
                "🔴",

            investment:
                "📈",

            transfer:
                "🔁",

            debt_payment:
                "💳",

            reimbursement:
                "↩️"

        };

        return (
            icons[
                this.recurringKind(
                    rule
                )
            ] ||
            "🔁"
        );

    },

    recurringFrequencyLabel(rule) {

        if (
            rule.recurrence ===
            "selected_months"
        ) {

            const monthNames = [
                "",
                "ene",
                "feb",
                "mar",
                "abr",
                "may",
                "jun",
                "jul",
                "ago",
                "sep",
                "oct",
                "nov",
                "dic"
            ];

            const months =
                (
                    Array.isArray(
                        rule.months
                    )
                        ? rule.months
                        : []
                )
                    .map(
                        month =>
                            monthNames[
                                Number(month)
                            ]
                    )
                    .filter(Boolean)
                    .join(", ");

            return months
                ? `Meses: ${months}`
                : "Meses concretos";

        }

        if (
            rule.recurrence ===
            "yearly"
        ) {

            return "Anual";

        }

        return "Mensual";

    },

    recurringAmountMode(rule) {

        const allowed = [

            "fixed",

            "last_amount",

            "average",

            "average_amount",

            "by_month"

        ];

        return allowed.includes(
            rule.amountMode
        )
            ? rule.amountMode
            : "fixed";

    },

    recurringAccountOptions(
        accounts,
        selectedId,
        emptyLabel
    ) {

        return `

            <option value="">
                ${emptyLabel}
            </option>

            ${accounts
                .filter(
                    account =>
                        account.active !==
                        false
                )
                .map(
                    account => `

                        <option
                            value="${this.escape(
                                account.id
                            )}"
                            ${
                                account.id ===
                                selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${this.escape(
                                account.name
                            )}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    recurringDateFields(rule) {

        const dueRule =
            rule.dueRule ||
            "fixed_day";

        if (
            dueRule ===
            "last_working_friday"
        ) {

            return `

                <label
                    class="
                        atlas-settings-field
                        atlas-recurring-wide
                    "
                >

                    <span>
                        Fecha prevista
                    </span>

                    <select
                        name="recurring_due_rule_${this.escape(
                            rule.id
                        )}"
                    >

                        <option value="last_working_friday" selected>
                            Último viernes laborable
                        </option>

                        <option value="fixed_day">
                            Día fijo
                        </option>

                        <option value="day_range">
                            Rango aproximado
                        </option>

                        <option value="end_of_month">
                            Fin de mes
                        </option>

                    </select>

                </label>

            `;

        }

        if (
            dueRule ===
            "day_range"
        ) {

            return `

                <label class="atlas-settings-field">

                    <span>
                        Tipo de fecha
                    </span>

                    <select
                        name="recurring_due_rule_${this.escape(
                            rule.id
                        )}"
                    >

                        <option value="day_range" selected>
                            Rango aproximado
                        </option>

                        <option value="fixed_day">
                            Día fijo
                        </option>

                        <option value="end_of_month">
                            Fin de mes
                        </option>

                        <option value="last_working_friday">
                            Último viernes laborable
                        </option>

                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Días del mes
                    </span>

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    2,
                                    minmax(0,1fr)
                                );
                            gap:8px;
                        "
                    >

                        <input
                            name="recurring_due_from_${this.escape(
                                rule.id
                            )}"
                            type="number"
                            min="1"
                            max="31"
                            step="1"
                            value="${this.escape(
                                this.number(
                                    rule.dueDayFrom
                                ) || 1
                            )}"
                            aria-label="Día inicial"
                        >

                        <input
                            name="recurring_due_to_${this.escape(
                                rule.id
                            )}"
                            type="number"
                            min="1"
                            max="31"
                            step="1"
                            value="${this.escape(
                                this.number(
                                    rule.dueDayTo
                                ) || 7
                            )}"
                            aria-label="Día final"
                        >

                    </div>

                </label>

            `;

        }

        if (
            dueRule ===
            "end_of_month"
        ) {

            return `

                <label class="atlas-settings-field">

                    <span>
                        Tipo de fecha
                    </span>

                    <select
                        name="recurring_due_rule_${this.escape(
                            rule.id
                        )}"
                    >

                        <option value="end_of_month" selected>
                            Fin de mes
                        </option>

                        <option value="fixed_day">
                            Día fijo
                        </option>

                        <option value="day_range">
                            Rango aproximado
                        </option>

                        <option value="last_working_friday">
                            Último viernes laborable
                        </option>

                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Días antes del final
                    </span>

                    <input
                        name="recurring_days_before_end_${this.escape(
                            rule.id
                        )}"
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value="${this.escape(
                            this.number(
                                rule.daysBeforeEnd
                            )
                        )}"
                    >

                </label>

            `;

        }

        return `

            <label class="atlas-settings-field">

                <span>
                    Tipo de fecha
                </span>

                <select
                    name="recurring_due_rule_${this.escape(
                        rule.id
                    )}"
                >

                    <option value="fixed_day" selected>
                        Día fijo
                    </option>

                    <option value="day_range">
                        Rango aproximado
                    </option>

                    <option value="end_of_month">
                        Fin de mes
                    </option>

                    <option value="last_working_friday">
                        Último viernes laborable
                    </option>

                </select>

            </label>

            <label class="atlas-settings-field">

                <span>
                    Día del mes
                </span>

                <input
                    name="recurring_due_day_${this.escape(
                        rule.id
                    )}"
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    value="${this.escape(
                        this.number(
                            rule.dueDay
                        ) || 1
                    )}"
                >

            </label>

        `;

    },

    recurringAccountFields(rule) {

        const kind =
            this.recurringKind(
                rule
            );

        if (
            kind ===
            "debt_payment"
        ) {

            return `

                <label class="atlas-settings-field">

                    <span>
                        Cuenta de pago
                    </span>

                    <select
                        name="recurring_account_${this.escape(
                            rule.id
                        )}"
                    >
                        ${this.recurringAccountOptions(
                            this.liquidityAccounts(),
                            rule.accountId ||
                            rule.fromAccountId ||
                            "",
                            "Seleccionar cuenta"
                        )}
                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Deuda
                    </span>

                    <select
                        name="recurring_debt_account_${this.escape(
                            rule.id
                        )}"
                    >
                        ${this.recurringAccountOptions(
                            this.debtAccounts(),
                            rule.debtAccountId ||
                            rule.toAccountId ||
                            "",
                            "Seleccionar deuda"
                        )}
                    </select>

                </label>

            `;

        }

        if (
            kind ===
                "investment" ||
            kind ===
                "transfer"
        ) {

            const destinationAccounts =
                kind === "investment"
                    ? this.investmentAccounts()
                    : this.liquidityAccounts();

            return `

                <label class="atlas-settings-field">

                    <span>
                        Cuenta de origen
                    </span>

                    <select
                        name="recurring_from_account_${this.escape(
                            rule.id
                        )}"
                    >
                        ${this.recurringAccountOptions(
                            this.liquidityAccounts(),
                            rule.fromAccountId ||
                            rule.accountId ||
                            "",
                            "Seleccionar cuenta"
                        )}
                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Cuenta de destino
                    </span>

                    <select
                        name="recurring_to_account_${this.escape(
                            rule.id
                        )}"
                    >
                        ${this.recurringAccountOptions(
                            destinationAccounts,
                            rule.toAccountId ||
                            "",
                            "Seleccionar destino"
                        )}
                    </select>

                </label>

            `;

        }

        return `

            <label
                class="
                    atlas-settings-field
                    atlas-recurring-wide
                "
            >

                <span>
                    Cuenta
                </span>

                <select
                    name="recurring_account_${this.escape(
                        rule.id
                    )}"
                >
                    ${this.recurringAccountOptions(
                        this.liquidityAccounts(),
                        rule.accountId ||
                        "",
                        "Seleccionar cuenta"
                    )}
                </select>

            </label>

        `;

    },

    recurringRuleCard(rule) {

        const amountMode =
            this.recurringAmountMode(
                rule
            );

        const active =
            rule.active !==
            false;

        const paused =
            rule.paused ===
            true;

        const amount =
            rule.amount ===
                null ||
            rule.amount ===
                undefined
                ? ""
                : this.number(
                    rule.amount
                );

        return `

            <article
                class="atlas-recurring-card"
                data-recurring-card="${this.escape(
                    rule.id
                )}"
                data-inactive="${
                    active
                        ? "false"
                        : "true"
                }"
            >

                <div class="atlas-recurring-head">

                    <div class="atlas-recurring-title">

                        <strong>
                            ${this.recurringIcon(
                                rule
                            )}
                            ${this.escape(
                                rule.name
                            )}
                        </strong>

                        <small>
                            ${this.recurringKindLabel(
                                rule
                            )}
                            ·
                            ${this.recurringFrequencyLabel(
                                rule
                            )}
                        </small>

                    </div>

                    <label class="atlas-budget-toggle">

                        <input
                            name="recurring_active_${this.escape(
                                rule.id
                            )}"
                            type="checkbox"
                            data-recurring-active="${this.escape(
                                rule.id
                            )}"
                            ${
                                active
                                    ? "checked"
                                    : ""
                            }
                        >

                        <span></span>

                    </label>

                </div>

                <div class="atlas-recurring-fields">

                    <label class="atlas-settings-field">

                        <span>
                            Cálculo del importe
                        </span>

                        <select
                            name="recurring_amount_mode_${this.escape(
                                rule.id
                            )}"
                        >

                            <option
                                value="fixed"
                                ${
                                    amountMode ===
                                    "fixed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Importe fijo
                            </option>

                            <option
                                value="last_amount"
                                ${
                                    amountMode ===
                                    "last_amount"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Último importe
                            </option>

                            <option
                                value="average"
                                ${
                                    amountMode ===
                                        "average" ||
                                    amountMode ===
                                        "average_amount"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Media histórica
                            </option>

                            ${
                                rule.recurrence ===
                                "selected_months"
                                    ? `

                                        <option
                                            value="by_month"
                                            ${
                                                amountMode ===
                                                "by_month"
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            Distinto por mes
                                        </option>

                                    `
                                    : ""
                            }

                        </select>

                    </label>

                    <label class="atlas-settings-field">

                        <span>
                            Importe habitual
                        </span>

                        <input
                            name="recurring_amount_${this.escape(
                                rule.id
                            )}"
                            type="number"
                            inputmode="decimal"
                            min="0"
                            step="0.01"
                            value="${this.escape(
                                amount
                            )}"
                            placeholder="Sin configurar"
                        >

                    </label>

                    ${this.recurringAccountFields(
                        rule
                    )}

                    ${this.recurringDateFields(
                        rule
                    )}

                    <label class="atlas-settings-field">

                        <span>
                            Fecha de inicio
                        </span>

                        <input
                            name="recurring_start_${this.escape(
                                rule.id
                            )}"
                            type="date"
                            value="${this.escape(
                                rule.startDate ||
                                ""
                            )}"
                        >

                    </label>

                    <label class="atlas-settings-field">

                        <span>
                            Fecha de finalización
                        </span>

                        <input
                            name="recurring_end_${this.escape(
                                rule.id
                            )}"
                            type="date"
                            value="${this.escape(
                                rule.endDate ||
                                ""
                            )}"
                        >

                    </label>

                    <label
                        class="
                            atlas-settings-field
                            atlas-recurring-wide
                        "
                    >

                        <span>
                            Pausar hasta
                        </span>

                        <input
                            name="recurring_paused_until_${this.escape(
                                rule.id
                            )}"
                            type="month"
                            value="${this.escape(
                                rule.pausedUntil
                                    ? String(
                                        rule.pausedUntil
                                    ).slice(
                                        0,
                                        7
                                    )
                                    : ""
                            )}"
                        >

                    </label>

                </div>

                <div class="atlas-recurring-checkboxes">

                    <label class="atlas-recurring-checkbox">

                        <input
                            name="recurring_paused_${this.escape(
                                rule.id
                            )}"
                            type="checkbox"
                            ${
                                paused
                                    ? "checked"
                                    : ""
                            }
                        >

                        Pausada

                    </label>

                    <label class="atlas-recurring-checkbox">

                        <input
                            name="recurring_confirmation_${this.escape(
                                rule.id
                            )}"
                            type="checkbox"
                            ${
                                rule.requiresConfirmation !==
                                false
                                    ? "checked"
                                    : ""
                            }
                        >

                        Confirmación obligatoria

                    </label>

                </div>

                <p class="atlas-recurring-help">

                    ${
                        active
                            ? "Atlas propondrá este movimiento en Pendientes cuando tenga importe y cuenta configurados."
                            : "La regla está desactivada y no generará propuestas."
                    }

                </p>

            </article>

        `;

    },

    renderRecurringRules() {

        const rules =
            this.recurringRules();

        this.renderSheet(`

            ${this.headerBlock(
                "Movimientos recurrentes",
                "Configura las propuestas que aparecerán en Movimientos → Pendientes."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="recurring"
            >

                <p class="atlas-settings-warning">

                    Ninguna regla modifica saldos,
                    presupuestos ni análisis hasta que
                    confirmes su movimiento pendiente.

                </p>

                ${
                    rules.length > 0
                        ? rules
                            .map(
                                rule =>
                                    this.recurringRuleCard(
                                        rule
                                    )
                            )
                            .join("")
                        : `

                            <div
                                class="atlas-settings-account"
                                style="
                                    text-align:center;
                                    color:#98a2bb;
                                    line-height:1.5;
                                "
                            >
                                No hay reglas recurrentes configuradas.
                            </div>

                        `
                }

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Guardar recurrentes
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

                    <div class="atlas-settings-summary-row">

                        <span>
                            Liquidez
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.liquidity
                            )}
                        </strong>

                    </div>

                    <div class="atlas-settings-summary-row">

                        <span>
                            Inversiones
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.investments
                            )}
                        </strong>

                    </div>

                    <div class="atlas-settings-summary-row">

                        <span>
                            Ganancia inversiones
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.investmentGain
                            )}
                        </strong>

                    </div>

                    <div class="atlas-settings-summary-row">

                        <span>
                            Deuda
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                totals.debt
                            )}
                        </strong>

                    </div>

                    <div class="atlas-settings-summary-row">

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

        button.disabled = true;

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

        button.disabled = false;

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

            this.saving = false;

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

            this.saving = false;

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

    ensureBudget(
        budgets,
        category
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

                distributionMode:
                    "automatic",

                recommendedPercent:
                    this.number(
                        category
                            .recommendedPercent
                    ),

                targetPercent:
                    this.number(
                        category
                            .recommendedPercent
                    ),

                fixedAmount:
                    null,

                active:
                    this.number(
                        category
                            .recommendedPercent
                    ) > 0,

                subcategories: []

            };

            budgets.categoryBudgets
                .push(budget);

        }

        if (
            !Array.isArray(
                budget.subcategories
            )
        ) {

            budget.subcategories = [];

        }

        return budget;

    },

    automaticSubcategoryBudgets(
        category,
        categoryBudget,
        mode,
        categoryValue,
        active
    ) {

        const subcategories =
            (
                category.subcategories ||
                []
            ).filter(
                subcategory =>
                    subcategory.active !==
                    false
            );

        const totalWeight =
            subcategories.reduce(
                (
                    total,
                    subcategory
                ) =>
                    total +
                    Math.max(
                        0,
                        this.number(
                            subcategory
                                .recommendedPercent
                        )
                    ),
                0
            );

        return subcategories.map(
            subcategory => {

                const weight =
                    Math.max(
                        0,
                        this.number(
                            subcategory
                                .recommendedPercent
                        )
                    );

                const value =
                    totalWeight > 0
                        ? this.round(
                            categoryValue *
                            (
                                weight /
                                totalWeight
                            )
                        )
                        : 0;

                return {

                    subcategoryId:
                        subcategory.id,

                    mode,

                    recommendedPercent:
                        this.number(
                            subcategory
                                .recommendedPercent
                        ),

                    targetPercent:
                        mode ===
                        "percentage"
                            ? value
                            : this.number(
                                subcategory
                                    .recommendedPercent
                            ),

                    fixedAmount:
                        mode ===
                        "fixed"
                            ? value
                            : null,

                    active:
                        active &&
                        value > 0

                };

            }
        );

    },

    manualSubcategoryBudgets(
        formValues,
        category,
        mode,
        categoryValue,
        active
    ) {

        const result = [];

        let total = 0;

        for (
            const subcategory of
            category.subcategories || []
        ) {

            if (
                subcategory.active ===
                false
            ) {

                continue;

            }

            const field =
                `subcategory_value_${category.id}_${subcategory.id}`;

            const value =
                Number(
                    formValues.get(
                        field
                    )
                );

            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                return {

                    error:
                        `Revisa ${subcategory.name} en ${category.name}.`

                };

            }

            total += value;

            result.push({

                subcategoryId:
                    subcategory.id,

                mode,

                recommendedPercent:
                    this.number(
                        subcategory
                            .recommendedPercent
                    ),

                targetPercent:
                    mode ===
                    "percentage"
                        ? value
                        : this.number(
                            subcategory
                                .recommendedPercent
                        ),

                fixedAmount:
                    mode ===
                    "fixed"
                        ? value
                        : null,

                active:
                    active &&
                    value > 0

            });

        }

        if (
            total >
            categoryValue + 0.001
        ) {

            return {

                error:
                    `Las subcategorías de ${category.name} suman más que el límite de la categoría.`

            };

        }

        return {

            budgets: result

        };

    },

    saveBudgets(form) {

        const values =
            new FormData(form);

        const updatedData =
            this.cloneData();

        const categories =
            this.expenseCategories(
                updatedData
            );

        const budgets =
            updatedData.catalog
                ?.budgets;

        if (!budgets) {

            this.saving = false;

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

            budgets.categoryBudgets = [];

        }

        let totalPercentage = 0;

        for (
            const category of
            categories
        ) {

            const budget =
                this.ensureBudget(
                    budgets,
                    category
                );

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
                ) === "fixed"
                    ? "fixed"
                    : "percentage";

            const categoryValue =
                Number(
                    values.get(
                        `budget_value_${category.id}`
                    )
                );

            const distributionMode =
                String(
                    values.get(
                        `budget_distribution_${category.id}`
                    ) ||
                    "automatic"
                ) === "manual"
                    ? "manual"
                    : "automatic";

            if (
                !Number.isFinite(
                    categoryValue
                ) ||
                categoryValue < 0
            ) {

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    `Revisa el presupuesto de ${category.name}.`
                );

                return;

            }

            if (
                mode ===
                    "percentage" &&
                categoryValue > 100
            ) {

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    `El porcentaje de ${category.name} no puede superar el 100%.`
                );

                return;

            }

            budget.active = active;
            budget.mode = mode;
            budget.distributionMode =
                distributionMode;

            if (
                mode ===
                "percentage"
            ) {

                budget.targetPercent =
                    categoryValue;

                budget.fixedAmount =
                    null;

                if (active) {

                    totalPercentage +=
                        categoryValue;

                }

            } else {

                budget.fixedAmount =
                    categoryValue;

            }

            if (
                distributionMode ===
                "automatic"
            ) {

                budget.subcategories =
                    this.automaticSubcategoryBudgets(
                        category,
                        budget,
                        mode,
                        categoryValue,
                        active
                    );

            } else {

                const manual =
                    this.manualSubcategoryBudgets(
                        values,
                        category,
                        mode,
                        categoryValue,
                        active
                    );

                if (manual.error) {

                    this.saving = false;

                    this.restoreSaveButton(
                        form
                    );

                    AtlasUI.toast(
                        manual.error
                    );

                    return;

                }

                budget.subcategories =
                    manual.budgets;

            }

        }

        if (
            totalPercentage > 100
        ) {

            this.saving = false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "La suma de los presupuestos porcentuales supera el 100%."
            );

            return;

        }

        updatedData.catalog.updatedAt =
            this.now();

        this.saveUpdatedData(
            updatedData,
            "Presupuestos actualizados.",
            form
        );

    },

    saveRecurringRules(form) {

        const values =
            new FormData(
                form
            );

        const updatedData =
            this.cloneData();

        const rules =
            this.recurringRules(
                updatedData
            );

        for (
            const rule of rules
        ) {

            const id =
                rule.id;

            const active =
                values.has(
                    `recurring_active_${id}`
                );

            const paused =
                values.has(
                    `recurring_paused_${id}`
                );

            const requiresConfirmation =
                values.has(
                    `recurring_confirmation_${id}`
                );

            const amountModeValue =
                String(
                    values.get(
                        `recurring_amount_mode_${id}`
                    ) ||
                    "fixed"
                );

            const allowedAmountModes = [

                "fixed",

                "last_amount",

                "average",

                "by_month"

            ];

            const amountMode =
                allowedAmountModes.includes(
                    amountModeValue
                )
                    ? amountModeValue
                    : "fixed";

            const amount =
                this.nullableNumber(
                    values.get(
                        `recurring_amount_${id}`
                    )
                );

            if (
                amount !== null &&
                amount < 0
            ) {

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    `Revisa el importe de ${rule.name}.`
                );

                return;

            }

            const dueRuleValue =
                String(
                    values.get(
                        `recurring_due_rule_${id}`
                    ) ||
                    rule.dueRule ||
                    "fixed_day"
                );

            const allowedDueRules = [

                "fixed_day",

                "day_range",

                "end_of_month",

                "last_working_friday"

            ];

            const dueRule =
                allowedDueRules.includes(
                    dueRuleValue
                )
                    ? dueRuleValue
                    : "fixed_day";

            const dueDay =
                this.nullableNumber(
                    values.get(
                        `recurring_due_day_${id}`
                    )
                );

            const dueDayFrom =
                this.nullableNumber(
                    values.get(
                        `recurring_due_from_${id}`
                    )
                );

            const dueDayTo =
                this.nullableNumber(
                    values.get(
                        `recurring_due_to_${id}`
                    )
                );

            const daysBeforeEnd =
                this.nullableNumber(
                    values.get(
                        `recurring_days_before_end_${id}`
                    )
                );

            const startDate =
                String(
                    values.get(
                        `recurring_start_${id}`
                    ) ||
                    ""
                );

            const endDate =
                String(
                    values.get(
                        `recurring_end_${id}`
                    ) ||
                    ""
                );

            if (
                startDate &&
                endDate &&
                startDate >
                endDate
            ) {

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    `La fecha final de ${rule.name} es anterior a la inicial.`
                );

                return;

            }

            const pausedUntil =
                String(
                    values.get(
                        `recurring_paused_until_${id}`
                    ) ||
                    ""
                );

            const kind =
                this.recurringKind(
                    rule
                );

            const accountId =
                String(
                    values.get(
                        `recurring_account_${id}`
                    ) ||
                    ""
                ) || null;

            const fromAccountId =
                String(
                    values.get(
                        `recurring_from_account_${id}`
                    ) ||
                    ""
                ) || null;

            const toAccountId =
                String(
                    values.get(
                        `recurring_to_account_${id}`
                    ) ||
                    ""
                ) || null;

            const debtAccountId =
                String(
                    values.get(
                        `recurring_debt_account_${id}`
                    ) ||
                    ""
                ) || null;

            rule.active =
                active;

            rule.paused =
                paused;

            rule.pausedUntil =
                pausedUntil ||
                null;

            rule.requiresConfirmation =
                requiresConfirmation;

            rule.amountMode =
                amountMode;

            rule.amount =
                amount;

            rule.dueRule =
                dueRule;

            rule.startDate =
                startDate ||
                null;

            rule.endDate =
                endDate ||
                null;

            if (
                dueRule ===
                "fixed_day"
            ) {

                rule.dueDay =
                    Math.max(
                        1,
                        Math.min(
                            31,
                            this.number(
                                dueDay
                            ) || 1
                        )
                    );

            }

            if (
                dueRule ===
                "day_range"
            ) {

                const from =
                    Math.max(
                        1,
                        Math.min(
                            31,
                            this.number(
                                dueDayFrom
                            ) || 1
                        )
                    );

                const to =
                    Math.max(
                        from,
                        Math.min(
                            31,
                            this.number(
                                dueDayTo
                            ) || from
                        )
                    );

                rule.dueDayFrom =
                    from;

                rule.dueDayTo =
                    to;

            }

            if (
                dueRule ===
                "end_of_month"
            ) {

                rule.daysBeforeEnd =
                    Math.max(
                        0,
                        Math.min(
                            30,
                            this.number(
                                daysBeforeEnd
                            )
                        )
                    );

            }

            if (
                kind ===
                "debt_payment"
            ) {

                rule.accountId =
                    accountId;

                rule.fromAccountId =
                    accountId;

                rule.debtAccountId =
                    debtAccountId;

                rule.toAccountId =
                    debtAccountId;

            } else if (
                kind ===
                    "investment" ||
                kind ===
                    "transfer"
            ) {

                rule.accountId =
                    null;

                rule.fromAccountId =
                    fromAccountId;

                rule.toAccountId =
                    toAccountId;

            } else {

                rule.accountId =
                    accountId;

                rule.fromAccountId =
                    null;

                rule.toAccountId =
                    null;

            }

            rule.updatedAt =
                this.now();

        }

        updatedData.catalog.updatedAt =
            this.now();

        this.saveUpdatedData(
            updatedData,
            "Movimientos recurrentes actualizados.",
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

                    account.name = value;

                    account.updatedAt =
                        this.now();

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
            const account of accounts
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

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                AtlasUI.toast(
                    "Introduce valores de inversión válidos."
                );

                return;

            }

            account.balance = value;

            account.valueUpdatedAt =
                this.now();

            account.updatedAt =
                this.now();

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
            this.snapshotTotals(data);

        const now =
            this.now();

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

            createdAt: now,
            updatedAt: now

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

            this.saving = false;

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

            this.saving = false;

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

            updatedData.snapshots = [];

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
            this.expenseCategories(
                updatedData
            );

        const budgets =
            updatedData.catalog
                ?.budgets;

        if (!budgets) {
            return;
        }

        budgets.categoryBudgets =
            categories.map(
                category => {

                    const categoryValue =
                        this.number(
                            category
                                .recommendedPercent
                        );

                    const budget = {

                        categoryId:
                            category.id,

                        mode:
                            "percentage",

                        distributionMode:
                            "automatic",

                        recommendedPercent:
                            categoryValue,

                        targetPercent:
                            categoryValue,

                        fixedAmount:
                            null,

                        active:
                            categoryValue > 0,

                        subcategories: []

                    };

                    budget.subcategories =
                        this.automaticSubcategoryBudgets(
                            category,
                            budget,
                            "percentage",
                            categoryValue,
                            categoryValue > 0
                        );

                    return budget;

                }
            );

        this.data = updatedData;

        this.renderBudgets();

        AtlasUI.toast(
            "Valores recomendados restaurados. Pulsa Guardar presupuestos."
        );

    },

    updateBudgetCard(categoryId) {

        const card =
            document.querySelector(
                `[data-budget-card="${categoryId}"]`
            );

        if (!card) {
            return;
        }

        const category =
            this.expenseCategories()
                .find(
                    item =>
                        item.id ===
                        categoryId
                );

        if (!category) {
            return;
        }

        const modeSelect =
            card.querySelector(
                `[data-budget-mode="${categoryId}"]`
            );

        const distributionSelect =
            card.querySelector(
                `[data-budget-distribution="${categoryId}"]`
            );

        const categoryInput =
            card.querySelector(
                `[data-budget-category-value="${categoryId}"]`
            );

        const label =
            card.querySelector(
                `[data-budget-value-label="${categoryId}"]`
            );

        const container =
            card.querySelector(
                `[data-budget-subcategories="${categoryId}"]`
            );

        if (
            !modeSelect ||
            !distributionSelect ||
            !categoryInput ||
            !label ||
            !container
        ) {

            return;

        }

        const mode =
            modeSelect.value ===
            "fixed"
                ? "fixed"
                : "percentage";

        const distributionMode =
            distributionSelect.value ===
            "manual"
                ? "manual"
                : "automatic";

        label.textContent =
            mode === "percentage"
                ? "Porcentaje"
                : "Importe mensual";

        categoryInput.step =
            mode === "percentage"
                ? "0.5"
                : "0.01";

        const categoryValue =
            this.number(
                categoryInput.value
            );

        const budget =
            this.findCategoryBudget(
                categoryId
            ) || {

                targetPercent:
                    categoryValue,

                fixedAmount:
                    categoryValue,

                subcategories: []

            };

        if (
            mode ===
            "percentage"
        ) {

            budget.targetPercent =
                categoryValue;

        } else {

            budget.fixedAmount =
                categoryValue;

        }

        container.innerHTML =
            this.budgetSubcategoryRows(
                category,
                budget,
                mode,
                distributionMode
            );

        const help =
            card.querySelector(
                ".atlas-budget-help"
            );

        if (help) {

            help.textContent =
                distributionMode ===
                "automatic"
                    ? "Atlas reparte el límite proporcionalmente según los valores recomendados."
                    : "La suma de las subcategorías no puede superar el límite de la categoría.";

        }

    },

    updateRecurringCard(ruleId) {

        const card =
            document.querySelector(
                `[data-recurring-card="${ruleId}"]`
            );

        if (!card) {

            return;

        }

        const activeInput =
            card.querySelector(
                `[data-recurring-active="${ruleId}"]`
            );

        const active =
            activeInput?.checked ===
            true;

        card.dataset.inactive =
            active
                ? "false"
                : "true";

        const help =
            card.querySelector(
                ".atlas-recurring-help"
            );

        if (help) {

            help.textContent =
                active
                    ? "Atlas propondrá este movimiento en Pendientes cuando tenga importe y cuenta configurados."
                    : "La regla está desactivada y no generará propuestas.";

        }

    },

    submit(form) {

        if (this.saving) {
            return;
        }

        this.saving = true;

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

            case "recurring":
                this.saveRecurringRules(
                    form
                );
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

                this.saving = false;

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

        this.saving = false;

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

                const mode =
                    event.target.closest(
                        "[data-budget-mode]"
                    );

                if (mode) {

                    this.updateBudgetCard(
                        mode.dataset
                            .budgetMode
                    );

                    return;

                }

                const distribution =
                    event.target.closest(
                        "[data-budget-distribution]"
                    );

                if (distribution) {

                    this.updateBudgetCard(
                        distribution.dataset
                            .budgetDistribution
                    );

                    return;

                }

                const recurringActive =
                    event.target.closest(
                        "[data-recurring-active]"
                    );

                if (recurringActive) {

                    this.updateRecurringCard(
                        recurringActive.dataset
                            .recurringActive
                    );

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const categoryInput =
                    event.target.closest(
                        "[data-budget-category-value]"
                    );

                if (!categoryInput) {
                    return;
                }

                const card =
                    categoryInput.closest(
                        "[data-budget-card]"
                    );

                const distribution =
                    card?.querySelector(
                        "[data-budget-distribution]"
                    );

                if (
                    distribution?.value ===
                    "automatic"
                ) {

                    this.updateBudgetCard(
                        categoryInput.dataset
                            .budgetCategoryValue
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

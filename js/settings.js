/* ==========================================================
   ATLAS
   settings.js
   Atlas v1.0 — Ajustes y movimientos recurrentes
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

            case "recurring_new":
                this.renderNewRecurringRule();
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

    nullableNumber(value) {

        const text =
            String(
                value ?? ""
            )
                .trim()
                .replace(",", ".");

        if (!text) {

            return null;

        }

        const result =
            Number(text);

        return Number.isFinite(result)
            ? result
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

    createId(prefix = "item") {

        if (
            typeof AtlasCatalog
                ?.createId ===
            "function"
        ) {

            return AtlasCatalog
                .createId(prefix);

        }

        return [
            prefix,
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

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

        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(2, "0")
        ].join("-");

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
                (first, second) =>
                    this.number(
                        first.order
                    ) -
                    this.number(
                        second.order
                    )
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

    incomeCategories(
        data = this.data
    ) {

        const categories =
            data?.catalog
                ?.categories
                ?.income;

        return Array.isArray(categories)
            ? categories
            : [];

    },

    categoriesForKind(
        kind,
        data = this.data
    ) {

        if (kind === "income") {

            return this
                .incomeCategories(data)
                .filter(
                    category =>
                        category.active !==
                        false
                );

        }

        if (kind === "expense") {

            return this
                .expenseCategories(data)
                .filter(
                    category =>
                        category.active !==
                        false
                );

        }

        return [];

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

        return categoryBudget
            .subcategories
            .find(
                budget =>
                    budget.subcategoryId ===
                    subcategoryId
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
                    min-width: 0;
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
                    box-sizing: border-box;
                    width: 100%;
                    min-width: 0;
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
                .atlas-recurring-card,
                .atlas-recurring-create-card {
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

                .atlas-budget-fields {
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
                    box-sizing: border-box;
                    width: 100%;
                    min-width: 0;
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
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr);
                    gap: 11px;
                    margin-top: 12px;
                }

                .atlas-recurring-row {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                }

                .atlas-recurring-advanced {
                    margin-top: 12px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.14
                        );
                    border-radius: 16px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.02
                        );
                    overflow: hidden;
                }

                .atlas-recurring-advanced summary {
                    min-height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content:
                        space-between;
                    gap: 12px;
                    padding: 0 14px;
                    color: #c8d0e3;
                    font-size: 14px;
                    font-weight: 750;
                    cursor: pointer;
                    list-style: none;
                }

                .atlas-recurring-advanced summary::-webkit-details-marker {
                    display: none;
                }

                .atlas-recurring-advanced summary::after {
                    content: "⌄";
                    color: #98a2bb;
                    font-size: 18px;
                    transition:
                        transform
                        0.2s ease;
                }

                .atlas-recurring-advanced[open]
                summary::after {
                    transform:
                        rotate(180deg);
                }

                .atlas-recurring-advanced-content {
                    display: flex;
                    flex-direction: column;
                    gap: 11px;
                    padding:
                        0
                        12px
                        12px;
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

                .atlas-recurring-add {
                    width: 100%;
                    min-height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    border:
                        1px dashed
                        rgba(
                            77,
                            163,
                            255,
                            0.48
                        );
                    border-radius: 18px;
                    color: #79baff;
                    background:
                        rgba(
                            77,
                            163,
                            255,
                            0.07
                        );
                    font-size: 15px;
                    font-weight: 800;
                }

                .atlas-recurring-delete {
                    width: 100%;
                    min-height: 48px;
                    margin-top: 10px;
                    border-radius: 15px;
                    color: #ff8f9b;
                    background:
                        rgba(
                            255,
                            95,
                            112,
                            0.07
                        );
                    border:
                        1px solid
                        rgba(
                            255,
                            95,
                            112,
                            0.18
                        );
                    font-size: 14px;
                    font-weight: 750;
                }

                .atlas-recurring-months {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0, 1fr)
                        );
                    gap: 8px;
                }

                .atlas-recurring-month {
                    min-height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.14
                        );
                    border-radius: 13px;
                    color: #c8d0e3;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                    font-size: 12px;
                    font-weight: 700;
                }

                .atlas-recurring-month input {
                    width: 16px;
                    height: 16px;
                    accent-color: #4da3ff;
                }

                .atlas-recurring-hidden {
                    display: none !important;
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
                    max-width: 540px
                ) {

                    .atlas-settings-sheet {
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .atlas-budget-fields,
                    .atlas-recurring-row {
                        grid-template-columns:
                            minmax(0, 1fr);
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
                    "Configura y añade movimientos periódicos."
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
        description,
        backAction = "menu"
    ) {

        return `

            <div class="atlas-settings-header">

                <button
                    class="atlas-settings-back"
                    type="button"
                    data-settings-action="${backAction}"
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
            (
                budget.mode === "fixed" ||
                budget.mode ===
                "fixed_amount"
            )
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
                    (first, second) =>
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        )
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
                "Transferencia",

            debt_payment:
                "Pago de deuda"

        };

        return labels[
            this.recurringKind(
                rule
            )
        ] || "Movimiento";

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
                "💳"

        };

        return icons[
            this.recurringKind(
                rule
            )
        ] || "🔁";

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

        const mode =
            rule.amountMode;

        if (
            mode === "average_amount"
        ) {

            return "average";

        }

        return [
            "fixed",
            "last_amount",
            "average"
        ].includes(mode)
            ? mode
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

    recurringCategoryOptions(
        kind,
        selectedId
    ) {

        const categories =
            this.categoriesForKind(
                kind
            );

        return `

            <option value="">
                Seleccionar categoría
            </option>

            ${categories
                .map(
                    category => `

                        <option
                            value="${this.escape(
                                category.id
                            )}"
                            ${
                                category.id ===
                                selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${this.escape(
                                category.icon
                            )}
                            ${this.escape(
                                category.name
                            )}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    recurringSubcategoryOptions(
        kind,
        categoryId,
        selectedId
    ) {

        const category =
            this.categoriesForKind(
                kind
            ).find(
                item =>
                    item.id ===
                    categoryId
            );

        const subcategories =
            (
                category?.subcategories ||
                []
            ).filter(
                item =>
                    item.active !==
                    false
            );

        return `

            <option value="">
                Seleccionar subcategoría
            </option>

            ${subcategories
                .map(
                    subcategory => `

                        <option
                            value="${this.escape(
                                subcategory.id
                            )}"
                            ${
                                subcategory.id ===
                                selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${this.escape(
                                subcategory.icon
                            )}
                            ${this.escape(
                                subcategory.name
                            )}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    recurringCategoryFields(rule) {

        const kind =
            this.recurringKind(
                rule
            );

        if (
            ![
                "income",
                "expense"
            ].includes(kind)
        ) {

            return "";

        }

        return `

            <div class="atlas-recurring-row">

                <label class="atlas-settings-field">

                    <span>
                        Categoría
                    </span>

                    <select
                        name="recurring_category_${this.escape(
                            rule.id
                        )}"
                        data-recurring-category="${this.escape(
                            rule.id
                        )}"
                        data-recurring-kind="${this.escape(
                            kind
                        )}"
                    >
                        ${this.recurringCategoryOptions(
                            kind,
                            rule.categoryId ||
                            ""
                        )}
                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Subcategoría
                    </span>

                    <select
                        name="recurring_subcategory_${this.escape(
                            rule.id
                        )}"
                        data-recurring-subcategory="${this.escape(
                            rule.id
                        )}"
                    >
                        ${this.recurringSubcategoryOptions(
                            kind,
                            rule.categoryId,
                            rule.subcategoryId
                        )}
                    </select>

                </label>

            </div>

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

                <div class="atlas-recurring-row">

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

                </div>

            `;

        }

        if (
            kind ===
            "investment"
        ) {

            return `

                <div class="atlas-recurring-row">

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
                            Inversión de destino
                        </span>

                        <select
                            name="recurring_to_account_${this.escape(
                                rule.id
                            )}"
                        >
                            ${this.recurringAccountOptions(
                                this.investmentAccounts(),
                                rule.toAccountId ||
                                "",
                                "Seleccionar inversión"
                            )}
                        </select>

                    </label>

                </div>

            `;

        }

        if (
            kind ===
            "transfer"
        ) {

            return `

                <div class="atlas-recurring-row">

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
                                this.liquidityAccounts(),
                                rule.toAccountId ||
                                "",
                                "Seleccionar cuenta"
                            )}
                        </select>

                    </label>

                </div>

            `;

        }

        return `

            <label class="atlas-settings-field">

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

    recurringDateFields(rule) {

        const dueRule =
            rule.dueRule ||
            "fixed_day";

        return `

            <label class="atlas-settings-field">

                <span>
                    Fecha habitual
                </span>

                <select
                    name="recurring_due_rule_${this.escape(
                        rule.id
                    )}"
                    data-recurring-due-rule="${this.escape(
                        rule.id
                    )}"
                >

                    <option
                        value="fixed_day"
                        ${
                            dueRule ===
                            "fixed_day"
                                ? "selected"
                                : ""
                        }
                    >
                        Día fijo
                    </option>

                    <option
                        value="day_range"
                        ${
                            dueRule ===
                            "day_range"
                                ? "selected"
                                : ""
                        }
                    >
                        Rango aproximado
                    </option>

                    <option
                        value="end_of_month"
                        ${
                            dueRule ===
                            "end_of_month"
                                ? "selected"
                                : ""
                        }
                    >
                        Fin de mes
                    </option>

                    <option
                        value="last_working_friday"
                        ${
                            dueRule ===
                            "last_working_friday"
                                ? "selected"
                                : ""
                        }
                    >
                        Último viernes laborable
                    </option>

                </select>

            </label>

            <label
                class="
                    atlas-settings-field
                    ${
                        dueRule ===
                        "fixed_day"
                            ? ""
                            : "atlas-recurring-hidden"
                    }
                "
                data-recurring-date-block="${this.escape(
                    rule.id
                )}"
                data-recurring-date-type="fixed_day"
            >

                <span>
                    Día del mes
                </span>

                <input
                    name="recurring_due_day_${this.escape(
                        rule.id
                    )}"
                    type="number"
                    inputmode="numeric"
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

            <div
                class="
                    atlas-recurring-row
                    ${
                        dueRule ===
                        "day_range"
                            ? ""
                            : "atlas-recurring-hidden"
                    }
                "
                data-recurring-date-block="${this.escape(
                    rule.id
                )}"
                data-recurring-date-type="day_range"
            >

                <label class="atlas-settings-field">

                    <span>
                        Desde el día
                    </span>

                    <input
                        name="recurring_due_from_${this.escape(
                            rule.id
                        )}"
                        type="number"
                        inputmode="numeric"
                        min="1"
                        max="31"
                        step="1"
                        value="${this.escape(
                            this.number(
                                rule.dueDayFrom
                            ) || 1
                        )}"
                    >

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Hasta el día
                    </span>

                    <input
                        name="recurring_due_to_${this.escape(
                            rule.id
                        )}"
                        type="number"
                        inputmode="numeric"
                        min="1"
                        max="31"
                        step="1"
                        value="${this.escape(
                            this.number(
                                rule.dueDayTo
                            ) || 7
                        )}"
                    >

                </label>

            </div>

            <label
                class="
                    atlas-settings-field
                    ${
                        dueRule ===
                        "end_of_month"
                            ? ""
                            : "atlas-recurring-hidden"
                    }
                "
                data-recurring-date-block="${this.escape(
                    rule.id
                )}"
                data-recurring-date-type="end_of_month"
            >

                <span>
                    Días antes de finalizar el mes
                </span>

                <input
                    name="recurring_days_before_end_${this.escape(
                        rule.id
                    )}"
                    type="number"
                    inputmode="numeric"
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

    },

    recurringAdvancedFields(rule) {

        return `

            <details class="atlas-recurring-advanced">

                <summary>
                    Opciones avanzadas
                </summary>

                <div
                    class="atlas-recurring-advanced-content"
                >

                    <div class="atlas-recurring-row">

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

                    </div>

                    <label class="atlas-settings-field">

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

                    <label class="atlas-recurring-checkbox">

                        <input
                            name="recurring_paused_${this.escape(
                                rule.id
                            )}"
                            type="checkbox"
                            ${
                                rule.paused ===
                                true
                                    ? "checked"
                                    : ""
                            }
                        >

                        Regla pausada

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

            </details>

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

        const custom =
            rule.custom ===
            true ||
            rule.builtIn ===
            false;

        const amount =
            (
                rule.amount === null ||
                rule.amount === undefined ||
                rule.amount === ""
            )
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
                            ${
                                custom
                                    ? " · Personalizado"
                                    : ""
                            }
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

                    ${
                        custom
                            ? `

                                <label class="atlas-settings-field">

                                    <span>
                                        Nombre
                                    </span>

                                    <input
                                        name="recurring_name_${this.escape(
                                            rule.id
                                        )}"
                                        type="text"
                                        maxlength="60"
                                        value="${this.escape(
                                            rule.name
                                        )}"
                                        required
                                    >

                                </label>

                            `
                            : ""
                    }

                    ${this.recurringCategoryFields(
                        rule
                    )}

                    <div class="atlas-recurring-row">

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
                                        "average"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Media histórica
                                </option>

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

                    </div>

                    ${this.recurringAccountFields(
                        rule
                    )}

                    ${this.recurringDateFields(
                        rule
                    )}

                </div>

                ${this.recurringAdvancedFields(
                    rule
                )}

                <p class="atlas-recurring-help">

                    ${
                        active
                            ? "Atlas generará una propuesta cuando la regla tenga importe y cuentas configuradas."
                            : "La regla está desactivada y no generará propuestas."
                    }

                </p>

                ${
                    custom
                        ? `

                            <button
                                class="atlas-recurring-delete"
                                type="button"
                                data-settings-action="deleteRecurring"
                                data-recurring-id="${this.escape(
                                    rule.id
                                )}"
                            >
                                Eliminar recurrente
                            </button>

                        `
                        : ""
                }

            </article>

        `;

    },

    renderRecurringRules() {

        const rules =
            this.recurringRules()
                .slice()
                .sort(
                    (first, second) =>
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        )
                );

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

                <button
                    class="atlas-recurring-add"
                    type="button"
                    data-settings-section="recurring_new"
                >
                    ＋ Añadir recurrente
                </button>

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

    recurringKindOptions(
        selected = "expense"
    ) {

        const options = [

            {
                value:
                    "income",
                label:
                    "Ingreso"
            },

            {
                value:
                    "expense",
                label:
                    "Gasto"
            },

            {
                value:
                    "investment",
                label:
                    "Inversión"
            },

            {
                value:
                    "transfer",
                label:
                    "Transferencia"
            },

            {
                value:
                    "debt_payment",
                label:
                    "Pago de deuda"
            }

        ];

        return options
            .map(
                option => `

                    <option
                        value="${option.value}"
                        ${
                            option.value ===
                            selected
                                ? "selected"
                                : ""
                        }
                    >
                        ${option.label}
                    </option>

                `
            )
            .join("");

    },

    recurringMonthCheckboxes(
        selectedMonths = []
    ) {

        const months = [

            [1, "Ene"],
            [2, "Feb"],
            [3, "Mar"],
            [4, "Abr"],
            [5, "May"],
            [6, "Jun"],
            [7, "Jul"],
            [8, "Ago"],
            [9, "Sep"],
            [10, "Oct"],
            [11, "Nov"],
            [12, "Dic"]

        ];

        return months
            .map(
                ([number, label]) => `

                    <label class="atlas-recurring-month">

                        <input
                            name="new_recurring_month"
                            type="checkbox"
                            value="${number}"
                            ${
                                selectedMonths
                                    .includes(number)
                                    ? "checked"
                                    : ""
                            }
                        >

                        ${label}

                    </label>

                `
            )
            .join("");

    },

    renderNewRecurringCategoryFields(
        kind = "expense",
        categoryId = "",
        subcategoryId = ""
    ) {

        if (
            ![
                "income",
                "expense"
            ].includes(kind)
        ) {

            return `

                <div
                    data-new-recurring-category-fields
                    class="atlas-recurring-hidden"
                ></div>

            `;

        }

        return `

            <div
                data-new-recurring-category-fields
                class="atlas-recurring-row"
            >

                <label class="atlas-settings-field">

                    <span>
                        Categoría
                    </span>

                    <select
                        name="new_recurring_category"
                        data-new-recurring-category
                    >
                        ${this.recurringCategoryOptions(
                            kind,
                            categoryId
                        )}
                    </select>

                </label>

                <label class="atlas-settings-field">

                    <span>
                        Subcategoría
                    </span>

                    <select
                        name="new_recurring_subcategory"
                        data-new-recurring-subcategory
                    >
                        ${this.recurringSubcategoryOptions(
                            kind,
                            categoryId,
                            subcategoryId
                        )}
                    </select>

                </label>

            </div>

        `;

    },

    renderNewRecurringAccountFields(
        kind = "expense"
    ) {

        if (
            kind ===
            "investment"
        ) {

            return `

                <div
                    data-new-recurring-account-fields
                    class="atlas-recurring-row"
                >

                    <label class="atlas-settings-field">

                        <span>
                            Cuenta de origen
                        </span>

                        <select
                            name="new_recurring_from_account"
                        >
                            ${this.recurringAccountOptions(
                                this.liquidityAccounts(),
                                "",
                                "Seleccionar cuenta"
                            )}
                        </select>

                    </label>

                    <label class="atlas-settings-field">

                        <span>
                            Inversión de destino
                        </span>

                        <select
                            name="new_recurring_to_account"
                        >
                            ${this.recurringAccountOptions(
                                this.investmentAccounts(),
                                "",
                                "Seleccionar inversión"
                            )}
                        </select>

                    </label>

                </div>

            `;

        }

        if (
            kind ===
            "transfer"
        ) {

            return `

                <div
                    data-new-recurring-account-fields
                    class="atlas-recurring-row"
                >

                    <label class="atlas-settings-field">

                        <span>
                            Cuenta de origen
                        </span>

                        <select
                            name="new_recurring_from_account"
                        >
                            ${this.recurringAccountOptions(
                                this.liquidityAccounts(),
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
                            name="new_recurring_to_account"
                        >
                            ${this.recurringAccountOptions(
                                this.liquidityAccounts(),
                                "",
                                "Seleccionar cuenta"
                            )}
                        </select>

                    </label>

                </div>

            `;

        }

        if (
            kind ===
            "debt_payment"
        ) {

            return `

                <div
                    data-new-recurring-account-fields
                    class="atlas-recurring-row"
                >

                    <label class="atlas-settings-field">

                        <span>
                            Cuenta de pago
                        </span>

                        <select
                            name="new_recurring_account"
                        >
                            ${this.recurringAccountOptions(
                                this.liquidityAccounts(),
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
                            name="new_recurring_debt_account"
                        >
                            ${this.recurringAccountOptions(
                                this.debtAccounts(),
                                "",
                                "Seleccionar deuda"
                            )}
                        </select>

                    </label>

                </div>

            `;

        }

        return `

            <div
                data-new-recurring-account-fields
            >

                <label class="atlas-settings-field">

                    <span>
                        Cuenta
                    </span>

                    <select
                        name="new_recurring_account"
                    >
                        ${this.recurringAccountOptions(
                            this.liquidityAccounts(),
                            "",
                            "Seleccionar cuenta"
                        )}
                    </select>

                </label>

            </div>

        `;

    },

    renderNewRecurringRule() {

        this.renderSheet(`

            ${this.headerBlock(
                "Añadir recurrente",
                "Crea una nueva propuesta periódica personalizada.",
                "recurring"
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="recurring_new"
            >

                <div class="atlas-recurring-create-card">

                    <div class="atlas-recurring-fields">

                        <label class="atlas-settings-field">

                            <span>
                                Nombre
                            </span>

                            <input
                                name="new_recurring_name"
                                type="text"
                                maxlength="60"
                                placeholder="Ejemplo: Fondo indexado"
                                required
                            >

                        </label>

                        <label class="atlas-settings-field">

                            <span>
                                Tipo
                            </span>

                            <select
                                name="new_recurring_kind"
                                data-new-recurring-kind
                            >
                                ${this.recurringKindOptions(
                                    "expense"
                                )}
                            </select>

                        </label>

                        ${this.renderNewRecurringCategoryFields(
                            "expense"
                        )}

                        <div class="atlas-recurring-row">

                            <label class="atlas-settings-field">

                                <span>
                                    Cálculo del importe
                                </span>

                                <select
                                    name="new_recurring_amount_mode"
                                >

                                    <option value="fixed">
                                        Importe fijo
                                    </option>

                                    <option value="last_amount">
                                        Último importe
                                    </option>

                                    <option value="average">
                                        Media histórica
                                    </option>

                                </select>

                            </label>

                            <label class="atlas-settings-field">

                                <span>
                                    Importe habitual
                                </span>

                                <input
                                    name="new_recurring_amount"
                                    type="number"
                                    inputmode="decimal"
                                    min="0"
                                    step="0.01"
                                    placeholder="0,00"
                                >

                            </label>

                        </div>

                        <div
                            data-new-recurring-accounts
                        >
                            ${this.renderNewRecurringAccountFields(
                                "expense"
                            )}
                        </div>

                        <label class="atlas-settings-field">

                            <span>
                                Frecuencia
                            </span>

                            <select
                                name="new_recurring_recurrence"
                                data-new-recurring-recurrence
                            >

                                <option value="monthly">
                                    Mensual
                                </option>

                                <option value="selected_months">
                                    Meses concretos
                                </option>

                                <option value="yearly">
                                    Anual
                                </option>

                            </select>

                        </label>

                        <div
                            class="atlas-recurring-hidden"
                            data-new-recurring-months
                        >

                            <span
                                style="
                                    display:block;
                                    margin-bottom:8px;
                                    color:#c8d0e3;
                                    font-size:13px;
                                    font-weight:700;
                                "
                            >
                                Meses
                            </span>

                            <div class="atlas-recurring-months">

                                ${this.recurringMonthCheckboxes()}

                            </div>

                        </div>

                        <label class="atlas-settings-field">

                            <span>
                                Fecha habitual
                            </span>

                            <select
                                name="new_recurring_due_rule"
                                data-new-recurring-due-rule
                            >

                                <option value="fixed_day">
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

                        <label
                            class="atlas-settings-field"
                            data-new-recurring-date-block="fixed_day"
                        >

                            <span>
                                Día del mes
                            </span>

                            <input
                                name="new_recurring_due_day"
                                type="number"
                                inputmode="numeric"
                                min="1"
                                max="31"
                                step="1"
                                value="1"
                            >

                        </label>

                        <div
                            class="
                                atlas-recurring-row
                                atlas-recurring-hidden
                            "
                            data-new-recurring-date-block="day_range"
                        >

                            <label class="atlas-settings-field">

                                <span>
                                    Desde el día
                                </span>

                                <input
                                    name="new_recurring_due_from"
                                    type="number"
                                    inputmode="numeric"
                                    min="1"
                                    max="31"
                                    step="1"
                                    value="1"
                                >

                            </label>

                            <label class="atlas-settings-field">

                                <span>
                                    Hasta el día
                                </span>

                                <input
                                    name="new_recurring_due_to"
                                    type="number"
                                    inputmode="numeric"
                                    min="1"
                                    max="31"
                                    step="1"
                                    value="7"
                                >

                            </label>

                        </div>

                        <label
                            class="
                                atlas-settings-field
                                atlas-recurring-hidden
                            "
                            data-new-recurring-date-block="end_of_month"
                        >

                            <span>
                                Días antes de finalizar el mes
                            </span>

                            <input
                                name="new_recurring_days_before_end"
                                type="number"
                                inputmode="numeric"
                                min="0"
                                max="30"
                                step="1"
                                value="0"
                            >

                        </label>

                    </div>

                    <details class="atlas-recurring-advanced">

                        <summary>
                            Opciones avanzadas
                        </summary>

                        <div
                            class="atlas-recurring-advanced-content"
                        >

                            <div class="atlas-recurring-row">

                                <label class="atlas-settings-field">

                                    <span>
                                        Fecha de inicio
                                    </span>

                                    <input
                                        name="new_recurring_start"
                                        type="date"
                                    >

                                </label>

                                <label class="atlas-settings-field">

                                    <span>
                                        Fecha de finalización
                                    </span>

                                    <input
                                        name="new_recurring_end"
                                        type="date"
                                    >

                                </label>

                            </div>

                            <label class="atlas-settings-field">

                                <span>
                                    Pausar hasta
                                </span>

                                <input
                                    name="new_recurring_paused_until"
                                    type="month"
                                >

                            </label>

                            <label class="atlas-recurring-checkbox">

                                <input
                                    name="new_recurring_paused"
                                    type="checkbox"
                                >

                                Crear la regla pausada

                            </label>

                            <label class="atlas-recurring-checkbox">

                                <input
                                    name="new_recurring_confirmation"
                                    type="checkbox"
                                    checked
                                >

                                Confirmación obligatoria

                            </label>

                        </div>

                    </details>

                </div>

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    Añadir recurrente
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="recurring"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    renderAccountNames() {

        const groups = [

            {
                title:
                    "Liquidez",
                accounts:
                    this.liquidityAccounts()
            },

            {
                title:
                    "Inversiones",
                accounts:
                    this.investmentAccounts()
            },

            {
                title:
                    "Deudas",
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
                ? this.data.snapshots
                    .find(
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
        form,
        closeAfterSave = true
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

        if (closeAfterSave) {

            this.close();

        } else {

            this.saving = false;

        }

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

            budgets:
                result

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

            budget.active =
                active;

            budget.mode =
                mode;

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

    validateRecurringDates(
        startDate,
        endDate,
        ruleName
    ) {

        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            AtlasUI.toast(
                `La fecha final de ${ruleName} es anterior a la inicial.`
            );

            return false;

        }

        return true;

    },

    recurringAccountValues(
        values,
        id,
        kind
    ) {

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

        if (
            kind ===
            "debt_payment"
        ) {

            return {

                accountId,

                fromAccountId:
                    accountId,

                toAccountId:
                    debtAccountId,

                debtAccountId

            };

        }

        if (
            [
                "investment",
                "transfer"
            ].includes(kind)
        ) {

            return {

                accountId:
                    null,

                fromAccountId,

                toAccountId,

                debtAccountId:
                    null

            };

        }

        return {

            accountId,

            fromAccountId:
                null,

            toAccountId:
                null,

            debtAccountId:
                null

        };

    },

    saveRecurringRules(form) {

        const values =
            new FormData(form);

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

            const kind =
                this.recurringKind(
                    rule
                );

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
                !this.validateRecurringDates(
                    startDate,
                    endDate,
                    rule.name
                )
            ) {

                this.saving = false;

                this.restoreSaveButton(
                    form
                );

                return;

            }

            if (
                rule.custom ===
                    true ||
                rule.builtIn ===
                    false
            ) {

                const customName =
                    String(
                        values.get(
                            `recurring_name_${id}`
                        ) ||
                        ""
                    ).trim();

                if (!customName) {

                    this.saving = false;

                    this.restoreSaveButton(
                        form
                    );

                    AtlasUI.toast(
                        "Introduce un nombre para el recurrente."
                    );

                    return;

                }

                rule.name =
                    customName;

            }

            if (
                [
                    "income",
                    "expense"
                ].includes(kind)
            ) {

                rule.categoryId =
                    String(
                        values.get(
                            `recurring_category_${id}`
                        ) ||
                        ""
                    ) || null;

                rule.subcategoryId =
                    String(
                        values.get(
                            `recurring_subcategory_${id}`
                        ) ||
                        ""
                    ) || null;

            } else {

                rule.categoryId =
                    null;

                rule.subcategoryId =
                    null;

            }

            const amountMode =
                String(
                    values.get(
                        `recurring_amount_mode_${id}`
                    ) ||
                    "fixed"
                );

            rule.amountMode =
                [
                    "fixed",
                    "last_amount",
                    "average"
                ].includes(
                    amountMode
                )
                    ? amountMode
                    : "fixed";

            rule.amount =
                amount;

            rule.active =
                values.has(
                    `recurring_active_${id}`
                );

            rule.paused =
                values.has(
                    `recurring_paused_${id}`
                );

            rule.requiresConfirmation =
                values.has(
                    `recurring_confirmation_${id}`
                );

            rule.startDate =
                startDate ||
                null;

            rule.endDate =
                endDate ||
                null;

            rule.pausedUntil =
                String(
                    values.get(
                        `recurring_paused_until_${id}`
                    ) ||
                    ""
                ) || null;

            const dueRule =
                String(
                    values.get(
                        `recurring_due_rule_${id}`
                    ) ||
                    "fixed_day"
                );

            rule.dueRule =
                [
                    "fixed_day",
                    "day_range",
                    "end_of_month",
                    "last_working_friday"
                ].includes(
                    dueRule
                )
                    ? dueRule
                    : "fixed_day";

            if (
                rule.dueRule ===
                "fixed_day"
            ) {

                rule.dueDay =
                    Math.max(
                        1,
                        Math.min(
                            31,
                            this.number(
                                values.get(
                                    `recurring_due_day_${id}`
                                )
                            ) || 1
                        )
                    );

            }

            if (
                rule.dueRule ===
                "day_range"
            ) {

                const from =
                    Math.max(
                        1,
                        Math.min(
                            31,
                            this.number(
                                values.get(
                                    `recurring_due_from_${id}`
                                )
                            ) || 1
                        )
                    );

                const to =
                    Math.max(
                        from,
                        Math.min(
                            31,
                            this.number(
                                values.get(
                                    `recurring_due_to_${id}`
                                )
                            ) || from
                        )
                    );

                rule.dueDayFrom =
                    from;

                rule.dueDayTo =
                    to;

            }

            if (
                rule.dueRule ===
                "end_of_month"
            ) {

                rule.daysBeforeEnd =
                    Math.max(
                        0,
                        Math.min(
                            30,
                            this.number(
                                values.get(
                                    `recurring_days_before_end_${id}`
                                )
                            )
                        )
                    );

            }

            Object.assign(
                rule,
                this.recurringAccountValues(
                    values,
                    id,
                    kind
                )
            );

            rule.type =
                kind;

            rule.kind =
                kind;

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

    saveNewRecurringRule(form) {

        const values =
            new FormData(form);

        const name =
            String(
                values.get(
                    "new_recurring_name"
                ) ||
                ""
            ).trim();

        const kind =
            String(
                values.get(
                    "new_recurring_kind"
                ) ||
                "expense"
            );

        if (!name) {

            this.saving = false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "Introduce un nombre para el recurrente."
            );

            return;

        }

        const allowedKinds = [

            "income",
            "expense",
            "investment",
            "transfer",
            "debt_payment"

        ];

        if (
            !allowedKinds.includes(
                kind
            )
        ) {

            this.saving = false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "Selecciona un tipo válido."
            );

            return;

        }

        const amount =
            this.nullableNumber(
                values.get(
                    "new_recurring_amount"
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
                "Introduce un importe válido."
            );

            return;

        }

        const recurrence =
            String(
                values.get(
                    "new_recurring_recurrence"
                ) ||
                "monthly"
            );

        const months =
            values
                .getAll(
                    "new_recurring_month"
                )
                .map(Number)
                .filter(
                    month =>
                        month >= 1 &&
                        month <= 12
                );

        if (
            recurrence ===
                "selected_months" &&
            months.length === 0
        ) {

            this.saving = false;

            this.restoreSaveButton(
                form
            );

            AtlasUI.toast(
                "Selecciona al menos un mes."
            );

            return;

        }

        const startDate =
            String(
                values.get(
                    "new_recurring_start"
                ) ||
                ""
            );

        const endDate =
            String(
                values.get(
                    "new_recurring_end"
                ) ||
                ""
            );

        if (
            !this.validateRecurringDates(
                startDate,
                endDate,
                name
            )
        ) {

            this.saving = false;

            this.restoreSaveButton(
                form
            );

            return;

        }

        const id =
            this.createId(
                "recurring_custom"
            );

        const rule = {

            id,

            name,

            type:
                kind,

            kind,

            categoryId:
                null,

            subcategoryId:
                null,

            accountId:
                null,

            fromAccountId:
                null,

            toAccountId:
                null,

            debtAccountId:
                null,

            recurrence:
                [
                    "monthly",
                    "selected_months",
                    "yearly"
                ].includes(
                    recurrence
                )
                    ? recurrence
                    : "monthly",

            months:
                recurrence ===
                "selected_months"
                    ? months
                    : [],

            dueRule:
                String(
                    values.get(
                        "new_recurring_due_rule"
                    ) ||
                    "fixed_day"
                ),

            amountMode:
                String(
                    values.get(
                        "new_recurring_amount_mode"
                    ) ||
                    "fixed"
                ),

            amount,

            requiresConfirmation:
                values.has(
                    "new_recurring_confirmation"
                ),

            active:
                true,

            paused:
                values.has(
                    "new_recurring_paused"
                ),

            pausedUntil:
                String(
                    values.get(
                        "new_recurring_paused_until"
                    ) ||
                    ""
                ) || null,

            startDate:
                startDate ||
                null,

            endDate:
                endDate ||
                null,

            builtIn:
                false,

            custom:
                true,

            order:
                1000 +
                (
                    this.recurringRules()
                        .filter(
                            item =>
                                item.custom ===
                                true
                        )
                        .length *
                    10
                ),

            createdAt:
                this.now(),

            updatedAt:
                this.now()

        };

        if (
            [
                "income",
                "expense"
            ].includes(kind)
        ) {

            rule.categoryId =
                String(
                    values.get(
                        "new_recurring_category"
                    ) ||
                    ""
                ) || null;

            rule.subcategoryId =
                String(
                    values.get(
                        "new_recurring_subcategory"
                    ) ||
                    ""
                ) || null;

        }

        if (
            kind ===
            "debt_payment"
        ) {

            rule.accountId =
                String(
                    values.get(
                        "new_recurring_account"
                    ) ||
                    ""
                ) || null;

            rule.fromAccountId =
                rule.accountId;

            rule.debtAccountId =
                String(
                    values.get(
                        "new_recurring_debt_account"
                    ) ||
                    ""
                ) || null;

            rule.toAccountId =
                rule.debtAccountId;

        } else if (
            [
                "investment",
                "transfer"
            ].includes(kind)
        ) {

            rule.fromAccountId =
                String(
                    values.get(
                        "new_recurring_from_account"
                    ) ||
                    ""
                ) || null;

            rule.toAccountId =
                String(
                    values.get(
                        "new_recurring_to_account"
                    ) ||
                    ""
                ) || null;

        } else {

            rule.accountId =
                String(
                    values.get(
                        "new_recurring_account"
                    ) ||
                    ""
                ) || null;

        }

        if (
            rule.dueRule ===
            "fixed_day"
        ) {

            rule.dueDay =
                Math.max(
                    1,
                    Math.min(
                        31,
                        this.number(
                            values.get(
                                "new_recurring_due_day"
                            )
                        ) || 1
                    )
                );

        }

        if (
            rule.dueRule ===
            "day_range"
        ) {

            const from =
                Math.max(
                    1,
                    Math.min(
                        31,
                        this.number(
                            values.get(
                                "new_recurring_due_from"
                            )
                        ) || 1
                    )
                );

            const to =
                Math.max(
                    from,
                    Math.min(
                        31,
                        this.number(
                            values.get(
                                "new_recurring_due_to"
                            )
                        ) || from
                    )
                );

            rule.dueDayFrom =
                from;

            rule.dueDayTo =
                to;

        }

        if (
            rule.dueRule ===
            "end_of_month"
        ) {

            rule.daysBeforeEnd =
                Math.max(
                    0,
                    Math.min(
                        30,
                        this.number(
                            values.get(
                                "new_recurring_days_before_end"
                            )
                        )
                    )
                );

        }

        const updatedData =
            this.cloneData();

        if (
            !Array.isArray(
                updatedData.catalog
                    .recurringRules
            )
        ) {

            updatedData.catalog
                .recurringRules = [];

        }

        updatedData.catalog
            .recurringRules
            .push(rule);

        updatedData.catalog.updatedAt =
            this.now();

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
                "No se pudo añadir el recurrente."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        const callback =
            this.onComplete;

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                this.data
            );

        }

        this.saving = false;

        AtlasUI.toast(
            "Recurrente añadido."
        );

        this.renderRecurringRules();

    },

    deleteRecurringRule(ruleId) {

        const rule =
            this.recurringRules()
                .find(
                    item =>
                        item.id ===
                        ruleId
                );

        if (
            !rule ||
            (
                rule.custom !== true &&
                rule.builtIn !== false
            )
        ) {

            AtlasUI.toast(
                "Las reglas predefinidas no se pueden eliminar."
            );

            return;

        }

        const confirmed =
            window.confirm(
                `¿Eliminar el recurrente “${rule.name}”?`
            );

        if (!confirmed) {

            return;

        }

        const updatedData =
            this.cloneData();

        updatedData.catalog
            .recurringRules =
            this.recurringRules(
                updatedData
            ).filter(
                item =>
                    item.id !==
                    ruleId
            );

        if (
            Array.isArray(
                updatedData
                    .recurringOccurrences
            )
        ) {

            updatedData
                .recurringOccurrences =
                updatedData
                    .recurringOccurrences
                    .filter(
                        occurrence =>
                            occurrence
                                .ruleId !==
                            ruleId &&
                            occurrence
                                .recurringRuleId !==
                            ruleId
                    );

        }

        updatedData.catalog.updatedAt =
            this.now();

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo eliminar el recurrente."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        if (
            typeof this.onComplete ===
            "function"
        ) {

            this.onComplete(
                this.data
            );

        }

        AtlasUI.toast(
            "Recurrente eliminado."
        );

        this.renderRecurringRules();

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
                        ) ||
                        ""
                    ).trim();

                if (value) {

                    account.name =
                        value;

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

            account.balance =
                value;

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
                ) ||
                ""
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

        if (
            existingIndex >= 0
        ) {

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
            (first, second) =>
                String(
                    first.monthKey
                ).localeCompare(
                    String(
                        second.monthKey
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

        this.data =
            updatedData;

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
                    ? "Atlas generará una propuesta cuando la regla tenga importe y cuentas configuradas."
                    : "La regla está desactivada y no generará propuestas.";

        }

    },

    updateRecurringSubcategories(
        categorySelect
    ) {

        const ruleId =
            categorySelect.dataset
                .recurringCategory;

        const kind =
            categorySelect.dataset
                .recurringKind;

        const subcategorySelect =
            document.querySelector(
                `[data-recurring-subcategory="${ruleId}"]`
            );

        if (!subcategorySelect) {
            return;
        }

        subcategorySelect.innerHTML =
            this.recurringSubcategoryOptions(
                kind,
                categorySelect.value,
                ""
            );

    },

    updateRecurringDateBlocks(
        ruleId,
        dueRule
    ) {

        document
            .querySelectorAll(
                `[data-recurring-date-block="${ruleId}"]`
            )
            .forEach(
                block => {

                    block.classList.toggle(
                        "atlas-recurring-hidden",
                        block.dataset
                            .recurringDateType !==
                        dueRule
                    );

                }
            );

    },

    updateNewRecurringKind(kind) {

        const categoryContainer =
            document.querySelector(
                "[data-new-recurring-category-fields]"
            );

        if (categoryContainer) {

            const replacement =
                document.createElement(
                    "div"
                );

            replacement.innerHTML =
                this.renderNewRecurringCategoryFields(
                    kind
                ).trim();

            categoryContainer.replaceWith(
                replacement.firstElementChild
            );

        }

        const accountsContainer =
            document.querySelector(
                "[data-new-recurring-accounts]"
            );

        if (accountsContainer) {

            accountsContainer.innerHTML =
                this.renderNewRecurringAccountFields(
                    kind
                );

        }

    },

    updateNewRecurringSubcategories(
        categorySelect
    ) {

        const kindSelect =
            document.querySelector(
                "[data-new-recurring-kind]"
            );

        const subcategorySelect =
            document.querySelector(
                "[data-new-recurring-subcategory]"
            );

        if (
            !kindSelect ||
            !subcategorySelect
        ) {

            return;

        }

        subcategorySelect.innerHTML =
            this.recurringSubcategoryOptions(
                kindSelect.value,
                categorySelect.value,
                ""
            );

    },

    updateNewRecurringDateBlocks(
        dueRule
    ) {

        document
            .querySelectorAll(
                "[data-new-recurring-date-block]"
            )
            .forEach(
                block => {

                    block.classList.toggle(
                        "atlas-recurring-hidden",
                        block.dataset
                            .newRecurringDateBlock !==
                        dueRule
                    );

                }
            );

    },

    updateNewRecurringMonths(
        recurrence
    ) {

        const container =
            document.querySelector(
                "[data-new-recurring-months]"
            );

        if (!container) {
            return;
        }

        container.classList.toggle(
            "atlas-recurring-hidden",
            recurrence !==
            "selected_months"
        );

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

            case "recurring_new":
                this.saveNewRecurringRule(
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
                    action === "recurring"
                ) {

                    this.renderRecurringRules();

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

                    return;

                }

                if (
                    action ===
                    "deleteRecurring"
                ) {

                    this.deleteRecurringRule(
                        actionButton.dataset
                            .recurringId
                    );

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

                    return;

                }

                const recurringCategory =
                    event.target.closest(
                        "[data-recurring-category]"
                    );

                if (recurringCategory) {

                    this.updateRecurringSubcategories(
                        recurringCategory
                    );

                    return;

                }

                const recurringDueRule =
                    event.target.closest(
                        "[data-recurring-due-rule]"
                    );

                if (recurringDueRule) {

                    this.updateRecurringDateBlocks(
                        recurringDueRule.dataset
                            .recurringDueRule,
                        recurringDueRule.value
                    );

                    return;

                }

                const newKind =
                    event.target.closest(
                        "[data-new-recurring-kind]"
                    );

                if (newKind) {

                    this.updateNewRecurringKind(
                        newKind.value
                    );

                    return;

                }

                const newCategory =
                    event.target.closest(
                        "[data-new-recurring-category]"
                    );

                if (newCategory) {

                    this.updateNewRecurringSubcategories(
                        newCategory
                    );

                    return;

                }

                const newDueRule =
                    event.target.closest(
                        "[data-new-recurring-due-rule]"
                    );

                if (newDueRule) {

                    this.updateNewRecurringDateBlocks(
                        newDueRule.value
                    );

                    return;

                }

                const newRecurrence =
                    event.target.closest(
                        "[data-new-recurring-recurrence]"
                    );

                if (newRecurrence) {

                    this.updateNewRecurringMonths(
                        newRecurrence.value
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

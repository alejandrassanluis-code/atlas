/* ==========================================================
   ATLAS
   movements.js
   Atlas v1.0 — Movimientos reales y propuestas recurrentes
========================================================== */

const AtlasMovements = {

    data: null,
    onComplete: null,
    editingId: null,
    recurringOccurrenceId: null,
    saving: false,

    open(
        data,
        onComplete,
        movementId = null
    ) {

        this.data = data;
        this.onComplete = onComplete;
        this.editingId = movementId;
        this.recurringOccurrenceId = null;
        this.saving = false;

        if (movementId) {

            const movement =
                this.findMovement(
                    movementId
                );

            if (!movement) {

                AtlasUI.toast(
                    "No se encontró el movimiento."
                );

                return;

            }

            this.renderForm(
                this.getMovementKind(
                    movement
                ),
                movement
            );

            return;

        }

        this.renderTypeSelector();

    },

    openRecurringOccurrence(
        data,
        onComplete,
        occurrenceId
    ) {

        this.data = data;
        this.onComplete = onComplete;
        this.editingId = null;
        this.recurringOccurrenceId =
            occurrenceId;
        this.saving = false;

        const occurrence =
            this.findRecurringOccurrence(
                occurrenceId
            );

        if (!occurrence) {

            AtlasUI.toast(
                "No se encontró la propuesta recurrente."
            );

            return;

        }

        if (
            ![
                "pending",
                "possible_duplicate"
            ].includes(
                occurrence.status
            )
        ) {

            AtlasUI.toast(
                "Esta propuesta ya no está pendiente."
            );

            return;

        }

        const movement =
            this.movementFromOccurrence(
                occurrence
            );

        const error =
            this.validateMovement(
                movement
            );

        if (
            error &&
            !this.isEditableOccurrenceError(
                error
            )
        ) {

            AtlasUI.toast(error);

            return;

        }

        this.renderForm(
            this.getMovementKind(
                movement
            ),
            movement,
            true
        );

    },

    root() {

        return document.getElementById(
            "modal-root"
        );

    },

    cloneData(
        data = this.data
    ) {

        return JSON.parse(
            JSON.stringify(
                data
            )
        );

    },

    generateId() {

        return [
            "mov",
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 9)
        ].join("_");

    },

    today() {

        const now =
            new Date();

        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join("-");

    },

    now() {

        return new Date()
            .toISOString();

    },

    escape(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style:
                    "currency",

                currency:
                    "EUR",

                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        ).format(
            this.number(value)
        );

    },

    formatDate(value) {

        const [
            year,
            month,
            day
        ] = String(
            value || ""
        )
            .split("-")
            .map(Number);

        if (
            !year ||
            !month ||
            !day
        ) {

            return "";

        }

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
            }
        ).format(
            new Date(
                year,
                month - 1,
                day
            )
        );

    },

    findMovement(
        id,
        data = this.data
    ) {

        return (
            data?.movements || []
        ).find(
            movement =>
                movement.id === id
        ) || null;

    },

    findAccount(
        id,
        data = this.data
    ) {

        return (
            data?.accounts || []
        ).find(
            account =>
                account.id === id
        ) || null;

    },

    recurringOccurrences(
        data = this.data
    ) {

        return Array.isArray(
            data?.recurringOccurrences
        )
            ? data.recurringOccurrences
            : [];

    },

    recurringRules(
        data = this.data
    ) {

        return Array.isArray(
            data?.catalog
                ?.recurringRules
        )
            ? data.catalog
                .recurringRules
            : [];

    },

    findRecurringOccurrence(
        occurrenceId,
        data = this.data
    ) {

        return this
            .recurringOccurrences(data)
            .find(
                occurrence =>
                    occurrence.id ===
                    occurrenceId
            ) || null;

    },

    occurrenceRuleId(
        occurrence
    ) {

        return (
            occurrence?.ruleId ||
            occurrence
                ?.recurringRuleId ||
            null
        );

    },

    findRecurringRule(
        ruleId,
        data = this.data
    ) {

        return this
            .recurringRules(data)
            .find(
                rule =>
                    rule.id ===
                    ruleId
            ) || null;

    },

    getMovementKind(movement) {

        if (
            movement?.kind ===
                "debt_payment" ||
            movement?.type ===
                "debt_payment"
        ) {

            return "debt_payment";

        }

        if (
            movement?.kind ===
                "reimbursement" ||
            movement?.type ===
                "reimbursement"
        ) {

            return "reimbursement";

        }

        return (
            movement?.kind ||
            movement?.type ||
            ""
        );

    },

    isExpenseMovement(movement) {

        return (
            this.getMovementKind(
                movement
            ) ===
            "expense"
        );

    },

    isEditableOccurrenceError(
        error
    ) {

        return [
            "Introduce un importe válido.",
            "Selecciona la fecha.",
            "Selecciona una categoría y subcategoría.",
            "Selecciona una cuenta.",
            "Selecciona la cuenta de origen y destino."
        ].includes(error);

    },

    occurrenceCategoryName(
        kind,
        categoryId,
        subcategoryId
    ) {

        if (
            kind !== "income" &&
            kind !== "expense"
        ) {

            if (
                kind ===
                "investment"
            ) {

                return "Aportación periódica";

            }

            if (
                kind ===
                "transfer"
            ) {

                return "Traspaso";

            }

            if (
                kind ===
                "debt_payment"
            ) {

                return "Pago de deuda";

            }

            return "Movimiento recurrente";

        }

        return this.categoryDisplayName(
            kind,
            categoryId,
            subcategoryId
        );

    },

    movementFromOccurrence(
        occurrence
    ) {

        const kind =
            this.getMovementKind(
                occurrence
            );

        const ruleId =
            this.occurrenceRuleId(
                occurrence
            );

        const rule =
            this.findRecurringRule(
                ruleId
            );

        const movement = {

            id:
                this.generateId(),

            type:
                kind ===
                    "debt_payment"
                    ? "expense"
                    : kind,

            kind,

            amount:
                this.number(
                    occurrence
                        .expectedAmount
                ),

            date:
                occurrence.expectedDate ||
                this.today(),

            note:
                occurrence.note ||
                rule?.name ||
                "",

            categoryId:
                occurrence.categoryId ||
                rule?.categoryId ||
                null,

            subcategoryId:
                occurrence
                    .subcategoryId ||
                rule?.subcategoryId ||
                null,

            accountId:
                occurrence.accountId ||
                rule?.accountId ||
                null,

            fromAccountId:
                occurrence
                    .fromAccountId ||
                rule?.fromAccountId ||
                occurrence.accountId ||
                rule?.accountId ||
                null,

            toAccountId:
                occurrence.toAccountId ||
                rule?.toAccountId ||
                occurrence
                    .debtAccountId ||
                rule?.debtAccountId ||
                null,

            debtAccountId:
                occurrence
                    .debtAccountId ||
                rule?.debtAccountId ||
                occurrence.toAccountId ||
                rule?.toAccountId ||
                null,

            recurringRuleId:
                ruleId,

            recurringOccurrenceId:
                occurrence.id,

            createdAt:
                this.now(),

            updatedAt:
                this.now()

        };

        movement.category =
            this.occurrenceCategoryName(
                kind,
                movement.categoryId,
                movement.subcategoryId
            );

        if (
            kind === "income"
        ) {

            const subcategory =
                this.findSubcategory(
                    "income",
                    movement.categoryId,
                    movement.subcategoryId
                );

            const category =
                this.findCategory(
                    "income",
                    movement.categoryId
                );

            movement.incomeBehavior =
                subcategory
                    ?.incomeBehavior ||
                category
                    ?.incomeBehavior ||
                "income";

        }

        if (
            kind === "investment"
        ) {

            movement.category =
                rule?.name ||
                "Aportación periódica";

        }

        return movement;

    },

    expenseMovements(
        excludedId = null
    ) {

        return (
            this.data?.movements || []
        )
            .filter(
                movement =>
                    this.isExpenseMovement(
                        movement
                    ) &&
                    movement.id !==
                        excludedId
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const dateDifference =
                        String(
                            second.date || ""
                        ).localeCompare(
                            String(
                                first.date || ""
                            )
                        );

                    if (
                        dateDifference !== 0
                    ) {

                        return dateDifference;

                    }

                    return String(
                        second.createdAt ||
                        ""
                    ).localeCompare(
                        String(
                            first.createdAt ||
                            ""
                        )
                    );

                }
            );

    },

    linkedExpenseOptions(
        selectedId = ""
    ) {

        const options =
            this.expenseMovements(
                this.editingId
            )
                .map(
                    movement => {

                        const category =
                            movement.category ||
                            "Gasto";

                        const note =
                            movement.note
                                ? ` · ${movement.note}`
                                : "";

                        const label =
                            `${this.formatDate(
                                movement.date
                            )} · ` +
                            `${this.formatCurrency(
                                movement.amount
                            )} · ` +
                            `${category}${note}`;

                        return `

                            <option
                                value="${this.escape(
                                    movement.id
                                )}"
                                ${
                                    movement.id ===
                                    selectedId
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${this.escape(
                                    label
                                )}
                            </option>

                        `;

                    }
                )
                .join("");

        return `

            <option value="">
                Sin vincular a un gasto
            </option>

            ${options}

        `;

    },

    debtAvailableForPayment(
        movement,
        data = this.data
    ) {

        const debtAccount =
            this.findAccount(
                movement.toAccountId,
                data
            );

        if (!debtAccount) {

            return 0;

        }

        let available =
            Math.max(
                0,
                this.number(
                    debtAccount.balance
                )
            );

        if (this.editingId) {

            const oldMovement =
                this.findMovement(
                    this.editingId,
                    data
                );

            if (
                oldMovement &&
                this.getMovementKind(
                    oldMovement
                ) ===
                    "debt_payment" &&
                oldMovement.toAccountId ===
                    movement.toAccountId
            ) {

                available +=
                    this.number(
                        oldMovement.amount
                    );

            }

        }

        return available;

    },

    catalogCategories(type) {

        const categories =
            this.data?.catalog
                ?.categories?.[type];

        if (
            !Array.isArray(
                categories
            )
        ) {

            return [];

        }

        return categories
            .filter(
                category =>
                    category.active !==
                    false
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    this.number(
                        first.order
                    ) -
                    this.number(
                        second.order
                    )
            );

    },

    findCategory(
        type,
        categoryId
    ) {

        return this
            .catalogCategories(type)
            .find(
                category =>
                    category.id ===
                    categoryId
            ) || null;

    },

    findSubcategory(
        type,
        categoryId,
        subcategoryId
    ) {

        const category =
            this.findCategory(
                type,
                categoryId
            );

        if (
            !category ||
            !Array.isArray(
                category.subcategories
            )
        ) {

            return null;

        }

        return category
            .subcategories
            .find(
                subcategory =>
                    subcategory.id ===
                    subcategoryId
            ) || null;

    },

    activeAccounts(
        filter,
        selectedId = null
    ) {

        return (
            this.data?.accounts || []
        )
            .filter(filter)
            .filter(
                account =>
                    account.active !==
                        false &&
                    (
                        account.archived !==
                            true ||
                        account.id ===
                            selectedId
                    )
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    this.number(
                        first.order
                    ) -
                    this.number(
                        second.order
                    )
            );

    },

    liquidityAccounts(
        selectedId = null
    ) {

        return this.activeAccounts(
            account =>
                account.group ===
                "liquidity",
            selectedId
        );

    },

    investmentAccounts(
        selectedId = null
    ) {

        return this.activeAccounts(
            account =>
                account.group ===
                "investment",
            selectedId
        );

    },

    debtAccounts(
        selectedId = null
    ) {

        return this.activeAccounts(
            account =>
                account.group ===
                "debt",
            selectedId
        );

    },

    paymentAccounts(
        selectedId = null
    ) {

        return this.activeAccounts(
            account =>
                account.group ===
                    "liquidity" ||
                account.type ===
                    "credit_card",
            selectedId
        );

    },

    transferAccounts(
        selectedId = null
    ) {

        return this.activeAccounts(
            account =>
                account.group ===
                    "liquidity" ||
                account.group ===
                    "debt",
            selectedId
        );

    },

    accountOptions(
        accounts,
        selectedId = ""
    ) {

        return accounts
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
            .join("");

    },

    categoryOptions(
        type,
        selectedId = ""
    ) {

        return this
            .catalogCategories(type)
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
            .join("");

    },

    subcategoryOptions(
        type,
        categoryId,
        selectedId = ""
    ) {

        const category =
            this.findCategory(
                type,
                categoryId
            );

        if (
            !category ||
            !Array.isArray(
                category.subcategories
            )
        ) {

            return "";

        }

        return category.subcategories
            .filter(
                subcategory =>
                    subcategory.active !==
                    false
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    this.number(
                        first.order
                    ) -
                    this.number(
                        second.order
                    )
            )
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
            .join("");

    },

    resolveLegacyCategory(
        type,
        movement
    ) {

        if (
            movement?.categoryId
        ) {

            return {

                categoryId:
                    movement.categoryId,

                subcategoryId:
                    movement.subcategoryId ||
                    ""

            };

        }

        if (
            type ===
                "expense" &&
            movement?.linkedMovementId
        ) {

            const linkedExpense =
                this.findMovement(
                    movement.linkedMovementId
                );

            if (
                linkedExpense?.categoryId
            ) {

                return {

                    categoryId:
                        linkedExpense.categoryId,

                    subcategoryId:
                        linkedExpense.subcategoryId ||
                        ""

                };

            }

        }

        const firstCategory =
            this.catalogCategories(
                type
            )[0];

        return {

            categoryId:
                firstCategory?.id ||
                "",

            subcategoryId:
                firstCategory
                    ?.subcategories
                    ?.find(
                        subcategory =>
                            subcategory.active !==
                            false
                    )
                    ?.id ||
                ""

        };

    },

    categoryDisplayName(
        type,
        categoryId,
        subcategoryId
    ) {

        const category =
            this.findCategory(
                type,
                categoryId
            );

        const subcategory =
            this.findSubcategory(
                type,
                categoryId,
                subcategoryId
            );

        if (
            category &&
            subcategory
        ) {

            return (
                `${category.icon} ` +
                `${category.name} · ` +
                `${subcategory.name}`
            );

        }

        if (category) {

            return (
                `${category.icon} ` +
                category.name
            );

        }

        return type ===
            "income"
            ? "Ingreso"
            : "Gasto";

    },

    styles() {

        return `

            <style>

                body.atlas-modal-open {
                    overflow: hidden;
                }

                .movement-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 3200;
                    background:
                        rgba(
                            3,
                            7,
                            18,
                            0.78
                        );
                    backdrop-filter:
                        blur(8px);
                    -webkit-backdrop-filter:
                        blur(8px);
                }

                .movement-sheet {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 3201;
                    max-height: 94vh;
                    overflow-y: auto;
                    -webkit-overflow-scrolling:
                        touch;
                    padding:
                        12px
                        22px
                        calc(
                            25px +
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
                        movementSheetUp
                        0.24s ease;
                }

                @keyframes movementSheetUp {

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

                .movement-handle {
                    width: 46px;
                    height: 5px;
                    margin:
                        0
                        auto
                        23px;
                    border-radius: 99px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.22
                        );
                }

                .movement-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .movement-header h2 {
                    margin: 0;
                    color: #f7f8fc;
                    font-size: 27px;
                    line-height: 1.15;
                }

                .movement-header p {
                    margin:
                        7px
                        0
                        0;
                    color: #98a2bb;
                    line-height: 1.45;
                }

                .movement-back {
                    width: 42px;
                    height: 42px;
                    flex:
                        0
                        0
                        42px;
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

                .movement-types {
                    display: flex;
                    flex-direction: column;
                    gap: 11px;
                }

                .movement-type {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.18
                        );
                    border-radius: 20px;
                    background: #19243a;
                    color: #f7f8fc;
                    text-align: left;
                }

                .movement-type:active {
                    transform:
                        scale(
                            0.985
                        );
                }

                .movement-type-icon {
                    width: 48px;
                    height: 48px;
                    flex:
                        0
                        0
                        48px;
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

                .movement-type strong {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 16px;
                }

                .movement-type small {
                    display: block;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .movement-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .movement-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .movement-field > span {
                    color: #c8d0e3;
                    font-size: 13px;
                    font-weight: 700;
                }

                .movement-field input,
                .movement-field select {
                    box-sizing: border-box;
                    width: 100%;
                    min-width: 0;
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

                .movement-field input:focus,
                .movement-field select:focus {
                    border-color: #4da3ff;
                    box-shadow:
                        0
                        0
                        0
                        3px
                        rgba(
                            77,
                            163,
                            255,
                            0.13
                        );
                }

                .movement-field-hint {
                    display: block;
                    color: #98a2bb;
                    font-size: 11px;
                    line-height: 1.45;
                }

                .movement-amount {
                    position: relative;
                }

                .movement-amount input {
                    padding-right: 44px;
                    font-size: 23px;
                    font-weight: 750;
                }

                .movement-amount b {
                    position: absolute;
                    top: 50%;
                    right: 16px;
                    transform:
                        translateY(-50%);
                    color: #98a2bb;
                    font-size: 19px;
                }

                .movement-info {
                    padding: 13px 15px;
                    border:
                        1px solid
                        rgba(
                            77,
                            163,
                            255,
                            0.16
                        );
                    border-radius: 16px;
                    color: #aeb9d0;
                    background:
                        rgba(
                            77,
                            163,
                            255,
                            0.07
                        );
                    font-size: 12px;
                    line-height: 1.5;
                }

                .movement-recurring-info {
                    border-color:
                        rgba(
                            95,
                            214,
                            193,
                            0.22
                        );
                    color: #bce9df;
                    background:
                        rgba(
                            95,
                            214,
                            193,
                            0.07
                        );
                }

                .movement-primary,
                .movement-secondary,
                .movement-danger {
                    width: 100%;
                    min-height: 56px;
                    border-radius: 17px;
                    font-size: 16px;
                    font-weight: 750;
                    touch-action: manipulation;
                }

                .movement-primary {
                    margin-top: 3px;
                    color: #ffffff;
                    background:
                        linear-gradient(
                            135deg,
                            #4da3ff,
                            #2879ed
                        );
                }

                .movement-primary:disabled {
                    opacity: 0.55;
                }

                .movement-secondary {
                    color: #98a2bb;
                    background: transparent;
                }

                .movement-danger {
                    color: #ff7d8d;
                    border:
                        1px solid
                        rgba(
                            255,
                            91,
                            112,
                            0.2
                        );
                    background:
                        rgba(
                            255,
                            91,
                            112,
                            0.08
                        );
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
            "atlas-modal-open"
        );

        root.innerHTML = `

            ${this.styles()}

            <div
                class="movement-backdrop"
                data-movement-action="close"
            ></div>

            <section
                class="movement-sheet"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="movement-handle"
                ></div>

                ${content}

            </section>

        `;

    },

    typeButton(
        type,
        icon,
        title,
        description
    ) {

        return `

            <button
                class="movement-type"
                type="button"
                data-movement-type="${type}"
            >

                <span
                    class="movement-type-icon"
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

    renderTypeSelector() {

        this.renderSheet(`

            <div class="movement-header">

                <div>

                    <h2>
                        Registrar movimiento
                    </h2>

                    <p>
                        ¿Qué quieres registrar?
                    </p>

                </div>

            </div>

            <div class="movement-types">

                ${this.typeButton(
                    "income",
                    "🟢",
                    "Ingreso",
                    "Nómina, intereses, ventas u otros ingresos reales."
                )}

                ${this.typeButton(
                    "reimbursement",
                    "↩️",
                    "Reembolso",
                    "Dinero recuperado de un gasto compartido o devuelto."
                )}

                ${this.typeButton(
                    "expense",
                    "🔴",
                    "Gasto",
                    "Compra o pago realizado con cuenta o tarjeta."
                )}

                ${this.typeButton(
                    "transfer",
                    "🔁",
                    "Traspaso",
                    "Mover dinero entre cuentas."
                )}

                ${this.typeButton(
                    "investment",
                    "📈",
                    "Inversión",
                    "Aportación a una cuenta de inversión."
                )}

                ${this.typeButton(
                    "debt_payment",
                    "💳",
                    "Pago de deuda",
                    "Pagar una tarjeta o reducir un préstamo."
                )}

            </div>

            <button
                class="movement-secondary"
                type="button"
                data-movement-action="close"
                style="margin-top:12px"
            >
                Cancelar
            </button>

        `);

    },

    formTitle(type) {

        const titles = {

            income:
                "Registrar ingreso",

            reimbursement:
                "Registrar reembolso",

            expense:
                "Registrar gasto",

            transfer:
                "Registrar traspaso",

            investment:
                "Registrar inversión",

            debt_payment:
                "Registrar pago de deuda"

        };

        return (
            titles[type] ||
            "Registrar movimiento"
        );

    },

    amountField(amount) {

        return `

            <label class="movement-field">

                <span>
                    Importe
                </span>

                <div class="movement-amount">

                    <input
                        name="amount"
                        type="number"
                        inputmode="decimal"
                        min="0.01"
                        step="0.01"
                        value="${this.escape(
                            amount
                        )}"
                        required
                    >

                    <b>
                        €
                    </b>

                </div>

            </label>

        `;

    },

    commonFields(movement) {

        return `

            <label class="movement-field">

                <span>
                    Fecha del movimiento
                </span>

                <input
                    name="date"
                    type="date"
                    value="${this.escape(
                        movement?.date ||
                        this.today()
                    )}"
                    required
                >

            </label>

            <label class="movement-field">

                <span>
                    Nota opcional
                </span>

                <input
                    name="note"
                    type="text"
                    maxlength="100"
                    value="${this.escape(
                        movement?.note ||
                        ""
                    )}"
                    placeholder="Añade una referencia"
                >

            </label>

        `;

    },

    categoryFields(
        type,
        movement
    ) {

        const selected =
            this.resolveLegacyCategory(
                type,
                movement
            );

        return `

            <label class="movement-field">

                <span>
                    Categoría
                </span>

                <select
                    name="categoryId"
                    data-movement-category
                    data-category-type="${type}"
                    required
                >
                    ${this.categoryOptions(
                        type,
                        selected.categoryId
                    )}
                </select>

            </label>

            <label class="movement-field">

                <span>
                    Subcategoría
                </span>

                <select
                    name="subcategoryId"
                    data-movement-subcategory
                    required
                >
                    ${this.subcategoryOptions(
                        type,
                        selected.categoryId,
                        selected.subcategoryId
                    )}
                </select>

            </label>

        `;

    },

    reimbursementFields(movement) {

        return `

            ${this.amountField(
                movement?.amount ||
                ""
            )}

            <div class="movement-info">
                El reembolso aumenta tu liquidez y reduce el gasto neto, pero no cuenta como ingreso.
            </div>

            <label class="movement-field">

                <span>
                    Gasto original opcional
                </span>

                <select
                    name="linkedMovementId"
                    data-reimbursement-linked-expense
                >
                    ${this.linkedExpenseOptions(
                        movement?.linkedMovementId ||
                        ""
                    )}
                </select>

                <small class="movement-field-hint">
                    Al vincular un gasto se copiarán automáticamente su categoría y subcategoría.
                </small>

            </label>

            ${this.categoryFields(
                "expense",
                movement
            )}

            <label class="movement-field">

                <span>
                    Cuenta que recibe el dinero
                </span>

                <select
                    name="accountId"
                    required
                >
                    ${this.accountOptions(
                        this.liquidityAccounts(
                            movement?.accountId
                        ),
                        movement?.accountId
                    )}
                </select>

            </label>

            ${this.commonFields(
                movement
            )}

        `;

    },

    formFields(
        type,
        movement = null
    ) {

        const amount =
            movement?.amount ||
            "";

        const common =
            this.commonFields(
                movement
            );

        if (
            type ===
            "income"
        ) {

            return `

                ${this.amountField(
                    amount
                )}

                ${this.categoryFields(
                    "income",
                    movement
                )}

                <label class="movement-field">

                    <span>
                        Cuenta de destino
                    </span>

                    <select
                        name="accountId"
                        required
                    >
                        ${this.accountOptions(
                            this.liquidityAccounts(
                                movement?.accountId
                            ),
                            movement?.accountId
                        )}
                    </select>

                </label>

                ${common}

            `;

        }

        if (
            type ===
            "reimbursement"
        ) {

            return this.reimbursementFields(
                movement
            );

        }

        if (
            type ===
            "expense"
        ) {

            return `

                ${this.amountField(
                    amount
                )}

                ${this.categoryFields(
                    "expense",
                    movement
                )}

                <label class="movement-field">

                    <span>
                        Cuenta o tarjeta
                    </span>

                    <select
                        name="accountId"
                        required
                    >
                        ${this.accountOptions(
                            this.paymentAccounts(
                                movement?.accountId
                            ),
                            movement?.accountId
                        )}
                    </select>

                </label>

                ${common}

            `;

        }

        if (
            type ===
            "transfer"
        ) {

            return `

                ${this.amountField(
                    amount
                )}

                <label class="movement-field">

                    <span>
                        Cuenta de origen
                    </span>

                    <select
                        name="fromAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.transferAccounts(
                                movement?.fromAccountId
                            ),
                            movement?.fromAccountId
                        )}
                    </select>

                </label>

                <label class="movement-field">

                    <span>
                        Cuenta de destino
                    </span>

                    <select
                        name="toAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.transferAccounts(
                                movement?.toAccountId
                            ),
                            movement?.toAccountId
                        )}
                    </select>

                </label>

                ${common}

            `;

        }

        if (
            type ===
            "investment"
        ) {

            return `

                ${this.amountField(
                    amount
                )}

                <label class="movement-field">

                    <span>
                        Tipo de aportación
                    </span>

                    <select
                        name="investmentCategory"
                    >

                        <option
                            value="Aportación periódica"
                            ${
                                movement?.category ===
                                "Aportación periódica"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Aportación periódica
                        </option>

                        <option
                            value="Aportación extraordinaria"
                            ${
                                movement?.category ===
                                "Aportación extraordinaria"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Aportación extraordinaria
                        </option>

                        <option
                            value="Otros"
                            ${
                                movement?.category ===
                                "Otros"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Otros
                        </option>

                    </select>

                </label>

                <label class="movement-field">

                    <span>
                        Cuenta de origen
                    </span>

                    <select
                        name="fromAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.liquidityAccounts(
                                movement?.fromAccountId
                            ),
                            movement?.fromAccountId
                        )}
                    </select>

                </label>

                <label class="movement-field">

                    <span>
                        Inversión de destino
                    </span>

                    <select
                        name="toAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.investmentAccounts(
                                movement?.toAccountId
                            ),
                            movement?.toAccountId
                        )}
                    </select>

                </label>

                ${common}

            `;

        }

        return `

            ${this.amountField(
                amount
            )}

            <label class="movement-field">

                <span>
                    Cuenta de origen
                </span>

                <select
                    name="fromAccountId"
                    required
                >
                    ${this.accountOptions(
                        this.liquidityAccounts(
                            movement?.fromAccountId
                        ),
                        movement?.fromAccountId
                    )}
                </select>

            </label>

            <label class="movement-field">

                <span>
                    Deuda que reduces
                </span>

                <select
                    name="toAccountId"
                    required
                >
                    ${this.accountOptions(
                        this.debtAccounts(
                            movement?.toAccountId
                        ),
                        movement?.toAccountId
                    )}
                </select>

            </label>

            ${common}

        `;

    },

    renderForm(
        type,
        movement = null,
        recurringReview = false
    ) {

        const isEditing =
            Boolean(
                this.editingId
            );

        this.renderSheet(`

            <div class="movement-header">

                <button
                    class="movement-back"
                    type="button"
                    data-movement-action="types"
                    aria-label="Volver"
                >
                    ‹
                </button>

                <div>

                    <h2>
                        ${
                            recurringReview
                                ? "Revisar propuesta"
                                : isEditing
                                    ? "Editar movimiento"
                                    : this.formTitle(
                                        type
                                    )
                        }
                    </h2>

                    <p>
                        ${
                            recurringReview
                                ? "Comprueba los datos antes de convertirla en un movimiento real."
                                : isEditing
                                    ? "Modifica los datos o elimina el movimiento."
                                    : "Introduce los datos reales de la operación."
                        }
                    </p>

                </div>

            </div>

            <form
                class="movement-form"
                data-movement-form="${type}"
                novalidate
            >

                ${
                    recurringReview
                        ? `

                            <div
                                class="
                                    movement-info
                                    movement-recurring-info
                                "
                            >
                                Al guardar se confirmará esta propuesta, se registrará el movimiento real y se actualizarán sus saldos.
                            </div>

                        `
                        : ""
                }

                ${this.formFields(
                    type,
                    movement
                )}

                <button
                    class="movement-primary"
                    type="button"
                    data-movement-action="save"
                    data-movement-save
                >
                    ${
                        recurringReview
                            ? "Confirmar movimiento"
                            : isEditing
                                ? "Guardar cambios"
                                : "Guardar movimiento"
                    }
                </button>

                ${
                    isEditing
                        ? `

                            <button
                                class="movement-danger"
                                type="button"
                                data-movement-action="delete"
                            >
                                Eliminar movimiento
                            </button>

                        `
                        : ""
                }

                <button
                    class="movement-secondary"
                    type="button"
                    data-movement-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    updateSubcategorySelect(
        categorySelect,
        selectedSubcategoryId = ""
    ) {

        const form =
            categorySelect.closest(
                "[data-movement-form]"
            );

        if (!form) {

            return;

        }

        const subcategorySelect =
            form.querySelector(
                "[data-movement-subcategory]"
            );

        if (!subcategorySelect) {

            return;

        }

        subcategorySelect.innerHTML =
            this.subcategoryOptions(
                categorySelect.dataset
                    .categoryType,
                categorySelect.value,
                selectedSubcategoryId
            );

    },

    applyLinkedExpenseToForm(
        linkedExpenseSelect
    ) {

        const form =
            linkedExpenseSelect.closest(
                "[data-movement-form]"
            );

        if (!form) {

            return;

        }

        const linkedMovementId =
            linkedExpenseSelect.value;

        if (!linkedMovementId) {

            return;

        }

        const expense =
            this.findMovement(
                linkedMovementId
            );

        if (
            !expense ||
            !this.isExpenseMovement(
                expense
            )
        ) {

            return;

        }

        const categorySelect =
            form.querySelector(
                "[data-movement-category]"
            );

        const subcategorySelect =
            form.querySelector(
                "[data-movement-subcategory]"
            );

        if (
            !categorySelect ||
            !subcategorySelect ||
            !expense.categoryId
        ) {

            return;

        }

        categorySelect.value =
            expense.categoryId;

        this.updateSubcategorySelect(
            categorySelect,
            expense.subcategoryId ||
            ""
        );

        subcategorySelect.value =
            expense.subcategoryId ||
            "";

    },

    readForm(
        form,
        type
    ) {

        const values =
            new FormData(form);

        const oldMovement =
            this.editingId
                ? this.findMovement(
                    this.editingId
                )
                : null;

        const occurrence =
            this.recurringOccurrenceId
                ? this.findRecurringOccurrence(
                    this.recurringOccurrenceId
                )
                : null;

        const ruleId =
            oldMovement
                ?.recurringRuleId ||
            this.occurrenceRuleId(
                occurrence
            ) ||
            null;

        const movement = {

            id:
                this.editingId ||
                this.generateId(),

            type:
                type ===
                    "debt_payment"
                    ? "expense"
                    : type,

            kind:
                type,

            amount:
                Number(
                    values.get(
                        "amount"
                    )
                ),

            date:
                String(
                    values.get(
                        "date"
                    ) || ""
                ),

            note:
                String(
                    values.get(
                        "note"
                    ) || ""
                ).trim(),

            recurringRuleId:
                ruleId,

            recurringOccurrenceId:
                oldMovement
                    ?.recurringOccurrenceId ||
                this.recurringOccurrenceId ||
                null,

            createdAt:
                oldMovement
                    ?.createdAt ||
                this.now(),

            updatedAt:
                this.now()

        };

        if (
            type ===
                "income" ||
            type ===
                "expense" ||
            type ===
                "reimbursement"
        ) {

            movement.accountId =
                String(
                    values.get(
                        "accountId"
                    ) || ""
                );

            movement.categoryId =
                String(
                    values.get(
                        "categoryId"
                    ) || ""
                );

            movement.subcategoryId =
                String(
                    values.get(
                        "subcategoryId"
                    ) || ""
                );

            movement.category =
                this.categoryDisplayName(
                    type ===
                        "income"
                        ? "income"
                        : "expense",
                    movement.categoryId,
                    movement.subcategoryId
                );

        }

        if (
            type ===
            "reimbursement"
        ) {

            movement.linkedMovementId =
                String(
                    values.get(
                        "linkedMovementId"
                    ) || ""
                ) || null;

            movement.incomeBehavior =
                "reimbursement";

        }

        if (
            type ===
                "transfer" ||
            type ===
                "investment" ||
            type ===
                "debt_payment"
        ) {

            movement.fromAccountId =
                String(
                    values.get(
                        "fromAccountId"
                    ) || ""
                );

            movement.toAccountId =
                String(
                    values.get(
                        "toAccountId"
                    ) || ""
                );

        }

        if (
            type ===
            "investment"
        ) {

            movement.category =
                String(
                    values.get(
                        "investmentCategory"
                    ) ||
                    "Aportación periódica"
                );

            movement.categoryId =
                null;

            movement.subcategoryId =
                null;

        }

        if (
            type ===
            "transfer"
        ) {

            movement.category =
                "Traspaso";

            movement.categoryId =
                null;

            movement.subcategoryId =
                null;

        }

        if (
            type ===
            "debt_payment"
        ) {

            movement.category =
                "Pago de deuda";

            movement.categoryId =
                null;

            movement.subcategoryId =
                null;

            movement.debtAccountId =
                movement.toAccountId;

        }

        if (
            type ===
            "income"
        ) {

            const subcategory =
                this.findSubcategory(
                    "income",
                    movement.categoryId,
                    movement.subcategoryId
                );

            const category =
                this.findCategory(
                    "income",
                    movement.categoryId
                );

            movement.incomeBehavior =
                subcategory
                    ?.incomeBehavior ||
                category
                    ?.incomeBehavior ||
                "income";

        }

        return movement;

    },

    validateMovement(
        movement,
        data = this.data
    ) {

        const kind =
            this.getMovementKind(
                movement
            );

        if (
            !Number.isFinite(
                movement.amount
            ) ||
            movement.amount <= 0
        ) {

            return "Introduce un importe válido.";

        }

        if (!movement.date) {

            return "Selecciona la fecha.";

        }

        if (
            (
                kind ===
                    "income" ||
                kind ===
                    "expense" ||
                kind ===
                    "reimbursement"
            ) &&
            (
                !movement.categoryId ||
                !movement.subcategoryId
            )
        ) {

            return "Selecciona una categoría y subcategoría.";

        }

        if (
            (
                kind ===
                    "income" ||
                kind ===
                    "expense" ||
                kind ===
                    "reimbursement"
            ) &&
            !movement.accountId
        ) {

            return "Selecciona una cuenta.";

        }

        if (
            (
                kind ===
                    "transfer" ||
                kind ===
                    "investment" ||
                kind ===
                    "debt_payment"
            ) &&
            (
                !movement.fromAccountId ||
                !movement.toAccountId
            )
        ) {

            return "Selecciona la cuenta de origen y destino.";

        }

        if (
            movement.fromAccountId &&
            movement.toAccountId &&
            movement.fromAccountId ===
                movement.toAccountId
        ) {

            return "La cuenta de origen y destino deben ser diferentes.";

        }

        const accountIds = [

            movement.accountId,
            movement.fromAccountId,
            movement.toAccountId

        ].filter(Boolean);

        const missingAccount =
            accountIds.some(
                id =>
                    !this.findAccount(
                        id,
                        data
                    )
            );

        if (missingAccount) {

            return "Una de las cuentas seleccionadas no existe.";

        }

        if (
            kind ===
            "reimbursement"
        ) {

            const account =
                this.findAccount(
                    movement.accountId,
                    data
                );

            if (
                account?.group !==
                "liquidity"
            ) {

                return "El reembolso debe recibirse en una cuenta de liquidez.";

            }

            if (
                movement.linkedMovementId
            ) {

                const linkedExpense =
                    this.findMovement(
                        movement.linkedMovementId,
                        data
                    );

                if (
                    !linkedExpense ||
                    !this.isExpenseMovement(
                        linkedExpense
                    )
                ) {

                    return "El gasto original vinculado ya no existe.";

                }

                if (
                    linkedExpense.id ===
                    movement.id
                ) {

                    return "Un movimiento no puede vincularse a sí mismo.";

                }

            }

        }

        if (
            kind ===
            "debt_payment"
        ) {

            const fromAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const debtAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            if (
                fromAccount?.group !==
                "liquidity"
            ) {

                return "El pago debe salir de una cuenta de liquidez.";

            }

            if (
                debtAccount?.group !==
                "debt"
            ) {

                return "Selecciona una deuda válida.";

            }

            const availableDebt =
                this.debtAvailableForPayment(
                    movement,
                    data
                );

            if (
                availableDebt <= 0
            ) {

                return "Esta deuda ya está completamente pagada.";

            }

            if (
                movement.amount >
                availableDebt + 0.001
            ) {

                return (
                    "El pago no puede superar " +
                    `la deuda pendiente de ${
                        this.formatCurrency(
                            availableDebt
                        )
                    }.`
                );

            }

        }

        return null;

    },

    changeBalance(
        account,
        amount
    ) {

        if (!account) {

            return;

        }

        account.balance =
            this.number(
                account.balance
            ) +
            this.number(
                amount
            );

        account.updatedAt =
            this.now();

    },

    changeInvested(
        account,
        amount
    ) {

        if (!account) {

            return;

        }

        account.invested =
            this.number(
                account.invested
            ) +
            this.number(
                amount
            );

        account.updatedAt =
            this.now();

    },

    applyMovement(
        data,
        movement,
        direction = 1
    ) {

        const amount =
            this.number(
                movement.amount
            ) *
            direction;

        const kind =
            this.getMovementKind(
                movement
            );

        if (
            kind === "income" ||
            kind === "reimbursement"
        ) {

            this.changeBalance(
                this.findAccount(
                    movement.accountId,
                    data
                ),
                amount
            );

            return;

        }

        if (
            kind ===
            "expense"
        ) {

            const account =
                this.findAccount(
                    movement.accountId,
                    data
                );

            if (!account) {

                return;

            }

            if (
                account.group ===
                "debt"
            ) {

                this.changeBalance(
                    account,
                    amount
                );

            } else {

                this.changeBalance(
                    account,
                    -amount
                );

            }

            return;

        }

        if (
            kind ===
            "transfer"
        ) {

            const fromAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const toAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            this.changeBalance(
                fromAccount,
                fromAccount?.group ===
                    "debt"
                    ? amount
                    : -amount
            );

            this.changeBalance(
                toAccount,
                toAccount?.group ===
                    "debt"
                    ? -amount
                    : amount
            );

            return;

        }

        if (
            kind ===
            "investment"
        ) {

            const fromAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const investmentAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            this.changeBalance(
                fromAccount,
                -amount
            );

            this.changeInvested(
                investmentAccount,
                amount
            );

            this.changeBalance(
                investmentAccount,
                amount
            );

            return;

        }

        if (
            kind ===
            "debt_payment"
        ) {

            const fromAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const debtAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            this.changeBalance(
                fromAccount,
                -amount
            );

            this.changeBalance(
                debtAccount,
                -amount
            );

        }

    },

    markOccurrenceConfirmed(
        data,
        occurrenceId,
        movement
    ) {

        if (!occurrenceId) {

            return;

        }

        const occurrence =
            this.findRecurringOccurrence(
                occurrenceId,
                data
            );

        if (!occurrence) {

            return;

        }

        occurrence.status =
            "confirmed";

        occurrence.ruleId =
            this.occurrenceRuleId(
                occurrence
            ) ||
            movement.recurringRuleId ||
            null;

        occurrence.recurringRuleId =
            occurrence.ruleId;

        occurrence.confirmedAmount =
            movement.amount;

        occurrence.confirmedDate =
            movement.date;

        occurrence.movementId =
            movement.id;

        occurrence.reviewedAt =
            occurrence.reviewedAt ||
            this.now();

        occurrence.confirmedAt =
            this.now();

        occurrence.updatedAt =
            this.now();

        const rule =
            this.findRecurringRule(
                occurrence.ruleId,
                data
            );

        if (rule) {

            rule.confirmedOccurrences =
                this.number(
                    rule.confirmedOccurrences
                ) + 1;

            rule.updatedAt =
                this.now();

        }

    },

    syncConfirmedOccurrence(
        data,
        movement
    ) {

        if (
            !movement
                ?.recurringOccurrenceId
        ) {

            return;

        }

        const occurrence =
            this.findRecurringOccurrence(
                movement
                    .recurringOccurrenceId,
                data
            );

        if (!occurrence) {

            return;

        }

        occurrence.status =
            "confirmed";

        occurrence.confirmedAmount =
            movement.amount;

        occurrence.confirmedDate =
            movement.date;

        occurrence.movementId =
            movement.id;

        occurrence.updatedAt =
            this.now();

    },

    restoreOccurrenceFromMovement(
        data,
        movement
    ) {

        if (
            !movement
                ?.recurringOccurrenceId
        ) {

            return;

        }

        const occurrence =
            this.findRecurringOccurrence(
                movement
                    .recurringOccurrenceId,
                data
            );

        if (!occurrence) {

            return;

        }

        occurrence.status =
            occurrence
                .possibleDuplicateMovementId
                ? "possible_duplicate"
                : "pending";

        occurrence.confirmedAmount =
            null;

        occurrence.confirmedDate =
            null;

        occurrence.movementId =
            null;

        occurrence.confirmedAt =
            null;

        occurrence.updatedAt =
            this.now();

        const rule =
            this.findRecurringRule(
                movement.recurringRuleId ||
                this.occurrenceRuleId(
                    occurrence
                ),
                data
            );

        if (rule) {

            rule.confirmedOccurrences =
                Math.max(
                    0,
                    this.number(
                        rule.confirmedOccurrences
                    ) - 1
                );

            rule.updatedAt =
                this.now();

        }

    },

    restoreSaveButton(
        saveButton,
        editing
    ) {

        if (!saveButton) {

            return;

        }

        saveButton.disabled =
            false;

        saveButton.textContent =
            this.recurringOccurrenceId
                ? "Confirmar movimiento"
                : editing
                    ? "Guardar cambios"
                    : "Guardar movimiento";

    },

    saveMovement(
        form,
        type
    ) {

        if (
            !form ||
            this.saving
        ) {

            return;

        }

        const movement =
            this.readForm(
                form,
                type
            );

        const error =
            this.validateMovement(
                movement
            );

        if (error) {

            AtlasUI.toast(error);

            return;

        }

        this.saving =
            true;

        const saveButton =
            form.querySelector(
                "[data-movement-save]"
            );

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Guardando…";

        }

        const updatedData =
            this.cloneData();

        if (
            !Array.isArray(
                updatedData.movements
            )
        ) {

            updatedData.movements =
                [];

        }

        if (this.editingId) {

            const oldIndex =
                updatedData.movements
                    .findIndex(
                        item =>
                            item.id ===
                            this.editingId
                    );

            if (
                oldIndex ===
                -1
            ) {

                this.saving =
                    false;

                this.restoreSaveButton(
                    saveButton,
                    true
                );

                AtlasUI.toast(
                    "No se pudo editar el movimiento."
                );

                return;

            }

            const oldMovement =
                updatedData.movements[
                    oldIndex
                ];

            this.applyMovement(
                updatedData,
                oldMovement,
                -1
            );

            updatedData.movements[
                oldIndex
            ] = movement;

            this.applyMovement(
                updatedData,
                movement,
                1
            );

            this.syncConfirmedOccurrence(
                updatedData,
                movement
            );

        } else {

            const existingLinked =
                movement
                    .recurringOccurrenceId
                    ? updatedData
                        .movements
                        .find(
                            item =>
                                item
                                    .recurringOccurrenceId ===
                                movement
                                    .recurringOccurrenceId
                        )
                    : null;

            if (existingLinked) {

                this.saving =
                    false;

                this.restoreSaveButton(
                    saveButton,
                    false
                );

                AtlasUI.toast(
                    "Esta propuesta ya tiene un movimiento registrado."
                );

                return;

            }

            updatedData.movements.push(
                movement
            );

            this.applyMovement(
                updatedData,
                movement,
                1
            );

            this.markOccurrenceConfirmed(
                updatedData,
                movement
                    .recurringOccurrenceId,
                movement
            );

        }

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving =
                false;

            this.restoreSaveButton(
                saveButton,
                Boolean(
                    this.editingId
                )
            );

            AtlasUI.toast(
                "No se pudo guardar el movimiento."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        const callback =
            this.onComplete;

        const wasRecurring =
            Boolean(
                movement
                    .recurringOccurrenceId
            );

        this.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                this.data,
                movement
            );

        }

        AtlasUI.toast(
            wasRecurring
                ? "Propuesta confirmada y movimiento registrado."
                : this.editingId
                    ? "Movimiento actualizado."
                    : "Movimiento guardado."
        );

    },

    confirmRecurringOccurrence(
        data,
        onComplete,
        occurrenceId
    ) {

        if (this.saving) {

            return;

        }

        this.data = data;
        this.onComplete = onComplete;
        this.editingId = null;
        this.recurringOccurrenceId =
            occurrenceId;

        const occurrence =
            this.findRecurringOccurrence(
                occurrenceId
            );

        if (!occurrence) {

            AtlasUI.toast(
                "No se encontró la propuesta."
            );

            return;

        }

        if (
            ![
                "pending",
                "possible_duplicate"
            ].includes(
                occurrence.status
            )
        ) {

            AtlasUI.toast(
                "Esta propuesta ya no está pendiente."
            );

            return;

        }

        const movement =
            this.movementFromOccurrence(
                occurrence
            );

        const error =
            this.validateMovement(
                movement
            );

        if (error) {

            AtlasUI.toast(
                `${error} Pulsa Revisar para corregirla.`
            );

            return;

        }

        const confirmed =
            window.confirm(
                `¿Confirmar ${
                    this.formatCurrency(
                        movement.amount
                    )
                } con fecha ${
                    this.formatDate(
                        movement.date
                    )
                }?`
            );

        if (!confirmed) {

            return;

        }

        const updatedData =
            this.cloneData();

        if (
            !Array.isArray(
                updatedData.movements
            )
        ) {

            updatedData.movements = [];

        }

        const existingLinked =
            updatedData.movements
                .find(
                    item =>
                        item
                            .recurringOccurrenceId ===
                        occurrenceId
                );

        if (existingLinked) {

            AtlasUI.toast(
                "Esta propuesta ya tiene un movimiento registrado."
            );

            return;

        }

        const freshOccurrence =
            this.findRecurringOccurrence(
                occurrenceId,
                updatedData
            );

        if (
            !freshOccurrence ||
            ![
                "pending",
                "possible_duplicate"
            ].includes(
                freshOccurrence.status
            )
        ) {

            AtlasUI.toast(
                "La propuesta ya no está disponible."
            );

            return;

        }

        this.saving = true;

        updatedData.movements.push(
            movement
        );

        this.applyMovement(
            updatedData,
            movement,
            1
        );

        this.markOccurrenceConfirmed(
            updatedData,
            occurrenceId,
            movement
        );

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving = false;

            AtlasUI.toast(
                "No se pudo confirmar la propuesta."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        this.saving = false;
        this.recurringOccurrenceId =
            null;

        if (
            typeof onComplete ===
            "function"
        ) {

            onComplete(
                this.data,
                movement
            );

        }

        AtlasUI.toast(
            "Propuesta confirmada."
        );

    },

    omitRecurringOccurrence(
        data,
        onComplete,
        occurrenceId
    ) {

        if (this.saving) {

            return;

        }

        const occurrence =
            this.findRecurringOccurrence(
                occurrenceId,
                data
            );

        if (!occurrence) {

            AtlasUI.toast(
                "No se encontró la propuesta."
            );

            return;

        }

        if (
            ![
                "pending",
                "possible_duplicate"
            ].includes(
                occurrence.status
            )
        ) {

            AtlasUI.toast(
                "Esta propuesta ya no está pendiente."
            );

            return;

        }

        const confirmed =
            window.confirm(
                "¿Omitir esta propuesta solo durante este mes?"
            );

        if (!confirmed) {

            return;

        }

        this.saving = true;

        const updatedData =
            this.cloneData(data);

        const updatedOccurrence =
            this.findRecurringOccurrence(
                occurrenceId,
                updatedData
            );

        if (!updatedOccurrence) {

            this.saving = false;

            AtlasUI.toast(
                "No se pudo omitir la propuesta."
            );

            return;

        }

        updatedOccurrence.status =
            "omitted";

        updatedOccurrence.omittedReason =
            "Omitido manualmente";

        updatedOccurrence.omittedAt =
            this.now();

        updatedOccurrence.updatedAt =
            this.now();

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving = false;

            AtlasUI.toast(
                "No se pudo omitir la propuesta."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        this.saving = false;

        if (
            typeof onComplete ===
            "function"
        ) {

            onComplete(
                this.data,
                null
            );

        }

        AtlasUI.toast(
            "Propuesta omitida este mes."
        );

    },

    deleteMovement() {

        if (
            !this.editingId ||
            this.saving
        ) {

            return;

        }

        const linkedReimbursements =
            (
                this.data?.movements ||
                []
            ).filter(
                movement =>
                    this.getMovementKind(
                        movement
                    ) ===
                        "reimbursement" &&
                    movement.linkedMovementId ===
                        this.editingId
            );

        let message =
            "¿Eliminar este movimiento?\n\nLos saldos se corregirán automáticamente.";

        const movementToDelete =
            this.findMovement(
                this.editingId
            );

        if (
            movementToDelete
                ?.recurringOccurrenceId
        ) {

            message +=
                "\n\nLa propuesta recurrente volverá a aparecer como pendiente.";

        }

        if (
            linkedReimbursements.length >
            0
        ) {

            message +=
                `\n\nTiene ${
                    linkedReimbursements.length
                } reembolso${
                    linkedReimbursements.length ===
                    1
                        ? ""
                        : "s"
                } vinculado${
                    linkedReimbursements.length ===
                    1
                        ? ""
                        : "s"
                }. Los reembolsos se conservarán, pero quedarán sin vincular.`;

        }

        const confirmed =
            window.confirm(
                message
            );

        if (!confirmed) {

            return;

        }

        this.saving =
            true;

        const updatedData =
            this.cloneData();

        const index =
            updatedData.movements
                .findIndex(
                    item =>
                        item.id ===
                        this.editingId
                );

        if (
            index ===
            -1
        ) {

            this.saving =
                false;

            AtlasUI.toast(
                "No se pudo eliminar el movimiento."
            );

            return;

        }

        const movement =
            updatedData.movements[
                index
            ];

        this.applyMovement(
            updatedData,
            movement,
            -1
        );

        this.restoreOccurrenceFromMovement(
            updatedData,
            movement
        );

        updatedData.movements.splice(
            index,
            1
        );

        updatedData.movements
            .forEach(
                item => {

                    if (
                        item.linkedMovementId ===
                        movement.id
                    ) {

                        item.linkedMovementId =
                            null;

                        item.updatedAt =
                            this.now();

                    }

                }
            );

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving =
                false;

            AtlasUI.toast(
                "No se pudo eliminar el movimiento."
            );

            return;

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
                this.data,
                null
            );

        }

        AtlasUI.toast(
            movement
                .recurringOccurrenceId
                ? "Movimiento eliminado y propuesta restaurada."
                : "Movimiento eliminado."
        );

    },

    close() {

        const root =
            this.root();

        if (root) {

            root.innerHTML =
                "";

        }

        document.body.classList.remove(
            "atlas-modal-open"
        );

        this.editingId =
            null;

        this.recurringOccurrenceId =
            null;

        this.saving =
            false;

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const typeButton =
                    event.target.closest(
                        "[data-movement-type]"
                    );

                if (typeButton) {

                    event.preventDefault();

                    this.renderForm(
                        typeButton.dataset
                            .movementType
                    );

                    return;

                }

                const movementRow =
                    event.target.closest(
                        "[data-movement-id]"
                    );

                if (movementRow) {

                    event.preventDefault();

                    this.open(
                        AtlasApp.data,
                        updatedData => {

                            AtlasApp.data =
                                updatedData;

                            AtlasApp.render();

                        },
                        movementRow.dataset
                            .movementId
                    );

                    return;

                }

                const actionButton =
                    event.target.closest(
                        "[data-movement-action]"
                    );

                if (!actionButton) {

                    return;

                }

                event.preventDefault();

                const action =
                    actionButton.dataset
                        .movementAction;

                if (
                    action ===
                    "save"
                ) {

                    const form =
                        actionButton.closest(
                            "[data-movement-form]"
                        );

                    if (!form) {

                        AtlasUI.toast(
                            "No se encontró el formulario."
                        );

                        return;

                    }

                    this.saveMovement(
                        form,
                        form.dataset
                            .movementForm
                    );

                    return;

                }

                if (
                    action ===
                    "close"
                ) {

                    this.close();

                    return;

                }

                if (
                    action ===
                    "types"
                ) {

                    if (
                        this.editingId ||
                        this.recurringOccurrenceId
                    ) {

                        this.close();

                    } else {

                        this.renderTypeSelector();

                    }

                    return;

                }

                if (
                    action ===
                    "delete"
                ) {

                    this.deleteMovement();

                }

            }
        );

        document.addEventListener(
            "change",
            event => {

                const linkedExpenseSelect =
                    event.target.closest(
                        "[data-reimbursement-linked-expense]"
                    );

                if (
                    linkedExpenseSelect
                ) {

                    this.applyLinkedExpenseToForm(
                        linkedExpenseSelect
                    );

                    return;

                }

                const categorySelect =
                    event.target.closest(
                        "[data-movement-category]"
                    );

                if (
                    !categorySelect
                ) {

                    return;

                }

                this.updateSubcategorySelect(
                    categorySelect
                );

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-movement-form]"
                    );

                if (!form) {

                    return;

                }

                event.preventDefault();

                this.saveMovement(
                    form,
                    form.dataset
                        .movementForm
                );

            }
        );

    }

};

AtlasMovements.bindEvents();

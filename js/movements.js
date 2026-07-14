/* ==========================================================
   ATLAS
   movements.js
   Sprint 4.0 — Categorías y subcategorías
========================================================== */

const AtlasMovements = {

    data: null,

    onComplete: null,

    editingId: null,

    saving: false,

    open(
        data,
        onComplete,
        movementId = null
    ) {

        this.data =
            data;

        this.onComplete =
            onComplete;

        this.editingId =
            movementId;

        this.saving =
            false;

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

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;

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

    findMovement(id) {

        return this.data.movements.find(
            movement =>
                movement.id === id
        );

    },

    findAccount(
        id,
        data = this.data
    ) {

        return data.accounts.find(
            account =>
                account.id === id
        );

    },

    getMovementKind(movement) {

        if (
            movement.kind ===
            "debt_payment"
        ) {
            return "debt_payment";
        }

        return movement.type;

    },

    catalogCategories(type) {

        const categories =
            this.data?.catalog
                ?.categories?.[type];

        if (
            !Array.isArray(categories)
        ) {
            return [];
        }

        return categories
            .filter(
                category =>
                    category.active !== false
            )
            .sort(
                (a, b) =>
                    this.number(a.order) -
                    this.number(b.order)
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

        return this.data.accounts
            .filter(
                account =>
                    filter(account)
            )
            .filter(
                account =>
                    account.active !== false &&
                    (
                        account.archived !== true ||
                        account.id === selectedId
                    )
            )
            .sort(
                (a, b) =>
                    this.number(a.order) -
                    this.number(b.order)
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

        const categories =
            this.catalogCategories(
                type
            );

        return categories
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
                (a, b) =>
                    this.number(a.order) -
                    this.number(b.order)
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

        if (movement?.categoryId) {

            return {
                categoryId:
                    movement.categoryId,

                subcategoryId:
                    movement.subcategoryId ||
                    ""
            };

        }

        const oldName =
            String(
                movement?.category ||
                ""
            )
                .trim()
                .toLowerCase();

        const mappings = {

            income: {

                "nómina": [
                    "work",
                    "work_salary"
                ],

                "nomina": [
                    "work",
                    "work_salary"
                ],

                "reembolso": [
                    "refunds",
                    "refunds_other"
                ],

                "venta": [
                    "extra_income",
                    "extra_income_second_hand"
                ],

                "otros ingresos": [
                    "other_income",
                    "other_income_unclassified"
                ]

            },

            expense: {

                "vivienda": [
                    "housing",
                    "housing_rent"
                ],

                "alimentación": [
                    "food",
                    "food_supermarket"
                ],

                "alimentacion": [
                    "food",
                    "food_supermarket"
                ],

                "transporte": [
                    "transport",
                    "transport_other"
                ],

                "salud": [
                    "health",
                    "health_other"
                ],

                "ocio": [
                    "leisure",
                    "leisure_other"
                ],

                "compras": [
                    "shopping",
                    "shopping_other"
                ],

                "suscripciones": [
                    "subscriptions",
                    "subscriptions_other"
                ],

                "viajes": [
                    "travel",
                    "travel_other"
                ],

                "impuestos": [
                    "taxes",
                    "taxes_other"
                ],

                "otros gastos": [
                    "other_expense",
                    "other_expense_unclassified"
                ]

            }

        };

        const match =
            mappings[type]?.[oldName];

        if (match) {

            return {
                categoryId:
                    match[0],

                subcategoryId:
                    match[1]
            };

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
                    ?.subcategories?.[0]
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

        return type === "income"
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
                    backdrop-filter: blur(8px);
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
                    margin: 7px 0 0;
                    color: #98a2bb;
                    line-height: 1.45;
                }

                .movement-back {
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
                    transform: scale(0.985);
                }

                .movement-type-icon {
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

                .movement-field input:focus,
                .movement-field select:focus {
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

                .movement-primary,
                .movement-secondary,
                .movement-danger {
                    width: 100%;
                    min-height: 56px;
                    border-radius: 17px;
                    font-size: 16px;
                    font-weight: 750;
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
                    "Nómina, Bizum, reembolso u otros ingresos."
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
                    "Mover dinero entre cuentas o pagar una tarjeta."
                )}

                ${this.typeButton(
                    "investment",
                    "📈",
                    "Inversión",
                    "Aportación a ETFs o Revolut Bot."
                )}

                ${this.typeButton(
                    "debt_payment",
                    "🚗",
                    "Pago de deuda",
                    "Pagar el préstamo y reducir la deuda."
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

        if (type === "income") {

            return `

                ${this.amountField(amount)}

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

        if (type === "expense") {

            return `

                ${this.amountField(amount)}

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

        if (type === "transfer") {

            return `

                ${this.amountField(amount)}

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

        if (type === "investment") {

            return `

                ${this.amountField(amount)}

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

            ${this.amountField(amount)}

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
        movement = null
    ) {

        const isEditing =
            Boolean(movement);

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
                            isEditing
                                ? "Editar movimiento"
                                : this.formTitle(
                                    type
                                )
                        }
                    </h2>

                    <p>
                        ${
                            isEditing
                                ? "Modifica los datos o elimina el movimiento."
                                : "Introduce los datos reales de la operación."
                        }
                    </p>

                </div>

            </div>

            <form
                class="movement-form"
                data-movement-form="${type}"
            >

                ${this.formFields(
                    type,
                    movement
                )}

                <button
                    class="movement-primary"
                    type="submit"
                    data-movement-save
                >
                    ${
                        isEditing
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
        categorySelect
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

        const type =
            categorySelect.dataset
                .categoryType;

        subcategorySelect.innerHTML =
            this.subcategoryOptions(
                type,
                categorySelect.value
            );

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
                type ===
                "debt_payment"
                    ? "debt_payment"
                    : type,

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
                oldMovement
                    ?.recurringRuleId ||
                null,

            recurringOccurrenceId:
                oldMovement
                    ?.recurringOccurrenceId ||
                null,

            createdAt:
                oldMovement
                    ?.createdAt ||
                new Date()
                    .toISOString(),

            updatedAt:
                new Date()
                    .toISOString()

        };

        if (
            type === "income" ||
            type === "expense"
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
                    type,
                    movement.categoryId,
                    movement.subcategoryId
                );

        }

        if (
            type === "transfer" ||
            type === "investment" ||
            type === "debt_payment"
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

        if (type === "investment") {

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

        if (type === "transfer") {

            movement.category =
                "Traspaso";

            movement.categoryId =
                null;

            movement.subcategoryId =
                null;

        }

        if (type === "debt_payment") {

            movement.category =
                "Pago de deuda";

            movement.categoryId =
                null;

            movement.subcategoryId =
                null;

        }

        if (type === "income") {

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

    validateMovement(movement) {

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
                movement.type ===
                    "income" ||
                movement.type ===
                    "expense"
            ) &&
            (
                !movement.categoryId ||
                !movement.subcategoryId
            )
        ) {

            return "Selecciona una categoría y subcategoría.";

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
                    !this.findAccount(id)
            );

        if (missingAccount) {

            return "Una de las cuentas no existe.";

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
            this.number(amount);

        account.updatedAt =
            new Date()
                .toISOString();

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
            this.number(amount);

        account.updatedAt =
            new Date()
                .toISOString();

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

        if (kind === "income") {

            const account =
                this.findAccount(
                    movement.accountId,
                    data
                );

            this.changeBalance(
                account,
                amount
            );

            return;

        }

        if (kind === "expense") {

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

        if (kind === "transfer") {

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

            if (
                fromAccount?.group ===
                "debt"
            ) {

                this.changeBalance(
                    fromAccount,
                    amount
                );

            } else {

                this.changeBalance(
                    fromAccount,
                    -amount
                );

            }

            if (
                toAccount?.group ===
                "debt"
            ) {

                this.changeBalance(
                    toAccount,
                    -amount
                );

            } else {

                this.changeBalance(
                    toAccount,
                    amount
                );

            }

            return;

        }

        if (kind === "investment") {

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

        if (kind === "debt_payment") {

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

    saveMovement(
        form,
        type
    ) {

        if (this.saving) {
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

        if (this.editingId) {

            const oldIndex =
                updatedData.movements
                    .findIndex(
                        item =>
                            item.id ===
                            this.editingId
                    );

            if (oldIndex === -1) {

                this.saving =
                    false;

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

        } else {

            updatedData.movements.push(
                movement
            );

            this.applyMovement(
                updatedData,
                movement,
                1
            );

        }

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            this.saving =
                false;

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    this.editingId
                        ? "Guardar cambios"
                        : "Guardar movimiento";

            }

            AtlasUI.toast(
                "No se pudo guardar el movimiento."
            );

            return;

        }

        this.data =
            updatedData;

        const callback =
            this.onComplete;

        this.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                updatedData,
                movement
            );

        }

    },

    deleteMovement() {

        if (
            !this.editingId ||
            this.saving
        ) {
            return;
        }

        const movement =
            this.findMovement(
                this.editingId
            );

        if (!movement) {

            AtlasUI.toast(
                "No se encontró el movimiento."
            );

            return;

        }

        const confirmed =
            window.confirm(
                "¿Eliminar este movimiento?\n\nLos saldos se corregirán automáticamente."
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

        if (index === -1) {

            this.saving =
                false;

            AtlasUI.toast(
                "No se pudo eliminar el movimiento."
            );

            return;

        }

        const movementToDelete =
            updatedData.movements[
                index
            ];

        this.applyMovement(
            updatedData,
            movementToDelete,
            -1
        );

        updatedData.movements.splice(
            index,
            1
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
            updatedData;

        const callback =
            this.onComplete;

        this.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                updatedData,
                null
            );

        }

        AtlasUI.toast(
            "Movimiento eliminado."
        );

    },

    close() {

        const root =
            this.root();

        if (root) {
            root.innerHTML = "";
        }

        document.body.classList.remove(
            "atlas-modal-open"
        );

        this.editingId =
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

                const action =
                    actionButton.dataset
                        .movementAction;

                if (action === "close") {

                    this.close();

                    return;

                }

                if (action === "types") {

                    if (this.editingId) {

                        this.close();

                    } else {

                        this.renderTypeSelector();

                    }

                    return;

                }

                if (action === "delete") {

                    this.deleteMovement();

                }

            }
        );

        document.addEventListener(
            "change",
            event => {

                const categorySelect =
                    event.target.closest(
                        "[data-movement-category]"
                    );

                if (!categorySelect) {
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

/* ==========================================================
   ATLAS
   movements.js
   Sprint 2.3 — Crear, editar y eliminar movimientos
========================================================== */

const AtlasMovements = {

    data: null,
    onComplete: null,
    editingId: null,
    saving: false,

    categories: {

        income: [
            "Nómina",
            "Intereses",
            "Reembolso",
            "Venta",
            "Otros ingresos"
        ],

        expense: [
            "Vivienda",
            "Alimentación",
            "Transporte",
            "Salud",
            "Ocio",
            "Compras",
            "Suscripciones",
            "Viajes",
            "Impuestos",
            "Otros gastos"
        ],

        investment: [
            "Aportación periódica",
            "Aportación extraordinaria",
            "Otros"
        ]

    },

    open(data, onComplete, movementId = null) {

        this.data = data;
        this.onComplete = onComplete;
        this.editingId = movementId;
        this.saving = false;

        if (movementId) {

            const movement =
                this.findMovement(movementId);

            if (!movement) {

                AtlasUI.toast(
                    "No se encontró el movimiento."
                );

                return;

            }

            this.renderForm(
                this.getMovementKind(movement),
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

    findMovement(id) {

        return this.data.movements.find(
            movement =>
                movement.id === id
        );

    },

    findAccount(id, data = this.data) {

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

    cloneData() {

        return JSON.parse(
            JSON.stringify(this.data)
        );

    },

    generateId() {

        return (
            "mov_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    },

    today() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

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

    liquidityAccounts(data = this.data) {

        return data.accounts.filter(
            account =>
                account.group ===
                "liquidity"
        );

    },

    investmentAccounts(data = this.data) {

        return data.accounts.filter(
            account =>
                account.group ===
                "investment"
        );

    },

    debtAccounts(data = this.data) {

        return data.accounts.filter(
            account =>
                account.group ===
                "debt"
        );

    },

    paymentAccounts(data = this.data) {

        return data.accounts.filter(
            account =>
                account.group ===
                    "liquidity" ||
                account.id ===
                    "amex" ||
                account.id ===
                    "bbva_credit"
        );

    },

    transferAccounts(data = this.data) {

        return data.accounts.filter(
            account =>
                account.group ===
                    "liquidity" ||
                account.group ===
                    "debt"
        );

    },

    formatAccountOptions(
        accounts,
        selectedId = ""
    ) {

        return accounts
            .map(account => `

                <option
                    value="${this.escape(account.id)}"
                    ${
                        account.id === selectedId
                            ? "selected"
                            : ""
                    }
                >
                    ${this.escape(account.name)}
                </option>

            `)
            .join("");

    },

    categoryOptions(
        type,
        selectedCategory = ""
    ) {

        return this.categories[type]
            .map(category => `

                <option
                    value="${this.escape(category)}"
                    ${
                        category === selectedCategory
                            ? "selected"
                            : ""
                    }
                >
                    ${this.escape(category)}
                </option>

            `)
            .join("");

    },

    styles() {

        return `

            <style>

                body.atlas-modal-open {
                    overflow: hidden;
                }

                .atlas-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 3000;
                    background: rgba(3, 7, 18, 0.76);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .atlas-sheet {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 3001;
                    max-height: 92vh;
                    overflow-y: auto;
                    padding:
                        12px
                        22px
                        calc(
                            24px +
                            env(safe-area-inset-bottom)
                        );
                    border-radius:
                        30px
                        30px
                        0
                        0;
                    background: #11192e;
                    border: 1px solid rgba(
                        145,
                        164,
                        202,
                        0.24
                    );
                    box-shadow:
                        0 -20px 60px
                        rgba(0, 0, 0, 0.45);
                    animation:
                        atlasSheetUp
                        0.24s
                        ease;
                }

                @keyframes atlasSheetUp {

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

                .atlas-sheet-handle {
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

                .atlas-sheet-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .atlas-sheet-header h2 {
                    margin: 0;
                    color: #f7f8fc;
                    font-size: 28px;
                    line-height: 1.15;
                    letter-spacing: -0.6px;
                }

                .atlas-sheet-header p {
                    margin:
                        8px
                        0
                        0;
                    color: #98a2bb;
                    line-height: 1.45;
                }

                .atlas-sheet-back {
                    width: 40px;
                    height: 40px;
                    flex: 0 0 40px;
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
                    line-height: 1;
                }

                .atlas-movement-types {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .atlas-movement-type {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border: 1px solid
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

                .atlas-movement-type:active {
                    transform: scale(0.985);
                }

                .atlas-movement-icon {
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

                .atlas-movement-type strong {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 17px;
                }

                .atlas-movement-type small {
                    display: block;
                    color: #98a2bb;
                    font-size: 14px;
                    line-height: 1.35;
                }

                .atlas-movement-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .atlas-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .atlas-field > span {
                    color: #c8d0e3;
                    font-size: 13px;
                    font-weight: 700;
                }

                .atlas-field input,
                .atlas-field select {
                    width: 100%;
                    min-height: 54px;
                    padding: 0 15px;
                    border: 1px solid
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

                .atlas-field input:focus,
                .atlas-field select:focus {
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

                .atlas-money-input {
                    position: relative;
                }

                .atlas-money-input input {
                    padding-right: 48px;
                }

                .atlas-money-input b {
                    position: absolute;
                    right: 17px;
                    top: 50%;
                    transform:
                        translateY(-50%);
                    color: #98a2bb;
                    pointer-events: none;
                }

                .atlas-sheet-primary,
                .atlas-sheet-secondary,
                .atlas-sheet-danger {
                    width: 100%;
                    min-height: 56px;
                    border-radius: 17px;
                    font-weight: 750;
                    font-size: 16px;
                }

                .atlas-sheet-primary {
                    margin-top: 6px;
                    background:
                        linear-gradient(
                            135deg,
                            #4da3ff,
                            #2879ed
                        );
                    color: white;
                }

                .atlas-sheet-primary:disabled {
                    opacity: 0.55;
                }

                .atlas-sheet-secondary {
                    margin-top: 12px;
                    color: #98a2bb;
                    background: transparent;
                }

                .atlas-sheet-danger {
                    margin-top: 12px;
                    color: #ff6878;
                    background:
                        rgba(
                            255,
                            104,
                            120,
                            0.08
                        );
                    border: 1px solid
                        rgba(
                            255,
                            104,
                            120,
                            0.18
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
                class="atlas-modal-backdrop"
                data-movement-action="close"
            ></div>

            <section
                class="atlas-sheet"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="atlas-sheet-handle"
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
                class="atlas-movement-type"
                type="button"
                data-movement-type="${type}"
            >

                <span
                    class="atlas-movement-icon"
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

            <div
                class="atlas-sheet-header"
            >

                <div>

                    <h2>
                        Registrar movimiento
                    </h2>

                    <p>
                        ¿Qué quieres registrar?
                    </p>

                </div>

            </div>

            <div
                class="atlas-movement-types"
            >

                ${this.typeButton(
                    "income",
                    "🟢",
                    "Ingreso",
                    "Nómina, intereses u otros ingresos"
                )}

                ${this.typeButton(
                    "expense",
                    "🔴",
                    "Gasto",
                    "Compra o pago realizado"
                )}

                ${this.typeButton(
                    "transfer",
                    "🔄",
                    "Traspaso",
                    "Mover dinero entre tus cuentas"
                )}

                ${this.typeButton(
                    "investment",
                    "📈",
                    "Inversión",
                    "Aportación a ETFs o Revolut Bot"
                )}

                ${this.typeButton(
                    "debt_payment",
                    "💳",
                    "Pago de deuda",
                    "Pagar el préstamo y reducir deuda"
                )}

            </div>

            <button
                class="atlas-sheet-secondary"
                type="button"
                data-movement-action="close"
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

            <label class="atlas-field">

                <span>
                    Importe
                </span>

                <div
                    class="atlas-money-input"
                >

                    <input
                        name="amount"
                        type="number"
                        inputmode="decimal"
                        min="0.01"
                        step="0.01"
                        value="${this.escape(amount)}"
                        placeholder="0,00"
                        required
                    >

                    <b>€</b>

                </div>

            </label>

        `;

    },

    commonFields(movement) {

        return `

            <label class="atlas-field">

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

            <label class="atlas-field">

                <span>
                    Nota opcional
                </span>

                <input
                    name="note"
                    type="text"
                    value="${this.escape(
                        movement?.note ||
                        ""
                    )}"
                    placeholder="Añadir una nota"
                    maxlength="120"
                >

            </label>

        `;

    },

    formFields(type, movement = null) {

        const amount =
            movement?.amount || "";

        const common =
            this.commonFields(movement);

        if (type === "income") {

            return `

                ${this.amountField(amount)}

                <label class="atlas-field">

                    <span>
                        Categoría
                    </span>

                    <select
                        name="category"
                        required
                    >
                        ${this.categoryOptions(
                            "income",
                            movement?.category
                        )}
                    </select>

                </label>

                <label class="atlas-field">

                    <span>
                        Cuenta de destino
                    </span>

                    <select
                        name="accountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.liquidityAccounts(),
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

                <label class="atlas-field">

                    <span>
                        Categoría
                    </span>

                    <select
                        name="category"
                        required
                    >
                        ${this.categoryOptions(
                            "expense",
                            movement?.category
                        )}
                    </select>

                </label>

                <label class="atlas-field">

                    <span>
                        Cuenta o tarjeta
                    </span>

                    <select
                        name="accountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.paymentAccounts(),
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

                <label class="atlas-field">

                    <span>
                        Cuenta de origen
                    </span>

                    <select
                        name="fromAccountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.transferAccounts(),
                            movement?.fromAccountId
                        )}
                    </select>

                </label>

                <label class="atlas-field">

                    <span>
                        Cuenta de destino
                    </span>

                    <select
                        name="toAccountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.transferAccounts(),
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

                <label class="atlas-field">

                    <span>
                        Categoría
                    </span>

                    <select
                        name="category"
                        required
                    >
                        ${this.categoryOptions(
                            "investment",
                            movement?.category
                        )}
                    </select>

                </label>

                <label class="atlas-field">

                    <span>
                        Cuenta de origen
                    </span>

                    <select
                        name="fromAccountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.liquidityAccounts(),
                            movement?.fromAccountId
                        )}
                    </select>

                </label>

                <label class="atlas-field">

                    <span>
                        Inversión de destino
                    </span>

                    <select
                        name="toAccountId"
                        required
                    >
                        ${this.formatAccountOptions(
                            this.investmentAccounts(),
                            movement?.toAccountId
                        )}
                    </select>

                </label>

                ${common}

            `;

        }

        return `

            ${this.amountField(amount)}

            <label class="atlas-field">

                <span>
                    Cuenta de origen
                </span>

                <select
                    name="fromAccountId"
                    required
                >
                    ${this.formatAccountOptions(
                        this.liquidityAccounts(),
                        movement?.fromAccountId
                    )}
                </select>

            </label>

            <label class="atlas-field">

                <span>
                    Deuda que reduces
                </span>

                <select
                    name="toAccountId"
                    required
                >
                    ${this.formatAccountOptions(
                        this.debtAccounts(),
                        movement?.toAccountId
                    )}
                </select>

            </label>

            ${common}

        `;

    },

    renderForm(type, movement = null) {

        const isEditing =
            Boolean(movement);

        this.renderSheet(`

            <div
                class="atlas-sheet-header"
            >

                <button
                    class="atlas-sheet-back"
                    type="button"
                    data-movement-action="${
                        isEditing
                            ? "close"
                            : "types"
                    }"
                    aria-label="Volver"
                >
                    ‹
                </button>

                <div>

                    <h2>
                        ${
                            isEditing
                                ? "Editar movimiento"
                                : this.formTitle(type)
                        }
                    </h2>

                    <p>
                        ${
                            isEditing
                                ? "Modifica los datos o elimina el movimiento."
                                : "Introduce los datos del movimiento."
                        }
                    </p>

                </div>

            </div>

            <form
                class="atlas-movement-form"
                data-movement-form="${type}"
            >

                ${this.formFields(
                    type,
                    movement
                )}

                <button
                    class="atlas-sheet-primary"
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
                                class="atlas-sheet-danger"
                                type="button"
                                data-movement-action="delete"
                            >
                                Eliminar movimiento
                            </button>

                        `
                        : ""
                }

                <button
                    class="atlas-sheet-secondary"
                    type="button"
                    data-movement-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    readForm(form, type) {

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
                type === "debt_payment"
                    ? "expense"
                    : type,

            kind:
                type === "debt_payment"
                    ? "debt_payment"
                    : type,

            amount:
                Number(
                    values.get("amount")
                ),

            date:
                String(
                    values.get("date") ||
                    ""
                ),

            note:
                String(
                    values.get("note") ||
                    ""
                ).trim(),

            createdAt:
                oldMovement?.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };

        if (
            type === "income" ||
            type === "expense"
        ) {

            movement.accountId =
                String(
                    values.get("accountId") ||
                    ""
                );

            movement.category =
                String(
                    values.get("category") ||
                    ""
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
                    values.get("category") ||
                    "Aportación"
                );

        }

        if (type === "transfer") {

            movement.category =
                "Traspaso";

        }

        if (type === "debt_payment") {

            movement.category =
                "Pago de deuda";

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

    changeBalance(account, amount) {

        if (!account) {
            return;
        }

        account.balance =
            Number(
                account.balance || 0
            ) +
            Number(amount || 0);

    },

    changeInvested(account, amount) {

        if (!account) {
            return;
        }

        account.invested =
            Number(
                account.invested || 0
            ) +
            Number(amount || 0);

    },

    applyMovement(
        data,
        movement,
        direction = 1
    ) {

        const amount =
            Number(movement.amount) *
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

            if (account.group === "debt") {

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
                fromAccount.group ===
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
                toAccount.group ===
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

    saveMovement(form, type) {

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

        this.saving = true;

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

                this.saving = false;

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

            this.saving = false;

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

        this.saving = true;

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

            this.saving = false;

            AtlasUI.toast(
                "No se pudo eliminar el movimiento."
            );

            return;

        }

        const movementToDelete =
            updatedData.movements[index];

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

            this.saving = false;

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

        this.editingId = null;
        this.saving = false;

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

                    this.renderTypeSelector();

                    return;

                }

                if (action === "delete") {

                    this.deleteMovement();

                }

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

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
                .slice(2, 8)
        );
    },

    today() {

        const now = new Date();

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
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    },

    formatAccountOptions(
        accounts,
        selectedId = ""
    ) {

        return accounts
            .map(account => `

                <option
                    value="${account.id}"
                    ${
                        account.id ===
                        selectedId
                            ? "selected"
                            : ""
                    }
                >
                    ${this.escape(account.name)}
                </option>

            `)
            .join("");

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
                account.id === "amex" ||
                account.id === "bbva_credit"
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

    renderSheet(content) {

        const root =
            this.root();

        if (!root) {
            return;
        }

        root.innerHTML = `

            <div
                class="modal-backdrop"
                data-movement-action="close"
            ></div>

            <section
                class="sheet"
                role="dialog"
                aria-modal="true"
            >

                <div class="sheet-handle"></div>

                ${content}

            </section>

        `;

    },

    renderTypeSelector() {

        this.renderSheet(`

            <div class="sheet-header">

                <h2>
                    Registrar movimiento
                </h2>

                <p class="subtitle">
                    ¿Qué quieres registrar?
                </p>

            </div>

            <div class="movement-types">

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
                    "Pagar el préstamo o reducir deuda"
                )}

            </div>

            <button
                class="secondary"
                type="button"
                data-movement-action="close"
            >
                Cancelar
            </button>

        `);

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

                <span class="movement-type-icon">
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

    renderForm(type, movement = null) {

        const isEditing =
            Boolean(movement);

        const title =
            isEditing
                ? "Editar movimiento"
                : this.formTitle(type);

        this.renderSheet(`

            <div class="sheet-header">

                <button
                    class="sheet-back"
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
                        ${title}
                    </h2>

                    <p class="subtitle">
                        ${
                            isEditing
                                ? "Modifica los datos o elimina el movimiento."
                                : "Introduce los datos del movimiento."
                        }
                    </p>

                </div>

            </div>

            <form
                id="movement-form"
                data-movement-form="${type}"
            >

                ${this.formFields(
                    type,
                    movement
                )}

                <button
                    class="primary"
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
                                class="secondary"
                                type="button"
                                data-movement-action="delete"
                                style="
                                    margin-top:12px;
                                    color:var(--color-danger);
                                "
                            >
                                Eliminar movimiento
                            </button>
                        `
                        : ""
                }

                <button
                    class="secondary"
                    type="button"
                    data-movement-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    formTitle(type) {

        const titles = {
            income: "Registrar ingreso",
            expense: "Registrar gasto",
            transfer: "Registrar traspaso",
            investment: "Registrar inversión",
            debt_payment: "Registrar pago de deuda"
        };

        return titles[type] ||
            "Registrar movimiento";

    },

    formFields(type, movement = null) {

        const date =
            movement?.date ||
            this.today();

        const amount =
            movement?.amount || "";

        const note =
            movement?.note || "";

        const commonEnd = `

            <label class="field">

                <span>
                    Fecha del movimiento
                </span>

                <input
                    name="date"
                    type="date"
                    value="${this.escape(date)}"
                    required
                >

            </label>

            <label class="field">

                <span>
                    Nota opcional
                </span>

                <input
                    name="note"
                    type="text"
                    value="${this.escape(note)}"
                    placeholder="Añadir una nota"
                    maxlength="120"
                >

            </label>

        `;

        if (type === "income") {

            return `

                ${this.amountField(amount)}

                <label class="field">

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

                <label class="field">

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

                ${commonEnd}

            `;

        }

        if (type === "expense") {

            return `

                ${this.amountField(amount)}

                <label class="field">

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

                <label class="field">

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

                ${commonEnd}

            `;

        }

        if (type === "transfer") {

            return `

                ${this.amountField(amount)}

                <label class="field">

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

                <label class="field">

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

                ${commonEnd}

            `;

        }

        if (type === "investment") {

            return `

                ${this.amountField(amount)}

                <label class="field">

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

                <label class="field">

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

                <label class="field">

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

                ${commonEnd}

            `;

        }

        return `

            ${this.amountField(amount)}

            <label class="field">

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

            <label class="field">

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

            ${commonEnd}

        `;

    },

    amountField(amount) {

        return `

            <label class="field">

                <span>
                    Importe
                </span>

                <div class="money-input">

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

                    <span>
                        €
                    </span>

                </div>

            </label>

        `;

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
                        category ===
                        selectedCategory
                            ? "selected"
                            : ""
                    }
                >
                    ${this.escape(category)}
                </option>

            `)
            .join("");

    },

    readForm(form, type) {

        const values =
            new FormData(form);

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
                    values.get("date") || ""
                ),

            note:
                String(
                    values.get("note") || ""
                ).trim(),

            createdAt:
                this.editingId
                    ? (
                        this.findMovement(
                            this.editingId
                        )?.createdAt ||
                        new Date().toISOString()
                    )
                    : new Date().toISOString(),

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
                    values.get("fromAccountId") ||
                    ""
                );

            movement.toAccountId =
                String(
                    values.get("toAccountId") ||
                    ""
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

        const ids = [
            movement.accountId,
            movement.fromAccountId,
            movement.toAccountId
        ].filter(Boolean);

        const missingAccount =
            ids.some(
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

        account.balance =
            Number(account.balance || 0) +
            Number(amount || 0);

    },

    changeInvested(
        account,
        amount
    ) {

        account.invested =
            Number(account.invested || 0) +
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
            saveButton.disabled = true;
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
                saveButton.disabled = false;
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

        this.close();

        if (
            typeof this.onComplete ===
            "function"
        ) {
            this.onComplete(
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
                "¿Eliminar este movimiento?\n\nLos saldos de las cuentas se corregirán automáticamente."
            );

        if (!confirmed) {
            return;
        }

        this.saving = true;

        const updatedData =
            this.cloneData();

        const movementIndex =
            updatedData.movements
                .findIndex(
                    item =>
                        item.id ===
                        this.editingId
                );

        const movementToDelete =
            updatedData.movements[
                movementIndex
            ];

        this.applyMovement(
            updatedData,
            movementToDelete,
            -1
        );

        updatedData.movements.splice(
            movementIndex,
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

        this.close();

        if (
            typeof this.onComplete ===
            "function"
        ) {
            this.onComplete(
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
                }

                if (action === "types") {
                    this.renderTypeSelector();
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

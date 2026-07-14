/* ==========================================================
   ATLAS
   movements.js
   Sprint 2.2 — Registro de movimientos
========================================================== */

const AtlasMovements = {

    data: null,

    onSave: null,

    selectedType: null,

    categories: {
        income: [
            "Nómina",
            "Bonus",
            "Intereses",
            "Dividendos",
            "Devoluciones",
            "Otros ingresos"
        ],

        expense: [
            "Vivienda",
            "Supermercado",
            "Restaurantes",
            "Ocio",
            "Transporte",
            "Viajes",
            "Salud",
            "Compras",
            "Suscripciones",
            "Seguros",
            "Impuestos",
            "Coche",
            "Otros gastos"
        ],

        debt: [
            "Préstamo coche",
            "Amortización",
            "Otros pagos de deuda"
        ]
    },

    uid() {
        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    },

    today() {
        return new Date()
            .toISOString()
            .slice(0, 10);
    },

    number(value) {
        return (
            Number(
                String(value || "")
                    .replace(",", ".")
            ) || 0
        );
    },

    account(id) {
        return this.data.accounts.find(
            account => account.id === id
        );
    },

    accountsByGroup(group) {
        return this.data.accounts.filter(
            account => account.group === group
        );
    },

    liquidityAccounts() {
        return this.accountsByGroup(
            "liquidity"
        );
    },

    investmentAccounts() {
        return this.accountsByGroup(
            "investment"
        );
    },

    debtAccounts() {
        return this.accountsByGroup(
            "debt"
        );
    },

    allPaymentAccounts() {
        return this.data.accounts.filter(
            account =>
                account.group === "liquidity" ||
                account.group === "debt"
        );
    },

    open(data, onSave) {
        this.data = data;
        this.onSave = onSave;
        this.selectedType = null;
        this.renderTypeSelector();
    },

    close() {
        const root =
            document.getElementById(
                "modal-root"
            );

        if (root) {
            root.innerHTML = "";
        }
    },

    shell(content) {
        return `
            <div
                style="
                    position:fixed;
                    inset:0;
                    z-index:3500;
                    display:flex;
                    align-items:flex-end;
                    background:rgba(3,7,18,.76);
                    backdrop-filter:blur(10px);
                "
                data-movement-action="close-background"
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
                    data-movement-sheet
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

                    ${content}

                </section>

            </div>
        `;
    },

    field({
        id,
        label,
        type = "text",
        value = "",
        placeholder = "",
        inputmode = "",
        min = "",
        step = ""
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

                <input
                    id="${id}"
                    type="${type}"
                    value="${value}"
                    placeholder="${placeholder}"
                    ${inputmode ? `inputmode="${inputmode}"` : ""}
                    ${min !== "" ? `min="${min}"` : ""}
                    ${step !== "" ? `step="${step}"` : ""}
                    style="
                        width:100%;
                        min-height:52px;
                        padding:0 14px;
                        border-radius:14px;
                        border:1px solid var(--color-border-strong);
                        background:var(--color-background-secondary);
                        color:var(--color-text);
                        font-size:16px;
                        outline:none;
                    "
                >

            </div>
        `;
    },

    select({
        id,
        label,
        options
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

                <select
                    id="${id}"
                    style="
                        width:100%;
                        min-height:52px;
                        padding:0 14px;
                        border-radius:14px;
                        border:1px solid var(--color-border-strong);
                        background:var(--color-background-secondary);
                        color:var(--color-text);
                        font-size:16px;
                        outline:none;
                    "
                >

                    ${options.map(option => `
                        <option value="${option.value}">
                            ${option.label}
                        </option>
                    `).join("")}

                </select>

            </div>
        `;
    },

    accountOptions(accounts) {
        return accounts.map(account => ({
            value: account.id,
            label: account.name
        }));
    },

    categoryOptions(categories) {
        return categories.map(category => ({
            value: category,
            label: category
        }));
    },

    footerButtons() {
        return `
            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 1.7fr;
                    gap:10px;
                    margin-top:22px;
                "
            >

                <button
                    type="button"
                    data-movement-action="back"
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

                <button
                    type="button"
                    data-movement-action="save"
                    style="
                        min-height:52px;
                        border-radius:15px;
                        background:var(--gradient-primary);
                        color:white;
                        font-weight:800;
                        box-shadow:var(--shadow-md);
                    "
                >
                    Guardar movimiento
                </button>

            </div>
        `;
    },

    renderTypeSelector() {
        const root =
            document.getElementById(
                "modal-root"
            );

        root.innerHTML = this.shell(`
            <h2
                style="
                    margin:0 0 6px;
                    font-size:26px;
                "
            >
                Registrar movimiento
            </h2>

            <p
                style="
                    margin:0 0 20px;
                    color:var(--color-text-muted);
                    line-height:1.5;
                "
            >
                ¿Qué quieres registrar?
            </p>

            <div
                style="
                    display:grid;
                    gap:10px;
                "
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
                type="button"
                data-movement-action="close"
                style="
                    width:100%;
                    min-height:50px;
                    margin-top:14px;
                    color:var(--color-text-muted);
                    font-weight:700;
                "
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
                type="button"
                data-movement-type="${type}"
                style="
                    width:100%;
                    display:flex;
                    align-items:center;
                    gap:14px;
                    padding:15px;
                    text-align:left;
                    border-radius:17px;
                    border:1px solid var(--color-border);
                    background:var(--color-surface);
                    color:var(--color-text);
                "
            >

                <span
                    style="
                        width:42px;
                        height:42px;
                        display:grid;
                        place-items:center;
                        flex:0 0 auto;
                        border-radius:14px;
                        background:var(--color-surface-hover);
                        font-size:20px;
                    "
                >
                    ${icon}
                </span>

                <span>
                    <strong
                        style="
                            display:block;
                            font-size:15px;
                        "
                    >
                        ${title}
                    </strong>

                    <small
                        style="
                            display:block;
                            margin-top:4px;
                            color:var(--color-text-muted);
                            line-height:1.35;
                        "
                    >
                        ${description}
                    </small>
                </span>

            </button>
        `;
    },

    renderForm(type) {
        this.selectedType = type;

        const root =
            document.getElementById(
                "modal-root"
            );

        const forms = {
            income:
                () => this.incomeForm(),

            expense:
                () => this.expenseForm(),

            transfer:
                () => this.transferForm(),

            investment:
                () => this.investmentForm(),

            debt_payment:
                () => this.debtPaymentForm()
        };

        root.innerHTML =
            this.shell(
                forms[type]()
            );
    },

    commonFields() {
        return `
            ${this.field({
                id: "movement-amount",
                label: "Importe",
                type: "number",
                inputmode: "decimal",
                min: "0",
                step: "0.01",
                placeholder: "0,00"
            })}

            ${this.field({
                id: "movement-date",
                label: "Fecha del movimiento",
                type: "date",
                value: this.today()
            })}

            ${this.field({
                id: "movement-note",
                label: "Nota opcional",
                type: "text",
                placeholder: "Añade una nota"
            })}
        `;
    },

    incomeForm() {
        return `
            ${this.formHeader(
                "🟢",
                "Nuevo ingreso",
                "El dinero aumentará el saldo de la cuenta."
            )}

            ${this.select({
                id: "movement-account",
                label: "Cuenta de destino",
                options:
                    this.accountOptions(
                        this.liquidityAccounts()
                    )
            })}

            ${this.select({
                id: "movement-category",
                label: "Categoría",
                options:
                    this.categoryOptions(
                        this.categories.income
                    )
            })}

            ${this.commonFields()}

            ${this.footerButtons()}
        `;
    },

    expenseForm() {
        return `
            ${this.formHeader(
                "🔴",
                "Nuevo gasto",
                "Puedes pagar desde una cuenta o registrar una compra con tarjeta."
            )}

            ${this.select({
                id: "movement-account",
                label: "Cuenta o tarjeta",
                options:
                    this.accountOptions(
                        this.allPaymentAccounts()
                    )
            })}

            ${this.select({
                id: "movement-category",
                label: "Categoría",
                options:
                    this.categoryOptions(
                        this.categories.expense
                    )
            })}

            ${this.commonFields()}

            ${this.footerButtons()}
        `;
    },

    transferForm() {
        return `
            ${this.formHeader(
                "🔄",
                "Nuevo traspaso",
                "No contará como ingreso ni como gasto."
            )}

            ${this.select({
                id: "movement-from-account",
                label: "Cuenta de origen",
                options:
                    this.accountOptions(
                        this.data.accounts
                    )
            })}

            ${this.select({
                id: "movement-to-account",
                label: "Cuenta de destino",
                options:
                    this.accountOptions(
                        this.data.accounts
                    )
            })}

            ${this.commonFields()}

            ${this.footerButtons()}
        `;
    },

    investmentForm() {
        return `
            ${this.formHeader(
                "📈",
                "Nueva inversión",
                "La aportación reducirá tu liquidez y aumentará el capital invertido."
            )}

            ${this.select({
                id: "movement-from-account",
                label: "Cuenta de origen",
                options:
                    this.accountOptions(
                        this.liquidityAccounts()
                    )
            })}

            ${this.select({
                id: "movement-to-account",
                label: "Inversión de destino",
                options:
                    this.accountOptions(
                        this.investmentAccounts()
                    )
            })}

            ${this.commonFields()}

            ${this.footerButtons()}
        `;
    },

    debtPaymentForm() {
        return `
            ${this.formHeader(
                "💳",
                "Pago de deuda",
                "Saldrá dinero de la cuenta y se reducirá la deuda pendiente."
            )}

            ${this.select({
                id: "movement-from-account",
                label: "Cuenta de origen",
                options:
                    this.accountOptions(
                        this.liquidityAccounts()
                    )
            })}

            ${this.select({
                id: "movement-to-account",
                label: "Deuda que pagas",
                options:
                    this.accountOptions(
                        this.debtAccounts()
                    )
            })}

            ${this.select({
                id: "movement-category",
                label: "Categoría",
                options:
                    this.categoryOptions(
                        this.categories.debt
                    )
            })}

            ${this.commonFields()}

            ${this.footerButtons()}
        `;
    },

    formHeader(
        icon,
        title,
        description
    ) {
        return `
            <div
                style="
                    display:flex;
                    gap:13px;
                    align-items:flex-start;
                    margin-bottom:22px;
                "
            >

                <div
                    style="
                        width:46px;
                        height:46px;
                        display:grid;
                        place-items:center;
                        flex:0 0 auto;
                        border-radius:15px;
                        background:var(--color-surface-hover);
                        font-size:21px;
                    "
                >
                    ${icon}
                </div>

                <div>
                    <h2
                        style="
                            margin:0;
                            font-size:25px;
                        "
                    >
                        ${title}
                    </h2>

                    <p
                        style="
                            margin:6px 0 0;
                            color:var(--color-text-muted);
                            font-size:13px;
                            line-height:1.45;
                        "
                    >
                        ${description}
                    </p>
                </div>

            </div>
        `;
    },

    readValue(id) {
        const element =
            document.getElementById(id);

        return element
            ? element.value
            : "";
    },

    validateAmount() {
        const amount =
            this.number(
                this.readValue(
                    "movement-amount"
                )
            );

        if (amount <= 0) {
            AtlasUI.toast(
                "Introduce un importe válido."
            );

            return false;
        }

        return true;
    },

    createBaseMovement() {
        return {
            id: this.uid(),

            amount:
                this.number(
                    this.readValue(
                        "movement-amount"
                    )
                ),

            date:
                this.readValue(
                    "movement-date"
                ) || this.today(),

            createdAt:
                new Date().toISOString(),

            note:
                String(
                    this.readValue(
                        "movement-note"
                    ) || ""
                ).trim()
        };
    },

    saveMovement() {
        if (!this.validateAmount()) {
            return;
        }

        const movement =
            this.createBaseMovement();

        switch (this.selectedType) {

            case "income":
                this.applyIncome(
                    movement
                );
                break;

            case "expense":
                this.applyExpense(
                    movement
                );
                break;

            case "transfer":
                if (
                    !this.applyTransfer(
                        movement
                    )
                ) {
                    return;
                }
                break;

            case "investment":
                if (
                    !this.applyInvestment(
                        movement
                    )
                ) {
                    return;
                }
                break;

            case "debt_payment":
                if (
                    !this.applyDebtPayment(
                        movement
                    )
                ) {
                    return;
                }
                break;

        }

        this.data.movements.push(
            movement
        );

        AtlasStorage.save(
            this.data
        );

        this.close();

        if (
            typeof this.onSave ===
            "function"
        ) {
            this.onSave(
                this.data,
                movement
            );
        }
    },

    applyIncome(movement) {
        const accountId =
            this.readValue(
                "movement-account"
            );

        const account =
            this.account(accountId);

        movement.type =
            "income";

        movement.accountId =
            accountId;

        movement.category =
            this.readValue(
                "movement-category"
            );

        account.balance =
            this.number(account.balance) +
            movement.amount;
    },

    applyExpense(movement) {
        const accountId =
            this.readValue(
                "movement-account"
            );

        const account =
            this.account(accountId);

        movement.type =
            "expense";

        movement.kind =
            "standard";

        movement.accountId =
            accountId;

        movement.category =
            this.readValue(
                "movement-category"
            );

        if (
            account.group === "debt"
        ) {
            account.balance =
                Math.abs(
                    this.number(
                        account.balance
                    )
                ) +
                movement.amount;
        } else {
            account.balance =
                this.number(
                    account.balance
                ) -
                movement.amount;
        }
    },

    applyTransfer(movement) {
        const fromId =
            this.readValue(
                "movement-from-account"
            );

        const toId =
            this.readValue(
                "movement-to-account"
            );

        if (fromId === toId) {
            AtlasUI.toast(
                "Elige dos cuentas diferentes."
            );

            return false;
        }

        const from =
            this.account(fromId);

        const to =
            this.account(toId);

        movement.type =
            "transfer";

        movement.fromAccountId =
            fromId;

        movement.toAccountId =
            toId;

        from.balance =
            this.number(from.balance) -
            movement.amount;

        if (
            to.group === "debt"
        ) {
            to.balance =
                Math.max(
                    0,
                    Math.abs(
                        this.number(
                            to.balance
                        )
                    ) -
                    movement.amount
                );
        } else {
            to.balance =
                this.number(to.balance) +
                movement.amount;
        }

        return true;
    },

    applyInvestment(movement) {
        const fromId =
            this.readValue(
                "movement-from-account"
            );

        const toId =
            this.readValue(
                "movement-to-account"
            );

        const from =
            this.account(fromId);

        const to =
            this.account(toId);

        if (
            !from ||
            !to
        ) {
            AtlasUI.toast(
                "Selecciona las cuentas."
            );

            return false;
        }

        movement.type =
            "investment";

        movement.fromAccountId =
            fromId;

        movement.toAccountId =
            toId;

        from.balance =
            this.number(from.balance) -
            movement.amount;

        to.invested =
            this.number(to.invested) +
            movement.amount;

        to.balance =
            this.number(to.balance) +
            movement.amount;

        return true;
    },

    applyDebtPayment(movement) {
        const fromId =
            this.readValue(
                "movement-from-account"
            );

        const toId =
            this.readValue(
                "movement-to-account"
            );

        const from =
            this.account(fromId);

        const debt =
            this.account(toId);

        if (
            !from ||
            !debt
        ) {
            AtlasUI.toast(
                "Selecciona la cuenta y la deuda."
            );

            return false;
        }

        movement.type =
            "expense";

        movement.kind =
            "debt_payment";

        movement.fromAccountId =
            fromId;

        movement.toAccountId =
            toId;

        movement.category =
            this.readValue(
                "movement-category"
            );

        from.balance =
            this.number(from.balance) -
            movement.amount;

        debt.balance =
            Math.max(
                0,
                Math.abs(
                    this.number(
                        debt.balance
                    )
                ) -
                movement.amount
            );

        return true;
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
                        typeButton
                            .dataset
                            .movementType
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
                    actionButton
                        .dataset
                        .movementAction;

                if (
                    action ===
                    "close-background" &&
                    event.target !==
                    actionButton
                ) {
                    return;
                }

                switch (action) {

                    case "close":
                    case "close-background":
                        this.close();
                        break;

                    case "back":
                        this.renderTypeSelector();
                        break;

                    case "save":
                        this.saveMovement();
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
        AtlasMovements.init();
    }
);

/* ==========================================================
   ATLAS
   investment-withdrawals.js
   Venta o retirada de inversión
========================================================== */

(function () {

    if (
        typeof AtlasMovements ===
        "undefined"
    ) {

        return;

    }

    const originalRenderTypeSelector =
        AtlasMovements.renderTypeSelector
            .bind(AtlasMovements);

    const originalFormTitle =
        AtlasMovements.formTitle
            .bind(AtlasMovements);

    const originalFormFields =
        AtlasMovements.formFields
            .bind(AtlasMovements);

    const originalReadForm =
        AtlasMovements.readForm
            .bind(AtlasMovements);

    const originalValidateMovement =
        AtlasMovements.validateMovement
            .bind(AtlasMovements);

    const originalApplyMovement =
        AtlasMovements.applyMovement
            .bind(AtlasMovements);

    AtlasMovements.investmentWithdrawalKind =
        "investment_withdrawal";

    AtlasMovements.investmentAvailableForWithdrawal =
        function (
            movement,
            data = this.data
        ) {

            const account =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            if (
                !account ||
                account.group !==
                    "investment"
            ) {

                return 0;

            }

            let available =
                Math.max(
                    0,
                    this.number(
                        account.balance
                    )
                );

            if (this.editingId) {

                const previousMovement =
                    this.findMovement(
                        this.editingId,
                        data
                    );

                if (
                    previousMovement &&
                    this.getMovementKind(
                        previousMovement
                    ) ===
                        this
                            .investmentWithdrawalKind &&
                    previousMovement
                        .fromAccountId ===
                        movement.fromAccountId
                ) {

                    available +=
                        this.number(
                            previousMovement
                                .amount
                        );

                }

            }

            return available;

        };

    AtlasMovements.renderTypeSelector =
        function () {

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
                        this.investmentWithdrawalKind,
                        "📤",
                        "Venta o retirada de inversión",
                        "Mover dinero desde una inversión a una cuenta de liquidez."
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

        };

    AtlasMovements.formTitle =
        function (type) {

            if (
                type ===
                this.investmentWithdrawalKind
            ) {

                return "Registrar desinversión";

            }

            return originalFormTitle(
                type
            );

        };

    AtlasMovements.formFields =
        function (
            type,
            movement = null
        ) {

            if (
                type !==
                this.investmentWithdrawalKind
            ) {

                return originalFormFields(
                    type,
                    movement
                );

            }

            const amount =
                movement?.amount ||
                "";

            return `

                ${this.amountField(
                    amount
                )}

                <div class="movement-info">
                    El importe se restará de la inversión y se añadirá a la cuenta de liquidez. No contará como ingreso, gasto, ahorro ni nueva inversión.
                </div>

                <label class="movement-field">

                    <span>
                        Inversión de origen
                    </span>

                    <select
                        name="fromAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.investmentAccounts(
                                movement
                                    ?.fromAccountId
                            ),
                            movement
                                ?.fromAccountId
                        )}
                    </select>

                </label>

                <label class="movement-field">

                    <span>
                        Cuenta que recibe el dinero
                    </span>

                    <select
                        name="toAccountId"
                        required
                    >
                        ${this.accountOptions(
                            this.liquidityAccounts(
                                movement
                                    ?.toAccountId
                            ),
                            movement
                                ?.toAccountId
                        )}
                    </select>

                </label>

                ${this.commonFields(
                    movement
                )}

            `;

        };

    AtlasMovements.readForm =
        function (
            form,
            type
        ) {

            if (
                type !==
                this.investmentWithdrawalKind
            ) {

                return originalReadForm(
                    form,
                    type
                );

            }

            const values =
                new FormData(form);

            const oldMovement =
                this.editingId
                    ? this.findMovement(
                        this.editingId
                    )
                    : null;

            return {

                id:
                    this.editingId ||
                    this.generateId(),

                type:
                    this
                        .investmentWithdrawalKind,

                kind:
                    this
                        .investmentWithdrawalKind,

                amount:
                    Number(
                        values.get(
                            "amount"
                        )
                    ),

                fromAccountId:
                    String(
                        values.get(
                            "fromAccountId"
                        ) || ""
                    ),

                toAccountId:
                    String(
                        values.get(
                            "toAccountId"
                        ) || ""
                    ),

                category:
                    "Venta o retirada de inversión",

                categoryId:
                    null,

                subcategoryId:
                    null,

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
                    null,

                recurringOccurrenceId:
                    null,

                createdAt:
                    oldMovement
                        ?.createdAt ||
                    this.now(),

                updatedAt:
                    this.now()

            };

        };

    AtlasMovements.validateMovement =
        function (
            movement,
            data = this.data
        ) {

            const kind =
                this.getMovementKind(
                    movement
                );

            if (
                kind !==
                this.investmentWithdrawalKind
            ) {

                return originalValidateMovement(
                    movement,
                    data
                );

            }

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
                !movement.fromAccountId ||
                !movement.toAccountId
            ) {

                return "Selecciona la inversión de origen y la cuenta de destino.";

            }

            if (
                movement.fromAccountId ===
                movement.toAccountId
            ) {

                return "La cuenta de origen y destino deben ser diferentes.";

            }

            const investmentAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const liquidityAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            if (
                !investmentAccount ||
                !liquidityAccount
            ) {

                return "Una de las cuentas seleccionadas no existe.";

            }

            if (
                investmentAccount.group !==
                "investment"
            ) {

                return "Selecciona una cuenta de inversión válida.";

            }

            if (
                liquidityAccount.group !==
                "liquidity"
            ) {

                return "El dinero debe recibirse en una cuenta de liquidez.";

            }

            const available =
                this.investmentAvailableForWithdrawal(
                    movement,
                    data
                );

            if (
                available <= 0
            ) {

                return "Esta cuenta de inversión no tiene saldo disponible.";

            }

            if (
                movement.amount >
                available + 0.001
            ) {

                return (
                    "La retirada no puede superar " +
                    `el valor disponible de ${
                        this.formatCurrency(
                            available
                        )
                    }.`
                );

            }

            return null;

        };

    AtlasMovements.applyMovement =
        function (
            data,
            movement,
            direction = 1
        ) {

            const kind =
                this.getMovementKind(
                    movement
                );

            if (
                kind !==
                this.investmentWithdrawalKind
            ) {

                originalApplyMovement(
                    data,
                    movement,
                    direction
                );

                return;

            }

            const amount =
                this.number(
                    movement.amount
                ) *
                direction;

            const investmentAccount =
                this.findAccount(
                    movement.fromAccountId,
                    data
                );

            const liquidityAccount =
                this.findAccount(
                    movement.toAccountId,
                    data
                );

            this.changeBalance(
                investmentAccount,
                -amount
            );

            this.changeBalance(
                liquidityAccount,
                amount
            );

        };

})();

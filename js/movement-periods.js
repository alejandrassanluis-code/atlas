/* ==========================================================
   ATLAS
   movement-periods.js
   Atlas v1.0 — Fecha real y mes imputado
========================================================== */

const AtlasMovementPeriods = {

    initialized:
        false,

    eventsBound:
        false,

    pendingExpensePeriodSync:
        null,

    validMonth(value) {

        return /^\d{4}-\d{2}$/.test(
            String(value || "")
        );

    },

    monthFromDate(date) {

        const value =
            String(
                date || ""
            ).slice(
                0,
                7
            );

        return this.validMonth(
            value
        )
            ? value
            : "";

    },

    currentMonth() {

        return this.monthFromDate(
            AtlasMovements.today()
        );

    },

    movementPeriod(movement) {

        const candidates = [

            movement?.periodMonth,

            movement?.economicMonth,

            movement?.imputedMonth,

            this.monthFromDate(
                movement?.date
            ),

            this.currentMonth()

        ];

        return (
            candidates.find(
                value =>
                    this.validMonth(
                        value
                    )
            ) ||
            this.currentMonth()
        );

    },

    occurrencePeriod(occurrence) {

        const candidates = [

            occurrence
                ?.confirmedPeriodMonth,

            occurrence?.periodMonth,

            occurrence?.economicMonth,

            occurrence?.imputedMonth,

            occurrence?.monthKey,

            occurrence?.periodKey,

            this.monthFromDate(
                occurrence?.expectedDate
            ),

            this.currentMonth()

        ];

        return (
            candidates.find(
                value =>
                    this.validMonth(
                        value
                    )
            ) ||
            this.currentMonth()
        );

    },

    formatMonth(monthKey) {

        if (
            typeof AtlasUI !==
                "undefined" &&
            typeof AtlasUI
                .formatMonthKey ===
                "function"
        ) {

            return AtlasUI
                .formatMonthKey(
                    monthKey
                );

        }

        return String(
            monthKey || ""
        );

    },

    followsDate(movement) {

        const realMonth =
            this.monthFromDate(
                movement?.date
            );

        const periodMonth =
            this.movementPeriod(
                movement
            );

        return (
            !movement ||
            !movement.id ||
            !realMonth ||
            periodMonth ===
                realMonth
        );

    },

    periodField(movement) {

        const date =
            movement?.date ||
            AtlasMovements.today();

        const realMonth =
            this.monthFromDate(
                date
            );

        const periodMonth =
            this.movementPeriod({

                ...movement,

                date

            });

        const followsDate =
            this.followsDate({

                ...movement,

                date,

                periodMonth

            });

        return `

            <label class="movement-field">

                <span>
                    Mes al que corresponde
                </span>

                <input
                    name="periodMonth"
                    type="month"
                    value="${AtlasMovements.escape(
                        periodMonth
                    )}"
                    required
                    data-movement-period
                    data-follow-date="${
                        followsDate
                            ? "true"
                            : "false"
                    }"
                    data-real-month="${AtlasMovements.escape(
                        realMonth
                    )}"
                >

                <small class="movement-field-hint">

                    Se usa para ingresos, gastos,
                    presupuestos, análisis y objetivos.
                    La fecha real seguirá modificando los
                    saldos de las cuentas.

                </small>

            </label>

        `;

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-movement-period-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-movement-period-styles";

        style.textContent = `

            .movement-period-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 8px;
                padding: 11px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 15px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .movement-period-summary > div {
                min-width: 0;
                padding: 9px;
                border-radius: 12px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .movement-period-summary small,
            .movement-period-summary strong {
                display: block;
            }

            .movement-period-summary small {
                color: #98a2bb;
                font-size: 9px;
            }

            .movement-period-summary strong {
                margin-top: 4px;
                overflow-wrap: anywhere;
                color: #f7f8fc;
                font-size: 11px;
            }

            .movement-period-summary[
                data-different="true"
            ] {
                border-color:
                    rgba(
                        77,
                        163,
                        255,
                        0.28
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.055
                    );
            }

            .movement-period-summary[
                data-different="true"
            ]
            [data-movement-economic-month] {
                color:
                    var(
                        --color-primary
                    );
            }

        `;

        document.head.appendChild(
            style
        );

    },

    updatePeriodSummary(form) {

        if (!form) {

            return;

        }

        const dateInput =
            form.elements?.date;

        const periodInput =
            form.elements
                ?.periodMonth;

        const summary =
            form.querySelector(
                "[data-movement-period-summary]"
            );

        if (
            !dateInput ||
            !periodInput ||
            !summary
        ) {

            return;

        }

        const realMonth =
            this.monthFromDate(
                dateInput.value
            );

        const periodMonth =
            this.validMonth(
                periodInput.value
            )
                ? String(
                    periodInput.value
                )
                : "";

        const realElement =
            summary.querySelector(
                "[data-movement-real-month]"
            );

        const periodElement =
            summary.querySelector(
                "[data-movement-economic-month]"
            );

        if (realElement) {

            realElement.textContent =
                realMonth
                    ? this.formatMonth(
                        realMonth
                    )
                    : "Sin fecha";

        }

        if (periodElement) {

            periodElement.textContent =
                periodMonth
                    ? this.formatMonth(
                        periodMonth
                    )
                    : "Sin periodo";

        }

        summary.dataset.different =
            realMonth &&
            periodMonth &&
            realMonth !==
                periodMonth
                ? "true"
                : "false";

        periodInput.dataset.realMonth =
            realMonth;

    },

    periodSummary(movement) {

        const date =
            movement?.date ||
            AtlasMovements.today();

        const realMonth =
            this.monthFromDate(
                date
            );

        const periodMonth =
            this.movementPeriod({

                ...movement,

                date

            });

        return `

            <div
                class="movement-period-summary"
                data-movement-period-summary
                data-different="${
                    realMonth !==
                        periodMonth
                        ? "true"
                        : "false"
                }"
            >

                <div>

                    <small>
                        Movimiento real
                    </small>

                    <strong
                        data-movement-real-month
                    >
                        ${AtlasMovements.escape(
                            this.formatMonth(
                                realMonth
                            )
                        )}
                    </strong>

                </div>

                <div>

                    <small>
                        Resultado económico
                    </small>

                    <strong
                        data-movement-economic-month
                    >
                        ${AtlasMovements.escape(
                            this.formatMonth(
                                periodMonth
                            )
                        )}
                    </strong>

                </div>

            </div>

        `;

    },

    installCommonFields() {

        const originalCommonFields =
            AtlasMovements
                .commonFields
                .bind(
                    AtlasMovements
                );

        AtlasMovements.commonFields =
            movement => {

                const original =
                    originalCommonFields(
                        movement
                    );

                const noteMarker = `

            <label class="movement-field">

                <span>
                    Nota opcional
                </span>`;

                const periodContent = `

            ${this.periodField(
                movement
            )}

            ${this.periodSummary(
                movement
            )}

            <label class="movement-field">

                <span>
                    Nota opcional
                </span>`;

                if (
                    original.includes(
                        noteMarker
                    )
                ) {

                    return original.replace(
                        noteMarker,
                        periodContent
                    );

                }

                return `

                    ${original}

                    ${this.periodField(
                        movement
                    )}

                    ${this.periodSummary(
                        movement
                    )}

                `;

            };

    },

    installReadForm() {

        const originalReadForm =
            AtlasMovements
                .readForm
                .bind(
                    AtlasMovements
                );

        AtlasMovements.readForm =
            (
                form,
                type
            ) => {

                const movement =
                    originalReadForm(
                        form,
                        type
                    );

                const values =
                    new FormData(
                        form
                    );

                const selectedPeriod =
                    String(
                        values.get(
                            "periodMonth"
                        ) ||
                        ""
                    );

                const periodMonth =
                    this.validMonth(
                        selectedPeriod
                    )
                        ? selectedPeriod
                        : this.monthFromDate(
                            movement.date
                        );

                movement.periodMonth =
                    periodMonth;

                movement.economicMonth =
                    periodMonth;

                movement.imputedMonth =
                    periodMonth;

                return movement;

            };

    },

    installValidation() {

        const originalValidateMovement =
            AtlasMovements
                .validateMovement
                .bind(
                    AtlasMovements
                );

        AtlasMovements.validateMovement =
            (
                movement,
                data =
                    AtlasMovements.data
            ) => {

                const originalError =
                    originalValidateMovement(
                        movement,
                        data
                    );

                if (originalError) {

                    return originalError;

                }

                const periodMonth =
                    this.movementPeriod(
                        movement
                    );

                if (
                    !this.validMonth(
                        periodMonth
                    )
                ) {

                    return "Selecciona el mes al que corresponde el movimiento.";

                }

                return null;

            };

    },

    installRecurringMovement() {

        const originalMovementFromOccurrence =
            AtlasMovements
                .movementFromOccurrence
                .bind(
                    AtlasMovements
                );

        AtlasMovements
            .movementFromOccurrence =
            occurrence => {

                const movement =
                    originalMovementFromOccurrence(
                        occurrence
                    );

                const periodMonth =
                    this.occurrencePeriod(
                        occurrence
                    );

                movement.periodMonth =
                    periodMonth;

                movement.economicMonth =
                    periodMonth;

                movement.imputedMonth =
                    periodMonth;

                return movement;

            };

    },

    installLinkedExpense() {

        const originalApplyLinkedExpense =
            AtlasMovements
                .applyLinkedExpenseToForm
                .bind(
                    AtlasMovements
                );

        AtlasMovements
            .applyLinkedExpenseToForm =
            linkedExpenseSelect => {

                originalApplyLinkedExpense(
                    linkedExpenseSelect
                );

                const form =
                    linkedExpenseSelect
                        .closest(
                            "[data-movement-form]"
                        );

                if (!form) {

                    return;

                }

                const expense =
                    AtlasMovements
                        .findMovement(
                            linkedExpenseSelect
                                .value
                        );

                const periodInput =
                    form.elements
                        ?.periodMonth;

                if (
                    expense &&
                    periodInput
                ) {

                    const periodMonth =
                        this.movementPeriod(
                            expense
                        );

                    periodInput.value =
                        periodMonth;

                    periodInput.dataset
                        .followDate =
                        "false";

                }

                this.updatePeriodSummary(
                    form
                );

            };

    },

    syncLinkedReimbursements(
        data,
        expenseMovement
    ) {

        if (
            !data ||
            !expenseMovement ||
            AtlasMovements
                .getMovementKind(
                    expenseMovement
                ) !==
                "expense"
        ) {

            return;

        }

        const periodMonth =
            this.movementPeriod(
                expenseMovement
            );

        const movements =
            Array.isArray(
                data.movements
            )
                ? data.movements
                : [];

        movements.forEach(
            movement => {

                const kind =
                    AtlasMovements
                        .getMovementKind(
                            movement
                        );

                if (
                    kind !==
                        "reimbursement" ||
                    movement
                        .linkedMovementId !==
                        expenseMovement.id
                ) {

                    return;

                }

                movement.periodMonth =
                    periodMonth;

                movement.economicMonth =
                    periodMonth;

                movement.imputedMonth =
                    periodMonth;

                movement.updatedAt =
                    AtlasMovements.now();

            }
        );

    },

    installLinkedReimbursementSync() {

        const originalApplyMovement =
            AtlasMovements
                .applyMovement
                .bind(
                    AtlasMovements
                );

        AtlasMovements.applyMovement =
            (
                data,
                movement,
                direction = 1
            ) => {

                const kind =
                    AtlasMovements
                        .getMovementKind(
                            movement
                        );

                if (
                    direction === -1 &&
                    AtlasMovements.editingId &&
                    movement?.id ===
                        AtlasMovements
                            .editingId &&
                    kind ===
                        "expense"
                ) {

                    this
                        .pendingExpensePeriodSync = {

                            movementId:
                                movement.id

                        };

                }

                originalApplyMovement(
                    data,
                    movement,
                    direction
                );

                if (
                    direction === 1 &&
                    kind ===
                        "expense" &&
                    this
                        .pendingExpensePeriodSync
                        ?.movementId ===
                        movement?.id
                ) {

                    this.syncLinkedReimbursements(
                        data,
                        movement
                    );

                    this
                        .pendingExpensePeriodSync =
                        null;

                }

            };

        const originalClose =
            AtlasMovements
                .close
                .bind(
                    AtlasMovements
                );

        AtlasMovements.close =
            () => {

                this
                    .pendingExpensePeriodSync =
                    null;

                originalClose();

            };

    },

    installOccurrenceSync() {

        const originalMarkConfirmed =
            AtlasMovements
                .markOccurrenceConfirmed
                .bind(
                    AtlasMovements
                );

        AtlasMovements
            .markOccurrenceConfirmed =
            (
                data,
                occurrenceId,
                movement
            ) => {

                originalMarkConfirmed(
                    data,
                    occurrenceId,
                    movement
                );

                const occurrence =
                    AtlasMovements
                        .findRecurringOccurrence(
                            occurrenceId,
                            data
                        );

                if (!occurrence) {

                    return;

                }

                const periodMonth =
                    this.movementPeriod(
                        movement
                    );

                occurrence
                    .confirmedPeriodMonth =
                    periodMonth;

                occurrence.periodMonth =
                    periodMonth;

                occurrence.economicMonth =
                    periodMonth;

                occurrence.imputedMonth =
                    periodMonth;

                occurrence.updatedAt =
                    AtlasMovements.now();

            };

        const originalSyncConfirmed =
            AtlasMovements
                .syncConfirmedOccurrence
                .bind(
                    AtlasMovements
                );

        AtlasMovements
            .syncConfirmedOccurrence =
            (
                data,
                movement
            ) => {

                originalSyncConfirmed(
                    data,
                    movement
                );

                const occurrence =
                    AtlasMovements
                        .findRecurringOccurrence(
                            movement
                                ?.recurringOccurrenceId,
                            data
                        );

                if (!occurrence) {

                    return;

                }

                const periodMonth =
                    this.movementPeriod(
                        movement
                    );

                occurrence
                    .confirmedPeriodMonth =
                    periodMonth;

                occurrence.periodMonth =
                    periodMonth;

                occurrence.economicMonth =
                    periodMonth;

                occurrence.imputedMonth =
                    periodMonth;

                occurrence.updatedAt =
                    AtlasMovements.now();

            };

        const originalRestoreOccurrence =
            AtlasMovements
                .restoreOccurrenceFromMovement
                .bind(
                    AtlasMovements
                );

        AtlasMovements
            .restoreOccurrenceFromMovement =
            (
                data,
                movement
            ) => {

                originalRestoreOccurrence(
                    data,
                    movement
                );

                const occurrence =
                    AtlasMovements
                        .findRecurringOccurrence(
                            movement
                                ?.recurringOccurrenceId,
                            data
                        );

                if (!occurrence) {

                    return;

                }

                occurrence
                    .confirmedPeriodMonth =
                    null;

                occurrence.updatedAt =
                    AtlasMovements.now();

            };

    },

    handleDateChange(dateInput) {

        const form =
            dateInput.closest(
                "[data-movement-form]"
            );

        if (!form) {

            return;

        }

        const periodInput =
            form.elements
                ?.periodMonth;

        if (!periodInput) {

            return;

        }

        const previousRealMonth =
            String(
                periodInput.dataset
                    .realMonth ||
                ""
            );

        const newRealMonth =
            this.monthFromDate(
                dateInput.value
            );

        const followsDate =
            periodInput.dataset
                .followDate !==
                "false";

        const periodWasRealMonth =
            !periodInput.value ||
            periodInput.value ===
                previousRealMonth;

        if (
            followsDate ||
            periodWasRealMonth
        ) {

            periodInput.value =
                newRealMonth;

            periodInput.dataset
                .followDate =
                "true";

        }

        periodInput.dataset
            .realMonth =
            newRealMonth;

        this.updatePeriodSummary(
            form
        );

    },

    handlePeriodChange(periodInput) {

        const form =
            periodInput.closest(
                "[data-movement-form]"
            );

        if (!form) {

            return;

        }

        periodInput.dataset
            .followDate =
            "false";

        this.updatePeriodSummary(
            form
        );

    },

    bindEvents() {

        if (
            this.eventsBound
        ) {

            return;

        }

        this.eventsBound =
            true;

        document.addEventListener(
            "change",
            event => {

                const dateInput =
                    event.target.closest(
                        '[name="date"]'
                    );

                if (dateInput) {

                    this.handleDateChange(
                        dateInput
                    );

                    return;

                }

                const periodInput =
                    event.target.closest(
                        "[data-movement-period]"
                    );

                if (periodInput) {

                    this.handlePeriodChange(
                        periodInput
                    );

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const periodInput =
                    event.target.closest(
                        "[data-movement-period]"
                    );

                if (!periodInput) {

                    return;

                }

                this.handlePeriodChange(
                    periodInput
                );

            }
        );

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasMovements ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        this.installStyles();
        this.installCommonFields();
        this.installReadForm();
        this.installValidation();
        this.installRecurringMovement();
        this.installLinkedExpense();
        this.installLinkedReimbursementSync();
        this.installOccurrenceSync();
        this.bindEvents();

    }

};

AtlasMovementPeriods.install();

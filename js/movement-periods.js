/* ==========================================================
   ATLAS
   movement-periods.js
   Atlas v1.0 — Fecha real y mes imputado
========================================================== */

const AtlasMovementPeriods = {

    initialized: false,

    monthFromDate(date) {

        const value =
            String(date || "")
                .slice(0, 7);

        return /^\d{4}-\d{2}$/.test(value)
            ? value
            : "";

    },

    currentMonth() {

        return this.monthFromDate(
            AtlasMovements.today()
        );

    },

    movementPeriod(movement) {

        return (
            movement?.periodMonth ||
            movement?.economicMonth ||
            movement?.imputedMonth ||
            this.monthFromDate(
                movement?.date
            ) ||
            this.currentMonth()
        );

    },

    occurrencePeriod(occurrence) {

        const candidates = [

            occurrence?.periodMonth,
            occurrence?.economicMonth,
            occurrence?.imputedMonth,
            occurrence?.monthKey,
            occurrence?.periodKey,
            this.monthFromDate(
                occurrence?.expectedDate
            )

        ];

        return (
            candidates.find(
                value =>
                    /^\d{4}-\d{2}$/.test(
                        String(value || "")
                    )
            ) ||
            this.currentMonth()
        );

    },

    formatMonth(monthKey) {

        if (
            typeof AtlasUI
                ?.formatMonthKey ===
            "function"
        ) {

            return AtlasUI.formatMonthKey(
                monthKey
            );

        }

        return String(monthKey || "");

    },

    periodField(movement) {

        const date =
            movement?.date ||
            AtlasMovements.today();

        const periodMonth =
            this.movementPeriod({

                ...movement,

                date

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
                color: #f7f8fc;
                font-size: 11px;
                overflow-wrap: anywhere;
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
            String(
                periodInput.value || ""
            );

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
            realMonth !== periodMonth
                ? "true"
                : "false";

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
                    realMonth !== periodMonth
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
            AtlasMovements.commonFields
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
            AtlasMovements.readForm
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
                    new FormData(form);

                const periodMonth =
                    String(
                        values.get(
                            "periodMonth"
                        ) ||
                        ""
                    );

                movement.periodMonth =
                    periodMonth ||
                    this.monthFromDate(
                        movement.date
                    );

                movement.economicMonth =
                    movement.periodMonth;

                movement.imputedMonth =
                    movement.periodMonth;

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
                data = AtlasMovements.data
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
                    !/^\d{4}-\d{2}$/.test(
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
                    AtlasMovements.findMovement(
                        linkedExpenseSelect.value
                    );

                const periodInput =
                    form.elements
                        ?.periodMonth;

                if (
                    expense &&
                    periodInput
                ) {

                    periodInput.value =
                        this.movementPeriod(
                            expense
                        );

                }

                this.updatePeriodSummary(
                    form
                );

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

                occurrence.confirmedPeriodMonth =
                    this.movementPeriod(
                        movement
                    );

                occurrence.periodMonth =
                    occurrence.periodMonth ||
                    occurrence
                        .confirmedPeriodMonth;

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

                occurrence.confirmedPeriodMonth =
                    this.movementPeriod(
                        movement
                    );

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

                occurrence.confirmedPeriodMonth =
                    null;

                occurrence.updatedAt =
                    AtlasMovements.now();

            };

    },

    installExistingMovementNormalization() {

        const movements =
            Array.isArray(
                AtlasMovements.data
                    ?.movements
            )
                ? AtlasMovements.data
                    .movements
                : [];

        movements.forEach(
            movement => {

                const periodMonth =
                    this.movementPeriod(
                        movement
                    );

                movement.periodMonth =
                    periodMonth;

                movement.economicMonth =
                    periodMonth;

                movement.imputedMonth =
                    periodMonth;

            }
        );

    },

    bindEvents() {

        document.addEventListener(
            "change",
            event => {

                const dateInput =
                    event.target.closest(
                        '[name="date"]'
                    );

                if (dateInput) {

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

                    if (
                        periodInput &&
                        (
                            !periodInput.value ||
                            periodInput.dataset
                                .manuallyChanged !==
                                "true"
                        )
                    ) {

                        periodInput.value =
                            this.monthFromDate(
                                dateInput.value
                            );

                    }

                    this.updatePeriodSummary(
                        form
                    );

                    return;

                }

                const periodInput =
                    event.target.closest(
                        "[data-movement-period]"
                    );

                if (periodInput) {

                    periodInput.dataset
                        .manuallyChanged =
                        "true";

                    this.updatePeriodSummary(
                        periodInput.closest(
                            "[data-movement-form]"
                        )
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

                periodInput.dataset
                    .manuallyChanged =
                    "true";

                this.updatePeriodSummary(
                    periodInput.closest(
                        "[data-movement-form]"
                    )
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
        this.installOccurrenceSync();
        this.bindEvents();

    }

};

AtlasMovementPeriods.install();

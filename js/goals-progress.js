/* ==========================================================
   ATLAS
   goals-progress.js
   Progreso automático de objetivos
========================================================== */

const AtlasGoalsProgress = {

    initialized:
        false,

    originalNormalizeGoal:
        null,

    originalOpenForm:
        null,

    originalSaveForm:
        null,

    originalGoalCard:
        null,

    originalProgress:
        null,

    originalRemaining:
        null,

    originalSummary:
        null,

    number(value) {

        const result =
            Number(
                String(
                    value ?? ""
                )
                    .trim()
                    .replace(
                        ",",
                        "."
                    )
            );

        return Number.isFinite(
            result
        )
            ? result
            : 0;

    },

    round(value) {

        return Math.round(
            this.number(
                value
            ) * 100
        ) / 100;

    },

    accounts(
        data = AtlasGoals.data
    ) {

        return Array.isArray(
            data?.accounts
        )
            ? data.accounts
            : [];

    },

    movements(
        data = AtlasGoals.data
    ) {

        return Array.isArray(
            data?.movements
        )
            ? data.movements
            : [];

    },

    activeAccounts(
        data = AtlasGoals.data
    ) {

        return this.accounts(
            data
        )
            .filter(
                account =>
                    account.active !==
                    false
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const orderDifference =
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        );

                    if (
                        orderDifference !==
                        0
                    ) {

                        return orderDifference;

                    }

                    return String(
                        first.name ||
                        ""
                    ).localeCompare(
                        String(
                            second.name ||
                            ""
                        ),
                        "es"
                    );

                }
            );

    },

    accountById(
        accountId,
        data = AtlasGoals.data
    ) {

        return this.accounts(
            data
        )
            .find(
                account =>
                    account.id ===
                    accountId
            ) || null;

    },

    accountName(
        accountId,
        data = AtlasGoals.data
    ) {

        return (
            this.accountById(
                accountId,
                data
            )?.name ||
            "Cuenta no disponible"
        );

    },

    accountRole(account) {

        if (
            account?.group ===
            "debt"
        ) {

            return "debt";

        }

        if (
            account?.group ===
            "investment"
        ) {

            return "investment";

        }

        return "account";

    },

    accountsForMode(
        mode,
        data = AtlasGoals.data
    ) {

        if (
            mode ===
            "manual"
        ) {

            return [];

        }

        return this.activeAccounts(
            data
        )
            .filter(
                account =>
                    this.accountRole(
                        account
                    ) ===
                    mode
            );

    },

    accountTypeLabel(account) {

        const labels = {

            account:
                "Saldo",

            investment:
                "Inversión",

            debt:
                "Deuda"

        };

        return (
            labels[
                this.accountRole(
                    account
                )
            ] ||
            "Cuenta"
        );

    },

    firstNumber(
        source,
        keys,
        fallback = 0
    ) {

        for (
            const key of keys
        ) {

            const value =
                source?.[key];

            if (
                value !==
                    null &&
                value !==
                    undefined &&
                value !==
                    "" &&
                Number.isFinite(
                    Number(
                        value
                    )
                )
            ) {

                return Number(
                    value
                );

            }

        }

        return this.number(
            fallback
        );

    },

    accountValue(account) {

        if (!account) {

            return 0;

        }

        if (
            account.group ===
            "investment"
        ) {

            return Math.max(
                0,
                this.firstNumber(
                    account,
                    [
                        "balance",
                        "currentValue",
                        "investmentValue",
                        "marketValue",
                        "value",
                        "invested"
                    ],
                    0
                )
            );

        }

        return Math.max(
            0,
            this.firstNumber(
                account,
                [
                    "balance",
                    "currentBalance",
                    "value",
                    "amount",
                    "initialBalance"
                ],
                0
            )
        );

    },

    movementKind(movement) {

        if (
            typeof AtlasCalculations !==
                "undefined" &&
            typeof AtlasCalculations
                .movementKind ===
                "function"
        ) {

            return AtlasCalculations
                .movementKind(
                    movement
                );

        }

        return (
            movement?.kind ||
            movement?.type ||
            ""
        );

    },

    movementDebtAccountId(movement) {

        return (
            movement?.debtAccountId ||
            movement?.toAccountId ||
            movement?.accountId ||
            ""
        );

    },

    linkedAccountId(goal) {

        return (
            goal?.progressAccountId ||
            goal?.debtAccountId ||
            goal?.accountId ||
            ""
        );

    },

    debtPaymentsForGoal(
        goal,
        data = AtlasGoals.data
    ) {

        const accountId =
            this.linkedAccountId(
                goal
            );

        if (!accountId) {

            return [];

        }

        const startDate =
            String(
                goal?.startDate ||
                ""
            );

        return this.movements(
            data
        )
            .filter(
                movement =>
                    this.movementKind(
                        movement
                    ) ===
                    "debt_payment"
            )
            .filter(
                movement =>
                    this.movementDebtAccountId(
                        movement
                    ) ===
                    accountId
            )
            .filter(
                movement => {

                    const date =
                        String(
                            movement?.date ||
                            ""
                        );

                    return (
                        !startDate ||
                        date >=
                            startDate
                    );

                }
            );

    },

    debtPaymentsTotal(
        goal,
        data = AtlasGoals.data
    ) {

        return this.round(
            this.debtPaymentsForGoal(
                goal,
                data
            )
                .reduce(
                    (
                        total,
                        movement
                    ) =>
                        total +
                        Math.max(
                            0,
                            this.number(
                                movement.amount
                            )
                        ),
                    0
                )
        );

    },

    allowedModesForType(type) {

        const modes = {

            saving: [
                "manual",
                "account"
            ],

            purchase: [
                "manual",
                "account"
            ],

            emergency: [
                "manual",
                "account"
            ],

            investment: [
                "investment"
            ],

            debt: [
                "debt"
            ]

        };

        return (
            modes[type] ||
            modes.saving
        );

    },

    defaultModeForType(type) {

        if (
            type ===
            "investment"
        ) {

            return "investment";

        }

        if (
            type ===
            "debt"
        ) {

            return "debt";

        }

        return "manual";

    },

    validModeForType(
        type,
        mode
    ) {

        return this.allowedModesForType(
            type
        )
            .includes(
                mode
            );

    },

    progressMode(goal) {

        const type =
            goal?.type ||
            "saving";

        const requested =
            String(
                goal?.progressMode ||
                this.defaultModeForType(
                    type
                )
            );

        return this.validModeForType(
            type,
            requested
        )
            ? requested
            : this.defaultModeForType(
                type
            );

    },

    calculatedCurrent(
        goal,
        data = AtlasGoals.data
    ) {

        const mode =
            this.progressMode(
                goal
            );

        if (
            mode ===
            "manual"
        ) {

            return Math.max(
                0,
                this.round(
                    goal?.currentAmount
                )
            );

        }

        const account =
            this.accountById(
                this.linkedAccountId(
                    goal
                ),
                data
            );

        if (!account) {

            return 0;

        }

        if (
            mode ===
                "account" ||
            mode ===
                "investment"
        ) {

            return this.round(
                this.accountValue(
                    account
                )
            );

        }

        if (
            mode ===
            "debt"
        ) {

            return this.round(
                Math.min(
                    Math.max(
                        0,
                        this.number(
                            goal?.targetAmount
                        )
                    ),
                    this.debtPaymentsTotal(
                        goal,
                        data
                    )
                )
            );

        }

        return 0;

    },

    effectiveGoal(
        goal,
        data = AtlasGoals.data
    ) {

        return {

            ...goal,

            currentAmount:
                this.calculatedCurrent(
                    goal,
                    data
                )

        };

    },

    sourceLabel(goal) {

        const mode =
            this.progressMode(
                goal
            );

        if (
            mode ===
            "manual"
        ) {

            return "Progreso mediante aportaciones";

        }

        const accountName =
            this.accountName(
                this.linkedAccountId(
                    goal
                )
            );

        if (
            mode ===
            "debt"
        ) {

            return (
                `Automático · pagos a ` +
                `${accountName}`
            );

        }

        if (
            mode ===
            "investment"
        ) {

            return (
                `Automático · valor de ` +
                `${accountName}`
            );

        }

        return (
            `Automático · saldo de ` +
            `${accountName}`
        );

    },

    statusInformation(status) {

        const statuses = {

            active: {
                label:
                    "Activo",

                className:
                    "active"
            },

            paused: {
                label:
                    "Pausado",

                className:
                    "paused"
            },

            completed: {
                label:
                    "Completado",

                className:
                    "completed"
            },

            archived: {
                label:
                    "Archivado",

                className:
                    "archived"
            },

            cancelled: {
                label:
                    "Cancelado",

                className:
                    "cancelled"
            }

        };

        return (
            statuses[status] ||
            statuses.active
        );

    },

    priorityInformation(priority) {

        const priorities = {

            high: {
                label:
                    "Prioridad alta",

                className:
                    "high"
            },

            medium: {
                label:
                    "Prioridad media",

                className:
                    "medium"
            },

            low: {
                label:
                    "Prioridad baja",

                className:
                    "low"
            }

        };

        return (
            priorities[priority] ||
            priorities.medium
        );

    },

    badges(goal) {

        const status =
            this.statusInformation(
                goal.status
            );

        const priority =
            this.priorityInformation(
                goal.priority
            );

        return `

            <div
                class="atlas-goal-badges"
            >

                <span
                    class="
                        atlas-goal-badge
                        atlas-goal-status-${status.className}
                    "
                >
                    ${AtlasGoals.escape(
                        status.label
                    )}
                </span>

                <span
                    class="
                        atlas-goal-badge
                        atlas-goal-priority-${priority.className}
                    "
                >
                    ${AtlasGoals.escape(
                        priority.label
                    )}
                </span>

            </div>

        `;

    },

    modeLabel(mode) {

        const labels = {

            manual:
                "Mediante aportaciones",

            account:
                "Saldo de una cuenta",

            investment:
                "Valor de una inversión",

            debt:
                "Pagos realizados a una deuda"

        };

        return (
            labels[mode] ||
            labels.manual
        );

    },

    modeOptions(
        goalType,
        selected
    ) {

        const modes =
            this.allowedModesForType(
                goalType
            );

        const validSelected =
            modes.includes(
                selected
            )
                ? selected
                : this.defaultModeForType(
                    goalType
                );

        return modes
            .map(
                mode => `

                    <option
                        value="${mode}"
                        ${
                            mode ===
                            validSelected
                                ? "selected"
                                : ""
                        }
                    >
                        ${this.modeLabel(
                            mode
                        )}
                    </option>

                `
            )
            .join("");

    },

    fieldLabel(mode) {

        const labels = {

            account:
                "Cuenta de saldo vinculada",

            investment:
                "Inversión vinculada",

            debt:
                "Cuenta de deuda vinculada"

        };

        return (
            labels[mode] ||
            "Cuenta vinculada"
        );

    },

    emptyAccountLabel(mode) {

        const labels = {

            account:
                "Selecciona una cuenta de saldo",

            investment:
                "Selecciona una inversión",

            debt:
                "Selecciona una deuda"

        };

        return (
            labels[mode] ||
            "Selecciona una cuenta"
        );

    },

    accountOptions(
        mode,
        selectedId
    ) {

        const accounts =
            this.accountsForMode(
                mode
            );

        if (
            accounts.length ===
            0
        ) {

            return `

                <option value="">
                    No hay cuentas compatibles
                </option>

            `;

        }

        return `

            <option value="">
                ${this.emptyAccountLabel(
                    mode
                )}
            </option>

            ${accounts
                .map(
                    account => `

                        <option
                            value="${AtlasGoals.escape(
                                account.id
                            )}"
                            ${
                                account.id ===
                                selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${AtlasGoals.escape(
                                account.name ||
                                "Cuenta"
                            )}
                            ·
                            ${AtlasGoals.escape(
                                this.accountTypeLabel(
                                    account
                                )
                            )}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    automaticFields(goal) {

        const type =
            goal.type ||
            "saving";

        const mode =
            this.progressMode(
                goal
            );

        const linkedId =
            this.linkedAccountId(
                goal
            );

        const compatible =
            this.accountsForMode(
                mode
            )
                .some(
                    account =>
                        account.id ===
                        linkedId
                );

        const selectedId =
            compatible
                ? linkedId
                : "";

        const current =
            this.calculatedCurrent({

                ...goal,

                progressAccountId:
                    selectedId

            });

        const fixedAutomatic =
            [
                "investment",
                "debt"
            ].includes(
                type
            );

        return `

            <section
                class="atlas-goal-progress-settings"
                data-goal-progress-section
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Cálculo del progreso
                    </span>

                    <select
                        name="goalProgressMode"
                        data-goal-progress-mode
                        ${
                            fixedAutomatic
                                ? "disabled"
                                : ""
                        }
                    >
                        ${this.modeOptions(
                            type,
                            mode
                        )}
                    </select>

                    ${
                        fixedAutomatic
                            ? `

                                <small
                                    class="atlas-goal-progress-help"
                                >
                                    Este tipo de objetivo se calcula
                                    automáticamente.
                                </small>

                            `
                            : ""
                    }

                </label>

                <label
                    class="atlas-settings-field"
                    data-goal-progress-account-field
                    style="
                        display:${
                            mode ===
                            "manual"
                                ? "none"
                                : "flex"
                        };
                    "
                >

                    <span
                        data-goal-progress-account-label
                    >
                        ${this.fieldLabel(
                            mode
                        )}
                    </span>

                    <select
                        name="goalProgressAccountId"
                        data-goal-progress-account
                    >
                        ${this.accountOptions(
                            mode,
                            selectedId
                        )}
                    </select>

                </label>

                <div
                    class="atlas-goal-debt-information"
                    data-goal-debt-information
                    style="
                        display:${
                            mode ===
                            "debt"
                                ? "block"
                                : "none"
                        };
                    "
                >

                    Atlas sumará los pagos confirmados realizados
                    a esta deuda desde la fecha de inicio del objetivo.

                </div>

                <div
                    class="atlas-goal-automatic-preview"
                    data-goal-automatic-preview
                    style="
                        display:${
                            mode ===
                            "manual"
                                ? "none"
                                : "block"
                        };
                    "
                >

                    <small>
                        Progreso calculado actualmente
                    </small>

                    <strong
                        data-goal-automatic-preview-value
                    >
                        ${AtlasGoals.formatCurrency(
                            current
                        )}
                    </strong>

                </div>

            </section>

        `;

    },

    currentGoalType(form) {

        return String(
            form
                ?.querySelector(
                    '[name="goalType"]'
                )
                ?.value ||
            "saving"
        );

    },

    currentMode(form) {

        const type =
            this.currentGoalType(
                form
            );

        if (
            type ===
            "investment"
        ) {

            return "investment";

        }

        if (
            type ===
            "debt"
        ) {

            return "debt";

        }

        return String(
            form
                ?.querySelector(
                    "[data-goal-progress-mode]"
                )
                ?.value ||
            this.defaultModeForType(
                type
            )
        );

    },

    currentAccountId(form) {

        return String(
            form
                ?.querySelector(
                    "[data-goal-progress-account]"
                )
                ?.value ||
            ""
        );

    },

    automaticConfiguration(form) {

        const type =
            this.currentGoalType(
                form
            );

        let mode =
            this.currentMode(
                form
            );

        if (
            !this.validModeForType(
                type,
                mode
            )
        ) {

            mode =
                this.defaultModeForType(
                    type
                );

        }

        return {

            progressMode:
                mode,

            progressAccountId:
                mode ===
                "manual"
                    ? null
                    : (
                        this.currentAccountId(
                            form
                        ) ||
                        null
                    )

        };

    },

    updatePreview(form) {

        if (!form) {

            return;

        }

        const preview =
            form.querySelector(
                "[data-goal-automatic-preview-value]"
            );

        if (!preview) {

            return;

        }

        const configuration =
            this.automaticConfiguration(
                form
            );

        preview.textContent =
            AtlasGoals.formatCurrency(
                this.calculatedCurrent({

                    type:
                        this.currentGoalType(
                            form
                        ),

                    targetAmount:
                        this.number(
                            form.querySelector(
                                '[name="goalTargetAmount"]'
                            )?.value
                        ),

                    currentAmount:
                        this.number(
                            form.querySelector(
                                '[name="goalCurrentAmount"]'
                            )?.value
                        ),

                    startDate:
                        String(
                            form.querySelector(
                                '[name="goalStartDate"]'
                            )?.value ||
                            ""
                        ),

                    ...configuration

                })
            );

    },

    refreshModes(form) {

        if (!form) {

            return;

        }

        const type =
            this.currentGoalType(
                form
            );

        const select =
            form.querySelector(
                "[data-goal-progress-mode]"
            );

        if (!select) {

            return;

        }

        const previous =
            select.value;

        const selected =
            this.validModeForType(
                type,
                previous
            )
                ? previous
                : this.defaultModeForType(
                    type
                );

        select.innerHTML =
            this.modeOptions(
                type,
                selected
            );

        select.value =
            selected;

        select.disabled =
            [
                "investment",
                "debt"
            ].includes(
                type
            );

        this.refreshAccountOptions(
            form,
            false
        );

        this.updateFormVisibility(
            form
        );

    },

    refreshAccountOptions(
        form,
        preserveSelection = true
    ) {

        if (!form) {

            return;

        }

        const mode =
            this.currentMode(
                form
            );

        const select =
            form.querySelector(
                "[data-goal-progress-account]"
            );

        const label =
            form.querySelector(
                "[data-goal-progress-account-label]"
            );

        if (!select) {

            return;

        }

        const previousId =
            preserveSelection
                ? select.value
                : "";

        const compatible =
            this.accountsForMode(
                mode
            )
                .some(
                    account =>
                        account.id ===
                        previousId
                );

        const selectedId =
            compatible
                ? previousId
                : "";

        select.innerHTML =
            this.accountOptions(
                mode,
                selectedId
            );

        select.value =
            selectedId;

        if (label) {

            label.textContent =
                this.fieldLabel(
                    mode
                );

        }

        this.updatePreview(
            form
        );

    },

    updateFormVisibility(form) {

        if (!form) {

            return;

        }

        const mode =
            this.currentMode(
                form
            );

        const type =
            this.currentGoalType(
                form
            );

        const accountField =
            form.querySelector(
                "[data-goal-progress-account-field]"
            );

        const debtInformation =
            form.querySelector(
                "[data-goal-debt-information]"
            );

        const preview =
            form.querySelector(
                "[data-goal-automatic-preview]"
            );

        const currentInput =
            form.querySelector(
                '[name="goalCurrentAmount"]'
            );

        const progressSelect =
            form.querySelector(
                "[data-goal-progress-mode]"
            );

        if (progressSelect) {

            progressSelect.disabled =
                [
                    "investment",
                    "debt"
                ].includes(
                    type
                );

        }

        if (accountField) {

            accountField.style.display =
                mode ===
                "manual"
                    ? "none"
                    : "flex";

        }

        if (debtInformation) {

            debtInformation.style.display =
                mode ===
                "debt"
                    ? "block"
                    : "none";

        }

        if (preview) {

            preview.style.display =
                mode ===
                "manual"
                    ? "none"
                    : "block";

        }

        if (currentInput) {

            currentInput.disabled =
                mode !==
                "manual";

            const currentLabel =
                currentInput.closest(
                    "label"
                );

            if (currentLabel) {

                currentLabel.style.display =
                    mode ===
                    "manual"
                        ? ""
                        : "none";

            }

        }

        this.updatePreview(
            form
        );

    },

    formGoal(goalId) {

        const existing =
            goalId
                ? AtlasGoals.goals()
                    .find(
                        goal =>
                            goal.id ===
                            goalId
                    )
                : null;

        return AtlasGoals.normalizeGoal(
            existing || {

                name:
                    "",

                type:
                    "saving",

                progressMode:
                    "manual",

                progressAccountId:
                    null

            }
        );

    },

    injectFormFields(
        goalId,
        attempt = 0
    ) {

        const form =
            document.querySelector(
                "[data-goal-form]"
            );

        if (!form) {

            if (
                attempt <
                10
            ) {

                window.setTimeout(
                    () =>
                        this.injectFormFields(
                            goalId,
                            attempt + 1
                        ),
                    30
                );

            }

            return;

        }

        const existingSection =
            form.querySelector(
                "[data-goal-progress-section]"
            );

        if (existingSection) {

            this.updateFormVisibility(
                form
            );

            return;

        }

        const currentInput =
            form.querySelector(
                '[name="goalCurrentAmount"]'
            );

        const amountGroup =
            currentInput?.closest(
                ".atlas-goal-actions"
            );

        if (!amountGroup) {

            if (
                attempt <
                10
            ) {

                window.setTimeout(
                    () =>
                        this.injectFormFields(
                            goalId,
                            attempt + 1
                        ),
                    30
                );

            }

            return;

        }

        amountGroup.insertAdjacentHTML(
            "afterend",
            this.automaticFields(
                this.formGoal(
                    goalId
                )
            )
        );

        this.updateFormVisibility(
            form
        );

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-goals-progress-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-goals-progress-styles";

        style.textContent = `

            .atlas-goal-progress-settings {
                display: grid;
                gap: 12px;
                padding: 14px;
                border:
                    1px solid
                    rgba(145, 164, 202, 0.16);
                border-radius: 18px;
                background:
                    rgba(255, 255, 255, 0.025);
            }

            .atlas-goal-progress-settings select {
                width: 100%;
                min-width: 0;
                max-width: 100%;
                box-sizing: border-box;
            }

            .atlas-goal-progress-help {
                display: block;
                margin-top: 6px;
                color: var(--color-text-muted);
                font-size: 9px;
                line-height: 1.45;
            }

            .atlas-goal-debt-information {
                padding: 12px;
                border-radius: 14px;
                background:
                    rgba(244, 185, 94, 0.08);
                color: var(--color-text-muted);
                font-size: 10px;
                line-height: 1.5;
            }

            .atlas-goal-automatic-preview {
                padding: 12px;
                border-radius: 14px;
                background:
                    rgba(77, 163, 255, 0.08);
            }

            .atlas-goal-automatic-preview small,
            .atlas-goal-automatic-preview strong {
                display: block;
            }

            .atlas-goal-automatic-preview small {
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goal-automatic-preview strong {
                margin-top: 5px;
                font-size: 18px;
            }

            .atlas-goal-card[data-paused="true"] {
                opacity: 0.88 !important;
                border-color:
                    rgba(244, 185, 94, 0.32) !important;
                background:
                    rgba(244, 185, 94, 0.055) !important;
            }

            .atlas-goal-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 7px;
                margin-top: 12px;
            }

            .atlas-goal-badge {
                display: inline-flex;
                min-height: 25px;
                align-items: center;
                padding: 0 9px;
                border:
                    1px solid
                    transparent;
                border-radius: 99px;
                font-size: 9px;
                font-weight: 800;
                line-height: 1;
            }

            .atlas-goal-status-active {
                color: #86e4ac;
                border-color:
                    rgba(95, 214, 150, 0.3);
                background:
                    rgba(95, 214, 150, 0.12);
            }

            .atlas-goal-status-paused,
            .atlas-goal-priority-medium {
                color: #f4c875;
                border-color:
                    rgba(244, 185, 94, 0.32);
                background:
                    rgba(244, 185, 94, 0.12);
            }

            .atlas-goal-status-completed,
            .atlas-goal-priority-low {
                color: #79baff;
                border-color:
                    rgba(77, 163, 255, 0.32);
                background:
                    rgba(77, 163, 255, 0.12);
            }

            .atlas-goal-status-archived {
                color: #b8c0d4;
                border-color:
                    rgba(184, 192, 212, 0.24);
                background:
                    rgba(184, 192, 212, 0.08);
            }

            .atlas-goal-status-cancelled,
            .atlas-goal-priority-high {
                color: #ff9aa5;
                border-color:
                    rgba(255, 95, 112, 0.3);
                background:
                    rgba(255, 95, 112, 0.11);
            }

            .atlas-goal-source {
                display: block;
                margin-top: 10px;
                color: var(--color-text-muted);
                font-size: 9px;
                line-height: 1.45;
            }

        `;

        document.head.appendChild(
            style
        );

    },

    installNormalization() {

        this.originalNormalizeGoal =
            AtlasGoals.normalizeGoal.bind(
                AtlasGoals
            );

        AtlasGoals.normalizeGoal =
            goal => {

                const normalized =
                    this.originalNormalizeGoal(
                        goal
                    );

                const requestedMode =
                    String(
                        goal?.progressMode ||
                        this.defaultModeForType(
                            normalized.type
                        )
                    );

                const mode =
                    this.validModeForType(
                        normalized.type,
                        requestedMode
                    )
                        ? requestedMode
                        : this.defaultModeForType(
                            normalized.type
                        );

                return {

                    ...normalized,

                    progressMode:
                        mode,

                    progressAccountId:
                        goal?.progressAccountId ||
                        goal?.debtAccountId ||
                        goal?.accountId ||
                        null,

                    startingDebt:
                        0

                };

            };

    },

    installCalculations() {

        this.originalProgress =
            AtlasGoals.progress.bind(
                AtlasGoals
            );

        this.originalRemaining =
            AtlasGoals.remaining.bind(
                AtlasGoals
            );

        AtlasGoals.progress =
            goal =>
                this.originalProgress(
                    this.effectiveGoal(
                        goal
                    )
                );

        AtlasGoals.remaining =
            goal =>
                this.originalRemaining(
                    this.effectiveGoal(
                        goal
                    )
                );

    },

    installSummary() {

        this.originalSummary =
            AtlasGoals.summary.bind(
                AtlasGoals
            );

        AtlasGoals.summary =
            data => {

                const active =
                    AtlasGoals.goals(
                        data
                    )
                        .filter(
                            goal =>
                                goal.status ===
                                "active"
                        )
                        .sort(
                            (
                                first,
                                second
                            ) => {

                                const priorities = {

                                    high:
                                        1,

                                    medium:
                                        2,

                                    low:
                                        3

                                };

                                const difference =
                                    (
                                        priorities[
                                            first.priority
                                        ] ||
                                        2
                                    ) -
                                    (
                                        priorities[
                                            second.priority
                                        ] ||
                                        2
                                    );

                                if (
                                    difference !==
                                    0
                                ) {

                                    return difference;

                                }

                                return String(
                                    first.deadline ||
                                    "9999-12-31"
                                ).localeCompare(
                                    String(
                                        second.deadline ||
                                        "9999-12-31"
                                    )
                                );

                            }
                        );

                const totalRemaining =
                    active.reduce(
                        (
                            total,
                            goal
                        ) =>
                            total +
                            AtlasGoals.remaining(
                                goal
                            ),
                        0
                    );

                const monthlyRequired =
                    active.reduce(
                        (
                            total,
                            goal
                        ) => {

                            const amount =
                                AtlasGoals.monthlyRequired(
                                    goal
                                );

                            return (
                                total +
                                (
                                    amount ===
                                    null
                                        ? 0
                                        : amount
                                )
                            );

                        },
                        0
                    );

                return {

                    activeCount:
                        active.length,

                    totalRemaining,

                    monthlyRequired,

                    priorityGoal:
                        active[0] ||
                        null

                };

            };

    },

    installCards() {

        this.originalGoalCard =
            AtlasGoals.goalCard.bind(
                AtlasGoals
            );

        AtlasGoals.goalCard =
            goal => {

                const effective =
                    this.effectiveGoal(
                        goal
                    );

                const original =
                    this.originalGoalCard(
                        effective
                    );

                return original.replace(
                    '<div\n                    class="atlas-goal-progress"',
                    `

                        ${this.badges(
                            goal
                        )}

                        <small
                            class="atlas-goal-source"
                        >
                            ${AtlasGoals.escape(
                                this.sourceLabel(
                                    goal
                                )
                            )}
                        </small>

                        <div
                            class="atlas-goal-progress"`
                );

            };

    },

    installForm() {

        this.originalOpenForm =
            AtlasGoals.openForm.bind(
                AtlasGoals
            );

        AtlasGoals.openForm =
            goalId => {

                this.originalOpenForm(
                    goalId
                );

                this.injectFormFields(
                    goalId,
                    0
                );

                window.requestAnimationFrame(
                    () =>
                        this.injectFormFields(
                            goalId,
                            0
                        )
                );

                window.setTimeout(
                    () =>
                        this.injectFormFields(
                            goalId,
                            0
                        ),
                    80
                );

            };

        this.originalSaveForm =
            AtlasGoals.saveForm.bind(
                AtlasGoals
            );

        AtlasGoals.saveForm =
            form => {

                const configuration =
                    this.automaticConfiguration(
                        form
                    );

                if (
                    configuration
                        .progressMode !==
                        "manual" &&
                    !configuration
                        .progressAccountId
                ) {

                    AtlasUI.toast(
                        "Selecciona una cuenta compatible."
                    );

                    return;

                }

                const linkedAccount =
                    configuration
                        .progressAccountId
                        ? this.accountById(
                            configuration
                                .progressAccountId
                        )
                        : null;

                if (
                    configuration
                        .progressMode !==
                        "manual" &&
                    (
                        !linkedAccount ||
                        this.accountRole(
                            linkedAccount
                        ) !==
                            configuration
                                .progressMode
                    )
                ) {

                    AtlasUI.toast(
                        "La cuenta seleccionada no corresponde al cálculo elegido."
                    );

                    return;

                }

                const editingId =
                    AtlasGoals.editingGoalId;

                const previousIds =
                    new Set(
                        AtlasGoals.goals()
                            .map(
                                goal =>
                                    goal.id
                            )
                    );

                this.originalSaveForm(
                    form
                );

                const savedData =
                    AtlasStorage.load();

                if (
                    !savedData ||
                    !Array.isArray(
                        savedData.goals
                    )
                ) {

                    return;

                }

                let targetId =
                    editingId;

                if (!targetId) {

                    const created =
                        savedData.goals
                            .find(
                                goal =>
                                    !previousIds.has(
                                        goal.id
                                    )
                            );

                    targetId =
                        created?.id ||
                        null;

                }

                if (!targetId) {

                    return;

                }

                const index =
                    savedData.goals
                        .findIndex(
                            goal =>
                                goal.id ===
                                targetId
                        );

                if (
                    index <
                    0
                ) {

                    return;

                }

                const previous =
                    savedData.goals[
                        index
                    ];

                savedData.goals[
                    index
                ] = {

                    ...previous,

                    progressMode:
                        configuration
                            .progressMode,

                    progressAccountId:
                        configuration
                            .progressAccountId,

                    accountId:
                        [
                            "account",
                            "investment"
                        ].includes(
                            configuration
                                .progressMode
                        )
                            ? configuration
                                .progressAccountId
                            : null,

                    debtAccountId:
                        configuration
                            .progressMode ===
                            "debt"
                            ? configuration
                                .progressAccountId
                            : null,

                    startingDebt:
                        0,

                    currentAmount:
                        configuration
                            .progressMode ===
                            "manual"
                            ? this.number(
                                previous.currentAmount
                            )
                            : 0,

                    updatedAt:
                        new Date()
                            .toISOString()

                };

                if (
                    !AtlasStorage.save(
                        savedData
                    )
                ) {

                    AtlasUI.toast(
                        "No se pudo guardar la configuración del progreso."
                    );

                    return;

                }

                AtlasGoals.data =
                    AtlasStorage.load();

                if (
                    typeof AtlasApp !==
                    "undefined"
                ) {

                    AtlasApp.data =
                        AtlasGoals.data;

                    AtlasApp.route =
                        "goals";

                    AtlasApp.render();

                }

            };

    },

    bindEvents() {

        document.addEventListener(
            "change",
            event => {

                const form =
                    event.target.closest(
                        "[data-goal-form]"
                    );

                if (!form) {

                    return;

                }

                if (
                    event.target.matches(
                        '[name="goalType"]'
                    )
                ) {

                    this.refreshModes(
                        form
                    );

                    return;

                }

                if (
                    event.target.matches(
                        "[data-goal-progress-mode]"
                    )
                ) {

                    this.refreshAccountOptions(
                        form,
                        false
                    );

                    this.updateFormVisibility(
                        form
                    );

                    return;

                }

                if (
                    event.target.matches(
                        "[data-goal-progress-account]"
                    ) ||
                    event.target.matches(
                        '[name="goalStartDate"]'
                    ) ||
                    event.target.matches(
                        '[name="goalTargetAmount"]'
                    )
                ) {

                    this.updatePreview(
                        form
                    );

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const form =
                    event.target.closest(
                        "[data-goal-form]"
                    );

                if (!form) {

                    return;

                }

                if (
                    event.target.matches(
                        '[name="goalTargetAmount"]'
                    ) ||
                    event.target.matches(
                        '[name="goalCurrentAmount"]'
                    )
                ) {

                    this.updatePreview(
                        form
                    );

                }

            }
        );

    },

    init() {

        if (
            this.initialized ||
            typeof AtlasGoals ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        this.installStyles();

        this.installNormalization();

        this.installCalculations();

        this.installSummary();

        this.installCards();

        this.installForm();

        this.bindEvents();

    }

};

AtlasGoalsProgress.init();

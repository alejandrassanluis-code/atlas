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

    normalizeText(value) {

        return String(
            value ?? ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();

    },

    clone(value) {

        return JSON.parse(
            JSON.stringify(
                value
            )
        );

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

    activeAccounts(
        data = AtlasGoals.data
    ) {

        return this.accounts(data)
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

        return this.accounts(data)
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

    accountPropertyDescriptor(account) {

        return this.normalizeText(
            [

                account?.type,

                account?.accountType,

                account?.kind,

                account?.category,

                account?.subcategory,

                account?.subtype,

                account?.group,

                account?.role

            ]
                .filter(Boolean)
                .join(" ")
        );

    },

    accountNameDescriptor(account) {

        return this.normalizeText(
            account?.name
        );

    },

    containsAny(
        text,
        words
    ) {

        return words.some(
            word =>
                text.includes(
                    word
                )
        );

    },

    accountRole(account) {

        const properties =
            this.accountPropertyDescriptor(
                account
            );

        const name =
            this.accountNameDescriptor(
                account
            );

        const debtPropertyWords = [

            "debt",

            "deuda",

            "credit",

            "credito",

            "credit_card",

            "credit-card",

            "loan",

            "prestamo",

            "mortgage",

            "hipoteca",

            "financing",

            "financiacion",

            "liability",

            "pasivo"

        ];

        if (
            this.containsAny(
                properties,
                debtPropertyWords
            )
        ) {

            return "debt";

        }

        const investmentPropertyWords = [

            "investment",

            "inversion",

            "broker",

            "portfolio",

            "cartera",

            "securities",

            "acciones",

            "stock",

            "etf",

            "crypto",

            "cripto",

            "index fund",

            "fondo indexado",

            "pension"

        ];

        if (
            this.containsAny(
                properties,
                investmentPropertyWords
            )
        ) {

            return "investment";

        }

        const debtNameWords = [

            "tarjeta de credito",

            "tarjeta credito",

            "prestamo",

            "hipoteca",

            "deuda",

            "financiacion"

        ];

        if (
            this.containsAny(
                name,
                debtNameWords
            )
        ) {

            return "debt";

        }

        const investmentNameWords = [

            "inversion",

            "broker",

            "cartera",

            "acciones",

            "etf",

            "cripto",

            "fondo indexado",

            "plan de pensiones"

        ];

        if (
            this.containsAny(
                name,
                investmentNameWords
            )
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
            mode === "manual"
        ) {

            return [];

        }

        return this.activeAccounts(
            data
        ).filter(
            account =>
                this.accountRole(
                    account
                ) === mode
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
                value !== null &&
                value !== undefined &&
                value !== "" &&
                Number.isFinite(
                    Number(value)
                )
            ) {

                return Number(value);

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

        return Math.max(
            0,
            this.firstNumber(
                account,
                [
                    "currentValue",
                    "investmentValue",
                    "marketValue",
                    "currentBalance",
                    "balance",
                    "value",
                    "amount",
                    "initialBalance"
                ],
                0
            )
        );

    },

    outstandingDebt(account) {

        if (!account) {

            return 0;

        }

        return Math.abs(
            this.firstNumber(
                account,
                [
                    "outstandingBalance",
                    "currentDebt",
                    "debt",
                    "currentBalance",
                    "balance",
                    "amount",
                    "initialBalance"
                ],
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

                "manual",

                "investment"

            ],

            debt: [

                "manual",

                "debt"

            ]

        };

        return (
            modes[type] ||
            modes.saving
        );

    },

    defaultAutomaticMode(type) {

        const defaults = {

            saving:
                "account",

            purchase:
                "account",

            emergency:
                "account",

            investment:
                "investment",

            debt:
                "debt"

        };

        return (
            defaults[type] ||
            "account"
        );

    },

    validModeForType(
        type,
        mode
    ) {

        return this.allowedModesForType(
            type
        ).includes(
            mode
        );

    },

    progressMode(goal) {

        const requested =
            String(
                goal?.progressMode ||
                "manual"
            );

        return this.validModeForType(
            goal?.type ||
            "saving",
            requested
        )
            ? requested
            : "manual";

    },

    linkedAccountId(goal) {

        return (
            goal?.progressAccountId ||
            goal?.accountId ||
            goal?.debtAccountId ||
            ""
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
            mode === "manual"
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
            mode === "account" ||
            mode === "investment"
        ) {

            return this.round(
                this.accountValue(
                    account
                )
            );

        }

        if (
            mode === "debt"
        ) {

            const initialDebt =
                Math.max(
                    0,
                    this.number(
                        goal?.startingDebt
                    )
                );

            const currentDebt =
                this.outstandingDebt(
                    account
                );

            return this.round(
                Math.max(
                    0,
                    initialDebt -
                    currentDebt
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
            mode === "manual"
        ) {

            return "Progreso manual";

        }

        const accountName =
            this.accountName(
                this.linkedAccountId(
                    goal
                )
            );

        if (
            mode === "debt"
        ) {

            return (
                `Automático · reducción de ` +
                `${accountName}`
            );

        }

        if (
            mode === "investment"
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
                "Manual",

            account:
                "Saldo de una cuenta",

            investment:
                "Valor de una inversión",

            debt:
                "Reducción de una deuda"

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
                : "manual";

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

    debtReference(
        goal,
        selectedAccountId
    ) {

        const account =
            this.accountById(
                selectedAccountId
            );

        if (!account) {

            return 0;

        }

        const sameExistingAccount =
            goal?.progressMode ===
                "debt" &&
            goal?.progressAccountId ===
                selectedAccountId &&
            this.number(
                goal?.startingDebt
            ) > 0;

        if (
            sameExistingAccount
        ) {

            return this.number(
                goal.startingDebt
            );

        }

        return this.outstandingDebt(
            account
        );

    },

    automaticFields(goal) {

        const goalType =
            goal.type ||
            "saving";

        const mode =
            this.progressMode(
                goal
            );

        const accountId =
            this.linkedAccountId(
                goal
            );

        const compatible =
            this.accountsForMode(
                mode
            ).some(
                account =>
                    account.id ===
                    accountId
            );

        const selectedId =
            compatible
                ? accountId
                : "";

        const startingDebt =
            mode === "debt"
                ? this.debtReference(
                    goal,
                    selectedId
                )
                : 0;

        const current =
            this.calculatedCurrent(
                {

                    ...goal,

                    progressMode:
                        mode,

                    progressAccountId:
                        selectedId,

                    startingDebt

                }
            );

        return `

            <section
                data-goal-progress-section
                data-goal-existing-mode="${AtlasGoals.escape(
                    mode
                )}"
                data-goal-existing-account="${AtlasGoals.escape(
                    selectedId
                )}"
                data-goal-existing-debt="${AtlasGoals.escape(
                    startingDebt
                )}"
                style="
                    padding:14px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius:18px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                "
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
                    >
                        ${this.modeOptions(
                            goalType,
                            mode
                        )}
                    </select>

                </label>

                <label
                    class="atlas-settings-field"
                    data-goal-progress-account-field
                    style="
                        display:${
                            mode === "manual"
                                ? "none"
                                : "flex"
                        };
                        margin-top:12px;
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
                    data-goal-debt-reference
                    style="
                        display:${
                            mode === "debt"
                                ? "block"
                                : "none"
                        };
                        margin-top:12px;
                        padding:12px;
                        border-radius:14px;
                        background:
                            rgba(
                                244,
                                185,
                                94,
                                0.08
                            );
                    "
                >

                    <small
                        style="
                            display:block;
                            color:
                                var(
                                    --color-text-muted
                                );
                            line-height:1.45;
                        "
                    >
                        La deuda pendiente actual se guardará automáticamente
                        como referencia inicial. Cada pago aumentará el progreso.
                    </small>

                    <strong
                        data-goal-debt-reference-value
                        style="
                            display:block;
                            margin-top:6px;
                            color:#f4b95e;
                            font-size:16px;
                        "
                    >
                        ${AtlasGoals.formatCurrency(
                            startingDebt
                        )}
                    </strong>

                </div>

                <div
                    data-goal-automatic-preview
                    style="
                        display:${
                            mode === "manual"
                                ? "none"
                                : "block"
                        };
                        margin-top:13px;
                        padding:12px;
                        border-radius:14px;
                        background:
                            rgba(
                                77,
                                163,
                                255,
                                0.08
                            );
                    "
                >

                    <small
                        style="
                            display:block;
                            color:
                                var(
                                    --color-text-muted
                                );
                        "
                    >
                        Progreso calculado actualmente
                    </small>

                    <strong
                        data-goal-automatic-preview-value
                        style="
                            display:block;
                            margin-top:5px;
                            font-size:18px;
                        "
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

        return String(
            form
                ?.querySelector(
                    "[data-goal-progress-mode]"
                )
                ?.value ||
            "manual"
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

        const section =
            form?.querySelector(
                "[data-goal-progress-section]"
            );

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
                "manual";

        }

        const accountId =
            mode === "manual"
                ? ""
                : this.currentAccountId(
                    form
                );

        let startingDebt =
            0;

        if (
            mode === "debt" &&
            accountId
        ) {

            const existingMode =
                section?.dataset
                    ?.goalExistingMode ||
                "";

            const existingAccount =
                section?.dataset
                    ?.goalExistingAccount ||
                "";

            const existingDebt =
                this.number(
                    section?.dataset
                        ?.goalExistingDebt
                );

            if (
                existingMode ===
                    "debt" &&
                existingAccount ===
                    accountId &&
                existingDebt > 0
            ) {

                startingDebt =
                    existingDebt;

            } else {

                startingDebt =
                    this.outstandingDebt(
                        this.accountById(
                            accountId
                        )
                    );

            }

        }

        return {

            progressMode:
                mode,

            progressAccountId:
                accountId ||
                null,

            startingDebt:
                this.round(
                    startingDebt
                )

        };

    },

    updatePreview(form) {

        if (!form) {

            return;

        }

        const configuration =
            this.automaticConfiguration(
                form
            );

        const previewValue =
            form.querySelector(
                "[data-goal-automatic-preview-value]"
            );

        const debtReferenceValue =
            form.querySelector(
                "[data-goal-debt-reference-value]"
            );

        if (
            previewValue
        ) {

            previewValue.textContent =
                AtlasGoals.formatCurrency(
                    this.calculatedCurrent(
                        {

                            type:
                                this.currentGoalType(
                                    form
                                ),

                            currentAmount:
                                this.number(
                                    form.querySelector(
                                        '[name="goalCurrentAmount"]'
                                    )?.value
                                ),

                            ...configuration

                        }
                    )
                );

        }

        if (
            debtReferenceValue
        ) {

            debtReferenceValue.textContent =
                AtlasGoals.formatCurrency(
                    configuration.startingDebt
                );

        }

    },

    refreshModes(
        form,
        preferAutomatic = false
    ) {

        if (!form) {

            return;

        }

        const type =
            this.currentGoalType(
                form
            );

        const modeSelect =
            form.querySelector(
                "[data-goal-progress-mode]"
            );

        if (!modeSelect) {

            return;

        }

        const previousMode =
            modeSelect.value;

        let selectedMode =
            this.validModeForType(
                type,
                previousMode
            )
                ? previousMode
                : "manual";

        if (
            preferAutomatic &&
            previousMode !==
                "manual"
        ) {

            selectedMode =
                this.defaultAutomaticMode(
                    type
                );

        }

        modeSelect.innerHTML =
            this.modeOptions(
                type,
                selectedMode
            );

        modeSelect.value =
            selectedMode;

        this.refreshAccountOptions(
            form,
            true
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

        const accountSelect =
            form.querySelector(
                "[data-goal-progress-account]"
            );

        const accountLabel =
            form.querySelector(
                "[data-goal-progress-account-label]"
            );

        if (!accountSelect) {

            return;

        }

        const previousId =
            preserveSelection
                ? accountSelect.value
                : "";

        const compatible =
            this.accountsForMode(
                mode
            ).some(
                account =>
                    account.id ===
                    previousId
            );

        const selectedId =
            compatible
                ? previousId
                : "";

        accountSelect.innerHTML =
            this.accountOptions(
                mode,
                selectedId
            );

        accountSelect.value =
            selectedId;

        if (
            accountLabel
        ) {

            accountLabel.textContent =
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

        const accountField =
            form.querySelector(
                "[data-goal-progress-account-field]"
            );

        const debtReference =
            form.querySelector(
                "[data-goal-debt-reference]"
            );

        const preview =
            form.querySelector(
                "[data-goal-automatic-preview]"
            );

        const currentInput =
            form.querySelector(
                '[name="goalCurrentAmount"]'
            );

        if (
            accountField
        ) {

            accountField.style.display =
                mode === "manual"
                    ? "none"
                    : "flex";

        }

        if (
            debtReference
        ) {

            debtReference.style.display =
                mode === "debt"
                    ? "block"
                    : "none";

        }

        if (
            preview
        ) {

            preview.style.display =
                mode === "manual"
                    ? "none"
                    : "block";

        }

        if (
            currentInput
        ) {

            currentInput.disabled =
                mode !== "manual";

            currentInput.style.opacity =
                mode === "manual"
                    ? "1"
                    : "0.5";

        }

        this.updatePreview(
            form
        );

    },

    injectFormFields(goalId) {

        const form =
            document.querySelector(
                "[data-goal-form]"
            );

        if (!form) {

            return;

        }

        const existing =
            goalId
                ? AtlasGoals.goals()
                    .find(
                        goal =>
                            goal.id ===
                            goalId
                    )
                : null;

        const goal =
            AtlasGoals.normalizeGoal(
                existing || {

                    name:
                        "",

                    type:
                        "saving",

                    progressMode:
                        "manual",

                    progressAccountId:
                        null,

                    startingDebt:
                        0

                }
            );

        const currentInput =
            form.querySelector(
                '[name="goalCurrentAmount"]'
            );

        const amountGroup =
            currentInput?.closest(
                ".atlas-goal-actions"
            );

        if (!amountGroup) {

            return;

        }

        amountGroup.insertAdjacentHTML(
            "afterend",
            this.automaticFields(
                goal
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

        if (
            previous
        ) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-goals-progress-styles";

        style.textContent = `

            .atlas-goal-card[data-paused="true"] {
                opacity: 0.88 !important;
                border-color:
                    rgba(
                        244,
                        185,
                        94,
                        0.32
                    ) !important;
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.055
                    ) !important;
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
                padding:
                    0
                    9px;
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
                    rgba(
                        95,
                        214,
                        150,
                        0.3
                    );
                background:
                    rgba(
                        95,
                        214,
                        150,
                        0.12
                    );
            }

            .atlas-goal-status-paused {
                color: #f4c875;
                border-color:
                    rgba(
                        244,
                        185,
                        94,
                        0.32
                    );
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.12
                    );
            }

            .atlas-goal-status-completed {
                color: #79baff;
                border-color:
                    rgba(
                        77,
                        163,
                        255,
                        0.32
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.12
                    );
            }

            .atlas-goal-status-archived {
                color: #b8c0d4;
                border-color:
                    rgba(
                        184,
                        192,
                        212,
                        0.24
                    );
                background:
                    rgba(
                        184,
                        192,
                        212,
                        0.08
                    );
            }

            .atlas-goal-status-cancelled {
                color: #ff9aa5;
                border-color:
                    rgba(
                        255,
                        95,
                        112,
                        0.26
                    );
                background:
                    rgba(
                        255,
                        95,
                        112,
                        0.09
                    );
            }

            .atlas-goal-priority-high {
                color: #ff9aa5;
                border-color:
                    rgba(
                        255,
                        95,
                        112,
                        0.3
                    );
                background:
                    rgba(
                        255,
                        95,
                        112,
                        0.11
                    );
            }

            .atlas-goal-priority-medium {
                color: #f4c875;
                border-color:
                    rgba(
                        244,
                        185,
                        94,
                        0.3
                    );
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.11
                    );
            }

            .atlas-goal-priority-low {
                color: #79baff;
                border-color:
                    rgba(
                        77,
                        163,
                        255,
                        0.3
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.11
                    );
            }

            .atlas-goal-source {
                display: block;
                margin-top: 10px;
                color:
                    var(
                        --color-text-muted
                    );
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
                        "manual"
                    );

                const mode =
                    this.validModeForType(
                        normalized.type,
                        requestedMode
                    )
                        ? requestedMode
                        : "manual";

                return {

                    ...normalized,

                    progressMode:
                        mode,

                    progressAccountId:
                        goal?.progressAccountId ||
                        goal?.accountId ||
                        goal?.debtAccountId ||
                        null,

                    startingDebt:
                        Math.max(
                            0,
                            this.round(
                                goal?.startingDebt
                            )
                        )

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

                                const priorityDifference =
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
                                    priorityDifference !==
                                    0
                                ) {

                                    return priorityDifference;

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

                const information = `

                    ${this.badges(goal)}

                    <small
                        class="atlas-goal-source"
                    >
                        ${AtlasGoals.escape(
                            this.sourceLabel(
                                goal
                            )
                        )}
                    </small>

                `;

                return original.replace(
                    '<div\n                    class="atlas-goal-progress"',
                    `

                        ${information}

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
                    goalId
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

                if (
                    configuration
                        .progressMode ===
                        "debt" &&
                    configuration
                        .startingDebt <= 0
                ) {

                    AtlasUI.toast(
                        "La cuenta seleccionada no tiene deuda pendiente."
                    );

                    return;

                }

                const editingId =
                    AtlasGoals
                        .editingGoalId;

                const beforeIds =
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
                                    !beforeIds.has(
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
                    index < 0
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
                        configuration
                            .progressMode ===
                            "account" ||
                        configuration
                            .progressMode ===
                            "investment"
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
                        configuration
                            .startingDebt,

                    updatedAt:
                        new Date()
                            .toISOString()

                };

                const stored =
                    AtlasStorage.save(
                        savedData
                    );

                if (!stored) {

                    AtlasUI.toast(
                        "No se pudo guardar la configuración automática."
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
                        form,
                        true
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

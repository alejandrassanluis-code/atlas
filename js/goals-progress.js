/* ==========================================================
   ATLAS
   goals-progress.js
   Progreso automático de objetivos
========================================================== */

const AtlasGoalsProgress = {

    initialized:
        false,

    pendingConfig:
        null,

    pendingNormalizeSkips:
        0,

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

    accountDescriptor(account) {

        return this.normalizeText(
            [

                account?.type,

                account?.accountType,

                account?.kind,

                account?.category,

                account?.subcategory,

                account?.subtype,

                account?.group,

                account?.name

            ]
                .filter(Boolean)
                .join(" ")
        );

    },

    accountRole(account) {

        const descriptor =
            this.accountDescriptor(
                account
            );

        const debtWords = [

            "debt",

            "deuda",

            "credit",

            "credito",

            "credit card",

            "tarjeta",

            "loan",

            "prestamo",

            "mortgage",

            "hipoteca",

            "financing",

            "financiacion"

        ];

        if (
            debtWords.some(
                word =>
                    descriptor.includes(
                        word
                    )
            )
        ) {

            return "debt";

        }

        const investmentWords = [

            "investment",

            "inversion",

            "invest",

            "broker",

            "portfolio",

            "cartera",

            "fund",

            "fondo indexado",

            "acciones",

            "stock",

            "etf",

            "crypto",

            "cripto"

        ];

        if (
            investmentWords.some(
                word =>
                    descriptor.includes(
                        word
                    )
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

        const role =
            this.accountRole(
                account
            );

        const labels = {

            account:
                "Saldo",

            investment:
                "Inversión",

            debt:
                "Deuda"

        };

        return (
            labels[role] ||
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

        const value =
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
            );

        return Math.abs(
            value
        );

    },

    progressMode(goal) {

        const allowed = [

            "manual",

            "account",

            "investment",

            "debt"

        ];

        return allowed.includes(
            goal?.progressMode
        )
            ? goal.progressMode
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

            const startingDebt =
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
                    startingDebt -
                    currentDebt
                )
            );

        }

        return Math.max(
            0,
            this.round(
                goal?.currentAmount
            )
        );

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
                `Automático · deuda de ` +
                `${accountName}`
            );

        }

        if (
            mode === "investment"
        ) {

            return (
                `Automático · inversión de ` +
                `${accountName}`
            );

        }

        return (
            `Automático · saldo de ` +
            `${accountName}`
        );

    },

    modeOptions(selected) {

        const options = [

            {
                value:
                    "manual",

                label:
                    "Manual"
            },

            {
                value:
                    "account",

                label:
                    "Saldo de una cuenta"
            },

            {
                value:
                    "investment",

                label:
                    "Valor de una inversión"
            },

            {
                value:
                    "debt",

                label:
                    "Reducción de una deuda"
            }

        ];

        return options
            .map(
                option => `

                    <option
                        value="${option.value}"
                        ${
                            option.value ===
                            selected
                                ? "selected"
                                : ""
                        }
                    >
                        ${option.label}
                    </option>

                `
            )
            .join("");

    },

    accountOptions(
        mode,
        selectedId
    ) {

        const accounts =
            this.accountsForMode(
                mode
            );

        const emptyLabels = {

            account:
                "Selecciona una cuenta de saldo",

            investment:
                "Selecciona una inversión",

            debt:
                "Selecciona una deuda"

        };

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
                ${
                    emptyLabels[mode] ||
                    "Selecciona una cuenta"
                }
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

    automaticFields(goal) {

        const mode =
            this.progressMode(
                goal
            );

        const accountId =
            this.linkedAccountId(
                goal
            );

        const compatibleAccount =
            this.accountsForMode(
                mode
            ).some(
                account =>
                    account.id ===
                    accountId
            );

        const selectedId =
            compatibleAccount
                ? accountId
                : "";

        const current =
            this.calculatedCurrent(
                {
                    ...goal,
                    progressAccountId:
                        selectedId
                }
            );

        return `

            <section
                data-goal-progress-section
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

                <label
                    class="atlas-settings-field"
                    data-goal-starting-debt-field
                    style="
                        display:${
                            mode === "debt"
                                ? "flex"
                                : "none"
                        };
                        margin-top:12px;
                    "
                >

                    <span>
                        Deuda inicial de referencia
                    </span>

                    <input
                        name="goalStartingDebt"
                        type="number"
                        inputmode="decimal"
                        min="0"
                        step="0.01"
                        value="${AtlasGoals.escape(
                            goal.startingDebt ||
                            0
                        )}"
                    >

                </label>

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

    formGoal(form) {

        const values =
            new FormData(
                form
            );

        return {

            progressMode:
                String(
                    values.get(
                        "goalProgressMode"
                    ) ||
                    "manual"
                ),

            progressAccountId:
                String(
                    values.get(
                        "goalProgressAccountId"
                    ) ||
                    ""
                ),

            startingDebt:
                this.number(
                    values.get(
                        "goalStartingDebt"
                    )
                )

        };

    },

    updatePreview(form) {

        if (!form) {

            return;

        }

        const config =
            this.formGoal(
                form
            );

        const previewValue =
            form.querySelector(
                "[data-goal-automatic-preview-value]"
            );

        if (!previewValue) {

            return;

        }

        const current =
            this.calculatedCurrent(
                config
            );

        previewValue.textContent =
            AtlasGoals.formatCurrency(
                current
            );

    },

    refreshAccountOptions(
        form,
        preserveSelection = false
    ) {

        if (!form) {

            return;

        }

        const modeSelect =
            form.querySelector(
                "[data-goal-progress-mode]"
            );

        const accountSelect =
            form.querySelector(
                "[data-goal-progress-account]"
            );

        const accountLabel =
            form.querySelector(
                "[data-goal-progress-account-label]"
            );

        const mode =
            modeSelect?.value ||
            "manual";

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

        if (accountLabel) {

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

        const modeSelect =
            form.querySelector(
                "[data-goal-progress-mode]"
            );

        const accountField =
            form.querySelector(
                "[data-goal-progress-account-field]"
            );

        const startingDebtField =
            form.querySelector(
                "[data-goal-starting-debt-field]"
            );

        const preview =
            form.querySelector(
                "[data-goal-automatic-preview]"
            );

        const currentInput =
            form.querySelector(
                '[name="goalCurrentAmount"]'
            );

        const mode =
            modeSelect?.value ||
            "manual";

        if (accountField) {

            accountField.style.display =
                mode === "manual"
                    ? "none"
                    : "flex";

        }

        if (startingDebtField) {

            startingDebtField.style.display =
                mode === "debt"
                    ? "flex"
                    : "none";

        }

        if (preview) {

            preview.style.display =
                mode === "manual"
                    ? "none"
                    : "block";

        }

        if (currentInput) {

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

                let mode =
                    goal?.progressMode ??
                    "manual";

                let accountId =
                    goal?.progressAccountId ??
                    goal?.accountId ??
                    goal?.debtAccountId ??
                    null;

                let startingDebt =
                    goal?.startingDebt ??
                    0;

                if (
                    this.pendingConfig
                ) {

                    if (
                        this.pendingNormalizeSkips >
                        0
                    ) {

                        this.pendingNormalizeSkips -=
                            1;

                    } else {

                        mode =
                            this.pendingConfig
                                .progressMode;

                        accountId =
                            this.pendingConfig
                                .progressAccountId;

                        startingDebt =
                            this.pendingConfig
                                .startingDebt;

                        this.pendingConfig =
                            null;

                    }

                }

                return {

                    ...normalized,

                    progressMode:
                        [
                            "manual",
                            "account",
                            "investment",
                            "debt"
                        ].includes(mode)
                            ? mode
                            : "manual",

                    progressAccountId:
                        accountId ||
                        null,

                    startingDebt:
                        Math.max(
                            0,
                            this.round(
                                startingDebt
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
            goal => {

                const effective =
                    this.effectiveGoal(
                        goal
                    );

                return this.originalProgress(
                    effective
                );

            };

        AtlasGoals.remaining =
            goal => {

                const effective =
                    this.effectiveGoal(
                        goal
                    );

                return this.originalRemaining(
                    effective
                );

            };

    },

    metadataLabel(goal) {

        return (
            `Prioridad: ` +
            `${AtlasGoals.priorityLabel(
                goal.priority
            )}` +
            ` · Estado: ` +
            `${AtlasGoals.statusLabel(
                goal.status
            )}`
        );

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

                const card =
                    this.originalGoalCard(
                        effective
                    );

                const source =
                    this.sourceLabel(
                        goal
                    );

                const metadata =
                    this.metadataLabel(
                        goal
                    );

                return card.replace(
                    '<div\n                    class="atlas-goal-progress"',
                    `

                        <small
                            style="
                                display:block;
                                margin-top:12px;
                                color:
                                    var(
                                        --color-text-muted
                                    );
                                font-size:9px;
                                line-height:1.4;
                            "
                        >
                            ${AtlasGoals.escape(
                                source
                            )}
                        </small>

                        <small
                            style="
                                display:block;
                                margin-top:5px;
                                color:
                                    var(
                                        --color-text-muted
                                    );
                                font-size:9px;
                                line-height:1.4;
                            "
                        >
                            ${AtlasGoals.escape(
                                metadata
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
                    goalId
                );

            };

        this.originalSaveForm =
            AtlasGoals.saveForm.bind(
                AtlasGoals
            );

        AtlasGoals.saveForm =
            form => {

                const values =
                    new FormData(
                        form
                    );

                const progressMode =
                    String(
                        values.get(
                            "goalProgressMode"
                        ) ||
                        "manual"
                    );

                const progressAccountId =
                    String(
                        values.get(
                            "goalProgressAccountId"
                        ) ||
                        ""
                    );

                const startingDebt =
                    this.number(
                        values.get(
                            "goalStartingDebt"
                        )
                    );

                if (
                    progressMode !==
                        "manual" &&
                    !progressAccountId
                ) {

                    AtlasUI.toast(
                        "Selecciona una cuenta compatible."
                    );

                    return;

                }

                const linkedAccount =
                    progressAccountId
                        ? this.accountById(
                            progressAccountId
                        )
                        : null;

                if (
                    progressMode !==
                        "manual" &&
                    (
                        !linkedAccount ||
                        this.accountRole(
                            linkedAccount
                        ) !==
                            progressMode
                    )
                ) {

                    AtlasUI.toast(
                        "La cuenta seleccionada no corresponde al tipo de progreso."
                    );

                    return;

                }

                if (
                    progressMode ===
                        "debt" &&
                    startingDebt <= 0
                ) {

                    AtlasUI.toast(
                        "Introduce la deuda inicial de referencia."
                    );

                    return;

                }

                this.pendingConfig = {

                    progressMode,

                    progressAccountId:
                        progressAccountId ||
                        null,

                    startingDebt

                };

                this.pendingNormalizeSkips =
                    AtlasGoals.goals()
                        .length;

                try {

                    this.originalSaveForm(
                        form
                    );

                } finally {

                    this.pendingConfig =
                        null;

                    this.pendingNormalizeSkips =
                        0;

                }

            };

    },

    bindEvents() {

        document.addEventListener(
            "change",
            event => {

                const modeSelect =
                    event.target.closest(
                        "[data-goal-progress-mode]"
                    );

                if (modeSelect) {

                    const form =
                        modeSelect.closest(
                            "[data-goal-form]"
                        );

                    this.refreshAccountOptions(
                        form,
                        false
                    );

                    this.updateFormVisibility(
                        form
                    );

                    return;

                }

                const accountSelect =
                    event.target.closest(
                        "[data-goal-progress-account]"
                    );

                if (accountSelect) {

                    this.updatePreview(
                        accountSelect.closest(
                            "[data-goal-form]"
                        )
                    );

                    return;

                }

                const debtInput =
                    event.target.closest(
                        '[name="goalStartingDebt"]'
                    );

                if (debtInput) {

                    this.updatePreview(
                        debtInput.closest(
                            "[data-goal-form]"
                        )
                    );

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const debtInput =
                    event.target.closest(
                        '[name="goalStartingDebt"]'
                    );

                if (!debtInput) {

                    return;

                }

                this.updatePreview(
                    debtInput.closest(
                        "[data-goal-form]"
                    )
                );

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

        this.installNormalization();

        this.installCalculations();

        this.installCards();

        this.installForm();

        this.bindEvents();

    }

};

AtlasGoalsProgress.init();

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
                ) =>
                    this.number(
                        first.order
                    ) -
                    this.number(
                        second.order
                    )
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
                    "amount"
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
                    "amount"
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

    accountOptions(selectedId) {

        const accounts =
            this.activeAccounts();

        return `

            <option value="">
                Selecciona una cuenta
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
                        </option>

                    `
                )
                .join("")}

        `;

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

        const current =
            this.calculatedCurrent(
                goal
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

                    <span>
                        Cuenta vinculada
                    </span>

                    <select
                        name="goalProgressAccountId"
                        data-goal-progress-account
                    >
                        ${this.accountOptions(
                            accountId
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

                const pending =
                    this.pendingConfig ||
                    {};

                const mode =
                    pending.progressMode ??
                    goal?.progressMode ??
                    "manual";

                const accountId =
                    pending.progressAccountId ??
                    goal?.progressAccountId ??
                    goal?.accountId ??
                    goal?.debtAccountId ??
                    null;

                const startingDebt =
                    Math.max(
                        0,
                        this.round(
                            pending.startingDebt ??
                            goal?.startingDebt ??
                            0
                        )
                    );

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

                    startingDebt

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
                        "Selecciona una cuenta para calcular el progreso."
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

                try {

                    this.originalSaveForm(
                        form
                    );

                } finally {

                    this.pendingConfig =
                        null;

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

                if (!modeSelect) {

                    return;

                }

                this.updateFormVisibility(
                    modeSelect.closest(
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

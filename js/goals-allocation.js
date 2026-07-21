/* ==========================================================
   ATLAS
   goals-allocation.js
   Distribución centralizada de ahorro y efectivo disponible
========================================================== */

const AtlasGoalsAllocation = {

    initialized:
        false,

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

    clone(value) {

        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    },

    now() {

        return new Date()
            .toISOString();

    },

    today() {

        return new Date()
            .toISOString()
            .slice(
                0,
                10
            );

    },

    createId(
        prefix =
            "goal_allocation"
    ) {

        if (
            typeof AtlasCatalog !==
                "undefined" &&
            typeof AtlasCatalog.createId ===
                "function"
        ) {

            return AtlasCatalog.createId(
                prefix
            );

        }

        return [
            prefix,
            Date.now(),
            Math.random()
                .toString(36)
                .slice(
                    2,
                    8
                )
        ].join("_");

    },

    data() {

        if (
            typeof AtlasApp !==
                "undefined" &&
            AtlasApp.data
        ) {

            return AtlasApp.data;

        }

        return AtlasGoals.data;

    },

    goals(
        data = this.data()
    ) {

        return Array.isArray(
            data?.goals
        )
            ? data.goals
            : [];

    },

    accounts(
        data = this.data()
    ) {

        return Array.isArray(
            data?.accounts
        )
            ? data.accounts
            : [];

    },

    movements(
        data = this.data()
    ) {

        return Array.isArray(
            data?.movements
        )
            ? data.movements
            : [];

    },

    goalById(
        goalId,
        data = this.data()
    ) {

        return this.goals(
            data
        )
            .find(
                goal =>
                    goal.id ===
                    goalId
            ) || null;

    },

    accountById(
        accountId,
        data = this.data()
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

    contributions(goal) {

        return Array.isArray(
            goal?.contributions
        )
            ? goal.contributions
            : [];

    },

    progressMode(goal) {

        return String(
            goal?.progressMode ||
            "manual"
        );

    },

    isManualGoal(goal) {

        return this.progressMode(
            goal
        ) ===
            "manual";

    },

    isCompatibleType(goal) {

        return [
            "saving",
            "purchase",
            "emergency"
        ].includes(
            goal?.type
        );

    },

    isAllocatableGoal(goal) {

        return Boolean(
            goal &&
            goal.status ===
                "active" &&
            this.isManualGoal(
                goal
            ) &&
            this.isCompatibleType(
                goal
            )
        );

    },

    priorityOrder(priority) {

        const values = {

            high:
                1,

            medium:
                2,

            low:
                3

        };

        return (
            values[priority] ||
            2
        );

    },

    allocatableGoals(
        data = this.data()
    ) {

        return this.goals(
            data
        )
            .filter(
                goal =>
                    this.isAllocatableGoal(
                        goal
                    )
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const priorityDifference =
                        this.priorityOrder(
                            first.priority
                        ) -
                        this.priorityOrder(
                            second.priority
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

    },

    contributionEffect(contribution) {

        const amount =
            Math.max(
                0,
                this.number(
                    contribution?.amount
                )
            );

        return contribution?.type ===
            "withdrawal"
                ? -amount
                : amount;

    },

    isSavingsAllocation(contribution) {

        return contribution?.source ===
            "available_savings";

    },

    isCashAllocation(contribution) {

        return [
            "prior_liquidity",
            "available_cash"
        ].includes(
            contribution?.source
        );

    },

    isManagedAllocation(contribution) {

        return (
            this.isSavingsAllocation(
                contribution
            ) ||
            this.isCashAllocation(
                contribution
            )
        );

    },

    normalizedSource(source) {

        return source ===
            "available_savings"
                ? "available_savings"
                : "prior_liquidity";

    },

    sourceLabel(source) {

        return this.normalizedSource(
            source
        ) ===
            "prior_liquidity"
                ? "Efectivo disponible"
                : "Ahorro disponible";

    },

    sourceShortLabel(source) {

        return this.normalizedSource(
            source
        ) ===
            "prior_liquidity"
                ? "efectivo"
                : "ahorro";

    },

    contributionMatchesSource(
        contribution,
        source
    ) {

        const normalized =
            this.normalizedSource(
                source
            );

        if (
            normalized ===
            "available_savings"
        ) {

            return this.isSavingsAllocation(
                contribution
            );

        }

        return this.isCashAllocation(
            contribution
        );

    },

    assignedForGoalBySource(
        goal,
        source
    ) {

        return this.round(
            this.contributions(
                goal
            )
                .filter(
                    contribution =>
                        this.contributionMatchesSource(
                            contribution,
                            source
                        )
                )
                .reduce(
                    (
                        total,
                        contribution
                    ) =>
                        total +
                        this.contributionEffect(
                            contribution
                        ),
                    0
                )
        );

    },

    totalAssignedBySource(
        source,
        data = this.data()
    ) {

        return this.round(
            this.goals(
                data
            )
                .reduce(
                    (
                        total,
                        goal
                    ) =>
                        total +
                        this.assignedForGoalBySource(
                            goal,
                            source
                        ),
                    0
                )
        );

    },

    totalAssignedFromSavings(
        data = this.data()
    ) {

        return this.totalAssignedBySource(
            "available_savings",
            data
        );

    },

    totalAssignedFromCash(
        data = this.data()
    ) {

        return this.totalAssignedBySource(
            "prior_liquidity",
            data
        );

    },

    totalAssigned(
        data = this.data()
    ) {

        return this.round(
            this.totalAssignedFromSavings(
                data
            ) +
            this.totalAssignedFromCash(
                data
            )
        );

    },

    isLiquidityAccount(account) {

        return Boolean(
            account &&
            account.group ===
                "liquidity"
        );

    },

    initialBalanceForAccount(account) {

        return this.round(
            this.number(
                account?.initialBalance
            )
        );

    },

    initialCash(
        data = this.data()
    ) {

        return this.round(
            this.accounts(
                data
            )
                .filter(
                    account =>
                        this.isLiquidityAccount(
                            account
                        )
                )
                .reduce(
                    (
                        total,
                        account
                    ) =>
                        total +
                        this.initialBalanceForAccount(
                            account
                        ),
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

            return String(
                AtlasCalculations
                    .movementKind(
                        movement
                    ) ||
                ""
            );

        }

        return String(
            movement?.kind ||
            movement?.type ||
            ""
        );

    },

    isConfirmedMovement(movement) {

        if (
            movement?.confirmed ===
            false
        ) {

            return false;

        }

        if (
            movement?.pending ===
                true ||
            movement?.proposal ===
                true
        ) {

            return false;

        }

        if (
            [
                "pending",
                "proposed",
                "cancelled",
                "rejected"
            ].includes(
                String(
                    movement?.status ||
                    ""
                )
            )
        ) {

            return false;

        }

        return true;

    },

    isDivestmentMovement(movement) {

        return [
            "investment_withdrawal",
            "investment_sale",
            "investment_redemption",
            "divestment",
            "sell_investment"
        ].includes(
            this.movementKind(
                movement
            )
        );

    },

    divestmentDestinationId(movement) {

        return (
            movement?.toAccountId ||
            movement?.destinationAccountId ||
            movement?.liquidityAccountId ||
            movement?.accountId ||
            ""
        );

    },

    divestmentAmount(movement) {

        return this.round(
            Math.max(
                0,
                this.number(
                    movement?.receivedAmount ??
                    movement?.netAmount ??
                    movement?.amount
                )
            )
        );

    },

    confirmedDivestments(
        data = this.data()
    ) {

        return this.movements(
            data
        )
            .filter(
                movement =>
                    this.isConfirmedMovement(
                        movement
                    )
            )
            .filter(
                movement =>
                    this.isDivestmentMovement(
                        movement
                    )
            )
            .filter(
                movement => {

                    const destination =
                        this.accountById(
                            this.divestmentDestinationId(
                                movement
                            ),
                            data
                        );

                    return this.isLiquidityAccount(
                        destination
                    );

                }
            );

    },

    totalDivestments(
        data = this.data()
    ) {

        return this.round(
            this.confirmedDivestments(
                data
            )
                .reduce(
                    (
                        total,
                        movement
                    ) =>
                        total +
                        this.divestmentAmount(
                            movement
                        ),
                    0
                )
        );

    },

    totalCashFund(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.initialCash(
                    data
                ) +
                this.totalDivestments(
                    data
                )
            )
        );

    },

    availableCash(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.totalCashFund(
                    data
                ) -
                this.totalAssignedFromCash(
                    data
                )
            )
        );

    },

    allocationRecords(
        data = this.data()
    ) {

        const records = [];

        this.goals(
            data
        )
            .forEach(
                goal => {

                    this.contributions(
                        goal
                    )
                        .filter(
                            contribution =>
                                this.isManagedAllocation(
                                    contribution
                                )
                        )
                        .forEach(
                            contribution => {

                                records.push({

                                    goalId:
                                        goal.id,

                                    goalName:
                                        goal.name,

                                    goalType:
                                        goal.type,

                                    goalStatus:
                                        goal.status,

                                    contribution

                                });

                            }
                        );

                }
            );

        return records.sort(
            (
                first,
                second
            ) => {

                const dateDifference =
                    String(
                        second.contribution
                            ?.date ||
                        ""
                    ).localeCompare(
                        String(
                            first.contribution
                                ?.date ||
                            ""
                        )
                    );

                if (
                    dateDifference !==
                    0
                ) {

                    return dateDifference;

                }

                return String(
                    second.contribution
                        ?.createdAt ||
                    ""
                ).localeCompare(
                    String(
                        first.contribution
                            ?.createdAt ||
                        ""
                    )
                );

            }
        );

    },

    allocationRecord(
        goalId,
        contributionId,
        data = this.data()
    ) {

        const goal =
            this.goalById(
                goalId,
                data
            );

        const contribution =
            this.contributions(
                goal
            )
                .find(
                    item =>
                        item.id ===
                        contributionId
                ) || null;

        if (
            !goal ||
            !contribution ||
            !this.isManagedAllocation(
                contribution
            )
        ) {

            return null;

        }

        return {
            goal,
            contribution
        };

    },

    currentMonth() {

        return AtlasCalculations
            .monthKey();

    },

    previousMonth() {

        return AtlasCalculations
            .previousMonthKey(
                this.currentMonth()
            );

    },

    monthSavings(
        data,
        monthKey
    ) {

        return this.round(
            AtlasCalculations
                .financialSummary(
                    data,
                    monthKey
                )
                .monthlySavings
        );

    },

    previousMonthSavings(
        data = this.data()
    ) {

        return this.monthSavings(
            data,
            this.previousMonth()
        );

    },

    provisionalSavings(
        data = this.data()
    ) {

        return this.monthSavings(
            data,
            this.currentMonth()
        );

    },

    closedMonthKeys(
        data = this.data()
    ) {

        const current =
            this.currentMonth();

        return AtlasCalculations
            .allMonthKeys(
                data,
                current
            )
            .filter(
                monthKey =>
                    monthKey <
                    current
            );

    },

    closedSavings(
        data = this.data()
    ) {

        return this.round(
            this.closedMonthKeys(
                data
            )
                .reduce(
                    (
                        total,
                        monthKey
                    ) =>
                        total +
                        this.monthSavings(
                            data,
                            monthKey
                        ),
                    0
                )
        );

    },

    availableClosedSavings(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.closedSavings(
                    data
                ) -
                this.totalAssignedFromSavings(
                    data
                )
            )
        );

    },

    availableForSource(
        source,
        data = this.data()
    ) {

        return this.normalizedSource(
            source
        ) ===
            "prior_liquidity"
                ? this.availableCash(
                    data
                )
                : this.availableClosedSavings(
                    data
                );

    },

    currentAmount(
        goal,
        data = this.data()
    ) {

        if (
            typeof AtlasGoalsProgress !==
                "undefined" &&
            typeof AtlasGoalsProgress
                .calculatedCurrent ===
                "function"
        ) {

            return this.number(
                AtlasGoalsProgress
                    .calculatedCurrent(
                        goal,
                        data
                    )
            );

        }

        return this.number(
            goal?.currentAmount
        );

    },

    allocationCapacity(
        goal,
        restoredAmount = 0,
        data = this.data()
    ) {

        const target =
            Math.max(
                0,
                this.number(
                    goal?.targetAmount
                )
            );

        const current =
            Math.max(
                0,
                this.currentAmount(
                    goal,
                    data
                )
            );

        return this.round(
            Math.max(
                0,
                target -
                current +
                Math.max(
                    0,
                    this.number(
                        restoredAmount
                    )
                )
            )
        );

    },

    formatDate(value) {

        if (!value) {

            return "Sin fecha";

        }

        const date =
            new Date(
                `${value}T12:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric"
            }
        )
            .format(
                date
            )
            .replace(
                ".",
                ""
            );

    },

    metric(
        label,
        value,
        options = {}
    ) {

        const className =
            options.highlight
                ? "highlight"
                : "";

        const extra =
            options.extra
                ? `

                    <small>
                        ${options.extra}
                    </small>

                `
                : "";

        return `

            <div
                class="
                    atlas-goals-allocation-metric
                    ${className}
                "
            >

                <span>
                    ${label}
                </span>

                <strong>
                    ${AtlasGoals.formatCurrency(
                        value
                    )}
                </strong>

                ${extra}

            </div>

        `;

    },

    summaryPanel(
        data = this.data()
    ) {

        const previous =
            this.previousMonthSavings(
                data
            );

        const closed =
            this.closedSavings(
                data
            );

        const provisional =
            this.provisionalSavings(
                data
            );

        const assignedSavings =
            this.totalAssignedFromSavings(
                data
            );

        const availableSavings =
            this.availableClosedSavings(
                data
            );

        const cashFund =
            this.totalCashFund(
                data
            );

        const assignedCash =
            this.totalAssignedFromCash(
                data
            );

        const availableCash =
            this.availableCash(
                data
            );

        const records =
            this.allocationRecords(
                data
            );

        const totalAvailable =
            this.round(
                availableSavings +
                availableCash
            );

        const previousText =
            previous >= 0
                ? `↑ Mes pasado: ${AtlasGoals.formatCurrency(
                    previous
                )}`
                : `↓ Mes pasado: ${AtlasGoals.formatCurrency(
                    previous
                )}`;

        return `

            <section
                class="atlas-goals-allocation-overview"
            >

                <div
                    class="atlas-goals-allocation-main-head"
                >

                    <div>

                        <h2>
                            Asignar fondos
                        </h2>

                        <p>
                            Distribuye tu ahorro cerrado y efectivo
                            disponible entre tus objetivos.
                        </p>

                    </div>

                    <div
                        class="atlas-goals-allocation-total"
                    >

                        <strong>
                            ${AtlasGoals.formatCurrency(
                                totalAvailable
                            )}
                        </strong>

                        <span>
                            Total disponible
                        </span>

                    </div>

                </div>

                <article
                    class="
                        atlas-goals-allocation-source
                        atlas-goals-allocation-savings
                    "
                >

                    <div
                        class="atlas-goals-allocation-source-title"
                    >

                        <div
                            class="atlas-goals-allocation-icon"
                        >
                            🐷
                        </div>

                        <div>

                            <strong>
                                Ahorro disponible
                            </strong>

                            <span>
                                Ahorro positivo generado en meses cerrados.
                            </span>

                        </div>

                        <b>
                            ${AtlasGoals.formatCurrency(
                                availableSavings
                            )}
                        </b>

                    </div>

                    <div
                        class="atlas-goals-allocation-metrics"
                    >

                        ${this.metric(
                            "Ahorro cerrado",
                            closed,
                            {
                                extra:
                                    previousText
                            }
                        )}

                        ${this.metric(
                            "Distribuido",
                            assignedSavings
                        )}

                        ${this.metric(
                            "Disponible",
                            availableSavings,
                            {
                                highlight:
                                    true
                            }
                        )}

                    </div>

                    <button
                        type="button"
                        class="atlas-goals-allocation-open"
                        data-goal-allocation-action="open"
                        data-source="available_savings"
                        ${
                            availableSavings <= 0
                                ? "disabled"
                                : ""
                        }
                    >
                        Distribuir ahorro
                    </button>

                </article>

                <article
                    class="
                        atlas-goals-allocation-source
                        atlas-goals-allocation-cash
                    "
                >

                    <div
                        class="atlas-goals-allocation-source-title"
                    >

                        <div
                            class="atlas-goals-allocation-icon"
                        >
                            👛
                        </div>

                        <div>

                            <strong>
                                Efectivo disponible
                            </strong>

                            <span>
                                Efectivo total disponible para asignar.
                            </span>

                        </div>

                        <b>
                            ${AtlasGoals.formatCurrency(
                                availableCash
                            )}
                        </b>

                    </div>

                    <div
                        class="atlas-goals-allocation-metrics"
                    >

                        ${this.metric(
                            "Base disponible",
                            cashFund,
                            {
                                extra:
                                    "Incluye saldos iniciales y desinversiones"
                            }
                        )}

                        ${this.metric(
                            "Distribuido",
                            assignedCash
                        )}

                        ${this.metric(
                            "Disponible",
                            availableCash,
                            {
                                highlight:
                                    true
                            }
                        )}

                    </div>

                    <button
                        type="button"
                        class="atlas-goals-allocation-open"
                        data-goal-allocation-action="open"
                        data-source="prior_liquidity"
                        ${
                            availableCash <= 0
                                ? "disabled"
                                : ""
                        }
                    >
                        Distribuir efectivo
                    </button>

                </article>

                <div
                    class="atlas-goals-provisional"
                    data-negative="${
                        provisional < 0
                            ? "true"
                            : "false"
                    }"
                >

                    <div>

                        <strong>
                            Ahorro provisional del mes
                        </strong>

                        <span>
                            Estará disponible cuando se cierre el mes.
                        </span>

                    </div>

                    <b>
                        ${AtlasGoals.formatCurrency(
                            provisional
                        )}
                    </b>

                </div>

                ${
                    records.length > 0
                        ? `

                            <button
                                type="button"
                                class="atlas-goals-allocation-manage"
                                data-goal-allocation-action="manage"
                            >
                                <span>
                                    Gestionar distribuciones
                                </span>

                                <b>
                                    ›
                                </b>
                            </button>

                        `
                        : ""
                }

            </section>

        `;

    },

    goalRow(
        goal,
        available,
        source
    ) {

        const capacity =
            this.allocationCapacity(
                goal
            );

        const assigned =
            this.assignedForGoalBySource(
                goal,
                source
            );

        return `

            <article
                class="atlas-goals-allocation-row"
                data-goal-allocation-row
                data-goal-id="${AtlasGoals.escape(
                    goal.id
                )}"
                data-goal-capacity="${capacity}"
                data-available="${available}"
            >

                <div
                    class="atlas-goals-allocation-row-head"
                >

                    <div>

                        <strong>
                            ${AtlasGoals.escape(
                                goal.icon ||
                                AtlasGoals.typeIcon(
                                    goal.type
                                )
                            )}
                            ${AtlasGoals.escape(
                                goal.name
                            )}
                        </strong>

                        <small>
                            Ya distribuido desde
                            ${this.sourceShortLabel(
                                source
                            )}:
                            ${AtlasGoals.formatCurrency(
                                assigned
                            )}
                        </small>

                    </div>

                    <span>
                        Máx.
                        ${AtlasGoals.formatCurrency(
                            capacity
                        )}
                    </span>

                </div>

                <div
                    class="atlas-goals-allocation-methods"
                >

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Cantidad
                        </span>

                        <input
                            type="number"
                            inputmode="decimal"
                            min="0"
                            max="${capacity}"
                            step="0.01"
                            placeholder="0,00"
                            data-goal-allocation-amount
                            ${
                                capacity <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </label>

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            % del disponible
                        </span>

                        <input
                            type="number"
                            inputmode="decimal"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0"
                            data-goal-allocation-percent
                            ${
                                capacity <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </label>

                </div>

                <div
                    class="atlas-goals-allocation-preview"
                >

                    <span>
                        Se asignará
                    </span>

                    <strong
                        data-goal-allocation-row-preview
                    >
                        ${AtlasGoals.formatCurrency(
                            0
                        )}
                    </strong>

                </div>

            </article>

        `;

    },

    openAllocation(
        source =
            "available_savings"
    ) {

        const normalizedSource =
            this.normalizedSource(
                source
            );

        const data =
            this.data();

        const goals =
            this.allocatableGoals(
                data
            );

        const available =
            this.availableForSource(
                normalizedSource,
                data
            );

        const isCash =
            normalizedSource ===
            "prior_liquidity";

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                isCash
                    ? "Distribuir efectivo"
                    : "Distribuir ahorro",
                isCash
                    ? "Asigna tu efectivo disponible entre objetivos."
                    : "Asigna tu ahorro cerrado entre objetivos."
            )}

            <div
                class="atlas-goals-allocation-sheet-summary"
            >

                <span>
                    ${this.sourceLabel(
                        normalizedSource
                    )}
                </span>

                <strong>
                    ${AtlasGoals.formatCurrency(
                        available
                    )}
                </strong>

                <small
                    data-goal-allocation-selected
                >
                    Seleccionado:
                    ${AtlasGoals.formatCurrency(
                        0
                    )}
                    · Restante:
                    ${AtlasGoals.formatCurrency(
                        available
                    )}
                </small>

            </div>

            ${
                goals.length > 0
                    ? `

                        <form
                            class="atlas-settings-form"
                            data-goal-allocation-form
                            data-available="${available}"
                            data-source="${normalizedSource}"
                        >

                            <div
                                class="atlas-goals-allocation-list"
                            >

                                ${goals
                                    .map(
                                        goal =>
                                            this.goalRow(
                                                goal,
                                                available,
                                                normalizedSource
                                            )
                                    )
                                    .join("")}

                            </div>

                            <label
                                class="atlas-settings-field"
                            >

                                <span>
                                    Fecha de distribución
                                </span>

                                <input
                                    type="date"
                                    name="allocationDate"
                                    value="${this.today()}"
                                    required
                                >

                            </label>

                            <label
                                class="atlas-settings-field"
                            >

                                <span>
                                    Nota opcional
                                </span>

                                <input
                                    type="text"
                                    name="allocationNote"
                                    maxlength="160"
                                    placeholder="Añade una nota"
                                >

                            </label>

                            <button
                                type="submit"
                                class="atlas-settings-primary"
                            >
                                Guardar distribución
                            </button>

                            <button
                                type="button"
                                class="atlas-settings-secondary"
                                data-settings-action="close"
                            >
                                Cancelar
                            </button>

                        </form>

                    `
                    : `

                        <div
                            class="atlas-goals-allocation-empty"
                        >

                            No hay objetivos compatibles.

                            <small>
                                Solo se pueden distribuir fondos entre
                                objetivos manuales activos de ahorro,
                                compra futura o fondo de emergencia.
                            </small>

                        </div>

                        <button
                            type="button"
                            class="atlas-settings-secondary"
                            data-settings-action="close"
                        >
                            Cerrar
                        </button>

                    `
            }

        `);

    },

    rowAllocation(row) {

        const available =
            Math.max(
                0,
                this.number(
                    row?.dataset
                        ?.available
                )
            );

        const capacity =
            Math.max(
                0,
                this.number(
                    row?.dataset
                        ?.goalCapacity
                )
            );

        const amountInput =
            row?.querySelector(
                "[data-goal-allocation-amount]"
            );

        const percentInput =
            row?.querySelector(
                "[data-goal-allocation-percent]"
            );

        const amount =
            Math.max(
                0,
                this.number(
                    amountInput?.value
                )
            );

        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    this.number(
                        percentInput?.value
                    )
                )
            );

        const method =
            percent > 0
                ? "percentage"
                : "amount";

        const calculated =
            method ===
                "percentage"
                ? (
                    available *
                    percent
                ) / 100
                : amount;

        return {

            goalId:
                row?.dataset
                    ?.goalId ||
                "",

            method,

            percent:
                method ===
                    "percentage"
                    ? this.round(
                        percent
                    )
                    : null,

            amount:
                this.round(
                    Math.min(
                        capacity,
                        Math.max(
                            0,
                            calculated
                        )
                    )
                )

        };

    },

    selectedAllocations(form) {

        return Array.from(
            form.querySelectorAll(
                "[data-goal-allocation-row]"
            )
        )
            .map(
                row =>
                    this.rowAllocation(
                        row
                    )
            )
            .filter(
                allocation =>
                    allocation.amount >
                    0
            );

    },

    selectedTotal(form) {

        return this.round(
            this.selectedAllocations(
                form
            )
                .reduce(
                    (
                        total,
                        allocation
                    ) =>
                        total +
                        allocation.amount,
                    0
                )
        );

    },

    updateRowPreview(row) {

        if (!row) {

            return;

        }

        const allocation =
            this.rowAllocation(
                row
            );

        const preview =
            row.querySelector(
                "[data-goal-allocation-row-preview]"
            );

        if (preview) {

            preview.textContent =
                AtlasGoals.formatCurrency(
                    allocation.amount
                );

        }

    },

    updateSelectedTotal(form) {

        if (!form) {

            return;

        }

        const selected =
            this.selectedTotal(
                form
            );

        const available =
            this.number(
                form.dataset
                    .available
            );

        const selectedElement =
            document.querySelector(
                "[data-goal-allocation-selected]"
            );

        if (!selectedElement) {

            return;

        }

        selectedElement.textContent =
            (
                `Seleccionado: ` +
                `${AtlasGoals.formatCurrency(
                    selected
                )}` +
                ` · Restante: ` +
                `${AtlasGoals.formatCurrency(
                    Math.max(
                        0,
                        available -
                        selected
                    )
                )}`
            );

        selectedElement.style.color =
            selected >
                available +
                0.001
                ? "var(--color-danger)"
                : "var(--color-text-muted)";

    },

    updateAllocationInput(input) {

        const row =
            input.closest(
                "[data-goal-allocation-row]"
            );

        if (!row) {

            return;

        }

        const amountInput =
            row.querySelector(
                "[data-goal-allocation-amount]"
            );

        const percentInput =
            row.querySelector(
                "[data-goal-allocation-percent]"
            );

        if (
            input.matches(
                "[data-goal-allocation-amount]"
            ) &&
            this.number(
                input.value
            ) > 0 &&
            percentInput
        ) {

            percentInput.value =
                "";

        }

        if (
            input.matches(
                "[data-goal-allocation-percent]"
            ) &&
            this.number(
                input.value
            ) > 0 &&
            amountInput
        ) {

            amountInput.value =
                "";

        }

        if (
            percentInput &&
            this.number(
                percentInput.value
            ) > 100
        ) {

            percentInput.value =
                100;

        }

        const capacity =
            this.number(
                row.dataset
                    .goalCapacity
            );

        if (
            amountInput &&
            this.number(
                amountInput.value
            ) >
                capacity
        ) {

            amountInput.value =
                capacity;

        }

        this.updateRowPreview(
            row
        );

        this.updateSelectedTotal(
            row.closest(
                "[data-goal-allocation-form]"
            )
        );

    },

    recalculateGoalStatus(goal) {

        if (
            [
                "archived",
                "cancelled"
            ].includes(
                goal.status
            )
        ) {

            return;

        }

        const current =
            Math.max(
                0,
                this.number(
                    goal.currentAmount
                )
            );

        const target =
            Math.max(
                0,
                this.number(
                    goal.targetAmount
                )
            );

        if (
            target > 0 &&
            current >=
                target
        ) {

            goal.status =
                "completed";

            goal.completedAt =
                goal.completedAt ||
                this.now();

            return;

        }

        if (
            goal.status ===
            "completed"
        ) {

            goal.status =
                "active";

            goal.completedAt =
                null;

        }

    },

    applyContributionEffect(
        goal,
        effect
    ) {

        if (
            !this.isManualGoal(
                goal
            )
        ) {

            return;

        }

        goal.currentAmount =
            this.round(
                Math.max(
                    0,
                    this.number(
                        goal.currentAmount
                    ) +
                    this.number(
                        effect
                    )
                )
            );

        this.recalculateGoalStatus(
            goal
        );

    },

    saveAllocation(form) {

        const data =
            this.data();

        const source =
            this.normalizedSource(
                form.dataset
                    .source ||
                "available_savings"
            );

        const available =
            this.availableForSource(
                source,
                data
            );

        const allocations =
            this.selectedAllocations(
                form
            );

        const selected =
            this.round(
                allocations.reduce(
                    (
                        total,
                        allocation
                    ) =>
                        total +
                        allocation.amount,
                    0
                )
            );

        if (
            allocations.length ===
                0 ||
            selected <= 0
        ) {

            AtlasUI.toast(
                "Introduce al menos una cantidad o porcentaje."
            );

            return;

        }

        if (
            selected >
                available +
                0.001
        ) {

            AtlasUI.toast(
                "La distribución supera el importe disponible."
            );

            return;

        }

        const values =
            new FormData(
                form
            );

        const date =
            String(
                values.get(
                    "allocationDate"
                ) ||
                ""
            );

        const note =
            String(
                values.get(
                    "allocationNote"
                ) ||
                ""
            ).trim();

        if (!date) {

            AtlasUI.toast(
                "Selecciona una fecha."
            );

            return;

        }

        const updatedData =
            this.clone(
                data
            );

        const batchId =
            this.createId(
                "goal_allocation_batch"
            );

        for (
            const allocation of allocations
        ) {

            const goal =
                this.goalById(
                    allocation.goalId,
                    updatedData
                );

            if (
                !this.isAllocatableGoal(
                    goal
                )
            ) {

                AtlasUI.toast(
                    "Uno de los objetivos ya no admite distribuciones."
                );

                return;

            }

            const capacity =
                this.allocationCapacity(
                    goal,
                    0,
                    updatedData
                );

            if (
                allocation.amount >
                    capacity +
                    0.001
            ) {

                AtlasUI.toast(
                    `La cantidad supera el máximo de “${goal.name}”.`
                );

                return;

            }

            if (
                !Array.isArray(
                    goal.contributions
                )
            ) {

                goal.contributions =
                    [];

            }

            const contribution = {

                id:
                    this.createId(
                        "goal_contribution"
                    ),

                allocationBatchId:
                    batchId,

                type:
                    "contribution",

                amount:
                    allocation.amount,

                date,

                note,

                source,

                allocationMethod:
                    allocation.method,

                allocationPercent:
                    allocation.percent,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()

            };

            goal.contributions.push(
                contribution
            );

            this.applyContributionEffect(
                goal,
                contribution.amount
            );

            goal.updatedAt =
                this.now();

        }

        if (
            !AtlasStorage.save(
                updatedData
            )
        ) {

            AtlasUI.toast(
                "No se pudo guardar la distribución."
            );

            return;

        }

        this.finishUpdate(
            "Distribución guardada."
        );

    },

    allocationRecordRow(record) {

        const contribution =
            record.contribution;

        const effect =
            this.contributionEffect(
                contribution
            );

        return `

            <article
                class="atlas-goals-allocation-record"
            >

                <div>

                    <span
                        class="atlas-goals-allocation-record-source"
                        data-source="${AtlasGoals.escape(
                            this.normalizedSource(
                                contribution.source
                            )
                        )}"
                    >
                        ${AtlasGoals.escape(
                            this.sourceLabel(
                                contribution.source
                            )
                        )}
                    </span>

                    <strong>
                        ${AtlasGoals.escape(
                            record.goalName
                        )}
                    </strong>

                    <small>
                        ${AtlasGoals.escape(
                            this.formatDate(
                                contribution.date
                            )
                        )}
                    </small>

                    ${
                        contribution.note
                            ? `

                                <p>
                                    ${AtlasGoals.escape(
                                        contribution.note
                                    )}
                                </p>

                            `
                            : ""
                    }

                </div>

                <div
                    class="atlas-goals-allocation-record-actions"
                >

                    <strong>
                        ${
                            effect >= 0
                                ? "+"
                                : "−"
                        }${AtlasGoals.formatCurrency(
                            Math.abs(
                                effect
                            )
                        )}
                    </strong>

                    <button
                        type="button"
                        data-goal-allocation-action="edit"
                        data-goal-id="${AtlasGoals.escape(
                            record.goalId
                        )}"
                        data-contribution-id="${AtlasGoals.escape(
                            contribution.id
                        )}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="danger"
                        data-goal-allocation-action="delete"
                        data-goal-id="${AtlasGoals.escape(
                            record.goalId
                        )}"
                        data-contribution-id="${AtlasGoals.escape(
                            contribution.id
                        )}"
                    >
                        Eliminar
                    </button>

                </div>

            </article>

        `;

    },

    openManage() {

        const records =
            this.allocationRecords();

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Gestionar distribuciones",
                "Edita, mueve o elimina los fondos distribuidos."
            )}

            <div
                class="atlas-goals-allocation-manage-summary"
            >

                <div>

                    <small>
                        Ahorro distribuido
                    </small>

                    <strong>
                        ${AtlasGoals.formatCurrency(
                            this.totalAssignedFromSavings()
                        )}
                    </strong>

                </div>

                <div>

                    <small>
                        Efectivo distribuido
                    </small>

                    <strong>
                        ${AtlasGoals.formatCurrency(
                            this.totalAssignedFromCash()
                        )}
                    </strong>

                </div>

            </div>

            ${
                records.length > 0
                    ? `

                        <div
                            class="atlas-goals-allocation-records"
                        >

                            ${records
                                .map(
                                    record =>
                                        this.allocationRecordRow(
                                            record
                                        )
                                )
                                .join("")}

                        </div>

                    `
                    : `

                        <div
                            class="atlas-goals-allocation-empty"
                        >
                            No hay distribuciones guardadas.
                        </div>

                    `
            }

            <button
                type="button"
                class="atlas-settings-secondary"
                data-settings-action="close"
            >
                Cerrar
            </button>

        `);

    },

    goalOptions(
        selectedId,
        restoredAmount,
        data = this.data()
    ) {

        return this.allocatableGoals(
            data
        )
            .map(
                goal => `

                    <option
                        value="${AtlasGoals.escape(
                            goal.id
                        )}"
                        ${
                            goal.id ===
                            selectedId
                                ? "selected"
                                : ""
                        }
                    >
                        ${AtlasGoals.escape(
                            goal.name
                        )}
                        · Máx.
                        ${AtlasGoals.formatCurrency(
                            this.allocationCapacity(
                                goal,
                                goal.id ===
                                    selectedId
                                    ? restoredAmount
                                    : 0,
                                data
                            )
                        )}
                    </option>

                `
            )
            .join("");

    },

    openEdit(
        goalId,
        contributionId
    ) {

        const record =
            this.allocationRecord(
                goalId,
                contributionId
            );

        if (!record) {

            AtlasUI.toast(
                "No se encontró la distribución."
            );

            return;

        }

        const contribution =
            record.contribution;

        const amount =
            Math.max(
                0,
                this.number(
                    contribution.amount
                )
            );

        const originalSource =
            this.normalizedSource(
                contribution.source
            );

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Editar distribución",
                "Modifica la fuente, el importe o el objetivo."
            )}

            <form
                class="atlas-settings-form"
                data-goal-allocation-edit-form
                data-original-goal-id="${AtlasGoals.escape(
                    goalId
                )}"
                data-contribution-id="${AtlasGoals.escape(
                    contributionId
                )}"
                data-original-source="${AtlasGoals.escape(
                    originalSource
                )}"
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Fuente
                    </span>

                    <select
                        name="allocationSource"
                        required
                    >

                        <option
                            value="available_savings"
                            ${
                                originalSource ===
                                    "available_savings"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Ahorro disponible
                        </option>

                        <option
                            value="prior_liquidity"
                            ${
                                originalSource ===
                                    "prior_liquidity"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Efectivo disponible
                        </option>

                    </select>

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Objetivo
                    </span>

                    <select
                        name="targetGoalId"
                        required
                    >
                        ${this.goalOptions(
                            goalId,
                            amount
                        )}
                    </select>

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Importe
                    </span>

                    <input
                        type="number"
                        inputmode="decimal"
                        min="0.01"
                        step="0.01"
                        name="allocationAmount"
                        value="${amount}"
                        required
                    >

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Fecha
                    </span>

                    <input
                        type="date"
                        name="allocationDate"
                        value="${AtlasGoals.escape(
                            contribution.date ||
                            this.today()
                        )}"
                        required
                    >

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Nota opcional
                    </span>

                    <input
                        type="text"
                        name="allocationNote"
                        maxlength="160"
                        value="${AtlasGoals.escape(
                            contribution.note ||
                            ""
                        )}"
                    >

                </label>

                <button
                    type="submit"
                    class="atlas-settings-primary"
                >
                    Guardar cambios
                </button>

                <button
                    type="button"
                    class="atlas-goal-danger"
                    data-goal-allocation-action="delete"
                    data-goal-id="${AtlasGoals.escape(
                        goalId
                    )}"
                    data-contribution-id="${AtlasGoals.escape(
                        contributionId
                    )}"
                >
                    Eliminar distribución
                </button>

                <button
                    type="button"
                    class="atlas-settings-secondary"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    removeContributionFromGoal(
        goal,
        contributionId
    ) {

        const index =
            this.contributions(
                goal
            )
                .findIndex(
                    contribution =>
                        contribution.id ===
                        contributionId
                );

        if (
            index < 0
        ) {

            return null;

        }

        const contribution =
            goal.contributions[
                index
            ];

        goal.contributions.splice(
            index,
            1
        );

        this.applyContributionEffect(
            goal,
            -this.contributionEffect(
                contribution
            )
        );

        goal.updatedAt =
            this.now();

        return contribution;

    },

    saveEdit(form) {

        const values =
            new FormData(
                form
            );

        const originalGoalId =
            form.dataset
                .originalGoalId;

        const contributionId =
            form.dataset
                .contributionId;

        const originalSource =
            this.normalizedSource(
                form.dataset
                    .originalSource
            );

        const targetSource =
            this.normalizedSource(
                String(
                    values.get(
                        "allocationSource"
                    ) ||
                    originalSource
                )
            );

        const targetGoalId =
            String(
                values.get(
                    "targetGoalId"
                ) ||
                ""
            );

        const amount =
            this.round(
                Math.max(
                    0,
                    this.number(
                        values.get(
                            "allocationAmount"
                        )
                    )
                )
            );

        const date =
            String(
                values.get(
                    "allocationDate"
                ) ||
                ""
            );

        const note =
            String(
                values.get(
                    "allocationNote"
                ) ||
                ""
            ).trim();

        if (
            !targetGoalId ||
            amount <= 0 ||
            !date
        ) {

            AtlasUI.toast(
                "Completa los datos de la distribución."
            );

            return;

        }

        const data =
            this.data();

        const originalRecord =
            this.allocationRecord(
                originalGoalId,
                contributionId,
                data
            );

        if (!originalRecord) {

            AtlasUI.toast(
                "No se encontró la distribución."
            );

            return;

        }

        const originalAmount =
            Math.max(
                0,
                this.number(
                    originalRecord
                        .contribution
                        .amount
                )
            );

        const availableAfterRelease =
            this.round(
                this.availableForSource(
                    targetSource,
                    data
                ) +
                (
                    targetSource ===
                        originalSource
                        ? originalAmount
                        : 0
                )
            );

        if (
            amount >
                availableAfterRelease +
                0.001
        ) {

            AtlasUI.toast(
                "El importe supera el disponible."
            );

            return;

        }

        const target =
            this.goalById(
                targetGoalId,
                data
            );

        if (
            !this.isAllocatableGoal(
                target
            )
        ) {

            AtlasUI.toast(
                "El objetivo seleccionado no admite distribuciones."
            );

            return;

        }

        const restoredAmount =
            targetGoalId ===
                originalGoalId
                ? originalAmount
                : 0;

        const capacity =
            this.allocationCapacity(
                target,
                restoredAmount,
                data
            );

        if (
            amount >
                capacity +
                0.001
        ) {

            AtlasUI.toast(
                "El importe supera lo pendiente del objetivo."
            );

            return;

        }

        const updatedData =
            this.clone(
                data
            );

        const originalGoal =
            this.goalById(
                originalGoalId,
                updatedData
            );

        const removed =
            this.removeContributionFromGoal(
                originalGoal,
                contributionId
            );

        if (!removed) {

            AtlasUI.toast(
                "No se pudo actualizar la distribución."
            );

            return;

        }

        const targetGoal =
            this.goalById(
                targetGoalId,
                updatedData
            );

        if (
            !Array.isArray(
                targetGoal.contributions
            )
        ) {

            targetGoal.contributions =
                [];

        }

        const updatedContribution = {

            ...removed,

            amount,

            date,

            note,

            source:
                targetSource,

            allocationMethod:
                "amount",

            allocationPercent:
                null,

            updatedAt:
                this.now()

        };

        targetGoal.contributions.push(
            updatedContribution
        );

        this.applyContributionEffect(
            targetGoal,
            amount
        );

        targetGoal.updatedAt =
            this.now();

        if (
            !AtlasStorage.save(
                updatedData
            )
        ) {

            AtlasUI.toast(
                "No se pudo guardar la distribución."
            );

            return;

        }

        this.finishUpdate(
            "Distribución actualizada."
        );

    },

    deleteAllocation(
        goalId,
        contributionId
    ) {

        const record =
            this.allocationRecord(
                goalId,
                contributionId
            );

        if (!record) {

            return;

        }

        const confirmed =
            window.confirm(
                "¿Eliminar esta distribución?"
            );

        if (!confirmed) {

            return;

        }

        const updatedData =
            this.clone(
                this.data()
            );

        const goal =
            this.goalById(
                goalId,
                updatedData
            );

        const removed =
            this.removeContributionFromGoal(
                goal,
                contributionId
            );

        if (!removed) {

            AtlasUI.toast(
                "No se pudo eliminar la distribución."
            );

            return;

        }

        if (
            !AtlasStorage.save(
                updatedData
            )
        ) {

            AtlasUI.toast(
                "No se pudo eliminar la distribución."
            );

            return;

        }

        this.finishUpdate(
            "Distribución eliminada."
        );

    },

    finishUpdate(message) {

        AtlasGoals.data =
            AtlasStorage.load();

        AtlasSettings.close();

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

        AtlasUI.toast(
            message
        );

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-goals-allocation-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-goals-allocation-styles";

        style.textContent = `

            .atlas-goals-allocation-overview {
                display: grid;
                gap: 14px;
            }

            .atlas-goals-allocation-main-head {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 14px;
                padding: 4px 1px 2px;
            }

            .atlas-goals-allocation-main-head h2 {
                margin: 0;
                color: #f7f8fc;
                font-size: 22px;
            }

            .atlas-goals-allocation-main-head p {
                max-width: 240px;
                margin: 7px 0 0;
                color: #98a2bb;
                font-size: 12px;
                line-height: 1.45;
            }

            .atlas-goals-allocation-total {
                flex: 0 0 auto;
                text-align: right;
            }

            .atlas-goals-allocation-total strong,
            .atlas-goals-allocation-total span {
                display: block;
            }

            .atlas-goals-allocation-total strong {
                color: #4da3ff;
                font-size: 23px;
                line-height: 1;
            }

            .atlas-goals-allocation-total span {
                margin-top: 6px;
                color: #98a2bb;
                font-size: 9px;
            }

            .atlas-goals-allocation-source {
                padding: 15px;
                border: 1px solid rgba(77, 163, 255, 0.34);
                border-radius: 21px;
                background:
                    linear-gradient(
                        145deg,
                        rgba(77, 163, 255, 0.07),
                        rgba(25, 36, 58, 0.96)
                    );
            }

            .atlas-goals-allocation-cash {
                border-color: rgba(82, 207, 139, 0.34);
                background:
                    linear-gradient(
                        145deg,
                        rgba(82, 207, 139, 0.07),
                        rgba(25, 36, 58, 0.96)
                    );
            }

            .atlas-goals-allocation-source-title {
                display: grid;
                grid-template-columns:
                    42px
                    minmax(0, 1fr)
                    auto;
                align-items: center;
                gap: 11px;
            }

            .atlas-goals-allocation-icon {
                width: 42px;
                height: 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 14px;
                background: rgba(77, 163, 255, 0.12);
                font-size: 20px;
            }

            .atlas-goals-allocation-cash
            .atlas-goals-allocation-icon {
                background: rgba(82, 207, 139, 0.12);
            }

            .atlas-goals-allocation-source-title strong,
            .atlas-goals-allocation-source-title span {
                display: block;
            }

            .atlas-goals-allocation-source-title strong {
                color: #f7f8fc;
                font-size: 15px;
            }

            .atlas-goals-allocation-source-title span {
                margin-top: 4px;
                color: #98a2bb;
                font-size: 10px;
                line-height: 1.4;
            }

            .atlas-goals-allocation-source-title > b {
                color: #4da3ff;
                font-size: 21px;
                white-space: nowrap;
            }

            .atlas-goals-allocation-cash
            .atlas-goals-allocation-source-title > b {
                color: #67db9d;
            }

            .atlas-goals-allocation-metrics {
                display: grid;
                grid-template-columns:
                    repeat(3, minmax(0, 1fr));
                gap: 1px;
                margin-top: 14px;
                overflow: hidden;
                border: 1px solid rgba(145, 164, 202, 0.12);
                border-radius: 16px;
                background: rgba(145, 164, 202, 0.1);
            }

            .atlas-goals-allocation-metric {
                min-width: 0;
                padding: 12px 8px;
                background: #1d2940;
                text-align: center;
            }

            .atlas-goals-allocation-metric span,
            .atlas-goals-allocation-metric strong,
            .atlas-goals-allocation-metric small {
                display: block;
            }

            .atlas-goals-allocation-metric span {
                color: #98a2bb;
                font-size: 9px;
            }

            .atlas-goals-allocation-metric strong {
                margin-top: 6px;
                overflow-wrap: anywhere;
                color: #f7f8fc;
                font-size: 14px;
            }

            .atlas-goals-allocation-metric small {
                margin-top: 6px;
                color: #98a2bb;
                font-size: 7px;
                line-height: 1.35;
            }

            .atlas-goals-allocation-metric.highlight strong {
                color: #4da3ff;
            }

            .atlas-goals-allocation-cash
            .atlas-goals-allocation-metric.highlight strong {
                color: #67db9d;
            }

            .atlas-goals-allocation-open {
                width: 100%;
                min-height: 46px;
                margin-top: 13px;
                border: 1px solid rgba(77, 163, 255, 0.55);
                border-radius: 15px;
                background: rgba(77, 163, 255, 0.18);
                color: #ffffff;
                font-size: 13px;
                font-weight: 800;
            }

            .atlas-goals-allocation-cash
            .atlas-goals-allocation-open {
                border-color: rgba(82, 207, 139, 0.48);
                background: rgba(82, 207, 139, 0.13);
            }

            .atlas-goals-allocation-open:disabled {
                opacity: 0.42;
            }

            .atlas-goals-provisional {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 13px 15px;
                border: 1px solid rgba(145, 164, 202, 0.16);
                border-radius: 17px;
                background: #19243a;
            }

            .atlas-goals-provisional strong,
            .atlas-goals-provisional span {
                display: block;
            }

            .atlas-goals-provisional strong {
                color: #cbd3e6;
                font-size: 12px;
            }

            .atlas-goals-provisional span {
                margin-top: 4px;
                color: #98a2bb;
                font-size: 9px;
            }

            .atlas-goals-provisional > b {
                color: #4da3ff;
                font-size: 15px;
                white-space: nowrap;
            }

            .atlas-goals-provisional[data-negative="true"] > b {
                color: var(--color-danger);
            }

            .atlas-goals-allocation-manage {
                width: 100%;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                border: 1px solid rgba(77, 163, 255, 0.26);
                border-radius: 16px;
                background: rgba(77, 163, 255, 0.06);
                color: #f7f8fc;
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-goals-allocation-manage b {
                color: #79baff;
                font-size: 24px;
                font-weight: 400;
            }

            .atlas-goals-allocation-sheet-summary {
                padding: 15px;
                margin-bottom: 14px;
                border: 1px solid rgba(77, 163, 255, 0.22);
                border-radius: 17px;
                background: rgba(77, 163, 255, 0.075);
            }

            .atlas-goals-allocation-sheet-summary span,
            .atlas-goals-allocation-sheet-summary small {
                display: block;
                color: var(--color-text-muted);
                font-size: 10px;
            }

            .atlas-goals-allocation-sheet-summary strong {
                display: block;
                margin-top: 6px;
                color: var(--color-primary);
                font-size: 22px;
            }

            .atlas-goals-allocation-sheet-summary small {
                margin-top: 7px;
                line-height: 1.4;
            }

            .atlas-goals-allocation-list,
            .atlas-goals-allocation-records {
                display: grid;
                gap: 11px;
            }

            .atlas-goals-allocation-row {
                padding: 14px;
                border: 1px solid rgba(145, 164, 202, 0.15);
                border-radius: 17px;
                background: rgba(255, 255, 255, 0.025);
            }

            .atlas-goals-allocation-row-head {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 12px;
            }

            .atlas-goals-allocation-row-head strong,
            .atlas-goals-allocation-row-head small {
                display: block;
            }

            .atlas-goals-allocation-row-head strong {
                font-size: 12px;
            }

            .atlas-goals-allocation-row-head small {
                margin-top: 5px;
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goals-allocation-row-head > span {
                color: var(--color-primary);
                font-size: 9px;
                white-space: nowrap;
            }

            .atlas-goals-allocation-methods,
            .atlas-goals-allocation-manage-summary {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 9px;
            }

            .atlas-goals-allocation-preview {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                padding: 10px;
                border-radius: 12px;
                background: rgba(77, 163, 255, 0.065);
            }

            .atlas-goals-allocation-preview span {
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goals-allocation-preview strong {
                color: var(--color-primary);
                font-size: 13px;
            }

            .atlas-goals-allocation-manage-summary {
                margin-bottom: 14px;
            }

            .atlas-goals-allocation-manage-summary > div {
                padding: 13px;
                border-radius: 15px;
                background: rgba(255, 255, 255, 0.035);
            }

            .atlas-goals-allocation-manage-summary small,
            .atlas-goals-allocation-manage-summary strong {
                display: block;
            }

            .atlas-goals-allocation-manage-summary small {
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goals-allocation-manage-summary strong {
                margin-top: 5px;
                font-size: 15px;
            }

            .atlas-goals-allocation-record {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 13px;
                padding: 13px;
                border: 1px solid rgba(145, 164, 202, 0.12);
                border-radius: 15px;
                background: rgba(255, 255, 255, 0.025);
            }

            .atlas-goals-allocation-record strong,
            .atlas-goals-allocation-record small {
                display: block;
            }

            .atlas-goals-allocation-record small {
                margin-top: 4px;
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goals-allocation-record p {
                margin: 6px 0 0;
                color: var(--color-text-muted);
                font-size: 9px;
            }

            .atlas-goals-allocation-record-source {
                display: inline-flex;
                margin-bottom: 7px;
                padding: 4px 8px;
                border-radius: 99px;
                background: rgba(77, 163, 255, 0.1);
                color: var(--color-primary);
                font-size: 8px;
                font-weight: 800;
            }

            .atlas-goals-allocation-record-source[data-source="prior_liquidity"] {
                background: rgba(82, 207, 139, 0.1);
                color: #67db9d;
            }

            .atlas-goals-allocation-record-actions {
                flex: 0 0 auto;
                text-align: right;
            }

            .atlas-goals-allocation-record-actions > strong {
                font-size: 13px;
            }

            .atlas-goals-allocation-record-actions button {
                display: block;
                margin: 8px 0 0 auto;
                padding: 0;
                border: 0;
                background: transparent;
                color: var(--color-primary);
                font-size: 9px;
            }

            .atlas-goals-allocation-record-actions button.danger {
                color: var(--color-danger);
            }

            .atlas-goals-allocation-empty {
                padding: 28px 12px;
                color: var(--color-text-muted);
                text-align: center;
                line-height: 1.5;
            }

            .atlas-goals-allocation-empty small {
                display: block;
                margin-top: 7px;
                font-size: 9px;
            }

            @media (max-width: 380px) {

                .atlas-goals-allocation-main-head {
                    align-items: flex-end;
                }

                .atlas-goals-allocation-main-head p {
                    max-width: 195px;
                }

                .atlas-goals-allocation-source-title {
                    grid-template-columns:
                        38px
                        minmax(0, 1fr)
                        auto;
                    gap: 8px;
                }

                .atlas-goals-allocation-icon {
                    width: 38px;
                    height: 38px;
                }

                .atlas-goals-allocation-source-title > b {
                    font-size: 18px;
                }

                .atlas-goals-allocation-metric {
                    padding:
                        11px
                        5px;
                }

                .atlas-goals-allocation-metric strong {
                    font-size: 12px;
                }

            }

            @media (max-width: 335px) {

                .atlas-goals-allocation-source-title {
                    grid-template-columns:
                        38px
                        minmax(0, 1fr);
                }

                .atlas-goals-allocation-source-title > b {
                    grid-column:
                        2;
                    justify-self:
                        start;
                }

                .atlas-goals-allocation-methods,
                .atlas-goals-allocation-manage-summary {
                    grid-template-columns:
                        minmax(0, 1fr);
                }

                .atlas-goals-allocation-record {
                    flex-direction: column;
                }

                .atlas-goals-allocation-record-actions {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    text-align: left;
                }

                .atlas-goals-allocation-record-actions button {
                    display: inline-block;
                    margin: 0;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-goal-allocation-action]"
                    );

                if (!button) {

                    return;

                }

                event.preventDefault();

                event.stopPropagation();

                const action =
                    button.dataset
                        .goalAllocationAction;

                if (
                    action ===
                    "open"
                ) {

                    this.openAllocation(
                        button.dataset
                            .source ||
                        "available_savings"
                    );

                    return;

                }

                if (
                    action ===
                    "manage"
                ) {

                    this.openManage();

                    return;

                }

                if (
                    action ===
                    "edit"
                ) {

                    this.openEdit(
                        button.dataset
                            .goalId,
                        button.dataset
                            .contributionId
                    );

                    return;

                }

                if (
                    action ===
                    "delete"
                ) {

                    this.deleteAllocation(
                        button.dataset
                            .goalId,
                        button.dataset
                            .contributionId
                    );

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const input =
                    event.target.closest(
                        [
                            "[data-goal-allocation-amount]",
                            "[data-goal-allocation-percent]"
                        ].join(",")
                    );

                if (!input) {

                    return;

                }

                this.updateAllocationInput(
                    input
                );

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const allocationForm =
                    event.target.closest(
                        "[data-goal-allocation-form]"
                    );

                if (allocationForm) {

                    event.preventDefault();

                    this.saveAllocation(
                        allocationForm
                    );

                    return;

                }

                const editForm =
                    event.target.closest(
                        "[data-goal-allocation-edit-form]"
                    );

                if (editForm) {

                    event.preventDefault();

                    this.saveEdit(
                        editForm
                    );

                }

            }
        );

    },

    init() {

        if (
            this.initialized ||
            typeof AtlasGoals ===
                "undefined" ||
            typeof AtlasCalculations ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        this.installStyles();

        this.bindEvents();

    }

};

AtlasGoalsAllocation.init();

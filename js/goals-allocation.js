/* ==========================================================
   ATLAS
   goals-allocation.js
   Distribución centralizada del ahorro y liquidez previa
========================================================== */

const AtlasGoalsAllocation = {

    initialized:
        false,

    originalRender:
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

    createId(prefix = "goal_allocation") {

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
                .slice(2, 8)
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

    goalById(
        goalId,
        data = this.data()
    ) {

        return this.goals(data)
            .find(
                goal =>
                    goal.id ===
                    goalId
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

        return (
            this.progressMode(
                goal
            ) ===
            "manual"
        );

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

        return this.goals(data)
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

    isLiquidityAllocation(contribution) {

        return contribution?.source ===
            "prior_liquidity";

    },

    isManagedAllocation(contribution) {

        return (
            this.isSavingsAllocation(
                contribution
            ) ||
            this.isLiquidityAllocation(
                contribution
            )
        );

    },

    sourceLabel(source) {

        return source ===
            "prior_liquidity"
                ? "Liquidez previa"
                : "Ahorro cerrado";

    },

    sourceShortLabel(source) {

        return source ===
            "prior_liquidity"
                ? "Liquidez"
                : "Ahorro";

    },

    assignedForGoalBySource(
        goal,
        source
    ) {

        return this.round(
            this.contributions(goal)
                .filter(
                    contribution =>
                        contribution.source ===
                        source
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

    assignedFromSavingsForGoal(goal) {

        return this.assignedForGoalBySource(
            goal,
            "available_savings"
        );

    },

    assignedFromLiquidityForGoal(goal) {

        return this.assignedForGoalBySource(
            goal,
            "prior_liquidity"
        );

    },

    totalAssignedBySource(
        source,
        data = this.data()
    ) {

        return this.round(
            this.goals(data)
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

    totalAssignedFromLiquidity(
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
            this.totalAssignedFromLiquidity(
                data
            )
        );

    },

    liquidityConfiguration(
        data = this.data()
    ) {

        const configuration =
            data?.goalLiquidityPool;

        return configuration &&
            typeof configuration ===
                "object"
                ? configuration
                : {};
    },

    declaredPriorLiquidity(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.number(
                    this.liquidityConfiguration(
                        data
                    ).declaredAmount
                )
            )
        );

    },

    totalRealLiquidity(
        data = this.data()
    ) {

        if (
            typeof AtlasCalculations !==
                "undefined" &&
            typeof AtlasCalculations
                .totalLiquidity ===
                "function"
        ) {

            return this.round(
                AtlasCalculations
                    .totalLiquidity(
                        data
                    )
            );

        }

        return this.round(
            (
                Array.isArray(
                    data?.accounts
                )
                    ? data.accounts
                    : []
            )
                .filter(
                    account =>
                        account.group ===
                        "liquidity"
                )
                .reduce(
                    (
                        total,
                        account
                    ) =>
                        total +
                        this.number(
                            account.balance
                        ),
                    0
                )
        );

    },

    supportedPriorLiquidity(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                Math.min(
                    this.declaredPriorLiquidity(
                        data
                    ),
                    Math.max(
                        0,
                        this.totalRealLiquidity(
                            data
                        )
                    )
                )
            )
        );

    },

    availablePriorLiquidity(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.supportedPriorLiquidity(
                    data
                ) -
                this.totalAssignedFromLiquidity(
                    data
                )
            )
        );

    },

    liquidityWithoutSupport(
        data = this.data()
    ) {

        return this.round(
            Math.max(
                0,
                this.totalAssignedFromLiquidity(
                    data
                ) -
                Math.max(
                    0,
                    this.totalRealLiquidity(
                        data
                    )
                )
            )
        );

    },

    allocationRecords(
        data = this.data()
    ) {

        const records = [];

        this.goals(data)
            .forEach(
                goal => {

                    this.contributions(goal)
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
            this.contributions(goal)
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
            this.closedMonthKeys(data)
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

        return source ===
            "prior_liquidity"
                ? this.availablePriorLiquidity(
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
            .format(date)
            .replace(
                ".",
                ""
            );

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

        const declaredLiquidity =
            this.declaredPriorLiquidity(
                data
            );

        const realLiquidity =
            this.totalRealLiquidity(
                data
            );

        const assignedLiquidity =
            this.totalAssignedFromLiquidity(
                data
            );

        const availableLiquidity =
            this.availablePriorLiquidity(
                data
            );

        const unsupportedLiquidity =
            this.liquidityWithoutSupport(
                data
            );

        const records =
            this.allocationRecords(
                data
            );

        return `

            <section
                class="
                    panel
                    atlas-goals-allocation-panel
                "
            >

                <div
                    class="atlas-goals-allocation-head"
                >

                    <div>

                        <h2>
                            Asignar fondos
                        </h2>

                        <p>
                            Distribuye ahorro cerrado o una parte
                            declarada de tu liquidez previa.
                        </p>

                    </div>

                    <span>
                        ${AtlasGoals.formatCurrency(
                            availableSavings +
                            availableLiquidity
                        )}
                    </span>

                </div>

                <div
                    class="atlas-goals-allocation-source-card"
                >

                    <div
                        class="atlas-goals-allocation-source-head"
                    >

                        <div>

                            <strong>
                                Ahorro cerrado
                            </strong>

                            <small>
                                Ahorro generado en meses anteriores.
                            </small>

                        </div>

                        <span>
                            ${AtlasGoals.formatCurrency(
                                availableSavings
                            )}
                        </span>

                    </div>

                    <div
                        class="atlas-goals-allocation-facts"
                    >

                        <div>

                            <small>
                                Mes pasado
                            </small>

                            <strong
                                style="
                                    color:${
                                        previous >= 0
                                            ? "var(--color-success)"
                                            : "var(--color-danger)"
                                    };
                                "
                            >
                                ${AtlasGoals.formatCurrency(
                                    previous
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Ahorro cerrado
                            </small>

                            <strong>
                                ${AtlasGoals.formatCurrency(
                                    closed
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Distribuido
                            </small>

                            <strong>
                                ${AtlasGoals.formatCurrency(
                                    assignedSavings
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Disponible
                            </small>

                            <strong
                                style="
                                    color:
                                        var(
                                            --color-primary
                                        );
                                "
                            >
                                ${AtlasGoals.formatCurrency(
                                    availableSavings
                                )}
                            </strong>

                        </div>

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

                </div>

                <div
                    class="
                        atlas-goals-allocation-source-card
                        atlas-goals-liquidity-card
                    "
                >

                    <div
                        class="atlas-goals-allocation-source-head"
                    >

                        <div>

                            <strong>
                                Liquidez previa
                            </strong>

                            <small>
                                Dinero que ya tenías y decides reservar
                                para objetivos.
                            </small>

                        </div>

                        <span>
                            ${AtlasGoals.formatCurrency(
                                availableLiquidity
                            )}
                        </span>

                    </div>

                    <div
                        class="atlas-goals-allocation-facts"
                    >

                        <div>

                            <small>
                                Liquidez real
                            </small>

                            <strong>
                                ${AtlasGoals.formatCurrency(
                                    realLiquidity
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Declarada asignable
                            </small>

                            <strong>
                                ${AtlasGoals.formatCurrency(
                                    declaredLiquidity
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Distribuida
                            </small>

                            <strong>
                                ${AtlasGoals.formatCurrency(
                                    assignedLiquidity
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Disponible
                            </small>

                            <strong
                                style="
                                    color:
                                        var(
                                            --color-primary
                                        );
                                "
                            >
                                ${AtlasGoals.formatCurrency(
                                    availableLiquidity
                                )}
                            </strong>

                        </div>

                    </div>

                    ${
                        unsupportedLiquidity > 0
                            ? `

                                <div
                                    class="atlas-goals-liquidity-warning"
                                >
                                    Hay
                                    ${AtlasGoals.formatCurrency(
                                        unsupportedLiquidity
                                    )}
                                    distribuidos sin respaldo suficiente
                                    en la liquidez actual.
                                </div>

                            `
                            : ""
                    }

                    <div
                        class="atlas-goals-allocation-buttons"
                    >

                        <button
                            type="button"
                            class="atlas-goals-allocation-manage"
                            data-goal-allocation-action="configure-liquidity"
                        >
                            Configurar liquidez previa
                        </button>

                        <button
                            type="button"
                            class="atlas-goals-allocation-open"
                            data-goal-allocation-action="open"
                            data-source="prior_liquidity"
                            ${
                                availableLiquidity <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >
                            Distribuir liquidez
                        </button>

                    </div>

                </div>

                <div
                    class="atlas-goals-provisional"
                    data-negative="${
                        provisional < 0
                            ? "true"
                            : "false"
                    }"
                >

                    <span>
                        Ahorro provisional del mes actual
                    </span>

                    <strong>
                        ${AtlasGoals.formatCurrency(
                            provisional
                        )}
                    </strong>

                    <small>
                        No está disponible para distribuir hasta cerrar el mes.
                    </small>

                </div>

                ${
                    records.length > 0
                        ? `

                            <button
                                type="button"
                                class="
                                    atlas-goals-allocation-manage
                                    atlas-goals-allocation-manage-main
                                "
                                data-goal-allocation-action="manage"
                            >
                                Gestionar todas las distribuciones
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
                            Aumenta el progreso del objetivo
                            · Ya asignado desde
                            ${this.sourceShortLabel(
                                source
                            ).toLowerCase()}
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

        const data =
            this.data();

        const goals =
            this.allocatableGoals(
                data
            );

        const available =
            this.availableForSource(
                source,
                data
            );

        const title =
            source ===
                "prior_liquidity"
                ? "Distribuir liquidez"
                : "Distribuir ahorro";

        const description =
            source ===
                "prior_liquidity"
                ? "Asigna una parte de la liquidez previa que declaraste como reservable."
                : "Asigna cantidades o porcentajes del ahorro cerrado disponible.";

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                title,
                description
            )}

            <div
                class="atlas-goals-allocation-sheet-summary"
            >

                <span>
                    ${this.sourceLabel(
                        source
                    )} disponible
                </span>

                <strong>
                    ${AtlasGoals.formatCurrency(
                        available
                    )}
                </strong>

                <small
                    data-goal-allocation-selected
                >
                    Seleccionado: 0 €
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
                            data-source="${source}"
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
                                                source
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
                                    placeholder="${
                                        source ===
                                            "prior_liquidity"
                                            ? "Ejemplo: Dinero que ya tenía ahorrado"
                                            : "Ejemplo: Reparto del ahorro de junio"
                                    }"
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
                                La distribución está disponible únicamente
                                para objetivos manuales activos de ahorro,
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

    openLiquidityConfiguration() {

        const data =
            this.data();

        const real =
            Math.max(
                0,
                this.totalRealLiquidity(
                    data
                )
            );

        const declared =
            this.declaredPriorLiquidity(
                data
            );

        const assigned =
            this.totalAssignedFromLiquidity(
                data
            );

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Configurar liquidez previa",
                "Indica qué parte del dinero que ya tenías quieres considerar reservable para objetivos."
            )}

            <div
                class="atlas-goals-allocation-sheet-summary"
            >

                <span>
                    Liquidez real actual
                </span>

                <strong>
                    ${AtlasGoals.formatCurrency(
                        real
                    )}
                </strong>

                <small>
                    Ya distribuida desde liquidez:
                    ${AtlasGoals.formatCurrency(
                        assigned
                    )}
                </small>

            </div>

            <div
                class="atlas-goals-liquidity-explanation"
            >
                Esta configuración no mueve dinero ni modifica
                los saldos de tus cuentas. Solo establece cuánto
                de tu liquidez previa puede reservarse internamente
                para objetivos.
            </div>

            <form
                class="atlas-settings-form"
                data-goal-liquidity-form
                data-real-liquidity="${real}"
                data-assigned-liquidity="${assigned}"
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Liquidez previa asignable
                    </span>

                    <input
                        type="number"
                        inputmode="decimal"
                        min="${assigned}"
                        max="${real}"
                        step="0.01"
                        name="declaredLiquidity"
                        value="${declared}"
                        required
                    >

                    <small>
                        No puede ser menor que lo ya distribuido
                        ni mayor que tu liquidez real actual.
                    </small>

                </label>

                <button
                    type="submit"
                    class="atlas-settings-primary"
                >
                    Guardar liquidez asignable
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

    saveLiquidityConfiguration(form) {

        const values =
            new FormData(
                form
            );

        const amount =
            this.round(
                Math.max(
                    0,
                    this.number(
                        values.get(
                            "declaredLiquidity"
                        )
                    )
                )
            );

        const real =
            Math.max(
                0,
                this.number(
                    form.dataset
                        .realLiquidity
                )
            );

        const assigned =
            Math.max(
                0,
                this.number(
                    form.dataset
                        .assignedLiquidity
                )
            );

        if (
            amount <
                assigned -
                0.001
        ) {

            AtlasUI.toast(
                "No puedes declarar menos liquidez que la ya distribuida."
            );

            return;

        }

        if (
            amount >
                real +
                0.001
        ) {

            AtlasUI.toast(
                "La liquidez asignable no puede superar la liquidez real."
            );

            return;

        }

        const updatedData =
            this.clone(
                this.data()
            );

        updatedData.goalLiquidityPool = {

            ...(
                updatedData
                    .goalLiquidityPool ||
                {}
            ),

            declaredAmount:
                amount,

            updatedAt:
                this.now(),

            createdAt:
                updatedData
                    .goalLiquidityPool
                    ?.createdAt ||
                this.now()

        };

        if (
            !AtlasStorage.save(
                updatedData
            )
        ) {

            AtlasUI.toast(
                "No se pudo guardar la liquidez asignable."
            );

            return;

        }

        this.finishUpdate(
            "Liquidez asignable actualizada."
        );

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
            method === "percentage"
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
                method === "percentage"
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
                ),

            capacity

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
            current >= target
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
            String(
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
                source ===
                    "prior_liquidity"
                    ? "La distribución supera la liquidez previa disponible."
                    : "La distribución supera el ahorro cerrado disponible."
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

                goal.contributions = [];

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
            source ===
                "prior_liquidity"
                ? "Liquidez distribuida correctamente."
                : "Ahorro distribuido correctamente."
        );

    },

    allocationRecordRow(record) {

        const contribution =
            record.contribution;

        const effect =
            this.contributionEffect(
                contribution
            );

        const percentage =
            contribution
                .allocationMethod ===
                "percentage" &&
            this.number(
                contribution
                    .allocationPercent
            ) > 0
                ? (
                    ` · ` +
                    `${this.number(
                        contribution
                            .allocationPercent
                    ).toLocaleString(
                        "es-ES",
                        {
                            maximumFractionDigits:
                                2
                        }
                    )}%`
                )
                : "";

        const incompatible =
            !this.isAllocatableGoal(
                this.goalById(
                    record.goalId
                )
            );

        return `

            <article
                class="atlas-goals-allocation-record"
                data-incompatible="${
                    incompatible
                        ? "true"
                        : "false"
                }"
            >

                <div>

                    <div
                        class="atlas-goals-allocation-record-source"
                        data-source="${AtlasGoals.escape(
                            contribution.source
                        )}"
                    >
                        ${AtlasGoals.escape(
                            this.sourceLabel(
                                contribution.source
                            )
                        )}
                    </div>

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
                        ${percentage}
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

                    ${
                        incompatible
                            ? `

                                <span
                                    class="atlas-goals-allocation-warning"
                                >
                                    Este objetivo ya no admite distribuciones.
                                    Puedes mover o eliminar esta asignación.
                                </span>

                            `
                            : ""
                    }

                </div>

                <div
                    class="atlas-goals-allocation-record-actions"
                >

                    <strong
                        style="
                            color:${
                                effect >= 0
                                    ? "var(--color-success)"
                                    : "var(--color-danger)"
                            };
                        "
                    >
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

                    ${
                        contribution.type !==
                            "withdrawal"
                            ? `

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

                            `
                            : ""
                    }

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
                "Edita, mueve o elimina el ahorro y la liquidez distribuidos."
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
                        Liquidez distribuida
                    </small>

                    <strong>
                        ${AtlasGoals.formatCurrency(
                            this.totalAssignedFromLiquidity()
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

        const compatibleCurrent =
            this.isAllocatableGoal(
                record.goal
            );

        const selectedId =
            compatibleCurrent
                ? record.goal.id
                : "";

        const goals =
            this.allocatableGoals();

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Editar distribución",
                "Modifica la fuente, el importe o el objetivo de la asignación."
            )}

            ${
                !compatibleCurrent
                    ? `

                        <div
                            class="atlas-goals-allocation-edit-warning"
                        >
                            La distribución está asignada a un objetivo
                            que ya no es compatible. Selecciona otro
                            objetivo o elimina la distribución.
                        </div>

                    `
                    : ""
            }

            ${
                goals.length > 0
                    ? `

                        <form
                            class="atlas-settings-form"
                            data-goal-allocation-edit-form
                            data-original-goal-id="${AtlasGoals.escape(
                                goalId
                            )}"
                            data-contribution-id="${AtlasGoals.escape(
                                contributionId
                            )}"
                            data-original-amount="${amount}"
                            data-original-source="${AtlasGoals.escape(
                                contribution.source
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
                                            contribution.source ===
                                                "available_savings"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Ahorro cerrado
                                    </option>

                                    <option
                                        value="prior_liquidity"
                                        ${
                                            contribution.source ===
                                                "prior_liquidity"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Liquidez previa
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

                                    <option value="">
                                        Selecciona un objetivo
                                    </option>

                                    ${this.goalOptions(
                                        selectedId,
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

                    `
                    : `

                        <div
                            class="atlas-goals-allocation-empty"
                        >
                            No hay objetivos compatibles a los que mover
                            esta distribución.
                        </div>

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

                    `
            }

        `);

    },

    removeContributionFromGoal(
        goal,
        contributionId
    ) {

        const index =
            this.contributions(goal)
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
            String(
                form.dataset
                    .originalSource ||
                "available_savings"
            );

        const targetSource =
            String(
                values.get(
                    "allocationSource"
                ) ||
                originalSource
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
            ![
                "available_savings",
                "prior_liquidity"
            ].includes(
                targetSource
            ) ||
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
                targetSource ===
                    "prior_liquidity"
                    ? "El importe supera la liquidez previa disponible."
                    : "El importe supera el ahorro cerrado disponible."
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

            targetGoal.contributions = [];

        }

        const updatedContribution = {

            ...removed,

            id:
                removed.id,

            type:
                "contribution",

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

            .atlas-goals-allocation-panel {
                margin-bottom: 18px;
                border-color:
                    rgba(
                        77,
                        163,
                        255,
                        0.24
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.055
                    );
            }

            .atlas-goals-allocation-head,
            .atlas-goals-allocation-source-head {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 12px;
            }

            .atlas-goals-allocation-head h2 {
                margin: 0;
                font-size: 17px;
            }

            .atlas-goals-allocation-head p,
            .atlas-goals-allocation-source-head small {
                display: block;
                margin:
                    5px
                    0
                    0;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                line-height: 1.45;
            }

            .atlas-goals-allocation-head > span,
            .atlas-goals-allocation-source-head > span {
                flex:
                    0
                    0
                    auto;
                color:
                    var(
                        --color-primary
                    );
                font-size: 18px;
                font-weight: 850;
                white-space: nowrap;
            }

            .atlas-goals-allocation-source-card {
                margin-top: 14px;
                padding: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 18px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .atlas-goals-liquidity-card {
                border-color:
                    rgba(
                        95,
                        214,
                        150,
                        0.18
                    );
                background:
                    rgba(
                        95,
                        214,
                        150,
                        0.035
                    );
            }

            .atlas-goals-allocation-source-head strong {
                font-size: 13px;
            }

            .atlas-goals-allocation-facts {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 9px;
                margin-top: 14px;
            }

            .atlas-goals-allocation-facts > div {
                min-width: 0;
                padding: 11px;
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
            }

            .atlas-goals-allocation-facts small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-goals-allocation-facts strong {
                display: block;
                margin-top: 5px;
                font-size: 14px;
                overflow-wrap: anywhere;
            }

            .atlas-goals-provisional {
                margin-top: 14px;
                padding: 12px;
                border:
                    1px solid
                    rgba(
                        244,
                        185,
                        94,
                        0.22
                    );
                border-radius: 15px;
                background:
                    rgba(
                        244,
                        185,
                        94,
                        0.075
                    );
            }

            .atlas-goals-provisional[data-negative="true"] {
                border-color:
                    rgba(
                        255,
                        95,
                        112,
                        0.24
                    );
                background:
                    rgba(
                        255,
                        95,
                        112,
                        0.07
                    );
            }

            .atlas-goals-provisional span,
            .atlas-goals-provisional small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.45;
            }

            .atlas-goals-provisional strong {
                display: block;
                margin-top: 5px;
                font-size: 16px;
            }

            .atlas-goals-provisional small {
                margin-top: 5px;
            }

            .atlas-goals-allocation-buttons {
                display: grid;
                gap: 9px;
                margin-top: 14px;
            }

            .atlas-goals-allocation-open,
            .atlas-goals-allocation-manage {
                width: 100%;
                min-height: 44px;
                border-radius: 14px;
                font-size: 12px;
                font-weight: 800;
            }

            .atlas-goals-allocation-open {
                margin-top: 14px;
                border:
                    1px solid
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
                        0.2
                    );
                color: #ffffff;
            }

            .atlas-goals-allocation-buttons
            .atlas-goals-allocation-open {
                margin-top: 0;
            }

            .atlas-goals-allocation-open:disabled {
                opacity: 0.45;
            }

            .atlas-goals-allocation-manage {
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.18
                    );
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
                color: #c8d0e3;
            }

            .atlas-goals-allocation-manage-main {
                margin-top: 14px;
            }

            .atlas-goals-liquidity-warning,
            .atlas-goals-allocation-edit-warning {
                padding: 12px;
                margin-top: 12px;
                border:
                    1px solid
                    rgba(
                        255,
                        95,
                        112,
                        0.22
                    );
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        95,
                        112,
                        0.065
                    );
                color: #ffb0b9;
                font-size: 9px;
                line-height: 1.5;
            }

            .atlas-goals-allocation-edit-warning {
                margin:
                    0
                    0
                    14px;
                font-size: 10px;
            }

            .atlas-goals-liquidity-explanation {
                padding: 13px;
                margin-bottom: 14px;
                border:
                    1px solid
                    rgba(
                        95,
                        214,
                        150,
                        0.2
                    );
                border-radius: 15px;
                background:
                    rgba(
                        95,
                        214,
                        150,
                        0.06
                    );
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                line-height: 1.55;
            }

            .atlas-goals-allocation-sheet-summary {
                padding: 15px;
                margin-bottom: 14px;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.22
                    );
                border-radius: 17px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.075
                    );
            }

            .atlas-goals-allocation-sheet-summary span,
            .atlas-goals-allocation-sheet-summary small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-goals-allocation-sheet-summary strong {
                display: block;
                margin-top: 6px;
                color:
                    var(
                        --color-primary
                    );
                font-size: 22px;
            }

            .atlas-goals-allocation-sheet-summary small {
                margin-top: 7px;
                line-height: 1.4;
            }

            .atlas-goals-allocation-manage-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 9px;
                margin-bottom: 14px;
            }

            .atlas-goals-allocation-manage-summary > div {
                padding: 13px;
                border-radius: 15px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.035
                    );
            }

            .atlas-goals-allocation-manage-summary small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-goals-allocation-manage-summary strong {
                display: block;
                margin-top: 5px;
                font-size: 15px;
            }

            .atlas-goals-allocation-list {
                display: grid;
                gap: 11px;
            }

            .atlas-goals-allocation-row {
                padding: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.15
                    );
                border-radius: 17px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .atlas-goals-allocation-row-head {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 10px;
                margin-bottom: 12px;
            }

            .atlas-goals-allocation-row-head > div {
                min-width: 0;
            }

            .atlas-goals-allocation-row-head strong,
            .atlas-goals-allocation-row-head small {
                display: block;
            }

            .atlas-goals-allocation-row-head strong {
                font-size: 12px;
                overflow-wrap: anywhere;
            }

            .atlas-goals-allocation-row-head small {
                margin-top: 5px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-goals-allocation-row-head > span {
                flex:
                    0
                    0
                    auto;
                color:
                    var(
                        --color-primary
                    );
                font-size: 9px;
                white-space: nowrap;
            }

            .atlas-goals-allocation-methods {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 9px;
            }

            .atlas-goals-allocation-preview {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 10px;
                margin-top: 10px;
                padding: 10px;
                border-radius: 12px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.065
                    );
            }

            .atlas-goals-allocation-preview span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-goals-allocation-preview strong {
                color:
                    var(
                        --color-primary
                    );
                font-size: 13px;
            }

            .atlas-goals-allocation-empty {
                padding:
                    28px
                    12px;
                margin-bottom: 14px;
                color:
                    var(
                        --color-text-muted
                    );
                text-align: center;
                line-height: 1.5;
            }

            .atlas-goals-allocation-empty small {
                display: block;
                margin-top: 7px;
                font-size: 9px;
            }

            .atlas-goals-allocation-records {
                display: grid;
                margin-bottom: 14px;
            }

            .atlas-goals-allocation-record {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 13px;
                padding:
                    14px
                    0;
                border-bottom:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-goals-allocation-record[data-incompatible="true"] {
                padding:
                    13px
                    11px;
                border:
                    1px solid
                    rgba(
                        255,
                        95,
                        112,
                        0.2
                    );
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        95,
                        112,
                        0.055
                    );
            }

            .atlas-goals-allocation-record > div:first-child {
                min-width: 0;
            }

            .atlas-goals-allocation-record strong,
            .atlas-goals-allocation-record small {
                display: block;
            }

            .atlas-goals-allocation-record > div:first-child > strong {
                font-size: 12px;
            }

            .atlas-goals-allocation-record small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-goals-allocation-record p {
                margin:
                    6px
                    0
                    0;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.45;
            }

            .atlas-goals-allocation-record-source {
                display: inline-flex;
                min-height: 21px;
                align-items: center;
                margin-bottom: 7px;
                padding:
                    0
                    8px;
                border-radius: 99px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.1
                    );
                color:
                    var(
                        --color-primary
                    );
                font-size: 8px;
                font-weight: 800;
            }

            .atlas-goals-allocation-record-source[data-source="prior_liquidity"] {
                background:
                    rgba(
                        95,
                        214,
                        150,
                        0.1
                    );
                color: #86e4ac;
            }

            .atlas-goals-allocation-warning {
                display: block;
                margin-top: 7px;
                color:
                    var(
                        --color-danger
                    );
                font-size: 9px;
                line-height: 1.45;
            }

            .atlas-goals-allocation-record-actions {
                flex:
                    0
                    0
                    auto;
                text-align: right;
            }

            .atlas-goals-allocation-record-actions > strong {
                font-size: 13px;
                white-space: nowrap;
            }

            .atlas-goals-allocation-record-actions button {
                display: block;
                margin:
                    8px
                    0
                    0
                    auto;
                padding: 0;
                border: 0;
                background: transparent;
                color:
                    var(
                        --color-primary
                    );
                font-size: 9px;
            }

            .atlas-goals-allocation-record-actions button.danger {
                color:
                    var(
                        --color-danger
                    );
            }

            @media (
                max-width: 350px
            ) {

                .atlas-goals-allocation-methods,
                .atlas-goals-allocation-manage-summary {
                    grid-template-columns:
                        minmax(
                            0,
                            1fr
                        );
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

    installRender() {

        this.originalRender =
            AtlasGoals.render.bind(
                AtlasGoals
            );

        AtlasGoals.render =
            data => {

                const html =
                    this.originalRender(
                        data
                    );

                const panel =
                    this.summaryPanel(
                        data
                    );

                return html.replace(
                    '<button\n                    class="primary"',
                    `

                        ${panel}

                        <button
                            class="primary"`
                );

            };

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
                    "configure-liquidity"
                ) {

                    this.openLiquidityConfiguration();

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

                const liquidityForm =
                    event.target.closest(
                        "[data-goal-liquidity-form]"
                    );

                if (liquidityForm) {

                    event.preventDefault();

                    this.saveLiquidityConfiguration(
                        liquidityForm
                    );

                    return;

                }

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

        this.installRender();

        this.bindEvents();

    }

};

AtlasGoalsAllocation.init();

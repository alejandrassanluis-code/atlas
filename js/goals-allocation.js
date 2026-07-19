/* ==========================================================
   ATLAS
   goals-allocation.js
   Distribución centralizada del ahorro entre objetivos
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

    createId() {

        if (
            typeof AtlasCatalog !==
                "undefined" &&
            typeof AtlasCatalog.createId ===
                "function"
        ) {

            return AtlasCatalog.createId(
                "goal_contribution"
            );

        }

        return [
            "goal_contribution",
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

    },

    goals(
        data = AtlasGoals.data
    ) {

        return Array.isArray(
            data?.goals
        )
            ? data.goals
            : [];

    },

    allocatableGoals(
        data = AtlasGoals.data
    ) {

        const priorities = {

            high:
                1,

            medium:
                2,

            low:
                3

        };

        return this.goals(data)
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
                        difference !== 0
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

    },

    isAutomatic(goal) {

        return (
            goal?.progressMode &&
            goal.progressMode !==
                "manual"
        );

    },

    contributions(goal) {

        return Array.isArray(
            goal?.contributions
        )
            ? goal.contributions
            : [];

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

    assignedFromSavingsForGoal(goal) {

        return this.round(
            this.contributions(goal)
                .filter(
                    contribution =>
                        contribution.source ===
                        "available_savings"
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

    totalAssignedFromSavings(
        data = AtlasGoals.data
    ) {

        return this.round(
            this.goals(data)
                .reduce(
                    (
                        total,
                        goal
                    ) =>
                        total +
                        this.assignedFromSavingsForGoal(
                            goal
                        ),
                    0
                )
        );

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

    previousMonthSavings(
        data = AtlasGoals.data
    ) {

        return this.round(
            AtlasCalculations
                .financialSummary(
                    data,
                    this.previousMonth()
                )
                .monthlySavings
        );

    },

    accumulatedSavings(
        data = AtlasGoals.data
    ) {

        const currentMonth =
            this.currentMonth();

        const months =
            AtlasCalculations
                .allMonthKeys(
                    data,
                    currentMonth
                );

        return this.round(
            months.reduce(
                (
                    total,
                    monthKey
                ) =>
                    total +
                    this.number(
                        AtlasCalculations
                            .financialSummary(
                                data,
                                monthKey
                            )
                            .monthlySavings
                    ),
                0
            )
        );

    },

    availableSavings(
        data = AtlasGoals.data
    ) {

        return this.round(
            Math.max(
                0,
                this.accumulatedSavings(
                    data
                ) -
                this.totalAssignedFromSavings(
                    data
                )
            )
        );

    },

    currentAmount(goal) {

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
                        AtlasGoals.data
                    )
            );

        }

        return this.number(
            goal?.currentAmount
        );

    },

    allocationCapacity(goal) {

        const target =
            Math.max(
                0,
                this.number(
                    goal?.targetAmount
                )
            );

        if (
            this.isAutomatic(goal)
        ) {

            return this.round(
                Math.max(
                    0,
                    target -
                    this.assignedFromSavingsForGoal(
                        goal
                    )
                )
            );

        }

        return this.round(
            Math.max(
                0,
                target -
                this.currentAmount(
                    goal
                )
            )
        );

    },

    summaryPanel(
        data = AtlasGoals.data
    ) {

        const previous =
            this.previousMonthSavings(
                data
            );

        const accumulated =
            this.accumulatedSavings(
                data
            );

        const assigned =
            this.totalAssignedFromSavings(
                data
            );

        const available =
            this.availableSavings(
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
                            Asignar ahorro
                        </h2>

                        <p>
                            Distribuye el ahorro ya conseguido
                            entre tus objetivos activos.
                        </p>

                    </div>

                    <span>
                        ${AtlasGoals.formatCurrency(
                            available
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
                            Ahorro acumulado
                        </small>

                        <strong>
                            ${AtlasGoals.formatCurrency(
                                accumulated
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Ya asignado
                        </small>

                        <strong>
                            ${AtlasGoals.formatCurrency(
                                assigned
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
                                available
                            )}
                        </strong>

                    </div>

                </div>

                <button
                    type="button"
                    class="atlas-goals-allocation-open"
                    data-goal-allocation-action="open"
                    ${
                        available <= 0
                            ? "disabled"
                            : ""
                    }
                >
                    Distribuir ahorro
                </button>

            </section>

        `;

    },

    goalRow(goal) {

        const capacity =
            this.allocationCapacity(
                goal
            );

        const assigned =
            this.assignedFromSavingsForGoal(
                goal
            );

        return `

            <article
                class="atlas-goals-allocation-row"
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
                            ${
                                this.isAutomatic(goal)
                                    ? "Asignación interna"
                                    : "Aumenta el progreso"
                            }
                            · Ya asignado
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

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Cantidad para este objetivo
                    </span>

                    <input
                        type="number"
                        inputmode="decimal"
                        min="0"
                        max="${capacity}"
                        step="0.01"
                        value=""
                        placeholder="0,00"
                        data-goal-allocation-input
                        data-goal-id="${AtlasGoals.escape(
                            goal.id
                        )}"
                        data-goal-capacity="${capacity}"
                        ${
                            capacity <= 0
                                ? "disabled"
                                : ""
                        }
                    >

                </label>

            </article>

        `;

    },

    openAllocation() {

        const data =
            AtlasGoals.data;

        const goals =
            this.allocatableGoals(
                data
            );

        const available =
            this.availableSavings(
                data
            );

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Asignar ahorro",
                "Reparte el ahorro disponible sin modificar tu liquidez real."
            )}

            <div
                class="atlas-goals-allocation-sheet-summary"
            >

                <span>
                    Disponible para asignar
                </span>

                <strong
                    data-goal-allocation-available
                >
                    ${AtlasGoals.formatCurrency(
                        available
                    )}
                </strong>

                <small
                    data-goal-allocation-selected
                >
                    Seleccionado: 0 €
                </small>

            </div>

            ${
                goals.length > 0
                    ? `

                        <form
                            class="atlas-settings-form"
                            data-goal-allocation-form
                            data-available="${available}"
                        >

                            <div
                                class="atlas-goals-allocation-list"
                            >

                                ${goals
                                    .map(
                                        goal =>
                                            this.goalRow(
                                                goal
                                            )
                                    )
                                    .join("")}

                            </div>

                            <label
                                class="atlas-settings-field"
                            >

                                <span>
                                    Fecha de asignación
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
                                    placeholder="Ejemplo: Reparto del ahorro de julio"
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
                            No hay objetivos activos disponibles.
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

    selectedTotal(form) {

        return this.round(
            Array.from(
                form.querySelectorAll(
                    "[data-goal-allocation-input]"
                )
            )
                .reduce(
                    (
                        total,
                        input
                    ) =>
                        total +
                        Math.max(
                            0,
                            this.number(
                                input.value
                            )
                        ),
                    0
                )
        );

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

        if (
            selectedElement
        ) {

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
                selected > available
                    ? "var(--color-danger)"
                    : "var(--color-text-muted)";

        }

    },

    saveAllocation(form) {

        const available =
            this.availableSavings(
                AtlasGoals.data
            );

        const selected =
            this.selectedTotal(
                form
            );

        if (
            selected <= 0
        ) {

            AtlasUI.toast(
                "Introduce al menos una cantidad."
            );

            return;

        }

        if (
            selected >
                available +
                0.001
        ) {

            AtlasUI.toast(
                "La distribución supera el ahorro disponible."
            );

            return;

        }

        const date =
            String(
                new FormData(form)
                    .get(
                        "allocationDate"
                    ) ||
                ""
            );

        const note =
            String(
                new FormData(form)
                    .get(
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
                AtlasGoals.data
            );

        const inputs =
            Array.from(
                form.querySelectorAll(
                    "[data-goal-allocation-input]"
                )
            );

        for (
            const input of inputs
        ) {

            const amount =
                Math.max(
                    0,
                    this.round(
                        input.value
                    )
                );

            if (
                amount <= 0
            ) {

                continue;

            }

            const goal =
                this.goals(
                    updatedData
                ).find(
                    item =>
                        item.id ===
                        input.dataset
                            .goalId
                );

            if (!goal) {

                AtlasUI.toast(
                    "No se encontró uno de los objetivos."
                );

                return;

            }

            const capacity =
                this.allocationCapacity(
                    goal
                );

            if (
                amount >
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

            goal.contributions.push({

                id:
                    this.createId(),

                type:
                    "contribution",

                amount,

                date,

                note,

                source:
                    "available_savings",

                createdAt:
                    this.now()

            });

            if (
                !this.isAutomatic(
                    goal
                )
            ) {

                goal.currentAmount =
                    this.round(
                        Math.max(
                            0,
                            this.number(
                                goal.currentAmount
                            ) +
                            amount
                        )
                    );

                if (
                    goal.currentAmount >=
                        this.number(
                            goal.targetAmount
                        ) &&
                    ![
                        "archived",
                        "cancelled"
                    ].includes(
                        goal.status
                    )
                ) {

                    goal.status =
                        "completed";

                    goal.completedAt =
                        goal.completedAt ||
                        this.now();

                }

            }

            goal.updatedAt =
                this.now();

        }

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo guardar la distribución."
            );

            return;

        }

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
            "Ahorro distribuido correctamente."
        );

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-goals-allocation-styles"
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

            .atlas-goals-allocation-head {
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

            .atlas-goals-allocation-head p {
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

            .atlas-goals-allocation-head > span {
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

            .atlas-goals-allocation-open {
                width: 100%;
                min-height: 44px;
                margin-top: 14px;
                border-radius: 14px;
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
                font-size: 12px;
                font-weight: 800;
            }

            .atlas-goals-allocation-open:disabled {
                opacity: 0.45;
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

                if (
                    button.dataset
                        .goalAllocationAction ===
                    "open"
                ) {

                    this.openAllocation();

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const input =
                    event.target.closest(
                        "[data-goal-allocation-input]"
                    );

                if (!input) {

                    return;

                }

                const capacity =
                    this.number(
                        input.dataset
                            .goalCapacity
                    );

                const amount =
                    Math.max(
                        0,
                        this.number(
                            input.value
                        )
                    );

                if (
                    amount >
                    capacity
                ) {

                    input.value =
                        capacity;

                }

                this.updateSelectedTotal(
                    input.closest(
                        "[data-goal-allocation-form]"
                    )
                );

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-goal-allocation-form]"
                    );

                if (!form) {

                    return;

                }

                event.preventDefault();

                this.saveAllocation(
                    form
                );

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

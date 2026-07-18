/* ==========================================================
   ATLAS
   goals-contributions.js
   Aportaciones e historial de objetivos
========================================================== */

const AtlasGoalsContributions = {

    initialized:
        false,

    originalGoalCard:
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

    clone(value) {

        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    },

    goalById(
        goalId,
        data = AtlasGoals.data
    ) {

        return (
            Array.isArray(
                data?.goals
            )
                ? data.goals
                : []
        ).find(
            goal =>
                goal.id ===
                goalId
        ) || null;

    },

    contributions(goal) {

        return (
            Array.isArray(
                goal?.contributions
            )
                ? goal.contributions
                : []
        )
            .map(
                contribution =>
                    this.normalizeContribution(
                        contribution
                    )
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const dateComparison =
                        String(
                            second.date ||
                            ""
                        ).localeCompare(
                            String(
                                first.date ||
                                ""
                            )
                        );

                    if (
                        dateComparison !==
                        0
                    ) {

                        return dateComparison;

                    }

                    return String(
                        second.createdAt ||
                        ""
                    ).localeCompare(
                        String(
                            first.createdAt ||
                            ""
                        )
                    );

                }
            );

    },

    normalizeContribution(
        contribution = {}
    ) {

        const type =
            contribution.type ===
                "withdrawal"
                ? "withdrawal"
                : "contribution";

        return {

            id:
                contribution.id ||
                this.createId(),

            type,

            amount:
                Math.max(
                    0,
                    this.round(
                        contribution.amount
                    )
                ),

            date:
                contribution.date ||
                this.today(),

            note:
                String(
                    contribution.note ||
                    ""
                ).trim(),

            source:
                contribution.source ===
                    "available_savings"
                    ? "available_savings"
                    : "manual",

            createdAt:
                contribution.createdAt ||
                this.now()

        };

    },

    isAutomatic(goal) {

        return (
            goal?.progressMode &&
            goal.progressMode !==
                "manual"
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

    contributionBalance(goal) {

        return this.round(
            this.contributions(
                goal
            ).reduce(
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

    lastContribution(goal) {

        return this.contributions(
            goal
        )[0] || null;

    },

    formatContributionDate(value) {

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

    sourceLabel(source) {

        return source ===
            "available_savings"
                ? "Ahorro disponible"
                : "Registro manual";

    },

    typeLabel(type) {

        return type ===
            "withdrawal"
                ? "Retirada"
                : "Aportación";

    },

    historySummary(goal) {

        const last =
            this.lastContribution(
                goal
            );

        if (!last) {

            return `

                <div
                    class="
                        atlas-goal-contribution-summary
                        atlas-goal-contribution-empty
                    "
                >
                    Sin aportaciones registradas
                </div>

            `;

        }

        const effect =
            this.contributionEffect(
                last
            );

        return `

            <div
                class="atlas-goal-contribution-summary"
            >

                <span>
                    Último movimiento
                </span>

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

                <small>
                    ${AtlasGoals.escape(
                        this.formatContributionDate(
                            last.date
                        )
                    )}
                    ·
                    ${AtlasGoals.escape(
                        this.typeLabel(
                            last.type
                        )
                    )}
                </small>

            </div>

        `;

    },

    cardActions(goal) {

        const automatic =
            this.isAutomatic(
                goal
            );

        const assigned =
            this.contributionBalance(
                goal
            );

        return `

            <div
                class="atlas-goal-contribution-information"
            >

                <div>

                    <small>
                        ${
                            automatic
                                ? "Ahorro asignado"
                                : "Aportaciones registradas"
                        }
                    </small>

                    <strong>
                        ${AtlasGoals.formatCurrency(
                            assigned
                        )}
                    </strong>

                </div>

                ${this.historySummary(
                    goal
                )}

            </div>

            <div
                class="atlas-goal-card-actions"
            >

                <button
                    type="button"
                    class="atlas-goal-contribution-button"
                    data-goal-contribution-action="add"
                    data-goal-id="${AtlasGoals.escape(
                        goal.id
                    )}"
                >
                    Añadir aportación
                </button>

                <button
                    type="button"
                    class="atlas-goal-card-edit-button"
                    data-goal-contribution-action="edit"
                    data-goal-id="${AtlasGoals.escape(
                        goal.id
                    )}"
                >
                    Editar
                </button>

                ${
                    this.contributions(
                        goal
                    ).length > 0
                        ? `

                            <button
                                type="button"
                                class="atlas-goal-history-button"
                                data-goal-contribution-action="history"
                                data-goal-id="${AtlasGoals.escape(
                                    goal.id
                                )}"
                            >
                                Ver historial
                            </button>

                        `
                        : ""
                }

            </div>

        `;

    },

    transformCard(
        html,
        goal
    ) {

        let result =
            String(
                html || ""
            );

        result =
            result.replace(
                /<button([\s\S]*?)class="atlas-goal-card"([\s\S]*?)data-goal-action="edit"([\s\S]*?)>/,
                (
                    match,
                    before,
                    middle,
                    after
                ) => `

                    <article
                        ${before}
                        class="atlas-goal-card"
                        ${middle}
                        ${after}
                    >

                `
            );

        const lastClosingButton =
            result.lastIndexOf(
                "</button>"
            );

        if (
            lastClosingButton >= 0
        ) {

            result =
                result.slice(
                    0,
                    lastClosingButton
                ) +
                this.cardActions(
                    goal
                ) +
                `

                    </article>

                ` +
                result.slice(
                    lastClosingButton +
                    "</button>".length
                );

        }

        return result;

    },

    installCards() {

        this.originalGoalCard =
            AtlasGoals.goalCard.bind(
                AtlasGoals
            );

        AtlasGoals.goalCard =
            goal =>
                this.transformCard(
                    this.originalGoalCard(
                        goal
                    ),
                    goal
                );

    },

    openContributionForm(goalId) {

        const goal =
            this.goalById(
                goalId
            );

        if (!goal) {

            return;

        }

        const automatic =
            this.isAutomatic(
                goal
            );

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Añadir aportación",
                goal.name
            )}

            <form
                class="atlas-settings-form"
                data-goal-contribution-form
                data-goal-id="${AtlasGoals.escape(
                    goal.id
                )}"
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Tipo de movimiento
                    </span>

                    <select
                        name="contributionType"
                    >

                        <option
                            value="contribution"
                        >
                            Aportación
                        </option>

                        <option
                            value="withdrawal"
                        >
                            Retirada o corrección
                        </option>

                    </select>

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Importe
                    </span>

                    <input
                        name="contributionAmount"
                        type="number"
                        inputmode="decimal"
                        min="0.01"
                        step="0.01"
                        placeholder="0,00"
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
                        name="contributionDate"
                        type="date"
                        value="${this.today()}"
                        required
                    >

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Origen
                    </span>

                    <select
                        name="contributionSource"
                    >

                        <option
                            value="manual"
                        >
                            Registro manual
                        </option>

                        <option
                            value="available_savings"
                        >
                            Ahorro disponible
                        </option>

                    </select>

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Nota opcional
                    </span>

                    <input
                        name="contributionNote"
                        type="text"
                        maxlength="160"
                        placeholder="Ejemplo: Ahorro de julio"
                    >

                </label>

                ${
                    automatic
                        ? `

                            <div
                                class="atlas-goal-contribution-notice"
                            >

                                <strong>
                                    Objetivo automático
                                </strong>

                                <p>
                                    Esta aportación quedará registrada como
                                    ahorro asignado, pero no se sumará al
                                    progreso calculado desde la cuenta vinculada.
                                </p>

                            </div>

                        `
                        : ""
                }

                <button
                    type="submit"
                    class="atlas-settings-primary"
                >
                    Guardar aportación
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

    saveContribution(form) {

        const values =
            new FormData(
                form
            );

        const goalId =
            String(
                form.dataset
                    .goalId ||
                ""
            );

        const amount =
            this.number(
                values.get(
                    "contributionAmount"
                )
            );

        const date =
            String(
                values.get(
                    "contributionDate"
                ) ||
                ""
            );

        const type =
            String(
                values.get(
                    "contributionType"
                ) ||
                "contribution"
            ) ===
                "withdrawal"
                ? "withdrawal"
                : "contribution";

        const source =
            String(
                values.get(
                    "contributionSource"
                ) ||
                "manual"
            ) ===
                "available_savings"
                ? "available_savings"
                : "manual";

        const note =
            String(
                values.get(
                    "contributionNote"
                ) ||
                ""
            ).trim();

        if (
            !goalId
        ) {

            AtlasUI.toast(
                "No se encontró el objetivo."
            );

            return;

        }

        if (
            !Number.isFinite(
                amount
            ) ||
            amount <= 0
        ) {

            AtlasUI.toast(
                "Introduce un importe válido."
            );

            return;

        }

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

        const goal =
            this.goalById(
                goalId,
                updatedData
            );

        if (!goal) {

            AtlasUI.toast(
                "No se encontró el objetivo."
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

        const contribution =
            this.normalizeContribution({

                id:
                    this.createId(),

                type,

                amount,

                date,

                source,

                note,

                createdAt:
                    this.now()

            });

        const automatic =
            this.isAutomatic(
                goal
            );

        if (
            !automatic
        ) {

            const effect =
                this.contributionEffect(
                    contribution
                );

            const nextAmount =
                this.round(
                    Math.max(
                        0,
                        this.number(
                            goal.currentAmount
                        ) +
                        effect
                    )
                );

            if (
                type === "withdrawal" &&
                amount >
                    this.number(
                        goal.currentAmount
                    )
            ) {

                AtlasUI.toast(
                    "La retirada supera el acumulado del objetivo."
                );

                return;

            }

            goal.currentAmount =
                nextAmount;

            if (
                nextAmount >=
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

            } else if (
                goal.status ===
                    "completed" &&
                nextAmount <
                    this.number(
                        goal.targetAmount
                    )
            ) {

                goal.status =
                    "active";

                goal.completedAt =
                    null;

            }

        } else if (
            type === "withdrawal" &&
            amount >
                this.contributionBalance(
                    goal
                )
        ) {

            AtlasUI.toast(
                "La retirada supera el ahorro asignado al objetivo."
            );

            return;

        }

        goal.contributions.push(
            contribution
        );

        goal.updatedAt =
            this.now();

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo guardar la aportación."
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
            type === "withdrawal"
                ? "Retirada registrada."
                : "Aportación registrada."
        );

    },

    historyRow(
        goal,
        contribution
    ) {

        const effect =
            this.contributionEffect(
                contribution
            );

        return `

            <article
                class="atlas-goal-history-row"
            >

                <div>

                    <strong>
                        ${AtlasGoals.escape(
                            this.typeLabel(
                                contribution.type
                            )
                        )}
                    </strong>

                    <small>
                        ${AtlasGoals.escape(
                            this.formatContributionDate(
                                contribution.date
                            )
                        )}
                        ·
                        ${AtlasGoals.escape(
                            this.sourceLabel(
                                contribution.source
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
                    class="atlas-goal-history-amount"
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

                    <button
                        type="button"
                        data-goal-contribution-action="delete-contribution"
                        data-goal-id="${AtlasGoals.escape(
                            goal.id
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

    openHistory(goalId) {

        const goal =
            this.goalById(
                goalId
            );

        if (!goal) {

            return;

        }

        const contributions =
            this.contributions(
                goal
            );

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Historial de aportaciones",
                goal.name
            )}

            <div
                class="atlas-goal-history-total"
            >

                <span>
                    Saldo de aportaciones
                </span>

                <strong>
                    ${AtlasGoals.formatCurrency(
                        this.contributionBalance(
                            goal
                        )
                    )}
                </strong>

            </div>

            ${
                contributions.length > 0
                    ? `

                        <div
                            class="atlas-goal-history-list"
                        >

                            ${contributions
                                .map(
                                    contribution =>
                                        this.historyRow(
                                            goal,
                                            contribution
                                        )
                                )
                                .join("")}

                        </div>

                    `
                    : `

                        <div
                            class="atlas-goal-history-empty"
                        >
                            No hay aportaciones registradas.
                        </div>

                    `
            }

            <button
                type="button"
                class="atlas-settings-primary"
                data-goal-contribution-action="add"
                data-goal-id="${AtlasGoals.escape(
                    goal.id
                )}"
            >
                Añadir aportación
            </button>

            <button
                type="button"
                class="atlas-settings-secondary"
                data-settings-action="close"
            >
                Cerrar
            </button>

        `);

    },

    deleteContribution(
        goalId,
        contributionId
    ) {

        const updatedData =
            this.clone(
                AtlasGoals.data
            );

        const goal =
            this.goalById(
                goalId,
                updatedData
            );

        if (!goal) {

            return;

        }

        const contribution =
            (
                Array.isArray(
                    goal.contributions
                )
                    ? goal.contributions
                    : []
            ).find(
                item =>
                    item.id ===
                    contributionId
            );

        if (!contribution) {

            return;

        }

        const confirmed =
            window.confirm(
                "¿Eliminar esta aportación del historial?"
            );

        if (!confirmed) {

            return;

        }

        if (
            !this.isAutomatic(
                goal
            )
        ) {

            const effect =
                this.contributionEffect(
                    contribution
                );

            goal.currentAmount =
                this.round(
                    Math.max(
                        0,
                        this.number(
                            goal.currentAmount
                        ) -
                        effect
                    )
                );

            if (
                goal.status ===
                    "completed" &&
                goal.currentAmount <
                    this.number(
                        goal.targetAmount
                    )
            ) {

                goal.status =
                    "active";

                goal.completedAt =
                    null;

            }

        }

        goal.contributions =
            goal.contributions.filter(
                item =>
                    item.id !==
                    contributionId
            );

        goal.updatedAt =
            this.now();

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo eliminar la aportación."
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
            "Aportación eliminada."
        );

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-goal-contribution-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-goal-contribution-styles";

        style.textContent = `

            .atlas-goal-card {
                display: block;
            }

            .atlas-goal-contribution-information {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 10px;
                margin-top: 14px;
                padding-top: 13px;
                border-top:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
            }

            .atlas-goal-contribution-information > div {
                min-width: 0;
            }

            .atlas-goal-contribution-information small,
            .atlas-goal-contribution-information span {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-goal-contribution-information strong {
                display: block;
                margin-top: 5px;
                font-size: 13px;
                overflow-wrap: anywhere;
            }

            .atlas-goal-contribution-summary small {
                margin-top: 4px;
            }

            .atlas-goal-contribution-empty {
                align-self: center;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-goal-card-actions {
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
                margin-top: 14px;
            }

            .atlas-goal-card-actions button {
                min-width: 0;
                min-height: 42px;
                padding:
                    0
                    8px;
                border-radius: 13px;
                font-size: 11px;
                font-weight: 800;
            }

            .atlas-goal-contribution-button {
                color: #ffffff;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.24
                    );
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.34
                    );
            }

            .atlas-goal-card-edit-button {
                color: #c8d0e3;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.045
                    );
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.16
                    );
            }

            .atlas-goal-history-button {
                grid-column:
                    1 / -1;
                color:
                    var(
                        --color-primary
                    );
                background: transparent;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.2
                    );
            }

            .atlas-goal-contribution-notice {
                padding: 13px;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.2
                    );
                border-radius: 15px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.075
                    );
            }

            .atlas-goal-contribution-notice strong {
                display: block;
                font-size: 12px;
            }

            .atlas-goal-contribution-notice p {
                margin:
                    6px
                    0
                    0;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                line-height: 1.5;
            }

            .atlas-goal-history-total {
                padding: 15px;
                margin-bottom: 14px;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.2
                    );
                border-radius: 17px;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.07
                    );
            }

            .atlas-goal-history-total span {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-goal-history-total strong {
                display: block;
                margin-top: 6px;
                font-size: 20px;
            }

            .atlas-goal-history-list {
                display: grid;
                margin-bottom: 14px;
            }

            .atlas-goal-history-row {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 14px;
                padding:
                    13px
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

            .atlas-goal-history-row > div {
                min-width: 0;
            }

            .atlas-goal-history-row strong,
            .atlas-goal-history-row small {
                display: block;
            }

            .atlas-goal-history-row > div:first-child > strong {
                font-size: 12px;
            }

            .atlas-goal-history-row small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                line-height: 1.4;
            }

            .atlas-goal-history-row p {
                margin:
                    6px
                    0
                    0;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                line-height: 1.45;
                overflow-wrap: anywhere;
            }

            .atlas-goal-history-amount {
                flex:
                    0
                    0
                    auto;
                text-align: right;
            }

            .atlas-goal-history-amount > strong {
                font-size: 13px;
                white-space: nowrap;
            }

            .atlas-goal-history-amount button {
                margin-top: 8px;
                padding: 0;
                border: 0;
                background: transparent;
                color:
                    var(
                        --color-danger
                    );
                font-size: 9px;
            }

            .atlas-goal-history-empty {
                padding:
                    24px
                    12px;
                margin-bottom: 14px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 11px;
                text-align: center;
            }

            @media (
                max-width: 350px
            ) {

                .atlas-goal-contribution-information,
                .atlas-goal-card-actions {
                    grid-template-columns:
                        minmax(
                            0,
                            1fr
                        );
                }

                .atlas-goal-history-button {
                    grid-column: auto;
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
                        "[data-goal-contribution-action]"
                    );

                if (!button) {

                    return;

                }

                event.preventDefault();

                event.stopPropagation();

                const action =
                    button.dataset
                        .goalContributionAction;

                const goalId =
                    button.dataset
                        .goalId;

                if (
                    action === "add"
                ) {

                    this.openContributionForm(
                        goalId
                    );

                    return;

                }

                if (
                    action === "edit"
                ) {

                    AtlasGoals.openForm(
                        goalId
                    );

                    return;

                }

                if (
                    action === "history"
                ) {

                    this.openHistory(
                        goalId
                    );

                    return;

                }

                if (
                    action ===
                    "delete-contribution"
                ) {

                    this.deleteContribution(
                        goalId,
                        button.dataset
                            .contributionId
                    );

                }

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-goal-contribution-form]"
                    );

                if (!form) {

                    return;

                }

                event.preventDefault();

                this.saveContribution(
                    form
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

        this.installStyles();

        this.installCards();

        this.bindEvents();

    }

};

AtlasGoalsContributions.init();

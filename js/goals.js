/* ==========================================================
   ATLAS
   goals.js
   Atlas v1.0 — Objetivos financieros
========================================================== */

const AtlasGoals = {

    data:
        null,

    editingGoalId:
        null,

    originalRender:
        null,

    initialized:
        false,

    now() {

        return new Date()
            .toISOString();

    },

    createId() {

        if (
            typeof AtlasCatalog !==
                "undefined" &&
            typeof AtlasCatalog.createId ===
                "function"
        ) {

            return AtlasCatalog.createId(
                "goal"
            );

        }

        return [
            "goal",
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

    },

    number(value) {

        const normalized =
            String(
                value ?? ""
            )
                .trim()
                .replace(
                    ",",
                    "."
                );

        const result =
            Number(
                normalized
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

    escape(value) {

        if (
            typeof AtlasUI !==
                "undefined" &&
            typeof AtlasUI.escapeHtml ===
                "function"
        ) {

            return AtlasUI.escapeHtml(
                value
            );

        }

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    },

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style:
                    "currency",

                currency:
                    "EUR",

                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        ).format(
            this.number(
                value
            )
        );

    },

    formatDate(value) {

        if (!value) {

            return "Sin fecha límite";

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

            return "Sin fecha límite";

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

    goals(
        data = this.data
    ) {

        return Array.isArray(
            data?.goals
        )
            ? data.goals
            : [];

    },

    activeGoals(
        data = this.data
    ) {

        return this.goals(
            data
        )
            .filter(
                goal =>
                    ![
                        "completed",
                        "archived",
                        "cancelled"
                    ].includes(
                        goal.status
                    )
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const priorityOrder = {

                        high:
                            1,

                        medium:
                            2,

                        low:
                            3

                    };

                    const priorityDifference =
                        (
                            priorityOrder[
                                first.priority
                            ] ||
                            2
                        ) -
                        (
                            priorityOrder[
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

    },

    completedGoals(
        data = this.data
    ) {

        return this.goals(
            data
        )
            .filter(
                goal =>
                    [
                        "completed",
                        "archived"
                    ].includes(
                        goal.status
                    )
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    String(
                        second.completedAt ||
                        second.updatedAt ||
                        ""
                    ).localeCompare(
                        String(
                            first.completedAt ||
                            first.updatedAt ||
                            ""
                        )
                    )
            );

    },

    normalizeGoal(
        goal = {}
    ) {

        const createdAt =
            goal.createdAt ||
            this.now();

        const allowedTypes = [

            "saving",

            "purchase",

            "investment",

            "debt",

            "emergency"

        ];

        const allowedStatuses = [

            "active",

            "paused",

            "completed",

            "archived",

            "cancelled"

        ];

        const allowedPriorities = [

            "high",

            "medium",

            "low"

        ];

        const targetAmount =
            Math.max(
                0,
                this.round(
                    goal.targetAmount
                )
            );

        const currentAmount =
            Math.max(
                0,
                this.round(
                    goal.currentAmount
                )
            );

        return {

            id:
                goal.id ||
                this.createId(),

            name:
                String(
                    goal.name ||
                    "Objetivo"
                ).trim(),

            description:
                String(
                    goal.description ||
                    ""
                ).trim(),

            type:
                allowedTypes.includes(
                    goal.type
                )
                    ? goal.type
                    : "saving",

            icon:
                goal.icon ||
                this.typeIcon(
                    goal.type
                ),

            targetAmount,

            currentAmount,

            startDate:
                goal.startDate ||
                createdAt.slice(
                    0,
                    10
                ),

            deadline:
                goal.deadline ||
                null,

            accountId:
                goal.accountId ||
                null,

            debtAccountId:
                goal.debtAccountId ||
                null,

            priority:
                allowedPriorities.includes(
                    goal.priority
                )
                    ? goal.priority
                    : "medium",

            status:
                allowedStatuses.includes(
                    goal.status
                )
                    ? goal.status
                    : (
                        targetAmount > 0 &&
                        currentAmount >=
                            targetAmount
                            ? "completed"
                            : "active"
                    ),

            notes:
                String(
                    goal.notes ||
                    ""
                ).trim(),

            contributions:
                Array.isArray(
                    goal.contributions
                )
                    ? goal.contributions
                    : [],

            completedAt:
                goal.completedAt ||
                null,

            createdAt,

            updatedAt:
                goal.updatedAt ||
                createdAt

        };

    },

    ensureGoals(
        data
    ) {

        if (
            !Array.isArray(
                data.goals
            )
        ) {

            data.goals = [];

        }

        data.goals =
            data.goals.map(
                goal =>
                    this.normalizeGoal(
                        goal
                    )
            );

        return data;

    },

    typeIcon(type) {

        const icons = {

            saving:
                "🐷",

            purchase:
                "🛍️",

            investment:
                "📈",

            debt:
                "💳",

            emergency:
                "🛡️"

        };

        return (
            icons[type] ||
            icons.saving
        );

    },

    typeLabel(type) {

        const labels = {

            saving:
                "Ahorro",

            purchase:
                "Compra futura",

            investment:
                "Inversión",

            debt:
                "Reducción de deuda",

            emergency:
                "Fondo de emergencia"

        };

        return (
            labels[type] ||
            labels.saving
        );

    },

    statusLabel(status) {

        const labels = {

            active:
                "Activo",

            paused:
                "Pausado",

            completed:
                "Completado",

            archived:
                "Archivado",

            cancelled:
                "Cancelado"

        };

        return (
            labels[status] ||
            labels.active
        );

    },

    priorityLabel(priority) {

        const labels = {

            high:
                "Alta",

            medium:
                "Media",

            low:
                "Baja"

        };

        return (
            labels[priority] ||
            labels.medium
        );

    },

    progress(goal) {

        const target =
            Math.max(
                0,
                this.number(
                    goal.targetAmount
                )
            );

        const current =
            Math.max(
                0,
                this.number(
                    goal.currentAmount
                )
            );

        if (
            target <= 0
        ) {

            return 0;

        }

        return Math.min(
            100,
            Math.max(
                0,
                (
                    current /
                    target
                ) * 100
            )
        );

    },

    remaining(goal) {

        return Math.max(
            0,
            this.number(
                goal.targetAmount
            ) -
            this.number(
                goal.currentAmount
            )
        );

    },

    monthsRemaining(goal) {

        if (
            !goal.deadline
        ) {

            return null;

        }

        const now =
            new Date();

        const deadline =
            new Date(
                `${goal.deadline}T12:00:00`
            );

        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {

            return null;

        }

        const months =
            (
                deadline.getFullYear() -
                now.getFullYear()
            ) * 12 +
            (
                deadline.getMonth() -
                now.getMonth()
            );

        return Math.max(
            1,
            months + 1
        );

    },

    monthlyRequired(goal) {

        const remaining =
            this.remaining(
                goal
            );

        const months =
            this.monthsRemaining(
                goal
            );

        if (
            remaining <= 0
        ) {

            return 0;

        }

        if (
            months === null
        ) {

            return null;

        }

        return this.round(
            remaining /
            months
        );

    },

    summary(data) {

        const active =
            this.activeGoals(
                data
            );

        const totalRemaining =
            active.reduce(
                (
                    total,
                    goal
                ) =>
                    total +
                    this.remaining(
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
                        this.monthlyRequired(
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

    },

    styles() {

        return `

            <style>

                .atlas-goals-summary {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .atlas-goals-summary-card {
                    min-width: 0;
                    padding: 15px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius: 18px;
                    background: #19243a;
                }

                .atlas-goals-summary-card span {
                    display: block;
                    color: #98a2bb;
                    font-size: 11px;
                    line-height: 1.35;
                }

                .atlas-goals-summary-card strong {
                    display: block;
                    margin-top: 7px;
                    color: #f7f8fc;
                    font-size: 20px;
                    line-height: 1.1;
                }

                .atlas-goals-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .atlas-goal-card {
                    width: 100%;
                    padding: 16px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius: 20px;
                    background: #19243a;
                    color: #f7f8fc;
                    text-align: left;
                }

                .atlas-goal-card[data-paused="true"] {
                    opacity: 0.72;
                }

                .atlas-goal-card-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                }

                .atlas-goal-card-title {
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .atlas-goal-icon {
                    width: 43px;
                    height: 43px;
                    flex: 0 0 43px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background:
                        rgba(
                            77,
                            163,
                            255,
                            0.1
                        );
                    font-size: 21px;
                }

                .atlas-goal-card-title strong {
                    display: block;
                    overflow: hidden;
                    font-size: 16px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .atlas-goal-card-title small {
                    display: block;
                    margin-top: 4px;
                    color: #98a2bb;
                    font-size: 11px;
                }

                .atlas-goal-percent {
                    flex: 0 0 auto;
                    color: #79baff;
                    font-size: 16px;
                    font-weight: 800;
                }

                .atlas-goal-progress {
                    height: 9px;
                    margin-top: 15px;
                    overflow: hidden;
                    border-radius: 99px;
                    background:
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                }

                .atlas-goal-progress span {
                    display: block;
                    height: 100%;
                    border-radius: 99px;
                    background:
                        linear-gradient(
                            90deg,
                            #4da3ff,
                            #2879ed
                        );
                }

                .atlas-goal-values {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                    margin-top: 13px;
                }

                .atlas-goal-values div {
                    min-width: 0;
                }

                .atlas-goal-values small {
                    display: block;
                    color: #98a2bb;
                    font-size: 10px;
                }

                .atlas-goal-values strong {
                    display: block;
                    margin-top: 4px;
                    overflow: hidden;
                    font-size: 13px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .atlas-goal-empty {
                    padding: 34px 16px;
                    text-align: center;
                }

                .atlas-goal-empty-icon {
                    margin-bottom: 12px;
                    font-size: 38px;
                }

                .atlas-goal-empty p {
                    margin:
                        8px
                        auto
                        0;
                    max-width: 300px;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .atlas-goal-actions {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                    gap: 10px;
                }

                .atlas-goal-danger {
                    width: 100%;
                    min-height: 52px;
                    border:
                        1px solid
                        rgba(
                            255,
                            95,
                            112,
                            0.2
                        );
                    border-radius: 16px;
                    color: #ff9aa5;
                    background:
                        rgba(
                            255,
                            95,
                            112,
                            0.07
                        );
                    font-size: 14px;
                    font-weight: 750;
                }

                .atlas-goal-secondary-action {
                    width: 100%;
                    min-height: 52px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.18
                        );
                    border-radius: 16px;
                    color: #c8d0e3;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.035
                        );
                    font-size: 14px;
                    font-weight: 750;
                }

                .atlas-goal-section-title {
                    margin:
                        22px
                        0
                        12px;
                    color: #c8d0e3;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .atlas-goal-description {
                    margin:
                        12px
                        0
                        0;
                    color: #98a2bb;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .atlas-goals-page {
                    padding-bottom:
                        calc(
                            98px +
                            env(
                                safe-area-inset-bottom
                            )
                        );
                }

                @media (
                    max-width: 360px
                ) {

                    .atlas-goals-summary {
                        grid-template-columns:
                            minmax(0, 1fr);
                    }

                    .atlas-goal-actions {
                        grid-template-columns:
                            minmax(0, 1fr);
                    }

                }

            </style>

        `;

    },

    goalCard(goal) {

        const progress =
            this.progress(
                goal
            );

        const remaining =
            this.remaining(
                goal
            );

        const monthlyRequired =
            this.monthlyRequired(
                goal
            );

        return `

            <button
                class="atlas-goal-card"
                type="button"
                data-goal-action="edit"
                data-goal-id="${this.escape(
                    goal.id
                )}"
                data-paused="${
                    goal.status ===
                    "paused"
                        ? "true"
                        : "false"
                }"
            >

                <div
                    class="atlas-goal-card-head"
                >

                    <div
                        class="atlas-goal-card-title"
                    >

                        <span
                            class="atlas-goal-icon"
                        >
                            ${this.escape(
                                goal.icon ||
                                this.typeIcon(
                                    goal.type
                                )
                            )}
                        </span>

                        <span>

                            <strong>
                                ${this.escape(
                                    goal.name
                                )}
                            </strong>

                            <small>
                                ${this.escape(
                                    this.typeLabel(
                                        goal.type
                                    )
                                )}
                                ·
                                ${this.escape(
                                    this.statusLabel(
                                        goal.status
                                    )
                                )}
                            </small>

                        </span>

                    </div>

                    <span
                        class="atlas-goal-percent"
                    >
                        ${progress.toFixed(0)}%
                    </span>

                </div>

                <div
                    class="atlas-goal-progress"
                    aria-label="Progreso ${progress.toFixed(0)}%"
                >
                    <span
                        style="
                            width:${progress}%;
                        "
                    ></span>
                </div>

                <div
                    class="atlas-goal-values"
                >

                    <div>

                        <small>
                            Acumulado
                        </small>

                        <strong>
                            ${this.formatCurrency(
                                goal.currentAmount
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Restante
                        </small>

                        <strong>
                            ${this.formatCurrency(
                                remaining
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Fecha límite
                        </small>

                        <strong>
                            ${this.escape(
                                this.formatDate(
                                    goal.deadline
                                )
                            )}
                        </strong>

                    </div>

                    <div>

                        <small>
                            Aportación mensual
                        </small>

                        <strong>
                            ${
                                monthlyRequired ===
                                null
                                    ? "Sin cálculo"
                                    : this.formatCurrency(
                                        monthlyRequired
                                    )
                            }
                        </strong>

                    </div>

                </div>

                ${
                    goal.description
                        ? `

                            <p
                                class="atlas-goal-description"
                            >
                                ${this.escape(
                                    goal.description
                                )}
                            </p>

                        `
                        : ""
                }

            </button>

        `;

    },

    render(
        data
    ) {

        this.data =
            data;

        this.ensureGoals(
            this.data
        );

        const summary =
            this.summary(
                this.data
            );

        const active =
            this.activeGoals(
                this.data
            );

        const completed =
            this.completedGoals(
                this.data
            );

        return `

            ${this.styles()}

            <div
                class="
                    app
                    atlas-goals-page
                "
            >

                ${AtlasUI.header()}

                <h1
                    class="page-title"
                >
                    Objetivos
                </h1>

                <p
                    class="subtitle"
                >
                    Planifica metas y sigue su progreso.
                </p>

                <section
                    class="atlas-goals-summary"
                >

                    <div
                        class="atlas-goals-summary-card"
                    >

                        <span>
                            Objetivos activos
                        </span>

                        <strong>
                            ${summary.activeCount}
                        </strong>

                    </div>

                    <div
                        class="atlas-goals-summary-card"
                    >

                        <span>
                            Pendiente total
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                summary.totalRemaining
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-goals-summary-card"
                    >

                        <span>
                            Aportación mensual
                        </span>

                        <strong>
                            ${this.formatCurrency(
                                summary.monthlyRequired
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-goals-summary-card"
                    >

                        <span>
                            Prioridad actual
                        </span>

                        <strong
                            style="
                                font-size:15px;
                            "
                        >
                            ${
                                summary.priorityGoal
                                    ? this.escape(
                                        summary
                                            .priorityGoal
                                            .name
                                    )
                                    : "Sin objetivo"
                            }
                        </strong>

                    </div>

                </section>

                <button
                    class="primary"
                    type="button"
                    data-goal-action="new"
                    style="
                        width:100%;
                        margin-bottom:18px;
                    "
                >
                    Nuevo objetivo
                </button>

                ${
                    active.length > 0
                        ? `

                            <div
                                class="atlas-goals-list"
                            >
                                ${active
                                    .map(
                                        goal =>
                                            this.goalCard(
                                                goal
                                            )
                                    )
                                    .join("")}
                            </div>

                        `
                        : `

                            <section
                                class="panel"
                            >

                                <div
                                    class="atlas-goal-empty"
                                >

                                    <div
                                        class="atlas-goal-empty-icon"
                                    >
                                        🎯
                                    </div>

                                    <strong>
                                        Todavía no tienes objetivos
                                    </strong>

                                    <p>
                                        Crea una meta para ahorrar,
                                        invertir, reducir una deuda
                                        o preparar un gasto futuro.
                                    </p>

                                </div>

                            </section>

                        `
                }

                ${
                    completed.length > 0
                        ? `

                            <h2
                                class="atlas-goal-section-title"
                            >
                                Completados y archivados
                            </h2>

                            <div
                                class="atlas-goals-list"
                            >
                                ${completed
                                    .map(
                                        goal =>
                                            this.goalCard(
                                                goal
                                            )
                                    )
                                    .join("")}
                            </div>

                        `
                        : ""
                }

            </div>

        `;

    },

    typeOptions(selected) {

        const options = [

            [
                "saving",
                "Ahorro"
            ],

            [
                "purchase",
                "Compra o gasto futuro"
            ],

            [
                "investment",
                "Inversión"
            ],

            [
                "debt",
                "Reducción de deuda"
            ],

            [
                "emergency",
                "Fondo de emergencia"
            ]

        ];

        return options
            .map(
                (
                    [
                        value,
                        label
                    ]
                ) => `

                    <option
                        value="${value}"
                        ${
                            value ===
                            selected
                                ? "selected"
                                : ""
                        }
                    >
                        ${label}
                    </option>

                `
            )
            .join("");

    },

    priorityOptions(selected) {

        const options = [

            [
                "high",
                "Alta"
            ],

            [
                "medium",
                "Media"
            ],

            [
                "low",
                "Baja"
            ]

        ];

        return options
            .map(
                (
                    [
                        value,
                        label
                    ]
                ) => `

                    <option
                        value="${value}"
                        ${
                            value ===
                            selected
                                ? "selected"
                                : ""
                        }
                    >
                        ${label}
                    </option>

                `
            )
            .join("");

    },

    statusOptions(selected) {

        const options = [

            [
                "active",
                "Activo"
            ],

            [
                "paused",
                "Pausado"
            ],

            [
                "completed",
                "Completado"
            ],

            [
                "archived",
                "Archivado"
            ],

            [
                "cancelled",
                "Cancelado"
            ]

        ];

        return options
            .map(
                (
                    [
                        value,
                        label
                    ]
                ) => `

                    <option
                        value="${value}"
                        ${
                            value ===
                            selected
                                ? "selected"
                                : ""
                        }
                    >
                        ${label}
                    </option>

                `
            )
            .join("");

    },

    openForm(goalId = null) {

        this.editingGoalId =
            goalId;

        const existing =
            goalId
                ? this.goals()
                    .find(
                        goal =>
                            goal.id ===
                            goalId
                    )
                : null;

        const goal =
            this.normalizeGoal(
                existing || {

                    name:
                        "",

                    description:
                        "",

                    type:
                        "saving",

                    targetAmount:
                        0,

                    currentAmount:
                        0,

                    deadline:
                        null,

                    priority:
                        "medium",

                    status:
                        "active",

                    notes:
                        ""

                }
            );

        AtlasSettings.renderSheet(`

            ${this.styles()}

            ${AtlasSettings.headerBlock(
                existing
                    ? "Editar objetivo"
                    : "Nuevo objetivo",
                "Configura la cantidad, el progreso y la fecha límite."
            )}

            <form
                class="atlas-settings-form"
                data-goal-form
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Nombre
                    </span>

                    <input
                        name="goalName"
                        type="text"
                        maxlength="70"
                        value="${this.escape(
                            goal.name
                        )}"
                        placeholder="Ejemplo: Fondo de emergencia"
                        required
                    >

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Descripción opcional
                    </span>

                    <input
                        name="goalDescription"
                        type="text"
                        maxlength="140"
                        value="${this.escape(
                            goal.description
                        )}"
                        placeholder="Para qué quieres conseguirlo"
                    >

                </label>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Tipo
                    </span>

                    <select
                        name="goalType"
                    >
                        ${this.typeOptions(
                            goal.type
                        )}
                    </select>

                </label>

                <div
                    class="atlas-goal-actions"
                >

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Cantidad objetivo
                        </span>

                        <input
                            name="goalTargetAmount"
                            type="number"
                            inputmode="decimal"
                            min="0.01"
                            step="0.01"
                            value="${this.escape(
                                goal.targetAmount
                            )}"
                            required
                        >

                    </label>

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Cantidad acumulada
                        </span>

                        <input
                            name="goalCurrentAmount"
                            type="number"
                            inputmode="decimal"
                            min="0"
                            step="0.01"
                            value="${this.escape(
                                goal.currentAmount
                            )}"
                            required
                        >

                    </label>

                </div>

                <div
                    class="atlas-goal-actions"
                >

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Fecha de inicio
                        </span>

                        <input
                            name="goalStartDate"
                            type="date"
                            value="${this.escape(
                                goal.startDate
                            )}"
                            required
                        >

                    </label>

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Fecha límite opcional
                        </span>

                        <input
                            name="goalDeadline"
                            type="date"
                            value="${this.escape(
                                goal.deadline ||
                                ""
                            )}"
                        >

                    </label>

                </div>

                <div
                    class="atlas-goal-actions"
                >

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Prioridad
                        </span>

                        <select
                            name="goalPriority"
                        >
                            ${this.priorityOptions(
                                goal.priority
                            )}
                        </select>

                    </label>

                    <label
                        class="atlas-settings-field"
                    >

                        <span>
                            Estado
                        </span>

                        <select
                            name="goalStatus"
                        >
                            ${this.statusOptions(
                                goal.status
                            )}
                        </select>

                    </label>

                </div>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Notas opcionales
                    </span>

                    <input
                        name="goalNotes"
                        type="text"
                        maxlength="200"
                        value="${this.escape(
                            goal.notes
                        )}"
                        placeholder="Información adicional"
                    >

                </label>

                <button
                    class="atlas-settings-primary"
                    type="submit"
                >
                    ${
                        existing
                            ? "Actualizar objetivo"
                            : "Crear objetivo"
                    }
                </button>

                ${
                    existing
                        ? `

                            <button
                                class="atlas-goal-danger"
                                type="button"
                                data-goal-action="delete"
                                data-goal-id="${this.escape(
                                    goal.id
                                )}"
                            >
                                Eliminar objetivo
                            </button>

                        `
                        : ""
                }

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

    },

    saveForm(form) {

        const values =
            new FormData(
                form
            );

        const name =
            String(
                values.get(
                    "goalName"
                ) ||
                ""
            ).trim();

        const targetAmount =
            this.number(
                values.get(
                    "goalTargetAmount"
                )
            );

        const currentAmount =
            this.number(
                values.get(
                    "goalCurrentAmount"
                )
            );

        const startDate =
            String(
                values.get(
                    "goalStartDate"
                ) ||
                ""
            );

        const deadline =
            String(
                values.get(
                    "goalDeadline"
                ) ||
                ""
            );

        if (!name) {

            AtlasUI.toast(
                "Introduce un nombre para el objetivo."
            );

            return;

        }

        if (
            !Number.isFinite(
                targetAmount
            ) ||
            targetAmount <= 0
        ) {

            AtlasUI.toast(
                "Introduce una cantidad objetivo válida."
            );

            return;

        }

        if (
            !Number.isFinite(
                currentAmount
            ) ||
            currentAmount < 0
        ) {

            AtlasUI.toast(
                "Introduce una cantidad acumulada válida."
            );

            return;

        }

        if (
            deadline &&
            startDate &&
            deadline <
                startDate
        ) {

            AtlasUI.toast(
                "La fecha límite no puede ser anterior a la fecha de inicio."
            );

            return;

        }

        const updatedData =
            JSON.parse(
                JSON.stringify(
                    this.data
                )
            );

        this.ensureGoals(
            updatedData
        );

        const existingIndex =
            this.editingGoalId
                ? updatedData.goals
                    .findIndex(
                        goal =>
                            goal.id ===
                            this.editingGoalId
                    )
                : -1;

        const previous =
            existingIndex >= 0
                ? updatedData.goals[
                    existingIndex
                ]
                : null;

        let status =
            String(
                values.get(
                    "goalStatus"
                ) ||
                "active"
            );

        if (
            currentAmount >=
            targetAmount &&
            ![
                "archived",
                "cancelled"
            ].includes(
                status
            )
        ) {

            status =
                "completed";

        }

        const normalized =
            this.normalizeGoal({

                ...(previous || {}),

                id:
                    previous?.id ||
                    this.createId(),

                name,

                description:
                    String(
                        values.get(
                            "goalDescription"
                        ) ||
                        ""
                    ).trim(),

                type:
                    String(
                        values.get(
                            "goalType"
                        ) ||
                        "saving"
                    ),

                targetAmount,

                currentAmount,

                startDate,

                deadline:
                    deadline ||
                    null,

                priority:
                    String(
                        values.get(
                            "goalPriority"
                        ) ||
                        "medium"
                    ),

                status,

                notes:
                    String(
                        values.get(
                            "goalNotes"
                        ) ||
                        ""
                    ).trim(),

                completedAt:
                    status ===
                    "completed"
                        ? (
                            previous
                                ?.completedAt ||
                            this.now()
                        )
                        : null,

                createdAt:
                    previous
                        ?.createdAt ||
                    this.now(),

                updatedAt:
                    this.now()

            });

        if (
            existingIndex >= 0
        ) {

            updatedData.goals[
                existingIndex
            ] = normalized;

        } else {

            updatedData.goals.push(
                normalized
            );

        }

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo guardar el objetivo."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        AtlasSettings.close();

        if (
            typeof AtlasApp !==
                "undefined"
        ) {

            AtlasApp.data =
                this.data;

            AtlasApp.route =
                "goals";

            AtlasApp.render();

        }

        AtlasUI.toast(
            existingIndex >= 0
                ? "Objetivo actualizado."
                : "Objetivo creado."
        );

    },

    deleteGoal(goalId) {

        const goal =
            this.goals()
                .find(
                    item =>
                        item.id ===
                        goalId
                );

        if (!goal) {

            return;

        }

        const confirmed =
            window.confirm(
                `¿Eliminar el objetivo “${goal.name}”?`
            );

        if (!confirmed) {

            return;

        }

        const updatedData =
            JSON.parse(
                JSON.stringify(
                    this.data
                )
            );

        updatedData.goals =
            this.goals(
                updatedData
            ).filter(
                item =>
                    item.id !==
                    goalId
            );

        const saved =
            AtlasStorage.save(
                updatedData
            );

        if (!saved) {

            AtlasUI.toast(
                "No se pudo eliminar el objetivo."
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        AtlasSettings.close();

        if (
            typeof AtlasApp !==
                "undefined"
        ) {

            AtlasApp.data =
                this.data;

            AtlasApp.route =
                "goals";

            AtlasApp.render();

        }

        AtlasUI.toast(
            "Objetivo eliminado."
        );

    },

    installRenderer() {

        if (
            this.originalRender ||
            typeof AtlasUI ===
                "undefined"
        ) {

            return;

        }

        this.originalRender =
            AtlasUI.render.bind(
                AtlasUI
            );

        AtlasUI.render =
            (
                route,
                data,
                options = {}
            ) => {

                if (
                    route ===
                    "goals"
                ) {

                    const app =
                        document.getElementById(
                            "app"
                        );

                    if (!app) {

                        return;

                    }

                    app.innerHTML =
                        this.render(
                            data
                        );

                    document
                        .querySelectorAll(
                            ".tabbar button[data-route]"
                        )
                        .forEach(
                            button => {

                                button.classList.toggle(
                                    "active",
                                    button.dataset.route ===
                                        "goals"
                                );

                            }
                        );

                    return;

                }

                this.originalRender(
                    route,
                    data,
                    options
                );

            };

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-goal-action]"
                    );

                if (!button) {

                    return;

                }

                const action =
                    button.dataset
                        .goalAction;

                if (
                    action ===
                    "new"
                ) {

                    this.openForm();

                    return;

                }

                if (
                    action ===
                    "edit"
                ) {

                    this.openForm(
                        button.dataset
                            .goalId
                    );

                    return;

                }

                if (
                    action ===
                    "delete"
                ) {

                    this.deleteGoal(
                        button.dataset
                            .goalId
                    );

                }

            }
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-goal-form]"
                    );

                if (!form) {

                    return;

                }

                event.preventDefault();

                this.saveForm(
                    form
                );

            }
        );

    },

    init() {

        if (
            this.initialized
        ) {

            return;

        }

        this.initialized =
            true;

        this.installRenderer();

        this.bindEvents();

    }

};

AtlasGoals.init();

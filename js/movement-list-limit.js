/* ==========================================================
   ATLAS
   movement-list-limit.js
   Atlas v1.0 — Límite y desplegable de movimientos
========================================================== */

const AtlasMovementListLimit = {

    initialized:
        false,

    limit:
        8,

    movementMonth(movement) {

        return String(
            movement?.date || ""
        ).slice(
            0,
            7
        );

    },

    sortedMovements(
        data,
        monthKey
    ) {

        return (
            Array.isArray(
                data?.movements
            )
                ? data.movements
                : []
        )
            .filter(
                movement =>
                    this.movementMonth(
                        movement
                    ) ===
                    monthKey
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const dateComparison =
                        String(
                            second.date || ""
                        ).localeCompare(
                            String(
                                first.date || ""
                            )
                        );

                    if (
                        dateComparison !== 0
                    ) {

                        return dateComparison;

                    }

                    return String(
                        second.createdAt || ""
                    ).localeCompare(
                        String(
                            first.createdAt || ""
                        )
                    );

                }
            );

    },

    movementRow(
        movement,
        index
    ) {

        const hidden =
            index >=
            this.limit;

        const realMonth =
            String(
                movement?.date || ""
            ).slice(
                0,
                7
            );

        const economicMonth =
            (
                movement?.periodMonth ||
                movement?.economicMonth ||
                movement?.imputedMonth ||
                realMonth
            );

        const differentPeriod =
            economicMonth &&
            realMonth &&
            economicMonth !==
                realMonth;

        return `

            <button
                class="row"
                type="button"
                data-movement-id="${AtlasUI.escapeHtml(
                    movement.id
                )}"
                data-limited-movement
                data-hidden-movement="${
                    hidden
                        ? "true"
                        : "false"
                }"
                style="
                    width:100%;
                    border:0;
                    background:
                        transparent;
                    color:inherit;
                    text-align:left;
                    cursor:pointer;
                    ${
                        hidden
                            ? "display:none;"
                            : ""
                    }
                "
            >

                <div>

                    <b>
                        ${AtlasUI.escapeHtml(
                            movement.category ||
                            AtlasUI.movementLabel(
                                movement
                            )
                        )}
                    </b>

                    <small>

                        ${AtlasUI.formatMovementDate(
                            movement.date
                        )}

                        ·

                        ${AtlasUI.movementLabel(
                            movement
                        )}

                    </small>

                    ${
                        differentPeriod
                            ? `

                                <small
                                    style="
                                        color:
                                            var(
                                                --color-primary
                                            );
                                    "
                                >
                                    Imputado a
                                    ${AtlasUI.escapeHtml(
                                        AtlasUI.formatMonthKey(
                                            economicMonth
                                        )
                                    )}
                                </small>

                            `
                            : ""
                    }

                    ${
                        movement.note
                            ? `

                                <small>
                                    ${AtlasUI.escapeHtml(
                                        movement.note
                                    )}
                                </small>

                            `
                            : ""
                    }

                </div>

                <strong
                    style="
                        color:
                            ${AtlasUI.movementColor(
                                movement
                            )};
                        white-space:
                            nowrap;
                    "
                >
                    ${AtlasUI.movementAmount(
                        movement
                    )}
                </strong>

            </button>

        `;

    },

    toggleButton(total) {

        if (
            total <=
            this.limit
        ) {

            return "";

        }

        const hidden =
            total -
            this.limit;

        return `

            <button
                class="secondary"
                type="button"
                data-action="toggleMovementList"
                data-expanded="false"
                data-total="${total}"
                data-limit="${this.limit}"
                style="
                    width:100%;
                    min-height:46px;
                    margin-top:14px;
                "
            >
                Ver todos (${hidden} más)
            </button>

        `;

    },

    renderMovements(
        data,
        options = {}
    ) {

        const movementsMonth =
            options.movementsMonth ||
            AtlasCalculations
                .monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations
                .monthKey();

        const isCurrentMonth =
            movementsMonth ===
            currentMonth;

        const list =
            this.sortedMovements(
                data,
                movementsMonth
            );

        const visibleCount =
            Math.min(
                this.limit,
                list.length
            );

        return `

            <div class="app">

                ${AtlasUI.header()}

                <h1 class="page-title">
                    Movimientos
                </h1>

                <p class="subtitle">
                    Consulta y edita las operaciones de cada mes.
                </p>

                ${AtlasUI.monthSelector({

                    monthKey:
                        movementsMonth,

                    isCurrentMonth,

                    previousAction:
                        "previousMovementsMonth",

                    nextAction:
                        "nextMovementsMonth",

                    currentAction:
                        "currentMovementsMonth",

                    subtitle:
                        list.length === 0
                            ? "Sin movimientos"
                            : (
                                `Mostrando ${visibleCount} de ` +
                                `${list.length} ` +
                                `${
                                    list.length === 1
                                        ? "movimiento"
                                        : "movimientos"
                                }`
                            )

                })}

                <section class="panel">

                    ${
                        list.length === 0
                            ? `

                                <div
                                    style="
                                        text-align:center;
                                        padding:28px 14px;
                                    "
                                >

                                    <div
                                        style="
                                            font-size:30px;
                                            margin-bottom:10px;
                                        "
                                    >
                                        🗓️
                                    </div>

                                    <strong>
                                        Sin movimientos
                                    </strong>

                                    <p
                                        class="note"
                                        style="
                                            margin-top:8px;
                                        "
                                    >
                                        No hay actividad registrada en
                                        ${AtlasUI.formatMonthKey(
                                            movementsMonth
                                        )}.
                                    </p>

                                </div>

                            `
                            : `

                                <div
                                    class="list"
                                    data-movement-list
                                >

                                    ${list
                                        .map(
                                            (
                                                movement,
                                                index
                                            ) =>
                                                this.movementRow(
                                                    movement,
                                                    index
                                                )
                                        )
                                        .join("")}

                                </div>

                                ${this.toggleButton(
                                    list.length
                                )}

                            `
                    }

                </section>

                <button
                    class="primary"
                    type="button"
                    data-action="newMovement"
                >
                    Nuevo movimiento
                </button>

            </div>

        `;

    },

    toggleList(button) {

        const app =
            button.closest(
                ".app"
            );

        if (!app) {

            return;

        }

        const rows =
            app.querySelectorAll(
                "[data-limited-movement]"
            );

        const expanded =
            button.dataset
                .expanded ===
            "true";

        const total =
            Number(
                button.dataset.total
            ) || rows.length;

        const limit =
            Number(
                button.dataset.limit
            ) || this.limit;

        rows.forEach(
            (
                row,
                index
            ) => {

                if (expanded) {

                    row.style.display =
                        index < limit
                            ? ""
                            : "none";

                } else {

                    row.style.display =
                        "";

                }

            }
        );

        button.dataset.expanded =
            expanded
                ? "false"
                : "true";

        button.textContent =
            expanded
                ? (
                    `Ver todos (` +
                    `${Math.max(
                        0,
                        total - limit
                    )} más)`
                )
                : "Ver menos";

        if (expanded) {

            const panel =
                button.closest(
                    ".panel"
                );

            if (panel) {

                panel.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }

        }

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        '[data-action="toggleMovementList"]'
                    );

                if (!button) {

                    return;

                }

                event.preventDefault();
                event.stopPropagation();

                this.toggleList(
                    button
                );

            }
        );

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasUI ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        AtlasUI.movements =
            (
                data,
                options = {}
            ) =>
                this.renderMovements(
                    data,
                    options
                );

        this.bindEvents();

    }

};

AtlasMovementListLimit.install();

/* ==========================================================
   ATLAS
   movement-list-limit.js
   Atlas v1.0 — Ver todos y ver menos en Movimientos
========================================================== */

const AtlasMovementListLimit = {

    initialized:
        false,

    limit:
        8,

    expanded:
        false,

    eventsBound:
        false,

    escape(value) {

        return AtlasUI.escapeHtml(
            String(value ?? "")
        );

    },

    realMonth(movement) {

        return String(
            movement?.date || ""
        ).slice(
            0,
            7
        );

    },

    economicMonth(movement) {

        return (
            movement?.periodMonth ||
            movement?.economicMonth ||
            movement?.imputedMonth ||
            this.realMonth(
                movement
            )
        );

    },

    movementRow(
        data,
        movement
    ) {

        const accountDescription =
            AtlasMovementFilters
                .movementAccountDescription(
                    data,
                    movement
                );

        const realMonth =
            this.realMonth(
                movement
            );

        const economicMonth =
            this.economicMonth(
                movement
            );

        const differentMonth =
            realMonth &&
            economicMonth &&
            realMonth !==
                economicMonth;

        return `

            <button
                class="row atlas-movement-row"
                type="button"
                data-movement-id="${this.escape(
                    movement.id
                )}"
            >

                <div class="atlas-movement-row-content">

                    <b>

                        <span
                            class="atlas-movement-row-icon"
                            aria-hidden="true"
                        >
                            ${AtlasMovementFilters.movementIcon(
                                movement
                            )}
                        </span>

                        ${this.escape(
                            movement.category ||
                            AtlasMovementFilters
                                .movementLabel(
                                    movement
                                )
                        )}

                    </b>

                    <small>

                        ${AtlasUI.formatMovementDate(
                            movement.date
                        )}

                        ·

                        ${AtlasMovementFilters
                            .movementLabel(
                                movement
                            )}

                    </small>

                    ${
                        differentMonth
                            ? `

                                <small
                                    class="atlas-movement-imputed-month"
                                >
                                    Imputado a
                                    ${this.escape(
                                        AtlasUI.formatMonthKey(
                                            economicMonth
                                        )
                                    )}
                                </small>

                            `
                            : ""
                    }

                    ${
                        accountDescription
                            ? `

                                <small>
                                    ${this.escape(
                                        accountDescription
                                    )}
                                </small>

                            `
                            : ""
                    }

                    ${
                        movement.note
                            ? `

                                <small
                                    class="atlas-movement-note"
                                >
                                    ${this.escape(
                                        movement.note
                                    )}
                                </small>

                            `
                            : ""
                    }

                </div>

                <strong
                    class="atlas-movement-row-amount"
                    style="
                        color:
                            ${AtlasMovementFilters
                                .movementColor(
                                    movement
                                )};
                    "
                >
                    ${AtlasMovementFilters
                        .movementAmount(
                            movement
                        )}
                </strong>

            </button>

        `;

    },

    listButton(total) {

        if (
            total <=
            this.limit
        ) {

            return "";

        }

        const hidden =
            Math.max(
                0,
                total -
                this.limit
            );

        return `

            <button
                class="secondary atlas-movement-list-toggle"
                type="button"
                data-action="toggleMovementListLimit"
                data-expanded="${
                    this.expanded
                        ? "true"
                        : "false"
                }"
            >
                ${
                    this.expanded
                        ? "Ver menos"
                        : `Ver todos (${hidden} más)`
                }
            </button>

        `;

    },

    visibleList(list) {

        if (
            this.expanded ||
            list.length <=
                this.limit
        ) {

            return list;

        }

        return list.slice(
            0,
            this.limit
        );

    },

    registeredView(
        data,
        filters,
        list,
        allMonthlyMovements,
        movementsMonth,
        filtersActive
    ) {

        const visible =
            this.visibleList(
                list
            );

        return `

            ${AtlasMovementFilters.filtersPanel(
                data,
                filters,
                list.length,
                allMonthlyMovements.length,
                movementsMonth
            )}

            ${AtlasMovementFilters.summaryPanel(
                list
            )}

            <section class="panel atlas-movement-list-panel">

                ${
                    list.length === 0
                        ? AtlasMovementFilters
                            .emptyState(
                                movementsMonth,
                                filtersActive
                            )
                        : `

                            <div
                                class="atlas-movement-list-status"
                            >

                                <small>

                                    Mostrando
                                    ${visible.length}
                                    de
                                    ${list.length}

                                    ${
                                        list.length === 1
                                            ? "movimiento"
                                            : "movimientos"
                                    }

                                </small>

                            </div>

                            <div class="list">

                                ${visible
                                    .map(
                                        movement =>
                                            this.movementRow(
                                                data,
                                                movement
                                            )
                                    )
                                    .join("")}

                            </div>

                            ${this.listButton(
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

        `;

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-movement-list-limit-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-movement-list-limit-styles";

        style.textContent = `

            .atlas-movement-list-status {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                min-height: 24px;
                margin-bottom: 6px;
            }

            .atlas-movement-list-status small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-movement-list-toggle {
                width: 100%;
                min-height: 46px;
                margin-top: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.16
                    );
                border-radius: 14px;
                color:
                    var(
                        --color-primary
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.06
                    );
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-movement-imputed-month {
                margin-top: 3px;
                color:
                    var(
                        --color-primary
                    ) !important;
            }

        `;

        document.head.appendChild(
            style
        );

    },

    toggle() {

        this.expanded =
            !this.expanded;

        if (
            typeof AtlasApp !==
                "undefined" &&
            typeof AtlasApp.render ===
                "function"
        ) {

            AtlasApp.render();

        }

    },

    bindEvents() {

        if (
            this.eventsBound
        ) {

            return;

        }

        this.eventsBound =
            true;

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        '[data-action="toggleMovementListLimit"]'
                    );

                if (!button) {

                    return;

                }

                event.preventDefault();
                event.stopPropagation();

                this.toggle();

            },
            true
        );

        document.addEventListener(
            "click",
            event => {

                const monthButton =
                    event.target.closest(
                        [
                            '[data-action="previousMovementsMonth"]',
                            '[data-action="nextMovementsMonth"]',
                            '[data-action="currentMovementsMonth"]',
                            '[data-action="clearMovementFilters"]',
                            '[data-action="showRegisteredMovements"]',
                            '[data-action="showPendingMovements"]'
                        ].join(",")
                    );

                if (!monthButton) {

                    return;

                }

                this.expanded =
                    false;

            },
            true
        );

        document.addEventListener(
            "submit",
            event => {

                const form =
                    event.target.closest(
                        "[data-movement-filters-form]"
                    );

                if (!form) {

                    return;

                }

                this.expanded =
                    false;

            },
            true
        );

        document.addEventListener(
            "change",
            event => {

                const filter =
                    event.target.closest(
                        [
                            "[data-movement-type-filter]",
                            "[data-movement-account-filter]",
                            "[data-movement-advanced-filter]"
                        ].join(",")
                    );

                if (!filter) {

                    return;

                }

                this.expanded =
                    false;

            },
            true
        );

    },

    patch() {

        if (
            typeof AtlasMovementFilters ===
                "undefined"
        ) {

            return false;

        }

        AtlasMovementFilters.registeredView =
            (
                data,
                filters,
                list,
                allMonthlyMovements,
                movementsMonth,
                filtersActive
            ) =>
                this.registeredView(
                    data,
                    filters,
                    list,
                    allMonthlyMovements,
                    movementsMonth,
                    filtersActive
                );

        return true;

    },

    install() {

        if (
            this.initialized
        ) {

            return;

        }

        const completeInstall =
            () => {

                if (
                    !this.patch()
                ) {

                    return false;

                }

                this.initialized =
                    true;

                this.installStyles();
                this.bindEvents();

                if (
                    typeof AtlasApp !==
                        "undefined" &&
                    AtlasApp.route ===
                        "movements" &&
                    typeof AtlasApp.render ===
                        "function"
                ) {

                    AtlasApp.render();

                }

                return true;

            };

        if (
            completeInstall()
        ) {

            return;

        }

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                completeInstall();

            },
            {
                once:
                    true
            }
        );

        window.addEventListener(
            "load",
            () => {

                completeInstall();

            },
            {
                once:
                    true
            }
        );

    }

};

AtlasMovementListLimit.install();

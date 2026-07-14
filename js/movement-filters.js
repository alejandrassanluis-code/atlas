/* ==========================================================
   ATLAS
   movement-filters.js
   Sprint 7.3 — Resumen y filtros avanzados
========================================================== */

const AtlasMovementFilters = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    normalize(value) {

        return String(
            value || ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    },

    escape(value) {

        return AtlasUI.escapeHtml(
            value
        );

    },

    movementKind(movement) {

        if (
            movement?.kind ===
            "debt_payment"
        ) {

            return "debt_payment";

        }

        return movement?.type || "";

    },

    movementLabel(movement) {

        const kind =
            this.movementKind(
                movement
            );

        const labels = {

            income:
                "Ingreso",

            expense:
                "Gasto",

            transfer:
                "Traspaso",

            investment:
                "Inversión",

            debt_payment:
                "Pago de deuda"

        };

        return (
            labels[kind] ||
            "Movimiento"
        );

    },

    movementAmount(movement) {

        const kind =
            this.movementKind(
                movement
            );

        if (
            kind === "income"
        ) {

            return (
                "+" +
                AtlasUI.formatCurrency(
                    movement.amount
                )
            );

        }

        if (
            kind === "transfer"
        ) {

            return AtlasUI.formatCurrency(
                movement.amount
            );

        }

        return (
            "−" +
            AtlasUI.formatCurrency(
                movement.amount
            )
        );

    },

    movementColor(movement) {

        const kind =
            this.movementKind(
                movement
            );

        if (
            kind === "income"
        ) {

            return "var(--color-success)";

        }

        if (
            kind === "transfer"
        ) {

            return "var(--color-primary)";

        }

        if (
            kind === "investment"
        ) {

            return "#9d8cff";

        }

        return "var(--color-danger)";

    },

    movementIcon(movement) {

        const kind =
            this.movementKind(
                movement
            );

        const icons = {

            income:
                "🟢",

            expense:
                "🔴",

            transfer:
                "🔁",

            investment:
                "📈",

            debt_payment:
                "💳"

        };

        return (
            icons[kind] ||
            "•"
        );

    },

    accounts(data) {

        return Array.isArray(
            data?.accounts
        )
            ? data.accounts
            : [];

    },

    findAccount(
        data,
        accountId
    ) {

        return this.accounts(data)
            .find(
                account =>
                    account.id ===
                    accountId
            ) || null;

    },

    accountName(
        data,
        accountId
    ) {

        return (
            this.findAccount(
                data,
                accountId
            )?.name ||
            ""
        );

    },

    movementAccountIds(movement) {

        return [

            movement?.accountId,

            movement?.fromAccountId,

            movement?.toAccountId

        ].filter(Boolean);

    },

    movementAccountNames(
        data,
        movement
    ) {

        return this
            .movementAccountIds(
                movement
            )
            .map(
                accountId =>
                    this.accountName(
                        data,
                        accountId
                    )
            )
            .filter(Boolean);

    },

    movementAccountDescription(
        data,
        movement
    ) {

        const kind =
            this.movementKind(
                movement
            );

        if (
            kind === "income" ||
            kind === "expense"
        ) {

            return this.accountName(
                data,
                movement.accountId
            );

        }

        const fromName =
            this.accountName(
                data,
                movement.fromAccountId
            );

        const toName =
            this.accountName(
                data,
                movement.toAccountId
            );

        if (
            fromName &&
            toName
        ) {

            return (
                `${fromName} → ${toName}`
            );

        }

        return (
            fromName ||
            toName ||
            ""
        );

    },

    movementSearchText(
        data,
        movement
    ) {

        const values = [

            movement.category,

            movement.note,

            this.movementLabel(
                movement
            ),

            movement.type,

            movement.kind,

            movement.categoryId,

            movement.subcategoryId,

            ...this.movementAccountNames(
                data,
                movement
            )

        ];

        return this.normalize(
            values
                .filter(Boolean)
                .join(" ")
        );

    },

    matchesSearch(
        data,
        movement,
        search
    ) {

        const normalizedSearch =
            this.normalize(
                search
            );

        if (!normalizedSearch) {

            return true;

        }

        const terms =
            normalizedSearch
                .split(" ")
                .filter(Boolean);

        const searchableText =
            this.movementSearchText(
                data,
                movement
            );

        return terms.every(
            term =>
                searchableText.includes(
                    term
                )
        );

    },

    matchesType(
        movement,
        type
    ) {

        if (
            !type ||
            type === "all"
        ) {

            return true;

        }

        return (
            this.movementKind(
                movement
            ) === type
        );

    },

    matchesAccount(
        movement,
        accountId
    ) {

        if (
            !accountId ||
            accountId === "all"
        ) {

            return true;

        }

        return this
            .movementAccountIds(
                movement
            )
            .includes(
                accountId
            );

    },

    matchesAmount(
        movement,
        minimumAmount,
        maximumAmount
    ) {

        const amount =
            this.number(
                movement?.amount
            );

        if (
            minimumAmount !== "" &&
            minimumAmount !== null &&
            minimumAmount !== undefined
        ) {

            const minimum =
                this.number(
                    minimumAmount
                );

            if (
                amount < minimum
            ) {

                return false;

            }

        }

        if (
            maximumAmount !== "" &&
            maximumAmount !== null &&
            maximumAmount !== undefined
        ) {

            const maximum =
                this.number(
                    maximumAmount
                );

            if (
                amount > maximum
            ) {

                return false;

            }

        }

        return true;

    },

    matchesDate(
        movement,
        dateFrom,
        dateTo
    ) {

        const movementDate =
            String(
                movement?.date || ""
            );

        if (
            dateFrom &&
            movementDate < dateFrom
        ) {

            return false;

        }

        if (
            dateTo &&
            movementDate > dateTo
        ) {

            return false;

        }

        return true;

    },

    filteredMovements(
        data,
        monthKey,
        filters
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
                    String(
                        movement.date || ""
                    ).slice(
                        0,
                        7
                    ) === monthKey
            )
            .filter(
                movement =>
                    this.matchesSearch(
                        data,
                        movement,
                        filters.search
                    )
            )
            .filter(
                movement =>
                    this.matchesType(
                        movement,
                        filters.type
                    )
            )
            .filter(
                movement =>
                    this.matchesAccount(
                        movement,
                        filters.accountId
                    )
            )
            .filter(
                movement =>
                    this.matchesAmount(
                        movement,
                        filters.minimumAmount,
                        filters.maximumAmount
                    )
            )
            .filter(
                movement =>
                    this.matchesDate(
                        movement,
                        filters.dateFrom,
                        filters.dateTo
                    )
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

    monthlyMovements(
        data,
        monthKey
    ) {

        return (
            Array.isArray(
                data?.movements
            )
                ? data.movements
                : []
        ).filter(
            movement =>
                String(
                    movement.date || ""
                ).slice(
                    0,
                    7
                ) === monthKey
        );

    },

    activeAccounts(data) {

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

    accountOptions(
        data,
        selectedId
    ) {

        return `

            <option value="all">
                Todas las cuentas
            </option>

            ${this.activeAccounts(data)
                .map(
                    account => `

                        <option
                            value="${this.escape(
                                account.id
                            )}"
                            ${
                                account.id ===
                                selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${this.escape(
                                account.name
                            )}
                        </option>

                    `
                )
                .join("")}

        `;

    },

    typeOptions(selectedType) {

        const options = [

            {
                value:
                    "all",

                label:
                    "Todos los tipos"
            },

            {
                value:
                    "income",

                label:
                    "Ingresos"
            },

            {
                value:
                    "expense",

                label:
                    "Gastos"
            },

            {
                value:
                    "investment",

                label:
                    "Inversiones"
            },

            {
                value:
                    "transfer",

                label:
                    "Traspasos"
            },

            {
                value:
                    "debt_payment",

                label:
                    "Pagos de deuda"
            }

        ];

        return options
            .map(
                option => `

                    <option
                        value="${option.value}"
                        ${
                            option.value ===
                            selectedType
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

    monthDateLimits(monthKey) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(Number);

        if (
            !year ||
            !month
        ) {

            return {

                minimum:
                    "",

                maximum:
                    ""

            };

        }

        const lastDay =
            new Date(
                year,
                month,
                0
            ).getDate();

        return {

            minimum:
                `${monthKey}-01`,

            maximum:
                `${monthKey}-${String(
                    lastDay
                ).padStart(
                    2,
                    "0"
                )}`

        };

    },

    filtersPanel(
        data,
        filters,
        resultCount,
        totalCount,
        monthKey
    ) {

        const filtersActive =
            Boolean(

                filters.search ||

                filters.type !==
                    "all" ||

                filters.accountId !==
                    "all" ||

                filters.minimumAmount !==
                    "" ||

                filters.maximumAmount !==
                    "" ||

                filters.dateFrom ||

                filters.dateTo

            );

        const dateLimits =
            this.monthDateLimits(
                monthKey
            );

        return `

            <form
                class="atlas-movement-filters"
                data-movement-filters-form
            >

                <label class="atlas-movement-search">

                    <span aria-hidden="true">
                        ⌕
                    </span>

                    <input
                        type="search"
                        name="movementSearch"
                        value="${this.escape(
                            filters.search
                        )}"
                        placeholder="Buscar categoría, cuenta o nota"
                        autocomplete="off"
                        enterkeyhint="search"
                    >

                    <button
                        type="submit"
                        aria-label="Buscar movimientos"
                    >
                        Buscar
                    </button>

                </label>

                <div class="atlas-movement-filter-grid">

                    <label>

                        <span>
                            Tipo
                        </span>

                        <select
                            name="movementTypeFilter"
                            data-movement-type-filter
                        >
                            ${this.typeOptions(
                                filters.type
                            )}
                        </select>

                    </label>

                    <label>

                        <span>
                            Cuenta
                        </span>

                        <select
                            name="movementAccountFilter"
                            data-movement-account-filter
                        >
                            ${this.accountOptions(
                                data,
                                filters.accountId
                            )}
                        </select>

                    </label>

                </div>

                <details
                    class="atlas-movement-advanced"
                    ${
                        filters.minimumAmount !== "" ||
                        filters.maximumAmount !== "" ||
                        filters.dateFrom ||
                        filters.dateTo
                            ? "open"
                            : ""
                    }
                >

                    <summary>
                        Filtros avanzados
                    </summary>

                    <div class="atlas-movement-advanced-content">

                        <div class="atlas-movement-filter-grid">

                            <label>

                                <span>
                                    Importe mínimo
                                </span>

                                <div class="atlas-movement-amount-filter">

                                    <input
                                        type="number"
                                        name="movementMinimumAmount"
                                        min="0"
                                        step="0.01"
                                        inputmode="decimal"
                                        value="${this.escape(
                                            filters.minimumAmount
                                        )}"
                                        placeholder="0"
                                        data-movement-advanced-filter
                                    >

                                    <b>
                                        €
                                    </b>

                                </div>

                            </label>

                            <label>

                                <span>
                                    Importe máximo
                                </span>

                                <div class="atlas-movement-amount-filter">

                                    <input
                                        type="number"
                                        name="movementMaximumAmount"
                                        min="0"
                                        step="0.01"
                                        inputmode="decimal"
                                        value="${this.escape(
                                            filters.maximumAmount
                                        )}"
                                        placeholder="Sin límite"
                                        data-movement-advanced-filter
                                    >

                                    <b>
                                        €
                                    </b>

                                </div>

                            </label>

                        </div>

                        <div class="atlas-movement-filter-grid">

                            <label>

                                <span>
                                    Desde
                                </span>

                                <input
                                    type="date"
                                    name="movementDateFrom"
                                    min="${dateLimits.minimum}"
                                    max="${dateLimits.maximum}"
                                    value="${this.escape(
                                        filters.dateFrom
                                    )}"
                                    data-movement-advanced-filter
                                >

                            </label>

                            <label>

                                <span>
                                    Hasta
                                </span>

                                <input
                                    type="date"
                                    name="movementDateTo"
                                    min="${dateLimits.minimum}"
                                    max="${dateLimits.maximum}"
                                    value="${this.escape(
                                        filters.dateTo
                                    )}"
                                    data-movement-advanced-filter
                                >

                            </label>

                        </div>

                        <button
                            class="atlas-movement-apply"
                            type="submit"
                        >
                            Aplicar filtros
                        </button>

                    </div>

                </details>

                <div class="atlas-movement-filter-footer">

                    <small>

                        ${
                            filtersActive
                                ? `${resultCount} de ${totalCount}`
                                : totalCount
                        }

                        ${
                            resultCount === 1
                                ? "movimiento"
                                : "movimientos"
                        }

                    </small>

                    ${
                        filtersActive
                            ? `

                                <button
                                    type="button"
                                    data-action="clearMovementFilters"
                                >
                                    Limpiar filtros
                                </button>

                            `
                            : ""
                    }

                </div>

            </form>

        `;

    },

    movementSummary(list) {

        const summary = {

            income:
                0,

            expenses:
                0,

            invested:
                0,

            debtPayments:
                0,

            transfers:
                0

        };

        list.forEach(
            movement => {

                const amount =
                    this.number(
                        movement.amount
                    );

                const kind =
                    this.movementKind(
                        movement
                    );

                if (
                    kind === "income"
                ) {

                    summary.income +=
                        amount;

                    return;

                }

                if (
                    kind === "expense"
                ) {

                    summary.expenses +=
                        amount;

                    return;

                }

                if (
                    kind === "investment"
                ) {

                    summary.invested +=
                        amount;

                    return;

                }

                if (
                    kind === "debt_payment"
                ) {

                    summary.debtPayments +=
                        amount;

                    return;

                }

                if (
                    kind === "transfer"
                ) {

                    summary.transfers +=
                        amount;

                }

            }
        );

        summary.result =
            summary.income -
            summary.expenses -
            summary.invested;

        return summary;

    },

    summaryCard(
        icon,
        label,
        value,
        color
    ) {

        return `

            <article class="atlas-movement-summary-card">

                <small>
                    ${icon}
                    ${label}
                </small>

                <strong
                    style="
                        color:${color};
                    "
                >
                    ${AtlasUI.formatCurrency(
                        value
                    )}
                </strong>

            </article>

        `;

    },

    summaryPanel(list) {

        const summary =
            this.movementSummary(
                list
            );

        const resultColor =
            summary.result >= 0
                ? "var(--color-success)"
                : "var(--color-danger)";

        return `

            <section class="atlas-movement-summary">

                ${this.summaryCard(
                    "🟢",
                    "Ingresos",
                    summary.income,
                    "var(--color-success)"
                )}

                ${this.summaryCard(
                    "🔴",
                    "Gastos",
                    summary.expenses,
                    "var(--color-danger)"
                )}

                ${this.summaryCard(
                    "📈",
                    "Invertido",
                    summary.invested,
                    "#9d8cff"
                )}

                ${this.summaryCard(
                    "◎",
                    "Resultado",
                    summary.result,
                    resultColor
                )}

            </section>

        `;

    },

    emptyState(
        monthKey,
        filtersActive
    ) {

        if (
            filtersActive
        ) {

            return `

                <div class="atlas-movement-empty">

                    <div>
                        🔎
                    </div>

                    <strong>
                        Sin resultados
                    </strong>

                    <p class="note">
                        No hay movimientos que coincidan
                        con la búsqueda y los filtros.
                    </p>

                    <button
                        class="secondary"
                        type="button"
                        data-action="clearMovementFilters"
                    >
                        Limpiar filtros
                    </button>

                </div>

            `;

        }

        return `

            <div class="atlas-movement-empty">

                <div>
                    🗓️
                </div>

                <strong>
                    Sin movimientos
                </strong>

                <p class="note">
                    No hay actividad registrada en
                    ${AtlasUI.formatMonthKey(
                        monthKey
                    )}.
                </p>

            </div>

        `;

    },

    movementRow(
        data,
        movement
    ) {

        const accountDescription =
            this.movementAccountDescription(
                data,
                movement
            );

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
                            ${this.movementIcon(
                                movement
                            )}
                        </span>

                        ${this.escape(
                            movement.category ||
                            this.movementLabel(
                                movement
                            )
                        )}

                    </b>

                    <small>

                        ${AtlasUI.formatMovementDate(
                            movement.date
                        )}

                        ·

                        ${this.movementLabel(
                            movement
                        )}

                    </small>

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
                            ${this.movementColor(
                                movement
                            )};
                    "
                >
                    ${this.movementAmount(
                        movement
                    )}
                </strong>

            </button>

        `;

    },

    render(
        data,
        options = {}
    ) {

        const movementsMonth =
            options.movementsMonth ||
            AtlasCalculations.monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const isCurrentMonth =
            movementsMonth ===
            currentMonth;

        const filters = {

            search:
                String(
                    options.movementSearch ??
                    options.movementFilters
                        ?.search ??
                    ""
                ),

            type:
                String(
                    options.movementTypeFilter ??
                    options.movementFilters
                        ?.type ??
                    "all"
                ),

            accountId:
                String(
                    options.movementAccountFilter ??
                    options.movementFilters
                        ?.accountId ??
                    "all"
                ),

            minimumAmount:
                String(
                    options.movementMinimumAmount ??
                    options.movementFilters
                        ?.minimumAmount ??
                    ""
                ),

            maximumAmount:
                String(
                    options.movementMaximumAmount ??
                    options.movementFilters
                        ?.maximumAmount ??
                    ""
                ),

            dateFrom:
                String(
                    options.movementDateFrom ??
                    options.movementFilters
                        ?.dateFrom ??
                    ""
                ),

            dateTo:
                String(
                    options.movementDateTo ??
                    options.movementFilters
                        ?.dateTo ??
                    ""
                )

        };

        const allMonthlyMovements =
            this.monthlyMovements(
                data,
                movementsMonth
            );

        const list =
            this.filteredMovements(
                data,
                movementsMonth,
                filters
            );

        const filtersActive =
            Boolean(

                filters.search ||

                filters.type !==
                    "all" ||

                filters.accountId !==
                    "all" ||

                filters.minimumAmount !==
                    "" ||

                filters.maximumAmount !==
                    "" ||

                filters.dateFrom ||

                filters.dateTo

            );

        return `

            <div class="app atlas-movements-app">

                ${AtlasUI.header()}

                <h1 class="page-title">
                    Movimientos
                </h1>

                <p class="subtitle">
                    Consulta, filtra y edita las operaciones de cada mes.
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
                        `${allMonthlyMovements.length} ${
                            allMonthlyMovements.length ===
                            1
                                ? "movimiento"
                                : "movimientos"
                        }`

                })}

                ${this.filtersPanel(
                    data,
                    filters,
                    list.length,
                    allMonthlyMovements.length,
                    movementsMonth
                )}

                ${this.summaryPanel(
                    list
                )}

                <section class="panel atlas-movement-list-panel">

                    ${
                        list.length === 0
                            ? this.emptyState(
                                movementsMonth,
                                filtersActive
                            )
                            : `

                                <div class="list">

                                    ${list
                                        .map(
                                            movement =>
                                                this.movementRow(
                                                    data,
                                                    movement
                                                )
                                        )
                                        .join("")}

                                </div>

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

    installStyles() {

        if (
            document.getElementById(
                "atlas-movement-filter-styles"
            )
        ) {

            document
                .getElementById(
                    "atlas-movement-filter-styles"
                )
                .remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-movement-filter-styles";

        style.textContent = `

            .atlas-movements-app {
                padding-bottom:
                    calc(
                        112px +
                        env(
                            safe-area-inset-bottom
                        )
                    );
            }

            .atlas-movement-filters {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 14px;
                padding: 14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.15
                    );
                border-radius: 20px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-movement-search {
                display: grid;
                grid-template-columns:
                    26px
                    minmax(0, 1fr)
                    auto;
                align-items: center;
                min-height: 52px;
                padding:
                    0
                    7px
                    0
                    14px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.2
                    );
                border-radius: 16px;
                background: #19243a;
            }

            .atlas-movement-search > span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 22px;
            }

            .atlas-movement-search input {
                width: 100%;
                min-width: 0;
                min-height: 48px;
                padding:
                    0
                    8px;
                border: 0;
                outline: 0;
                background: transparent;
                color: #f7f8fc;
                font-size: 15px;
            }

            .atlas-movement-search input::placeholder {
                color:
                    rgba(
                        152,
                        162,
                        187,
                        0.78
                    );
            }

            .atlas-movement-search button {
                min-height: 38px;
                padding:
                    0
                    12px;
                border-radius: 12px;
                color: #ffffff;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.2
                    );
                font-size: 12px;
                font-weight: 750;
            }

            .atlas-movement-filter-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 10px;
            }

            .atlas-movement-filter-grid label {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 7px;
            }

            .atlas-movement-filter-grid label > span {
                padding-left: 3px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
                font-weight: 700;
            }

            .atlas-movement-filter-grid select,
            .atlas-movement-filter-grid input {
                width: 100%;
                min-width: 0;
                min-height: 48px;
                padding:
                    0
                    11px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.18
                    );
                border-radius: 14px;
                outline: 0;
                background: #19243a;
                color: #f7f8fc;
                font-size: 13px;
            }

            .atlas-movement-filter-grid input:focus,
            .atlas-movement-filter-grid select:focus {
                border-color:
                    var(
                        --color-primary
                    );
                box-shadow:
                    0 0 0 3px
                    rgba(
                        77,
                        163,
                        255,
                        0.1
                    );
            }

            .atlas-movement-advanced {
                overflow: hidden;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.13
                    );
                border-radius: 16px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.02
                    );
            }

            .atlas-movement-advanced summary {
                min-height: 46px;
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                padding:
                    0
                    13px;
                color:
                    var(
                        --color-text-muted
                    );
                cursor: pointer;
                font-size: 12px;
                font-weight: 750;
                list-style: none;
            }

            .atlas-movement-advanced summary::-webkit-details-marker {
                display: none;
            }

            .atlas-movement-advanced summary::after {
                content: "⌄";
                color:
                    var(
                        --color-primary
                    );
                font-size: 18px;
                transition:
                    transform
                    0.2s ease;
            }

            .atlas-movement-advanced[open]
            summary::after {
                transform:
                    rotate(180deg);
            }

            .atlas-movement-advanced-content {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding:
                    2px
                    12px
                    12px;
            }

            .atlas-movement-amount-filter {
                position: relative;
            }

            .atlas-movement-amount-filter input {
                padding-right: 32px;
            }

            .atlas-movement-amount-filter b {
                position: absolute;
                top: 50%;
                right: 12px;
                transform:
                    translateY(-50%);
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 13px;
            }

            .atlas-movement-apply {
                width: 100%;
                min-height: 44px;
                border-radius: 14px;
                color: #ffffff;
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.18
                    );
                font-size: 13px;
                font-weight: 750;
            }

            .atlas-movement-filter-footer {
                min-height: 25px;
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
            }

            .atlas-movement-filter-footer small {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 11px;
            }

            .atlas-movement-filter-footer button {
                color:
                    var(
                        --color-primary
                    );
                background: transparent;
                font-size: 11px;
                font-weight: 750;
            }

            .atlas-movement-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 9px;
                margin-bottom: 14px;
            }

            .atlas-movement-summary-card {
                min-width: 0;
                padding: 13px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.14
                    );
                border-radius: 17px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.028
                    );
            }

            .atlas-movement-summary-card small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-movement-summary-card strong {
                display: block;
                margin-top: 7px;
                overflow: hidden;
                font-size: 19px;
                line-height: 1.05;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-movement-list-panel {
                margin-bottom: 16px;
            }

            .atlas-movement-row {
                width: 100%;
                min-width: 0;
                border: 0;
                background: transparent;
                color: inherit;
                text-align: left;
                cursor: pointer;
            }

            .atlas-movement-row-content {
                min-width: 0;
            }

            .atlas-movement-row-content b {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-movement-row-icon {
                margin-right: 4px;
                font-size: 12px;
            }

            .atlas-movement-row-content small {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-movement-note {
                margin-top: 3px;
                color:
                    rgba(
                        200,
                        208,
                        227,
                        0.82
                    ) !important;
            }

            .atlas-movement-row-amount {
                flex: 0 0 auto;
                white-space: nowrap;
            }

            .atlas-movement-empty {
                padding:
                    30px
                    14px;
                text-align: center;
            }

            .atlas-movement-empty > div {
                margin-bottom: 10px;
                font-size: 30px;
            }

            .atlas-movement-empty p {
                margin:
                    8px
                    auto
                    0;
                max-width: 290px;
                line-height: 1.5;
            }

            .atlas-movement-empty button {
                margin-top: 17px;
            }

            @media (
                max-width: 360px
            ) {

                .atlas-movement-filter-grid {
                    grid-template-columns:
                        minmax(0, 1fr);
                }

                .atlas-movement-search {
                    grid-template-columns:
                        24px
                        minmax(0, 1fr);
                    padding-right: 12px;
                }

                .atlas-movement-search button {
                    grid-column:
                        1 / -1;
                    width: 100%;
                    margin-bottom: 8px;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    init() {

        this.installStyles();

        AtlasUI.movements = (
            data,
            options = {}
        ) =>
            this.render(
                data,
                options
            );

    }

};

AtlasMovementFilters.init();

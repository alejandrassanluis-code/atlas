/* ==========================================================
   ATLAS
   movement-filters.js
   Atlas v1.0 — Registrados y pendientes recurrentes
========================================================== */

const AtlasMovementFilters = {

    activeView:
        "registered",

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

        if (
            movement?.kind ===
                "reimbursement" ||
            movement?.type ===
                "reimbursement"
        ) {

            return "reimbursement";

        }

        return (
            movement?.kind ||
            movement?.type ||
            ""
        );

    },

    movementLabel(movement) {

        const kind =
            this.movementKind(
                movement
            );

        const labels = {

            income:
                "Ingreso",

            reimbursement:
                "Reembolso",

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
            kind === "income" ||
            kind === "reimbursement"
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
            kind ===
            "reimbursement"
        ) {

            return "#5fd6c1";

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

            reimbursement:
                "↩️",

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

            movement?.toAccountId,

            movement?.debtAccountId

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
            kind === "expense" ||
            kind === "reimbursement"
        ) {

            return this.accountName(
                data,
                movement.accountId
            );

        }

        const fromName =
            this.accountName(
                data,
                movement.fromAccountId ||
                movement.accountId
            );

        const toName =
            this.accountName(
                data,
                movement.toAccountId ||
                movement.debtAccountId
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
                    "reimbursement",

                label:
                    "Reembolsos"
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

            grossExpenses:
                0,

            reimbursements:
                0,

            expenses:
                0,

            invested:
                0,

            debtPayments:
                0,

            transfers:
                0,

            result:
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
                    kind ===
                    "reimbursement"
                ) {

                    summary.reimbursements +=
                        amount;

                    return;

                }

                if (
                    kind === "expense"
                ) {

                    summary.grossExpenses +=
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
                    kind ===
                    "debt_payment"
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

        summary.expenses =
            summary.grossExpenses -
            summary.reimbursements;

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
        color,
        subtitle = ""
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

                ${
                    subtitle
                        ? `

                            <span class="atlas-movement-summary-detail">
                                ${this.escape(
                                    subtitle
                                )}
                            </span>

                        `
                        : ""
                }

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

        const expenseSubtitle =
            summary.reimbursements > 0
                ? (
                    `Bruto ${
                        AtlasUI.formatCurrency(
                            summary.grossExpenses
                        )
                    } · Reemb. ${
                        AtlasUI.formatCurrency(
                            summary.reimbursements
                        )
                    }`
                )
                : "";

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
                    "Gastos netos",
                    summary.expenses,
                    "var(--color-danger)",
                    expenseSubtitle
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

    recurringRules(data) {

        return Array.isArray(
            data?.catalog
                ?.recurringRules
        )
            ? data.catalog
                .recurringRules
            : [];

    },

    findRecurringRule(
        data,
        ruleId
    ) {

        return this
            .recurringRules(
                data
            )
            .find(
                rule =>
                    rule.id ===
                    ruleId
            ) || null;

    },

    expenseCategories(data) {

        return Array.isArray(
            data?.catalog
                ?.categories
                ?.expense
        )
            ? data.catalog
                .categories
                .expense
            : [];

    },

    incomeCategories(data) {

        return Array.isArray(
            data?.catalog
                ?.categories
                ?.income
        )
            ? data.catalog
                .categories
                .income
            : [];

    },

    categoryCollection(
        data,
        kind
    ) {

        return kind === "income"
            ? this.incomeCategories(
                data
            )
            : this.expenseCategories(
                data
            );

    },

    findCategory(
        data,
        kind,
        categoryId
    ) {

        return this
            .categoryCollection(
                data,
                kind
            )
            .find(
                category =>
                    category.id ===
                    categoryId
            ) || null;

    },

    findSubcategory(
        category,
        subcategoryId
    ) {

        return (
            Array.isArray(
                category?.subcategories
            )
                ? category.subcategories
                : []
        ).find(
            subcategory =>
                subcategory.id ===
                subcategoryId
        ) || null;

    },

    occurrenceTitle(
        data,
        occurrence
    ) {

        const rule =
            this.findRecurringRule(
                data,
                occurrence.ruleId
            );

        if (
            rule?.name
        ) {

            return rule.name;

        }

        const kind =
            this.movementKind(
                occurrence
            );

        const category =
            this.findCategory(
                data,
                kind,
                occurrence.categoryId
            );

        const subcategory =
            this.findSubcategory(
                category,
                occurrence.subcategoryId
            );

        return (
            subcategory?.name ||
            category?.name ||
            this.movementLabel(
                occurrence
            )
        );

    },

    occurrenceCategoryDescription(
        data,
        occurrence
    ) {

        const kind =
            this.movementKind(
                occurrence
            );

        const category =
            this.findCategory(
                data,
                kind,
                occurrence.categoryId
            );

        const subcategory =
            this.findSubcategory(
                category,
                occurrence.subcategoryId
            );

        if (
            category &&
            subcategory
        ) {

            return (
                `${category.name} · ${subcategory.name}`
            );

        }

        return (
            subcategory?.name ||
            category?.name ||
            this.movementLabel(
                occurrence
            )
        );

    },

    occurrenceDateLabel(
        occurrence
    ) {

        const date =
            occurrence.expectedDate;

        if (!date) {

            return "Fecha por revisar";

        }

        return AtlasUI
            .formatMovementDate(
                date
            );

    },

    occurrenceAccountDescription(
        data,
        occurrence
    ) {

        return this
            .movementAccountDescription(
                data,
                occurrence
            );
    },

    occurrenceAmount(
        occurrence
    ) {

        const amount =
            this.number(
                occurrence.expectedAmount
            );

        const kind =
            this.movementKind(
                occurrence
            );

        if (
            kind === "income" ||
            kind === "reimbursement"
        ) {

            return (
                "+" +
                AtlasUI.formatCurrency(
                    amount
                )
            );

        }

        if (
            kind === "transfer"
        ) {

            return AtlasUI
                .formatCurrency(
                    amount
                );

        }

        return (
            "−" +
            AtlasUI.formatCurrency(
                amount
            )
        );

    },

    occurrenceStatus(
        occurrence
    ) {

        if (
            occurrence.status ===
            "possible_duplicate"
        ) {

            return {

                label:
                    "Posiblemente registrado",

                color:
                    "#f4b95e",

                icon:
                    "⚠️"

            };

        }

        return {

            label:
                "Pendiente",

            color:
                "var(--color-primary)",

            icon:
                "⏳"

        };

    },

    pendingSummary(pending) {

        const summary = {

            income:
                0,

            expenses:
                0,

            invested:
                0,

            debtPayments:
                0,

            count:
                pending.length

        };

        pending.forEach(
            occurrence => {

                const amount =
                    this.number(
                        occurrence
                            .expectedAmount
                    );

                const kind =
                    this.movementKind(
                        occurrence
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
                    kind ===
                    "debt_payment"
                ) {

                    summary.debtPayments +=
                        amount;

                }

            }
        );

        return summary;

    },

    pendingSummaryPanel(pending) {

        const summary =
            this.pendingSummary(
                pending
            );

        return `

            <section class="atlas-pending-summary">

                <div>

                    <small>
                        Gastos previstos
                    </small>

                    <strong
                        style="
                            color:
                                var(
                                    --color-danger
                                );
                        "
                    >
                        ${AtlasUI.formatCurrency(
                            summary.expenses
                        )}
                    </strong>

                </div>

                <div>

                    <small>
                        Ingresos previstos
                    </small>

                    <strong
                        style="
                            color:
                                var(
                                    --color-success
                                );
                        "
                    >
                        ${AtlasUI.formatCurrency(
                            summary.income
                        )}
                    </strong>

                </div>

                <div>

                    <small>
                        Inversión prevista
                    </small>

                    <strong
                        style="
                            color:#9d8cff;
                        "
                    >
                        ${AtlasUI.formatCurrency(
                            summary.invested
                        )}
                    </strong>

                </div>

            </section>

        `;

    },

    pendingTabs(pendingCount) {

        return `

            <div
                class="atlas-movement-tabs"
                role="tablist"
                aria-label="Vista de movimientos"
            >

                <button
                    type="button"
                    role="tab"
                    data-action="showRegisteredMovements"
                    class="${
                        this.activeView ===
                        "registered"
                            ? "active"
                            : ""
                    }"
                    aria-selected="${
                        this.activeView ===
                        "registered"
                            ? "true"
                            : "false"
                    }"
                >
                    Registrados
                </button>

                <button
                    type="button"
                    role="tab"
                    data-action="showPendingMovements"
                    class="${
                        this.activeView ===
                        "pending"
                            ? "active"
                            : ""
                    }"
                    aria-selected="${
                        this.activeView ===
                        "pending"
                            ? "true"
                            : "false"
                    }"
                >
                    Pendientes

                    ${
                        pendingCount > 0
                            ? `

                                <span>
                                    ${pendingCount}
                                </span>

                            `
                            : ""
                    }

                </button>

            </div>

        `;

    },

    pendingRow(
        data,
        occurrence
    ) {

        const status =
            this.occurrenceStatus(
                occurrence
            );

        const account =
            this
                .occurrenceAccountDescription(
                    data,
                    occurrence
                );

        const category =
            this
                .occurrenceCategoryDescription(
                    data,
                    occurrence
                );

        return `

            <article
                class="atlas-pending-card"
                data-recurring-occurrence-id="${this.escape(
                    occurrence.id
                )}"
            >

                <div class="atlas-pending-card-head">

                    <div class="atlas-pending-card-title">

                        <span
                            class="atlas-pending-icon"
                            aria-hidden="true"
                        >
                            ${this.movementIcon(
                                occurrence
                            )}
                        </span>

                        <div>

                            <strong>
                                ${this.escape(
                                    this.occurrenceTitle(
                                        data,
                                        occurrence
                                    )
                                )}
                            </strong>

                            <small>
                                ${this.escape(
                                    category
                                )}
                            </small>

                        </div>

                    </div>

                    <strong
                        class="atlas-pending-amount"
                        style="
                            color:
                                ${this.movementColor(
                                    occurrence
                                )};
                        "
                    >
                        ${this.occurrenceAmount(
                            occurrence
                        )}
                    </strong>

                </div>

                <div class="atlas-pending-meta">

                    <span>
                        📅
                        ${this.escape(
                            this.occurrenceDateLabel(
                                occurrence
                            )
                        )}
                    </span>

                    ${
                        account
                            ? `

                                <span>
                                    🏦
                                    ${this.escape(
                                        account
                                    )}
                                </span>

                            `
                            : ""
                    }

                </div>

                <div
                    class="atlas-pending-status"
                    style="
                        color:
                            ${status.color};
                    "
                >
                    <span>
                        ${status.icon}
                    </span>

                    <span>
                        ${status.label}
                    </span>

                    ${
                        occurrence.status ===
                        "possible_duplicate"
                            ? `

                                <small>
                                    Revisa si ya registraste
                                    este movimiento.
                                </small>

                            `
                            : ""
                    }

                </div>

                <div class="atlas-pending-actions">

                    <button
                        type="button"
                        class="secondary"
                        data-action="reviewRecurringOccurrence"
                        data-occurrence-id="${this.escape(
                            occurrence.id
                        )}"
                    >
                        Revisar
                    </button>

                    <button
                        type="button"
                        class="atlas-pending-confirm"
                        data-action="confirmRecurringOccurrence"
                        data-occurrence-id="${this.escape(
                            occurrence.id
                        )}"
                    >
                        Confirmar
                    </button>

                    <button
                        type="button"
                        class="atlas-pending-omit"
                        data-action="omitRecurringOccurrence"
                        data-occurrence-id="${this.escape(
                            occurrence.id
                        )}"
                    >
                        Omitir
                    </button>

                </div>

            </article>

        `;

    },

    pendingEmptyState(monthKey) {

        return `

            <section class="panel atlas-pending-empty">

                <div>
                    ✅
                </div>

                <strong>
                    No hay pendientes
                </strong>

                <p class="note">
                    No existen movimientos recurrentes
                    pendientes en
                    ${AtlasUI.formatMonthKey(
                        monthKey
                    )}.
                </p>

                <p class="note">
                    Las reglas se configurarán desde
                    Ajustes y nunca modificarán tus
                    cifras hasta que las confirmes.
                </p>

            </section>

        `;

    },

    registeredView(
        data,
        filters,
        list,
        allMonthlyMovements,
        movementsMonth,
        filtersActive
    ) {

        return `

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

        `;

    },

    pendingView(
        data,
        pending,
        movementsMonth
    ) {

        if (
            pending.length === 0
        ) {

            return this.pendingEmptyState(
                movementsMonth
            );

        }

        return `

            <div class="atlas-pending-introduction">

                <strong>
                    Previsión del mes
                </strong>

                <p class="note">
                    Estas propuestas todavía no afectan
                    a saldos, gastos, presupuestos ni análisis.
                </p>

            </div>

            ${this.pendingSummaryPanel(
                pending
            )}

            <section class="atlas-pending-list">

                ${pending
                    .map(
                        occurrence =>
                            this.pendingRow(
                                data,
                                occurrence
                            )
                    )
                    .join("")}

            </section>

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

        const pending =
            Array.isArray(
                options.recurringPending
            )
                ? options.recurringPending
                : (
                    typeof AtlasRecurring !==
                        "undefined" &&
                    typeof AtlasRecurring
                        .pendingForMonth ===
                        "function"
                        ? AtlasRecurring
                            .pendingForMonth(
                                data,
                                movementsMonth
                            )
                        : []
                );

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
                    Consulta operaciones reales y revisa
                    las propuestas recurrentes.
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
                                ? "registrado"
                                : "registrados"
                        } · ${pending.length} ${
                            pending.length ===
                            1
                                ? "pendiente"
                                : "pendientes"
                        }`

                })}

                ${this.pendingTabs(
                    pending.length
                )}

                ${
                    this.activeView ===
                    "pending"
                        ? this.pendingView(
                            data,
                            pending,
                            movementsMonth
                        )
                        : this.registeredView(
                            data,
                            filters,
                            list,
                            allMonthlyMovements,
                            movementsMonth,
                            filtersActive
                        )
                }

            </div>

        `;

    },

    installStyles() {

        const previousStyle =
            document.getElementById(
                "atlas-movement-filter-styles"
            );

        if (previousStyle) {

            previousStyle.remove();

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

            .atlas-movement-tabs {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
                gap: 8px;
                margin-bottom: 14px;
                padding: 5px;
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
                        0.04
                    );
            }

            .atlas-movement-tabs button {
                min-width: 0;
                min-height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                border-radius: 14px;
                color:
                    var(
                        --color-text-muted
                    );
                background: transparent;
                font-size: 13px;
                font-weight: 750;
            }

            .atlas-movement-tabs button.active {
                color: #ffffff;
                border:
                    1px solid
                    rgba(
                        77,
                        163,
                        255,
                        0.28
                    );
                background:
                    rgba(
                        77,
                        163,
                        255,
                        0.17
                    );
            }

            .atlas-movement-tabs button span {
                min-width: 20px;
                min-height: 20px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding:
                    0
                    6px;
                border-radius: 99px;
                color: #ffffff;
                background:
                    var(
                        --color-primary
                    );
                font-size: 10px;
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
                    rotate(
                        180deg
                    );
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
                    translateY(
                        -50%
                    );
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
                min-height: 88px;
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

            .atlas-movement-summary-card > small {
                display: block;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-movement-summary-card > strong {
                display: block;
                margin-top: 7px;
                overflow: hidden;
                font-size: 19px;
                line-height: 1.05;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-movement-summary-detail {
                display: block;
                margin-top: 6px;
                overflow: hidden;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.3;
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
                flex:
                    0
                    0
                    auto;
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

            .atlas-pending-introduction {
                margin-bottom: 12px;
                padding:
                    0
                    3px;
            }

            .atlas-pending-introduction p {
                margin-top: 5px;
                line-height: 1.45;
            }

            .atlas-pending-summary {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 8px;
                margin-bottom: 14px;
                padding: 13px;
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
                        0.028
                    );
            }

            .atlas-pending-summary div {
                min-width: 0;
                text-align: center;
            }

            .atlas-pending-summary small,
            .atlas-pending-summary strong {
                display: block;
            }

            .atlas-pending-summary small {
                min-height: 24px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 8px;
                line-height: 1.3;
            }

            .atlas-pending-summary strong {
                margin-top: 6px;
                overflow: hidden;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-pending-list {
                display: flex;
                flex-direction: column;
                gap: 11px;
            }

            .atlas-pending-card {
                padding: 15px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.15
                    );
                border-radius: 19px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.03
                    );
            }

            .atlas-pending-card-head {
                display: flex;
                align-items: flex-start;
                justify-content:
                    space-between;
                gap: 12px;
            }

            .atlas-pending-card-title {
                min-width: 0;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .atlas-pending-card-title div {
                min-width: 0;
            }

            .atlas-pending-card-title strong,
            .atlas-pending-card-title small {
                display: block;
            }

            .atlas-pending-card-title strong {
                overflow: hidden;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .atlas-pending-card-title small {
                margin-top: 4px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-pending-icon {
                flex:
                    0
                    0
                    auto;
                font-size: 16px;
            }

            .atlas-pending-amount {
                flex:
                    0
                    0
                    auto;
                font-size: 15px;
                white-space: nowrap;
            }

            .atlas-pending-meta {
                display: flex;
                flex-wrap: wrap;
                gap:
                    6px
                    12px;
                margin-top: 12px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 10px;
            }

            .atlas-pending-status {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 11px;
                font-size: 10px;
                font-weight: 700;
            }

            .atlas-pending-status small {
                width: 100%;
                padding-left: 21px;
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
                font-weight: 500;
            }

            .atlas-pending-actions {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );
                gap: 7px;
                margin-top: 13px;
            }

            .atlas-pending-actions button {
                min-width: 0;
                min-height: 40px;
                padding:
                    0
                    7px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 750;
            }

            .atlas-pending-confirm {
                color: #ffffff;
                background:
                    var(
                        --color-primary
                    );
            }

            .atlas-pending-omit {
                color:
                    var(
                        --color-text-muted
                    );
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.18
                    );
                background: transparent;
            }

            .atlas-pending-empty {
                padding:
                    34px
                    18px;
                text-align: center;
            }

            .atlas-pending-empty > div {
                margin-bottom: 10px;
                font-size: 30px;
            }

            .atlas-pending-empty p {
                margin:
                    8px
                    auto
                    0;
                max-width: 310px;
                line-height: 1.5;
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

                .atlas-movement-summary-detail {
                    font-size: 7px;
                }

                .atlas-pending-summary {
                    grid-template-columns:
                        minmax(0, 1fr);
                }

                .atlas-pending-summary small {
                    min-height: 0;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    bindViewEvents() {

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

                const registeredButton =
                    event.target.closest(
                        '[data-action="showRegisteredMovements"]'
                    );

                if (registeredButton) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.activeView =
                        "registered";

                    if (
                        typeof AtlasApp !==
                            "undefined" &&
                        typeof AtlasApp.render ===
                            "function"
                    ) {

                        AtlasApp.render();

                    }

                    return;

                }

                const pendingButton =
                    event.target.closest(
                        '[data-action="showPendingMovements"]'
                    );

                if (pendingButton) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.activeView =
                        "pending";

                    if (
                        typeof AtlasApp !==
                            "undefined" &&
                        typeof AtlasApp.render ===
                            "function"
                    ) {

                        AtlasApp.render();

                    }

                }

            },
            true
        );

    },

    init() {

        this.installStyles();

        this.bindViewEvents();

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

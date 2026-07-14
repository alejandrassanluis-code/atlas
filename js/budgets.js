/* ==========================================================
   ATLAS
   budgets.js
   Sprint 5.0 — Pantalla mensual de presupuestos
========================================================== */

const AtlasBudgetsUI = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    escape(value) {

        return AtlasUI.escapeHtml(
            value
        );

    },

    currency(value) {

        return AtlasUI.formatCurrency(
            value
        );

    },

    percent(value) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(
                Number(value)
            )
        ) {

            return "—";

        }

        return AtlasUI.formatPercent(
            value
        );

    },

    statusInformation(status) {

        const statuses = {

            healthy: {
                label:
                    "Dentro del presupuesto",
                color:
                    "var(--color-success)",
                background:
                    "rgba(54, 211, 153, 0.12)",
                icon:
                    "✓"
            },

            warning: {
                label:
                    "Cerca del límite",
                color:
                    "#f7b955",
                background:
                    "rgba(247, 185, 85, 0.12)",
                icon:
                    "!"
            },

            exceeded: {
                label:
                    "Presupuesto superado",
                color:
                    "var(--color-danger)",
                background:
                    "rgba(255, 91, 112, 0.12)",
                icon:
                    "↑"
            },

            unbudgeted: {
                label:
                    "Gasto sin presupuesto",
                color:
                    "var(--color-danger)",
                background:
                    "rgba(255, 91, 112, 0.12)",
                icon:
                    "!"
            },

            no_budget: {
                label:
                    "Sin presupuesto",
                color:
                    "var(--color-text-muted)",
                background:
                    "rgba(145, 164, 202, 0.09)",
                icon:
                    "—"
            }

        };

        return (
            statuses[status] ||
            statuses.no_budget
        );

    },

    progressWidth(usedPercent) {

        if (
            usedPercent === null ||
            usedPercent === undefined
        ) {

            return 100;

        }

        return Math.max(
            0,
            Math.min(
                100,
                this.number(
                    usedPercent
                )
            )
        );

    },

    remainingText(item) {

        const remaining =
            this.number(
                item.remaining
            );

        if (
            this.number(
                item.budget
            ) <= 0
        ) {

            return (
                this.number(
                    item.spent
                ) > 0
                    ? "Sin límite configurado"
                    : "Sin presupuesto activo"
            );

        }

        if (
            remaining < 0
        ) {

            return (
                `${this.currency(
                    Math.abs(
                        remaining
                    )
                )} por encima`
            );

        }

        return (
            `${this.currency(
                remaining
            )} disponibles`
        );

    },

    budgetModeText(item) {

        if (
            item.mode === "fixed" ||
            item.mode === "fixed_amount"
        ) {

            return "Importe fijo";

        }

        return (
            `${this.number(
                item.targetPercent
            )}% de los ingresos`
        );

    },

    monthSelector(
        monthKey,
        currentMonth
    ) {

        const isCurrentMonth =
            monthKey ===
            currentMonth;

        return AtlasUI.monthSelector({

            monthKey,

            isCurrentMonth,

            previousAction:
                "previousBudgetMonth",

            nextAction:
                "nextBudgetMonth",

            currentAction:
                "currentBudgetMonth",

            subtitle:
                isCurrentMonth
                    ? "Presupuesto del mes actual"
                    : "Presupuesto histórico"

        });

    },

    summaryHero(summary) {

        const status =
            this.statusInformation(
                summary.status
            );

        const progress =
            this.progressWidth(
                summary.usedPercent
            );

        return `

            <section
                class="hero"
                style="
                    padding:22px;
                    margin-bottom:16px;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        justify-content:space-between;
                        gap:14px;
                    "
                >

                    <div>

                        <div class="eyebrow">
                            Presupuesto mensual
                        </div>

                        <div
                            class="value"
                            style="
                                margin-top:7px;
                                font-size:36px;
                                line-height:1.05;
                            "
                        >
                            ${this.currency(
                                summary.remaining
                            )}
                        </div>

                        <div
                            class="trend"
                            style="
                                margin-top:7px;
                            "
                        >
                            ${
                                summary.remaining >= 0
                                    ? "Disponible para gastar"
                                    : "Presupuesto excedido"
                            }
                        </div>

                    </div>

                    <div
                        style="
                            flex:0 0 auto;
                            padding:8px 11px;
                            border-radius:14px;
                            color:${status.color};
                            background:${status.background};
                            font-size:12px;
                            font-weight:750;
                            white-space:nowrap;
                        "
                    >
                        ${status.icon}
                        ${status.label}
                    </div>

                </div>

                <div
                    style="
                        height:10px;
                        margin-top:20px;
                        overflow:hidden;
                        border-radius:99px;
                        background:
                            rgba(
                                255,
                                255,
                                255,
                                0.08
                            );
                    "
                >

                    <div
                        style="
                            width:${progress}%;
                            height:100%;
                            border-radius:99px;
                            background:${status.color};
                            transition:width 0.25s ease;
                        "
                    ></div>

                </div>

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:12px;
                        margin-top:9px;
                    "
                >

                    <small class="note">
                        ${this.currency(
                            summary.totalSpent
                        )} gastados
                    </small>

                    <small class="note">
                        ${
                            summary.usedPercent === null
                                ? "Sin límite"
                                : `${this.percent(
                                    summary.usedPercent
                                )} utilizado`
                        }
                    </small>

                </div>

            </section>

        `;

    },

    summaryCards(summary) {

        return `

            <div
                class="grid"
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0,1fr)
                        );
                    gap:10px;
                    margin-bottom:16px;
                "
            >

                <div
                    class="card"
                    style="
                        min-width:0;
                        padding:15px;
                    "
                >

                    <div class="label">
                        Presupuestado
                    </div>

                    <div
                        class="num"
                        style="
                            margin-top:7px;
                            font-size:21px;
                        "
                    >
                        ${this.currency(
                            summary.totalBudget
                        )}
                    </div>

                </div>

                <div
                    class="card"
                    style="
                        min-width:0;
                        padding:15px;
                    "
                >

                    <div class="label">
                        Gastado
                    </div>

                    <div
                        class="num"
                        style="
                            margin-top:7px;
                            font-size:21px;
                            color:
                                var(
                                    --color-danger
                                );
                        "
                    >
                        ${this.currency(
                            summary.totalSpent
                        )}
                    </div>

                </div>

                <div
                    class="card"
                    style="
                        min-width:0;
                        padding:15px;
                    "
                >

                    <div class="label">
                        Ingresos del mes
                    </div>

                    <div
                        class="num"
                        style="
                            margin-top:7px;
                            font-size:21px;
                            color:
                                var(
                                    --color-success
                                );
                        "
                    >
                        ${this.currency(
                            summary.monthlyIncome
                        )}
                    </div>

                </div>

                <div
                    class="card"
                    style="
                        min-width:0;
                        padding:15px;
                    "
                >

                    <div class="label">
                        Objetivo ahorro + inversión
                    </div>

                    <div
                        class="num"
                        style="
                            margin-top:7px;
                            font-size:21px;
                            color:
                                var(
                                    --color-primary
                                );
                        "
                    >
                        ${this.currency(
                            summary
                                .savingAndInvestmentTargetAmount
                        )}
                    </div>

                    <small
                        class="note"
                        style="
                            display:block;
                            margin-top:4px;
                        "
                    >
                        ${this.percent(
                            summary
                                .savingAndInvestmentTargetPercent
                        )}
                    </small>

                </div>

            </div>

        `;

    },

    subcategoryRow(item) {

        const status =
            this.statusInformation(
                item.status
            );

        const progress =
            this.progressWidth(
                item.usedPercent
            );

        return `

            <div
                style="
                    padding:13px 0;
                    border-bottom:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.11
                        );
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:12px;
                    "
                >

                    <div
                        style="
                            min-width:0;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                font-size:14px;
                            "
                        >
                            ${this.escape(
                                item.icon
                            )}
                            ${this.escape(
                                item.name
                            )}
                        </strong>

                        <small
                            class="note"
                            style="
                                display:block;
                                margin-top:4px;
                            "
                        >
                            ${this.remainingText(
                                item
                            )}
                        </small>

                    </div>

                    <div
                        style="
                            flex:0 0 auto;
                            text-align:right;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                color:${status.color};
                                font-size:14px;
                            "
                        >
                            ${this.currency(
                                item.spent
                            )}
                        </strong>

                        <small
                            class="note"
                            style="
                                display:block;
                                margin-top:3px;
                            "
                        >
                            de
                            ${this.currency(
                                item.budget
                            )}
                        </small>

                    </div>

                </div>

                <div
                    style="
                        height:6px;
                        margin-top:10px;
                        overflow:hidden;
                        border-radius:99px;
                        background:
                            rgba(
                                255,
                                255,
                                255,
                                0.07
                            );
                    "
                >

                    <div
                        style="
                            width:${progress}%;
                            height:100%;
                            border-radius:99px;
                            background:${status.color};
                        "
                    ></div>

                </div>

            </div>

        `;

    },

    categoryCard(category) {

        const status =
            this.statusInformation(
                category.status
            );

        const progress =
            this.progressWidth(
                category.usedPercent
            );

        const visibleSubcategories =
            (
                category.subcategories ||
                []
            ).filter(
                item =>
                    item.active ||
                    item.spent > 0
            );

        return `

            <details
                class="panel"
                style="
                    margin-bottom:12px;
                    padding:0;
                    overflow:hidden;
                "
            >

                <summary
                    style="
                        display:block;
                        padding:17px;
                        cursor:pointer;
                        list-style:none;
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:14px;
                        "
                    >

                        <div
                            style="
                                min-width:0;
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    font-size:16px;
                                "
                            >
                                ${this.escape(
                                    category.icon
                                )}
                                ${this.escape(
                                    category.name
                                )}
                            </strong>

                            <small
                                class="note"
                                style="
                                    display:block;
                                    margin-top:5px;
                                "
                            >
                                ${this.budgetModeText(
                                    category
                                )}
                            </small>

                        </div>

                        <div
                            style="
                                flex:0 0 auto;
                                text-align:right;
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    color:${status.color};
                                    font-size:16px;
                                "
                            >
                                ${this.currency(
                                    category.spent
                                )}
                            </strong>

                            <small
                                class="note"
                                style="
                                    display:block;
                                    margin-top:4px;
                                "
                            >
                                de
                                ${this.currency(
                                    category.budget
                                )}
                            </small>

                        </div>

                    </div>

                    <div
                        style="
                            height:8px;
                            margin-top:14px;
                            overflow:hidden;
                            border-radius:99px;
                            background:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    0.07
                                );
                        "
                    >

                        <div
                            style="
                                width:${progress}%;
                                height:100%;
                                border-radius:99px;
                                background:${status.color};
                            "
                        ></div>

                    </div>

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:10px;
                            margin-top:9px;
                        "
                    >

                        <small
                            style="
                                color:${status.color};
                            "
                        >
                            ${status.label}
                        </small>

                        <small class="note">
                            ${this.remainingText(
                                category
                            )}
                        </small>

                    </div>

                </summary>

                <div
                    style="
                        padding:
                            0
                            17px
                            5px;
                        border-top:
                            1px solid
                            rgba(
                                145,
                                164,
                                202,
                                0.11
                            );
                    "
                >

                    ${
                        visibleSubcategories.length > 0
                            ? visibleSubcategories
                                .map(
                                    item =>
                                        this.subcategoryRow(
                                            item
                                        )
                                )
                                .join("")
                            : `

                                <div
                                    style="
                                        padding:18px 0;
                                        text-align:center;
                                    "
                                >
                                    <small class="note">
                                        Sin subcategorías activas.
                                    </small>
                                </div>

                            `
                    }

                </div>

            </details>

        `;

    },

    categories(summary) {

        const categories =
            (
                summary.categories ||
                []
            ).filter(
                category =>
                    category.active ||
                    category.spent > 0
            );

        if (
            categories.length === 0
        ) {

            return `

                <section class="panel">

                    <div
                        style="
                            padding:28px 12px;
                            text-align:center;
                        "
                    >

                        <div
                            style="
                                margin-bottom:10px;
                                font-size:31px;
                            "
                        >
                            🎯
                        </div>

                        <strong>
                            Sin presupuestos activos
                        </strong>

                        <p
                            class="note"
                            style="
                                margin-top:8px;
                                line-height:1.5;
                            "
                        >
                            Activa presupuestos por categoría
                            para controlar tus gastos mensuales.
                        </p>

                    </div>

                </section>

            `;

        }

        return `

            <section>

                <div
                    class="panelhead"
                    style="
                        margin:
                            4px
                            2px
                            12px;
                    "
                >

                    <div>

                        <h2>
                            Categorías
                        </h2>

                        <p
                            class="note"
                            style="
                                margin-top:4px;
                            "
                        >
                            Toca una categoría para ver sus subcategorías
                        </p>

                    </div>

                </div>

                ${categories
                    .map(
                        category =>
                            this.categoryCard(
                                category
                            )
                    )
                    .join("")}

            </section>

        `;

    },

    incomeNotice(summary) {

        if (
            summary.monthlyIncome > 0
        ) {

            return "";

        }

        return `

            <section
                class="panel"
                style="
                    margin-bottom:16px;
                    border-color:
                        rgba(
                            247,
                            185,
                            85,
                            0.24
                        );
                    background:
                        rgba(
                            247,
                            185,
                            85,
                            0.07
                        );
                "
            >

                <div
                    style="
                        display:flex;
                        gap:12px;
                        align-items:flex-start;
                    "
                >

                    <span
                        style="
                            font-size:22px;
                        "
                    >
                        💡
                    </span>

                    <div>

                        <strong>
                            Todavía no hay ingresos este mes
                        </strong>

                        <p
                            class="note"
                            style="
                                margin-top:6px;
                                line-height:1.5;
                            "
                        >
                            Los presupuestos porcentuales aparecerán
                            en 0 € hasta registrar ingresos.
                            Los presupuestos fijos seguirán funcionando.
                        </p>

                    </div>

                </div>

            </section>

        `;

    },

    render(
        data,
        options = {}
    ) {

        const budgetMonth =
            options.budgetMonth ||
            AtlasCalculations.monthKey();

        const currentMonth =
            options.currentMonth ||
            AtlasCalculations.monthKey();

        const summary =
            AtlasCalculations
                .budgetSummary(
                    data,
                    budgetMonth
                );

        return `

            <div class="app">

                ${AtlasUI.header()}

                <h1 class="page-title">
                    Presupuestos
                </h1>

                <p class="subtitle">
                    Controla cuánto puedes gastar en cada categoría.
                </p>

                ${this.monthSelector(
                    budgetMonth,
                    currentMonth
                )}

                ${this.incomeNotice(
                    summary
                )}

                ${this.summaryHero(
                    summary
                )}

                ${this.summaryCards(
                    summary
                )}

                ${this.categories(
                    summary
                )}

            </div>

        `;

    }

};

/*
 * Integra la nueva ruta sin modificar
 * las demás pantallas de AtlasUI.
 */

AtlasBudgetsUI.originalRender =
    AtlasUI.render.bind(
        AtlasUI
    );

AtlasUI.render = function(
    route,
    data,
    options = {}
) {

    if (
        route === "budgets"
    ) {

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {

            return;

        }

        app.innerHTML =
            AtlasBudgetsUI.render(
                data,
                options
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
                            route
                    );

                }
            );

        AtlasUI.bindDynamicControls();

        return;

    }

    AtlasBudgetsUI.originalRender(
        route,
        data,
        options
    );

};

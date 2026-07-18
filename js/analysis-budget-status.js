/* ==========================================================
   ATLAS
   analysis-budget-status.js
   Estado presupuestario combinado con resultado mensual
========================================================== */

const AtlasAnalysisBudgetStatus = {

    initialized: false,

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasAnalysisUI ===
                "undefined" ||
            typeof AtlasCalculations ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        AtlasAnalysisUI.budgetPanel =
            (
                budget,
                forecast,
                mode
            ) => {

                const forecastMode =
                    mode ===
                    "forecast";

                const monthKey =
                    AtlasAnalysisUI.options
                        ?.analysisMonth ||
                    AtlasAnalysisUI.options
                        ?.currentMonth ||
                    AtlasCalculations
                        .monthKey();

                const financial =
                    AtlasCalculations
                        .financialSummary(
                            AtlasAnalysisUI.data,
                            monthKey
                        );

                const spent =
                    this.number(
                        budget.totalSpent
                    ) +
                    (
                        forecastMode
                            ? this.number(
                                forecast
                                    ?.pending
                                    ?.expenses
                            )
                            : 0
                    );

                const totalBudget =
                    this.number(
                        budget.totalBudget
                    );

                const remaining =
                    totalBudget -
                    spent;

                const usedPercent =
                    AtlasCalculations
                        .budgetUsedPercent(
                            spent,
                            totalBudget
                        );

                const spendingStatusKey =
                    AtlasCalculations
                        .budgetStatus(
                            AtlasAnalysisUI.data,
                            spent,
                            totalBudget
                        );

                const display =
                    AtlasAnalysisUI
                        .monthlyDisplaySummary(
                            financial,
                            forecast,
                            mode
                        );

                const savings =
                    this.number(
                        display.monthlySavings
                    );

                const cashResult =
                    this.number(
                        display.monthlyCashResult
                    );

                const monthlyResult =
                    Math.min(
                        savings,
                        cashResult
                    );

                const negativeResult =
                    monthlyResult <
                    -0.001;

                let status =
                    AtlasAnalysisUI
                        .budgetStatusInformation(
                            spendingStatusKey
                        );

                let statusLabel =
                    status.label;

                let statusDetail =
                    "";

                if (negativeResult) {

                    status = {

                        label:
                            "Resultado mensual negativo",

                        color:
                            "var(--color-danger)"

                    };

                    if (
                        spendingStatusKey ===
                        "healthy"
                    ) {

                        statusLabel =
                            "Dentro del presupuesto de gastos, pero con resultado mensual negativo";

                    } else if (
                        spendingStatusKey ===
                            "warning"
                    ) {

                        statusLabel =
                            "Cerca del límite y con resultado mensual negativo";

                    } else if (
                        spendingStatusKey ===
                            "exceeded" ||
                        spendingStatusKey ===
                            "unbudgeted"
                    ) {

                        statusLabel =
                            "Presupuesto superado y resultado mensual negativo";

                    } else {

                        statusLabel =
                            "Resultado mensual negativo";

                    }

                    statusDetail =
                        `Se están utilizando ${AtlasAnalysisUI.currency(
                            Math.abs(
                                monthlyResult
                            )
                        )} de liquidez acumulada.`;

                } else {

                    statusDetail =
                        spendingStatusKey ===
                            "healthy"
                            ? "El gasto está dentro del límite y el resultado mensual no es negativo."
                            : "";

                }

                return `

                    <section
                        class="
                            panel
                            atlas-analysis-panel
                        "
                    >

                        ${AtlasAnalysisUI.panelHeader(
                            "Estado presupuestario",
                            "Situación general del presupuesto y del resultado mensual",
                            `

                                <strong
                                    style="
                                        color:
                                            ${status.color};
                                    "
                                >
                                    ${
                                        usedPercent ===
                                            null
                                            ? "—"
                                            : AtlasAnalysisUI.percent(
                                                usedPercent
                                            )
                                    }
                                </strong>

                            `
                        )}

                        <div
                            class="
                                atlas-analysis-facts
                            "
                        >

                            <div>

                                <small>
                                    Presupuesto
                                </small>

                                <strong>
                                    ${AtlasAnalysisUI.currency(
                                        totalBudget
                                    )}
                                </strong>

                            </div>

                            <div>

                                <small>
                                    ${
                                        forecastMode
                                            ? "Gasto estimado"
                                            : "Gasto real"
                                    }
                                </small>

                                <strong>
                                    ${AtlasAnalysisUI.currency(
                                        spent
                                    )}
                                </strong>

                            </div>

                            <div>

                                <small>
                                    Margen de gasto
                                </small>

                                <strong
                                    style="
                                        color:
                                            ${AtlasAnalysisUI.statusColor(
                                                remaining
                                            )};
                                    "
                                >
                                    ${AtlasAnalysisUI.currency(
                                        remaining
                                    )}
                                </strong>

                            </div>

                            <div>

                                <small>
                                    Resultado mensual
                                </small>

                                <strong
                                    style="
                                        color:
                                            ${AtlasAnalysisUI.statusColor(
                                                monthlyResult
                                            )};
                                    "
                                >
                                    ${AtlasAnalysisUI.currency(
                                        monthlyResult
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div
                            style="
                                margin-top:14px;
                                padding:13px;
                                border-radius:15px;
                                border:
                                    1px solid
                                    ${
                                        negativeResult
                                            ? "rgba(255, 91, 112, 0.22)"
                                            : "rgba(54, 211, 153, 0.18)"
                                    };
                                background:
                                    ${
                                        negativeResult
                                            ? "rgba(255, 91, 112, 0.08)"
                                            : "rgba(54, 211, 153, 0.07)"
                                    };
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    color:
                                        ${status.color};
                                    font-size:14px;
                                    line-height:1.35;
                                "
                            >
                                ${AtlasAnalysisUI.escape(
                                    statusLabel
                                )}
                            </strong>

                            ${
                                statusDetail
                                    ? `

                                        <small
                                            class="note"
                                            style="
                                                display:block;
                                                margin-top:6px;
                                                line-height:1.45;
                                            "
                                        >
                                            ${AtlasAnalysisUI.escape(
                                                statusDetail
                                            )}
                                        </small>

                                    `
                                    : ""
                            }

                        </div>

                        <div
                            class="
                                atlas-analysis-progress
                            "
                        >

                            <i
                                style="
                                    width:
                                        ${AtlasAnalysisUI.clamp(
                                            usedPercent ===
                                                null
                                                ? 0
                                                : usedPercent
                                        )}%;
                                    background:
                                        ${
                                            AtlasAnalysisUI
                                                .budgetStatusInformation(
                                                    spendingStatusKey
                                                )
                                                .color
                                        };
                                "
                            ></i>

                        </div>

                        <button
                            type="button"
                            data-action="
                                openAnalysisBudgets
                            "
                            class="
                                atlas-analysis-link
                            "
                        >
                            Ver presupuestos
                        </button>

                    </section>

                `;

            };

    }

};

AtlasAnalysisBudgetStatus.install();

/* ==========================================================
   ATLAS
   ai-local.js
   Atlas IA local — análisis financiero basado en reglas
========================================================== */

const AtlasLocalAI = {

    data: null,

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    currentMonthKey() {

        return AtlasCalculations
            .monthKey();

    },

    previousMonthKey(
        monthKey
    ) {

        return AtlasCalculations
            .previousMonthKey(
                monthKey
            );

    },

    formatCurrency(value) {

        return AtlasUI
            .formatCurrency(
                value
            );

    },

    formatPercent(value) {

        return AtlasUI
            .formatPercent(
                value
            );

    },

    escape(value) {

        return AtlasUI
            .escapeHtml(
                value
            );

    },

    summary(
        data = this.data
    ) {

        const monthKey =
            this.currentMonthKey();

        const previousMonthKey =
            this.previousMonthKey(
                monthKey
            );

        const current =
            AtlasCalculations
                .financialSummary(
                    data,
                    monthKey
                );

        const previous =
            AtlasCalculations
                .financialSummary(
                    data,
                    previousMonthKey
                );

        const comparison =
            AtlasCalculations
                .monthlyComparison(
                    data,
                    monthKey
                );

        const categories =
            AtlasCalculations
                .expenseCategories(
                    data,
                    monthKey
                );

        const budget =
            AtlasCalculations
                .budgetSummary(
                    data,
                    monthKey
                );

        return {

            monthKey,

            previousMonthKey,

            current,

            previous,

            comparison,

            categories,

            budget

        };

    },

    hasFinancialData(
        summary
    ) {

        const current =
            summary.current;

        return Boolean(

            this.number(
                current.monthlyIncome
            ) !== 0 ||

            this.number(
                current.monthlyGrossExpenses
            ) !== 0 ||

            this.number(
                current.monthlyInvested
            ) !== 0 ||

            this.number(
                current.monthlyDebtPayments
            ) !== 0 ||

            this.number(
                current.liquidity
            ) !== 0 ||

            this.number(
                current.investments
            ) !== 0 ||

            this.number(
                current.debt
            ) !== 0

        );

    },

    topCategory(summary) {

        return (
            summary.categories || []
        )
            .filter(
                category =>
                    this.number(
                        category.amount
                    ) > 0
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    this.number(
                        second.amount
                    ) -
                    this.number(
                        first.amount
                    )
            )[0] || null;

    },

    secondCategory(summary) {

        return (
            summary.categories || []
        )
            .filter(
                category =>
                    this.number(
                        category.amount
                    ) > 0
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    this.number(
                        second.amount
                    ) -
                    this.number(
                        first.amount
                    )
            )[1] || null;

    },

    savingsDifference(summary) {

        return this.number(
            summary.current
                .monthlySavings
        ) -
        this.number(
            summary.previous
                .monthlySavings
        );

    },

    expenseDifference(summary) {

        return this.number(
            summary.current
                .monthlyExpenses
        ) -
        this.number(
            summary.previous
                .monthlyExpenses
        );

    },

    incomeDifference(summary) {

        return this.number(
            summary.current
                .monthlyIncome
        ) -
        this.number(
            summary.previous
                .monthlyIncome
        );

    },

    mainMessage(summary) {

        if (
            !this.hasFinancialData(
                summary
            )
        ) {

            return "Todavía no hay suficientes datos para realizar un análisis financiero.";

        }

        const current =
            summary.current;

        const savings =
            this.number(
                current.monthlySavings
            );

        const difference =
            this.savingsDifference(
                summary
            );

        if (
            savings < 0
        ) {

            return (
                "Este mes tu ahorro es negativo. " +
                `Has registrado un resultado de ${
                    this.formatCurrency(
                        savings
                    )
                }.`
            );

        }

        if (
            savings > 0 &&
            difference > 0
        ) {

            return (
                "Tu situación mensual ha mejorado. " +
                `Has ahorrado ${
                    this.formatCurrency(
                        savings
                    )
                }, ${
                    this.formatCurrency(
                        difference
                    )
                } más que el mes anterior.`
            );

        }

        if (
            savings > 0 &&
            difference < 0
        ) {

            return (
                `Has ahorrado ${
                    this.formatCurrency(
                        savings
                    )
                }, aunque son ${
                    this.formatCurrency(
                        Math.abs(
                            difference
                        )
                    )
                } menos que el mes anterior.`
            );

        }

        if (
            savings > 0
        ) {

            return (
                `Este mes has generado un ahorro de ${
                    this.formatCurrency(
                        savings
                    )
                }.`
            );

        }

        return "Este mes tus ingresos, gastos e inversiones están equilibrados.";

    },

    explanation(summary) {

        const parts = [];

        const incomeDifference =
            this.incomeDifference(
                summary
            );

        const expenseDifference =
            this.expenseDifference(
                summary
            );

        const currentInvested =
            this.number(
                summary.current
                    .monthlyInvested
            );

        const previousInvested =
            this.number(
                summary.previous
                    .monthlyInvested
            );

        const investedDifference =
            currentInvested -
            previousInvested;

        if (
            incomeDifference > 0
        ) {

            parts.push(
                `Los ingresos han aumentado ${
                    this.formatCurrency(
                        incomeDifference
                    )
                }.`
            );

        } else if (
            incomeDifference < 0
        ) {

            parts.push(
                `Los ingresos han bajado ${
                    this.formatCurrency(
                        Math.abs(
                            incomeDifference
                        )
                    )
                }.`
            );

        }

        if (
            expenseDifference > 0
        ) {

            parts.push(
                `Los gastos netos han aumentado ${
                    this.formatCurrency(
                        expenseDifference
                    )
                }.`
            );

        } else if (
            expenseDifference < 0
        ) {

            parts.push(
                `Los gastos netos se han reducido ${
                    this.formatCurrency(
                        Math.abs(
                            expenseDifference
                        )
                    )
                }.`
            );

        }

        if (
            investedDifference > 0
        ) {

            parts.push(
                `Has invertido ${
                    this.formatCurrency(
                        investedDifference
                    )
                } más que el mes anterior.`
            );

        } else if (
            investedDifference < 0
        ) {

            parts.push(
                `Has invertido ${
                    this.formatCurrency(
                        Math.abs(
                            investedDifference
                        )
                    )
                } menos que el mes anterior.`
            );

        }

        if (
            parts.length === 0
        ) {

            return "No hay cambios relevantes respecto al mes anterior.";

        }

        return parts.join(" ");

    },

    alerts(summary) {

        const alerts = [];

        const current =
            summary.current;

        const savings =
            this.number(
                current.monthlySavings
            );

        const income =
            this.number(
                current.monthlyIncome
            );

        const expenses =
            this.number(
                current.monthlyExpenses
            );

        const liquidity =
            this.number(
                current.liquidity
            );

        const debt =
            this.number(
                current.debt
            );

        const savingRate =
            this.number(
                current.monthlySavingRate
            );

        if (
            savings < 0
        ) {

            alerts.push({

                level:
                    "danger",

                icon:
                    "⚠️",

                title:
                    "Ahorro negativo",

                text:
                    `El resultado del mes es ${
                        this.formatCurrency(
                            savings
                        )
                    }.`

            });

        }

        if (
            liquidity < 0
        ) {

            alerts.push({

                level:
                    "danger",

                icon:
                    "💵",

                title:
                    "Liquidez negativa",

                text:
                    `Tu liquidez total es ${
                        this.formatCurrency(
                            liquidity
                        )
                    }.`

            });

        }

        if (
            income > 0 &&
            expenses >
                income
        ) {

            alerts.push({

                level:
                    "warning",

                icon:
                    "📉",

                title:
                    "Gastos superiores a ingresos",

                text:
                    "Los gastos netos del mes superan los ingresos registrados."

            });

        }

        if (
            income > 0 &&
            savingRate >= 20
        ) {

            alerts.push({

                level:
                    "success",

                icon:
                    "🐷",

                title:
                    "Buena tasa de ahorro",

                text:
                    `Estás ahorrando el ${
                        this.formatPercent(
                            savingRate
                        )
                    } de tus ingresos.`

            });

        }

        if (
            debt > 0 &&
            liquidity > 0 &&
            debt >
                liquidity
        ) {

            alerts.push({

                level:
                    "warning",

                icon:
                    "💳",

                title:
                    "Deuda superior a liquidez",

                text:
                    `La deuda supera tu liquidez en ${
                        this.formatCurrency(
                            debt -
                            liquidity
                        )
                    }.`

            });

        }

        if (
            summary.budget
                ?.status ===
                "exceeded"
        ) {

            alerts.push({

                level:
                    "danger",

                icon:
                    "🎯",

                title:
                    "Presupuesto excedido",

                text:
                    `Has superado el presupuesto del mes en ${
                        this.formatCurrency(
                            Math.abs(
                                this.number(
                                    summary.budget
                                        .remaining
                                )
                            )
                        )
                    }.`

            });

        }

        if (
            alerts.length === 0
        ) {

            alerts.push({

                level:
                    "neutral",

                icon:
                    "✓",

                title:
                    "Sin alertas principales",

                text:
                    "Atlas no detecta incidencias financieras importantes este mes."

            });

        }

        return alerts;

    },

    recommendations(summary) {

        const recommendations = [];

        const current =
            summary.current;

        const topCategory =
            this.topCategory(
                summary
            );

        const savings =
            this.number(
                current.monthlySavings
            );

        const income =
            this.number(
                current.monthlyIncome
            );

        const savingRate =
            this.number(
                current.monthlySavingRate
            );

        const liquidity =
            this.number(
                current.liquidity
            );

        const debt =
            this.number(
                current.debt
            );

        if (
            topCategory &&
            this.number(
                topCategory.amount
            ) > 0
        ) {

            recommendations.push(
                `Revisa ${
                    topCategory.category ||
                    topCategory.label ||
                    "tu categoría principal"
                }, que concentra ${
                    this.formatCurrency(
                        topCategory.amount
                    )
                } de gasto este mes.`
            );

        }

        if (
            savings < 0
        ) {

            recommendations.push(
                "Prioriza reducir gasto variable antes de realizar nuevas aportaciones a inversión."
            );

        } else if (
            income > 0 &&
            savingRate < 10
        ) {

            recommendations.push(
                "Tu tasa de ahorro está por debajo del 10 %. Una reducción pequeña en las categorías principales podría mejorarla."
            );

        } else if (
            savingRate >= 20
        ) {

            recommendations.push(
                "Tu tasa de ahorro es sólida. Puedes valorar distribuir parte del ahorro cerrado entre tus objetivos."
            );

        }

        if (
            debt > 0 &&
            liquidity > debt
        ) {

            recommendations.push(
                "Dispones de más liquidez que deuda. Revisa si te interesa amortizar parte de la deuda sin comprometer tu fondo de seguridad."
            );

        }

        if (
            liquidity > 0 &&
            debt === 0 &&
            savings > 0
        ) {

            recommendations.push(
                "No tienes deuda pendiente y el mes presenta ahorro positivo. Puedes priorizar objetivos o inversión según tus necesidades."
            );

        }

        if (
            recommendations.length ===
            0
        ) {

            recommendations.push(
                "Mantén el registro actualizado para que las recomendaciones sean más precisas."
            );

        }

        return recommendations.slice(
            0,
            3
        );

    },

    answer(
        question,
        summary
    ) {

        const current =
            summary.current;

        if (
            question ===
            "savings"
        ) {

            const difference =
                this.savingsDifference(
                    summary
                );

            return (
                `Tu ahorro de este mes es ${
                    this.formatCurrency(
                        current.monthlySavings
                    )
                }. ` +
                (
                    difference > 0
                        ? `Ha mejorado ${
                            this.formatCurrency(
                                difference
                            )
                        } respecto al mes anterior.`
                        : difference < 0
                            ? `Ha bajado ${
                                this.formatCurrency(
                                    Math.abs(
                                        difference
                                    )
                                )
                            } respecto al mes anterior.`
                            : "No ha cambiado respecto al mes anterior."
                )
            );

        }

        if (
            question ===
            "expenses"
        ) {

            const first =
                this.topCategory(
                    summary
                );

            const second =
                this.secondCategory(
                    summary
                );

            if (!first) {

                return "No hay gastos por categoría registrados este mes.";

            }

            let response =
                `Tu mayor categoría de gasto es ${
                    first.category ||
                    first.label
                }, con ${
                    this.formatCurrency(
                        first.amount
                    )
                }.`;

            if (second) {

                response +=
                    ` La segunda es ${
                        second.category ||
                        second.label
                    }, con ${
                        this.formatCurrency(
                            second.amount
                        )
                    }.`;

            }

            return response;

        }

        if (
            question ===
            "liquidity"
        ) {

            return (
                `Tu liquidez total actual es ${
                    this.formatCurrency(
                        current.liquidity
                    )
                }. Tu deuda pendiente es ${
                    this.formatCurrency(
                        current.debt
                    )
                }.`
            );

        }

        if (
            question ===
            "investments"
        ) {

            return (
                `El valor actual de tus inversiones es ${
                    this.formatCurrency(
                        current.investments
                    )
                }. Este mes has aportado ${
                    this.formatCurrency(
                        current.monthlyInvested
                    )
                }.`
            );

        }

        if (
            question ===
            "recommendation"
        ) {

            return this
                .recommendations(
                    summary
                )
                .join(" ");

        }

        return this.mainMessage(
            summary
        );

    },

    alertColor(level) {

        const colors = {

            success:
                "var(--color-success)",

            warning:
                "#e7b85b",

            danger:
                "var(--color-danger)",

            neutral:
                "var(--color-text-muted)"

        };

        return (
            colors[level] ||
            colors.neutral
        );

    },

    renderAlerts(summary) {

        return this
            .alerts(
                summary
            )
            .map(
                alert => `

                    <div
                        style="
                            padding:14px 0;
                            border-bottom:
                                1px solid
                                rgba(
                                    145,
                                    164,
                                    202,
                                    0.12
                                );
                        "
                    >

                        <div
                            style="
                                display:flex;
                                align-items:flex-start;
                                gap:11px;
                            "
                        >

                            <span
                                style="
                                    flex:0 0 auto;
                                    font-size:20px;
                                "
                            >
                                ${alert.icon}
                            </span>

                            <div
                                style="
                                    min-width:0;
                                "
                            >

                                <strong
                                    style="
                                        color:
                                            ${this.alertColor(
                                                alert.level
                                            )};
                                    "
                                >
                                    ${this.escape(
                                        alert.title
                                    )}
                                </strong>

                                <p
                                    class="note"
                                    style="
                                        margin:5px 0 0;
                                        line-height:1.45;
                                    "
                                >
                                    ${this.escape(
                                        alert.text
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");

    },

    renderRecommendations(
        summary
    ) {

        return this
            .recommendations(
                summary
            )
            .map(
                (
                    recommendation,
                    index
                ) => `

                    <div
                        style="
                            display:flex;
                            align-items:flex-start;
                            gap:12px;
                            padding:14px 0;
                            border-bottom:
                                1px solid
                                rgba(
                                    145,
                                    164,
                                    202,
                                    0.12
                                );
                        "
                    >

                        <span
                            style="
                                width:28px;
                                height:28px;
                                flex:
                                    0 0
                                    28px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                border-radius:10px;
                                color:#d9b45f;
                                background:
                                    rgba(
                                        217,
                                        180,
                                        95,
                                        0.1
                                    );
                                font-size:12px;
                                font-weight:800;
                            "
                        >
                            ${index + 1}
                        </span>

                        <p
                            style="
                                margin:2px 0 0;
                                line-height:1.5;
                            "
                        >
                            ${this.escape(
                                recommendation
                            )}
                        </p>

                    </div>

                `
            )
            .join("");

    },

    renderQuestions() {

        const questions = [

            {
                key:
                    "savings",
                label:
                    "¿Cómo va mi ahorro?"
            },

            {
                key:
                    "expenses",
                label:
                    "¿En qué gasto más?"
            },

            {
                key:
                    "liquidity",
                label:
                    "¿Cómo está mi liquidez?"
            },

            {
                key:
                    "investments",
                label:
                    "¿Cómo van mis inversiones?"
            },

            {
                key:
                    "recommendation",
                label:
                    "¿Qué debería revisar?"
            }

        ];

        return questions
            .map(
                question => `

                    <button
                        type="button"
                        data-ai-question="${question.key}"
                        style="
                            min-height:46px;
                            padding:10px 13px;
                            border:
                                1px solid
                                rgba(
                                    217,
                                    180,
                                    95,
                                    0.2
                                );
                            border-radius:14px;
                            color:#f7f8fc;
                            background:
                                rgba(
                                    217,
                                    180,
                                    95,
                                    0.07
                                );
                            font-size:13px;
                            font-weight:700;
                            text-align:left;
                        "
                    >
                        ${question.label}
                    </button>

                `
            )
            .join("");

    },

    render(data) {

        this.data =
            data;

        const summary =
            this.summary(
                data
            );

        return `

            <div class="app">

                ${AtlasUI.header()}

                <h1 class="page-title">
                    Atlas IA
                </h1>

                <p class="subtitle">
                    Análisis local basado únicamente en los datos guardados en este dispositivo.
                </p>

                <section
                    class="hero"
                    style="
                        padding:21px;
                        margin-bottom:18px;
                    "
                >

                    <div
                        style="
                            color:#d9b45f;
                            font-size:29px;
                            margin-bottom:11px;
                        "
                    >
                        ✦
                    </div>

                    <div class="eyebrow">
                        Resumen del mes
                    </div>

                    <div
                        style="
                            margin-top:10px;
                            font-size:18px;
                            line-height:1.5;
                        "
                    >
                        ${this.escape(
                            this.mainMessage(
                                summary
                            )
                        )}
                    </div>

                    <p
                        style="
                            margin:12px 0 0;
                            color:
                                var(
                                    --color-text-muted
                                );
                            font-size:13px;
                            line-height:1.5;
                        "
                    >
                        ${this.escape(
                            this.explanation(
                                summary
                            )
                        )}
                    </p>

                </section>

                <section class="panel">

                    <div class="panelhead">

                        <div>

                            <h2>
                                Indicadores
                            </h2>

                            <p
                                class="note"
                                style="
                                    margin-top:5px;
                                "
                            >
                                Situaciones relevantes detectadas
                            </p>

                        </div>

                    </div>

                    ${this.renderAlerts(
                        summary
                    )}

                </section>

                <section class="panel">

                    <div class="panelhead">

                        <div>

                            <h2>
                                Recomendaciones
                            </h2>

                            <p
                                class="note"
                                style="
                                    margin-top:5px;
                                "
                            >
                                Sugerencias generadas mediante reglas locales
                            </p>

                        </div>

                    </div>

                    ${this.renderRecommendations(
                        summary
                    )}

                </section>

                <section class="panel">

                    <div class="panelhead">

                        <div>

                            <h2>
                                Pregunta a Atlas
                            </h2>

                            <p
                                class="note"
                                style="
                                    margin-top:5px;
                                "
                            >
                                Selecciona una consulta
                            </p>

                        </div>

                    </div>

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(
                                    2,
                                    minmax(
                                        0,
                                        1fr
                                    )
                                );
                            gap:9px;
                            margin-top:14px;
                        "
                    >
                        ${this.renderQuestions()}
                    </div>

                    <div
                        id="atlas-ai-answer"
                        style="
                            display:none;
                            margin-top:15px;
                            padding:16px;
                            border:
                                1px solid
                                rgba(
                                    217,
                                    180,
                                    95,
                                    0.2
                                );
                            border-radius:16px;
                            color:#f7f8fc;
                            background:
                                rgba(
                                    217,
                                    180,
                                    95,
                                    0.07
                                );
                            line-height:1.55;
                        "
                    ></div>

                </section>

                <section
                    class="panel"
                    style="
                        border-color:
                            rgba(
                                145,
                                164,
                                202,
                                0.14
                            );
                    "
                >

                    <p
                        class="note"
                        style="
                            margin:0;
                            line-height:1.5;
                        "
                    >
                        Atlas IA funciona localmente. No envía información financiera a servicios externos y no modifica tus datos.
                    </p>

                </section>

            </div>

        `;

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-ai-question]"
                    );

                if (!button) {

                    return;

                }

                const answerElement =
                    document.getElementById(
                        "atlas-ai-answer"
                    );

                if (
                    !answerElement ||
                    !this.data
                ) {

                    return;

                }

                const summary =
                    this.summary(
                        this.data
                    );

                const answer =
                    this.answer(
                        button.dataset
                            .aiQuestion,
                        summary
                    );

                answerElement.textContent =
                    answer;

                answerElement.style.display =
                    "block";

                answerElement.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "nearest"

                });

            }
        );

    }

};

(function () {

    if (
        typeof AtlasUI ===
        "undefined"
    ) {

        return;

    }

    AtlasUI.ai =
        function (data) {

            return AtlasLocalAI
                .render(
                    data
                );

        };

    AtlasLocalAI.bindEvents();

})();

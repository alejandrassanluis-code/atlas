/* ==========================================================
   ATLAS
   ai-analysis.js
   Atlas IA local — motor de análisis financiero
========================================================== */

const AtlasAIAnalysis = {

    topCategory(
        summary,
        context
    ) {

        return (
            summary.categories || []
        )
            .filter(
                category =>
                    context.number(
                        category.amount
                    ) > 0
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    context.number(
                        second.amount
                    ) -
                    context.number(
                        first.amount
                    )
            )[0] || null;

    },

    secondCategory(
        summary,
        context
    ) {

        return (
            summary.categories || []
        )
            .filter(
                category =>
                    context.number(
                        category.amount
                    ) > 0
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    context.number(
                        second.amount
                    ) -
                    context.number(
                        first.amount
                    )
            )[1] || null;

    },

    savingsDifference(
        summary,
        context
    ) {

        return context.number(
            summary.current
                .monthlySavings
        ) -
        context.number(
            summary.previous
                .monthlySavings
        );

    },

    expenseDifference(
        summary,
        context
    ) {

        return context.number(
            summary.current
                .monthlyExpenses
        ) -
        context.number(
            summary.previous
                .monthlyExpenses
        );

    },

    incomeDifference(
        summary,
        context
    ) {

        return context.number(
            summary.current
                .monthlyIncome
        ) -
        context.number(
            summary.previous
                .monthlyIncome
        );

    },

    mainMessage(
        summary,
        context
    ) {

        if (
            !context.hasFinancialData(
                summary
            )
        ) {

            return "Todavía no hay suficientes datos para realizar un análisis financiero.";

        }

        const current =
            summary.current;

        const savings =
            context.number(
                current.monthlySavings
            );

        const difference =
            this.savingsDifference(
                summary,
                context
            );

        if (
            savings < 0
        ) {

            return (
                "Este mes tu ahorro es negativo. " +
                `Has registrado un resultado de ${
                    context.formatCurrency(
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
                    context.formatCurrency(
                        savings
                    )
                }, ${
                    context.formatCurrency(
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
                    context.formatCurrency(
                        savings
                    )
                }, aunque son ${
                    context.formatCurrency(
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
                    context.formatCurrency(
                        savings
                    )
                }.`
            );

        }

        return "Este mes tus ingresos, gastos e inversiones están equilibrados.";

    },

    explanation(
        summary,
        context
    ) {

        const parts = [];

        const incomeDifference =
            this.incomeDifference(
                summary,
                context
            );

        const expenseDifference =
            this.expenseDifference(
                summary,
                context
            );

        const currentInvested =
            context.number(
                summary.current
                    .monthlyInvested
            );

        const previousInvested =
            context.number(
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
                    context.formatCurrency(
                        incomeDifference
                    )
                }.`
            );

        } else if (
            incomeDifference < 0
        ) {

            parts.push(
                `Los ingresos han bajado ${
                    context.formatCurrency(
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
                    context.formatCurrency(
                        expenseDifference
                    )
                }.`
            );

        } else if (
            expenseDifference < 0
        ) {

            parts.push(
                `Los gastos netos se han reducido ${
                    context.formatCurrency(
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
                    context.formatCurrency(
                        investedDifference
                    )
                } más que el mes anterior.`
            );

        } else if (
            investedDifference < 0
        ) {

            parts.push(
                `Has invertido ${
                    context.formatCurrency(
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

    alerts(
        summary,
        context
    ) {

        const alerts = [];

        const current =
            summary.current;

        const savings =
            context.number(
                current.monthlySavings
            );

        const income =
            context.number(
                current.monthlyIncome
            );

        const expenses =
            context.number(
                current.monthlyExpenses
            );

        const liquidity =
            context.number(
                current.liquidity
            );

        const debt =
            context.number(
                current.debt
            );

        const savingRate =
            context.number(
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
                        context.formatCurrency(
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
                        context.formatCurrency(
                            liquidity
                        )
                    }.`

            });

        }

        if (
            income > 0 &&
            expenses > income
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
                        context.formatPercent(
                            savingRate
                        )
                    } de tus ingresos.`

            });

        }

        if (
            debt > 0 &&
            liquidity > 0 &&
            debt > liquidity
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
                        context.formatCurrency(
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
                        context.formatCurrency(
                            Math.abs(
                                context.number(
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

    recommendations(
        summary,
        context
    ) {

        const recommendations = [];

        const current =
            summary.current;

        const topCategory =
            this.topCategory(
                summary,
                context
            );

        const savings =
            context.number(
                current.monthlySavings
            );

        const income =
            context.number(
                current.monthlyIncome
            );

        const savingRate =
            context.number(
                current.monthlySavingRate
            );

        const liquidity =
            context.number(
                current.liquidity
            );

        const debt =
            context.number(
                current.debt
            );

        if (
            topCategory &&
            context.number(
                topCategory.amount
            ) > 0
        ) {

            recommendations.push(
                `Revisa ${
                    topCategory.category ||
                    topCategory.label ||
                    "tu categoría principal"
                }, que concentra ${
                    context.formatCurrency(
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

    prediction(
        summary,
        context
    ) {

        const now =
            new Date();

        const currentMonthKey =
            context.currentMonthKey();

        const isCurrentMonth =
            summary.monthKey ===
            currentMonthKey;

        if (
            !isCurrentMonth
        ) {

            return null;

        }

        const daysInMonth =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            )
                .getDate();

        const elapsedDays =
            Math.max(
                1,
                now.getDate()
            );

        const currentExpenses =
            context.number(
                summary.current
                    .monthlyExpenses
            );

        const currentSavings =
            context.number(
                summary.current
                    .monthlySavings
            );

        const projectedExpenses =
            currentExpenses /
            elapsedDays *
            daysInMonth;

        const additionalExpenses =
            projectedExpenses -
            currentExpenses;

        const projectedSavings =
            currentSavings -
            additionalExpenses;

        return {

            elapsedDays,

            daysInMonth,

            currentExpenses,

            projectedExpenses,

            additionalExpenses,

            projectedSavings

        };

    },

    response(
        type,
        text,
        followUps = []
    ) {

        return {

            type,

            text,

            followUps:
                followUps.slice(
                    0,
                    4
                )

        };

    },

    insufficient(
        text,
        followUps = []
    ) {

        return this.response(
            "Datos insuficientes",
            text,
            followUps
        );

    }

};


/* ==========================================================
   SUSTITUIR EN ai-local.js

   Elimina desde:

       topCategory(summary) {

   hasta el cierre de:

       insufficient(...) {

   pero conserva alertColor(), renderAlerts() y todo lo demás.

   Pega en ese lugar este bloque.
========================================================== */

    topCategory(summary) {

        return AtlasAIAnalysis
            .topCategory(
                summary,
                this
            );

    },

    secondCategory(summary) {

        return AtlasAIAnalysis
            .secondCategory(
                summary,
                this
            );

    },

    savingsDifference(summary) {

        return AtlasAIAnalysis
            .savingsDifference(
                summary,
                this
            );

    },

    expenseDifference(summary) {

        return AtlasAIAnalysis
            .expenseDifference(
                summary,
                this
            );

    },

    incomeDifference(summary) {

        return AtlasAIAnalysis
            .incomeDifference(
                summary,
                this
            );

    },

    mainMessage(summary) {

        return AtlasAIAnalysis
            .mainMessage(
                summary,
                this
            );

    },

    explanation(summary) {

        return AtlasAIAnalysis
            .explanation(
                summary,
                this
            );

    },

    alerts(summary) {

        return AtlasAIAnalysis
            .alerts(
                summary,
                this
            );

    },

    recommendations(summary) {

        return AtlasAIAnalysis
            .recommendations(
                summary,
                this
            );

    },

    prediction(summary) {

        return AtlasAIAnalysis
            .prediction(
                summary,
                this
            );

    },

    response(
        type,
        text,
        followUps = []
    ) {

        return AtlasAIAnalysis
            .response(
                type,
                text,
                followUps
            );

    },

    insufficient(
        text,
        followUps = []
    ) {

        return AtlasAIAnalysis
            .insufficient(
                text,
                followUps
            );

    },

/* ==========================================================
   ORDEN DE LOS SCRIPTS EN index.html
========================================================== */

<script src="ai-analysis.js"></script>
<script src="ai-local.js"></script>

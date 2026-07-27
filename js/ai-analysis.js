/* ==========================================================
   ATLAS
   ai-analysis.js
   Atlas IA local — motor central de razonamiento financiero
========================================================== */

const AtlasAIAnalysis = {

    /* ======================================================
       NORMALIZACIÓN
    ====================================================== */

    normalizeText(value) {

        return String(
            value || ""
        )
            .trim()
            .toLocaleLowerCase(
                "es-ES"
            )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    },

    unique(values) {

        return [
            ...new Set(
                (
                    values || []
                )
                    .filter(
                        Boolean
                    )
            )
        ];

    },

    /* ======================================================
       CATEGORÍAS
    ====================================================== */

    sortedCategories(
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
            );

    },

    topCategory(
        summary,
        context
    ) {

        return (
            this.sortedCategories(
                summary,
                context
            )[0] ||
            null
        );

    },

    secondCategory(
        summary,
        context
    ) {

        return (
            this.sortedCategories(
                summary,
                context
            )[1] ||
            null
        );

    },

    categoryName(category) {

        if (!category) {

            return "Sin categoría";

        }

        return (
            category.category ||
            category.label ||
            category.name ||
            "Sin categoría"
        );

    },

    categoryAmount(
        category,
        context
    ) {

        if (!category) {

            return 0;

        }

        return context.number(
            category.amount
        );

    },

    findCategory(
        summary,
        categoryName
    ) {

        const normalizedName =
            this.normalizeText(
                categoryName
            );

        if (!normalizedName) {

            return null;

        }

        return (
            summary.categories || []
        )
            .find(
                category =>
                    this.normalizeText(
                        this.categoryName(
                            category
                        )
                    ) ===
                    normalizedName
            ) || null;

    },

    findCategoryContaining(
        summary,
        categoryName
    ) {

        const normalizedName =
            this.normalizeText(
                categoryName
            );

        if (!normalizedName) {

            return null;

        }

        return (
            summary.categories || []
        )
            .find(
                category => {

                    const currentName =
                        this.normalizeText(
                            this.categoryName(
                                category
                            )
                        );

                    return (
                        currentName.includes(
                            normalizedName
                        ) ||
                        normalizedName.includes(
                            currentName
                        )
                    );

                }
            ) || null;

    },

    categoryShareOfExpenses(
        category,
        summary,
        context
    ) {

        const expenses =
            context.number(
                summary.current
                    ?.monthlyExpenses
            );

        if (
            !category ||
            expenses <= 0
        ) {

            return 0;

        }

        return (
            this.categoryAmount(
                category,
                context
            ) /
            expenses *
            100
        );

    },

    categoryShareOfIncome(
        category,
        summary,
        context
    ) {

        const income =
            context.number(
                summary.current
                    ?.monthlyIncome
            );

        if (
            !category ||
            income <= 0
        ) {

            return 0;

        }

        return (
            this.categoryAmount(
                category,
                context
            ) /
            income *
            100
        );

    },

    analyzedCategory(
        category,
        summary,
        context,
        rank
    ) {

        if (!category) {

            return null;

        }

        return {

            raw:
                category,

            name:
                this.categoryName(
                    category
                ),

            amount:
                this.categoryAmount(
                    category,
                    context
                ),

            rank,

            expenseShare:
                this.categoryShareOfExpenses(
                    category,
                    summary,
                    context
                ),

            incomeShare:
                this.categoryShareOfIncome(
                    category,
                    summary,
                    context
                )

        };

    },

    /* ======================================================
       DIFERENCIAS ENTRE PERIODOS
    ====================================================== */

    savingsDifference(
        summary,
        context
    ) {

        return (
            context.number(
                summary.current
                    ?.monthlySavings
            ) -
            context.number(
                summary.previous
                    ?.monthlySavings
            )
        );

    },

    expenseDifference(
        summary,
        context
    ) {

        return (
            context.number(
                summary.current
                    ?.monthlyExpenses
            ) -
            context.number(
                summary.previous
                    ?.monthlyExpenses
            )
        );

    },

    incomeDifference(
        summary,
        context
    ) {

        return (
            context.number(
                summary.current
                    ?.monthlyIncome
            ) -
            context.number(
                summary.previous
                    ?.monthlyIncome
            )
        );

    },

    investmentDifference(
        summary,
        context
    ) {

        return (
            context.number(
                summary.current
                    ?.monthlyInvested
            ) -
            context.number(
                summary.previous
                    ?.monthlyInvested
            )
        );

    },

    /* ======================================================
       CONTEXTO CONVERSACIONAL
    ====================================================== */

    questionTheme(questionKey) {

        const question =
            String(
                questionKey || ""
            );

        const themes = [
            "status",
            "savings",
            "expenses",
            "income",
            "liquidity",
            "debt",
            "investments",
            "goals",
            "prediction",
            "comparison",
            "simulation",
            "budget",
            "recurring"
        ];

        const matchedTheme =
            themes.find(
                theme =>
                    question.startsWith(
                        `${theme}-`
                    )
            );

        const aliases = {

            comparison:
                "comparisons",

            simulation:
                "simulations",

            budget:
                "budgets"

        };

        return matchedTheme
            ? (
                aliases[
                    matchedTheme
                ] ||
                matchedTheme
            )
            : null;

    },

    questionMetric(questionKey) {

        const metrics = {

            "status-overview":
                "net-worth",

            "status-improved":
                "improvements",

            "status-worsened":
                "declines",

            "status-weakness":
                "weakness",

            "status-priority":
                "priority",

            "savings-current":
                "savings",

            "savings-status":
                "period-status",

            "savings-compare":
                "savings",

            "savings-rate":
                "saving-rate",

            "savings-year":
                "annual-savings",

            "expenses-top":
                "expense-category",

            "expenses-change":
                "expenses",

            "expenses-income-share":
                "expense-income-share",

            "expenses-budget":
                "budget",

            "income-current":
                "income",

            "income-compare":
                "income",

            "income-stability":
                "income-stability",

            "liquidity-current":
                "liquidity",

            "liquidity-debt":
                "liquidity-debt",

            "liquidity-security":
                "security-months",

            "liquidity-invest":
                "investment-capacity",

            "liquidity-amortize":
                "debt-repayment-capacity",

            "debt-current":
                "debt",

            "debt-risk":
                "debt-risk",

            "debt-change":
                "debt-payments",

            "investments-current":
                "investments",

            "investments-month":
                "monthly-invested",

            "investments-weight":
                "investment-weight",

            "investments-liquidity":
                "investment-liquidity",

            "goals-status":
                "goals",

            "goals-available-savings":
                "available-savings",

            "goals-priority":
                "goal-priority",

            "prediction-close":
                "projected-savings",

            "prediction-expenses":
                "projected-expenses",

            "prediction-negative":
                "projected-savings",

            "prediction-save-500":
                "target-savings",

            "comparison-month":
                "monthly-comparison",

            "comparison-savings":
                "savings",

            "comparison-expenses":
                "expenses",

            "comparison-income":
                "income",

            "comparison-investments":
                "monthly-invested",

            "simulation-top-20":
                "category-reduction",

            "simulation-save-200":
                "savings-increase",

            "simulation-invest-200":
                "investment-increase",

            "simulation-income-minus-10":
                "income-reduction",

            "simulation-unexpected-1000":
                "unexpected-expense",

            "simulation-debt-500":
                "debt-repayment",

            "budget-status":
                "budget",

            "budget-remaining":
                "budget-remaining",

            "budget-risk":
                "budget-risk",

            "recurring-status":
                "recurring",

            "recurring-prediction":
                "recurring-prediction"

        };

        return (
            metrics[
                questionKey
            ] ||
            null
        );

    },

    questionEntity(
        questionKey,
        summary,
        context
    ) {

        if (
            questionKey !==
                "expenses-top" &&
            questionKey !==
                "simulation-top-20"
        ) {

            return null;

        }

        const category =
            this.topCategory(
                summary,
                context
            );

        if (!category) {

            return null;

        }

        return {

            type:
                "category",

            name:
                this.categoryName(
                    category
                ),

            amount:
                this.categoryAmount(
                    category,
                    context
                ),

            rank:
                1

        };

    },

    createConversationContext(
        questionKey,
        summary,
        context,
        metadata = {}
    ) {

        const entity =
            metadata.entity ||
            this.questionEntity(
                questionKey,
                summary,
                context
            );

        return {

            questionKey:
                questionKey || null,

            theme:
                metadata.theme ||
                this.questionTheme(
                    questionKey
                ),

            metric:
                metadata.metric ||
                this.questionMetric(
                    questionKey
                ),

            period:
                metadata.period ||
                summary.monthKey ||
                null,

            comparisonPeriod:
                metadata.comparisonPeriod ||
                summary.previousMonthKey ||
                null,

            entity:
                entity || null,

            category:
                metadata.category ||
                (
                    entity
                        ?.type ===
                        "category"
                        ? entity.name
                        : null
                ),

            simulation:
                metadata.simulation ||
                null,

            source:
                metadata.source ||
                "guided",

            canCompare:
                metadata.canCompare !==
                false,

            canChangePeriod:
                metadata.canChangePeriod !==
                false

        };

    },

    mergeConversationContext(
        previousContext,
        nextContext
    ) {

        return {

            ...(
                previousContext ||
                {}
            ),

            ...(
                nextContext ||
                {}
            ),

            entity:
                nextContext
                    ?.entity ||
                previousContext
                    ?.entity ||
                null,

            simulation:
                nextContext
                    ?.simulation ||
                previousContext
                    ?.simulation ||
                null

        };

    },

    /* ======================================================
       SEGUIMIENTOS DINÁMICOS
    ====================================================== */

    dynamicFollowUps(
        conversationContext,
        summary,
        context
    ) {

        if (!conversationContext) {

            return [];

        }

        const followUps = [];

        const theme =
            conversationContext.theme;

        const metric =
            conversationContext.metric;

        const entity =
            conversationContext.entity;

        if (
            conversationContext
                .canChangePeriod
        ) {

            followUps.push(
                "context-previous-period"
            );

        }

        if (
            conversationContext
                .canCompare &&
            summary.previous
        ) {

            followUps.push(
                "context-compare-period"
            );

        }

        if (
            entity
                ?.type ===
                "category"
        ) {

            followUps.push(
                "context-category-share",
                "context-category-income-share",
                "context-category-reduce-20"
            );

            if (
                this.secondCategory(
                    summary,
                    context
                )
            ) {

                followUps.push(
                    "context-second-category"
                );

            }

            followUps.push(
                "context-category-movements"
            );

        }

        if (
            theme ===
                "expenses" ||
            metric ===
                "expenses"
        ) {

            followUps.push(
                "expenses-top",
                "expenses-income-share"
            );

            if (summary.budget) {

                followUps.push(
                    "expenses-budget"
                );

            }

        }

        if (
            theme ===
                "savings" ||
            metric ===
                "savings"
        ) {

            followUps.push(
                "savings-rate",
                "savings-year",
                "simulation-save-200"
            );

        }

        if (
            theme ===
                "income" ||
            metric ===
                "income"
        ) {

            followUps.push(
                "income-stability",
                "simulation-income-minus-10"
            );

        }

        if (
            theme ===
            "liquidity"
        ) {

            followUps.push(
                "liquidity-security",
                "liquidity-invest"
            );

        }

        if (
            theme ===
            "investments"
        ) {

            followUps.push(
                "investments-liquidity",
                "investments-weight"
            );

        }

        if (
            theme ===
            "debt"
        ) {

            followUps.push(
                "debt-risk",
                "simulation-debt-500"
            );

        }

        if (
            theme ===
            "prediction"
        ) {

            followUps.push(
                "prediction-expenses",
                "prediction-negative",
                "simulation-unexpected-1000"
            );

        }

        if (
            theme ===
                "budgets" &&
            summary.budget
        ) {

            followUps.push(
                "budget-remaining",
                "budget-risk"
            );

        }

        return this.unique(
            followUps
        )
            .filter(
                questionKey =>
                    questionKey !==
                    conversationContext
                        .questionKey
            )
            .slice(
                0,
                5
            );

    },

    contextualActionLabel(
        actionKey,
        conversationContext
    ) {

        const category =
            conversationContext
                ?.category ||
            conversationContext
                ?.entity
                ?.name ||
            "esta categoría";

        const labels = {

            "context-previous-period":
                "¿Y en el periodo anterior?",

            "context-compare-period":
                "Compararlo con el periodo anterior",

            "context-category-share":
                `¿Qué peso tiene ${category} en mis gastos?`,

            "context-category-income-share":
                `¿Qué porcentaje de mis ingresos destino a ${category}?`,

            "context-category-reduce-20":
                `¿Qué pasa si reduzco ${category} un 20 %?`,

            "context-second-category":
                "Analizar la segunda categoría",

            "context-category-movements":
                `Ver movimientos de ${category}`

        };

        return (
            labels[
                actionKey
            ] ||
            null
        );

    },

    /* ======================================================
       CONSTRUCCIÓN DE PREDICCIÓN
    ====================================================== */

    buildPrediction(
        summary,
        context,
        metrics
    ) {

        const currentMonthKey =
            context.currentMonthKey();

        if (
            summary.monthKey !==
            currentMonthKey
        ) {

            return null;

        }

        const now =
            new Date();

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

        const projectedExpenses =
            metrics.expenses /
            elapsedDays *
            daysInMonth;

        const additionalExpenses =
            Math.max(
                0,
                projectedExpenses -
                metrics.expenses
            );

        return {

            elapsedDays,

            daysInMonth,

            currentExpenses:
                metrics.expenses,

            projectedExpenses,

            additionalExpenses,

            projectedSavings:
                metrics.savings -
                additionalExpenses

        };

    },

    /* ======================================================
       CONSTRUCCIÓN DE ALERTAS
    ====================================================== */

    buildAlerts(
        diagnosis,
        context
    ) {

        const alerts = [];

        diagnosis.risks
            .forEach(
                risk => {

                    const definitions = {

                        "negative-savings": {

                            icon:
                                "⚠️",

                            title:
                                "Ahorro negativo",

                            text:
                                `El resultado del mes es ${
                                    context.formatCurrency(
                                        diagnosis.metrics
                                            .savings
                                    )
                                }.`

                        },

                        "negative-liquidity": {

                            icon:
                                "💵",

                            title:
                                "Liquidez negativa",

                            text:
                                `Tu liquidez total es ${
                                    context.formatCurrency(
                                        diagnosis.metrics
                                            .liquidity
                                    )
                                }.`

                        },

                        "expenses-above-income": {

                            icon:
                                "📉",

                            title:
                                "Gastos superiores a ingresos",

                            text:
                                `Los gastos superan los ingresos en ${
                                    context.formatCurrency(
                                        risk.value
                                    )
                                }.`

                        },

                        "debt-above-liquidity": {

                            icon:
                                "💳",

                            title:
                                "Deuda superior a liquidez",

                            text:
                                `La deuda supera tu liquidez en ${
                                    context.formatCurrency(
                                        risk.value
                                    )
                                }.`

                        },

                        "budget-exceeded": {

                            icon:
                                "🎯",

                            title:
                                "Presupuesto excedido",

                            text:
                                `Has superado el presupuesto del mes en ${
                                    context.formatCurrency(
                                        risk.value
                                    )
                                }.`

                        },

                        "budget-low-margin": {

                            icon:
                                "📋",

                            title:
                                "Presupuesto casi agotado",

                            text:
                                `El margen presupuestario restante es ${
                                    context.formatCurrency(
                                        risk.value
                                    )
                                }.`

                        }

                    };

                    const definition =
                        definitions[
                            risk.key
                        ];

                    if (!definition) {

                        return;

                    }

                    alerts.push({

                        level:
                            risk.level,

                        icon:
                            definition.icon,

                        title:
                            definition.title,

                        text:
                            definition.text

                    });

                }
            );

        const strongSaving =
            diagnosis.strengths
                .find(
                    strength =>
                        strength.key ===
                        "strong-saving-rate"
                );

        if (strongSaving) {

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
                            diagnosis.metrics
                                .savingRate
                        )
                    } de tus ingresos.`

            });

        }

        if (
            alerts.length ===
            0
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

        return alerts.slice(
            0,
            6
        );

    },

    /* ======================================================
       CONSTRUCCIÓN DE RECOMENDACIONES
    ====================================================== */

    buildRecommendations(
        diagnosis,
        context
    ) {

        const recommendations = [];

        diagnosis.priorities
            .forEach(
                priority => {

                    if (
                        recommendations.length >=
                        3
                    ) {

                        return;

                    }

                    const metrics =
                        diagnosis.metrics;

                    const topCategory =
                        diagnosis.categories
                            .top;

                    if (
                        priority.key ===
                        "negative-liquidity"
                    ) {

                        recommendations.push(
                            "Prioriza recuperar liquidez antes de aumentar las aportaciones a inversión o asumir nuevas obligaciones."
                        );

                        return;

                    }

                    if (
                        priority.key ===
                            "negative-savings" ||
                        priority.key ===
                            "expenses-above-income"
                    ) {

                        if (topCategory) {

                            recommendations.push(
                                `Revisa ${
                                    topCategory.name
                                }, que concentra ${
                                    context.formatCurrency(
                                        topCategory.amount
                                    )
                                } de gasto este mes.`
                            );

                        } else {

                            recommendations.push(
                                "Prioriza reducir gasto variable hasta recuperar un resultado mensual positivo."
                            );

                        }

                        return;

                    }

                    if (
                        priority.key ===
                        "budget-exceeded"
                    ) {

                        recommendations.push(
                            "Revisa los gastos pendientes y evita nuevas compras no esenciales hasta recuperar el control del presupuesto."
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "debt-above-liquidity"
                    ) {

                        recommendations.push(
                            "Refuerza la liquidez antes de realizar amortizaciones adicionales que puedan reducir tu fondo de seguridad."
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "low-security-buffer"
                    ) {

                        recommendations.push(
                            "Prioriza construir un fondo de seguridad equivalente al menos a tres meses del gasto actual."
                        );

                        return;

                    }

                    if (
                        priority.key ===
                            "low-saving-rate" ||
                        priority.key ===
                            "improve-saving-rate"
                    ) {

                        recommendations.push(
                            `Tu tasa de ahorro es del ${
                                context.formatPercent(
                                    metrics.savingRate
                                )
                            }. Una reducción moderada en las categorías principales podría mejorarla.`
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "expenses-up"
                    ) {

                        recommendations.push(
                            `Los gastos han aumentado ${
                                context.formatCurrency(
                                    Math.abs(
                                        priority.value
                                    )
                                )
                            }. Revisa qué categorías explican el incremento.`
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "savings-down"
                    ) {

                        recommendations.push(
                            `El ahorro ha bajado ${
                                context.formatCurrency(
                                    Math.abs(
                                        priority.value
                                    )
                                )
                            }. Comprueba si se debe a más gastos, menos ingresos o ambos factores.`
                        );

                        return;

                    }

                    if (
                        priority.key ===
                            "review-top-category" &&
                        topCategory
                    ) {

                        recommendations.push(
                            `Revisa ${
                                topCategory.name
                            }, que concentra ${
                                context.formatCurrency(
                                    topCategory.amount
                                )
                            } de gasto este mes.`
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "review-debt-repayment"
                    ) {

                        recommendations.push(
                            "Dispones de más liquidez que deuda. Valora una amortización parcial sin comprometer tu fondo de seguridad."
                        );

                        return;

                    }

                    if (
                        priority.key ===
                        "allocate-positive-savings"
                    ) {

                        recommendations.push(
                            "No tienes deuda pendiente y el mes presenta ahorro positivo. Puedes priorizar objetivos o inversión según tus necesidades."
                        );

                    }

                }
            );

        if (
            diagnosis.strengths.some(
                strength =>
                    strength.key ===
                    "strong-saving-rate"
            ) &&
            recommendations.length <
                3
        ) {

            recommendations.push(
                "Tu tasa de ahorro es sólida. Puedes valorar distribuir parte del ahorro cerrado entre tus objetivos."
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

        return this.unique(
            recommendations
        )
            .slice(
                0,
                3
            );

    },

    /* ======================================================
       MOTOR CENTRAL DE RAZONAMIENTO
    ====================================================== */

    reason(
        summary,
        context,
        questionKey = null,
        metadata = {}
    ) {

        const current =
            summary.current ||
            {};

        const previous =
            summary.previous ||
            {};

        const topCategory =
            this.topCategory(
                summary,
                context
            );

        const secondCategory =
            this.secondCategory(
                summary,
                context
            );

        const metrics = {

            income:
                context.number(
                    current.monthlyIncome
                ),

            expenses:
                context.number(
                    current.monthlyExpenses
                ),

            grossExpenses:
                context.number(
                    current.monthlyGrossExpenses
                ),

            savings:
                context.number(
                    current.monthlySavings
                ),

            savingRate:
                context.number(
                    current.monthlySavingRate
                ),

            monthlyInvested:
                context.number(
                    current.monthlyInvested
                ),

            debtPayments:
                context.number(
                    current.monthlyDebtPayments
                ),

            liquidity:
                context.number(
                    current.liquidity
                ),

            investments:
                context.number(
                    current.investments
                ),

            debt:
                context.number(
                    current.debt
                ),

            previousIncome:
                context.number(
                    previous.monthlyIncome
                ),

            previousExpenses:
                context.number(
                    previous.monthlyExpenses
                ),

            previousSavings:
                context.number(
                    previous.monthlySavings
                ),

            previousInvested:
                context.number(
                    previous.monthlyInvested
                )

        };

        metrics.netWorth =
            metrics.liquidity +
            metrics.investments -
            metrics.debt;

        metrics.grossAssets =
            metrics.liquidity +
            metrics.investments;

        metrics.expenseIncomeShare =
            metrics.income > 0
                ? (
                    metrics.expenses /
                    metrics.income *
                    100
                )
                : 0;

        metrics.investmentWeight =
            metrics.grossAssets !== 0
                ? (
                    metrics.investments /
                    metrics.grossAssets *
                    100
                )
                : 0;

        metrics.debtLiquidityRatio =
            metrics.liquidity > 0
                ? (
                    metrics.debt /
                    metrics.liquidity *
                    100
                )
                : null;

        metrics.securityMonths =
            metrics.expenses > 0
                ? (
                    metrics.liquidity /
                    metrics.expenses
                )
                : null;

        const differences = {

            income:
                metrics.income -
                metrics.previousIncome,

            expenses:
                metrics.expenses -
                metrics.previousExpenses,

            savings:
                metrics.savings -
                metrics.previousSavings,

            investments:
                metrics.monthlyInvested -
                metrics.previousInvested

        };

        const categories = {

            top:
                this.analyzedCategory(
                    topCategory,
                    summary,
                    context,
                    1
                ),

            second:
                this.analyzedCategory(
                    secondCategory,
                    summary,
                    context,
                    2
                ),

            sorted:
                this.sortedCategories(
                    summary,
                    context
                )

        };

        const conversationContext =
            this.createConversationContext(
                questionKey,
                summary,
                context,
                metadata
            );

        const risks = [];

        const strengths = [];

        const weaknesses = [];

        const trends = [];

        const opportunities = [];

        const priorities = [];

        const evidence = [];

        if (
            metrics.savings < 0
        ) {

            risks.push({

                key:
                    "negative-savings",

                level:
                    "danger",

                score:
                    100,

                theme:
                    "savings",

                metric:
                    "savings",

                title:
                    "Ahorro negativo",

                value:
                    metrics.savings,

                cause:
                    metrics.expenses >
                        metrics.income
                        ? "expenses-above-income"
                        : null

            });

            weaknesses.push({

                key:
                    "negative-savings",

                score:
                    100,

                theme:
                    "savings",

                title:
                    "Resultado mensual negativo",

                value:
                    metrics.savings

            });

        }

        if (
            metrics.liquidity < 0
        ) {

            risks.push({

                key:
                    "negative-liquidity",

                level:
                    "danger",

                score:
                    120,

                theme:
                    "liquidity",

                metric:
                    "liquidity",

                title:
                    "Liquidez negativa",

                value:
                    metrics.liquidity

            });

            weaknesses.push({

                key:
                    "negative-liquidity",

                score:
                    120,

                theme:
                    "liquidity",

                title:
                    "Liquidez negativa",

                value:
                    metrics.liquidity

            });

        }

        if (
            metrics.income > 0 &&
            metrics.expenses >
                metrics.income
        ) {

            risks.push({

                key:
                    "expenses-above-income",

                level:
                    "danger",

                score:
                    110,

                theme:
                    "expenses",

                metric:
                    "expenses",

                title:
                    "Gastos superiores a ingresos",

                value:
                    metrics.expenses -
                    metrics.income

            });

        }

        if (
            metrics.debt > 0 &&
            metrics.debt >
                metrics.liquidity
        ) {

            risks.push({

                key:
                    "debt-above-liquidity",

                level:
                    "warning",

                score:
                    80,

                theme:
                    "debt",

                metric:
                    "liquidity-debt",

                title:
                    "Deuda superior a liquidez",

                value:
                    metrics.debt -
                    metrics.liquidity

            });

            weaknesses.push({

                key:
                    "debt-above-liquidity",

                score:
                    80,

                theme:
                    "debt",

                title:
                    "Desequilibrio entre deuda y liquidez",

                value:
                    metrics.debt -
                    metrics.liquidity

            });

        }

        if (
            summary.budget
                ?.status ===
                "exceeded"
        ) {

            const exceededAmount =
                Math.abs(
                    context.number(
                        summary.budget
                            .remaining
                    )
                );

            risks.push({

                key:
                    "budget-exceeded",

                level:
                    "danger",

                score:
                    115,

                theme:
                    "budgets",

                metric:
                    "budget",

                title:
                    "Presupuesto excedido",

                value:
                    exceededAmount

            });

            weaknesses.push({

                key:
                    "budget-exceeded",

                score:
                    115,

                theme:
                    "budgets",

                title:
                    "Presupuesto excedido",

                value:
                    exceededAmount

            });

        } else if (
            summary.budget &&
            context.number(
                summary.budget.total
            ) > 0
        ) {

            const budgetTotal =
                context.number(
                    summary.budget.total
                );

            const budgetRemaining =
                context.number(
                    summary.budget.remaining
                );

            const remainingPercentage =
                budgetRemaining /
                budgetTotal *
                100;

            if (
                budgetRemaining >= 0 &&
                remainingPercentage <= 15
            ) {

                risks.push({

                    key:
                        "budget-low-margin",

                    level:
                        "warning",

                    score:
                        70,

                    theme:
                        "budgets",

                    metric:
                        "budget-remaining",

                    title:
                        "Presupuesto casi agotado",

                    value:
                        budgetRemaining

                });

            }

        }

        if (
            metrics.income > 0 &&
            metrics.savingRate >= 20
        ) {

            strengths.push({

                key:
                    "strong-saving-rate",

                score:
                    90,

                theme:
                    "savings",

                title:
                    "Tasa de ahorro sólida",

                value:
                    metrics.savingRate

            });

        } else if (
            metrics.income > 0 &&
            metrics.savingRate >= 10
        ) {

            strengths.push({

                key:
                    "positive-saving-rate",

                score:
                    60,

                theme:
                    "savings",

                title:
                    "Tasa de ahorro positiva",

                value:
                    metrics.savingRate

            });

        } else if (
            metrics.income > 0 &&
            metrics.savingRate < 10 &&
            metrics.savings >= 0
        ) {

            weaknesses.push({

                key:
                    "low-saving-rate",

                score:
                    60,

                theme:
                    "savings",

                title:
                    "Tasa de ahorro reducida",

                value:
                    metrics.savingRate

            });

        }

        if (
            metrics.debt === 0
        ) {

            strengths.push({

                key:
                    "no-debt",

                score:
                    70,

                theme:
                    "debt",

                title:
                    "Sin deuda pendiente",

                value:
                    0

            });

        }

        if (
            metrics.liquidity > 0 &&
            metrics.expenses > 0 &&
            metrics.securityMonths >= 3
        ) {

            strengths.push({

                key:
                    "security-buffer",

                score:
                    metrics.securityMonths >= 6
                        ? 85
                        : 65,

                theme:
                    "liquidity",

                title:
                    "Margen de seguridad positivo",

                value:
                    metrics.securityMonths

            });

        } else if (
            metrics.liquidity > 0 &&
            metrics.expenses > 0 &&
            metrics.securityMonths < 3
        ) {

            weaknesses.push({

                key:
                    "low-security-buffer",

                score:
                    65,

                theme:
                    "liquidity",

                title:
                    "Fondo de seguridad reducido",

                value:
                    metrics.securityMonths

            });

        }

        if (
            differences.savings > 0
        ) {

            trends.push({

                key:
                    "savings-up",

                direction:
                    "up",

                impact:
                    "positive",

                score:
                    90,

                theme:
                    "savings",

                metric:
                    "savings",

                title:
                    "El ahorro ha mejorado",

                value:
                    differences.savings

            });

        } else if (
            differences.savings < 0
        ) {

            trends.push({

                key:
                    "savings-down",

                direction:
                    "down",

                impact:
                    "negative",

                score:
                    100,

                theme:
                    "savings",

                metric:
                    "savings",

                title:
                    "El ahorro ha empeorado",

                value:
                    differences.savings

            });

        }

        if (
            differences.expenses > 0
        ) {

            trends.push({

                key:
                    "expenses-up",

                direction:
                    "up",

                impact:
                    "negative",

                score:
                    90,

                theme:
                    "expenses",

                metric:
                    "expenses",

                title:
                    "Los gastos han aumentado",

                value:
                    differences.expenses

            });

        } else if (
            differences.expenses < 0
        ) {

            trends.push({

                key:
                    "expenses-down",

                direction:
                    "down",

                impact:
                    "positive",

                score:
                    80,

                theme:
                    "expenses",

                metric:
                    "expenses",

                title:
                    "Los gastos se han reducido",

                value:
                    differences.expenses

            });

        }

        if (
            differences.income > 0
        ) {

            trends.push({

                key:
                    "income-up",

                direction:
                    "up",

                impact:
                    "positive",

                score:
                    75,

                theme:
                    "income",

                metric:
                    "income",

                title:
                    "Los ingresos han aumentado",

                value:
                    differences.income

            });

        } else if (
            differences.income < 0
        ) {

            trends.push({

                key:
                    "income-down",

                direction:
                    "down",

                impact:
                    "negative",

                score:
                    85,

                theme:
                    "income",

                metric:
                    "income",

                title:
                    "Los ingresos han bajado",

                value:
                    differences.income

            });

        }

        if (
            differences.investments > 0
        ) {

            trends.push({

                key:
                    "investments-up",

                direction:
                    "up",

                impact:
                    metrics.liquidity > 0
                        ? "positive"
                        : "warning",

                score:
                    55,

                theme:
                    "investments",

                metric:
                    "monthly-invested",

                title:
                    "Las aportaciones han aumentado",

                value:
                    differences.investments

            });

        } else if (
            differences.investments < 0
        ) {

            trends.push({

                key:
                    "investments-down",

                direction:
                    "down",

                impact:
                    "neutral",

                score:
                    40,

                theme:
                    "investments",

                metric:
                    "monthly-invested",

                title:
                    "Las aportaciones han disminuido",

                value:
                    differences.investments

            });

        }

        if (categories.top) {

            opportunities.push({

                key:
                    "review-top-category",

                score:
                    60,

                theme:
                    "expenses",

                metric:
                    "expense-category",

                title:
                    "Revisar la categoría principal",

                category:
                    categories.top.name,

                value:
                    categories.top.amount,

                potentialImpact:
                    categories.top.amount *
                    0.2

            });

        }

        if (
            metrics.savings >= 0 &&
            metrics.income > 0 &&
            metrics.savingRate < 10
        ) {

            opportunities.push({

                key:
                    "improve-saving-rate",

                score:
                    75,

                theme:
                    "savings",

                metric:
                    "saving-rate",

                title:
                    "Mejorar la tasa de ahorro",

                value:
                    metrics.savingRate

            });

        }

        if (
            metrics.debt > 0 &&
            metrics.liquidity >
                metrics.debt
        ) {

            opportunities.push({

                key:
                    "review-debt-repayment",

                score:
                    55,

                theme:
                    "debt",

                metric:
                    "debt-repayment-capacity",

                title:
                    "Revisar una posible amortización",

                value:
                    Math.min(
                        metrics.debt,
                        metrics.liquidity
                    )

            });

        }

        if (
            metrics.debt === 0 &&
            metrics.savings > 0 &&
            metrics.liquidity > 0
        ) {

            opportunities.push({

                key:
                    "allocate-positive-savings",

                score:
                    50,

                theme:
                    "goals",

                metric:
                    "available-savings",

                title:
                    "Distribuir ahorro positivo",

                value:
                    metrics.savings

            });

        }

        risks.forEach(
            risk => {

                priorities.push({

                    key:
                        risk.key,

                    type:
                        "risk",

                    score:
                        risk.score,

                    level:
                        risk.level,

                    theme:
                        risk.theme,

                    metric:
                        risk.metric,

                    title:
                        risk.title,

                    value:
                        risk.value

                });

            }
        );

        trends
            .filter(
                trend =>
                    trend.impact ===
                        "negative" ||
                    trend.impact ===
                        "warning"
            )
            .forEach(
                trend => {

                    priorities.push({

                        key:
                            trend.key,

                        type:
                            "trend",

                        score:
                            trend.score,

                        level:
                            trend.impact ===
                                "negative"
                                ? "warning"
                                : "neutral",

                        theme:
                            trend.theme,

                        metric:
                            trend.metric,

                        title:
                            trend.title,

                        value:
                            trend.value

                    });

                }
            );

        weaknesses.forEach(
            weakness => {

                priorities.push({

                    key:
                        weakness.key,

                    type:
                        "weakness",

                    score:
                        weakness.score,

                    level:
                        "warning",

                    theme:
                        weakness.theme,

                    metric:
                        null,

                    title:
                        weakness.title,

                    value:
                        weakness.value

                });

            }
        );

        opportunities.forEach(
            opportunity => {

                priorities.push({

                    key:
                        opportunity.key,

                    type:
                        "opportunity",

                    score:
                        opportunity.score,

                    level:
                        "information",

                    theme:
                        opportunity.theme,

                    metric:
                        opportunity.metric,

                    title:
                        opportunity.title,

                    value:
                        opportunity.value

                });

            }
        );

        const sortedPriorities =
            priorities
                .sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                )
                .filter(
                    (
                        priority,
                        index,
                        values
                    ) =>
                        values.findIndex(
                            item =>
                                item.key ===
                                priority.key
                        ) === index
                );

        const focus =
            sortedPriorities[0] ||
            null;

        let health =
            "neutral";

        if (
            risks.some(
                risk =>
                    risk.level ===
                    "danger"
            )
        ) {

            health =
                "danger";

        } else if (
            risks.length > 0 ||
            weaknesses.length > 0
        ) {

            health =
                "warning";

        } else if (
            strengths.some(
                strength =>
                    strength.key ===
                    "strong-saving-rate"
            )
        ) {

            health =
                "excellent";

        } else if (
            strengths.length > 0
        ) {

            health =
                "good";

        }

        evidence.push(

            {
                key:
                    "current-income",
                metric:
                    "income",
                value:
                    metrics.income
            },

            {
                key:
                    "current-expenses",
                metric:
                    "expenses",
                value:
                    metrics.expenses
            },

            {
                key:
                    "current-savings",
                metric:
                    "savings",
                value:
                    metrics.savings
            },

            {
                key:
                    "current-liquidity",
                metric:
                    "liquidity",
                value:
                    metrics.liquidity
            },

            {
                key:
                    "current-investments",
                metric:
                    "investments",
                value:
                    metrics.investments
            },

            {
                key:
                    "current-debt",
                metric:
                    "debt",
                value:
                    metrics.debt
            }

        );

        if (categories.top) {

            evidence.push({

                key:
                    "top-category",

                metric:
                    "expense-category",

                category:
                    categories.top.name,

                value:
                    categories.top.amount,

                expenseShare:
                    categories.top
                        .expenseShare,

                incomeShare:
                    categories.top
                        .incomeShare

            });

        }

        const sortedRisks =
            risks.sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );

        const sortedStrengths =
            strengths.sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );

        const sortedWeaknesses =
            weaknesses.sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );

        const sortedTrends =
            trends.sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );

        const sortedOpportunities =
            opportunities.sort(
                (
                    first,
                    second
                ) =>
                    second.score -
                    first.score
            );

        const diagnosis = {

            questionKey:
                questionKey || null,

            theme:
                conversationContext.theme,

            metric:
                conversationContext.metric,

            period:
                summary.monthKey ||
                null,

            comparisonPeriod:
                summary.previousMonthKey ||
                null,

            hasFinancialData:
                context.hasFinancialData(
                    summary
                ),

            health,

            focus,

            metrics,

            differences,

            categories,

            risks:
                sortedRisks,

            strengths:
                sortedStrengths,

            weaknesses:
                sortedWeaknesses,

            trends:
                sortedTrends,

            opportunities:
                sortedOpportunities,

            priorities:
                sortedPriorities,

            evidence,

            budget:
                summary.budget ||
                null,

            conversationContext,

            followUps:
                this.dynamicFollowUps(
                    conversationContext,
                    summary,
                    context
                ),

            prediction:
                this.buildPrediction(
                    summary,
                    context,
                    metrics
                ),

            alerts: [],

            recommendations: []

        };

        diagnosis.alerts =
            this.buildAlerts(
                diagnosis,
                context
            );

        diagnosis.recommendations =
            this.buildRecommendations(
                diagnosis,
                context
            );

        return diagnosis;

    },

    /* ======================================================
       MENSAJE PRINCIPAL
    ====================================================== */

    mainMessage(
        summary,
        context
    ) {

        const diagnosis =
            this.reason(
                summary,
                context
            );

        if (
            !diagnosis.hasFinancialData
        ) {

            return "Todavía no hay suficientes datos para realizar un análisis financiero.";

        }

        const metrics =
            diagnosis.metrics;

        const savingsTrend =
            diagnosis.trends
                .find(
                    trend =>
                        trend.metric ===
                        "savings"
                );

        if (
            diagnosis.focus
                ?.key ===
                "negative-liquidity"
        ) {

            return (
                "La liquidez es el principal punto de atención. " +
                `Actualmente se sitúa en ${
                    context.formatCurrency(
                        metrics.liquidity
                    )
                }.`
            );

        }

        if (
            metrics.savings < 0
        ) {

            let text =
                `Este mes tu ahorro es negativo: ${
                    context.formatCurrency(
                        metrics.savings
                    )
                }.`;

            if (
                diagnosis.categories.top
            ) {

                text +=
                    ` ${
                        diagnosis.categories
                            .top.name
                    } es tu mayor categoría de gasto, con ${
                        context.formatCurrency(
                            diagnosis.categories
                                .top.amount
                        )
                    }.`;

            }

            return text;

        }

        if (
            savingsTrend
                ?.key ===
                "savings-up"
        ) {

            return (
                "Tu situación mensual ha mejorado. " +
                `Has ahorrado ${
                    context.formatCurrency(
                        metrics.savings
                    )
                }, ${
                    context.formatCurrency(
                        savingsTrend.value
                    )
                } más que el mes anterior.`
            );

        }

        if (
            savingsTrend
                ?.key ===
                "savings-down"
        ) {

            return (
                `Has ahorrado ${
                    context.formatCurrency(
                        metrics.savings
                    )
                }, aunque son ${
                    context.formatCurrency(
                        Math.abs(
                            savingsTrend.value
                        )
                    )
                } menos que el mes anterior.`
            );

        }

        if (
            metrics.savings > 0
        ) {

            return (
                `Este mes has generado un ahorro de ${
                    context.formatCurrency(
                        metrics.savings
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

        const diagnosis =
            this.reason(
                summary,
                context
            );

        const parts = [];

        diagnosis.trends
            .forEach(
                trend => {

                    if (
                        trend.key ===
                        "income-up"
                    ) {

                        parts.push(
                            `Los ingresos han aumentado ${
                                context.formatCurrency(
                                    trend.value
                                )
                            }.`
                        );

                    } else if (
                        trend.key ===
                        "income-down"
                    ) {

                        parts.push(
                            `Los ingresos han bajado ${
                                context.formatCurrency(
                                    Math.abs(
                                        trend.value
                                    )
                                )
                            }.`
                        );

                    } else if (
                        trend.key ===
                        "expenses-up"
                    ) {

                        parts.push(
                            `Los gastos netos han aumentado ${
                                context.formatCurrency(
                                    trend.value
                                )
                            }.`
                        );

                    } else if (
                        trend.key ===
                        "expenses-down"
                    ) {

                        parts.push(
                            `Los gastos netos se han reducido ${
                                context.formatCurrency(
                                    Math.abs(
                                        trend.value
                                    )
                                )
                            }.`
                        );

                    } else if (
                        trend.key ===
                        "investments-up"
                    ) {

                        parts.push(
                            `Has invertido ${
                                context.formatCurrency(
                                    trend.value
                                )
                            } más que el mes anterior.`
                        );

                    } else if (
                        trend.key ===
                        "investments-down"
                    ) {

                        parts.push(
                            `Has invertido ${
                                context.formatCurrency(
                                    Math.abs(
                                        trend.value
                                    )
                                )
                            } menos que el mes anterior.`
                        );

                    }

                }
            );

        if (
            parts.length ===
            0
        ) {

            return "No hay cambios relevantes respecto al mes anterior.";

        }

        return parts
            .slice(
                0,
                3
            )
            .join(" ");

    },

    /* ======================================================
       ALERTAS
    ====================================================== */

    alerts(
        summary,
        context
    ) {

        return this
            .reason(
                summary,
                context
            )
            .alerts;

    },

    /* ======================================================
       RECOMENDACIONES
    ====================================================== */

    recommendations(
        summary,
        context
    ) {

        return this
            .reason(
                summary,
                context
            )
            .recommendations;

    },

    /* ======================================================
       PREDICCIÓN
    ====================================================== */

    prediction(
        summary,
        context
    ) {

        return this
            .reason(
                summary,
                context
            )
            .prediction;

    },

    /* ======================================================
       SIMULACIONES
    ====================================================== */

    simulateCategoryReduction(
        category,
        percentage,
        summary,
        context
    ) {

        const normalizedPercentage =
            Math.min(
                100,
                Math.max(
                    0,
                    context.number(
                        percentage
                    )
                )
            );

        const amount =
            this.categoryAmount(
                category,
                context
            );

        const reduction =
            amount *
            normalizedPercentage /
            100;

        const currentSavings =
            context.number(
                summary.current
                    ?.monthlySavings
            );

        return {

            category:
                this.categoryName(
                    category
                ),

            percentage:
                normalizedPercentage,

            originalAmount:
                amount,

            reduction,

            resultingAmount:
                Math.max(
                    0,
                    amount -
                    reduction
                ),

            currentSavings,

            projectedSavings:
                currentSavings +
                reduction

        };

    },

    simulateIncomeReduction(
        percentage,
        summary,
        context
    ) {

        const normalizedPercentage =
            Math.min(
                100,
                Math.max(
                    0,
                    context.number(
                        percentage
                    )
                )
            );

        const income =
            context.number(
                summary.current
                    ?.monthlyIncome
            );

        const savings =
            context.number(
                summary.current
                    ?.monthlySavings
            );

        const reduction =
            income *
            normalizedPercentage /
            100;

        return {

            percentage:
                normalizedPercentage,

            currentIncome:
                income,

            reduction,

            projectedIncome:
                income -
                reduction,

            currentSavings:
                savings,

            projectedSavings:
                savings -
                reduction

        };

    },

    simulateExtraInvestment(
        amount,
        summary,
        context
    ) {

        const investment =
            Math.max(
                0,
                context.number(
                    amount
                )
            );

        const liquidity =
            context.number(
                summary.current
                    ?.liquidity
            );

        const investments =
            context.number(
                summary.current
                    ?.investments
            );

        const savings =
            context.number(
                summary.current
                    ?.monthlySavings
            );

        return {

            amount:
                investment,

            currentLiquidity:
                liquidity,

            projectedLiquidity:
                liquidity -
                investment,

            currentInvestments:
                investments,

            projectedInvestments:
                investments +
                investment,

            currentSavings:
                savings,

            projectedSavings:
                savings -
                investment

        };

    },

    simulateUnexpectedExpense(
        amount,
        summary,
        context
    ) {

        const expense =
            Math.max(
                0,
                context.number(
                    amount
                )
            );

        const savings =
            context.number(
                summary.current
                    ?.monthlySavings
            );

        const liquidity =
            context.number(
                summary.current
                    ?.liquidity
            );

        return {

            amount:
                expense,

            currentSavings:
                savings,

            projectedSavings:
                savings -
                expense,

            currentLiquidity:
                liquidity,

            projectedLiquidity:
                liquidity -
                expense

        };

    },

    simulateDebtRepayment(
        amount,
        summary,
        context
    ) {

        const debt =
            context.number(
                summary.current
                    ?.debt
            );

        const liquidity =
            context.number(
                summary.current
                    ?.liquidity
            );

        const requestedPayment =
            Math.max(
                0,
                context.number(
                    amount
                )
            );

        const payment =
            Math.min(
                requestedPayment,
                debt
            );

        return {

            requestedPayment,

            payment,

            currentDebt:
                debt,

            projectedDebt:
                debt -
                payment,

            currentLiquidity:
                liquidity,

            projectedLiquidity:
                liquidity -
                payment

        };

    },

    /* ======================================================
       OPORTUNIDADES COMPATIBLES CON LA INTERFAZ ANTERIOR
    ====================================================== */

    opportunities(
        summary,
        context
    ) {

        const diagnosis =
            this.reason(
                summary,
                context
            );

        const results = [];

        diagnosis.priorities
            .forEach(
                priority => {

                    if (
                        results.length >=
                        5
                    ) {

                        return;

                    }

                    if (
                        priority.key ===
                        "negative-liquidity"
                    ) {

                        results.push({

                            priority:
                                priority.score,

                            type:
                                "danger",

                            topic:
                                "liquidity",

                            intent:
                                "liquidity-status",

                            title:
                                "Tu liquidez es negativa",

                            text:
                                `La liquidez total se sitúa en ${
                                    context.formatCurrency(
                                        diagnosis.metrics
                                            .liquidity
                                    )
                                }.`

                        });

                        return;

                    }

                    if (
                        priority.key ===
                        "budget-exceeded"
                    ) {

                        results.push({

                            priority:
                                priority.score,

                            type:
                                "danger",

                            topic:
                                "budgets",

                            intent:
                                "budget-status",

                            title:
                                "Has superado el presupuesto",

                            text:
                                `El presupuesto mensual está excedido en ${
                                    context.formatCurrency(
                                        priority.value
                                    )
                                }.`

                        });

                        return;

                    }

                    if (
                        priority.key ===
                        "savings-down"
                    ) {

                        results.push({

                            priority:
                                priority.score,

                            type:
                                "warning",

                            topic:
                                "savings",

                            intent:
                                "compare-savings",

                            title:
                                "Tu ahorro ha bajado",

                            text:
                                `Este mes llevas ${
                                    context.formatCurrency(
                                        Math.abs(
                                            priority.value
                                        )
                                    )
                                } menos de ahorro que el mes anterior.`

                        });

                        return;

                    }

                    if (
                        priority.key ===
                        "expenses-up"
                    ) {

                        results.push({

                            priority:
                                priority.score,

                            type:
                                "warning",

                            topic:
                                "expenses",

                            intent:
                                "compare-expenses",

                            title:
                                "Tus gastos han aumentado",

                            text:
                                `Los gastos netos han aumentado ${
                                    context.formatCurrency(
                                        priority.value
                                    )
                                } respecto al mes anterior.`

                        });

                        return;

                    }

                    if (
                        priority.key ===
                            "review-top-category" &&
                        diagnosis.categories
                            .top
                    ) {

                        results.push({

                            priority:
                                priority.score,

                            type:
                                "information",

                            topic:
                                "expenses",

                            intent:
                                "top-category",

                            category:
                                diagnosis.categories
                                    .top.name,

                            title:
                                "Tu principal gasto del mes",

                            text:
                                `${
                                    diagnosis.categories
                                        .top.name
                                } es la categoría con más gasto, con ${
                                    context.formatCurrency(
                                        diagnosis.categories
                                            .top.amount
                                    )
                                }.`

                        });

                    }

                }
            );

        if (
            diagnosis.strengths.some(
                strength =>
                    strength.key ===
                    "strong-saving-rate"
            )
        ) {

            results.push({

                priority:
                    50,

                type:
                    "success",

                topic:
                    "savings",

                intent:
                    "saving-rate",

                title:
                    "Tu tasa de ahorro es sólida",

                text:
                    `Este mes estás ahorrando el ${
                        context.formatPercent(
                            diagnosis.metrics
                                .savingRate
                        )
                    } de tus ingresos.`

            });

        }

        return results
            .sort(
                (
                    first,
                    second
                ) =>
                    second.priority -
                    first.priority
            )
            .slice(
                0,
                5
            );

    },

    /* ======================================================
       RESPUESTAS
    ====================================================== */

    response(
        type,
        text,
        followUps = [],
        metadata = {}
    ) {

        return {

            type,

            text,

            followUps:
                this.unique(
                    followUps
                )
                    .slice(
                        0,
                        5
                    ),

            metadata: {

                ...metadata,

                createdAt:
                    Date.now()

            }

        };

    },

    contextualResponse(
        type,
        text,
        questionKey,
        summary,
        context,
        followUps = [],
        metadata = {}
    ) {

        const diagnosis =
            this.reason(
                summary,
                context,
                questionKey,
                metadata
            );

        return this.response(
            type,
            text,
            this.unique([
                ...followUps,
                ...diagnosis.followUps
            ]),
            {

                ...metadata,

                conversationContext:
                    diagnosis
                        .conversationContext

            }
        );

    },

    insufficient(
        text,
        followUps = [],
        metadata = {}
    ) {

        return this.response(
            "Datos insuficientes",
            text,
            followUps,
            metadata
        );

    },

    contextualInsufficient(
        text,
        questionKey,
        summary,
        context,
        followUps = [],
        metadata = {}
    ) {

        const diagnosis =
            this.reason(
                summary,
                context,
                questionKey,
                metadata
            );

        return this.insufficient(
            text,
            this.unique([
                ...followUps,
                ...diagnosis.followUps
            ]),
            {

                ...metadata,

                conversationContext:
                    diagnosis
                        .conversationContext

            }
        );

    }

};

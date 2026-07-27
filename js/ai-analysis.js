/* ==========================================================
   ATLAS
   ai-analysis.js
   Atlas IA local — motor de análisis financiero
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
                    .monthlyExpenses
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
                    .monthlyIncome
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
                    .monthlySavings
            ) -
            context.number(
                summary.previous
                    .monthlySavings
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
                    .monthlyExpenses
            ) -
            context.number(
                summary.previous
                    .monthlyExpenses
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
                    .monthlyIncome
            ) -
            context.number(
                summary.previous
                    .monthlyIncome
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
                    .monthlyInvested
            ) -
            context.number(
                summary.previous
                    .monthlyInvested
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

        if (
            question.startsWith(
                "status-"
            )
        ) {

            return "status";

        }

        if (
            question.startsWith(
                "savings-"
            )
        ) {

            return "savings";

        }

        if (
            question.startsWith(
                "expenses-"
            )
        ) {

            return "expenses";

        }

        if (
            question.startsWith(
                "income-"
            )
        ) {

            return "income";

        }

        if (
            question.startsWith(
                "liquidity-"
            )
        ) {

            return "liquidity";

        }

        if (
            question.startsWith(
                "debt-"
            )
        ) {

            return "debt";

        }

        if (
            question.startsWith(
                "investments-"
            )
        ) {

            return "investments";

        }

        if (
            question.startsWith(
                "goals-"
            )
        ) {

            return "goals";

        }

        if (
            question.startsWith(
                "prediction-"
            )
        ) {

            return "prediction";

        }

        if (
            question.startsWith(
                "comparison-"
            )
        ) {

            return "comparisons";

        }

        if (
            question.startsWith(
                "simulation-"
            )
        ) {

            return "simulations";

        }

        if (
            question.startsWith(
                "budget-"
            )
        ) {

            return "budgets";

        }

        if (
            question.startsWith(
                "recurring-"
            )
        ) {

            return "recurring";

        }

        return null;

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
            questionKey ===
                "expenses-top" ||
            questionKey ===
                "simulation-top-20"
        ) {

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

        }

        return null;

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
                "context-category-share"
            );

            followUps.push(
                "context-category-income-share"
            );

            followUps.push(
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
                "expenses-top"
            );

            followUps.push(
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
                "savings-rate"
            );

            followUps.push(
                "savings-year"
            );

            followUps.push(
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
                "income-stability"
            );

            followUps.push(
                "simulation-income-minus-10"
            );

        }

        if (
            theme ===
                "liquidity"
        ) {

            followUps.push(
                "liquidity-security"
            );

            followUps.push(
                "liquidity-invest"
            );

        }

        if (
            theme ===
                "investments"
        ) {

            followUps.push(
                "investments-liquidity"
            );

            followUps.push(
                "investments-weight"
            );

        }

        if (
            theme ===
                "debt"
        ) {

            followUps.push(
                "debt-risk"
            );

            followUps.push(
                "simulation-debt-500"
            );

        }

        if (
            theme ===
                "prediction"
        ) {

            followUps.push(
                "prediction-expenses"
            );

            followUps.push(
                "prediction-negative"
            );

            followUps.push(
                "simulation-unexpected-1000"
            );

        }

        if (
            theme ===
                "budgets" &&
            summary.budget
        ) {

            followUps.push(
                "budget-remaining"
            );

            followUps.push(
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
       MOTOR DE RAZONAMIENTO
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
                ? metrics.expenses /
                    metrics.income *
                    100
                : 0;

        metrics.investmentWeight =
            metrics.grossAssets !== 0
                ? metrics.investments /
                    metrics.grossAssets *
                    100
                : 0;

        metrics.debtLiquidityRatio =
            metrics.liquidity > 0
                ? metrics.debt /
                    metrics.liquidity *
                    100
                : null;

        metrics.securityMonths =
            metrics.expenses > 0
                ? metrics.liquidity /
                    metrics.expenses
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
                budgetTotal > 0
                    ? budgetRemaining /
                        budgetTotal *
                        100
                    : 0;

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

        evidence.push({

            key:
                "current-income",

            metric:
                "income",

            value:
                metrics.income

        });

        evidence.push({

            key:
                "current-expenses",

            metric:
                "expenses",

            value:
                metrics.expenses

        });

        evidence.push({

            key:
                "current-savings",

            metric:
                "savings",

            value:
                metrics.savings

        });

        evidence.push({

            key:
                "current-liquidity",

            metric:
                "liquidity",

            value:
                metrics.liquidity

        });

        evidence.push({

            key:
                "current-investments",

            metric:
                "investments",

            value:
                metrics.investments

        });

        evidence.push({

            key:
                "current-debt",

            metric:
                "debt",

            value:
                metrics.debt

        });

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

        return {

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
                risks.sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                ),

            strengths:
                strengths.sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                ),

            weaknesses:
                weaknesses.sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                ),

            trends:
                trends.sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                ),

            opportunities:
                opportunities.sort(
                    (
                        first,
                        second
                    ) =>
                        second.score -
                        first.score
                ),

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
                )

        };

    },

    /* ======================================================
       MENSAJE PRINCIPAL
    ====================================================== */

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

        const investedDifference =
            this.investmentDifference(
                summary,
                context
            );

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

    /* ======================================================
       ALERTAS
    ====================================================== */

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

    /* ======================================================
       RECOMENDACIONES
    ====================================================== */

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
            this.categoryAmount(
                topCategory,
                context
            ) > 0
        ) {

            recommendations.push(
                `Revisa ${
                    this.categoryName(
                        topCategory
                    )
                }, que concentra ${
                    context.formatCurrency(
                        this.categoryAmount(
                            topCategory,
                            context
                        )
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
            recommendations.length === 0
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

    /* ======================================================
       PREDICCIÓN
    ====================================================== */

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

        if (!isCurrentMonth) {

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
            Math.max(
                0,
                projectedExpenses -
                currentExpenses
            );

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
                    .monthlySavings
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
                    .monthlyIncome
            );

        const savings =
            context.number(
                summary.current
                    .monthlySavings
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
                    .liquidity
            );

        const investments =
            context.number(
                summary.current
                    .investments
            );

        const savings =
            context.number(
                summary.current
                    .monthlySavings
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
                    .monthlySavings
            );

        const liquidity =
            context.number(
                summary.current
                    .liquidity
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
                    .debt
            );

        const liquidity =
            context.number(
                summary.current
                    .liquidity
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
       OPORTUNIDADES
    ====================================================== */

    opportunities(
        summary,
        context
    ) {

        const opportunities = [];

        const current =
            summary.current;

        const topCategory =
            this.topCategory(
                summary,
                context
            );

        const savingsDifference =
            this.savingsDifference(
                summary,
                context
            );

        const expenseDifference =
            this.expenseDifference(
                summary,
                context
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
            savingsDifference < 0
        ) {

            opportunities.push({

                priority:
                    100,

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
                                savingsDifference
                            )
                        )
                    } menos de ahorro que el mes anterior.`

            });

        }

        if (
            expenseDifference > 0
        ) {

            opportunities.push({

                priority:
                    90,

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
                            expenseDifference
                        )
                    } respecto al mes anterior.`

            });

        }

        if (
            summary.budget
                ?.status ===
                "exceeded"
        ) {

            opportunities.push({

                priority:
                    110,

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
                            Math.abs(
                                context.number(
                                    summary.budget
                                        .remaining
                                )
                            )
                        )
                    }.`

            });

        } else if (
            summary.budget &&
            context.number(
                summary.budget.total
            ) > 0
        ) {

            const remaining =
                context.number(
                    summary.budget
                        .remaining
                );

            const total =
                context.number(
                    summary.budget
                        .total
                );

            const remainingPercentage =
                total > 0
                    ? remaining /
                        total *
                        100
                    : 0;

            if (
                remaining >= 0 &&
                remainingPercentage <= 15
            ) {

                opportunities.push({

                    priority:
                        80,

                    type:
                        "warning",

                    topic:
                        "budgets",

                    intent:
                        "budget-status",

                    title:
                        "Tu presupuesto está casi agotado",

                    text:
                        `Solo quedan ${
                            context.formatCurrency(
                                remaining
                            )
                        } disponibles este mes.`

                });

            }

        }

        if (topCategory) {

            opportunities.push({

                priority:
                    60,

                type:
                    "information",

                topic:
                    "expenses",

                intent:
                    "top-category",

                category:
                    this.categoryName(
                        topCategory
                    ),

                title:
                    "Tu principal gasto del mes",

                text:
                    `${
                        this.categoryName(
                            topCategory
                        )
                    } es la categoría con más gasto, con ${
                        context.formatCurrency(
                            this.categoryAmount(
                                topCategory,
                                context
                            )
                        )
                    }.`

            });

        }

        if (
            income > 0 &&
            savingRate >= 20
        ) {

            opportunities.push({

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
                            savingRate
                        )
                    } de tus ingresos.`

            });

        }

        if (
            liquidity < 0
        ) {

            opportunities.push({

                priority:
                    120,

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
                            liquidity
                        )
                    }.`

            });

        }

        if (
            debt > liquidity &&
            debt > 0
        ) {

            opportunities.push({

                priority:
                    70,

                type:
                    "warning",

                topic:
                    "debt",

                intent:
                    "debt-status",

                title:
                    "La deuda supera tu liquidez",

                text:
                    `La diferencia es de ${
                        context.formatCurrency(
                            debt -
                            liquidity
                        )
                    }.`

            });

        }

        return opportunities
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

        const normalizedFollowUps =
            this.unique(
                followUps
            )
                .slice(
                    0,
                    5
                );

        return {

            type,

            text,

            followUps:
                normalizedFollowUps,

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

        const conversationContext =
            this.createConversationContext(
                questionKey,
                summary,
                context,
                metadata
            );

        const dynamicFollowUps =
            this.dynamicFollowUps(
                conversationContext,
                summary,
                context
            );

        return this.response(
            type,
            text,
            this.unique([
                ...followUps,
                ...dynamicFollowUps
            ]),
            {

                ...metadata,

                conversationContext

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

        const conversationContext =
            this.createConversationContext(
                questionKey,
                summary,
                context,
                metadata
            );

        const dynamicFollowUps =
            this.dynamicFollowUps(
                conversationContext,
                summary,
                context
            );

        return this.insufficient(
            text,
            this.unique([
                ...followUps,
                ...dynamicFollowUps
            ]),
            {

                ...metadata,

                conversationContext

            }
        );

    }

};

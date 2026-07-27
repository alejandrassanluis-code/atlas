/* ==========================================================
   ATLAS IA
   Integración del contexto conversacional
========================================================== */

(function enhanceAtlasLocalConversation() {

    if (
        typeof AtlasLocalAI ===
            "undefined" ||
        typeof AtlasAIAnalysis ===
            "undefined"
    ) {

        return;

    }

    const originalInitializeConversation =
        AtlasLocalAI.initializeConversation
            .bind(
                AtlasLocalAI
            );

    const originalResetConversation =
        AtlasLocalAI.resetConversation
            .bind(
                AtlasLocalAI
            );

    const originalPushNavigation =
        AtlasLocalAI.pushNavigation
            .bind(
                AtlasLocalAI
            );

    const originalGoBack =
        AtlasLocalAI.goBack
            .bind(
                AtlasLocalAI
            );

    const originalQuestionLabel =
        AtlasLocalAI.questionLabel
            .bind(
                AtlasLocalAI
            );

    const originalAnswerQuestion =
        AtlasLocalAI.answerQuestion
            .bind(
                AtlasLocalAI
            );

    AtlasLocalAI.ensureConversationState =
        function () {

            if (
                !Array.isArray(
                    this.state.followUps
                )
            ) {

                this.state.followUps = [];

            }

            if (
                !Object.prototype
                    .hasOwnProperty
                    .call(
                        this.state,
                        "conversationContext"
                    )
            ) {

                this.state.conversationContext =
                    null;

            }

        };

    AtlasLocalAI.initializeConversation =
        function () {

            originalInitializeConversation();

            this.ensureConversationState();

        };

    AtlasLocalAI.resetConversation =
        function () {

            originalResetConversation();

            this.ensureConversationState();

            this.state.followUps = [];

            this.state.conversationContext =
                null;

        };

    AtlasLocalAI.pushNavigation =
        function () {

            originalPushNavigation();

            const current =
                this.state.navigation[
                    this.state.navigation.length -
                    1
                ];

            if (!current) {

                return;

            }

            current.followUps = [
                ...(
                    this.state.followUps ||
                    []
                )
            ];

            current.conversationContext =
                this.state.conversationContext
                    ? {
                        ...this.state
                            .conversationContext,

                        entity:
                            this.state
                                .conversationContext
                                .entity
                                ? {
                                    ...this.state
                                        .conversationContext
                                        .entity
                                }
                                : null,

                        simulation:
                            this.state
                                .conversationContext
                                .simulation
                                ? {
                                    ...this.state
                                        .conversationContext
                                        .simulation
                                }
                                : null
                    }
                    : null;

        };

    AtlasLocalAI.goBack =
        function () {

            const previous =
                this.state.navigation[
                    this.state.navigation.length -
                    1
                ];

            originalGoBack();

            if (!previous) {

                return;

            }

            this.state.followUps = [
                ...(
                    previous.followUps ||
                    []
                )
            ];

            this.state.conversationContext =
                previous.conversationContext
                    ? {
                        ...previous
                            .conversationContext,

                        entity:
                            previous
                                .conversationContext
                                .entity
                                ? {
                                    ...previous
                                        .conversationContext
                                        .entity
                                }
                                : null,

                        simulation:
                            previous
                                .conversationContext
                                .simulation
                                ? {
                                    ...previous
                                        .conversationContext
                                        .simulation
                                }
                                : null
                    }
                    : null;

        };

    AtlasLocalAI.summaryForMonth =
        function (
            monthKey,
            data = this.data
        ) {

            const previousMonthKey =
                this.previousMonthKey(
                    monthKey
                );

            return {

                monthKey,

                previousMonthKey,

                current:
                    AtlasCalculations
                        .financialSummary(
                            data,
                            monthKey
                        ),

                previous:
                    AtlasCalculations
                        .financialSummary(
                            data,
                            previousMonthKey
                        ),

                comparison:
                    AtlasCalculations
                        .monthlyComparison(
                            data,
                            monthKey
                        ),

                categories:
                    AtlasCalculations
                        .expenseCategories(
                            data,
                            monthKey
                        ),

                budget:
                    AtlasCalculations
                        .budgetSummary(
                            data,
                            monthKey
                        )

            };

        };

    AtlasLocalAI.categoryName =
        function (category) {

            return (
                category
                    ?.category ||
                category
                    ?.label ||
                category
                    ?.name ||
                "Sin categoría"
            );

        };

    AtlasLocalAI.contextCategory =
        function (summary) {

            const context =
                this.state
                    .conversationContext;

            const storedName =
                context
                    ?.category ||
                context
                    ?.entity
                    ?.name;

            if (storedName) {

                const category =
                    AtlasAIAnalysis
                        .findCategoryContaining(
                            summary,
                            storedName
                        );

                if (category) {

                    return category;

                }

            }

            return this.topCategory(
                summary
            );

        };

    AtlasLocalAI.conversationMetadata =
        function (
            questionKey,
            summary,
            metadata = {}
        ) {

            const generated =
                AtlasAIAnalysis
                    .createConversationContext(
                        questionKey,
                        summary,
                        this,
                        metadata
                    );

            return AtlasAIAnalysis
                .mergeConversationContext(
                    this.state
                        .conversationContext,
                    generated
                );

        };

    AtlasLocalAI.dynamicFollowUps =
        function (
            conversationContext,
            summary
        ) {

            return AtlasAIAnalysis
                .dynamicFollowUps(
                    conversationContext,
                    summary,
                    this
                )
                .filter(
                    questionKey =>
                        questionKey !==
                        "context-category-movements"
                )
                .slice(
                    0,
                    4
                );

        };

    AtlasLocalAI.questionLabel =
        function (
            questionKey,
            summary
        ) {

            if (
                String(
                    questionKey || ""
                )
                    .startsWith(
                        "context-"
                    )
            ) {

                return (
                    AtlasAIAnalysis
                        .contextualActionLabel(
                            questionKey,
                            this.state
                                .conversationContext
                        ) ||
                    "Seguir analizando"
                );

            }

            return originalQuestionLabel(
                questionKey,
                summary
            );

        };

    AtlasLocalAI.contextualCategoryShare =
        function (
            summary,
            useIncome = false
        ) {

            const category =
                this.contextCategory(
                    summary
                );

            if (!category) {

                return this.insufficient(
                    "No hay una categoría de gasto activa sobre la que realizar este cálculo.",
                    [
                        "expenses-top"
                    ]
                );

            }

            const amount =
                this.number(
                    category.amount
                );

            const total =
                useIncome
                    ? this.number(
                        summary.current
                            .monthlyIncome
                    )
                    : this.number(
                        summary.current
                            .monthlyExpenses
                    );

            if (
                total <= 0
            ) {

                return this.insufficient(
                    useIncome
                        ? "No hay ingresos positivos registrados para calcular este porcentaje."
                        : "No hay gastos positivos registrados para calcular este porcentaje.",
                    [
                        useIncome
                            ? "income-current"
                            : "expenses-top"
                    ]
                );

            }

            const percentage =
                amount /
                total *
                100;

            const name =
                this.categoryName(
                    category
                );

            return this.response(
                "Dato real",
                useIncome
                    ? `${name} representa el ${
                        this.formatPercent(
                            percentage
                        )
                    } de tus ingresos del periodo, con ${
                        this.formatCurrency(
                            amount
                        )
                    }.`
                    : `${name} representa el ${
                        this.formatPercent(
                            percentage
                        )
                    } de tus gastos del periodo, con ${
                        this.formatCurrency(
                            amount
                        )
                    }.`,
                [
                    "context-category-reduce-20",
                    "context-previous-period",
                    "context-second-category"
                ]
            );

        };

    AtlasLocalAI.contextualSecondCategory =
        function (summary) {

            const category =
                this.secondCategory(
                    summary
                );

            if (!category) {

                return this.insufficient(
                    "No hay una segunda categoría positiva disponible en este periodo.",
                    [
                        "expenses-top"
                    ]
                );

            }

            const name =
                this.categoryName(
                    category
                );

            const amount =
                this.number(
                    category.amount
                );

            const expenses =
                this.number(
                    summary.current
                        .monthlyExpenses
                );

            const share =
                expenses > 0
                    ? amount /
                        expenses *
                        100
                    : 0;

            return this.response(
                "Dato real",
                `${name} es tu segunda categoría con más gasto, con ${
                    this.formatCurrency(
                        amount
                    )
                }${
                    expenses > 0
                        ? `, equivalente al ${
                            this.formatPercent(
                                share
                            )
                        } de tus gastos`
                        : ""
                }.`,
                [
                    "context-category-share",
                    "context-category-income-share",
                    "context-category-reduce-20",
                    "context-previous-period"
                ]
            );

        };

    AtlasLocalAI.contextualReduction =
        function (summary) {

            const category =
                this.contextCategory(
                    summary
                );

            if (!category) {

                return this.insufficient(
                    "No hay una categoría activa sobre la que aplicar la reducción.",
                    [
                        "expenses-top"
                    ]
                );

            }

            const name =
                this.categoryName(
                    category
                );

            const amount =
                this.number(
                    category.amount
                );

            const savings =
                this.number(
                    summary.current
                        .monthlySavings
                );

            const reduction =
                amount *
                0.2;

            const simulatedSavings =
                savings +
                reduction;

            return this.response(
                "Simulación",
                `Reducir ${name} un 20 % liberaría ${
                    this.formatCurrency(
                        reduction
                    )
                }. El gasto de esa categoría pasaría de ${
                    this.formatCurrency(
                        amount
                    )
                } a ${
                    this.formatCurrency(
                        amount -
                        reduction
                    )
                }, y tu ahorro mensual pasaría de ${
                    this.formatCurrency(
                        savings
                    )
                } a aproximadamente ${
                    this.formatCurrency(
                        simulatedSavings
                    )
                }.`,
                [
                    "context-category-share",
                    "context-category-income-share",
                    "context-previous-period",
                    "savings-rate"
                ]
            );

        };

    AtlasLocalAI.contextualPreviousPeriod =
        function (summary) {

            const conversationContext =
                this.state
                    .conversationContext;

            if (
                !conversationContext
                    ?.questionKey
            ) {

                return this.insufficient(
                    "Primero necesito una pregunta anterior para saber qué dato quieres consultar en el periodo previo.",
                    [
                        "status-overview",
                        "savings-current",
                        "expenses-top"
                    ]
                );

            }

            const previousSummary =
                this.summaryForMonth(
                    summary.previousMonthKey
                );

            const categoryName =
                conversationContext
                    .category ||
                conversationContext
                    .entity
                    ?.name;

            if (
                conversationContext
                    .entity
                    ?.type ===
                    "category" &&
                categoryName
            ) {

                const category =
                    AtlasAIAnalysis
                        .findCategoryContaining(
                            previousSummary,
                            categoryName
                        );

                if (!category) {

                    return this.insufficient(
                        `No encuentro gasto en ${categoryName} durante ${
                            previousSummary.monthKey
                        }.`,
                        [
                            "expenses-top",
                            "context-compare-period"
                        ]
                    );

                }

                const amount =
                    this.number(
                        category.amount
                    );

                const expenses =
                    this.number(
                        previousSummary.current
                            .monthlyExpenses
                    );

                const share =
                    expenses > 0
                        ? amount /
                            expenses *
                            100
                        : 0;

                return this.response(
                    "Dato real",
                    `En ${
                        previousSummary.monthKey
                    }, ${this.categoryName(
                        category
                    )} registró ${
                        this.formatCurrency(
                            amount
                        )
                    }${
                        expenses > 0
                            ? `, el ${
                                this.formatPercent(
                                    share
                                )
                            } de tus gastos`
                            : ""
                    }.`,
                    [
                        "context-compare-period",
                        "context-category-reduce-20",
                        "expenses-top"
                    ]
                );

            }

            const answer =
                originalAnswerQuestion(
                    conversationContext
                        .questionKey,
                    previousSummary
                );

            return this.response(
                answer.type,
                `En ${
                    previousSummary.monthKey
                }: ${answer.text}`,
                [
                    "context-compare-period",
                    ...(
                        answer.followUps ||
                        []
                    )
                ]
            );

        };

    AtlasLocalAI.contextualComparison =
        function (summary) {

            const context =
                this.state
                    .conversationContext;

            const categoryName =
                context
                    ?.category ||
                context
                    ?.entity
                    ?.name;

            if (
                context
                    ?.entity
                    ?.type ===
                    "category" &&
                categoryName
            ) {

                const currentCategory =
                    AtlasAIAnalysis
                        .findCategoryContaining(
                            summary,
                            categoryName
                        );

                const previousSummary =
                    this.summaryForMonth(
                        summary.previousMonthKey
                    );

                const previousCategory =
                    AtlasAIAnalysis
                        .findCategoryContaining(
                            previousSummary,
                            categoryName
                        );

                const currentAmount =
                    this.number(
                        currentCategory
                            ?.amount
                    );

                const previousAmount =
                    this.number(
                        previousCategory
                            ?.amount
                    );

                const difference =
                    currentAmount -
                    previousAmount;

                let change =
                    "no ha cambiado";

                if (
                    difference > 0
                ) {

                    change =
                        `ha aumentado ${
                            this.formatCurrency(
                                difference
                            )
                        }`;

                } else if (
                    difference < 0
                ) {

                    change =
                        `se ha reducido ${
                            this.formatCurrency(
                                Math.abs(
                                    difference
                                )
                            )
                        }`;

                }

                return this.response(
                    "Dato real",
                    `${categoryName} registra ${
                        this.formatCurrency(
                            currentAmount
                        )
                    } en ${
                        summary.monthKey
                    }, frente a ${
                        this.formatCurrency(
                            previousAmount
                        )
                    } en ${
                        summary.previousMonthKey
                    }. El gasto ${change}.`,
                    [
                        "context-category-share",
                        "context-category-reduce-20",
                        "context-previous-period"
                    ]
                );

            }

            const metric =
                context
                    ?.metric;

            const comparisonMap = {

                savings:
                    "savings-compare",

                "saving-rate":
                    "savings-compare",

                expenses:
                    "expenses-change",

                income:
                    "income-compare",

                "monthly-invested":
                    "comparison-investments",

                investments:
                    "comparison-investments",

                "monthly-comparison":
                    "comparison-month"

            };

            const comparisonQuestion =
                comparisonMap[
                    metric
                ] ||
                "comparison-month";

            return originalAnswerQuestion(
                comparisonQuestion,
                summary
            );

        };

    AtlasLocalAI.answerContextualQuestion =
        function (
            questionKey,
            summary
        ) {

            if (
                questionKey ===
                "context-second-category"
            ) {

                return this.contextualSecondCategory(
                    summary
                );

            }

            if (
                questionKey ===
                "context-category-share"
            ) {

                return this.contextualCategoryShare(
                    summary,
                    false
                );

            }

            if (
                questionKey ===
                "context-category-income-share"
            ) {

                return this.contextualCategoryShare(
                    summary,
                    true
                );

            }

            if (
                questionKey ===
                "context-category-reduce-20"
            ) {

                return this.contextualReduction(
                    summary
                );

            }

            if (
                questionKey ===
                "context-previous-period"
            ) {

                return this.contextualPreviousPeriod(
                    summary
                );

            }

            if (
                questionKey ===
                "context-compare-period"
            ) {

                return this.contextualComparison(
                    summary
                );

            }

            return null;

        };

    AtlasLocalAI.answerQuestion =
        function (
            questionKey,
            summary
        ) {

            this.ensureConversationState();

            const isContextual =
                String(
                    questionKey || ""
                )
                    .startsWith(
                        "context-"
                    );

            let answer =
                isContextual
                    ? this.answerContextualQuestion(
                        questionKey,
                        summary
                    )
                    : null;

            if (!answer) {

                answer =
                    originalAnswerQuestion(
                        questionKey,
                        summary
                    );

            }

            let metadata = {};

            if (
                questionKey ===
                "context-second-category"
            ) {

                const category =
                    this.secondCategory(
                        summary
                    );

                if (category) {

                    metadata = {

                        theme:
                            "expenses",

                        metric:
                            "expense-category",

                        category:
                            this.categoryName(
                                category
                            ),

                        entity: {

                            type:
                                "category",

                            name:
                                this.categoryName(
                                    category
                                ),

                            amount:
                                this.number(
                                    category.amount
                                ),

                            rank:
                                2

                        },

                        source:
                            "contextual"

                    };

                }

            } else if (
                isContextual
            ) {

                metadata = {

                    ...(
                        this.state
                            .conversationContext ||
                        {}
                    ),

                    questionKey:
                        this.state
                            .conversationContext
                            ?.questionKey ||
                        questionKey,

                    source:
                        "contextual"

                };

            }

            const baseQuestionKey =
                isContextual
                    ? (
                        this.state
                            .conversationContext
                            ?.questionKey ||
                        questionKey
                    )
                    : questionKey;

            const nextContext =
                this.conversationMetadata(
                    baseQuestionKey,
                    summary,
                    metadata
                );

            const dynamicFollowUps =
                this.dynamicFollowUps(
                    nextContext,
                    summary
                );

            return {

                ...answer,

                followUps:
                    AtlasAIAnalysis
                        .unique([
                            ...dynamicFollowUps,
                            ...(
                                answer.followUps ||
                                []
                            )
                        ])
                        .filter(
                            followUp =>
                                followUp !==
                                questionKey
                        )
                        .slice(
                            0,
                            4
                        ),

                conversationContext:
                    nextContext

            };

        };

    AtlasLocalAI.askQuestion =
        function (
            questionKey,
            summary
        ) {

            this.ensureConversationState();

            this.pushNavigation();

            this.state.currentQuestion =
                questionKey;

            this.state.view =
                "followups";

            const label =
                this.questionLabel(
                    questionKey,
                    summary
                );

            const answer =
                this.answerQuestion(
                    questionKey,
                    summary
                );

            this.addMessage(
                "user",
                label
            );

            this.addMessage(
                "atlas",
                answer.text,
                answer.type
            );

            this.state.followUps =
                answer.followUps || [];

            this.state.conversationContext =
                answer.conversationContext ||
                this.state
                    .conversationContext;

            if (
                this.state
                    .conversationContext
                    ?.theme
            ) {

                const theme =
                    this.state
                        .conversationContext
                        .theme;

                if (
                    this.themeByKey(
                        theme,
                        summary
                    )
                ) {

                    this.state.currentTheme =
                        theme;

                }

            }

        };

})();

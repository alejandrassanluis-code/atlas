/* ==========================================================
   ATLAS
   ai-local.js
   Atlas IA local — conversación financiera con contexto
========================================================== */

const AtlasLocalAI = {

    data: null,

    eventsBound: false,

    state: {
        initialized: false,
        messages: [],
        currentTheme: null,
        currentQuestion: null,
        view: "themes",
        themePage: 0,
        navigation: [],
        followUps: [],
        conversationContext: null
    },

    number(value) {
        const result = Number(value);
        return Number.isFinite(result) ? result : 0;
    },

    currentMonthKey() {
        return AtlasCalculations.monthKey();
    },

    previousMonthKey(monthKey) {
        return AtlasCalculations.previousMonthKey(monthKey);
    },

    formatCurrency(value) {
        return AtlasUI.formatCurrency(value);
    },

    formatPercent(value) {
        return AtlasUI.formatPercent(value);
    },

    escape(value) {
        return AtlasUI.escapeHtml(value);
    },

    summary(data = this.data, monthKey = this.currentMonthKey()) {
        const previousMonthKey = this.previousMonthKey(monthKey);

        return {
            monthKey,
            previousMonthKey,
            current: AtlasCalculations.financialSummary(data, monthKey),
            previous: AtlasCalculations.financialSummary(data, previousMonthKey),
            comparison: AtlasCalculations.monthlyComparison(data, monthKey),
            categories: AtlasCalculations.expenseCategories(data, monthKey),
            budget: AtlasCalculations.budgetSummary(data, monthKey)
        };
    },

    hasFinancialData(summary) {
        const current = summary.current || {};

        return Boolean(
            this.number(current.monthlyIncome) !== 0 ||
            this.number(current.monthlyGrossExpenses) !== 0 ||
            this.number(current.monthlyInvested) !== 0 ||
            this.number(current.monthlyDebtPayments) !== 0 ||
            this.number(current.liquidity) !== 0 ||
            this.number(current.investments) !== 0 ||
            this.number(current.debt) !== 0
        );
    },

    topCategory(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.topCategory(summary, this);
        }

        return (summary.categories || [])
            .filter(category => this.number(category.amount) > 0)
            .sort((first, second) => this.number(second.amount) - this.number(first.amount))[0] || null;
    },

    secondCategory(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.secondCategory(summary, this);
        }

        return (summary.categories || [])
            .filter(category => this.number(category.amount) > 0)
            .sort((first, second) => this.number(second.amount) - this.number(first.amount))[1] || null;
    },

    categoryName(category) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.categoryName(category);
        }

        return category?.category || category?.label || category?.name || "Sin categoría";
    },

    findCategory(summary, categoryName) {
        if (!categoryName) {
            return null;
        }

        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.findCategoryContaining(summary, categoryName);
        }

        const normalized = String(categoryName).toLocaleLowerCase("es-ES");

        return (summary.categories || []).find(category =>
            this.categoryName(category).toLocaleLowerCase("es-ES").includes(normalized)
        ) || null;
    },

    mainMessage(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.mainMessage(summary, this);
        }

        if (!this.hasFinancialData(summary)) {
            return "Todavía no hay suficientes datos para realizar un análisis financiero.";
        }

        const savings = this.number(summary.current.monthlySavings);

        return savings < 0
            ? `Este mes tu ahorro es negativo: ${this.formatCurrency(savings)}.`
            : `Este mes has generado un ahorro de ${this.formatCurrency(savings)}.`;
    },

    explanation(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.explanation(summary, this);
        }

        return "Atlas compara el periodo actual con el anterior para detectar cambios relevantes.";
    },

    alerts(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.alerts(summary, this);
        }

        return [{
            level: "neutral",
            icon: "✓",
            title: "Sin alertas principales",
            text: "Atlas no detecta incidencias financieras importantes este mes."
        }];
    },

    recommendations(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.recommendations(summary, this);
        }

        return [
            "Mantén el registro actualizado para que las recomendaciones sean más precisas."
        ];
    },

    prediction(summary) {
        if (typeof AtlasAIAnalysis !== "undefined") {
            return AtlasAIAnalysis.prediction(summary, this);
        }

        return null;
    },

    alertColor(level) {
        const colors = {
            success: "var(--color-success)",
            warning: "#e7b85b",
            danger: "var(--color-danger)",
            neutral: "var(--color-text-muted)"
        };

        return colors[level] || colors.neutral;
    },

    renderAlerts(summary) {
        return this.alerts(summary).map(alert => `
            <div
                style="
                    padding:14px 0;
                    border-bottom:1px solid rgba(145,164,202,.12);
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
                        ${this.escape(alert.icon || "✓")}
                    </span>

                    <div
                        style="
                            min-width:0;
                        "
                    >
                        <strong
                            style="
                                color:${this.alertColor(alert.level)};
                            "
                        >
                            ${this.escape(alert.title)}
                        </strong>

                        <p
                            class="note"
                            style="
                                margin:5px 0 0;
                                line-height:1.45;
                            "
                        >
                            ${this.escape(alert.text)}
                        </p>
                    </div>
                </div>
            </div>
        `).join("");
    },

    renderRecommendations(summary) {
        return this.recommendations(summary)
            .slice(0, 3)
            .map((recommendation, index) => {
                const text =
                    typeof recommendation === "string"
                        ? recommendation
                        : recommendation?.text ||
                          recommendation?.title ||
                          "";

                return `
                    <div
                        style="
                            display:flex;
                            align-items:flex-start;
                            gap:12px;
                            padding:14px 0;
                            border-bottom:1px solid rgba(145,164,202,.12);
                        "
                    >
                        <span
                            style="
                                width:28px;
                                height:28px;
                                flex:0 0 28px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                border-radius:10px;
                                color:#d9b45f;
                                background:rgba(217,180,95,.1);
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
                            ${this.escape(text)}
                        </p>
                    </div>
                `;
            })
            .join("");
    },

    initializeConversation() {
        if (this.state.initialized) {
            return;
        }

        this.state.initialized = true;

        this.state.messages = [{
            role: "atlas",
            type: "Introducción",
            text: "Hola. Puedo ayudarte a entender tus datos financieros, comparar periodos y realizar simulaciones. Elige primero el tema que quieres analizar."
        }];

        this.state.currentTheme = null;
        this.state.currentQuestion = null;
        this.state.view = "themes";
        this.state.themePage = 0;
        this.state.navigation = [];
        this.state.followUps = [];
        this.state.conversationContext = null;
    },

    themes(summary) {
        const current = summary.current || {};

        const themes = [
            {
                key: "status",
                icon: "✦",
                label: "Estado financiero",
                description: "Diagnóstico general y puntos importantes"
            },
            {
                key: "savings",
                icon: "🐷",
                label: "Ahorro",
                description: "Resultado, tasa y evolución mensual"
            },
            {
                key: "expenses",
                icon: "🧾",
                label: "Gastos",
                description: "Categorías, cambios y margen de mejora"
            },
            {
                key: "income",
                icon: "💰",
                label: "Ingresos",
                description: "Nivel actual y comparación mensual"
            },
            {
                key: "liquidity",
                icon: "💵",
                label: "Liquidez y seguridad",
                description: "Liquidez, deuda y capacidad de reserva"
            },
            {
                key: "debt",
                icon: "💳",
                label: "Deuda",
                description: "Nivel, riesgo y posibles amortizaciones"
            },
            {
                key: "investments",
                icon: "📈",
                label: "Inversiones",
                description: "Valor, aportaciones y peso patrimonial"
            },
            {
                key: "goals",
                icon: "🎯",
                label: "Objetivos",
                description: "Progreso, prioridades y ahorro disponible"
            },
            {
                key: "prediction",
                icon: "🔮",
                label: "Predicción de cierre",
                description: "Estimación del resultado final del mes"
            },
            {
                key: "comparisons",
                icon: "⚖️",
                label: "Comparaciones",
                description: "Cambios frente al mes anterior"
            },
            {
                key: "simulations",
                icon: "🧮",
                label: "Simulaciones",
                description: "Escenarios de gasto, ahorro e inversión"
            },
            {
                key: "budgets",
                icon: "📋",
                label: "Presupuestos",
                description: "Estado y margen restante"
            },
            {
                key: "recurring",
                icon: "🔁",
                label: "Movimientos recurrentes",
                description: "Impacto esperado y datos pendientes"
            }
        ];

        return themes.filter(theme => {
            if (
                theme.key === "debt" &&
                this.number(current.debt) === 0
            ) {
                return false;
            }

            if (
                theme.key === "budgets" &&
                !summary.budget
            ) {
                return false;
            }

            return true;
        });
    },

    themeByKey(themeKey, summary) {
        return this.themes(summary)
            .find(theme => theme.key === themeKey) || null;
    },

    questionsForTheme(themeKey, summary) {
        const current = summary.current || {};

        const hasIncome =
            this.number(current.monthlyIncome) !== 0;

        const hasExpenses =
            this.number(current.monthlyExpenses) !== 0;

        const hasInvestments =
            this.number(current.investments) !== 0 ||
            this.number(current.monthlyInvested) !== 0;

        const questions = {

            status: [
                {
                    key: "status-overview",
                    label: "¿Cómo estoy financieramente?"
                },
                {
                    key: "status-improved",
                    label: "¿Qué ha mejorado este mes?"
                },
                {
                    key: "status-worsened",
                    label: "¿Qué ha empeorado?"
                },
                {
                    key: "status-weakness",
                    label: "¿Cuál es mi punto más débil?"
                },
                {
                    key: "status-priority",
                    label: "¿Qué debería revisar primero?"
                }
            ],

            savings: [
                {
                    key: "savings-current",
                    label: "¿Cuánto estoy ahorrando?"
                },
                {
                    key: "savings-status",
                    label: "¿Es provisional o cerrado?"
                },
                {
                    key: "savings-compare",
                    label: "¿Ahorro más que el mes pasado?"
                },
                {
                    key: "savings-rate",
                    label: "¿Cuál es mi tasa de ahorro?"
                },
                {
                    key: "savings-year",
                    label: "¿Cuánto podría ahorrar en un año?"
                }
            ],

            expenses: [
                {
                    key: "expenses-top",
                    label: "¿En qué gasto más?"
                },
                {
                    key: "expenses-change",
                    label: "¿Mis gastos han aumentado?"
                },
                {
                    key: "expenses-income-share",
                    label: "¿Qué porcentaje de mis ingresos gasto?"
                },
                {
                    key: "expenses-budget",
                    label: "¿Estoy cumpliendo mi presupuesto?"
                },
                {
                    key: "simulation-top-20",
                    label: "¿Qué pasa si reduzco mi mayor gasto un 20 %?"
                }
            ],

            income: [
                {
                    key: "income-current",
                    label: "¿Cuánto he ingresado este mes?"
                },
                {
                    key: "income-compare",
                    label: "¿He ingresado más que el mes pasado?"
                },
                {
                    key: "income-stability",
                    label: "¿Mis ingresos parecen estables?"
                },
                {
                    key: "simulation-income-minus-10",
                    label: "¿Qué pasa si mis ingresos bajan un 10 %?"
                }
            ],

            liquidity: [
                {
                    key: "liquidity-current",
                    label: "¿Cómo está mi liquidez?"
                },
                {
                    key: "liquidity-debt",
                    label: "¿Cómo se compara con mi deuda?"
                },
                {
                    key: "liquidity-security",
                    label: "¿Tengo margen de seguridad?"
                },
                {
                    key: "liquidity-invest",
                    label: "¿Puedo invertir más?"
                },
                {
                    key: "liquidity-amortize",
                    label: "¿Puedo amortizar deuda?"
                }
            ],

            debt: [
                {
                    key: "debt-current",
                    label: "¿Cuánta deuda tengo?"
                },
                {
                    key: "debt-risk",
                    label: "¿Mi deuda es alta?"
                },
                {
                    key: "debt-change",
                    label: "¿Cómo ha evolucionado este mes?"
                },
                {
                    key: "simulation-debt-500",
                    label: "¿Qué pasa si amortizo 500 €?"
                }
            ],

            investments: [
                {
                    key: "investments-current",
                    label: "¿Cómo van mis inversiones?"
                },
                {
                    key: "investments-month",
                    label: "¿Cuánto he aportado este mes?"
                },
                {
                    key: "investments-weight",
                    label: "¿Qué peso tienen en mi patrimonio?"
                },
                {
                    key: "investments-liquidity",
                    label: "¿Estoy invirtiendo demasiado para mi liquidez?"
                },
                {
                    key: "simulation-invest-200",
                    label: "¿Qué pasa si invierto 200 € más?"
                }
            ],

            goals: [
                {
                    key: "goals-status",
                    label: "¿Cómo van mis objetivos?"
                },
                {
                    key: "goals-available-savings",
                    label: "¿Cuánto ahorro puedo distribuir?"
                },
                {
                    key: "goals-priority",
                    label: "¿Qué objetivo debería priorizar?"
                }
            ],

            prediction: [
                {
                    key: "prediction-close",
                    label: "¿Cómo cerraré el mes?"
                },
                {
                    key: "prediction-expenses",
                    label: "¿Cuánto gastaré previsiblemente?"
                },
                {
                    key: "prediction-negative",
                    label: "¿Puedo acabar con ahorro negativo?"
                },
                {
                    key: "prediction-save-500",
                    label: "¿Qué necesito para cerrar con 500 € de ahorro?"
                },
                {
                    key: "simulation-unexpected-1000",
                    label: "¿Qué pasa si tengo un gasto de 1.000 €?"
                }
            ],

            comparisons: [
                {
                    key: "comparison-month",
                    label: "Compara este mes con el anterior"
                },
                {
                    key: "comparison-savings",
                    label: "¿Cómo ha cambiado mi ahorro?"
                },
                {
                    key: "comparison-expenses",
                    label: "¿Cómo han cambiado mis gastos?"
                },
                {
                    key: "comparison-income",
                    label: "¿Cómo han cambiado mis ingresos?"
                },
                {
                    key: "comparison-investments",
                    label: "¿Cómo han cambiado mis aportaciones?"
                }
            ],

            simulations: [
                {
                    key: "simulation-top-20",
                    label: "Reducir mi mayor gasto un 20 %"
                },
                {
                    key: "simulation-save-200",
                    label: "Ahorrar 200 € más al mes"
                },
                {
                    key: "simulation-invest-200",
                    label: "Invertir 200 € adicionales"
                },
                {
                    key: "simulation-income-minus-10",
                    label: "Reducir mis ingresos un 10 %"
                },
                {
                    key: "simulation-unexpected-1000",
                    label: "Añadir un gasto inesperado de 1.000 €"
                }
            ],

            budgets: [
                {
                    key: "budget-status",
                    label: "¿Estoy cumpliendo mi presupuesto?"
                },
                {
                    key: "budget-remaining",
                    label: "¿Cuánto presupuesto me queda?"
                },
                {
                    key: "budget-risk",
                    label: "¿Tengo riesgo de superarlo?"
                }
            ],

            recurring: [
                {
                    key: "recurring-status",
                    label: "¿Qué puedo analizar de mis recurrentes?"
                },
                {
                    key: "recurring-prediction",
                    label: "¿Cómo afectan a la predicción?"
                }
            ]

        };

        let result = questions[themeKey] || [];

        if (
            themeKey === "expenses" &&
            !hasExpenses
        ) {
            result = result.filter(question =>
                [
                    "expenses-top",
                    "expenses-change"
                ].includes(question.key)
            );
        }

        if (
            themeKey === "income" &&
            !hasIncome
        ) {
            result = result.filter(question =>
                [
                    "income-current",
                    "income-compare"
                ].includes(question.key)
            );
        }

        if (
            themeKey === "investments" &&
            !hasInvestments
        ) {
            result = result.filter(question =>
                [
                    "investments-current",
                    "investments-month"
                ].includes(question.key)
            );
        }

        return result.slice(0, 5);
    },

    questionLabel(questionKey, summary) {
        if (
            String(questionKey || "")
                .startsWith("context-") &&
            typeof AtlasAIAnalysis !== "undefined"
        ) {
            return (
                AtlasAIAnalysis.contextualActionLabel(
                    questionKey,
                    this.state.conversationContext
                ) ||
                "Seguir analizando"
            );
        }

        for (const theme of this.themes(summary)) {
            const question =
                this.questionsForTheme(theme.key, summary)
                    .find(item => item.key === questionKey);

            if (question) {
                return question.label;
            }
        }

        const labels = {
            "simulation-top-20":
                "¿Qué pasa si reduzco mi mayor gasto un 20 %?",

            "simulation-save-200":
                "¿Qué pasa si ahorro 200 € más al mes?",

            "simulation-invest-200":
                "¿Qué pasa si invierto 200 € adicionales?",

            "simulation-income-minus-10":
                "¿Qué pasa si mis ingresos bajan un 10 %?",

            "simulation-unexpected-1000":
                "¿Qué pasa si tengo un gasto inesperado de 1.000 €?",

            "simulation-debt-500":
                "¿Qué pasa si amortizo 500 €?"
        };

        return labels[questionKey] || "Analizar mis datos";
    },

    localResponse(
        type,
        text,
        followUps = [],
        conversationContext = null
    ) {
        return {
            type,
            text,
            followUps: [
                ...new Set(
                    followUps.filter(Boolean)
                )
            ].slice(0, 4),
            conversationContext
        };
    },

    response(
        type,
        text,
        questionKey,
        summary,
        followUps = [],
        metadata = {}
    ) {
        if (typeof AtlasAIAnalysis === "undefined") {
            return this.localResponse(
                type,
                text,
                followUps,
                null
            );
        }

        const response =
            AtlasAIAnalysis.contextualResponse(
                type,
                text,
                questionKey,
                summary,
                this,
                followUps,
                metadata
            );

        return {
            ...response,

            followUps:
                (response.followUps || [])
                    .filter(
                        key =>
                            key !==
                            "context-category-movements"
                    )
                    .slice(0, 4),

            conversationContext:
                response.metadata
                    ?.conversationContext ||
                null
        };
    },

    insufficient(
        text,
        questionKey,
        summary,
        followUps = [],
        metadata = {}
    ) {
        if (typeof AtlasAIAnalysis === "undefined") {
            return this.localResponse(
                "Datos insuficientes",
                text,
                followUps,
                null
            );
        }

        const response =
            AtlasAIAnalysis.contextualInsufficient(
                text,
                questionKey,
                summary,
                this,
                followUps,
                metadata
            );

        return {
            ...response,

            followUps:
                (response.followUps || [])
                    .filter(
                        key =>
                            key !==
                            "context-category-movements"
                    )
                    .slice(0, 4),

            conversationContext:
                response.metadata
                    ?.conversationContext ||
                null
        };
    },

    metricValues(summary) {
        const current = summary.current || {};
        const previous = summary.previous || {};

        const values = {
            income:
                this.number(
                    current.monthlyIncome
                ),

            expenses:
                this.number(
                    current.monthlyExpenses
                ),

            savings:
                this.number(
                    current.monthlySavings
                ),

            savingRate:
                this.number(
                    current.monthlySavingRate
                ),

            liquidity:
                this.number(
                    current.liquidity
                ),

            debt:
                this.number(
                    current.debt
                ),

            investments:
                this.number(
                    current.investments
                ),

            monthlyInvested:
                this.number(
                    current.monthlyInvested
                ),

            debtPayments:
                this.number(
                    current.monthlyDebtPayments
                ),

            previousIncome:
                this.number(
                    previous.monthlyIncome
                ),

            previousExpenses:
                this.number(
                    previous.monthlyExpenses
                ),

            previousSavings:
                this.number(
                    previous.monthlySavings
                ),

            previousInvested:
                this.number(
                    previous.monthlyInvested
                )
        };

        values.incomeDifference =
            values.income -
            values.previousIncome;

        values.expenseDifference =
            values.expenses -
            values.previousExpenses;

        values.savingsDifference =
            values.savings -
            values.previousSavings;

        values.investedDifference =
            values.monthlyInvested -
            values.previousInvested;

        values.netWorth =
            values.liquidity +
            values.investments -
            values.debt;

        return values;
    },

    contextCategory(summary) {
        const context =
            this.state.conversationContext;

        const name =
            context?.category ||
            context?.entity?.name;

        return (
            this.findCategory(
                summary,
                name
            ) ||
            this.topCategory(summary)
        );
    },

    answerContextQuestion(
        questionKey,
        summary
    ) {
        const context =
            this.state.conversationContext;

        if (!context) {
            return this.insufficient(
                "Primero necesito una pregunta anterior para saber qué dato quieres seguir analizando.",
                "status-overview",
                summary,
                [
                    "status-overview",
                    "savings-current",
                    "expenses-top"
                ]
            );
        }

        if (
            questionKey ===
            "context-second-category"
        ) {
            const category =
                this.secondCategory(summary);

            if (!category) {
                return this.insufficient(
                    "No hay una segunda categoría positiva disponible en este periodo.",
                    context.questionKey ||
                    "expenses-top",
                    summary,
                    [
                        "expenses-top"
                    ],
                    context
                );
            }

            const name =
                this.categoryName(category);

            const amount =
                this.number(category.amount);

            const share =
                this.number(
                    summary.current.monthlyExpenses
                ) > 0
                    ? amount /
                      this.number(
                          summary.current.monthlyExpenses
                      ) *
                      100
                    : 0;

            return this.response(
                "Dato real",
                `${name} es tu segunda categoría con más gasto, con ${this.formatCurrency(amount)}${share > 0 ? `, equivalente al ${this.formatPercent(share)} de tus gastos` : ""}.`,
                "expenses-top",
                summary,
                [
                    "context-category-share",
                    "context-category-income-share",
                    "context-category-reduce-20",
                    "context-previous-period"
                ],
                {
                    theme: "expenses",
                    metric: "expense-category",

                    entity: {
                        type: "category",
                        name,
                        amount,
                        rank: 2
                    },

                    category: name,
                    source: "contextual"
                }
            );
        }

        if (
            [
                "context-category-share",
                "context-category-income-share",
                "context-category-reduce-20"
            ].includes(questionKey)
        ) {
            const category =
                this.contextCategory(summary);

            if (!category) {
                return this.insufficient(
                    "No hay una categoría de gasto activa sobre la que realizar este análisis.",
                    context.questionKey ||
                    "expenses-top",
                    summary,
                    [
                        "expenses-top"
                    ],
                    context
                );
            }

            const name =
                this.categoryName(category);

            const amount =
                this.number(category.amount);

            const metadata = {
                ...context,

                theme: "expenses",

                metric:
                    "expense-category",

                entity: {
                    type: "category",
                    name,
                    amount,
                    rank:
                        context.entity?.rank ||
                        1
                },

                category: name,
                source: "contextual"
            };

            if (
                questionKey ===
                "context-category-share"
            ) {
                const expenses =
                    this.number(
                        summary.current
                            .monthlyExpenses
                    );

                if (expenses <= 0) {
                    return this.insufficient(
                        "No hay gastos positivos registrados para calcular este porcentaje.",
                        context.questionKey ||
                        "expenses-top",
                        summary,
                        [
                            "expenses-top"
                        ],
                        metadata
                    );
                }

                return this.response(
                    "Dato real",
                    `${name} representa el ${this.formatPercent(amount / expenses * 100)} de tus gastos del periodo, con ${this.formatCurrency(amount)}.`,
                    context.questionKey ||
                    "expenses-top",
                    summary,
                    [
                        "context-category-income-share",
                        "context-category-reduce-20",
                        "context-previous-period"
                    ],
                    metadata
                );
            }

            if (
                questionKey ===
                "context-category-income-share"
            ) {
                const income =
                    this.number(
                        summary.current
                            .monthlyIncome
                    );

                if (income <= 0) {
                    return this.insufficient(
                        "No hay ingresos positivos registrados para calcular este porcentaje.",
                        context.questionKey ||
                        "expenses-top",
                        summary,
                        [
                            "income-current",
                            "expenses-top"
                        ],
                        metadata
                    );
                }

                return this.response(
                    "Dato real",
                    `${name} representa el ${this.formatPercent(amount / income * 100)} de tus ingresos del periodo, con ${this.formatCurrency(amount)}.`,
                    context.questionKey ||
                    "expenses-top",
                    summary,
                    [
                        "context-category-share",
                        "context-category-reduce-20",
                        "context-previous-period"
                    ],
                    metadata
                );
            }

            const simulation =
                typeof AtlasAIAnalysis !==
                    "undefined"
                    ? AtlasAIAnalysis
                        .simulateCategoryReduction(
                            category,
                            20,
                            summary,
                            this
                        )
                    : {
                        percentage: 20,
                        reduction: amount * .2,
                        resultingAmount: amount * .8,

                        currentSavings:
                            this.number(
                                summary.current
                                    .monthlySavings
                            ),

                        projectedSavings:
                            this.number(
                                summary.current
                                    .monthlySavings
                            ) +
                            amount * .2
                    };

            return this.response(
                "Simulación",
                `Reducir ${name} un 20 % liberaría ${this.formatCurrency(simulation.reduction)}. El gasto de esa categoría pasaría de ${this.formatCurrency(simulation.originalAmount ?? amount)} a ${this.formatCurrency(simulation.resultingAmount)}, y tu ahorro mensual pasaría de ${this.formatCurrency(simulation.currentSavings)} a aproximadamente ${this.formatCurrency(simulation.projectedSavings)}.`,
                context.questionKey ||
                "expenses-top",
                summary,
                [
                    "context-category-share",
                    "context-category-income-share",
                    "context-previous-period",
                    "savings-rate"
                ],
                {
                    ...metadata,

                    simulation: {
                        type:
                            "category-reduction",

                        percentage: 20,
                        category: name,

                        impact:
                            simulation.reduction
                    }
                }
            );
        }

        if (
            questionKey ===
            "context-previous-period"
        ) {
            const previousKey =
                context.comparisonPeriod ||
                summary.previousMonthKey;

            const previousSummary =
                this.summary(
                    this.data,
                    previousKey
                );

            const categoryName =
                context.category ||
                context.entity?.name;

            if (
                context.entity?.type ===
                    "category" &&
                categoryName
            ) {
                const category =
                    this.findCategory(
                        previousSummary,
                        categoryName
                    );

                if (!category) {
                    return this.insufficient(
                        `No encuentro gasto en ${categoryName} durante ${previousSummary.monthKey}.`,
                        context.questionKey ||
                        "expenses-top",
                        previousSummary,
                        [
                            "context-compare-period",
                            "expenses-top"
                        ],
                        {
                            ...context,

                            period:
                                previousSummary
                                    .monthKey,

                            comparisonPeriod:
                                previousSummary
                                    .previousMonthKey,

                            source:
                                "contextual"
                        }
                    );
                }

                const amount =
                    this.number(
                        category.amount
                    );

                const expenses =
                    this.number(
                        previousSummary
                            .current
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
                    `En ${previousSummary.monthKey}, ${this.categoryName(category)} registró ${this.formatCurrency(amount)}${share > 0 ? `, el ${this.formatPercent(share)} de tus gastos` : ""}.`,
                    context.questionKey ||
                    "expenses-top",
                    previousSummary,
                    [
                        "context-compare-period",
                        "context-category-reduce-20",
                        "context-category-share"
                    ],
                    {
                        ...context,

                        period:
                            previousSummary
                                .monthKey,

                        comparisonPeriod:
                            previousSummary
                                .previousMonthKey,

                        entity: {
                            ...context.entity,

                            name:
                                this.categoryName(
                                    category
                                ),

                            amount
                        },

                        category:
                            this.categoryName(
                                category
                            ),

                        source:
                            "contextual"
                    }
                );
            }

            const baseQuestion =
                context.questionKey ||
                "comparison-month";

            const answer =
                this.answerGuidedQuestion(
                    baseQuestion,
                    previousSummary,
                    {
                        ...context,

                        period:
                            previousSummary
                                .monthKey,

                        comparisonPeriod:
                            previousSummary
                                .previousMonthKey,

                        source:
                            "contextual"
                    }
                );

            return {
                ...answer,
                text:
                    `En ${previousSummary.monthKey}: ${answer.text}`
            };
        }

        if (
            questionKey ===
            "context-compare-period"
        ) {
            const categoryName =
                context.category ||
                context.entity?.name;

            if (
                context.entity?.type ===
                    "category" &&
                categoryName
            ) {
                const currentCategory =
                    this.findCategory(
                        summary,
                        categoryName
                    );

                const previousSummary =
                    this.summary(
                        this.data,
                        context.comparisonPeriod ||
                        summary.previousMonthKey
                    );

                const previousCategory =
                    this.findCategory(
                        previousSummary,
                        categoryName
                    );

                const currentAmount =
                    this.number(
                        currentCategory?.amount
                    );

                const previousAmount =
                    this.number(
                        previousCategory?.amount
                    );

                const difference =
                    currentAmount -
                    previousAmount;

                const change =
                    difference > 0
                        ? `ha aumentado ${this.formatCurrency(difference)}`
                        : difference < 0
                            ? `se ha reducido ${this.formatCurrency(Math.abs(difference))}`
                            : "no ha cambiado";

                return this.response(
                    "Dato real",
                    `${categoryName} registra ${this.formatCurrency(currentAmount)} en ${summary.monthKey}, frente a ${this.formatCurrency(previousAmount)} en ${previousSummary.monthKey}. El gasto ${change}.`,
                    context.questionKey ||
                    "expenses-top",
                    summary,
                    [
                        "context-category-share",
                        "context-category-reduce-20",
                        "context-previous-period"
                    ],
                    context
                );
            }

            const metricMap = {
                savings:
                    "savings-compare",

                "saving-rate":
                    "savings-compare",

                expenses:
                    "expenses-change",

                income:
                    "income-compare",

                investments:
                    "comparison-investments",

                "monthly-invested":
                    "comparison-investments",

                "monthly-comparison":
                    "comparison-month"
            };

            return this.answerGuidedQuestion(
                metricMap[context.metric] ||
                "comparison-month",
                summary,
                context
            );
        }

        return this.insufficient(
            "Este seguimiento todavía no está disponible.",
            context.questionKey ||
            "status-overview",
            summary,
            [
                "status-overview",
                "expenses-top"
            ],
            context
        );
    },

    answerQuestion(
        questionKey,
        summary
    ) {
        if (
            String(questionKey || "")
                .startsWith("context-")
        ) {
            return this.answerContextQuestion(
                questionKey,
                summary
            );
        }

        return this.answerGuidedQuestion(
            questionKey,
            summary
        );
    },

    answerGuidedQuestion(
        questionKey,
        summary,
        metadata = {}
    ) {
        const values =
            this.metricValues(summary);

        const topCategory =
            this.topCategory(summary);

        const secondCategory =
            this.secondCategory(summary);

        const categoryMetadata =
            topCategory
                ? {
                    entity: {
                        type:
                            "category",

                        name:
                            this.categoryName(
                                topCategory
                            ),

                        amount:
                            this.number(
                                topCategory.amount
                            ),

                        rank:
                            1
                    },

                    category:
                        this.categoryName(
                            topCategory
                        )
                }
                : {};

        const response = (
            type,
            text,
            followUps = [],
            extra = {}
        ) =>
            this.response(
                type,
                text,
                questionKey,
                summary,
                followUps,
                {
                    ...metadata,
                    ...extra
                }
            );

        const insufficient = (
            text,
            followUps = [],
            extra = {}
        ) =>
            this.insufficient(
                text,
                questionKey,
                summary,
                followUps,
                {
                    ...metadata,
                    ...extra
                }
            );

        switch (questionKey) {

            case "status-overview": {
                if (
                    !this.hasFinancialData(
                        summary
                    )
                ) {
                    return insufficient(
                        "Todavía no hay suficientes movimientos o saldos registrados para realizar un diagnóstico financiero completo.",
                        [
                            "income-current",
                            "expenses-top"
                        ]
                    );
                }

                return response(
                    "Dato real",
                    `Tu patrimonio neto calculado es ${this.formatCurrency(values.netWorth)}. Tienes ${this.formatCurrency(values.liquidity)} de liquidez, ${this.formatCurrency(values.investments)} en inversiones y ${this.formatCurrency(values.debt)} de deuda. ${this.mainMessage(summary)}`,
                    [
                        "status-improved",
                        "status-weakness",
                        "comparison-month",
                        "status-priority"
                    ]
                );
            }

            case "status-improved": {
                const improvements = [];

                if (
                    values.savingsDifference >
                    0
                ) {
                    improvements.push(
                        `el ahorro ha mejorado ${this.formatCurrency(values.savingsDifference)}`
                    );
                }

                if (
                    values.expenseDifference <
                    0
                ) {
                    improvements.push(
                        `los gastos se han reducido ${this.formatCurrency(Math.abs(values.expenseDifference))}`
                    );
                }

                if (
                    values.incomeDifference >
                    0
                ) {
                    improvements.push(
                        `los ingresos han aumentado ${this.formatCurrency(values.incomeDifference)}`
                    );
                }

                if (
                    values.investedDifference >
                    0
                ) {
                    improvements.push(
                        `las aportaciones han aumentado ${this.formatCurrency(values.investedDifference)}`
                    );
                }

                return response(
                    "Dato real",
                    improvements.length
                        ? `Respecto al mes anterior, ${improvements.join(", ")}.`
                        : "No detecto una mejora clara frente al mes anterior con los indicadores disponibles.",
                    [
                        "status-worsened",
                        "comparison-month",
                        "status-priority"
                    ]
                );
            }

            case "status-worsened": {
                const declines = [];

                if (
                    values.savingsDifference <
                    0
                ) {
                    declines.push(
                        `el ahorro ha bajado ${this.formatCurrency(Math.abs(values.savingsDifference))}`
                    );
                }

                if (
                    values.expenseDifference >
                    0
                ) {
                    declines.push(
                        `los gastos han aumentado ${this.formatCurrency(values.expenseDifference)}`
                    );
                }

                if (
                    values.incomeDifference <
                    0
                ) {
                    declines.push(
                        `los ingresos han bajado ${this.formatCurrency(Math.abs(values.incomeDifference))}`
                    );
                }

                if (
                    values.liquidity <
                    0
                ) {
                    declines.push(
                        `la liquidez se encuentra en ${this.formatCurrency(values.liquidity)}`
                    );
                }

                return response(
                    "Dato real",
                    declines.length
                        ? `Los principales puntos negativos son que ${declines.join(", ")}.`
                        : "No detecto un empeoramiento principal frente al mes anterior con los datos disponibles.",
                    [
                        "status-weakness",
                        "status-priority",
                        "comparison-month"
                    ]
                );
            }

            case "status-weakness": {
                if (
                    values.liquidity <
                    0
                ) {
                    return response(
                        "Recomendación",
                        `Tu punto más débil es la liquidez, que actualmente es ${this.formatCurrency(values.liquidity)}. Conviene recuperarla antes de aumentar nuevas aportaciones a inversión.`,
                        [
                            "liquidity-current",
                            "prediction-close",
                            "simulation-save-200"
                        ]
                    );
                }

                if (
                    values.savings <
                    0
                ) {
                    return response(
                        "Recomendación",
                        `Tu punto más débil es el resultado mensual: el ahorro provisional es ${this.formatCurrency(values.savings)}. La prioridad debería ser identificar qué gastos están provocando el déficit.`,
                        [
                            "expenses-top",
                            "expenses-change",
                            "simulation-top-20"
                        ]
                    );
                }

                if (
                    values.debt >
                        values.liquidity &&
                    values.debt >
                        0
                ) {
                    return response(
                        "Recomendación",
                        `La deuda supera tu liquidez en ${this.formatCurrency(values.debt - values.liquidity)}. Este desequilibrio es el principal punto a vigilar.`,
                        [
                            "debt-risk",
                            "liquidity-debt",
                            "simulation-debt-500"
                        ]
                    );
                }

                if (
                    values.income >
                        0 &&
                    values.savingRate <
                        10
                ) {
                    return response(
                        "Recomendación",
                        `Tu tasa de ahorro es del ${this.formatPercent(values.savingRate)}, por debajo del 10 %. Es el indicador con más margen de mejora.`,
                        [
                            "expenses-top",
                            "savings-rate",
                            "simulation-top-20"
                        ]
                    );
                }

                return response(
                    "Recomendación",
                    "No detecto un punto crítico principal. Mantendría bajo vigilancia la evolución del ahorro, la liquidez y la categoría de gasto más elevada.",
                    [
                        "savings-current",
                        "liquidity-current",
                        "expenses-top"
                    ]
                );
            }

            case "status-priority": {
                const texts =
                    this.recommendations(summary)
                        .map(item =>
                            typeof item === "string"
                                ? item
                                : item?.text ||
                                  item?.title
                        )
                        .filter(Boolean)
                        .slice(0, 3);

                return response(
                    "Recomendación",
                    texts.join(" ") ||
                    "Mantén el registro actualizado para que las recomendaciones sean más precisas.",
                    [
                        "status-weakness",
                        "expenses-top",
                        "prediction-close"
                    ]
                );
            }

            case "savings-current":
                return response(
                    "Dato real",
                    `Tu ahorro provisional de este mes es ${this.formatCurrency(values.savings)}.`,
                    [
                        "savings-status",
                        "savings-compare",
                        "savings-rate",
                        "savings-year"
                    ]
                );

            case "savings-status":
                return response(
                    "Dato real",
                    `El ahorro de ${summary.monthKey} es provisional mientras el mes permanezca abierto. No puede distribuirse entre objetivos hasta que el periodo quede cerrado.`,
                    [
                        "savings-current",
                        "goals-available-savings",
                        "prediction-close"
                    ]
                );

            case "savings-compare": {
                const comparison =
                    values.savingsDifference > 0
                        ? `Ha mejorado ${this.formatCurrency(values.savingsDifference)}.`
                        : values.savingsDifference < 0
                            ? `Ha bajado ${this.formatCurrency(Math.abs(values.savingsDifference))}.`
                            : "No ha cambiado respecto al mes anterior.";

                return response(
                    "Dato real",
                    `Este mes llevas ${this.formatCurrency(values.savings)} de ahorro frente a ${this.formatCurrency(values.previousSavings)} el mes anterior. ${comparison}`,
                    [
                        "savings-rate",
                        "comparison-month",
                        "simulation-save-200"
                    ]
                );
            }

            case "savings-rate":
                return values.income === 0
                    ? insufficient(
                        "No puedo calcular una tasa de ahorro representativa porque no hay ingresos registrados este mes.",
                        [
                            "income-current",
                            "savings-current"
                        ]
                    )
                    : response(
                        "Dato real",
                        `Tu tasa de ahorro actual es del ${this.formatPercent(values.savingRate)} sobre los ingresos registrados.`,
                        [
                            "savings-compare",
                            "expenses-income-share",
                            "simulation-save-200"
                        ]
                    );

            case "savings-year":
                return response(
                    "Estimación",
                    `Si mantuvieras durante doce meses el resultado actual, generarías aproximadamente ${this.formatCurrency(values.savings * 12)}. Esta estimación replica el ahorro provisional del mes y no incorpora variaciones futuras.`,
                    [
                        "savings-rate",
                        "simulation-save-200",
                        "prediction-close"
                    ]
                );

            case "expenses-top": {
                if (!topCategory) {
                    return insufficient(
                        "No hay gastos positivos clasificados por categoría en el periodo actual.",
                        [
                            "expenses-change",
                            "income-current"
                        ]
                    );
                }

                let text =
                    `Tu categoría principal es ${this.categoryName(topCategory)}, con ${this.formatCurrency(topCategory.amount)}.`;

                if (secondCategory) {
                    text +=
                        ` La segunda es ${this.categoryName(secondCategory)}, con ${this.formatCurrency(secondCategory.amount)}.`;
                }

                return response(
                    "Dato real",
                    text,
                    [
                        "context-category-share",
                        "context-category-income-share",
                        "context-category-reduce-20",
                        "context-second-category"
                    ],
                    {
                        ...categoryMetadata,
                        theme: "expenses",
                        metric: "expense-category"
                    }
                );
            }

            case "expenses-change": {
                if (
                    values.expenseDifference >
                    0
                ) {
                    return response(
                        "Dato real",
                        `Tus gastos netos han aumentado ${this.formatCurrency(values.expenseDifference)}, pasando de ${this.formatCurrency(values.previousExpenses)} a ${this.formatCurrency(values.expenses)}.`,
                        [
                            "expenses-top",
                            "simulation-top-20",
                            "comparison-month"
                        ]
                    );
                }

                if (
                    values.expenseDifference <
                    0
                ) {
                    return response(
                        "Dato real",
                        `Tus gastos netos se han reducido ${this.formatCurrency(Math.abs(values.expenseDifference))}, pasando de ${this.formatCurrency(values.previousExpenses)} a ${this.formatCurrency(values.expenses)}.`,
                        [
                            "expenses-top",
                            "savings-compare",
                            "comparison-month"
                        ]
                    );
                }

                return response(
                    "Dato real",
                    `Tus gastos netos son ${this.formatCurrency(values.expenses)}, sin cambios frente al mes anterior.`,
                    [
                        "expenses-top",
                        "expenses-income-share",
                        "expenses-budget"
                    ]
                );
            }

            case "expenses-income-share":
                return values.income <= 0
                    ? insufficient(
                        "No puedo calcular qué porcentaje de tus ingresos se destina a gasto porque no hay ingresos positivos registrados.",
                        [
                            "income-current",
                            "expenses-top"
                        ]
                    )
                    : response(
                        "Dato real",
                        `Los gastos netos representan el ${this.formatPercent(values.expenses / values.income * 100)} de tus ingresos del mes.`,
                        [
                            "savings-rate",
                            "expenses-top",
                            "simulation-top-20"
                        ]
                    );

            case "expenses-budget":
            case "budget-status": {
                if (!summary.budget) {
                    return insufficient(
                        "No hay un resumen de presupuesto disponible para este periodo.",
                        [
                            "expenses-top",
                            "expenses-change"
                        ]
                    );
                }

                if (
                    summary.budget.status ===
                    "exceeded"
                ) {
                    return response(
                        "Dato real",
                        `Has superado el presupuesto en ${this.formatCurrency(Math.abs(this.number(summary.budget.remaining)))}.`,
                        [
                            "expenses-top",
                            "simulation-top-20",
                            "budget-risk"
                        ]
                    );
                }

                return response(
                    "Dato real",
                    `El presupuesto no está excedido. El margen restante es ${this.formatCurrency(this.number(summary.budget.remaining))}.`,
                    [
                        "budget-remaining",
                        "budget-risk",
                        "expenses-top"
                    ]
                );
            }

            case "income-current":
                return values.income === 0
                    ? insufficient(
                        "No hay ingresos registrados en el periodo actual.",
                        [
                            "income-compare",
                            "expenses-top"
                        ]
                    )
                    : response(
                        "Dato real",
                        `Has registrado ${this.formatCurrency(values.income)} de ingresos este mes.`,
                        [
                            "income-compare",
                            "income-stability",
                            "savings-rate"
                        ]
                    );

            case "income-compare": {
                if (
                    values.incomeDifference >
                    0
                ) {
                    return response(
                        "Dato real",
                        `Tus ingresos han aumentado ${this.formatCurrency(values.incomeDifference)} frente al mes anterior.`,
                        [
                            "income-stability",
                            "savings-compare",
                            "comparison-month"
                        ]
                    );
                }

                if (
                    values.incomeDifference <
                    0
                ) {
                    return response(
                        "Dato real",
                        `Tus ingresos han bajado ${this.formatCurrency(Math.abs(values.incomeDifference))} frente al mes anterior.`,
                        [
                            "simulation-income-minus-10",
                            "savings-compare",
                            "prediction-close"
                        ]
                    );
                }

                return response(
                    "Dato real",
                    `Tus ingresos son ${this.formatCurrency(values.income)}, sin cambios frente al mes anterior.`,
                    [
                        "income-stability",
                        "savings-rate"
                    ]
                );
            }

            case "income-stability": {
                if (
                    values.income === 0 ||
                    values.previousIncome === 0
                ) {
                    return insufficient(
                        "Necesito ingresos registrados tanto en el mes actual como en el anterior para realizar una primera comparación de estabilidad.",
                        [
                            "income-current",
                            "income-compare"
                        ]
                    );
                }

                const variation =
                    Math.abs(
                        values.incomeDifference
                    ) /
                    Math.abs(
                        values.previousIncome
                    ) *
                    100;

                return response(
                    "Estimación",
                    variation <= 10
                        ? `La variación frente al mes anterior es del ${this.formatPercent(variation)}. Con esta comparación limitada, los ingresos parecen relativamente estables.`
                        : `La variación frente al mes anterior es del ${this.formatPercent(variation)}. Con solo dos periodos no puedo confirmar una tendencia estable.`,
                    [
                        "income-compare",
                        "simulation-income-minus-10",
                        "prediction-close"
                    ]
                );
            }

            case "liquidity-current":
                return response(
                    "Dato real",
                    `Tu liquidez total actual es ${this.formatCurrency(values.liquidity)}.${values.liquidity < 0 ? " La liquidez negativa es válida en Atlas, pero indica que las obligaciones líquidas superan los saldos disponibles." : ""}`,
                    [
                        "liquidity-debt",
                        "liquidity-security",
                        "liquidity-invest"
                    ]
                );

            case "liquidity-debt": {
                if (
                    values.debt ===
                    0
                ) {
                    return response(
                        "Dato real",
                        `Tienes ${this.formatCurrency(values.liquidity)} de liquidez y no hay deuda pendiente registrada.`,
                        [
                            "liquidity-security",
                            "liquidity-invest",
                            "investments-current"
                        ]
                    );
                }

                const difference =
                    values.liquidity -
                    values.debt;

                return response(
                    "Dato real",
                    difference >= 0
                        ? `Tu liquidez supera la deuda en ${this.formatCurrency(difference)}.`
                        : `Tu deuda supera la liquidez en ${this.formatCurrency(Math.abs(difference))}.`,
                    [
                        "debt-risk",
                        "liquidity-security",
                        "simulation-debt-500"
                    ]
                );
            }

            case "liquidity-security": {
                if (
                    values.expenses <=
                    0
                ) {
                    return insufficient(
                        "No puedo estimar cuántos meses de gasto cubre tu liquidez porque no hay gastos mensuales positivos registrados.",
                        [
                            "liquidity-current",
                            "expenses-top"
                        ]
                    );
                }

                const coveredMonths =
                    values.liquidity /
                    values.expenses;

                return response(
                    "Estimación",
                    `Tomando el gasto neto de este mes como referencia, tu liquidez cubriría aproximadamente ${coveredMonths.toLocaleString("es-ES", { maximumFractionDigits: 1 })} meses. Esta cifra no sustituye un cálculo específico del fondo de emergencia.`,
                    [
                        "liquidity-invest",
                        "liquidity-amortize",
                        "prediction-close"
                    ]
                );
            }

            case "liquidity-invest":
                if (
                    values.liquidity <=
                    0
                ) {
                    return response(
                        "Recomendación",
                        `Con una liquidez de ${this.formatCurrency(values.liquidity)}, no aumentaría las aportaciones hasta recuperar un margen líquido positivo.`,
                        [
                            "liquidity-security",
                            "simulation-invest-200",
                            "prediction-close"
                        ]
                    );
                }

                if (
                    values.expenses > 0 &&
                    values.liquidity <
                        values.expenses * 3
                ) {
                    return response(
                        "Recomendación",
                        "Tu liquidez no alcanza tres meses del gasto mensual actual. Antes de invertir más, priorizaría reforzar el fondo de seguridad.",
                        [
                            "liquidity-security",
                            "investments-liquidity",
                            "simulation-invest-200"
                        ]
                    );
                }

                return response(
                    "Recomendación",
                    "La liquidez actual permite estudiar nuevas aportaciones, pero la decisión debería respetar tu fondo de seguridad y las obligaciones de deuda.",
                    [
                        "liquidity-security",
                        "investments-liquidity",
                        "simulation-invest-200"
                    ]
                );

            case "liquidity-amortize": {
                if (
                    values.debt <=
                    0
                ) {
                    return response(
                        "Dato real",
                        "No hay deuda pendiente registrada para amortizar.",
                        [
                            "liquidity-invest",
                            "investments-current"
                        ]
                    );
                }

                if (
                    values.liquidity <=
                    0
                ) {
                    return response(
                        "Recomendación",
                        "No amortizaría deuda adicional con liquidez negativa o nula, salvo que exista una razón financiera urgente fuera de los datos registrados.",
                        [
                            "debt-risk",
                            "liquidity-security"
                        ]
                    );
                }

                return response(
                    "Recomendación",
                    `El máximo teórico sería ${this.formatCurrency(Math.min(values.liquidity, values.debt))}, pero utilizar toda esa cantidad podría dejarte sin fondo de seguridad. Conviene reservar primero la liquidez necesaria para gastos y obligaciones próximas.`,
                    [
                        "liquidity-security",
                        "debt-risk",
                        "simulation-debt-500"
                    ]
                );
            }

            case "debt-current":
                return response(
                    "Dato real",
                    `Tu deuda pendiente actual es ${this.formatCurrency(values.debt)}. Este mes has registrado ${this.formatCurrency(values.debtPayments)} en pagos de deuda, que reducen liquidez y deuda pero no se consideran gasto.`,
                    [
                        "debt-risk",
                        "debt-change",
                        "simulation-debt-500"
                    ]
                );

            case "debt-risk":
                if (
                    values.debt <=
                    0
                ) {
                    return response(
                        "Dato real",
                        "No hay deuda pendiente registrada.",
                        [
                            "liquidity-current",
                            "investments-current"
                        ]
                    );
                }

                if (
                    values.liquidity <=
                    0
                ) {
                    return response(
                        "Recomendación",
                        `La combinación de ${this.formatCurrency(values.debt)} de deuda y ${this.formatCurrency(values.liquidity)} de liquidez requiere atención prioritaria.`,
                        [
                            "liquidity-current",
                            "liquidity-amortize",
                            "prediction-close"
                        ]
                    );
                }

                return response(
                    "Dato real",
                    `La deuda equivale al ${this.formatPercent(values.debt / values.liquidity * 100)} de tu liquidez actual.`,
                    [
                        "liquidity-debt",
                        "liquidity-amortize",
                        "simulation-debt-500"
                    ]
                );

            case "debt-change":
                return response(
                    "Dato real",
                    `Este mes has destinado ${this.formatCurrency(values.debtPayments)} a pagos de deuda. Estos movimientos reducen la deuda y la liquidez, pero no afectan al gasto mensual.`,
                    [
                        "debt-current",
                        "liquidity-current",
                        "simulation-debt-500"
                    ]
                );

            case "investments-current":
                return response(
                    "Dato real",
                    `El valor actual registrado de tus inversiones es ${this.formatCurrency(values.investments)}.`,
                    [
                        "investments-month",
                        "investments-weight",
                        "investments-liquidity"
                    ]
                );

            case "investments-month":
                return response(
                    "Dato real",
                    `Este mes has aportado ${this.formatCurrency(values.monthlyInvested)} a inversiones. Estas aportaciones reducen liquidez y aumentan inversión.`,
                    [
                        "comparison-investments",
                        "investments-weight",
                        "simulation-invest-200"
                    ]
                );

            case "investments-weight": {
                const grossAssets =
                    values.liquidity +
                    values.investments;

                return grossAssets === 0
                    ? insufficient(
                        "No puedo calcular el peso de las inversiones porque liquidez e inversiones suman cero.",
                        [
                            "investments-current",
                            "liquidity-current"
                        ]
                    )
                    : response(
                        "Dato real",
                        `Las inversiones representan el ${this.formatPercent(values.investments / grossAssets * 100)} de tus activos formados por liquidez e inversiones.`,
                        [
                            "investments-liquidity",
                            "liquidity-security",
                            "simulation-invest-200"
                        ]
                    );
            }

            case "investments-liquidity":
                if (
                    values.liquidity <= 0 &&
                    values.monthlyInvested > 0
                ) {
                    return response(
                        "Recomendación",
                        `Has invertido ${this.formatCurrency(values.monthlyInvested)} este mes mientras tu liquidez es ${this.formatCurrency(values.liquidity)}. Conviene priorizar la recuperación de liquidez.`,
                        [
                            "liquidity-current",
                            "liquidity-security",
                            "prediction-close"
                        ]
                    );
                }

                if (
                    values.expenses > 0 &&
                    values.liquidity <
                        values.expenses * 3
                ) {
                    return response(
                        "Recomendación",
                        "Tu liquidez cubre menos de tres meses del gasto actual. Revisaría el nivel de aportaciones antes de incrementarlo.",
                        [
                            "liquidity-security",
                            "simulation-invest-200",
                            "investments-month"
                        ]
                    );
                }

                return response(
                    "Recomendación",
                    "No detecto una incompatibilidad inmediata entre inversión y liquidez, aunque debes mantener un fondo de seguridad adecuado.",
                    [
                        "liquidity-security",
                        "investments-weight",
                        "simulation-invest-200"
                    ]
                );

            case "goals-status":
                return insufficient(
                    "El resumen financiero utilizado por Atlas IA todavía no expone el detalle individual de cada objetivo. Puedo analizar el ahorro disponible, pero no calcular aún el progreso o la fecha prevista de un objetivo concreto.",
                    [
                        "goals-available-savings",
                        "savings-status",
                        "savings-current"
                    ]
                );

            case "goals-available-savings":
                return response(
                    "Dato real",
                    "El ahorro del mes actual es provisional y no puede distribuirse. Solo el ahorro de periodos cerrados puede asignarse entre objetivos.",
                    [
                        "savings-status",
                        "goals-priority",
                        "savings-current"
                    ]
                );

            case "goals-priority":
                return response(
                    "Recomendación",
                    "Para priorizar objetivos necesito considerar urgencia, importe pendiente y fecha deseada. El resumen actual no expone todavía esos datos individuales a Atlas IA.",
                    [
                        "goals-status",
                        "goals-available-savings",
                        "status-priority"
                    ]
                );

            case "prediction-close":
            case "prediction-expenses":
            case "prediction-negative":
            case "prediction-save-500": {
                const prediction =
                    this.prediction(summary);

                if (!prediction) {
                    return insufficient(
                        "La predicción de cierre solo se calcula para el mes actual.",
                        [
                            "savings-current",
                            "comparison-month"
                        ]
                    );
                }

                if (
                    prediction.currentExpenses ===
                    0
                ) {
                    return insufficient(
                        "No hay gastos suficientes para proyectar el cierre del mes mediante el ritmo diario actual.",
                        [
                            "expenses-top",
                            "savings-current"
                        ]
                    );
                }

                if (
                    questionKey ===
                    "prediction-close"
                ) {
                    return response(
                        "Estimación",
                        `Si mantienes el ritmo de gasto actual, podrías cerrar el mes con aproximadamente ${this.formatCurrency(prediction.projectedSavings)} de ahorro. La estimación proyecta los gastos registrados hasta hoy y mantiene sin cambios los demás componentes del resultado.`,
                        [
                            "prediction-expenses",
                            "prediction-negative",
                            "prediction-save-500",
                            "simulation-unexpected-1000"
                        ]
                    );
                }

                if (
                    questionKey ===
                    "prediction-expenses"
                ) {
                    return response(
                        "Estimación",
                        `El gasto neto proyectado al cierre es aproximadamente ${this.formatCurrency(prediction.projectedExpenses)}, frente a ${this.formatCurrency(prediction.currentExpenses)} registrados hasta ahora.`,
                        [
                            "prediction-close",
                            "prediction-negative",
                            "simulation-top-20"
                        ]
                    );
                }

                if (
                    questionKey ===
                    "prediction-negative"
                ) {
                    return response(
                        "Estimación",
                        prediction.projectedSavings < 0
                            ? `Sí. Manteniendo el ritmo actual, el ahorro proyectado sería ${this.formatCurrency(prediction.projectedSavings)}.`
                            : `Con el ritmo actual, no se proyecta ahorro negativo. El cierre estimado sería ${this.formatCurrency(prediction.projectedSavings)}.`,
                        [
                            "prediction-close",
                            "prediction-save-500",
                            "simulation-unexpected-1000"
                        ]
                    );
                }

                const required =
                    500 -
                    prediction.projectedSavings;

                return response(
                    "Estimación",
                    required <= 0
                        ? `La proyección ya supera los 500 € de ahorro en ${this.formatCurrency(Math.abs(required))}.`
                        : `Para cerrar con 500 € de ahorro necesitarías mejorar el resultado proyectado en ${this.formatCurrency(required)}, reduciendo gastos o aumentando ingresos.`,
                    [
                        "simulation-top-20",
                        "simulation-save-200",
                        "prediction-expenses"
                    ]
                );
            }

            case "comparison-month": {
                const incomeText =
                    values.incomeDifference > 0
                        ? `han aumentado ${this.formatCurrency(values.incomeDifference)}`
                        : values.incomeDifference < 0
                            ? `han bajado ${this.formatCurrency(Math.abs(values.incomeDifference))}`
                            : "no han cambiado";

                const expensesText =
                    values.expenseDifference > 0
                        ? `han aumentado ${this.formatCurrency(values.expenseDifference)}`
                        : values.expenseDifference < 0
                            ? `se han reducido ${this.formatCurrency(Math.abs(values.expenseDifference))}`
                            : "no han cambiado";

                const savingsText =
                    values.savingsDifference > 0
                        ? `ha mejorado ${this.formatCurrency(values.savingsDifference)}`
                        : values.savingsDifference < 0
                            ? `ha bajado ${this.formatCurrency(Math.abs(values.savingsDifference))}`
                            : "no ha cambiado";

                return response(
                    "Dato real",
                    `Frente al mes anterior, los ingresos ${incomeText}, los gastos ${expensesText} y el ahorro ${savingsText}.`,
                    [
                        "comparison-savings",
                        "comparison-expenses",
                        "comparison-income",
                        "comparison-investments"
                    ]
                );
            }

            case "comparison-savings":
                return this.answerGuidedQuestion(
                    "savings-compare",
                    summary,
                    metadata
                );

            case "comparison-expenses":
                return this.answerGuidedQuestion(
                    "expenses-change",
                    summary,
                    metadata
                );

            case "comparison-income":
                return this.answerGuidedQuestion(
                    "income-compare",
                    summary,
                    metadata
                );

            case "comparison-investments": {
                const text =
                    values.investedDifference > 0
                        ? `Has invertido ${this.formatCurrency(values.investedDifference)} más que el mes anterior.`
                        : values.investedDifference < 0
                            ? `Has invertido ${this.formatCurrency(Math.abs(values.investedDifference))} menos que el mes anterior.`
                            : "Las aportaciones no han cambiado frente al mes anterior.";

                return response(
                    "Dato real",
                    text,
                    [
                        "investments-month",
                        "investments-liquidity",
                        "simulation-invest-200"
                    ]
                );
            }

            case "simulation-top-20": {
                if (!topCategory) {
                    return insufficient(
                        "No hay una categoría principal positiva sobre la que aplicar la simulación.",
                        [
                            "expenses-top",
                            "simulation-save-200"
                        ]
                    );
                }

                const simulation =
                    typeof AtlasAIAnalysis !==
                        "undefined"
                        ? AtlasAIAnalysis
                            .simulateCategoryReduction(
                                topCategory,
                                20,
                                summary,
                                this
                            )
                        : {
                            reduction:
                                this.number(
                                    topCategory.amount
                                ) *
                                .2,

                            projectedSavings:
                                values.savings +
                                this.number(
                                    topCategory.amount
                                ) *
                                .2
                        };

                return response(
                    "Simulación",
                    `Reducir un 20 % ${this.categoryName(topCategory)} liberaría ${this.formatCurrency(simulation.reduction)}. Tu ahorro mensual pasaría de ${this.formatCurrency(values.savings)} a aproximadamente ${this.formatCurrency(simulation.projectedSavings)}.`,
                    [
                        "context-category-share",
                        "context-category-income-share",
                        "context-second-category",
                        "prediction-close"
                    ],
                    {
                        ...categoryMetadata,

                        theme:
                            "expenses",

                        metric:
                            "category-reduction",

                        simulation: {
                            type:
                                "category-reduction",

                            percentage:
                                20,

                            category:
                                this.categoryName(
                                    topCategory
                                ),

                            impact:
                                simulation.reduction
                        }
                    }
                );
            }

            case "simulation-save-200":
                return response(
                    "Simulación",
                    `Mejorar tu resultado en 200 € mensuales elevaría el ahorro de ${this.formatCurrency(values.savings)} a ${this.formatCurrency(values.savings + 200)}. En doce meses supondría ${this.formatCurrency(2400)} adicionales.`,
                    [
                        "savings-rate",
                        "savings-year",
                        "simulation-top-20"
                    ]
                );

            case "simulation-invest-200": {
                const simulation =
                    typeof AtlasAIAnalysis !==
                        "undefined"
                        ? AtlasAIAnalysis
                            .simulateExtraInvestment(
                                200,
                                summary,
                                this
                            )
                        : {
                            projectedLiquidity:
                                values.liquidity -
                                200,

                            projectedInvestments:
                                values.investments +
                                200,

                            projectedSavings:
                                values.savings -
                                200
                        };

                return response(
                    "Simulación",
                    `Una aportación adicional de 200 € reduciría tu liquidez de ${this.formatCurrency(values.liquidity)} a ${this.formatCurrency(simulation.projectedLiquidity)} y elevaría tus inversiones de ${this.formatCurrency(values.investments)} a ${this.formatCurrency(simulation.projectedInvestments)}. No sería un gasto, pero sí reduciría el ahorro mensual disponible en 200 €.`,
                    [
                        "investments-liquidity",
                        "liquidity-security",
                        "prediction-close"
                    ]
                );
            }

            case "simulation-income-minus-10": {
                if (
                    values.income <=
                    0
                ) {
                    return insufficient(
                        "No hay ingresos positivos sobre los que aplicar una reducción del 10 %.",
                        [
                            "income-current",
                            "income-compare"
                        ]
                    );
                }

                const simulation =
                    typeof AtlasAIAnalysis !==
                        "undefined"
                        ? AtlasAIAnalysis
                            .simulateIncomeReduction(
                                10,
                                summary,
                                this
                            )
                        : {
                            reduction:
                                values.income *
                                .1,

                            projectedIncome:
                                values.income *
                                .9,

                            projectedSavings:
                                values.savings -
                                values.income *
                                .1
                        };

                return response(
                    "Simulación",
                    `Una bajada del 10 % reduciría tus ingresos en ${this.formatCurrency(simulation.reduction)}, hasta ${this.formatCurrency(simulation.projectedIncome)}. Manteniendo el resto igual, el ahorro bajaría a ${this.formatCurrency(simulation.projectedSavings)}.`,
                    [
                        "income-stability",
                        "prediction-close",
                        "simulation-top-20"
                    ]
                );
            }

            case "simulation-unexpected-1000": {
                const simulation =
                    typeof AtlasAIAnalysis !==
                        "undefined"
                        ? AtlasAIAnalysis
                            .simulateUnexpectedExpense(
                                1000,
                                summary,
                                this
                            )
                        : {
                            projectedSavings:
                                values.savings -
                                1000,

                            projectedLiquidity:
                                values.liquidity -
                                1000
                        };

                return response(
                    "Simulación",
                    `Un gasto inesperado de 1.000 € reduciría el ahorro mensual de ${this.formatCurrency(values.savings)} a ${this.formatCurrency(simulation.projectedSavings)}. Si se pagara con liquidez, esta también bajaría hasta ${this.formatCurrency(simulation.projectedLiquidity)}.`,
                    [
                        "liquidity-security",
                        "prediction-close",
                        "simulation-save-200"
                    ]
                );
            }

            case "simulation-debt-500": {
                if (
                    values.debt <=
                    0
                ) {
                    return response(
                        "Dato real",
                        "No hay deuda pendiente sobre la que aplicar la simulación.",
                        [
                            "liquidity-current",
                            "investments-current"
                        ]
                    );
                }

                const simulation =
                    typeof AtlasAIAnalysis !==
                        "undefined"
                        ? AtlasAIAnalysis
                            .simulateDebtRepayment(
                                500,
                                summary,
                                this
                            )
                        : {
                            payment:
                                Math.min(
                                    500,
                                    values.debt
                                ),

                            projectedDebt:
                                values.debt -
                                Math.min(
                                    500,
                                    values.debt
                                ),

                            projectedLiquidity:
                                values.liquidity -
                                Math.min(
                                    500,
                                    values.debt
                                )
                        };

                return response(
                    "Simulación",
                    `Amortizar ${this.formatCurrency(simulation.payment)} reduciría la deuda a ${this.formatCurrency(simulation.projectedDebt)} y la liquidez a ${this.formatCurrency(simulation.projectedLiquidity)}. El pago no se consideraría gasto.`,
                    [
                        "liquidity-security",
                        "debt-risk",
                        "liquidity-amortize"
                    ]
                );
            }

            case "budget-remaining":
                return !summary.budget
                    ? insufficient(
                        "No hay un resumen de presupuesto disponible para este periodo.",
                        [
                            "expenses-top",
                            "expenses-change"
                        ]
                    )
                    : response(
                        "Dato real",
                        `El margen restante del presupuesto es ${this.formatCurrency(this.number(summary.budget.remaining))}.`,
                        [
                            "budget-status",
                            "budget-risk",
                            "expenses-top"
                        ]
                    );

            case "budget-risk": {
                if (!summary.budget) {
                    return insufficient(
                        "No hay información presupuestaria suficiente para evaluar el riesgo.",
                        [
                            "expenses-top",
                            "expenses-change"
                        ]
                    );
                }

                if (
                    summary.budget.status ===
                    "exceeded"
                ) {
                    return response(
                        "Dato real",
                        "El riesgo ya se ha materializado: el presupuesto está excedido.",
                        [
                            "budget-status",
                            "expenses-top",
                            "simulation-top-20"
                        ]
                    );
                }

                const remaining =
                    this.number(
                        summary.budget.remaining
                    );

                return response(
                    "Recomendación",
                    remaining <= 0
                        ? "No queda margen presupuestario disponible."
                        : `Todavía quedan ${this.formatCurrency(remaining)}. Conviene compararlo con los gastos pendientes antes de asumir nuevas compras.`,
                    [
                        "budget-remaining",
                        "prediction-expenses",
                        "expenses-top"
                    ]
                );
            }

            case "recurring-status":
                return insufficient(
                    "Atlas IA todavía no recibe el detalle de cada movimiento recurrente desde este resumen. La integración completa permitirá identificar próximos cobros y pagos sin inventar información.",
                    [
                        "prediction-close",
                        "prediction-expenses"
                    ]
                );

            case "recurring-prediction":
                return insufficient(
                    "La predicción actual utiliza el ritmo de gasto registrado, pero todavía no incorpora de forma individual los movimientos recurrentes pendientes.",
                    [
                        "prediction-close",
                        "prediction-expenses",
                        "recurring-status"
                    ]
                );

            default:
                return response(
                    "Dato real",
                    this.mainMessage(summary),
                    [
                        "status-overview",
                        "savings-current",
                        "expenses-top"
                    ]
                );
        }
    },

    addMessage(
        role,
        text,
        type = ""
    ) {
        this.state.messages.push({
            role,
            text,
            type
        });
    },

    cloneConversationContext(context) {
        if (!context) {
            return null;
        }

        return {
            ...context,

            entity:
                context.entity
                    ? {
                        ...context.entity
                    }
                    : null,

            simulation:
                context.simulation
                    ? {
                        ...context.simulation
                    }
                    : null
        };
    },

    pushNavigation() {
        this.state.navigation.push({
            view:
                this.state.view,

            currentTheme:
                this.state.currentTheme,

            currentQuestion:
                this.state.currentQuestion,

            themePage:
                this.state.themePage,

            followUps: [
                ...(
                    this.state.followUps ||
                    []
                )
            ],

            conversationContext:
                this.cloneConversationContext(
                    this.state
                        .conversationContext
                )
        });

        if (
            this.state.navigation.length >
            20
        ) {
            this.state.navigation.shift();
        }
    },

    selectTheme(
        themeKey,
        summary
    ) {
        const theme =
            this.themeByKey(
                themeKey,
                summary
            );

        if (!theme) {
            return;
        }

        this.pushNavigation();

        this.state.currentTheme =
            themeKey;

        this.state.currentQuestion =
            null;

        this.state.view =
            "questions";

        this.state.followUps =
            [];

        this.addMessage(
            "user",
            theme.label
        );

        this.addMessage(
            "atlas",
            `Vamos a analizar ${theme.label.toLowerCase()}. Elige una de las preguntas disponibles.`,
            "Tema"
        );
    },

    askQuestion(
        questionKey,
        summary
    ) {
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
            answer.followUps ||
            [];

        this.state.conversationContext =
            answer.conversationContext ||
            this.state.conversationContext;

        const theme =
            this.state
                .conversationContext
                ?.theme;

        if (
            theme &&
            this.themeByKey(
                theme,
                summary
            )
        ) {
            this.state.currentTheme =
                theme;
        }
    },

    changeTheme() {
        this.pushNavigation();

        this.state.currentTheme =
            null;

        this.state.currentQuestion =
            null;

        this.state.view =
            "themes";

        this.state.themePage =
            0;

        this.state.followUps =
            [];

        this.state.conversationContext =
            null;

        this.addMessage(
            "user",
            "Cambiar de tema"
        );

        this.addMessage(
            "atlas",
            "Elige el nuevo tema que quieres analizar.",
            "Navegación"
        );
    },

    goBack() {
        const previous =
            this.state.navigation.pop();

        if (!previous) {
            return;
        }

        this.state.view =
            previous.view;

        this.state.currentTheme =
            previous.currentTheme;

        this.state.currentQuestion =
            previous.currentQuestion;

        this.state.themePage =
            previous.themePage;

        this.state.followUps = [
            ...(
                previous.followUps ||
                []
            )
        ];

        this.state.conversationContext =
            this.cloneConversationContext(
                previous
                    .conversationContext
            );
    },

    resetConversation() {
        this.state = {
            initialized: false,
            messages: [],
            currentTheme: null,
            currentQuestion: null,
            view: "themes",
            themePage: 0,
            navigation: [],
            followUps: [],
            conversationContext: null
        };

        this.initializeConversation();
    },

    renderMessage(message) {
        const isUser =
            message.role ===
            "user";

        return `
            <div
                style="
                    display:flex;
                    justify-content:${isUser ? "flex-end" : "flex-start"};
                    margin-bottom:12px;
                "
            >
                <div
                    style="
                        max-width:88%;
                        padding:13px 14px;
                        border:1px solid ${isUser ? "rgba(217,180,95,.24)" : "rgba(145,164,202,.16)"};
                        border-radius:${isUser ? "16px 16px 5px 16px" : "16px 16px 16px 5px"};
                        color:#f7f8fc;
                        background:${isUser ? "rgba(217,180,95,.1)" : "rgba(145,164,202,.07)"};
                    "
                >
                    ${
                        !isUser &&
                        message.type
                            ? `
                                <div
                                    style="
                                        margin-bottom:6px;
                                        color:#d9b45f;
                                        font-size:10px;
                                        font-weight:800;
                                        letter-spacing:.08em;
                                        text-transform:uppercase;
                                    "
                                >
                                    ${this.escape(message.type)}
                                </div>
                            `
                            : ""
                    }

                    <div
                        style="
                            font-size:14px;
                            line-height:1.55;
                            white-space:normal;
                        "
                    >
                        ${this.escape(message.text)}
                    </div>
                </div>
            </div>
        `;
    },

    renderActionButton(
        action,
        value,
        label,
        secondary = false
    ) {
        return `
            <button
                type="button"
                data-ai-action="${this.escape(action)}"
                data-ai-value="${this.escape(value || "")}"
                style="
                    width:100%;
                    min-height:47px;
                    padding:11px 13px;
                    border:1px solid ${secondary ? "rgba(145,164,202,.18)" : "rgba(217,180,95,.22)"};
                    border-radius:14px;
                    color:${secondary ? "var(--color-text-muted)" : "#f7f8fc"};
                    background:${secondary ? "rgba(145,164,202,.05)" : "rgba(217,180,95,.07)"};
                    font-size:13px;
                    font-weight:700;
                    line-height:1.35;
                    text-align:left;
                "
            >
                ${this.escape(label)}
            </button>
        `;
    },

    renderThemeOptions(summary) {
        const themes =
            this.themes(summary);

        const pageSize =
            5;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    themes.length /
                    pageSize
                )
            );

        const page =
            Math.min(
                this.state.themePage,
                totalPages - 1
            );

        const visibleThemes =
            themes.slice(
                page * pageSize,
                page * pageSize +
                pageSize
            );

        return `
            <div
                style="
                    margin-top:14px;
                    padding-top:14px;
                    border-top:1px solid rgba(145,164,202,.12);
                "
            >
                <div
                    style="
                        margin-bottom:10px;
                        color:var(--color-text-muted);
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    Elige un tema
                </div>

                <div
                    style="
                        display:grid;
                        gap:8px;
                    "
                >
                    ${
                        visibleThemes
                            .map(theme => `
                                <button
                                    type="button"
                                    data-ai-action="theme"
                                    data-ai-value="${this.escape(theme.key)}"
                                    style="
                                        width:100%;
                                        padding:13px;
                                        border:1px solid rgba(217,180,95,.18);
                                        border-radius:15px;
                                        color:#f7f8fc;
                                        background:rgba(217,180,95,.06);
                                        text-align:left;
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
                                                font-size:19px;
                                            "
                                        >
                                            ${this.escape(theme.icon)}
                                        </span>

                                        <div>
                                            <strong
                                                style="
                                                    display:block;
                                                    font-size:13px;
                                                "
                                            >
                                                ${this.escape(theme.label)}
                                            </strong>

                                            <span
                                                style="
                                                    display:block;
                                                    margin-top:4px;
                                                    color:var(--color-text-muted);
                                                    font-size:11px;
                                                    line-height:1.4;
                                                "
                                            >
                                                ${this.escape(theme.description)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            `)
                            .join("")
                    }
                </div>

                ${
                    totalPages > 1
                        ? `
                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:repeat(2,minmax(0,1fr));
                                    gap:8px;
                                    margin-top:9px;
                                "
                            >
                                ${
                                    page > 0
                                        ? this.renderActionButton(
                                            "theme-page",
                                            String(page - 1),
                                            "← Temas anteriores",
                                            true
                                        )
                                        : "<div></div>"
                                }

                                ${
                                    page < totalPages - 1
                                        ? this.renderActionButton(
                                            "theme-page",
                                            String(page + 1),
                                            "Más temas →",
                                            true
                                        )
                                        : "<div></div>"
                                }
                            </div>
                        `
                        : ""
                }
            </div>
        `;
    },

    renderQuestionOptions(summary) {
        const theme =
            this.themeByKey(
                this.state.currentTheme,
                summary
            );

        const questions =
            this.questionsForTheme(
                this.state.currentTheme,
                summary
            );

        return `
            <div
                style="
                    margin-top:14px;
                    padding-top:14px;
                    border-top:1px solid rgba(145,164,202,.12);
                "
            >
                <div
                    style="
                        margin-bottom:10px;
                        color:var(--color-text-muted);
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    ${
                        theme
                            ? this.escape(
                                theme.label
                            )
                            : "Preguntas"
                    }
                </div>

                <div
                    style="
                        display:grid;
                        gap:8px;
                    "
                >
                    ${
                        questions
                            .map(question =>
                                this.renderActionButton(
                                    "question",
                                    question.key,
                                    question.label
                                )
                            )
                            .join("")
                    }

                    ${
                        this.renderActionButton(
                            "change-theme",
                            "",
                            "Cambiar de tema",
                            true
                        )
                    }

                    ${
                        this.state.navigation.length > 0
                            ? this.renderActionButton(
                                "back",
                                "",
                                "← Volver",
                                true
                            )
                            : ""
                    }
                </div>
            </div>
        `;
    },

    renderFollowUps(summary) {
        const followUps =
            this.state.followUps ||
            [];

        return `
            <div
                style="
                    margin-top:14px;
                    padding-top:14px;
                    border-top:1px solid rgba(145,164,202,.12);
                "
            >
                <div
                    style="
                        margin-bottom:10px;
                        color:var(--color-text-muted);
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    Puedes seguir preguntando
                </div>

                <div
                    style="
                        display:grid;
                        gap:8px;
                    "
                >
                    ${
                        followUps
                            .map(questionKey =>
                                this.renderActionButton(
                                    "question",
                                    questionKey,
                                    this.questionLabel(
                                        questionKey,
                                        summary
                                    )
                                )
                            )
                            .join("")
                    }

                    ${
                        this.state.currentTheme
                            ? this.renderActionButton(
                                "theme-questions",
                                "",
                                "Ver otras preguntas de este tema",
                                true
                            )
                            : ""
                    }

                    ${
                        this.renderActionButton(
                            "change-theme",
                            "",
                            "Cambiar de tema",
                            true
                        )
                    }

                    ${
                        this.state.navigation.length > 0
                            ? this.renderActionButton(
                                "back",
                                "",
                                "← Volver",
                                true
                            )
                            : ""
                    }
                </div>
            </div>
        `;
    },

    renderConversation(summary) {
        this.initializeConversation();

        let options = "";

        if (
            this.state.view ===
            "themes"
        ) {
            options =
                this.renderThemeOptions(
                    summary
                );
        } else if (
            this.state.view ===
            "questions"
        ) {
            options =
                this.renderQuestionOptions(
                    summary
                );
        } else {
            options =
                this.renderFollowUps(
                    summary
                );
        }

        return `
            <div
                id="atlas-ai-conversation"
            >
                <div
                    id="atlas-ai-messages"
                    style="
                        max-height:520px;
                        overflow-y:auto;
                        padding-right:2px;
                        scroll-behavior:smooth;
                    "
                >
                    ${
                        this.state.messages
                            .map(message =>
                                this.renderMessage(
                                    message
                                )
                            )
                            .join("")
                    }
                </div>

                ${options}

                <button
                    type="button"
                    data-ai-action="reset"
                    style="
                        margin-top:13px;
                        padding:0;
                        border:0;
                        color:var(--color-text-muted);
                        background:transparent;
                        font-size:11px;
                        text-decoration:underline;
                    "
                >
                    Reiniciar conversación
                </button>
            </div>
        `;
    },

    refreshConversation() {
        const container =
            document.getElementById(
                "atlas-ai-conversation-container"
            );

        if (
            !container ||
            !this.data
        ) {
            return;
        }

        const summary =
            this.summary(
                this.data
            );

        container.innerHTML =
            this.renderConversation(
                summary
            );

        requestAnimationFrame(() => {
            const messages =
                document.getElementById(
                    "atlas-ai-messages"
                );

            if (messages) {
                messages.scrollTop =
                    messages.scrollHeight;
            }
        });
    },

    render(data) {
        this.data =
            data;

        this.initializeConversation();

        const summary =
            this.summary(data);

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
                        ${
                            this.escape(
                                this.mainMessage(
                                    summary
                                )
                            )
                        }
                    </div>

                    <p
                        style="
                            margin:12px 0 0;
                            color:var(--color-text-muted);
                            font-size:13px;
                            line-height:1.5;
                        "
                    >
                        ${
                            this.escape(
                                this.explanation(
                                    summary
                                )
                            )
                        }
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

                    ${
                        this.renderAlerts(
                            summary
                        )
                    }
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

                    ${
                        this.renderRecommendations(
                            summary
                        )
                    }
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
                                Conversación financiera guiada
                            </p>
                        </div>
                    </div>

                    <div
                        id="atlas-ai-conversation-container"
                        style="
                            margin-top:15px;
                        "
                    >
                        ${
                            this.renderConversation(
                                summary
                            )
                        }
                    </div>
                </section>

                <section
                    class="panel"
                    style="
                        border-color:rgba(145,164,202,.14);
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
        if (this.eventsBound) {
            return;
        }

        this.eventsBound =
            true;

        document.addEventListener(
            "click",
            event => {
                const button =
                    event.target.closest(
                        "[data-ai-action]"
                    );

                if (
                    !button ||
                    !this.data
                ) {
                    return;
                }

                const action =
                    button.dataset.aiAction;

                const value =
                    button.dataset.aiValue;

                const summary =
                    this.summary(
                        this.data
                    );

                if (
                    action ===
                    "theme"
                ) {
                    this.selectTheme(
                        value,
                        summary
                    );
                } else if (
                    action ===
                    "question"
                ) {
                    this.askQuestion(
                        value,
                        summary
                    );
                } else if (
                    action ===
                    "change-theme"
                ) {
                    this.changeTheme();
                } else if (
                    action ===
                    "theme-questions"
                ) {
                    this.pushNavigation();

                    this.state.view =
                        "questions";

                    this.state.currentQuestion =
                        null;
                } else if (
                    action ===
                    "theme-page"
                ) {
                    this.state.themePage =
                        this.number(value);
                } else if (
                    action ===
                    "back"
                ) {
                    this.goBack();
                } else if (
                    action ===
                    "reset"
                ) {
                    this.resetConversation();
                } else {
                    return;
                }

                this.refreshConversation();
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
                .render(data);
        };

    AtlasLocalAI.bindEvents();

})();

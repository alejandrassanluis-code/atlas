/* ==========================================================
   ATLAS
   ai-local.js
   Atlas IA local — análisis financiero basado en reglas
========================================================== */

const AtlasLocalAI = {

    data: null,

    state: {

        initialized:
            false,

        messages:
            [],

        currentTheme:
            null,

        currentQuestion:
            null,

        view:
            "themes",

        themePage:
            0,

        navigation:
            []

    },

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
                        this.formatPercent(
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

    initializeConversation() {

        if (
            this.state.initialized
        ) {

            return;

        }

        this.state.initialized =
            true;

        this.state.messages = [

            {

                role:
                    "atlas",

                type:
                    "Introducción",

                text:
                    "Hola. Puedo ayudarte a entender tus datos financieros, comparar periodos y realizar simulaciones. Elige primero el tema que quieres analizar."

            }

        ];

        this.state.currentTheme =
            null;

        this.state.currentQuestion =
            null;

        this.state.view =
            "themes";

        this.state.themePage =
            0;

        this.state.navigation =
            [];

    },

    themes(summary) {

        const current =
            summary.current;

        const themes = [

            {

                key:
                    "status",

                icon:
                    "✦",

                label:
                    "Estado financiero",

                description:
                    "Diagnóstico general y puntos importantes"

            },

            {

                key:
                    "savings",

                icon:
                    "🐷",

                label:
                    "Ahorro",

                description:
                    "Resultado, tasa y evolución mensual"

            },

            {

                key:
                    "expenses",

                icon:
                    "🧾",

                label:
                    "Gastos",

                description:
                    "Categorías, cambios y margen de mejora"

            },

            {

                key:
                    "income",

                icon:
                    "💰",

                label:
                    "Ingresos",

                description:
                    "Nivel actual y comparación mensual"

            },

            {

                key:
                    "liquidity",

                icon:
                    "💵",

                label:
                    "Liquidez y seguridad",

                description:
                    "Liquidez, deuda y capacidad de reserva"

            },

            {

                key:
                    "debt",

                icon:
                    "💳",

                label:
                    "Deuda",

                description:
                    "Nivel, riesgo y posibles amortizaciones"

            },

            {

                key:
                    "investments",

                icon:
                    "📈",

                label:
                    "Inversiones",

                description:
                    "Valor, aportaciones y peso patrimonial"

            },

            {

                key:
                    "goals",

                icon:
                    "🎯",

                label:
                    "Objetivos",

                description:
                    "Progreso, prioridades y ahorro disponible"

            },

            {

                key:
                    "prediction",

                icon:
                    "🔮",

                label:
                    "Predicción de cierre",

                description:
                    "Estimación del resultado final del mes"

            },

            {

                key:
                    "comparisons",

                icon:
                    "⚖️",

                label:
                    "Comparaciones",

                description:
                    "Cambios frente al mes anterior"

            },

            {

                key:
                    "simulations",

                icon:
                    "🧮",

                label:
                    "Simulaciones",

                description:
                    "Escenarios de gasto, ahorro e inversión"

            },

            {

                key:
                    "budgets",

                icon:
                    "📋",

                label:
                    "Presupuestos",

                description:
                    "Estado y margen restante"

            },

            {

                key:
                    "recurring",

                icon:
                    "🔁",

                label:
                    "Movimientos recurrentes",

                description:
                    "Impacto esperado y datos pendientes"

            }

        ];

        return themes.filter(
            theme => {

                if (
                    theme.key ===
                        "debt" &&
                    this.number(
                        current.debt
                    ) === 0
                ) {

                    return false;

                }

                if (
                    theme.key ===
                        "budgets" &&
                    !summary.budget
                ) {

                    return false;

                }

                return true;

            }
        );

    },

    themeByKey(
        themeKey,
        summary
    ) {

        return this
            .themes(
                summary
            )
            .find(
                theme =>
                    theme.key ===
                    themeKey
            ) || null;

    },

    questionsForTheme(
        themeKey,
        summary
    ) {

        const current =
            summary.current;

        const hasIncome =
            this.number(
                current.monthlyIncome
            ) !== 0;

        const hasExpenses =
            this.number(
                current.monthlyExpenses
            ) !== 0;

        const hasInvestments =
            this.number(
                current.investments
            ) !== 0 ||
            this.number(
                current.monthlyInvested
            ) !== 0;

        const questions = {

            status: [

                {

                    key:
                        "status-overview",

                    label:
                        "¿Cómo estoy financieramente?"

                },

                {

                    key:
                        "status-improved",

                    label:
                        "¿Qué ha mejorado este mes?"

                },

                {

                    key:
                        "status-worsened",

                    label:
                        "¿Qué ha empeorado?"

                },

                {

                    key:
                        "status-weakness",

                    label:
                        "¿Cuál es mi punto más débil?"

                },

                {

                    key:
                        "status-priority",

                    label:
                        "¿Qué debería revisar primero?"

                }

            ],

            savings: [

                {

                    key:
                        "savings-current",

                    label:
                        "¿Cuánto estoy ahorrando?"

                },

                {

                    key:
                        "savings-status",

                    label:
                        "¿Es provisional o cerrado?"

                },

                {

                    key:
                        "savings-compare",

                    label:
                        "¿Ahorro más que el mes pasado?"

                },

                {

                    key:
                        "savings-rate",

                    label:
                        "¿Cuál es mi tasa de ahorro?"

                },

                {

                    key:
                        "savings-year",

                    label:
                        "¿Cuánto podría ahorrar en un año?"

                }

            ],

            expenses: [

                {

                    key:
                        "expenses-top",

                    label:
                        "¿En qué gasto más?"

                },

                {

                    key:
                        "expenses-change",

                    label:
                        "¿Mis gastos han aumentado?"

                },

                {

                    key:
                        "expenses-income-share",

                    label:
                        "¿Qué porcentaje de mis ingresos gasto?"

                },

                {

                    key:
                        "expenses-budget",

                    label:
                        "¿Estoy cumpliendo mi presupuesto?"

                },

                {

                    key:
                        "simulation-top-20",

                    label:
                        "¿Qué pasa si reduzco mi mayor gasto un 20 %?"

                }

            ],

            income: [

                {

                    key:
                        "income-current",

                    label:
                        "¿Cuánto he ingresado este mes?"

                },

                {

                    key:
                        "income-compare",

                    label:
                        "¿He ingresado más que el mes pasado?"

                },

                {

                    key:
                        "income-stability",

                    label:
                        "¿Mis ingresos parecen estables?"

                },

                {

                    key:
                        "simulation-income-minus-10",

                    label:
                        "¿Qué pasa si mis ingresos bajan un 10 %?"

                }

            ],

            liquidity: [

                {

                    key:
                        "liquidity-current",

                    label:
                        "¿Cómo está mi liquidez?"

                },

                {

                    key:
                        "liquidity-debt",

                    label:
                        "¿Cómo se compara con mi deuda?"

                },

                {

                    key:
                        "liquidity-security",

                    label:
                        "¿Tengo margen de seguridad?"

                },

                {

                    key:
                        "liquidity-invest",

                    label:
                        "¿Puedo invertir más?"

                },

                {

                    key:
                        "liquidity-amortize",

                    label:
                        "¿Puedo amortizar deuda?"

                }

            ],

            debt: [

                {

                    key:
                        "debt-current",

                    label:
                        "¿Cuánta deuda tengo?"

                },

                {

                    key:
                        "debt-risk",

                    label:
                        "¿Mi deuda es alta?"

                },

                {

                    key:
                        "debt-change",

                    label:
                        "¿Cómo ha evolucionado este mes?"

                },

                {

                    key:
                        "simulation-debt-500",

                    label:
                        "¿Qué pasa si amortizo 500 €?"

                }

            ],

            investments: [

                {

                    key:
                        "investments-current",

                    label:
                        "¿Cómo van mis inversiones?"

                },

                {

                    key:
                        "investments-month",

                    label:
                        "¿Cuánto he aportado este mes?"

                },

                {

                    key:
                        "investments-weight",

                    label:
                        "¿Qué peso tienen en mi patrimonio?"

                },

                {

                    key:
                        "investments-liquidity",

                    label:
                        "¿Estoy invirtiendo demasiado para mi liquidez?"

                },

                {

                    key:
                        "simulation-invest-200",

                    label:
                        "¿Qué pasa si invierto 200 € más?"

                }

            ],

            goals: [

                {

                    key:
                        "goals-status",

                    label:
                        "¿Cómo van mis objetivos?"

                },

                {

                    key:
                        "goals-available-savings",

                    label:
                        "¿Cuánto ahorro puedo distribuir?"

                },

                {

                    key:
                        "goals-priority",

                    label:
                        "¿Qué objetivo debería priorizar?"

                }

            ],

            prediction: [

                {

                    key:
                        "prediction-close",

                    label:
                        "¿Cómo cerraré el mes?"

                },

                {

                    key:
                        "prediction-expenses",

                    label:
                        "¿Cuánto gastaré previsiblemente?"

                },

                {

                    key:
                        "prediction-negative",

                    label:
                        "¿Puedo acabar con ahorro negativo?"

                },

                {

                    key:
                        "prediction-save-500",

                    label:
                        "¿Qué necesito para cerrar con 500 € de ahorro?"

                },

                {

                    key:
                        "simulation-unexpected-1000",

                    label:
                        "¿Qué pasa si tengo un gasto de 1.000 €?"

                }

            ],

            comparisons: [

                {

                    key:
                        "comparison-month",

                    label:
                        "Compara este mes con el anterior"

                },

                {

                    key:
                        "comparison-savings",

                    label:
                        "¿Cómo ha cambiado mi ahorro?"

                },

                {

                    key:
                        "comparison-expenses",

                    label:
                        "¿Cómo han cambiado mis gastos?"

                },

                {

                    key:
                        "comparison-income",

                    label:
                        "¿Cómo han cambiado mis ingresos?"

                },

                {

                    key:
                        "comparison-investments",

                    label:
                        "¿Cómo han cambiado mis aportaciones?"

                }

            ],

            simulations: [

                {

                    key:
                        "simulation-top-20",

                    label:
                        "Reducir mi mayor gasto un 20 %"

                },

                {

                    key:
                        "simulation-save-200",

                    label:
                        "Ahorrar 200 € más al mes"

                },

                {

                    key:
                        "simulation-invest-200",

                    label:
                        "Invertir 200 € adicionales"

                },

                {

                    key:
                        "simulation-income-minus-10",

                    label:
                        "Reducir mis ingresos un 10 %"

                },

                {

                    key:
                        "simulation-unexpected-1000",

                    label:
                        "Añadir un gasto inesperado de 1.000 €"

                }

            ],

            budgets: [

                {

                    key:
                        "budget-status",

                    label:
                        "¿Estoy cumpliendo mi presupuesto?"

                },

                {

                    key:
                        "budget-remaining",

                    label:
                        "¿Cuánto presupuesto me queda?"

                },

                {

                    key:
                        "budget-risk",

                    label:
                        "¿Tengo riesgo de superarlo?"

                }

            ],

            recurring: [

                {

                    key:
                        "recurring-status",

                    label:
                        "¿Qué puedo analizar de mis recurrentes?"

                },

                {

                    key:
                        "recurring-prediction",

                    label:
                        "¿Cómo afectan a la predicción?"

                }

            ]

        };

        let result =
            questions[themeKey] || [];

        if (
            themeKey ===
                "expenses" &&
            !hasExpenses
        ) {

            result =
                result.filter(
                    question =>
                        question.key ===
                        "expenses-top" ||
                        question.key ===
                        "expenses-change"
                );

        }

        if (
            themeKey ===
                "income" &&
            !hasIncome
        ) {

            result =
                result.filter(
                    question =>
                        question.key ===
                        "income-current" ||
                        question.key ===
                        "income-compare"
                );

        }

        if (
            themeKey ===
                "investments" &&
            !hasInvestments
        ) {

            result =
                result.filter(
                    question =>
                        question.key ===
                        "investments-current" ||
                        question.key ===
                        "investments-month"
                );

        }

        return result.slice(
            0,
            5
        );

    },

    questionLabel(
        questionKey,
        summary
    ) {

        const themes =
            this.themes(
                summary
            );

        for (
            const theme
            of themes
        ) {

            const question =
                this
                    .questionsForTheme(
                        theme.key,
                        summary
                    )
                    .find(
                        item =>
                            item.key ===
                            questionKey
                    );

            if (question) {

                return question.label;

            }

        }

        const simulationLabels = {

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

        return (
            simulationLabels[
                questionKey
            ] ||
            "Analizar mis datos"
        );

    },

    prediction(summary) {

        const now =
            new Date();

        const currentMonthKey =
            this.currentMonthKey();

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
            this.number(
                summary.current
                    .monthlyExpenses
            );

        const currentSavings =
            this.number(
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

    },

    answerQuestion(
        questionKey,
        summary
    ) {

        const current =
            summary.current;

        const previous =
            summary.previous;

        const income =
            this.number(
                current.monthlyIncome
            );

        const expenses =
            this.number(
                current.monthlyExpenses
            );

        const savings =
            this.number(
                current.monthlySavings
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

        const investments =
            this.number(
                current.investments
            );

        const monthlyInvested =
            this.number(
                current.monthlyInvested
            );

        const debtPayments =
            this.number(
                current.monthlyDebtPayments
            );

        const previousIncome =
            this.number(
                previous.monthlyIncome
            );

        const previousExpenses =
            this.number(
                previous.monthlyExpenses
            );

        const previousSavings =
            this.number(
                previous.monthlySavings
            );

        const previousInvested =
            this.number(
                previous.monthlyInvested
            );

        const savingsDifference =
            savings -
            previousSavings;

        const incomeDifference =
            income -
            previousIncome;

        const expenseDifference =
            expenses -
            previousExpenses;

        const investedDifference =
            monthlyInvested -
            previousInvested;

        const topCategory =
            this.topCategory(
                summary
            );

        const secondCategory =
            this.secondCategory(
                summary
            );

        const netWorth =
            liquidity +
            investments -
            debt;

        if (
            questionKey ===
            "status-overview"
        ) {

            if (
                !this.hasFinancialData(
                    summary
                )
            ) {

                return this.insufficient(
                    "Todavía no hay suficientes movimientos o saldos registrados para realizar un diagnóstico financiero completo.",
                    [
                        "income-current",
                        "expenses-top"
                    ]
                );

            }

            let text =
                `Tu patrimonio neto calculado es ${
                    this.formatCurrency(
                        netWorth
                    )
                }. Tienes ${
                    this.formatCurrency(
                        liquidity
                    )
                } de liquidez, ${
                    this.formatCurrency(
                        investments
                    )
                } en inversiones y ${
                    this.formatCurrency(
                        debt
                    )
                } de deuda. `;

            text +=
                this.mainMessage(
                    summary
                );

            return this.response(
                "Dato real",
                text,
                [
                    "status-improved",
                    "status-weakness",
                    "comparison-month",
                    "status-priority"
                ]
            );

        }

        if (
            questionKey ===
            "status-improved"
        ) {

            const improvements = [];

            if (
                savingsDifference > 0
            ) {

                improvements.push(
                    `el ahorro ha mejorado ${
                        this.formatCurrency(
                            savingsDifference
                        )
                    }`
                );

            }

            if (
                expenseDifference < 0
            ) {

                improvements.push(
                    `los gastos se han reducido ${
                        this.formatCurrency(
                            Math.abs(
                                expenseDifference
                            )
                        )
                    }`
                );

            }

            if (
                incomeDifference > 0
            ) {

                improvements.push(
                    `los ingresos han aumentado ${
                        this.formatCurrency(
                            incomeDifference
                        )
                    }`
                );

            }

            if (
                investedDifference > 0
            ) {

                improvements.push(
                    `las aportaciones han aumentado ${
                        this.formatCurrency(
                            investedDifference
                        )
                    }`
                );

            }

            if (
                improvements.length ===
                0
            ) {

                return this.response(
                    "Dato real",
                    "No detecto una mejora clara frente al mes anterior con los indicadores disponibles.",
                    [
                        "status-worsened",
                        "comparison-month",
                        "status-priority"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Respecto al mes anterior, ${
                    improvements.join(
                        ", "
                    )
                }.`,
                [
                    "status-worsened",
                    "comparison-month",
                    "status-priority"
                ]
            );

        }

        if (
            questionKey ===
            "status-worsened"
        ) {

            const declines = [];

            if (
                savingsDifference < 0
            ) {

                declines.push(
                    `el ahorro ha bajado ${
                        this.formatCurrency(
                            Math.abs(
                                savingsDifference
                            )
                        )
                    }`
                );

            }

            if (
                expenseDifference > 0
            ) {

                declines.push(
                    `los gastos han aumentado ${
                        this.formatCurrency(
                            expenseDifference
                        )
                    }`
                );

            }

            if (
                incomeDifference < 0
            ) {

                declines.push(
                    `los ingresos han bajado ${
                        this.formatCurrency(
                            Math.abs(
                                incomeDifference
                            )
                        )
                    }`
                );

            }

            if (
                liquidity < 0
            ) {

                declines.push(
                    `la liquidez se encuentra en ${
                        this.formatCurrency(
                            liquidity
                        )
                    }`
                );

            }

            if (
                declines.length ===
                0
            ) {

                return this.response(
                    "Dato real",
                    "No detecto un empeoramiento principal frente al mes anterior con los datos disponibles.",
                    [
                        "status-improved",
                        "status-weakness",
                        "comparison-month"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Los principales puntos negativos son que ${
                    declines.join(
                        ", "
                    )
                }.`,
                [
                    "status-weakness",
                    "status-priority",
                    "comparison-month"
                ]
            );

        }

        if (
            questionKey ===
            "status-weakness"
        ) {

            if (
                liquidity < 0
            ) {

                return this.response(
                    "Recomendación",
                    `Tu punto más débil es la liquidez, que actualmente es ${
                        this.formatCurrency(
                            liquidity
                        )
                    }. Conviene priorizar la recuperación de liquidez antes de aumentar nuevas aportaciones a inversión.`,
                    [
                        "liquidity-current",
                        "prediction-close",
                        "simulation-save-200"
                    ]
                );

            }

            if (
                savings < 0
            ) {

                return this.response(
                    "Recomendación",
                    `Tu punto más débil es el resultado mensual: el ahorro provisional es ${
                        this.formatCurrency(
                            savings
                        )
                    }. La prioridad debería ser identificar qué gastos están provocando el déficit.`,
                    [
                        "expenses-top",
                        "expenses-change",
                        "simulation-top-20"
                    ]
                );

            }

            if (
                debt > liquidity &&
                debt > 0
            ) {

                return this.response(
                    "Recomendación",
                    `La deuda supera tu liquidez en ${
                        this.formatCurrency(
                            debt -
                            liquidity
                        )
                    }. Este desequilibrio es el principal punto a vigilar.`,
                    [
                        "debt-risk",
                        "liquidity-debt",
                        "simulation-debt-500"
                    ]
                );

            }

            if (
                income > 0 &&
                savingRate < 10
            ) {

                return this.response(
                    "Recomendación",
                    `Tu tasa de ahorro es del ${
                        this.formatPercent(
                            savingRate
                        )
                    }, por debajo del 10 %. Es el indicador con más margen de mejora.`,
                    [
                        "expenses-top",
                        "savings-rate",
                        "simulation-top-20"
                    ]
                );

            }

            return this.response(
                "Recomendación",
                "No detecto un punto crítico principal. Mantendría bajo vigilancia la evolución del ahorro, la liquidez y la categoría de gasto más elevada.",
                [
                    "savings-current",
                    "liquidity-current",
                    "expenses-top"
                ]
            );

        }

        if (
            questionKey ===
            "status-priority"
        ) {

            return this.response(
                "Recomendación",
                this
                    .recommendations(
                        summary
                    )
                    .join(" "),
                [
                    "status-weakness",
                    "expenses-top",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "savings-current"
        ) {

            return this.response(
                "Dato real",
                `Tu ahorro provisional de este mes es ${
                    this.formatCurrency(
                        savings
                    )
                }.`,
                [
                    "savings-status",
                    "savings-compare",
                    "savings-rate",
                    "savings-year"
                ]
            );

        }

        if (
            questionKey ===
            "savings-status"
        ) {

            return this.response(
                "Dato real",
                `El ahorro de ${
                    summary.monthKey
                } es provisional mientras el mes permanezca abierto. No puede distribuirse entre objetivos hasta que el periodo quede cerrado.`,
                [
                    "savings-current",
                    "goals-available-savings",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "savings-compare"
        ) {

            let comparisonText =
                "No ha cambiado respecto al mes anterior.";

            if (
                savingsDifference > 0
            ) {

                comparisonText =
                    `Ha mejorado ${
                        this.formatCurrency(
                            savingsDifference
                        )
                    }.`;

            } else if (
                savingsDifference < 0
            ) {

                comparisonText =
                    `Ha bajado ${
                        this.formatCurrency(
                            Math.abs(
                                savingsDifference
                            )
                        )
                    }.`;

            }

            return this.response(
                "Dato real",
                `Este mes llevas ${
                    this.formatCurrency(
                        savings
                    )
                } de ahorro frente a ${
                    this.formatCurrency(
                        previousSavings
                    )
                } el mes anterior. ${
                    comparisonText
                }`,
                [
                    "savings-rate",
                    "comparison-month",
                    "simulation-save-200"
                ]
            );

        }

        if (
            questionKey ===
            "savings-rate"
        ) {

            if (
                income === 0
            ) {

                return this.insufficient(
                    "No puedo calcular una tasa de ahorro representativa porque no hay ingresos registrados este mes.",
                    [
                        "income-current",
                        "savings-current"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Tu tasa de ahorro actual es del ${
                    this.formatPercent(
                        savingRate
                    )
                } sobre los ingresos registrados.`,
                [
                    "savings-compare",
                    "expenses-income-share",
                    "simulation-save-200"
                ]
            );

        }

        if (
            questionKey ===
            "savings-year"
        ) {

            const annualSavings =
                savings *
                12;

            return this.response(
                "Estimación",
                `Si mantuvieras durante doce meses el resultado actual, generarías aproximadamente ${
                    this.formatCurrency(
                        annualSavings
                    )
                }. Esta estimación replica el ahorro provisional del mes y no incorpora variaciones futuras.`,
                [
                    "savings-rate",
                    "simulation-save-200",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "expenses-top"
        ) {

            if (!topCategory) {

                return this.insufficient(
                    "No hay gastos positivos clasificados por categoría en el periodo actual.",
                    [
                        "expenses-change",
                        "income-current"
                    ]
                );

            }

            let text =
                `Tu categoría principal es ${
                    topCategory.category ||
                    topCategory.label ||
                    "Sin categoría"
                }, con ${
                    this.formatCurrency(
                        topCategory.amount
                    )
                }.`;

            if (secondCategory) {

                text +=
                    ` La segunda es ${
                        secondCategory.category ||
                        secondCategory.label ||
                        "Sin categoría"
                    }, con ${
                        this.formatCurrency(
                            secondCategory.amount
                        )
                    }.`;

            }

            return this.response(
                "Dato real",
                text,
                [
                    "expenses-income-share",
                    "expenses-change",
                    "simulation-top-20",
                    "expenses-budget"
                ]
            );

        }

        if (
            questionKey ===
            "expenses-change"
        ) {

            if (
                expenseDifference > 0
            ) {

                return this.response(
                    "Dato real",
                    `Tus gastos netos han aumentado ${
                        this.formatCurrency(
                            expenseDifference
                        )
                    }, pasando de ${
                        this.formatCurrency(
                            previousExpenses
                        )
                    } a ${
                        this.formatCurrency(
                            expenses
                        )
                    }.`,
                    [
                        "expenses-top",
                        "simulation-top-20",
                        "comparison-month"
                    ]
                );

            }

            if (
                expenseDifference < 0
            ) {

                return this.response(
                    "Dato real",
                    `Tus gastos netos se han reducido ${
                        this.formatCurrency(
                            Math.abs(
                                expenseDifference
                            )
                        )
                    }, pasando de ${
                        this.formatCurrency(
                            previousExpenses
                        )
                    } a ${
                        this.formatCurrency(
                            expenses
                        )
                    }.`,
                    [
                        "expenses-top",
                        "savings-compare",
                        "comparison-month"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Tus gastos netos son ${
                    this.formatCurrency(
                        expenses
                    )
                }, sin cambios frente al mes anterior.`,
                [
                    "expenses-top",
                    "expenses-income-share",
                    "expenses-budget"
                ]
            );

        }

        if (
            questionKey ===
            "expenses-income-share"
        ) {

            if (
                income <= 0
            ) {

                return this.insufficient(
                    "No puedo calcular qué porcentaje de tus ingresos se destina a gasto porque no hay ingresos positivos registrados.",
                    [
                        "income-current",
                        "expenses-top"
                    ]
                );

            }

            const percentage =
                expenses /
                income *
                100;

            return this.response(
                "Dato real",
                `Los gastos netos representan el ${
                    this.formatPercent(
                        percentage
                    )
                } de tus ingresos del mes.`,
                [
                    "savings-rate",
                    "expenses-top",
                    "simulation-top-20"
                ]
            );

        }

        if (
            questionKey ===
            "expenses-budget" ||
            questionKey ===
            "budget-status"
        ) {

            if (
                !summary.budget
            ) {

                return this.insufficient(
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

                return this.response(
                    "Dato real",
                    `Has superado el presupuesto en ${
                        this.formatCurrency(
                            Math.abs(
                                this.number(
                                    summary.budget
                                        .remaining
                                )
                            )
                        )
                    }.`,
                    [
                        "expenses-top",
                        "simulation-top-20",
                        "budget-risk"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `El presupuesto no está excedido. El margen restante es ${
                    this.formatCurrency(
                        this.number(
                            summary.budget
                                .remaining
                        )
                    )
                }.`,
                [
                    "budget-remaining",
                    "budget-risk",
                    "expenses-top"
                ]
            );

        }

        if (
            questionKey ===
            "income-current"
        ) {

            if (
                income === 0
            ) {

                return this.insufficient(
                    "No hay ingresos registrados en el periodo actual.",
                    [
                        "income-compare",
                        "expenses-top"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Has registrado ${
                    this.formatCurrency(
                        income
                    )
                } de ingresos este mes.`,
                [
                    "income-compare",
                    "income-stability",
                    "savings-rate"
                ]
            );

        }

        if (
            questionKey ===
            "income-compare"
        ) {

            if (
                incomeDifference > 0
            ) {

                return this.response(
                    "Dato real",
                    `Tus ingresos han aumentado ${
                        this.formatCurrency(
                            incomeDifference
                        )
                    } frente al mes anterior.`,
                    [
                        "income-stability",
                        "savings-compare",
                        "comparison-month"
                    ]
                );

            }

            if (
                incomeDifference < 0
            ) {

                return this.response(
                    "Dato real",
                    `Tus ingresos han bajado ${
                        this.formatCurrency(
                            Math.abs(
                                incomeDifference
                            )
                        )
                    } frente al mes anterior.`,
                    [
                        "simulation-income-minus-10",
                        "savings-compare",
                        "prediction-close"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `Tus ingresos son ${
                    this.formatCurrency(
                        income
                    )
                }, sin cambios frente al mes anterior.`,
                [
                    "income-stability",
                    "savings-rate"
                ]
            );

        }

        if (
            questionKey ===
            "income-stability"
        ) {

            if (
                income === 0 ||
                previousIncome === 0
            ) {

                return this.insufficient(
                    "Necesito ingresos registrados tanto en el mes actual como en el anterior para realizar una primera comparación de estabilidad.",
                    [
                        "income-current",
                        "income-compare"
                    ]
                );

            }

            const variation =
                Math.abs(
                    incomeDifference
                ) /
                Math.abs(
                    previousIncome
                ) *
                100;

            if (
                variation <= 10
            ) {

                return this.response(
                    "Estimación",
                    `La variación frente al mes anterior es del ${
                        this.formatPercent(
                            variation
                        )
                    }. Con esta comparación limitada, los ingresos parecen relativamente estables.`,
                    [
                        "income-compare",
                        "simulation-income-minus-10"
                    ]
                );

            }

            return this.response(
                "Estimación",
                `La variación frente al mes anterior es del ${
                    this.formatPercent(
                        variation
                    )
                }. Con solo dos periodos no puedo confirmar una tendencia estable.`,
                [
                    "income-compare",
                    "simulation-income-minus-10",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "liquidity-current"
        ) {

            let text =
                `Tu liquidez total actual es ${
                    this.formatCurrency(
                        liquidity
                    )
                }.`;

            if (
                liquidity < 0
            ) {

                text +=
                    " La liquidez negativa es válida en Atlas, pero indica que las obligaciones líquidas superan los saldos disponibles.";

            }

            return this.response(
                "Dato real",
                text,
                [
                    "liquidity-debt",
                    "liquidity-security",
                    "liquidity-invest"
                ]
            );

        }

        if (
            questionKey ===
            "liquidity-debt"
        ) {

            if (
                debt === 0
            ) {

                return this.response(
                    "Dato real",
                    `Tienes ${
                        this.formatCurrency(
                            liquidity
                        )
                    } de liquidez y no hay deuda pendiente registrada.`,
                    [
                        "liquidity-security",
                        "liquidity-invest",
                        "investments-current"
                    ]
                );

            }

            const difference =
                liquidity -
                debt;

            return this.response(
                "Dato real",
                difference >= 0
                    ? `Tu liquidez supera la deuda en ${
                        this.formatCurrency(
                            difference
                        )
                    }.`
                    : `Tu deuda supera la liquidez en ${
                        this.formatCurrency(
                            Math.abs(
                                difference
                            )
                        )
                    }.`,
                [
                    "debt-risk",
                    "liquidity-security",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            questionKey ===
            "liquidity-security"
        ) {

            if (
                expenses <= 0
            ) {

                return this.insufficient(
                    "No puedo estimar cuántos meses de gasto cubre tu liquidez porque no hay gastos mensuales positivos registrados.",
                    [
                        "liquidity-current",
                        "expenses-top"
                    ]
                );

            }

            const coveredMonths =
                liquidity /
                expenses;

            return this.response(
                "Estimación",
                `Tomando el gasto neto de este mes como referencia, tu liquidez cubriría aproximadamente ${
                    coveredMonths.toLocaleString(
                        "es-ES",
                        {
                            maximumFractionDigits:
                                1
                        }
                    )
                } meses. Esta cifra no sustituye un cálculo específico del fondo de emergencia.`,
                [
                    "liquidity-invest",
                    "liquidity-amortize",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "liquidity-invest"
        ) {

            if (
                liquidity <= 0
            ) {

                return this.response(
                    "Recomendación",
                    `Con una liquidez de ${
                        this.formatCurrency(
                            liquidity
                        )
                    }, no aumentaría las aportaciones hasta recuperar un margen líquido positivo.`,
                    [
                        "liquidity-security",
                        "simulation-invest-200",
                        "prediction-close"
                    ]
                );

            }

            if (
                expenses > 0 &&
                liquidity <
                    expenses *
                    3
            ) {

                return this.response(
                    "Recomendación",
                    "Tu liquidez no alcanza tres meses del gasto mensual actual. Antes de invertir más, priorizaría reforzar el fondo de seguridad.",
                    [
                        "liquidity-security",
                        "investments-liquidity",
                        "simulation-invest-200"
                    ]
                );

            }

            return this.response(
                "Recomendación",
                "La liquidez actual permite estudiar nuevas aportaciones, pero la decisión debería respetar tu fondo de seguridad y las obligaciones de deuda.",
                [
                    "liquidity-security",
                    "investments-liquidity",
                    "simulation-invest-200"
                ]
            );

        }

        if (
            questionKey ===
            "liquidity-amortize"
        ) {

            if (
                debt <= 0
            ) {

                return this.response(
                    "Dato real",
                    "No hay deuda pendiente registrada para amortizar.",
                    [
                        "liquidity-invest",
                        "investments-current"
                    ]
                );

            }

            if (
                liquidity <= 0
            ) {

                return this.response(
                    "Recomendación",
                    "No amortizaría deuda adicional con liquidez negativa o nula, salvo que exista una razón financiera urgente fuera de los datos registrados.",
                    [
                        "debt-risk",
                        "liquidity-security"
                    ]
                );

            }

            const possible =
                Math.min(
                    liquidity,
                    debt
                );

            return this.response(
                "Recomendación",
                `El máximo teórico sería ${
                    this.formatCurrency(
                        possible
                    )
                }, pero utilizar toda esa cantidad podría dejarte sin fondo de seguridad. Conviene reservar primero la liquidez necesaria para gastos y obligaciones próximas.`,
                [
                    "liquidity-security",
                    "debt-risk",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            questionKey ===
            "debt-current"
        ) {

            return this.response(
                "Dato real",
                `Tu deuda pendiente actual es ${
                    this.formatCurrency(
                        debt
                    )
                }. Este mes has registrado ${
                    this.formatCurrency(
                        debtPayments
                    )
                } en pagos de deuda, que reducen liquidez y deuda pero no se consideran gasto.`,
                [
                    "debt-risk",
                    "debt-change",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            questionKey ===
            "debt-risk"
        ) {

            if (
                debt <= 0
            ) {

                return this.response(
                    "Dato real",
                    "No hay deuda pendiente registrada.",
                    [
                        "liquidity-current",
                        "investments-current"
                    ]
                );

            }

            if (
                liquidity <= 0
            ) {

                return this.response(
                    "Recomendación",
                    `La combinación de ${
                        this.formatCurrency(
                            debt
                        )
                    } de deuda y ${
                        this.formatCurrency(
                            liquidity
                        )
                    } de liquidez requiere atención prioritaria.`,
                    [
                        "liquidity-current",
                        "liquidity-amortize",
                        "prediction-close"
                    ]
                );

            }

            const ratio =
                debt /
                liquidity *
                100;

            return this.response(
                "Dato real",
                `La deuda equivale al ${
                    this.formatPercent(
                        ratio
                    )
                } de tu liquidez actual.`,
                [
                    "liquidity-debt",
                    "liquidity-amortize",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            questionKey ===
            "debt-change"
        ) {

            return this.response(
                "Dato real",
                `Este mes has destinado ${
                    this.formatCurrency(
                        debtPayments
                    )
                } a pagos de deuda. Estos movimientos reducen la deuda y la liquidez, pero no afectan al gasto mensual.`,
                [
                    "debt-current",
                    "liquidity-current",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            questionKey ===
            "investments-current"
        ) {

            return this.response(
                "Dato real",
                `El valor actual registrado de tus inversiones es ${
                    this.formatCurrency(
                        investments
                    )
                }.`,
                [
                    "investments-month",
                    "investments-weight",
                    "investments-liquidity"
                ]
            );

        }

        if (
            questionKey ===
            "investments-month"
        ) {

            return this.response(
                "Dato real",
                `Este mes has aportado ${
                    this.formatCurrency(
                        monthlyInvested
                    )
                } a inversiones. Estas aportaciones reducen liquidez y aumentan inversión.`,
                [
                    "comparison-investments",
                    "investments-weight",
                    "simulation-invest-200"
                ]
            );

        }

        if (
            questionKey ===
            "investments-weight"
        ) {

            const grossAssets =
                liquidity +
                investments;

            if (
                grossAssets === 0
            ) {

                return this.insufficient(
                    "No puedo calcular el peso de las inversiones porque liquidez e inversiones suman cero.",
                    [
                        "investments-current",
                        "liquidity-current"
                    ]
                );

            }

            const weight =
                investments /
                grossAssets *
                100;

            return this.response(
                "Dato real",
                `Las inversiones representan el ${
                    this.formatPercent(
                        weight
                    )
                } de tus activos formados por liquidez e inversiones.`,
                [
                    "investments-liquidity",
                    "liquidity-security",
                    "simulation-invest-200"
                ]
            );

        }

        if (
            questionKey ===
            "investments-liquidity"
        ) {

            if (
                liquidity <= 0 &&
                monthlyInvested > 0
            ) {

                return this.response(
                    "Recomendación",
                    `Has invertido ${
                        this.formatCurrency(
                            monthlyInvested
                        )
                    } este mes mientras tu liquidez es ${
                        this.formatCurrency(
                            liquidity
                        )
                    }. Conviene priorizar la recuperación de liquidez.`,
                    [
                        "liquidity-current",
                        "liquidity-security",
                        "prediction-close"
                    ]
                );

            }

            if (
                expenses > 0 &&
                liquidity <
                    expenses *
                    3
            ) {

                return this.response(
                    "Recomendación",
                    "Tu liquidez cubre menos de tres meses del gasto actual. Revisaría el nivel de aportaciones antes de incrementarlo.",
                    [
                        "liquidity-security",
                        "simulation-invest-200",
                        "investments-month"
                    ]
                );

            }

            return this.response(
                "Recomendación",
                "No detecto una incompatibilidad inmediata entre inversión y liquidez, aunque debes mantener un fondo de seguridad adecuado.",
                [
                    "liquidity-security",
                    "investments-weight",
                    "simulation-invest-200"
                ]
            );

        }

        if (
            questionKey ===
            "goals-status"
        ) {

            return this.insufficient(
                "El resumen financiero utilizado por Atlas IA todavía no expone el detalle individual de cada objetivo. Puedo analizar el ahorro disponible, pero no calcular aún el progreso o la fecha prevista de un objetivo concreto.",
                [
                    "goals-available-savings",
                    "savings-status",
                    "savings-current"
                ]
            );

        }

        if (
            questionKey ===
            "goals-available-savings"
        ) {

            return this.response(
                "Dato real",
                "El ahorro del mes actual es provisional y no puede distribuirse. Solo el ahorro de periodos cerrados puede asignarse entre objetivos.",
                [
                    "savings-status",
                    "goals-priority",
                    "savings-current"
                ]
            );

        }

        if (
            questionKey ===
            "goals-priority"
        ) {

            return this.response(
                "Recomendación",
                "Para priorizar objetivos necesito considerar urgencia, importe pendiente y fecha deseada. El resumen actual no expone todavía esos datos individuales a Atlas IA.",
                [
                    "goals-status",
                    "goals-available-savings",
                    "status-priority"
                ]
            );

        }

        if (
            questionKey ===
            "prediction-close" ||
            questionKey ===
            "prediction-expenses" ||
            questionKey ===
            "prediction-negative" ||
            questionKey ===
            "prediction-save-500"
        ) {

            const prediction =
                this.prediction(
                    summary
                );

            if (!prediction) {

                return this.insufficient(
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

                return this.insufficient(
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

                return this.response(
                    "Estimación",
                    `Si mantienes el ritmo de gasto actual, podrías cerrar el mes con aproximadamente ${
                        this.formatCurrency(
                            prediction.projectedSavings
                        )
                    } de ahorro. La estimación proyecta los gastos registrados hasta hoy y mantiene sin cambios los demás componentes del resultado.`,
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

                return this.response(
                    "Estimación",
                    `El gasto neto proyectado al cierre es aproximadamente ${
                        this.formatCurrency(
                            prediction.projectedExpenses
                        )
                    }, frente a ${
                        this.formatCurrency(
                            prediction.currentExpenses
                        )
                    } registrados hasta ahora.`,
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

                return this.response(
                    "Estimación",
                    prediction.projectedSavings < 0
                        ? `Sí. Manteniendo el ritmo actual, el ahorro proyectado sería ${
                            this.formatCurrency(
                                prediction.projectedSavings
                            )
                        }.`
                        : `Con el ritmo actual, no se proyecta ahorro negativo. El cierre estimado sería ${
                            this.formatCurrency(
                                prediction.projectedSavings
                            )
                        }.`,
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

            return this.response(
                "Estimación",
                required <= 0
                    ? `La proyección ya supera los 500 € de ahorro en ${
                        this.formatCurrency(
                            Math.abs(
                                required
                            )
                        )
                    }.`
                    : `Para cerrar con 500 € de ahorro necesitarías mejorar el resultado proyectado en ${
                        this.formatCurrency(
                            required
                        )
                    }, reduciendo gastos o aumentando ingresos.`,
                [
                    "simulation-top-20",
                    "simulation-save-200",
                    "prediction-expenses"
                ]
            );

        }

        if (
            questionKey ===
            "comparison-month"
        ) {

            return this.response(
                "Dato real",
                `Frente al mes anterior, los ingresos ${
                    incomeDifference > 0
                        ? `han aumentado ${
                            this.formatCurrency(
                                incomeDifference
                            )
                        }`
                        : incomeDifference < 0
                            ? `han bajado ${
                                this.formatCurrency(
                                    Math.abs(
                                        incomeDifference
                                    )
                                )
                            }`
                            : "no han cambiado"
                }, los gastos ${
                    expenseDifference > 0
                        ? `han aumentado ${
                            this.formatCurrency(
                                expenseDifference
                            )
                        }`
                        : expenseDifference < 0
                            ? `se han reducido ${
                                this.formatCurrency(
                                    Math.abs(
                                        expenseDifference
                                    )
                                )
                            }`
                            : "no han cambiado"
                } y el ahorro ${
                    savingsDifference > 0
                        ? `ha mejorado ${
                            this.formatCurrency(
                                savingsDifference
                            )
                        }`
                        : savingsDifference < 0
                            ? `ha bajado ${
                                this.formatCurrency(
                                    Math.abs(
                                        savingsDifference
                                    )
                                )
                            }`
                            : "no ha cambiado"
                }.`,
                [
                    "comparison-savings",
                    "comparison-expenses",
                    "comparison-income",
                    "comparison-investments"
                ]
            );

        }

        if (
            questionKey ===
            "comparison-savings"
        ) {

            return this.answerQuestion(
                "savings-compare",
                summary
            );

        }

        if (
            questionKey ===
            "comparison-expenses"
        ) {

            return this.answerQuestion(
                "expenses-change",
                summary
            );

        }

        if (
            questionKey ===
            "comparison-income"
        ) {

            return this.answerQuestion(
                "income-compare",
                summary
            );

        }

        if (
            questionKey ===
            "comparison-investments"
        ) {

            let text =
                "Las aportaciones no han cambiado frente al mes anterior.";

            if (
                investedDifference > 0
            ) {

                text =
                    `Has invertido ${
                        this.formatCurrency(
                            investedDifference
                        )
                    } más que el mes anterior.`;

            } else if (
                investedDifference < 0
            ) {

                text =
                    `Has invertido ${
                        this.formatCurrency(
                            Math.abs(
                                investedDifference
                            )
                        )
                    } menos que el mes anterior.`;

            }

            return this.response(
                "Dato real",
                text,
                [
                    "investments-month",
                    "investments-liquidity",
                    "simulation-invest-200"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-top-20"
        ) {

            if (!topCategory) {

                return this.insufficient(
                    "No hay una categoría principal positiva sobre la que aplicar la simulación.",
                    [
                        "expenses-top",
                        "simulation-save-200"
                    ]
                );

            }

            const reduction =
                this.number(
                    topCategory.amount
                ) *
                0.2;

            const simulatedSavings =
                savings +
                reduction;

            return this.response(
                "Simulación",
                `Reducir un 20 % ${
                    topCategory.category ||
                    topCategory.label ||
                    "tu categoría principal"
                } liberaría ${
                    this.formatCurrency(
                        reduction
                    )
                }. Tu ahorro mensual pasaría de ${
                    this.formatCurrency(
                        savings
                    )
                } a aproximadamente ${
                    this.formatCurrency(
                        simulatedSavings
                    )
                }.`,
                [
                    "expenses-top",
                    "savings-rate",
                    "simulation-save-200",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-save-200"
        ) {

            return this.response(
                "Simulación",
                `Mejorar tu resultado en 200 € mensuales elevaría el ahorro de ${
                    this.formatCurrency(
                        savings
                    )
                } a ${
                    this.formatCurrency(
                        savings +
                        200
                    )
                }. En doce meses supondría ${
                    this.formatCurrency(
                        2400
                    )
                } adicionales.`,
                [
                    "savings-rate",
                    "savings-year",
                    "simulation-top-20"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-invest-200"
        ) {

            return this.response(
                "Simulación",
                `Una aportación adicional de 200 € reduciría tu liquidez de ${
                    this.formatCurrency(
                        liquidity
                    )
                } a ${
                    this.formatCurrency(
                        liquidity -
                        200
                    )
                } y elevaría tus inversiones de ${
                    this.formatCurrency(
                        investments
                    )
                } a ${
                    this.formatCurrency(
                        investments +
                        200
                    )
                }. No sería un gasto, pero sí reduciría el ahorro mensual disponible en 200 €.`,
                [
                    "investments-liquidity",
                    "liquidity-security",
                    "prediction-close"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-income-minus-10"
        ) {

            if (
                income <= 0
            ) {

                return this.insufficient(
                    "No hay ingresos positivos sobre los que aplicar una reducción del 10 %.",
                    [
                        "income-current",
                        "income-compare"
                    ]
                );

            }

            const reduction =
                income *
                0.1;

            return this.response(
                "Simulación",
                `Una bajada del 10 % reduciría tus ingresos en ${
                    this.formatCurrency(
                        reduction
                    )
                }, hasta ${
                    this.formatCurrency(
                        income -
                        reduction
                    )
                }. Manteniendo el resto igual, el ahorro bajaría a ${
                    this.formatCurrency(
                        savings -
                        reduction
                    )
                }.`,
                [
                    "income-stability",
                    "prediction-close",
                    "simulation-top-20"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-unexpected-1000"
        ) {

            return this.response(
                "Simulación",
                `Un gasto inesperado de 1.000 € reduciría el ahorro mensual de ${
                    this.formatCurrency(
                        savings
                    )
                } a ${
                    this.formatCurrency(
                        savings -
                        1000
                    )
                }. Si se pagara con liquidez, esta también bajaría hasta ${
                    this.formatCurrency(
                        liquidity -
                        1000
                    )
                }.`,
                [
                    "liquidity-security",
                    "prediction-close",
                    "simulation-save-200"
                ]
            );

        }

        if (
            questionKey ===
            "simulation-debt-500"
        ) {

            if (
                debt <= 0
            ) {

                return this.response(
                    "Dato real",
                    "No hay deuda pendiente sobre la que aplicar la simulación.",
                    [
                        "liquidity-current",
                        "investments-current"
                    ]
                );

            }

            const payment =
                Math.min(
                    500,
                    debt
                );

            return this.response(
                "Simulación",
                `Amortizar ${
                    this.formatCurrency(
                        payment
                    )
                } reduciría la deuda a ${
                    this.formatCurrency(
                        debt -
                        payment
                    )
                } y la liquidez a ${
                    this.formatCurrency(
                        liquidity -
                        payment
                    )
                }. El pago no se consideraría gasto.`,
                [
                    "liquidity-security",
                    "debt-risk",
                    "liquidity-amortize"
                ]
            );

        }

        if (
            questionKey ===
            "budget-remaining"
        ) {

            if (
                !summary.budget
            ) {

                return this.insufficient(
                    "No hay un resumen de presupuesto disponible para este periodo.",
                    [
                        "expenses-top",
                        "expenses-change"
                    ]
                );

            }

            return this.response(
                "Dato real",
                `El margen restante del presupuesto es ${
                    this.formatCurrency(
                        this.number(
                            summary.budget
                                .remaining
                        )
                    )
                }.`,
                [
                    "budget-status",
                    "budget-risk",
                    "expenses-top"
                ]
            );

        }

        if (
            questionKey ===
            "budget-risk"
        ) {

            if (
                !summary.budget
            ) {

                return this.insufficient(
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

                return this.response(
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
                    summary.budget
                        .remaining
                );

            return this.response(
                "Recomendación",
                remaining <= 0
                    ? "No queda margen presupuestario disponible."
                    : `Todavía quedan ${
                        this.formatCurrency(
                            remaining
                        )
                    }. Conviene compararlo con los gastos pendientes antes de asumir nuevas compras.`,
                [
                    "budget-remaining",
                    "prediction-expenses",
                    "expenses-top"
                ]
            );

        }

        if (
            questionKey ===
            "recurring-status"
        ) {

            return this.insufficient(
                "Atlas IA todavía no recibe el detalle de cada movimiento recurrente desde este resumen. La integración completa permitirá identificar próximos cobros y pagos sin inventar información.",
                [
                    "prediction-close",
                    "prediction-expenses"
                ]
            );

        }

        if (
            questionKey ===
            "recurring-prediction"
        ) {

            return this.insufficient(
                "La predicción actual utiliza el ritmo de gasto registrado, pero todavía no incorpora de forma individual los movimientos recurrentes pendientes.",
                [
                    "prediction-close",
                    "prediction-expenses",
                    "recurring-status"
                ]
            );

        }

        return this.response(
            "Dato real",
            this.mainMessage(
                summary
            ),
            [
                "status-overview",
                "savings-current",
                "expenses-top"
            ]
        );

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

    pushNavigation() {

        this.state.navigation.push({

            view:
                this.state.view,

            currentTheme:
                this.state.currentTheme,

            currentQuestion:
                this.state.currentQuestion,

            themePage:
                this.state.themePage

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
            answer.followUps;

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
            this.state.navigation
                .pop();

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

    },

    resetConversation() {

        this.state = {

            initialized:
                false,

            messages:
                [],

            currentTheme:
                null,

            currentQuestion:
                null,

            view:
                "themes",

            themePage:
                0,

            navigation:
                []

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
                    justify-content:
                        ${
                            isUser
                                ? "flex-end"
                                : "flex-start"
                        };
                    margin-bottom:12px;
                "
            >

                <div
                    style="
                        max-width:88%;
                        padding:13px 14px;
                        border:
                            1px solid
                            ${
                                isUser
                                    ? "rgba(217,180,95,0.24)"
                                    : "rgba(145,164,202,0.16)"
                            };
                        border-radius:
                            ${
                                isUser
                                    ? "16px 16px 5px 16px"
                                    : "16px 16px 16px 5px"
                            };
                        color:#f7f8fc;
                        background:
                            ${
                                isUser
                                    ? "rgba(217,180,95,0.1)"
                                    : "rgba(145,164,202,0.07)"
                            };
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
                                        letter-spacing:0.08em;
                                        text-transform:uppercase;
                                    "
                                >
                                    ${this.escape(
                                        message.type
                                    )}
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
                        ${this.escape(
                            message.text
                        )}
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
                data-ai-action="${action}"
                data-ai-value="${value || ""}"
                style="
                    width:100%;
                    min-height:47px;
                    padding:11px 13px;
                    border:
                        1px solid
                        ${
                            secondary
                                ? "rgba(145,164,202,0.18)"
                                : "rgba(217,180,95,0.22)"
                        };
                    border-radius:14px;
                    color:
                        ${
                            secondary
                                ? "var(--color-text-muted)"
                                : "#f7f8fc"
                        };
                    background:
                        ${
                            secondary
                                ? "rgba(145,164,202,0.05)"
                                : "rgba(217,180,95,0.07)"
                        };
                    font-size:13px;
                    font-weight:700;
                    line-height:1.35;
                    text-align:left;
                "
            >
                ${this.escape(
                    label
                )}
            </button>

        `;

    },

    renderThemeOptions(summary) {

        const themes =
            this.themes(
                summary
            );

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
                page *
                pageSize,
                page *
                pageSize +
                pageSize
            );

        return `

            <div
                style="
                    margin-top:14px;
                    padding-top:14px;
                    border-top:
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
                        margin-bottom:10px;
                        color:
                            var(
                                --color-text-muted
                            );
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
                            .map(
                                theme => `

                                    <button
                                        type="button"
                                        data-ai-action="theme"
                                        data-ai-value="${theme.key}"
                                        style="
                                            width:100%;
                                            padding:13px;
                                            border:
                                                1px solid
                                                rgba(
                                                    217,
                                                    180,
                                                    95,
                                                    0.18
                                                );
                                            border-radius:15px;
                                            color:#f7f8fc;
                                            background:
                                                rgba(
                                                    217,
                                                    180,
                                                    95,
                                                    0.06
                                                );
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
                                                ${theme.icon}
                                            </span>

                                            <div>

                                                <strong
                                                    style="
                                                        display:block;
                                                        font-size:13px;
                                                    "
                                                >
                                                    ${this.escape(
                                                        theme.label
                                                    )}
                                                </strong>

                                                <span
                                                    style="
                                                        display:block;
                                                        margin-top:4px;
                                                        color:
                                                            var(
                                                                --color-text-muted
                                                            );
                                                        font-size:11px;
                                                        line-height:1.4;
                                                    "
                                                >
                                                    ${this.escape(
                                                        theme.description
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </button>

                                `
                            )
                            .join("")
                    }

                </div>

                ${
                    totalPages > 1
                        ? `

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
                                    gap:8px;
                                    margin-top:9px;
                                "
                            >

                                ${
                                    page > 0
                                        ? this.renderActionButton(
                                            "theme-page",
                                            String(
                                                page - 1
                                            ),
                                            "← Temas anteriores",
                                            true
                                        )
                                        : "<div></div>"
                                }

                                ${
                                    page <
                                    totalPages - 1
                                        ? this.renderActionButton(
                                            "theme-page",
                                            String(
                                                page + 1
                                            ),
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

    renderQuestionOptions(
        summary
    ) {

        const theme =
            this.themeByKey(
                this.state
                    .currentTheme,
                summary
            );

        const questions =
            this.questionsForTheme(
                this.state
                    .currentTheme,
                summary
            );

        return `

            <div
                style="
                    margin-top:14px;
                    padding-top:14px;
                    border-top:
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
                        margin-bottom:10px;
                        color:
                            var(
                                --color-text-muted
                            );
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
                            .map(
                                question =>
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
                        this.state.navigation
                            .length > 0
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
                    border-top:
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
                        margin-bottom:10px;
                        color:
                            var(
                                --color-text-muted
                            );
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
                            .map(
                                questionKey =>
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
                        this.state.navigation
                            .length > 0
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

    renderConversation(
        summary
    ) {

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
                            .map(
                                message =>
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
                        color:
                            var(
                                --color-text-muted
                            );
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

        requestAnimationFrame(
            () => {

                const messages =
                    document.getElementById(
                        "atlas-ai-messages"
                    );

                if (messages) {

                    messages.scrollTop =
                        messages.scrollHeight;

                }

            }
        );

    },

    render(data) {

        this.data =
            data;

        this.initializeConversation();

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
                        ${this.renderConversation(
                            summary
                        )}
                    </div>

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
                        "[data-ai-action]"
                    );

                if (!button) {

                    return;

                }

                const action =
                    button.dataset
                        .aiAction;

                const value =
                    button.dataset
                        .aiValue;

                if (
                    !this.data
                ) {

                    return;

                }

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
                        this.number(
                            value
                        );

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
                .render(
                    data
                );

        };

    AtlasLocalAI.bindEvents();

})();

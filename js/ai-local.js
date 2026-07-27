answerQuestion(
    questionKey,
    summary
) {

    const reasoning =
        AtlasAIAnalysis
            .reason(
                summary,
                this,
                questionKey
            );

    const metrics =
        reasoning.metrics;

    const differences =
        reasoning.differences;

    const categories =
        reasoning.categories;

    const income =
        metrics.income;

    const expenses =
        metrics.expenses;

    const savings =
        metrics.savings;

    const savingRate =
        metrics.savingRate;

    const liquidity =
        metrics.liquidity;

    const debt =
        metrics.debt;

    const investments =
        metrics.investments;

    const monthlyInvested =
        metrics.monthlyInvested;

    const debtPayments =
        metrics.debtPayments;

    const previousIncome =
        metrics.previousIncome;

    const previousExpenses =
        metrics.previousExpenses;

    const previousSavings =
        metrics.previousSavings;

    const previousInvested =
        metrics.previousInvested;

    const savingsDifference =
        differences.savings;

    const incomeDifference =
        differences.income;

    const expenseDifference =
        differences.expenses;

    const investedDifference =
        differences.investments;

    const topCategory =
        categories.top
            ?.raw ||
        null;

    const secondCategory =
        categories.second
            ?.raw ||
        null;

    const netWorth =
        metrics.netWorth;

    if (
        questionKey ===
        "status-overview"
    ) {

        if (
            !reasoning.hasFinancialData
        ) {

            return this.insufficient(
                "Todavía no hay suficientes movimientos o saldos registrados para realizar un diagnóstico financiero completo.",
                [
                    "income-current",
                    "expenses-top"
                ]
            );

        }

        const healthLabels = {

            danger:
                "delicada",

            warning:
                "estable, aunque presenta aspectos que requieren atención",

            neutral:
                "equilibrada",

            good:
                "buena",

            excellent:
                "muy buena"

        };

        let text =
            `Tu situación financiera es ${
                healthLabels[
                    reasoning.health
                ] ||
                healthLabels.neutral
            }. Tu patrimonio neto calculado es ${
                this.formatCurrency(
                    netWorth
                )
            }, formado por ${
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
            } de deuda.`;

        if (
            reasoning.focus
        ) {

            text +=
                ` El principal aspecto que Atlas ha identificado es: ${
                    reasoning.focus
                        .title
                        .toLocaleLowerCase(
                            "es-ES"
                        )
                }.`;

        } else if (
            reasoning.strengths
                .length > 0
        ) {

            text +=
                ` Tu principal fortaleza es ${
                    reasoning.strengths[0]
                        .title
                        .toLocaleLowerCase(
                            "es-ES"
                        )
                }.`;

        }

        const positiveTrend =
            reasoning.trends
                .find(
                    trend =>
                        trend.impact ===
                        "positive"
                );

        const negativeTrend =
            reasoning.trends
                .find(
                    trend =>
                        trend.impact ===
                        "negative"
                );

        if (
            negativeTrend
        ) {

            text +=
                ` Frente al periodo anterior, ${
                    negativeTrend
                        .title
                        .toLocaleLowerCase(
                            "es-ES"
                        )
                }.`;

        } else if (
            positiveTrend
        ) {

            text +=
                ` Frente al periodo anterior, ${
                    positiveTrend
                        .title
                        .toLocaleLowerCase(
                            "es-ES"
                        )
                }.`;

        }

        return this.response(
            "Diagnóstico",
            text,
            [
                "status-improved",
                "status-worsened",
                "status-weakness",
                "status-priority"
            ],
            {
                reasoningHealth:
                    reasoning.health,

                reasoningFocus:
                    reasoning.focus
                        ?.key ||
                    null
            }
        );

    }

    if (
        questionKey ===
        "status-improved"
    ) {

        const improvements =
            reasoning.trends
                .filter(
                    trend =>
                        trend.impact ===
                        "positive"
                );

        const relevantStrengths =
            reasoning.strengths
                .filter(
                    strength =>
                        strength.key ===
                            "strong-saving-rate" ||
                        strength.key ===
                            "positive-saving-rate" ||
                        strength.key ===
                            "security-buffer" ||
                        strength.key ===
                            "no-debt"
                );

        const improvementTexts = [];

        improvements.forEach(
            improvement => {

                if (
                    improvement.key ===
                    "savings-up"
                ) {

                    improvementTexts.push(
                        `el ahorro ha mejorado ${
                            this.formatCurrency(
                                improvement.value
                            )
                        }`
                    );

                } else if (
                    improvement.key ===
                    "expenses-down"
                ) {

                    improvementTexts.push(
                        `los gastos se han reducido ${
                            this.formatCurrency(
                                Math.abs(
                                    improvement.value
                                )
                            )
                        }`
                    );

                } else if (
                    improvement.key ===
                    "income-up"
                ) {

                    improvementTexts.push(
                        `los ingresos han aumentado ${
                            this.formatCurrency(
                                improvement.value
                            )
                        }`
                    );

                } else if (
                    improvement.key ===
                    "investments-up"
                ) {

                    improvementTexts.push(
                        `las aportaciones a inversión han aumentado ${
                            this.formatCurrency(
                                improvement.value
                            )
                        }`
                    );

                }

            }
        );

        if (
            improvementTexts.length ===
                0 &&
            relevantStrengths.length ===
                0
        ) {

            return this.response(
                "Diagnóstico",
                "No detecto una mejora clara frente al periodo anterior con los indicadores disponibles.",
                [
                    "status-worsened",
                    "comparison-month",
                    "status-priority"
                ]
            );

        }

        let text = "";

        if (
            improvementTexts.length >
            0
        ) {

            text =
                `Respecto al periodo anterior, ${
                    improvementTexts.join(
                        ", "
                    )
                }.`;

        }

        if (
            relevantStrengths.length >
            0
        ) {

            const strengthTexts =
                relevantStrengths
                    .map(
                        strength =>
                            strength.title
                                .toLocaleLowerCase(
                                    "es-ES"
                                )
                    );

            text += `${
                text
                    ? " "
                    : ""
            }Además, Atlas identifica como fortalezas ${
                strengthTexts.join(
                    " y "
                )
            }.`;

        }

        return this.response(
            "Diagnóstico",
            text,
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

        const declines =
            reasoning.trends
                .filter(
                    trend =>
                        trend.impact ===
                            "negative" ||
                        trend.impact ===
                            "warning"
                );

        const declineTexts = [];

        declines.forEach(
            decline => {

                if (
                    decline.key ===
                    "savings-down"
                ) {

                    declineTexts.push(
                        `el ahorro ha bajado ${
                            this.formatCurrency(
                                Math.abs(
                                    decline.value
                                )
                            )
                        }`
                    );

                } else if (
                    decline.key ===
                    "expenses-up"
                ) {

                    declineTexts.push(
                        `los gastos han aumentado ${
                            this.formatCurrency(
                                decline.value
                            )
                        }`
                    );

                } else if (
                    decline.key ===
                    "income-down"
                ) {

                    declineTexts.push(
                        `los ingresos han bajado ${
                            this.formatCurrency(
                                Math.abs(
                                    decline.value
                                )
                            )
                        }`
                    );

                } else if (
                    decline.key ===
                    "investments-up" &&
                    decline.impact ===
                    "warning"
                ) {

                    declineTexts.push(
                        `las aportaciones han aumentado ${
                            this.formatCurrency(
                                decline.value
                            )
                        } con un margen de liquidez reducido`
                    );

                }

            }
        );

        reasoning.risks
            .forEach(
                risk => {

                    if (
                        risk.key ===
                            "negative-liquidity" &&
                        !declineTexts.some(
                            text =>
                                text.includes(
                                    "liquidez"
                                )
                        )
                    ) {

                        declineTexts.push(
                            `la liquidez se encuentra en ${
                                this.formatCurrency(
                                    risk.value
                                )
                            }`
                        );

                    }

                    if (
                        risk.key ===
                            "budget-exceeded"
                    ) {

                        declineTexts.push(
                            `el presupuesto se ha superado en ${
                                this.formatCurrency(
                                    risk.value
                                )
                            }`
                        );

                    }

                    if (
                        risk.key ===
                            "debt-above-liquidity"
                    ) {

                        declineTexts.push(
                            `la deuda supera la liquidez en ${
                                this.formatCurrency(
                                    risk.value
                                )
                            }`
                        );

                    }

                }
            );

        const uniqueDeclines =
            AtlasAIAnalysis
                .unique(
                    declineTexts
                );

        if (
            uniqueDeclines.length ===
            0
        ) {

            return this.response(
                "Diagnóstico",
                "No detecto un empeoramiento principal frente al periodo anterior con los datos disponibles.",
                [
                    "status-improved",
                    "status-weakness",
                    "comparison-month"
                ]
            );

        }

        return this.response(
            "Diagnóstico",
            `Los principales puntos negativos son que ${
                uniqueDeclines.join(
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

        const weakness =
            reasoning.weaknesses[0] ||
            reasoning.risks[0] ||
            null;

        if (!weakness) {

            return this.response(
                "Diagnóstico",
                "No detecto un punto crítico principal. Mantendría bajo vigilancia la evolución del ahorro, la liquidez y la categoría de gasto más elevada.",
                [
                    "savings-current",
                    "liquidity-current",
                    "expenses-top"
                ]
            );

        }

        if (
            weakness.key ===
            "negative-liquidity"
        ) {

            return this.response(
                "Diagnóstico",
                `Tu punto más débil es la liquidez, que actualmente es ${
                    this.formatCurrency(
                        metrics.liquidity
                    )
                }. Conviene recuperar un margen líquido positivo antes de aumentar nuevas aportaciones a inversión.`,
                [
                    "liquidity-current",
                    "prediction-close",
                    "simulation-save-200"
                ]
            );

        }

        if (
            weakness.key ===
            "negative-savings"
        ) {

            let text =
                `Tu punto más débil es el resultado mensual: el ahorro provisional es ${
                    this.formatCurrency(
                        metrics.savings
                    )
                }.`;

            if (
                categories.top
            ) {

                text +=
                    ` La categoría con mayor gasto es ${
                        categories.top.name
                    }, con ${
                        this.formatCurrency(
                            categories.top.amount
                        )
                    }, por lo que es el primer lugar que revisaría.`;

            } else {

                text +=
                    " La prioridad debería ser identificar qué gastos están provocando el déficit.";

            }

            return this.response(
                "Diagnóstico",
                text,
                [
                    "expenses-top",
                    "expenses-change",
                    "simulation-top-20"
                ]
            );

        }

        if (
            weakness.key ===
            "budget-exceeded"
        ) {

            return this.response(
                "Diagnóstico",
                `Tu punto más débil es el presupuesto, que se ha superado en ${
                    this.formatCurrency(
                        weakness.value
                    )
                }. Conviene revisar las categorías con mayor gasto antes de asumir nuevas compras.`,
                [
                    "budget-status",
                    "expenses-top",
                    "simulation-top-20"
                ]
            );

        }

        if (
            weakness.key ===
            "debt-above-liquidity"
        ) {

            return this.response(
                "Diagnóstico",
                `Tu principal debilidad es el desequilibrio entre deuda y liquidez. La deuda supera la liquidez en ${
                    this.formatCurrency(
                        metrics.debt -
                        metrics.liquidity
                    )
                }.`,
                [
                    "debt-risk",
                    "liquidity-debt",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            weakness.key ===
            "low-security-buffer"
        ) {

            return this.response(
                "Diagnóstico",
                `Tu fondo de seguridad es reducido. Con el gasto actual, la liquidez cubriría aproximadamente ${
                    metrics.securityMonths
                        .toLocaleString(
                            "es-ES",
                            {
                                maximumFractionDigits:
                                    1
                            }
                        )
                } meses.`,
                [
                    "liquidity-security",
                    "expenses-top",
                    "simulation-save-200"
                ]
            );

        }

        if (
            weakness.key ===
            "low-saving-rate"
        ) {

            return this.response(
                "Diagnóstico",
                `Tu tasa de ahorro es del ${
                    this.formatPercent(
                        metrics.savingRate
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
            "Diagnóstico",
            `El principal punto débil detectado es ${
                weakness.title
                    .toLocaleLowerCase(
                        "es-ES"
                    )
            }.`,
            [
                "status-priority",
                "comparison-month",
                "expenses-top"
            ]
        );

    }

    if (
        questionKey ===
        "status-priority"
    ) {

        const priority =
            reasoning.priorities[0] ||
            reasoning.opportunities[0] ||
            null;

        if (!priority) {

            return this.response(
                "Recomendación",
                "No detecto una prioridad crítica. Mantendría actualizado el registro y revisaría periódicamente el ahorro, la liquidez y los principales gastos.",
                [
                    "status-weakness",
                    "expenses-top",
                    "prediction-close"
                ]
            );

        }

        if (
            priority.key ===
            "negative-liquidity"
        ) {

            return this.response(
                "Recomendación",
                `Lo primero que revisaría es la liquidez. Actualmente se sitúa en ${
                    this.formatCurrency(
                        metrics.liquidity
                    )
                }, por lo que evitaría aumentar inversiones o asumir nuevos compromisos hasta recuperar un margen positivo.`,
                [
                    "liquidity-current",
                    "liquidity-security",
                    "prediction-close"
                ]
            );

        }

        if (
            priority.key ===
                "expenses-above-income" ||
            priority.key ===
                "negative-savings"
        ) {

            let text =
                `La prioridad es corregir el resultado mensual, que actualmente es ${
                    this.formatCurrency(
                        metrics.savings
                    )
                }.`;

            if (
                categories.top
            ) {

                text +=
                    ` Empezaría revisando ${
                        categories.top.name
                    }, que concentra ${
                        this.formatCurrency(
                            categories.top.amount
                        )
                    } de gasto.`;

            }

            return this.response(
                "Recomendación",
                text,
                [
                    "expenses-top",
                    "expenses-change",
                    "simulation-top-20"
                ]
            );

        }

        if (
            priority.key ===
            "budget-exceeded"
        ) {

            return this.response(
                "Recomendación",
                `La primera prioridad es contener el presupuesto. Está superado en ${
                    this.formatCurrency(
                        priority.value
                    )
                }, por lo que revisaría los gastos pendientes y la categoría principal antes de realizar nuevas compras.`,
                [
                    "budget-status",
                    "expenses-top",
                    "simulation-top-20"
                ]
            );

        }

        if (
            priority.key ===
            "savings-down"
        ) {

            return this.response(
                "Recomendación",
                `Revisaría primero la caída del ahorro, que ha empeorado ${
                    this.formatCurrency(
                        Math.abs(
                            priority.value
                        )
                    )
                } frente al periodo anterior. Conviene comprobar si se debe a un aumento de gastos, una bajada de ingresos o ambos factores.`,
                [
                    "status-worsened",
                    "expenses-change",
                    "income-compare"
                ]
            );

        }

        if (
            priority.key ===
            "expenses-up"
        ) {

            let text =
                `Revisaría primero el aumento de gastos, que asciende a ${
                    this.formatCurrency(
                        priority.value
                    )
                } frente al periodo anterior.`;

            if (
                categories.top
            ) {

                text +=
                    ` La categoría principal es ${
                        categories.top.name
                    }, con ${
                        this.formatCurrency(
                            categories.top.amount
                        )
                    }.`;

            }

            return this.response(
                "Recomendación",
                text,
                [
                    "expenses-top",
                    "expenses-change",
                    "simulation-top-20"
                ]
            );

        }

        if (
            priority.key ===
            "debt-above-liquidity"
        ) {

            return this.response(
                "Recomendación",
                `La primera prioridad es revisar la relación entre deuda y liquidez. La deuda supera la liquidez en ${
                    this.formatCurrency(
                        metrics.debt -
                        metrics.liquidity
                    )
                }.`,
                [
                    "debt-risk",
                    "liquidity-debt",
                    "simulation-debt-500"
                ]
            );

        }

        if (
            priority.key ===
            "low-security-buffer"
        ) {

            return this.response(
                "Recomendación",
                `Priorizaría reforzar el fondo de seguridad. La liquidez cubre aproximadamente ${
                    metrics.securityMonths
                        .toLocaleString(
                            "es-ES",
                            {
                                maximumFractionDigits:
                                    1
                            }
                        )
                } meses del gasto actual.`,
                [
                    "liquidity-security",
                    "simulation-save-200",
                    "expenses-top"
                ]
            );

        }

        if (
            priority.key ===
            "low-saving-rate" ||
            priority.key ===
            "improve-saving-rate"
        ) {

            return this.response(
                "Recomendación",
                `La prioridad es mejorar la tasa de ahorro, que actualmente es del ${
                    this.formatPercent(
                        metrics.savingRate
                    )
                }. Una reducción moderada en las categorías principales tendría impacto directo sobre este indicador.`,
                [
                    "savings-rate",
                    "expenses-top",
                    "simulation-top-20"
                ]
            );

        }

        if (
            priority.key ===
            "review-top-category"
        ) {

            return this.response(
                "Recomendación",
                categories.top
                    ? `Revisaría primero ${
                        categories.top.name
                    }, que es tu categoría principal con ${
                        this.formatCurrency(
                            categories.top.amount
                        )
                    }. Una reducción del 20 % liberaría aproximadamente ${
                        this.formatCurrency(
                            categories.top
                                .amount *
                            0.2
                        )
                    }.`
                    : "Revisaría primero la categoría con mayor gasto.",
                [
                    "expenses-top",
                    "simulation-top-20",
                    "expenses-budget"
                ]
            );

        }

        return this.response(
            "Recomendación",
            `Lo primero que revisaría es ${
                priority.title
                    .toLocaleLowerCase(
                        "es-ES"
                    )
            }.`,
            [
                "status-weakness",
                "comparison-month",
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

        const isCurrentMonth =
            summary.monthKey ===
            this.currentMonthKey();

        return this.response(
            "Dato real",
            isCurrentMonth
                ? `El ahorro de ${
                    summary.monthKey
                } es provisional mientras el mes permanezca abierto. No puede distribuirse entre objetivos hasta que el periodo quede cerrado.`
                : `El periodo ${
                    summary.monthKey
                } es un periodo anterior. Su ahorro puede considerarse cerrado si Atlas ya ha ejecutado el cierre correspondiente.`,
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
            `En ${
                this.monthLabel(
                    summary.monthKey
                )
            } llevas ${
                this.formatCurrency(
                    savings
                )
            } de ahorro frente a ${
                this.formatCurrency(
                    previousSavings
                )
            } en ${
                this.monthLabel(
                    summary.previousMonthKey
                )
            }. ${
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
                "No puedo calcular una tasa de ahorro representativa porque no hay ingresos registrados en este periodo.",
                [
                    "income-current",
                    "savings-current"
                ]
            );

        }

        return this.response(
            "Dato real",
            `Tu tasa de ahorro es del ${
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
            `Si mantuvieras durante doce meses el resultado de ${
                this.monthLabel(
                    summary.monthKey
                )
            }, generarías aproximadamente ${
                this.formatCurrency(
                    annualSavings
                )
            }. Esta estimación replica el resultado del periodo y no incorpora variaciones futuras.`,
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
                "No hay gastos positivos clasificados por categoría en el periodo analizado.",
                [
                    "expenses-change",
                    "income-current"
                ]
            );

        }

        let text =
            `En ${
                this.monthLabel(
                    summary.monthKey
                )
            }, tu categoría principal es ${
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
                } en ${
                    this.monthLabel(
                        summary.previousMonthKey
                    )
                } a ${
                    this.formatCurrency(
                        expenses
                    )
                } en ${
                    this.monthLabel(
                        summary.monthKey
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
                } en ${
                    this.monthLabel(
                        summary.previousMonthKey
                    )
                } a ${
                    this.formatCurrency(
                        expenses
                    )
                } en ${
                    this.monthLabel(
                        summary.monthKey
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
            }, sin cambios frente al periodo anterior.`,
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

        return this.response(
            "Dato real",
            `Los gastos netos representan el ${
                this.formatPercent(
                    metrics.expenseIncomeShare
                )
            } de tus ingresos del periodo.`,
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
                "No hay ingresos registrados en el periodo analizado.",
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
            } de ingresos en ${
                this.monthLabel(
                    summary.monthKey
                )
            }.`,
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
                } frente al periodo anterior.`,
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
                } frente al periodo anterior.`,
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
            }, sin cambios frente al periodo anterior.`,
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
                "Necesito ingresos registrados tanto en el periodo analizado como en el anterior para realizar una primera comparación de estabilidad.",
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
                `La variación frente al periodo anterior es del ${
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
            `La variación frente al periodo anterior es del ${
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

        return this.response(
            "Estimación",
            `Tomando el gasto neto del periodo como referencia, tu liquidez cubriría aproximadamente ${
                metrics.securityMonths
                    .toLocaleString(
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
            }. En el periodo has registrado ${
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

        return this.response(
            "Dato real",
            `La deuda equivale al ${
                this.formatPercent(
                    metrics.debtLiquidityRatio
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
            `En el periodo has destinado ${
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
            `En ${
                this.monthLabel(
                    summary.monthKey
                )
            } has aportado ${
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

        if (
            metrics.grossAssets ===
            0
        ) {

            return this.insufficient(
                "No puedo calcular el peso de las inversiones porque liquidez e inversiones suman cero.",
                [
                    "investments-current",
                    "liquidity-current"
                ]
            );

        }

        return this.response(
            "Dato real",
            `Las inversiones representan el ${
                this.formatPercent(
                    metrics.investmentWeight
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
                } durante el periodo mientras tu liquidez es ${
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
            `Comparando ${
                this.monthLabel(
                    summary.monthKey
                )
            } con ${
                this.monthLabel(
                    summary.previousMonthKey
                )
            }, los ingresos ${
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
            "Las aportaciones no han cambiado frente al periodo anterior.";

        if (
            investedDifference > 0
        ) {

            text =
                `Has invertido ${
                    this.formatCurrency(
                        investedDifference
                    )
                } más que en el periodo anterior.`;

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
                } menos que en el periodo anterior.`;

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

        const simulation =
            AtlasAIAnalysis
                .simulateCategoryReduction(
                    topCategory,
                    20,
                    summary,
                    this
                );

        return this.response(
            "Simulación",
            `Reducir un 20 % ${
                simulation.category
            } liberaría ${
                this.formatCurrency(
                    simulation.reduction
                )
            }. Tu ahorro mensual pasaría de ${
                this.formatCurrency(
                    simulation.currentSavings
                )
            } a aproximadamente ${
                this.formatCurrency(
                    simulation.projectedSavings
                )
            }.`,
            [
                "expenses-top",
                "savings-rate",
                "simulation-save-200",
                "prediction-close"
            ],
            {
                entity: {
                    type:
                        "category",
                    name:
                        simulation.category,
                    amount:
                        simulation.originalAmount,
                    rank:
                        1
                },
                simulation
            }
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

        const simulation =
            AtlasAIAnalysis
                .simulateExtraInvestment(
                    200,
                    summary,
                    this
                );

        return this.response(
            "Simulación",
            `Una aportación adicional de 200 € reduciría tu liquidez de ${
                this.formatCurrency(
                    simulation.currentLiquidity
                )
            } a ${
                this.formatCurrency(
                    simulation.projectedLiquidity
                )
            } y elevaría tus inversiones de ${
                this.formatCurrency(
                    simulation.currentInvestments
                )
            } a ${
                this.formatCurrency(
                    simulation.projectedInvestments
                )
            }. No sería un gasto, pero sí reduciría el ahorro mensual disponible en 200 €.`,
            [
                "investments-liquidity",
                "liquidity-security",
                "prediction-close"
            ],
            {
                simulation
            }
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

        const simulation =
            AtlasAIAnalysis
                .simulateIncomeReduction(
                    10,
                    summary,
                    this
                );

        return this.response(
            "Simulación",
            `Una bajada del 10 % reduciría tus ingresos en ${
                this.formatCurrency(
                    simulation.reduction
                )
            }, hasta ${
                this.formatCurrency(
                    simulation.projectedIncome
                )
            }. Manteniendo el resto igual, el ahorro bajaría a ${
                this.formatCurrency(
                    simulation.projectedSavings
                )
            }.`,
            [
                "income-stability",
                "prediction-close",
                "simulation-top-20"
            ],
            {
                simulation
            }
        );

    }

    if (
        questionKey ===
        "simulation-unexpected-1000"
    ) {

        const simulation =
            AtlasAIAnalysis
                .simulateUnexpectedExpense(
                    1000,
                    summary,
                    this
                );

        return this.response(
            "Simulación",
            `Un gasto inesperado de 1.000 € reduciría el ahorro mensual de ${
                this.formatCurrency(
                    simulation.currentSavings
                )
            } a ${
                this.formatCurrency(
                    simulation.projectedSavings
                )
            }. Si se pagara con liquidez, esta también bajaría hasta ${
                this.formatCurrency(
                    simulation.projectedLiquidity
                )
            }.`,
            [
                "liquidity-security",
                "prediction-close",
                "simulation-save-200"
            ],
            {
                simulation
            }
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

        const simulation =
            AtlasAIAnalysis
                .simulateDebtRepayment(
                    500,
                    summary,
                    this
                );

        return this.response(
            "Simulación",
            `Amortizar ${
                this.formatCurrency(
                    simulation.payment
                )
            } reduciría la deuda a ${
                this.formatCurrency(
                    simulation.projectedDebt
                )
            } y la liquidez a ${
                this.formatCurrency(
                    simulation.projectedLiquidity
                )
            }. El pago no se consideraría gasto.`,
            [
                "liquidity-security",
                "debt-risk",
                "liquidity-amortize"
            ],
            {
                simulation
            }
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

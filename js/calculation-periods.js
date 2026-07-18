/* ==========================================================
   ATLAS
   calculation-periods.js
   Atlas v1.0 — Cálculos por fecha real y mes imputado
========================================================== */

const AtlasCalculationPeriods = {

    initialized: false,

    validMonth(value) {

        return /^\d{4}-\d{2}$/.test(
            String(value || "")
        );

    },

    realMonth(movement) {

        const value =
            String(
                movement?.date || ""
            ).slice(
                0,
                7
            );

        return this.validMonth(value)
            ? value
            : "";

    },

    economicMonth(movement) {

        const candidates = [

            movement?.periodMonth,
            movement?.economicMonth,
            movement?.imputedMonth,
            this.realMonth(movement)

        ];

        return (
            candidates.find(
                value =>
                    this.validMonth(value)
            ) ||
            ""
        );

    },

    occurrenceMonth(occurrence) {

        const candidates = [

            occurrence?.periodMonth,
            occurrence?.economicMonth,
            occurrence?.imputedMonth,
            occurrence?.monthKey,
            occurrence?.periodKey,
            String(
                occurrence?.expectedDate ||
                ""
            ).slice(
                0,
                7
            )

        ];

        return (
            candidates.find(
                value =>
                    this.validMonth(value)
            ) ||
            ""
        );

    },

    economicMovements(
        data,
        monthKey
    ) {

        return AtlasCalculations
            .movements(data)
            .filter(
                movement =>
                    this.economicMonth(
                        movement
                    ) ===
                    monthKey
            );

    },

    realMovements(
        data,
        monthKey
    ) {

        return AtlasCalculations
            .movements(data)
            .filter(
                movement =>
                    this.realMonth(
                        movement
                    ) ===
                    monthKey
            );

    },

    installMonthFunctions() {

        AtlasCalculations
            .movementMonthKey =
            movement =>
                this.economicMonth(
                    movement
                );

        AtlasCalculations
            .movementRealMonthKey =
            movement =>
                this.realMonth(
                    movement
                );

        AtlasCalculations
            .movementEconomicMonthKey =
            movement =>
                this.economicMonth(
                    movement
                );

        AtlasCalculations
            .movementsForMonth =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) =>
                this.economicMovements(
                    data,
                    monthKey
                );

        AtlasCalculations
            .movementsForCashMonth =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) =>
                this.realMovements(
                    data,
                    monthKey
                );

    },

    installCashFunctions() {

        AtlasCalculations
            .monthlyCashOutflow =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) =>
                AtlasCalculations
                    .movementsForCashMonth(
                        data,
                        monthKey
                    )
                    .reduce(
                        (
                            total,
                            movement
                        ) =>
                            total +
                            AtlasCalculations
                                .movementCashOutflow(
                                    data,
                                    movement
                                ),
                        0
                    );

        AtlasCalculations
            .monthlyCashInflow =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) =>
                AtlasCalculations
                    .movementsForCashMonth(
                        data,
                        monthKey
                    )
                    .reduce(
                        (
                            total,
                            movement
                        ) =>
                            total +
                            AtlasCalculations
                                .movementCashInflow(
                                    data,
                                    movement
                                ),
                        0
                    );

        AtlasCalculations
            .monthlyCashResult =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) =>
                (
                    AtlasCalculations
                        .monthlyCashInflow(
                            data,
                            monthKey
                        ) -
                    AtlasCalculations
                        .monthlyCashOutflow(
                            data,
                            monthKey
                        )
                );

    },

    installRecurringFunctions() {

        AtlasCalculations
            .pendingOccurrencesForMonth =
            (
                data,
                monthKey
            ) =>
                AtlasCalculations
                    .recurringOccurrences(
                        data
                    )
                    .filter(
                        occurrence =>
                            this.occurrenceMonth(
                                occurrence
                            ) ===
                            monthKey
                    )
                    .filter(
                        occurrence =>
                            [
                                "pending",
                                "possible_duplicate"
                            ].includes(
                                occurrence.status
                            )
                    );

    },

    installDailyActivity() {

        AtlasCalculations
            .dailyActivity =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) => {

                const days =
                    Array.from(
                        {
                            length:
                                AtlasCalculations
                                    .daysInMonth(
                                        monthKey
                                    )
                        },
                        (
                            value,
                            index
                        ) => ({

                            day:
                                index + 1,

                            date:
                                `${monthKey}-${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}`,

                            income:
                                0,

                            grossExpenses:
                                0,

                            reimbursements:
                                0,

                            expenses:
                                0,

                            invested:
                                0,

                            debtPayments:
                                0,

                            cashOutflow:
                                0,

                            movements:
                                0

                        })
                    );

                AtlasCalculations
                    .movementsForMonth(
                        data,
                        monthKey
                    )
                    .forEach(
                        movement => {

                            let day =
                                AtlasCalculations
                                    .movementDay(
                                        movement
                                    );

                            if (
                                this.realMonth(
                                    movement
                                ) !==
                                monthKey
                            ) {

                                day = 1;

                            }

                            if (
                                !day ||
                                !days[
                                    day - 1
                                ]
                            ) {

                                return;

                            }

                            const item =
                                days[
                                    day - 1
                                ];

                            const amount =
                                AtlasCalculations
                                    .number(
                                        movement
                                            .amount
                                    );

                            const kind =
                                AtlasCalculations
                                    .movementKind(
                                        movement
                                    );

                            item.movements +=
                                1;

                            if (
                                kind ===
                                "income"
                            ) {

                                item.income +=
                                    amount;

                            }

                            if (
                                kind ===
                                "expense"
                            ) {

                                item
                                    .grossExpenses +=
                                    amount;

                            }

                            if (
                                kind ===
                                "reimbursement"
                            ) {

                                item
                                    .reimbursements +=
                                    amount;

                            }

                            if (
                                kind ===
                                "investment"
                            ) {

                                item.invested +=
                                    amount;

                            }

                            if (
                                kind ===
                                "debt_payment"
                            ) {

                                item
                                    .debtPayments +=
                                    amount;

                            }

                        }
                    );

                AtlasCalculations
                    .movementsForCashMonth(
                        data,
                        monthKey
                    )
                    .forEach(
                        movement => {

                            const day =
                                AtlasCalculations
                                    .movementDay(
                                        movement
                                    );

                            if (
                                !day ||
                                !days[
                                    day - 1
                                ]
                            ) {

                                return;

                            }

                            days[
                                day - 1
                            ].cashOutflow +=
                                AtlasCalculations
                                    .movementCashOutflow(
                                        data,
                                        movement
                                    );

                        }
                    );

                days.forEach(
                    day => {

                        day.expenses =
                            day.grossExpenses -
                            day.reimbursements;

                    }
                );

                return days;

            };

    },

    installAllMonthKeys() {

        AtlasCalculations
            .allMonthKeys =
            (
                data,
                endMonthKey =
                    AtlasCalculations
                        .monthKey()
            ) => {

                const keys =
                    new Set();

                AtlasCalculations
                    .movements(data)
                    .forEach(
                        movement => {

                            const economic =
                                this.economicMonth(
                                    movement
                                );

                            const real =
                                this.realMonth(
                                    movement
                                );

                            if (
                                this.validMonth(
                                    economic
                                )
                            ) {

                                keys.add(
                                    economic
                                );

                            }

                            if (
                                this.validMonth(
                                    real
                                )
                            ) {

                                keys.add(
                                    real
                                );

                            }

                        }
                    );

                AtlasCalculations
                    .recurringOccurrences(
                        data
                    )
                    .forEach(
                        occurrence => {

                            const key =
                                this.occurrenceMonth(
                                    occurrence
                                );

                            if (
                                this.validMonth(
                                    key
                                )
                            ) {

                                keys.add(key);

                            }

                        }
                    );

                keys.add(
                    endMonthKey
                );

                const ordered =
                    Array.from(keys)
                        .sort();

                const first =
                    ordered[0] ||
                    endMonthKey;

                const result = [];

                let current =
                    first;

                let safety =
                    0;

                while (
                    current <=
                        endMonthKey &&
                    safety <
                        2400
                ) {

                    result.push(
                        current
                    );

                    current =
                        AtlasCalculations
                            .shiftMonthKey(
                                current,
                                1
                            );

                    safety += 1;

                }

                return result;

            };

    },

    installFinancialSummary() {

        AtlasCalculations
            .financialSummary =
            (
                data,
                monthKey =
                    AtlasCalculations
                        .monthKey()
            ) => {

                const liquidity =
                    AtlasCalculations
                        .totalLiquidity(
                            data
                        );

                const investments =
                    AtlasCalculations
                        .totalInvestments(
                            data
                        );

                const investedCapital =
                    AtlasCalculations
                        .totalInvestedCapital(
                            data
                        );

                const investmentGain =
                    investments -
                    investedCapital;

                const debt =
                    AtlasCalculations
                        .totalDebt(
                            data
                        );

                const monthlyIncome =
                    AtlasCalculations
                        .monthlyIncome(
                            data,
                            monthKey
                        );

                const monthlyGrossExpenses =
                    AtlasCalculations
                        .monthlyGrossExpenses(
                            data,
                            monthKey
                        );

                const monthlyReimbursements =
                    AtlasCalculations
                        .monthlyReimbursements(
                            data,
                            monthKey
                        );

                const monthlyExpenses =
                    monthlyGrossExpenses -
                    monthlyReimbursements;

                const monthlyInvested =
                    AtlasCalculations
                        .monthlyInvested(
                            data,
                            monthKey
                        );

                const monthlyDebtPayments =
                    AtlasCalculations
                        .monthlyDebtPayments(
                            data,
                            monthKey
                        );

                const monthlyTransfers =
                    AtlasCalculations
                        .monthlyTransfers(
                            data,
                            monthKey
                        );

                const monthlyCashInflow =
                    AtlasCalculations
                        .monthlyCashInflow(
                            data,
                            monthKey
                        );

                const monthlyCashOutflow =
                    AtlasCalculations
                        .monthlyCashOutflow(
                            data,
                            monthKey
                        );

                const monthlySavings =
                    monthlyIncome -
                    monthlyExpenses -
                    monthlyInvested;

                const monthlySavingRate =
                    monthlyIncome > 0
                        ? (
                            monthlySavings /
                            monthlyIncome
                        ) * 100
                        : 0;

                const monthlyCashResult =
                    monthlyCashInflow -
                    monthlyCashOutflow;

                return {

                    liquidity,

                    investments,

                    investedCapital,

                    investmentGain,

                    investmentReturn:
                        investedCapital > 0
                            ? (
                                investmentGain /
                                investedCapital
                            ) * 100
                            : 0,

                    debt,

                    netWorth:
                        liquidity +
                        investments -
                        debt,

                    monthlyIncome,

                    monthlyGrossExpenses,

                    monthlyReimbursements,

                    monthlyExpenses,

                    monthlyInvested,

                    monthlyDebtPayments,

                    monthlyTransfers,

                    monthlyCashInflow,

                    monthlyCashOutflow,

                    monthlyCashResult,

                    monthlySavings,

                    monthlySavingRate,

                    income:
                        monthlyIncome,

                    grossExpenses:
                        monthlyGrossExpenses,

                    reimbursements:
                        monthlyReimbursements,

                    expenses:
                        monthlyExpenses,

                    invested:
                        monthlyInvested,

                    debtPayments:
                        monthlyDebtPayments,

                    transfers:
                        monthlyTransfers,

                    cashInflow:
                        monthlyCashInflow,

                    cashOutflow:
                        monthlyCashOutflow,

                    cashResult:
                        monthlyCashResult,

                    savings:
                        monthlySavings,

                    savingRate:
                        monthlySavingRate,

                    monthKey

                };

            };

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasCalculations ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        this.installMonthFunctions();
        this.installCashFunctions();
        this.installRecurringFunctions();
        this.installDailyActivity();
        this.installAllMonthKeys();
        this.installFinancialSummary();

    }

};

AtlasCalculationPeriods.install();

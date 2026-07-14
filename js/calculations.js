/* ==========================================================
   ATLAS
   calculations.js
   Sprint 5.0 — Motor de presupuestos mensuales
========================================================== */

const AtlasCalculations = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    movements(data) {

        return Array.isArray(
            data?.movements
        )
            ? data.movements
            : [];

    },

    accounts(data) {

        return Array.isArray(
            data?.accounts
        )
            ? data.accounts
            : [];

    },

    findAccount(
        data,
        accountId
    ) {

        return this.accounts(data).find(
            account =>
                account.id ===
                accountId
        );

    },

    accountGroup(
        data,
        group
    ) {

        return this.accounts(data).filter(
            account =>
                account.group ===
                group
        );

    },

    liquidityAccounts(data) {

        return this.accountGroup(
            data,
            "liquidity"
        );

    },

    investmentAccounts(data) {

        return this.accountGroup(
            data,
            "investment"
        );

    },

    debtAccounts(data) {

        return this.accountGroup(
            data,
            "debt"
        );

    },

    totalLiquidity(data) {

        return this.liquidityAccounts(data)
            .reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    this.number(
                        account.balance
                    ),
                0
            );

    },

    totalInvestments(data) {

        return this.investmentAccounts(data)
            .reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    this.number(
                        account.balance
                    ),
                0
            );

    },

    totalInvestedCapital(data) {

        return this.investmentAccounts(data)
            .reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    this.number(
                        account.invested
                    ),
                0
            );

    },

    totalDebt(data) {

        return this.debtAccounts(data)
            .reduce(
                (
                    total,
                    account
                ) =>
                    total +
                    Math.max(
                        0,
                        this.number(
                            account.balance
                        )
                    ),
                0
            );

    },

    netWorth(data) {

        return (
            this.totalLiquidity(data) +
            this.totalInvestments(data) -
            this.totalDebt(data)
        );

    },

    monthKey(
        date = new Date()
    ) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}`;

    },

    shiftMonthKey(
        monthKey,
        difference
    ) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(Number);

        if (
            !year ||
            !month
        ) {

            return this.monthKey();

        }

        const date =
            new Date(
                year,
                month - 1 + difference,
                1
            );

        return this.monthKey(
            date
        );

    },

    previousMonthKey(monthKey) {

        return this.shiftMonthKey(
            monthKey,
            -1
        );

    },

    monthKeys(
        endMonthKey = this.monthKey(),
        numberOfMonths = 6
    ) {

        const months =
            Math.max(
                1,
                Number(
                    numberOfMonths
                ) || 1
            );

        const keys = [];

        for (
            let index =
                months - 1;
            index >= 0;
            index -= 1
        ) {

            keys.push(
                this.shiftMonthKey(
                    endMonthKey,
                    -index
                )
            );

        }

        return keys;

    },

    movementMonthKey(movement) {

        return String(
            movement?.date || ""
        ).slice(
            0,
            7
        );

    },

    movementsForMonth(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movements(data)
            .filter(
                movement =>
                    this.movementMonthKey(
                        movement
                    ) === monthKey
            );

    },

    movementKind(movement) {

        if (
            movement?.kind ===
            "debt_payment"
        ) {

            return "debt_payment";

        }

        return movement?.type || "";

    },

    isDebtPayment(movement) {

        return (
            this.movementKind(
                movement
            ) ===
            "debt_payment"
        );

    },

    isCreditCardSettlement(
        data,
        movement
    ) {

        if (
            !this.isDebtPayment(
                movement
            )
        ) {

            return false;

        }

        const account =
            this.findAccount(
                data,
                movement.toAccountId
            );

        return (
            account?.type ===
            "credit_card"
        );

    },

    isLoanPayment(
        data,
        movement
    ) {

        if (
            !this.isDebtPayment(
                movement
            )
        ) {

            return false;

        }

        const account =
            this.findAccount(
                data,
                movement.toAccountId
            );

        return (
            account?.group ===
                "debt" &&
            account?.type !==
                "credit_card"
        );

    },

    isNormalExpense(movement) {

        return (
            movement?.type ===
                "expense" &&
            !this.isDebtPayment(
                movement
            )
        );

    },

    expenseCountsForSavings(
        data,
        movement
    ) {

        /*
         * Las compras se cuentan como gasto
         * cuando se registran.
         *
         * Los pagos posteriores de tarjeta
         * o préstamo solo reducen liquidez
         * y deuda. No vuelven a sumar gasto.
         */

        if (
            this.isDebtPayment(
                movement
            )
        ) {

            return false;

        }

        return this.isNormalExpense(
            movement
        );

    },

    movementCashOutflow(
        data,
        movement
    ) {

        const amount =
            this.number(
                movement?.amount
            );

        if (
            this.isNormalExpense(
                movement
            )
        ) {

            const account =
                this.findAccount(
                    data,
                    movement.accountId
                );

            if (
                account?.group ===
                "liquidity"
            ) {

                return amount;

            }

            return 0;

        }

        if (
            movement?.type ===
            "investment"
        ) {

            return amount;

        }

        if (
            this.isDebtPayment(
                movement
            )
        ) {

            return amount;

        }

        if (
            movement?.type ===
            "transfer"
        ) {

            const fromAccount =
                this.findAccount(
                    data,
                    movement.fromAccountId
                );

            const toAccount =
                this.findAccount(
                    data,
                    movement.toAccountId
                );

            if (
                fromAccount?.group ===
                    "liquidity" &&
                toAccount?.group ===
                    "debt"
            ) {

                return amount;

            }

        }

        return 0;

    },

    monthlyIncome(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    movement.type ===
                    "income"
            )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.number(
                        movement.amount
                    ),
                0
            );

    },

    monthlyExpenses(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.expenseCountsForSavings(
                        data,
                        movement
                    )
            )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.number(
                        movement.amount
                    ),
                0
            );

    },

    monthlyInvested(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    movement.type ===
                    "investment"
            )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.number(
                        movement.amount
                    ),
                0
            );

    },

    monthlyCashOutflow(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.movementCashOutflow(
                        data,
                        movement
                    ),
                0
            );

    },

    monthlySavings(
        data,
        monthKey = this.monthKey()
    ) {

        return (
            this.monthlyIncome(
                data,
                monthKey
            ) -
            this.monthlyExpenses(
                data,
                monthKey
            ) -
            this.monthlyInvested(
                data,
                monthKey
            )
        );

    },

    monthlySavingRate(
        data,
        monthKey = this.monthKey()
    ) {

        const income =
            this.monthlyIncome(
                data,
                monthKey
            );

        if (
            income <= 0
        ) {

            return 0;

        }

        return (
            this.monthlySavings(
                data,
                monthKey
            ) /
            income
        ) * 100;

    },

    expenseCategories(
        data,
        monthKey = this.monthKey()
    ) {

        const categories = {};

        this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.expenseCountsForSavings(
                        data,
                        movement
                    )
            )
            .forEach(
                movement => {

                    const category =
                        movement.category ||
                        "Otros gastos";

                    categories[category] =
                        (
                            categories[
                                category
                            ] ||
                            0
                        ) +
                        this.number(
                            movement.amount
                        );

                }
            );

        return Object.entries(
            categories
        )
            .map(
                ([
                    category,
                    amount
                ]) => ({

                    category,

                    amount

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.amount -
                    a.amount
            );

    },

    /*
     * =======================================================
     * PRESUPUESTOS
     * =======================================================
     */

    expenseCatalog(data) {

        const categories =
            data?.catalog
                ?.categories
                ?.expense;

        return Array.isArray(
            categories
        )
            ? categories
            : [];

    },

    budgetConfiguration(data) {

        return (
            data?.catalog
                ?.budgets ||
            {}
        );

    },

    categoryBudgetConfigurations(data) {

        const budgets =
            this.budgetConfiguration(
                data
            );

        return Array.isArray(
            budgets.categoryBudgets
        )
            ? budgets.categoryBudgets
            : [];

    },

    findExpenseCategory(
        data,
        categoryId
    ) {

        return this.expenseCatalog(
            data
        ).find(
            category =>
                category.id ===
                categoryId
        ) || null;

    },

    findExpenseSubcategory(
        data,
        categoryId,
        subcategoryId
    ) {

        const category =
            this.findExpenseCategory(
                data,
                categoryId
            );

        if (
            !category ||
            !Array.isArray(
                category.subcategories
            )
        ) {

            return null;

        }

        return category
            .subcategories
            .find(
                subcategory =>
                    subcategory.id ===
                    subcategoryId
            ) || null;

    },

    findCategoryBudgetConfiguration(
        data,
        categoryId
    ) {

        return this
            .categoryBudgetConfigurations(
                data
            )
            .find(
                budget =>
                    budget.categoryId ===
                    categoryId
            ) || null;

    },

    findSubcategoryBudgetConfiguration(
        data,
        categoryId,
        subcategoryId
    ) {

        const categoryBudget =
            this.findCategoryBudgetConfiguration(
                data,
                categoryId
            );

        if (
            !categoryBudget ||
            !Array.isArray(
                categoryBudget.subcategories
            )
        ) {

            return null;

        }

        return categoryBudget
            .subcategories
            .find(
                budget =>
                    budget.subcategoryId ===
                    subcategoryId
            ) || null;

    },

    movementCategoryId(
        data,
        movement
    ) {

        if (
            movement?.categoryId
        ) {

            return movement.categoryId;

        }

        const legacyCategory =
            String(
                movement?.category || ""
            )
                .trim()
                .toLowerCase();

        if (!legacyCategory) {

            return null;

        }

        const category =
            this.expenseCatalog(data)
                .find(
                    item => {

                        const name =
                            String(
                                item.name || ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            legacyCategory ===
                                name ||
                            legacyCategory.includes(
                                name
                            )
                        );

                    }
                );

        return category?.id || null;

    },

    movementSubcategoryId(
        data,
        movement
    ) {

        if (
            movement?.subcategoryId
        ) {

            return movement.subcategoryId;

        }

        const categoryId =
            this.movementCategoryId(
                data,
                movement
            );

        const category =
            this.findExpenseCategory(
                data,
                categoryId
            );

        if (
            !category ||
            !Array.isArray(
                category.subcategories
            )
        ) {

            return null;

        }

        const legacyCategory =
            String(
                movement?.category || ""
            )
                .trim()
                .toLowerCase();

        const subcategory =
            category.subcategories
                .find(
                    item => {

                        const name =
                            String(
                                item.name || ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            legacyCategory ===
                                name ||
                            legacyCategory.includes(
                                name
                            )
                        );

                    }
                );

        return subcategory?.id || null;

    },

    monthlyExpenseMovements(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.expenseCountsForSavings(
                        data,
                        movement
                    )
            );

    },

    monthlyExpenseForCategory(
        data,
        categoryId,
        monthKey = this.monthKey()
    ) {

        return this.monthlyExpenseMovements(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.movementCategoryId(
                        data,
                        movement
                    ) ===
                    categoryId
            )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.number(
                        movement.amount
                    ),
                0
            );

    },

    monthlyExpenseForSubcategory(
        data,
        categoryId,
        subcategoryId,
        monthKey = this.monthKey()
    ) {

        return this.monthlyExpenseMovements(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.movementCategoryId(
                        data,
                        movement
                    ) ===
                        categoryId &&
                    this.movementSubcategoryId(
                        data,
                        movement
                    ) ===
                        subcategoryId
            )
            .reduce(
                (
                    total,
                    movement
                ) =>
                    total +
                    this.number(
                        movement.amount
                    ),
                0
            );

    },

    budgetAmount(
        configuration,
        monthlyIncome
    ) {

        if (
            !configuration ||
            configuration.active === false
        ) {

            return 0;

        }

        const mode =
            String(
                configuration.mode ||
                "percentage"
            );

        if (
            mode === "fixed" ||
            mode === "fixed_amount"
        ) {

            return Math.max(
                0,
                this.number(
                    configuration.fixedAmount
                )
            );

        }

        const percentage =
            Math.max(
                0,
                this.number(
                    configuration.targetPercent
                )
            );

        if (
            monthlyIncome <= 0
        ) {

            return 0;

        }

        return (
            monthlyIncome *
            percentage
        ) / 100;

    },

    recommendedBudgetAmount(
        configuration,
        monthlyIncome
    ) {

        if (!configuration) {

            return 0;

        }

        if (
            monthlyIncome <= 0
        ) {

            return 0;

        }

        return (
            monthlyIncome *
            Math.max(
                0,
                this.number(
                    configuration
                        .recommendedPercent
                )
            )
        ) / 100;

    },

    budgetUsedPercent(
        spent,
        budget
    ) {

        const budgetAmount =
            this.number(
                budget
            );

        const spentAmount =
            this.number(
                spent
            );

        if (
            budgetAmount <= 0
        ) {

            return spentAmount > 0
                ? null
                : 0;

        }

        return (
            spentAmount /
            budgetAmount
        ) * 100;

    },

    budgetThresholds(data) {

        const thresholds =
            this.budgetConfiguration(
                data
            )?.thresholds || {};

        return {

            healthy:
                Math.max(
                    0,
                    this.number(
                        thresholds.healthy ??
                        80
                    )
                ),

            warning:
                Math.max(
                    0,
                    this.number(
                        thresholds.warning ??
                        100
                    )
                )

        };

    },

    budgetStatus(
        data,
        spent,
        budget
    ) {

        const spentAmount =
            this.number(
                spent
            );

        const budgetAmount =
            this.number(
                budget
            );

        if (
            budgetAmount <= 0
        ) {

            return spentAmount > 0
                ? "unbudgeted"
                : "no_budget";

        }

        const percentage =
            this.budgetUsedPercent(
                spentAmount,
                budgetAmount
            );

        const thresholds =
            this.budgetThresholds(
                data
            );

        if (
            percentage <
            thresholds.healthy
        ) {

            return "healthy";

        }

        if (
            percentage <=
            thresholds.warning
        ) {

            return "warning";

        }

        return "exceeded";

    },

    budgetRemaining(
        spent,
        budget
    ) {

        return (
            this.number(
                budget
            ) -
            this.number(
                spent
            )
        );

    },

    subcategoryBudgetSummary(
        data,
        category,
        subcategory,
        categoryBudget,
        monthKey,
        monthlyIncome
    ) {

        const configuration =
            categoryBudget
                ?.subcategories
                ?.find(
                    item =>
                        item.subcategoryId ===
                        subcategory.id
                ) ||
            null;

        const spent =
            this.monthlyExpenseForSubcategory(
                data,
                category.id,
                subcategory.id,
                monthKey
            );

        const budget =
            this.budgetAmount(
                configuration,
                monthlyIncome
            );

        const recommendedBudget =
            this.recommendedBudgetAmount(
                configuration,
                monthlyIncome
            );

        const remaining =
            this.budgetRemaining(
                spent,
                budget
            );

        const usedPercent =
            this.budgetUsedPercent(
                spent,
                budget
            );

        return {

            subcategoryId:
                subcategory.id,

            categoryId:
                category.id,

            name:
                subcategory.name,

            icon:
                subcategory.icon || "",

            active:
                configuration
                    ?.active !== false,

            mode:
                configuration
                    ?.mode ||
                "percentage",

            targetPercent:
                this.number(
                    configuration
                        ?.targetPercent
                ),

            recommendedPercent:
                this.number(
                    configuration
                        ?.recommendedPercent
                ),

            fixedAmount:
                configuration
                    ?.fixedAmount ??
                null,

            budget,

            recommendedBudget,

            spent,

            remaining,

            usedPercent,

            status:
                this.budgetStatus(
                    data,
                    spent,
                    budget
                )

        };

    },

    categoryBudgetSummary(
        data,
        category,
        monthKey,
        monthlyIncome
    ) {

        const configuration =
            this.findCategoryBudgetConfiguration(
                data,
                category.id
            );

        const spent =
            this.monthlyExpenseForCategory(
                data,
                category.id,
                monthKey
            );

        const budget =
            this.budgetAmount(
                configuration,
                monthlyIncome
            );

        const recommendedBudget =
            this.recommendedBudgetAmount(
                configuration,
                monthlyIncome
            );

        const remaining =
            this.budgetRemaining(
                spent,
                budget
            );

        const usedPercent =
            this.budgetUsedPercent(
                spent,
                budget
            );

        const subcategories =
            (
                Array.isArray(
                    category.subcategories
                )
                    ? category.subcategories
                    : []
            )
                .filter(
                    subcategory =>
                        subcategory.active !==
                        false
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        )
                )
                .map(
                    subcategory =>
                        this.subcategoryBudgetSummary(
                            data,
                            category,
                            subcategory,
                            configuration,
                            monthKey,
                            monthlyIncome
                        )
                );

        return {

            categoryId:
                category.id,

            name:
                category.name,

            icon:
                category.icon || "",

            active:
                configuration
                    ?.active !== false,

            mode:
                configuration
                    ?.mode ||
                "percentage",

            targetPercent:
                this.number(
                    configuration
                        ?.targetPercent
                ),

            recommendedPercent:
                this.number(
                    configuration
                        ?.recommendedPercent
                ),

            fixedAmount:
                configuration
                    ?.fixedAmount ??
                null,

            budget,

            recommendedBudget,

            spent,

            remaining,

            usedPercent,

            status:
                this.budgetStatus(
                    data,
                    spent,
                    budget
                ),

            subcategories

        };

    },

    budgetSummary(
        data,
        monthKey = this.monthKey()
    ) {

        const configuration =
            this.budgetConfiguration(
                data
            );

        const monthlyIncome =
            this.monthlyIncome(
                data,
                monthKey
            );

        const monthlyExpenses =
            this.monthlyExpenses(
                data,
                monthKey
            );

        const categories =
            this.expenseCatalog(data)
                .filter(
                    category =>
                        category.active !==
                        false
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        this.number(
                            first.order
                        ) -
                        this.number(
                            second.order
                        )
                )
                .map(
                    category =>
                        this.categoryBudgetSummary(
                            data,
                            category,
                            monthKey,
                            monthlyIncome
                        )
                );

        const activeCategories =
            categories.filter(
                category =>
                    category.active
            );

        const totalBudget =
            activeCategories.reduce(
                (
                    total,
                    category
                ) =>
                    total +
                    this.number(
                        category.budget
                    ),
                0
            );

        const budgetedSpent =
            activeCategories.reduce(
                (
                    total,
                    category
                ) =>
                    total +
                    this.number(
                        category.spent
                    ),
                0
            );

        const totalRemaining =
            totalBudget -
            monthlyExpenses;

        const usedPercent =
            this.budgetUsedPercent(
                monthlyExpenses,
                totalBudget
            );

        const totalTargetPercent =
            activeCategories.reduce(
                (
                    total,
                    category
                ) => {

                    if (
                        category.mode ===
                            "fixed" ||
                        category.mode ===
                            "fixed_amount"
                    ) {

                        if (
                            monthlyIncome <= 0
                        ) {

                            return total;

                        }

                        return (
                            total +
                            (
                                category.budget /
                                monthlyIncome
                            ) *
                            100
                        );

                    }

                    return (
                        total +
                        this.number(
                            category.targetPercent
                        )
                    );

                },
                0
            );

        const savingAndInvestmentTargetPercent =
            this.number(
                configuration
                    .savingAndInvestmentTargetPercent
            );

        const savingAndInvestmentTargetAmount =
            monthlyIncome > 0
                ? (
                    monthlyIncome *
                    savingAndInvestmentTargetPercent
                ) / 100
                : 0;

        return {

            enabled:
                configuration.enabled !==
                false,

            monthKey,

            monthlyIncome,

            monthlyExpenses,

            totalBudget,

            totalSpent:
                monthlyExpenses,

            budgetedSpent,

            unbudgetedSpent:
                Math.max(
                    0,
                    monthlyExpenses -
                    budgetedSpent
                ),

            remaining:
                totalRemaining,

            usedPercent,

            status:
                this.budgetStatus(
                    data,
                    monthlyExpenses,
                    totalBudget
                ),

            totalTargetPercent,

            recommendedMaximumPercent:
                this.number(
                    configuration
                        .warnAboveTotalPercent ??
                    100
                ),

            savingAndInvestmentTargetPercent,

            savingAndInvestmentTargetAmount,

            thresholds:
                this.budgetThresholds(
                    data
                ),

            categories

        };

    },

    percentageChange(
        currentValue,
        previousValue
    ) {

        const current =
            this.number(
                currentValue
            );

        const previous =
            this.number(
                previousValue
            );

        if (
            previous === 0
        ) {

            if (
                current === 0
            ) {

                return 0;

            }

            return null;

        }

        return (
            (
                current -
                previous
            ) /
            Math.abs(
                previous
            )
        ) * 100;

    },

    metricComparison(
        currentValue,
        previousValue
    ) {

        const current =
            this.number(
                currentValue
            );

        const previous =
            this.number(
                previousValue
            );

        return {

            current,

            previous,

            difference:
                current -
                previous,

            percentage:
                this.percentageChange(
                    current,
                    previous
                )

        };

    },

    investmentGain(data) {

        return (
            this.totalInvestments(
                data
            ) -
            this.totalInvestedCapital(
                data
            )
        );

    },

    investmentReturn(data) {

        const investedCapital =
            this.totalInvestedCapital(
                data
            );

        if (
            investedCapital <= 0
        ) {

            return 0;

        }

        return (
            this.investmentGain(
                data
            ) /
            investedCapital
        ) * 100;

    },

    financialSummary(
        data,
        monthKey = this.monthKey()
    ) {

        const liquidity =
            this.totalLiquidity(
                data
            );

        const investments =
            this.totalInvestments(
                data
            );

        const investedCapital =
            this.totalInvestedCapital(
                data
            );

        const investmentGain =
            investments -
            investedCapital;

        const debt =
            this.totalDebt(
                data
            );

        const netWorth =
            liquidity +
            investments -
            debt;

        const monthlyIncome =
            this.monthlyIncome(
                data,
                monthKey
            );

        const monthlyExpenses =
            this.monthlyExpenses(
                data,
                monthKey
            );

        const monthlyInvested =
            this.monthlyInvested(
                data,
                monthKey
            );

        const monthlyCashOutflow =
            this.monthlyCashOutflow(
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

            netWorth,

            monthlyIncome,

            monthlyExpenses,

            monthlyInvested,

            monthlyCashOutflow,

            monthlySavings,

            monthlySavingRate,

            income:
                monthlyIncome,

            expenses:
                monthlyExpenses,

            invested:
                monthlyInvested,

            cashOutflow:
                monthlyCashOutflow,

            savings:
                monthlySavings,

            savingRate:
                monthlySavingRate,

            monthKey

        };

    },

    monthlyComparison(
        data,
        monthKey = this.monthKey()
    ) {

        const previousMonthKey =
            this.previousMonthKey(
                monthKey
            );

        const current =
            this.financialSummary(
                data,
                monthKey
            );

        const previous =
            this.financialSummary(
                data,
                previousMonthKey
            );

        return {

            monthKey,

            previousMonthKey,

            income:
                this.metricComparison(
                    current.monthlyIncome,
                    previous.monthlyIncome
                ),

            expenses:
                this.metricComparison(
                    current.monthlyExpenses,
                    previous.monthlyExpenses
                ),

            invested:
                this.metricComparison(
                    current.monthlyInvested,
                    previous.monthlyInvested
                ),

            cashOutflow:
                this.metricComparison(
                    current.monthlyCashOutflow,
                    previous.monthlyCashOutflow
                ),

            savings:
                this.metricComparison(
                    current.monthlySavings,
                    previous.monthlySavings
                ),

            savingRate:
                this.metricComparison(
                    current.monthlySavingRate,
                    previous.monthlySavingRate
                ),

            categories:
                this.expenseCategories(
                    data,
                    monthKey
                ),

            previousCategories:
                this.expenseCategories(
                    data,
                    previousMonthKey
                )

        };

    },

    average(values) {

        const validValues =
            values.map(
                value =>
                    this.number(
                        value
                    )
            );

        if (
            validValues.length === 0
        ) {

            return 0;

        }

        return (
            validValues.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    value,
                0
            ) /
            validValues.length
        );

    },

    trendMonths(
        data,
        period = 6,
        endMonthKey = this.monthKey()
    ) {

        return this.monthKeys(
            endMonthKey,
            period
        )
            .map(
                monthKey => {

                    const summary =
                        this.financialSummary(
                            data,
                            monthKey
                        );

                    return {

                        monthKey,

                        income:
                            summary.monthlyIncome,

                        expenses:
                            summary.monthlyExpenses,

                        invested:
                            summary.monthlyInvested,

                        cashOutflow:
                            summary.monthlyCashOutflow,

                        savings:
                            summary.monthlySavings,

                        savingRate:
                            summary.monthlySavingRate,

                        movements:
                            this.movementsForMonth(
                                data,
                                monthKey
                            ).length

                    };

                }
            );

    },

    trendCategoryTotals(
        data,
        monthKeys
    ) {

        const totals = {};

        monthKeys.forEach(
            monthKey => {

                this.expenseCategories(
                    data,
                    monthKey
                )
                    .forEach(
                        item => {

                            totals[
                                item.category
                            ] =
                                (
                                    totals[
                                        item.category
                                    ] ||
                                    0
                                ) +
                                this.number(
                                    item.amount
                                );

                        }
                    );

            }
        );

        return Object.entries(
            totals
        )
            .map(
                ([
                    category,
                    amount
                ]) => ({

                    category,

                    amount

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.amount -
                    a.amount
            );

    },

    bestMonth(
        months,
        property
    ) {

        if (
            !Array.isArray(
                months
            ) ||
            months.length === 0
        ) {

            return null;

        }

        return months.reduce(
            (
                best,
                month
            ) => {

                if (!best) {

                    return month;

                }

                return (
                    this.number(
                        month[property]
                    ) >
                    this.number(
                        best[property]
                    )
                )
                    ? month
                    : best;

            },
            null
        );

    },

    worstMonth(
        months,
        property
    ) {

        if (
            !Array.isArray(
                months
            ) ||
            months.length === 0
        ) {

            return null;

        }

        return months.reduce(
            (
                worst,
                month
            ) => {

                if (!worst) {

                    return month;

                }

                return (
                    this.number(
                        month[property]
                    ) <
                    this.number(
                        worst[property]
                    )
                )
                    ? month
                    : worst;

            },
            null
        );

    },

    trendSummary(
        data,
        period = 6,
        endMonthKey = this.monthKey()
    ) {

        const months =
            this.trendMonths(
                data,
                period,
                endMonthKey
            );

        const monthKeys =
            months.map(
                month =>
                    month.monthKey
            );

        const totals = {

            income:
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        month.income,
                    0
                ),

            expenses:
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        month.expenses,
                    0
                ),

            invested:
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        month.invested,
                    0
                ),

            cashOutflow:
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        month.cashOutflow,
                    0
                ),

            savings:
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        month.savings,
                    0
                )

        };

        const averages = {

            income:
                this.average(
                    months.map(
                        month =>
                            month.income
                    )
                ),

            expenses:
                this.average(
                    months.map(
                        month =>
                            month.expenses
                    )
                ),

            invested:
                this.average(
                    months.map(
                        month =>
                            month.invested
                    )
                ),

            cashOutflow:
                this.average(
                    months.map(
                        month =>
                            month.cashOutflow
                    )
                ),

            savings:
                this.average(
                    months.map(
                        month =>
                            month.savings
                    )
                ),

            savingRate:
                this.average(
                    months.map(
                        month =>
                            month.savingRate
                    )
                )

        };

        return {

            period:
                Number(
                    period
                ),

            startMonthKey:
                monthKeys[0] ||
                endMonthKey,

            endMonthKey,

            months,

            totals,

            averages,

            bestSavingsMonth:
                this.bestMonth(
                    months,
                    "savings"
                ),

            worstSavingsMonth:
                this.worstMonth(
                    months,
                    "savings"
                ),

            highestExpenseMonth:
                this.bestMonth(
                    months,
                    "expenses"
                ),

            lowestExpenseMonth:
                this.worstMonth(
                    months,
                    "expenses"
                ),

            categories:
                this.trendCategoryTotals(
                    data,
                    monthKeys
                )

        };

    }

};

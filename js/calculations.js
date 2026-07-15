/* ==========================================================
   ATLAS
   calculations.js
   Atlas v1.0 — Motor financiero y análisis avanzado
========================================================== */

const AtlasCalculations = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    round(
        value,
        decimals = 2
    ) {

        const factor =
            10 ** decimals;

        return Math.round(
            (
                this.number(value) +
                Number.EPSILON
            ) *
            factor
        ) / factor;

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

    recurringOccurrences(data) {

        return Array.isArray(
            data?.recurringOccurrences
        )
            ? data.recurringOccurrences
            : [];

    },

    findMovement(
        data,
        movementId
    ) {

        return this.movements(data)
            .find(
                movement =>
                    movement.id ===
                    movementId
            ) || null;

    },

    findAccount(
        data,
        accountId
    ) {

        return this.accounts(data)
            .find(
                account =>
                    account.id ===
                    accountId
            ) || null;

    },

    accountGroup(
        data,
        group
    ) {

        return this.accounts(data)
            .filter(
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

    investmentGain(data) {

        return (
            this.totalInvestments(data) -
            this.totalInvestedCapital(data)
        );

    },

    investmentReturn(data) {

        const invested =
            this.totalInvestedCapital(
                data
            );

        if (
            invested <= 0
        ) {

            return 0;

        }

        return (
            this.investmentGain(data) /
            invested
        ) * 100;

    },

    monthKey(
        date = new Date()
    ) {

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )
        ].join("-");

    },

    validMonthKey(monthKey) {

        return /^\d{4}-\d{2}$/.test(
            String(
                monthKey || ""
            )
        );

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

        return this.monthKey(
            new Date(
                year,
                month - 1 +
                    this.number(
                        difference
                    ),
                1
            )
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

        const count =
            Math.max(
                1,
                Math.floor(
                    this.number(
                        numberOfMonths
                    )
                )
            );

        const result = [];

        for (
            let index =
                count - 1;
            index >= 0;
            index -= 1
        ) {

            result.push(
                this.shiftMonthKey(
                    endMonthKey,
                    -index
                )
            );

        }

        return result;

    },

    allMonthKeys(
        data,
        endMonthKey = this.monthKey()
    ) {

        const keys =
            new Set();

        this.movements(data)
            .forEach(
                movement => {

                    const key =
                        this.movementMonthKey(
                            movement
                        );

                    if (
                        this.validMonthKey(
                            key
                        )
                    ) {

                        keys.add(key);

                    }

                }
            );

        this.recurringOccurrences(data)
            .forEach(
                occurrence => {

                    if (
                        this.validMonthKey(
                            occurrence.monthKey
                        )
                    ) {

                        keys.add(
                            occurrence.monthKey
                        );

                    }

                }
            );

        keys.add(endMonthKey);

        const ordered =
            Array.from(keys)
                .sort();

        const first =
            ordered[0] ||
            endMonthKey;

        const result = [];
        let current = first;

        while (
            current <= endMonthKey
        ) {

            result.push(current);

            current =
                this.shiftMonthKey(
                    current,
                    1
                );

        }

        return result;

    },

    movementMonthKey(movement) {

        return String(
            movement?.date || ""
        ).slice(
            0,
            7
        );

    },

    movementDay(movement) {

        const day =
            Number(
                String(
                    movement?.date || ""
                ).slice(
                    8,
                    10
                )
            );

        return Number.isFinite(day)
            ? day
            : null;

    },

    daysInMonth(monthKey) {

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

            return 31;

        }

        return new Date(
            year,
            month,
            0
        ).getDate();

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
                "debt_payment" ||
            movement?.type ===
                "debt_payment"
        ) {

            return "debt_payment";

        }

        if (
            movement?.kind ===
                "reimbursement" ||
            movement?.type ===
                "reimbursement"
        ) {

            return "reimbursement";

        }

        return (
            movement?.kind ||
            movement?.type ||
            ""
        );

    },

    isDebtPayment(movement) {

        return (
            this.movementKind(
                movement
            ) ===
            "debt_payment"
        );

    },

    isReimbursement(movement) {

        return (
            this.movementKind(
                movement
            ) ===
            "reimbursement"
        );

    },

    isNormalExpense(movement) {

        return (
            this.movementKind(
                movement
            ) ===
            "expense"
        );

    },

    expenseCountsForSavings(
        data,
        movement
    ) {

        return this.isNormalExpense(
            movement
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
                movement.toAccountId ||
                movement.debtAccountId
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
                movement.toAccountId ||
                movement.debtAccountId
            );

        return Boolean(
            account?.group ===
                "debt" &&
            account?.type !==
                "credit_card"
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

        const kind =
            this.movementKind(
                movement
            );

        if (
            kind === "expense"
        ) {

            const account =
                this.findAccount(
                    data,
                    movement.accountId
                );

            return (
                account?.group ===
                    "liquidity"
                    ? amount
                    : 0
            );

        }

        if (
            kind === "investment" ||
            kind === "debt_payment"
        ) {

            return amount;

        }

        if (
            kind === "transfer"
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

    movementCashInflow(
        data,
        movement
    ) {

        const kind =
            this.movementKind(
                movement
            );

        if (
            kind === "income" ||
            kind === "reimbursement"
        ) {

            return this.number(
                movement.amount
            );

        }

        return 0;

    },

    monthlyAmountByKind(
        data,
        monthKey,
        kind
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.movementKind(
                        movement
                    ) === kind
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

    monthlyIncome(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "income"
        );

    },

    monthlyGrossExpenses(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "expense"
        );

    },

    monthlyReimbursements(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "reimbursement"
        );

    },

    monthlyExpenses(
        data,
        monthKey = this.monthKey()
    ) {

        return (
            this.monthlyGrossExpenses(
                data,
                monthKey
            ) -
            this.monthlyReimbursements(
                data,
                monthKey
            )
        );

    },

    monthlyInvested(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "investment"
        );

    },

    monthlyDebtPayments(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "debt_payment"
        );

    },

    monthlyTransfers(
        data,
        monthKey = this.monthKey()
    ) {

        return this.monthlyAmountByKind(
            data,
            monthKey,
            "transfer"
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

    monthlyCashInflow(
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
                    this.movementCashInflow(
                        data,
                        movement
                    ),
                0
            );

    },

    monthlyCashResult(
        data,
        monthKey = this.monthKey()
    ) {

        return (
            this.monthlyCashInflow(
                data,
                monthKey
            ) -
            this.monthlyCashOutflow(
                data,
                monthKey
            )
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

    linkedExpenseMovement(
        data,
        movement
    ) {

        if (
            !movement
                ?.linkedMovementId
        ) {

            return null;

        }

        const linked =
            this.findMovement(
                data,
                movement.linkedMovementId
            );

        return (
            linked &&
            this.isNormalExpense(
                linked
            )
                ? linked
                : null
        );

    },

    categorySourceMovement(
        data,
        movement
    ) {

        if (
            movement?.categoryId ||
            movement?.subcategoryId
        ) {

            return movement;

        }

        return (
            this.linkedExpenseMovement(
                data,
                movement
            ) ||
            movement
        );

    },

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

    findExpenseCategory(
        data,
        categoryId
    ) {

        return this.expenseCatalog(data)
            .find(
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

        return (
            Array.isArray(
                category?.subcategories
            )
                ? category.subcategories
                    .find(
                        subcategory =>
                            subcategory.id ===
                            subcategoryId
                    ) || null
                : null
        );

    },

    movementCategoryId(
        data,
        movement
    ) {

        const source =
            this.categorySourceMovement(
                data,
                movement
            );

        if (
            source?.categoryId
        ) {

            return source.categoryId;

        }

        const text =
            String(
                source?.category || ""
            )
                .toLowerCase()
                .trim();

        if (!text) {

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
                                .toLowerCase()
                                .trim();

                        return (
                            text === name ||
                            text.includes(name)
                        );

                    }
                );

        return category?.id || null;

    },

    movementSubcategoryId(
        data,
        movement
    ) {

        const source =
            this.categorySourceMovement(
                data,
                movement
            );

        if (
            source?.subcategoryId
        ) {

            return source
                .subcategoryId;

        }

        const categoryId =
            this.movementCategoryId(
                data,
                source
            );

        const category =
            this.findExpenseCategory(
                data,
                categoryId
            );

        const text =
            String(
                source?.category || ""
            )
                .toLowerCase()
                .trim();

        const subcategory =
            (
                Array.isArray(
                    category?.subcategories
                )
                    ? category.subcategories
                    : []
            )
                .find(
                    item => {

                        const name =
                            String(
                                item.name || ""
                            )
                                .toLowerCase()
                                .trim();

                        return (
                            text === name ||
                            text.includes(name)
                        );

                    }
                );

        return subcategory?.id || null;

    },

    categoryDisplayName(
        data,
        movement
    ) {

        const categoryId =
            this.movementCategoryId(
                data,
                movement
            );

        const subcategoryId =
            this.movementSubcategoryId(
                data,
                movement
            );

        const category =
            this.findExpenseCategory(
                data,
                categoryId
            );

        const subcategory =
            this.findExpenseSubcategory(
                data,
                categoryId,
                subcategoryId
            );

        if (
            category &&
            subcategory
        ) {

            return (
                `${category.icon || ""} ` +
                `${category.name} · ` +
                `${subcategory.name}`
            ).trim();

        }

        if (category) {

            return (
                `${category.icon || ""} ` +
                category.name
            ).trim();

        }

        return (
            movement?.category ||
            "Otros gastos"
        );

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
                    this.isNormalExpense(
                        movement
                    )
            );

    },

    monthlyReimbursementMovements(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.isReimbursement(
                        movement
                    )
            );

    },

    categoryAccumulator(
        data,
        monthKey,
        level = "category"
    ) {

        const entries = {};

        const keyFor =
            movement => {

                const categoryId =
                    this.movementCategoryId(
                        data,
                        movement
                    ) ||
                    "other";

                const subcategoryId =
                    this.movementSubcategoryId(
                        data,
                        movement
                    ) ||
                    "other";

                return level ===
                    "subcategory"
                    ? `${categoryId}::${subcategoryId}`
                    : categoryId;

            };

        const ensure =
            movement => {

                const categoryId =
                    this.movementCategoryId(
                        data,
                        movement
                    ) ||
                    "other";

                const subcategoryId =
                    this.movementSubcategoryId(
                        data,
                        movement
                    ) ||
                    "other";

                const category =
                    this.findExpenseCategory(
                        data,
                        categoryId
                    );

                const subcategory =
                    this.findExpenseSubcategory(
                        data,
                        categoryId,
                        subcategoryId
                    );

                const key =
                    keyFor(movement);

                if (!entries[key]) {

                    entries[key] = {

                        key,

                        categoryId,

                        subcategoryId:
                            level ===
                                "subcategory"
                                ? subcategoryId
                                : null,

                        category:
                            category
                                ? (
                                    `${category.icon || ""} ` +
                                    category.name
                                ).trim()
                                : "Otros gastos",

                        subcategory:
                            subcategory
                                ?.name ||
                            "Otros",

                        label:
                            level ===
                                "subcategory"
                                ? (
                                    subcategory?.name ||
                                    this.categoryDisplayName(
                                        data,
                                        movement
                                    )
                                )
                                : (
                                    category
                                        ? (
                                            `${category.icon || ""} ` +
                                            category.name
                                        ).trim()
                                        : "Otros gastos"
                                ),

                        grossAmount:
                            0,

                        reimbursements:
                            0,

                        amount:
                            0,

                        movements:
                            0

                    };

                }

                return entries[key];

            };

        this.monthlyExpenseMovements(
            data,
            monthKey
        )
            .forEach(
                movement => {

                    const entry =
                        ensure(movement);

                    entry.grossAmount +=
                        this.number(
                            movement.amount
                        );

                    entry.movements += 1;

                }
            );

        this.monthlyReimbursementMovements(
            data,
            monthKey
        )
            .forEach(
                movement => {

                    const entry =
                        ensure(movement);

                    entry.reimbursements +=
                        this.number(
                            movement.amount
                        );

                }
            );

        return Object.values(entries)
            .map(
                entry => ({

                    ...entry,

                    amount:
                        entry.grossAmount -
                        entry.reimbursements

                })
            )
            .filter(
                entry =>
                    entry.grossAmount !==
                        0 ||
                    entry.reimbursements !==
                        0
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.amount -
                    first.amount
            );

    },

    expenseCategories(
        data,
        monthKey = this.monthKey()
    ) {

        return this.categoryAccumulator(
            data,
            monthKey,
            "category"
        );

    },

    expenseSubcategories(
        data,
        monthKey = this.monthKey()
    ) {

        return this.categoryAccumulator(
            data,
            monthKey,
            "subcategory"
        );

    },

    monthlyGrossExpenseForCategory(
        data,
        categoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseCategories(
                data,
                monthKey
            )
                .find(
                    category =>
                        category.categoryId ===
                        categoryId
                );

        return this.number(
            item?.grossAmount
        );

    },

    monthlyReimbursementForCategory(
        data,
        categoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseCategories(
                data,
                monthKey
            )
                .find(
                    category =>
                        category.categoryId ===
                        categoryId
                );

        return this.number(
            item?.reimbursements
        );

    },

    monthlyExpenseForCategory(
        data,
        categoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseCategories(
                data,
                monthKey
            )
                .find(
                    category =>
                        category.categoryId ===
                        categoryId
                );

        return this.number(
            item?.amount
        );

    },

    monthlyGrossExpenseForSubcategory(
        data,
        categoryId,
        subcategoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseSubcategories(
                data,
                monthKey
            )
                .find(
                    subcategory =>
                        subcategory.categoryId ===
                            categoryId &&
                        subcategory.subcategoryId ===
                            subcategoryId
                );

        return this.number(
            item?.grossAmount
        );

    },

    monthlyReimbursementForSubcategory(
        data,
        categoryId,
        subcategoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseSubcategories(
                data,
                monthKey
            )
                .find(
                    subcategory =>
                        subcategory.categoryId ===
                            categoryId &&
                        subcategory.subcategoryId ===
                            subcategoryId
                );

        return this.number(
            item?.reimbursements
        );

    },

    monthlyExpenseForSubcategory(
        data,
        categoryId,
        subcategoryId,
        monthKey = this.monthKey()
    ) {

        const item =
            this.expenseSubcategories(
                data,
                monthKey
            )
                .find(
                    subcategory =>
                        subcategory.categoryId ===
                            categoryId &&
                        subcategory.subcategoryId ===
                            subcategoryId
                );

        return this.number(
            item?.amount
        );

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

    findCategoryBudgetConfiguration(
        data,
        categoryId
    ) {

        return this
            .categoryBudgetConfigurations(
                data
            )
            .find(
                configuration =>
                    configuration.categoryId ===
                    categoryId
            ) || null;

    },

    findSubcategoryBudgetConfiguration(
        data,
        categoryId,
        subcategoryId
    ) {

        const configuration =
            this.findCategoryBudgetConfiguration(
                data,
                categoryId
            );

        return (
            Array.isArray(
                configuration
                    ?.subcategories
            )
                ? configuration
                    .subcategories
                    .find(
                        item =>
                            item.subcategoryId ===
                            subcategoryId
                    ) || null
                : null
        );

    },

    budgetAmount(
        configuration,
        monthlyIncome
    ) {

        if (
            !configuration ||
            configuration.active ===
                false
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
                    configuration
                        .fixedAmount
                )
            );

        }

        return monthlyIncome > 0
            ? (
                monthlyIncome *
                Math.max(
                    0,
                    this.number(
                        configuration
                            .targetPercent
                    )
                )
            ) / 100
            : 0;

    },

    recommendedBudgetAmount(
        configuration,
        monthlyIncome
    ) {

        if (
            !configuration ||
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

        const spentAmount =
            this.number(spent);

        const budgetAmount =
            this.number(budget);

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
            this.number(spent);

        const budgetAmount =
            this.number(budget);

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
            this.number(budget) -
            this.number(spent)
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
            (
                Array.isArray(
                    categoryBudget
                        ?.subcategories
                )
                    ? categoryBudget
                        .subcategories
                        .find(
                            item =>
                                item.subcategoryId ===
                                subcategory.id
                        )
                    : null
            ) || null;

        const grossSpent =
            this.monthlyGrossExpenseForSubcategory(
                data,
                category.id,
                subcategory.id,
                monthKey
            );

        const reimbursements =
            this.monthlyReimbursementForSubcategory(
                data,
                category.id,
                subcategory.id,
                monthKey
            );

        const spent =
            grossSpent -
            reimbursements;

        const budget =
            this.budgetAmount(
                configuration,
                monthlyIncome
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

            recommendedBudget:
                this.recommendedBudgetAmount(
                    configuration,
                    monthlyIncome
                ),

            grossSpent,

            reimbursements,

            spent,

            remaining:
                this.budgetRemaining(
                    spent,
                    budget
                ),

            usedPercent:
                this.budgetUsedPercent(
                    spent,
                    budget
                ),

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

        const grossSpent =
            this.monthlyGrossExpenseForCategory(
                data,
                category.id,
                monthKey
            );

        const reimbursements =
            this.monthlyReimbursementForCategory(
                data,
                category.id,
                monthKey
            );

        const spent =
            grossSpent -
            reimbursements;

        const budget =
            this.budgetAmount(
                configuration,
                monthlyIncome
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
                        this
                            .subcategoryBudgetSummary(
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

            recommendedBudget:
                this.recommendedBudgetAmount(
                    configuration,
                    monthlyIncome
                ),

            grossSpent,

            reimbursements,

            spent,

            remaining:
                this.budgetRemaining(
                    spent,
                    budget
                ),

            usedPercent:
                this.budgetUsedPercent(
                    spent,
                    budget
                ),

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

        const monthlyGrossExpenses =
            this.monthlyGrossExpenses(
                data,
                monthKey
            );

        const monthlyReimbursements =
            this.monthlyReimbursements(
                data,
                monthKey
            );

        const monthlyExpenses =
            monthlyGrossExpenses -
            monthlyReimbursements;

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

                        return monthlyIncome > 0
                            ? (
                                total +
                                (
                                    category.budget /
                                    monthlyIncome
                                ) *
                                100
                            )
                            : total;

                    }

                    return (
                        total +
                        this.number(
                            category
                                .targetPercent
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

        return {

            enabled:
                configuration.enabled !==
                false,

            monthKey,

            monthlyIncome,

            monthlyGrossExpenses,

            monthlyReimbursements,

            monthlyExpenses,

            totalBudget,

            totalGrossSpent:
                monthlyGrossExpenses,

            totalReimbursements:
                monthlyReimbursements,

            totalSpent:
                monthlyExpenses,

            budgetedSpent,

            unbudgetedSpent:
                monthlyExpenses -
                budgetedSpent,

            remaining:
                totalBudget -
                monthlyExpenses,

            usedPercent:
                this.budgetUsedPercent(
                    monthlyExpenses,
                    totalBudget
                ),

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

            savingAndInvestmentTargetAmount:
                monthlyIncome > 0
                    ? (
                        monthlyIncome *
                        savingAndInvestmentTargetPercent
                    ) / 100
                    : 0,

            thresholds:
                this.budgetThresholds(
                    data
                ),

            categories

        };

    },

    pendingOccurrencesForMonth(
        data,
        monthKey
    ) {

        return this.recurringOccurrences(
            data
        )
            .filter(
                occurrence =>
                    occurrence.monthKey ===
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

    pendingSummary(
        data,
        monthKey = this.monthKey()
    ) {

        const result = {

            income:
                0,

            expenses:
                0,

            invested:
                0,

            debtPayments:
                0,

            transfers:
                0,

            cashInflow:
                0,

            cashOutflow:
                0,

            cashResult:
                0,

            savingsImpact:
                0,

            count:
                0,

            possibleDuplicates:
                0,

            occurrences:
                []

        };

        const occurrences =
            this.pendingOccurrencesForMonth(
                data,
                monthKey
            );

        occurrences.forEach(
            occurrence => {

                const amount =
                    this.number(
                        occurrence
                            .expectedAmount
                    );

                const kind =
                    this.movementKind(
                        occurrence
                    );

                result.count += 1;

                if (
                    occurrence.status ===
                    "possible_duplicate"
                ) {

                    result
                        .possibleDuplicates +=
                        1;

                }

                if (
                    kind === "income"
                ) {

                    result.income += amount;
                    result.cashInflow +=
                        amount;

                }

                if (
                    kind === "expense"
                ) {

                    result.expenses += amount;

                    const account =
                        this.findAccount(
                            data,
                            occurrence.accountId
                        );

                    if (
                        account?.group ===
                        "liquidity"
                    ) {

                        result.cashOutflow +=
                            amount;

                    }

                }

                if (
                    kind === "investment"
                ) {

                    result.invested +=
                        amount;

                    result.cashOutflow +=
                        amount;

                }

                if (
                    kind ===
                    "debt_payment"
                ) {

                    result.debtPayments +=
                        amount;

                    result.cashOutflow +=
                        amount;

                }

                if (
                    kind === "transfer"
                ) {

                    result.transfers +=
                        amount;

                    const from =
                        this.findAccount(
                            data,
                            occurrence
                                .fromAccountId
                        );

                    const to =
                        this.findAccount(
                            data,
                            occurrence
                                .toAccountId
                        );

                    if (
                        from?.group ===
                            "liquidity" &&
                        to?.group ===
                            "debt"
                    ) {

                        result.cashOutflow +=
                            amount;

                    }

                }

            }
        );

        result.savingsImpact =
            result.income -
            result.expenses -
            result.invested;

        result.cashResult =
            result.cashInflow -
            result.cashOutflow;

        result.occurrences =
            occurrences
                .slice()
                .sort(
                    (
                        first,
                        second
                    ) =>
                        String(
                            first.expectedDate ||
                            ""
                        ).localeCompare(
                            String(
                                second.expectedDate ||
                                ""
                            )
                        )
                );

        return result;

    },

    forecastSummary(
        data,
        monthKey = this.monthKey()
    ) {

        const real =
            this.financialSummary(
                data,
                monthKey
            );

        const pending =
            this.pendingSummary(
                data,
                monthKey
            );

        const estimatedIncome =
            real.monthlyIncome +
            pending.income;

        const estimatedExpenses =
            real.monthlyExpenses +
            pending.expenses;

        const estimatedInvested =
            real.monthlyInvested +
            pending.invested;

        const estimatedSavings =
            estimatedIncome -
            estimatedExpenses -
            estimatedInvested;

        const estimatedSavingRate =
            estimatedIncome > 0
                ? (
                    estimatedSavings /
                    estimatedIncome
                ) * 100
                : 0;

        const estimatedCashInflow =
            real.monthlyCashInflow +
            pending.cashInflow;

        const estimatedCashOutflow =
            real.monthlyCashOutflow +
            pending.cashOutflow;

        return {

            monthKey,

            real,

            pending,

            estimated: {

                income:
                    estimatedIncome,

                grossExpenses:
                    real.monthlyGrossExpenses +
                    pending.expenses,

                reimbursements:
                    real.monthlyReimbursements,

                expenses:
                    estimatedExpenses,

                invested:
                    estimatedInvested,

                debtPayments:
                    real.monthlyDebtPayments +
                    pending.debtPayments,

                transfers:
                    real.monthlyTransfers +
                    pending.transfers,

                savings:
                    estimatedSavings,

                savingRate:
                    estimatedSavingRate,

                cashInflow:
                    estimatedCashInflow,

                cashOutflow:
                    estimatedCashOutflow,

                cashResult:
                    estimatedCashInflow -
                    estimatedCashOutflow

            }

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

            return current === 0
                ? 0
                : null;

        }

        return (
            (
                current -
                previous
            ) /
            Math.abs(previous)
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

        const monthlyIncome =
            this.monthlyIncome(
                data,
                monthKey
            );

        const monthlyGrossExpenses =
            this.monthlyGrossExpenses(
                data,
                monthKey
            );

        const monthlyReimbursements =
            this.monthlyReimbursements(
                data,
                monthKey
            );

        const monthlyExpenses =
            monthlyGrossExpenses -
            monthlyReimbursements;

        const monthlyInvested =
            this.monthlyInvested(
                data,
                monthKey
            );

        const monthlyDebtPayments =
            this.monthlyDebtPayments(
                data,
                monthKey
            );

        const monthlyTransfers =
            this.monthlyTransfers(
                data,
                monthKey
            );

        const monthlyCashInflow =
            this.monthlyCashInflow(
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

        const compare =
            property =>
                this.metricComparison(
                    current[property],
                    previous[property]
                );

        return {

            monthKey,

            previousMonthKey,

            income:
                compare(
                    "monthlyIncome"
                ),

            grossExpenses:
                compare(
                    "monthlyGrossExpenses"
                ),

            reimbursements:
                compare(
                    "monthlyReimbursements"
                ),

            expenses:
                compare(
                    "monthlyExpenses"
                ),

            invested:
                compare(
                    "monthlyInvested"
                ),

            debtPayments:
                compare(
                    "monthlyDebtPayments"
                ),

            transfers:
                compare(
                    "monthlyTransfers"
                ),

            cashInflow:
                compare(
                    "monthlyCashInflow"
                ),

            cashOutflow:
                compare(
                    "monthlyCashOutflow"
                ),

            cashResult:
                compare(
                    "monthlyCashResult"
                ),

            savings:
                compare(
                    "monthlySavings"
                ),

            savingRate:
                compare(
                    "monthlySavingRate"
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
                ),

            subcategories:
                this.expenseSubcategories(
                    data,
                    monthKey
                ),

            previousSubcategories:
                this.expenseSubcategories(
                    data,
                    previousMonthKey
                )

        };

    },

    average(values) {

        const numbers =
            values.map(
                value =>
                    this.number(value)
            );

        if (
            numbers.length === 0
        ) {

            return 0;

        }

        return numbers.reduce(
            (
                total,
                value
            ) =>
                total +
                value,
            0
        ) / numbers.length;

    },

    median(values) {

        const numbers =
            values
                .map(
                    value =>
                        this.number(value)
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        first -
                        second
                );

        if (
            numbers.length === 0
        ) {

            return 0;

        }

        const middle =
            Math.floor(
                numbers.length / 2
            );

        return numbers.length % 2
            ? numbers[middle]
            : (
                numbers[middle - 1] +
                numbers[middle]
            ) / 2;

    },

    standardDeviation(values) {

        if (
            !Array.isArray(values) ||
            values.length === 0
        ) {

            return 0;

        }

        const average =
            this.average(values);

        const variance =
            this.average(
                values.map(
                    value =>
                        (
                            this.number(value) -
                            average
                        ) ** 2
                )
            );

        return Math.sqrt(
            variance
        );

    },

    coefficientOfVariation(values) {

        const average =
            Math.abs(
                this.average(values)
            );

        if (
            average === 0
        ) {

            return 0;

        }

        return (
            this.standardDeviation(
                values
            ) /
            average
        ) * 100;

    },

    maximumItem(
        items,
        property
    ) {

        return (
            Array.isArray(items) &&
            items.length > 0
                ? items.reduce(
                    (
                        current,
                        item
                    ) =>
                        !current ||
                        this.number(
                            item[property]
                        ) >
                        this.number(
                            current[property]
                        )
                            ? item
                            : current,
                    null
                )
                : null
        );

    },

    minimumItem(
        items,
        property
    ) {

        return (
            Array.isArray(items) &&
            items.length > 0
                ? items.reduce(
                    (
                        current,
                        item
                    ) =>
                        !current ||
                        this.number(
                            item[property]
                        ) <
                        this.number(
                            current[property]
                        )
                            ? item
                            : current,
                    null
                )
                : null
        );

    },

    bestMonth(
        months,
        property
    ) {

        return this.maximumItem(
            months,
            property
        );

    },

    worstMonth(
        months,
        property
    ) {

        return this.minimumItem(
            months,
            property
        );

    },

    largestMovementByKind(
        data,
        monthKey,
        kind
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .filter(
                movement =>
                    this.movementKind(
                        movement
                    ) === kind
            )
            .reduce(
                (
                    current,
                    movement
                ) =>
                    !current ||
                    this.number(
                        movement.amount
                    ) >
                    this.number(
                        current.amount
                    )
                        ? movement
                        : current,
                null
            );

    },

    accountUsage(
        data,
        monthKey
    ) {

        const counts = {};

        this.movementsForMonth(
            data,
            monthKey
        )
            .forEach(
                movement => {

                    [
                        movement.accountId,
                        movement.fromAccountId,
                        movement.toAccountId,
                        movement.debtAccountId
                    ]
                        .filter(Boolean)
                        .forEach(
                            accountId => {

                                counts[accountId] =
                                    (
                                        counts[
                                            accountId
                                        ] || 0
                                    ) + 1;

                            }
                        );

                }
            );

        const entries =
            Object.entries(counts)
                .sort(
                    (
                        first,
                        second
                    ) =>
                        second[1] -
                        first[1]
                );

        const first =
            entries[0];

        if (!first) {

            return null;

        }

        return {

            accountId:
                first[0],

            account:
                this.findAccount(
                    data,
                    first[0]
                ),

            count:
                first[1]

        };

    },

    dailyActivity(
        data,
        monthKey = this.monthKey()
    ) {

        const days =
            Array.from(
                {
                    length:
                        this.daysInMonth(
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

        this.movementsForMonth(
            data,
            monthKey
        )
            .forEach(
                movement => {

                    const day =
                        this.movementDay(
                            movement
                        );

                    if (
                        !day ||
                        !days[day - 1]
                    ) {

                        return;

                    }

                    const item =
                        days[day - 1];

                    const amount =
                        this.number(
                            movement.amount
                        );

                    const kind =
                        this.movementKind(
                            movement
                        );

                    item.movements += 1;

                    if (
                        kind === "income"
                    ) {

                        item.income +=
                            amount;

                    }

                    if (
                        kind === "expense"
                    ) {

                        item.grossExpenses +=
                            amount;

                    }

                    if (
                        kind ===
                        "reimbursement"
                    ) {

                        item.reimbursements +=
                            amount;

                    }

                    if (
                        kind === "investment"
                    ) {

                        item.invested +=
                            amount;

                    }

                    if (
                        kind ===
                        "debt_payment"
                    ) {

                        item.debtPayments +=
                            amount;

                    }

                    item.cashOutflow +=
                        this.movementCashOutflow(
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

    },

    longestActiveStreak(
        dailyActivity
    ) {

        let current = 0;
        let longest = 0;

        dailyActivity.forEach(
            day => {

                if (
                    day.movements > 0
                ) {

                    current += 1;

                    longest =
                        Math.max(
                            longest,
                            current
                        );

                } else {

                    current = 0;

                }

            }
        );

        return longest;

    },

    monthlyActivitySummary(
        data,
        monthKey = this.monthKey()
    ) {

        const movements =
            this.movementsForMonth(
                data,
                monthKey
            );

        const expenses =
            movements
                .filter(
                    movement =>
                        this.isNormalExpense(
                            movement
                        )
                )
                .map(
                    movement =>
                        this.number(
                            movement.amount
                        )
                );

        const daily =
            this.dailyActivity(
                data,
                monthKey
            );

        const activeDays =
            daily.filter(
                day =>
                    day.movements > 0
            );

        const highestExpenseDay =
            this.maximumItem(
                daily,
                "expenses"
            );

        return {

            monthKey,

            movements:
                movements.length,

            activeDays:
                activeDays.length,

            longestActiveStreak:
                this.longestActiveStreak(
                    daily
                ),

            averageExpense:
                this.average(
                    expenses
                ),

            medianExpense:
                this.median(
                    expenses
                ),

            highestIncome:
                this.largestMovementByKind(
                    data,
                    monthKey,
                    "income"
                ),

            highestExpense:
                this.largestMovementByKind(
                    data,
                    monthKey,
                    "expense"
                ),

            highestReimbursement:
                this.largestMovementByKind(
                    data,
                    monthKey,
                    "reimbursement"
                ),

            highestInvestment:
                this.largestMovementByKind(
                    data,
                    monthKey,
                    "investment"
                ),

            highestDebtPayment:
                this.largestMovementByKind(
                    data,
                    monthKey,
                    "debt_payment"
                ),

            highestExpenseDay,

            mostUsedAccount:
                this.accountUsage(
                    data,
                    monthKey
                ),

            daily

        };

    },

    trendMonths(
        data,
        period = 6,
        endMonthKey = this.monthKey()
    ) {

        const keys =
            period === "all"
                ? this.allMonthKeys(
                    data,
                    endMonthKey
                )
                : this.monthKeys(
                    endMonthKey,
                    period
                );

        return keys.map(
            monthKey => {

                const summary =
                    this.financialSummary(
                        data,
                        monthKey
                    );

                const budget =
                    this.budgetSummary(
                        data,
                        monthKey
                    );

                return {

                    monthKey,

                    income:
                        summary.monthlyIncome,

                    grossExpenses:
                        summary.monthlyGrossExpenses,

                    reimbursements:
                        summary.monthlyReimbursements,

                    expenses:
                        summary.monthlyExpenses,

                    invested:
                        summary.monthlyInvested,

                    debtPayments:
                        summary.monthlyDebtPayments,

                    transfers:
                        summary.monthlyTransfers,

                    cashInflow:
                        summary.monthlyCashInflow,

                    cashOutflow:
                        summary.monthlyCashOutflow,

                    cashResult:
                        summary.monthlyCashResult,

                    savings:
                        summary.monthlySavings,

                    savingRate:
                        summary.monthlySavingRate,

                    movements:
                        this.movementsForMonth(
                            data,
                            monthKey
                        ).length,

                    budget:
                        budget.totalBudget,

                    budgetUsedPercent:
                        budget.usedPercent,

                    budgetRemaining:
                        budget.remaining,

                    budgetStatus:
                        budget.status

                };

            }
        );

    },

    trendCategoryTotals(
        data,
        monthKeys,
        level = "category"
    ) {

        const totals = {};

        monthKeys.forEach(
            monthKey => {

                const items =
                    level ===
                        "subcategory"
                        ? this.expenseSubcategories(
                            data,
                            monthKey
                        )
                        : this.expenseCategories(
                            data,
                            monthKey
                        );

                items.forEach(
                    item => {

                        const key =
                            item.key ||
                            item.categoryId ||
                            item.label;

                        if (!totals[key]) {

                            totals[key] = {

                                ...item,

                                grossAmount:
                                    0,

                                reimbursements:
                                    0,

                                amount:
                                    0,

                                monthsWithActivity:
                                    0,

                                monthly:
                                    []

                            };

                        }

                        totals[key]
                            .grossAmount +=
                            this.number(
                                item.grossAmount
                            );

                        totals[key]
                            .reimbursements +=
                            this.number(
                                item.reimbursements
                            );

                        totals[key]
                            .amount +=
                            this.number(
                                item.amount
                            );

                        if (
                            this.number(
                                item.amount
                            ) !== 0
                        ) {

                            totals[key]
                                .monthsWithActivity +=
                                1;

                        }

                        totals[key]
                            .monthly
                            .push({

                                monthKey,

                                amount:
                                    this.number(
                                        item.amount
                                    ),

                                grossAmount:
                                    this.number(
                                        item
                                            .grossAmount
                                    ),

                                reimbursements:
                                    this.number(
                                        item
                                            .reimbursements
                                    )

                            });

                    }
                );

            }
        );

        Object.values(totals)
            .forEach(
                item => {

                    const existing =
                        new Map(
                            item.monthly.map(
                                month => [
                                    month.monthKey,
                                    month
                                ]
                            )
                        );

                    item.monthly =
                        monthKeys.map(
                            monthKey =>
                                existing.get(
                                    monthKey
                                ) || {

                                    monthKey,

                                    amount:
                                        0,

                                    grossAmount:
                                        0,

                                    reimbursements:
                                        0

                                }
                        );

                    item.average =
                        this.average(
                            item.monthly.map(
                                month =>
                                    month.amount
                            )
                        );

                    item.maximum =
                        this.maximumItem(
                            item.monthly,
                            "amount"
                        );

                    item.minimum =
                        this.minimumItem(
                            item.monthly,
                            "amount"
                        );

                }
            );

        return Object.values(totals)
            .sort(
                (
                    first,
                    second
                ) =>
                    second.amount -
                    first.amount
            );

    },

    movingAverage(
        values,
        windowSize = 3
    ) {

        const size =
            Math.max(
                1,
                Math.floor(
                    this.number(
                        windowSize
                    )
                )
            );

        return values.map(
            (
                value,
                index
            ) => {

                const start =
                    Math.max(
                        0,
                        index -
                        size +
                        1
                    );

                return this.average(
                    values.slice(
                        start,
                        index + 1
                    )
                );

            }
        );

    },

    linearTrend(values) {

        const numbers =
            values.map(
                value =>
                    this.number(value)
            );

        const count =
            numbers.length;

        if (
            count < 2
        ) {

            return {

                slope:
                    0,

                start:
                    numbers[0] || 0,

                end:
                    numbers[0] || 0,

                change:
                    0,

                percentage:
                    0

            };

        }

        const averageX =
            (
                count - 1
            ) / 2;

        const averageY =
            this.average(
                numbers
            );

        let numerator = 0;
        let denominator = 0;

        numbers.forEach(
            (
                value,
                index
            ) => {

                numerator +=
                    (
                        index -
                        averageX
                    ) *
                    (
                        value -
                        averageY
                    );

                denominator +=
                    (
                        index -
                        averageX
                    ) ** 2;

            }
        );

        const slope =
            denominator > 0
                ? numerator /
                    denominator
                : 0;

        const start =
            averageY -
            slope *
            averageX;

        const end =
            start +
            slope *
            (
                count - 1
            );

        return {

            slope,

            start,

            end,

            change:
                end -
                start,

            percentage:
                this.percentageChange(
                    end,
                    start
                )

        };

    },

    trendClassification(
        values,
        positiveIsGood = true
    ) {

        const trend =
            this.linearTrend(
                values
            );

        const average =
            Math.abs(
                this.average(
                    values
                )
            );

        const relativeSlope =
            average > 0
                ? (
                    trend.slope /
                    average
                ) * 100
                : 0;

        const adjusted =
            positiveIsGood
                ? relativeSlope
                : -relativeSlope;

        let key =
            "stable";

        if (
            adjusted >= 8
        ) {

            key =
                "strong_improvement";

        } else if (
            adjusted >= 2
        ) {

            key =
                "improvement";

        } else if (
            adjusted <= -8
        ) {

            key =
                "strong_decline";

        } else if (
            adjusted <= -2
        ) {

            key =
                "decline";

        }

        return {

            key,

            relativeSlope,

            trend

        };

    },

    metricStatistics(
        months,
        property,
        options = {}
    ) {

        const values =
            months.map(
                month =>
                    this.number(
                        month[property]
                    )
            );

        const total =
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum +
                    value,
                0
            );

        const average =
            this.average(
                values
            );

        const maximum =
            this.maximumItem(
                months,
                property
            );

        const minimum =
            this.minimumItem(
                months,
                property
            );

        const latest =
            months[
                months.length - 1
            ] || null;

        const previous =
            months[
                months.length - 2
            ] || null;

        const movingAverage =
            this.movingAverage(
                values,
                3
            );

        return {

            property,

            count:
                values.length,

            total:
                options.rate
                    ? null
                    : total,

            average,

            median:
                this.median(
                    values
                ),

            maximum,

            minimum,

            range:
                this.number(
                    maximum?.[
                        property
                    ]
                ) -
                this.number(
                    minimum?.[
                        property
                    ]
                ),

            standardDeviation:
                this.standardDeviation(
                    values
                ),

            volatility:
                this.coefficientOfVariation(
                    values
                ),

            latest,

            previous,

            latestComparison:
                this.metricComparison(
                    latest?.[
                        property
                    ],
                    previous?.[
                        property
                    ]
                ),

            monthsAboveAverage:
                values.filter(
                    value =>
                        value >
                        average
                ).length,

            monthsBelowAverage:
                values.filter(
                    value =>
                        value <
                        average
                ).length,

            movingAverage:
                months.map(
                    (
                        month,
                        index
                    ) => ({

                        monthKey:
                            month.monthKey,

                        value:
                            movingAverage[
                                index
                            ]

                    })
                ),

            classification:
                this.trendClassification(
                    values,
                    options
                        .positiveIsGood !==
                        false
                )

        };

    },

    periodComparison(
        data,
        period = 6,
        endMonthKey = this.monthKey()
    ) {

        const count =
            period === "all"
                ? this.allMonthKeys(
                    data,
                    endMonthKey
                ).length
                : Math.max(
                    1,
                    this.number(
                        period
                    )
                );

        const currentMonths =
            this.trendMonths(
                data,
                count,
                endMonthKey
            );

        const previousEnd =
            this.shiftMonthKey(
                currentMonths[0]
                    ?.monthKey ||
                    endMonthKey,
                -1
            );

        const previousMonths =
            this.trendMonths(
                data,
                count,
                previousEnd
            );

        const total =
            (
                months,
                property
            ) =>
                months.reduce(
                    (
                        sum,
                        month
                    ) =>
                        sum +
                        this.number(
                            month[property]
                        ),
                    0
                );

        const average =
            (
                months,
                property
            ) =>
                this.average(
                    months.map(
                        month =>
                            month[property]
                    )
                );

        const compareTotal =
            property =>
                this.metricComparison(
                    total(
                        currentMonths,
                        property
                    ),
                    total(
                        previousMonths,
                        property
                    )
                );

        return {

            count,

            currentStart:
                currentMonths[0]
                    ?.monthKey ||
                endMonthKey,

            currentEnd:
                endMonthKey,

            previousStart:
                previousMonths[0]
                    ?.monthKey ||
                previousEnd,

            previousEnd,

            income:
                compareTotal(
                    "income"
                ),

            grossExpenses:
                compareTotal(
                    "grossExpenses"
                ),

            reimbursements:
                compareTotal(
                    "reimbursements"
                ),

            expenses:
                compareTotal(
                    "expenses"
                ),

            invested:
                compareTotal(
                    "invested"
                ),

            debtPayments:
                compareTotal(
                    "debtPayments"
                ),

            cashOutflow:
                compareTotal(
                    "cashOutflow"
                ),

            cashResult:
                compareTotal(
                    "cashResult"
                ),

            savings:
                compareTotal(
                    "savings"
                ),

            savingRate:
                this.metricComparison(
                    average(
                        currentMonths,
                        "savingRate"
                    ),
                    average(
                        previousMonths,
                        "savingRate"
                    )
                )

        };

    },

    budgetTrendSummary(
        data,
        monthKeys
    ) {

        const months =
            monthKeys.map(
                monthKey => {

                    const summary =
                        this.budgetSummary(
                            data,
                            monthKey
                        );

                    return {

                        monthKey,

                        budget:
                            summary.totalBudget,

                        spent:
                            summary.totalSpent,

                        remaining:
                            summary.remaining,

                        usedPercent:
                            summary.usedPercent,

                        status:
                            summary.status

                    };

                }
            );

        const validPercentages =
            months
                .map(
                    month =>
                        month.usedPercent
                )
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined
                );

        return {

            months,

            withinBudget:
                months.filter(
                    month =>
                        [
                            "healthy",
                            "warning"
                        ].includes(
                            month.status
                        )
                ).length,

            exceeded:
                months.filter(
                    month =>
                        month.status ===
                        "exceeded" ||
                        month.status ===
                        "unbudgeted"
                ).length,

            averageUsedPercent:
                this.average(
                    validPercentages
                ),

            averageDeviation:
                this.average(
                    months.map(
                        month =>
                            -month.remaining
                    )
                ),

            bestMargin:
                this.maximumItem(
                    months,
                    "remaining"
                ),

            worstDeviation:
                this.minimumItem(
                    months,
                    "remaining"
                )

        };

    },

    consistencySummary(
        months,
        options = {}
    ) {

        const savingRateTarget =
            this.number(
                options.savingRateTarget
            );

        return {

            months:
                months.length,

            positiveSavings:
                months.filter(
                    month =>
                        month.savings > 0
                ).length,

            withinBudget:
                months.filter(
                    month =>
                        [
                            "healthy",
                            "warning"
                        ].includes(
                            month.budgetStatus
                        )
                ).length,

            withInvestment:
                months.filter(
                    month =>
                        month.invested > 0
                ).length,

            withDebtPayments:
                months.filter(
                    month =>
                        month.debtPayments >
                        0
                ).length,

            savingTargetMet:
                months.filter(
                    month =>
                        month.savingRate >=
                        savingRateTarget
                ).length,

            expenseVolatility:
                this.coefficientOfVariation(
                    months.map(
                        month =>
                            month.expenses
                    )
                ),

            savingsVolatility:
                this.coefficientOfVariation(
                    months.map(
                        month =>
                            month.savings
                    )
                ),

            investmentRegularity:
                months.length > 0
                    ? (
                        months.filter(
                            month =>
                                month.invested >
                                0
                        ).length /
                        months.length
                    ) * 100
                    : 0

        };

    },

    investmentTrendSummary(months) {

        const activeMonths =
            months.filter(
                month =>
                    month.invested > 0
            );

        const total =
            months.reduce(
                (
                    sum,
                    month
                ) =>
                    sum +
                    month.invested,
                0
            );

        const income =
            months.reduce(
                (
                    sum,
                    month
                ) =>
                    sum +
                    month.income,
                0
            );

        return {

            total,

            average:
                this.average(
                    months.map(
                        month =>
                            month.invested
                    )
                ),

            maximum:
                this.maximumItem(
                    months,
                    "invested"
                ),

            monthsWithInvestment:
                activeMonths.length,

            monthsWithoutInvestment:
                months.length -
                activeMonths.length,

            regularity:
                months.length > 0
                    ? (
                        activeMonths.length /
                        months.length
                    ) * 100
                    : 0,

            incomeShare:
                income > 0
                    ? (
                        total /
                        income
                    ) * 100
                    : 0,

            classification:
                this.trendClassification(
                    months.map(
                        month =>
                            month.invested
                    ),
                    true
                )

        };

    },

    debtTrendSummary(
        data,
        months
    ) {

        const activeMonths =
            months.filter(
                month =>
                    month.debtPayments > 0
            );

        const total =
            months.reduce(
                (
                    sum,
                    month
                ) =>
                    sum +
                    month.debtPayments,
                0
            );

        return {

            total,

            average:
                this.average(
                    months.map(
                        month =>
                            month.debtPayments
                    )
                ),

            maximum:
                this.maximumItem(
                    months,
                    "debtPayments"
                ),

            monthsWithPayments:
                activeMonths.length,

            currentDebt:
                this.totalDebt(
                    data
                ),

            classification:
                this.trendClassification(
                    months.map(
                        month =>
                            month.debtPayments
                    ),
                    true
                )

        };

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

        const totalFor =
            property =>
                months.reduce(
                    (
                        total,
                        month
                    ) =>
                        total +
                        this.number(
                            month[property]
                        ),
                    0
                );

        const averageFor =
            property =>
                this.average(
                    months.map(
                        month =>
                            month[property]
                    )
                );

        const totals = {

            income:
                totalFor(
                    "income"
                ),

            grossExpenses:
                totalFor(
                    "grossExpenses"
                ),

            reimbursements:
                totalFor(
                    "reimbursements"
                ),

            expenses:
                totalFor(
                    "expenses"
                ),

            invested:
                totalFor(
                    "invested"
                ),

            debtPayments:
                totalFor(
                    "debtPayments"
                ),

            transfers:
                totalFor(
                    "transfers"
                ),

            cashInflow:
                totalFor(
                    "cashInflow"
                ),

            cashOutflow:
                totalFor(
                    "cashOutflow"
                ),

            cashResult:
                totalFor(
                    "cashResult"
                ),

            savings:
                totalFor(
                    "savings"
                )

        };

        const averages = {

            income:
                averageFor(
                    "income"
                ),

            grossExpenses:
                averageFor(
                    "grossExpenses"
                ),

            reimbursements:
                averageFor(
                    "reimbursements"
                ),

            expenses:
                averageFor(
                    "expenses"
                ),

            invested:
                averageFor(
                    "invested"
                ),

            debtPayments:
                averageFor(
                    "debtPayments"
                ),

            cashInflow:
                averageFor(
                    "cashInflow"
                ),

            cashOutflow:
                averageFor(
                    "cashOutflow"
                ),

            cashResult:
                averageFor(
                    "cashResult"
                ),

            savings:
                averageFor(
                    "savings"
                ),

            savingRate:
                averageFor(
                    "savingRate"
                )

        };

        const statistics = {

            income:
                this.metricStatistics(
                    months,
                    "income"
                ),

            grossExpenses:
                this.metricStatistics(
                    months,
                    "grossExpenses",
                    {
                        positiveIsGood:
                            false
                    }
                ),

            reimbursements:
                this.metricStatistics(
                    months,
                    "reimbursements"
                ),

            expenses:
                this.metricStatistics(
                    months,
                    "expenses",
                    {
                        positiveIsGood:
                            false
                    }
                ),

            invested:
                this.metricStatistics(
                    months,
                    "invested"
                ),

            debtPayments:
                this.metricStatistics(
                    months,
                    "debtPayments"
                ),

            cashOutflow:
                this.metricStatistics(
                    months,
                    "cashOutflow",
                    {
                        positiveIsGood:
                            false
                    }
                ),

            cashResult:
                this.metricStatistics(
                    months,
                    "cashResult"
                ),

            savings:
                this.metricStatistics(
                    months,
                    "savings"
                ),

            savingRate:
                this.metricStatistics(
                    months,
                    "savingRate",
                    {
                        rate:
                            true
                    }
                )

        };

        const budgetConfiguration =
            this.budgetConfiguration(
                data
            );

        return {

            period:
                period === "all"
                    ? "all"
                    : Number(period),

            startMonthKey:
                monthKeys[0] ||
                endMonthKey,

            endMonthKey,

            months,

            totals,

            averages,

            statistics,

            comparison:
                this.periodComparison(
                    data,
                    months.length,
                    endMonthKey
                ),

            budget:
                this.budgetTrendSummary(
                    data,
                    monthKeys
                ),

            consistency:
                this.consistencySummary(
                    months,
                    {
                        savingRateTarget:
                            budgetConfiguration
                                .savingAndInvestmentTargetPercent ||
                            0
                    }
                ),

            investment:
                this.investmentTrendSummary(
                    months
                ),

            debt:
                this.debtTrendSummary(
                    data,
                    months
                ),

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

            highestIncomeMonth:
                this.bestMonth(
                    months,
                    "income"
                ),

            highestInvestmentMonth:
                this.bestMonth(
                    months,
                    "invested"
                ),

            highestDebtPaymentMonth:
                this.bestMonth(
                    months,
                    "debtPayments"
                ),

            highestCashOutflowMonth:
                this.bestMonth(
                    months,
                    "cashOutflow"
                ),

            bestSavingRateMonth:
                this.bestMonth(
                    months,
                    "savingRate"
                ),

            categories:
                this.trendCategoryTotals(
                    data,
                    monthKeys,
                    "category"
                ),

            subcategories:
                this.trendCategoryTotals(
                    data,
                    monthKeys,
                    "subcategory"
                )

        };

    }

};

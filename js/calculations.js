/* ==========================================================
   ATLAS
   calculations.js
   Sprint 2.4 — Cálculos financieros correctos
========================================================== */

const AtlasCalculations = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    accountGroup(data, group) {

        return data.accounts.filter(
            account =>
                account.group === group
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
                (total, account) =>
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
                (total, account) =>
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
                (total, account) =>
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
                (total, account) =>
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

    monthKey(date = new Date()) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        return `${year}-${month}`;

    },

    movementMonthKey(movement) {

        return String(
            movement.date || ""
        ).slice(0, 7);

    },

    movementsForMonth(
        data,
        monthKey = this.monthKey()
    ) {

        return data.movements.filter(
            movement =>
                this.movementMonthKey(
                    movement
                ) === monthKey
        );

    },

    isDebtPayment(movement) {

        return (
            movement.kind ===
            "debt_payment"
        );

    },

    isCreditCardSettlement(movement) {

        if (
            !this.isDebtPayment(
                movement
            )
        ) {
            return false;
        }

        return (
            movement.toAccountId ===
                "amex" ||
            movement.toAccountId ===
                "bbva_credit"
        );

    },

    isLoanPayment(movement) {

        if (
            !this.isDebtPayment(
                movement
            )
        ) {
            return false;
        }

        return (
            movement.toAccountId ===
            "loan_car"
        );

    },

    isNormalExpense(movement) {

        return (
            movement.type ===
                "expense" &&
            !this.isDebtPayment(
                movement
            )
        );

    },

    expenseCountsForSavings(
        movement
    ) {

        /*
           Una compra con Amex o tarjeta BBVA
           ya cuenta como gasto cuando se registra.

           Pagar después la tarjeta es solo
           liquidar una deuda y no debe contar
           una segunda vez.

           La cuota del préstamo del coche sí
           cuenta como gasto mensual.
        */

        if (
            this.isCreditCardSettlement(
                movement
            )
        ) {
            return false;
        }

        if (
            this.isLoanPayment(
                movement
            )
        ) {
            return true;
        }

        return this.isNormalExpense(
            movement
        );

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
                (total, movement) =>
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
                        movement
                    )
            )
            .reduce(
                (total, movement) =>
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
                (total, movement) =>
                    total +
                    this.number(
                        movement.amount
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

        if (income <= 0) {
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

    investmentGain(data) {

        return (
            this.totalInvestments(data) -
            this.totalInvestedCapital(data)
        );

    },

    investmentReturn(data) {

        const investedCapital =
            this.totalInvestedCapital(data);

        if (investedCapital <= 0) {
            return 0;
        }

        return (
            this.investmentGain(data) /
            investedCapital
        ) * 100;

    },

    financialSummary(
        data,
        monthKey = this.monthKey()
    ) {

        const liquidity =
            this.totalLiquidity(data);

        const investments =
            this.totalInvestments(data);

        const investedCapital =
            this.totalInvestedCapital(
                data
            );

        const investmentGain =
            investments -
            investedCapital;

        const debt =
            this.totalDebt(data);

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
            monthlySavings,
            monthlySavingRate,

            monthKey

        };

    }

};

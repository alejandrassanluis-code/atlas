/* ==========================================================
   ATLAS
   calculations.js
   Sprint 2.5 — Gastos y salidas de caja
========================================================== */

const AtlasCalculations = {

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    findAccount(data, accountId) {

        return data.accounts.find(
            account =>
                account.id === accountId
        );

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

    expenseCountsForSavings(movement) {

        /*
           Las compras con tarjeta cuentan
           como gasto en la fecha de compra.

           La liquidación posterior de Amex
           o tarjeta BBVA no vuelve a contar.

           La cuota del préstamo del coche
           sí cuenta como gasto mensual.
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

    movementCashOutflow(
        data,
        movement
    ) {

        const amount =
            this.number(
                movement.amount
            );

        /*
           Gasto pagado directamente
           desde una cuenta de liquidez.
        */

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

            /*
               Una compra con tarjeta aumenta
               deuda, pero todavía no provoca
               salida de dinero del banco.
            */

            return 0;

        }

        /*
           Toda inversión desde liquidez
           representa una salida de caja,
           aunque no sea un gasto.
        */

        if (
            movement.type ===
            "investment"
        ) {
            return amount;
        }

        /*
           El pago de cualquier deuda desde
           liquidez sí es salida de caja.

           En tarjetas no vuelve a contar
           como gasto.

           En el préstamo del coche también
           cuenta como gasto mensual.
        */

        if (
            this.isDebtPayment(
                movement
            )
        ) {
            return amount;
        }

        /*
           Un traspaso entre cuentas de
           liquidez no cambia la caja total.

           Un traspaso hacia una deuda sí
           representa dinero que sale de
           las cuentas disponibles.
        */

        if (
            movement.type ===
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

    monthlyCashOutflow(
        data,
        monthKey = this.monthKey()
    ) {

        return this.movementsForMonth(
            data,
            monthKey
        )
            .reduce(
                (total, movement) =>
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

            monthKey

        };

    }

};

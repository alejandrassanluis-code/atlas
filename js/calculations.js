/* ==========================================================
   ATLAS
   calculations.js
   Cálculos financieros principales
========================================================== */

const AtlasCalculations = {

    number(value) {
        return Number(value) || 0;
    },

    accountsByGroup(data, group) {
        return data.accounts.filter(
            account => account.group === group
        );
    },

    totalLiquidity(data) {
        return this.accountsByGroup(data, "liquidity")
            .reduce(
                (total, account) =>
                    total + this.number(account.balance),
                0
            );
    },

    totalInvestments(data) {
        return this.accountsByGroup(data, "investment")
            .reduce(
                (total, account) =>
                    total + this.number(account.balance),
                0
            );
    },

    totalDebt(data) {
        return this.accountsByGroup(data, "debt")
            .reduce(
                (total, account) =>
                    total + Math.abs(
                        this.number(account.balance)
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

    movementDate(movement) {
        return new Date(
            `${movement.date}T12:00:00`
        );
    },

    movementsForMonth(data, year, month) {
        return data.movements.filter(movement => {

            if (!movement.date) {
                return false;
            }

            const date =
                this.movementDate(movement);

            return (
                date.getFullYear() === year &&
                date.getMonth() === month
            );

        });
    },

    currentMonthMovements(data) {
        const now = new Date();

        return this.movementsForMonth(
            data,
            now.getFullYear(),
            now.getMonth()
        );
    },

    totalByMovementType(movements, type) {
        return movements
            .filter(
                movement =>
                    movement.type === type
            )
            .reduce(
                (total, movement) =>
                    total +
                    this.number(movement.amount),
                0
            );
    },

    monthlyIncome(data) {
        return this.totalByMovementType(
            this.currentMonthMovements(data),
            "income"
        );
    },

    monthlyExpenses(data) {
        return this.totalByMovementType(
            this.currentMonthMovements(data),
            "expense"
        );
    },

    monthlyInvested(data) {
        return this.totalByMovementType(
            this.currentMonthMovements(data),
            "investment"
        );
    },

    monthlySavings(data) {
        return (
            this.monthlyIncome(data) -
            this.monthlyExpenses(data) -
            this.monthlyInvested(data)
        );
    },

    monthlySavingsRate(data) {
        const income =
            this.monthlyIncome(data);

        if (income <= 0) {
            return 0;
        }

        return (
            this.monthlySavings(data) /
            income
        ) * 100;
    },

    investmentDetails(account) {
        const invested =
            this.number(account.invested);

        const currentValue =
            this.number(account.balance);

        const gain =
            currentValue - invested;

        const profitability =
            invested > 0
                ? (gain / invested) * 100
                : 0;

        return {
            invested,
            currentValue,
            gain,
            profitability
        };
    },

    totalInvestedCapital(data) {
        return this.accountsByGroup(
            data,
            "investment"
        ).reduce(
            (total, account) =>
                total +
                this.number(account.invested),
            0
        );
    },

    totalInvestmentGain(data) {
        return (
            this.totalInvestments(data) -
            this.totalInvestedCapital(data)
        );
    },

    expensesByCategory(data, year, month) {
        const result = {};

        this.movementsForMonth(
            data,
            year,
            month
        )
            .filter(
                movement =>
                    movement.type === "expense"
            )
            .forEach(movement => {

                const category =
                    movement.category || "Otros";

                result[category] =
                    (result[category] || 0) +
                    this.number(movement.amount);

            });

        return Object.entries(result)
            .map(([category, amount]) => ({
                category,
                amount
            }))
            .sort(
                (a, b) =>
                    b.amount - a.amount
            );
    },

    financialSummary(data) {
        return {
            liquidity:
                this.totalLiquidity(data),

            investments:
                this.totalInvestments(data),

            investedCapital:
                this.totalInvestedCapital(data),

            investmentGain:
                this.totalInvestmentGain(data),

            debt:
                this.totalDebt(data),

            netWorth:
                this.netWorth(data),

            monthlyIncome:
                this.monthlyIncome(data),

            monthlyExpenses:
                this.monthlyExpenses(data),

            monthlyInvested:
                this.monthlyInvested(data),

            monthlySavings:
                this.monthlySavings(data),

            monthlySavingsRate:
                this.monthlySavingsRate(data)
        };
    }

};

/* ==========================================================
   ATLAS
   calculations.js
   Cálculos financieros principales
========================================================== */

const AtlasCalculations = {

    accountBalance(account) {

        return Number(account.balance) || 0;

    },

    accountsByType(data, types) {

        return data.accounts.filter(account =>
            types.includes(account.type)
        );

    },

    totalLiquidity(data) {

        return this.accountsByType(data, ["liquidity"])
            .reduce(
                (total, account) =>
                    total + this.accountBalance(account),
                0
            );

    },

    totalInvestments(data) {

        return this.accountsByType(data, ["investment"])
            .reduce(
                (total, account) =>
                    total + this.accountBalance(account),
                0
            );

    },

    totalDebt(data) {

        return this.accountsByType(
            data,
            ["creditcard", "loan"]
        ).reduce(
            (total, account) =>
                total + Math.abs(
                    this.accountBalance(account)
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
            movement.date + "T12:00:00"
        );

    },

    movementsForMonth(data, year, month) {

        return data.movements.filter(movement => {

            const date = this.movementDate(movement);

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
            .filter(movement => movement.type === type)
            .reduce(
                (total, movement) =>
                    total + (Number(movement.amount) || 0),
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

        const income = this.monthlyIncome(data);

        if (income <= 0) {

            return 0;

        }

        return (
            this.monthlySavings(data) /
            income
        ) * 100;

    },

    investmentContributions(data, accountId) {

        return data.movements
            .filter(movement =>
                movement.type === "investment" &&
                movement.toAccountId === accountId
            )
            .reduce(
                (total, movement) =>
                    total + (Number(movement.amount) || 0),
                0
            );

    },

    investmentReturn(data, accountId) {

        const account = data.accounts.find(
            item => item.id === accountId
        );

        if (!account) {

            return {
                contributed: 0,
                currentValue: 0,
                gain: 0,
                percentage: 0
            };

        }

        const contributed =
            Number(account.initialContribution) ||
            this.investmentContributions(
                data,
                accountId
            );

        const currentValue =
            Number(account.balance) || 0;

        const gain =
            currentValue - contributed;

        const percentage =
            contributed > 0
                ? (gain / contributed) * 100
                : 0;

        return {
            contributed,
            currentValue,
            gain,
            percentage
        };

    },

    expensesByCategory(data, year, month) {

        const movements =
            this.movementsForMonth(
                data,
                year,
                month
            );

        const result = {};

        movements
            .filter(
                movement =>
                    movement.type === "expense"
            )
            .forEach(movement => {

                const category =
                    movement.category || "Otros";

                result[category] =
                    (result[category] || 0) +
                    (Number(movement.amount) || 0);

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

    budgetStatus(data, category, limit) {

        const now = new Date();

        const spent =
            this.expensesByCategory(
                data,
                now.getFullYear(),
                now.getMonth()
            ).find(
                item =>
                    item.category === category
            )?.amount || 0;

        const budget =
            Number(limit) || 0;

        const remaining =
            budget - spent;

        const percentage =
            budget > 0
                ? (spent / budget) * 100
                : 0;

        return {
            spent,
            budget,
            remaining,
            percentage
        };

    },

    financialSummary(data) {

        return {

            liquidity:
                this.totalLiquidity(data),

            investments:
                this.totalInvestments(data),

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

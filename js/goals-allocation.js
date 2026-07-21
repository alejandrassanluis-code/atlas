/* ==========================================================
   ATLAS
   goals-allocation.js
   Distribución centralizada de ahorro y efectivo disponible
========================================================== */

const AtlasGoalsAllocation = {

    initialized: false,

    number(value) {

        const result = Number(
            String(value ?? "")
                .trim()
                .replace(",", ".")
        );

        return Number.isFinite(result)
            ? result
            : 0;

    },

    round(value) {

        return Math.round(
            this.number(value) * 100
        ) / 100;

    },

    clone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    },

    now() {

        return new Date().toISOString();

    },

    today() {

        return new Date()
            .toISOString()
            .slice(0, 10);

    },

    createId(prefix = "goal_allocation") {

        if (
            typeof AtlasCatalog !== "undefined" &&
            typeof AtlasCatalog.createId === "function"
        ) {

            return AtlasCatalog.createId(prefix);

        }

        return [
            prefix,
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

    },

    data() {

        if (
            typeof AtlasApp !== "undefined" &&
            AtlasApp.data
        ) {

            return AtlasApp.data;

        }

        return AtlasGoals.data;

    },

    goals(data = this.data()) {

        return Array.isArray(data?.goals)
            ? data.goals
            : [];

    },

    accounts(data = this.data()) {

        return Array.isArray(data?.accounts)
            ? data.accounts
            : [];

    },

    movements(data = this.data()) {

        return Array.isArray(data?.movements)
            ? data.movements
            : [];

    },

    goalById(
        goalId,
        data = this.data()
    ) {

        return this.goals(data)
            .find(
                goal =>
                    goal.id === goalId
            ) || null;

    },

    accountById(
        accountId,
        data = this.data()
    ) {

        return this.accounts(data)
            .find(
                account =>
                    account.id === accountId
            ) || null;

    },

    contributions(goal) {

        return Array.isArray(goal?.contributions)
            ? goal.contributions
            : [];

    },

    progressMode(goal) {

        return String(
            goal?.progressMode ||
            "manual"
        );

    },

    isManualGoal(goal) {

        return this.progressMode(goal) ===
            "manual";

    },

    isCompatibleType(goal) {

        return [
            "saving",
            "purchase",
            "emergency"
        ].includes(goal?.type);

    },

    isAllocatableGoal(goal) {

        return Boolean(
            goal &&
            goal.status === "active" &&
            this.isManualGoal(goal) &&
            this.isCompatibleType(goal)
        );

    },

    priorityOrder(priority) {

        const values = {
            high: 1,
            medium: 2,
            low: 3
        };

        return values[priority] || 2;

    },

    allocatableGoals(
        data = this.data()
    ) {

        return this.goals(data)
            .filter(
                goal =>
                    this.isAllocatableGoal(goal)
            )
            .sort(
                (first, second) => {

                    const priorityDifference =
                        this.priorityOrder(
                            first.priority
                        ) -
                        this.priorityOrder(
                            second.priority
                        );

                    if (priorityDifference !== 0) {

                        return priorityDifference;

                    }

                    return String(
                        first.deadline ||
                        "9999-12-31"
                    ).localeCompare(
                        String(
                            second.deadline ||
                            "9999-12-31"
                        )
                    );

                }
           

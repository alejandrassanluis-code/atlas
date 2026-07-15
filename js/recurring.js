/* ==========================================================
   ATLAS
   recurring.js
   Atlas v1.0 — Motor de movimientos recurrentes
========================================================== */

const AtlasRecurring = {

    clone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    now() {

        return new Date()
            .toISOString();

    },

    createId(prefix = "recurring") {

        if (
            typeof AtlasCatalog !==
                "undefined" &&
            typeof AtlasCatalog.createId ===
                "function"
        ) {

            return AtlasCatalog.createId(
                prefix
            );

        }

        return [
            prefix,
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

    },

    currentMonthKey() {

        if (
            typeof AtlasCalculations !==
                "undefined" &&
            typeof AtlasCalculations.monthKey ===
                "function"
        ) {

            return AtlasCalculations
                .monthKey();

        }

        return new Date()
            .toISOString()
            .slice(
                0,
                7
            );

    },

    validMonthKey(monthKey) {

        return /^\d{4}-\d{2}$/.test(
            String(
                monthKey || ""
            )
        );

    },

    monthParts(monthKey) {

        const validMonth =
            this.validMonthKey(
                monthKey
            )
                ? monthKey
                : this.currentMonthKey();

        const [
            year,
            month
        ] = validMonth
            .split("-")
            .map(Number);

        return {

            monthKey:
                validMonth,

            year,

            month

        };

    },

    daysInMonth(monthKey) {

        const {
            year,
            month
        } =
            this.monthParts(
                monthKey
            );

        return new Date(
            year,
            month,
            0
        ).getDate();

    },

    padDay(day) {

        return String(
            day
        ).padStart(
            2,
            "0"
        );

    },

    dateForDay(
        monthKey,
        requestedDay
    ) {

        const day =
            Math.max(
                1,
                Math.min(
                    this.daysInMonth(
                        monthKey
                    ),
                    this.number(
                        requestedDay
                    ) || 1
                )
            );

        return (
            `${monthKey}-` +
            this.padDay(
                day
            )
        );

    },

    dayFromDate(date) {

        const value =
            String(
                date || ""
            );

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                value
            )
        ) {

            return null;

        }

        return Number(
            value.slice(
                8,
                10
            )
        );

    },

    dateWithinMonth(
        date,
        monthKey
    ) {

        return (
            String(
                date || ""
            ).slice(
                0,
                7
            ) === monthKey
        );

    },

    lastWorkingFriday(monthKey) {

        const {
            year,
            month
        } =
            this.monthParts(
                monthKey
            );

        const lastDay =
            this.daysInMonth(
                monthKey
            );

        const date =
            new Date(
                year,
                month - 1,
                lastDay
            );

        while (
            date.getDay() !== 5
        ) {

            date.setDate(
                date.getDate() - 1
            );

        }

        return (
            `${monthKey}-` +
            this.padDay(
                date.getDate()
            )
        );

    },

    expectedDate(
        rule,
        monthKey
    ) {

        const dueRule =
            rule?.dueRule ||
            "fixed_day";

        if (
            dueRule ===
            "last_working_friday"
        ) {

            return this
                .lastWorkingFriday(
                    monthKey
                );

        }

        if (
            dueRule ===
            "end_of_month"
        ) {

            const daysBeforeEnd =
                Math.max(
                    0,
                    this.number(
                        rule.daysBeforeEnd
                    )
                );

            return this.dateForDay(
                monthKey,
                this.daysInMonth(
                    monthKey
                ) -
                daysBeforeEnd
            );

        }

        if (
            dueRule ===
            "day_range"
        ) {

            const firstDay =
                this.number(
                    rule.dueDayFrom
                ) || 1;

            const lastDay =
                this.number(
                    rule.dueDayTo
                ) || firstDay;

            const estimatedDay =
                Math.round(
                    (
                        firstDay +
                        lastDay
                    ) /
                    2
                );

            return this.dateForDay(
                monthKey,
                estimatedDay
            );

        }

        return this.dateForDay(
            monthKey,
            this.number(
                rule.dueDay
            ) || 1
        );

    },

    rules(data) {

        return Array.isArray(
            data?.catalog
                ?.recurringRules
        )
            ? data.catalog
                .recurringRules
            : [];

    },

    occurrences(data) {

        return Array.isArray(
            data?.recurringOccurrences
        )
            ? data.recurringOccurrences
            : [];

    },

    movements(data) {

        return Array.isArray(
            data?.movements
        )
            ? data.movements
            : [];

    },

    movementKind(movement) {

        if (
            movement?.kind ===
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

    ruleKind(rule) {

        return (
            rule?.kind ||
            rule?.type ||
            ""
        );

    },

    ruleAppliesToMonth(
        rule,
        monthKey
    ) {

        if (
            !rule ||
            rule.active === false ||
            rule.paused === true
        ) {

            return false;

        }

        const {
            month
        } =
            this.monthParts(
                monthKey
            );

        if (
            rule.pausedUntil &&
            monthKey <=
                String(
                    rule.pausedUntil
                ).slice(
                    0,
                    7
                )
        ) {

            return false;

        }

        if (
            rule.startDate &&
            monthKey <
                String(
                    rule.startDate
                ).slice(
                    0,
                    7
                )
        ) {

            return false;

        }

        if (
            rule.endDate &&
            monthKey >
                String(
                    rule.endDate
                ).slice(
                    0,
                    7
                )
        ) {

            return false;

        }

        if (
            rule.maximumOccurrences !==
                null &&
            rule.maximumOccurrences !==
                undefined &&
            this.number(
                rule.confirmedOccurrences
            ) >=
                this.number(
                    rule.maximumOccurrences
                )
        ) {

            return false;

        }

        if (
            rule.recurrence ===
            "selected_months"
        ) {

            const months =
                Array.isArray(
                    rule.months
                )
                    ? rule.months
                        .map(Number)
                    : [];

            return months.includes(
                month
            );

        }

        if (
            rule.recurrence ===
            "yearly"
        ) {

            const months =
                Array.isArray(
                    rule.months
                )
                    ? rule.months
                        .map(Number)
                    : [];

            if (
                months.length === 0
            ) {

                return true;

            }

            return months.includes(
                month
            );

        }

        return (
            rule.recurrence ===
                "monthly" ||
            !rule.recurrence
        );

    },

    movementMatchesRule(
        movement,
        rule
    ) {

        if (
            this.movementKind(
                movement
            ) !==
            this.ruleKind(
                rule
            )
        ) {

            return false;

        }

        if (
            rule.categoryId &&
            movement.categoryId !==
                rule.categoryId
        ) {

            return false;

        }

        if (
            rule.subcategoryId &&
            movement.subcategoryId !==
                rule.subcategoryId
        ) {

            return false;

        }

        if (
            rule.debtAccountId &&
            (
                movement.debtAccountId ||
                movement.toAccountId
            ) !==
                rule.debtAccountId
        ) {

            return false;

        }

        return true;

    },

    matchingMovements(
        data,
        rule
    ) {

        return this
            .movements(
                data
            )
            .filter(
                movement =>
                    this.movementMatchesRule(
                        movement,
                        rule
                    )
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    String(
                        second.date || ""
                    ).localeCompare(
                        String(
                            first.date || ""
                        )
                    )
            );

    },

    lastMatchingMovement(
        data,
        rule,
        beforeMonthKey = null
    ) {

        const matches =
            this.matchingMovements(
                data,
                rule
            );

        if (!beforeMonthKey) {

            return matches[0] ||
                null;

        }

        return matches.find(
            movement =>
                String(
                    movement.date || ""
                ).slice(
                    0,
                    7
                ) <
                beforeMonthKey
        ) || null;

    },

    averageMatchingAmount(
        data,
        rule,
        beforeMonthKey = null,
        sampleSize = 3
    ) {

        const amounts =
            this.matchingMovements(
                data,
                rule
            )
                .filter(
                    movement =>
                        !beforeMonthKey ||
                        String(
                            movement.date || ""
                        ).slice(
                            0,
                            7
                        ) <
                            beforeMonthKey
                )
                .slice(
                    0,
                    sampleSize
                )
                .map(
                    movement =>
                        this.number(
                            movement.amount
                        )
                )
                .filter(
                    amount =>
                        amount > 0
                );

        if (
            amounts.length === 0
        ) {

            return null;

        }

        return (
            amounts.reduce(
                (
                    total,
                    amount
                ) =>
                    total +
                    amount,
                0
            ) /
            amounts.length
        );

    },

    expectedAmount(
        data,
        rule,
        monthKey
    ) {

        const amountMode =
            rule?.amountMode ||
            "fixed";

        if (
            amountMode ===
            "by_month"
        ) {

            const {
                month
            } =
                this.monthParts(
                    monthKey
                );

            const monthlyAmount =
                rule.monthlyAmounts?.[
                    month
                ] ??
                rule.monthlyAmounts?.[
                    String(
                        month
                    )
                ];

            const result =
                this.number(
                    monthlyAmount
                );

            return result > 0
                ? result
                : null;

        }

        if (
            amountMode ===
            "last_amount"
        ) {

            const lastMovement =
                this.lastMatchingMovement(
                    data,
                    rule,
                    monthKey
                );

            const lastAmount =
                this.number(
                    lastMovement?.amount
                );

            if (
                lastAmount > 0
            ) {

                return lastAmount;

            }

            const configuredAmount =
                this.number(
                    rule.amount
                );

            return configuredAmount > 0
                ? configuredAmount
                : null;

        }

        if (
            amountMode ===
                "average" ||
            amountMode ===
                "average_amount"
        ) {

            const average =
                this.averageMatchingAmount(
                    data,
                    rule,
                    monthKey
                );

            if (
                average !== null &&
                average > 0
            ) {

                return average;

            }

            const configuredAmount =
                this.number(
                    rule.amount
                );

            return configuredAmount > 0
                ? configuredAmount
                : null;

        }

        const amount =
            this.number(
                rule.amount
            );

        return amount > 0
            ? amount
            : null;

    },

    resolvedRuleAccounts(
        data,
        rule,
        monthKey
    ) {

        const previousMovement =
            this.lastMatchingMovement(
                data,
                rule,
                monthKey
            );

        return {

            accountId:
                rule.accountId ||
                previousMovement
                    ?.accountId ||
                null,

            fromAccountId:
                rule.fromAccountId ||
                previousMovement
                    ?.fromAccountId ||
                null,

            toAccountId:
                rule.toAccountId ||
                previousMovement
                    ?.toAccountId ||
                null,

            debtAccountId:
                rule.debtAccountId ||
                previousMovement
                    ?.debtAccountId ||
                null

        };

    },

    ruleIsReady(
        data,
        rule,
        monthKey
    ) {

        const amount =
            this.expectedAmount(
                data,
                rule,
                monthKey
            );

        if (
            amount === null ||
            amount <= 0
        ) {

            return false;

        }

        const accounts =
            this.resolvedRuleAccounts(
                data,
                rule,
                monthKey
            );

        const kind =
            this.ruleKind(
                rule
            );

        if (
            kind === "income" ||
            kind === "expense" ||
            kind === "reimbursement"
        ) {

            return Boolean(
                accounts.accountId
            );

        }

        if (
            kind === "investment" ||
            kind === "transfer"
        ) {

            return Boolean(
                accounts.fromAccountId &&
                accounts.toAccountId
            );

        }

        if (
            kind === "debt_payment"
        ) {

            return Boolean(
                (
                    accounts.accountId ||
                    accounts.fromAccountId
                ) &&
                (
                    accounts.debtAccountId ||
                    accounts.toAccountId
                )
            );

        }

        return true;

    },

    occurrenceForRuleAndMonth(
        data,
        ruleId,
        monthKey
    ) {

        return this
            .occurrences(
                data
            )
            .find(
                occurrence =>
                    occurrence.ruleId ===
                        ruleId &&
                    occurrence.monthKey ===
                        monthKey
            ) || null;

    },

    amountDifferencePercent(
        firstAmount,
        secondAmount
    ) {

        const first =
            Math.abs(
                this.number(
                    firstAmount
                )
            );

        const second =
            Math.abs(
                this.number(
                    secondAmount
                )
            );

        const base =
            Math.max(
                first,
                second
            );

        if (
            base === 0
        ) {

            return 0;

        }

        return (
            Math.abs(
                first -
                second
            ) /
            base
        ) * 100;

    },

    possibleDuplicate(
        data,
        rule,
        monthKey,
        expectedAmount,
        expectedDate
    ) {

        const settings =
            data?.settings
                ?.recurringDetection ||
            {};

        const amountTolerance =
            this.number(
                settings
                    .amountTolerancePercent
            ) || 15;

        const dayTolerance =
            this.number(
                settings.dayTolerance
            ) || 7;

        const expectedDay =
            this.dayFromDate(
                expectedDate
            );

        const candidates =
            this.movements(
                data
            )
                .filter(
                    movement =>
                        this.dateWithinMonth(
                            movement.date,
                            monthKey
                        )
                )
                .filter(
                    movement =>
                        this.movementMatchesRule(
                            movement,
                            rule
                        )
                );

        const exactLinked =
            candidates.find(
                movement =>
                    movement.recurringRuleId ===
                    rule.id
            );

        if (exactLinked) {

            return {

                movement:
                    exactLinked,

                confidence:
                    100

            };

        }

        const ranked =
            candidates
                .map(
                    movement => {

                        const amountDifference =
                            this
                                .amountDifferencePercent(
                                    movement.amount,
                                    expectedAmount
                                );

                        const movementDay =
                            this.dayFromDate(
                                movement.date
                            );

                        const dayDifference =
                            expectedDay !==
                                null &&
                            movementDay !==
                                null
                                ? Math.abs(
                                    movementDay -
                                    expectedDay
                                )
                                : 0;

                        let confidence =
                            100;

                        confidence -=
                            Math.min(
                                45,
                                amountDifference
                            );

                        confidence -=
                            Math.min(
                                30,
                                dayDifference * 4
                            );

                        return {

                            movement,

                            amountDifference,

                            dayDifference,

                            confidence:
                                Math.max(
                                    0,
                                    Math.round(
                                        confidence
                                    )
                                )

                        };

                    }
                )
                .filter(
                    candidate =>
                        candidate
                            .amountDifference <=
                            amountTolerance &&
                        candidate
                            .dayDifference <=
                            dayTolerance
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        second.confidence -
                        first.confidence
                );

        return ranked[0] || null;

    },

    createOccurrence(
        data,
        rule,
        monthKey
    ) {

        const expectedAmount =
            this.expectedAmount(
                data,
                rule,
                monthKey
            );

        const expectedDate =
            this.expectedDate(
                rule,
                monthKey
            );

        const accounts =
            this.resolvedRuleAccounts(
                data,
                rule,
                monthKey
            );

        const duplicate =
            this.possibleDuplicate(
                data,
                rule,
                monthKey,
                expectedAmount,
                expectedDate
            );

        const createdAt =
            this.now();

        return {

            id:
                this.createId(
                    "occurrence"
                ),

            ruleId:
                rule.id,

            monthKey,

            status:
                duplicate
                    ? "possible_duplicate"
                    : "pending",

            type:
                rule.type ||
                this.ruleKind(
                    rule
                ),

            kind:
                this.ruleKind(
                    rule
                ),

            categoryId:
                rule.categoryId ||
                null,

            subcategoryId:
                rule.subcategoryId ||
                null,

            accountId:
                accounts.accountId,

            fromAccountId:
                accounts.fromAccountId,

            toAccountId:
                accounts.toAccountId,

            debtAccountId:
                accounts.debtAccountId,

            expectedAmount,

            confirmedAmount:
                null,

            expectedDate,

            confirmedDate:
                null,

            movementId:
                null,

            possibleDuplicateMovementId:
                duplicate
                    ?.movement
                    ?.id ||
                null,

            duplicateConfidence:
                duplicate
                    ?.confidence ??
                null,

            source:
                rule.source ===
                    "detected"
                    ? "detected_rule"
                    : "configured_rule",

            note:
                "",

            omittedReason:
                "",

            generatedAt:
                createdAt,

            reviewedAt:
                null,

            confirmedAt:
                null,

            omittedAt:
                null,

            createdAt,

            updatedAt:
                createdAt

        };

    },

    generateMonth(
        sourceData,
        selectedMonthKey = null
    ) {

        const data =
            this.clone(
                sourceData || {}
            );

        const monthKey =
            this.validMonthKey(
                selectedMonthKey
            )
                ? selectedMonthKey
                : this.currentMonthKey();

        if (
            !Array.isArray(
                data.recurringOccurrences
            )
        ) {

            data.recurringOccurrences =
                [];

        }

        const created =
            [];

        const skipped = {

            inactive:
                [],

            notApplicable:
                [],

            alreadyGenerated:
                [],

            needsConfiguration:
                []

        };

        this.rules(
            data
        ).forEach(
            rule => {

                if (
                    !rule ||
                    rule.active === false
                ) {

                    skipped.inactive.push(
                        rule?.id ||
                        null
                    );

                    return;

                }

                if (
                    !this.ruleAppliesToMonth(
                        rule,
                        monthKey
                    )
                ) {

                    skipped
                        .notApplicable
                        .push(
                            rule.id
                        );

                    return;

                }

                const existing =
                    this
                        .occurrenceForRuleAndMonth(
                            data,
                            rule.id,
                            monthKey
                        );

                if (existing) {

                    skipped
                        .alreadyGenerated
                        .push(
                            rule.id
                        );

                    return;

                }

                if (
                    !this.ruleIsReady(
                        data,
                        rule,
                        monthKey
                    )
                ) {

                    skipped
                        .needsConfiguration
                        .push(
                            rule.id
                        );

                    return;

                }

                const occurrence =
                    this.createOccurrence(
                        data,
                        rule,
                        monthKey
                    );

                data
                    .recurringOccurrences
                    .push(
                        occurrence
                    );

                created.push(
                    occurrence
                );

            }
        );

        data.updatedAt =
            this.now();

        return {

            data,

            monthKey,

            created,

            skipped

        };

    },

    occurrencesForMonth(
        data,
        monthKey,
        statuses = null
    ) {

        const statusList =
            Array.isArray(
                statuses
            )
                ? statuses
                : statuses
                    ? [
                        statuses
                    ]
                    : null;

        return this
            .occurrences(
                data
            )
            .filter(
                occurrence =>
                    occurrence.monthKey ===
                    monthKey
            )
            .filter(
                occurrence =>
                    !statusList ||
                    statusList.includes(
                        occurrence.status
                    )
            )
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

    },

    pendingForMonth(
        data,
        monthKey
    ) {

        return this
            .occurrencesForMonth(
                data,
                monthKey,
                [
                    "pending",
                    "possible_duplicate"
                ]
            );

    },

    confirmedForMonth(
        data,
        monthKey
    ) {

        return this
            .occurrencesForMonth(
                data,
                monthKey,
                "confirmed"
            );

    },

    omittedForMonth(
        data,
        monthKey
    ) {

        return this
            .occurrencesForMonth(
                data,
                monthKey,
                [
                    "omitted",
                    "dismissed"
                ]
            );

    },

    pendingTotals(
        data,
        monthKey
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

            count:
                0

        };

        this.pendingForMonth(
            data,
            monthKey
        ).forEach(
            occurrence => {

                const amount =
                    this.number(
                        occurrence
                            .expectedAmount
                    );

                const kind =
                    occurrence.kind ||
                    occurrence.type;

                result.count += 1;

                if (
                    kind === "income"
                ) {

                    result.income +=
                        amount;

                    return;

                }

                if (
                    kind === "expense"
                ) {

                    result.expenses +=
                        amount;

                    return;

                }

                if (
                    kind === "investment"
                ) {

                    result.invested +=
                        amount;

                    return;

                }

                if (
                    kind ===
                    "debt_payment"
                ) {

                    result.debtPayments +=
                        amount;

                    return;

                }

                if (
                    kind === "transfer"
                ) {

                    result.transfers +=
                        amount;

                }

            }
        );

        return result;

    },

    estimatedMonth(
        data,
        monthKey
    ) {

        const realSummary =
            typeof AtlasCalculations !==
                "undefined" &&
            typeof AtlasCalculations
                .financialSummary ===
                "function"
                ? AtlasCalculations
                    .financialSummary(
                        data,
                        monthKey
                    )
                : {};

        const pending =
            this.pendingTotals(
                data,
                monthKey
            );

        const realIncome =
            this.number(
                realSummary.monthlyIncome
            );

        const realExpenses =
            this.number(
                realSummary.monthlyExpenses
            );

        const realInvested =
            this.number(
                realSummary.monthlyInvested
            );

        const estimatedIncome =
            realIncome +
            pending.income;

        const estimatedExpenses =
            realExpenses +
            pending.expenses;

        const estimatedInvested =
            realInvested +
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

        return {

            monthKey,

            pendingCount:
                pending.count,

            real: {

                income:
                    realIncome,

                expenses:
                    realExpenses,

                invested:
                    realInvested,

                savings:
                    this.number(
                        realSummary
                            .monthlySavings
                    ),

                savingRate:
                    this.number(
                        realSummary
                            .monthlySavingRate
                    )

            },

            pending,

            estimated: {

                income:
                    estimatedIncome,

                expenses:
                    estimatedExpenses,

                invested:
                    estimatedInvested,

                savings:
                    estimatedSavings,

                savingRate:
                    estimatedSavingRate

            }

        };

    }

};

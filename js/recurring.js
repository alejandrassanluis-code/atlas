/* ==========================================================
   ATLAS
   recurring.js
   Atlas v1.0 — Motor de movimientos recurrentes sincronizado
========================================================== */

const AtlasRecurring = {

    clone(value) {

        return JSON.parse(
            JSON.stringify(
                value
            )
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

        const now =
            new Date();

        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
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

    monthParts(monthKey) {

        const validMonth =
            this.validMonthKey(
                monthKey
            )
                ? String(monthKey)
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

        const maximumDay =
            this.daysInMonth(
                monthKey
            );

        const day =
            Math.max(
                1,
                Math.min(
                    maximumDay,
                    this.number(
                        requestedDay
                    ) || 1
                )
            );

        return (
            `${monthKey}-` +
            this.padDay(day)
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

        const date =
            new Date(
                year,
                month - 1,
                this.daysInMonth(
                    monthKey
                )
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

            return this.lastWorkingFriday(
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
                    Math.min(
                        30,
                        this.number(
                            rule.daysBeforeEnd
                        )
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
                Math.max(
                    1,
                    Math.min(
                        31,
                        this.number(
                            rule.dueDayFrom
                        ) || 1
                    )
                );

            const lastDay =
                Math.max(
                    firstDay,
                    Math.min(
                        31,
                        this.number(
                            rule.dueDayTo
                        ) || firstDay
                    )
                );

            return this.dateForDay(
                monthKey,
                Math.round(
                    (
                        firstDay +
                        lastDay
                    ) /
                    2
                )
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

    ruleKind(rule) {

        return (
            rule?.kind ||
            rule?.type ||
            ""
        );

    },

    occurrenceRuleId(occurrence) {

        return (
            occurrence?.ruleId ||
            occurrence?.recurringRuleId ||
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
                rule.maximumOccurrences
            ) > 0 &&
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
            .movements(data)
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
                    String(month)
                ];

            const result =
                this.number(
                    monthlyAmount
                );

            if (
                result > 0
            ) {

                return result;

            }

            const fallback =
                this.number(
                    rule.amount
                );

            return fallback > 0
                ? fallback
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

        const kind =
            this.ruleKind(
                rule
            );

        let accountId =
            rule.accountId ||
            previousMovement?.accountId ||
            null;

        let fromAccountId =
            rule.fromAccountId ||
            previousMovement
                ?.fromAccountId ||
            null;

        let toAccountId =
            rule.toAccountId ||
            previousMovement
                ?.toAccountId ||
            null;

        let debtAccountId =
            rule.debtAccountId ||
            previousMovement
                ?.debtAccountId ||
            null;

        if (
            kind ===
            "debt_payment"
        ) {

            fromAccountId =
                fromAccountId ||
                accountId;

            accountId =
                accountId ||
                fromAccountId;

            debtAccountId =
                debtAccountId ||
                toAccountId;

            toAccountId =
                toAccountId ||
                debtAccountId;

        }

        if (
            kind ===
                "investment" ||
            kind ===
                "transfer"
        ) {

            fromAccountId =
                fromAccountId ||
                accountId;

        }

        return {

            accountId,

            fromAccountId,

            toAccountId,

            debtAccountId

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
                accounts.accountId ||
                accounts.fromAccountId
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

        return false;

    },

    occurrenceForRuleAndMonth(
        data,
        ruleId,
        monthKey
    ) {

        return this
            .occurrences(data)
            .find(
                occurrence =>
                    this.occurrenceRuleId(
                        occurrence
                    ) === ruleId &&
                    occurrence.monthKey ===
                        monthKey
            ) || null;

    },

    occurrenceIndexForRuleAndMonth(
        data,
        ruleId,
        monthKey
    ) {

        return this
            .occurrences(data)
            .findIndex(
                occurrence =>
                    this.occurrenceRuleId(
                        occurrence
                    ) === ruleId &&
                    occurrence.monthKey ===
                        monthKey
            );

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
            this.movements(data)
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
                            this.amountDifferencePercent(
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

        return ranked[0] ||
            null;

    },

    occurrenceValues(
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

        return {

            ruleId:
                rule.id,

            recurringRuleId:
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

            name:
                rule.name ||
                "",

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

            expectedDate,

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
                    : "configured_rule"

        };

    },

    createOccurrence(
        data,
        rule,
        monthKey
    ) {

        const createdAt =
            this.now();

        return {

            id:
                this.createId(
                    "occurrence"
                ),

            ...this.occurrenceValues(
                data,
                rule,
                monthKey
            ),

            confirmedAmount:
                null,

            confirmedDate:
                null,

            movementId:
                null,

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

    updatePendingOccurrence(
        data,
        occurrence,
        rule,
        monthKey
    ) {

        const currentStatus =
            occurrence.status;

        const values =
            this.occurrenceValues(
                data,
                rule,
                monthKey
            );

        return {

            ...occurrence,

            ...values,

            id:
                occurrence.id,

            status:
                [
                    "pending",
                    "possible_duplicate"
                ].includes(
                    currentStatus
                )
                    ? values.status
                    : currentStatus,

            confirmedAmount:
                occurrence
                    .confirmedAmount ??
                null,

            confirmedDate:
                occurrence
                    .confirmedDate ??
                null,

            movementId:
                occurrence
                    .movementId ??
                null,

            note:
                occurrence.note ||
                "",

            omittedReason:
                occurrence
                    .omittedReason ||
                "",

            generatedAt:
                occurrence.generatedAt ||
                occurrence.createdAt ||
                this.now(),

            reviewedAt:
                occurrence.reviewedAt ||
                null,

            confirmedAt:
                occurrence.confirmedAt ||
                null,

            omittedAt:
                occurrence.omittedAt ||
                null,

            createdAt:
                occurrence.createdAt ||
                this.now(),

            updatedAt:
                this.now()

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
                ? String(
                    selectedMonthKey
                )
                : this.currentMonthKey();

        if (
            !Array.isArray(
                data.recurringOccurrences
            )
        ) {

            data.recurringOccurrences =
                [];

        }

        const created = [];
        const updated = [];
        const removed = [];

        const skipped = {

            inactive:
                [],

            notApplicable:
                [],

            alreadyGenerated:
                [],

            needsConfiguration:
                [],

            completed:
                []

        };

        this.rules(data)
            .forEach(
                rule => {

                    if (
                        !rule ||
                        !rule.id
                    ) {

                        return;

                    }

                    const existingIndex =
                        this.occurrenceIndexForRuleAndMonth(
                            data,
                            rule.id,
                            monthKey
                        );

                    const existing =
                        existingIndex >= 0
                            ? data
                                .recurringOccurrences[
                                    existingIndex
                                ]
                            : null;

                    const applies =
                        this.ruleAppliesToMonth(
                            rule,
                            monthKey
                        );

                    const ready =
                        applies &&
                        this.ruleIsReady(
                            data,
                            rule,
                            monthKey
                        );

                    if (
                        !applies ||
                        !ready
                    ) {

                        if (
                            existing &&
                            [
                                "pending",
                                "possible_duplicate"
                            ].includes(
                                existing.status
                            )
                        ) {

                            removed.push(
                                existing
                            );

                            data
                                .recurringOccurrences
                                .splice(
                                    existingIndex,
                                    1
                                );

                        }

                        if (
                            rule.active === false
                        ) {

                            skipped.inactive
                                .push(
                                    rule.id
                                );

                        } else if (!applies) {

                            skipped
                                .notApplicable
                                .push(
                                    rule.id
                                );

                        } else {

                            skipped
                                .needsConfiguration
                                .push(
                                    rule.id
                                );

                        }

                        return;

                    }

                    if (existing) {

                        if (
                            [
                                "confirmed",
                                "omitted",
                                "dismissed"
                            ].includes(
                                existing.status
                            )
                        ) {

                            skipped.completed
                                .push(
                                    rule.id
                                );

                            return;

                        }

                        const synchronized =
                            this.updatePendingOccurrence(
                                data,
                                existing,
                                rule,
                                monthKey
                            );

                        data
                            .recurringOccurrences[
                                existingIndex
                            ] = synchronized;

                        updated.push(
                            synchronized
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

        data.recurringOccurrences
            .sort(
                (
                    first,
                    second
                ) => {

                    const monthComparison =
                        String(
                            first.monthKey ||
                            ""
                        ).localeCompare(
                            String(
                                second.monthKey ||
                                ""
                            )
                        );

                    if (
                        monthComparison !== 0
                    ) {

                        return monthComparison;

                    }

                    return String(
                        first.expectedDate ||
                        ""
                    ).localeCompare(
                        String(
                            second.expectedDate ||
                            ""
                        )
                    );

                }
            );

        const changed =
            created.length > 0 ||
            updated.length > 0 ||
            removed.length > 0;

        if (changed) {

            data.updatedAt =
                this.now();

        }

        return {

            data,

            monthKey,

            created,

            updated,

            removed,

            changed,

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
                    ? [statuses]
                    : null;

        return this
            .occurrences(data)
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

        return this.occurrencesForMonth(
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

        return this.occurrencesForMonth(
            data,
            monthKey,
            "confirmed"
        );

    },

    omittedForMonth(
        data,
        monthKey
    ) {

        return this.occurrencesForMonth(
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

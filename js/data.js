/* ==========================================================
   ATLAS
   data.js
   Atlas v1.0 — Datos para recurrentes y gastos frecuentes
========================================================== */

const AtlasData = {

    version: 4,

    clone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    },

    now() {

        return new Date()
            .toISOString();

    },

    defaultSettings() {

        return {

            currency:
                "EUR",

            locale:
                "es-ES",

            monthlySavingGoal:
                20,

            financialCalendarConfigured:
                false,

            recurringDetection: {

                enabled:
                    true,

                minimumOccurrences:
                    3,

                amountTolerancePercent:
                    15,

                dayTolerance:
                    7,

                requireConfirmation:
                    true,

                detectFrequentExpenses:
                    true

            },

            createdAt:
                this.now(),

            updatedAt:
                this.now()

        };

    },

    defaultAccounts() {

        return [

            {
                id:
                    "bbva_main",

                name:
                    "BBVA Cuenta Nómina",

                type:
                    "bank",

                group:
                    "liquidity",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    10,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "bbva_secondary",

                name:
                    "BBVA Cuenta Secundaria",

                type:
                    "bank",

                group:
                    "liquidity",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    20,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "trade_cash",

                name:
                    "Trade Republic Efectivo",

                type:
                    "cash",

                group:
                    "liquidity",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    30,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "trade_etfs",

                name:
                    "Trade Republic ETFs",

                type:
                    "investment",

                group:
                    "investment",

                balance:
                    0,

                invested:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    40,

                valueUpdatedAt:
                    null,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "revolut_bot",

                name:
                    "Revolut Bot",

                type:
                    "investment",

                group:
                    "investment",

                balance:
                    0,

                invested:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    50,

                valueUpdatedAt:
                    null,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "loan_car",

                name:
                    "Préstamo coche",

                type:
                    "loan",

                group:
                    "debt",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    60,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "amex",

                name:
                    "American Express",

                type:
                    "credit_card",

                group:
                    "debt",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    70,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            },

            {
                id:
                    "bbva_credit",

                name:
                    "Tarjeta Crédito BBVA",

                type:
                    "credit_card",

                group:
                    "debt",

                balance:
                    0,

                active:
                    true,

                archived:
                    false,

                order:
                    80,

                createdAt:
                    this.now(),

                updatedAt:
                    this.now()
            }

        ];

    },

    create() {

        const createdAt =
            this.now();

        return {

            version:
                this.version,

            initialized:
                false,

            settings:
                this.defaultSettings(),

            accounts:
                this.defaultAccounts(),

            movements:
                [],

            budgets:
                [],

            goals:
                [],

            snapshots:
                [],

            recurringOccurrences:
                [],

            recurringSuggestions:
                [],

            frequentPatterns:
                [],

            catalog:
                AtlasCatalog
                    .defaultCatalog(),

            createdAt,

            updatedAt:
                createdAt

        };

    },

    ensureSettings(data) {

        const defaults =
            this.defaultSettings();

        data.settings = {

            ...defaults,

            ...(
                data.settings ||
                {}
            ),

            recurringDetection: {

                ...defaults
                    .recurringDetection,

                ...(
                    data.settings
                        ?.recurringDetection ||
                    {}
                )

            }

        };

        return data;

    },

    ensureCollections(data) {

        const collections = [

            "accounts",

            "movements",

            "budgets",

            "goals",

            "snapshots",

            "recurringOccurrences",

            "recurringSuggestions",

            "frequentPatterns"

        ];

        collections.forEach(
            key => {

                if (
                    !Array.isArray(
                        data[key]
                    )
                ) {

                    data[key] = [];

                }

            }
        );

        return data;

    },

    ensureAccounts(data) {

        if (
            data.accounts.length === 0
        ) {

            data.accounts =
                this.defaultAccounts();

            return data;

        }

        data.accounts =
            data.accounts.map(
                (
                    account,
                    index
                ) => {

                    const group =
                        account.group ||
                        "liquidity";

                    return {

                        active:
                            true,

                        archived:
                            false,

                        order:
                            (
                                index +
                                1
                            ) * 10,

                        balance:
                            0,

                        invested:
                            group ===
                            "investment"
                                ? 0
                                : undefined,

                        ...account,

                        group,

                        updatedAt:
                            account.updatedAt ||
                            account.createdAt ||
                            this.now(),

                        createdAt:
                            account.createdAt ||
                            this.now()

                    };

                }
            );

        return data;

    },

    ensureMovements(data) {

        data.movements =
            data.movements.map(
                movement => ({

                    categoryId:
                        movement.categoryId ||
                        null,

                    subcategoryId:
                        movement.subcategoryId ||
                        null,

                    recurringRuleId:
                        movement.recurringRuleId ||
                        null,

                    recurringOccurrenceId:
                        movement
                            .recurringOccurrenceId ||
                        null,

                    frequentPatternId:
                        movement
                            .frequentPatternId ||
                        null,

                    ...movement

                })
            );

        return data;

    },

    ensureSnapshots(data) {

        data.snapshots =
            data.snapshots.map(
                snapshot => ({

                    type:
                        snapshot.type ||
                        "calendar_month",

                    ...snapshot

                })
            );

        return data;

    },

    normalizeOccurrence(
        occurrence
    ) {

        const createdAt =
            occurrence.createdAt ||
            this.now();

        const statusValues = [

            "pending",

            "confirmed",

            "omitted",

            "dismissed",

            "possible_duplicate"

        ];

        const status =
            statusValues.includes(
                occurrence.status
            )
                ? occurrence.status
                : "pending";

        return {

            id:
                occurrence.id ||
                AtlasCatalog.createId(
                    "occurrence"
                ),

            ruleId:
                occurrence.ruleId ||
                occurrence.recurringRuleId ||
                null,

            monthKey:
                occurrence.monthKey ||
                String(
                    occurrence.expectedDate ||
                    occurrence.date ||
                    ""
                ).slice(
                    0,
                    7
                ) ||
                null,

            status,

            type:
                occurrence.type ||
                null,

            kind:
                occurrence.kind ||
                null,

            categoryId:
                occurrence.categoryId ||
                null,

            subcategoryId:
                occurrence.subcategoryId ||
                null,

            accountId:
                occurrence.accountId ||
                null,

            fromAccountId:
                occurrence.fromAccountId ||
                null,

            toAccountId:
                occurrence.toAccountId ||
                null,

            debtAccountId:
                occurrence.debtAccountId ||
                null,

            expectedAmount:
                Number.isFinite(
                    Number(
                        occurrence.expectedAmount ??
                        occurrence.amount
                    )
                )
                    ? Number(
                        occurrence.expectedAmount ??
                        occurrence.amount
                    )
                    : null,

            confirmedAmount:
                Number.isFinite(
                    Number(
                        occurrence.confirmedAmount
                    )
                )
                    ? Number(
                        occurrence.confirmedAmount
                    )
                    : null,

            expectedDate:
                occurrence.expectedDate ||
                occurrence.date ||
                null,

            confirmedDate:
                occurrence.confirmedDate ||
                null,

            movementId:
                occurrence.movementId ||
                null,

            possibleDuplicateMovementId:
                occurrence
                    .possibleDuplicateMovementId ||
                null,

            duplicateConfidence:
                Number.isFinite(
                    Number(
                        occurrence
                            .duplicateConfidence
                    )
                )
                    ? Number(
                        occurrence
                            .duplicateConfidence
                    )
                    : null,

            source:
                occurrence.source ||
                "configured_rule",

            note:
                occurrence.note ||
                "",

            omittedReason:
                occurrence.omittedReason ||
                "",

            generatedAt:
                occurrence.generatedAt ||
                createdAt,

            reviewedAt:
                occurrence.reviewedAt ||
                null,

            confirmedAt:
                occurrence.confirmedAt ||
                null,

            omittedAt:
                occurrence.omittedAt ||
                null,

            createdAt,

            updatedAt:
                occurrence.updatedAt ||
                createdAt

        };

    },

    ensureRecurringOccurrences(data) {

        data.recurringOccurrences =
            data.recurringOccurrences
                .map(
                    occurrence =>
                        this.normalizeOccurrence(
                            occurrence
                        )
                );

        return data;

    },

    normalizeRecurringSuggestion(
        suggestion
    ) {

        const createdAt =
            suggestion.createdAt ||
            this.now();

        const statusValues = [

            "pending",

            "accepted",

            "rejected",

            "dismissed"

        ];

        return {

            id:
                suggestion.id ||
                AtlasCatalog.createId(
                    "recurring_suggestion"
                ),

            status:
                statusValues.includes(
                    suggestion.status
                )
                    ? suggestion.status
                    : "pending",

            patternType:
                suggestion.patternType ||
                "periodic",

            type:
                suggestion.type ||
                null,

            kind:
                suggestion.kind ||
                null,

            categoryId:
                suggestion.categoryId ||
                null,

            subcategoryId:
                suggestion.subcategoryId ||
                null,

            accountId:
                suggestion.accountId ||
                null,

            fromAccountId:
                suggestion.fromAccountId ||
                null,

            toAccountId:
                suggestion.toAccountId ||
                null,

            debtAccountId:
                suggestion.debtAccountId ||
                null,

            movementIds:
                Array.isArray(
                    suggestion.movementIds
                )
                    ? suggestion.movementIds
                    : [],

            occurrenceCount:
                Number.isFinite(
                    Number(
                        suggestion.occurrenceCount
                    )
                )
                    ? Number(
                        suggestion.occurrenceCount
                    )
                    : 0,

            averageAmount:
                Number.isFinite(
                    Number(
                        suggestion.averageAmount
                    )
                )
                    ? Number(
                        suggestion.averageAmount
                    )
                    : null,

            minimumAmount:
                Number.isFinite(
                    Number(
                        suggestion.minimumAmount
                    )
                )
                    ? Number(
                        suggestion.minimumAmount
                    )
                    : null,

            maximumAmount:
                Number.isFinite(
                    Number(
                        suggestion.maximumAmount
                    )
                )
                    ? Number(
                        suggestion.maximumAmount
                    )
                    : null,

            estimatedDay:
                Number.isFinite(
                    Number(
                        suggestion.estimatedDay
                    )
                )
                    ? Number(
                        suggestion.estimatedDay
                    )
                    : null,

            estimatedFrequency:
                suggestion.estimatedFrequency ||
                "monthly",

            confidence:
                Number.isFinite(
                    Number(
                        suggestion.confidence
                    )
                )
                    ? Number(
                        suggestion.confidence
                    )
                    : 0,

            proposedRule:
                suggestion.proposedRule &&
                typeof suggestion
                    .proposedRule ===
                    "object"
                    ? suggestion.proposedRule
                    : null,

            acceptedRuleId:
                suggestion.acceptedRuleId ||
                null,

            detectedAt:
                suggestion.detectedAt ||
                createdAt,

            reviewedAt:
                suggestion.reviewedAt ||
                null,

            createdAt,

            updatedAt:
                suggestion.updatedAt ||
                createdAt

        };

    },

    ensureRecurringSuggestions(data) {

        data.recurringSuggestions =
            data.recurringSuggestions
                .map(
                    suggestion =>
                        this
                            .normalizeRecurringSuggestion(
                                suggestion
                            )
                );

        return data;

    },

    normalizeFrequentPattern(
        pattern
    ) {

        const createdAt =
            pattern.createdAt ||
            this.now();

        return {

            id:
                pattern.id ||
                AtlasCatalog.createId(
                    "frequent_pattern"
                ),

            active:
                pattern.active !==
                false,

            type:
                pattern.type ||
                "expense",

            kind:
                pattern.kind ||
                pattern.type ||
                "expense",

            categoryId:
                pattern.categoryId ||
                null,

            subcategoryId:
                pattern.subcategoryId ||
                null,

            accountId:
                pattern.accountId ||
                null,

            movementIds:
                Array.isArray(
                    pattern.movementIds
                )
                    ? pattern.movementIds
                    : [],

            sampleCount:
                Number.isFinite(
                    Number(
                        pattern.sampleCount
                    )
                )
                    ? Number(
                        pattern.sampleCount
                    )
                    : 0,

            averageAmount:
                Number.isFinite(
                    Number(
                        pattern.averageAmount
                    )
                )
                    ? Number(
                        pattern.averageAmount
                    )
                    : null,

            typicalAmount:
                Number.isFinite(
                    Number(
                        pattern.typicalAmount
                    )
                )
                    ? Number(
                        pattern.typicalAmount
                    )
                    : null,

            averageMonthlyCount:
                Number.isFinite(
                    Number(
                        pattern
                            .averageMonthlyCount
                    )
                )
                    ? Number(
                        pattern
                            .averageMonthlyCount
                    )
                    : 0,

            estimatedMonthlyAmount:
                Number.isFinite(
                    Number(
                        pattern
                            .estimatedMonthlyAmount
                    )
                )
                    ? Number(
                        pattern
                            .estimatedMonthlyAmount
                    )
                    : 0,

            confidence:
                Number.isFinite(
                    Number(
                        pattern.confidence
                    )
                )
                    ? Number(
                        pattern.confidence
                    )
                    : 0,

            lastMovementDate:
                pattern.lastMovementDate ||
                null,

            lastDetectedAt:
                pattern.lastDetectedAt ||
                createdAt,

            dismissed:
                pattern.dismissed ===
                true,

            createdAt,

            updatedAt:
                pattern.updatedAt ||
                createdAt

        };

    },

    ensureFrequentPatterns(data) {

        data.frequentPatterns =
            data.frequentPatterns
                .map(
                    pattern =>
                        this
                            .normalizeFrequentPattern(
                                pattern
                            )
                );

        return data;

    },

    normalizeRecurringRule(
        rule
    ) {

        const createdAt =
            rule.createdAt ||
            this.now();

        return {

            id:
                rule.id ||
                AtlasCatalog.createId(
                    "recurring_rule"
                ),

            name:
                rule.name ||
                "Movimiento recurrente",

            type:
                rule.type ||
                "expense",

            kind:
                rule.kind ||
                rule.type ||
                "expense",

            categoryId:
                rule.categoryId ||
                null,

            subcategoryId:
                rule.subcategoryId ||
                null,

            accountId:
                rule.accountId ||
                null,

            fromAccountId:
                rule.fromAccountId ||
                null,

            toAccountId:
                rule.toAccountId ||
                null,

            debtAccountId:
                rule.debtAccountId ||
                null,

            recurrence:
                rule.recurrence ||
                "monthly",

            months:
                Array.isArray(
                    rule.months
                )
                    ? rule.months
                    : [],

            dueRule:
                rule.dueRule ||
                "fixed_day",

            dueDay:
                Number.isFinite(
                    Number(
                        rule.dueDay
                    )
                )
                    ? Number(
                        rule.dueDay
                    )
                    : null,

            dueDayFrom:
                Number.isFinite(
                    Number(
                        rule.dueDayFrom
                    )
                )
                    ? Number(
                        rule.dueDayFrom
                    )
                    : null,

            dueDayTo:
                Number.isFinite(
                    Number(
                        rule.dueDayTo
                    )
                )
                    ? Number(
                        rule.dueDayTo
                    )
                    : null,

            daysBeforeEnd:
                Number.isFinite(
                    Number(
                        rule.daysBeforeEnd
                    )
                )
                    ? Number(
                        rule.daysBeforeEnd
                    )
                    : 0,

            amountMode:
                rule.amountMode ||
                "fixed",

            amount:
                Number.isFinite(
                    Number(
                        rule.amount
                    )
                )
                    ? Number(
                        rule.amount
                    )
                    : null,

            monthlyAmounts:
                rule.monthlyAmounts &&
                typeof rule
                    .monthlyAmounts ===
                    "object"
                    ? rule.monthlyAmounts
                    : {},

            requiresConfirmation:
                rule
                    .requiresConfirmation !==
                false,

            active:
                rule.active !==
                false,

            paused:
                rule.paused ===
                true,

            pausedUntil:
                rule.pausedUntil ||
                null,

            startDate:
                rule.startDate ||
                null,

            endDate:
                rule.endDate ||
                null,

            maximumOccurrences:
                Number.isFinite(
                    Number(
                        rule.maximumOccurrences
                    )
                )
                    ? Number(
                        rule.maximumOccurrences
                    )
                    : null,

            confirmedOccurrences:
                Number.isFinite(
                    Number(
                        rule.confirmedOccurrences
                    )
                )
                    ? Number(
                        rule.confirmedOccurrences
                    )
                    : 0,

            source:
                rule.source ||
                "catalog",

            detectionSuggestionId:
                rule.detectionSuggestionId ||
                null,

            lastGeneratedMonthKey:
                rule.lastGeneratedMonthKey ||
                null,

            lastConfirmedDate:
                rule.lastConfirmedDate ||
                null,

            lastConfirmedAmount:
                Number.isFinite(
                    Number(
                        rule.lastConfirmedAmount
                    )
                )
                    ? Number(
                        rule.lastConfirmedAmount
                    )
                    : null,

            createdAt,

            updatedAt:
                rule.updatedAt ||
                createdAt

        };

    },

    ensureRecurringRules(data) {

        if (
            !Array.isArray(
                data.catalog
                    ?.recurringRules
            )
        ) {

            data.catalog
                .recurringRules =
                [];

        }

        data.catalog
            .recurringRules =
            data.catalog
                .recurringRules
                .map(
                    rule =>
                        this
                            .normalizeRecurringRule(
                                rule
                            )
                );

        return data;

    },

    ensureCatalog(data) {

        const updated =
            AtlasCatalog.ensure(
                data
            );

        data.catalog =
            updated.catalog;

        return data;

    },

    ensure(data) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return this.create();

        }

        const updatedData =
            this.clone(
                data
            );

        updatedData.version =
            this.version;

        if (
            typeof updatedData
                .initialized !==
            "boolean"
        ) {

            updatedData.initialized =
                false;

        }

        this.ensureSettings(
            updatedData
        );

        this.ensureCollections(
            updatedData
        );

        this.ensureAccounts(
            updatedData
        );

        this.ensureMovements(
            updatedData
        );

        this.ensureSnapshots(
            updatedData
        );

        this.ensureCatalog(
            updatedData
        );

        this.ensureRecurringRules(
            updatedData
        );

        this.ensureRecurringOccurrences(
            updatedData
        );

        this.ensureRecurringSuggestions(
            updatedData
        );

        this.ensureFrequentPatterns(
            updatedData
        );

        updatedData.createdAt =
            updatedData.createdAt ||
            this.now();

        updatedData.updatedAt =
            this.now();

        return updatedData;

    }

};

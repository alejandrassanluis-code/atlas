/* ==========================================================
   ATLAS
   data.js
   Sprint 4.0 — Estructura principal con catálogo
========================================================== */

const AtlasData = {

    version: 3,

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
            )

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

            "recurringOccurrences"

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

    ensureCatalog(data) {

        const updated =
            AtlasCatalog.ensure(data);

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
            this.clone(data);

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

        updatedData.createdAt =
            updatedData.createdAt ||
            this.now();

        updatedData.updatedAt =
            this.now();

        return updatedData;

    }

};

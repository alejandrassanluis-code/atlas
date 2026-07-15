/* ==========================================================
   ATLAS
   catalog.js
   Atlas v1.0 — Catálogo con reembolsos independientes
========================================================== */

const AtlasCatalog = {

    version: 2,

    clone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    },

    createId(prefix = "item") {

        return [
            prefix,
            Date.now(),
            Math.random()
                .toString(36)
                .slice(2, 8)
        ].join("_");

    },

    financialCalendar() {

        return {

            mainAccountingMode:
                "calendar_month",

            salaryCycleEnabled:
                true,

            salaryRule:
                "last_working_friday",

            holidayPolicy:
                "previous_business_day",

            defaultAnalysisMode:
                "calendar_month",

            cycleViewEnabled:
                true,

            snapshotRule:
                "last_day_of_month",

            cycleClosingRule:
                "day_before_next_salary",

            country:
                "ES",

            region:
                "",

            city:
                "",

            configured:
                false

        };

    },

    expenseCategories() {

        return [

            {
                id: "housing",
                name: "Vivienda",
                icon: "🏠",
                type: "expense",
                active: true,
                order: 10,
                recommendedPercent: 25,
                subcategories: [

                    {
                        id: "housing_rent",
                        name: "Alquiler",
                        icon: "🔑",
                        active: true,
                        order: 10,
                        recommendedPercent: 20
                    },

                    {
                        id: "housing_utilities",
                        name: "Suministros",
                        icon: "💡",
                        active: true,
                        order: 20,
                        recommendedPercent: 5
                    }

                ]
            },

            {
                id: "food",
                name: "Alimentación",
                icon: "🛒",
                type: "expense",
                active: true,
                order: 20,
                recommendedPercent: 12,
                subcategories: [

                    {
                        id: "food_supermarket",
                        name: "Supermercado",
                        icon: "🛒",
                        active: true,
                        order: 10,
                        recommendedPercent: 9
                    },

                    {
                        id: "food_delivery",
                        name: "Comida a domicilio",
                        icon: "🛵",
                        active: true,
                        order: 20,
                        recommendedPercent: 3
                    }

                ]
            },

            {
                id: "transport",
                name: "Transporte",
                icon: "🚗",
                type: "expense",
                active: true,
                order: 30,
                recommendedPercent: 10,
                subcategories: [

                    {
                        id: "transport_insurance",
                        name: "Seguro",
                        icon: "🛡️",
                        active: true,
                        order: 10,
                        recommendedPercent: 2
                    },

                    {
                        id: "transport_fuel",
                        name: "Gasolina",
                        icon: "⛽",
                        active: true,
                        order: 20,
                        recommendedPercent: 3
                    },

                    {
                        id: "transport_parking",
                        name: "Parking",
                        icon: "🅿️",
                        active: true,
                        order: 30,
                        recommendedPercent: 1
                    },

                    {
                        id: "transport_maintenance",
                        name: "Mantenimiento",
                        icon: "🔧",
                        active: true,
                        order: 40,
                        recommendedPercent: 2
                    },

                    {
                        id: "transport_taxi",
                        name: "Taxi",
                        icon: "🚕",
                        active: true,
                        order: 50,
                        recommendedPercent: 1
                    },

                    {
                        id: "transport_public",
                        name: "Transporte público",
                        icon: "🚇",
                        active: true,
                        order: 60,
                        recommendedPercent: 1
                    }

                ]
            },

            {
                id: "leisure",
                name: "Restauración y ocio",
                icon: "🍽️",
                type: "expense",
                active: true,
                order: 40,
                recommendedPercent: 10,
                subcategories: [

                    {
                        id: "leisure_restaurants",
                        name: "Restaurantes",
                        icon: "🍴",
                        active: true,
                        order: 10,
                        recommendedPercent: 4
                    },

                    {
                        id: "leisure_party",
                        name: "Copas y fiesta",
                        icon: "🍸",
                        active: true,
                        order: 20,
                        recommendedPercent: 2
                    },

                    {
                        id: "leisure_vaper",
                        name: "Vaper / tabaco",
                        icon: "💨",
                        active: true,
                        order: 30,
                        recommendedPercent: 2
                    },

                    {
                        id: "leisure_lottery",
                        name: "Lotería",
                        icon: "🎰",
                        active: true,
                        order: 40,
                        recommendedPercent: 1
                    },

                    {
                        id: "leisure_other",
                        name: "Otros",
                        icon: "🎉",
                        active: true,
                        order: 50,
                        recommendedPercent: 1
                    }

                ]
            },

            {
                id: "shopping",
                name: "Compras",
                icon: "🛍️",
                type: "expense",
                active: true,
                order: 50,
                recommendedPercent: 6,
                subcategories: [

                    {
                        id: "shopping_clothes",
                        name: "Ropa",
                        icon: "👕",
                        active: true,
                        order: 10,
                        recommendedPercent: 3
                    },

                    {
                        id: "shopping_personal_care",
                        name: "Cuidado personal",
                        icon: "💇",
                        active: true,
                        order: 20,
                        recommendedPercent: 1
                    },

                    {
                        id: "shopping_gifts",
                        name: "Regalos",
                        icon: "🎁",
                        active: true,
                        order: 30,
                        recommendedPercent: 1
                    },

                    {
                        id: "shopping_other",
                        name: "Otros",
                        icon: "📦",
                        active: true,
                        order: 40,
                        recommendedPercent: 1
                    }

                ]
            },

            {
                id: "health",
                name: "Salud",
                icon: "🩺",
                type: "expense",
                active: true,
                order: 60,
                recommendedPercent: 4,
                subcategories: [

                    {
                        id: "health_pharmacy",
                        name: "Farmacia",
                        icon: "💊",
                        active: true,
                        order: 10,
                        recommendedPercent: 1
                    },

                    {
                        id: "health_insurance",
                        name: "Seguro médico",
                        icon: "🏥",
                        active: true,
                        order: 20,
                        recommendedPercent: 2
                    },

                    {
                        id: "health_other",
                        name: "Otros",
                        icon: "🩹",
                        active: true,
                        order: 30,
                        recommendedPercent: 1
                    }

                ]
            },

            {
                id: "sport",
                name: "Deporte",
                icon: "🏃",
                type: "expense",
                active: true,
                order: 70,
                recommendedPercent: 5,
                subcategories: [

                    {
                        id: "sport_gym",
                        name: "Gimnasio",
                        icon: "🏋️",
                        active: true,
                        order: 10,
                        recommendedPercent: 2
                    },

                    {
                        id: "sport_golf",
                        name: "Club de golf",
                        icon: "⛳",
                        active: true,
                        order: 20,
                        recommendedPercent: 2
                    },

                    {
                        id: "sport_padel",
                        name: "Pádel",
                        icon: "🎾",
                        active: true,
                        order: 30,
                        recommendedPercent: 1
                    },

                    {
                        id: "sport_other",
                        name: "Otros",
                        icon: "🏅",
                        active: true,
                        order: 40,
                        recommendedPercent: 0
                    }

                ]
            },

            {
                id: "subscriptions",
                name: "Suscripciones",
                icon: "📱",
                type: "expense",
                active: true,
                order: 80,
                recommendedPercent: 3,
                subcategories: [

                    {
                        id: "subscriptions_streaming",
                        name: "Streaming",
                        icon: "🎬",
                        active: true,
                        order: 10,
                        recommendedPercent: 1
                    },

                    {
                        id: "subscriptions_software",
                        name: "Apps y software",
                        icon: "💻",
                        active: true,
                        order: 20,
                        recommendedPercent: 0.75
                    },

                    {
                        id: "subscriptions_cloud",
                        name: "Nube y almacenamiento",
                        icon: "☁️",
                        active: true,
                        order: 30,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "subscriptions_phone",
                        name: "Telefonía e internet",
                        icon: "📞",
                        active: true,
                        order: 40,
                        recommendedPercent: 0.75
                    },

                    {
                        id: "subscriptions_other",
                        name: "Otras",
                        icon: "🔁",
                        active: true,
                        order: 50,
                        recommendedPercent: 0
                    }

                ]
            },

            {
                id: "travel",
                name: "Viajes",
                icon: "✈️",
                type: "expense",
                active: true,
                order: 90,
                recommendedPercent: 3,
                subcategories: [

                    {
                        id: "travel_transport",
                        name: "Transporte",
                        icon: "🚆",
                        active: true,
                        order: 10,
                        recommendedPercent: 1
                    },

                    {
                        id: "travel_accommodation",
                        name: "Alojamiento",
                        icon: "🏨",
                        active: true,
                        order: 20,
                        recommendedPercent: 1
                    },

                    {
                        id: "travel_food",
                        name: "Restauración",
                        icon: "🍽️",
                        active: true,
                        order: 30,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "travel_activities",
                        name: "Actividades",
                        icon: "🎟️",
                        active: true,
                        order: 40,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "travel_shopping",
                        name: "Compras",
                        icon: "🛍️",
                        active: true,
                        order: 50,
                        recommendedPercent: 0
                    },

                    {
                        id: "travel_other",
                        name: "Otros",
                        icon: "🧳",
                        active: true,
                        order: 60,
                        recommendedPercent: 0
                    }

                ]
            },

            {
                id: "taxes",
                name: "Impuestos, tasas y sanciones",
                icon: "🧾",
                type: "expense",
                active: true,
                order: 100,
                recommendedPercent: 2,
                subcategories: [

                    {
                        id: "taxes_income",
                        name: "Declaración de la renta",
                        icon: "📄",
                        active: true,
                        order: 10,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "taxes_vehicle",
                        name: "Impuesto de circulación",
                        icon: "🚘",
                        active: true,
                        order: 20,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "taxes_fees",
                        name: "Tasas administrativas",
                        icon: "🏛️",
                        active: true,
                        order: 30,
                        recommendedPercent: 0.5
                    },

                    {
                        id: "taxes_fines",
                        name: "Multas",
                        icon: "⚠️",
                        active: true,
                        order: 40,
                        recommendedPercent: 0
                    },

                    {
                        id: "taxes_other",
                        name: "Otros impuestos",
                        icon: "🧮",
                        active: true,
                        order: 50,
                        recommendedPercent: 0.5
                    }

                ]
            },

            {
                id: "other_expense",
                name: "Otros gastos",
                icon: "❔",
                type: "expense",
                active: true,
                order: 110,
                recommendedPercent: 0,
                subcategories: [

                    {
                        id: "other_expense_unclassified",
                        name: "Sin clasificar",
                        icon: "❔",
                        active: true,
                        order: 10,
                        recommendedPercent: 0
                    }

                ]
            }

        ];

    },

    incomeCategories() {

        return [

            {
                id: "work",
                name: "Trabajo",
                icon: "💼",
                type: "income",
                active: true,
                order: 10,
                subcategories: [

                    {
                        id: "work_salary",
                        name: "Nómina",
                        icon: "💼",
                        active: true,
                        order: 10
                    },

                    {
                        id: "work_extra_pay",
                        name: "Paga extra",
                        icon: "✨",
                        active: true,
                        order: 20
                    },

                    {
                        id: "work_allowances",
                        name: "Dietas",
                        icon: "🧾",
                        active: true,
                        order: 30
                    }

                ]
            },

            {
                id: "bizum",
                name: "Bizums",
                icon: "📲",
                type: "income",
                active: true,
                order: 20,
                subcategories: [

                    {
                        id: "bizum_gifts",
                        name: "Regalos",
                        icon: "🎁",
                        active: true,
                        order: 10,
                        incomeBehavior:
                            "income"
                    },

                    {
                        id: "bizum_other",
                        name: "Otros Bizums",
                        icon: "📲",
                        active: true,
                        order: 20,
                        incomeBehavior:
                            "income"
                    }

                ]
            },

            {
                id: "extra_income",
                name: "Ingresos extra",
                icon: "💰",
                type: "income",
                active: true,
                order: 30,
                subcategories: [

                    {
                        id: "extra_income_second_hand",
                        name: "Venta de segunda mano",
                        icon: "🏷️",
                        active: true,
                        order: 10
                    },

                    {
                        id: "extra_income_other",
                        name: "Otros",
                        icon: "💰",
                        active: true,
                        order: 20
                    }

                ]
            },

            {
                id: "other_income",
                name: "Otros ingresos",
                icon: "🧾",
                type: "income",
                active: true,
                order: 40,
                subcategories: [

                    {
                        id: "other_income_unclassified",
                        name: "Sin clasificar",
                        icon: "❔",
                        active: true,
                        order: 10
                    }

                ]
            }

        ];

    },

    budgetConfiguration() {

        return {

            enabled: true,

            base:
                "monthly_net_income",

            mode:
                "calendar_month",

            allowPercentage:
                true,

            allowFixedAmount:
                true,

            warnAboveTotalPercent:
                100,

            savingAndInvestmentTargetPercent:
                20,

            thresholds: {

                healthy:
                    80,

                warning:
                    100

            },

            projectionEnabled:
                true,

            categoryBudgets:
                this.expenseCategories()
                    .map(
                        category => ({

                            categoryId:
                                category.id,

                            mode:
                                "percentage",

                            recommendedPercent:
                                category.recommendedPercent,

                            targetPercent:
                                category.recommendedPercent,

                            fixedAmount:
                                null,

                            active:
                                category.recommendedPercent > 0,

                            subcategories:
                                category.subcategories.map(
                                    subcategory => ({

                                        subcategoryId:
                                            subcategory.id,

                                        mode:
                                            "percentage",

                                        recommendedPercent:
                                            subcategory
                                                .recommendedPercent,

                                        targetPercent:
                                            subcategory
                                                .recommendedPercent,

                                        fixedAmount:
                                            null,

                                        active:
                                            subcategory
                                                .recommendedPercent > 0

                                    })
                                )

                        })
                    )

        };

    },

    recurringRules() {

        return [

            {
                id: "recurring_salary",
                name: "Nómina",
                type: "income",
                categoryId: "work",
                subcategoryId: "work_salary",
                accountId: null,
                recurrence: "monthly",
                dueRule:
                    "last_working_friday",
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_extra_pay",
                name: "Paga extra",
                type: "income",
                categoryId: "work",
                subcategoryId:
                    "work_extra_pay",
                accountId: null,
                recurrence:
                    "selected_months",
                months: [
                    8,
                    12
                ],
                dueRule:
                    "last_working_friday",
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_rent",
                name: "Alquiler",
                type: "expense",
                categoryId: "housing",
                subcategoryId:
                    "housing_rent",
                accountId: null,
                recurrence: "monthly",
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 7,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_utilities",
                name: "Suministros",
                type: "expense",
                categoryId: "housing",
                subcategoryId:
                    "housing_utilities",
                accountId: null,
                recurrence: "monthly",
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 7,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_parking",
                name: "Parking",
                type: "expense",
                categoryId: "transport",
                subcategoryId:
                    "transport_parking",
                accountId: null,
                recurrence: "monthly",
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 7,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_golf",
                name: "Club de golf",
                type: "expense",
                categoryId: "sport",
                subcategoryId:
                    "sport_golf",
                accountId: null,
                recurrence: "monthly",
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 7,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_gym",
                name: "Gimnasio",
                type: "expense",
                categoryId: "sport",
                subcategoryId:
                    "sport_gym",
                accountId: null,
                recurrence: "monthly",
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 7,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_motorbike_insurance",
                name: "Seguro moto",
                type: "expense",
                categoryId: "transport",
                subcategoryId:
                    "transport_insurance",
                accountId: null,
                recurrence:
                    "selected_months",
                months: [
                    7
                ],
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 31,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_car_insurance",
                name: "Seguro coche",
                type: "expense",
                categoryId: "transport",
                subcategoryId:
                    "transport_insurance",
                accountId: null,
                recurrence:
                    "selected_months",
                months: [
                    8,
                    9,
                    10
                ],
                dueRule: "day_range",
                dueDayFrom: 1,
                dueDayTo: 31,
                amountMode:
                    "by_month",
                amount: null,
                monthlyAmounts: {
                    8: null,
                    9: null,
                    10: null
                },
                requiresConfirmation: true,
                active: true
            },

            {
                id: "recurring_car_loan",
                name: "Pago del coche",
                type: "debt_payment",
                categoryId: null,
                subcategoryId: null,
                accountId: null,
                debtAccountId:
                    "loan_car",
                recurrence: "monthly",
                dueRule: "end_of_month",
                daysBeforeEnd: 0,
                amountMode:
                    "last_amount",
                amount: null,
                requiresConfirmation: true,
                active: true
            }

        ];

    },

    travelConfiguration() {

        return {

            enabled: true,

            allowTripBudgets:
                true,

            allowMonthlyTravelFund:
                true,

            monthlyTravelFundCountsAsExpense:
                false,

            activeTrips: []

        };

    },

    defaultCatalog() {

        return {

            version:
                this.version,

            categories: {

                expense:
                    this.expenseCategories(),

                income:
                    this.incomeCategories()

            },

            budgets:
                this.budgetConfiguration(),

            recurringRules:
                this.recurringRules(),

            financialCalendar:
                this.financialCalendar(),

            travel:
                this.travelConfiguration(),

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };

    },

    migrateIncomeCategories(categories) {

        const current =
            Array.isArray(categories)
                ? this.clone(categories)
                : [];

        const withoutRefunds =
            current.filter(
                category =>
                    category.id !==
                    "refunds"
            );

        const bizum =
            withoutRefunds.find(
                category =>
                    category.id ===
                    "bizum"
            );

        if (
            bizum &&
            Array.isArray(
                bizum.subcategories
            )
        ) {

            bizum.subcategories =
                bizum.subcategories
                    .filter(
                        subcategory =>
                            subcategory.id !==
                            "bizum_shared_expenses"
                    )
                    .map(
                        (
                            subcategory,
                            index
                        ) => ({

                            ...subcategory,

                            order:
                                (
                                    index +
                                    1
                                ) * 10

                        })
                    );

        }

        return withoutRefunds
            .map(
                (
                    category,
                    index
                ) => ({

                    ...category,

                    order:
                        (
                            index +
                            1
                        ) * 10

                })
            );

    },

    migrateSportCategory(categories) {

        const current =
            Array.isArray(categories)
                ? this.clone(categories)
                : [];

        const sport =
            current.find(
                category =>
                    category.id ===
                    "sport"
            );

        if (!sport) {

            const defaultSport =
                this.expenseCategories()
                    .find(
                        category =>
                            category.id ===
                            "sport"
                    );

            if (defaultSport) {

                current.push(
                    this.clone(
                        defaultSport
                    )
                );

            }

            return current;

        }

        if (
            !Array.isArray(
                sport.subcategories
            )
        ) {

            sport.subcategories = [];

        }

        const padelExists =
            sport.subcategories.some(
                subcategory =>
                    subcategory.id ===
                    "sport_padel"
            );

        if (!padelExists) {

            sport.subcategories.push({

                id:
                    "sport_padel",

                name:
                    "Pádel",

                icon:
                    "🎾",

                active:
                    true,

                order:
                    30,

                recommendedPercent:
                    1

            });

        }

        const other =
            sport.subcategories.find(
                subcategory =>
                    subcategory.id ===
                    "sport_other"
            );

        if (other) {

            other.order = 40;

            if (
                this.number(
                    other.recommendedPercent
                ) === 1
            ) {

                other.recommendedPercent =
                    0;

            }

        }

        sport.subcategories.sort(
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
        );

        return current;

    },

    migrateBudgetConfiguration(
        budgets,
        expenseCategories
    ) {

        const updatedBudgets =
            budgets
                ? this.clone(
                    budgets
                )
                : this.budgetConfiguration();

        if (
            !Array.isArray(
                updatedBudgets
                    .categoryBudgets
            )
        ) {

            updatedBudgets
                .categoryBudgets =
                [];

        }

        expenseCategories.forEach(
            category => {

                let categoryBudget =
                    updatedBudgets
                        .categoryBudgets
                        .find(
                            item =>
                                item.categoryId ===
                                category.id
                        );

                if (!categoryBudget) {

                    categoryBudget = {

                        categoryId:
                            category.id,

                        mode:
                            "percentage",

                        recommendedPercent:
                            category
                                .recommendedPercent,

                        targetPercent:
                            category
                                .recommendedPercent,

                        fixedAmount:
                            null,

                        active:
                            category
                                .recommendedPercent > 0,

                        subcategories:
                            []

                    };

                    updatedBudgets
                        .categoryBudgets
                        .push(
                            categoryBudget
                        );

                }

                if (
                    !Array.isArray(
                        categoryBudget
                            .subcategories
                    )
                ) {

                    categoryBudget
                        .subcategories =
                        [];

                }

                category
                    .subcategories
                    .forEach(
                        subcategory => {

                            const exists =
                                categoryBudget
                                    .subcategories
                                    .some(
                                        item =>
                                            item.subcategoryId ===
                                            subcategory.id
                                    );

                            if (!exists) {

                                categoryBudget
                                    .subcategories
                                    .push({

                                        subcategoryId:
                                            subcategory.id,

                                        mode:
                                            "percentage",

                                        recommendedPercent:
                                            subcategory
                                                .recommendedPercent,

                                        targetPercent:
                                            subcategory
                                                .recommendedPercent,

                                        fixedAmount:
                                            null,

                                        active:
                                            subcategory
                                                .recommendedPercent > 0

                                    });

                            }

                        }
                    );

            }
        );

        return updatedBudgets;

    },

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    ensure(data) {

        const updatedData =
            this.clone(data || {});

        if (
            !updatedData.catalog ||
            !updatedData.catalog.version
        ) {

            updatedData.catalog =
                this.defaultCatalog();

            return updatedData;

        }

        if (
            !updatedData.catalog.categories
        ) {

            updatedData.catalog.categories = {

                expense:
                    this.expenseCategories(),

                income:
                    this.incomeCategories()

            };

        }

        updatedData.catalog
            .categories.expense =
            this.migrateSportCategory(
                updatedData.catalog
                    .categories.expense
            );

        updatedData.catalog
            .categories.income =
            this.migrateIncomeCategories(
                updatedData.catalog
                    .categories.income
            );

        updatedData.catalog.budgets =
            this.migrateBudgetConfiguration(
                updatedData.catalog.budgets,
                updatedData.catalog
                    .categories.expense
            );

        if (
            !Array.isArray(
                updatedData.catalog
                    .recurringRules
            )
        ) {

            updatedData.catalog
                .recurringRules =
                this.recurringRules();

        }

        if (
            !updatedData.catalog
                .financialCalendar
        ) {

            updatedData.catalog
                .financialCalendar =
                this.financialCalendar();

        }

        if (
            !updatedData.catalog.travel
        ) {

            updatedData.catalog.travel =
                this.travelConfiguration();

        }

        updatedData.catalog.version =
            this.version;

        updatedData.catalog.updatedAt =
            new Date().toISOString();

        return updatedData;

    }

};

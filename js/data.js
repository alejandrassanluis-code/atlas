/* ==========================================================
   ATLAS
   data.js
   Configuración inicial
========================================================== */

const AtlasData = {

    version: "1.0",

    settings: {

        currency: "EUR",

        locale: "es-ES",

        monthlySavingGoal: 25,

        firstDayOfMonth: 1

    },

    accounts: [

        {
            id: "bbva_nomina",
            name: "BBVA Cuenta Nómina",
            type: "liquidity",
            balance: 0,
            icon: "🏦"
        },

        {
            id: "bbva_secundaria",
            name: "BBVA Cuenta Secundaria",
            type: "liquidity",
            balance: 0,
            icon: "🏦"
        },

        {
            id: "trade_cash",
            name: "Trade Republic Efectivo",
            type: "liquidity",
            balance: 0,
            icon: "💶"
        },

        {
            id: "trade_etf",
            name: "Trade Republic ETFs",
            type: "investment",
            balance: 0,
            profitability: 0,
            icon: "📈"
        },

        {
            id: "revolut_bot",
            name: "Revolut Bot",
            type: "investment",
            balance: 0,
            profitability: 0,
            icon: "🤖"
        },

        {
            id: "amex",
            name: "American Express",
            type: "creditcard",
            balance: 0,
            icon: "💳"
        },

        {
            id: "bbva_credit",
            name: "Tarjeta Crédito BBVA",
            type: "creditcard",
            balance: 0,
            icon: "💳"
        },

        {
            id: "loan_car",
            name: "Préstamo Coche",
            type: "loan",
            balance: 0,
            icon: "🚗"
        }

    ],

    categories: {

        income: [

            "Nómina",
            "Bonus",
            "Intereses",
            "Dividendos",
            "Otros"

        ],

        expense: [

            "Vivienda",
            "Supermercado",
            "Restaurantes",
            "Ocio",
            "Transporte",
            "Viajes",
            "Salud",
            "Compras",
            "Suscripciones",
            "Seguros",
            "Impuestos",
            "Coche",
            "Otros"

        ]

    },

    movements: [],

    budgets: [],

    goals: [],

    investments: [],

    snapshots: []

};

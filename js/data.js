/* ==========================================================
   ATLAS
   data.js
========================================================== */

const AtlasData = {

    version: "1.0",

    initialized: false,

    settings: {

        currency: "EUR",

        locale: "es-ES",

        monthlySavingGoal: 25

    },

    accounts: [

        // ----------- LIQUIDEZ -----------

        {
            id: "bbva_nomina",
            name: "BBVA Cuenta Nómina",
            group: "liquidity",
            type: "bank",
            balance: 0
        },

        {
            id: "bbva_secundaria",
            name: "BBVA Cuenta Secundaria",
            group: "liquidity",
            type: "bank",
            balance: 0
        },

        {
            id: "trade_cash",
            name: "Trade Republic Efectivo",
            group: "liquidity",
            type: "broker_cash",
            balance: 0
        },

        // ----------- INVERSIONES -----------

        {
            id: "trade_etfs",
            name: "Trade Republic ETFs",
            group: "investment",
            type: "etf",
            invested: 0,
            balance: 0
        },

        {
            id: "revolut_bot",
            name: "Revolut Bot",
            group: "investment",
            type: "roboadvisor",
            invested: 0,
            balance: 0
        },

        // ----------- DEUDAS -----------

        {
            id: "loan_car",

            name: "Préstamo coche",

            group: "debt",

            type: "loan",

            balance: 0
        },

        {
            id: "amex",

            name: "American Express",

            group: "debt",

            type: "credit",

            balance: 0
        },

        {
            id: "bbva_credit",

            name: "Tarjeta Crédito BBVA",

            group: "debt",

            type: "credit",

            balance: 0
        }

    ],

    movements: [],

    budgets: [],

    goals: [],

    snapshots: []

};

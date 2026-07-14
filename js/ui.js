/* ==========================================================
   ATLAS
   ui.js
   Sprint 1.5 — Definitivo
========================================================== */

const AtlasUI = {

    _toastTimer: null,

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0);

    },

    formatPercent(value) {

        const number =
            Number(value) || 0;

        return `${number.toFixed(1)}%`;

    },

    shortDate() {

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day: "numeric",
                month: "short"
            }
        )
            .format(new Date())
            .replace(".", "");

    },

/* ==========================================================
   ATLAS
   ui-periods.js
   Ahorro acumulado según el mes imputado
========================================================== */

const AtlasUIPeriods = {

    initialized: false,

    validMonth(value) {

        return /^\d{4}-\d{2}$/.test(
            String(value || "")
        );

    },

    monthFromDate(date) {

        const monthKey =
            String(
                date || ""
            ).slice(
                0,
                7
            );

        return this.validMonth(
            monthKey
        )
            ? monthKey
            : "";

    },

    movementMonth(movement) {

        const candidates = [

            movement?.periodMonth,

            movement?.economicMonth,

            movement?.imputedMonth,

            this.monthFromDate(
                movement?.date
            )

        ];

        return (
            candidates.find(
                value =>
                    this.validMonth(
                        value
                    )
            ) ||
            ""
        );

    },

    cumulativeSavings(data) {

        const movements =
            Array.isArray(
                data?.movements
            )
                ? data.movements
                : [];

        const monthKeys =
            [
                ...new Set(
                    movements
                        .map(
                            movement =>
                                this.movementMonth(
                                    movement
                                )
                        )
                        .filter(
                            monthKey =>
                                this.validMonth(
                                    monthKey
                                )
                        )
                )
            ].sort();

        return monthKeys.reduce(
            (
                total,
                monthKey
            ) => {

                const summary =
                    AtlasCalculations
                        .financialSummary(
                            data,
                            monthKey
                        );

                return (
                    total +
                    (
                        Number(
                            summary
                                ?.monthlySavings
                        ) ||
                        0
                    )
                );

            },
            0
        );

    },

    firstDataMonth(data) {

        const movements =
            Array.isArray(
                data?.movements
            )
                ? data.movements
                : [];

        const monthKeys =
            movements
                .map(
                    movement =>
                        this.movementMonth(
                            movement
                        )
                )
                .filter(
                    monthKey =>
                        this.validMonth(
                            monthKey
                        )
                )
                .sort();

        return (
            monthKeys[0] ||
            AtlasCalculations
                .monthKey()
        );

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasUI ===
                "undefined" ||
            typeof AtlasCalculations ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        AtlasUI.cumulativeSavings =
            data =>
                this.cumulativeSavings(
                    data
                );

        if (
            typeof AtlasAnalysisUI !==
                "undefined"
        ) {

            AtlasAnalysisUI.firstDataMonth =
                data =>
                    this.firstDataMonth(
                        data
                    );

        }

    }

};

AtlasUIPeriods.install();

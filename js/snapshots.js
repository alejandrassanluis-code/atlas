/* ==========================================================
   ATLAS
   snapshots.js
   Atlas v1.0 — Gestión segura de cierres mensuales
========================================================== */

const AtlasSnapshots = {

    initialized:
        false,

    selectedMonth:
        null,

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

    number(value) {

        const normalized =
            String(
                value ?? ""
            )
                .trim()
                .replace(
                    ",",
                    "."
                );

        const result =
            Number(
                normalized
            );

        return Number.isFinite(
            result
        )
            ? result
            : 0;

    },

    nullableNumber(value) {

        const normalized =
            String(
                value ?? ""
            )
                .trim()
                .replace(
                    ",",
                    "."
                );

        if (!normalized) {

            return null;

        }

        const result =
            Number(
                normalized
            );

        return Number.isFinite(
            result
        )
            ? result
            : null;

    },

    round(value) {

        return Math.round(
            this.number(
                value
            ) * 100
        ) / 100;

    },

    now() {

        return new Date()
            .toISOString();

    },

    escape(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    },

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-ES",
            {
                style:
                    "currency",

                currency:
                    "EUR",

                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        ).format(
            this.number(
                value
            )
        );

    },

    formatMonthKey(monthKey) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(
                Number
            );

        if (
            !year ||
            !month
        ) {

            return "";

        }

        const label =
            new Intl.DateTimeFormat(
                "es-ES",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            ).format(
                new Date(
                    year,
                    month - 1,
                    1
                )
            );

        return (
            label.charAt(
                0
            ).toUpperCase() +
            label.slice(
                1
            )
        );

    },

    monthEndDate(monthKey) {

        const [
            year,
            month
        ] = String(
            monthKey || ""
        )
            .split("-")
            .map(
                Number
            );

        if (
            !year ||
            !month
        ) {

            return "";

        }

        const date =
            new Date(
                year,
                month,
                0
            );

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join("-");

    },

    snapshots() {

        return Array.isArray(
            AtlasSettings.data
                ?.snapshots
        )
            ? AtlasSettings.data
                .snapshots
            : [];

    },

    findSnapshot(monthKey) {

        return (
            this.snapshots()
                .find(
                    snapshot =>
                        snapshot.monthKey ===
                            monthKey &&
                        (
                            snapshot.type ||
                            "calendar_month"
                        ) ===
                            "calendar_month"
                ) ||
            null
        );

    },

    currentTotals() {

        return AtlasSettings
            .snapshotTotals(
                AtlasSettings.data
            );

    },

    snapshotValues(
        monthKey
    ) {

        const existing =
            this.findSnapshot(
                monthKey
            );

        if (existing) {

            return {

                source:
                    "stored",

                liquidity:
                    this.number(
                        existing.liquidity
                    ),

                investments:
                    this.number(
                        existing.investments
                    ),

                investedCapital:
                    this.number(
                        existing.investedCapital
                    ),

                investmentGain:
                    this.number(
                        existing.investmentGain
                    ),

                debt:
                    this.number(
                        existing.debt
                    ),

                netWorth:
                    this.number(
                        existing.netWorth
                    ),

                capturedAt:
                    existing.capturedAt ||
                    existing.updatedAt ||
                    existing.createdAt ||
                    null,

                status:
                    existing.status ||
                    "complete"

            };

        }

        if (
            monthKey ===
            this.currentMonthKey()
        ) {

            const totals =
                this.currentTotals();

            return {

                source:
                    "current",

                liquidity:
                    this.number(
                        totals.liquidity
                    ),

                investments:
                    this.number(
                        totals.investments
                    ),

                investedCapital:
                    this.number(
                        totals.investedCapital
                    ),

                investmentGain:
                    this.number(
                        totals.investmentGain
                    ),

                debt:
                    this.number(
                        totals.debt
                    ),

                netWorth:
                    this.number(
                        totals.netWorth
                    ),

                capturedAt:
                    this.now(),

                status:
                    "complete"

            };

        }

        return {

            source:
                "manual",

            liquidity:
                null,

            investments:
                null,

            investedCapital:
                null,

            investmentGain:
                null,

            debt:
                null,

            netWorth:
                null,

            capturedAt:
                null,

            status:
                "pending_review"

        };

    },

    numericValue(value) {

        return value ===
            null
            ? ""
            : this.escape(
                value
            );

    },

    inputField(
        name,
        label,
        value
    ) {

        return `

            <label
                class="atlas-settings-field"
            >

                <span>
                    ${label}
                </span>

                <input
                    name="${name}"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="0.01"
                    value="${this.numericValue(
                        value
                    )}"
                    placeholder="0,00"
                    required
                    data-snapshot-value
                >

            </label>

        `;

    },

    statusOptions(
        selected
    ) {

        const options = [

            [
                "complete",
                "Completo"
            ],

            [
                "partial",
                "Parcial"
            ],

            [
                "pending_review",
                "Pendiente de revisión"
            ]

        ];

        return options
            .map(
                (
                    [
                        value,
                        label
                    ]
                ) => `

                    <option
                        value="${value}"
                        ${
                            selected ===
                            value
                                ? "selected"
                                : ""
                        }
                    >
                        ${label}
                    </option>

                `
            )
            .join("");

    },

    renderSnapshot(
        monthKey = null
    ) {

        const currentMonth =
            this.currentMonthKey();

        const selectedMonth =
            monthKey ||
            this.selectedMonth ||
            currentMonth;

        this.selectedMonth =
            selectedMonth;

        const existing =
            this.findSnapshot(
                selectedMonth
            );

        const values =
            this.snapshotValues(
                selectedMonth
            );

        const isHistorical =
            selectedMonth <
            currentMonth;

        const isManualHistorical =
            isHistorical &&
            !existing;

        AtlasSettings.renderSheet(`

            ${AtlasSettings.headerBlock(
                "Cierre mensual",
                "Guarda y consulta la fotografía patrimonial de cada mes."
            )}

            <form
                class="atlas-settings-form"
                data-settings-form="snapshot"
            >

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Mes del cierre
                    </span>

                    <input
                        name="monthKey"
                        type="month"
                        value="${this.escape(
                            selectedMonth
                        )}"
                        max="${this.escape(
                            currentMonth
                        )}"
                        required
                        data-snapshot-month
                    >

                </label>

                ${
                    existing
                        ? `

                            <p
                                class="atlas-settings-warning"
                            >

                                Estás viendo la fotografía guardada de
                                ${this.escape(
                                    this.formatMonthKey(
                                        selectedMonth
                                    )
                                )}.
                                Los valores solo cambiarán si guardas
                                expresamente esta edición.

                            </p>

                        `
                        : (
                            isManualHistorical
                                ? `

                                    <p
                                        class="atlas-settings-warning"
                                    >

                                        No existe una fotografía para
                                        ${this.escape(
                                            this.formatMonthKey(
                                                selectedMonth
                                            )
                                        )}.
                                        Introduce los valores reales que
                                        había al cierre del mes. Atlas no
                                        utilizará los saldos actuales.

                                    </p>

                                `
                                : `

                                    <p
                                        class="atlas-settings-warning"
                                    >

                                        Estos son los saldos actuales.
                                        Revísalos antes de guardar el cierre.

                                    </p>

                                `
                        )
                }

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(
                                    0,
                                    1fr
                                )
                            );
                        gap:10px;
                    "
                >

                    ${this.inputField(
                        "snapshotLiquidity",
                        "Liquidez",
                        values.liquidity
                    )}

                    ${this.inputField(
                        "snapshotInvestments",
                        "Valor de inversiones",
                        values.investments
                    )}

                    ${this.inputField(
                        "snapshotInvestedCapital",
                        "Capital aportado",
                        values.investedCapital
                    )}

                    ${this.inputField(
                        "snapshotDebt",
                        "Deuda",
                        values.debt
                    )}

                </div>

                <label
                    class="atlas-settings-field"
                >

                    <span>
                        Estado del cierre
                    </span>

                    <select
                        name="snapshotStatus"
                    >
                        ${this.statusOptions(
                            values.status
                        )}
                    </select>

                </label>

                <div
                    class="atlas-settings-summary"
                    data-snapshot-summary
                >

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Ganancia inversiones
                        </span>

                        <strong
                            data-snapshot-investment-gain
                        >
                            ${this.formatCurrency(
                                values.investmentGain
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Patrimonio neto
                        </span>

                        <strong
                            data-snapshot-net-worth
                        >
                            ${this.formatCurrency(
                                values.netWorth
                            )}
                        </strong>

                    </div>

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            Fecha patrimonial
                        </span>

                        <strong>
                            ${this.escape(
                                this.monthEndDate(
                                    selectedMonth
                                )
                            )}
                        </strong>

                    </div>

                </div>

                <button
                    class="atlas-settings-primary"
                    type="submit"
                    data-settings-save
                >
                    ${
                        existing
                            ? "Actualizar cierre"
                            : "Guardar cierre mensual"
                    }
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cancelar
                </button>

            </form>

        `);

        this.updateCalculatedTotals();

    },

    updateCalculatedTotals() {

        const form =
            document.querySelector(
                '[data-settings-form="snapshot"]'
            );

        if (!form) {

            return;

        }

        const liquidity =
            this.number(
                form.elements
                    .snapshotLiquidity
                    ?.value
            );

        const investments =
            this.number(
                form.elements
                    .snapshotInvestments
                    ?.value
            );

        const investedCapital =
            this.number(
                form.elements
                    .snapshotInvestedCapital
                    ?.value
            );

        const debt =
            this.number(
                form.elements
                    .snapshotDebt
                    ?.value
            );

        const investmentGain =
            investments -
            investedCapital;

        const netWorth =
            liquidity +
            investments -
            debt;

        const gainElement =
            form.querySelector(
                "[data-snapshot-investment-gain]"
            );

        const netWorthElement =
            form.querySelector(
                "[data-snapshot-net-worth]"
            );

        if (gainElement) {

            gainElement.textContent =
                this.formatCurrency(
                    investmentGain
                );

        }

        if (netWorthElement) {

            netWorthElement.textContent =
                this.formatCurrency(
                    netWorth
                );

        }

    },

    createSnapshot(
        data,
        values,
        previous = null
    ) {

        const monthKey =
            values.monthKey;

        const liquidity =
            this.round(
                values.liquidity
            );

        const investments =
            this.round(
                values.investments
            );

        const investedCapital =
            this.round(
                values.investedCapital
            );

        const debt =
            this.round(
                values.debt
            );

        const investmentGain =
            this.round(
                investments -
                investedCapital
            );

        const netWorth =
            this.round(
                liquidity +
                investments -
                debt
            );

        const now =
            this.now();

        const isCurrentMonth =
            monthKey ===
            this.currentMonthKey();

        const accounts =
            isCurrentMonth
                ? (
                    data.accounts ||
                    []
                ).map(
                    account => ({

                        accountId:
                            account.id,

                        group:
                            account.group,

                        balance:
                            this.number(
                                account.balance
                            ),

                        invested:
                            this.number(
                                account.invested
                            )

                    })
                )
                : (
                    previous?.accounts ||
                    []
                );

        const investmentAccounts =
            isCurrentMonth
                ? AtlasSettings
                    .investmentAccounts(
                        data
                    )
                    .map(
                        account => ({

                            accountId:
                                account.id,

                            invested:
                                this.number(
                                    account.invested
                                ),

                            value:
                                this.number(
                                    account.balance
                                ),

                            gain:
                                this.round(
                                    this.number(
                                        account.balance
                                    ) -
                                    this.number(
                                        account.invested
                                    )
                                )

                        })
                    )
                : (
                    previous
                        ?.investmentAccounts ||
                    []
                );

        return {

            id:
                previous?.id ||
                `snapshot_${monthKey}`,

            type:
                "calendar_month",

            monthKey,

            periodKey:
                monthKey,

            capturedDate:
                this.monthEndDate(
                    monthKey
                ),

            capturedAt:
                previous?.capturedAt ||
                now,

            status:
                values.status,

            source:
                previous
                    ? (
                        previous.source ||
                        "saved"
                    )
                    : (
                        isCurrentMonth
                            ? "current_balances"
                            : "manual_historical"
                    ),

            liquidity,

            investments,

            investedCapital,

            investmentGain,

            debt,

            netWorth,

            accounts,

            investmentAccounts,

            createdAt:
                previous?.createdAt ||
                now,

            updatedAt:
                now

        };

    },

    saveSnapshot(form) {

        const formValues =
            new FormData(
                form
            );

        const monthKey =
            String(
                formValues.get(
                    "monthKey"
                ) ||
                ""
            );

        if (
            !/^\d{4}-\d{2}$/.test(
                monthKey
            )
        ) {

            AtlasSettings.saving =
                false;

            AtlasSettings
                .restoreSaveButton(
                    form
                );

            AtlasUI.toast(
                "Selecciona un mes válido."
            );

            return;

        }

        if (
            monthKey >
            this.currentMonthKey()
        ) {

            AtlasSettings.saving =
                false;

            AtlasSettings
                .restoreSaveButton(
                    form
                );

            AtlasUI.toast(
                "No puedes guardar un cierre futuro."
            );

            return;

        }

        const liquidity =
            this.nullableNumber(
                formValues.get(
                    "snapshotLiquidity"
                )
            );

        const investments =
            this.nullableNumber(
                formValues.get(
                    "snapshotInvestments"
                )
            );

        const investedCapital =
            this.nullableNumber(
                formValues.get(
                    "snapshotInvestedCapital"
                )
            );

        const debt =
            this.nullableNumber(
                formValues.get(
                    "snapshotDebt"
                )
            );

        if (
            [
                liquidity,
                investments,
                investedCapital,
                debt
            ].some(
                value =>
                    value === null ||
                    value < 0
            )
        ) {

            AtlasSettings.saving =
                false;

            AtlasSettings
                .restoreSaveButton(
                    form
                );

            AtlasUI.toast(
                "Introduce valores válidos para el cierre."
            );

            return;

        }

        const allowedStatuses = [

            "complete",

            "partial",

            "pending_review"

        ];

        const statusValue =
            String(
                formValues.get(
                    "snapshotStatus"
                ) ||
                "complete"
            );

        const status =
            allowedStatuses.includes(
                statusValue
            )
                ? statusValue
                : "complete";

        const updatedData =
            AtlasSettings.cloneData();

        if (
            !Array.isArray(
                updatedData.snapshots
            )
        ) {

            updatedData.snapshots =
                [];

        }

        const existingIndex =
            updatedData.snapshots
                .findIndex(
                    snapshot =>
                        snapshot.monthKey ===
                            monthKey &&
                        (
                            snapshot.type ||
                            "calendar_month"
                        ) ===
                            "calendar_month"
                );

        const previous =
            existingIndex >= 0
                ? updatedData.snapshots[
                    existingIndex
                ]
                : null;

        const snapshot =
            this.createSnapshot(
                updatedData,
                {
                    monthKey,
                    liquidity,
                    investments,
                    investedCapital,
                    debt,
                    status
                },
                previous
            );

        if (
            existingIndex >= 0
        ) {

            updatedData.snapshots[
                existingIndex
            ] = snapshot;

        } else {

            updatedData.snapshots.push(
                snapshot
            );

        }

        updatedData.snapshots.sort(
            (
                first,
                second
            ) =>
                String(
                    first.monthKey ||
                    ""
                ).localeCompare(
                    String(
                        second.monthKey ||
                        ""
                    )
                )
        );

        const saved =
            AtlasSettings
                .saveUpdatedData(
                    updatedData,
                    existingIndex >= 0
                        ? "Cierre mensual actualizado."
                        : "Cierre mensual guardado.",
                    form
                );

        if (saved) {

            this.selectedMonth =
                monthKey;

        }

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasSettings ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        AtlasSettings.renderSnapshot =
            monthKey =>
                this.renderSnapshot(
                    monthKey
                );

        AtlasSettings.saveSnapshot =
            form =>
                this.saveSnapshot(
                    form
                );

        document.addEventListener(
            "change",
            event => {

                const monthInput =
                    event.target.closest(
                        "[data-snapshot-month]"
                    );

                if (monthInput) {

                    this.selectedMonth =
                        monthInput.value ||
                        this.currentMonthKey();

                    this.renderSnapshot(
                        this.selectedMonth
                    );

                    return;

                }

            }
        );

        document.addEventListener(
            "input",
            event => {

                const valueInput =
                    event.target.closest(
                        "[data-snapshot-value]"
                    );

                if (!valueInput) {

                    return;

                }

                this.updateCalculatedTotals();

            }
        );

    }

};

AtlasSnapshots.install();

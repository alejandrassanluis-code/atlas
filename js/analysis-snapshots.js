/* ==========================================================
   ATLAS
   analysis-snapshots.js
   Atlas v1.0 — Fotografías mensuales en Análisis
========================================================== */

const AtlasAnalysisSnapshots = {

    initialized:
        false,

    number(value) {

        const result =
            Number(value);

        return Number.isFinite(result)
            ? result
            : 0;

    },

    escape(value) {

        if (
            typeof AtlasUI
                ?.escapeHtml ===
            "function"
        ) {

            return AtlasUI.escapeHtml(
                String(value ?? "")
            );

        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    },

    currency(value) {

        if (
            typeof AtlasUI
                ?.formatCurrency ===
            "function"
        ) {

            return AtlasUI.formatCurrency(
                this.number(value)
            );

        }

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
            this.number(value)
        );

    },

    formatMonth(monthKey) {

        if (
            typeof AtlasUI
                ?.formatMonthKey ===
            "function"
        ) {

            return AtlasUI.formatMonthKey(
                monthKey
            );

        }

        return String(
            monthKey || ""
        );

    },

    formatDate(value) {

        const text =
            String(
                value || ""
            ).slice(0, 10);

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                text
            )
        ) {

            return "Sin fecha";

        }

        const [
            year,
            month,
            day
        ] = text
            .split("-")
            .map(Number);

        return new Intl.DateTimeFormat(
            "es-ES",
            {
                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            new Date(
                year,
                month - 1,
                day
            )
        );

    },

    snapshots(data) {

        return (
            Array.isArray(
                data?.snapshots
            )
                ? data.snapshots
                : []
        )
            .filter(
                snapshot =>
                    (
                        snapshot.type ||
                        "calendar_month"
                    ) ===
                    "calendar_month" &&
                    /^\d{4}-\d{2}$/.test(
                        String(
                            snapshot.monthKey ||
                            ""
                        )
                    )
            )
            .slice()
            .sort(
                (
                    first,
                    second
                ) =>
                    String(
                        first.monthKey
                    ).localeCompare(
                        String(
                            second.monthKey
                        )
                    )
            );

    },

    findSnapshot(
        data,
        monthKey
    ) {

        return (
            this.snapshots(data)
                .find(
                    snapshot =>
                        snapshot.monthKey ===
                        monthKey
                ) ||
            null
        );

    },

    previousSnapshot(
        data,
        monthKey
    ) {

        const previous =
            this.snapshots(data)
                .filter(
                    snapshot =>
                        snapshot.monthKey <
                        monthKey
                );

        return previous.length
            ? previous[
                previous.length - 1
            ]
            : null;

    },

    statusInformation(status) {

        const statuses = {

            complete: {

                label:
                    "Completo",

                color:
                    "var(--color-success)",

                background:
                    "rgba(95, 214, 193, 0.09)",

                border:
                    "rgba(95, 214, 193, 0.2)"

            },

            partial: {

                label:
                    "Parcial",

                color:
                    "#f4b95e",

                background:
                    "rgba(244, 185, 94, 0.09)",

                border:
                    "rgba(244, 185, 94, 0.2)"

            },

            pending_review: {

                label:
                    "Pendiente de revisión",

                color:
                    "#f4b95e",

                background:
                    "rgba(244, 185, 94, 0.09)",

                border:
                    "rgba(244, 185, 94, 0.2)"

            }

        };

        return (
            statuses[status] ||
            statuses.complete
        );

    },

    changeInformation(
        current,
        previous
    ) {

        const difference =
            this.number(current) -
            this.number(previous);

        if (
            Math.abs(difference) <
            0.005
        ) {

            return {

                difference:
                    0,

                icon:
                    "•",

                label:
                    "Sin cambios",

                color:
                    "var(--color-text-muted)"

            };

        }

        return {

            difference,

            icon:
                difference > 0
                    ? "↑"
                    : "↓",

            label:
                `${
                    difference > 0
                        ? "+"
                        : "−"
                }${this.currency(
                    Math.abs(difference)
                )}`,

            color:
                difference > 0
                    ? "var(--color-success)"
                    : "var(--color-danger)"

        };

    },

    fact(
        label,
        value,
        options = {}
    ) {

        return `

            <div>

                <small>
                    ${this.escape(label)}
                </small>

                <strong
                    style="
                        color:
                            ${
                                options.color ||
                                "var(--color-text)"
                            };
                    "
                >
                    ${this.escape(value)}
                </strong>

                ${
                    options.detail
                        ? `

                            <span
                                style="
                                    color:
                                        ${
                                            options.detailColor ||
                                            "var(--color-text-muted)"
                                        };
                                "
                            >
                                ${this.escape(
                                    options.detail
                                )}
                            </span>

                        `
                        : ""
                }

            </div>

        `;

    },

    emptyPanel(monthKey) {

        return `

            <section
                class="
                    panel
                    atlas-analysis-panel
                    atlas-analysis-snapshot-panel
                "
            >

                ${AtlasAnalysisUI.panelHeader(
                    "Fotografía de cierre",
                    `Situación patrimonial de ${this.formatMonth(
                        monthKey
                    )}`
                )}

                <div
                    class="atlas-analysis-snapshot-empty"
                >

                    <span aria-hidden="true">
                        📸
                    </span>

                    <strong>
                        Este mes no tiene fotografía
                    </strong>

                    <p class="note">

                        Atlas no mostrará los saldos actuales
                        como si fueran históricos. Puedes crear
                        o revisar el cierre desde Ajustes.

                    </p>

                </div>

            </section>

        `;

    },

    panel(
        data,
        monthKey
    ) {

        const snapshot =
            this.findSnapshot(
                data,
                monthKey
            );

        if (!snapshot) {

            return this.emptyPanel(
                monthKey
            );

        }

        const previous =
            this.previousSnapshot(
                data,
                monthKey
            );

        const status =
            this.statusInformation(
                snapshot.status ||
                "complete"
            );

        const netWorthChange =
            previous
                ? this.changeInformation(
                    snapshot.netWorth,
                    previous.netWorth
                )
                : null;

        const liquidityChange =
            previous
                ? this.changeInformation(
                    snapshot.liquidity,
                    previous.liquidity
                )
                : null;

        const investmentChange =
            previous
                ? this.changeInformation(
                    snapshot.investments,
                    previous.investments
                )
                : null;

        const debtDifference =
            previous
                ? (
                    this.number(
                        snapshot.debt
                    ) -
                    this.number(
                        previous.debt
                    )
                )
                : 0;

        const debtChange =
            previous
                ? {

                    icon:
                        Math.abs(
                            debtDifference
                        ) < 0.005
                            ? "•"
                            : (
                                debtDifference > 0
                                    ? "↑"
                                    : "↓"
                            ),

                    label:
                        Math.abs(
                            debtDifference
                        ) < 0.005
                            ? "Sin cambios"
                            : `${
                                debtDifference > 0
                                    ? "+"
                                    : "−"
                            }${this.currency(
                                Math.abs(
                                    debtDifference
                                )
                            )}`,

                    color:
                        Math.abs(
                            debtDifference
                        ) < 0.005
                            ? "var(--color-text-muted)"
                            : (
                                debtDifference <= 0
                                    ? "var(--color-success)"
                                    : "var(--color-danger)"
                            )

                }
                : null;

        const capturedDate =
            snapshot.capturedDate ||
            String(
                snapshot.capturedAt ||
                snapshot.updatedAt ||
                snapshot.createdAt ||
                ""
            ).slice(0, 10);

        return `

            <section
                class="
                    panel
                    atlas-analysis-panel
                    atlas-analysis-snapshot-panel
                "
            >

                ${AtlasAnalysisUI.panelHeader(
                    "Fotografía de cierre",
                    `Situación patrimonial de ${this.formatMonth(
                        monthKey
                    )}`,
                    `

                        <span
                            class="atlas-analysis-snapshot-status"
                            style="
                                color:
                                    ${status.color};
                                background:
                                    ${status.background};
                                border-color:
                                    ${status.border};
                            "
                        >
                            ${this.escape(
                                status.label
                            )}
                        </span>

                    `
                )}

                <div
                    class="
                        atlas-analysis-facts
                        atlas-analysis-snapshot-facts
                    "
                >

                    ${this.fact(
                        "Patrimonio neto",
                        this.currency(
                            snapshot.netWorth
                        ),
                        {
                            color:
                                this.number(
                                    snapshot.netWorth
                                ) >= 0
                                    ? "var(--color-success)"
                                    : "var(--color-danger)",

                            detail:
                                netWorthChange
                                    ? (
                                        `${netWorthChange.icon} ` +
                                        `${netWorthChange.label} frente a ` +
                                        `${this.formatMonth(
                                            previous.monthKey
                                        )}`
                                    )
                                    : "Primer cierre disponible",

                            detailColor:
                                netWorthChange
                                    ?.color
                        }
                    )}

                    ${this.fact(
                        "Liquidez",
                        this.currency(
                            snapshot.liquidity
                        ),
                        {
                            detail:
                                liquidityChange
                                    ? (
                                        `${liquidityChange.icon} ` +
                                        `${liquidityChange.label} frente al cierre anterior`
                                    )
                                    : "Sin comparación anterior",

                            detailColor:
                                liquidityChange
                                    ?.color
                        }
                    )}

                    ${this.fact(
                        "Inversiones",
                        this.currency(
                            snapshot.investments
                        ),
                        {
                            detail:
                                investmentChange
                                    ? (
                                        `${investmentChange.icon} ` +
                                        `${investmentChange.label} frente al cierre anterior`
                                    )
                                    : "Sin comparación anterior",

                            detailColor:
                                investmentChange
                                    ?.color
                        }
                    )}

                    ${this.fact(
                        "Deuda",
                        this.currency(
                            snapshot.debt
                        ),
                        {
                            detail:
                                debtChange
                                    ? (
                                        `${debtChange.icon} ` +
                                        `${debtChange.label} frente al cierre anterior`
                                    )
                                    : "Sin comparación anterior",

                            detailColor:
                                debtChange
                                    ?.color
                        }
                    )}

                    ${this.fact(
                        "Capital aportado",
                        this.currency(
                            snapshot.investedCapital
                        ),
                        {
                            detail:
                                "Dinero aportado a inversiones"
                        }
                    )}

                    ${this.fact(
                        "Ganancia de inversiones",
                        this.currency(
                            snapshot.investmentGain
                        ),
                        {
                            color:
                                this.number(
                                    snapshot.investmentGain
                                ) >= 0
                                    ? "var(--color-success)"
                                    : "var(--color-danger)",

                            detail:
                                "Valor menos capital aportado"
                        }
                    )}

                </div>

                <div
                    class="atlas-analysis-snapshot-footer"
                >

                    <span>
                        Fecha patrimonial
                    </span>

                    <strong>
                        ${this.escape(
                            this.formatDate(
                                capturedDate
                            )
                        )}
                    </strong>

                </div>

            </section>

        `;

    },

    installStyles() {

        const previous =
            document.getElementById(
                "atlas-analysis-snapshot-styles"
            );

        if (previous) {

            previous.remove();

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "atlas-analysis-snapshot-styles";

        style.textContent = `

            .atlas-analysis-snapshot-panel {
                position: relative;
            }

            .atlas-analysis-snapshot-status {
                min-height: 27px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding:
                    0
                    9px;
                border:
                    1px solid
                    transparent;
                border-radius: 99px;
                font-size: 9px;
                font-weight: 800;
                white-space: nowrap;
            }

            .atlas-analysis-snapshot-facts {
                margin-top: 14px;
            }

            .atlas-analysis-snapshot-empty {
                padding:
                    25px
                    12px
                    10px;
                text-align: center;
            }

            .atlas-analysis-snapshot-empty > span {
                display: block;
                margin-bottom: 9px;
                font-size: 29px;
            }

            .atlas-analysis-snapshot-empty > strong {
                display: block;
                font-size: 14px;
            }

            .atlas-analysis-snapshot-empty > p {
                max-width: 310px;
                margin:
                    7px
                    auto
                    0;
                line-height: 1.5;
            }

            .atlas-analysis-snapshot-footer {
                display: flex;
                align-items: center;
                justify-content:
                    space-between;
                gap: 12px;
                margin-top: 13px;
                padding:
                    11px
                    12px;
                border:
                    1px solid
                    rgba(
                        145,
                        164,
                        202,
                        0.1
                    );
                border-radius: 14px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
            }

            .atlas-analysis-snapshot-footer span {
                color:
                    var(
                        --color-text-muted
                    );
                font-size: 9px;
            }

            .atlas-analysis-snapshot-footer strong {
                font-size: 10px;
                text-align: right;
            }

        `;

        document.head.appendChild(
            style
        );

    },

    install() {

        if (
            this.initialized ||
            typeof AtlasAnalysisUI ===
                "undefined"
        ) {

            return;

        }

        this.initialized =
            true;

        this.installStyles();

        const originalMonthlyView =
            AtlasAnalysisUI.monthlyView
                .bind(
                    AtlasAnalysisUI
                );

        AtlasAnalysisUI.monthlyView =
            (
                data,
                options
            ) => {

                const content =
                    originalMonthlyView(
                        data,
                        options
                    );

                const analysisMonth =
                    options.analysisMonth ||
                    AtlasCalculations
                        .monthKey();

                return `

                    ${content}

                    ${this.panel(
                        data,
                        analysisMonth
                    )}

                `;

            };

    }

};

AtlasAnalysisSnapshots.install();

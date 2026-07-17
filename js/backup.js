/* ==========================================================
   ATLAS
   backup.js
   Atlas v1.0 — Copias de seguridad y restauración
========================================================== */

const AtlasBackup = {

    data:
        null,

    onComplete:
        null,

    selectedBackup:
        null,

    originalSettingsOpen:
        null,

    originalSettingsRenderMenu:
        null,

    escape(value) {

        if (
            typeof AtlasUI !==
                "undefined" &&
            typeof AtlasUI.escapeHtml ===
                "function"
        ) {

            return AtlasUI.escapeHtml(
                value
            );

        }

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

    number(value) {

        const result =
            Number(
                value
            );

        return Number.isFinite(
            result
        )
            ? result
            : 0;

    },

    formatDate(value) {

        if (!value) {

            return "Nunca";

        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Fecha desconocida";

        }

        return new Intl.DateTimeFormat(
            "es-ES",
            {

                dateStyle:
                    "medium",

                timeStyle:
                    "short"

            }
        ).format(
            date
        );

    },

    formatDataVersion(value) {

        if (
            value ===
                null ||
            value ===
                undefined ||
            value ===
                ""
        ) {

            return "Sin especificar";

        }

        return String(
            value
        );

    },

    summaryRows(summary = {}) {

        const rows = [

            {
                label:
                    "Cuentas",

                value:
                    this.number(
                        summary.accounts
                    )
            },

            {
                label:
                    "Movimientos",

                value:
                    this.number(
                        summary.movements
                    )
            },

            {
                label:
                    "Presupuestos",

                value:
                    this.number(
                        summary.budgets
                    )
            },

            {
                label:
                    "Recurrentes",

                value:
                    this.number(
                        summary.recurring
                    )
            },

            {
                label:
                    "Objetivos",

                value:
                    this.number(
                        summary.goals
                    )
            }

        ];

        return rows
            .map(
                row => `

                    <div
                        class="atlas-settings-summary-row"
                    >

                        <span>
                            ${this.escape(
                                row.label
                            )}
                        </span>

                        <strong>
                            ${this.escape(
                                row.value
                            )}
                        </strong>

                    </div>

                `
            )
            .join("");

    },

    styles() {

        return `

            <style>

                .atlas-backup-card {
                    padding: 16px;
                    border:
                        1px solid
                        rgba(
                            145,
                            164,
                            202,
                            0.16
                        );
                    border-radius: 19px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.025
                        );
                }

                .atlas-backup-card h3 {
                    margin:
                        0
                        0
                        7px;
                    color: #f7f8fc;
                    font-size: 17px;
                }

                .atlas-backup-card p {
                    margin: 0;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .atlas-backup-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 14px;
                }

                .atlas-backup-button {
                    width: 100%;
                    min-height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    border-radius: 17px;
                    font-size: 15px;
                    font-weight: 800;
                }

                .atlas-backup-export {
                    color: #ffffff;
                    background:
                        linear-gradient(
                            135deg,
                            #4da3ff,
                            #2879ed
                        );
                }

                .atlas-backup-import {
                    color: #79baff;
                    background:
                        rgba(
                            77,
                            163,
                            255,
                            0.07
                        );
                    border:
                        1px solid
                        rgba(
                            77,
                            163,
                            255,
                            0.32
                        );
                }

                .atlas-backup-restore {
                    color: #ffffff;
                    background:
                        linear-gradient(
                            135deg,
                            #d9b45f,
                            #b98d35
                        );
                }

                .atlas-backup-file {
                    display: none;
                }

                .atlas-backup-last {
                    margin-top: 12px;
                    padding:
                        12px
                        13px;
                    border-radius: 15px;
                    color: #c8d0e3;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.035
                        );
                    font-size: 12px;
                    line-height: 1.45;
                }

                .atlas-backup-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .atlas-backup-preview-title {
                    margin: 0;
                    color: #f7f8fc;
                    font-size: 18px;
                }

                .atlas-backup-preview-text {
                    margin: 0;
                    color: #98a2bb;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .atlas-backup-error {
                    padding:
                        13px
                        14px;
                    border:
                        1px solid
                        rgba(
                            255,
                            95,
                            112,
                            0.22
                        );
                    border-radius: 16px;
                    color: #ff9aa5;
                    background:
                        rgba(
                            255,
                            95,
                            112,
                            0.07
                        );
                    font-size: 13px;
                    line-height: 1.5;
                }

            </style>

        `;

    },

    open(
        data,
        onComplete
    ) {

        this.data =
            data;

        this.onComplete =
            onComplete;

        this.selectedBackup =
            null;

        this.render();

    },

    render() {

        const lastBackupAt =
            AtlasStorage
                .lastBackupAt();

        AtlasSettings.renderSheet(`

            ${this.styles()}

            ${AtlasSettings.headerBlock(
                "Copias de seguridad",
                "Guarda tus datos para poder recuperarlos o trasladarlos a otro dispositivo."
            )}

            <div
                class="atlas-settings-form"
            >

                <div
                    class="atlas-backup-card"
                >

                    <h3>
                        Exportar copia
                    </h3>

                    <p>
                        Crea un archivo con tus cuentas,
                        movimientos, presupuestos,
                        recurrentes y configuraciones.
                    </p>

                    <div
                        class="atlas-backup-last"
                    >
                        Última copia:
                        <strong>
                            ${this.escape(
                                this.formatDate(
                                    lastBackupAt
                                )
                            )}
                        </strong>
                    </div>

                    <div
                        class="atlas-backup-actions"
                    >

                        <button
                            class="
                                atlas-backup-button
                                atlas-backup-export
                            "
                            type="button"
                            data-backup-action="export"
                        >
                            ↓ Exportar copia
                        </button>

                    </div>

                </div>

                <div
                    class="atlas-backup-card"
                >

                    <h3>
                        Restaurar copia
                    </h3>

                    <p>
                        Selecciona una copia creada por
                        Atlas. Antes de restaurarla podrás
                        revisar su fecha y contenido.
                    </p>

                    <div
                        class="atlas-backup-actions"
                    >

                        <button
                            class="
                                atlas-backup-button
                                atlas-backup-import
                            "
                            type="button"
                            data-backup-action="selectImport"
                        >
                            ↑ Seleccionar copia
                        </button>

                    </div>

                    <input
                        class="atlas-backup-file"
                        type="file"
                        accept=".json,application/json"
                        data-backup-file
                    >

                </div>

                <p
                    class="atlas-settings-warning"
                >
                    Tus datos continúan guardados
                    localmente en este navegador.
                    Conserva la copia en Archivos,
                    iCloud Drive u otro lugar seguro.
                </p>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cerrar
                </button>

            </div>

        `);

    },

    renderError(message) {

        AtlasSettings.renderSheet(`

            ${this.styles()}

            ${AtlasSettings.headerBlock(
                "Copia no válida",
                "No se ha modificado ningún dato.",
                "backup"
            )}

            <div
                class="atlas-settings-form"
            >

                <div
                    class="atlas-backup-error"
                >
                    ${this.escape(
                        message ||
                        "No se pudo leer la copia de seguridad."
                    )}
                </div>

                <button
                    class="atlas-settings-primary"
                    type="button"
                    data-settings-section="backup"
                >
                    Seleccionar otra copia
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-action="close"
                >
                    Cerrar
                </button>

            </div>

        `);

    },

    renderPreview(backup) {

        this.selectedBackup =
            backup;

        AtlasSettings.renderSheet(`

            ${this.styles()}

            ${AtlasSettings.headerBlock(
                "Revisar copia",
                "Comprueba los datos antes de restaurar.",
                "backup"
            )}

            <div
                class="
                    atlas-settings-form
                    atlas-backup-preview
                "
            >

                <div
                    class="atlas-backup-card"
                >

                    <h3
                        class="atlas-backup-preview-title"
                    >
                        Copia de Atlas
                    </h3>

                    <p
                        class="atlas-backup-preview-text"
                    >
                        Creada:
                        <strong>
                            ${this.escape(
                                this.formatDate(
                                    backup.createdAt
                                )
                            )}
                        </strong>
                    </p>

                    <p
                        class="atlas-backup-preview-text"
                    >
                        Versión de datos:
                        <strong>
                            ${this.escape(
                                this.formatDataVersion(
                                    backup.dataVersion
                                )
                            )}
                        </strong>
                    </p>

                </div>

                <div
                    class="atlas-settings-summary"
                >
                    ${this.summaryRows(
                        backup.summary
                    )}
                </div>

                <p
                    class="atlas-settings-warning"
                >
                    Al restaurar, los datos actuales
                    serán sustituidos. Atlas creará
                    primero una copia interna de
                    emergencia.
                </p>

                <button
                    class="
                        atlas-backup-button
                        atlas-backup-restore
                    "
                    type="button"
                    data-backup-action="restore"
                >
                    Restaurar esta copia
                </button>

                <button
                    class="atlas-settings-secondary"
                    type="button"
                    data-settings-section="backup"
                >
                    Cancelar
                </button>

            </div>

        `);

    },

    createDownloadLink(
        content,
        fileName
    ) {

        const blob =
            new Blob(
                [
                    content
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            fileName;

        link.style.display =
            "none";

        document.body.appendChild(
            link
        );

        link.click();

        window.setTimeout(
            () => {

                link.remove();

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    },

    async exportBackup() {

        const backup =
            AtlasStorage
                .createBackup(
                    this.data
                );

        const content =
            backup
                ? JSON.stringify(
                    backup,
                    null,
                    2
                )
                : null;

        if (
            !backup ||
            !content
        ) {

            AtlasUI.toast(
                "No se pudo crear la copia."
            );

            return;

        }

        const fileName =
            AtlasStorage
                .backupFileName(
                    new Date(
                        backup.createdAt
                    )
                );

        const blob =
            new Blob(
                [
                    content
                ],
                {
                    type:
                        "application/json"
                }
            );

        const file =
            typeof File !==
                "undefined"
                ? new File(
                    [
                        blob
                    ],
                    fileName,
                    {
                        type:
                            "application/json"
                    }
                )
                : null;

        let shared =
            false;

        try {

            if (
                file &&
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({
                    files:
                        [
                            file
                        ]
                })
            ) {

                await navigator.share({

                    files:
                        [
                            file
                        ],

                    title:
                        "Copia de seguridad de Atlas",

                    text:
                        "Guarda esta copia en Archivos o iCloud Drive."

                });

                shared =
                    true;

            }

        } catch (error) {

            if (
                error?.name !==
                "AbortError"
            ) {

                console.error(
                    "AtlasBackup.exportBackup.share:",
                    error
                );

            }

            if (
                error?.name ===
                "AbortError"
            ) {

                return;

            }

        }

        if (!shared) {

            this.createDownloadLink(
                content,
                fileName
            );

        }

        AtlasStorage
            .markBackupCreated(
                backup.createdAt
            );

        AtlasUI.toast(
            "Copia creada."
        );

        this.render();

    },

    selectImportFile() {

        const input =
            document.querySelector(
                "[data-backup-file]"
            );

        if (!input) {

            return;

        }

        input.value =
            "";

        input.click();

    },

    readImportFile(file) {

        if (!file) {

            return;

        }

        if (
            file.size >
            25 * 1024 * 1024
        ) {

            this.renderError(
                "El archivo es demasiado grande."
            );

            return;

        }

        const reader =
            new FileReader();

        reader.onload =
            () => {

                const result =
                    AtlasStorage
                        .parseBackup(
                            reader.result
                        );

                if (
                    !result.valid
                ) {

                    this.renderError(
                        result.error
                    );

                    return;

                }

                this.renderPreview(
                    result.backup
                );

            };

        reader.onerror =
            () => {

                this.renderError(
                    "No se pudo leer el archivo seleccionado."
                );

            };

        reader.readAsText(
            file
        );

    },

    restoreSelectedBackup() {

        if (
            !this.selectedBackup
        ) {

            AtlasUI.toast(
                "Selecciona una copia válida."
            );

            return;

        }

        const confirmed =
            window.confirm(
                "¿Restaurar esta copia? Los datos actuales serán sustituidos."
            );

        if (!confirmed) {

            return;

        }

        const result =
            AtlasStorage
                .importBackup(
                    this.selectedBackup
                );

        if (
            !result.success
        ) {

            this.renderError(
                result.error
            );

            return;

        }

        this.data =
            AtlasStorage.load();

        AtlasSettings.data =
            this.data;

        const callback =
            this.onComplete ||
            AtlasSettings.onComplete;

        AtlasSettings.close();

        if (
            typeof callback ===
            "function"
        ) {

            callback(
                this.data
            );

        } else if (
            typeof AtlasApp !==
                "undefined"
        ) {

            AtlasApp.data =
                this.data;

            AtlasApp.render();

        }

        AtlasUI.toast(
            "Copia restaurada correctamente."
        );

    },

    installSettingsSection() {

        if (
            typeof AtlasSettings ===
                "undefined"
        ) {

            return;
        }

        if (
            this.originalSettingsOpen ||
            this.originalSettingsRenderMenu
        ) {

            return;
        }

        this.originalSettingsOpen =
            AtlasSettings.open
                .bind(
                    AtlasSettings
                );

        AtlasSettings.open =
            (
                data,
                onComplete,
                section = "menu"
            ) => {

                if (
                    section ===
                    "backup"
                ) {

                    AtlasSettings.data =
                        data;

                    AtlasSettings.onComplete =
                        onComplete;

                    this.open(
                        data,
                        onComplete
                    );

                    return;

                }

                this.originalSettingsOpen(
                    data,
                    onComplete,
                    section
                );

            };

        this.originalSettingsRenderMenu =
            AtlasSettings.renderMenu
                .bind(
                    AtlasSettings
                );

        AtlasSettings.renderMenu =
            () => {

                this.originalSettingsRenderMenu();

                const menu =
                    document.querySelector(
                        ".atlas-settings-menu"
                    );

                if (!menu) {

                    return;

                }

                if (
                    menu.querySelector(
                        '[data-settings-section="backup"]'
                    )
                ) {

                    return;

                }

                menu.insertAdjacentHTML(
                    "beforeend",
                    AtlasSettings.optionButton(
                        "backup",
                        "🛡️",
                        "Copias de seguridad",
                        "Exporta tus datos o restaura una copia anterior."
                    )
                );

            };

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-backup-action]"
                    );

                if (!button) {

                    return;

                }

                const action =
                    button.dataset
                        .backupAction;

                if (
                    action ===
                    "export"
                ) {

                    this.exportBackup();

                    return;

                }

                if (
                    action ===
                    "selectImport"
                ) {

                    this.selectImportFile();

                    return;

                }

                if (
                    action ===
                    "restore"
                ) {

                    this.restoreSelectedBackup();

                }

            }
        );

        document.addEventListener(
            "change",
            event => {

                const input =
                    event.target.closest(
                        "[data-backup-file]"
                    );

                if (!input) {

                    return;

                }

                const file =
                    input.files?.[0];

                this.readImportFile(
                    file
                );

            }
        );

    },

    init() {

        this.installSettingsSection();

        this.bindEvents();

    }

};

AtlasBackup.init();

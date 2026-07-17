/* ==========================================================
   ATLAS
   storage.js
   Sprint 4.1 — Persistencia, migración y copias de seguridad
========================================================== */

const AtlasStorage = {

    key:
        "atlas-data-v1",

    backupMetadataKey:
        "atlas-backup-metadata-v1",

    emergencyBackupKey:
        "atlas-emergency-backup-v1",

    backupFormat:
        "atlas-backup",

    backupVersion:
        1,

    load() {

        try {

            const rawData =
                localStorage.getItem(
                    this.key
                );

            if (!rawData) {

                const initialData =
                    AtlasData.create();

                this.save(
                    initialData
                );

                return initialData;

            }

            const parsedData =
                JSON.parse(
                    rawData
                );

            const ensuredData =
                AtlasData.ensure(
                    parsedData
                );

            this.save(
                ensuredData
            );

            return ensuredData;

        } catch (error) {

            console.error(
                "AtlasStorage.load:",
                error
            );

            const fallbackData =
                AtlasData.create();

            this.save(
                fallbackData
            );

            return fallbackData;

        }

    },

    save(data) {

        try {

            const ensuredData =
                AtlasData.ensure(
                    data
                );

            ensuredData.updatedAt =
                new Date()
                    .toISOString();

            localStorage.setItem(
                this.key,
                JSON.stringify(
                    ensuredData
                )
            );

            return true;

        } catch (error) {

            console.error(
                "AtlasStorage.save:",
                error
            );

            return false;

        }

    },

    reset() {

        try {

            localStorage.removeItem(
                this.key
            );

            const initialData =
                AtlasData.create();

            this.save(
                initialData
            );

            return initialData;

        } catch (error) {

            console.error(
                "AtlasStorage.reset:",
                error
            );

            return AtlasData.create();

        }

    },

    countItems(data) {

        const ensuredData =
            AtlasData.ensure(
                data
            );

        return {

            accounts:
                Array.isArray(
                    ensuredData.accounts
                )
                    ? ensuredData.accounts.length
                    : 0,

            movements:
                Array.isArray(
                    ensuredData.movements
                )
                    ? ensuredData.movements.length
                    : 0,

            recurring:
                Array.isArray(
                    ensuredData.recurring
                )
                    ? ensuredData.recurring.length
                    : (
                        Array.isArray(
                            ensuredData.recurringRules
                        )
                            ? ensuredData.recurringRules.length
                            : 0
                    ),

            budgets:
                Array.isArray(
                    ensuredData.budgets
                )
                    ? ensuredData.budgets.length
                    : 0,

            goals:
                Array.isArray(
                    ensuredData.goals
                )
                    ? ensuredData.goals.length
                    : 0

        };

    },

    createBackup(data = null) {

        try {

            const ensuredData =
                AtlasData.ensure(
                    data || this.load()
                );

            const createdAt =
                new Date()
                    .toISOString();

            return {

                format:
                    this.backupFormat,

                backupVersion:
                    this.backupVersion,

                createdAt,

                dataVersion:
                    ensuredData.version ||
                    null,

                summary:
                    this.countItems(
                        ensuredData
                    ),

                data:
                    ensuredData

            };

        } catch (error) {

            console.error(
                "AtlasStorage.createBackup:",
                error
            );

            return null;

        }

    },

    exportBackup(data = null) {

        try {

            const backup =
                this.createBackup(
                    data
                );

            if (!backup) {

                return null;

            }

            return JSON.stringify(
                backup,
                null,
                2
            );

        } catch (error) {

            console.error(
                "AtlasStorage.exportBackup:",
                error
            );

            return null;

        }

    },

    backupFileName(date = new Date()) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        const hours =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );

        const minutes =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );

        return (
            `atlas-backup-${year}-${month}-${day}-${hours}${minutes}.json`
        );

    },

    markBackupCreated(
        createdAt = null
    ) {

        try {

            const value =
                createdAt ||
                new Date()
                    .toISOString();

            localStorage.setItem(
                this.backupMetadataKey,
                JSON.stringify({

                    lastBackupAt:
                        value

                })
            );

            return true;

        } catch (error) {

            console.error(
                "AtlasStorage.markBackupCreated:",
                error
            );

            return false;

        }

    },

    lastBackupAt() {

        try {

            const rawMetadata =
                localStorage.getItem(
                    this.backupMetadataKey
                );

            if (!rawMetadata) {

                return null;

            }

            const metadata =
                JSON.parse(
                    rawMetadata
                );

            return (
                typeof metadata
                    .lastBackupAt ===
                    "string"
                    ? metadata.lastBackupAt
                    : null
            );

        } catch (error) {

            console.error(
                "AtlasStorage.lastBackupAt:",
                error
            );

            return null;

        }

    },

    parseBackup(rawBackup) {

        try {

            const parsedBackup =
                typeof rawBackup ===
                    "string"
                    ? JSON.parse(
                        rawBackup
                    )
                    : rawBackup;

            if (
                !parsedBackup ||
                typeof parsedBackup !==
                    "object"
            ) {

                return {

                    valid:
                        false,

                    error:
                        "El archivo no contiene una copia válida de Atlas."

                };

            }

            if (
                parsedBackup.format !==
                this.backupFormat
            ) {

                return {

                    valid:
                        false,

                    error:
                        "El archivo seleccionado no pertenece a Atlas."

                };

            }

            if (
                Number(
                    parsedBackup.backupVersion
                ) >
                this.backupVersion
            ) {

                return {

                    valid:
                        false,

                    error:
                        "La copia pertenece a una versión más reciente de Atlas."

                };

            }

            if (
                !parsedBackup.data ||
                typeof parsedBackup.data !==
                    "object"
            ) {

                return {

                    valid:
                        false,

                    error:
                        "La copia no contiene datos restaurables."

                };

            }

            const ensuredData =
                AtlasData.ensure(
                    parsedBackup.data
                );

            return {

                valid:
                    true,

                backup: {

                    format:
                        this.backupFormat,

                    backupVersion:
                        Number(
                            parsedBackup.backupVersion
                        ) ||
                        1,

                    createdAt:
                        typeof parsedBackup.createdAt ===
                            "string"
                            ? parsedBackup.createdAt
                            : null,

                    dataVersion:
                        parsedBackup.dataVersion ||
                        ensuredData.version ||
                        null,

                    summary:
                        this.countItems(
                            ensuredData
                        ),

                    data:
                        ensuredData

                },

                error:
                    null

            };

        } catch (error) {

            console.error(
                "AtlasStorage.parseBackup:",
                error
            );

            return {

                valid:
                    false,

                error:
                    "No se pudo leer la copia de seguridad."

            };

        }

    },

    createEmergencyBackup() {

        try {

            const currentData =
                this.load();

            const emergencyBackup =
                this.createBackup(
                    currentData
                );

            if (!emergencyBackup) {

                return false;

            }

            localStorage.setItem(
                this.emergencyBackupKey,
                JSON.stringify(
                    emergencyBackup
                )
            );

            return true;

        } catch (error) {

            console.error(
                "AtlasStorage.createEmergencyBackup:",
                error
            );

            return false;

        }

    },

    emergencyBackup() {

        try {

            const rawBackup =
                localStorage.getItem(
                    this.emergencyBackupKey
                );

            if (!rawBackup) {

                return null;

            }

            const result =
                this.parseBackup(
                    rawBackup
                );

            return result.valid
                ? result.backup
                : null;

        } catch (error) {

            console.error(
                "AtlasStorage.emergencyBackup:",
                error
            );

            return null;

        }

    },

    importBackup(rawBackup) {

        try {

            const result =
                this.parseBackup(
                    rawBackup
                );

            if (!result.valid) {

                return {

                    success:
                        false,

                    data:
                        null,

                    backup:
                        null,

                    error:
                        result.error

                };

            }

            const emergencyBackupCreated =
                this.createEmergencyBackup();

            if (!emergencyBackupCreated) {

                return {

                    success:
                        false,

                    data:
                        null,

                    backup:
                        result.backup,

                    error:
                        "No se pudo crear la copia de seguridad previa a la restauración."

                };

            }

            const saved =
                this.save(
                    result.backup.data
                );

            if (!saved) {

                return {

                    success:
                        false,

                    data:
                        null,

                    backup:
                        result.backup,

                    error:
                        "No se pudieron guardar los datos restaurados."

                };

            }

            return {

                success:
                    true,

                data:
                    result.backup.data,

                backup:
                    result.backup,

                error:
                    null

            };

        } catch (error) {

            console.error(
                "AtlasStorage.importBackup:",
                error
            );

            return {

                success:
                    false,

                data:
                    null,

                backup:
                    null,

                error:
                    "No se pudo restaurar la copia de seguridad."

            };

        }

    },

    exportData() {

        try {

            const data =
                this.load();

            return JSON.stringify(
                data,
                null,
                2
            );

        } catch (error) {

            console.error(
                "AtlasStorage.exportData:",
                error
            );

            return null;

        }

    },

    importData(rawData) {

        try {

            const parsedData =
                typeof rawData ===
                    "string"
                    ? JSON.parse(
                        rawData
                    )
                    : rawData;

            const ensuredData =
                AtlasData.ensure(
                    parsedData
                );

            const emergencyBackupCreated =
                this.createEmergencyBackup();

            if (!emergencyBackupCreated) {

                return null;

            }

            const saved =
                this.save(
                    ensuredData
                );

            if (!saved) {

                return null;

            }

            return ensuredData;

        } catch (error) {

            console.error(
                "AtlasStorage.importData:",
                error
            );

            return null;

        }

    }

};

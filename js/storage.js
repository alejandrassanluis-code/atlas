/* ==========================================================
   ATLAS
   storage.js
   Sprint 4.0 — Persistencia y migración automática
========================================================== */

const AtlasStorage = {

    key:
        "atlas-data-v1",

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

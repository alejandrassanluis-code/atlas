/* ==========================================================
   ATLAS
   storage.js
   Gestión del almacenamiento local
========================================================== */

const AtlasStorage = {

    KEY: "atlas-data-v1",

    load() {

        try {

            const data = localStorage.getItem(this.KEY);

            if (!data) {

                return structuredClone(AtlasData);

            }

            const parsed = JSON.parse(data);

            return {

                ...structuredClone(AtlasData),

                ...parsed

            };

        } catch (error) {

            console.error("Error cargando datos:", error);

            return structuredClone(AtlasData);

        }

    },

    save(data) {

        try {

            localStorage.setItem(
                this.KEY,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error("Error guardando datos:", error);

            return false;

        }

    },

    reset() {

        localStorage.removeItem(this.KEY);

        return structuredClone(AtlasData);

    }

};

/* ==========================================================
   ATLAS
   service-worker.js
   Atlas v1.1 — Caché resistente y funcionamiento sin conexión
========================================================== */

const ATLAS_CACHE =
    "atlas-cache-v2";

const ATLAS_FILES = [

    "./",

    "./index.html",

    "./manifest.json",

    "./css/variables.css",

    "./css/layout.css",

    "./css/components.css",

    "./css/pages.css",

    "./js/catalog.js",

    "./js/data.js",

    "./js/storage.js",

    "./js/calculations.js",

    "./js/recurring.js",

    "./js/ui.js",

    "./js/overview.js",

    "./js/budgets.js",

    "./js/analysis.js",

    "./js/movement-filters.js",

    "./js/setup.js",

    "./js/movements.js",

    "./js/settings.js",

    "./js/backup.js",

    "./js/pwa.js",

    "./js/app.js",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];

async function cacheAtlasFiles() {

    const cache =
        await caches.open(
            ATLAS_CACHE
        );

    await Promise.all(

        ATLAS_FILES.map(
            async file => {

                try {

                    const response =
                        await fetch(
                            file,
                            {
                                cache:
                                    "reload"
                            }
                        );

                    if (
                        !response ||
                        !response.ok
                    ) {

                        console.warn(
                            "AtlasSW: archivo no disponible:",
                            file
                        );

                        return;

                    }

                    await cache.put(
                        file,
                        response
                    );

                } catch (error) {

                    console.warn(
                        "AtlasSW: no se pudo guardar:",
                        file,
                        error
                    );

                }

            }
        )

    );

}

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            cacheAtlasFiles()
                .then(
                    () =>
                        self.skipWaiting()
                )

        );

    }
);

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames =>
                        Promise.all(

                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        ATLAS_CACHE
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )

                        )
                )
                .then(
                    () =>
                        self.clients.claim()
                )

        );

    }
);

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }

        const requestUrl =
            new URL(
                event.request.url
            );

        if (
            requestUrl.origin !==
            self.location.origin
        ) {

            return;

        }

        if (
            event.request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    event.request
                )
                    .then(
                        async response => {

                            if (
                                response &&
                                response.ok
                            ) {

                                const cache =
                                    await caches.open(
                                        ATLAS_CACHE
                                    );

                                await cache.put(
                                    "./index.html",
                                    response.clone()
                                );

                            }

                            return response;

                        }
                    )
                    .catch(
                        async () => {

                            return (
                                await caches.match(
                                    "./index.html"
                                ) ||
                                await caches.match(
                                    "./"
                                )
                            );

                        }
                    )

            );

            return;

        }

        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    cachedResponse => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }

                        return fetch(
                            event.request
                        )
                            .then(
                                async response => {

                                    if (
                                        response &&
                                        response.ok &&
                                        response.type ===
                                            "basic"
                                    ) {

                                        const cache =
                                            await caches.open(
                                                ATLAS_CACHE
                                            );

                                        await cache.put(
                                            event.request,
                                            response.clone()
                                        );

                                    }

                                    return response;

                                }
                            );

                    }
                )

        );

    }
);

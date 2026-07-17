/* ==========================================================
   ATLAS
   service-worker.js
   Atlas v1.0 — Caché y funcionamiento sin conexión
========================================================== */

const ATLAS_CACHE =
    "atlas-cache-v1";

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

    "./js/app.js",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    ATLAS_CACHE
                )
                .then(
                    cache =>
                        cache.addAll(
                            ATLAS_FILES
                        )
                )
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
                        response => {

                            const copy =
                                response.clone();

                            caches
                                .open(
                                    ATLAS_CACHE
                                )
                                .then(
                                    cache =>
                                        cache.put(
                                            "./index.html",
                                            copy
                                        )
                                );

                            return response;

                        }
                    )
                    .catch(
                        () =>
                            caches.match(
                                "./index.html"
                            )
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

                        const networkResponse =
                            fetch(
                                event.request
                            )
                                .then(
                                    response => {

                                        if (
                                            !response ||
                                            response.status !==
                                                200 ||
                                            response.type !==
                                                "basic"
                                        ) {

                                            return response;

                                        }

                                        const copy =
                                            response.clone();

                                        caches
                                            .open(
                                                ATLAS_CACHE
                                            )
                                            .then(
                                                cache =>
                                                    cache.put(
                                                        event.request,
                                                        copy
                                                    )
                                            );

                                        return response;

                                    }
                                )
                                .catch(
                                    () =>
                                        cachedResponse
                                );

                        return (
                            cachedResponse ||
                            networkResponse
                        );

                    }
                )

        );

    }
);

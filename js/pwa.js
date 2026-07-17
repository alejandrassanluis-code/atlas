/* ==========================================================
   ATLAS
   pwa.js
   Atlas v1.0 — Registro del service worker
========================================================== */

const AtlasPWA = {

    register() {

        if (
            !(
                "serviceWorker" in
                navigator
            )
        ) {

            console.warn(
                "AtlasPWA: este navegador no admite service workers."
            );

            return;

        }

        window.addEventListener(
            "load",
            () => {

                navigator
                    .serviceWorker
                    .register(
                        "./service-worker.js",
                        {
                            scope:
                                "./"
                        }
                    )
                    .then(
                        registration => {

                            console.log(
                                "AtlasPWA: service worker registrado.",
                                registration.scope
                            );

                        }
                    )
                    .catch(
                        error => {

                            console.error(
                                "AtlasPWA.register:",
                                error
                            );

                        }
                    );

            }
        );

    }

};

AtlasPWA.register();

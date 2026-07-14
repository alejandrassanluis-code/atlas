const app = document.getElementById("app");

function renderHome() {

    app.innerHTML = `

        <section class="section">

            <h1 class="page-title">Atlas</h1>

            <p class="page-subtitle">
                Tu patrimonio bajo control.
            </p>

        </section>

        <section class="card">

            <h2>Patrimonio</h2>

            <div class="big-number">
                0 €
            </div>

            <p class="caption">
                Configura tus cuentas para comenzar.
            </p>

        </section>

    `;

}

renderHome();

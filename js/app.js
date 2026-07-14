const app = document.getElementById("app");

function renderHome() {

    app.innerHTML = `

    <header class="hero">

        <div class="hero-top">

            <span class="logo">ATLAS</span>

            <span class="date">${new Date().toLocaleDateString("es-ES",{
                day:"numeric",
                month:"long"
            })}</span>

        </div>

        <h1>Tu patrimonio</h1>

        <div class="hero-value">0 €</div>

        <p class="hero-subtitle">
            Empieza configurando tus cuentas para conocer tu situación financiera.
        </p>

    </header>

    <section class="summary">

        <div class="summary-card">

            <span>Liquidez</span>

            <strong>0 €</strong>

        </div>

        <div class="summary-card">

            <span>Inversiones</span>

            <strong>0 €</strong>

        </div>

        <div class="summary-card">

            <span>Deudas</span>

            <strong>0 €</strong>

        </div>

        <div class="summary-card">

            <span>Ahorro mensual</span>

            <strong>0 €</strong>

        </div>

    </section>

    <section class="welcome">

        <h2>Bienvenido a Atlas</h2>

        <p>
            En los siguientes pasos configuraremos tus cuentas, inversiones,
            préstamos y tarjetas para crear una fotografía completa de tu patrimonio.
        </p>

    </section>

    `;

}

renderHome();

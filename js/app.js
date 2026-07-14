/* ==========================================================
   ATLAS
   app.js
   Sprint 1
========================================================== */

const AtlasApp = {

    data: null,

    route: "home",

    init() {

        this.data = AtlasStorage.load();

        this.bindEvents();

        this.render();

    },

    bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const routeButton =
                    event.target.closest(
                        "[data-route]"
                    );

                if (routeButton) {

                    event.preventDefault();

                    this.navigate(
                        routeButton.dataset.route
                    );

                    return;

                }

                const action =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!action) {

                    return;

                }

                switch (
                    action.dataset.action
                ) {

                    case "newMovement":

                        AtlasUI.toast(
                            "Los movimientos llegarán en el Sprint 2."
                        );

                        break;

                    case "editAccounts":

                        AtlasUI.toast(
                            "La edición de saldos llegará en el siguiente paso del Sprint 1."
                        );

                        break;

                }

            }
        );

    },

    navigate(route) {

        this.route = route;

        this.render();

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    },

    render() {

        AtlasUI.render(

            this.route,

            this.data

        );

    },

    save() {

        AtlasStorage.save(

            this.data

        );

    },

    reset() {

        this.data =

            AtlasStorage.reset();

        this.route = "home";

        this.render();

    },
       updateAccountBalance(accountId, value) {

        const account = this.data.accounts.find(
            account => account.id === accountId
        );

        if (!account) {

            return false;

        }

        account.balance = Number(value) || 0;

        this.save();

        this.render();

        return true;

    },

    updateInvestment(accountId, invested, currentValue) {

        const account = this.data.accounts.find(
            account => account.id === accountId
        );

        if (!account) {

            return false;

        }

        account.invested = Number(invested) || 0;

        account.balance = Number(currentValue) || 0;

        this.save();

        this.render();

        return true;

    },

    updateSavingGoal(percent) {

        this.data.settings.monthlySavingGoal =
            Number(percent) || 0;

        this.save();

        this.render();

    }

};

document.addEventListener(

    "DOMContentLoaded",

    () => {

        AtlasApp.init();

    }

);

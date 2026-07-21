/* ==========================================================
   ATLAS
   goals-progress.js
   Progreso automático de objetivos
========================================================== */

const AtlasGoalsProgress = {

    initialized:
        false,

    originalNormalizeGoal:
        null,

    originalOpenForm:
        null,

    originalSaveForm:
        null,

    originalGoalCard:
        null,

    originalProgress:
        null,

    originalRemaining:
        null,

    originalSummary:
        null,

    number(value) {

        const result =
            Number(
                String(
                    value ?? ""
                )
                    .trim()
                    .replace(
                        ",",
                        "."
                    )
            );

        return Number.isFinite(
            result

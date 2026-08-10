// ============================================================
// CropHealth - Hybrid Detection
// Online  -> Gemini AI
// Offline -> Existing Teachable Machine Model
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const GEMINI_SERVER_URL = "https://crophealth-ej8o.onrender.com";


// ============================================================
// CHECK WHETHER GEMINI SERVER IS AVAILABLE
// ============================================================

async function isGeminiAvailable() {

    if (!navigator.onLine) {
        return false;
    }

    try {

        const response = await fetch(
            `${GEMINI_SERVER_URL}/api/health`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        return response.ok;

    } catch (error) {

        console.warn(
            "Gemini server unavailable:",
            error
        );

        return false;
    }
}


// ============================================================
// MAIN HYBRID ANALYSIS
// ============================================================

async function analyzeCropHybrid(
    imageElement,
    imageData,
    question = ""
) {

    console.log(
        "🌱 CropHealth hybrid analysis started"
    );


    // --------------------------------------------------------
    // TRY GEMINI FIRST
    // --------------------------------------------------------

    const geminiAvailable =
        await isGeminiAvailable();


    if (geminiAvailable) {

        console.log(
            "🌐 Online mode → Gemini"
        );

        try {

            const result =
                await analyzeWithGemini(
                    imageData,
                    question
                );

            return result;

        } catch (error) {

            console.warn(
                "⚠️ Gemini failed. Falling back to offline model.",
                error
            );

        }
    }


    // --------------------------------------------------------
    // OFFLINE FALLBACK
    // --------------------------------------------------------

    console.log(
        "📴 Offline mode → Local model"
    );


    return await analyzeWithLocalModel(
        imageElement
    );
}


// ============================================================
// GEMINI ANALYSIS
// ============================================================

async function analyzeWithGemini(
    imageData,
    question = ""
) {

    const response = await fetch(
        `${GEMINI_SERVER_URL}/api/analyze`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                image: imageData,

                question: question

            })
        }
    );


    if (!response.ok) {

        throw new Error(
            `Gemini server returned ${response.status}`
        );

    }


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.error ||
            "Gemini analysis failed"
        );

    }


    return {

        success: true,

        mode: "online",

        analysis: result.analysis,

        model:
            result.model ||
            "Gemini"

    };
}


// ============================================================
// LOCAL MODEL
// ============================================================
//
// IMPORTANT:
// We are NOT loading model.json here.
//
// Your existing script.js already loads the model:
//
//     loadCropModel()
//
// and already performs:
//
//     model.predict()
//
// This function reuses that existing model.
// ============================================================

async function analyzeWithLocalModel(
    imageElement
) {

    if (
        typeof loadCropModel !==
        "function"
    ) {

        throw new Error(
            "Existing CropHealth model loader was not found."
        );

    }


    const model =
        await loadCropModel();


    if (!model) {

        throw new Error(
            "Offline CropHealth model failed to load."
        );

    }


    const predictions =
        await model.predict(
            imageElement
        );


    predictions.sort(
        (a, b) =>
            b.probability -
            a.probability
    );


    const top =
        predictions[0];


    return {

        success: true,

        mode: "offline",

        prediction: top.className,

        confidence:
            Math.round(
                top.probability * 100
            ),

        predictions: predictions,

        model:
            "CropHealth Local Model"

    };
}


// ============================================================
// DISPLAY MODE
// ============================================================

function getDetectionModeLabel(
    mode
) {

    if (mode === "online") {

        return "🌐 Online ";

    }

    return "📴 Offline ";
}
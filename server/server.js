````js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

// =====================================================
// ENVIRONMENT CONFIGURATION
// =====================================================

dotenv.config({
    path: "./server/.env"
});

// =====================================================
// SERVER CONFIGURATION
// =====================================================

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

// =====================================================
// GEMINI API KEY CHECK
// =====================================================

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing.");
    process.exit(1);
}

// =====================================================
// GEMINI INITIALIZATION
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "CropHealth Gemini Backend"
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        gemini: "configured",
        model: "gemini-3.6-flash"
    });
});

// =====================================================
// CLEAN GEMINI RESPONSE
// =====================================================

function cleanGeminiResponse(text) {

    if (!text) {
        return "";
    }

    let cleaned = text;

    // Remove Markdown headings
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");

    // Remove bold formatting: **text**
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");

    // Remove italic formatting: *text*
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");

    // Remove underscore bold/italic formatting
    cleaned = cleaned.replace(/__(.*?)__/g, "$1");
    cleaned = cleaned.replace(/_(.*?)_/g, "$1");

    // Remove bullet points
    cleaned = cleaned.replace(/^\s*[-•*]\s+/gm, "");

    // Remove numbered lists such as "1. Text"
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, "");

    // Remove code blocks
    cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, "");
    cleaned = cleaned.replace(/```/g, "");

    // Remove unnecessary leading/trailing spaces
    cleaned = cleaned
        .split("\n")
        .map(line => line.trim())
        .join("\n");

    // Remove excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
}

// =====================================================
// GEMINI CROP IMAGE ANALYSIS
// =====================================================

app.post("/api/analyze", async (req, res) => {

    try {

        // -------------------------------------------------
        // GET DATA FROM FRONTEND
        // -------------------------------------------------

        const {
            image,
            question
        } = req.body;

        // -------------------------------------------------
        // CHECK IMAGE
        // -------------------------------------------------

        if (!image) {

            return res.status(400).json({
                success: false,
                error: "Image is required."
            });

        }

        // -------------------------------------------------
        // EXTRACT IMAGE DATA
        // -------------------------------------------------

        let mimeType = "image/jpeg";
        let base64Image = image;

        const dataUrlMatch = image.match(
            /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/
        );

        if (dataUrlMatch) {

            mimeType = dataUrlMatch[1];
            base64Image = dataUrlMatch[2];

        }

        // -------------------------------------------------
        // CROPHEALTH PROMPT
        // -------------------------------------------------

        const prompt = `

You are CropHealth AI, an agricultural crop-health
assistant.

Analyze the provided plant or crop image carefully.

Your purpose is to provide a clear, practical and honest
assessment that a farmer can easily understand.

IMPORTANT ACCURACY RULES:

Only make conclusions that are reasonably supported
by the image.

Do not invent symptoms, diseases, causes or treatments.

If the image quality is poor, say that the assessment
is uncertain.

If the crop cannot be identified confidently, say:
Crop identification is uncertain.

If the disease cannot be identified confidently,
do not present it as a confirmed diagnosis.

This is an AI-assisted assessment and NOT a laboratory
confirmed diagnosis.

${question
                ? `Farmer's Question:
${question}`
                : ""
            }

RETURN FORMAT:

Return EXACTLY these sections in this exact order:

Crop Name:
Plant Part:
Health Status:
Possible Disease or Condition:
Confidence:
Visible Symptoms:
Severity:
Possible Causes:
Recommended Actions:
Prevention:

STRICT FORMATTING RULES:

Do NOT use Markdown.

Do NOT use asterisks.

Do NOT use **bold**.

Do NOT use hashtags.

Do NOT use bullet points.

Do NOT use numbered lists.

Do NOT use emojis.

Do NOT use tables.

Do NOT use quotation marks around section names.

Do NOT add extra sections.

Do NOT repeat information.

Keep each section separate.

Use simple language suitable for farmers.

Recommended Actions should contain short separate
sentences, one per line.

Prevention should contain short separate sentences,
one per line.

If something cannot be determined from the image,
write "Uncertain" or "Not clearly visible".

Confidence must be expressed as a percentage.

Severity must be one of:
Low
Moderate
High
or Uncertain.

IMPORTANT:

Do not give dangerous or highly specific chemical
instructions without appropriate context.

Do not claim that an AI prediction is a confirmed
diagnosis.

EXAMPLE:

Crop Name:
Tomato

Plant Part:
Leaf

Health Status:
Shows signs of possible disease.

Possible Disease or Condition:
Early Blight

Confidence:
92%

Visible Symptoms:
Brown circular spots and yellowing around affected areas.

Severity:
Moderate

Possible Causes:
The symptoms may be associated with a fungal infection
and prolonged moisture.

Recommended Actions:
Remove severely affected leaves.
Avoid overhead watering.
Improve air circulation around the plants.
Monitor nearby plants for similar symptoms.

Prevention:
Maintain proper spacing between plants.
Avoid excessive moisture on leaves.
Remove infected plant material.
`;


        // -------------------------------------------------
        // SEND IMAGE + PROMPT TO GEMINI
        // -------------------------------------------------

        const response = await ai.models.generateContent({

            model: "gemini-3.6-flash",

            contents: [

                {
                    role: "user",

                    parts: [

                        {
                            text: prompt
                        },

                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        }

                    ]

                }

            ]

        });

        // -------------------------------------------------
        // GET GEMINI RESPONSE
        // -------------------------------------------------

        const rawAnalysis = response.text || "";

        const analysis =
            cleanGeminiResponse(rawAnalysis);

        // -------------------------------------------------
        // SEND RESULT TO FRONTEND
        // -------------------------------------------------

        res.json({

            success: true,

            analysis: analysis,

            mode: "online",

            model: "gemini-3.6-flash"

        });

    }

    catch (error) {

        // -------------------------------------------------
        // LOG REAL ERROR
        // -------------------------------------------------

        console.error(
            "❌ Gemini error:",
            error
        );

        // -------------------------------------------------
        // SEND ERROR
        // -------------------------------------------------

        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Gemini analysis failed."

        });

    }

});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🌱 CropHealth Gemini server running at http://localhost:${PORT}`
    );

});
````

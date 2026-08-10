/* ==========================================================
   CROPHEALTH - MAIN SCRIPT
   Works across all pages (index.html, pages/*.html)
   ========================================================== */

/* ----------------------------------------------------------
   0. FIGURE OUT WHERE THE MODEL FILES ARE
   (index.html is at the root, but disease.html/camera.html
   are inside /pages/, so the relative path to /model/ differs)
---------------------------------------------------------- */
const inPagesFolder = window.location.pathname.includes("/pages/");
const MODEL_BASE = inPagesFolder ? "../model/" : "model/";
let cropModel = null;
let modelLoading = null;

function loadCropModel() {
    if (cropModel) return Promise.resolve(cropModel);
    if (modelLoading) return modelLoading;

    const modelURL = MODEL_BASE + "model.json";
    const metadataURL = MODEL_BASE + "metadata.json";

    modelLoading = tmImage.load(modelURL, metadataURL).then((m) => {
        cropModel = m;
        console.log("Crop model loaded successfully.");
        return m;
    }).catch((err) => {
        console.error("Failed to load model:", err);
    });

    return modelLoading;
}

if (typeof tmImage !== "undefined") {
    loadCropModel();
}

/* ----------------------------------------------------------
   1. DISEASE INFORMATION DATABASE
---------------------------------------------------------- */
const DISEASE_INFO = {
    Tomato_healthy: {
        name: "Tomato - Healthy",
        cropFamily: "Tomato",
        cause: "No disease detected.",
        precautions: "Continue regular watering, balanced fertilization, and routine monitoring.",
        remedy: "No treatment needed. Keep monitoring weekly."
    },
    Tomato_Early_blight: {
        name: "Tomato - Early Blight",
        cropFamily: "Tomato",
        cause: "Fungal spores (Alternaria solani) spreading in warm, humid weather, often via wet foliage.",
        precautions: "Space plants for airflow, water at the base only, rotate crops each season.",
        remedy: "Remove and destroy infected lower leaves. Apply a copper-based fungicide every 7-10 days."
    },
    Tomato_Late_blight: {
        name: "Tomato - Late Blight",
        cropFamily: "Tomato",
        cause: "Water-mould pathogen (Phytophthora infestans) that spreads rapidly in cool, wet conditions.",
        precautions: "Avoid overhead watering, ensure good drainage, remove volunteer potato/tomato plants nearby.",
        remedy: "Destroy infected plants immediately to stop spread. Apply preventive fungicide in humid weather."
    },
    Tomato_Septoria_leaf_spot: {
        name: "Tomato - Septoria Leaf Spot",
        cropFamily: "Tomato",
        cause: "Fungal infection (Septoria lycopersici) that thrives in wet, humid conditions and spreads via splashing water.",
        precautions: "Mulch around the base to reduce soil splash, avoid working with plants when leaves are wet.",
        remedy: "Remove affected leaves, apply fungicide, and improve air circulation between plants."
    },
    Potato_healthy: {
        name: "Potato - Healthy",
        cropFamily: "Potato",
        cause: "No disease detected.",
        precautions: "Maintain regular monitoring and proper irrigation.",
        remedy: "No treatment needed."
    },
    Potato_Late_blight: {
        name: "Potato - Late Blight",
        cropFamily: "Potato",
        cause: "Water-mould pathogen (Phytophthora infestans), same as tomato late blight, spreads fast in cool wet weather.",
        precautions: "Improve field drainage, avoid dense planting, rotate crops next season.",
        remedy: "Remove infected foliage promptly. Apply a mancozeb-based fungicide."
    },
    Corn_healthy: {
        name: "Corn (Maize) - Healthy",
        cropFamily: "Corn",
        cause: "No disease detected.",
        precautions: "Continue standard care and monitoring.",
        remedy: "No treatment needed."
    },
    Corn_Common_rust: {
        name: "Corn (Maize) - Common Rust",
        cropFamily: "Corn",
        cause: "Fungal spores (Puccinia sorghi) carried by wind, favoured by moderate temperatures and moisture.",
        precautions: "Plant rust-resistant varieties where available, avoid excess nitrogen fertilizer.",
        remedy: "Apply a foliar fungicide if severity is high; usually manageable with resistant hybrids."
    },
    Corn_Northern_Leaf_Blight: {
        name: "Corn (Maize) - Northern Leaf Blight",
        cropFamily: "Corn",
        cause: "Fungal pathogen (Exserohilum turcicum) favoured by humid weather and crop residue left in fields.",
        precautions: "Rotate crops, till under old crop residue, choose resistant hybrids.",
        remedy: "Apply fungicide at early signs; remove heavily infected leaves where practical."
    },
    Grape_healthy: {
        name: "Grape - Healthy",
        cropFamily: "Grape",
        cause: "No disease detected.",
        precautions: "Maintain regular pruning and monitoring.",
        remedy: "No treatment needed."
    },
    Grape_Black_rot: {
        name: "Grape - Black Rot",
        cropFamily: "Grape",
        cause: "Fungal infection (Guignardia bidwellii) that spreads in warm, wet conditions, overwinters in old fruit/leaves.",
        precautions: "Remove mummified fruit and fallen leaves each season, prune for airflow.",
        remedy: "Apply fungicide starting early in the season; remove infected fruit clusters."
    },
    Grape_Esca: {
        name: "Grape - Esca (Black Measles)",
        cropFamily: "Grape",
        cause: "A complex of fungal pathogens that infect through pruning wounds, worsened by vine stress and age.",
        precautions: "Prune during dry weather, disinfect pruning tools, avoid unnecessary vine stress.",
        remedy: "No full cure - remove and destroy severely affected vines to limit spread; manage stress factors."
    },
    Apple_healthy: {
        name: "Apple - Healthy",
        cropFamily: "Apple",
        cause: "No disease detected.",
        precautions: "Continue standard care and seasonal monitoring.",
        remedy: "No treatment needed."
    },
    Apple_scab: {
        name: "Apple - Apple Scab",
        cropFamily: "Apple",
        cause: "Fungal infection (Venturia inaequalis) that spreads in cool, wet spring weather via wind and rain.",
        precautions: "Rake and destroy fallen leaves each autumn to reduce overwintering spores.",
        remedy: "Apply fungicide sprays from bud break through early summer."
    },
    Pepper_healthy: {
        name: "Bell Pepper - Healthy",
        cropFamily: "Pepper",
        cause: "No disease detected.",
        precautions: "Continue regular monitoring and balanced watering.",
        remedy: "No treatment needed."
    },
    Pepper_Bacterial_spot: {
        name: "Bell Pepper - Bacterial Spot",
        cropFamily: "Pepper",
        cause: "Bacterial infection (Xanthomonas species), spreads through splashing water and contaminated seed/tools.",
        precautions: "Use disease-free seed, avoid overhead irrigation, disinfect tools between plants.",
        remedy: "Apply copper-based bactericide; remove severely infected plants to reduce spread."
    },
    Strawberry_healthy: {
        name: "Strawberry - Healthy",
        cropFamily: "Strawberry",
        cause: "No disease detected.",
        precautions: "Maintain regular watering and mulching.",
        remedy: "No treatment needed."
    },
    Strawberry_Leaf_scorch: {
        name: "Strawberry - Leaf Scorch",
        cropFamily: "Strawberry",
        cause: "Fungal infection (Diplocarpon earlianum) favoured by wet foliage and dense planting.",
        precautions: "Improve air circulation, avoid overhead watering, remove old infected leaves after harvest.",
        remedy: "Apply fungicide during the growing season; remove and destroy infected leaves."
    },
    Cherry_healthy: {
        name: "Cherry - Healthy",
        cropFamily: "Cherry",
        cause: "No disease detected.",
        precautions: "Continue standard orchard care.",
        remedy: "No treatment needed."
    },
    Cherry_Powdery_mildew: {
        name: "Cherry - Powdery Mildew",
        cropFamily: "Cherry",
        cause: "Fungal infection that thrives in warm, dry days with cool, humid nights; spreads via airborne spores.",
        precautions: "Prune for good air circulation, avoid excess nitrogen fertilizer.",
        remedy: "Apply sulfur-based or other approved fungicide at first sign of white powdery patches."
    },
    Peach_healthy: {
        name: "Peach - Healthy",
        cropFamily: "Peach",
        cause: "No disease detected.",
        precautions: "Continue standard orchard care and monitoring.",
        remedy: "No treatment needed."
    },
    Peach_Bacterial_spot: {
        name: "Peach - Bacterial Spot",
        cropFamily: "Peach",
        cause: "Bacterial infection (Xanthomonas arboricola), spreads via rain splash and wind, worsened by wet weather.",
        precautions: "Plant resistant varieties, avoid overhead irrigation, prune for airflow.",
        remedy: "Apply copper-based bactericide during dormant season; remove severely infected twigs."
    },
    Soybean_healthy: {
        name: "Soybean - Healthy",
        cropFamily: "Soybean",
        cause: "No disease detected.",
        precautions: "Continue regular field monitoring.",
        remedy: "No treatment needed."
    },
    Squash_Powdery_mildew: {
        name: "Squash - Powdery Mildew",
        cropFamily: "Squash",
        cause: "Fungal infection that thrives in warm, dry conditions with high humidity; spreads via airborne spores.",
        precautions: "Space plants well for airflow, avoid excess nitrogen, water at the base.",
        remedy: "Apply sulfur or potassium bicarbonate fungicide spray at first sign of white patches."
    }
};

const ALT_CROPS = {
    Tomato: [
        { name: "Okra (Bhindi)", reason: "Less prone to blight, similar growing season." },
        { name: "Beans", reason: "Improves soil nitrogen, short growth cycle." }
    ],
    Potato: [
        { name: "Maize (Corn)", reason: "Not affected by potato blight fungus, good rotation crop." },
        { name: "Onion", reason: "Different disease profile, breaks the blight cycle in soil." }
    ],
    Corn: [
        { name: "Soybean", reason: "Breaks fungal disease cycle, fixes soil nitrogen." },
        { name: "Sunflower", reason: "Different pest/disease profile, cash crop value." }
    ],
    Grape: [
        { name: "Guava", reason: "Hardier against common vineyard fungal diseases." }
    ],
    Apple: [
        { name: "Pear", reason: "Similar climate needs, lower scab susceptibility in some varieties." }
    ],
    Pepper: [
        { name: "Onion", reason: "Not susceptible to bacterial spot, good companion rotation." }
    ],
    Strawberry: [
        { name: "Marigold", reason: "Breaks disease cycle, also helps repel some pests." }
    ],
    Cherry: [
        { name: "Plum", reason: "Related stone fruit with different mildew susceptibility." }
    ],
    Peach: [
        { name: "Fig", reason: "Lower susceptibility to bacterial spot." }
    ],
    Soybean: [
        { name: "Maize (Corn)", reason: "Common rotation partner, breaks pest/disease cycles." }
    ],
    Squash: [
        { name: "Beans", reason: "Different disease profile, improves soil nitrogen." }
    ]
};
/* ----------------------------------------------------------
   2. IMAGE PREVIEW (disease.html)
---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const cropImageInput = document.getElementById("cropImage");
    if (cropImageInput) {
        cropImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const preview = document.getElementById("previewImage");
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        });
    }
});


/*ESCAPE HTML*/
function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text || "";

    return div.innerHTML;
}

/* ----------------------------------------------------------
   3. DETECT DISEASE (disease.html)
---------------------------------------------------------- */

function imageToDataURL(imgEl, maxWidth = 300) {

    const canvas = document.createElement("canvas");

    const scale = Math.min(
        1,
        maxWidth / imgEl.naturalWidth
    );

    canvas.width = imgEl.naturalWidth * scale;
    canvas.height = imgEl.naturalHeight * scale;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        imgEl,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return canvas.toDataURL(
        "image/jpeg",
        0.7
    );
}


async function detectDisease() {

    const preview =
        document.getElementById("previewImage");

    const resultBox =
        document.getElementById("result");


    if (
        !preview ||
        !preview.src ||
        preview.style.display === "none"
    ) {

        resultBox.innerHTML =
            "<p>Please choose a leaf photo first.</p>";

        return;
    }


    resultBox.innerHTML =
        "<p>🌱 Analyzing leaf...</p>";


    try {

        // Make sure image has finished loading
        if (!preview.complete) {

            await new Promise((resolve) => {

                preview.onload = resolve;

            });

        }


        // Convert image to Base64
        const imageData =
            imageToDataURL(preview);


        console.log(
            "📷 Image converted successfully."
        );


        // Run HYBRID detection
        const result =
            await analyzeCropHybrid(
                preview,
                imageData
            );


        console.log(
            "🌱 Hybrid result:",
            result
        );


        // --------------------------------------------------
        // ONLINE RESULT — GEMINI
        // --------------------------------------------------

        if (result.mode === "online") {

            resultBox.innerHTML = `

                <div style="
                    background:#e8f5e9;
                    border-left:4px solid #2e7d32;
                    padding:12px;
                    border-radius:8px;
                    margin-bottom:15px;
                ">

                    <strong>
                    🌐 Online
                    </strong>

                </div>

                <div style="
                    white-space:pre-wrap;
                    line-height:1.6;
                ">
                    ${result.analysis}
                </div>

            `;


            saveToHistory(
                "Gemini AI Analysis",
                0,
                imageData
            );

            return;
        }


        // --------------------------------------------------
        // OFFLINE RESULT — LOCAL MODEL
        // --------------------------------------------------

        if (result.mode === "offline") {

            const confidence =
                result.confidence;

            const className =
                result.prediction;


            const info =
                DISEASE_INFO[className] || {

                    name: className,

                    cropFamily: "Unknown",

                    cause:
                        "No information available for this class.",

                    precautions: "-",

                    remedy: "-"

                };


            let severity;
            let severityColor;
            let recovery;


            if (
                info.name
                    .toLowerCase()
                    .includes("healthy")
            ) {

                severity = 5;

                severityColor =
                    "#4caf50";

                recovery =
                    "Not applicable — crop is healthy.";

            }

            else if (confidence >= 80) {

                severity = 70;

                severityColor =
                    "#e53935";

                recovery =
                    "Moderate to low — act quickly.";

            }

            else if (confidence >= 60) {

                severity = 45;

                severityColor =
                    "#fb8c00";

                recovery =
                    "Good — early stage, monitor closely.";

            }

            else {

                severity = 25;

                severityColor =
                    "#fdd835";

                recovery =
                    "Uncertain diagnosis — try a clearer photo.";

            }


            let html = `

                <div style="
                    background:#fff3cd;
                    padding:10px;
                    border-radius:8px;
                    margin-bottom:12px;
                ">

                    <strong>
                      📴 Offline
                    </strong>

                </div>


                <h2>
                    ${info.name}
                </h2>


                <p>
                    <strong>
                        Confidence:
                    </strong>

                    ${confidence}%
                </p>


                <p>
                    <strong>
                        Estimated severity:
                    </strong>
                </p>


                <div style="
                    background:#e0e0e0;
                    border-radius:6px;
                    height:14px;
                    overflow:hidden;
                    margin-bottom:10px;
                ">

                    <div style="
                        height:100%;
                        width:${severity}%;
                        background:${severityColor};
                    "></div>

                </div>


                <p>
                    <strong>
                        Recovery chance:
                    </strong>

                    ${recovery}
                </p>


                <p>
                    <strong>
                        Likely cause:
                    </strong>

                    ${info.cause}
                </p>


                <p>
                    <strong>
                        Precautions:
                    </strong>

                    ${info.precautions}
                </p>


                <p>
                    <strong>
                        Remedy:
                    </strong>

                    ${info.remedy}
                </p>


                <p>
                    <strong>
                        Other possibilities:
                    </strong>
                </p>

                <ul>
            `;


            if (
                result.predictions &&
                result.predictions.length > 1
            ) {

                result.predictions
                    .slice(1, 3)
                    .forEach((p) => {

                        const otherInfo =
                            DISEASE_INFO[
                            p.className
                            ];

                        const otherName =
                            otherInfo
                                ? otherInfo.name
                                : p.className;

                        html += `

                            <li>
                                ${otherName}
                                -
                                ${Math.round(
                            p.probability * 100
                        )}%
                            </li>

                        `;

                    });

            }


            html += `
                </ul>
            `;


            resultBox.innerHTML =
                html;


            saveToHistory(
                info.name,
                confidence,
                imageData
            );

            return;
        }


        throw new Error(
            "Unknown detection mode."
        );


    } catch (error) {

        console.error(
            "❌ CropHealth detection error:",
            error
        );


        resultBox.innerHTML = `

            <div style="
                background:#fdecea;
                color:#b71c1c;
                padding:12px;
                border-radius:8px;
            ">

                <strong>
                    ❌ Analysis failed
                </strong>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* ----------------------------------------------------------
   4. HISTORY (browser storage)
---------------------------------------------------------- */
function saveToHistory(diseaseName, confidence, imageSrc) {
    const history = JSON.parse(localStorage.getItem("cropHistory") || "[]");
    history.unshift({
        diseaseName,
        confidence,
        imageSrc,
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem("cropHistory", JSON.stringify(history.slice(0, 50)));
}

function renderHistory() {
    const listEl = document.getElementById("historyList");
    if (!listEl) return; // not on the history page

    const history = JSON.parse(localStorage.getItem("cropHistory") || "[]");

    if (history.length === 0) {
        listEl.innerHTML = "<p>No detections yet. Go to Disease Detection to analyze a leaf.</p>";
        return;
    }

    let html = `<div class="cards">`;
    history.forEach((entry) => {
        html += `
      <div class="card" style="width:250px;">
        <img src="${entry.imageSrc}" alt="${entry.diseaseName}"
             style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
        <h3>${entry.diseaseName}</h3>
        <p><strong>Confidence:</strong> ${entry.confidence}%</p>
        <p style="font-size:13px;color:#777;">${entry.timestamp}</p>
      </div>
    `;
    });
    html += `</div>`;

    listEl.innerHTML = html;
}

function clearHistory() {
    if (confirm("Clear all detection history? This cannot be undone.")) {
        localStorage.removeItem("cropHistory");
        renderHistory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderHistory();
});
/* ----------------------------------------------------------
   CAMERA CAPTURE + ANALYZE (camera.html)
---------------------------------------------------------- */
let cameraStream = null;

async function openCamera() {
    const video = document.getElementById("cameraView");
    if (!video) return;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = cameraStream;
    } catch (err) {
        console.error("Camera access failed:", err);
        alert("Could not access camera. Make sure you allow camera permission (and you're on localhost/HTTPS).");
    }
}

function captureImage() {
    const video = document.getElementById("cameraView");
    const canvas = document.getElementById("captureCanvas");

    if (!video || !video.srcObject) {
        alert("Open the camera first.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

async function analyzeCameraImage() {
    const canvas = document.getElementById("captureCanvas");
    const resultBox = document.getElementById("cameraResult");

    if (!canvas || canvas.width === 0) {
        resultBox.innerHTML = "<p>Please capture an image first.</p>";
        return;
    }

    resultBox.innerHTML = "<p>🔍 Analyzing leaf...</p>";

    try {
        // Convert captured canvas to base64 image
        const imageData = canvas.toDataURL("image/jpeg", 0.8);

        // Use the existing hybrid detection system
        const result = await analyzeCropHybrid(
            canvas,
            imageData,
            ""
        );

        console.log("Hybrid camera result:", result);

        if (!result || !result.success) {
            throw new Error("Image analysis failed.");
        }

        // =====================================================
        // ONLINE → GEMINI
        // =====================================================

        if (result.mode === "online") {

            resultBox.innerHTML = `
                <h2>🌐 Gemini AI Analysis</h2>
                <div class="result-box">
                    ${formatGeminiAnalysis(result.analysis)}
                </div>
            `;

        }

        // =====================================================
        // OFFLINE → LOCAL MODEL
        // =====================================================

        else {

            const info =
                DISEASE_INFO[result.prediction] || {
                    name: result.prediction,
                    cropFamily: "Unknown",
                    cause: "No data available for this class.",
                    precautions: "-",
                    remedy: "-"
                };

            resultBox.innerHTML = `
                <h2>${info.name}</h2>

                <p>
                    <strong>Confidence:</strong>
                    ${result.confidence}%
                </p>

                <p>
                    <strong>Mode:</strong>
                    📴 Offline Local Model
                </p>

                <p>
                    <strong>Likely cause:</strong>
                    ${info.cause}
                </p>

                <p>
                    <strong>Precautions:</strong>
                    ${info.precautions}
                </p>

                <p>
                    <strong>Remedy:</strong>
                    ${info.remedy}
                </p>
            `;
        }

        // =====================================================
        // SAVE HISTORY
        // =====================================================

        const historyName =
            result.mode === "online"
                ? "Gemini AI Analysis"
                : result.prediction;

        const historyConfidence =
            result.mode === "online"
                ? 0
                : result.confidence;

        saveToHistory(
            historyName,
            historyConfidence,
            canvas.toDataURL("image/jpeg", 0.7)
        );

    } catch (error) {

        console.error(
            "Camera hybrid analysis failed:",
            error
        );

        resultBox.innerHTML = `
            <p>
                ❌ Analysis failed.
            </p>
            <p>
                ${error.message}
            </p>
        `;
    }
}
// Helper
function formatGeminiAnalysis(analysis) {

    if (!analysis) {
        return "<p>No analysis received.</p>";
    }

    if (typeof analysis === "string") {
        return `<p>${analysis.replace(/\n/g, "<br>")}</p>`;
    }

    return `
        <p>
            <strong>Crop:</strong>
            ${analysis.crop || "Unknown"}
        </p>

        <p>
            <strong>Disease:</strong>
            ${analysis.disease || "Unknown"}
        </p>

        <p>
            <strong>Cause:</strong>
            ${analysis.cause || "Not available"}
        </p>

        <p>
            <strong>Precautions:</strong>
            ${analysis.precautions || "Not available"}
        </p>

        <p>
            <strong>Remedy:</strong>
            ${analysis.remedy || "Not available"}
        </p>
    `;
}
/* ----------------------------------------------------------
   CONTACT FORM (about.html + index.html)
---------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/maewwrqe";

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", handleContactSubmit);
});

async function handleContactSubmit(e) {
    e.preventDefault();

    const nameEl = document.getElementById("contactName");
    const emailEl = document.getElementById("contactEmail");
    const messageEl = document.getElementById("contactMessage");
    const honeypot = document.getElementById("contactHoneypot");
    const statusEl = document.getElementById("contactStatus");
    const btn = document.getElementById("contactSubmitBtn");

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = messageEl.value.trim();

    // Reset status
    statusEl.style.color = "";
    statusEl.textContent = "";

    // --- Validation ---
    if (!name || !email || !message) {
        statusEl.style.color = "#c0392b";
        statusEl.textContent = "Please fill in all fields before sending.";
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        statusEl.style.color = "#c0392b";
        statusEl.textContent = "Please enter a valid email address.";
        return;
    }

    if (message.length < 10) {
        statusEl.style.color = "#c0392b";
        statusEl.textContent = "Please write a bit more detail in your message.";
        return;
    }

    // Honeypot: if this hidden field got filled, it's almost certainly a bot — silently pretend success
    if (honeypot.value.trim() !== "") {
        statusEl.style.color = "#2e7d32";
        statusEl.textContent = "Thank you! Your message has been sent.";
        contactForm.reset();
        return;
    }

    // --- Prevent double submission ---
    btn.disabled = true;
    const originalBtnText = btn.textContent;
    btn.textContent = "Sending...";

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: new FormData(contactForm)
        });

        if (response.ok) {
            statusEl.style.color = "#2e7d32";
            statusEl.textContent = "Thank you! Your message has been sent — we'll get back to you soon.";
            contactForm.reset();
        } else {
            const data = await response.json().catch(() => null);
            const errorMsg = data && data.errors
                ? data.errors.map(err => err.message).join(", ")
                : "Something went wrong. Please try again in a moment.";
            statusEl.style.color = "#c0392b";
            statusEl.textContent = errorMsg;
        }
    } catch (err) {
        console.error("Contact form submission failed:", err);
        statusEl.style.color = "#c0392b";
        statusEl.textContent = "Network error — please check your connection and try again.";
    } finally {
        btn.disabled = false;
        btn.textContent = originalBtnText;
    }
}
/* ----------------------------------------------------------
   5. DARK MODE TOGGLE
---------------------------------------------------------- */
function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("cropHealthTheme", isDark ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("cropHealthTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
});

/* ----------------------------------------------------------
   6. LANGUAGE / Q&A ASSISTANT (language.html)
---------------------------------------------------------- */
const UI_STRINGS = {
    english: { heading: "Ask your question", placeholder: "Type your crop related question here...", button: "Get Answer", noMatch: "I couldn't find a specific match. Try mentioning a crop (tomato, potato, corn...) or disease name.", found: "Here's what I found about", cause: "Cause", precautions: "Precautions", remedy: "Remedy" },
    hindi: { heading: "अपना प्रश्न पूछें", placeholder: "यहाँ अपनी फसल से जुड़ा सवाल लिखें...", button: "उत्तर पाएं", noMatch: "कोई सटीक उत्तर नहीं मिला। कृपया फसल (टमाटर, आलू, मक्का...) या रोग का नाम बताएं।", found: "इसके बारे में जानकारी मिली:", cause: "कारण", precautions: "सावधानियां", remedy: "उपचार" },
    bengali: { heading: "আপনার প্রশ্ন জিজ্ঞাসা করুন", placeholder: "এখানে আপনার ফসল সম্পর্কিত প্রশ্ন লিখুন...", button: "উত্তর পান", noMatch: "সঠিক উত্তর পাওয়া যায়নি। ফসলের নাম (টমেটো, আলু, ভুট্টা...) বা রোগের নাম উল্লেখ করুন।", found: "এই বিষয়ে তথ্য পাওয়া গেছে:", cause: "কারণ", precautions: "সতর্কতা", remedy: "প্রতিকার" },
    telugu: { heading: "మీ ప్రశ్న అడగండి", placeholder: "మీ పంట సంబంధిత ప్రశ్నను ఇక్కడ టైప్ చేయండి...", button: "సమాధానం పొందండి", noMatch: "ఖచ్చితమైన సమాధానం దొరకలేదు. పంట పేరు (టమాటో, బంగాళదుంప...) లేదా వ్యాధి పేరు పేర్కొనండి.", found: "దీని గురించి సమాచారం దొరికింది:", cause: "కారణం", precautions: "జాగ్రత్తలు", remedy: "నివారణ" },
    marathi: { heading: "तुमचा प्रश्न विचारा", placeholder: "इथे तुमच्या पिकाशी संबंधित प्रश्न टाइप करा...", button: "उत्तर मिळवा", noMatch: "नेमके उत्तर सापडले नाही. कृपया पिकाचे (टोमॅटो, बटाटा...) किंवा रोगाचे नाव सांगा.", found: "याबद्दल माहिती सापडली:", cause: "कारण", precautions: "खबरदारी", remedy: "उपाय" },
    tamil: { heading: "உங்கள் கேள்வியை கேளுங்கள்", placeholder: "உங்கள் பயிர் தொடர்பான கேள்வியை இங்கே தட்டச்சு செய்யவும்...", button: "பதில் பெறவும்", noMatch: "துல்லியமான பதில் கிடைக்கவில்லை. பயிர் (தக்காளி, உருளைக்கிழங்கு...) அல்லது நோயின் பெயரைக் குறிப்பிடவும்.", found: "இது பற்றிய தகவல் கிடைத்தது:", cause: "காரணம்", precautions: "முன்னெச்சரிக்கைகள்", remedy: "தீர்வு" },
    gujarati: { heading: "તમારો પ્રશ્ન પૂછો", placeholder: "તમારા પાક સંબંધિત પ્રશ્ન અહીં લખો...", button: "જવાબ મેળવો", noMatch: "ચોક્કસ જવાબ મળ્યો નથી. કૃપા કરીને પાક (ટામેટા, બટાકા...) અથવા રોગનું નામ જણાવો.", found: "આ વિશે માહિતી મળી:", cause: "કારણ", precautions: "સાવચેતીઓ", remedy: "ઉપાય" },
    kannada: { heading: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ", placeholder: "ನಿಮ್ಮ ಬೆಳೆ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...", button: "ಉತ್ತರ ಪಡೆಯಿರಿ", noMatch: "ನಿಖರವಾದ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ಬೆಳೆ (ಟೊಮ್ಯಾಟೊ, ಆಲೂಗಡ್ಡೆ...) ಅಥವಾ ರೋಗದ ಹೆಸರನ್ನು ತಿಳಿಸಿ.", found: "ಇದರ ಬಗ್ಗೆ ಮಾಹಿತಿ ಸಿಕ್ಕಿದೆ:", cause: "ಕಾರಣ", precautions: "ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು", remedy: "ಪರಿಹಾರ" },
    malayalam: { heading: "നിങ്ങളുടെ ചോദ്യം ചോദിക്കുക", placeholder: "നിങ്ങളുടെ വിള സംബന്ധിച്ച ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...", button: "ഉത്തരം നേടുക", noMatch: "കൃത്യമായ ഉത്തരം കണ്ടെത്താനായില്ല. വിള (തക്കാളി, ഉരുളക്കിഴങ്ങ്...) അല്ലെങ്കിൽ രോഗത്തിന്റെ പേര് പറയുക.", found: "ഇതിനെക്കുറിച്ചുള്ള വിവരം ലഭിച്ചു:", cause: "കാരണം", precautions: "മുൻകരുതലുകൾ", remedy: "പരിഹാരം" },
    punjabi: { heading: "ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ", placeholder: "ਇੱਥੇ ਆਪਣੀ ਫਸਲ ਨਾਲ ਸਬੰਧਤ ਸਵਾਲ ਲਿਖੋ...", button: "ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ", noMatch: "ਸਹੀ ਜਵਾਬ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਫਸਲ (ਟਮਾਟਰ, ਆਲੂ...) ਜਾਂ ਬਿਮਾਰੀ ਦਾ ਨਾਮ ਦੱਸੋ।", found: "ਇਸ ਬਾਰੇ ਜਾਣਕਾਰੀ ਮਿਲੀ:", cause: "ਕਾਰਨ", precautions: "ਸਾਵਧਾਨੀਆਂ", remedy: "ਇਲਾਜ" },
    odia: { heading: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ", placeholder: "ଏଠାରେ ଆପଣଙ୍କ ଫସଲ ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...", button: "ଉତ୍ତର ପାଆନ୍ତୁ", noMatch: "ସଠିକ୍ ଉତ୍ତର ମିଳିଲା ନାହିଁ। ଦୟାକରି ଫସଲ (ଟମାଟୋ, ଆଳୁ...) କିମ୍ବା ରୋଗର ନାମ କୁହନ୍ତୁ।", found: "ଏହା ବିଷୟରେ ସୂଚନା ମିଳିଲା:", cause: "କାରଣ", precautions: "ସତର୍କତା", remedy: "ପ୍ରତିକାର" },
    assamese: { heading: "আপোনাৰ প্ৰশ্ন সোধক", placeholder: "ইয়াত আপোনাৰ শস্য সম্পৰ্কীয় প্ৰশ্ন লিখক...", button: "উত্তৰ পাওক", noMatch: "সঠিক উত্তৰ পোৱা নগ'ল। অনুগ্ৰহ কৰি শস্য (টমেটো, আলু...) বা ৰোগৰ নাম উল্লেখ কৰক।", found: "ইয়াৰ বিষয়ে তথ্য পোৱা গ'ল:", cause: "কাৰণ", precautions: "সাৱধানতা", remedy: "প্ৰতিকাৰ" }
};

function changeLanguage() {
    const lang = document.getElementById("languageSelect").value;
    const strings = UI_STRINGS[lang] || UI_STRINGS.english;

    const heading = document.getElementById("questionTitle");
    const questionBox = document.getElementById("questionBox");
    const button = document.querySelector('button[onclick="askQuestion()"]');

    if (heading) heading.textContent = strings.heading;
    if (questionBox) questionBox.placeholder = strings.placeholder;
    if (button) button.textContent = strings.button;
}
/* ----------------------------------------------------------
   DISEASE INFO TRANSLATIONS
---------------------------------------------------------- */
const DISEASE_INFO_TRANSLATIONS = {
    hindi: {
        "Tomato_healthy": { name: "टमाटर - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित रूप से सिंचाई और खाद जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Tomato_Early_blight": { name: "टमाटर - अगेती झुलसा रोग", cause: "अल्टरनेरिया फफूंद के कारण पत्तियों पर भूरे धब्बे बनते हैं।", precautions: "संक्रमित पत्तियां हटाएं, ऊपर से सिंचाई न करें, पौधों के बीच पर्याप्त दूरी रखें।", remedy: "हर 7-10 दिन में कॉपर आधारित फफूंदनाशक का छिड़काव करें।" },
        "Tomato_Late_blight": { name: "टमाटर - पछेती झुलसा रोग", cause: "फाइटोफ्थोरा फफूंद से होता है, नम मौसम में तेजी से फैलता है।", precautions: "संक्रमित पौधों को तुरंत हटाकर नष्ट करें, गीले खेत में काम करने से बचें।", remedy: "मैंकोजेब या क्लोरोथालोनिल फफूंदनाशक का निवारक छिड़काव करें।" },
        "Tomato_Septoria_leaf_spot": { name: "टमाटर - सेप्टोरिया पत्ती धब्बा", cause: "सेप्टोरिया फफूंद से पत्तियों पर छोटे गोल धब्बे बनते हैं।", precautions: "फसल चक्र अपनाएं, संक्रमित पत्तियां हटाएं, ऊपर से पानी देने से बचें।", remedy: "क्लोरोथालोनिल आधारित फफूंदनाशक का प्रयोग करें।" },
        "Potato_healthy": { name: "आलू - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी और संतुलित उर्वरक जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Potato_Late_blight": { name: "आलू - पछेती झुलसा रोग", cause: "फाइटोफ्थोरा फफूंद से होता है, नम मौसम में तेजी से फैलता है।", precautions: "संक्रमित पत्तियां हटाएं, खेत में जल निकासी सुधारें।", remedy: "मैंकोजेब जैसे फफूंदनाशक का छिड़काव करें, अगले सीजन में फसल चक्र अपनाएं।" },
        "Corn_healthy": { name: "मक्का - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Corn_Common_rust": { name: "मक्का - सामान्य रस्ट रोग", cause: "पक्सिनिया फफूंद से पत्तियों पर भूरे-नारंगी धब्बे बनते हैं।", precautions: "रोग प्रतिरोधी किस्में लगाएं, संक्रमित पौधों के अवशेष हटाएं।", remedy: "जरूरत पड़ने पर फफूंदनाशक का छिड़काव करें।" },
        "Corn_Northern_Leaf_Blight": { name: "मक्का - उत्तरी पत्ती झुलसा रोग", cause: "एक्सरोहिलम फफूंद से पत्तियों पर लंबे भूरे धब्बे बनते हैं।", precautions: "फसल चक्र अपनाएं, प्रतिरोधी किस्में चुनें।", remedy: "आवश्यकता पड़ने पर फफूंदनाशक का प्रयोग करें।" },
        "Grape_healthy": { name: "अंगूर - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Grape_Black_rot": { name: "अंगूर - काला सड़न रोग", cause: "फफूंद संक्रमण से फलों और पत्तियों पर काले धब्बे बनते हैं।", precautions: "संक्रमित भाग हटाएं, बेल के आसपास हवा का आवागमन बनाए रखें।", remedy: "फफूंदनाशक का नियमित छिड़काव करें।" },
        "Grape_Esca": { name: "अंगूर - एस्का रोग", cause: "फफूंद जनित रोग जो बेल की लकड़ी को प्रभावित करता है।", precautions: "संक्रमित बेलों की छंटाई करें, घाव को ठीक से सील करें।", remedy: "इसका कोई पक्का इलाज नहीं है, रोकथाम ही सबसे अच्छा उपाय है।" },
        "Apple_healthy": { name: "सेब - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Apple_scab": { name: "सेब - स्कैब रोग", cause: "फफूंद संक्रमण से पत्तियों और फलों पर काले-भूरे धब्बे बनते हैं।", precautions: "गिरी हुई पत्तियों को इकट्ठा कर नष्ट करें।", remedy: "कली फूटने से लेकर गर्मी की शुरुआत तक फफूंदनाशक का छिड़काव करें।" },
        "Pepper_healthy": { name: "शिमला मिर्च - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Pepper_Bacterial_spot": { name: "शिमला मिर्च - जीवाणु धब्बा रोग", cause: "जीवाणु संक्रमण से पत्तियों और फलों पर पानी जैसे धब्बे बनते हैं।", precautions: "प्रमाणित बीज का प्रयोग करें, ऊपर से सिंचाई न करें।", remedy: "कॉपर आधारित जीवाणुनाशक का छिड़काव करें।" },
        "Strawberry_healthy": { name: "स्ट्रॉबेरी - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Strawberry_Leaf_scorch": { name: "स्ट्रॉबेरी - पत्ती झुलसा रोग", cause: "फफूंद संक्रमण से पत्तियों पर बैंगनी-भूरे धब्बे बनते हैं।", precautions: "संक्रमित पत्तियां हटाएं, पौधों के बीच उचित दूरी रखें।", remedy: "फफूंदनाशक का छिड़काव करें, पुरानी पत्तियों को समय पर हटाएं।" },
        "Cherry_healthy": { name: "चेरी - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Cherry_Powdery_mildew": { name: "चेरी - पाउडरी फफूंदी रोग", cause: "फफूंद संक्रमण से पत्तियों पर सफेद पाउडर जैसी परत बनती है।", precautions: "पौधों के बीच हवा का आवागमन बनाए रखें, अधिक नाइट्रोजन खाद से बचें।", remedy: "सल्फर आधारित फफूंदनाशक का छिड़काव करें।" },
        "Peach_healthy": { name: "आड़ू - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Peach_Bacterial_spot": { name: "आड़ू - जीवाणु धब्बा रोग", cause: "जीवाणु संक्रमण से पत्तियों और फलों पर छोटे गहरे धब्बे बनते हैं।", precautions: "प्रतिरोधी किस्में लगाएं, ऊपर से सिंचाई से बचें।", remedy: "कॉपर आधारित जीवाणुनाशक का छिड़काव करें।" },
        "Soybean_healthy": { name: "सोयाबीन - स्वस्थ", cause: "पौधा स्वस्थ है, कोई रोग नहीं पाया गया।", precautions: "नियमित निगरानी जारी रखें।", remedy: "किसी उपचार की आवश्यकता नहीं है।" },
        "Squash_Powdery_mildew": { name: "स्क्वैश - पाउडरी फफूंदी रोग", cause: "फफूंद संक्रमण से पत्तियों पर सफेद पाउडर जैसी परत बनती है।", precautions: "पौधों के बीच पर्याप्त दूरी रखें, अधिक नमी से बचें।", remedy: "सल्फर या पोटैशियम बाइकार्बोनेट आधारित फफूंदनाशक का छिड़काव करें।" }
    },
    tamil: {
        "Tomato_healthy": { name: "தக்காளி - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து நீர்ப்பாசனம், சமச்சீர் உரம் மற்றும் கண்காணிப்பை தொடரவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Tomato_Early_blight": { name: "தக்காளி - முன்கூட்டிய இலைக்கருகல்", cause: "அல்டர்நேரியா பூஞ்சையால் இலைகளில் பழுப்பு நிற புள்ளிகள் ஏற்படும்.", precautions: "பாதிக்கப்பட்ட இலைகளை அகற்றவும், மேலிருந்து நீர் ஊற்ற வேண்டாம், செடிகளுக்கு இடையே இடைவெளி வையுங்கள்.", remedy: "ஒவ்வொரு 7-10 நாட்களுக்கும் காப்பர் அடிப்படையிலான பூஞ்சைக்கொல்லியை தெளிக்கவும்." },
        "Tomato_Late_blight": { name: "தக்காளி - பிந்தைய இலைக்கருகல்", cause: "பைட்டோப்தோரா பூஞ்சையால் ஏற்படும், ஈரப்பதமான வானிலையில் வேகமாக பரவும்.", precautions: "பாதிக்கப்பட்ட செடிகளை உடனடியாக அகற்றவும், ஈரமான வயலில் வேலை செய்வதை தவிர்க்கவும்.", remedy: "மான்கோசெப் அல்லது குளோரோதலோனில் பூஞ்சைக்கொல்லியை தடுப்பாக தெளிக்கவும்." },
        "Tomato_Septoria_leaf_spot": { name: "தக்காளி - செப்டோரியா இலைப்புள்ளி", cause: "செப்டோரியா பூஞ்சையால் இலைகளில் சிறிய வட்ட புள்ளிகள் ஏற்படும்.", precautions: "பயிர் சுழற்சி செய்யவும், பாதிக்கப்பட்ட இலைகளை அகற்றவும், மேலிருந்து நீர் ஊற்ற வேண்டாம்.", remedy: "குளோரோதலோனில் அடிப்படையிலான பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." },
        "Potato_healthy": { name: "உருளைக்கிழங்கு - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கண்காணிப்பு மற்றும் சரியான நீர்ப்பாசனத்தை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Potato_Late_blight": { name: "உருளைக்கிழங்கு - பிந்தைய இலைக்கருகல்", cause: "பைட்டோப்தோரா பூஞ்சையால் ஏற்படும், குளிர் ஈரப்பதமான வானிலையில் வேகமாக பரவும்.", precautions: "வயலில் நீர் வடிகால் மேம்படுத்தவும், அடர்த்தியான நடவை தவிர்க்கவும்.", remedy: "பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றவும், மான்கோசெப் பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." },
        "Corn_healthy": { name: "சோளம் - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "வழக்கமான பராமரிப்பு மற்றும் கண்காணிப்பை தொடரவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Corn_Common_rust": { name: "சோளம் - பொதுவான துருப்பிடிப்பு நோய்", cause: "பக்ஸினியா பூஞ்சை காற்று மூலம் பரவும்.", precautions: "துருப்பிடிப்பு எதிர்ப்பு ரகங்களை நடவும், அதிக நைட்ரஜன் உரத்தை தவிர்க்கவும்.", remedy: "தீவிரம் அதிகமாக இருந்தால் பூஞ்சைக்கொல்லியை தெளிக்கவும்." },
        "Corn_Northern_Leaf_Blight": { name: "சோளம் - வடக்கு இலைக்கருகல்", cause: "எக்செரோஹிலம் பூஞ்சை ஈரப்பதமான வானிலையில் பரவும்.", precautions: "பயிர் சுழற்சி செய்யவும், எதிர்ப்பு ரகங்களை தேர்ந்தெடுக்கவும்.", remedy: "ஆரம்ப அறிகுறிகளில் பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." },
        "Grape_healthy": { name: "திராட்சை - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கத்தரித்தல் மற்றும் கண்காணிப்பை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Grape_Black_rot": { name: "திராட்சை - கருப்பு அழுகல்", cause: "பூஞ்சை தொற்றால் பழங்கள் மற்றும் இலைகளில் கருப்பு புள்ளிகள் ஏற்படும்.", precautions: "பழைய பழங்கள் மற்றும் உதிர்ந்த இலைகளை அகற்றவும், காற்றோட்டத்திற்கு கத்தரிக்கவும்.", remedy: "பருவத்தின் தொடக்கத்திலேயே பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." },
        "Grape_Esca": { name: "திராட்சை - எஸ்கா நோய்", cause: "கத்தரிப்பு காயங்கள் வழியாக பூஞ்சை தொற்று ஏற்படும்.", precautions: "உலர் வானிலையில் கத்தரிக்கவும், கருவிகளை கிருமி நீக்கம் செய்யவும்.", remedy: "முழுமையான சிகிச்சை இல்லை, கடுமையாக பாதிக்கப்பட்ட கொடிகளை அகற்றவும்." },
        "Apple_healthy": { name: "ஆப்பிள் - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "வழக்கமான பராமரிப்பு மற்றும் கண்காணிப்பை தொடரவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Apple_scab": { name: "ஆப்பிள் - ஸ்கேப் நோய்", cause: "பூஞ்சை தொற்றால் இலைகள் மற்றும் பழங்களில் கருப்பு-பழுப்பு புள்ளிகள் ஏற்படும்.", precautions: "இலையுதிர் காலத்தில் உதிர்ந்த இலைகளை சேகரித்து அழிக்கவும்.", remedy: "மொட்டு விரிவதிலிருந்து கோடையின் தொடக்கம் வரை பூஞ்சைக்கொல்லியை தெளிக்கவும்." },
        "Pepper_healthy": { name: "குடைமிளகாய் - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கண்காணிப்பு மற்றும் சமச்சீர் நீர்ப்பாசனத்தை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Pepper_Bacterial_spot": { name: "குடைமிளகாய் - பாக்டீரியா புள்ளி நோய்", cause: "பாக்டீரியா தொற்று நீர் தெளிப்பு மூலம் பரவும்.", precautions: "நோய் இல்லாத விதைகளை பயன்படுத்தவும், மேலிருந்து நீர் ஊற்ற வேண்டாம்.", remedy: "காப்பர் அடிப்படையிலான பாக்டீரியாக்கொல்லியை பயன்படுத்தவும்." },
        "Strawberry_healthy": { name: "ஸ்ட்ராபெரி - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து நீர்ப்பாசனம் மற்றும் மல்ச்சிங் பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Strawberry_Leaf_scorch": { name: "ஸ்ட்ராபெரி - இலைக்கருகல்", cause: "பூஞ்சை தொற்றால் இலைகளில் ஊதா-பழுப்பு புள்ளிகள் ஏற்படும்.", precautions: "பாதிக்கப்பட்ட இலைகளை அகற்றவும், செடிகளுக்கு இடையே சரியான இடைவெளி வையுங்கள்.", remedy: "பூஞ்சைக்கொல்லியை தெளிக்கவும், பழைய இலைகளை சரியான நேரத்தில் அகற்றவும்." },
        "Cherry_healthy": { name: "செர்ரி - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கண்காணிப்பை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Cherry_Powdery_mildew": { name: "செர்ரி - பவுடரி மில்டியூ", cause: "பூஞ்சை தொற்றால் இலைகளில் வெள்ளை தூள் போன்ற படலம் ஏற்படும்.", precautions: "செடிகளுக்கு இடையே காற்றோட்டத்தை பராமரிக்கவும், அதிக நைட்ரஜன் உரத்தை தவிர்க்கவும்.", remedy: "சல்பர் அடிப்படையிலான பூஞ்சைக்கொல்லியை தெளிக்கவும்." },
        "Peach_healthy": { name: "பீச் - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கண்காணிப்பை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Peach_Bacterial_spot": { name: "பீச் - பாக்டீரியா புள்ளி நோய்", cause: "பாக்டீரியா தொற்றால் இலைகள் மற்றும் பழங்களில் சிறிய கரும் புள்ளிகள் ஏற்படும்.", precautions: "எதிர்ப்பு ரகங்களை நடவும், மேலிருந்து நீர் ஊற்றுவதை தவிர்க்கவும்.", remedy: "காப்பர் அடிப்படையிலான பாக்டீரியாக்கொல்லியை தெளிக்கவும்." },
        "Soybean_healthy": { name: "சோயாபீன் - ஆரோக்கியமானது", cause: "எந்த நோயும் கண்டறியப்படவில்லை.", precautions: "தொடர்ந்து கண்காணிப்பை பராமரிக்கவும்.", remedy: "சிகிச்சை தேவையில்லை." },
        "Squash_Powdery_mildew": { name: "ஸ்குவாஷ் - பவுடரி மில்டியூ", cause: "பூஞ்சை தொற்றால் இலைகளில் வெள்ளை தூள் போன்ற படலம் ஏற்படும்.", precautions: "செடிகளுக்கு இடையே போதுமான இடைவெளி வையுங்கள், அதிக ஈரப்பதத்தை தவிர்க்கவும்.", remedy: "சல்பர் அல்லது பொட்டாசியம் பைகார்பனேட் அடிப்படையிலான பூஞ்சைக்கொல்லியை பயன்படுத்தவும்." }
    },
    gujarati: {
        "Tomato_healthy": { name: "ટામેટા - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત પિયત, સંતુલિત ખાતર અને દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Tomato_Early_blight": { name: "ટામેટા - વહેલો સુકારો", cause: "અલ્ટરનેરિયા ફૂગને કારણે પાંદડા પર ભૂરા ડાઘ પડે છે.", precautions: "સંક્રમિત પાંદડા દૂર કરો, ઉપરથી પાણી ન આપો, છોડ વચ્ચે અંતર રાખો.", remedy: "દર 7-10 દિવસે કોપર આધારિત ફૂગનાશક છાંટો." },
        "Tomato_Late_blight": { name: "ટામેટા - મોડો સુકારો", cause: "ફાયટોફ્થોરા ફૂગને કારણે થાય છે, ભેજવાળા વાતાવરણમાં ઝડપથી ફેલાય છે.", precautions: "સંક્રમિત છોડ તરત દૂર કરો, ભીના ખેતરમાં કામ કરવાનું ટાળો.", remedy: "મેન્કોઝેબ અથવા ક્લોરોથેલોનિલ ફૂગનાશક નિવારક રીતે છાંટો." },
        "Tomato_Septoria_leaf_spot": { name: "ટામેટા - સેપ્ટોરિયા પાન ડાઘ", cause: "સેપ્ટોરિયા ફૂગને કારણે પાંદડા પર નાના ગોળ ડાઘ પડે છે.", precautions: "પાક ફેરબદલી કરો, સંક્રમિત પાંદડા દૂર કરો, ઉપરથી પાણી આપવાનું ટાળો.", remedy: "ક્લોરોથેલોનિલ આધારિત ફૂગનાશક વાપરો." },
        "Potato_healthy": { name: "બટાકા - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત દેખરેખ અને યોગ્ય પિયત ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Potato_Late_blight": { name: "બટાકા - મોડો સુકારો", cause: "ફાયટોફ્થોરા ફૂગને કારણે થાય છે, ઠંડા ભેજવાળા વાતાવરણમાં ઝડપથી ફેલાય છે.", precautions: "ખેતરમાં પાણીનો નિકાલ સુધારો, ગીચ વાવેતર ટાળો.", remedy: "સંક્રમિત પાંદડા તરત દૂર કરો, મેન્કોઝેબ ફૂગનાશક વાપરો." },
        "Corn_healthy": { name: "મકાઈ - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "સામાન્ય કાળજી અને દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Corn_Common_rust": { name: "મકાઈ - સામાન્ય કાટ રોગ", cause: "પક્સિનિયા ફૂગ પવન દ્વારા ફેલાય છે.", precautions: "કાટ પ્રતિરોધક જાતો વાવો, વધુ નાઇટ્રોજન ખાતર ટાળો.", remedy: "તીવ્રતા વધુ હોય તો ફૂગનાશક છાંટો." },
        "Corn_Northern_Leaf_Blight": { name: "મકાઈ - ઉત્તર પાન સુકારો", cause: "એક્સેરોહિલમ ફૂગ ભેજવાળા વાતાવરણમાં ફેલાય છે.", precautions: "પાક ફેરબદલી કરો, પ્રતિરોધક જાતો પસંદ કરો.", remedy: "શરૂઆતના લક્ષણો પર ફૂગનાશક વાપરો." },
        "Grape_healthy": { name: "દ્રાક્ષ - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત કાપણી અને દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Grape_Black_rot": { name: "દ્રાક્ષ - કાળો સડો", cause: "ફૂગ સંક્રમણને કારણે ફળો અને પાંદડા પર કાળા ડાઘ પડે છે.", precautions: "જૂના ફળો અને ખરેલા પાંદડા દૂર કરો, હવાની અવરજવર માટે કાપણી કરો.", remedy: "ઋતુની શરૂઆતમાં જ ફૂગનાશક વાપરો." },
        "Grape_Esca": { name: "દ્રાક્ષ - એસ્કા રોગ", cause: "કાપણીના ઘા દ્વારા ફૂગ સંક્રમણ થાય છે.", precautions: "સૂકા વાતાવરણમાં કાપણી કરો, સાધનો જંતુમુક્ત કરો.", remedy: "સંપૂર્ણ સારવાર નથી, ગંભીર સંક્રમિત વેલા દૂર કરો." },
        "Apple_healthy": { name: "સફરજન - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "સામાન્ય કાળજી અને દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Apple_scab": { name: "સફરજન - સ્કેબ રોગ", cause: "ફૂગ સંક્રમણને કારણે પાંદડા અને ફળો પર કાળા-ભૂરા ડાઘ પડે છે.", precautions: "પાનખરમાં ખરેલા પાંદડા ભેગા કરી નષ્ટ કરો.", remedy: "કળી ફૂટવાથી ઉનાળાની શરૂઆત સુધી ફૂગનાશક છાંટો." },
        "Pepper_healthy": { name: "કેપ્સિકમ - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત દેખરેખ અને સંતુલિત પિયત ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Pepper_Bacterial_spot": { name: "કેપ્સિકમ - બેક્ટેરિયલ ડાઘ રોગ", cause: "બેક્ટેરિયા સંક્રમણ પાણીના છાંટા દ્વારા ફેલાય છે.", precautions: "રોગમુક્ત બીજ વાપરો, ઉપરથી પાણી ન આપો.", remedy: "કોપર આધારિત બેક્ટેરિયાનાશક વાપરો." },
        "Strawberry_healthy": { name: "સ્ટ્રોબેરી - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત પિયત અને મલ્ચિંગ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Strawberry_Leaf_scorch": { name: "સ્ટ્રોબેરી - પાન સુકારો", cause: "ફૂગ સંક્રમણને કારણે પાંદડા પર જાંબલી-ભૂરા ડાઘ પડે છે.", precautions: "સંક્રમિત પાંદડા દૂર કરો, છોડ વચ્ચે યોગ્ય અંતર રાખો.", remedy: "ફૂગનાશક છાંટો, જૂના પાંદડા સમયસર દૂર કરો." },
        "Cherry_healthy": { name: "ચેરી - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Cherry_Powdery_mildew": { name: "ચેરી - પાવડરી માઇલ્ડ્યુ", cause: "ફૂગ સંક્રમણને કારણે પાંદડા પર સફેદ પાવડર જેવું પડ પડે છે.", precautions: "છોડ વચ્ચે હવાની અવરજવર જાળવો, વધુ નાઇટ્રોજન ખાતર ટાળો.", remedy: "સલ્ફર આધારિત ફૂગનાશક છાંટો." },
        "Peach_healthy": { name: "પીચ - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Peach_Bacterial_spot": { name: "પીચ - બેક્ટેરિયલ ડાઘ રોગ", cause: "બેક્ટેરિયા સંક્રમણને કારણે પાંદડા અને ફળો પર નાના ઘેરા ડાઘ પડે છે.", precautions: "પ્રતિરોધક જાતો વાવો, ઉપરથી પાણી આપવાનું ટાળો.", remedy: "કોપર આધારિત બેક્ટેરિયાનાશક છાંટો." },
        "Soybean_healthy": { name: "સોયાબીન - સ્વસ્થ", cause: "કોઈ રોગ મળ્યો નથી.", precautions: "નિયમિત દેખરેખ ચાલુ રાખો.", remedy: "સારવારની જરૂર નથી." },
        "Squash_Powdery_mildew": { name: "સ્ક્વોશ - પાવડરી માઇલ્ડ્યુ", cause: "ફૂગ સંક્રમણને કારણે પાંદડા પર સફેદ પાવડર જેવું પડ પડે છે.", precautions: "છોડ વચ્ચે પૂરતું અંતર રાખો, વધુ ભેજ ટાળો.", remedy: "સલ્ફર અથવા પોટેશિયમ બાયકાર્બોનેટ આધારિત ફૂગનાશક વાપરો." }
    },
    kannada: {
        "Tomato_healthy": { name: "ಟೊಮ್ಯಾಟೊ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ನೀರಾವರಿ, ಸಮತೋಲಿತ ಗೊಬ್ಬರ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Tomato_Early_blight": { name: "ಟೊಮ್ಯಾಟೊ - ಆರಂಭಿಕ ಎಲೆ ಅಂಗಮಾರಿ", cause: "ಆಲ್ಟರ್ನೇರಿಯಾ ಶಿಲೀಂಧ್ರದಿಂದ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಮೇಲಿನಿಂದ ನೀರು ಹಾಕಬೇಡಿ, ಸಸ್ಯಗಳ ನಡುವೆ ಅಂತರವಿರಲಿ.", remedy: "ಪ್ರತಿ 7-10 ದಿನಗಳಿಗೊಮ್ಮೆ ತಾಮ್ರ ಆಧಾರಿತ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ." },
        "Tomato_Late_blight": { name: "ಟೊಮ್ಯಾಟೊ - ತಡವಾದ ಎಲೆ ಅಂಗಮಾರಿ", cause: "ಫೈಟೊಫ್ಥೊರಾ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗುತ್ತದೆ, ತೇವ ವಾತಾವರಣದಲ್ಲಿ ವೇಗವಾಗಿ ಹರಡುತ್ತದೆ.", precautions: "ಸೋಂಕಿತ ಸಸ್ಯಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ, ಒದ್ದೆ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಕ್ಲೋರೋಥಲೋನಿಲ್ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ತಡೆಗಟ್ಟುವಿಕೆಯಾಗಿ ಸಿಂಪಡಿಸಿ." },
        "Tomato_Septoria_leaf_spot": { name: "ಟೊಮ್ಯಾಟೊ - ಸೆಪ್ಟೋರಿಯಾ ಎಲೆ ಚುಕ್ಕೆ", cause: "ಸೆಪ್ಟೋರಿಯಾ ಶಿಲೀಂಧ್ರದಿಂದ ಎಲೆಗಳ ಮೇಲೆ ಸಣ್ಣ ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ಬೆಳೆ ಸರದಿ ಅನುಸರಿಸಿ, ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಮೇಲಿನಿಂದ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ಕ್ಲೋರೋಥಲೋನಿಲ್ ಆಧಾರಿತ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ." },
        "Potato_healthy": { name: "ಆಲೂಗಡ್ಡೆ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಸರಿಯಾದ ನೀರಾವರಿಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Potato_Late_blight": { name: "ಆಲೂಗಡ್ಡೆ - ತಡವಾದ ಎಲೆ ಅಂಗಮಾರಿ", cause: "ಫೈಟೊಫ್ಥೊರಾ ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗುತ್ತದೆ, ತಂಪಾದ ತೇವ ವಾತಾವರಣದಲ್ಲಿ ವೇಗವಾಗಿ ಹರಡುತ್ತದೆ.", precautions: "ಹೊಲದ ನೀರು ಬಸಿಯುವಿಕೆಯನ್ನು ಸುಧಾರಿಸಿ, ದಟ್ಟವಾದ ನಾಟಿಯನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ, ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ." },
        "Corn_healthy": { name: "ಜೋಳ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ಸಾಮಾನ್ಯ ಆರೈಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Corn_Common_rust": { name: "ಜೋಳ - ಸಾಮಾನ್ಯ ತುಕ್ಕು ರೋಗ", cause: "ಪಕ್ಸಿನಿಯಾ ಶಿಲೀಂಧ್ರ ಗಾಳಿಯ ಮೂಲಕ ಹರಡುತ್ತದೆ.", precautions: "ತುಕ್ಕು ನಿರೋಧಕ ತಳಿಗಳನ್ನು ನೆಡಿ, ಹೆಚ್ಚು ನೈಟ್ರೋಜನ್ ಗೊಬ್ಬರವನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ತೀವ್ರತೆ ಹೆಚ್ಚಿದ್ದರೆ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ." },
        "Corn_Northern_Leaf_Blight": { name: "ಜೋಳ - ಉತ್ತರ ಎಲೆ ಅಂಗಮಾರಿ", cause: "ಎಕ್ಸೆರೋಹಿಲಮ್ ಶಿಲೀಂಧ್ರ ತೇವ ವಾತಾವರಣದಲ್ಲಿ ಹರಡುತ್ತದೆ.", precautions: "ಬೆಳೆ ಸರದಿ ಅನುಸರಿಸಿ, ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.", remedy: "ಆರಂಭಿಕ ಲಕ್ಷಣಗಳಲ್ಲಿ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ." },
        "Grape_healthy": { name: "ದ್ರಾಕ್ಷಿ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಕತ್ತರಿಸುವಿಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Grape_Black_rot": { name: "ದ್ರಾಕ್ಷಿ - ಕಪ್ಪು ಕೊಳೆ ರೋಗ", cause: "ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನಿಂದ ಹಣ್ಣುಗಳು ಮತ್ತು ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ಹಳೆಯ ಹಣ್ಣುಗಳು ಮತ್ತು ಉದುರಿದ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಗಾಳಿ ಸಂಚಾರಕ್ಕಾಗಿ ಕತ್ತರಿಸಿ.", remedy: "ಋತುವಿನ ಆರಂಭದಲ್ಲೇ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ." },
        "Grape_Esca": { name: "ದ್ರಾಕ್ಷಿ - ಎಸ್ಕಾ ರೋಗ", cause: "ಕತ್ತರಿಸುವ ಗಾಯಗಳ ಮೂಲಕ ಶಿಲೀಂಧ್ರ ಸೋಂಕು ಉಂಟಾಗುತ್ತದೆ.", precautions: "ಒಣ ವಾತಾವರಣದಲ್ಲಿ ಕತ್ತರಿಸಿ, ಉಪಕರಣಗಳನ್ನು ಸೋಂಕುರಹಿತಗೊಳಿಸಿ.", remedy: "ಸಂಪೂರ್ಣ ಚಿಕಿತ್ಸೆ ಇಲ್ಲ, ತೀವ್ರವಾಗಿ ಸೋಂಕಿತ ಬಳ್ಳಿಗಳನ್ನು ತೆಗೆದುಹಾಕಿ." },
        "Apple_healthy": { name: "ಸೇಬು - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ಸಾಮಾನ್ಯ ಆರೈಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Apple_scab": { name: "ಸೇಬು - ಸ್ಕ್ಯಾಬ್ ರೋಗ", cause: "ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನಿಂದ ಎಲೆಗಳು ಮತ್ತು ಹಣ್ಣುಗಳ ಮೇಲೆ ಕಪ್ಪು-ಕಂದು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ಶರತ್ಕಾಲದಲ್ಲಿ ಉದುರಿದ ಎಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ ನಾಶಪಡಿಸಿ.", remedy: "ಮೊಗ್ಗು ಬಿಡಿಸುವಿಕೆಯಿಂದ ಬೇಸಿಗೆಯ ಆರಂಭದವರೆಗೆ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ." },
        "Pepper_healthy": { name: "ದೊಣ್ಣೆ ಮೆಣಸಿನಕಾಯಿ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಸಮತೋಲಿತ ನೀರಾವರಿಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Pepper_Bacterial_spot": { name: "ದೊಣ್ಣೆ ಮೆಣಸಿನಕಾಯಿ - ಬ್ಯಾಕ್ಟೀರಿಯಾ ಚುಕ್ಕೆ ರೋಗ", cause: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕು ನೀರಿನ ಸಿಂಪಡಣೆಯ ಮೂಲಕ ಹರಡುತ್ತದೆ.", precautions: "ರೋಗ ಮುಕ್ತ ಬೀಜಗಳನ್ನು ಬಳಸಿ, ಮೇಲಿನಿಂದ ನೀರು ಹಾಕಬೇಡಿ.", remedy: "ತಾಮ್ರ ಆಧಾರಿತ ಬ್ಯಾಕ್ಟೀರಿಯಾನಾಶಕವನ್ನು ಬಳಸಿ." },
        "Strawberry_healthy": { name: "ಸ್ಟ್ರಾಬೆರಿ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ನೀರಾವರಿ ಮತ್ತು ಮಲ್ಚಿಂಗ್ ಅನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Strawberry_Leaf_scorch": { name: "ಸ್ಟ್ರಾಬೆರಿ - ಎಲೆ ಸುಡುವಿಕೆ", cause: "ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನಿಂದ ಎಲೆಗಳ ಮೇಲೆ ನೇರಳೆ-ಕಂದು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಸಸ್ಯಗಳ ನಡುವೆ ಸೂಕ್ತ ಅಂತರವಿರಲಿ.", remedy: "ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ, ಹಳೆಯ ಎಲೆಗಳನ್ನು ಸಕಾಲದಲ್ಲಿ ತೆಗೆದುಹಾಕಿ." },
        "Cherry_healthy": { name: "ಚೆರ್ರಿ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Cherry_Powdery_mildew": { name: "ಚೆರ್ರಿ - ಪೌಡರಿ ಮಿಲ್ಡ್ಯೂ", cause: "ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನಿಂದ ಎಲೆಗಳ ಮೇಲೆ ಬಿಳಿ ಪುಡಿಯಂತಹ ಪದರ ಕಾಣಿಸುತ್ತದೆ.", precautions: "ಸಸ್ಯಗಳ ನಡುವೆ ಗಾಳಿ ಸಂಚಾರವಿರಲಿ, ಹೆಚ್ಚು ನೈಟ್ರೋಜನ್ ಗೊಬ್ಬರವನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ಸಲ್ಫರ್ ಆಧಾರಿತ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ." },
        "Peach_healthy": { name: "ಪೀಚ್ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Peach_Bacterial_spot": { name: "ಪೀಚ್ - ಬ್ಯಾಕ್ಟೀರಿಯಾ ಚುಕ್ಕೆ ರೋಗ", cause: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕಿನಿಂದ ಎಲೆಗಳು ಮತ್ತು ಹಣ್ಣುಗಳ ಮೇಲೆ ಸಣ್ಣ ಗಾಢ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.", precautions: "ನಿರೋಧಕ ತಳಿಗಳನ್ನು ನೆಡಿ, ಮೇಲಿನಿಂದ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ತಾಮ್ರ ಆಧಾರಿತ ಬ್ಯಾಕ್ಟೀರಿಯಾನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ." },
        "Soybean_healthy": { name: "ಸೋಯಾಬೀನ್ - ಆರೋಗ್ಯಕರ", cause: "ಯಾವುದೇ ರೋಗ ಕಂಡುಬಂದಿಲ್ಲ.", precautions: "ನಿಯಮಿತ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.", remedy: "ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ." },
        "Squash_Powdery_mildew": { name: "ಸ್ಕ್ವಾಷ್ - ಪೌಡರಿ ಮಿಲ್ಡ್ಯೂ", cause: "ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನಿಂದ ಎಲೆಗಳ ಮೇಲೆ ಬಿಳಿ ಪುಡಿಯಂತಹ ಪದರ ಕಾಣಿಸುತ್ತದೆ.", precautions: "ಸಸ್ಯಗಳ ನಡುವೆ ಸಾಕಷ್ಟು ಅಂತರವಿರಲಿ, ಹೆಚ್ಚು ತೇವಾಂಶವನ್ನು ತಪ್ಪಿಸಿ.", remedy: "ಸಲ್ಫರ್ ಅಥವಾ ಪೊಟ್ಯಾಸಿಯಮ್ ಬೈಕಾರ್ಬೊನೇಟ್ ಆಧಾರಿತ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ." }
    }, malayalam: {
        "Tomato_healthy": { name: "തക്കാളി - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നനയ്ക്കൽ, സമീകൃത വളപ്രയോഗം, നിരീക്ഷണം എന്നിവ തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Tomato_Early_blight": { name: "തക്കാളി - നേരത്തെയുള്ള ഇലപ്പുള്ളി രോഗം", cause: "ആൾട്ടർനേറിയ ഫംഗസ് മൂലം ഇലകളിൽ തവിട്ട് പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "രോഗബാധിത ഇലകൾ നീക്കം ചെയ്യുക, മുകളിൽ നിന്ന് വെള്ളം ഒഴിക്കരുത്, ചെടികൾ തമ്മിൽ അകലം പാലിക്കുക.", remedy: "7-10 ദിവസത്തിലൊരിക്കൽ ചെമ്പ് അധിഷ്ഠിത കുമിൾനാശിനി തളിക്കുക." },
        "Tomato_Late_blight": { name: "തക്കാളി - വൈകിയുള്ള ഇലപ്പുള്ളി രോഗം", cause: "ഫൈറ്റോഫ്തോറ ഫംഗസ് മൂലം ഉണ്ടാകുന്നു, ഈർപ്പമുള്ള കാലാവസ്ഥയിൽ വേഗത്തിൽ പടരുന്നു.", precautions: "രോഗബാധിത ചെടികൾ ഉടൻ നീക്കം ചെയ്യുക, നനഞ്ഞ വയലിൽ പണിയെടുക്കുന്നത് ഒഴിവാക്കുക.", remedy: "മാങ്കോസെബ് അല്ലെങ്കിൽ ക്ലോറോതലോനിൽ കുമിൾനാശിനി മുൻകരുതലായി തളിക്കുക." },
        "Tomato_Septoria_leaf_spot": { name: "തക്കാളി - സെപ്റ്റോറിയ ഇലപ്പുള്ളി", cause: "സെപ്റ്റോറിയ ഫംഗസ് മൂലം ഇലകളിൽ ചെറിയ വൃത്താകൃതിയിലുള്ള പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "വിള പര്യായം പാലിക്കുക, രോഗബാധിത ഇലകൾ നീക്കം ചെയ്യുക, മുകളിൽ നിന്ന് വെള്ളം ഒഴിക്കുന്നത് ഒഴിവാക്കുക.", remedy: "ക്ലോറോതലോനിൽ അധിഷ്ഠിത കുമിൾനാശിനി ഉപയോഗിക്കുക." },
        "Potato_healthy": { name: "ഉരുളക്കിഴങ്ങ് - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നിരീക്ഷണവും ശരിയായ നനയ്ക്കലും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Potato_Late_blight": { name: "ഉരുളക്കിഴങ്ങ് - വൈകിയുള്ള ഇലപ്പുള്ളി രോഗം", cause: "ഫൈറ്റോഫ്തോറ ഫംഗസ് മൂലം ഉണ്ടാകുന്നു, തണുത്ത ഈർപ്പമുള്ള കാലാവസ്ഥയിൽ വേഗത്തിൽ പടരുന്നു.", precautions: "വയലിലെ ജലനിർഗമനം മെച്ചപ്പെടുത്തുക, ഇടതൂർന്ന നടീൽ ഒഴിവാക്കുക.", remedy: "രോഗബാധിത ഇലകൾ ഉടൻ നീക്കം ചെയ്യുക, മാങ്കോസെബ് കുമിൾനാശിനി ഉപയോഗിക്കുക." },
        "Corn_healthy": { name: "ചോളം - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സാധാരണ പരിചരണവും നിരീക്ഷണവും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Corn_Common_rust": { name: "ചോളം - സാധാരണ തുരുമ്പ് രോഗം", cause: "പക്സീനിയ ഫംഗസ് കാറ്റ് വഴി പടരുന്നു.", precautions: "തുരുമ്പ് പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക, അധിക നൈട്രജൻ വളം ഒഴിവാക്കുക.", remedy: "തീവ്രത കൂടുതലാണെങ്കിൽ കുമിൾനാശിനി തളിക്കുക." },
        "Corn_Northern_Leaf_Blight": { name: "ചോളം - വടക്കൻ ഇലപ്പുള്ളി രോഗം", cause: "എക്സെറോഹൈലം ഫംഗസ് ഈർപ്പമുള്ള കാലാവസ്ഥയിൽ പടരുന്നു.", precautions: "വിള പര്യായം പാലിക്കുക, പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക.", remedy: "ആദ്യ ലക്ഷണങ്ങളിൽ കുമിൾനാശിനി ഉപയോഗിക്കുക." },
        "Grape_healthy": { name: "മുന്തിരി - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ കത്രിക്കലും നിരീക്ഷണവും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Grape_Black_rot": { name: "മുന്തിരി - കറുത്ത ചീയൽ രോഗം", cause: "കുമിൾ ബാധ മൂലം പഴങ്ങളിലും ഇലകളിലും കറുത്ത പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "പഴയ പഴങ്ങളും വീണ ഇലകളും നീക്കം ചെയ്യുക, വായുസഞ്ചാരത്തിനായി കത്രിക്കുക.", remedy: "സീസണിന്റെ തുടക്കത്തിൽ തന്നെ കുമിൾനാശിനി ഉപയോഗിക്കുക." },
        "Grape_Esca": { name: "മുന്തിരി - എസ്‌ക രോഗം", cause: "കത്രിക്കലിലെ മുറിവുകളിലൂടെ കുമിൾ ബാധ ഉണ്ടാകുന്നു.", precautions: "വരണ്ട കാലാവസ്ഥയിൽ കത്രിക്കുക, ഉപകരണങ്ങൾ അണുവിമുക്തമാക്കുക.", remedy: "പൂർണ്ണ ചികിത്സയില്ല, ഗുരുതരമായി ബാധിച്ച വള്ളികൾ നീക്കം ചെയ്യുക." },
        "Apple_healthy": { name: "ആപ്പിൾ - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സാധാരണ പരിചരണവും നിരീക്ഷണവും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Apple_scab": { name: "ആപ്പിൾ - സ്കാബ് രോഗം", cause: "കുമിൾ ബാധ മൂലം ഇലകളിലും പഴങ്ങളിലും കറുപ്പ്-തവിട്ട് പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "ശരത്കാലത്ത് വീണ ഇലകൾ ശേഖരിച്ച് നശിപ്പിക്കുക.", remedy: "മുകുളം വിരിയുന്നത് മുതൽ വേനൽക്കാലത്തിന്റെ തുടക്കം വരെ കുമിൾനാശിനി തളിക്കുക." },
        "Pepper_healthy": { name: "കാപ്സിക്കം - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നിരീക്ഷണവും സമീകൃത നനയ്ക്കലും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Pepper_Bacterial_spot": { name: "കാപ്സിക്കം - ബാക്ടീരിയൽ പുള്ളി രോഗം", cause: "ബാക്ടീരിയ ബാധ ജലത്തുള്ളികൾ വഴി പടരുന്നു.", precautions: "രോഗരഹിത വിത്തുകൾ ഉപയോഗിക്കുക, മുകളിൽ നിന്ന് വെള്ളം ഒഴിക്കരുത്.", remedy: "ചെമ്പ് അധിഷ്ഠിത ബാക്ടീരിയനാശിനി ഉപയോഗിക്കുക." },
        "Strawberry_healthy": { name: "സ്ട്രോബെറി - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നനയ്ക്കലും പുതയിടലും തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Strawberry_Leaf_scorch": { name: "സ്ട്രോബെറി - ഇല കരിച്ചിൽ രോഗം", cause: "കുമിൾ ബാധ മൂലം ഇലകളിൽ ധൂമ്ര-തവിട്ട് പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "രോഗബാധിത ഇലകൾ നീക്കം ചെയ്യുക, ചെടികൾ തമ്മിൽ ശരിയായ അകലം പാലിക്കുക.", remedy: "കുമിൾനാശിനി തളിക്കുക, പഴയ ഇലകൾ സമയബന്ധിതമായി നീക്കം ചെയ്യുക." },
        "Cherry_healthy": { name: "ചെറി - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നിരീക്ഷണം തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Cherry_Powdery_mildew": { name: "ചെറി - പൊടിപൂപ്പ് രോഗം", cause: "കുമിൾ ബാധ മൂലം ഇലകളിൽ വെളുത്ത പൊടി പോലുള്ള പാളി ഉണ്ടാകുന്നു.", precautions: "ചെടികൾ തമ്മിൽ വായുസഞ്ചാരം നിലനിർത്തുക, അധിക നൈട്രജൻ വളം ഒഴിവാക്കുക.", remedy: "സൾഫർ അധിഷ്ഠിത കുമിൾനാശിനി തളിക്കുക." },
        "Peach_healthy": { name: "പീച്ച് - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നിരീക്ഷണം തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Peach_Bacterial_spot": { name: "പീച്ച് - ബാക്ടീരിയൽ പുള്ളി രോഗം", cause: "ബാക്ടീരിയ ബാധ മൂലം ഇലകളിലും പഴങ്ങളിലും ചെറിയ കടും പാടുകൾ ഉണ്ടാകുന്നു.", precautions: "പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക, മുകളിൽ നിന്ന് വെള്ളം ഒഴിക്കുന്നത് ഒഴിവാക്കുക.", remedy: "ചെമ്പ് അധിഷ്ഠിത ബാക്ടീരിയനാശിനി തളിക്കുക." },
        "Soybean_healthy": { name: "സോയാബീൻ - ആരോഗ്യമുള്ളത്", cause: "രോഗം ഒന്നും കണ്ടെത്തിയില്ല.", precautions: "സ്ഥിരമായ നിരീക്ഷണം തുടരുക.", remedy: "ചികിത്സ ആവശ്യമില്ല." },
        "Squash_Powdery_mildew": { name: "സ്ക്വാഷ് - പൊടിപൂപ്പ് രോഗം", cause: "കുമിൾ ബാധ മൂലം ഇലകളിൽ വെളുത്ത പൊടി പോലുള്ള പാളി ഉണ്ടാകുന്നു.", precautions: "ചെടികൾ തമ്മിൽ മതിയായ അകലം പാലിക്കുക, അധിക ഈർപ്പം ഒഴിവാക്കുക.", remedy: "സൾഫർ അല്ലെങ്കിൽ പൊട്ടാസ്യം ബൈകാർബണേറ്റ് അധിഷ്ഠിത കുമിൾനാശിനി ഉപയോഗിക്കുക." }
    },
    punjabi: {
        "Tomato_healthy": { name: "ਟਮਾਟਰ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਸਿੰਚਾਈ, ਸੰਤੁਲਿਤ ਖਾਦ ਅਤੇ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Tomato_Early_blight": { name: "ਟਮਾਟਰ - ਅਗੇਤੀ ਝੁਲਸ ਰੋਗ", cause: "ਅਲਟਰਨੇਰੀਆ ਉੱਲੀ ਕਾਰਨ ਪੱਤਿਆਂ 'ਤੇ ਭੂਰੇ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ, ਉੱਪਰੋਂ ਪਾਣੀ ਨਾ ਦਿਓ, ਪੌਦਿਆਂ ਵਿਚਕਾਰ ਦੂਰੀ ਰੱਖੋ।", remedy: "ਹਰ 7-10 ਦਿਨਾਂ 'ਚ ਤਾਂਬਾ ਆਧਾਰਿਤ ਉੱਲੀਨਾਸ਼ਕ ਛਿੜਕੋ।" },
        "Tomato_Late_blight": { name: "ਟਮਾਟਰ - ਪਿਛੇਤੀ ਝੁਲਸ ਰੋਗ", cause: "ਫਾਈਟੋਫਥੋਰਾ ਉੱਲੀ ਕਾਰਨ ਹੁੰਦਾ ਹੈ, ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲਦਾ ਹੈ।", precautions: "ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਤੁਰੰਤ ਹਟਾਓ, ਗਿੱਲੇ ਖੇਤ ਵਿੱਚ ਕੰਮ ਕਰਨ ਤੋਂ ਬਚੋ।", remedy: "ਮੈਨਕੋਜ਼ੇਬ ਜਾਂ ਕਲੋਰੋਥੈਲੋਨਿਲ ਉੱਲੀਨਾਸ਼ਕ ਰੋਕਥਾਮ ਵਜੋਂ ਛਿੜਕੋ।" },
        "Tomato_Septoria_leaf_spot": { name: "ਟਮਾਟਰ - ਸੈਪਟੋਰੀਆ ਪੱਤਾ ਧੱਬਾ", cause: "ਸੈਪਟੋਰੀਆ ਉੱਲੀ ਕਾਰਨ ਪੱਤਿਆਂ 'ਤੇ ਛੋਟੇ ਗੋਲ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ, ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ, ਉੱਪਰੋਂ ਪਾਣੀ ਦੇਣ ਤੋਂ ਬਚੋ।", remedy: "ਕਲੋਰੋਥੈਲੋਨਿਲ ਆਧਾਰਿਤ ਉੱਲੀਨਾਸ਼ਕ ਵਰਤੋ।" },
        "Potato_healthy": { name: "ਆਲੂ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਅਤੇ ਸਹੀ ਸਿੰਚਾਈ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Potato_Late_blight": { name: "ਆਲੂ - ਪਿਛੇਤੀ ਝੁਲਸ ਰੋਗ", cause: "ਫਾਈਟੋਫਥੋਰਾ ਉੱਲੀ ਕਾਰਨ ਹੁੰਦਾ ਹੈ, ਠੰਢੇ ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲਦਾ ਹੈ।", precautions: "ਖੇਤ ਦੀ ਨਿਕਾਸੀ ਸੁਧਾਰੋ, ਸੰਘਣੀ ਬਿਜਾਈ ਤੋਂ ਬਚੋ।", remedy: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਤੁਰੰਤ ਹਟਾਓ, ਮੈਨਕੋਜ਼ੇਬ ਉੱਲੀਨਾਸ਼ਕ ਵਰਤੋ।" },
        "Corn_healthy": { name: "ਮੱਕੀ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਆਮ ਦੇਖਭਾਲ ਅਤੇ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Corn_Common_rust": { name: "ਮੱਕੀ - ਆਮ ਜੰਗਾਲ ਰੋਗ", cause: "ਪਕਸੀਨੀਆ ਉੱਲੀ ਹਵਾ ਰਾਹੀਂ ਫੈਲਦੀ ਹੈ।", precautions: "ਜੰਗਾਲ ਰੋਧਕ ਕਿਸਮਾਂ ਬੀਜੋ, ਜ਼ਿਆਦਾ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਤੋਂ ਬਚੋ।", remedy: "ਤੀਬਰਤਾ ਵੱਧ ਹੋਣ 'ਤੇ ਉੱਲੀਨਾਸ਼ਕ ਛਿੜਕੋ।" },
        "Corn_Northern_Leaf_Blight": { name: "ਮੱਕੀ - ਉੱਤਰੀ ਪੱਤਾ ਝੁਲਸ ਰੋਗ", cause: "ਐਕਸੇਰੋਹਿਲਮ ਉੱਲੀ ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਫੈਲਦੀ ਹੈ।", precautions: "ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ, ਰੋਧਕ ਕਿਸਮਾਂ ਚੁਣੋ।", remedy: "ਸ਼ੁਰੂਆਤੀ ਲੱਛਣਾਂ 'ਤੇ ਉੱਲੀਨਾਸ਼ਕ ਵਰਤੋ।" },
        "Grape_healthy": { name: "ਅੰਗੂਰ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਕਾਂਟ-ਛਾਂਟ ਅਤੇ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Grape_Black_rot": { name: "ਅੰਗੂਰ - ਕਾਲਾ ਗਲਣ ਰੋਗ", cause: "ਉੱਲੀ ਦੀ ਲਾਗ ਕਾਰਨ ਫਲਾਂ ਅਤੇ ਪੱਤਿਆਂ 'ਤੇ ਕਾਲੇ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਪੁਰਾਣੇ ਫਲ ਅਤੇ ਡਿੱਗੇ ਪੱਤੇ ਹਟਾਓ, ਹਵਾ ਲਈ ਕਾਂਟ-ਛਾਂਟ ਕਰੋ।", remedy: "ਮੌਸਮ ਦੀ ਸ਼ੁਰੂਆਤ 'ਚ ਹੀ ਉੱਲੀਨਾਸ਼ਕ ਵਰਤੋ।" },
        "Grape_Esca": { name: "ਅੰਗੂਰ - ਐਸਕਾ ਰੋਗ", cause: "ਕਾਂਟ-ਛਾਂਟ ਦੇ ਜ਼ਖ਼ਮਾਂ ਰਾਹੀਂ ਉੱਲੀ ਦੀ ਲਾਗ ਹੁੰਦੀ ਹੈ।", precautions: "ਖੁਸ਼ਕ ਮੌਸਮ ਵਿੱਚ ਕਾਂਟ-ਛਾਂਟ ਕਰੋ, ਔਜ਼ਾਰ ਰੋਗਾਣੂ-ਮੁਕਤ ਕਰੋ।", remedy: "ਪੂਰਾ ਇਲਾਜ ਨਹੀਂ, ਗੰਭੀਰ ਪ੍ਰਭਾਵਿਤ ਵੇਲਾਂ ਹਟਾਓ।" },
        "Apple_healthy": { name: "ਸੇਬ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਆਮ ਦੇਖਭਾਲ ਅਤੇ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Apple_scab": { name: "ਸੇਬ - ਸਕੈਬ ਰੋਗ", cause: "ਉੱਲੀ ਦੀ ਲਾਗ ਕਾਰਨ ਪੱਤਿਆਂ ਅਤੇ ਫਲਾਂ 'ਤੇ ਕਾਲੇ-ਭੂਰੇ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਪਤਝੜ ਵਿੱਚ ਡਿੱਗੇ ਪੱਤੇ ਇਕੱਠੇ ਕਰਕੇ ਨਸ਼ਟ ਕਰੋ।", remedy: "ਕਲੀ ਖੁੱਲ੍ਹਣ ਤੋਂ ਗਰਮੀਆਂ ਦੀ ਸ਼ੁਰੂਆਤ ਤੱਕ ਉੱਲੀਨਾਸ਼ਕ ਛਿੜਕੋ।" },
        "Pepper_healthy": { name: "ਸ਼ਿਮਲਾ ਮਿਰਚ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਅਤੇ ਸੰਤੁਲਿਤ ਸਿੰਚਾਈ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Pepper_Bacterial_spot": { name: "ਸ਼ਿਮਲਾ ਮਿਰਚ - ਬੈਕਟੀਰੀਆ ਧੱਬਾ ਰੋਗ", cause: "ਬੈਕਟੀਰੀਆ ਦੀ ਲਾਗ ਪਾਣੀ ਦੀਆਂ ਬੂੰਦਾਂ ਰਾਹੀਂ ਫੈਲਦੀ ਹੈ।", precautions: "ਰੋਗ ਮੁਕਤ ਬੀਜ ਵਰਤੋ, ਉੱਪਰੋਂ ਪਾਣੀ ਨਾ ਦਿਓ।", remedy: "ਤਾਂਬਾ ਆਧਾਰਿਤ ਬੈਕਟੀਰੀਆਨਾਸ਼ਕ ਵਰਤੋ।" },
        "Strawberry_healthy": { name: "ਸਟ੍ਰਾਬੇਰੀ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਸਿੰਚਾਈ ਅਤੇ ਮਲਚਿੰਗ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Strawberry_Leaf_scorch": { name: "ਸਟ੍ਰਾਬੇਰੀ - ਪੱਤਾ ਝੁਲਸ ਰੋਗ", cause: "ਉੱਲੀ ਦੀ ਲਾਗ ਕਾਰਨ ਪੱਤਿਆਂ 'ਤੇ ਜਾਮਨੀ-ਭੂਰੇ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ, ਪੌਦਿਆਂ ਵਿਚਕਾਰ ਸਹੀ ਦੂਰੀ ਰੱਖੋ।", remedy: "ਉੱਲੀਨਾਸ਼ਕ ਛਿੜਕੋ, ਪੁਰਾਣੇ ਪੱਤੇ ਸਮੇਂ ਸਿਰ ਹਟਾਓ।" },
        "Cherry_healthy": { name: "ਚੈਰੀ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Cherry_Powdery_mildew": { name: "ਚੈਰੀ - ਪਾਊਡਰੀ ਫ਼ਫ਼ੂੰਦੀ", cause: "ਉੱਲੀ ਦੀ ਲਾਗ ਕਾਰਨ ਪੱਤਿਆਂ 'ਤੇ ਚਿੱਟੀ ਪਾਊਡਰ ਵਰਗੀ ਪਰਤ ਬਣਦੀ ਹੈ।", precautions: "ਪੌਦਿਆਂ ਵਿਚਕਾਰ ਹਵਾ ਦਾ ਪ੍ਰਵਾਹ ਰੱਖੋ, ਜ਼ਿਆਦਾ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਤੋਂ ਬਚੋ।", remedy: "ਗੰਧਕ ਆਧਾਰਿਤ ਉੱਲੀਨਾਸ਼ਕ ਛਿੜਕੋ।" },
        "Peach_healthy": { name: "ਆੜੂ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Peach_Bacterial_spot": { name: "ਆੜੂ - ਬੈਕਟੀਰੀਆ ਧੱਬਾ ਰੋਗ", cause: "ਬੈਕਟੀਰੀਆ ਦੀ ਲਾਗ ਕਾਰਨ ਪੱਤਿਆਂ ਅਤੇ ਫਲਾਂ 'ਤੇ ਛੋਟੇ ਗੂੜ੍ਹੇ ਧੱਬੇ ਬਣਦੇ ਹਨ।", precautions: "ਰੋਧਕ ਕਿਸਮਾਂ ਬੀਜੋ, ਉੱਪਰੋਂ ਪਾਣੀ ਦੇਣ ਤੋਂ ਬਚੋ।", remedy: "ਤਾਂਬਾ ਆਧਾਰਿਤ ਬੈਕਟੀਰੀਆਨਾਸ਼ਕ ਛਿੜਕੋ।" },
        "Soybean_healthy": { name: "ਸੋਇਆਬੀਨ - ਸਿਹਤਮੰਦ", cause: "ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ ਮਿਲੀ।", precautions: "ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।", remedy: "ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ।" },
        "Squash_Powdery_mildew": { name: "ਸਕੁਐਸ਼ - ਪਾਊਡਰੀ ਫ਼ਫ਼ੂੰਦੀ", cause: "ਉੱਲੀ ਦੀ ਲਾਗ ਕਾਰਨ ਪੱਤਿਆਂ 'ਤੇ ਚਿੱਟੀ ਪਾਊਡਰ ਵਰਗੀ ਪਰਤ ਬਣਦੀ ਹੈ।", precautions: "ਪੌਦਿਆਂ ਵਿਚਕਾਰ ਲੋੜੀਂਦੀ ਦੂਰੀ ਰੱਖੋ, ਜ਼ਿਆਦਾ ਨਮੀ ਤੋਂ ਬਚੋ।", remedy: "ਗੰਧਕ ਜਾਂ ਪੋਟਾਸ਼ੀਅਮ ਬਾਈਕਾਰਬੋਨੇਟ ਆਧਾਰਿਤ ਉੱਲੀਨਾਸ਼ਕ ਵਰਤੋ।" }
    }, bengali: {
        "Tomato_healthy": { name: "টমেটো - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত সেচ, সুষম সার এবং পর্যবেক্ষণ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Tomato_Early_blight": { name: "টমেটো - প্রারম্ভিক ব্লাইট", cause: "অল্টারনারিয়া ছত্রাকের কারণে পাতায় বাদামি দাগ পড়ে, উষ্ণ ও আর্দ্র আবহাওয়ায় ছড়ায়।", precautions: "গাছের মধ্যে ফাঁকা রাখুন, শুধু গোড়ায় জল দিন, প্রতি মৌসুমে ফসল পরিবর্তন করুন।", remedy: "সংক্রমিত নিচের পাতা সরিয়ে ফেলুন, প্রতি ৭-১০ দিনে তামা-ভিত্তিক ছত্রাকনাশক স্প্রে করুন।" },
        "Tomato_Late_blight": { name: "টমেটো - বিলম্বিত ব্লাইট", cause: "ফাইটোফথোরা ছত্রাকের কারণে হয়, ঠান্ডা ও ভেজা আবহাওয়ায় দ্রুত ছড়ায়।", precautions: "উপর থেকে জল দেওয়া এড়িয়ে চলুন, নিকাশি ভালো রাখুন, আশেপাশের আলু/টমেটো গাছ সরান।", remedy: "সংক্রমিত গাছ অবিলম্বে ধ্বংস করুন, আর্দ্র আবহাওয়ায় প্রতিরোধমূলক ছত্রাকনাশক প্রয়োগ করুন।" },
        "Tomato_Septoria_leaf_spot": { name: "টমেটো - সেপ্টোরিয়া পাতার দাগ", cause: "সেপ্টোরিয়া ছত্রাকের সংক্রমণ, আর্দ্র অবস্থায় জলের ছিটা দিয়ে ছড়ায়।", precautions: "গোড়ায় মালচ দিন, পাতা ভেজা থাকলে গাছের কাছে কাজ করবেন না।", remedy: "আক্রান্ত পাতা সরিয়ে ফেলুন, ছত্রাকনাশক প্রয়োগ করুন, বাতাস চলাচল বাড়ান।" },
        "Potato_healthy": { name: "আলু - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত পর্যবেক্ষণ ও সঠিক সেচ বজায় রাখুন।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Potato_Late_blight": { name: "আলু - বিলম্বিত ব্লাইট", cause: "ফাইটোফথোরা ছত্রাকের কারণে হয়, ঠান্ডা ভেজা আবহাওয়ায় দ্রুত ছড়ায়।", precautions: "জমির নিকাশি উন্নত করুন, ঘন রোপণ এড়িয়ে চলুন, পরের মৌসুমে ফসল পরিবর্তন করুন।", remedy: "আক্রান্ত পাতা দ্রুত সরিয়ে ফেলুন, ম্যানকোজেব-ভিত্তিক ছত্রাকনাশক প্রয়োগ করুন।" },
        "Corn_healthy": { name: "ভুট্টা - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "স্বাভাবিক যত্ন ও পর্যবেক্ষণ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Corn_Common_rust": { name: "ভুট্টা - সাধারণ মরিচা রোগ", cause: "পাক্সিনিয়া ছত্রাক বাতাসের মাধ্যমে বাহিত হয়, মাঝারি তাপমাত্রা ও আর্দ্রতায় বৃদ্ধি পায়।", precautions: "মরিচা প্রতিরোধী জাত রোপণ করুন, অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন।", remedy: "তীব্রতা বেশি হলে ছত্রাকনাশক স্প্রে করুন।" },
        "Corn_Northern_Leaf_Blight": { name: "ভুট্টা - উত্তরাঞ্চলীয় পাতার ব্লাইট", cause: "এক্সেরোহিলাম ছত্রাক আর্দ্র আবহাওয়া ও জমিতে ফসলের অবশিষ্টাংশ থেকে ছড়ায়।", precautions: "ফসল পরিবর্তন করুন, পুরনো অবশিষ্টাংশ মাটিতে মিশিয়ে দিন, প্রতিরোধী জাত বেছে নিন।", remedy: "প্রাথমিক লক্ষণে ছত্রাকনাশক প্রয়োগ করুন, ভারী আক্রান্ত পাতা সরিয়ে ফেলুন।" },
        "Grape_healthy": { name: "আঙুর - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত ছাঁটাই ও পর্যবেক্ষণ বজায় রাখুন।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Grape_Black_rot": { name: "আঙুর - কালো পচা রোগ", cause: "ছত্রাক সংক্রমণ উষ্ণ ভেজা অবস্থায় ছড়ায়, পুরনো ফল/পাতায় শীতকাল অতিবাহিত করে।", precautions: "প্রতি মৌসুমে পুরনো ফল ও ঝরা পাতা সরান, বাতাস চলাচলের জন্য ছাঁটাই করুন।", remedy: "মৌসুমের শুরুতেই ছত্রাকনাশক প্রয়োগ করুন, আক্রান্ত ফলের গুচ্ছ সরান।" },
        "Grape_Esca": { name: "আঙুর - এসকা রোগ", cause: "ছাঁটাইয়ের ক্ষত দিয়ে ছত্রাকের জটিল সংক্রমণ ঘটে, গাছের চাপ ও বয়সে বৃদ্ধি পায়।", precautions: "শুষ্ক আবহাওয়ায় ছাঁটাই করুন, সরঞ্জাম জীবাণুমুক্ত করুন, অপ্রয়োজনীয় চাপ এড়িয়ে চলুন।", remedy: "সম্পূর্ণ নিরাময় নেই - মারাত্মকভাবে আক্রান্ত লতা সরিয়ে ধ্বংস করুন।" },
        "Apple_healthy": { name: "আপেল - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "স্বাভাবিক যত্ন ও মৌসুমী পর্যবেক্ষণ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Apple_scab": { name: "আপেল - স্ক্যাব রোগ", cause: "ভেন্টুরিয়া ছত্রাকের সংক্রমণ, শীতল ভেজা বসন্তকালে বাতাস ও বৃষ্টির মাধ্যমে ছড়ায়।", precautions: "প্রতি শরতে ঝরা পাতা কুড়িয়ে ধ্বংস করুন যাতে স্পোর কম থাকে।", remedy: "কুঁড়ি ফোটা থেকে গ্রীষ্মের শুরু পর্যন্ত ছত্রাকনাশক স্প্রে করুন।" },
        "Pepper_healthy": { name: "ক্যাপসিকাম - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত পর্যবেক্ষণ ও সুষম সেচ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Pepper_Bacterial_spot": { name: "ক্যাপসিকাম - ব্যাকটেরিয়াল স্পট রোগ", cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার সংক্রমণ, জলের ছিটা ও দূষিত বীজ/সরঞ্জামের মাধ্যমে ছড়ায়।", precautions: "রোগমুক্ত বীজ ব্যবহার করুন, উপর থেকে সেচ এড়িয়ে চলুন, সরঞ্জাম জীবাণুমুক্ত করুন।", remedy: "তামা-ভিত্তিক ব্যাকটেরিয়ানাশক প্রয়োগ করুন, মারাত্মক আক্রান্ত গাছ সরান।" },
        "Strawberry_healthy": { name: "স্ট্রবেরি - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত সেচ ও মালচিং বজায় রাখুন।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Strawberry_Leaf_scorch": { name: "স্ট্রবেরি - পাতা ঝলসানো রোগ", cause: "ছত্রাক সংক্রমণ ভেজা পাতা ও ঘন রোপণে বৃদ্ধি পায়।", precautions: "বাতাস চলাচল বাড়ান, উপর থেকে সেচ এড়িয়ে চলুন, ফসল কাটার পর পুরনো পাতা সরান।", remedy: "মৌসুমে ছত্রাকনাশক প্রয়োগ করুন, আক্রান্ত পাতা সরিয়ে ধ্বংস করুন।" },
        "Cherry_healthy": { name: "চেরি - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "স্বাভাবিক বাগান পরিচর্যা চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Cherry_Powdery_mildew": { name: "চেরি - পাউডারি মিলডিউ", cause: "ছত্রাক সংক্রমণ উষ্ণ শুষ্ক দিন ও শীতল আর্দ্র রাতে বৃদ্ধি পায়, বাতাসবাহিত স্পোরে ছড়ায়।", precautions: "বাতাস চলাচলের জন্য ছাঁটাই করুন, অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন।", remedy: "সাদা পাউডারি দাগ দেখা দিলে সালফার-ভিত্তিক ছত্রাকনাশক প্রয়োগ করুন।" },
        "Peach_healthy": { name: "পীচ - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "স্বাভাবিক বাগান পরিচর্যা ও পর্যবেক্ষণ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Peach_Bacterial_spot": { name: "পীচ - ব্যাকটেরিয়াল স্পট রোগ", cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার সংক্রমণ, বৃষ্টির ছিটা ও বাতাসে ছড়ায়, ভেজা আবহাওয়ায় বৃদ্ধি পায়।", precautions: "প্রতিরোধী জাত রোপণ করুন, উপর থেকে সেচ এড়িয়ে চলুন, বাতাস চলাচলের জন্য ছাঁটাই করুন।", remedy: "নিষ্ক্রিয় মৌসুমে তামা-ভিত্তিক ব্যাকটেরিয়ানাশক প্রয়োগ করুন।" },
        "Soybean_healthy": { name: "সয়াবিন - সুস্থ", cause: "কোনো রোগ পাওয়া যায়নি।", precautions: "নিয়মিত ক্ষেত পর্যবেক্ষণ চালিয়ে যান।", remedy: "চিকিৎসার প্রয়োজন নেই।" },
        "Squash_Powdery_mildew": { name: "স্কোয়াশ - পাউডারি মিলডিউ", cause: "ছত্রাক সংক্রমণ উষ্ণ শুষ্ক অবস্থায় উচ্চ আর্দ্রতায় বৃদ্ধি পায়, বাতাসবাহিত স্পোরে ছড়ায়।", precautions: "গাছের মধ্যে ভালো ফাঁকা রাখুন, অতিরিক্ত নাইট্রোজেন এড়িয়ে চলুন, গোড়ায় জল দিন।", remedy: "সাদা দাগ দেখা দিলে সালফার বা পটাসিয়াম বাইকার্বোনেট ছত্রাকনাশক স্প্রে করুন।" }
    },
    telugu: {
        "Tomato_healthy": { name: "టమాటో - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా నీటిపారుదల, సమతుల్య ఎరువులు మరియు పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Tomato_Early_blight": { name: "టమాటో - తొలి ఆకుమచ్చ తెగులు", cause: "ఆల్టర్నేరియా శిలీంధ్రం వల్ల ఆకులపై గోధుమ రంగు మచ్చలు ఏర్పడతాయి, వెచ్చని తేమ వాతావరణంలో వ్యాపిస్తుంది.", precautions: "మొక్కల మధ్య ఖాళీ ఉంచండి, పైనుండి నీరు పోయవద్దు, ప్రతి సీజన్‌లో పంట మార్చండి.", remedy: "కింది సోకిన ఆకులను తొలగించండి, ప్రతి 7-10 రోజులకు రాగి ఆధారిత శిలీంధ్రనాశిని పిచికారీ చేయండి." },
        "Tomato_Late_blight": { name: "టమాటో - ఆలస్య ఆకుమచ్చ తెగులు", cause: "ఫైటోఫ్తోరా శిలీంధ్రం వల్ల కలుగుతుంది, చల్లని తడి వాతావరణంలో వేగంగా వ్యాపిస్తుంది.", precautions: "పైనుండి నీరు పోయడం మానుకోండి, మంచి నీటి పారుదల ఉంచండి, సోకిన మొక్కలను తొలగించండి.", remedy: "సోకిన మొక్కలను వెంటనే నాశనం చేయండి, తేమ వాతావరణంలో నివారణ శిలీంధ్రనాశిని వాడండి." },
        "Tomato_Septoria_leaf_spot": { name: "టమాటో - సెప్టోరియా ఆకు మచ్చ", cause: "సెప్టోరియా శిలీంధ్రం వల్ల ఆకులపై చిన్న గుండ్రని మచ్చలు ఏర్పడతాయి, తడి వాతావరణంలో నీటి తుంపరల ద్వారా వ్యాపిస్తుంది.", precautions: "మొక్క మొదట్లో మల్చ్ వేయండి, ఆకులు తడిగా ఉన్నప్పుడు మొక్కల దగ్గర పనిచేయవద్దు.", remedy: "సోకిన ఆకులను తొలగించండి, శిలీంధ్రనాశిని వాడండి, గాలి ప్రసరణ మెరుగుపరచండి." },
        "Potato_healthy": { name: "బంగాళదుంప - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా పర్యవేక్షణ మరియు సరైన నీటిపారుదల కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Potato_Late_blight": { name: "బంగాళదుంప - ఆలస్య ఆకుమచ్చ తెగులు", cause: "ఫైటోఫ్తోరా శిలీంధ్రం వల్ల కలుగుతుంది, చల్లని తడి వాతావరణంలో వేగంగా వ్యాపిస్తుంది.", precautions: "పొలం నీటి పారుదల మెరుగుపరచండి, దట్టమైన నాటడం మానుకోండి, తర్వాతి సీజన్‌లో పంట మార్చండి.", remedy: "సోకిన ఆకులను వెంటనే తొలగించండి, మాంకోజెబ్ ఆధారిత శిలీంధ్రనాశిని వాడండి." },
        "Corn_healthy": { name: "మొక్కజొన్న - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "సాధారణ సంరక్షణ మరియు పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Corn_Common_rust": { name: "మొక్కజొన్న - సాధారణ తుప్పు తెగులు", cause: "పక్సీనియా శిలీంధ్రం గాలి ద్వారా వ్యాపిస్తుంది, మధ్యస్థ ఉష్ణోగ్రత మరియు తేమలో వృద్ధి చెందుతుంది.", precautions: "తుప్పు నిరోధక రకాలు నాటండి, అధిక నత్రజని ఎరువులు మానుకోండి.", remedy: "తీవ్రత ఎక్కువగా ఉంటే శిలీంధ్రనాశిని పిచికారీ చేయండి." },
        "Corn_Northern_Leaf_Blight": { name: "మొక్కజొన్న - ఉత్తర ఆకు తెగులు", cause: "ఎక్సెరోహైలం శిలీంధ్రం తేమ వాతావరణం మరియు పొలంలో మిగిలిన పంట అవశేషాల ద్వారా వ్యాపిస్తుంది.", precautions: "పంట మార్పిడి చేయండి, పాత అవశేషాలను దున్నండి, నిరోధక రకాలు ఎంచుకోండి.", remedy: "తొలి లక్షణాల వద్ద శిలీంధ్రనాశిని వాడండి, ఎక్కువగా సోకిన ఆకులను తొలగించండి." },
        "Grape_healthy": { name: "ద్రాక్ష - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా కత్తిరింపు మరియు పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Grape_Black_rot": { name: "ద్రాక్ష - నల్ల కుళ్ళు తెగులు", cause: "శిలీంధ్ర సంక్రమణ వెచ్చని తడి పరిస్థితుల్లో వ్యాపిస్తుంది, పాత పండ్లు/ఆకులలో శీతాకాలం గడుపుతుంది.", precautions: "ప్రతి సీజన్‌లో పాత పండ్లు మరియు రాలిన ఆకులను తొలగించండి, గాలి ప్రసరణ కోసం కత్తిరించండి.", remedy: "సీజన్ ప్రారంభంలోనే శిలీంధ్రనాశిని వాడండి, సోకిన పండ్ల గుత్తులను తొలగించండి." },
        "Grape_Esca": { name: "ద్రాక్ష - ఎస్కా తెగులు", cause: "కత్తిరింపు గాయాల ద్వారా సంక్లిష్ట శిలీంధ్ర సంక్రమణ కలుగుతుంది, మొక్క ఒత్తిడి మరియు వయస్సుతో పెరుగుతుంది.", precautions: "పొడి వాతావరణంలో కత్తిరించండి, పనిముట్లను క్రిమిరహితం చేయండి, అనవసర ఒత్తిడి మానుకోండి.", remedy: "పూర్తి నివారణ లేదు - తీవ్రంగా సోకిన తీగలను తొలగించి నాశనం చేయండి." },
        "Apple_healthy": { name: "ఆపిల్ - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "సాధారణ సంరక్షణ మరియు కాలానుగుణ పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Apple_scab": { name: "ఆపిల్ - స్కాబ్ తెగులు", cause: "వెంచురియా శిలీంధ్రం చల్లని తడి వసంతకాలంలో గాలి మరియు వర్షం ద్వారా వ్యాపిస్తుంది.", precautions: "ప్రతి శరదృతువులో రాలిన ఆకులను సేకరించి నాశనం చేయండి.", remedy: "మొగ్గ విచ్చుకోవడం నుండి వేసవి ప్రారంభం వరకు శిలీంధ్రనాశిని పిచికారీ చేయండి." },
        "Pepper_healthy": { name: "క్యాప్సికం - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా పర్యవేక్షణ మరియు సమతుల్య నీటిపారుదల కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Pepper_Bacterial_spot": { name: "క్యాప్సికం - బాక్టీరియల్ మచ్చ తెగులు", cause: "శాంతోమోనాస్ బాక్టీరియా సంక్రమణ నీటి తుంపరల ద్వారా వ్యాపిస్తుంది.", precautions: "వ్యాధిరహిత విత్తనాలు వాడండి, పైనుండి నీరు పోయవద్దు, పనిముట్లను క్రిమిరహితం చేయండి.", remedy: "రాగి ఆధారిత బాక్టీరియానాశిని వాడండి, తీవ్రంగా సోకిన మొక్కలను తొలగించండి." },
        "Strawberry_healthy": { name: "స్ట్రాబెర్రీ - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా నీటిపారుదల మరియు మల్చింగ్ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Strawberry_Leaf_scorch": { name: "స్ట్రాబెర్రీ - ఆకు మాడు తెగులు", cause: "శిలీంధ్ర సంక్రమణ తడి ఆకులు మరియు దట్టమైన నాటడంలో వృద్ధి చెందుతుంది.", precautions: "గాలి ప్రసరణ మెరుగుపరచండి, పైనుండి నీరు పోయవద్దు, కోత తర్వాత పాత ఆకులను తొలగించండి.", remedy: "పెరుగుదల కాలంలో శిలీంధ్రనాశిని వాడండి, సోకిన ఆకులను తొలగించి నాశనం చేయండి." },
        "Cherry_healthy": { name: "చెర్రీ - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "సాధారణ తోట సంరక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Cherry_Powdery_mildew": { name: "చెర్రీ - పొడి బూజు తెగులు", cause: "శిలీంధ్ర సంక్రమణ వెచ్చని పొడి పగళ్ళు, చల్లని తేమ రాత్రుళ్ళలో వృద్ధి చెందుతుంది, గాలి ద్వారా వ్యాపిస్తుంది.", precautions: "మంచి గాలి ప్రసరణ కోసం కత్తిరించండి, అధిక నత్రజని ఎరువులు మానుకోండి.", remedy: "తెల్లటి పొడి మచ్చలు కనిపించినప్పుడు సల్ఫర్ ఆధారిత శిలీంధ్రనాశిని వాడండి." },
        "Peach_healthy": { name: "పీచ్ - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "సాధారణ తోట సంరక్షణ మరియు పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Peach_Bacterial_spot": { name: "పీచ్ - బాక్టీరియల్ మచ్చ తెగులు", cause: "శాంతోమోనాస్ బాక్టీరియా సంక్రమణ వర్షం మరియు గాలి ద్వారా వ్యాపిస్తుంది, తడి వాతావరణంలో పెరుగుతుంది.", precautions: "నిరోధక రకాలు నాటండి, పైనుండి నీరు పోయవద్దు, గాలి ప్రసరణ కోసం కత్తిరించండి.", remedy: "నిద్రావస్థ కాలంలో రాగి ఆధారిత బాక్టీరియానాశిని వాడండి." },
        "Soybean_healthy": { name: "సోయాబీన్ - ఆరోగ్యంగా ఉంది", cause: "వ్యాధి ఏదీ కనుగొనబడలేదు.", precautions: "క్రమం తప్పకుండా పొలం పర్యవేక్షణ కొనసాగించండి.", remedy: "చికిత్స అవసరం లేదు." },
        "Squash_Powdery_mildew": { name: "స్క్వాష్ - పొడి బూజు తెగులు", cause: "శిలీంధ్ర సంక్రమణ వెచ్చని పొడి పరిస్థితుల్లో అధిక తేమతో వృద్ధి చెందుతుంది, గాలి ద్వారా వ్యాపిస్తుంది.", precautions: "మొక్కల మధ్య మంచి ఖాళీ ఉంచండి, అధిక నత్రజని మానుకోండి, మొదట్లో నీరు పోయండి.", remedy: "తెల్లటి మచ్చలు కనిపించినప్పుడు సల్ఫర్ లేదా పొటాషియం బైకార్బోనేట్ శిలీంధ్రనాశిని పిచికారీ చేయండి." }
    },
    marathi: {
        "Tomato_healthy": { name: "टोमॅटो - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित सिंचन, संतुलित खत आणि देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Tomato_Early_blight": { name: "टोमॅटो - लवकर करपा रोग", cause: "अल्टरनेरिया बुरशीमुळे पानांवर तपकिरी डाग पडतात, उष्ण दमट हवामानात पसरते.", precautions: "झाडांमध्ये अंतर ठेवा, फक्त मुळाशी पाणी द्या, दरवर्षी पीक फेरपालट करा.", remedy: "खालची संक्रमित पाने काढा, दर ७-१० दिवसांनी तांबेयुक्त बुरशीनाशक फवारा." },
        "Tomato_Late_blight": { name: "टोमॅटो - उशिरा करपा रोग", cause: "फायटोफ्थोरा बुरशीमुळे होतो, थंड दमट हवामानात वेगाने पसरतो.", precautions: "वरून पाणी देणे टाळा, चांगला निचरा ठेवा, जवळपासची संक्रमित रोपे काढा.", remedy: "संक्रमित झाडे त्वरित नष्ट करा, दमट हवामानात प्रतिबंधात्मक बुरशीनाशक वापरा." },
        "Tomato_Septoria_leaf_spot": { name: "टोमॅटो - सेप्टोरिया पान ठिपका", cause: "सेप्टोरिया बुरशीच्या संसर्गामुळे पानांवर लहान गोल ठिपके पडतात, ओलसर स्थितीत पाण्याच्या शिंतोड्यांमुळे पसरते.", precautions: "झाडाच्या मुळाशी आच्छादन करा, पाने ओली असताना झाडांजवळ काम करू नका.", remedy: "संक्रमित पाने काढा, बुरशीनाशक वापरा, हवा खेळती राहू द्या." },
        "Potato_healthy": { name: "बटाटा - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित देखरेख आणि योग्य सिंचन सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Potato_Late_blight": { name: "बटाटा - उशिरा करपा रोग", cause: "फायटोफ्थोरा बुरशीमुळे होतो, थंड दमट हवामानात वेगाने पसरतो.", precautions: "शेतातील पाण्याचा निचरा सुधारा, दाट लागवड टाळा, पुढील हंगामात पीक बदला.", remedy: "संक्रमित पाने त्वरित काढा, मॅन्कोझेब बुरशीनाशक वापरा." },
        "Corn_healthy": { name: "मका - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नेहमीची काळजी आणि देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Corn_Common_rust": { name: "मका - सामान्य तांबेरा रोग", cause: "पक्सिनिया बुरशी वाऱ्याद्वारे पसरते, मध्यम तापमान व आर्द्रतेत वाढते.", precautions: "तांबेरा प्रतिरोधक जाती लावा, जास्त नायट्रोजन खत टाळा.", remedy: "तीव्रता जास्त असल्यास बुरशीनाशक फवारा." },
        "Corn_Northern_Leaf_Blight": { name: "मका - उत्तर पान करपा रोग", cause: "एक्सेरोहायलम बुरशी दमट हवामान व शेतात राहिलेल्या पीक अवशेषांमुळे पसरते.", precautions: "पीक फेरपालट करा, जुने अवशेष जमिनीत मिसळा, प्रतिरोधक जाती निवडा.", remedy: "सुरुवातीच्या लक्षणांवर बुरशीनाशक वापरा, जास्त संक्रमित पाने काढा." },
        "Grape_healthy": { name: "द्राक्ष - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित छाटणी आणि देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Grape_Black_rot": { name: "द्राक्ष - काळी कूज रोग", cause: "बुरशी संसर्ग उष्ण दमट स्थितीत पसरतो, जुन्या फळे/पानांमध्ये हिवाळा घालवतो.", precautions: "दरवर्षी जुनी फळे व गळलेली पाने काढा, हवा खेळती राहण्यासाठी छाटणी करा.", remedy: "हंगामाच्या सुरुवातीलाच बुरशीनाशक वापरा, संक्रमित फळांचे घड काढा." },
        "Grape_Esca": { name: "द्राक्ष - एस्का रोग", cause: "छाटणीच्या जखमांमधून बुरशीचा जटिल संसर्ग होतो, झाडाच्या ताण व वयानुसार वाढतो.", precautions: "कोरड्या हवामानात छाटणी करा, साधने निर्जंतुक करा, अनावश्यक ताण टाळा.", remedy: "पूर्ण उपचार नाही - गंभीर संक्रमित वेली काढून नष्ट करा." },
        "Apple_healthy": { name: "सफरचंद - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नेहमीची काळजी आणि हंगामी देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Apple_scab": { name: "सफरचंद - खरूज रोग", cause: "व्हेंच्युरिया बुरशीचा संसर्ग थंड दमट वसंत ऋतूत वारा व पावसाद्वारे पसरतो.", precautions: "दरवर्षी शरद ऋतूत गळलेली पाने गोळा करून नष्ट करा.", remedy: "कळी फुटण्यापासून उन्हाळ्याच्या सुरुवातीपर्यंत बुरशीनाशक फवारा." },
        "Pepper_healthy": { name: "सिमला मिरची - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित देखरेख आणि संतुलित सिंचन सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Pepper_Bacterial_spot": { name: "सिमला मिरची - जिवाणू ठिपका रोग", cause: "झॅन्थोमोनास जिवाणू संसर्ग पाण्याच्या शिंतोड्यांमुळे पसरतो.", precautions: "रोगमुक्त बियाणे वापरा, वरून पाणी देऊ नका, साधने निर्जंतुक करा.", remedy: "तांबेयुक्त जिवाणूनाशक वापरा, गंभीर संक्रमित झाडे काढा." },
        "Strawberry_healthy": { name: "स्ट्रॉबेरी - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित सिंचन आणि आच्छादन सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Strawberry_Leaf_scorch": { name: "स्ट्रॉबेरी - पान करपा रोग", cause: "बुरशी संसर्ग ओली पाने व दाट लागवडीत वाढतो.", precautions: "हवा खेळती ठेवा, वरून पाणी देऊ नका, काढणीनंतर जुनी पाने काढा.", remedy: "हंगामात बुरशीनाशक फवारा, संक्रमित पाने काढून नष्ट करा." },
        "Cherry_healthy": { name: "चेरी - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नेहमीची बाग काळजी सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Cherry_Powdery_mildew": { name: "चेरी - भुरी रोग", cause: "बुरशी संसर्ग उष्ण कोरड्या दिवसांत व थंड दमट रात्रींमध्ये वाढतो, हवेतून पसरतो.", precautions: "चांगल्या हवा खेळण्यासाठी छाटणी करा, जास्त नायट्रोजन खत टाळा.", remedy: "पांढरे भुकटीसारखे डाग दिसताच सल्फरयुक्त बुरशीनाशक फवारा." },
        "Peach_healthy": { name: "पीच - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नेहमीची बाग काळजी आणि देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Peach_Bacterial_spot": { name: "पीच - जिवाणू ठिपका रोग", cause: "झॅन्थोमोनास जिवाणू संसर्ग पाऊस व वाऱ्याद्वारे पसरतो, ओल्या हवामानात वाढतो.", precautions: "प्रतिरोधक जाती लावा, वरून पाणी देऊ नका, हवा खेळती राहण्यासाठी छाटणी करा.", remedy: "सुप्त हंगामात तांबेयुक्त जिवाणूनाशक वापरा." },
        "Soybean_healthy": { name: "सोयाबीन - निरोगी", cause: "कोणताही रोग आढळला नाही.", precautions: "नियमित शेत देखरेख सुरू ठेवा.", remedy: "उपचाराची गरज नाही." },
        "Squash_Powdery_mildew": { name: "स्क्वॅश - भुरी रोग", cause: "बुरशी संसर्ग उष्ण कोरड्या स्थितीत जास्त आर्द्रतेत वाढतो, हवेतून पसरतो.", precautions: "झाडांमध्ये पुरेसे अंतर ठेवा, जास्त नायट्रोजन टाळा, मुळाशी पाणी द्या.", remedy: "पांढरे डाग दिसताच सल्फर किंवा पोटॅशियम बायकार्बोनेट बुरशीनाशक फवारा." }
    },
    odia: {
        "Tomato_healthy": { name: "ଟମାଟୋ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ ଜଳସେଚନ, ସନ୍ତୁଳିତ ସାର ଏବଂ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Tomato_Early_blight": { name: "ଟମାଟୋ - ଆରମ୍ଭିକ ପତ୍ର ମାରି ରୋଗ", cause: "ଆଲ୍ଟରନେରିଆ ଫଙ୍ଗସ୍ ଯୋଗୁଁ ପତ୍ରରେ ବାଦାମୀ ଦାଗ ପଡ଼େ, ଗରମ ଓ ଆର୍ଦ୍ର ପାଣିପାଗରେ ବ୍ୟାପେ।", precautions: "ଗଛ ମଧ୍ୟରେ ଫାଙ୍କ ରଖନ୍ତୁ, କେବଳ ମୂଳରେ ପାଣି ଦିଅନ୍ତୁ, ପ୍ରତି ଋତୁରେ ଫସଲ ପରିବର୍ତ୍ତନ କରନ୍ତୁ।", remedy: "ତଳ ପତ୍ର ସଂକ୍ରମିତ ହେଲେ ହଟାନ୍ତୁ, ପ୍ରତି ୭-୧୦ ଦିନରେ ତମ୍ବା ଆଧାରିତ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" },
        "Tomato_Late_blight": { name: "ଟମାଟୋ - ବିଳମ୍ବିତ ପତ୍ର ମାରି ରୋଗ", cause: "ଫାଇଟୋଫଥୋରା ଫଙ୍ଗସ୍ ଯୋଗୁଁ ହୁଏ, ଥଣ୍ଡା ଓ ଓଦା ପାଣିପାଗରେ ଶୀଘ୍ର ବ୍ୟାପେ।", precautions: "ଉପରୁ ପାଣି ଦେବା ଏଡ଼ାନ୍ତୁ, ଭଲ ଜଳ ନିଷ୍କାସନ ରଖନ୍ତୁ, ସଂକ୍ରମିତ ଗଛ ହଟାନ୍ତୁ।", remedy: "ସଂକ୍ରମିତ ଗଛକୁ ତୁରନ୍ତ ନଷ୍ଟ କରନ୍ତୁ, ଆର୍ଦ୍ର ପାଣିପାଗରେ ପ୍ରତିରୋଧକ ଫଙ୍ଗସ୍‌ନାଶକ ବ୍ୟବହାର କରନ୍ତୁ।" },
        "Tomato_Septoria_leaf_spot": { name: "ଟମାଟୋ - ସେପ୍ଟୋରିଆ ପତ୍ର ଦାଗ", cause: "ସେପ୍ଟୋରିଆ ଫଙ୍ଗସ୍ ଯୋଗୁଁ ପତ୍ରରେ ଛୋଟ ଗୋଲାକାର ଦାଗ ପଡ଼େ, ପାଣି ଛିଟା ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ଫସଲ ଚକ୍ର ଅନୁସରଣ କରନ୍ତୁ, ସଂକ୍ରମିତ ପତ୍ର ହଟାନ୍ତୁ, ଉପରୁ ପାଣି ଦେବା ଏଡ଼ାନ୍ତୁ।", remedy: "କ୍ଲୋରୋଥାଲୋନିଲ ଆଧାରିତ ଫଙ୍ଗସ୍‌ନାଶକ ବ୍ୟବହାର କରନ୍ତୁ।" },
        "Potato_healthy": { name: "ଆଳୁ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ ନିରୀକ୍ଷଣ ଏବଂ ଉପଯୁକ୍ତ ଜଳସେଚନ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Potato_Late_blight": { name: "ଆଳୁ - ବିଳମ୍ବିତ ପତ୍ର ମାରି ରୋଗ", cause: "ଫାଇଟୋଫଥୋରା ଫଙ୍ଗସ୍ ଯୋଗୁଁ ହୁଏ, ଥଣ୍ଡା ଓଦା ପାଣିପାଗରେ ଶୀଘ୍ର ବ୍ୟାପେ।", precautions: "ଜମିର ଜଳ ନିଷ୍କାସନ ଉନ୍ନତ କରନ୍ତୁ, ଘନ ରୋପଣ ଏଡ଼ାନ୍ତୁ, ପରବର୍ତ୍ତୀ ଋତୁରେ ଫସଲ ପରିବର୍ତ୍ତନ କରନ୍ତୁ।", remedy: "ସଂକ୍ରମିତ ପତ୍ର ତୁରନ୍ତ ହଟାନ୍ତୁ, ମାନ୍କୋଜେବ୍ ଫଙ୍ଗସ୍‌ନାଶକ ବ୍ୟବହାର କରନ୍ତୁ।" },
        "Corn_healthy": { name: "ମକା - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ସାଧାରଣ ଯତ୍ନ ଏବଂ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Corn_Common_rust": { name: "ମକା - ସାଧାରଣ ମରିଚିକା ରୋଗ", cause: "ପକ୍ସିନିଆ ଫଙ୍ଗସ୍ ପବନ ଦ୍ୱାରା ବ୍ୟାପେ, ମଧ୍ୟମ ତାପମାତ୍ରା ଓ ଆର୍ଦ୍ରତାରେ ବଢ଼େ।", precautions: "ମରିଚିକା ପ୍ରତିରୋଧକ ଜାତି ରୋପଣ କରନ୍ତୁ, ଅଧିକ ନାଇଟ୍ରୋଜେନ ସାର ଏଡ଼ାନ୍ତୁ।", remedy: "ତୀବ୍ରତା ଅଧିକ ହେଲେ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" },
        "Corn_Northern_Leaf_Blight": { name: "ମକା - ଉତ୍ତର ପତ୍ର ମାରି ରୋଗ", cause: "ଏକ୍ସେରୋହିଲମ୍ ଫଙ୍ଗସ୍ ଆର୍ଦ୍ର ପାଣିପାଗ ଓ ଜମିରେ ରହିଥିବା ଫସଲ ଅବଶିଷ୍ଟାଂଶ ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ଫସଲ ପରିବର୍ତ୍ତନ କରନ୍ତୁ, ପୁରୁଣା ଅବଶିଷ୍ଟାଂଶ ମାଟିରେ ମିଶାନ୍ତୁ, ପ୍ରତିରୋଧକ ଜାତି ବାଛନ୍ତୁ।", remedy: "ଆରମ୍ଭିକ ଲକ୍ଷଣରେ ଫଙ୍ଗସ୍‌ନାଶକ ବ୍ୟବହାର କରନ୍ତୁ, ଅଧିକ ସଂକ୍ରମିତ ପତ୍ର ହଟାନ୍ତୁ।" },
        "Grape_healthy": { name: "ଅଙ୍ଗୁର - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ କଟାଛଣ ଏବଂ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Grape_Black_rot": { name: "ଅଙ୍ଗୁର - କଳା ପଚନ ରୋଗ", cause: "ଫଙ୍ଗସ୍ ସଂକ୍ରମଣ ଗରମ ଓଦା ପରିସ୍ଥିତିରେ ବ୍ୟାପେ, ପୁରୁଣା ଫଳ/ପତ୍ରରେ ଶୀତ ଋତୁ କାଟେ।", precautions: "ପ୍ରତି ଋତୁରେ ପୁରୁଣା ଫଳ ଓ ଝଡ଼ିଥିବା ପତ୍ର ହଟାନ୍ତୁ, ପବନ ଚଳାଚଳ ପାଇଁ କଟାଛଣ କରନ୍ତୁ।", remedy: "ଋତୁ ଆରମ୍ଭରୁ ଫଙ୍ଗସ୍‌ନାଶକ ବ୍ୟବହାର କରନ୍ତୁ, ସଂକ୍ରମିତ ଫଳ ଗୁଚ୍ଛ ହଟାନ୍ତୁ।" },
        "Grape_Esca": { name: "ଅଙ୍ଗୁର - ଏସ୍କା ରୋଗ", cause: "କଟାଛଣ କ୍ଷତ ଦେଇ ଫଙ୍ଗସ୍‌ର ଜଟିଳ ସଂକ୍ରମଣ ହୁଏ, ଗଛ ଚାପ ଓ ବୟସ ସହିତ ବଢ଼େ।", precautions: "ଶୁଖିଲା ପାଣିପାଗରେ କଟାଛଣ କରନ୍ତୁ, ଉପକରଣ ଜୀବାଣୁମୁକ୍ତ କରନ୍ତୁ, ଅନାବଶ୍ୟକ ଚାପ ଏଡ଼ାନ୍ତୁ।", remedy: "ସମ୍ପୂର୍ଣ୍ଣ ଚିକିତ୍ସା ନାହିଁ - ଗମ୍ଭୀର ସଂକ୍ରମିତ ବେଲ ହଟାଇ ନଷ୍ଟ କରନ୍ତୁ।" },
        "Apple_healthy": { name: "ସେଓ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ସାଧାରଣ ଯତ୍ନ ଏବଂ ଋତୁକାଳୀନ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Apple_scab": { name: "ସେଓ - ସ୍କାବ ରୋଗ", cause: "ଭେଣ୍ଟୁରିଆ ଫଙ୍ଗସ୍ ସଂକ୍ରମଣ ଥଣ୍ଡା ଓଦା ବସନ୍ତରେ ପବନ ଓ ବର୍ଷା ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ପ୍ରତି ଶରତରେ ଝଡ଼ିଥିବା ପତ୍ର ସଂଗ୍ରହ କରି ନଷ୍ଟ କରନ୍ତୁ।", remedy: "କଢ଼ି ଫୁଟିବାଠାରୁ ଗ୍ରୀଷ୍ମ ଆରମ୍ଭ ପର୍ଯ୍ୟନ୍ତ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" },
        "Pepper_healthy": { name: "କେପସିକମ୍ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ ନିରୀକ୍ଷଣ ଏବଂ ସନ୍ତୁଳିତ ଜଳସେଚନ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Pepper_Bacterial_spot": { name: "କେପସିକମ୍ - ବ୍ୟାକ୍ଟେରିଆ ଦାଗ ରୋଗ", cause: "ଜାନ୍ଥୋମୋନାସ୍ ବ୍ୟାକ୍ଟେରିଆ ସଂକ୍ରମଣ ପାଣି ଛିଟା ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ରୋଗମୁକ୍ତ ମଞ୍ଜି ବ୍ୟବହାର କରନ୍ତୁ, ଉପରୁ ପାଣି ଦେବା ଏଡ଼ାନ୍ତୁ, ଉପକରଣ ଜୀବାଣୁମୁକ୍ତ କରନ୍ତୁ।", remedy: "ତମ୍ବା ଆଧାରିତ ବ୍ୟାକ୍ଟେରିଆନାଶକ ବ୍ୟବହାର କରନ୍ତୁ, ଗମ୍ଭୀର ସଂକ୍ରମିତ ଗଛ ହଟାନ୍ତୁ।" },
        "Strawberry_healthy": { name: "ଷ୍ଟ୍ରବେରି - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ ଜଳସେଚନ ଏବଂ ମଲ୍ଚିଂ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Strawberry_Leaf_scorch": { name: "ଷ୍ଟ୍ରବେରି - ପତ୍ର ପୋଡ଼ି ରୋଗ", cause: "ଫଙ୍ଗସ୍ ସଂକ୍ରମଣ ଓଦା ପତ୍ର ଓ ଘନ ରୋପଣରେ ବଢ଼େ।", precautions: "ପବନ ଚଳାଚଳ ବଢ଼ାନ୍ତୁ, ଉପରୁ ପାଣି ଦେବା ଏଡ଼ାନ୍ତୁ, ଅମଳ ପରେ ପୁରୁଣା ପତ୍ର ହଟାନ୍ତୁ।", remedy: "ଋତୁରେ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ, ସଂକ୍ରମିତ ପତ୍ର ହଟାଇ ନଷ୍ଟ କରନ୍ତୁ।" },
        "Cherry_healthy": { name: "ଚେରି - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ସାଧାରଣ ବଗିଚା ଯତ୍ନ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Cherry_Powdery_mildew": { name: "ଚେରି - ପାଉଡରି ମିଲଡ୍ୟୁ", cause: "ଫଙ୍ଗସ୍ ସଂକ୍ରମଣ ଗରମ ଶୁଖିଲା ଦିନ ଓ ଥଣ୍ଡା ଆର୍ଦ୍ର ରାତିରେ ବଢ଼େ, ପବନ ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ଭଲ ପବନ ଚଳାଚଳ ପାଇଁ କଟାଛଣ କରନ୍ତୁ, ଅଧିକ ନାଇଟ୍ରୋଜେନ ସାର ଏଡ଼ାନ୍ତୁ।", remedy: "ଧଳା ପାଉଡର ଦାଗ ଦେଖାଗଲେ ସଲଫର ଆଧାରିତ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" },
        "Peach_healthy": { name: "ପିଚ୍ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ସାଧାରଣ ବଗିଚା ଯତ୍ନ ଏବଂ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Peach_Bacterial_spot": { name: "ପିଚ୍ - ବ୍ୟାକ୍ଟେରିଆ ଦାଗ ରୋଗ", cause: "ଜାନ୍ଥୋମୋନାସ୍ ବ୍ୟାକ୍ଟେରିଆ ସଂକ୍ରମଣ ବର୍ଷା ଓ ପବନ ଦ୍ୱାରା ବ୍ୟାପେ, ଓଦା ପାଣିପାଗରେ ବଢ଼େ।", precautions: "ପ୍ରତିରୋଧକ ଜାତି ରୋପଣ କରନ୍ତୁ, ଉପରୁ ପାଣି ଦେବା ଏଡ଼ାନ୍ତୁ, ପବନ ଚଳାଚଳ ପାଇଁ କଟାଛଣ କରନ୍ତୁ।", remedy: "ନିଷ୍କ୍ରିୟ ଋତୁରେ ତମ୍ବା ଆଧାରିତ ବ୍ୟାକ୍ଟେରିଆନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" },
        "Soybean_healthy": { name: "ସୋୟାବିନ୍ - ସୁସ୍ଥ", cause: "କୌଣସି ରୋଗ ମିଳିଲା ନାହିଁ।", precautions: "ନିୟମିତ କ୍ଷେତ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।", remedy: "ଚିକିତ୍ସାର ଆବଶ୍ୟକତା ନାହିଁ।" },
        "Squash_Powdery_mildew": { name: "ସ୍କ୍ୱାଶ - ପାଉଡରି ମିଲଡ୍ୟୁ", cause: "ଫଙ୍ଗସ୍ ସଂକ୍ରମଣ ଗରମ ଶୁଖିଲା ପରିସ୍ଥିତିରେ ଅଧିକ ଆର୍ଦ୍ରତାରେ ବଢ଼େ, ପବନ ଦ୍ୱାରା ବ୍ୟାପେ।", precautions: "ଗଛ ମଧ୍ୟରେ ଯଥେଷ୍ଟ ଫାଙ୍କ ରଖନ୍ତୁ, ଅଧିକ ନାଇଟ୍ରୋଜେନ ଏଡ଼ାନ୍ତୁ, ମୂଳରେ ପାଣି ଦିଅନ୍ତୁ।", remedy: "ଧଳା ଦାଗ ଦେଖାଗଲେ ସଲଫର କିମ୍ବା ପୋଟାସିୟମ୍ ବାଇକାର୍ବୋନେଟ ଫଙ୍ଗସ୍‌ନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।" }
    },
    assamese: {
        "Tomato_healthy": { name: "বিলাহী - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত জলসিঞ্চন, সন্তুলিত সাৰ আৰু নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Tomato_Early_blight": { name: "বিলাহী - প্ৰাৰম্ভিক পাত পোৰা ৰোগ", cause: "আল্টাৰনেৰিয়া ফাংগাছৰ কাৰণে পাতত বাদামী দাগ পৰে, গৰম আৰু আৰ্দ্ৰ বতৰত বিয়পে।", precautions: "গছৰ মাজত ফাঁক ৰাখক, কেৱল শিপাত পানী দিয়ক, প্ৰতি বছৰে শস্য সলনি কৰক।", remedy: "তলৰ সংক্ৰমিত পাত আঁতৰাওক, প্ৰতি ৭-১০ দিনত তামা-ভিত্তিক ফাংগীনাশক প্ৰয়োগ কৰক।" },
        "Tomato_Late_blight": { name: "বিলাহী - পলম পাত পোৰা ৰোগ", cause: "ফাইটোফথ'ৰা ফাংগাছৰ কাৰণে হয়, ঠাণ্ডা আৰু তেতা বতৰত বেগাই বিয়পে।", precautions: "ওপৰৰ পৰা পানী দিয়া এৰাই চলক, ভাল পানী নিষ্কাশন ৰাখক, সংক্ৰমিত গছ আঁতৰাওক।", remedy: "সংক্ৰমিত গছ তৎক্ষণাৎ ধ্বংস কৰক, তেতা বতৰত প্ৰতিৰোধমূলক ফাংগীনাশক প্ৰয়োগ কৰক।" },
        "Tomato_Septoria_leaf_spot": { name: "বিলাহী - ছেপ্টৰিয়া পাত দাগ", cause: "ছেপ্টৰিয়া ফাংগাছৰ সংক্ৰমণৰ ফলত পাতত সৰু গোলাকাৰ দাগ পৰে, পানীৰ ছটিকনিৰে বিয়পে।", precautions: "শস্য চক্ৰ অনুসৰণ কৰক, সংক্ৰমিত পাত আঁতৰাওক, ওপৰৰ পৰা পানী দিয়া এৰাই চলক।", remedy: "ক্লোৰোথেলোনিল-ভিত্তিক ফাংগীনাশক ব্যৱহাৰ কৰক।" },
        "Potato_healthy": { name: "আলু - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত নিৰীক্ষণ আৰু উপযুক্ত জলসিঞ্চন অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Potato_Late_blight": { name: "আলু - পলম পাত পোৰা ৰোগ", cause: "ফাইটোফথ'ৰা ফাংগাছৰ কাৰণে হয়, ঠাণ্ডা তেতা বতৰত বেগাই বিয়পে।", precautions: "পথাৰৰ পানী নিষ্কাশন উন্নত কৰক, ঘন ৰোপণ এৰাই চলক, পৰৱৰ্তী বতৰত শস্য সলনি কৰক।", remedy: "সংক্ৰমিত পাত তৎক্ষণাৎ আঁতৰাওক, মেনক'জেব ফাংগীনাশক ব্যৱহাৰ কৰক।" },
        "Corn_healthy": { name: "মাকৈ - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "সাধাৰণ যত্ন আৰু নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Corn_Common_rust": { name: "মাকৈ - সাধাৰণ মৰিচা ৰোগ", cause: "পক্সিনিয়া ফাংগাছ বতাহৰ যোগেদি বিয়পে, মধ্যম উষ্ণতা আৰু আৰ্দ্ৰতাত বৃদ্ধি পায়।", precautions: "মৰিচা প্ৰতিৰোধী প্ৰজাতি ৰোপণ কৰক, অধিক নাইট্ৰ'জেন সাৰ এৰাই চলক।", remedy: "তীব্ৰতা বেছি হ'লে ফাংগীনাশক প্ৰয়োগ কৰক।" },
        "Corn_Northern_Leaf_Blight": { name: "মাকৈ - উত্তৰীয় পাত পোৰা ৰোগ", cause: "এক্সেৰোহাইলাম ফাংগাছ তেতা বতৰ আৰু পথাৰত থকা শস্যৰ অৱশিষ্টাংশৰ যোগেদি বিয়পে।", precautions: "শস্য চক্ৰ অনুসৰণ কৰক, পুৰণি অৱশিষ্টাংশ মাটিত মিহলাই দিয়ক, প্ৰতিৰোধী প্ৰজাতি বাছক।", remedy: "আৰম্ভণিৰ লক্ষণতে ফাংগীনাশক প্ৰয়োগ কৰক, অধিক সংক্ৰমিত পাত আঁতৰাওক।" },
        "Grape_healthy": { name: "আঙুৰ - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত কটাঁছাটনি আৰু নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Grape_Black_rot": { name: "আঙুৰ - ক'লা পঠন ৰোগ", cause: "ফাংগাছ সংক্ৰমণ গৰম তেতা অৱস্থাত বিয়পে, পুৰণি ফল/পাতত জাৰকাল কটায়।", precautions: "প্ৰতি বতৰত পুৰণি ফল আৰু সৰি পৰা পাত আঁতৰাওক, বতাহ চলাচলৰ বাবে কটাঁছাটনি কৰক।", remedy: "বতৰৰ আৰম্ভণিতেই ফাংগীনাশক ব্যৱহাৰ কৰক, সংক্ৰমিত ফলৰ থোক আঁতৰাওক।" },
        "Grape_Esca": { name: "আঙুৰ - এস্কা ৰোগ", cause: "কটাঁছাটনিৰ ঘাঁৰ যোগেদি ফাংগাছৰ জটিল সংক্ৰমণ হয়, গছৰ চাপ আৰু বয়সৰ লগত বৃদ্ধি পায়।", precautions: "শুকান বতৰত কটাঁছাটনি কৰক, সঁজুলি জীৱাণুমুক্ত কৰক, অনাৱশ্যক চাপ এৰাই চলক।", remedy: "সম্পূৰ্ণ চিকিৎসা নাই - গুৰুতৰ সংক্ৰমিত বেল আঁতৰাই ধ্বংস কৰক।" },
        "Apple_healthy": { name: "আপেল - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "সাধাৰণ যত্ন আৰু ঋতুকালীন নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Apple_scab": { name: "আপেল - স্কেব ৰোগ", cause: "ভেন্টুৰিয়া ফাংগাছৰ সংক্ৰমণ ঠাণ্ডা তেতা বসন্তত বতাহ আৰু বৰষুণৰ যোগেদি বিয়পে।", precautions: "প্ৰতি জাৰকালত সৰি পৰা পাত সংগ্ৰহ কৰি ধ্বংস কৰক।", remedy: "কুঁহিয়াৰ ফুলাৰ পৰা গ্ৰীষ্মৰ আৰম্ভণিলৈ ফাংগীনাশক প্ৰয়োগ কৰক।" },
        "Pepper_healthy": { name: "কেপ্সিকাম - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত নিৰীক্ষণ আৰু সন্তুলিত জলসিঞ্চন অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Pepper_Bacterial_spot": { name: "কেপ্সিকাম - বেক্টেৰিয়া দাগ ৰোগ", cause: "জেন্থ'মোনাছ বেক্টেৰিয়াৰ সংক্ৰমণ পানীৰ ছটিকনিৰ যোগেদি বিয়পে।", precautions: "ৰোগমুক্ত গুটি ব্যৱহাৰ কৰক, ওপৰৰ পৰা পানী নিদিব, সঁজুলি জীৱাণুমুক্ত কৰক।", remedy: "তামা-ভিত্তিক বেক্টেৰিয়ানাশক ব্যৱহাৰ কৰক, গুৰুতৰ সংক্ৰমিত গছ আঁতৰাওক।" },
        "Strawberry_healthy": { name: "ষ্ট্ৰবেৰী - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত জলসিঞ্চন আৰু মালচিং অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Strawberry_Leaf_scorch": { name: "ষ্ট্ৰবেৰী - পাত পোৰা ৰোগ", cause: "ফাংগাছ সংক্ৰমণ তেতা পাত আৰু ঘন ৰোপণত বৃদ্ধি পায়।", precautions: "বতাহ চলাচল বৃদ্ধি কৰক, ওপৰৰ পৰা পানী নিদিব, চপোৱাৰ পিছত পুৰণি পাত আঁতৰাওক।", remedy: "বতৰত ফাংগীনাশক প্ৰয়োগ কৰক, সংক্ৰমিত পাত আঁতৰাই ধ্বংস কৰক।" },
        "Cherry_healthy": { name: "চেৰী - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "সাধাৰণ বাগিচা যত্ন অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Cherry_Powdery_mildew": { name: "চেৰী - পাউডাৰী মিলড্যু", cause: "ফাংগাছ সংক্ৰমণ গৰম শুকান দিন আৰু ঠাণ্ডা তেতা ৰাতিত বৃদ্ধি পায়, বতাহেৰে বিয়পে।", precautions: "ভাল বতাহ চলাচলৰ বাবে কটাঁছাটনি কৰক, অধিক নাইট্ৰ'জেন সাৰ এৰাই চলক।", remedy: "বগা পাউডাৰী দাগ দেখা পালে ছালফাৰ-ভিত্তিক ফাংগীনাশক প্ৰয়োগ কৰক।" },
        "Peach_healthy": { name: "পীচ - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "সাধাৰণ বাগিচা যত্ন আৰু নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Peach_Bacterial_spot": { name: "পীচ - বেক্টেৰিয়া দাগ ৰোগ", cause: "জেন্থ'মোনাছ বেক্টেৰিয়াৰ সংক্ৰমণ বৰষুণ আৰু বতাহেৰে বিয়পে, তেতা বতৰত বৃদ্ধি পায়।", precautions: "প্ৰতিৰোধী প্ৰজাতি ৰোপণ কৰক, ওপৰৰ পৰা পানী নিদিব, বতাহ চলাচলৰ বাবে কটাঁছাটনি কৰক।", remedy: "নিষ্ক্ৰিয় বতৰত তামা-ভিত্তিক বেক্টেৰিয়ানাশক প্ৰয়োগ কৰক।" },
        "Soybean_healthy": { name: "সয়াবিন - সুস্থ", cause: "কোনো ৰোগ পোৱা নগ'ল।", precautions: "নিয়মিত পথাৰ নিৰীক্ষণ অব্যাহত ৰাখক।", remedy: "চিকিৎসাৰ প্ৰয়োজন নাই।" },
        "Squash_Powdery_mildew": { name: "স্কুৱাশ - পাউডাৰী মিলড্যু", cause: "ফাংগাছ সংক্ৰমণ গৰম শুকান অৱস্থাত অধিক আৰ্দ্ৰতাত বৃদ্ধি পায়, বতাহেৰে বিয়পে।", precautions: "গছৰ মাজত পৰ্যাপ্ত ফাঁক ৰাখক, অধিক নাইট্ৰ'জেন এৰাই চলক, শিপাত পানী দিয়ক।", remedy: "বগা দাগ দেখা পালে ছালফাৰ বা পটাছিয়াম বাইকাৰ্বনেট ফাংগীনাশক প্ৰয়োগ কৰক।" }
    }
};
/* ----------------------------------------------------------
   SHARED: find the best-matching disease entry for free-text
---------------------------------------------------------- */
function findDiseaseMatch(question) {
    let matchKey = null;
    let bestScore = 0;
    for (const key in DISEASE_INFO) {
        const info = DISEASE_INFO[key];
        const searchable = (info.name + " " + info.cropFamily).toLowerCase();
        const terms = searchable.split(/[\s-]+/).filter(t => t.length > 3);
        const score = terms.filter(term => question.includes(term)).length;
        if (score > bestScore) {
            bestScore = score;
            matchKey = key;
        }
    }
    return matchKey;
}

// Returns the translated disease entry (falls back to English) for a given language key
function getLocalizedMatch(langKey, matchKey) {
    const translated = DISEASE_INFO_TRANSLATIONS[langKey] && DISEASE_INFO_TRANSLATIONS[langKey][matchKey];
    return translated || DISEASE_INFO[matchKey];
}

function askQuestion() {
    const lang = document.getElementById("languageSelect").value;
    const strings = UI_STRINGS[lang] || UI_STRINGS.english;
    const question = document.getElementById("questionBox").value.toLowerCase();
    const answerBox = document.getElementById("answerBox");

    if (!question.trim()) {
        answerBox.innerHTML = strings.noMatch;
        return;
    }

    const matchKey = findDiseaseMatch(question);

    if (!matchKey) {
        answerBox.innerHTML = `<p>${strings.noMatch}</p>`;
        return;
    }

    const match = getLocalizedMatch(lang, matchKey);

    answerBox.innerHTML = `
    <p><strong>${strings.found} ${match.name}:</strong></p>
    <p><strong>${strings.cause}:</strong> ${match.cause}</p>
    <p><strong>${strings.precautions}:</strong> ${match.precautions}</p>
    <p><strong>${strings.remedy}:</strong> ${match.remedy}</p>
  `;
}

/* ----------------------------------------------------------
   7. VOICE ASSISTANT (voice.html)
---------------------------------------------------------- */

// Maps the <select id="voiceLanguage"> speech-recognition codes
// to the language keys used by UI_STRINGS / DISEASE_INFO_TRANSLATIONS
const VOICE_LANG_TO_KEY = {
    "en-IN": "english",
    "hi-IN": "hindi",
    "bn-IN": "bengali",
    "as-IN": "assamese",
    "ta-IN": "tamil",
    "te-IN": "telugu"
};

let voiceRecognition = null;
let isListening = false;

function getSpeechRecognitionAPI() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function startVoice() {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    const voiceTextEl = document.getElementById("voiceText");
    const voiceAnswerEl = document.getElementById("voiceAnswer");
    const langCode = document.getElementById("voiceLanguage").value;
    const langKey = VOICE_LANG_TO_KEY[langCode] || "english";
    const strings = UI_STRINGS[langKey] || UI_STRINGS.english;
    const button = document.querySelector('button[onclick="startVoice()"]');

    if (!SpeechRecognitionAPI) {
        voiceAnswerEl.innerHTML = "<p>⚠️ Sorry, voice recognition isn't supported in this browser. Please try Chrome on desktop or Android.</p>";
        return;
    }

    // If already listening, treat button as a stop control
    if (isListening && voiceRecognition) {
        voiceRecognition.stop();
        return;
    }

    voiceRecognition = new SpeechRecognitionAPI();
    voiceRecognition.lang = langCode;
    voiceRecognition.interimResults = false;
    voiceRecognition.maxAlternatives = 1;

    voiceRecognition.onstart = () => {
        isListening = true;
        if (button) button.textContent = "🛑 Stop Listening";
        voiceTextEl.textContent = "🎧 Listening...";
        voiceAnswerEl.innerHTML = "";
    };

    voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        voiceTextEl.textContent = transcript;
        answerVoiceQuestion(transcript, langKey, langCode);
    };

    voiceRecognition.onerror = (event) => {
        voiceTextEl.textContent = "Your voice input will appear here...";
        const message = event.error === "not-allowed" || event.error === "permission-denied"
            ? "Microphone access was denied. Please allow microphone access and try again."
            : event.error === "no-speech"
                ? "I didn't hear anything. Please try again."
                : "Sorry, something went wrong with voice recognition. Please try again.";
        voiceAnswerEl.innerHTML = `<p>⚠️ ${message}</p>`;
    };

    voiceRecognition.onend = () => {
        isListening = false;
        if (button) button.textContent = "🎤 Start Listening";
    };

    voiceRecognition.start();
}

function answerVoiceQuestion(transcript, langKey, langCode) {
    const voiceAnswerEl = document.getElementById("voiceAnswer");
    const strings = UI_STRINGS[langKey] || UI_STRINGS.english;
    const question = transcript.toLowerCase();

    const matchKey = findDiseaseMatch(question);

    if (!matchKey) {
        voiceAnswerEl.innerHTML = `<p>${strings.noMatch}</p>`;
        speakText(strings.noMatch, langCode);
        return;
    }

    const match = getLocalizedMatch(langKey, matchKey);

    voiceAnswerEl.innerHTML = `
    <p><strong>${strings.found} ${match.name}:</strong></p>
    <p><strong>${strings.cause}:</strong> ${match.cause}</p>
    <p><strong>${strings.precautions}:</strong> ${match.precautions}</p>
    <p><strong>${strings.remedy}:</strong> ${match.remedy}</p>
  `;

    const spoken = `${match.name}. ${strings.cause}: ${match.cause}. ${strings.precautions}: ${match.precautions}. ${strings.remedy}: ${match.remedy}`;
    speakText(spoken, langCode);
}

function speakText(text, langCode) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // stop any answer currently being read out
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
}
/* ----------------------------------------------------------
   8. SERVICE WORKER REGISTRATION (offline support)
---------------------------------------------------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        const swPath = inPagesFolder ? "../sw.js" : "sw.js";
        navigator.serviceWorker.register(swPath).then((reg) => {
            console.log("Service worker registered:", reg.scope);
        }).catch((err) => {
            console.warn("Service worker registration failed:", err);
        });
    });
}

/* ----------------------------------------------------------
   9. FARM CONTEXT (location, weather, soil, seasonal crops)
   Lives primarily on index.html, but the saved profile is
   read on other pages too (e.g. disease.html summary banner)
---------------------------------------------------------- */

const SOIL_TYPES = ["Sandy", "Clay", "Loamy", "Silty", "Peaty", "Chalky"];

// Very simple rule-based seasonal suggestions.
// Keyed by month (0-11) buckets and soil type. Meant as a helpful
// starting point, not agronomic advice - farmers should still use
// local knowledge and extension services.
const SEASONAL_CROPS = {
    winter: { // Dec, Jan, Feb
        Sandy: ["Carrot", "Radish", "Groundnut"],
        Clay: ["Wheat", "Mustard", "Peas"],
        Loamy: ["Wheat", "Potato", "Peas"],
        Silty: ["Wheat", "Barley", "Spinach"],
        Peaty: ["Cabbage", "Cauliflower", "Lettuce"],
        Chalky: ["Barley", "Spinach", "Beetroot"]
    },
    summer: { // Mar, Apr, May
        Sandy: ["Watermelon", "Muskmelon", "Groundnut"],
        Clay: ["Rice (pre-monsoon nursery)", "Sugarcane"],
        Loamy: ["Maize", "Cotton", "Sunflower"],
        Silty: ["Maize", "Soybean"],
        Peaty: ["Cucumber", "Bottle Gourd"],
        Chalky: ["Millet", "Sunflower"]
    },
    monsoon: { // Jun, Jul, Aug, Sep
        Sandy: ["Groundnut", "Bajra (Pearl Millet)"],
        Clay: ["Rice (Paddy)", "Jute"],
        Loamy: ["Rice", "Maize", "Soybean"],
        Silty: ["Rice", "Sugarcane"],
        Peaty: ["Rice", "Taro"],
        Chalky: ["Bajra", "Sorghum"]
    },
    postMonsoon: { // Oct, Nov
        Sandy: ["Mustard", "Groundnut"],
        Clay: ["Wheat (early sowing)", "Gram"],
        Loamy: ["Wheat", "Gram", "Mustard"],
        Silty: ["Wheat", "Lentil"],
        Peaty: ["Peas", "Cabbage"],
        Chalky: ["Gram", "Mustard"]
    }
};

function getSeasonKey(month) {
    if (month === 11 || month === 0 || month === 1) return "winter";
    if (month >= 2 && month <= 4) return "summer";
    if (month >= 5 && month <= 8) return "monsoon";
    return "postMonsoon";
}

function getSeasonLabel(seasonKey) {
    return {
        winter: "Winter",
        summer: "Summer",
        monsoon: "Monsoon",
        postMonsoon: "Post-Monsoon"
    }[seasonKey];
}

function saveFarmProfile(profile) {
    const existing = JSON.parse(localStorage.getItem("farmProfile") || "{}");
    const merged = { ...existing, ...profile, updatedAt: Date.now() };
    localStorage.setItem("farmProfile", JSON.stringify(merged));
    return merged;
}

function loadFarmProfile() {
    return JSON.parse(localStorage.getItem("farmProfile") || "null");
}

// --- Location detection ---
function detectFarmLocation() {
    const statusEl = document.getElementById("farmLocationValue");
    const subEl = document.getElementById("farmLocationSub");

    if (!statusEl || !subEl) return;

    if (!navigator.geolocation) {
        statusEl.textContent = "Not supported";
        subEl.textContent = "Your browser does not support location detection.";
        return;
    }

    statusEl.textContent = "Detecting...";
    subEl.textContent = "Please allow location access.";

    navigator.geolocation.getCurrentPosition(
        async function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Location detected:", latitude, longitude);

            // Save coordinates only if saveFarmProfile exists
            if (typeof saveFarmProfile === "function") {
                saveFarmProfile({
                    lat: latitude,
                    lon: longitude
                });
            }

            // Show coordinates immediately
            statusEl.textContent = "Location detected";
            subEl.textContent =
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            // Try to get place name
            try {
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );

                if (!response.ok) {
                    throw new Error("Reverse geocoding failed");
                }

                const data = await response.json();

                const placeName = [
                    data.locality,
                    data.principalSubdivision
                ]
                    .filter(Boolean)
                    .join(", ");

                if (placeName) {
                    statusEl.textContent = placeName;

                    if (typeof saveFarmProfile === "function") {
                        saveFarmProfile({
                            placeName: placeName
                        });
                    }
                }

            } catch (error) {
                console.warn("Place name lookup failed:", error);

                statusEl.textContent = "Location detected";
                subEl.textContent =
                    `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }

            // Weather
            fetchFarmWeather(latitude, longitude);
        },

        function (error) {

            console.error("Geolocation error:", error);

            if (error.code === 1) {
                statusEl.textContent = "Permission denied";
                subEl.textContent =
                    "Allow location access in your browser and try again.";
            }
            else if (error.code === 2) {
                statusEl.textContent = "Location unavailable";
                subEl.textContent =
                    "Your device could not determine your location.";
            }
            else if (error.code === 3) {
                statusEl.textContent = "Request timed out";
                subEl.textContent =
                    "Try detecting your location again.";
            }
            else {
                statusEl.textContent = "Location error";
                subEl.textContent = error.message;
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// --- Weather fetch (Open-Meteo, free, no API key required) ---
async function fetchFarmWeather(lat, lon) {
    const tempEl = document.getElementById("farmWeatherValue");
    const subEl = document.getElementById("farmWeatherSub");
    if (!tempEl) return;

    tempEl.textContent = "Loading...";
    subEl.textContent = "";

    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=auto`
        );
        const data = await res.json();
        const current = data.current;

        const weatherLabel = describeWeatherCode(current.weather_code);
        tempEl.textContent = `${Math.round(current.temperature_2m)}°C - ${weatherLabel}`;
        subEl.textContent = `Humidity ${current.relative_humidity_2m}% | Rain ${current.precipitation} mm`;

        saveFarmProfile({
            weather: {
                temp: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                precipitation: current.precipitation,
                label: weatherLabel
            }
        });
    } catch (err) {
        tempEl.textContent = "Unavailable";
        subEl.textContent = "Couldn't reach the weather service (check your connection).";
    }
}

function describeWeatherCode(code) {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 49) return "Foggy";
    if (code <= 59) return "Drizzle";
    if (code <= 69) return "Rain";
    if (code <= 79) return "Snow";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
}

// --- Soil type ---
function saveSoilType() {
    const select = document.getElementById("soilTypeSelect");
    if (!select) return;
    saveFarmProfile({ soilType: select.value });
    renderCropSuggestions();
}

// --- Seasonal crop suggestions ---
function renderCropSuggestions() {
    const container = document.getElementById("cropSuggestions");
    if (!container) return;

    const profile = loadFarmProfile();
    const soilType = (profile && profile.soilType) || "Loamy";
    const seasonKey = getSeasonKey(new Date().getMonth());
    const suggestions = SEASONAL_CROPS[seasonKey][soilType] || [];

    const seasonLabelEl = document.getElementById("currentSeasonLabel");
    if (seasonLabelEl) seasonLabelEl.textContent = getSeasonLabel(seasonKey);

    container.innerHTML = suggestions
        .map((crop) => `<span class="crop-chip">🌾 ${crop}</span>`)
        .join("");
}

// --- Restore saved profile into the form fields on page load ---
function restoreFarmProfileUI() {
    const profile = loadFarmProfile();

    const locationValueEl = document.getElementById("farmLocationValue");
    const locationSubEl = document.getElementById("farmLocationSub");
    if (profile && profile.placeName && locationValueEl) {
        locationValueEl.textContent = profile.placeName;
        locationSubEl.textContent = profile.lat
            ? `${profile.lat.toFixed(3)}, ${profile.lon.toFixed(3)}`
            : "";
    }

    const weatherValueEl = document.getElementById("farmWeatherValue");
    const weatherSubEl = document.getElementById("farmWeatherSub");
    if (profile && profile.weather && weatherValueEl) {
        weatherValueEl.textContent = `${Math.round(profile.weather.temp)}°C - ${profile.weather.label}`;
        weatherSubEl.textContent = `Humidity ${profile.weather.humidity}% | Rain ${profile.weather.precipitation} mm`;
    }

    const soilSelectEl = document.getElementById("soilTypeSelect");
    if (profile && profile.soilType && soilSelectEl) {
        soilSelectEl.value = profile.soilType;
    }

    renderCropSuggestions();
}

// --- Read-only summary banner used on other pages (e.g. disease.html) ---
function renderFarmSummaryBanner() {
    const banner = document.getElementById("farmSummaryBanner");
    if (!banner) return;

    const profile = loadFarmProfile();
    const inPages = window.location.pathname.includes("/pages/");
    const homeLink = inPages ? "../index.html" : "index.html";

    if (!profile || !profile.placeName) {
        banner.innerHTML = `
      🌾 Set up your <a href="${homeLink}">Farm Profile</a> on the Home page to see local weather and seasonal crop tips here.
    `;
        return;
    }

    const seasonKey = getSeasonKey(new Date().getMonth());
    const weatherText = profile.weather
        ? `${Math.round(profile.weather.temp)}°C, ${profile.weather.label}`
        : "Weather not set";

    banner.innerHTML = `
    📍 <strong>${profile.placeName}</strong>
    &nbsp;|&nbsp; ☁️ ${weatherText}
    &nbsp;|&nbsp; 🌱 Soil: ${profile.soilType || "not set"}
    &nbsp;|&nbsp; 🗓️ ${getSeasonLabel(seasonKey)} season
    &nbsp;|&nbsp; <a href="${homeLink}">Update</a>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
    restoreFarmProfileUI();
    renderFarmSummaryBanner();
});


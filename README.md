# CropHealth

> **AI-Powered Crop Health & Smart Farming Assistant**

CropHealth is a farmer-focused smart agriculture platform that combines **AI-based crop disease detection, AI-assisted recommendations, detection history, weather information, location services, soil insights, educational resources, and offline-capable web technology** into a single accessible platform.

The objective is to help farmers identify potential crop health problems earlier, understand relevant environmental conditions, review previous observations, and access information that supports better field-level decisions.

---

## Overview

Farmers often face challenges in identifying crop diseases, understanding environmental conditions, accessing agricultural knowledge, and obtaining timely guidance.

CropHealth addresses these challenges through an integrated digital platform that allows users to:

* Upload or capture crop images.
* Detect potential crop diseases using an AI/ML model.
* Receive AI-assisted crop-health recommendations.
* Access disease information and preventive actions.
* Maintain and review previous detection results.
* Check weather conditions using location-based information.
* Use location services for geographically relevant functionality.
* Access soil-related information.
* Explore agricultural educational resources.
* Submit feedback and information through online forms.
* Use supported application features with limited connectivity through PWA and caching technologies.

---

# Key Features

## 1. AI-Based Crop Disease Detection

CropHealth uses a trained machine-learning model to analyze crop images and classify potential crop diseases.

**Capabilities include:**

* Image upload for disease detection.
* Live camera capture for field-level image analysis.
* Browser-based AI inference.
* Disease classification using a trained model.
* Disease-specific information.
* AI-assisted recommendations and preventive guidance.
* Support for future expansion to additional crops and disease classes.

---

## 2. AI-Assisted Recommendations

After detecting a potential disease, CropHealth provides relevant crop-health guidance based on the detected result.

The recommendation layer is designed to help users understand:

* Potential crop-health issues.
* Preventive practices.
* Basic management actions.
* Relevant crop-health information.

> AI-generated or model-assisted recommendations should be treated as preliminary guidance and verified with qualified agricultural experts when necessary.

---

## 3. Detection History

CropHealth provides a history of previous crop-health analyses, allowing users to review earlier detection results and monitor their crop-health observations over time.

**Capabilities include:**

* Review previous detection results.
* View earlier crop-health observations.
* Track historical disease analysis.
* Maintain a chronological record of crop analysis.
* Refer to previous results when evaluating current crop conditions.

---

## 4. Weather Detection

CropHealth provides weather information using location-aware functionality.

Weather information can help users understand environmental conditions relevant to agricultural activities such as:

* Irrigation planning.
* Field operations.
* Crop protection.
* Monitoring changing weather conditions.

---

## 5. Location Services

The application uses browser-based geolocation capabilities to obtain the user's location with permission.

Location information can be used for:

* Location-aware weather information.
* Region-specific agricultural functionality.
* Future location-based crop and soil services.

---

## 6. Soil Information

CropHealth provides soil-related information to support crop-health awareness and agricultural decision-making.

The platform architecture can be extended in the future with:

* Soil moisture sensors.
* Soil nutrient data.
* IoT-based soil monitoring.
* Region-specific soil recommendations.

---

## 7. Live Camera Capture

Users can capture crop images directly through their device camera.

This provides a convenient workflow:

```text
Open Camera
     ↓
Capture Crop Image
     ↓
Analyze Image
     ↓
AI Disease Detection
     ↓
AI-Assisted Recommendations
     ↓
Save / Review Detection History
```

This is particularly useful for field situations where users want to analyze a crop without first saving an image separately.

---

## 8. Educational Resources

CropHealth integrates educational resources to improve agricultural awareness and learning.

**Teachable** is used to support structured learning and educational content related to agriculture and crop health.

The educational layer can help users learn about:

* Crop diseases.
* Preventive practices.
* Agricultural techniques.
* Crop-health awareness.

---

## 9. Feedback & Data Collection

**FormsFree** is integrated for form-based submissions and feedback collection.

This enables users to provide:

* Feedback.
* Suggestions.
* Relevant information.
* User responses.

---

## 10. Offline & PWA Support

CropHealth uses Progressive Web App technologies to improve accessibility when network connectivity is limited.

The application uses:

* Service Worker
* Cache API
* Web App Manifest
* Browser caching
* Locally available application resources
* Browser-based AI inference

Supported resources can remain accessible after they have been cached.

> Features that depend on external APIs or third-party services may still require an active internet connection.

---

## 11. Responsive Design

CropHealth is designed to work across different devices, including:

* Smartphones
* Tablets
* Laptops
* Desktop computers

---

# AI & Machine Learning

CropHealth uses a browser-based machine-learning architecture.

## AI Technology Stack

```text
Teachable Machine
        │
        ▼
   Trained ML Model
        │
        ├── model.json
        ├── metadata.json
        └── weights.bin
        │
        ▼
   TensorFlow.js
        │
        ▼
Browser-Based Inference
        │
        ▼
Disease Classification
        │
        ▼
AI-Assisted Recommendations
        │
        ▼
Detection History
```

## Model Components

| File            | Purpose                              |
| --------------- | ------------------------------------ |
| `model.json`    | Model architecture and configuration |
| `metadata.json` | Model metadata and class information |
| `weights.bin`   | Trained model weights                |

The model can perform inference directly in the browser, reducing the need to send every crop image to a remote AI inference server.

---

# System Workflow

```text
                         ┌─────────────────────┐
                         │      CropHealth     │
                         │   Smart Farming App │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Image / Camera           Location            Farmer Input
              │                     │                     │
              ▼                     ▼                     ▼
      Image Preprocessing     Weather API          FormsFree
              │                     │
              ▼                     ▼
      ┌─────────────────┐      Weather Data
      │    AI / ML      │
      │ Teachable       │
      │ Machine +       │
      │ TensorFlow.js   │
      └────────┬────────┘
               │
               ▼
      Disease Classification
               │
               ▼
       Disease Identification
               │
               ├──────────────────► Detection History
               │
               ▼
      ┌─────────────────────┐
      │ AI-Assisted         │
      │ Recommendations     │
      └──────────┬──────────┘
                 │
                 ▼
       Disease Information
       + Preventive Actions
       + Crop Health Guidance
                 │
                 └──────────────┐
                                ▼
                     ┌────────────────────┐
                     │ Farmer Decision    │
                     │      Support       │
                     └────────────────────┘
```

---

# AI Disease Detection Workflow

```text
Crop Image / Live Camera
          │
          ▼
  Image Preprocessing
          │
          ▼
┌─────────────────────────┐
│       AI / ML MODEL     │
│                         │
│  Teachable Machine      │
│          +              │
│     TensorFlow.js       │
└────────────┬────────────┘
             │
             ▼
   Disease Classification
             │
             ▼
    Disease Identification
             │
             ├──────────────► Detection History
             │
             ▼
┌─────────────────────────┐
│ AI-Assisted             │
│ Recommendations         │
└────────────┬────────────┘
             │
             ▼
    Disease Information
             │
             ▼
 Preventive & Management
        Actions
             │
             ▼
    Farmer Decision
        Support
```

---

# Technology Stack

## Frontend

* **HTML5** — Application structure
* **CSS3** — Responsive user interface
* **JavaScript** — Application logic and feature integration
* **Browser APIs** — Camera, geolocation and other web capabilities

## Artificial Intelligence

* **Teachable Machine** — Machine-learning model training
* **TensorFlow.js** — Browser-based inference
* `model.json`
* `metadata.json`
* `weights.bin`

## External Services

* **Weather API** — Weather information
* **Geolocation API** — Location detection
* **FormsFree** — Form submission and feedback
* **Teachable** — Educational resources

## Progressive Web App

* Service Worker
* Cache API
* Web App Manifest
* Browser caching
* Offline-capable application resources

## Deployment

* **Render** — Application deployment and hosting

---

# Architecture

```text
┌───────────────────────────────────────────────────┐
│                    CropHealth                     │
├───────────────────────────────────────────────────┤
│                                                   │
│                 User Interface                   │
│             HTML + CSS + JavaScript              │
│                         │                         │
│       ┌─────────────────┼─────────────────┐       │
│       │                 │                 │       │
│       ▼                 ▼                 ▼       │
│    Camera            Location         User Input │
│       │                 │                 │       │
│       ▼                 ▼                 ▼       │
│    AI / ML           Weather          FormsFree  │
│  TensorFlow.js          API                      │
│       │                                           │
│       ▼                                           │
│ Disease Classification                            │
│       │                                           │
│       ├──────────────► Detection History          │
│       │                                           │
│       ▼                                           │
│ AI-Assisted Recommendations                       │
│       │                                           │
│       ▼                                           │
│ Crop Health Decision Support                     │
│                                                   │
├───────────────────────────────────────────────────┤
│              PWA / Offline Layer                 │
│       Service Worker + Cache + Manifest          │
└───────────────────────────────────────────────────┘
```

---

# Project Structure

```text
CropHealth/
│
├── css/
│   └── stylesheets
│
├── icons/
│   └── application icons
│
├── model/
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
│
├── pages/
│   └── application pages
│
├── server/
│   └── server-side components
│
├── .gitignore
├── LICENSE
├── README.md
├── hybridDetection.js
├── index.html
├── manifest.json
├── script.js
└── sw.js
```

> The exact contents of individual directories may change as the project evolves.

---

# Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/singhshashank9280-prog/CropHealth.git
cd CropHealth
```

## 2. Run Using a Local Server

CropHealth uses browser capabilities such as camera access, geolocation, Service Workers, and model loading. Therefore, running the project through a local HTTP server is recommended.

For example, using Python:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

Alternatively, the project can be opened using the **Live Server** extension in Visual Studio Code.

---

# Offline Capability

CropHealth is designed with low-connectivity environments in mind.

The offline architecture works through:

```text
                 Browser
                    │
                    ▼
             Service Worker
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    Cached Resources      Local Model
          │                   │
          └─────────┬─────────┘
                    ▼
              Offline Usage
```

## Potentially available offline after caching

* Application interface
* Static assets
* Cached resources
* Locally stored AI model
* Browser-based AI inference
* Previously available detection history, where stored locally

## Requires internet connectivity

Depending on implementation and availability:

* Weather API
* External educational services
* FormsFree
* Other external APIs

---

# Detection History

Detection history helps users review their previous crop-health analyses.

The history layer can provide:

* Previous disease detection results.
* Earlier crop-health observations.
* Historical analysis records.
* Chronological review of previous detections.
* A reference point for comparing later crop observations.

This feature is intended to make CropHealth more useful as a continuing crop-health monitoring tool rather than only a one-time disease detector.

---

# Privacy & Permissions

CropHealth may request browser permissions when specific functionality is used.

## Camera

Camera access is requested when the user chooses live image capture.

## Location

Location access is requested when location-based features such as weather information are used.

Permissions are handled through standard browser permission mechanisms and require user approval.

---

# Problem Statement

Farmers can face difficulty in obtaining timely information about crop diseases, environmental conditions, soil characteristics, and suitable agricultural practices.

Manual disease identification can be challenging, while access to agricultural guidance may not always be immediate.

CropHealth aims to reduce this information gap by providing an integrated digital platform for **crop-health detection, AI-assisted recommendations, environmental awareness, historical tracking, educational support, and decision-making assistance**.

---

# Proposed Solution

CropHealth provides a centralized platform where users can:

1. Capture or upload a crop image.
2. Process the image using an AI/ML model.
3. Identify a potential crop disease.
4. Receive AI-assisted recommendations.
5. Save and review previous detection results.
6. Access disease and crop-health information.
7. Check location-based weather conditions.
8. Access soil-related information.
9. Explore agricultural educational resources.
10. Submit feedback.
11. Use supported features with limited connectivity.

---

# Innovation

The key innovation of CropHealth is the integration of multiple agricultural technologies into a single farmer-focused platform.

## Integrated Approach

```text
AI Disease Detection
        +
AI-Assisted Recommendations
        +
Detection History
        +
Weather
        +
Location
        +
Soil Information
        +
Agricultural Education
        +
Offline/PWA Support
        ↓
Smart Crop Health Assistance
```

Instead of focusing only on image classification, CropHealth combines disease detection with contextual agricultural information and historical observations to support better decision-making.

---

# Impact

CropHealth is designed to contribute toward:

* Earlier identification of potential crop diseases.
* Improved agricultural awareness.
* Faster access to crop-health information.
* AI-assisted recommendations for potential crop-health issues.
* Better understanding of environmental conditions.
* Historical tracking of crop-health observations.
* More informed field-level decisions.
* Improved access to agricultural education.
* Greater accessibility in low-connectivity environments.
* Increased adoption of AI-assisted agricultural technologies.

---

# Future Scope

The platform can be extended with:

* IoT-based real-time soil monitoring.
* Soil moisture and nutrient sensors.
* Larger crop and disease datasets.
* More advanced AI/LLM-based agricultural assistance.
* Multilingual voice-based interaction.
* Regional crop recommendations.
* Pest and disease outbreak alerts.
* Fertilizer recommendations.
* Smart irrigation recommendations.
* Crop price and market information.
* Expert consultation.
* Farmer community features.
* Advanced historical crop-health analytics.
* Satellite and remote-sensing integration.

---

# Security & Reliability

* Sensitive API keys should not be exposed in client-side code.
* Production services should use HTTPS.
* User permissions should be requested only when required.
* External API requests should be validated and protected appropriately.
* AI predictions should be considered preliminary assistance rather than guaranteed agricultural diagnosis.
* Agricultural recommendations should be verified with qualified experts for critical decisions.

---

# Project Highlights

* **AI-powered crop disease detection**
* **AI-assisted crop-health recommendations**
* **Live camera-based crop analysis**
* **Crop disease detection history**
* **Historical crop-health tracking**
* **Weather-aware agricultural information**
* **Location-based functionality**
* **Soil-related information**
* **Teachable educational integration**
* **FormsFree-based feedback collection**
* **Browser-based TensorFlow.js inference**
* **Progressive Web App architecture**
* **Offline-capable cached resources**
* **Responsive farmer-focused interface**
* **Modular and extensible architecture**
* **Cloud deployment support through Render**

---

# Deployment

CropHealth is designed for web deployment and can be deployed through **Render**.

For the final submission, the production URL should point to the currently active deployment.

## Live Demo

[CropHealth Live Demo](https://singhshashank9280-prog.github.io/CropHealth/?utm_source=chatgpt.com)

> **Before final submission:** If your final production deployment is hosted on Render, replace the GitHub Pages link above with your actual Render URL. Do not list a Render deployment unless that URL is active and working.

## GitHub Repository

[CropHealth GitHub Repository](https://github.com/singhshashank9280-prog/CropHealth?utm_source=chatgpt.com)

---

# Acknowledgement

CropHealth was developed with the objective of applying modern web technologies and artificial intelligence to practical agricultural challenges.

The project combines **machine learning, browser APIs, external services, Progressive Web App technologies, historical tracking, and farmer-focused design** to create an accessible crop-health assistance platform.

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

## Final Project Vision

> **CropHealth aims to make AI-powered crop-health assistance more accessible by bringing disease detection, AI-assisted recommendations, detection history, weather, location, soil information, education, and offline-capable technology together in one farmer-focused platform.**

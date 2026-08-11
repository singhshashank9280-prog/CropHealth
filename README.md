# CropHealth

> **AI-Powered Crop Health & Smart Farming Assistant**

CropHealth is an intelligent, farmer-focused web platform designed to help farmers identify crop diseases, understand crop and soil conditions, monitor environmental factors, and make better agricultural decisions through AI-powered assistance.

The platform combines **AI-based disease detection, weather information, location services, soil insights, educational resources, and an interactive farming interface** into a single accessible solution.

---

## Overview

Agricultural productivity is strongly affected by crop diseases, changing weather conditions, soil characteristics, and limited access to timely agricultural guidance.

**CropHealth** addresses these challenges by providing farmers with a centralized digital platform that can:

* Detect crop diseases from plant images.
* Provide information about detected diseases and possible remedies.
* Capture images directly through a device camera.
* Provide weather information based on location.
* Use location services to provide geographically relevant information.
* Provide soil-related information and insights.
* Offer agricultural learning resources.
* Support interaction through a simple, farmer-friendly interface.
* Provide functionality with limited or no internet connectivity for supported features.

---

## Key Features

### AI-Based Crop Disease Detection

* Upload a crop/leaf image for disease analysis.
* Supports direct image capture using the device camera.
* AI model analyzes the image and identifies the probable crop disease.
* Displays disease-related information and recommended actions.
* Designed to provide fast and accessible preliminary crop health assessment.

### Weather Detection

* Retrieves weather information based on the user's location.
* Helps farmers understand current environmental conditions.
* Weather information can support better decisions related to irrigation, crop protection, and field activities.

### Location Services

* Uses browser-based geolocation capabilities.
* Detects the user's geographical location with permission.
* Enables location-aware agricultural information and weather services.

### Soil Information

* Provides soil-related information to support agricultural decision-making.
* Helps connect crop health with environmental and soil conditions.
* Can be extended with additional soil parameters and IoT-based data sources.

### Live Camera Capture

* Allows users to capture crop images directly from their device.
* Eliminates the need to first save an image before analysis.
* Makes disease detection more convenient for field use.

### AI / Machine Learning Integration

* Uses a trained machine-learning model for crop disease classification.
* Model assets include trained model files and metadata.
* Designed for browser-based inference.
* The architecture allows future integration with more advanced AI models.

### Educational Resources

* Provides agricultural learning and awareness content.
* Uses **Teachable** to support structured educational resources and learning material.
* Helps users understand crop diseases, preventive practices, and agricultural techniques.

### Farmer Feedback & Data Collection

* Uses **FormsFree** for form-based submissions and feedback collection.
* Enables users to submit information without requiring a dedicated backend form-processing system.

### Offline Support

* Includes Progressive Web App functionality for supported resources.
* Uses service-worker-based caching to improve accessibility when connectivity is limited.
* Important static resources can remain available after they have been cached.
* Designed with rural and low-connectivity environments in mind.

### Responsive Interface

* Designed to work across:

  * Desktop
  * Laptop
  * Tablet
  * Mobile devices

---

## Technology Stack

### Frontend

* **HTML5** — Application structure and semantic content
* **CSS3** — Responsive design and interface styling
* **JavaScript** — Application logic and feature integration
* **Web APIs** — Camera, Geolocation and browser capabilities

### AI / Machine Learning

* **Teachable Machine** — Model training and classification
* **TensorFlow.js** — Browser-based machine-learning inference
* `model.json` — Model architecture
* `metadata.json` — Model metadata and class information
* `weights.bin` — Trained model weights

### External Services

* **Weather API** — Weather and environmental information
* **Geolocation API** — Location detection
* **FormsFree** — Form submission and feedback handling
* **Teachable** — Educational and learning resources

### PWA / Offline

* Service Worker
* Cache API
* Web App Manifest
* Local browser caching

### Deployment

* **Render** — Production deployment and hosting

---

## System Workflow

```text
                 ┌─────────────────────┐
                 │      CropHealth     │
                 │     Web Platform    │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   Image / Camera       Location          User Input
          │                 │                 │
          ▼                 ▼                 ▼
   AI Disease Model    Geolocation API     FormsFree
          │                 │
          ▼                 ▼
   Disease Result       Weather Data
          │
          ▼
   Crop Health Guidance
          │
          ▼
   Farmer Decision Support
```

---

## AI Disease Detection Workflow

```text
Crop Image
    │
    ▼
Image Upload / Camera Capture
    │
    ▼
Image Preprocessing
    │
    ▼
TensorFlow.js Model
    │
    ▼
Disease Classification
    │
    ▼
Prediction Result
    │
    ▼
Disease Information
    │
    ▼
Recommended Preventive / Management Actions
```

---

## Project Structure

```text
CropHealth/
│
├── index.html
├── disease.html
├── soil.html
├── weather.html
├── location.html
│
├── css/
│   └── *.css
│
├── js/
│   └── *.js
│
├── model/
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
│
├── assets/
│   └── images/
│
├── manifest.json
├── service-worker.js
├── metadata.json
└── README.md
```

> File and folder names may vary depending on the current project structure.

---

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/singhshashank9280-prog/CropHealth.git
cd CropHealth
```

### 2. Run Using a Local Server

Because CropHealth uses browser APIs such as **Geolocation, Camera access, Service Workers, and machine-learning model loading**, running it through a local server is recommended instead of opening the HTML files directly.

For example, using VS Code:

```text
Live Server → Open with Live Server
```

Or using another local HTTP server:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

---

## Deployment

CropHealth is deployed using **Render**.

The application can be connected to the GitHub repository so that updates can be deployed from the project repository.

Production deployment:

[CropHealth Live Application](https://singhshashank9280-prog.github.io/CropHealth/?utm_source=chatgpt.com)

> The production URL may be updated if the project is moved to a Render-managed public URL.

---

## Offline Capability

CropHealth is designed with accessibility in low-connectivity environments in mind.

The Progressive Web App architecture uses:

```text
Browser
   │
   ▼
Service Worker
   │
   ├── Cache Static Files
   ├── Cache Application Resources
   └── Serve Cached Resources
             │
             ▼
        Offline Access
```

### Offline-supported components

Depending on whether the required resources have already been cached:

* Application interface
* Static assets
* Previously cached resources
* Locally available AI model
* Browser-based AI inference

### Internet-dependent components

Some features require an active internet connection, including external APIs and third-party services.

---

## Privacy & Permissions

CropHealth may request browser permissions for certain functionality.

### Camera Permission

Required when the user chooses live image capture for crop disease detection.

### Location Permission

Required to retrieve the user's location for location-aware functionality and weather information.

Permissions are requested through standard browser APIs and depend on the user's approval.

---

## Problem Statement

Farmers often face difficulties in obtaining timely and reliable information about crop diseases, weather conditions, soil characteristics, and appropriate agricultural practices.

Traditional approaches may require farmers to identify diseases manually or depend on delayed access to agricultural experts.

CropHealth aims to reduce this information gap by bringing multiple agricultural support capabilities into one accessible digital platform.

---

## Solution

CropHealth provides a unified platform where farmers can:

1. Capture or upload a crop image.
2. Analyze the image using an AI model.
3. Identify the probable crop disease.
4. Access relevant crop-health information.
5. Check weather conditions.
6. Use location-aware functionality.
7. Explore soil-related information.
8. Access educational resources.
9. Submit feedback and information.
10. Continue using supported functionality in low-connectivity environments.

---

## Innovation

CropHealth focuses on combining multiple agricultural technologies into a single farmer-oriented platform rather than providing only disease classification.

### Core Innovation

**AI + Weather + Location + Soil + Education + Offline Accessibility**

This integrated approach helps transform individual AI predictions into a broader crop-health decision-support experience.

---

## Impact

CropHealth is designed to contribute toward:

* Earlier identification of crop diseases
* Improved agricultural awareness
* Better access to farming information
* More informed field-level decisions
* Reduced dependence on manual disease identification
* Improved accessibility in low-connectivity environments
* Greater adoption of digital agricultural technologies

---

## Future Scope

The platform can be further enhanced with:

* IoT-based real-time soil monitoring
* Soil moisture and nutrient sensors
* More crop and disease classes
* Advanced AI/LLM-based agricultural assistance
* Multilingual voice-based interaction
* Regional crop recommendations
* Pest and disease outbreak alerts
* Fertilizer and irrigation recommendations
* Crop price and market information
* Farmer community and expert consultation
* Historical crop-health tracking
* Satellite and remote-sensing integration

---

## Security & Reliability Considerations

* API keys and sensitive credentials should be stored securely rather than exposed in client-side source code.
* External services should use HTTPS.
* User permissions should be requested only when required.
* AI predictions should be treated as preliminary assistance rather than a guaranteed agricultural diagnosis.
* Production deployments should use appropriate API security, validation, and rate limiting.

---

## Project Highlights

* **AI-powered crop disease detection**
* **Live camera-based crop analysis**
* **Weather-aware agricultural assistance**
* **Location-based functionality**
* **Soil information**
* **Teachable educational integration**
* **FormsFree-based feedback/data collection**
* **Progressive Web App architecture**
* **Offline support for cached resources**
* **Responsive farmer-friendly interface**
* **Browser-based machine-learning inference**
* **Cloud deployment through Render**

---

## Repository

[CropHealth GitHub Repository](https://github.com/singhshashank9280-prog/CropHealth?utm_source=chatgpt.com)

## Live Demo

[CropHealth Live Demo](https://singhshashank9280-prog.github.io/CropHealth/?utm_source=chatgpt.com)

---

## Acknowledgement

CropHealth was developed with the goal of applying modern web technologies and artificial intelligence to practical agricultural challenges.

The project integrates machine learning, browser APIs, external services, and Progressive Web App technologies to create a scalable digital solution for crop-health assistance.

---

## License

This project is intended for educational, research, and innovation purposes.

Add an appropriate open-source license to the repository if the project is intended for public redistribution.


# 🖥️ GCP Vertex AI + Google AI Ultra Model Inventory & Reconciliation (June 2026)

## 📋 Executive Summary
This document provides a comprehensive reconciliation of all Google Generative Media models (video, audio, and image) available in the GCP project `darius-star-game` (region `us-central1`) and through the consumer Google AI Ultra subscription.

A key discovery in this research resolves prior `404` errors encountered by the engineering team when attempting to call Veo and Imagen models:
* **The Root Cause:** Vertex AI requires specific **stable versioned identifiers** (e.g., `-001` or `-002` suffixes) for prediction requests. Standard generic preview identifiers (such as `veo-3.1`, `veo-3.1-generate-preview`, or `imagen-3.1`) return `404 Not Found`.
* **The Fix:** Calling the stable model identifiers (such as `veo-3.1-generate-001`, `veo-3.1-lite-generate-001`, and `imagen-3.0-generate-002`) succeeds with `HTTP 200 OK`.
* **Imagen 4 Series:** Probes successfully verified that the newer Imagen 4 series models (`imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, and `imagen-4.0-fast-generate-001`) are also fully active and available.

---

## 📊 Summary Table of Generative Models

| Model ID | Type | Available? | Access Path | Cost (Est.) | Default Quota (RPM) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lyria-002` | Audio/Music | **Yes** | `publishers/google/models/lyria-002` | Pay-as-you-go | Gated (Custom) |
| `lyria-003` | Audio/Music | **No** (404) | N/A | N/A | N/A |
| `veo-3.1-generate-001` | Video | **Yes** | `publishers/google/models/veo-3.1-generate-001` | $0.40 - $0.75 / sec | 10 - 50 RPM |
| `veo-3.1-lite-generate-001` | Video | **Yes** | `publishers/google/models/veo-3.1-lite-generate-001` | $0.03 - $0.10 / sec | 1 request/min (project limit) |
| `veo-3.0-generate-001` | Video | **Yes** | `publishers/google/models/veo-3.0-generate-001` | $0.40 - $0.75 / sec | 10 - 50 RPM |
| `veo-2.0-generate-001` | Video | **Yes** | `publishers/google/models/veo-2.0-generate-001` | $0.40 - $0.75 / sec | 10 - 50 RPM |
| `veo-3.1-generate-preview` | Video | **No** (404) | N/A | N/A | N/A |
| `veo-3.1-lite-generate-preview` | Video | **No** (404) | N/A | N/A | N/A |
| `imagen-3.0-generate-002` | Image | **Yes** | `publishers/google/models/imagen-3.0-generate-002` | $0.04 - $0.05 / img | 120 RPM (1 req/min in game) |
| `imagen-3.0-generate-001` | Image | **Yes** (429)* | `publishers/google/models/imagen-3.0-generate-001` | $0.04 - $0.05 / img | 120 RPM |
| `imagen-3.0-fast-generate-001` | Image | **Yes** | `publishers/google/models/imagen-3.0-fast-generate-001` | $0.02 - $0.03 / img | 120 RPM |
| `imagen-4.0-generate-001` | Image | **Yes** | `publishers/google/models/imagen-4.0-generate-001` | $0.04 - $0.05 / img | Gated (Custom) |
| `imagen-4.0-ultra-generate-001` | Image | **Yes** | `publishers/google/models/imagen-4.0-ultra-generate-001` | $0.06 - $0.08 / img | Gated (Custom) |
| `imagen-4.0-fast-generate-001` | Image | **Yes** | `publishers/google/models/imagen-4.0-fast-generate-001` | $0.02 - $0.03 / img | Gated (Custom) |
| `imagen-3.1` | Image | **No** (404) | N/A | N/A | N/A |
| `imagen-3.0-generate-preview` | Image | **No** (404) | N/A | N/A | N/A |

> [!NOTE]
> `*imagen-3.0-generate-001` returned a `429 Rate Limited` response during automated probing, confirming the model exists and is reachable, though currently constrained under standard quotas.

---

## 🔎 Detailed Breakdown by Model Family

### 1. Lyria (Audio / Music Generation)
* **Status:** `lyria-002` is the only working music generation model on Vertex AI. All other variants, such as `lyria-003`, return `404`.
* **Quotas & Limits:** Billed on a pay-as-you-go basis. Access is strictly gated and requires allowlisting from Google. gRPC calls using the `PredictionServiceClient` take approximately 40 seconds to process a prediction.
* **recitation Checks:** The API actively filters generated outputs. Basic, repetitive prompts (e.g. *"single piano note C major"*) will trigger recitation checks and fail with a `400 Bad Request: All responses were blocked by recitation checks`. Prompts must be complex and narrative (e.g., see [lyria-main-theme-prompts.md](file:///home/ubuntu/work/darius-star/docs/lyria-main-theme-prompts.md) in the project).

### 2. Veo (High-Fidelity Video Generation)
* **Status:** `veo-3.1-generate-001`, `veo-3.1-lite-generate-001`, `veo-3.0-generate-001`, and `veo-2.0-generate-001` are active and accessible. Preview model names (`veo-3.1-generate-preview`, `veo-3.1-lite-generate-preview`) return `404`.
* **Limits:** 
  * Standard Veo has a minimum duration requirement of **4 seconds** per video and supports up to **1080p resolution**. 
  * The current project limits generation to **1 request per minute** (enforced by code delays of 90s in [veo_client.py](file:///home/ubuntu/work/darius-star/tools/veo_client.py)).
* **Pricing:** Standard video generation is billed per-second ($0.40–$0.75/sec), while Veo Lite starts lower ($0.03–$0.10/sec).

### 3. Imagen (Image Generation)
* **Status:** Imagen 3 (`imagen-3.0-generate-002`, `imagen-3.0-fast-generate-001`) and Imagen 4 (`imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001`) are active. Generic versions like `imagen-3.1` or `imagen-3.0-generate-preview` return `404`.
* **Limits:** Maximum resolution is **1024x1024** (standard) or **1408x1408** (wide). Generates static square or wide format assets.
* **Pricing:** Standard is ~$0.04/image, Fast is ~$0.02/image, and Imagen 4 Ultra is ~$0.06/image.

---

## 💳 Google AI Ultra Subscription ($100/mo)

The consumer **Google AI Ultra** subscription is the flagship personal AI tier. It includes:
1. **Gemini Consumer Experience:** Access to Gemini Advanced (powered by Gemini 1.5 Pro / Ultra models) with 20x higher usage limits than the Pro subscription.
2. **Google Flow & Creative Tools:** Standard access to web-based generation studios (Flow Music, Flow Video) using Veo and Imagen technologies.
3. **Storage & Media:** Starts at **20 TB** of Google One storage and includes an individual **YouTube Premium** subscription.
4. **Developer Cloud Credits:** Crucially, subscribers receive **$100/month** in Google Cloud Platform (GCP) credits to bridge development and prototyping.

---

## 🛡️ Billing Boundary & Credit Routing

The separation between consumer generative AI tools (Google AI Studio/API Keys) and enterprise systems (Vertex AI) requires careful billing architecture:

```mermaid
flowchart TD
    subgraph Billing Ecosystem
        UltraSub[Google AI Ultra Subscription - $100/mo] -->|Grants| GCPCredits[GCP Developer Credits - $100/mo]
        GCPBill[Separate GCP Billing Account] -->|Billed To| GCPCard[Linked Corporate Credit Card]
    end

    subgraph Vertex AI (darius-star-game)
        VertexAPI[Vertex AI API Endpoint Calls]
        VertexAPI -->|Billed Directly To| GCPBill
        GCPCredits -->|Applied to offset bill| GCPBill
    end

    subgraph Google AI Studio (generativelanguage.googleapis.com)
        StudioAPI[Google AI Studio API Key Calls]
        StudioAPI -->|Billed to separate Studio Billing| StudioAccount[AI Studio Pay-As-You-Go]
    end

    style UltraSub fill:#2a3a5a,stroke:#3b5a8a,stroke-width:2px,color:#fff
    style VertexAPI fill:#2a5a3a,stroke:#3b8a5a,stroke-width:2px,color:#fff
    style StudioAPI fill:#5a2a2a,stroke:#8a3b3b,stroke-width:2px,color:#fff
```

### Key Rules:
1. **Vertex AI Billing:** Calls made to Vertex AI endpoints (`publishers/google/models/...`) are billed directly to the GCP project's Google Cloud billing account.
2. **Applying Credits:** If the personal or developer account hosting `mbgulden@gmail.com` links the $100/month developer credit to the billing account of `darius-star-game`, the credits **will successfully offset** the Vertex AI usage costs.
3. **Google AI Studio boundary:** Calling direct APIs via Google AI Studio (`generativelanguage.googleapis.com` with API keys, as in [gemini_tts_client.py](file:///home/ubuntu/work/darius-star/tools/gemini_tts_client.py)) is billed separately. Personal developer credits **do not automatically apply** to these direct API keys, and developers will be billed pay-as-you-go if they exceed the free tier.

---

## 🤖 AGY Capabilities & Local Integration

The AI Agentic swarm (AGY) operates as a text-only orchestration core:
* **Models Utilized:** Gemini 3.5 Flash, Gemini 3.1 Pro, Claude 3.5 Sonnet, Claude 3 Opus, and GPT-OSS.
* **Media Generation:** AGY does not natively generate video, audio, or voice outputs. Instead, it relies on local tooling and plugins.
* **Local Tooling Integration:** The game codebase features specialized local scripts that developers or agents execute inside terminal sessions to generate media:
  1. **Audio (Lyria 2):** [generate_audio.py](file:///home/ubuntu/work/darius-star/tools/generate_audio.py) wraps Vertex AI's `PredictionServiceClient` to generate background music.
  2. **Video (Veo 3.1):** [veo_client.py](file:///home/ubuntu/work/darius-star/tools/veo_client.py) calls Vertex AI's `predictLongRunning` for sprite cycles and biome animations.
  3. **Voice (Gemini TTS):** [gemini_tts_client.py](file:///home/ubuntu/work/darius-star/tools/gemini_tts_client.py) routes TTS voice generation (e.g., characters Darius, Lyra, Naya) through Google AI Studio.

---

## 🔒 GA vs Gated Access

1. **GA (General Availability):**
   * **Imagen 3 / 4:** General availability. No allowlisting required. Simply enable Vertex AI API.
   * **Gemini Pro/Flash:** General availability.
2. **Gated (Allowlist Required):**
   * **Veo 3.1 / 3.0 / 2.0:** Requires selecting the model in the Vertex AI Model Garden and accepting terms. Our project (`darius-star-game`) is already allowlisted.
   * **Lyria 002:** Strictly gated. Requires account-level Google representative approval. Our project is allowlisted.

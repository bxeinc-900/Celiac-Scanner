---
name: camera-scanner-workflow
description: Handlers the user taking a photo of food packaging, triggers the Celiac Safe Reference Engine, and displays results in a modern UI modal.
---
# Camera Scanner Workflow

## Goal

To orchestrate the end-to-end user experience of scanning a food item: from capturing the raw image to displaying a verified safety report in the mobile app.

## Instructions

1. **Trigger on Capture:** When the user takes a photo via the `CameraScanner` component, immediately capture the image URI.
2. **Call Reference Engine:** Invoke the `celiac-safe-reference-engine`.md skill.
   - Pass the image data as the primary input.
   - Instruct the engine to perform "Chain-of-Verification" (CoV) on ingredients and cross-contamination warnings.
3. **UI State Management:**
   - While the engine is processing, update the `AnalysisOverlay` component to show a 'Sifting Ingredients...' skeleton loader using the Dark Green motif.
4. **Result Transformation:** - Once the Reference Engine returns data, map the 'Safety Status' to the `SafetyCard` component.
   - If 'Gluten Found': Set theme to Coral Red and list specific triggers.
   - If 'Celiac Safe': Set theme to Emerald Green.
5. **Display Result:** Trigger the `ModalPanel` to slide up from the bottom of the screen, presenting the finalized information with a 'Certainty Rating' based on the AI's confidence.

## Constraints

- Never show the raw JSON output to the user.
- Always ensure the modal has a 'Close' and 'Save to History' button.
- If the image is too blurry for the Reference Engine, trigger the 'Blurry Image' UI state within the skill instead of failing silently.

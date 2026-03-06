---
name: celiac_safe_reference_engine
description: Real-time verification process that accepts text extracted from food packaging (barcode or ingredients list) and determines the probability of Celiac safety.
---

# Goal
Create a real-time verification process that accepts text extracted from food packaging (barcode or ingredients list) and determines the probability of Celiac safety by cross-referencing a defined set of trusted Celiac-disease resources.

## I. Define Trusted Knowledge Domains
The following domains are defined as the "Ground Truth" for Celiac safety (known as the Celiac Reference Suite):

* **General Resource:** `beyondceliac.org` (Focus: Guides, newly diagnosed tips).
* **Product Lists & Data:** `celiac.org` (Focus: Lists, label rules, Eat! Gluten-Free).
* **Certification & Safe Spots:** `nationalceliac.org` (Focus: Certified products, eating tips).
* **GFCO Database:** `gluten.org` (Focus: Large database of GFCO certified products).
* **Updated Guides (Historic Data):** `celiac.com` (Focus: Safe/unsafe ingredients, updated since 1990s).
* **Independent Testing:** `glutenfreewatchdog.org` (Focus: Independent lab reports on gluten levels).
* **Government Standard:** `niddk.nih.gov` (Focus: Government definitions, naturally GF grains).

## II. Trigger Input
This skill is activated when the main agent receives:

* **Artifact:** `[ExtractedLabelText]`: The full text (or barcode number) generated from the `react-native-vision-camera` module.

## III. The Process (The Annealing Loop)
Upon triggering, the agent must perform these steps autonomously:

### Step 1: Parse the `[ExtractedLabelText]`
Identify key entities: Product Name, Brand Name, and the Ingredients List.

### Step 2: Initialize Domain Cross-Reference (Search & Synthesis)
For each domain in the Celiac Reference Suite, the agent must query using the structured entities:

* **Search Pattern Example:** `[Product Name] + [Brand Name] celiac safe site:celiac.org` or `[Product Name] certified site:gluten.org`.

### Step 3: Verification Synthesis
After querying the domains, the agent must synthesize the findings into a "Safety Score".

* **HIGH:** The product is listed as Certified Gluten-Free on `gluten.org` or `nationalceliac.org`.
* **MEDIUM:** The product is not listed, but the Ingredients List shows only naturally gluten-free grains (matching `niddk.nih.gov`) and a check of `beyondceliac.org`'s ingredient guide shows zero "hidden gluten" flags.
* **LOW:** Specific ingredient flags (e.g., "Malt Extract") are found and confirmed as unsafe on `celiac.com`'s ingredient list.
* **WARNING:** The product is known to have issues, flagged by independent testing on `glutenfreewatchdog.org`.

### Step 4: Generate Output
Return a structured Artifact: `[CeliacSafetyReport]` containing:

* **Verification Status:** `[High / Med / Low / Warning]`
* **Summary:** (e.g., "Product X is GFCO Certified. Safe to consume.")
* **References:** (Links to the specific pages on the domains used to make the determination, e.g., "Confirmed on gluten.org [link]").

## IV. Success Metric
The main agent accepts this skill as successful only if it returns a `[CeliacSafetyReport]` that links to at least three distinct domains from the Celiac Reference Suite.

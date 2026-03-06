# Celiac Scanner - RevenueCat Strategy

## Subscription Tiers

### 1. Free Tier (Basic Scanner)
- **Features:** 
  - Standard text-based ingredient search.
  - Limited number of visual image scans (e.g., 5 per day).
- **Access:** Default for all authenticated users.

### 2. Premium Tier (Celiac Scanner Pro)
- **Features:**
  - Unlimited real-time visual label scanning (powered by Nano Banana).
  - Advanced hidden-gluten risk breakdown.
  - Offline caching of previously scanned products.
  - Priority cloud function processing for instant results.
- **Pricing Options:**
  - **Monthly:** $4.99/month
  - **Yearly:** $39.99/year (with 1-week free trial)

## Paywall Placement Strategy
1. **Onboarding Flow:** Gentle introduction to the Pro features after the initial tutorial.
2. **Scan Limit Hit:** Hard paywall triggers when a Free Tier user attempts their 6th visual scan in a 24-hour period.
3. **Settings / Profile:** Persistent "Upgrade to Pro" banner.
4. **"Hidden Risks" Teaser:** If a complex ingredient is scanned and the user is on the Free Tier, a blurred or summarized "Hidden Risk" section will prompt an upgrade for full details.

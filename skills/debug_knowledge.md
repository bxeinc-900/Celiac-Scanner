# Debug Knowledge: Celiac Scanner Project

## Issue: UI Crash in Web Preview (React Native Web)
- **Symptom**: Black screen, only root div in DOM, "ForwardRef" and "AnalysisOverlay" crash errors in console.
- **Root Causes Identification**:
    - `Dimensions.get('window')` at top-level can crash if accessed before initialization in some environments.
    - Component state mismatch (optional chaining missing/null results not handled).
    - `useNativeDriver: true` might not be supported for all properties on web (replaced with CSS transitions where possible).
- **Solutions**:
    - Move `Dimensions` access inside the component or use `useWindowDimensions()`.
    - Add extensive null/undefined guards for data structures (`result.ingredients || []`).
    - For web-only previews, consider using standard CSS transitions for simpler animations to avoid RN animation driver overhead on web.

## Issue: Mock Video Component
- **Symptom**: `video` tag might cause issues if not handled correctly by the bundler or if refs are misused.
- **Fix**: Ensure `video` refs are managed in `useEffect` and the element is standard HTML. Ensure it's not being wrapped in another RN component that might intercept refs unexpectedly.

# Project Roadmap

## Phase 1: Integrating the Advanced QR Code Generator

This phase replaces QR Styler's basic generator with the highly customizable one from the Antfu toolkit.

*   **Isolate Core Logic**: The primary file to port is `antfu/logic/generate.ts`. This file contains the `generateQRCode` function, which is responsible for drawing the QR code to a canvas based on a state object. Its dependencies, `uqr` and `seedrandom`, are available as NPM packages and can be added to QR Styler's `package.json`.
*   **Create a New React Component**: Develop an `AdvancedQrGenerator.tsx` component in the QR Styler project.
    *   This component will manage the extensive configuration options (e.g., pixel style, marker shape, margin noise, effects) using React's `useState` hook.
    *   It will render a `<canvas>` element, accessed via a `useRef` hook.
*   **Adapt Rendering Logic**: Use a `useEffect` hook that triggers the ported `generateQRCode` function whenever the canvas reference is available or any of the generator settings change. The state managed by React will be passed as the configuration object to this function.
*   **Build the UI**: Reconstruct the settings panel using QR Styler's existing `shadcn/ui` components. For example:
    *   Antfu's `OptionSlider` can be replaced with the `Slider` component from `components/ui/slider.tsx`.
    *   Antfu's `OptionSelectGroup` can be implemented using the `RadioGroup` from `components/ui/radio-group.tsx`.
    *   Antfu's `OptionCheckbox` can be replaced with the `Switch` component.
*   **Integrate into the Flow**: Replace the existing `QRCodeModal.tsx` with a new modal that houses the `AdvancedQrGenerator.tsx` component. The `onGenerate` callback will be adapted to export the image from the canvas using `canvas.toBlob()` and pass it to the main form, maintaining the existing workflow.

## Phase 2: Integrating the "Compare" & Refinement Tool

This is a significant value-add, giving users a powerful tool to fix and refine the QR codes styled by the Replicate AI service.

*   **Create a New "Compare" Page**: Add a new route and page to the QR Styler application, for example `/compare/[imageId]`, which would load a generated image from the user's gallery.
*   **Port the Diffing Logic**: The core algorithm is in `antfu/logic/diff.ts`. The functions `segmentImage` and `compareSegments` are pure TypeScript and can be moved directly into a utility file in the `lib/` directory of the QR Styler project.
*   **Build the React UI**:
    *   Develop a `CompareTool.tsx` component to be the centerpiece of the new page.
    *   Recreate the two-panel layout: one for the AI-generated image and another for displaying mismatch information and settings.
    *   The main image view, which layers the grid, overlays, and mismatch highlights, can be built using absolutely positioned `div` elements, similar to the Vue implementation.
    *   Use `shadcn/ui` components to build all the necessary controls for adjusting the grid, overlay, and correction parameters.
*   **Implement Correction Mask Generation**: The logic for generating and downloading the correction mask from `DialogDownload.vue` is also canvas-based. Port this into a function that, when triggered, creates an in-memory canvas, draws the mismatch data, and initiates a file download.

## Phase 3: Integrating the "Verify" Scanner

Adding this feature allows users to confirm the scannability of their final, edited QR codes directly on the site.

*   **Add Dependency**: Install the `qr-scanner-wechat` package, which is the scanner used in the Antfu toolkit.
*   **Create a Verification Component**: Build a `VerifyTool.tsx` component. This could be a modal accessible from the user's gallery or the compare page.
*   **Implement Scanner Logic**: The workflow from `antfu/components/Scanner.vue` can be replicated. An uploaded image is drawn onto a canvas, preprocessing filters (contrast, blur, etc.) are applied, and the canvas is passed to the `scan` function from the library.
*   **Display Results**: The UI will show the scan result—either the decoded text or an error message—giving users immediate feedback on their QR code's scannability.

## Integration with Existing SaaS Infrastructure

These new features would be woven into the existing QR Styler application to enhance its value.

*   **Authentication**: The new generator, compare, and verify tools would be protected routes/features, accessible only to logged-in users via the existing `AuthCheck.tsx` component.
*   **Subscription Tiers**: The advanced features can be monetized. For instance, `crystalize` and `liquidify` effects or access to the "Compare" tool could be restricted to "Basic" or "Premium" subscribers. This would involve checking the user's subscription tier using the existing `getUserSubscription` utility before rendering the components or enabling features.
*   **Database & Gallery**: The detailed settings from the advanced generator can be saved as a JSON object in the `generated_images` table alongside the prompt and image URL. This allows users to recall and edit their designs later. The "Compare" tool would naturally load images directly from the user's gallery.

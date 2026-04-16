# Implementation Plan - Transaction Smart Scan Optimization

Improve the transaction extraction feature to be robust against various file formats, large image sizes, and specific payment app layouts (GPay, PhonePe, Slice, etc.).

## Proposed Changes

### [Component] Frontend Transaction Page
#### [MODIFY] [Transactions.jsx](file:///c:/Users/surve/OneDrive/Desktop/project/finsight-ai/client/src/pages/Transactions.jsx)
- **Image Preprocessing**: Add a utility function to resize images to a maximum width of 1024px and compress them into JPEG format using a hidden Canvas element. This ensures valid base64 and reduces upload size.
- **MIME Type Handling**: Ensure the correct MIME type is preserved during the conversion process before sending to the backend.

### [Component] Backend AI Controller
#### [MODIFY] [aiController.js](file:///c:/Users/surve/OneDrive/Desktop/project/finsight-ai/server/controllers/aiController.js)
- **MIME Extraction**: Get the `mimetype` from the Multer file object.
- **Improved Error Handling**: Log specific errors and return clear feedback to the frontend if extraction fails.

### [Component] Backend AI Utilities
#### [MODIFY] [openrouter.js](file:///c:/Users/surve/OneDrive/Desktop/project/finsight-ai/server/utils/openrouter.js) (Refinement)
- **Model Upgrade**: Set model to `google/gemini-2.5-flash-preview` as requested.
- **Prompt Engineering**: Update the prompt to specifically mention UPI apps (Google Pay, PhonePe, Paytm, Slice) and provide clear extraction rules for amounts, dates, and types.
- **Bulletproof Parsing**: Implement a robust JSON extractor that handles markdown blocks (` ```json `) and ignores extraneous AI preamble/postamble.
- **MIME Support**: Properly construct the data URL for the vision API using the actual MIME type.

## Verification Plan

### Automated Tests
- Since this is a feature requiring manual image upload, I will use the browser tool to:
  1. Navigate to the Transactions page.
  2. Attempt to upload a mock image (if feasible) or verify the UI state changes.
  3. Check console logs for preprocessing triggers.

### Manual Verification
- The user will need to test with real screenshots from Google Pay, PhonePe, etc.
- I will verify that the backend logs show the raw AI response and the parsed result.

import type { APIRoute } from 'astro';
import { GoogleGenAI, Type } from '@google/genai';

export const prerender = false;

interface ExtractedItem {
  value: any;
  confidence: number;
  source: 'document_ocr' | 'user_prompt' | 'inferred';
  verified: boolean;
  fieldNote?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const startTime = Date.now();
  const cfRayId = request.headers.get('cf-ray') || `ray_${Math.random().toString(36).substring(2, 9)}`;
  const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

  try {
    // 1. Resolve Cloudflare Environment and Gemini Key
    const env = (locals as any)?.runtime?.env || process.env;
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GEMINI_API_KEY is not configured in Cloudflare environment bindings or .env',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const userPrompt = (formData.get('userPrompt') as string) || '';
    const formType = (formData.get('formType') as string) || 'passport_renewal';
    const applicationId = (formData.get('applicationId') as string) || `app_${Date.now()}`;
    const autoSaveToD1 = formData.get('saveToD1') === 'true';

    // Collect all uploaded ID images or documents
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document_') && value instanceof File && value.size > 0) {
        imageFiles.push(value);
      }
    }

    // 3. Initialize Google Gen AI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 4. Build Multimodal Content Parts for Gemini
    const contents: any[] = [];

    // Attach user prompt and instructions
    contents.push({
      text: `You are an expert Government Identity Verification & Automated Form Extraction Agent for GovForm AI.
Target Form Type: "${formType}".

User's Conversational Statement:
"""
${userPrompt || 'No additional conversational statement provided. Extract all details purely from attached identification documents.'}
"""

Task:
1. Examine any attached ID cards, passports, utility bills, or business documents with high precision OCR.
2. Cross-reference the user's conversational statement with document facts (e.g. if user mentions a new address or expedited service request).
3. Map and normalize every field required for the "${formType}" standard government application.
4. For each field, assign a confidence score (0.0 to 1.0) and source ('document_ocr', 'user_prompt', or 'inferred').
5. Note any discrepancies (e.g. name on ID vs statement) in anomaliesDetected.
6. Provide an array of missingRequiredFields if any mandatory data is absent.`,
    });

    // Convert attached images to Gemini inlineData parts
    for (const file of imageFiles) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      contents.push({
        inlineData: {
          mimeType: file.type || 'image/jpeg',
          data: base64,
        },
      });
    }

    // 5. Query Gemini with Structured Schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: `You are an elite government agency form processing agent. Always return clean, normalized JSON matching the requested schema. Ensure dates are YYYY-MM-DD format, phone numbers are standardized (XXX-XXX-XXXX), and postal codes are verified 5-digit ZIPs.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicantName: { type: Type.STRING, description: 'Full legal name of the applicant' },
            extractedFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fieldName: { type: Type.STRING, description: 'Field key name e.g. legalFirstName, dateOfBirth, residentialStreet' },
                  value: { type: Type.STRING, description: 'Normalized extracted value' },
                  confidence: { type: Type.NUMBER, description: 'Confidence between 0.0 and 1.0' },
                  source: { type: Type.STRING, description: 'document_ocr, user_prompt, or inferred' },
                  fieldNote: { type: Type.STRING, description: 'Explanation of how the value was extracted' },
                },
                required: ['fieldName', 'value', 'confidence', 'source'],
              },
            },
            overallConfidence: { type: Type.NUMBER, description: 'Calculated aggregate confidence score' },
            missingRequiredFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of mandatory fields still missing for this government form',
            },
            anomaliesDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Potential fraud flags, document expiration warnings, or contradictory claims',
            },
            aiReasoning: { type: Type.STRING, description: 'Brief executive summary of extraction and validation analysis' },
          },
          required: ['applicantName', 'extractedFields', 'overallConfidence', 'missingRequiredFields'],
        },
      },
    });

    const rawJsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawJsonText);

    // Transform extracted fields into a keyed dictionary for UI consumption
    const extractedDataMap: Record<string, ExtractedItem> = {};
    if (Array.isArray(parsedData.extractedFields)) {
      for (const item of parsedData.extractedFields) {
        if (item.fieldName) {
          extractedDataMap[item.fieldName] = {
            value: item.value,
            confidence: typeof item.confidence === 'number' ? item.confidence : 0.95,
            source: (item.source as any) || 'document_ocr',
            verified: item.confidence >= 0.85,
            fieldNote: item.fieldNote,
          };
        }
      }
    }

    const trackingNumber = `US-GOV-${formType.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Cloudflare D1 Persistence (if DB binding is present)
    const db = env.DB;
    let d1Saved = false;

    if (db && autoSaveToD1) {
      try {
        await db
          .prepare(
            `INSERT INTO applications (
              id, tracking_number, form_type, applicant_name, status,
              overall_confidence, extracted_fields_count, form_payload,
              validation_errors, user_prompt_excerpt, cf_ray_id, ip_address, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              applicant_name = excluded.applicant_name,
              overall_confidence = excluded.overall_confidence,
              extracted_fields_count = excluded.extracted_fields_count,
              form_payload = excluded.form_payload,
              validation_errors = excluded.validation_errors,
              updated_at = datetime('now')`
          )
          .bind(
            applicationId,
            trackingNumber,
            formType,
            parsedData.applicantName || 'Applicant',
            'draft',
            parsedData.overallConfidence || 0.9,
            Object.keys(extractedDataMap).length,
            JSON.stringify(extractedDataMap),
            JSON.stringify(parsedData.missingRequiredFields || []),
            userPrompt.substring(0, 250),
            cfRayId,
            clientIp
          )
          .run();

        // Write Audit Log
        await db
          .prepare(
            `INSERT INTO audit_logs (id, application_id, action_type, actor, details)
             VALUES (?, ?, ?, ?, ?)`
          )
          .bind(
            `audit_${Date.now()}`,
            applicationId,
            'AI_PARSED',
            'gemini-3.7-flash',
            JSON.stringify({
              fieldsExtracted: Object.keys(extractedDataMap).length,
              confidence: parsedData.overallConfidence,
              imageCount: imageFiles.length,
            })
          )
          .run();

        d1Saved = true;
      } catch (dbError) {
        console.warn('[Cloudflare D1 Warning] Failed to write record:', dbError);
      }
    }

    const responsePayload = {
      success: true,
      applicationId,
      trackingNumber,
      formType,
      applicantName: parsedData.applicantName || 'Applicant',
      extractedData: extractedDataMap,
      overallConfidence: parsedData.overallConfidence || 0.92,
      missingRequiredFields: parsedData.missingRequiredFields || [],
      anomaliesDetected: parsedData.anomaliesDetected || [],
      aiReasoning: parsedData.aiReasoning || 'Successfully parsed identity documents and conversational statements into verified schema.',
      processingTimeMs: Date.now() - startTime,
      modelUsed: 'gemini-3.7-flash',
      d1Saved,
      cfRayId,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-GovForm-Ray-ID': cfRayId,
      },
    });
  } catch (error: any) {
    console.error('API /parse-form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal error processing government form',
        processingTimeMs: Date.now() - startTime,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

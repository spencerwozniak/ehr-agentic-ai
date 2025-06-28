// src/utils/experts/general/generalUtils.ts
import type { FHIRBundle } from "@/types/FHIRBundle";

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function extractPatientSummary(fhir: FHIRBundle): string {
  const patient = fhir.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
  if (!patient) return 'You are a clinical assistant. No patient data was found.';

  const name = `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown';
  const gender = patient.gender || 'unknown';
  const birthDate = patient.birthDate || 'unknown';
  const age = birthDate !== 'unknown' ? calculateAge(birthDate) : 'unknown';

  const conditions = fhir.entry
    .filter(e => e.resource.resourceType === 'Condition')
    .map(e => e.resource.code?.text || 'Unspecified Condition');

  const medications = fhir.entry
    .filter(e => e.resource.resourceType === 'MedicationRequest')
    .map(e => e.resource.medicationCodeableConcept?.text || 'Unspecified Medication');

  const labs = fhir.entry
    .filter(e => e.resource.resourceType === 'Observation')
    .map(e => {
      const r = e.resource;
      const name = r.code?.text || 'Unnamed Lab';
      const value = r.valueQuantity ? `${r.valueQuantity.value} ${r.valueQuantity.unit}` : r.valueString || r.interpretation?.[0]?.text || 'No value';
      return `${name}: ${value}`;
    });

  const imagingReports = fhir.entry
    .filter(e => e.resource.resourceType === 'DiagnosticReport' && e.resource.category?.some((cat: React.ReactNode) => cat.coding?.some((c: React.ReactNode) => c.code === 'RAD')))
    .map(e => e.resource.code?.text || 'Unnamed Imaging Report');

  const microbiology = fhir.entry
    .filter(e => e.resource.resourceType === 'DiagnosticReport' && e.resource.code?.text?.toLowerCase().includes('microbio'))
    .map(e => e.resource.conclusion || 'Microbiology report without conclusion');

  return `You are a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**.

        **Conditions:** ${conditions.length > 0 ? conditions.join(', ') : 'None listed'}.

        **Medications:** ${medications.length > 0 ? medications.join(', ') : 'None listed'}.

        **Lab Results:**${labs.length > 0 ? '\n\n' + labs.map(l => `- ${l}`).join('\n') : ' None available.'}

        **Imaging Reports:**${imagingReports.length > 0 ? '\n\n' + imagingReports.map(i => `- ${i}`).join('\n') : ' None available.'}

        **Microbiology:**${microbiology.length > 0 ? '\n\n' + microbiology.map(m => `- ${m}`).join('\n') : ' None available.'}

        Present all information in **natural, concise clinical language**, as if summarizing for a fellow physician. 
        
        Focus on relevant diagnoses, medications, and concerning trends (e.g., hypoxia, fever, overdue reviews). 
        
        You do not need to list vitals, labs, or measurements unless they are clearly relevant to the question being asked. 

        When answering clinical questions like "what are his labs?", do NOT explain every lab result.

        Respond like a physician writing a chart note or sign-out summary. Use phrases such as:

        - “Labs unremarkable.”
        - “CBC normal.”
        - “WBC 8.4, no leukocytosis.”
        - “Hemoglobin 17.1, mildly elevated, likely hemoconcentration.”

        Avoid:
        - Explaining what each lab means.
        - Explaining or repeating normal findings in detail.
        - Adding disclaimers or differential diagnoses. Your job is simply to provide information, not to make medical decisions.

        Your tone should match clinical communication: concise, technical, and focused on what's actionable or noteworthy.

        Be **concise**, **clinical**, **confident**, and **focused on what matters**.

        Summarize findings using medical terminology.

        If the user asks for a summary or says “Tell me about the patient,” your response should sound like a physician's written note or case handoff: organized, medically precise, and conversational — **not bulleted**.

        You may include key findings if medically significant (e.g., "oxygen saturation of 78% is concerning"), but avoid overloading the summary with raw data.

        Use markdown for clarity. Paragraphs should be separated with **\\n\\n**, and you may **bold** key terms if helpful. Do **not** hallucinate any information.`;

    }
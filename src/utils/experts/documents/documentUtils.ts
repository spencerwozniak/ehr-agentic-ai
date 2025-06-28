// src/utils/experts/general/documentUtils.ts
import type { FHIRBundle } from "@/types/FHIRBundle";
import { calculateAge } from "../general/generalUtils";

export type Note = {
  dateTime: string;
  type: string;
  specialty: string;
  content: string;
};

export function extractAllNotes(fhir: FHIRBundle): {
  notes: Note[];
  name: string;
  gender: string;
  age: string | number;
}{
  const notes: Note[] = [];

  const patient = fhir.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
  
  const name = `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown';
  const gender = patient.gender || 'unknown';
  const birthDate = patient.birthDate || 'unknown';
  const age = birthDate !== 'unknown' ? calculateAge(birthDate) : 'unknown';

  for (const entry of fhir.entry) {
    const resource = entry.resource;

    // 1. Composition
    if (resource.resourceType === "Composition") {
      const dateTime = resource.date || "unknown";
      const type = resource.type?.text || resource.title || "Clinical Note";
      const specialty = resource.author?.[0]?.display || "unknown";
      const sections = resource.section?.map((sec: any) => {
        const title = sec.title || "";
        const text = sec.text?.div?.replace(/<\/?div>/g, '') || "";
        return `**${title}**\n${text}`;
      }) || [];

      notes.push({
        dateTime,
        type,
        specialty,
        content: sections.join("\n\n")
      });
    }

    // 2. DocumentReference
    else if (resource.resourceType === "DocumentReference") {
      const dateTime = resource.date || "unknown";
      const type = resource.type?.text || "Document";
      const specialty = resource.author?.[0]?.display || "unknown";
      const contentUrl = resource.content?.[0]?.attachment?.url || "";
      const contentText = resource.description || `See attached: ${contentUrl}`;

      notes.push({
        dateTime,
        type,
        specialty,
        content: contentText
      });
    }

    // 3. Encounter.note
    else if (resource.resourceType === "Encounter" && resource.note) {
      for (const note of resource.note) {
        notes.push({
          dateTime: note.time || resource.period?.start || "unknown",
          type: "Encounter Note",
          specialty: resource.serviceProvider?.display || "unknown",
          content: note.text || "No content"
        });
      }
    }
  }

  return {
    notes: notes.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    name,
    gender,
    age,
  };
}

export function getDocumentSummaryPrompt(fhir: FHIRBundle): string {
  const { notes, name, gender, age } = extractAllNotes(fhir);

  if (notes.length === 0) {
    return `You are a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**. No provider documentation is available for this patient.`;
  }

  const formatted = notes.map((note) => {
    return `### ${note.dateTime} – ${note.type} (${note.specialty})\n${note.content}`;
  });

  return `You are a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**. The following are provider-authored documents (e.g., SOAP notes, consults, or summaries) relevant to this patient. Use these to answer any medical questions.

Present information concisely and clinically, as if assisting a physician reviewing past notes.

${formatted.join('\n\n')}`;
}

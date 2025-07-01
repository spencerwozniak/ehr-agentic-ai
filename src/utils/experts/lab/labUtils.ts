// src/utils/experts/general/labUtils.ts
import type { FHIRBundle } from '@/types/FHIRBundle';
import { calculateAge } from '../general/generalUtils';

type LabEntry = {
  dateTime: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  panelName?: string;
};

export function extractAllLabs(fhir: FHIRBundle): {
  labs: LabEntry[];
  name: string;
  gender: string;
  age: string | number;
} {
  const labs: LabEntry[] = [];

  const patient = fhir.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
  const name = `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}` || 'Unknown';
  const gender = patient.gender || 'unknown';
  const birthDate = patient.birthDate || 'unknown';
  const age = birthDate !== 'unknown' ? calculateAge(birthDate) : 'unknown';

  const observationMap: Record<string, any> = {};
  fhir.entry.forEach(entry => {
    if (entry.resource.resourceType === 'Observation') {
      observationMap[entry.resource.id] = entry.resource;
    }
  });

  for (const entry of fhir.entry) {
    const resource = entry.resource;

    // --- DiagnosticReport: Lab Panels ---
    if (
      resource.resourceType === 'DiagnosticReport' &&
      resource.category?.some((c: any) =>
        c.coding?.some((code: any) => code.code === 'LAB')
      )
    ) {
      const dateTime = resource.effectiveDateTime || resource.issued || 'unknown';
      const panelName = resource.code?.text || 'Unnamed Lab Panel';

      for (const resultRef of resource.result || []) {
        const obsId = resultRef.reference?.split('/')?.[1];
        const observation = observationMap[obsId];
        if (!observation) continue;

        const testName = observation.code?.text || observation.code?.coding?.[0]?.display || 'Unnamed Lab Test';

        let value = '';
        if (observation.valueQuantity) {
          value = `${observation.valueQuantity.value}`;
        } else if (observation.valueString) {
          value = observation.valueString;
        } else if (observation.valueCodeableConcept?.text) {
          value = observation.valueCodeableConcept.text;
        } else if (observation.valueBoolean !== undefined) {
          value = observation.valueBoolean ? 'Positive' : 'Negative';
        } else {
          continue;
        }

        const unit = observation.valueQuantity?.unit;
        const refRange = observation.referenceRange?.[0];
        const referenceRange = refRange
          ? `${refRange.low?.value || ''}–${refRange.high?.value || ''} ${refRange.high?.unit || ''}`.trim()
          : undefined;

        labs.push({ dateTime, testName, value, unit, referenceRange, panelName });
      }
    }

    // --- Standalone Observations: Labs or Vitals ---
    else if (resource.resourceType === 'Observation') {
      const categoryCodes = resource.category?.flatMap((cat: any) =>
        cat.coding?.map((code: any) => code.code)
      ) || [];

      const isLab = categoryCodes.includes('laboratory');
      const isVital = categoryCodes.includes('vital-signs');

      if (!isLab && !isVital) continue;

      const testName = resource.code?.text || resource.code?.coding?.[0]?.display || 'Unnamed Observation';
      const dateTime = resource.effectiveDateTime || resource.issued || 'unknown';

      let value = '';
      if (resource.valueQuantity) {
        value = `${resource.valueQuantity.value}`;
      } else if (resource.valueString) {
        value = resource.valueString;
      } else if (resource.valueCodeableConcept?.text) {
        value = resource.valueCodeableConcept.text;
      } else if (resource.valueBoolean !== undefined) {
        value = resource.valueBoolean ? 'Positive' : 'Negative';
      } else {
        continue;
      }

      const unit = resource.valueQuantity?.unit;
      const refRange = resource.referenceRange?.[0];
      const referenceRange = refRange
        ? `${refRange.low?.value || ''}–${refRange.high?.value || ''} ${refRange.high?.unit || ''}`.trim()
        : undefined;

      labs.push({
        dateTime,
        testName,
        value,
        unit,
        referenceRange,
        panelName: isVital ? 'Vital Signs' : undefined,
      });
    }
  }

  return {
    labs: labs.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    name,
    gender,
    age,
  };
}

export function getLabSummaryPrompt(fhir: FHIRBundle): string {
  const { labs, name, gender, age } = extractAllLabs(fhir);

  if (labs.length === 0) {
    return `You are a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**. No lab results or vital signs are available for this patient.`;
  }

  const groupedByPanel: Record<string, LabEntry[]> = {};
  for (const lab of labs) {
    const key = lab.panelName || 'Standalone Tests';
    if (!groupedByPanel[key]) groupedByPanel[key] = [];
    groupedByPanel[key].push(lab);
  }

  const formatted = Object.entries(groupedByPanel).map(([panelName, labEntries]) => {
    const labLines = labEntries.map(lab => {
      const unit = lab.unit ? ` ${lab.unit}` : '';
      const ref = lab.referenceRange ? ` (Reference: ${lab.referenceRange})` : '';
      return `- **${lab.dateTime}**: ${lab.testName} = ${lab.value}${unit}${ref}`;
    });
    return `### ${panelName}\n${labLines.join('\n')}`;
  });

  return `You are a clinical assistant helping with a case for **${name}**, a **${age}-year-old ${gender}**. The following are all available lab results and vital signs for this patient, grouped by category and ordered from most recent to oldest.

${formatted.join('\n\n')}

When responding, organize lab results into clear tables grouped by panel or date when possible. If the table will include multiple tests, organize lab results into multiple smaller tables, grouped by logical categories such as lab panels (e.g., 'Basic Metabolic Panel', 'Lipid Panel') or organ systems (e.g., 'Renal Function', 'Glucose Control'). Use one table per category to improve readability.

Include the following columns such that the viewer can get results over time. 
Test Name, Result from Date #1, Result from Date #2, ...

From left-to-right, dates should be going from earlier to more recent.

If the user asks about a specific date, you should give labs of that date and the draws immediately preceeding and proceeding the date. Give as many dates as makes sense to do so without giving too much information.

If asked any general questions, such as "does she have any labs available?" you should not provide tables, but a categorized breakdown of which labs were drawn and when, without results.

Use plain-text summaries only if there is a single result or a short, self-explanatory value.
`;
}

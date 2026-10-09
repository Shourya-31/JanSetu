import ts from "typescript";
import fs from "node:fs";
const village = [
  ["general", "general/GeneralInformation", "GeneralInformationFormData"],
  ["anganbadiData", "anganbadi/AnganbadiForm", "AnganbadiData"],
  ["schoolData", "school/SchoolForm", "SchoolData"],
  ["hostelData", "hostel/HostelForm", "HostelData"],
  ["healthData", "health/HealthForm", "HealthData"],
  ["waterData", "water/WaterForm", "WaterData"],
  ["employmentData", "employment/EmploymentForm", "EmploymentData"],
  ["ladiesData", "ladies/LadiesForm", "LadiesData"],
  ["cleanlinessData", "cleanliness/CleanlinessForm", "CleanlinessData"],
  ["pensionData", "pension/PensionForm", "PensionData"],
  ["developmentData", "development/DevelopmentForm", "DevelopmentData"],
];
const household = [
  ["general", "general/HouseholdGeneralInformation"],
  ["demography", "demography/HouseholdDemography"],
  ["documents", "documents/HouseholdDocumentsSchemes"],
  ["women", "women/HouseholdWomenSocialSecurity"],
  ["disability", "disability/HouseholdDisabilityDocuments"],
  ["education", "education/HouseholdChildrenEducation"],
  ["employment", "employment/HouseholdAgricultureEmployment"],
  ["housing", "housing/HouseholdHousingFacilities"],
  ["health", "health/HouseholdHealth"],
  ["shg", "shg/HouseholdSHG"],
  ["other", "other/HouseholdOtherInformation"],
];
const titles = [
  "ग्राम की सामान्य जानकारी",
  "आंगनबाड़ी",
  "विद्यालय एवं शिक्षा",
  "आश्रम/छात्रावास",
  "स्वास्थ्य एवं पोषण",
  "पेयजल सुविधा",
  "रोजगार, आजीविका, पलायन एवं कौशल विकास",
  "महिला स्वयं सहायता समूह एवं वित्तीय समावेशन",
  "स्वच्छता एवं अपशिष्ट प्रबंधन",
  "पेंशन एवं सामाजिक सुरक्षा",
  "ग्राम की विकास आवश्यकताएँ",
];
const ht = [
  "परिवार की सामान्य जानकारी",
  "जनसांख्यिकी",
  "दस्तावेज़ एवं योजनाएं",
  "महिला एवं सामाजिक सुरक्षा",
  "दिव्यांगता दस्तावेज़",
  "बच्चों की शिक्षा",
  "कृषि एवं रोजगार",
  "आवास एवं सुविधाएं",
  "स्वास्थ्य",
  "स्वयं सहायता समूह",
  "अन्य जानकारी",
];
let imports = [],
  types = [];
function make(entries, kind) {
  return entries.map(([section, path, type], i) => {
    const file = `src/components/surveyor/${kind}/${path}.tsx`;
    const src = fs.readFileSync(file, "utf8");
    const ast = ts.createSourceFile(
      file,
      src,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const nodes = [];
    function walk(n) {
      nodes.push(n);
      ts.forEachChild(n, walk);
    }
    walk(ast);
    const iface = nodes.find(
      (n) =>
        ts.isInterfaceDeclaration(n) &&
        (type ? n.name.text === type : n.name.text.endsWith("Ref")),
    );
    if (!iface && type !== "SchoolData") throw Error(file);
    let members =
      iface?.members ??
      nodes.find(
        (n) =>
          ts.isObjectLiteralExpression(n) &&
          n.properties.some((p) => p.name?.getText(ast) === "schoolName"),
      ).properties;
    if (!type) {
      type = iface.name.text;
      const method = members.find((n) => n.name?.getText(ast) === "getData");
      members = method.type.type.members;
    }
    imports.push(
      `import type { ${type} } from '../components/surveyor/${kind}/${path}';`,
    );
    types.push([kind, section, type]);
    const fields = members
      .filter((m) => ts.isPropertySignature(m) || ts.isPropertyAssignment(m))
      .map((m) => {
        const key = m.name.getText(ast);
        let label = "",
          options = [],
          numeric = false,
          literalText = false,
          multi = m.type?.getText(ast).includes("[]") ?? false;
        // Structured question definitions in village forms.
        for (const n of nodes.filter(ts.isObjectLiteralExpression)) {
          const props = Object.fromEntries(
            n.properties
              .filter(ts.isPropertyAssignment)
              .map((p) => [p.name.getText(ast), p.initializer]),
          );
          if (
            props.key &&
            ts.isStringLiteral(props.key) &&
            props.key.text === key
          ) {
            label =
              props.label && ts.isStringLiteral(props.label)
                ? props.label.text
                : label;
            if (props.options && ts.isArrayLiteralExpression(props.options))
              options = props.options.elements
                .filter(ts.isStringLiteral)
                .map((x) => x.text);
          }
        }
        for (const n of nodes.filter(ts.isJsxElement)) {
          const attrs = n.openingElement.attributes.properties;
          const fieldLabel = attrs.find(
            (a) => a.name?.getText(ast) === "label",
          );
          if (
            fieldLabel?.initializer &&
            ts.isStringLiteral(fieldLabel.initializer) &&
            new RegExp(`\\b${key}\\b`).test(n.getText(ast))
          )
            label = fieldLabel.initializer.text;
        }
        // Find an input or custom control tied to this field, then its nearest question label.
        for (const n of nodes.filter(
          (n) => ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n),
        )) {
          const tag = n.tagName.getText(ast);
          if (!["input", "select", "textarea", "RadioOption"].includes(tag))
            continue;
          const attrs = n.attributes.properties;
          const bound = attrs.some(
            (a) =>
              ["value", "checked", "name", "onChange"].includes(
                a.name?.getText(ast),
              ) &&
              a.initializer &&
              new RegExp(`\\b${key}\\b`).test(a.initializer.getText(ast)),
          );
          if (!bound) continue;
          const inputType = attrs
            .find((a) => a.name?.getText(ast) === "type")
            ?.initializer?.getText(ast);
          if (
            tag === "textarea" ||
            (tag === "input" &&
              (!inputType ||
                inputType === '"text"' ||
                inputType === '"date"' ||
                inputType === '"tel"'))
          )
            literalText = true;
          if (
            attrs.some(
              (a) =>
                a.name?.getText(ast) === "type" &&
                a.initializer?.getText(ast) === '"number"',
            )
          )
            numeric = true;
          let p = n.parent;
          while (p) {
            if (ts.isJsxElement(p)) {
              const lbl = p.children.find(
                (c) =>
                  ts.isJsxElement(c) &&
                  ["label", "p"].includes(
                    c.openingElement.tagName.getText(ast),
                  ) &&
                  c.children.some(ts.isJsxText),
              );
              if (lbl) {
                const text = lbl.children
                  .filter(ts.isJsxText)
                  .map((c) => c.text)
                  .join(" ")
                  .replace(/\s+/g, " ")
                  .trim();
                if (text && !label) label = text;
                if (text) break;
              }
            }
            p = p.parent;
          }
          const val = attrs.find(
            (a) => a.name?.getText(ast) === "value",
          )?.initializer;
          if (
            val &&
            ts.isStringLiteral(val) &&
            ["RadioOption", "input"].includes(tag) &&
            val.text
          )
            options.push(val.text);
        }
        // Array options used by mapped radio / checkbox controls.
        if (!options.length)
          for (const n of nodes.filter(ts.isArrayLiteralExpression)) {
            let p = n.parent;
            for (let j = 0; j < 5 && p; j++, p = p.parent)
              if (
                ts.isJsxElement(p) &&
                new RegExp(`\\b${key}\\b`).test(p.getText(ast))
              ) {
                options = n.elements
                  .filter(ts.isStringLiteral)
                  .map((x) => x.text);
                break;
              }
            if (options.length) break;
          }
        if (!label)
          for (const n of nodes
            .filter(ts.isIdentifier)
            .filter((n) => n.text === key)) {
            let p = n.parent;
            while (p) {
              if (ts.isJsxElement(p)) {
                const lbl = p.children.find(
                  (c) =>
                    ts.isJsxElement(c) &&
                    ["label", "p"].includes(
                      c.openingElement.tagName.getText(ast),
                    ) &&
                    c.children.some(ts.isJsxText),
                );
                if (lbl) {
                  label = lbl.children
                    .filter(ts.isJsxText)
                    .map((c) => c.text)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();
                  if (label) break;
                }
              }
              p = p.parent;
            }
            if (label) break;
          }
        // Resolve mapped arrays through parentheses and named option variables.
        if (!options.length) {
          const candidates = nodes
            .filter(ts.isJsxElement)
            .filter(
              (n) =>
                new RegExp(`\\b${key}\\b`).test(n.getText(ast)) &&
                (n.openingElement.attributes.properties.some(
                  (a) => a.name?.getText(ast) === "label",
                ) ||
                  n.children.some(
                    (c) =>
                      ts.isJsxElement(c) &&
                      ["label", "p"].includes(
                        c.openingElement.tagName.getText(ast),
                      ) &&
                      c.children.some(ts.isJsxText),
                  )),
            )
            .sort((a, b) => a.getWidth(ast) - b.getWidth(ast));
          const container = candidates[0];
          if (container) {
            const text = container.getText(ast);
            for (const arr of nodes.filter(ts.isArrayLiteralExpression)) {
              const inside =
                arr.pos >= container.pos && arr.end <= container.end;
              const declared =
                ts.isVariableDeclaration(arr.parent) &&
                new RegExp(`\\b${arr.parent.name.getText(ast)}\\.map\\b`).test(
                  text,
                );
              if (inside || declared)
                options.push(
                  ...arr.elements.filter(ts.isStringLiteral).map((x) => x.text),
                );
            }
            for (const n of nodes
              .filter(ts.isJsxElement)
              .filter(
                (n) =>
                  n.pos >= container.pos &&
                  n.end <= container.end &&
                  n.openingElement.tagName.getText(ast) === "option",
              )) {
              const value = n.openingElement.attributes.properties.find(
                (a) => a.name?.getText(ast) === "value",
              )?.initializer;
              if (value && ts.isStringLiteral(value) && value.text)
                options.push(value.text);
              else if (!value)
                options.push(
                  n.children
                    .filter(ts.isJsxText)
                    .map((c) => c.text)
                    .join("")
                    .trim(),
                );
            }
          }
        }
        return {
          key,
          label: label || key,
          type: multi
            ? "multi-select"
            : numeric
              ? "numeric"
              : !literalText && options.length
                ? "categorical"
                : "text",
          options: literalText && !multi ? [] : [...new Set(options)],
        };
      });
    return {
      id: section,
      title: (kind === "household" ? ht : titles)[i],
      repeated: [
        "anganbadiData",
        "schoolData",
        "hostelData",
        "healthData",
      ].includes(section),
      fields,
      source: file,
    };
  });
}
const v = make(village, "village-survey"),
  h = make(household, "household");
imports = imports.filter((s) => !s.includes("SchoolData"));
imports.push("type SchoolData = Record<string, string>;");
fs.writeFileSync(
  "src/data/adminSurveyCatalog.ts",
  `// Generated from existing Surveyor labels and interfaces. Run node scripts/generate-admin-catalog.mjs after form changes.\nexport interface ReportField { key: string; label: string; type: 'text' | 'numeric' | 'categorical' | 'multi-select'; options: string[] }\nexport interface ReportSection { id: string; title: string; repeated: boolean; fields: ReportField[]; source: string }\nexport const villageSections: ReportSection[] = ${JSON.stringify(v, null, 2)};\nexport const householdSections: ReportSection[] = ${JSON.stringify(h, null, 2)};\n`,
);
fs.writeFileSync(
  "src/types/adminReports.ts",
  `${imports.join("\n")}\nexport type VillageAnswers = Partial<GeneralInformationFormData> & {\n${types
    .filter((x) => x[0] === "village-survey" && x[1] !== "general")
    .map(
      (x) =>
        ` ${x[1]}?: Partial<${x[2]}>${["anganbadiData", "schoolData", "hostelData", "healthData"].includes(x[1]) ? "[]" : ""};`,
    )
    .join("\n")}\n};\nexport type HouseholdAnswers = ${types
    .filter((x) => x[0] === "household")
    .map((x) => `Partial<ReturnType<${x[2]}['getData']>>`)
    .join(
      " & ",
    )} & { isCompleted?: boolean; surveyStatus?: string; completedSections?: number; totalSections?: number };\nexport interface SurveyRecord<T> { id: string; blockId: string; panchayatId: string; villageId: string; villageName: string; householdId?: string; submittedAt?: string; completed?: boolean; answers: T; }\nexport interface SurveyDataset { villageSurveys: SurveyRecord<VillageAnswers>[]; householdSurveys: SurveyRecord<HouseholdAnswers>[]; integrationPending: boolean; }\nexport interface ReportScope { blockId: string; panchayatId?: string; villageId?: string; }\n`,
);
console.log(
  "Fields:",
  v.reduce((a, s) => a + s.fields.length, 0),
  h.reduce((a, s) => a + s.fields.length, 0),
);
console.log(
  "Unresolved labels:",
  [...v, ...h].flatMap((s) =>
    s.fields.filter((f) => f.label === f.key).map((f) => `${s.id}.${f.key}`),
  ),
);

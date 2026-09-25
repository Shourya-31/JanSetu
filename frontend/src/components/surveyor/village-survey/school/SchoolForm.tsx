import React, { useState } from "react";
import { Save } from "lucide-react";

interface SchoolFormProps {
  schoolNumber: number;
  onSave: (data: Record<string, string>) => void;
}

const inputClass =
  "w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const optionClass =
  "flex items-center gap-2 px-3 py-2.5 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

interface ChoiceProps {
  name: string;
  value: string;
  selected: string;
  onChange: (value: string) => void;
}

function Choice({
  name,
  value,
  selected,
  onChange,
}: ChoiceProps) {
  return (
    <label className={optionClass}>
      <input
        type="checkbox"
        name={name}
        checked={selected === value}
        onChange={() => onChange(value)}
        className="w-4 h-4 accent-blue-600"
      />
      <span className="text-sm text-slate-700">{value}</span>
    </label>
  );
}

export default function SchoolForm({
  schoolNumber,
  onSave,
}: SchoolFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({
    schoolName: "",
    udiseCode: "",
    schoolType: "",

    building: "",
    buildingCondition: "",
    seatingArrangement: "",
    toilets: "",
    drinkingWater: "",
    watersupply: "",
    electricity: "",
    ramp: "",
    sports: "",
    uniform: "",
    textbooks: "",

    totalChildren: "",
    childrenWithoutAadhaar: "",
    childrenWithoutAPAAR: "",
    disabledChildren: "",
    childrenNotAttendingSchool: "",
    dropoutChildren: "",
    dropoutReason: "",
    majorShortcoming: "",
  });

  const setValue = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      schoolNumber: String(schoolNumber),
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="text-xs font-bold text-blue-700">
          विद्यालय {schoolNumber}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mt-1">
          विद्यालय की जानकारी
        </h3>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800">
          विद्यालय की मूल जानकारी
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="विद्यालय का नाम">
            <input
              type="text"
              className={inputClass}
              value={formData.schoolName}
              onChange={(e) =>
                setValue("schoolName", e.target.value)
              }
              placeholder="विद्यालय का नाम"
            />
          </Field>

          <Field label="UDISE कोड">
            <input
              type="text"
              className={inputClass}
              value={formData.udiseCode}
              onChange={(e) =>
                setValue("udiseCode", e.target.value)
              }
              placeholder="UDISE कोड"
            />
          </Field>

          <Field label="विद्यालय का प्रकार">
            <input
              type="text"
              className={inputClass}
              value={formData.schoolType}
              onChange={(e) =>
                setValue("schoolType", e.target.value)
              }
              placeholder="विद्यालय का प्रकार"
            />
          </Field>
        </div>
      </div>

      {/* Q1 */}
      <Field label="1. क्या विद्यालय का अपना भवन है?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["हाँ", "नहीं", "निर्माणाधीन", "स्वीकृत"].map(
            (option) => (
              <Choice
                key={option}
                name={`school-${schoolNumber}-building`}
                value={option}
                selected={formData.building}
                onChange={(value) =>
                  setValue("building", value)
                }
              />
            )
          )}
        </div>
      </Field>

      {/* Q2 */}
      <Field label="2. भवन की स्थिति">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {["अच्छी", "जर्जर", "पुनर्निर्माण योग्य"].map(
            (option) => (
              <Choice
                key={option}
                name={`school-${schoolNumber}-buildingCondition`}
                value={option}
                selected={formData.buildingCondition}
                onChange={(value) =>
                  setValue("buildingCondition", value)
                }
              />
            )
          )}
        </div>
      </Field>

      {/* Q3 */}
      <Field label="3. बैठने की व्यवस्था">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            "पर्याप्त एवं अच्छी",
            "पर्याप्त लेकिन खराब",
            "अपर्याप्त",
          ].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-seating`}
              value={option}
              selected={formData.seatingArrangement}
              onChange={(value) =>
                setValue("seatingArrangement", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q4 */}
      <Field label="4. अलग-अलग बालक/बालिका शौचालय">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "हाँ, दोनों",
            "केवल बालक",
            "केवल बालिका",
            "अलग नहीं",
            "नहीं है",
          ].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-toilets`}
              value={option}
              selected={formData.toilets}
              onChange={(value) =>
                setValue("toilets", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q5 */}
      <Field label="5. पेयजल">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-water`}
              value={option}
              selected={formData.drinkingWater}
              onChange={(value) =>
                setValue("drinkingWater", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q6 */}
      <Field label="6. विद्युत सुविधा">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-electricity`}
              value={option}
              selected={formData.electricity}
              onChange={(value) =>
                setValue("electricity", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q7 */}
      <Field label="7. रैंप की सुविधा">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-ramp`}
              value={option}
              selected={formData.ramp}
              onChange={(value) =>
                setValue("ramp", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q8 */}
      <Field label="8. खेल-कूद सुविधा">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            "हाँ, पर्याप्त",
            "हाँ, अपर्याप्त",
            "नहीं",
          ].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-sports`}
              value={option}
              selected={formData.sports}
              onChange={(value) =>
                setValue("sports", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q9 */}
      <Field label="9. नि:शुल्क 2 सेट गणवेश">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-uniform`}
              value={option}
              selected={formData.uniform}
              onChange={(value) =>
                setValue("uniform", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q10 */}
      <Field label="10. नि:शुल्क पाठ्य-पुस्तक">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-textbooks`}
              value={option}
              selected={formData.textbooks}
              onChange={(value) =>
                setValue("textbooks", value)
              }
            />
          ))}
        </div>
      </Field>

      {/* Q11-Q16 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="11. कुल बच्चे संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.totalChildren}
            onChange={(e) =>
              setValue("totalChildren", e.target.value)
            }
          />
        </Field>

        <Field label="12. आधार कार्ड नहीं रखने वाले बच्चे संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.childrenWithoutAadhaar}
            onChange={(e) =>
              setValue(
                "childrenWithoutAadhaar",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="13. APAAR ID नहीं रखने वाले बच्चे संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.childrenWithoutAPAAR}
            onChange={(e) =>
              setValue(
                "childrenWithoutAPAAR",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="14. दिव्यांग बच्चे संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.disabledChildren}
            onChange={(e) =>
              setValue(
                "disabledChildren",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="15. 6-18 वर्ष के विद्यालय न जाने वाले बच्चे संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.childrenNotAttendingSchool}
            onChange={(e) =>
              setValue(
                "childrenNotAttendingSchool",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="16. विद्यालय छोड़ चुके बच्चे (Dropout) संख्या">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={formData.dropoutChildren}
            onChange={(e) =>
              setValue("dropoutChildren", e.target.value)
            }
          />
        </Field>
      </div>

      {/* Q17 */}
      <Field label="17. Dropout का प्रमुख कारण">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "आर्थिक कठिनाई",
            "दूरी",
            "परिवार की आवश्यकता",
            "पलायन",
            "रुचि की कमी",
            "अन्य",
          ].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-dropoutReason`}
              value={option}
              selected={formData.dropoutReason}
              onChange={(value) =>
                setValue("dropoutReason", value)
              }
            />
          ))}
        </div>
      </Field>

      <Field label="18. क्या विद्यालय में चालू जलापूर्ति की सुविधा उपलब्ध है?">
        <div className="grid grid-cols-2 gap-2">
          {["हाँ", "नहीं"].map((option) => (
            <Choice
              key={option}
              name={`school-${schoolNumber}-watersupply`}
              value={option}
              selected={formData.watersupply}
              onChange={(value) =>
                setValue("watersupply", value)
              }
            />
          ))}
        </div>
      </Field>
  

      {/* Q18 */}
      <Field label="19. विद्यालय में प्रमुख कमी">
        <textarea
          rows={4}
          className={inputClass}
          value={formData.majorShortcoming}
          onChange={(e) =>
            setValue("majorShortcoming", e.target.value)
          }
          placeholder="विद्यालय में प्रमुख कमी लिखें..."
        />
      </Field>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800"
        >
          <Save className="w-4 h-4" />
          विद्यालय की जानकारी सहेजें
        </button>
      </div>
    </div>
  );
}
import React from "react";
import {
  ArrowLeft,
  Droplets,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  Map,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface VillageCategoryDetailProps {
  category: string;
  villageName: string;
  blockName: string;
  panchayatName: string;
  villageData: Record<string, unknown>;
  onBack: () => void;
}

const getValue = (
  value: unknown,
  fallback = "उपलब्ध नहीं"
): string => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
};

const getYesNo = (value: unknown): string => {
  if (
    value === "हाँ" ||
    value === "yes" ||
    value === "Yes"
  ) {
    return "हाँ";
  }

  if (
    value === "नहीं" ||
    value === "no" ||
    value === "No"
  ) {
    return "नहीं";
  }

  return getValue(value);
};

const statusConfig = {
  good: {
    text: "स्थिति सामान्य",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  warning: {
    text: "ध्यान आवश्यक",
    className: "bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  neutral: {
    text: "विवरण उपलब्ध",
    className: "bg-slate-100 text-slate-600",
    icon: Building2,
  },
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-800 text-right">
        {value}
      </span>
    </div>
  );
};

interface DetailCardProps {
  label: string;
  value: string;
}

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const DetailCard: React.FC<DetailCardProps> = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
};

interface SectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: "good" | "warning" | "neutral";
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon,
  status = "neutral",
  children,
}) => {
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            {icon}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${currentStatus.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />

          {currentStatus.text}
        </span>
      </div>

      {/* Content */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
};

export default function VillageCategoryDetail({
  category,
  villageName,
  blockName,
  panchayatName,
  villageData,
  onBack,
}: VillageCategoryDetailProps) {
  const data = villageData;
  const development = toRecord(data.developmentData);
  const healthData = toRecord(Array.isArray(data.healthData) ? data.healthData[0] : data.healthData);

  const totalSchools = getValue(
    data.totalSchools,
    "0"
  );

  const totalAnganwadi = getValue(
    data.totalAnganwadi,
    "0"
  );

  const totalHealthFacilities = getValue(
    data.totalHealthFacilities,
    "0"
  );

  const tapWaterExcludedFamilies = getValue(
    data.tapWaterExcludedFamilies,
    "0"
  );

  const puccaHouses = getValue(
    data.puccaHouses,
    "0"
  );

  const rawHouses = getValue(
    data.rawHouses,
    "0"
  );

  const pendingHouses = getValue(
    data.pendingHouses,
    "0"
  );

  const hasWaterIssue =
    Number(tapWaterExcludedFamilies) > 0 ||
    data.tapWater === "नहीं";

  const hasHousingIssue =
    Number(rawHouses) > 0 ||
    Number(pendingHouses) > 0 ||
    Number(data.housingNotSanctioned) > 0;

  const hasRoadIssue =
    data.road === "नहीं" ||
    data.road === "आंशिक";

  const hasElectricityIssue =
    data.electricity === "नहीं";

  const hasDevelopmentNeed =
    Number(development.handpumpRequirement) > 0 ||
    Number(development.borewellRequirement) > 0 ||
    Number(development.solarPumpRequirement) > 0 ||
    Number(development.solarStreetLightRequirement) > 0 ||
    Number(development.roadRequirement) > 0 ||
    String(
      development.otherInfrastructureRequirement || ""
    ).trim() !== "";

  const renderWater = () => (
    <Section
      title="पेयजल"
      description="गाँव में पेयजल एवं जल स्रोतों की स्थिति"
      icon={<Droplets size={22} />}
      status={hasWaterIssue ? "warning" : "good"}
    >
      <DetailRow
        label="नल-जल सुविधा"
        value={getYesNo(data.tapWater)}
      />

      <DetailRow
        label="नल-जल से वंचित परिवार"
        value={tapWaterExcludedFamilies}
      />

      <DetailRow
        label="उपलब्ध तालाब"
        value={getValue(data.ponds, "0")}
      />

      <DetailRow
        label="हैंडपंप आवश्यकता"
        value={getValue(
          development.handpumpRequirement,
          "0"
        )}
      />

      <DetailRow
        label="बोरवेल आवश्यकता"
        value={getValue(
          development.borewellRequirement,
          "0"
        )}
      />

      <DetailRow
        label="सोलर पंप आवश्यकता"
        value={getValue(
          development.solarPumpRequirement,
          "0"
        )}
      />
    </Section>
  );

  const renderEducation = () => (
    <Section
      title="शिक्षा"
      description="गाँव में विद्यालय एवं आंगनबाड़ी की स्थिति"
      icon={<GraduationCap size={22} />}
      status="good"
    >
      <DetailRow
        label="कुल विद्यालय"
        value={totalSchools}
      />

      <DetailRow
        label="कुल आंगनबाड़ी केंद्र"
        value={totalAnganwadi}
      />

      <DetailRow
        label="विद्यालय संबंधी विस्तृत जानकारी"
        value={
          data.schoolData
            ? "उपलब्ध"
            : "विवरण उपलब्ध नहीं"
        }
      />

      <DetailRow
        label="आंगनबाड़ी संबंधी विस्तृत जानकारी"
        value={
          data.anganbadiData
            ? "उपलब्ध"
            : "विवरण उपलब्ध नहीं"
        }
      />
    </Section>
  );

  const renderHealth = () => (
    <Section
      title="स्वास्थ्य"
      description="गाँव में स्वास्थ्य सेवाओं एवं सुविधाओं की स्थिति"
      icon={<HeartPulse size={22} />}
      status={
        Number(totalHealthFacilities) === 0
          ? "warning"
          : "good"
      }
    >
      <DetailRow
        label="कुल स्वास्थ्य केंद्र"
        value={totalHealthFacilities}
      />

      <DetailRow
        label="पशु चिकित्सक सुविधा"
        value={getYesNo(data.vet)}
      />

      <DetailRow
        label="निःशुल्क दवा"
        value={
              healthData.freeMedicines
            ? getYesNo(
                healthData.freeMedicines
              )
            : "विवरण देखें"
        }
      />

      <DetailRow
        label="स्वास्थ्य सर्वेक्षण"
        value={
          data.healthData
            ? "विस्तृत जानकारी उपलब्ध"
            : "विवरण उपलब्ध नहीं"
        }
      />

      <DetailRow
        label="अस्पताल / स्वास्थ्य केंद्र"
        value={
          Number(totalHealthFacilities) > 0
            ? `${totalHealthFacilities} उपलब्ध`
            : "उपलब्ध नहीं"
        }
      />
    </Section>
  );

  const renderHousing = () => (
    <Section
      title="आवास"
      description="गाँव में आवास एवं स्वच्छता की स्थिति"
      icon={<House size={22} />}
      status={
        hasHousingIssue
          ? "warning"
          : "good"
      }
    >
      <DetailRow
        label="पक्के घर"
        value={puccaHouses}
      />

      <DetailRow
        label="कच्चे घर"
        value={rawHouses}
      />

      <DetailRow
        label="आवास लंबित"
        value={pendingHouses}
      />

      <DetailRow
        label="आवास स्वीकृत नहीं"
        value={getValue(
          data.housingNotSanctioned,
          "0"
        )}
      />

      <DetailRow
        label="पूर्ण हुए आवास"
        value={getValue(
          data.completedHouses,
          "0"
        )}
      />

      <DetailRow
        label="ODF स्थिति"
        value={getYesNo(data.odf)}
      />
    </Section>
  );

  const renderRoad = () => (
    <Section
      title="सड़क एवं संपर्क"
      description="गाँव की सड़क एवं संपर्क व्यवस्था"
      icon={<Map size={22} />}
      status={
        hasRoadIssue
          ? "warning"
          : "good"
      }
    >
      <DetailRow
        label="पक्की सड़क"
        value={getYesNo(data.road)}
      />

      <DetailRow
        label="बारिश में संपर्क कटता है"
        value={getYesNo(data.rainCutoff)}
      />

      <DetailRow
        label="दुकान की दूरी"
        value={getValue(
          data.shopDistance
        )}
      />

      <DetailRow
        label="मोबाइल नेटवर्क की दूरी"
        value={getValue(
          data.networkDistance
        )}
      />

      <DetailRow
        label="सड़क सुधार आवश्यकता"
        value={getValue(
          development.roadRequirement,
          "0"
        )}
      />
    </Section>
  );

  const renderElectricity = () => (
    <Section
      title="बिजली एवं सौर ऊर्जा"
      description="गाँव में बिजली एवं सौर ऊर्जा की स्थिति"
      icon={<Lightbulb size={22} />}
      status={
        hasElectricityIssue
          ? "warning"
          : "good"
      }
    >
      <DetailRow
        label="बिजली सुविधा"
        value={getYesNo(data.electricity)}
      />

      <DetailRow
        label="सोलर स्ट्रीट लाइट"
        value={getYesNo(data.solarLight)}
      />

      <DetailRow
        label="सोलर पंप आवश्यकता"
        value={getValue(
          development.solarPumpRequirement,
          "0"
        )}
      />

      <DetailRow
        label="सोलर स्ट्रीट लाइट आवश्यकता"
        value={getValue(
          development.solarStreetLightRequirement,
          "0"
        )}
      />
    </Section>
  );

  const renderDevelopment = () => (
    <Section
      title="विकास आवश्यकताएँ"
      description="गाँव में आवश्यक विकास कार्य एवं आधारभूत संरचना"
      icon={<Building2 size={22} />}
      status={
        hasDevelopmentNeed
          ? "warning"
          : "neutral"
      }
    >
      <DetailRow
        label="हैंडपंप आवश्यकता"
        value={getValue(
          development.handpumpRequirement,
          "0"
        )}
      />

      <DetailRow
        label="बोरवेल आवश्यकता"
        value={getValue(
          development.borewellRequirement,
          "0"
        )}
      />

      <DetailRow
        label="सोलर पंप आवश्यकता"
        value={getValue(
          development.solarPumpRequirement,
          "0"
        )}
      />

      <DetailRow
        label="सोलर स्ट्रीट लाइट आवश्यकता"
        value={getValue(
          development.solarStreetLightRequirement,
          "0"
        )}
      />

      <DetailRow
        label="सड़क आवश्यकता"
        value={getValue(
          development.roadRequirement,
          "0"
        )}
      />

      <DetailRow
        label="अन्य आधारभूत संरचना"
        value={getValue(
          development.otherInfrastructureRequirement,
          "कोई जानकारी नहीं"
        )}
      />

      <DetailRow
        label="प्राथमिकता कार्य 1"
        value={getValue(
          development.priorityWork1
        )}
      />

      <DetailRow
        label="प्राथमिकता कार्य 2"
        value={getValue(
          development.priorityWork2
        )}
      />

      <DetailRow
        label="प्राथमिकता कार्य 3"
        value={getValue(
          development.priorityWork3
        )}
      />

      <DetailRow
        label="अतिरिक्त टिप्पणी"
        value={getValue(
          development.additionalRemarks
        )}
      />
    </Section>
  );

  const renderCategory = () => {
    switch (category) {
      case "water":
        return renderWater();

      case "education":
        return renderEducation();

      case "health":
        return renderHealth();

      case "housing":
        return renderHousing();

      case "road":
        return renderRoad();

      case "electricity":
        return renderElectricity();

      case "development":
        return renderDevelopment();

      default:
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              इस श्रेणी की जानकारी उपलब्ध नहीं है।
            </p>
          </div>
        );
    }
  };

  const categoryNames: Record<string, string> = {
    water: "पेयजल",
    education: "शिक्षा",
    health: "स्वास्थ्य",
    housing: "आवास",
    road: "सड़क एवं संपर्क",
    electricity: "बिजली एवं सौर ऊर्जा",
    development: "विकास आवश्यकताएँ",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
              ग्राम अवलोकन · विस्तृत जानकारी
            </span>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {categoryNames[category] || "विस्तृत जानकारी"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {villageName} · ग्राम पंचायत:{" "}
              {panchayatName} · ब्लॉक: {blockName}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft
              size={15}
              className="mr-1.5"
            />

            ग्राम अवलोकन पर वापस जाएँ
          </button>
        </div>
      </div>

      {/* Quick summary */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">
            संक्षिप्त स्थिति
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            चयनित श्रेणी से संबंधित प्रमुख आँकड़े
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {category === "water" && (
            <>
              <DetailCard
                label="नल-जल सुविधा"
                value={getYesNo(data.tapWater)}
              />

              <DetailCard
                label="वंचित परिवार"
                value={tapWaterExcludedFamilies}
              />

              <DetailCard
                label="तालाब"
                value={getValue(
                  data.ponds,
                  "0"
                )}
              />

              <DetailCard
                label="हैंडपंप आवश्यकता"
                value={getValue(
                  development.handpumpRequirement,
                  "0"
                )}
              />
            </>
          )}

          {category === "education" && (
            <>
              <DetailCard
                label="कुल विद्यालय"
                value={totalSchools}
              />

              <DetailCard
                label="आंगनबाड़ी"
                value={totalAnganwadi}
              />

              <DetailCard
                label="विद्यालय डेटा"
                value={
                  data.schoolData
                    ? "उपलब्ध"
                    : "नहीं"
                }
              />

              <DetailCard
                label="आंगनबाड़ी डेटा"
                value={
                  data.anganbadiData
                    ? "उपलब्ध"
                    : "नहीं"
                }
              />
            </>
          )}

          {category === "health" && (
            <>
              <DetailCard
                label="स्वास्थ्य केंद्र"
                value={totalHealthFacilities}
              />

              <DetailCard
                label="पशु चिकित्सक"
                value={getYesNo(data.vet)}
              />

              <DetailCard
                label="स्वास्थ्य डेटा"
                value={
                  data.healthData
                    ? "उपलब्ध"
                    : "नहीं"
                }
              />

              <DetailCard
                label="निःशुल्क दवा"
                value={
                  healthData.freeMedicines
                    ? getYesNo(
                    healthData.freeMedicines
                      )
                    : "विवरण देखें"
                }
              />
            </>
          )}

          {category === "housing" && (
            <>
              <DetailCard
                label="पक्के घर"
                value={puccaHouses}
              />

              <DetailCard
                label="कच्चे घर"
                value={rawHouses}
              />

              <DetailCard
                label="आवास लंबित"
                value={pendingHouses}
              />

              <DetailCard
                label="ODF"
                value={getYesNo(data.odf)}
              />
            </>
          )}

          {category === "road" && (
            <>
              <DetailCard
                label="पक्की सड़क"
                value={getYesNo(data.road)}
              />

              <DetailCard
                label="बारिश में संपर्क"
                value={getYesNo(
                  data.rainCutoff
                )}
              />

              <DetailCard
                label="सड़क आवश्यकता"
                value={getValue(
                  development.roadRequirement,
                  "0"
                )}
              />

              <DetailCard
                label="दुकान की दूरी"
                value={getValue(
                  data.shopDistance
                )}
              />
            </>
          )}

          {category === "electricity" && (
            <>
              <DetailCard
                label="बिजली सुविधा"
                value={getYesNo(
                  data.electricity
                )}
              />

              <DetailCard
                label="सोलर स्ट्रीट लाइट"
                value={getYesNo(
                  data.solarLight
                )}
              />

              <DetailCard
                label="सोलर पंप आवश्यकता"
                value={getValue(
                  development.solarPumpRequirement,
                  "0"
                )}
              />

              <DetailCard
                label="सोलर लाइट आवश्यकता"
                value={getValue(
                  development.solarStreetLightRequirement,
                  "0"
                )}
              />
            </>
          )}

          {category === "development" && (
            <>
              <DetailCard
                label="हैंडपंप आवश्यकता"
                value={getValue(
                  development.handpumpRequirement,
                  "0"
                )}
              />

              <DetailCard
                label="बोरवेल आवश्यकता"
                value={getValue(
                  development.borewellRequirement,
                  "0"
                )}
              />

              <DetailCard
                label="सड़क आवश्यकता"
                value={getValue(
                  development.roadRequirement,
                  "0"
                )}
              />

              <DetailCard
                label="सोलर पंप आवश्यकता"
                value={getValue(
                  development.solarPumpRequirement,
                  "0"
                )}
              />
            </>
          )}
        </div>
      </div>

      {/* Detailed section */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">
            विस्तृत जानकारी
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            सर्वेक्षण में दर्ज जानकारी का विस्तृत विवरण
          </p>
        </div>

        {renderCategory()}
      </div>
    </div>
  );
}
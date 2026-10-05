import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Droplets,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  Map,
  Building2,
  Users,
} from "lucide-react";

interface VillageOverviewProps {
  villageName: string;
  blockName: string;
  panchayatName: string;
  villageData: Record<string, unknown>;
  onBack: () => void;
  onCategoryClick: (category: string) => void;
}

interface OverviewCardProps {
  icon: React.ReactNode;
  title: string;
  items: {
    label: string;
    value: string;
  }[];
  status?: "good" | "warning" | "neutral";
  onClick?: () => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  icon,
  title,
  items,
  status = "neutral",
  onClick,
}) => {
  const statusConfig = {
    good: {
      text: "स्थिति सामान्य",
      className: "bg-emerald-50 text-emerald-700",
    },
    warning: {
      text: "ध्यान आवश्यक",
      className: "bg-amber-50 text-amber-700",
    },
    neutral: {
      text: "विवरण उपलब्ध",
      className: "bg-slate-100 text-slate-600",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {icon}
        </div>

        <ChevronRight
          size={19}
          className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600"
        />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-slate-500">
              {item.label}
            </span>

            <span className="font-bold text-slate-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${currentStatus.className}`}
        >
          {currentStatus.text}
        </span>
      </div>

      <div className="mt-4 text-xs font-bold text-blue-600">
        विस्तृत जानकारी देखें →
      </div>
    </button>
  );
};

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

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

export default function VillageOverview({
  villageName,
  blockName,
  panchayatName,
  villageData,
  onBack,
  onCategoryClick,
}: VillageOverviewProps) {
  const data = villageData;

  const totalHouseholds = getValue(
    data.totalHouseholds,
    "0"
  );

  const totalPopulation = getValue(
    data.totalPopulation,
    "0"
  );

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

  const tapWaterExcludedFamilies = getValue(
    data.tapWaterExcludedFamilies,
    "0"
  );

  const development = toRecord(data.developmentData);
  const healthData = toRecord(Array.isArray(data.healthData) ? data.healthData[0] : data.healthData);

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

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
              ग्राम अवलोकन
            </span>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {villageName}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              ग्राम पंचायत: {panchayatName} · ब्लॉक: {blockName}
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
            रिपोर्ट पर वापस जाएँ
          </button>

        </div>
      </div>

      {/* ================= SUMMARY ================= */}

      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">
            ग्राम का संक्षिप्त विवरण
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            सर्वेक्षण से प्राप्त प्रमुख आँकड़े
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Total Households */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Users className="h-5 w-5 text-blue-600" />

            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              कुल परिवार
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {totalHouseholds}
            </p>
          </div>

          {/* Population */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Users className="h-5 w-5 text-emerald-600" />

            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              कुल जनसंख्या
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {totalPopulation}
            </p>
          </div>

          {/* Schools */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <GraduationCap className="h-5 w-5 text-violet-600" />

            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              कुल विद्यालय
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {totalSchools}
            </p>
          </div>

          {/* Anganwadi */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Building2 className="h-5 w-5 text-orange-600" />

            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              आंगनबाड़ी केंद्र
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {totalAnganwadi}
            </p>
          </div>

        </div>
      </div>

      {/* ================= CATEGORY CARDS ================= */}

      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">
            ग्राम की प्रमुख स्थिति
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            किसी श्रेणी पर क्लिक करके विस्तृत जानकारी देख सकते हैं।
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* ================= WATER ================= */}

          <OverviewCard
            title="पेयजल"
            icon={
              <Droplets size={22} />
            }
            status={
              hasWaterIssue
                ? "warning"
                : "good"
            }
            items={[
              {
                label: "नल-जल सुविधा",
                value: getYesNo(
                  data.tapWater
                ),
              },
              {
                label: "वंचित परिवार",
                value: tapWaterExcludedFamilies,
              },
              {
                label: "तालाब",
                value: getValue(
                  data.ponds,
                  "0"
                ),
              },
            ]}
            onClick={() =>
              onCategoryClick("water")
            }
          />

          {/* ================= EDUCATION ================= */}

          <OverviewCard
            title="शिक्षा"
            icon={
              <GraduationCap size={22} />
            }
            status="good"
            items={[
              {
                label: "विद्यालय",
                value: totalSchools,
              },
              {
                label: "आंगनबाड़ी",
                value: totalAnganwadi,
              },
              {
                label: "विद्यालय न जाने वाले",
                value: "विस्तृत रिपोर्ट",
              },
            ]}
            onClick={() =>
              onCategoryClick("education")
            }
          />

          {/* ================= HEALTH ================= */}

          <OverviewCard
            title="स्वास्थ्य"
            icon={
              <HeartPulse size={22} />
            }
            status={
              Number(totalHealthFacilities) === 0
                ? "warning"
                : "good"
            }
            items={[
              {
                label: "स्वास्थ्य केंद्र",
                value: totalHealthFacilities,
              },
              {
                label: "पशु चिकित्सक",
                value: getYesNo(
                  data.vet
                ),
              },
              {
                label: "निःशुल्क दवा",
                value:
                  healthData.freeMedicines
                    ? getYesNo(
                    healthData.freeMedicines
                      )
                    : "विवरण देखें",
              },
            ]}
            onClick={() =>
              onCategoryClick("health")
            }
          />

          {/* ================= HOUSING ================= */}

          <OverviewCard
            title="आवास"
            icon={
              <House size={22} />
            }
            status={
              hasHousingIssue
                ? "warning"
                : "good"
            }
            items={[
              {
                label: "पक्के घर",
                value: puccaHouses,
              },
              {
                label: "कच्चे घर",
                value: rawHouses,
              },
              {
                label: "आवास लंबित",
                value: pendingHouses,
              },
            ]}
            onClick={() =>
              onCategoryClick("housing")
            }
          />

          {/* ================= ROAD ================= */}

          <OverviewCard
            title="सड़क एवं संपर्क"
            icon={
              <Map size={22} />
            }
            status={
              hasRoadIssue
                ? "warning"
                : "good"
            }
            items={[
              {
                label: "पक्की सड़क",
                value: getYesNo(
                  data.road
                ),
              },
              {
                label: "बारिश में संपर्क कटता है",
                value: getYesNo(
                  data.rainCutoff
                ),
              },
              {
                label: "सड़क सुधार",
                value: getValue(
                  development.roadRequirement,
                  "कोई जानकारी नहीं"
                ),
              },
            ]}
            onClick={() =>
              onCategoryClick("road")
            }
          />

          {/* ================= ELECTRICITY ================= */}

          <OverviewCard
            title="बिजली एवं सौर ऊर्जा"
            icon={
              <Lightbulb size={22} />
            }
            status={
              hasElectricityIssue
                ? "warning"
                : "good"
            }
            items={[
              {
                label: "बिजली सुविधा",
                value: getYesNo(
                  data.electricity
                ),
              },
              {
                label: "सोलर स्ट्रीट लाइट",
                value: getYesNo(
                  data.solarLight
                ),
              },
              {
                label: "सोलर पंप आवश्यकता",
                value: getValue(
                  development.solarPumpRequirement,
                  "0"
                ),
              },
            ]}
            onClick={() =>
              onCategoryClick("electricity")
            }
          />

          {/* ================= DEVELOPMENT ================= */}

          <OverviewCard
            title="विकास आवश्यकताएँ"
            icon={
              <Building2 size={22} />
            }
            status={
              hasDevelopmentNeed
                ? "warning"
                : "neutral"
            }
            items={[
              {
                label: "हैंडपंप आवश्यकता",
                value: getValue(
                  development.handpumpRequirement,
                  "0"
                ),
              },
              {
                label: "बोरवेल आवश्यकता",
                value: getValue(
                  development.borewellRequirement,
                  "0"
                ),
              },
              {
                label: "सड़क आवश्यकता",
                value: getValue(
                  development.roadRequirement,
                  "0"
                ),
              },
            ]}
            onClick={() =>
              onCategoryClick("development")
            }
          />

        </div>
      </div>

    </div>
  );
}
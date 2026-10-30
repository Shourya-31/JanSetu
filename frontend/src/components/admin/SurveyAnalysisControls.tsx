import type { AdminLocationBlock } from "../../types/adminReports";
import { RefreshCw } from "lucide-react";
import type {
  SurveyAnalysisKind,
  SurveyAnalysisSort,
  SurveyAnalysisStatus,
} from "./useAdminSurveyAnalysis";

type Props = {
  kind: SurveyAnalysisKind;
  hierarchy: AdminLocationBlock[];
  panchayats: AdminLocationBlock["panchayats"];
  villages: AdminLocationBlock["panchayats"][number]["villages"];
  blockId: string;
  panchayatId: string;
  villageId: string;
  selectBlock: (value: string) => void;
  selectPanchayat: (value: string) => void;
  selectVillage: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  status: SurveyAnalysisStatus;
  setStatus: (value: SurveyAnalysisStatus) => void;
  sortBy: SurveyAnalysisSort;
  setSortBy: (value: SurveyAnalysisSort) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  onRefresh: () => void;
};

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700";

export function SurveyAnalysisControls(props: Props) {
  const sortOptions: { value: SurveyAnalysisSort; label: string }[] =
    props.kind === "villages"
      ? [
          { value: "name", label: "गाँव का नाम" },
          { value: "affectedStatus", label: "प्रभावित स्थिति" },
        ]
      : [
          { value: "houseNumber", label: "मकान नंबर" },
          { value: "headName", label: "मुखिया का नाम" },
          { value: "submittedAt", label: "जमा तारीख" },
          { value: "status", label: "पूर्णता स्थिति" },
        ];

  return (
    <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1 text-xs font-semibold text-slate-600">
        ब्लॉक
        <select
          className={selectClass}
          value={props.blockId}
          onChange={(event) => props.selectBlock(event.target.value)}
        >
          <option value="">सभी ब्लॉक</option>
          {props.hierarchy.map((block) => (
            <option key={block.id} value={block.id}>
              {block.blockName}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-600">
        ग्राम पंचायत
        <select
          className={selectClass}
          value={props.panchayatId}
          disabled={!props.blockId}
          onChange={(event) => props.selectPanchayat(event.target.value)}
        >
          <option value="">सभी ग्राम पंचायत</option>
          {props.panchayats.map((panchayat) => (
            <option key={panchayat.id} value={panchayat.id}>
              {panchayat.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-600">
        गाँव
        <select
          className={selectClass}
          value={props.villageId}
          disabled={!props.panchayatId}
          onChange={(event) => props.selectVillage(event.target.value)}
        >
          <option value="">सभी गाँव</option>
          {props.villages.map((village) => (
            <option key={village.id} value={village.id}>
              {village.nameHindi}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-600">
        सर्वे स्थिति
        <select
          className={selectClass}
          value={props.status}
          onChange={(event) =>
            props.setStatus(event.target.value as SurveyAnalysisStatus)
          }
        >
          <option value="all">सभी स्थिति</option>
          <option value="completed">पूर्ण</option>
          <option value="incomplete">अपूर्ण</option>
          {props.kind === "villages" && <option value="pending">सर्वे शुरू नहीं</option>}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-600 sm:col-span-2">
        रिकॉर्ड खोजें
        <input
          className={selectClass}
          value={props.search}
          onChange={(event) => props.setSearch(event.target.value)}
          placeholder={
            props.kind === "villages"
              ? "गाँव का नाम खोजें"
              : "मुखिया, मोबाइल, मकान या गाँव खोजें"
          }
        />
      </label>
      <label className="space-y-1 text-xs font-semibold text-slate-600">
        क्रमबद्ध करें
        <select
          className={selectClass}
          value={props.sortBy}
          onChange={(event) =>
            props.setSortBy(event.target.value as SurveyAnalysisSort)
          }
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-xs font-semibold text-slate-600">
          दिशा
          <select
            className={selectClass}
            value={props.sortOrder}
            onChange={(event) =>
              props.setSortOrder(event.target.value as "asc" | "desc")
            }
          >
            <option value="asc">आरोही</option>
            <option value="desc">अवरोही</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600">
          प्रति पृष्ठ
          <select
            className={selectClass}
            value={props.pageSize}
            onChange={(event) => props.setPageSize(Number(event.target.value))}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-end">
        <button
          type="button"
          onClick={props.onRefresh}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={15} aria-hidden="true" />
          डेटा ताज़ा करें
        </button>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import type { AdminLocationBlock } from "../../types/adminReports";

export type SurveyAnalysisKind = "villages" | "households";
export type SurveyAnalysisStatus = "all" | "completed" | "incomplete" | "pending";
export type SurveyAnalysisSort =
  | "name"
  | "affectedStatus"
  | "houseNumber"
  | "headName"
  | "submittedAt"
  | "status";

export type SurveyAnalysisStats = {
  total: number;
  completed: number;
  incomplete: number;
  pending: number;
  completionPercent: number;
};

export type SurveyAnalysisResult<T> = {
  records: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  stats: SurveyAnalysisStats;
};

export function useAdminSurveyAnalysis<T>(kind: SurveyAnalysisKind) {
  const [hierarchyRefreshKey, setHierarchyRefreshKey] = useState(0);
  const [hierarchyState, setHierarchyState] = useState<{
    key: number;
    hierarchy: AdminLocationBlock[];
    error: string;
  } | null>(null);
  const [blockId, setBlockId] = useState("");
  const [panchayatId, setPanchayatId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<SurveyAnalysisStatus>("all");
  const [sortBy, setSortBy] = useState<SurveyAnalysisSort>(
    kind === "villages" ? "name" : "houseNumber",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [refreshKey, setRefreshKey] = useState(0);
  const [requestState, setRequestState] = useState<{
    key: string;
    result: SurveyAnalysisResult<T> | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<AdminLocationBlock[]>("/api/admin/hierarchy", {
      signal: controller.signal,
    })
      .then(
        (value) => {
          setHierarchyState({ key: hierarchyRefreshKey, hierarchy: value, error: "" });
        },
        (cause: unknown) => {
          if (!controller.signal.aborted) {
            setHierarchyState({
              key: hierarchyRefreshKey,
              hierarchy: [],
              error: cause instanceof Error
                ? cause.message
                : "स्थान सूची लोड नहीं हो सकी।",
            });
          }
        },
      );
    return () => controller.abort();
  }, [hierarchyRefreshKey]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      status,
      sortBy,
      sortOrder,
    });
    if (blockId) params.set("blockId", blockId);
    if (panchayatId) params.set("panchayatId", panchayatId);
    if (villageId) params.set("villageId", villageId);
    if (debouncedSearch) params.set("search", debouncedSearch);
    return params.toString();
  }, [
    blockId,
    debouncedSearch,
    page,
    pageSize,
    panchayatId,
    sortBy,
    sortOrder,
    status,
    villageId,
  ]);
  const requestKey = `${kind}:${queryString}:${refreshKey}`;
  const hierarchy = useMemo(
    () => hierarchyState?.key === hierarchyRefreshKey
      ? hierarchyState.hierarchy
      : [],
    [hierarchyRefreshKey, hierarchyState],
  );
  const hierarchyLoading = hierarchyState?.key !== hierarchyRefreshKey;
  const hierarchyError = hierarchyState?.key === hierarchyRefreshKey
    ? hierarchyState.error
    : "";

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<SurveyAnalysisResult<T>>(
      `/api/admin/survey-analysis/${kind}?${queryString}`,
      { signal: controller.signal },
    ).then(
      (response) => {
        setRequestState({ key: requestKey, result: response, error: "" });
      },
      (cause: unknown) => {
        if (!controller.signal.aborted) {
          setRequestState({
            key: requestKey,
            result: null,
            error: cause instanceof Error
              ? cause.message
              : "सर्वे डेटा लोड नहीं हो सका।",
          });
        }
      },
    );
    return () => controller.abort();
  }, [kind, queryString, requestKey]);

  const panchayats = useMemo(
    () => hierarchy.find((block) => block.id === blockId)?.panchayats ?? [],
    [blockId, hierarchy],
  );
  const villages = useMemo(
    () =>
      panchayats.find((panchayat) => panchayat.id === panchayatId)?.villages ??
      [],
    [panchayats, panchayatId],
  );

  const selectBlock = useCallback((value: string) => {
    setBlockId(value);
    setPanchayatId("");
    setVillageId("");
    setPage(1);
  }, []);
  const selectPanchayat = useCallback((value: string) => {
    setPanchayatId(value);
    setVillageId("");
    setPage(1);
  }, []);
  const selectVillage = useCallback((value: string) => {
    setVillageId(value);
    setPage(1);
  }, []);
  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);
  const retry = useCallback(() => {
    setRefreshKey((key) => key + 1);
    setHierarchyRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    window.addEventListener("focus", retry);
    return () => window.removeEventListener("focus", retry);
  }, [retry]);

  return {
    hierarchy,
    hierarchyLoading,
    hierarchyError,
    panchayats,
    villages,
    blockId,
    panchayatId,
    villageId,
    selectBlock,
    selectPanchayat,
    selectVillage,
    search,
    setSearch: updateSearch,
    status,
    setStatus: (value: SurveyAnalysisStatus) => {
      setStatus(value);
      setPage(1);
    },
    sortBy,
    setSortBy: (value: SurveyAnalysisSort) => {
      setSortBy(value);
      setPage(1);
    },
    sortOrder,
    setSortOrder: (value: "asc" | "desc") => {
      setSortOrder(value);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    setPageSize: (value: number) => {
      setPageSize(value);
      setPage(1);
    },
    result: requestState?.key === requestKey ? requestState.result : null,
    loading: requestState?.key !== requestKey,
    error: requestState?.key === requestKey ? requestState.error : "",
    retry,
  };
}

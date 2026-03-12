import { useState, useEffect, useCallback } from "react";
import { triageHistoryService } from "../services/triageHistoryService";
import { TriageHistory } from "../lib/types";

const PAGE_SIZE = 10;

// Função simples para formatar data
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function useTriageHistory() {
  const [history, setHistory] = useState<TriageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const mapItems = (items: typeof history extends (infer T)[] ? T[] : never[]) => {
    return items;
  };

  const loadHistory = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await triageHistoryService.getHistory(pageNum, PAGE_SIZE);

      const mapped: TriageHistory[] = response.items.map((item) => {
        const title =
          item.chiefComplaint ||
          item.symptoms?.join(", ") ||
          "Triagem sem título";

        return {
          id: item.sessionId,
          title: title.length > 50 ? title.substring(0, 47) + "..." : title,
          date: formatRelativeDate(new Date(item.updatedAt)),
          status: item.status,
          summary: item.summary,
          isActive: item.isActive,
        };
      });

      if (append) {
        setHistory((prev) => [...prev, ...mapped]);
      } else {
        setHistory(mapped);
      }

      setTotal(response.total);
      setPage(pageNum);
      setHasMore(pageNum * PAGE_SIZE < response.total);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao carregar histórico:", err);
      setError(err.message || "Erro ao carregar histórico");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1, false);
  }, [loadHistory]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadHistory(page + 1, true);
    }
  }, [loadHistory, loadingMore, hasMore, page]);

  const reload = useCallback(() => {
    setPage(1);
    loadHistory(1, false);
  }, [loadHistory]);

  return {
    history,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    reload,
  };
}

import { useCallback, useEffect, useState } from "react";
import { request } from "./api";
export function useResource<T>(actorId: string, path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setError(undefined);
    return request<T>(actorId, path)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [actorId, path]);
  useEffect(() => {
    setData(undefined);
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}

import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { KeywordResponse } from "../types";

export function useGenerateKeywords() {
  return useMutation({
    mutationFn: (niche: string) =>
      api.post("keywords/generate", { json: { niche } }).json<KeywordResponse>(),
  });
}

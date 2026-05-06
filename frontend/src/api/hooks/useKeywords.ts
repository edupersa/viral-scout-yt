import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { KeywordResponse } from "../types";

interface GenerateKeywordsRequest {
  niche: string;
  language: string | null;
}

export function useGenerateKeywords() {
  return useMutation({
    mutationFn: (req: GenerateKeywordsRequest) =>
      api.post("keywords/generate", { json: req }).json<KeywordResponse>(),
  });
}

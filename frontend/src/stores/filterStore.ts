import { create } from "zustand";
import type { DateRange, Duration } from "../api/types";

interface FilterValues {
  language: string;
  duration: Duration | "";
  minSubs: number;
  maxSubs: number;
  maxSubsLimited: boolean;
  minViews: number;
  maxViews: number;
  maxViewsLimited: boolean;
  dateRange: DateRange | "";
}

interface FilterActions {
  setFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  resetFilters: () => void;
}

type FilterState = FilterValues & FilterActions;

const DEFAULT_FILTERS: FilterValues = {
  language: "",
  duration: "",
  minSubs: 0,
  maxSubs: 1_000_000,
  maxSubsLimited: false,
  minViews: 0,
  maxViews: 1_000_000,
  maxViewsLimited: false,
  dateRange: "",
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>),
  resetFilters: () => set(DEFAULT_FILTERS),
}));

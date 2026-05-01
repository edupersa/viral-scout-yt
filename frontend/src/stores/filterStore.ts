import { create } from "zustand";
import type { DateRange, Duration } from "../api/types";

interface FilterValues {
  language: string;
  duration: Duration | "";
  minSubs: number;
  maxSubs: number;
  minViews: number;
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
  maxSubs: 10_000_000,
  minViews: 0,
  dateRange: "",
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>),
  resetFilters: () => set(DEFAULT_FILTERS),
}));

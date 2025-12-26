"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  useGetPrioritiesQuery,
  useGetStatusesQuery,
} from "../tasks/queries/tasksApi";
import {
  setPriorities,
  setStatuses,
  setSelectedType,
  setSelectedItemId,
} from "./store/keywordsSlice";
import { useAppSelector } from "@/store/hooks";
import { KeywordsMapperContent } from "./components/KeywordsMapperContent";
import { LoadingSpinner } from "../connect/components/LoadingSpinner";

export default function KeywordsMapperPage() {
  const dispatch = useDispatch();
  const selectedType = useAppSelector((state) => state.keywords.selectedType);
  const selectedItemId = useAppSelector(
    (state) => state.keywords.selectedItemId
  );

  // API queries
  const { data: prioritiesData, isLoading: prioritiesLoading } =
    useGetPrioritiesQuery();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetStatusesQuery();

  // Update Redux state when API data changes
  useEffect(() => {
    if (prioritiesData?.priorities) {
      dispatch(setPriorities(prioritiesData.priorities));
    }
  }, [prioritiesData, dispatch]);

  useEffect(() => {
    if (statusesData?.statuses) {
      dispatch(setStatuses(statusesData.statuses));
    }
  }, [statusesData, dispatch]);

  // Get data from Redux
  const priorities = useAppSelector((state) => state.keywords.priorities);
  const statuses = useAppSelector((state) => state.keywords.statuses);

  if (prioritiesLoading || statusesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Keywords Mapping</h1>
          <p className="text-muted-foreground">
            Map keywords and phrases to priorities and statuses to help AI
            effectively categorize your tasks based on your personal
            preferences. This will help AI understand your vocabulary and
            prioritize tasks accordingly.
          </p>
        </div>

        <KeywordsMapperContent
          priorities={priorities}
          statuses={statuses}
          selectedType={selectedType}
          selectedItemId={selectedItemId}
          onTypeChange={(type) => dispatch(setSelectedType(type))}
          onItemSelect={(id) => dispatch(setSelectedItemId(id))}
        />
      </div>
    </div>
  );
}

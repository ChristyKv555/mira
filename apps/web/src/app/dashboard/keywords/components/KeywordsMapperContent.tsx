"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { X } from "lucide-react";
import type { TaskStatus, TaskPriority } from "../../tasks/types";

interface KeywordsMapperContentProps {
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  selectedType: "priority" | "status";
  selectedItemId: string | null;
  onTypeChange: (type: "priority" | "status") => void;
  onItemSelect: (id: string | null) => void;
}

export function KeywordsMapperContent({
  priorities,
  statuses,
  selectedType,
  selectedItemId,
  onTypeChange,
  onItemSelect,
}: KeywordsMapperContentProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);

  // Get the selected item based on type
  const selectedItem =
    selectedType === "priority"
      ? priorities.find((p) => p.id === selectedItemId)
      : statuses.find((s) => s.id === selectedItemId);

  // Get items list based on selected type
  const items = selectedType === "priority" ? priorities : statuses;

  const handleTypeChange = (type: "priority" | "status") => {
    onTypeChange(type);
    onItemSelect(null); // Reset selection when switching type
    setKeywords([]); // Clear keywords when switching
  };

  const handleItemClick = (id: string) => {
    if (selectedItemId === id) {
      onItemSelect(null); // Deselect if clicking the same item
      setKeywords([]);
    } else {
      onItemSelect(id);
      // TODO: Load existing keywords for this item from API
      setKeywords([]);
    }
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKeyword = keywordInput.trim();
    if (
      trimmedKeyword &&
      trimmedKeyword.length <= 50 &&
      !keywords.includes(trimmedKeyword)
    ) {
      setKeywords([...keywords, trimmedKeyword]);
      setKeywordInput("");
      // TODO: Save keyword to API
    }
  };

  const handleDeleteKeyword = (keyword: string) => {
    setKeywordToDelete(keyword);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteKeyword = () => {
    if (keywordToDelete) {
      setKeywords(keywords.filter((k) => k !== keywordToDelete));
      setKeywordToDelete(null);
      // TODO: Delete keyword from API
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3">Select Type</h2>
          <Tabs
            value={selectedType}
            onValueChange={(value) =>
              handleTypeChange(value as "priority" | "status")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="priority">Priorities</TabsTrigger>
              <TabsTrigger value="status">Statuses</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {selectedType === "priority" ? "Priorities" : "Statuses"}
          </h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No {selectedType === "priority" ? "priorities" : "statuses"}{" "}
              found. Please create one first.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Right Column */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Keywords</h2>
        {selectedItem ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Add keywords or phrases (max 50 characters) for:{" "}
                <span className="font-medium">{selectedItem.label}</span>
              </p>
              <form onSubmit={handleKeywordSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter keyword or phrase..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  maxLength={50}
                  className="flex-1"
                />
                <Button type="submit" disabled={!keywordInput.trim()}>
                  Add
                </Button>
              </form>
            </div>

            <div className="space-y-3">
              {keywords.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No keywords added yet. Add keywords above to help AI
                  categorize tasks.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => handleDeleteKeyword(keyword)}
                        className="hover:text-destructive transition-colors"
                        aria-label={`Delete ${keyword}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Select a {selectedType === "priority" ? "priority" : "status"}{" "}
              from the left to start adding keywords.
            </p>
          </div>
        )}

        <ConfirmationModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Keyword"
          description={`Are you sure you want to delete "${keywordToDelete}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="destructive"
          onConfirm={confirmDeleteKeyword}
        />
      </Card>
    </div>
  );
}

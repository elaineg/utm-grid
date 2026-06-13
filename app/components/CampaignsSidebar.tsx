"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteCampaign,
  duplicateCampaign,
  findCampaignByName,
  relativeTime,
  saveCampaign,
  type Campaign,
} from "../../lib/campaigns";
import type { LintSettings, UtmRow } from "../../lib/types";

interface CampaignsSidebarProps {
  campaigns: Campaign[];
  openCampaignId: string | null;
  isDirty: boolean;
  /** Called when the user saves the current grid as a named campaign. */
  onSave: (campaigns: Campaign[], savedCampaign: Campaign) => void;
  /** Called when the user opens a campaign (after any confirm). */
  onOpen: (campaign: Campaign) => void;
  /** Called when the library changes (duplicate/delete). */
  onChange: (campaigns: Campaign[]) => void;
  /** Current working grid rows (needed for Save). */
  rows: UtmRow[];
  /** Current lint settings (needed for Save). */
  settings: LintSettings;
  /** Flash state: true for ~2s after a successful save. */
  savedFlash: boolean;
  /** Render only the mobile disclosure variant (used in UtmGrid mobile slot). */
  mobileOnly?: boolean;
  /** Render only the desktop aside variant (used in UtmGrid desktop slot). */
  desktopOnly?: boolean;
}

export function CampaignsSidebar({
  campaigns,
  openCampaignId,
  isDirty,
  onSave,
  onOpen,
  onChange,
  rows,
  settings,
  savedFlash,
  mobileOnly,
  desktopOnly,
}: CampaignsSidebarProps) {
  const [showNameField, setShowNameField] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  // Track whether the name field was opened in "save as new" mode (vs "save changes").
  const isSaveAsNewRef = useRef(false);

  // Mobile disclosure state
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const openCampaign = campaigns.find((c) => c.id === openCampaignId) ?? null;

  // Auto-focus name field when revealed
  useEffect(() => {
    if (showNameField) {
      nameInputRef.current?.focus();
    }
  }, [showNameField]);

  const startSave = useCallback(() => {
    isSaveAsNewRef.current = false;
    setNameValue(openCampaign?.name ?? "");
    setShowNameField(true);
  }, [openCampaign]);

  const cancelSave = useCallback(() => {
    setShowNameField(false);
    setNameValue("");
    isSaveAsNewRef.current = false;
  }, []);

  const commitSave = useCallback(() => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;

    const existing = findCampaignByName(campaigns, trimmed);
    // Prompt on collision when:
    //   (a) the name matches a DIFFERENT campaign, OR
    //   (b) we're in "save as new" mode and the name matches the currently-open campaign
    //       (the user explicitly chose to fork but typed the same name — still an overwrite).
    const isCollision =
      existing && (existing.id !== openCampaignId || isSaveAsNewRef.current);
    if (isCollision) {
      const confirmed = window.confirm(
        `A campaign named "${trimmed}" already exists. Replace it with the current grid (${rows.length} link${rows.length === 1 ? "" : "s"})?`
      );
      if (!confirmed) return;
    }

    const { campaigns: next, campaign } = saveCampaign(
      campaigns,
      trimmed,
      rows,
      settings,
      // When saving as new, always generate a fresh id (don't re-use the open campaign's id)
      isSaveAsNewRef.current ? (existing?.id ?? undefined) : (existing?.id ?? openCampaignId ?? undefined)
    );
    onSave(next, campaign);
    setShowNameField(false);
    setNameValue("");
    isSaveAsNewRef.current = false;
  }, [nameValue, campaigns, openCampaignId, rows, settings, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commitSave(); }
    if (e.key === "Escape") { e.preventDefault(); cancelSave(); }
  };

  const handleOpen = useCallback(
    (campaign: Campaign) => {
      onOpen(campaign);
    },
    [onOpen]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      onChange(duplicateCampaign(campaigns, id));
    },
    [campaigns, onChange]
  );

  const handleDelete = useCallback(
    (campaign: Campaign) => {
      const confirmed = window.confirm(
        `Delete campaign "${campaign.name}"? This can't be undone.`
      );
      if (!confirmed) return;
      onChange(deleteCampaign(campaigns, campaign.id));
    },
    [campaigns, onChange]
  );

  const saveButtonLabel =
    openCampaign && !showNameField
      ? "Save changes"
      : "+ Save as campaign";

  const innerContent = (
    <div className="flex flex-col h-full">
      {/* Privacy line */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 font-medium">Saved on this device.</span>
      </div>

      {/* Save button + optional inline name field */}
      <div className="mb-3">
        {!showNameField ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="save-as-campaign-btn"
              onClick={startSave}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                savedFlash
                  ? "border border-green-500 bg-green-500 text-white"
                  : "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {savedFlash ? "Saved!" : saveButtonLabel}
            </button>
            {openCampaign && (
              <button
                type="button"
                onClick={() => {
                  isSaveAsNewRef.current = true;
                  setNameValue("");
                  setShowNameField(true);
                }}
                className="rounded-md border border-gray-300 px-2 py-2 text-xs text-gray-600 hover:bg-gray-50"
                title="Save as new campaign"
              >
                Save as new…
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <input
              ref={nameInputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name this campaign"
              data-testid="campaign-name-input"
              className="w-full rounded-md border border-blue-400 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commitSave}
                disabled={!nameValue.trim()}
                data-testid="campaign-save-confirm"
                className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelSave}
                data-testid="campaign-save-cancel"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign list */}
      <div
        className="flex-1 overflow-y-auto"
        aria-live="polite"
        data-testid="campaigns-list"
      >
        {campaigns.length === 0 ? (
          <p className="text-xs text-gray-400 leading-relaxed">
            No saved campaigns yet — build a grid, then &lsquo;Save as campaign&rsquo; to reuse it next week.
          </p>
        ) : (
          <ul className="space-y-1">
            {campaigns.map((c) => (
              <CampaignRow
                key={c.id}
                campaign={c}
                isOpen={c.id === openCampaignId}
                isDirty={c.id === openCampaignId && isDirty}
                onOpen={handleOpen}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  if (desktopOnly) {
    return (
      <aside
        className="flex flex-col w-64 shrink-0 rounded-lg border border-gray-200 bg-white p-4"
        aria-label="Campaigns sidebar"
        data-testid="campaigns-sidebar"
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Campaigns{campaigns.length > 0 ? ` (${campaigns.length})` : ""}
        </h2>
        {innerContent}
      </aside>
    );
  }

  if (mobileOnly) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          aria-expanded={mobileExpanded}
          data-testid="campaigns-mobile-toggle"
        >
          <span>Campaigns{campaigns.length > 0 ? ` (${campaigns.length})` : ""}</span>
          <span className="text-gray-400">{mobileExpanded ? "▲" : "▼"}</span>
        </button>
        {mobileExpanded && (
          <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-4">
            {innerContent}
          </div>
        )}
      </>
    );
  }

  // Default: render both (used standalone if needed)
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden min-[900px]:flex flex-col w-64 shrink-0 rounded-lg border border-gray-200 bg-white p-4"
        aria-label="Campaigns sidebar"
        data-testid="campaigns-sidebar"
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Campaigns{campaigns.length > 0 ? ` (${campaigns.length})` : ""}
        </h2>
        {innerContent}
      </aside>

      {/* Mobile disclosure */}
      <div className="min-[900px]:hidden" data-testid="campaigns-mobile">
        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          aria-expanded={mobileExpanded}
          data-testid="campaigns-mobile-toggle"
        >
          <span>Campaigns{campaigns.length > 0 ? ` (${campaigns.length})` : ""}</span>
          <span className="text-gray-400">{mobileExpanded ? "▲" : "▼"}</span>
        </button>
        {mobileExpanded && (
          <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-4">
            {innerContent}
          </div>
        )}
      </div>
    </>
  );
}

// ── Individual campaign row ────────────────────────────────────────────────────

function CampaignRow({
  campaign,
  isOpen,
  isDirty,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  campaign: Campaign;
  isOpen: boolean;
  isDirty: boolean;
  onOpen: (c: Campaign) => void;
  onDuplicate: (id: string) => void;
  onDelete: (c: Campaign) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className={`group relative flex flex-col rounded-md px-2 py-2 text-sm transition-colors ${
        isOpen
          ? "border-l-2 border-blue-500 bg-blue-50/60 pl-[6px]"
          : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`campaign-row-${campaign.id}`}
    >
      <div className="flex items-start justify-between gap-1 min-w-0">
        <button
          type="button"
          onClick={() => onOpen(campaign)}
          className="min-w-0 flex-1 text-left font-semibold text-gray-800 truncate hover:text-blue-700"
          data-testid={`campaign-open-${campaign.id}`}
          title={campaign.name}
        >
          {campaign.name}
          {isDirty && (
            <span
              className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle"
              aria-label="unsaved changes"
              title="Unsaved changes"
            />
          )}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">
        {campaign.rows.length}{" "}
        {campaign.rows.length === 1 ? "link" : "links"}{" "}
        · saved {relativeTime(campaign.savedAt)}
      </p>

      {/* Action cluster — visible on hover or when open */}
      {(hovered || isOpen) && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpen(campaign)}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
            data-testid={`campaign-action-open-${campaign.id}`}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(campaign.id)}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
            data-testid={`campaign-action-duplicate-${campaign.id}`}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onDelete(campaign)}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
            data-testid={`campaign-action-delete-${campaign.id}`}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

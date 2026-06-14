"use client";

import { useState, useRef, useEffect } from "react";

export type AuditMode = "append" | "replace";

export interface AuditDialogProps {
  /** Current grid row count — shown in Append/Replace labels. */
  currentGridCount: number;
  /** Called with the raw text and chosen mode when the user commits. */
  onCommit: (text: string, mode: AuditMode) => void;
  onCancel: () => void;
}

const PLACEHOLDER = [
  "https://acme.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=Spring_Sale",
  "https://acme.com/sale?utm_source=newsletter&utm_medium=Email&utm_campaign=spring-sale",
  "https://acme.com/blog?utm_source=twitter&utm_medium=social&utm_campaign=spring sale",
].join("\n");

export function AuditDialog({ currentGridCount, onCommit, onCancel }: AuditDialogProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<AuditMode>("append");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pre-focus the textarea on open (spec §3: "large pre-focused textarea").
  // We focus it on mount WITHOUT stealing the first click on sibling controls —
  // the dialog is a modal so there are no sibling controls to worry about.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Count non-empty lines for the live "Audit N URLs" button label.
  const nonEmptyLines = text.split(/\r?\n/).filter((l) => l.trim() !== "").length;
  const canSubmit = nonEmptyLines > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paste your existing tagged URLs"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90dvh]">
        <h2 className="text-lg font-semibold text-gray-900">Paste your existing tagged URLs</h2>
        <p className="mt-1 text-sm text-gray-500">
          One full URL per line. We&apos;ll parse each back into the grid and flag every inconsistency.
        </p>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          data-testid="audit-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none resize-y min-h-[6rem]"
        />

        {/* Empty submit hint */}
        {!canSubmit && text.length > 0 && (
          <p role="alert" className="mt-1 text-xs text-amber-700">
            Paste at least one URL to audit.
          </p>
        )}

        {/* Append / Replace */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="mb-2 text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Add to grid
          </p>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="audit-mode"
                value="append"
                checked={mode === "append"}
                onChange={() => setMode("append")}
                className="accent-blue-600"
              />
              <span className="font-medium text-gray-800">Append</span>
              <span className="text-gray-500">
                — add to current grid ({currentGridCount} row{currentGridCount === 1 ? "" : "s"})
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="audit-mode"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                className="accent-blue-600"
              />
              <span className="font-medium text-gray-800">Replace</span>
              <span className="text-gray-500">
                — wipe current grid ({currentGridCount} row{currentGridCount === 1 ? "" : "s"})
              </span>
            </label>
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Either way you can Undo immediately after auditing.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="audit-submit-btn"
            onClick={() => canSubmit && onCommit(text, mode)}
            disabled={!canSubmit}
            title={!canSubmit ? "Paste at least one URL to audit." : undefined}
            className="min-h-[44px] rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Audit {nonEmptyLines} URL{nonEmptyLines === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

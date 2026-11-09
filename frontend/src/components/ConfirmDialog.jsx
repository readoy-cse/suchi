export function ConfirmDialog({ title, message, confirmLabel = "Confirm", danger = true, busy = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#10271f]/45 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section aria-labelledby="confirm-dialog-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] p-6 shadow-2xl" role="dialog">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-[#eff2e9] text-lg text-[#17392f]" aria-hidden="true">?</div>
        <h2 className="font-display text-xl font-semibold" id="confirm-dialog-title">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#63756d]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border border-[#cbd4cb] px-4 py-2.5 text-sm font-semibold text-[#354f45] hover:bg-[#eff2e9]" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${danger ? "bg-[#8b3c2a] hover:bg-[#73311f]" : "bg-[#17392f] hover:bg-[#245444]"}`} disabled={busy} onClick={onConfirm} type="button">{busy ? "Please wait..." : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

# Centralise the WYSIWYG editors — recipe

**Status:** PARKED. The font/colour controls are already centralised (`rtControls()` in admin.html); the full editor markup is NOT — it's duplicated across 5 call sites. This task finishes the job.

## Problem
There are 5 `contenteditable` rich-text editors in `public/admin.html`, each with its own inline toolbar markup:
- `#bulkEditor` (bulk-email composer)
- `#pvCommsEditor` (student preview comms)
- `#commsEditor` (student comms compose)
- `#${p}Editor` (provider/teacher comms — templated id)
- doc editor in the document-detail view (richer: adds H2/P/numbered-list)

Divergence risk is real — the doc editor already differs from the others. Maintenance overhead = 5 places to change for any tweak.

## Already done
`rtControls()` — a shared helper returning the **font dropdown + colour picker** (Verdana default, #2B2B2B off-black default). Injected into all 5 toolbars. Defined once, near `toast()`.

## The refactor
Create ONE helper that emits the **whole editor** (toolbar + contenteditable):

```js
function richEditor(editorId, { full = false, minHeight = 100 } = {}) {
  return `<div style="border:1px solid var(--card-border);border-radius:6px;overflow:hidden">
    <div style="display:flex;gap:2px;padding:4px 8px;border-bottom:1px solid var(--card-border);background:var(--bg-subtle)">
      <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('bold')" style="font-weight:700;min-width:28px">B</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('italic')" style="font-style:italic;min-width:28px">I</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('underline')" style="text-decoration:underline;min-width:28px">U</button>
      ${rtControls()}
      <div style="width:1px;background:var(--card-border);margin:2px 4px"></div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('insertUnorderedList')" style="min-width:28px">&#8226;</button>
      ${full ? `<button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('insertOrderedList')">1.</button>
                <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('formatBlock',false,'h2')">H2</button>
                <button type="button" class="btn btn-ghost btn-sm" onclick="document.execCommand('formatBlock',false,'p')">P</button>` : ''}
      <button type="button" class="btn btn-ghost btn-sm" onclick="var u=prompt('URL:');if(u)document.execCommand('createLink',false,u)" style="min-width:28px;font-size:11px">Link</button>
    </div>
    <div id="${editorId}" contenteditable="true" style="min-height:${minHeight}px;max-height:50vh;overflow-y:auto;padding:12px;font-size:13px;line-height:1.6;outline:none;background:#fff;font-family:Verdana,Geneva,sans-serif;color:#2B2B2B;resize:vertical"></div>
  </div>`;
}
```

Then each call site becomes one line, e.g. `${richEditor('commsEditor')}`, `${richEditor('docEditor',{full:true})}`.

## CRITICAL: preserve the editor ids
The send/save code reads each editor by its exact id (`document.getElementById('bulkEditor')`, `commsEditor`, `pvCommsEditor`, `${p}Editor`, doc editor id). The refactor MUST keep the same id per call site or sends break. Verify each `getElementById('...Editor')` still resolves after the swap.

## Risk / scope
Moderate, low-risk. 5 call sites + ideally move the repeated inline styles to two CSS classes (`.rt-toolbar` / `.rt-editor`). Do as its OWN focused task; verify each editor still wires to its existing id (grep the send handlers). Syntax-check inline scripts after (`new Function` per `<script>` block). Static file — reload, no build.

Related: the broader "break up admin.html (7,731 lines)" refactor already on ToDo.

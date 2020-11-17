// This file defines a plugin that handles the drawing of cell
// selections and the basic user interactions for creating and working
// with such selections. It also makes sure that, after each
// transaction, the shapes of tables are normalized to be rectangular
// and not contain overlapping cells.

import {Plugin} from "prosemirror-state"

import {handleTripleClick, handleKeyDown, handlePaste, handleMouseDown} from "./input"
import {key as tableEditingKey} from "./util"
import {drawCellSelection, normalizeSelection} from "./cellselection"
import {fixTables, fixTablesKey, changedDescendants} from "./fixtables"
import { DecorationSet } from "prosemirror-view"

// :: () → Plugin
//
// Creates a [plugin](http://prosemirror.net/docs/ref/#state.Plugin)
// that, when added to an editor, enables cell-selection, handles
// cell-based copy/paste, and makes sure tables stay well-formed (each
// row has the same width, and cells don't overlap).
//
// You should probably put this plugin near the end of your array of
// plugins, since it handles mouse and arrow key events in tables
// rather broadly, and other plugins, like the gap cursor or the
// column-width dragging plugin, might want to get a turn first to
// perform more specific behavior.
export function tableEditing(editor) {
  return new Plugin({
    key: tableEditingKey,

    // This piece of state is used to remember when a mouse-drag
    // cell-selection is happening, so that it can continue even as
    // transactions (which might move its anchor cell) come in.
    state: {
      init() { return null },
      apply(tr, cur) {
        let set = tr.getMeta(tableEditingKey)
        if (set != null) return set == -1 ? null : set
        if (cur == null || !tr.docChanged) return cur
        let {deleted, pos} = tr.mapping.mapResult(cur)
        return deleted ? null : pos
      }
    },

    props: {
      // TODO Remove it!
      decorations: state => editor.options.editable ? drawCellSelection(state) : DecorationSet.empty,

      handleDOMEvents: {
        mousedown: handleMouseDown
      },

      createSelectionBetween(view) {
        if (tableEditingKey.getState(view.state) != null) return view.state.selection
      },

      handleTripleClick,

      handleKeyDown,

      handlePaste
    },

    appendTransaction(_, oldState, state) {
      return normalizeSelection(state, fixTables(state, oldState), editor.options.allowTableNodeSelection)
    }
  })
}

export {fixTables, changedDescendants, handlePaste, fixTablesKey}
export {cellAround, isInTable, selectionCell, moveCellForward, inSameTable, findCell, colCount, nextCell, setAttr, pointsAtCell, removeColSpan, addColSpan, columnIsHeader} from "./util";
export {tableNodes, tableNodeTypes} from "./schema"
export {CellSelection} from "./cellselection"
export {TableMap} from "./tablemap"
export {tableEditingKey};
export * from "./commands"
export {updateColumns as updateColumnsOnResize, TableView} from "./tableview"
export {pastedCells as __pastedCells, insertCells as __insertCells, clipCells as __clipCells} from "./copypaste"

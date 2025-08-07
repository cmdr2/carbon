import {LitElement, html, css} from "lit"

import {EditorView, basicSetup} from "codemirror"
import {history, undo as cmUndo, redo as cmRedo} from "@codemirror/commands"
import {indentMore, cursorCharLeft, cursorCharRight, cursorLineUp, cursorLineDown} from "@codemirror/commands"
import {javascript as javascriptLang} from "@codemirror/lang-javascript"
import {html as htmlLang} from "@codemirror/lang-html"
import {css as cssLang} from "@codemirror/lang-css"
import {monokai} from "@uiw/codemirror-theme-monokai"

import './developer-keyboard.js'

const pairs = {
    '(': ')',
    '{': '}',
    '[': ']',
    '"': '"',
    '\'': '\''
};

class CodeEditor extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }
        #editor {
            width: 100%;
            height: 100%;
            overflow: auto;
        }
        #editor .cm-editor {
            width: 100%;
            height: 100%;
            overflow-y: auto;
        }
        .cm-scroller {
            overflow: auto;
        }
        developer-keyboard {
            display: none;
            padding-bottom: 10pt;
        }
        @media only screen and (max-width: 767px) {
            #editor {
                height: 90%;
            }
            developer-keyboard {
                display: block;
            }
        }
    `

    render() {
        return html`
            <div id="editor"></div>
            <developer-keyboard @keyup=${this._onDeveloperKey}></developer-keyboard>
        `
    }

    constructor() {
        super()
        this.editor = null
        this._pendingSrc = null // To hold the source code before the editor is ready
    }

    firstUpdated() {
        this.editor = new EditorView({
            extensions: [
                basicSetup,
                history(),
                htmlLang(), cssLang(), javascriptLang(),
                monokai],
            parent: this.shadowRoot.getElementById("editor"),
        })

        // If src was set before we were ready, apply it now.
        if (this._pendingSrc !== null) {
            this.src = this._pendingSrc
            delete this._pendingSrc
        }

        this.shadowRoot.querySelectorAll('#toolbar sl-button').forEach(btn => {
            btn.addEventListener('click', () => this._onToolbarClick(btn.value))
        })
    }

    get src() {
        if (!this.editor) {
            return this._pendingSrc || ''
        }
        return this.editor.state.doc.toString()
    }

    set src(s) {
        if (!this.editor) {
            this._pendingSrc = s
            return
        }

        if (s === this.editor.state.doc.toString()) return

        this.editor.dispatch({
            changes: {
                from: 0,
                to: this.editor.state.doc.length,
                insert: s
            }
        })
    }

    undo() {
        cmUndo(this.editor)
    }

    redo() {
        cmRedo(this.editor)
    }

    clear() {
        this.src = ''
    }

    cut() {
        const state = this.editor.state
        const selection = state.selection.main
        const selectedText = state.sliceDoc(selection.from, selection.to)
        if (!selectedText) {
            return
        }
        navigator.clipboard.writeText(selectedText)
        this.editor.dispatch({ changes: { from: selection.from, to: selection.to, insert: '' } })
    }

    copy() {
        const state = this.editor.state
        const selection = state.selection.main
        const selectedText = state.sliceDoc(selection.from, selection.to)
        if (!selectedText) {
            return
        }
        navigator.clipboard.writeText(selectedText)
    }

    paste() {
        const state = this.editor.state
        const selection = state.selection.main
        navigator.clipboard.readText().then(text => {
            this.editor.dispatch({
                changes: { from: selection.from, to: selection.to, insert: text }
            })
        })
    }

    selectAll() {
        const state = this.editor.state
        this.editor.dispatch({
            selection: { anchor: 0, head: state.doc.length },
            scrollIntoView: true
        })
    }

    _onDeveloperKey(e) {
        if (!this.editor) return

        // We don't want this to bubble up and be handled by other listeners.
        e.stopPropagation()

        const { key } = e
        const view = this.editor
        const cursorPos = view.state.selection.main.head
        let viewCmd = null

        switch (key) {
            case 'Tab': {
                indentMore(view)
                break
            }
            case 'ArrowUp': {
                cursorLineUp(view)
                break
            }
            case 'ArrowDown': {
                cursorLineDown(view)
                break
            }
            case 'ArrowLeft':
                cursorCharLeft(view)
                break
            case 'ArrowRight':
                cursorCharRight(view)
                break
            default: { // Character key
                let char = key
                if (pairs[key]) {
                    char += pairs[key]
                }

                viewCmd = {
                    changes: { from: cursorPos, insert: char },
                    selection: { anchor: cursorPos + 1 },
                    scrollIntoView: true
                }
            }
        }

        if (viewCmd) {
            view.dispatch(viewCmd)
        }
        view.focus()
    }
}

customElements.define('code-editor', CodeEditor)

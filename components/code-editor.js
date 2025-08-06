import {LitElement, html, css} from "lit"

import {EditorView, basicSetup} from "codemirror"
import {history, redo, undo} from "@codemirror/commands"
import {javascript as javascriptLang} from "@codemirror/lang-javascript"
import {html as htmlLang} from "@codemirror/lang-html"
import {css as cssLang} from "@codemirror/lang-css"
import {monokai} from "@uiw/codemirror-theme-monokai"

import 'shoelace/components/icon/icon.js'
import 'shoelace/components/button/button.js'
import 'shoelace/components/button-group/button-group.js'


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
        #toolbar {
            background: #252525;
            padding: 3pt 2pt 0pt 2pt;
        }
        #toolbar sl-button-group {
            --sl-input-height-medium: 20pt;
        }
        #toolbar sl-button::part(base) {
            background: #2b2b2b;
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
            <div id="toolbar">
                <sl-button-group>
                    <sl-button value="clear"><sl-icon name="trash" slot="prefix"></sl-icon></sl-button>
                    <!--sl-button value="cut"><sl-icon name="scissors" slot="prefix"></sl-icon></sl-button>
                    <sl-button value="copy"><sl-icon name="copy" slot="prefix"></sl-icon></sl-button-->
                    <sl-button value="paste"><sl-icon name="clipboard-check-fill" slot="prefix"></sl-icon></sl-button>
                    <!--sl-button value="selectAll"><sl-icon name="arrows-expand-vertical" slot="prefix"></sl-icon></sl-button-->
                </sl-button-group>
                <sl-button-group label="Timeline">
                    <sl-button value="undo"><sl-icon name="arrow-counterclockwise" slot="prefix"></sl-icon></sl-button>
                    <sl-button value="redo"><sl-icon name="arrow-clockwise" slot="prefix"></sl-icon></sl-button>
                </sl-button-group>
            </div>
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

    _onToolbarClick(action) {
        if (!this.editor) return

        const view = this.editor
        const state = view.state
        const selection = state.selection.main
        const selectedText = state.sliceDoc(selection.from, selection.to)

        try {
            switch (action) {
                case 'clear':
                    view.dispatch({
                        changes: { from: 0, to: state.doc.length, insert: '' }
                    })
                    break
                case 'cut':
                    if (!selectedText) {
                        return
                    }
                    navigator.clipboard.writeText(selectedText)
                    view.dispatch({ changes: { from: selection.from, to: selection.to, insert: '' } })
                    break
                case 'copy':
                    if (!selectedText) {
                        return
                    }
                    navigator.clipboard.writeText(selectedText)
                    break
                case 'paste':
                    navigator.clipboard.readText().then(text => {
                        view.dispatch({
                            changes: { from: selection.from, to: selection.to, insert: text }
                        })
                    })
                    break
                case 'selectAll':
                    view.dispatch({
                        selection: { anchor: 0, head: state.doc.length },
                        scrollIntoView: true
                    })
                    break
                case 'undo':
                    undo(view)
                    break
                case 'redo':
                    redo(view)
                    break
            }
        } catch (e) {
            alert(e)
        }

        view.focus()
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
            case 'ArrowUp':
            case 'ArrowDown': {
                const line = view.state.doc.lineAt(cursorPos)
                const newLineNumber = line.number + (key === 'ArrowDown' ? 1 : -1)
                if (newLineNumber >= 1 && newLineNumber <= view.state.doc.lines) {
                    const newLine = view.state.doc.line(newLineNumber)
                    const newCursorPos = Math.min(newLine.to, newLine.from + (cursorPos - line.from))
                    viewCmd = {
                        selection: { anchor: newCursorPos },
                        scrollIntoView: true
                    }
                }
                break
            }
            case 'ArrowLeft':
                viewCmd = {
                    selection: { anchor: Math.max(0, cursorPos - 1) },
                    scrollIntoView: true
                }
                break
            case 'ArrowRight':
                viewCmd = {
                    selection: { anchor: Math.min(view.state.doc.length, cursorPos + 1) },
                    scrollIntoView: true
                }
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
            view.focus()
        }
    }
}

customElements.define('code-editor', CodeEditor)

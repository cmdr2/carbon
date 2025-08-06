import {LitElement, html, css} from "lit"

import {EditorView, basicSetup} from "codemirror"
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
                htmlLang(), cssLang(), javascriptLang(),
                monokai],
            parent: this.shadowRoot.getElementById("editor"),
        })

        // If src was set before we were ready, apply it now.
        if (this._pendingSrc !== null) {
            this.src = this._pendingSrc
            delete this._pendingSrc
        }
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

    _onDeveloperKey(e) {
        if (!this.editor) return;

        // We don't want this to bubble up and be handled by other listeners.
        e.stopPropagation();

        const { key } = e;
        const view = this.editor;
        const cursorPos = view.state.selection.main.head;
        let viewCmd = null;

        switch (key) {
            case 'ArrowUp':
            case 'ArrowDown': {
                const line = view.state.doc.lineAt(cursorPos);
                const newLineNumber = line.number + (key === 'ArrowDown' ? 1 : -1);
                if (newLineNumber >= 1 && newLineNumber <= view.state.doc.lines) {
                    const newLine = view.state.doc.line(newLineNumber);
                    const newCursorPos = Math.min(newLine.to, newLine.from + (cursorPos - line.from));
                    viewCmd = {
                        selection: { anchor: newCursorPos },
                        scrollIntoView: true
                    };
                }
                break;
            }
            case 'ArrowLeft':
                viewCmd = {
                    selection: { anchor: Math.max(0, cursorPos - 1) },
                    scrollIntoView: true
                };
                break;
            case 'ArrowRight':
                viewCmd = {
                    selection: { anchor: Math.min(view.state.doc.length, cursorPos + 1) },
                    scrollIntoView: true
                };
                break;
            default: { // Character key
                let char = key;
                if (pairs[key]) {
                    char += pairs[key];
                }

                viewCmd = {
                    changes: { from: cursorPos, insert: char },
                    selection: { anchor: cursorPos + 1 },
                    scrollIntoView: true
                };
            }
        }

        if (viewCmd) {
            view.dispatch(viewCmd);
            view.focus();
        }
    }
}

customElements.define('code-editor', CodeEditor)

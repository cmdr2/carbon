import {LitElement, html, css} from "lit"

import {EditorView, basicSetup} from "codemirror"
import {javascript as javascriptLang} from "@codemirror/lang-javascript"
import {html as htmlLang} from "@codemirror/lang-html"
import {css as cssLang} from "@codemirror/lang-css"
import {monokai} from "@uiw/codemirror-theme-monokai"
import {specialCharsPlugin} from "./special-chars-plugin.js?v=1"

class CodeEditor extends LitElement {
    static styles = css`
        :host {
            width: 100%;
            height: 100%;
        }
        #codeArea {
            width: 100%;
            height: 100%;
        }
        #codeArea .cm-editor {
            width: 100%;
            height: 100%;
        }
        .cm-special-chars-container {
            display: none;
            padding: 3pt;
        }
        .cm-special-chars-row {
            margin-bottom: 6pt;
        }
        .cm-special-char-btn {
            background: #444;
            color: #fff;
            border: none;
            padding: 6pt 10pt;
            margin: 0 3pt;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
        }
        @media only screen and (max-width: 767px) {
            .cm-special-chars-container {
                display: block;
            }
        }
    `

    render() {
        return html`
            <div id="codeArea"></div>
        `
    }

    constructor() {
        super()
        this.editor = null
        this._pendingSrc = null // To hold the source code before the editor is ready
    }

    firstUpdated() {
        this.editor = new EditorView({
            extensions: [basicSetup, htmlLang(), cssLang(), javascriptLang(), specialCharsPlugin, monokai],
            parent: this.shadowRoot.getElementById("codeArea"),
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
}

customElements.define('code-editor', CodeEditor)

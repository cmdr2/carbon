import {EditorView, basicSetup} from "https://esm.sh/codemirror"
import {javascript} from "https://esm.sh/@codemirror/lang-javascript"
import {html} from "https://esm.sh/@codemirror/lang-html"
import {css} from "https://esm.sh/@codemirror/lang-css"
import {monokai} from "https://esm.sh/@uiw/codemirror-theme-monokai"
import {specialCharsPlugin} from "./special-chars-plugin.js"

const HTML = `
    <style>
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
    </style>
    <div id="codeArea"></div>
`

class CodeEditor extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = HTML

        this.editor = new EditorView({
            extensions: [basicSetup, html(), css(), javascript(), specialCharsPlugin, monokai],
            parent: this.shadowRoot.getElementById("codeArea")
        })
    }

    get src() {
        return this.editor.state.doc.toString()
    }

    set src(s) {
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

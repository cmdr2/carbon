import {LitElement, html, css} from 'https://esm.sh/lit@3'

import './components/tabs.js'
import './components/popup-menu.js'
import './components/code-editor.js?v=1'
import './components/code-preview.js'
import './components/file-open-dialog.js?v=1'
import './components/file-save-dialog.js?v=1'

const DEFAULT_CODE = `<style>\n  \n</style>\n<body>\n  \n</body>\n<script>\n  \n<\/script>`

class App extends LitElement {
    static styles = css`
        :host {
            background: #1e1e1e;
            color: #ccc;
            font-family: sans-serif;
        }
        #tabPanel {
            background: #2b2b2b;
        }
        #actions {
            position: absolute;
            top: 2pt;
            right: 0px;
            z-index: 1;
            padding: 2pt;
            display: flex;
        }
        #runBtn {
            background: #ddd;
            border: 0px;
            border-radius: 2pt;
            padding: 0pt 6pt;
            margin-right: 10pt;
        }
    `

    render() {
        return html`
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

            <tab-panel id="tabPanel">
                <span slot="tab"><i class="fa fa-code"></i> Code</span>
                <code-editor id="code-editor" slot="content"></code-editor>
                <span id="previewTabBtn" slot="tab"><i class="fa fa-eye"></i> Preview</span>
                <code-preview id="code-preview" slot="content">Preview content</code-preview>
            </tab-panel>
            <div id="actions">
                <button id="runBtn"><i class="fa fa-play"></i> Run</button>
                <popup-menu>
                    <button slot="button"><i class="fa fa-ellipsis-v"></i></button>

                    <div slot="item" data-id="new"><i class="fas fa-file fa-fw"></i> New</div>
                    <div slot="item" data-id="open"><i class="fas fa-folder-open fa-fw"></i> Open</div>
                    <div slot="item" data-id="save"><i class="fas fa-save fa-fw"></i> Save</div>
                    <div slot="item" data-id="save_as"><i class="fas fa-save fa-fw"></i> Save As</div>
                    <div slot="item" data-id="download"><i class="fas fa-download fa-fw"></i> Download</div>
                </popup-menu>
            </div>
        `
    }

    firstUpdated() {
        this.editor = this.shadowRoot.querySelector("#code-editor")
        this.preview = this.shadowRoot.querySelector("#code-preview")
        this.tabs = this.shadowRoot.querySelector("#tabPanel")

        // initial state
        this.editor.src = DEFAULT_CODE
        this.currentFilename = ""
        this.tabs.hideTab(1)  // hide the Preview tab until the first run

        // bind event listeners
        const runBtn = this.shadowRoot.querySelector("#runBtn")
        runBtn.addEventListener("click", this.action_run.bind(this))

        const menu = this.shadowRoot.querySelector("#actions popup-menu")
        menu.addEventListener("menuItemClicked", e => this["action_" + e.detail]())
    }

    action_run() {
        this.tabs.unhideTab(1)
        this.tabs.activeTabIndex = 1

        this.preview.src = this.editor.src
    }

    action_new() {
        this.editor.src = DEFAULT_CODE
        this.currentFilename = ""

        this.tabs.activeTabIndex = 0
    }

    action_open() {
        const dialog = document.createElement("open-dialog")
        dialog.addEventListener("submit", e => {
            this.openFile(e.detail)
            this.tabs.activeTabIndex = 0
        }, { once: true })
        this.appendChild(dialog)
    }

    action_save() {
        if (this.currentFilename) {
            this.saveFile(this.currentFilename)
        } else {
            this.action_save_as()
        }
    }

    action_save_as() {
        const dialog = document.createElement("save-dialog")
        dialog.addEventListener("submit", e => {
            this.saveFile(e.detail)
        }, { once: true })
        this.appendChild(dialog)
    }

    action_download() {
        const fname = (this.currentFilename || 'untitled') + '.html';
        const blob = new Blob([this.editor.src], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        a.click();
    }

    openFile(filename) {
        const content = localStorage.getItem('file:' + filename)
        if (content !== null) {
            this.editor.src = content
            this.currentFilename = filename
        }
    }

    saveFile(filename) {
        localStorage.setItem('file:' + filename, this.editor.src)
        this.currentFilename = filename
    }
}

customElements.define('carbon-app', App)

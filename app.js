import {LitElement, html, css} from 'lit'

import 'shoelace/components/tab-group/tab-group.js'
import 'shoelace/components/tab/tab.js'
import 'shoelace/components/tab-panel/tab-panel.js'
import 'shoelace/components/dropdown/dropdown.js'
import 'shoelace/components/button/button.js'
import 'shoelace/components/menu/menu.js'
import 'shoelace/components/menu-item/menu-item.js'
import 'shoelace/components/icon/icon.js'

import './components/code-editor.js?v=4'
import './components/code-preview.js?v=1'
import './components/file-open-dialog.js?v=1'
import './components/file-save-dialog.js?v=1'

const DEFAULT_CODE = `<style>\n  \n</style>\n<body>\n  \n</body>\n<script>\n  \n<\/script>`

class App extends LitElement {
    static styles = css`
        :host {
            display: block;
            background: #1e1e1e;
            color: #ccc;
            font-family: sans-serif;
            background: #2b2b2b;
        }
        sl-tab-group {
            background: #2b2b2b;
            height: 100%;
            --track-width: 0;
            padding-top: 2pt;
        }
        sl-tab-group::part(base),
        sl-tab-group::part(body),
        sl-tab-panel::part(base),
        sl-tab-panel::part(body),
        sl-tab-panel {
            height: 100%;
        }
        sl-tab-panel {
            --padding: 0;
        }
        sl-tab::part(base) {
            border-bottom: 0pt;
            margin-right: 3pt;
            padding: 6pt 12pt;
            color: #ccc;
            font-size: 12pt;
            border-radius: 3pt 3pt 0pt 0pt;
            cursor: pointer;
            font-weight: 400;
        }
        sl-tab[active]::part(base) {
            background: #444;
            color: white;
        }
        sl-tab sl-icon {
            padding-right: 4pt;
        }
        #actions {
            position: absolute;
            top: 0pt;
            right: 0px;
            z-index: 1;
            display: flex;
        }
        #menu sl-button::part(base) {
            background: transparent;
            border: 0;
            font-size: 16pt;
        }
        #menu sl-menu {
            background: #2b2b2b;
        }
        #runBtn::part(base) {
            background: #ddd;
            color: black;
        }
        #runBtn sl-icon {
            font-size: 15pt;
        }
    `

    render() {
        return html`
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/dark.css">

            <sl-tab-group>
                <sl-tab slot="nav" panel="code">
                    <sl-icon name="code-slash"></sl-icon> Code
                </sl-tab>
                <sl-tab slot="nav" panel="preview" id="preview-tab">
                    <sl-icon name="eye-fill"></sl-icon> Preview
                </sl-tab>

                <sl-tab-panel name="code">
                    <code-editor id="code-editor"></code-editor>
                </sl-tab-panel>
                <sl-tab-panel name="preview">
                    <code-preview id="code-preview"></code-preview>
                </sl-tab-panel>
            </sl-tab-group>

            <div id="actions">
                <sl-button id="runBtn">
                    <sl-icon name="play-fill" slot="prefix"></sl-icon>
                    Run
                </sl-button>
                <sl-dropdown id="menu">
                    <sl-button slot="trigger"><sl-icon name="three-dots-vertical"></sl-icon></sl-button>
                    <sl-menu>
                        <sl-menu-item value="new">New <sl-icon slot="prefix" name="file-earmark-plus"></sl-icon></sl-menu-item>
                        <sl-menu-item value="open">Open <sl-icon slot="prefix" name="file-earmark-fill"></sl-icon></sl-menu-item>
                        <sl-menu-item value="save">Save <sl-icon slot="prefix" name="floppy-fill"></sl-icon></sl-menu-item>
                        <sl-menu-item value="save_as">Save As <sl-icon slot="prefix" name="floppy-fill"></sl-icon></sl-menu-item>
                        <sl-menu-item value="download">Download <sl-icon slot="prefix" name="download"></sl-icon></sl-menu-item>
                    </sl-menu>
                </sl-dropdown>
            </div>
        `
    }

    firstUpdated() {
        this.editor = this.shadowRoot.querySelector("#code-editor")
        this.preview = this.shadowRoot.querySelector("#code-preview")
        this.tabGroup = this.shadowRoot.querySelector("sl-tab-group")
        this.previewTab = this.shadowRoot.querySelector("#preview-tab")

        // initial state
        this.editor.src = DEFAULT_CODE
        this.currentFilename = ""
        this.previewTab.style.display = "none";  // hide the Preview tab until the first run

        this.openDialog = document.createElement("open-dialog")
        this.saveDialog = document.createElement("save-dialog")
        this.shadowRoot.appendChild(this.openDialog)
        this.shadowRoot.appendChild(this.saveDialog)

        // bind event listeners
        const runBtn = this.shadowRoot.querySelector("#runBtn")
        runBtn.addEventListener("click", this.action_run.bind(this))

        const menu = this.shadowRoot.querySelector("#menu")
        menu.addEventListener("sl-select", e => this["action_" + e.detail.item.value]())

        this.openDialog.addEventListener("submit", e => {
            this.openFile(e.detail)
            this.tabGroup.show('code')
        })

        this.saveDialog.addEventListener("submit", e => {
            this.saveFile(e.detail)
        })
    }

    action_run() {
        this.previewTab.style.display = "block"
        this.tabGroup.show('preview')
        this.preview.src = this.editor.src
    }

    action_new() {
        this.editor.src = DEFAULT_CODE
        this.currentFilename = ""
        this.tabGroup.show('code')
    }

    action_open() {
        this.openDialog.show()
    }

    action_save() {
        if (this.currentFilename) {
            this.saveFile(this.currentFilename)
        } else {
            this.action_save_as()
        }
    }

    action_save_as() {
        this.saveDialog.show()
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

import {LitElement, html, css} from 'lit'

import 'shoelace/components/button/button.js'
import 'shoelace/components/dialog/dialog.js'

class OpenDialog extends LitElement {
    static properties = {
        filenames: {type: Array, state: true}
    }

    render() {
        return html`
            <sl-dialog label="Open" class="dialog-overview">
                <div>
                    ${this.filenames.length === 0
                        ? html`<em>Nothing saved</em>`
                        :this.filenames.map(filename => html`
                        <sl-button @click=${() => this._fileSelected(filename)}>${filename}</sl-button>
                    `)}
                </div>
            </sl-dialog>
        `
    }

    constructor() {
        super()
        this.filenames = []
    }

    _fileSelected(filename) {
        const customEvent = new CustomEvent("submit", {detail: filename})
        this.dispatchEvent(customEvent)
        this.hide()
    }

    show() {
        this.filenames = Object.keys(localStorage).filter(k => k.startsWith('file:')).map(k => k.slice(5))
        this.shadowRoot.querySelector('sl-dialog').show()
    }

    hide() {
        this.shadowRoot.querySelector('sl-dialog').hide()
    }
}

customElements.define("open-dialog", OpenDialog)

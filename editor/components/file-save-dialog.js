import {LitElement, html} from 'lit'

import 'shoelace/components/button/button.js'
import 'shoelace/components/dialog/dialog.js'
import 'shoelace/components/input/input.js'

class SaveDialog extends LitElement {
    render() {
        return html`
            <sl-dialog label="Save As" class="dialog-overview">
                <sl-input placeholder="File name"></sl-input>
                <sl-button slot="footer" variant="primary" @click=${this._saveClicked}>Save</sl-button>
                <sl-button slot="footer" @click=${() => this.hide()}>Cancel</sl-button
            </sl-dialog>
        `
    }

    _saveClicked() {
        const filename = this.shadowRoot.querySelector('sl-input').value
        const customEvent = new CustomEvent("submit", {detail: filename})
        this.dispatchEvent(customEvent)
        this.hide()
    }

    show() {
        this.shadowRoot.querySelector('sl-dialog').show()
    }

    hide() {
        this.shadowRoot.querySelector('sl-dialog').hide()
    }
}

customElements.define("save-dialog", SaveDialog)

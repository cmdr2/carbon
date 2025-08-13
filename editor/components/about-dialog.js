import {LitElement, html, css} from 'lit'

import 'shoelace/components/dialog/dialog.js'
import 'shoelace/components/icon/icon.js'

class AboutDialog extends LitElement {
    static styles = css`
        .text {
            display: flex;
            align-items: center;
        }
        .text a {
            margin-left: 4pt;
        }
        .header {
            margin-top: 0pt;
        }
    `

    render() {
        return html`
            <sl-dialog label="Carbon Editor" class="dialog-overview">
                <p class="header">A simple mobile-focused code editor.</p>
                <p class="text">
                    <sl-icon name="github"></sl-icon><a href="https://github.com/cmdr2/carbon" target="_blank">Project page</a>
                </p>
            </sl-dialog>
        `
    }

    show() {
        this.shadowRoot.querySelector('sl-dialog').show()
    }

    hide() {
        this.shadowRoot.querySelector('sl-dialog').hide()
    }
}

customElements.define("about-dialog", AboutDialog)

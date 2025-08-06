import {LitElement, html, css} from "lit"

import './code-preview-console.js'

class CodePreview extends LitElement {
    static styles = css`
        :host {
            display: block;
            background: white;
            width: 100%;
            height: 100%;
        }
        #container {
            height: 100%;
            display: flex;
            background: white;
            flex-direction: column;
        }
        iframe {
            background: transparent;
            border: none;
            width: 100%;
            flex-grow: 1;
        }
    `

    render() {
        return html`
            <div id="container">
                <iframe id="previewFrame"></iframe>
                <preview-console collapsed></preview-console>
            </div>
        `
    }

    get src() {
        const iframe = this.shadowRoot.querySelector('iframe')
        return iframe.src
    }

    set src(html) {
        const console = this.shadowRoot.querySelector("preview-console")
        const iframe = this.shadowRoot.querySelector('iframe')
        const blob = new Blob([console.injectConsoleListener(html)], { type: "text/html" })
        iframe.src = URL.createObjectURL(blob)
        console.clear.bind(console)()
    }
}

customElements.define("code-preview", CodePreview)

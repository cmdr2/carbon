import './code-preview-console.js'

const HTML = `
    <style>
    :host {
        background: white;
        width: 100%;
        height: 100%;
    }
    #container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    iframe {
        background: transparent;
        border: none;
        width: 100%;
        flex-grow: 1;
    }
    </style>

    <div id="container">
        <iframe id="previewFrame"></iframe>
        <preview-console></preview-console>
    </div>
`

class CodePreview extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = HTML

        this.console = this.shadowRoot.querySelector("preview-console")
    }

    get src() {
        const iframe = this.shadowRoot.querySelector('iframe')
        return iframe.src
    }

    set src(html) {
        const iframe = this.shadowRoot.querySelector('iframe')
        const blob = new Blob([this.console.injectConsoleListener(html)], { type: "text/html" })
        iframe.src = URL.createObjectURL(blob)
        this.console.clear()
    }
}

customElements.define("code-preview", CodePreview)

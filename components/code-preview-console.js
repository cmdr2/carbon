const HTML = `
    <style>
    #container {
        background: #111;
        color: #0f0;
        font-family: monospace;
        display: flex;
        flex-direction: column;
        resize: vertical;
        overflow: hidden;
        min-height: 22pt;
        height: 0;
        transition: height 0.2s;
    }

    #header {
        cursor: pointer;
        background: #222;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 3px solid #444;
        user-select: none;
    }

    #header i {
        transition: transform 0.2s ease;
    }

    #header.open i {
        transform: rotate(180deg);
    }

    #output {
        overflow: auto;
        flex: 1;
        padding: 10px;
        white-space: pre-wrap;
    }
    </style>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <div id="container">
        <div id="header"><span>Console</span><i class="fa fa-chevron-up"></i></div>
        <pre id="output"></pre>
    </div>
`

class PreviewConsole extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})

        this.isOpen = false
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = HTML

        this.container = this.shadowRoot.getElementById('container')
        this.header = this.shadowRoot.getElementById('header')
        this.output = this.shadowRoot.getElementById('output')

        this.header.addEventListener("click", this.toggle.bind(this))

        window.addEventListener("message", e => {
            if (e.data && e.data.type === "console") {
                if (e.data.level === "error" && !this.isOpen) {
                    this.toggle()
                }

                this.output.textContent += `[${e.data.level}] ${e.data.args.join(' ')}\n`
                console[e.data.level](...e.data.args)
            }
        });
    }

    injectConsoleListener(html) {
        const script = `<script>const _send = (level, args) => {parent.postMessage({ type: "console", level, args: args.map(String) }, "*");};console.log = (...args) => { _send("log", args); };console.error = (...args) => { _send("error", args); };window.onerror = (...args) => { _send("error", args); };<\/script>`;
        return script + html;
    }

    toggle() {
        this.isOpen = !this.isOpen
        this.container.style.height = this.isOpen ? '40vh' : '0'
        this.header.classList.toggle('open', this.isOpen)
    }

    clear() {
        this.output.textContent = ""
    }
}

customElements.define("preview-console", PreviewConsole)

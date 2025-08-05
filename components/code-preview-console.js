import {LitElement, html, css} from "lit"

class PreviewConsole extends LitElement {
    static styles = css`
        :host {
            background: #111;
            color: #0f0;
            font-family: monospace;
        }
        #container {
            display: flex;
            flex-direction: column;
            resize: vertical;
            overflow: hidden;
            min-height: 22pt;
            height: 40vh;
            transition: height 0.2s;
        }
        :host([collapsed]) #container {
            height: 0;
            min-height: 0;
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
        :host[:not([collapsed])] #header i {
            transform: rotate(180deg);
        }
        #output {
            overflow: auto;
            flex: 1;
            padding: 10px;
            white-space: pre-wrap;
        }
    `

    static properties = {
        collapsed: {type: Boolean, reflect: true}
    }

    render() {
        return html`
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
            <div id="header" @click=${this.toggleCollapsed}>
                <span>Console</span><i class="fa fa-chevron-up"></i>
            </div>
            <div id="container">
                <pre id="output"></pre>
            </div>
        `
    }

    firstUpdated() {
        window.addEventListener("message", this.consoleMessageHandler.bind(this));
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed
    }

    consoleMessageHandler(e) {
        const output = this.shadowRoot.querySelector('#output')

        if (e.data?.type === "console") {
            if (e.data.level === "error" && this.collapsed) {
                this.collapsed = false
            }

            output.textContent += `[${e.data.level}] ${e.data.args.join(' ')}\n`
            console[e.data.level](...e.data.args)
        }
    }

    injectConsoleListener(html) {
        const script = `<script>const _send = (level, args) => {parent.postMessage({ type: "console", level, args: args.map(String) }, "*");};console.log = (...args) => { _send("log", args); };console.error = (...args) => { _send("error", args); };window.onerror = (...args) => { _send("error", args); };<\/script>`;
        return script + html;
    }

    clear() {
        const output = this.shadowRoot.querySelector('#output')
        if (output) output.textContent = ""
    }
}

customElements.define("preview-console", PreviewConsole)

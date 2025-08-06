import {LitElement, html, css} from "lit"

const ARROW_UP = "arrow-up"
const ARROW_DOWN = "arrow-down"
const ARROW_LEFT = "arrow-left"
const ARROW_RIGHT = "arrow-right"

const keyRows = [
    ['=', '"', '(', '{', '[', '<', '>', ';', ARROW_UP],
    [':', '+', '-', '/', '*', '&', '|', ARROW_LEFT, ARROW_DOWN, ARROW_RIGHT]
]

function isArrowKey(c) {
    return c === ARROW_UP || c === ARROW_DOWN || c === ARROW_LEFT || c === ARROW_RIGHT
}

class DeveloperKeyboard extends LitElement {
    static styles = css`
        :host {
            display: block;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            padding: 3pt 0pt;
        }
        .row {
            display: flex;
            margin-bottom: 6pt;
            padding-left: 2pt;
        }
        button {
            background: #444;
            color: #fff;
            border: none;
            padding: 6pt 8pt;
            height: 25pt;
            width: 22pt;
            margin: 0 3pt;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            font-family: monospace;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .arrow-key {
            padding: 4pt;
            background: #222;
            border: 1px solid #444;
        }
    `

    render() {
        return html`
            ${keyRows.map(row => html`
                <div class="row">
                    ${row.map(char => this.renderButton(char))}
                </div>
            `)}
        `
    }

    renderButton(char) {
        if (isArrowKey(char)) {
            return html`
                <button class="arrow-key" @click=${() => this._onCharKey(char)}>
                    <sl-icon name="${char}"></sl-icon>
                </button>
            `
        }

        return html`
            <button @click=${() => this._onCharKey(char)}>
                ${char}
            </button>
        `
    }

    _onCharKey(char) {
        let key;
        switch (char) {
            case ARROW_UP:
                key = 'ArrowUp';
                break;
            case ARROW_DOWN:
                key = 'ArrowDown';
                break;
            case ARROW_LEFT:
                key = 'ArrowLeft';
                break;
            case ARROW_RIGHT:
                key = 'ArrowRight';
                break;
            default:
                key = char;
        }
        this.dispatchEvent(new KeyboardEvent('keyup', {
            key: key,
            bubbles: true,
            composed: true
        }))
    }

}

customElements.define("developer-keyboard", DeveloperKeyboard)

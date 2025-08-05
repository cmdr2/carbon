const HTML = `
    <style>
    .menu {
        display: none;
        width: 100pt;
    }
    slot[name="item"] {
        display: flex;
        flex-direction: column;
    }
    .active {
        display: block;
        position: absolute;
        top: 15pt;
        right: 10pt;
        background: #333;
        border: 1px solid #555;
        border-radius: 6px;
        z-index: 999;
    }
    ::slotted([slot="button"]) {
        background: transparent;
        display: inline;
        border: 0px;
        font-size: 1.2em;
        cursor: pointer;
        padding: 3pt 10pt;
        color: #ccc;
    }
    ::slotted([slot="item"]) {
        padding: 6pt 10pt;
        cursor: pointer;
    }
    </style>

    <slot name="button"></slot>
    <div class="menu">
        <slot name="item"></slot>
    </div>
`

class PopupMenu extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = HTML

        let buttonSlot = this.shadowRoot.querySelector("slot[name='button']")
        let itemsSlot = this.shadowRoot.querySelector("slot[name='item']")

        this.menu = this.shadowRoot.querySelector(".menu")

        buttonSlot.addEventListener("slotchange", e => this.#onButtonChanged(e.target.assignedElements()))
        itemsSlot.addEventListener("slotchange", e => this.#onItemsChanged(e.target.assignedElements()))
    }

    #onButtonChanged(slotElements) {
        let button = slotElements[0]

        button.addEventListener("click", e => this.menu.classList.toggle("active"))
        button.addEventListener("blur", e => {
            setTimeout(() => {
                this.menu.classList.remove("active")
            }, 100)
        })
    }

    #onItemsChanged(slotElements) {
        for (let item of slotElements) {
            if (item._hasListeners) {
                continue
            }

            item._hasListeners = true
            item.addEventListener("click", e => this.#onMenuItemClicked(item))
        }
    }

    #onMenuItemClicked(item) {
        let customEvent = new CustomEvent("menuItemClicked", {
            bubbles: true,
            composed: true,
            detail: item.dataset.id
        })
        this.dispatchEvent(customEvent)
    }
}

customElements.define("popup-menu", PopupMenu)

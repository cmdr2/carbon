const HTML = `
    <style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .tabs {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        padding-top: 3pt;
    }
    .tabContents {
        flex: 1;
    }
    ::slotted([slot="tab"]) {
        border-bottom: 0pt;
        margin-right: 3pt;
        padding: 6pt 12pt;
        color: #ccc;
        font-size: 12pt;
        border-radius: 3pt 3pt 0pt 0pt;
        cursor: pointer;
    }
    ::slotted([slot="tab"].active) {
        background: #444;
        color: #fff;
    }
    ::slotted([slot="tab"].hidden) {
        display: none;
    }
    ::slotted([slot="content"]) {
        display: none;
    }
    ::slotted([slot="content"].active) {
        display: block;
    }
    </style>

    <div class="tabs">
        <slot name="tab"></slot>
    </div>
    <div class="tabContents">
        <slot name="content"></slot>
    </div>
`

class TabPanel extends HTMLElement {
    constructor() {
        super()
        this._activeTabIndex = 0
        this._hiddenTabIds = []
        this.attachShadow({mode: "open"})
    }

    static get observedAttributes() {
        return ['active-tab-index']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'active-tab-index' && oldValue !== newValue) {
            this.activeTabIndex = parseInt(newValue)
        }
    }

    get activeTabIndex() {
        return this._activeTabIndex
    }

    set activeTabIndex(tabIdx) {
        this._activeTabIndex = tabIdx
        this.setAttribute("active-tab-index", tabIdx)

        if (this.tabs) {
            this.#render()
        }
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = HTML

        let tabsSlot = this.shadowRoot.querySelector("slot[name='tab']")
        let contentSlot = this.shadowRoot.querySelector("slot[name='content']")

        tabsSlot.addEventListener("slotchange", e => this.#onTabsChanged(e.target.assignedElements()))
        contentSlot.addEventListener("slotchange", e => this.#onContentChanged(e.target.assignedElements()))
    }

    #onTabsChanged(slotElements) {
        this.tabs = slotElements

        this.tabs.forEach((tab, i) => {
            if (tab._hasListeners) {
                return
            }

            tab._hasListeners = true
            tab.addEventListener('click', e => this.#onTabClick(i))
        })
    }

    #onContentChanged(slotElements) {
        this.contents = slotElements

        this.#render()
    }

    #onTabClick(tabIndex) {
        this.activeTabIndex = tabIndex
    }

    #render() {
        if (!this.tabs) {
            return
        }

        let tabIdx = this.activeTabIndex
        let contents = this.contents
        this.tabs.forEach((tab, i) => {
            let content = contents[i]

            if (this._hiddenTabIds.includes(i)) {
                tab.classList.add('hidden')
            } else {
                tab.classList.remove('hidden')
            }

            if (i === tabIdx) {
                tab.classList.add('active')
                content.classList.add('active')
            } else {
                tab.classList.remove('active')
                content.classList.remove('active')
            }
        })
    }

    hideTab(tabIdx) {
        if (this._hiddenTabIds.includes(tabIdx)) {
            return
        }

        this._hiddenTabIds.push(tabIdx)
        this.#render()
    }

    unhideTab(tabIdx) {
        if (!this._hiddenTabIds.includes(tabIdx)) {
            return
        }

        this._hiddenTabIds = this._hiddenTabIds.filter(v => v !== tabIdx)
        this.#render()
    }
}

customElements.define('tab-panel', TabPanel)

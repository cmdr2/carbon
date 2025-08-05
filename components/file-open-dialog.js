import Swal from "sweetalert2"

class OpenDialog extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})
    }

    connectedCallback() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('file:'))
        let html = ''

        if (!keys.length) {
            html = '<em>Nothing saved</em>'
        } else {
            keys.forEach(k => {
                const name = k.slice(5)
                html += `<button data-filename="${name}" class="swal2-confirm swal2-styled">${name}</button>`
            })
        }

        Swal.fire({
            title: 'Open File',
            html: html,
            showConfirmButton: false,
            background: '#2e2e2e',
            color: '#eee',
            didOpen: popup => {
                const btns = popup.querySelectorAll("button[data-filename]")
                btns.forEach(btn => {
                    btn.addEventListener("click", e => {
                        const customEvent = new CustomEvent("submit", {detail: btn.dataset.filename})
                        this.dispatchEvent(customEvent)
                        Swal.close()
                    })
                })
            }
        }).then(() => {
            if (this.parentElement) {
                this.parentElement.removeChild(this)
            }
        })
    }
}

customElements.define("open-dialog", OpenDialog)

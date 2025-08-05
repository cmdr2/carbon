import Swal from "https://esm.sh/sweetalert2@11"

class SaveDialog extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"})
    }

    connectedCallback() {
        Swal.fire({
            title: 'Save As',
            input: 'text',
            inputValue: '',
            confirmButtonText: 'Save',
            showCancelButton: true,
            background: '#2e2e2e',
            color: '#eee',
            inputPlaceholder: 'untitled'
        }).then(res => {
            if (res.isConfirmed && res.value.trim()) {
                const customEvent = new CustomEvent("submit", {detail: res.value.trim()})
                this.dispatchEvent(customEvent)
            }

            if (this.parentElement) {
                this.parentElement.removeChild(this)
            }
        })
    }
}

customElements.define("save-dialog", SaveDialog)

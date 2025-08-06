import {ViewPlugin} from "@codemirror/view"

const specialCharacters = ['=', '"', '(', '{', '[', '<', '>', ';', ':', '+', '-', '/', '*', '&', '|']
const pairs = {
    '(': ')',
    '{': '}',
    '[': ']',
    '"': '"',
    '\'': '\''
}
const numRows = 2

export const specialCharsPlugin = ViewPlugin.define(
    (view) => {
        let charDiv = document.createElement('div')
        charDiv.className = "cm-special-chars-container"
        charDiv.style.bottom = '0'
        charDiv.style.left = '0'
        charDiv.style.right = '0'
        charDiv.style.zIndex = '1000' // Ensure it's on top
        charDiv.style.width = '100%'
        charDiv.style.overflow = 'auto'
        charDiv.style.whiteSpace = 'nowrap'

        let rows = []
        for (let i = 0; i < numRows; i++) {
            let row = document.createElement('div')
            row.className = "cm-special-chars-row"
            charDiv.appendChild(row)
            rows.push(row)
        }

        let charsPerRow = Math.ceil(specialCharacters.length / numRows)

        specialCharacters.forEach((c, i) => {
            let button = document.createElement('button')
            button.className = "cm-special-char-btn"
            button.textContent = c
            button.onclick = (e) => {
                const cursorPos = view.state.selection.main.head
                let char = c
                if (pairs[c]) {
                    char += pairs[c]
                }

                view.dispatch({
                    changes: {from: cursorPos, insert: char},
                    selection: {anchor: cursorPos + 1},
                    scrollIntoView: true
                })
                view.focus()
            }

            let rowIdx = Math.floor(i / charsPerRow)
            let row = rows[rowIdx]
            row.appendChild(button)
        })

        view.dom.parentNode.appendChild(charDiv)

        // Handle keyboard overlap for Android
        const handleViewportResize = () => {
            if (window.visualViewport && window.visualViewport.height < window.innerHeight) {
                // Keyboard is likely open, adjust div's bottom position
                charDiv.style.bottom = `${window.innerHeight - window.visualViewport.height}px`
            } else {
                charDiv.style.bottom = '0'
            }
        }

        window.visualViewport.addEventListener('resize', handleViewportResize)

        return {
            destroy() {
                charDiv.remove()
                window.visualViewport.removeEventListener('resize', handleViewportResize)
            }
        }
    },
)

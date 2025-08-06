import {ViewPlugin} from "@codemirror/view"

const ARROW_UP = "arrow-up"
const ARROW_DOWN = "arrow-down"
const ARROW_LEFT = "arrow-left"
const ARROW_RIGHT = "arrow-right"

const keyRows = [
    ['=', '"', '(', '{', '[', '<', '>', ';', ARROW_UP],
    [':', '+', '-', '/', '*', '&', '|', ARROW_LEFT, ARROW_DOWN, ARROW_RIGHT]
]
const pairs = {
    '(': ')',
    '{': '}',
    '[': ']',
    '"': '"',
    '\'': '\''
}

function isArrowKey(c) {
    return c === ARROW_UP || c === ARROW_DOWN || c === ARROW_LEFT || c === ARROW_RIGHT
}

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

        keyRows.forEach(row => {
            let rowDiv = document.createElement('div')
            rowDiv.className = "cm-special-chars-row"
            charDiv.appendChild(rowDiv)

            row.forEach(c => {
                let button = document.createElement('button')
                button.className = "cm-special-char-btn"
                if (isArrowKey(c)) {
                    button.innerHTML = `<sl-icon name="${c}"></sl-icon>`
                    button.style.padding = "4pt"
                    button.style.backgroundColor = "#222"
                    button.style.border = "1px solid #444"
                } else {
                    button.innerHTML = c
                }
                button.innerHTML = isArrowKey(c) ? `<sl-icon name="${c}"></sl-icon>` : c

                button.onclick = (e) => {
                    const cursorPos = view.state.selection.main.head
                    let char = c
                    let viewCmd = null

                    if (c === ARROW_UP || c === ARROW_DOWN) {
                        viewCmd = {
                            selection: {anchor: view.state.selection.main.head},
                            scrollIntoView: true,
                            userEvent: "select.line"
                        }
                        const line = view.state.doc.lineAt(cursorPos)
                        const newLineNumber = line.number + (c === ARROW_DOWN ? 1 : -1)
                        if (newLineNumber >= 1 && newLineNumber <= view.state.doc.lines) {
                            const newLine = view.state.doc.line(newLineNumber)
                            const newCursorPos = Math.min(newLine.to, newLine.from + (cursorPos - line.from))
                            viewCmd.selection = {anchor: newCursorPos}
                        }
                    } else if (c === ARROW_LEFT) {
                        viewCmd = {
                            selection: {anchor: Math.max(0, cursorPos - 1)},
                            scrollIntoView: true
                        }
                    } else if (c === ARROW_RIGHT) {
                        viewCmd = {
                            selection: {anchor: Math.min(view.state.doc.length, cursorPos + 1)},
                            scrollIntoView: true
                        }
                    } else {
                        if (pairs[c]) {
                            char += pairs[c]
                        }

                        viewCmd = {
                            changes: {from: cursorPos, insert: char},
                            selection: {anchor: cursorPos + 1},
                            scrollIntoView: true
                        }
                    }

                    view.dispatch(viewCmd)
                    view.focus()
                }

                rowDiv.appendChild(button)
            })
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

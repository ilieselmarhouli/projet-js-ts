export function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    if (options.className) {
        element.className = options.className;
    }
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    if (options.html) {
        element.innerHTML = options.html;
    }
    return element;
}
export function clearElement(element) {
    element.replaceChildren();
}

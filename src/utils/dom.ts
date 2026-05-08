// Petit helper pour creer rapidement un element DOM avec ses proprietes principales.
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: {
    className?: string;
    textContent?: string;
    html?: string;
  } = {}
): HTMLElementTagNameMap[K] {
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

// Vide un conteneur avant de le rerendre.
export function clearElement(element: HTMLElement): void {
  element.replaceChildren();
}

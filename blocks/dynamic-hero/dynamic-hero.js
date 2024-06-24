import { updateDynamicImage } from "/scripts/controller.js";

export default function decorate(block) {
  // Get all DIV children of the block
  const divEl = [...block.children].filter((child) => child.tagName === "DIV");

  if (divEl.length >= 3) {
    // Add classes to the first three div elements
    divEl[0].classList.add("dynamic-one");
    divEl[1].classList.add("dynamic-two");
    divEl[2].classList.add("dynamic-three");

    const pElements = [...divEl[1].querySelectorAll("p")];
    pElements.forEach((p, index) => {
      p.classList.add(`p-${index}`);
      if (index === 1) {
        const h1 = document.createElement("h1");
        h1.textContent = p.textContent;
        p.replaceWith(h1);
      } else if (index === 2) {
        const h2 = document.createElement("h2");
        h2.textContent = p.textContent;
        p.replaceWith(h2);
      }
    });

    const pZero = document.querySelector(".p-0");
    if (pZero) {
      const parent = pZero.parentNode;
      parent.classList.add("content");
      parent.insertAdjacentElement("afterend", pZero);
    }
  }
  updateDynamicImage();
}

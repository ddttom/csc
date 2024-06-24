export default function decorate(block) {
  // Get all DIV children of the block
  const divEl = [...block.children].filter((child) => child.tagName === 'DIV');

  if (divEl.length >= 3) {
    // Add classes to the first three div elements
    divEl[0].classList.add('dynamic-one');
    divEl[1].classList.add('dynamic-two');
    divEl[2].classList.add('dynamic-three');

    const pElement = [...divEl[1].querySelectorAll('p')];
    pElement.forEach((p, index) => {
      p.classList.add(`p-${index}`);
      if (index === 1) {
        const h1 = document.createElement('h1');
        h1.textContent = p.textContent;
        p.replaceWith(h1);
      } else if (index === 2) {
        const h2 = document.createElement('h2');
        h2.textContent = p.textContent;
        p.replaceWith(h2);
      }
    });

    const pZero = document.querySelector('.p-0');

    const parent = pZero.parentNode;
    parent.classList.add('content');
    parent.insertAdjacentElement('afterend', pZero);
  }

}
  
  function updateDynamicImages() {
    // Define the class names for the dynamic elements
    const dynamicClasses = ['dynamic-one', 'dynamic-two', 'dynamic-three'];

    // Iterate through the dynamic elements and update their images
    dynamicClasses.forEach((dynamicClass, index) => {
      const dynamicElement = document.querySelector(`.${dynamicClass}`);
      if (dynamicElement) {
        const pictureElement = dynamicElement.querySelector('picture');
        if (pictureElement) {
          const imgElement = pictureElement.querySelector('img');
          if (imgElement) {
            // Update the image source
            imgElement.src = window.dam[0][index];
          }
          // Remove all child nodes of the picture element
          while (pictureElement.firstChild) {
            pictureElement.removeChild(pictureElement.firstChild);
          }
          // Create a new img element with the updated source
          const newImgElement = document.createElement('img');
          newImgElement.src = window.dam[0][index];
          pictureElement.appendChild(newImgElement);
        }
      }
    });
  }
  if (window.dam) {
  updateDynamicImages();
  }

// eslint-disable-next-line import/no-absolute-path, import/no-unresolved
import { updateDynamicImage } from '/scripts/controller.js';

export default function decorate(block) {
  const cols = [...block.children];
  cols.forEach((col, index) => {
    if (index === 0) {
      col.classList.add('dynamic-img');
    } else {
      col.classList.add('dynamic-content');
    }

    const par = col.querySelectorAll('p');
    par.forEach((p, qindex) => {
      if (qindex === 0) {
        p.classList.add('content-img');
      } else {
        p.classList.add('content-content');
      }
    });
  });
  updateDynamicImage('.dynamic-img', 2);
}

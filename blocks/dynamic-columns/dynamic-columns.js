/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/no-absolute-path, import/no-unresolved
import { updateDynamicImage } from '/scripts/controller.js';

export async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
  await updateDynamicImage('.columns-img-col', 1);
}

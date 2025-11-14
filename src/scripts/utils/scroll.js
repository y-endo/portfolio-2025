// export function lockScroll(id){
//   const isOpen = document.body.classList.contains('is-scroll-locked');
//   if (!window[GLOBAL_NAMESPACE].scroll.lockedElements.includes(id)) {
//     window[GLOBAL_NAMESPACE].scroll.lockedElements.push(id);
//   }
//   if (isOpen) return;

//   const overlayElement = document.querySelector(`.js-modal-overlay`);
//   document.body.classList.add('is-scroll-locked');
//   overlayElement.setAttribute('aria-hidden', 'false');
// }

// export function unlockScroll(id) {
//   window[GLOBAL_NAMESPACE].scroll.lockedElements = window[GLOBAL_NAMESPACE].scroll.lockedElements.filter(
//     (el) => el !== id
//   );

//   // 他にロック中の要素があれば解除しない
//   if (window[GLOBAL_NAMESPACE].scroll.lockedElements.length > 0) return;

//   const overlayElement = document.querySelector(`.js-modal-overlay`);
//   document.body.classList.remove('is-scroll-locked');
//   overlayElement?.setAttribute('aria-hidden', 'true');
// }

export function scrollTo(anchorElement) {
  const targetID = anchorElement.getAttribute('href');
  const targetElement = document.querySelector(targetID);

  if (!targetElement) {
    console.error(`スクロール先の要素が見つかりません: ${targetID}`);
    return;
  }

  window.scrollTo({
    top: targetElement.offsetTop || 0,
    behavior: 'smooth',
  });
}

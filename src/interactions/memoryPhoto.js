import placeholder from '../assets/memory-placeholder.svg?inline';

export function loadMemoryPhoto(image, memory, signal, onReady = () => {}) {
  image.decoding = 'async';
  let usingPlaceholder = !memory.image;
  let ready = false;
  const finish = () => {
    if (ready || signal.aborted) return;
    ready = true;
    onReady(usingPlaceholder);
  };
  const fallback = () => {
    if (ready || signal.aborted) return;
    if (usingPlaceholder) {
      image.hidden = true;
      finish();
      return;
    }
    usingPlaceholder = true;
    image.src = placeholder;
  };

  image.addEventListener('load', finish, { signal });
  image.addEventListener('error', fallback, { signal });
  image.src = usingPlaceholder
    ? placeholder
    : `${import.meta.env.BASE_URL}assets/photos/${encodeURIComponent(memory.image)}`;
  return fallback;
}

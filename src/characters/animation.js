export const MOUNT_SECONDS = 0.85;
export const MOUNT_SEATED_AT = MOUNT_SECONDS * 0.45;

export function easeInOut(progress) {
  return progress * progress * (3 - 2 * progress);
}

export function characterPose(state, time) {
  switch (state) {
    case 'walking': {
      const frame = Math.floor(time * 9) % 4;
      return { stride: [0, 4, 0, -4][frame], lift: frame % 2, seated: false, blink: false };
    }
    case 'mounting':
      return { stride: 0, lift: 0, seated: time >= MOUNT_SEATED_AT, blink: false, mounting: true };
    case 'riding':
      return { stride: 0, lift: 0, seated: true, blink: time % 3.1 > 2.96 };
    default:
      return { stride: 0, lift: Math.floor(time * 2) % 2, seated: false, blink: time % 3.1 > 2.96 };
  }
}

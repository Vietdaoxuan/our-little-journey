import { loadMemoryPhoto } from './memoryPhoto.js';

export const memoryInteractions = {
  box: { hint: 'Chạm vào hộp dấu hỏi.', actions: [['?', 'Chạm hộp dấu hỏi']] },
  chest: { hint: 'Mở rương để tìm tấm ảnh bên trong.', actions: [['▣', 'Mở rương']] },
  paint: {
    hint: 'Chạm đủ ba màu để tô lại tấm ảnh.',
    actions: [['●', 'Hồng'], ['●', 'Xanh mint'], ['●', 'Vàng']],
    preview: true,
  },
  letter: { hint: 'Mở phong thư Việt gửi Mai.', actions: [['✉', 'Mở phong thư']] },
  hearts: {
    hint: 'Thu thập đủ ba trái tim để nhìn rõ tấm ảnh.',
    actions: [['♥', 'Trái tim 1'], ['♥', 'Trái tim 2'], ['♥', 'Trái tim 3']],
    preview: true,
  },
  puzzle: {
    hint: 'Chạm ba mảnh để đưa chúng về đúng chỗ.',
    actions: [['▨', 'Mảnh 1'], ['▨', 'Mảnh 2'], ['▨', 'Mảnh 3']],
    preview: true,
  },
  album: { hint: 'Mở album và lật qua từng ảnh để đến tấm cuối.', actions: [['▤', 'Mở album']] },
};

export function createPreview(type, memory, signal) {
  const stage = document.createElement('div');
  stage.className = 'memory-preview';
  stage.setAttribute('aria-hidden', 'true');
  const photo = () => {
    const image = document.createElement('img');
    image.alt = '';
    loadMemoryPhoto(image, memory, signal);
    return image;
  };

  if (type === 'puzzle') {
    const tiles = Array.from({ length: 3 }, (_, index) => {
      const tile = photo();
      tile.className = 'memory-tile';
      tile.style.setProperty('--piece', index);
      stage.append(tile);
      return tile;
    });
    return { stage, advance: (index) => tiles[index].classList.add('is-placed') };
  }

  stage.append(photo());
  if (type === 'hearts') {
    const covers = Array.from({ length: 3 }, () => {
      const cover = document.createElement('span');
      cover.className = 'memory-cover';
      cover.textContent = '♥';
      stage.append(cover);
      return cover;
    });
    return { stage, advance: (index) => covers[index].classList.add('is-collected') };
  }

  return { stage, advance: (_index, count) => stage.style.setProperty('--memory-progress', count / 3) };
}

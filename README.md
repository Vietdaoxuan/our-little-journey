# Our Little Journey — Xuân Việt ❤️ Ngọc Mai

Mini-game side-scrolling phong cách pixel art 16-bit, xây bằng Vite, JavaScript ES modules và Phaser 3. Từ màn hình tiêu đề, chọn **Cùng lên xe** để xem phân cảnh Việt và Mai.

## Chạy local

Cài Node.js 24 LTS kèm npm, sau đó chạy từ thư mục dự án.

```sh
npm ci
npm run dev
```

Mở `http://localhost:5173/` hoặc địa chỉ Vite in trong terminal. Màn hình hiển thị `Our Little Journey` và `Xuân Việt ❤️ Ngọc Mai`. Canvas giữ tỷ lệ 16:9 khi thay đổi kích thước cửa sổ.

```sh
npm run build
npm run preview
```

Bản build nằm trong `dist/`. Lệnh `preview` phục vụ bản build tại `http://localhost:4173/` theo mặc định.

## Âm thanh

- Âm thanh tắt mỗi khi tải trang. Bấm nút **Âm thanh** ở góc trái để phát nhạc và hiện thanh âm lượng. Trình duyệt nhớ mức âm lượng. Khi đổi tab hoặc khóa màn hình, game và âm thanh tạm dừng. Nếu đã bấm **Pause**, hãy bấm **Resume** sau khi quay lại.
- Game dùng các bản synth nguyên bản tạo bằng Web Audio khi chưa có nhạc riêng. Để thay, đặt file MP3 bạn có quyền sử dụng vào `public/assets/audio/` và sửa `file` trong `src/data/audio.js`, ví dụ `ending: { file: 'hoa-mai.mp3', mood: 'ending' }`. Chỉ điền tên file có phần đuôi, đúng hoa thường. Nếu file không tải hoặc không giải mã được, game tiếp tục phát bản synth. Nên dùng bản nhạc ngắn, tối ưu dung lượng và có điểm lặp tự nhiên.

## Kiểm tra thế giới Phase 2

1. Mở `http://localhost:5173/?demo=world`, hoặc thêm `?demo=world` vào URL của bản đang chạy. Camera đi từ trái sang phải trong khoảng 26 giây rồi dừng ở mép thế giới.
2. Quan sát bầu trời đứng yên, mây và núi xa trôi chậm hơn đồi và hàng cây. Mặt đường, biển chỉ đường và hộp dấu hỏi dịch chuyển theo camera.
3. Chọn **Pause** để dừng camera và chim, **Resume** để tiếp tục, hoặc **Restart** để quay về đầu và chạy lại. Có thể dùng Tab và Enter hoặc chạm trên điện thoại.

Thế giới rộng 2.160 pixel, với mặt đường liên tục và các vật trang trí được vẽ bằng Phaser Graphics. Các hộp dấu hỏi hiện là đồ trang trí.

## Kiểm tra nhân vật và xe Wave Phase 3

1. Chọn **Cùng lên xe**. Quan sát Việt đứng chờ cạnh xe, rồi Mai đi bộ vào từ bên trái.
2. Đọc hai lượt hội thoại. Nhấn **Tiếp tục** khi chữ đang hiện để xem cả câu, rồi nhấn lần nữa để chuyển lượt. Có thể chạm nút hoặc dùng bàn phím.
3. Quan sát Việt lên xe trước, Mai lên sau. Khi xe chạy, bánh quay theo quãng đường, thân xe và người ngồi nhún cùng nhau, bụi xuất hiện sau bánh và camera theo xe. Chuyến đi tiếp tục qua các điểm dừng của Phase 4.
4. Dùng **Pause / Resume** để dừng và tiếp tục phân cảnh, **Restart** để xem lại từ đầu, hoặc **Về tiêu đề** để quay lại màn hình chính.

## Kiểm tra Love Journey & Quiz Checkpoints (Phase 4)

1. Chọn **Cùng lên xe** và đi hết hai lượt hội thoại. Khi xe khởi hành, thanh **Love Timeline** hiện `0/9`.
2. Chờ xe dừng ở từng mốc **Tà Xùa → Huế → Đi vẽ cốc → Sinh nhật đầu tiên bên em → Ngày tỏ tình → Sài Gòn → Đón năm mới đầu tiên bên em → Đà Nẵng → Hiện tại**. Thử trả lời sai để kiểm tra xe vẫn đứng yên và có thể chọn lại. Trả lời đúng để mở mini-interaction của mốc.
3. Sau khi mở ảnh ở **Hiện tại**, kiểm tra số năm/tháng bên nhau và tiến độ `9/9`. Nhấn **Tiếp tục hành trình ❤️** để mở **To Be Continued...**. Cả ba lựa chọn đều dẫn vào cảnh kết Phase 6.
4. Thử **Pause / Resume** khi xe đang chạy, khi quiz đang mở hoặc khi đang chơi mini-interaction. **Restart** xóa tiến độ ảnh đã lưu và chơi lại từ đầu.

Sửa tên mốc, địa điểm, câu hỏi, đáp án và chương cuối trong `src/data/memories.js`. Giữ `id` của mỗi mốc duy nhất, cung cấp 2–4 đáp án và đặt `correctAnswerId` trùng với `id` của đáp án đúng. Dùng `YYYY-MM-DD` cho ngày đã biết, hoặc `null` khi chưa có ngày hay địa điểm. Đặt `worldPosition` tăng dần trong khoảng từ sau vị trí xuất phát `251` đến `2105`. Mốc **Hiện tại** tính số tháng tròn theo ngày trên thiết bị, bắt đầu từ `2025-08-02`.

## Kiểm tra mở khóa ảnh (Phase 5)

1. Trả lời đúng và chọn **Mở kỷ niệm ❤️**. Tiến độ vẫn giữ nguyên cho đến khi ảnh xuất hiện đầy đủ.
2. Làm theo hướng dẫn tại mỗi mốc để mở ảnh. Các tương tác ba bước chấp nhận mọi thứ tự và mỗi nút chỉ tính một lần.
3. Ở mốc **Hiện tại**, bấm **Ảnh tiếp theo** qua tám ảnh đã mở khóa. Ảnh thứ chín là ảnh của mốc hiện tại. Đóng Polaroid bằng **Đóng ảnh** hoặc Escape, rồi chọn **Tiếp tục hành trình ❤️**.
4. Refresh giữa quiz hoặc tương tác để trở lại quiz của mốc đang dừng. Refresh sau khi ảnh hiện đầy đủ để trở lại điểm dừng đã hoàn thành. Refresh giữa lúc chạy khôi phục điểm dừng đã lưu gần nhất. Tiến độ lưu trong `localStorage` của trình duyệt hiện tại.

Để thêm ảnh thật, chép ảnh vào `public/assets/photos/` và điền tên file trong `image`, ví dụ `image: 'ta-xua.webp'`, ở mốc tương ứng trong `src/data/memories.js`. Sửa `description`, `date` và `location` ngay trong cùng mục. Tên file phân biệt hoa thường trên GitHub Pages. Khi thiếu ảnh hoặc tải lỗi, game dùng hình minh họa gốc có nhãn **Ảnh minh họa**. Hãy dùng ảnh bạn sở hữu hoặc được phép sử dụng.

## Kiểm tra cảnh kết Phase 6

1. Mở đủ chín ảnh, đóng ảnh cuối và đi qua **To Be Continued...** để tới đồi hoa mai. Quan sát xe leo dốc, trời tối dần và hai nhân vật lần lượt xuống xe, đi tới gốc mai.
2. Đọc hai lượt hội thoại. Chọn **Chạm để hoa mai nở 🌼** rồi quan sát chồi, hoa vàng, cánh hoa, trái tim, camera lùi nhẹ và sao băng. Hai dòng lời nhắn xuất hiện lần lượt trước khi nút đi tiếp hiện ra.
3. Chọn **Tiếp tục chuyến đi của chúng mình ❤️**. Hai nhân vật quay lại xe, chạy về phía xa và màn hình tối dần.
4. Dùng **Xem lại kỷ niệm** để lật lại chín ảnh. **Về trang chủ** giữ tiến độ. Khi vào lại cảnh kết sau khi đã xem xong, có thể chọn **Bỏ qua cảnh đã xem**. **Chơi lại từ đầu** chỉ xóa tiến độ sau khi xác nhận.

Cảnh kết dùng cùng tiến độ `localStorage` với Phase 5. Nếu refresh khi chưa xem xong cảnh kết, cảnh bắt đầu lại từ lúc xe lên đồi.

## Chỉnh nội dung và kiểm tra bản build

- Sửa tên hai người trong `src/data/couple.js`. Sửa câu hỏi, đáp án, ngày tháng, lời nhắn Polaroid và lựa chọn **To Be Continued...** trong `src/data/memories.js`. Lời thoại trên đồi nằm trong `src/scenes/EndingScene.js` và lời kết trong `src/ui/EndingUI.js`.
- Khi kiểm tra `npm run preview`, thử màn hình dọc/ngang, ảnh thật dọc và ngang, âm lượng, Pause/Resume, chuyển tab và refresh trước/sau mở ảnh. Sau khi đi đủ chín checkpoint, xem cảnh kết, mở lại album và kiểm tra cả hai lựa chọn xác nhận chơi lại.

## Cấu trúc dự án

```text
src/
├── main.js               # Điểm vào, tạo Phaser.Game
├── gameConfig.js         # Cấu hình canvas, pixel art và thứ tự scene
├── style.css             # Khung hiển thị canvas
├── audio/                # Synth, phát nhạc, fade và hiệu ứng
├── runtime/              # Chuyển cảnh và tạm dừng khi ẩn trang
├── scenes/
│   ├── BootScene.js      # Nạp tài nguyên và chọn màn hình theo URL
│   ├── MainScene.js      # Màn hình tiêu đề và nút Cùng lên xe
│   ├── WorldScene.js     # Camera, giới hạn thế giới và trạng thái demo
│   ├── JourneyScene.js   # Phân cảnh mở đầu và điều phối chuyến đi
│   └── EndingScene.js    # Điều phối cảnh kết và điều hướng sau cảnh kết
├── ending/
│   ├── EndingLandscape.js # Đường đồi, bầu trời, sao và sao băng
│   └── MaiTree.js         # Cây mai, từng giai đoạn nở hoa và cánh hoa bay
├── journey/
│   ├── CheckpointManager.js # Thứ tự mốc, chấm đáp án và ảnh đã mở
│   ├── JourneyManager.js    # Tốc độ, khóa điểm dừng và trạng thái chuyến đi
│   └── journeyProgress.js   # Lưu và khôi phục tiến độ theo ID
├── world/
│   ├── world.js          # Lắp ghép cảnh và vẽ mặt đường
│   ├── background.js     # Bầu trời, mây, núi, đồi và cây
│   ├── backgroundThemes.js # Bảng màu trời ở từng điểm dừng
│   ├── parallax.js       # Tỷ lệ dịch chuyển và căn lưới pixel
│   └── decorations.js    # Biển chỉ đường, hoa, cỏ, chim và hộp dấu hỏi
├── assets/
│   └── landscape.svg     # Nền pixel art tạm thời
├── ui/
│   ├── titleCard.js      # Vẽ bảng tiêu đề bằng Phaser
│   ├── demoControls.js   # Nút HTML cho chuột, cảm ứng và bàn phím
│   ├── Dialogue.js       # Hội thoại typewriter và chuyển lượt
│   ├── Timeline.js       # Tiến độ và dấu hoàn thành
│   ├── SoundControls.js  # Bật/tắt âm thanh và chỉnh âm lượng
│   ├── Quiz.js           # Câu hỏi, phản hồi và chương cuối
│   ├── PhotoModal.js     # Polaroid, hiệu ứng ảnh và album
│   └── EndingUI.js       # Lời nhắn, thao tác nở hoa và menu cảnh kết
├── data/
│   ├── couple.js         # Tên game và tên hai người
│   ├── audio.js          # Nhạc theo scene và tên file thay thế
│   ├── memories.js      # Bảy kỷ niệm, câu hỏi và chương cuối
│   └── relationshipDuration.js # Tính số tháng tròn từ ngày tỏ tình
├── characters/
│   ├── Character.js      # Sprite pixel art của Việt và Mai
│   └── animation.js      # Các tư thế và nhịp chuyển động
├── objects/
│   └── Motorbike.js      # Xe Wave, bánh, điểm neo người ngồi và bụi
└── interactions/
    ├── MemoryInteractionManager.js # Điều khiển và dọn dẹp tương tác
    ├── memoryInteractions.js      # Bảy tương tác và xem trước ảnh
    └── memoryPhoto.js             # Tải ảnh và hình dự phòng
```

## GitHub Pages

`vite.config.js` dùng `base: './'` để bản build chạy ở trang gốc hoặc dưới `/<tên-repo>/`. Ảnh và nhạc trong `public/assets/` được Vite chép sang `dist/assets/`. Game dùng font hệ thống và tải các tài nguyên còn lại từ cùng website.

1. Đưa source lên một repository GitHub với nhánh `main`. Chỉ đưa các ảnh và bản nhạc bạn muốn công bố. Các file được đóng gói trong `dist/` có thể được truy cập qua URL của site.
2. Trong repository, chọn **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push lên `main` hoặc chọn **Actions → Deploy game to GitHub Pages → Run workflow**. Workflow `.github/workflows/deploy.yml` dùng Node.js 24, chạy `npm ci`, chạy `npm run build` và xuất bản `dist/` bằng quyền Pages của GitHub Actions.
4. Mở URL từ bước deploy hoặc **Settings → Pages**. Kiểm tra lại ảnh, nhạc thay thế, màn hình mobile và luồng cảnh kết ngay trên URL đó. Tiến độ trên localhost và trên GitHub Pages được lưu riêng theo địa chỉ website.

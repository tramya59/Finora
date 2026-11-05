

                        ĐỒ ÁN MÔN HỌC: THIẾT KẾ WEB

             ĐỀ TÀI 8: WEBSITE QUẢN LÝ CHI TIÊU CÁ NHÂN (FINORA)

               Slogan: "Finora – Hiểu tiền, sống chủ động"

1. THÔNG TIN SINH VIÊN THỰC HIỆN

--------------------------------------------------------------------------------

- Họ và tên      : Trịnh Thị Trà My

- Mã số sinh viên: 24C48020121

- Thư mục nộp bài: TRINHTHITRAMY_24C48020121_DEAN_quanlichitieu/

- Đề tài         : Quản lý chi tiêu Finora

- Công nghệ sử dụng: HTML5 + CSS3 (Flexbox, CSS Grid, Media Queries) + JavaScript

  thuần (Vanilla JS, DOM, LocalStorage). Hoàn toàn không sử dụng thư viện hay

  framework bên ngoài.

2. CẤU TRÚC THƯ MỤC DỰ ÁN

TRINHTHITRAMY_24C48020121_DEAN_quanlichitieu/

├── index.html              # Trang 1: Dashboard tổng quan tài chính

├── transactions.html       # Trang 2: Danh sách, tìm kiếm & lọc giao dịch

├── add-transaction.html    # Trang 3: Form thêm mới / chỉnh sửa giao dịch

├── budget.html             # Trang 4: Thiết lập & theo dõi hạn mức ngân sách

├── reports.html            # Trang 5: Báo cáo thống kê, biểu đồ CSS & xuất CSV

├── css/

│   ├── style.css           # Định dạng giao diện chính, biến màu, chủ đề, biểu đồ

│   └── responsive.css      # Tương thích đa thiết bị (Desktop, Tablet, Mobile)

├── js/

│   ├── main.js             # Logic chung, CRUD, bộ lọc, ngân sách, biểu đồ, CSV

│   └── validation.js       # Kiểm tra hợp lệ (Validation) cho các Form nhập liệu

├── images/

│   ├── navbar-finora.png   # Logo thanh điều hướng

│   ├── favicon-finora.png  # Biểu tượng trang web (Favicon)

│   ├── favicon-64.png      # Biểu tượng kích thước 64x64

│   ├── 1anhchungkhoan.jpg, 2chungkhoanxanh.jpg, 3chungkhoan.jpg, 4chungkhoan.jpg

│   ├── 1congnghe.jpg, 2congnghe.jpg, 3congnghe.jpg, 4congnghe.jpg

│   └── 1thiennhien.jpg, 2thiennhien.jpg, 3thiennhien.jpg, 4thiennhien.jpg

└── README.txt              # Tài liệu mô tả chức năng và hướng dẫn chạy

3. MÔ TẢ CHỨC NĂNG CHI TIẾT TỪNG TRANG

--------------------------------------------------------------------------------

3.1. Trang Tổng quan (index.html)

- Hiển thị đồng hồ thời gian thực (cập nhật mỗi giây bằng setInterval).

- Slider banner ảnh tự động chuyển mượt mà mỗi 3.5 giây, tự động đổi bộ ảnh

  tương ứng với chủ đề giao diện đang chọn.

- Bộ chọn tháng giúp xem nhanh 4 chỉ số: Thu nhập trong tháng, Chi tiêu trong

  tháng, Chênh lệch tháng (Thu - Chi) và Số dư khả dụng tổng.

- Tự động hiển thị Banner cảnh báo màu đỏ nếu có bất kỳ danh mục nào trong tháng

  vượt quá hạn mức ngân sách đã cài đặt.

- Bảng liệt kê 5 giao dịch gần đây nhất.

3.2. Trang Danh sách giao dịch (transactions.html) - [FORM 2: Tìm kiếm & Lọc]

- Hiển thị toàn bộ lịch sử giao dịch sắp xếp mới nhất lên đầu.

- Tích hợp Form tìm kiếm & lọc động (không tải lại trang):

  + Tìm theo từ khóa (trong tiêu đề hoặc ghi chú).

  + Lọc theo tháng (input type="month").

  + Lọc theo loại giao dịch (Thu nhập / Chi tiêu).

  + Lọc theo danh mục (Ăn uống, Học tập, Nhà ở, Di chuyển, Mua sắm, Lương, Khác).

- Hiển thị dòng tóm tắt động: tổng số giao dịch tìm thấy, tổng thu và tổng chi

  của danh sách đang lọc.

- Hỗ trợ thao tác Sửa (chuyển sang trang form kèm ?editId=...) và Xóa giao dịch

  có hộp thoại xác nhận + thông báo Toast.

3.3. Trang Thêm / Sửa giao dịch (add-transaction.html) - [FORM 1: Nhập liệu chính]

- Tích hợp đủ 7 loại phần tử nhập liệu có gắn <label for="..."> chuẩn ngữ nghĩa:

  1. Radio    : Chọn loại giao dịch (Chi tiêu / Thu nhập).

  2. Text     : Tiêu đề giao dịch.

  3. Number   : Số tiền (VNĐ).

  4. Select   : Danh mục (tự động lọc danh mục hợp lệ theo loại Thu/Chi).

  5. Date     : Ngày giao dịch (mặc định ngày hôm nay, chặn chọn ngày tương lai).

  6. Textarea : Ghi chú chi tiết.

  7. Checkbox : Đánh dấu khoản cố định định kỳ hàng tháng.

- Kiểm tra dữ liệu (Validation) chặt chẽ bằng JavaScript (chặn gửi bằng

  event.preventDefault(), hiển thị lỗi màu đỏ dưới từng ô và tự xóa lỗi khi nhập):

  + Kiểm tra rỗng ở các trường bắt buộc.

  + Kiểm tra độ dài: Tiêu đề từ 6 đến 80 ký tự; Ghi chú tối đa 200 ký tự.

  + Kiểm tra định dạng & miền giá trị: Số tiền phải là số nguyên >= 1.000đ;

    Ngày giao dịch hợp lệ và không vượt quá ngày hiện tại.

- Hỗ trợ cả 2 chế độ: Thêm mới (Create) và Cập nhật giao dịch cũ (Update).

3.4. Trang Ngân sách (budget.html) - [FORM 3: Thiết lập ngân sách]

- Form thiết lập hạn mức theo Tháng + Danh mục (hoặc Tất cả danh mục) + Số tiền

  hạn mức, có validation báo lỗi đỏ đầy đủ (hạn mức số nguyên >= 100.000đ).

- Hiển thị danh sách các hạn mức trong tháng kèm Thanh tiến độ (Progress Bar)

  tự động đổi màu theo mức độ chi tiêu:

  + Xanh lá (< 80% hạn mức): An toàn.

  + Vàng cam (80% - 99% hạn mức): Sắp chạm trần.

  + Đỏ (>= 100% hạn mức): Cảnh báo vượt ngân sách.

- Tích hợp công cụ "Nạp dữ liệu mẫu" (15 giao dịch + 3 hạn mức mẫu của tháng

  hiện tại) và "Xóa tất cả & làm mới" để thuận tiện kiểm thử.
- Tích hợp tính năng "Đặt mục tiêu tiết kiệm" (Savings Goal Tracker): Cho phép
  đặt mục tiêu tài chính cá nhân (tên mục tiêu, số tiền cần đạt >= 500.000đ) và
  tự động tính phần trăm (%) tiến độ tích lũy dựa trên số dư khả dụng thực tế.
3.5. Trang Báo cáo & Thống kê (reports.html)

- Bộ lọc khoảng thời gian tùy chỉnh (Từ ngày ... đến ngày ...), kèm nút chọn
  nhanh "Tháng này" hoặc xem tổng hợp "Tất cả".
- Hiển thị 3 thẻ tổng hợp: Tổng thu nhập, Tổng chi tiêu, Chênh lệch (Thu - Chi).

- Biểu đồ cột (Bar Chart) vẽ hoàn toàn bằng CSS thuần kết hợp JS tính toán chiều

  cao cột theo tỷ trọng chi tiêu từng danh mục.

- Bảng thống kê chi tiết: Tổng tiền, số lần giao dịch và tỷ lệ phần trăm (%).

- Tính năng điểm cộng: Xuất báo cáo ra file CSV (hỗ trợ tiếng Việt UTF-8 BOM

  mở trực tiếp trên Microsoft Excel không lỗi font).

3.6. Tính năng sáng tạo (Bonus)

- Cửa hàng chủ đề (Theme Store Modal): Cho phép đổi nhanh 4 phong cách màu sắc

  (Pastel, Xanh Lộc, Hoàng Hôn, Xanh Nước).

- Chế độ Sáng / Tối (Dark Mode) đồng bộ riêng theo từng tông màu chủ đề và lưu

  trạng thái vào localStorage.

- Hệ thống thông báo nổi (Toast Notification) mượt mà khi thực hiện thao tác.

4. ĐỐI CHIẾU CÁC KỸ THUẬT JAVASCRIPT ĐÃ SỬ DỤNG (ĐẠT 12/12 KỸ THUẬT)

--------------------------------------------------------------------------------

1. Truy vấn DOM          : document.getElementById(), querySelector(), querySelectorAll()

2. Lắng nghe sự kiện     : addEventListener() cho click, submit, input, change, keydown, error

3. Thay đổi nội dung     : textContent, innerHTML

4. Thay đổi CSS          : classList (add, remove, toggle), style (width, height)

5. Tạo/xóa phần tử động  : document.createElement(), appendChild(), removeChild()

6. Mảng & vòng lặp       : forEach(), map(), filter(), reduce(), sort(), slice(), find()

7. Object lưu dữ liệu    : Object giao dịch, ngân sách, bản đồ thống kê danh mục

8. Hàm có tham số/return : Các hàm tính toán, định dạng tiền tệ, kiểm tra hợp lệ

9. Câu lệnh điều kiện    : if/else, switch/case, toán tử ba ngôi

10. Xử lý sự kiện Form   : event.preventDefault(), reset(), bắt sự kiện submit/input/change

11. Lưu trữ cục bộ       : localStorage (getItem, setItem) kèm try/catch an toàn

12. Bộ đếm thời gian     : setInterval() (đồng hồ, slider), setTimeout() (toast, chuyển trang)

5. HƯỚNG DẪN CHẠY CHƯƠNG TRÌNH

- Bước 1: Giải nén file "TRINHTHITRAMY_24C48020121_DEAN_quanlichitieu.zip".

- Bước 2: Mở thư mục vừa giải nén, nhấp đúp chuột vào file "index.html" để mở

  bằng trình duyệt web bất kỳ (Google Chrome, Microsoft Edge, Firefox, Safari...)

  hoặc mở bằng tiện ích "Live Server" trong Visual Studio Code.

- Bước 3: Lần đầu tiên mở trang, hệ thống sẽ tự động nạp sẵn bộ dữ liệu mẫu của

  tháng hiện tại để hiển thị đầy đủ bảng biểu, ngân sách và biểu đồ.

- Bước 4: Có thể vào trang "Ngân sách" -> mục "Quản lý dữ liệu" để nạp lại dữ

  liệu mẫu hoặc xóa trắng dữ liệu bất cứ lúc nào.

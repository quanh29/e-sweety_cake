import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, List, ShoppingCart, RefreshCcw, FileText, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import styles from './Policy.module.css';

const Policy = () => {
  const [activeSection, setActiveSection] = useState('privacy');
  const [visibleSections, setVisibleSections] = useState([]);
  const sectionRefs = useRef({});

  const sections = [
    { id: 'privacy', title: 'Chính sách bảo mật & Điều khoản', icon: Shield },
    { id: 'quality', title: 'Chính sách chất lượng & An toàn thực phẩm', icon: FileText },
    { id: 'payment', title: 'Chính sách bán hàng & Thanh toán', icon: ShoppingCart },
    { id: 'return', title: 'Chính sách đổi trả', icon: RefreshCcw }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => [...new Set([...prev, entry.target.id])]);
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px' }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.policyPage}>
      <PageTitle title="Chính Sách" />
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>Chính Sách & Điều Khoản</h1>
          <p>Cam kết minh bạch và bảo vệ quyền lợi khách hàng</p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Index Navigation & Image */}
        <div className={styles.topSection}>
          <div className={styles.indexCard}>
            <h2>
              <List size={24} />
              Mục lục
            </h2>
            <nav className={styles.indexNav}>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`${styles.indexItem} ${activeSection === section.id ? styles.active : ''}`}
                  >
                    <Icon size={18} />
                    <span>{section.title}</span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={styles.imageCard}>
            <div className={styles.imageWrapper}>
              <img src="/hero3.jpg" alt="Chính sách" />
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className={styles.policySections}>
          {/* Privacy Policy */}
          <section
            id="privacy"
            ref={el => sectionRefs.current['privacy'] = el}
            className={`${styles.policySection} ${visibleSections.includes('privacy') ? styles.visible : ''}`}
          >
            <div className={styles.sectionHeader}>
              <Shield size={32} />
              <h2>Chính sách bảo mật & Điều khoản sử dụng</h2>
            </div>

            <div className={styles.subsection}>
              <h3>1. Khai báo sử dụng</h3>
              <p>
                E-Sweetie Bake cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách này 
                giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng dịch vụ 
                của chúng tôi.
              </p>
              <ul>
                <li>Website chỉ sử dụng thông tin cho mục đích cung cấp dịch vụ và cải thiện trải nghiệm khách hàng</li>
                <li>Chúng tôi không bán hoặc chia sẻ thông tin cá nhân với bên thứ ba vì mục đích thương mại</li>
                <li>Mọi thông tin được mã hóa và bảo vệ theo tiêu chuẩn quốc tế</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2. Thông tin cá nhân cung cấp</h3>
              <p>Khi đặt hàng hoặc đăng ký tài khoản, chúng tôi có thể thu thập các thông tin sau:</p>
              <ul>
                <li><strong>Thông tin cơ bản:</strong> Họ tên, số điện thoại, địa chỉ email</li>
                <li><strong>Địa chỉ giao hàng:</strong> Địa chỉ chi tiết để đảm bảo giao hàng chính xác</li>
                <li><strong>Thông tin thanh toán:</strong> Phương thức thanh toán, thông tin giao dịch</li>
                <li><strong>Lịch sử đơn hàng:</strong> Sản phẩm đã mua, thời gian, giá trị đơn hàng</li>
              </ul>
              <p>
                Tất cả thông tin được thu thập với sự đồng ý của khách hàng và chỉ sử dụng cho mục đích cung cấp 
                dịch vụ tốt nhất.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3>3. Cung cấp thông tin cho đơn vị khác</h3>
              <p>Chúng tôi chỉ chia sẻ thông tin với các đối tác tin cậy trong các trường hợp sau:</p>
              <ul>
                <li><strong>Đơn vị vận chuyển:</strong> Tên, số điện thoại và địa chỉ giao hàng để hoàn tất đơn hàng</li>
                <li><strong>Cổng thanh toán:</strong> Thông tin cần thiết để xử lý giao dịch (được mã hóa an toàn)</li>
                <li><strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu từ cơ quan có thẩm quyền theo quy định pháp luật</li>
              </ul>
              <p className={styles.highlight}>
                <Lock size={18} />
                Chúng tôi cam kết không bán hoặc cho thuê thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3>4. Ghi nhận thông tin trình duyệt</h3>
              <p>Website sử dụng cookies và các công nghệ tương tự để:</p>
              <ul>
                <li>Ghi nhớ thông tin đăng nhập và giỏ hàng của bạn</li>
                <li>Phân tích lưu lượng truy cập và cải thiện trải nghiệm người dùng</li>
                <li>Hiển thị nội dung và quảng cáo phù hợp với sở thích</li>
                <li>Thu thập thống kê về cách khách hàng sử dụng website</li>
              </ul>
              <p>Bạn có thể tắt cookies trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể bị ảnh hưởng.</p>
            </div>

            <div className={styles.subsection}>
              <h3>5. An toàn thông tin</h3>
              <p>Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt:</p>
              <ul>
                <li><strong>Mã hóa SSL/TLS:</strong> Tất cả dữ liệu truyền tải được mã hóa</li>
                <li><strong>Bảo mật máy chủ:</strong> Hệ thống firewall và giám sát 24/7</li>
                <li><strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập thông tin</li>
                <li><strong>Sao lưu định kỳ:</strong> Dữ liệu được sao lưu thường xuyên để phòng ngừa mất mát</li>
              </ul>
              <div className={styles.warningBox}>
                <strong>Lưu ý:</strong> Vui lòng không chia sẻ mật khẩu tài khoản với bất kỳ ai. E-Sweetie Bake không 
                bao giờ yêu cầu mật khẩu qua email hoặc điện thoại.
              </div>
            </div>
          </section>

          {/* Quality & Safety Policy */}
          <section
            id="quality"
            ref={el => sectionRefs.current['quality'] = el}
            className={`${styles.policySection} ${visibleSections.includes('quality') ? styles.visible : ''}`}
          >
            <div className={styles.sectionHeader}>
              <FileText size={32} />
              <h2>Chính sách chất lượng & An toàn thực phẩm</h2>
            </div>

            <div className={styles.subsection}>
              <h3>1. Cam kết chất lượng</h3>
              <ul>
                <li><strong>Nguyên liệu tươi ngon:</strong> 100% nguyên liệu nhập khẩu từ các nguồn uy tín, được kiểm tra kỹ lưỡng</li>
                <li><strong>Quy trình sản xuất:</strong> Tuân thủ nghiêm ngặt tiêu chuẩn HACCP và ISO 22000</li>
                <li><strong>Không chất bảo quản:</strong> Sản phẩm không sử dụng chất bảo quản độc hại</li>
                <li><strong>Kiểm tra chất lượng:</strong> Mỗi sản phẩm được kiểm tra trước khi giao đến tay khách hàng</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2. An toàn thực phẩm</h3>
              <ul>
                <li>Nhà bếp đạt tiêu chuẩn vệ sinh an toàn thực phẩm do Sở Y tế cấp</li>
                <li>Nhân viên được đào tạo chuyên nghiệp về vệ sinh an toàn thực phẩm</li>
                <li>Thiết bị và dụng cụ được vệ sinh, khử trùng thường xuyên</li>
                <li>Sản phẩm được bảo quản ở nhiệt độ phù hợp theo quy định</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>3. Truy xuất nguồn gốc</h3>
              <p>
                Mỗi sản phẩm đều có mã truy xuất nguồn gốc, khách hàng có thể kiểm tra thông tin về nguyên liệu, 
                ngày sản xuất và hạn sử dụng. Chúng tôi cam kết minh bạch trong toàn bộ quy trình sản xuất.
              </p>
            </div>

            <div className={styles.infoBox}>
              <Shield size={24} />
              <div>
                <strong>Giấy chứng nhận:</strong>
                <p>E-Sweetie Bake đã được cấp giấy chứng nhận đủ điều kiện vệ sinh an toàn thực phẩm và tuân thủ 
                các quy định của Bộ Y tế về an toàn thực phẩm.</p>
              </div>
            </div>
          </section>

          {/* Payment Policy */}
          <section
            id="payment"
            ref={el => sectionRefs.current['payment'] = el}
            className={`${styles.policySection} ${visibleSections.includes('payment') ? styles.visible : ''}`}
          >
            <div className={styles.sectionHeader}>
              <ShoppingCart size={32} />
              <h2>Chính sách bán hàng & Thanh toán</h2>
            </div>

            <div className={styles.subsection}>
              <h3>1. Phương thức thanh toán</h3>
              <p>Chúng tôi hỗ trợ các hình thức thanh toán sau:</p>
              <ul>
                <li><strong>Thanh toán khi nhận hàng (COD):</strong> Thanh toán bằng tiền mặt khi nhận hàng</li>
                <li><strong>Chuyển khoản ngân hàng:</strong> Chuyển khoản trước qua tài khoản ngân hàng của công ty</li>
                <li><strong>Ví điện tử:</strong> Thanh toán qua MoMo, ZaloPay, VNPay (sắp ra mắt)</li>
                <li><strong>Quét mã QR:</strong> Quét mã QR để thanh toán nhanh chóng, tiện lợi</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>2. Quy định về giá</h3>
              <ul>
                <li>Giá sản phẩm đã bao gồm VAT (nếu có)</li>
                <li>Phí vận chuyển được tính riêng tùy theo khu vực giao hàng</li>
                <li>Giá có thể thay đổi theo chương trình khuyến mãi mà không cần báo trước</li>
                <li>Mã giảm giá có thể có điều kiện áp dụng và thời hạn sử dụng</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>3. Quy trình đặt hàng</h3>
              <ol className={styles.stepList}>
                <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                <li>Điền đầy đủ thông tin giao hàng (tên, số điện thoại, địa chỉ)</li>
                <li>Chọn phương thức thanh toán phù hợp</li>
                <li>Xác nhận đơn hàng và hoàn tất thanh toán (nếu thanh toán trước)</li>
                <li>Nhận xác nhận đơn hàng qua email/SMS</li>
                <li>Theo dõi tình trạng đơn hàng qua hệ thống</li>
              </ol>
            </div>

            <div className={styles.subsection}>
              <h3>4. Chính sách giao hàng</h3>
              <ul>
                <li><strong>Thời gian giao hàng:</strong> 2-4 giờ trong nội thành Hà Nội (trong giờ hành chính)</li>
                <li><strong>Phí giao hàng:</strong> Miễn phí cho đơn hàng từ 300.000đ trong bán kính 5km</li>
                <li><strong>Đặt hàng trước:</strong> Có thể đặt trước tối thiểu 1 ngày cho sản phẩm đặc biệt</li>
                <li><strong>Kiểm tra khi nhận:</strong> Vui lòng kiểm tra sản phẩm ngay khi nhận hàng</li>
              </ul>
            </div>
          </section>

          {/* Return Policy */}
          <section
            id="return"
            ref={el => sectionRefs.current['return'] = el}
            className={`${styles.policySection} ${visibleSections.includes('return') ? styles.visible : ''}`}
          >
            <div className={styles.sectionHeader}>
              <RefreshCcw size={32} />
              <h2>Chính sách đổi trả</h2>
            </div>

            <div className={styles.subsection}>
              <h3>1. Điều kiện đổi trả</h3>
              <p>Chúng tôi chấp nhận đổi trả trong các trường hợp sau:</p>
              <ul>
                <li>Sản phẩm bị lỗi do quá trình sản xuất hoặc vận chuyển</li>
                <li>Sản phẩm không đúng với mô tả hoặc đơn hàng đã đặt</li>
                <li>Sản phẩm có dấu hiệu hư hỏng, không đảm bảo chất lượng</li>
                <li>Giao sai sản phẩm hoặc thiếu sản phẩm trong đơn hàng</li>
              </ul>
              
              <div className={styles.warningBox}>
                <strong>Lưu ý:</strong> Do tính chất đặc thù của sản phẩm thực phẩm tươi, chúng tôi không chấp nhận 
                đổi trả trong trường hợp khách hàng đổi ý hoặc không thích sản phẩm.
              </div>
            </div>

            <div className={styles.subsection}>
              <h3>2. Thời gian đổi trả</h3>
              <ul>
                <li>Khách hàng phải thông báo ngay cho E-Sweetie Bake trong vòng <strong>2 giờ</strong> kể từ khi nhận hàng</li>
                <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng</li>
                <li>Cần có hình ảnh/video chứng minh lỗi sản phẩm (nếu có)</li>
                <li>Giữ nguyên bao bì, hóa đơn và các tài liệu đi kèm</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3>3. Quy trình đổi trả</h3>
              <ol className={styles.stepList}>
                <li>Liên hệ hotline: <strong>0858 974 298</strong> hoặc gửi email đến <strong>contact@sweetbakery.com</strong></li>
                <li>Cung cấp mã đơn hàng, hình ảnh sản phẩm và mô tả vấn đề</li>
                <li>Nhân viên xác nhận và hướng dẫn giải quyết</li>
                <li>Đổi sản phẩm mới hoặc hoàn tiền theo thỏa thuận</li>
                <li>Thời gian xử lý: <strong>24-48 giờ</strong> làm việc</li>
              </ol>
            </div>

            <div className={styles.subsection}>
              <h3>4. Phương thức hoàn tiền</h3>
              <ul>
                <li><strong>Thanh toán COD:</strong> Hoàn tiền mặt hoặc chuyển khoản theo yêu cầu</li>
                <li><strong>Chuyển khoản:</strong> Hoàn tiền vào tài khoản đã thanh toán trong 3-5 ngày làm việc</li>
                <li><strong>Ví điện tử:</strong> Hoàn tiền vào ví trong 1-2 ngày làm việc</li>
              </ul>
            </div>

            <div className={styles.infoBox}>
              <RefreshCcw size={24} />
              <div>
                <strong>Cam kết của chúng tôi:</strong>
                <p>
                  E-Sweetie Bake luôn đặt sự hài lòng của khách hàng lên hàng đầu. Mọi khiếu nại sẽ được xử lý 
                  nhanh chóng, công bằng và minh bạch. Chúng tôi cam kết bồi thường 100% nếu lỗi từ phía cửa hàng.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <h3>Bạn có thắc mắc về chính sách?</h3>
          <p>Liên hệ với chúng tôi để được tư vấn và giải đáp chi tiết</p>
          <div className={styles.contactButtons}>
            <a href="tel:+84858974298" className={styles.btnPrimary}>
              Hotline: 0858 974 298
            </a>
            <a href="/contact" className={styles.btnSecondary}>
              Gửi tin nhắn
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Policy;

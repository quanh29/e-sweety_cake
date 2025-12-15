import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronDown, Package, ShoppingCart, Truck, CreditCard, Scroll, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import styles from './FAQ.module.css';

const FAQ = () => {
    const [activeIds, setActiveIds] = useState([]);
    const [visibleItems, setVisibleItems] = useState([]);
    const itemRefs = useRef([]);
    const answerRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.index);
                        setVisibleItems(prev => [...new Set([...prev, index])]);
                    }
                });
            },
            { threshold: 0.2 }
        );

        itemRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            itemRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    // update measured heights for smooth expand/collapse
    useLayoutEffect(() => {
        const ids = Object.keys(answerRefs.current);
        ids.forEach((id) => {
            const el = answerRefs.current[id];
            if (!el) return;
            if (activeIds.includes(id)) {
                // set to scrollHeight to animate open
                el.style.maxHeight = el.scrollHeight + 'px';
                el.style.opacity = '1';
            } else {
                // collapse
                el.style.maxHeight = '0px';
                el.style.opacity = '0';
            }
        });
    }, [activeIds]);

    const toggleQuestion = (id) => {
        setActiveIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((i) => i !== id);
            }
            return [...prev, id];
        });
    };

    const faqCategories = [
        {
            category: 'Sản Phẩm',
            icon: Package,
            questions: [
                {
                    id: 'prod-1',
                    question: 'Bánh có được làm trong ngày không?',
                    answer: 'Có, tất cả sản phẩm của chúng tôi đều được làm mới 100% trong ngày để đảm bảo độ tươi ngon và chất lượng tốt nhất. Chúng tôi cam kết không bán bánh qua đêm.'
                },
                {
                    id: 'prod-2',
                    question: 'Có nhận làm bánh theo yêu cầu không?',
                    answer: 'Có, chúng tôi nhận làm bánh theo yêu cầu với các thiết kế và hương vị tùy chỉnh. Vui lòng liên hệ trước ít nhất 3 ngày để chúng tôi có thể chuẩn bị tốt nhất cho đơn hàng của bạn.'
                },
                {
                    id: 'prod-3',
                    question: 'Bánh có chứa chất bảo quản không?',
                    answer: 'Không, chúng tôi cam kết không sử dụng chất bảo quản trong sản phẩm. Tất cả nguyên liệu đều tự nhiên và tươi mới, đảm bảo an toàn cho sức khỏe.'
                },
                {
                    id: 'prod-4',
                    question: 'Bánh bảo quản được bao lâu?',
                    answer: 'Bánh tươi nên được sử dụng trong vòng 1-2 ngày và bảo quản trong tủ lạnh. Bánh kem nên dùng trong ngày hoặc bảo quản tủ lạnh không quá 24 giờ để giữ được độ tươi ngon và chất lượng tốt nhất.'
                },
                {
                    id: 'prod-5',
                    question: 'Có bánh cho người ăn chay/kiêng đường không?',
                    answer: 'Có, chúng tôi có dòng sản phẩm dành cho người ăn chay và bánh giảm đường. Vui lòng liên hệ trước để chúng tôi tư vấn các lựa chọn phù hợp nhất với nhu cầu của bạn.'
                }
            ]
        },
        {
            category: 'Đặt Hàng',
            icon: ShoppingCart,
            questions: [
                {
                    id: 'order-1',
                    question: 'Thời gian đặt bánh trước bao lâu?',
                    answer: 'Đối với bánh thông thường, vui lòng đặt trước ít nhất 4-6 giờ. Đối với bánh sinh nhật hoặc bánh custom, vui lòng đặt trước 2-3 ngày để chúng tôi có thể chuẩn bị chu đáo nhất.'
                },
                {
                    id: 'order-2',
                    question: 'Làm thế nào để đặt bánh?',
                    answer: 'Bạn có thể đặt bánh trực tiếp trên website, hoặc liên hệ qua hotline, Facebook, Zalo của shop. Đội ngũ tư vấn sẽ hỗ trợ bạn chọn sản phẩm phù hợp và xác nhận đơn hàng.'
                },
                {
                    id: 'order-3',
                    question: 'Có thể hủy hoặc thay đổi đơn hàng không?',
                    answer: 'Bạn có thể hủy hoặc thay đổi đơn hàng trước 4 giờ so với thời gian giao hàng. Sau thời gian này, đơn hàng đã được chuẩn bị nên không thể hủy. Vui lòng liên hệ ngay khi cần thay đổi.'
                },
                {
                    id: 'order-4',
                    question: 'Có đặt hàng số lượng lớn được không?',
                    answer: 'Có, chúng tôi nhận đơn hàng số lượng lớn cho các sự kiện, tiệc tùng, công ty. Vui lòng liên hệ trước ít nhất 5-7 ngày để được tư vấn và báo giá ưu đãi.'
                }
            ]
        },
        {
            category: 'Giao Hàng',
            icon: Truck,
            questions: [
                {
                    id: 'ship-1',
                    question: 'Phí giao hàng là bao nhiêu?',
                    answer: 'Phí giao hàng phụ thuộc vào khoảng cách và giá trị đơn hàng. Miễn phí ship cho đơn hàng từ 300.000đ trong bán kính 5km. Đơn hàng dưới 300.000đ hoặc xa hơn sẽ có phí từ 15.000đ - 30.000đ tùy khu vực.'
                },
                {
                    id: 'ship-2',
                    question: 'Thời gian giao hàng khoảng bao lâu?',
                    answer: 'Thời gian giao hàng trong nội thành từ 30-60 phút, ngoại thành từ 60-90 phút tùy khoảng cách. Chúng tôi có dịch vụ giao hàng nhanh trong 30 phút với phí cao hơn.'
                },
                {
                    id: 'ship-3',
                    question: 'Giao hàng ở khu vực nào?',
                    answer: 'Chúng tôi giao hàng trong toàn thành phố và các quận lân cận. Đối với khu vực xa, vui lòng liên hệ trước để xác nhận khả năng giao hàng và phí ship.'
                },
                {
                    id: 'ship-4',
                    question: 'Có thể chọn giờ giao hàng cụ thể không?',
                    answer: 'Có, bạn có thể chọn khung giờ giao hàng mong muốn khi đặt hàng. Chúng tôi sẽ cố gắng giao đúng giờ bạn yêu cầu, trong trường hợp đặc biệt sẽ liên hệ trước với bạn.'
                }
            ]
        },
        {
            category: 'Thanh Toán',
            icon: CreditCard,
            questions: [
                {
                    id: 'pay-1',
                    question: 'Có những hình thức thanh toán nào?',
                    answer: 'Hiện tại chúng tôi hỗ trợ thanh toán COD (tiền mặt khi nhận hàng). Đội ngũ giao hàng sẽ thu tiền trực tiếp khi bàn giao sản phẩm cho bạn.'
                },
                {
                    id: 'pay-2',
                    question: 'Có cần đặt cọc trước không?',
                    answer: 'Đối với đơn hàng thông thường không cần đặt cọc. Tuy nhiên, với đơn hàng custom hoặc giá trị cao (trên 1 triệu), chúng tôi yêu cầu đặt cọc 30-50% để đảm bảo cam kết.'
                },
                {
                    id: 'pay-3',
                    question: 'Có xuất hóa đơn VAT không?',
                    answer: 'Có, chúng tôi xuất hóa đơn VAT cho khách hàng có nhu cầu. Vui lòng cung cấp thông tin công ty khi đặt hàng để chúng tôi chuẩn bị hóa đơn kịp thời.'
                }
            ]
        },
        {
            category: 'Chính Sách',
            icon: Scroll,
            questions: [
                {
                    id: 'policy-1',
                    question: 'Chính sách đổi trả như thế nào?',
                    answer: 'Chúng tôi chấp nhận đổi trả nếu sản phẩm bị lỗi từ nhà sản xuất, không đúng như đơn đặt hàng, hoặc bị hư hỏng trong quá trình vận chuyển. Vui lòng chụp ảnh và liên hệ trong vòng 2 giờ sau khi nhận hàng.'
                },
                {
                    id: 'policy-2',
                    question: 'Nếu bánh bị hỏng khi giao thì sao?',
                    answer: 'Nếu bánh bị hư hỏng trong quá trình giao hàng, chúng tôi sẽ làm lại hoặc hoàn tiền 100%. Vui lòng chụp ảnh trước khi nhận hàng và liên hệ ngay với chúng tôi.'
                },
                {
                    id: 'policy-3',
                    question: 'Có chương trình khách hàng thân thiết không?',
                    answer: 'Có, chúng tôi có chương trình tích điểm và ưu đãi cho khách hàng thân thiết. Mỗi đơn hàng bạn sẽ được tích điểm và nhận voucher giảm giá cho lần mua tiếp theo.'
                }
            ]
        }
    ];

    let itemIndex = 0;

    return (
        <div className={styles.faqPage}>
            <PageTitle title="Câu Hỏi Thường Gặp" />
            <Header />
            
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1>Câu Hỏi Thường Gặp</h1>
                    <p>Giải đáp nhanh các thắc mắc của bạn</p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className={styles.faqContent}>
                <div className={styles.container}>
                    <div className={styles.introText}>
                        <p>Chúng tôi đã tổng hợp những câu hỏi thường gặp nhất để giúp bạn có trải nghiệm mua sắm thuận tiện và dễ dàng hơn.</p>
                    </div>

                    {faqCategories.map((category, catIndex) => (
                        <div key={catIndex} className={styles.categorySection}>
                            <div className={styles.categoryHeader}>
                                <category.icon className={styles.categoryIcon} size={28} />
                                <h2>{category.category}</h2>
                            </div>
                            
                            <div className={styles.questionsList}>
                                {category.questions.map((item) => {
                                    const currentIndex = itemIndex++;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`${styles.faqItem} ${visibleItems.includes(currentIndex) ? styles.visible : ''} ${activeIds.includes(item.id) ? styles.active : ''}`}
                                            ref={(el) => (itemRefs.current[currentIndex] = el)}
                                            data-index={currentIndex}
                                            onClick={() => toggleQuestion(item.id)}
                                        >
                                            <div className={styles.questionHeader}>
                                                <h3>{item.question}</h3>
                                                <ChevronDown className={styles.chevron} size={24} />
                                            </div>
                                            <div className={styles.answerWrapper}>
                                                <div className={styles.answer}>
                                                    <p>{item.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Contact CTA */}
                    <div className={styles.ctaSection}>
                        <div className={styles.ctaBox}>
                            <Phone className={styles.ctaIcon} size={48} />
                            <h2>Bạn vẫn còn thắc mắc?</h2>
                            <p>Đừng ngại liên hệ với chúng tôi. Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn!</p>
                            <Link to="/contact" className={styles.ctaButton}>
                                Liên hệ ngay với chúng tôi
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQ;

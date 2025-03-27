import React from 'react';
import Slider from 'react-slick';
import styles from '../css/carousel.module.css'; // برای استایل‌های سفارشی

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true, // برای محو شدن در تغییر اسلایدها
    cssEase: 'linear',
  };

  return (
    <div className={styles.carouselWrapper}>
      <Slider {...settings}>
        <div className={styles.slide}>
          <img src="/img/re.jpg" alt="Slide 1" />
        </div>
        <div className={styles.slide}>
          <img src="/images/re.jpg" alt="Slide 2" />
        </div>
        <div className={styles.slide}>
          <img src="/images/re.jpg" alt="Slide 3" />
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;

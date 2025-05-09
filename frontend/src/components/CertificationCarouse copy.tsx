import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

const certifications = [
  {
    id: 1,
    name: "React Developer",
    description:
      "Certified React Developer with expertise in modern UI development.",
    image: "https://picsum.photos/400/300?random=9",
  },
  {
    id: 2,
    name: "Fullstack Engineer",
    description: "Expert in building scalable full-stack applications.",
    image: "https://picsum.photos/400/300?random=10",
  },
  {
    id: 3,
    name: "Mobile Developer",
    description: "Experience in developing cross-platform mobile apps.",
    image: "https://picsum.photos/400/300?random=11",
  },
  {
    id: 4,
    name: "Backend Specialist",
    description: "Specialized in designing RESTful APIs and databases.",
    image: "https://picsum.photos/400/300?random=12",
  },
];

const CertificationCard = () => {
  return (
    <section className="container mx-auto py-16 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-yellow-400 mb-8"
      >
        Certifications
      </motion.h2>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full max-w-5xl"
      >
        {certifications.map((cert) => (
          <SwiperSlide key={cert.id} className="flex justify-center">
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 15px rgba(255, 215, 0, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: cert.id * 0.2 }}
              className="card bg-gray-800 text-white shadow-xl w-80 p-6 text-center rounded-lg border border-yellow-500"
            >
              <div className="relative">
                <motion.img
                  src={cert.image}
                  alt={cert.name}
                  className="w-40 h-40 mx-auto mb-4 rounded-lg shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                />
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-yellow-500 rounded-full blur-3xl opacity-40"></div>
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                {cert.name}
              </h3>
              <p className="text-gray-300">{cert.description}</p>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#FDE047",
                  color: "#1E293B",
                }}
                transition={{ duration: 0.2 }}
                className="mt-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-md font-bold shadow-lg hover:bg-yellow-400"
              >
                View More
              </motion.button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CertificationCard;

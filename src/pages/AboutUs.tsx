import React from 'react';
import { Layout } from '../components/Layout';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Radio, TrendingUp, Headphones, Globe, Star, Award, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutUs = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set document title
    document.title = "About Us | Urban Greece";
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black bg-opacity-90"></div>
        <div className="relative z-20 container mx-auto px-4 py-24 md:py-32 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
              {t('hero.title', 'The Beat Behind Greek Urban Music')}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto"
          >
            {t('hero.subtitle', 'A collective of artists, producers, reporters, and visionaries defining the future of Greek urban culture.')}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-dark-card py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">{t('about.ourStory.title', 'Our Story')}</h2>
            <div className="prose prose-lg prose-invert mx-auto">
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('about.ourStory.p1', 'Urban Greece was born from a shared vision: to elevate Greek urban music to its rightful place at the center of the cultural conversation. We\'re not just observers – we\'re active participants in the scene\'s evolution and growth.')}
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mt-4">
                {t('about.ourStory.p2', 'Founded in 2021, our collective brings together the brightest minds and most innovative creators in the Greek music landscape. From our headquarters in Athens, we\'ve built a movement that transcends traditional industry boundaries, constantly pushing the envelope of what Greek urban music can be.')}
              </p>
            </div>
          </motion.div>

          {/* Who We Are Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
          >
            <motion.div variants={fadeInUp} className="bg-gray-900/50 p-8 rounded-xl backdrop-blur">
              <h3 className="text-2xl font-bold text-white mb-4">{t('about.whoWeAre.title', 'Who We Are')}</h3>
              <p className="text-gray-300 mb-6">
                {t('about.whoWeAre.p1', 'Urban Greece is more than a platform – we\'re a collective of passionate individuals dedicated to the Greek urban music scene. Our team consists of award-winning producers, influential artists, seasoned music journalists, digital strategists, and marketing visionaries who live and breathe the culture.')}
              </p>
              <p className="text-gray-300">
                {t('about.whoWeAre.p2', 'Together, we form a dynamic powerhouse that\'s reshaping the narrative around Greek urban music. We don\'t just follow trends – we help create them, leveraging our deep industry connections and intimate knowledge of the scene.')}
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 rounded-xl backdrop-blur">
              <h3 className="text-2xl font-bold text-white mb-4">{t('about.ourMission.title', 'Our Mission')}</h3>
              <p className="text-gray-300 mb-6">
                {t('about.ourMission.p1', 'We\'re on a mission to elevate Greek urban music to unprecedented heights. In a landscape dominated by traditional pop and folk genres, we\'re challenging the status quo and championing a movement that represents the authentic voice of modern Greece.')}
              </p>
              <p className="text-gray-300">
                {t('about.ourMission.p2', 'Through strategic partnerships, innovative marketing, and a deep commitment to artistic integrity, we\'re creating a new paradigm where Greek urban music doesn\'t just compete with other genres – it redefines the entire playing field. Our vision is clear: to establish Greek urban music as a global cultural force.')}
              </p>
            </motion.div>
          </motion.div>

          {/* What We Do Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-12">{t('about.whatWeDo.title', 'What We Do')}</h2>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <motion.div variants={fadeInUp} className="bg-gray-900/30 p-6 rounded-lg backdrop-blur">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-600/30 p-3 rounded-full">
                    <Music className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('about.artistDevelopment.title', 'Artist Development')}</h3>
                <p className="text-gray-400">
                  {t('about.artistDevelopment.text', 'We identify and nurture emerging talent, providing them with the resources, guidance, and platform they need to thrive.')}
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-gray-900/30 p-6 rounded-lg backdrop-blur">
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-600/30 p-3 rounded-full">
                    <Radio className="h-8 w-8 text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('about.musicJournalism.title', 'Music Journalism')}</h3>
                <p className="text-gray-400">
                  {t('about.musicJournalism.text', 'Our team of experienced journalists provides insightful coverage, interviews, and analysis of the Greek urban music landscape.')}
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-gray-900/30 p-6 rounded-lg backdrop-blur">
                <div className="flex justify-center mb-4">
                  <div className="bg-pink-600/30 p-3 rounded-full">
                    <TrendingUp className="h-8 w-8 text-pink-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('about.industryStrategy.title', 'Industry Strategy')}</h3>
                <p className="text-gray-400">
                  {t('about.industryStrategy.text', 'We develop and execute innovative marketing strategies that amplify the reach and impact of Greek urban artists.')}
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-gray-900/30 p-6 rounded-lg backdrop-blur">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-600/30 p-3 rounded-full">
                    <Globe className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('about.culturalExpansion.title', 'Cultural Expansion')}</h3>
                <p className="text-gray-400">
                  {t('about.culturalExpansion.text', 'We forge international connections to bring Greek urban music to global audiences and create cross-cultural collaborations.')}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Our Impact Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 md:p-12 rounded-2xl backdrop-blur mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('about.ourImpact.title', 'Our Impact')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">500+</div>
                <p className="text-gray-300">{t('about.artistsSupported', 'Artists Supported')}</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 mb-2">1.2M+</div>
                <p className="text-gray-300">{t('about.monthlyListeners', 'Monthly Listeners')}</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 mb-2">15+</div>
                <p className="text-gray-300">{t('about.industryAwards', 'Industry Awards')}</p>
              </div>
            </div>
            
            <div className="mt-12">
              <p className="text-gray-300 text-center max-w-3xl mx-auto">
                {t('about.impact.text', 'Since our inception, we\'ve helped propel multiple artists to national prominence, secured major label deals, and facilitated international collaborations that have expanded the footprint of Greek urban music across Europe and beyond.')}
              </p>
            </div>
          </motion.div>

          {/* Team Values */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('about.ourValues.title', 'Our Values')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/40 p-6 rounded-lg backdrop-blur border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-400" />
                  {t('about.innovation.title', 'Innovation')}
                </h3>
                <p className="text-gray-400">
                  {t('about.innovation.text', 'We constantly push boundaries and explore new approaches to elevate Greek urban music.')}
                </p>
              </div>
              
              <div className="bg-gray-900/40 p-6 rounded-lg backdrop-blur border-l-4 border-indigo-500">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-400" />
                  {t('about.authenticity.title', 'Authenticity')}
                </h3>
                <p className="text-gray-400">
                  {t('about.authenticity.text', 'We champion genuine expressions of Greek urban culture and music in all its forms.')}
                </p>
              </div>
              
              <div className="bg-gray-900/40 p-6 rounded-lg backdrop-blur border-l-4 border-pink-500">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-pink-400" />
                  Excellence
                </h3>
                <p className="text-gray-400">
                  We maintain the highest standards in everything we do, from content creation to artist development.
                </p>
              </div>
              
              <div className="bg-gray-900/40 p-6 rounded-lg backdrop-blur border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Headphones className="h-5 w-5 mr-2 text-blue-400" />
                  Community
                </h3>
                <p className="text-gray-400">
                  We foster a supportive ecosystem that connects artists, fans, and industry professionals.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Join Our Movement */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-12 rounded-xl"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Movement</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Whether you're an artist, industry professional, or simply a fan of Greek urban music, 
              there's a place for you in our community. Together, we're redefining what's possible for Greek urban culture.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:contact@urbangreece.com" 
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get In Touch
              </a>
              <a 
                href="/contact" 
                className="inline-block px-8 py-3 bg-transparent border border-purple-500 text-white font-medium rounded-lg hover:bg-purple-900/20 transition-all"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs; 
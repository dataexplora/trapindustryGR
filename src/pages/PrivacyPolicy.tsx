import React from 'react';
import { Layout } from '../components/Layout';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set document title
    document.title = "Privacy Policy | Urban Greece";
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-dark-card rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-8 relative">
            <h1 className="text-3xl font-bold text-white">{t('privacy.title', 'Privacy Policy')}</h1>
            <p className="text-gray-300 mt-2">{t('privacy.lastUpdated', 'Last Updated: June 2023')}</p>
          </div>
          
          {/* Content */}
          <ScrollArea className="p-6 md:p-8 text-gray-300">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.intro.title', '1. Introduction')}</h2>
                <p className="mb-3">
                  {t('privacy.intro.p1', 'Welcome to Urban Greece. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.')}
                </p>
                <p>
                  {t('privacy.intro.p2', 'Our platform is designed to provide information about Greek urban music artists, songs, and related content. This policy applies to all users of our services.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.data.title', '2. Data We Collect')}</h2>
                <p className="mb-3">{t('privacy.data.intro', 'We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>{t('privacy.data.identity', 'Identity Data may include your first name, last name, username or similar identifier.')}</strong></li>
                  <li><strong>{t('privacy.data.contact', 'Contact Data may include your email address and telephone numbers.')}</strong></li>
                  <li><strong>{t('privacy.data.technical', 'Technical Data may include your internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.')}</strong></li>
                  <li><strong>{t('privacy.data.usage', 'Usage Data may include information about how you use our website and services.')}</strong></li>
                  <li><strong>{t('privacy.data.marketing', 'Marketing and Communications Data includes your preferences in receiving marketing from us and our third parties and your communication preferences.')}</strong></li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.use.title', '3. How We Use Your Data')}</h2>
                <p className="mb-3">{t('privacy.use.intro', 'We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t('privacy.use.register', 'To register you as a new customer or user.')}</li>
                  <li>{t('privacy.use.content', 'To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.')}</li>
                  <li>{t('privacy.use.analytics', 'To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.')}</li>
                  <li>{t('privacy.use.recommendations', 'To make suggestions and recommendations to you about goods or services that may be of interest to you.')}</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.sharing.title', '4. Data Sharing and Third Parties')}</h2>
                <p className="mb-3">
                  {t('privacy.sharing.intro', 'We may share your personal data with the parties set out below for the purposes outlined in this privacy policy:')}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t('privacy.sharing.providers', 'Service providers who provide IT and system administration services.')}</li>
                  <li>{t('privacy.sharing.advisers', 'Professional advisers including lawyers, bankers, auditors and insurers.')}</li>
                  <li>{t('privacy.sharing.government', 'Government bodies that require us to report processing activities.')}</li>
                  <li>{t('privacy.sharing.thirdParties', 'Third parties to whom we may choose to sell, transfer or merge parts of our business or our assets.')}</li>
                </ul>
                <p className="mt-3">
                  {t('privacy.sharing.note', 'We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.cookies.title', '5. Cookies and Tracking Technologies')}</h2>
                <p className="mb-3">
                  {t('privacy.cookies.p1', 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.')}
                </p>
                <p>
                  {t('privacy.cookies.p2', 'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.security.title', '6. Data Security')}</h2>
                <p>
                  {t('privacy.security.text', 'We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.rights.title', '7. Your Legal Rights')}</h2>
                <p className="mb-3">{t('privacy.rights.intro', 'Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>{t('privacy.rights.access', 'Request access')}</strong> {t('to your personal data.')}</li>
                  <li><strong>{t('privacy.rights.correction', 'Request correction')}</strong> {t('of your personal data.')}</li>
                  <li><strong>{t('privacy.rights.erasure', 'Request erasure')}</strong> {t('of your personal data.')}</li>
                  <li><strong>{t('privacy.rights.objection', 'Object to processing')}</strong> {t('of your personal data.')}</li>
                  <li><strong>{t('privacy.rights.restriction', 'Request restriction of processing')}</strong> {t('your personal data.')}</li>
                  <li><strong>{t('privacy.rights.transfer', 'Request transfer')}</strong> {t('of your personal data.')}</li>
                  <li><strong>{t('privacy.rights.withdraw', 'Right to withdraw consent.')}</strong></li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.transfers.title', '8. International Transfers')}</h2>
                <p>
                  {t('privacy.transfers.text', 'We may transfer your personal data to countries outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by implementing safeguards.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.changes.title', '9. Changes to This Privacy Policy')}</h2>
                <p>
                  {t('privacy.changes.text', 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.')}
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.contact.title', '10. Contact Us')}</h2>
                <p>
                  {t('privacy.contact.text', 'If you have any questions about this Privacy Policy, please contact us at:')}
                </p>
                <div className="bg-gray-800 rounded-lg p-4 mt-3">
                  <p className="mb-1"><strong>{t('privacy.contact.email', 'Email: contact@urbangreece.com')}</strong></p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy; 
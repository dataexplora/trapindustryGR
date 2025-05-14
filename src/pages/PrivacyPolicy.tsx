import React from 'react';
import { Layout } from '../components/Layout';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy = () => {
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
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-300 mt-2">Last Updated: June 2023</p>
          </div>
          
          {/* Content */}
          <ScrollArea className="p-6 md:p-8 text-gray-300">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
                <p className="mb-3">
                  Welcome to Urban Greece. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data when you visit our website and 
                  tell you about your privacy rights and how the law protects you.
                </p>
                <p>
                  Our platform is designed to provide information about Greek urban music artists, songs, and related content. 
                  This policy applies to all users of our services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Data We Collect</h2>
                <p className="mb-3">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Identity Data</strong> may include your first name, last name, username or similar identifier.</li>
                  <li><strong>Contact Data</strong> may include your email address and telephone numbers.</li>
                  <li><strong>Technical Data</strong> may include your internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                  <li><strong>Usage Data</strong> may include information about how you use our website and services.</li>
                  <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
                <p className="mb-3">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To register you as a new customer or user.</li>
                  <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.</li>
                  <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.</li>
                  <li>To make suggestions and recommendations to you about goods or services that may be of interest to you.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h2>
                <p className="mb-3">
                  We may share your personal data with the parties set out below for the purposes outlined in this privacy policy:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Service providers who provide IT and system administration services.</li>
                  <li>Professional advisers including lawyers, bankers, auditors and insurers.</li>
                  <li>Government bodies that require us to report processing activities.</li>
                  <li>Third parties to whom we may choose to sell, transfer or merge parts of our business or our assets.</li>
                </ul>
                <p className="mt-3">
                  We require all third parties to respect the security of your personal data and to treat it in accordance with the law. 
                  We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="mb-3">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
                  Cookies are files with small amount of data which may include an anonymous unique identifier. 
                  Cookies are sent to your browser from a website and stored on your device.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Data Security</h2>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
                  In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. 
                  They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Your Legal Rights</h2>
                <p className="mb-3">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Request access</strong> to your personal data.</li>
                  <li><strong>Request correction</strong> of your personal data.</li>
                  <li><strong>Request erasure</strong> of your personal data.</li>
                  <li><strong>Object to processing</strong> of your personal data.</li>
                  <li><strong>Request restriction of processing</strong> your personal data.</li>
                  <li><strong>Request transfer</strong> of your personal data.</li>
                  <li><strong>Right to withdraw consent</strong>.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">8. International Transfers</h2>
                <p>
                  We may transfer your personal data to countries outside the European Economic Area (EEA). 
                  Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by implementing safeguards.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-gray-800 rounded-lg p-4 mt-3">
                  <p className="mb-1"><strong>Email:</strong> contact@urbangreece.com</p>
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
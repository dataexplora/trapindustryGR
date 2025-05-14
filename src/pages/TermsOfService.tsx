import React from 'react';
import { Layout } from '../components/Layout';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const TermsOfService = () => {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set document title
    document.title = "Terms of Service | Urban Greece";
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-dark-card rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-300 mt-2">Last Updated: June 2023</p>
          </div>
          
          {/* Content */}
          <ScrollArea className="p-6 md:p-8 text-gray-300">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
                <p className="mb-3">
                  Welcome to Urban Greece. These Terms of Service ("Terms") govern your access to and use of the Urban Greece website, 
                  services, and applications (collectively, the "Service"). Please read these Terms carefully before using our Service.
                </p>
                <p>
                  By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, 
                  you may not access or use the Service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Definitions</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>"Service"</strong> refers to the Urban Greece website, platform, and all content, services, and products available at or through the website.</li>
                  <li><strong>"Urban Greece"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, and <strong>"our"</strong> refer to the operators of Urban Greece.</li>
                  <li><strong>"You"</strong> and <strong>"your"</strong> refer to the individual or entity using our Service.</li>
                  <li><strong>"Content"</strong> refers to all materials found on the Service, including text, images, audio, video, and interactive features.</li>
                  <li><strong>"User Content"</strong> refers to content submitted by users, including comments, feedback, and suggestions.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration</h2>
                <p className="mb-3">
                  Some features of our Service may require you to register for an account. When you register, you agree to provide accurate, 
                  current, and complete information about yourself as prompted by the registration form. You are responsible for maintaining 
                  the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p>
                  You agree to immediately notify Urban Greece of any unauthorized use of your account or any other breach of security. 
                  Urban Greece will not be liable for any loss or damage arising from your failure to protect your account information.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
                <p className="mb-3">You agree not to use the Service to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Violate any applicable laws or regulations.</li>
                  <li>Infringe the intellectual property rights of others.</li>
                  <li>Transmit viruses, malware, or other harmful code.</li>
                  <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                  <li>Collect or store personal data about other users without their consent.</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.</li>
                  <li>Post or transmit any content that is unlawful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Intellectual Property</h2>
                <p className="mb-3">
                  The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive 
                  property of Urban Greece and its licensors. The Service is protected by copyright, trademark, and other laws of both Greece and foreign countries.
                </p>
                <p className="mb-3">
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Urban Greece.
                </p>
                <p>
                  Urban Greece respects the intellectual property rights of others and expects users of the Service to do the same. 
                  We will respond to notices of alleged copyright infringement that comply with applicable law.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. User Content</h2>
                <p className="mb-3">
                  Our Service may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, 
                  or other material ("User Content"). You are responsible for the User Content that you post to the Service, including its legality, 
                  reliability, and appropriateness.
                </p>
                <p className="mb-3">
                  By posting User Content to the Service, you grant Urban Greece a worldwide, non-exclusive, royalty-free license (with the right to sublicense) 
                  to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any and all media or distribution 
                  methods now known or later developed.
                </p>
                <p>
                  You represent and warrant that: (i) the User Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms, 
                  and (ii) the posting of your User Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, 
                  or any other rights of any person.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Third-Party Websites and Content</h2>
                <p className="mb-3">
                  Our Service may contain links to third-party websites or services that are not owned or controlled by Urban Greece. 
                  Urban Greece has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </p>
                <p>
                  You acknowledge and agree that Urban Greece shall not be responsible or liable, directly or indirectly, for any damage or loss 
                  caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available 
                  on or through any such websites or services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">8. Termination</h2>
                <p className="mb-3">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
                  including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
                  you may simply discontinue using the Service or contact us to request account deletion.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                <p className="mb-3">
                  In no event shall Urban Greece, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
                  intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your access to or use of or inability to access or use the Service;</li>
                  <li>Any conduct or content of any third party on the Service;</li>
                  <li>Any content obtained from the Service; and</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">10. Disclaimer</h2>
                <p className="mb-3">
                  Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. 
                  The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, 
                  implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
                </p>
                <p>
                  Urban Greece, its subsidiaries, affiliates, and licensors do not warrant that: (a) the Service will function uninterrupted, 
                  secure, or available at any particular time or location; (b) any errors or defects will be corrected; (c) the Service is free of 
                  viruses or other harmful components; or (d) the results of using the Service will meet your requirements.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of Greece, without regard to its conflict of law provisions. 
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these 
                  Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">12. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
                  we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
                  will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, 
                  you agree to be bound by the revised terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">13. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at:
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

export default TermsOfService; 
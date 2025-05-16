import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the translations
type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// All translations for the site
const translations: Translations = {
  en: {
    // Hero section
    'hero.title': 'The Beat Behind Greek Urban Music',
    'hero.subtitle': 'A collective of artists, producers, reporters, and visionaries defining the future of Greek urban culture.',

    //Footer section
    'footer.p1': 'Your premier destination for discovering the vibrant world of Greek urban music. We showcase the best artists, tracks, and emerging talents in the Greek music scene.',
    'footer.about': 'Urban Greece is the premier platform dedicated to showcasing the vibrant world of Greek urban music. Since 2021, we\'ve been connecting artists, fans, and industry professionals through our commitment to authenticity and innovation.',
    'footer.copyright': '© {0} Urban Greece. All rights reserved. Celebrating and elevating Greek urban music culture.',
    
    // Discover page
    'discover.title': 'Discover Greek Urban Music',
    'discover.subtitle': 'Explore the latest tracks, trending artists, and influential releases shaping Greek urban culture',
    'discover.filter.emerging': 'New Talents',
    'discover.filter.rising': 'Rising Stars',
    'discover.filter.all': 'All Artists',
    'discover.filter.listeners': 'Monthly Listeners',
    'discover.loading': 'Loading artists...',
    'discover.error': 'Error loading artists',
    'discover.retry': 'Retry',
    'discover.noResults': 'No results found',
    'discover.showAll': 'Show All Artists',
    'discover.stats': 'Showing {0} of {1} artists',
    'discover.seo.title': 'Emerging Artists 2023 | Newcomers Greece | Rising Talents',
    'discover.seo.description': 'Discover the top {0} emerging artists in the Greek urban music scene. New talents in trap and hip hop, with listener statistics and rankings. The most up-to-date list of new Greek artists.',
    'discover.seo.section': 'Emerging Artists',
    
    // About section
    'about.ourStory.title': 'Our Story',
    'about.ourStory.p1': 'Urban Greece was born from a shared vision: to elevate Greek urban music to its rightful place at the center of the cultural conversation. We\'re not just observers – we\'re active participants in the scene\'s evolution and growth.',
    'about.ourStory.p2': 'Founded in 2021, our collective brings together the brightest minds and most innovative creators in the Greek music landscape. From our headquarters in Athens, we\'ve built a movement that transcends traditional industry boundaries, constantly pushing the envelope of what Greek urban music can be.',
    
    // Who We Are
    'about.whoWeAre.title': 'Who We Are',
    'about.whoWeAre.p1': 'Urban Greece is more than a platform – we\'re a collective of passionate individuals dedicated to the Greek urban music scene. Our team consists of award-winning producers, influential artists, seasoned music journalists, digital strategists, and marketing visionaries who live and breathe the culture.',
    'about.whoWeAre.p2': 'Together, we form a dynamic powerhouse that\'s reshaping the narrative around Greek urban music. We don\'t just follow trends – we help create them, leveraging our deep industry connections and intimate knowledge of the scene.',
    
    // Our Mission
    'about.ourMission.title': 'Our Mission',
    'about.ourMission.p1': 'We\'re on a mission to elevate Greek urban music to unprecedented heights. In a landscape dominated by traditional pop and folk genres, we\'re challenging the status quo and championing a movement that represents the authentic voice of modern Greece.',
    'about.ourMission.p2': 'Through strategic partnerships, innovative marketing, and a deep commitment to artistic integrity, we\'re creating a new paradigm where Greek urban music doesn\'t just compete with other genres – it redefines the entire playing field. Our vision is clear: to establish Greek urban music as a global cultural force.',
    
    // What We Do
    'about.whatWeDo.title': 'What We Do',
    'about.artistDevelopment.title': 'Artist Development',
    'about.artistDevelopment.text': 'We identify and nurture emerging talent, providing them with the resources, guidance, and platform they need to thrive.',
    'about.musicJournalism.title': 'Music Journalism',
    'about.musicJournalism.text': 'Our team of experienced journalists provides insightful coverage, interviews, and analysis of the Greek urban music landscape.',
    'about.industryStrategy.title': 'Industry Strategy',
    'about.industryStrategy.text': 'We develop and execute innovative marketing strategies that amplify the reach and impact of Greek urban artists.',
    'about.culturalExpansion.title': 'Cultural Expansion',
    'about.culturalExpansion.text': 'We forge international connections to bring Greek urban music to global audiences and create cross-cultural collaborations.',
    
    // Our Impact
    'about.ourImpact.title': 'Our Impact',
    'about.artistsSupported': 'Artists Supported',
    'about.monthlyListeners': 'Monthly Listeners',
    'about.industryAwards': 'Industry Awards',
    'about.impact.text': 'Since our inception, we\'ve helped propel multiple artists to national prominence, secured major label deals, and facilitated international collaborations that have expanded the footprint of Greek urban music across Europe and beyond.',
    
    // Our Values
    'about.ourValues.title': 'Our Values',
    'about.innovation.title': 'Innovation',
    'about.innovation.text': 'We constantly push boundaries and explore new approaches to elevate Greek urban music.',
    'about.authenticity.title': 'Authenticity',
    'about.authenticity.text': 'We champion genuine expressions of Greek urban culture and music in all its forms.',
    
    // Language toggle
    'language.switch': 'Switch to {0}',
    
    // Privacy Policy
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdated': 'Last Updated: June 2023',
    'privacy.intro.title': '1. Introduction',
    'privacy.intro.p1': 'Welcome to Urban Greece. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.',
    'privacy.intro.p2': 'Our platform is designed to provide information about Greek urban music artists, songs, and related content. This policy applies to all users of our services.',
    'privacy.data.title': '2. Data We Collect',
    'privacy.data.intro': 'We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:',
    'privacy.data.identity': 'Identity Data may include your first name, last name, username or similar identifier.',
    'privacy.data.contact': 'Contact Data may include your email address and telephone numbers.',
    'privacy.data.technical': 'Technical Data may include your internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.',
    'privacy.data.usage': 'Usage Data may include information about how you use our website and services.',
    'privacy.data.marketing': 'Marketing and Communications Data includes your preferences in receiving marketing from us and our third parties and your communication preferences.',
    'privacy.use.title': '3. How We Use Your Data',
    'privacy.use.intro': 'We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:',
    'privacy.use.register': 'To register you as a new customer or user.',
    'privacy.use.content': 'To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.',
    'privacy.use.analytics': 'To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.',
    'privacy.use.recommendations': 'To make suggestions and recommendations to you about goods or services that may be of interest to you.',
    'privacy.sharing.title': '4. Data Sharing and Third Parties',
    'privacy.sharing.intro': 'We may share your personal data with the parties set out below for the purposes outlined in this privacy policy:',
    'privacy.sharing.providers': 'Service providers who provide IT and system administration services.',
    'privacy.sharing.advisers': 'Professional advisers including lawyers, bankers, auditors and insurers.',
    'privacy.sharing.government': 'Government bodies that require us to report processing activities.',
    'privacy.sharing.thirdParties': 'Third parties to whom we may choose to sell, transfer or merge parts of our business or our assets.',
    'privacy.sharing.note': 'We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.',
    'privacy.cookies.title': '5. Cookies and Tracking Technologies',
    'privacy.cookies.p1': 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.',
    'privacy.cookies.p2': 'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.',
    'privacy.security.title': '6. Data Security',
    'privacy.security.text': 'We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.',
    'privacy.rights.title': '7. Your Legal Rights',
    'privacy.rights.intro': 'Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:',
    'privacy.rights.access': 'Request access to your personal data.',
    'privacy.rights.correction': 'Request correction of your personal data.',
    'privacy.rights.erasure': 'Request erasure of your personal data.',
    'privacy.rights.objection': 'Object to processing of your personal data.',
    'privacy.rights.restriction': 'Request restriction of processing your personal data.',
    'privacy.rights.transfer': 'Request transfer of your personal data.',
    'privacy.rights.withdraw': 'Right to withdraw consent.',
    'privacy.transfers.title': '8. International Transfers',
    'privacy.transfers.text': 'We may transfer your personal data to countries outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by implementing safeguards.',
    'privacy.changes.title': '9. Changes to This Privacy Policy',
    'privacy.changes.text': 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.',
    'privacy.contact.title': '10. Contact Us',
    'privacy.contact.text': 'If you have any questions about this Privacy Policy, please contact us at:',
    'privacy.contact.email': 'Email: contact@urbangreece.com',
    
    // Terms of Service
    'terms.title': 'Terms of Service',
    'terms.lastUpdated': 'Last Updated: June 2023',
    'terms.intro.title': '1. Introduction',
    'terms.intro.p1': 'Welcome to Urban Greece. These Terms of Service ("Terms") govern your access to and use of the Urban Greece website, services, and applications (collectively, the "Service"). Please read these Terms carefully before using our Service.',
    'terms.intro.p2': 'By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access or use the Service.',
    'terms.definitions.title': '2. Definitions',
    'terms.definitions.service': '"Service" refers to the Urban Greece website, platform, and all content, services, and products available at or through the website.',
    'terms.definitions.we': '"Urban Greece", "we", "us", and "our" refer to the operators of Urban Greece.',
    'terms.definitions.you': '"You" and "your" refer to the individual or entity using our Service.',
    'terms.definitions.content': '"Content" refers to all materials found on the Service, including text, images, audio, video, and interactive features.',
    'terms.definitions.userContent': '"User Content" refers to content submitted by users, including comments, feedback, and suggestions.',
    'terms.account.title': '3. Account Registration',
    'terms.account.p1': 'Some features of our Service may require you to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself as prompted by the registration form. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
    'terms.account.p2': 'You agree to immediately notify Urban Greece of any unauthorized use of your account or any other breach of security. Urban Greece will not be liable for any loss or damage arising from your failure to protect your account information.',
    'terms.usage.title': '4. Acceptable Use',
    'terms.usage.intro': 'You agree not to use the Service to:',
    'terms.usage.laws': 'Violate any applicable laws or regulations.',
    'terms.usage.ip': 'Infringe the intellectual property rights of others.',
    'terms.usage.malware': 'Transmit viruses, malware, or other harmful code.',
    'terms.usage.disrupt': 'Interfere with or disrupt the Service or servers or networks connected to the Service.',
    'terms.usage.data': 'Collect or store personal data about other users without their consent.',
    'terms.usage.impersonate': 'Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.',
    'terms.usage.objectionable': 'Post or transmit any content that is unlawful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.',
    'terms.ip.title': '5. Intellectual Property',
    'terms.ip.p1': 'The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Urban Greece and its licensors. The Service is protected by copyright, trademark, and other laws of both Greece and foreign countries.',
    'terms.ip.p2': 'Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Urban Greece.',
    'terms.ip.p3': 'Urban Greece respects the intellectual property rights of others and expects users of the Service to do the same. We will respond to notices of alleged copyright infringement that comply with applicable law.',
    'terms.userContent.title': '6. User Content',
    'terms.userContent.p1': 'Our Service may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("User Content"). You are responsible for the User Content that you post to the Service, including its legality, reliability, and appropriateness.',
    'terms.userContent.p2': 'By posting User Content to the Service, you grant Urban Greece a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any and all media or distribution methods now known or later developed.',
    'terms.userContent.p3': 'You represent and warrant that: (i) the User Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your User Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.',
    'terms.thirdParty.title': '7. Third-Party Websites and Content',
    'terms.thirdParty.p1': 'Our Service may contain links to third-party websites or services that are not owned or controlled by Urban Greece. Urban Greece has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.',
    'terms.thirdParty.p2': 'You acknowledge and agree that Urban Greece shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.',
    'terms.termination.title': '8. Termination',
    'terms.termination.p1': 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.',
    'terms.termination.p2': 'Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.',
    'terms.liability.title': '9. Limitation of Liability',
    'terms.liability.intro': 'In no event shall Urban Greece, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:',
    'terms.liability.access': 'Your access to or use of or inability to access or use the Service;',
    'terms.liability.conduct': 'Any conduct or content of any third party on the Service;',
    'terms.liability.content': 'Any content obtained from the Service; and',
    'terms.liability.unauthorized': 'Unauthorized access, use, or alteration of your transmissions or content.',
    'terms.disclaimer.title': '10. Disclaimer',
    'terms.disclaimer.p1': 'Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.',
    'terms.disclaimer.p2': 'Urban Greece, its subsidiaries, affiliates, and licensors do not warrant that: (a) the Service will function uninterrupted, secure, or available at any particular time or location; (b) any errors or defects will be corrected; (c) the Service is free of viruses or other harmful components; or (d) the results of using the Service will meet your requirements.',
    'terms.law.title': '11. Governing Law',
    'terms.law.text': 'These Terms shall be governed and construed in accordance with the laws of Greece, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.',
    'terms.changes.title': '12. Changes to Terms',
    'terms.changes.text': 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.',
    'terms.contact.title': '13. Contact Us',
    'terms.contact.text': 'If you have any questions about these Terms, please contact us at:',
    'terms.contact.email': 'Email: contact@urbangreece.com',
  },
  el: {
    // Hero section
    'hero.title': 'Ο παλμός πίσω από την Ελληνική Urban Μουσική',
    'hero.subtitle': 'Μια συλλογική ομάδα καλλιτεχνών, παραγωγών, δημοσιογράφων και οραματιστών που καθορίζει το μέλλον της ελληνικής urban κουλτούρας.',
    
    //Footer section
    'footer.p1': 'Ο πρώτος σας προορισμός για να ανακαλύψετε τον ζωντανό κόσμο της ελληνικής urban μουσικής. Παρουσιάζουμε τους καλύτερους καλλιτέχνες, κομμάτια και ανερχόμενα ταλέντα της ελληνικής μουσικής σκηνής.',
    'footer.about': 'Το Urban Greece είναι η κορυφαία πλατφόρμα αφιερωμένη στην ανάδειξη του ζωντανού κόσμου της ελληνικής urban μουσικής. Από το 2021, συνδέουμε καλλιτέχνες, θαυμαστές και επαγγελματίες της βιομηχανίας μέσω της δέσμευσής μας στην αυθεντικότητα και την καινοτομία.',
    'footer.copyright': '© {0} Urban Greece. Όλα τα δικαιώματα διατηρούνται. Γιορτάζουμε και αναδεικνύουμε την ελληνική urban μουσική κουλτούρα.',
    
    // Discover page
    'discover.title': 'Ανακαλύψτε την Ελληνική Urban Μουσική',
    'discover.subtitle': 'Εξερευνήστε τα τελευταία κομμάτια, τους καλλιτέχνες σε άνοδο και τις επιδραστικές κυκλοφορίες που διαμορφώνουν την ελληνική urban κουλτούρα',
    'discover.filter.emerging': 'Νέα Ταλέντα',
    'discover.filter.rising': 'Ανερχόμενα Αστέρια',
    'discover.filter.all': 'Όλοι οι Καλλιτέχνες',
    'discover.filter.listeners': 'Μηνιαίοι Ακροατές',
    'discover.loading': 'Φόρτωση καλλιτεχνών...',
    'discover.error': 'Σφάλμα φόρτωσης καλλιτεχνών',
    'discover.retry': 'Προσπαθήστε ξανά',
    'discover.noResults': 'Δεν βρέθηκαν αποτελέσματα',
    'discover.showAll': 'Προβολή Όλων των Καλλιτεχνών',
    'discover.stats': 'Εμφάνιση {0} από {1} καλλιτέχνες',
    'discover.seo.title': 'Ανερχόμενοι Καλλιτέχνες 2023 | Newcomers Greece | Ανερχόμενοι Ράπερς',
    'discover.seo.description': 'Ανακαλύψτε τους {0} κορυφαίους ανερχόμενους καλλιτέχνες της ελληνικής urban σκηνής. Νέα ταλέντα στην trap και hip hop, με στατιστικά ακροατών και κατάταξη. Η πιο ενημερωμένη λίστα με νέους Έλληνες καλλιτέχνες.',
    'discover.seo.section': 'Ανερχόμενοι Καλλιτέχνες',
    
    // About section
    'about.ourStory.title': 'Η Ιστορία μας',
    'about.ourStory.p1': 'Το Urban Greece γεννήθηκε από ένα κοινό όραμα: να αναδείξει την ελληνική urban μουσική στη θέση που της αξίζει, στο κέντρο της πολιτιστικής συζήτησης. Δεν είμαστε απλοί παρατηρητές – είμαστε ενεργοί συμμετέχοντες στην εξέλιξη και την ανάπτυξη της σκηνής.',
    'about.ourStory.p2': 'Ιδρύθηκε το 2021, η ομάδα μας φέρνει μαζί τα πιο λαμπρά μυαλά και πιο καινοτόμους δημιουργούς στο ελληνικό μουσικό τοπίο. Από την έδρα μας στην Αθήνα, έχουμε χτίσει ένα κίνημα που ξεπερνά τα παραδοσιακά όρια της βιομηχανίας, διαρκώς διευρύνοντας τα όρια του τι μπορεί να είναι η ελληνική urban μουσική.',
    
    // Who We Are
    'about.whoWeAre.title': 'Ποιοι Είμαστε',
    'about.whoWeAre.p1': 'Το Urban Greece είναι κάτι περισσότερο από μια πλατφόρμα - είμαστε μια συλλογή παθιασμένων ατόμων αφοσιωμένων στην ελληνική urban μουσική σκηνή. Η ομάδα μας αποτελείται από βραβευμένους παραγωγούς, επιδραστικούς καλλιτέχνες, έμπειρους μουσικούς δημοσιογράφους, ψηφιακούς στρατηγούς και οραματιστές του μάρκετινγκ που ζουν και αναπνέουν την κουλτούρα.',
    'about.whoWeAre.p2': 'Μαζί, αποτελούμε μια δυναμική ομάδα που αναδιαμορφώνει την αφήγηση γύρω από την ελληνική urban μουσική. Δεν ακολουθούμε απλά τις τάσεις - βοηθάμε στη δημιουργία τους, αξιοποιώντας τις βαθιές μας συνδέσεις στον κλάδο και την εσωτερική γνώση της σκηνής.',
    
    // Our Mission
    'about.ourMission.title': 'Η Αποστολή μας',
    'about.ourMission.p1': 'Έχουμε ως αποστολή να ανυψώσουμε την ελληνική urban μουσική σε πρωτοφανή ύψη. Σε ένα τοπίο που κυριαρχείται από παραδοσιακά pop και λαϊκά είδη, αμφισβητούμε το status quo και υποστηρίζουμε ένα κίνημα που αντιπροσωπεύει την αυθεντική φωνή της σύγχρονης Ελλάδας.',
    'about.ourMission.p2': 'Μέσω στρατηγικών συνεργασιών, καινοτόμου μάρκετινγκ και βαθιάς δέσμευσης στην καλλιτεχνική ακεραιότητα, δημιουργούμε ένα νέο παράδειγμα όπου η ελληνική urban μουσική δεν ανταγωνίζεται απλώς άλλα είδη - επαναπροσδιορίζει ολόκληρο το πεδίο. Το όραμά μας είναι σαφές: να καθιερώσουμε την ελληνική urban μουσική ως παγκόσμια πολιτιστική δύναμη.',
    
    // What We Do
    'about.whatWeDo.title': 'Τι Κάνουμε',
    'about.artistDevelopment.title': 'Ανάπτυξη Καλλιτεχνών',
    'about.artistDevelopment.text': 'Αναγνωρίζουμε και καλλιεργούμε αναδυόμενα ταλέντα, παρέχοντάς τους τους πόρους, την καθοδήγηση και την πλατφόρμα που χρειάζονται για να ευδοκιμήσουν.',
    'about.musicJournalism.title': 'Μουσική Δημοσιογραφία',
    'about.musicJournalism.text': 'Η ομάδα των έμπειρων δημοσιογράφων μας παρέχει διορατική κάλυψη, συνεντεύξεις και ανάλυση του ελληνικού urban μουσικού τοπίου.',
    'about.industryStrategy.title': 'Στρατηγική Βιομηχανίας',
    'about.industryStrategy.text': 'Αναπτύσσουμε και εκτελούμε καινοτόμες στρατηγικές μάρκετινγκ που ενισχύουν την εμβέλεια και τον αντίκτυπο των Ελλήνων urban καλλιτεχνών.',
    'about.culturalExpansion.title': 'Πολιτιστική Επέκταση',
    'about.culturalExpansion.text': 'Σφυρηλατούμε διεθνείς συνδέσεις για να φέρουμε την ελληνική urban μουσική σε παγκόσμιο κοινό και να δημιουργήσουμε διαπολιτισμικές συνεργασίες.',
    
    // Our Impact
    'about.ourImpact.title': 'Ο Αντίκτυπός μας',
    'about.artistsSupported': 'Υποστηριζόμενοι Καλλιτέχνες',
    'about.monthlyListeners': 'Μηνιαίοι Ακροατές',
    'about.industryAwards': 'Βραβεία Βιομηχανίας',
    'about.impact.text': 'Από την ίδρυσή μας, έχουμε βοηθήσει πολλούς καλλιτέχνες να αποκτήσουν εθνική αναγνώριση, έχουμε εξασφαλίσει συμβόλαια με μεγάλες δισκογραφικές εταιρείες και έχουμε διευκολύνει διεθνείς συνεργασίες που έχουν επεκτείνει το αποτύπωμα της ελληνικής urban μουσικής σε όλη την Ευρώπη και πέρα.',
    
    // Our Values
    'about.ourValues.title': 'Οι Αξίες μας',
    'about.innovation.title': 'Καινοτομία',
    'about.innovation.text': 'Συνεχώς προωθούμε τα όρια και εξερευνούμε νέες προσεγγίσεις για να αναδείξουμε την ελληνική urban μουσική.',
    'about.authenticity.title': 'Αυθεντικότητα',
    'about.authenticity.text': 'Υποστηρίζουμε γνήσιες εκφράσεις της ελληνικής urban κουλτούρας και μουσικής σε όλες τις μορφές της.',
    
    // Language toggle
    'language.switch': 'Αλλαγή σε {0}',
    
    // Privacy Policy
    'privacy.title': 'Πολιτική Απορρήτου',
    'privacy.lastUpdated': 'Τελευταία Ενημέρωση: Ιούνιος 2023',
    'privacy.intro.title': '1. Εισαγωγή',
    'privacy.intro.p1': 'Καλώς ήρθατε στο Urban Greece. Σεβόμαστε το απόρρητό σας και είμαστε αφοσιωμένοι στην προστασία των προσωπικών σας δεδομένων. Αυτή η πολιτική απορρήτου θα σας ενημερώσει για το πώς φροντίζουμε τα προσωπικά σας δεδομένα όταν επισκέπτεστε τον ιστότοπό μας και θα σας ενημερώσει για τα δικαιώματα απορρήτου σας και πώς ο νόμος σας προστατεύει.',
    'privacy.intro.p2': 'Η πλατφόρμα μας έχει σχεδιαστεί για να παρέχει πληροφορίες σχετικά με καλλιτέχνες της ελληνικής urban μουσικής, τραγούδια και σχετικό περιεχόμενο. Αυτή η πολιτική ισχύει για όλους τους χρήστες των υπηρεσιών μας.',
    'privacy.data.title': '2. Δεδομένα που Συλλέγουμε',
    'privacy.data.intro': 'Ενδέχεται να συλλέγουμε, να χρησιμοποιούμε, να αποθηκεύουμε και να μεταφέρουμε διαφορετικά είδη προσωπικών δεδομένων για εσάς, τα οποία έχουμε ομαδοποιήσει ως εξής:',
    'privacy.data.identity': 'Τα Δεδομένα Ταυτότητας μπορεί να περιλαμβάνουν το όνομα, επώνυμο, όνομα χρήστη ή παρόμοιο αναγνωριστικό.',
    'privacy.data.contact': 'Τα Δεδομένα Επικοινωνίας μπορεί να περιλαμβάνουν τη διεύθυνση email και τους αριθμούς τηλεφώνου σας.',
    'privacy.data.technical': 'Τα Τεχνικά Δεδομένα μπορεί να περιλαμβάνουν τη διεύθυνση πρωτοκόλλου διαδικτύου (IP), τον τύπο και την έκδοση του προγράμματος περιήγησης, τη ρύθμιση ζώνης ώρας και την τοποθεσία, τους τύπους και τις εκδόσεις των πρόσθετων του προγράμματος περιήγησης, το λειτουργικό σύστημα και την πλατφόρμα, καθώς και άλλη τεχνολογία στις συσκευές που χρησιμοποιείτε για πρόσβαση σε αυτόν τον ιστότοπο.',
    'privacy.data.usage': 'Τα Δεδομένα Χρήσης μπορεί να περιλαμβάνουν πληροφορίες σχετικά με το πώς χρησιμοποιείτε τον ιστότοπο και τις υπηρεσίες μας.',
    'privacy.data.marketing': 'Δεδομένα Μάρκετινγκ και Επικοινωνιών περιλαμβάνουν τις προτιμήσεις σας στη λήψη μάρκετινγκ από εμάς και τους τρίτους μας και τις προτιμήσεις επικοινωνίας σας.',
    'privacy.use.title': '3. Πώς Χρησιμοποιούμε τα Δεδομένα σας',
    'privacy.use.intro': 'Θα χρησιμοποιήσουμε τα προσωπικά σας δεδομένα μόνο όταν ο νόμος μας το επιτρέπει. Πιο συχνά, θα χρησιμοποιήσουμε τα προσωπικά σας δεδομένα στις ακόλουθες περιπτώσεις:',
    'privacy.use.register': 'Για να σας εγγράψουμε ως νέο πελάτη ή χρήστη.',
    'privacy.use.content': 'Για να παραδώσουμε σχετικό περιεχόμενο ιστοτόπου και διαφημίσεις σε εσάς και να μετρήσουμε ή να κατανοήσουμε την αποτελεσματικότητα των διαφημίσεων που σας παρέχουμε.',
    'privacy.use.analytics': 'Για τη χρήση ανάλυσης δεδομένων για τη βελτίωση του ιστοτόπου μας, των προϊόντων/υπηρεσιών, του μάρκετινγκ, των σχέσεων με τους πελάτες και των εμπειριών.',
    'privacy.use.recommendations': 'Για να κάνουμε προτάσεις και συστάσεις σε εσάς σχετικά με αγαθά ή υπηρεσίες που μπορεί να σας ενδιαφέρουν.',
    'privacy.sharing.title': '4. Κοινοποίηση Δεδομένων και Τρίτα Μέρη',
    'privacy.sharing.intro': 'Ενδέχεται να μοιραστούμε τα προσωπικά σας δεδομένα με τα μέρη που παρατίθενται παρακάτω για τους σκοπούς που περιγράφονται σε αυτήν την πολιτική απορρήτου:',
    'privacy.sharing.providers': 'Πάροχοι υπηρεσιών που παρέχουν υπηρεσίες διαχείρισης πληροφορικής και συστημάτων.',
    'privacy.sharing.advisers': 'Επαγγελματίες σύμβουλοι, συμπεριλαμβανομένων δικηγόρων, τραπεζιτών, ελεγκτών και ασφαλιστών.',
    'privacy.sharing.government': 'Κυβερνητικοί φορείς που απαιτούν από εμάς να αναφέρουμε δραστηριότητες επεξεργασίας.',
    'privacy.sharing.thirdParties': 'Τρίτα μέρη στα οποία μπορεί να επιλέξουμε να πουλήσουμε, να μεταφέρουμε ή να συγχωνεύσουμε μέρη της επιχείρησής μας ή των περιουσιακών στοιχείων μας.',
    'privacy.sharing.note': 'Απαιτούμε από όλα τα τρίτα μέρη να σέβονται την ασφάλεια των προσωπικών σας δεδομένων και να τα χειρίζονται σύμφωνα με το νόμο. Δεν επιτρέπουμε στους παρόχους υπηρεσιών τρίτων μερών να χρησιμοποιούν τα προσωπικά σας δεδομένα για δικούς τους σκοπούς και τους επιτρέπουμε μόνο να επεξεργάζονται τα προσωπικά σας δεδομένα για συγκεκριμένους σκοπούς και σύμφωνα με τις οδηγίες μας.',
    'privacy.cookies.title': '5. Cookies και Τεχνολογίες Παρακολούθησης',
    'privacy.cookies.p1': 'Χρησιμοποιούμε cookies και παρόμοιες τεχνολογίες παρακολούθησης για να παρακολουθούμε τη δραστηριότητα στον ιστότοπό μας και να διατηρούμε συγκεκριμένες πληροφορίες. Τα cookies είναι αρχεία με μικρή ποσότητα δεδομένων που μπορεί να περιλαμβάνουν ένα ανώνυμο μοναδικό αναγνωριστικό. Τα cookies αποστέλλονται στο πρόγραμμα περιήγησής σας από έναν ιστότοπο και αποθηκεύονται στη συσκευή σας.',
    'privacy.cookies.p2': 'Μπορείτε να δώσετε οδηγίες στο πρόγραμμα περιήγησής σας να απορρίψει όλα τα cookies ή να υποδείξει πότε αποστέλλεται ένα cookie. Ωστόσο, εάν δεν αποδέχεστε cookies, ενδέχεται να μην μπορείτε να χρησιμοποιήσετε ορισμένα τμήματα της υπηρεσίας μας.',
    'privacy.security.title': '6. Ασφάλεια Δεδομένων',
    'privacy.security.text': 'Έχουμε θέσει σε εφαρμογή κατάλληλα μέτρα ασφαλείας για να αποτρέψουμε την τυχαία απώλεια, χρήση ή πρόσβαση στα προσωπικά σας δεδομένα με μη εξουσιοδοτημένο τρόπο, την αλλοίωση ή την αποκάλυψη. Επιπλέον, περιορίζουμε την πρόσβαση στα προσωπικά σας δεδομένα σε εκείνους τους υπαλλήλους, αντιπροσώπους, εργολάβους και άλλα τρίτα μέρη που έχουν επιχειρηματική ανάγκη να τα γνωρίζουν. Θα επεξεργαστούν τα προσωπικά σας δεδομένα μόνο σύμφωνα με τις οδηγίες μας και υπόκεινται σε καθήκον εμπιστευτικότητας.',
    'privacy.rights.title': '7. Τα Νόμιμα Δικαιώματά σας',
    'privacy.rights.intro': 'Υπό ορισμένες συνθήκες, έχετε δικαιώματα βάσει των νόμων προστασίας δεδομένων σε σχέση με τα προσωπικά σας δεδομένα, συμπεριλαμβανομένου του δικαιώματος να:',
    'privacy.rights.access': 'Ζητήσετε πρόσβαση στα προσωπικά σας δεδομένα.',
    'privacy.rights.correction': 'Ζητήσετε διόρθωση των προσωπικών σας δεδομένων.',
    'privacy.rights.erasure': 'Ζητήσετε διαγραφή των προσωπικών σας δεδομένων.',
    'privacy.rights.objection': 'Αντιταχθείτε στην επεξεργασία των προσωπικών σας δεδομένων.',
    'privacy.rights.restriction': 'Ζητήσετε περιορισμό της επεξεργασίας των προσωπικών σας δεδομένων.',
    'privacy.rights.transfer': 'Ζητήσετε μεταφορά των προσωπικών σας δεδομένων.',
    'privacy.rights.withdraw': 'Δικαίωμα απόσυρσης συναίνεσης.',
    'privacy.transfers.title': '8. Διεθνείς Μεταφορές',
    'privacy.transfers.text': 'Ενδέχεται να μεταφέρουμε τα προσωπικά σας δεδομένα σε χώρες εκτός του Ευρωπαϊκού Οικονομικού Χώρου (ΕΟΧ). Κάθε φορά που μεταφέρουμε τα προσωπικά σας δεδομένα εκτός του ΕΟΧ, διασφαλίζουμε ότι παρέχεται παρόμοιος βαθμός προστασίας εφαρμόζοντας διασφαλίσεις.',
    'privacy.changes.title': '9. Αλλαγές σε Αυτήν την Πολιτική Απορρήτου',
    'privacy.changes.text': 'Ενδέχεται να ενημερώνουμε την Πολιτική Απορρήτου μας από καιρό σε καιρό. Θα σας ειδοποιήσουμε για τυχόν αλλαγές δημοσιεύοντας τη νέα Πολιτική Απορρήτου σε αυτήν τη σελίδα και ενημερώνοντας την ημερομηνία "Τελευταία Ενημέρωση" στο πάνω μέρος αυτής της Πολιτικής Απορρήτου. Συνιστάται να επανεξετάζετε περιοδικά αυτήν την Πολιτική Απορρήτου για τυχόν αλλαγές. Οι αλλαγές σε αυτήν την Πολιτική Απορρήτου ισχύουν όταν αναρτώνται σε αυτήν τη σελίδα.',
    'privacy.contact.title': '10. Επικοινωνήστε Μαζί μας',
    'privacy.contact.text': 'Εάν έχετε οποιεσδήποτε ερωτήσεις σχετικά με αυτήν την Πολιτική Απορρήτου, επικοινωνήστε μαζί μας στο:',
    'privacy.contact.email': 'Email: contact@urbangreece.com',
    
    // Terms of Service
    'terms.title': 'Όροι Χρήσης',
    'terms.lastUpdated': 'Τελευταία Ενημέρωση: Ιούνιος 2023',
    'terms.intro.title': '1. Εισαγωγή',
    'terms.intro.p1': 'Καλώς ήρθατε στο Urban Greece. Αυτοί οι Όροι Υπηρεσίας ("Όροι") διέπουν την πρόσβαση και τη χρήση του ιστότοπου, των υπηρεσιών και των εφαρμογών του Urban Greece (συλλογικά, η "Υπηρεσία"). Παρακαλούμε διαβάστε προσεκτικά αυτούς τους Όρους προτού χρησιμοποιήσετε την Υπηρεσία μας.',
    'terms.intro.p2': 'Με την πρόσβαση ή τη χρήση της Υπηρεσίας, συμφωνείτε να δεσμεύεστε από αυτούς τους Όρους. Εάν διαφωνείτε με οποιοδήποτε μέρος των Όρων, δεν μπορείτε να έχετε πρόσβαση ή να χρησιμοποιήσετε την Υπηρεσία.',
    'terms.definitions.title': '2. Ορισμοί',
    'terms.definitions.service': '"Υπηρεσία" αναφέρεται στον ιστότοπο, την πλατφόρμα και όλο το περιεχόμενο, τις υπηρεσίες και τα προϊόντα που διατίθενται στον ή μέσω του ιστότοπου Urban Greece.',
    'terms.definitions.we': '"Urban Greece", "εμείς", "μας" και "μας" αναφέρονται στους διαχειριστές του Urban Greece.',
    'terms.definitions.you': '"Εσείς" και "σας" αναφέρονται στο άτομο ή την οντότητα που χρησιμοποιεί την Υπηρεσία μας.',
    'terms.definitions.content': '"Περιεχόμενο" αναφέρεται σε όλα τα υλικά που βρίσκονται στην Υπηρεσία, συμπεριλαμβανομένων κειμένου, εικόνων, ήχου, βίντεο και διαδραστικών λειτουργιών.',
    'terms.definitions.userContent': '"Περιεχόμενο Χρήστη" αναφέρεται σε περιεχόμενο που υποβάλλεται από χρήστες, συμπεριλαμβανομένων σχολίων, σχολίων και προτάσεων.',
    'terms.account.title': '3. Εγγραφή Λογαριασμού',
    'terms.account.p1': 'Ορισμένες λειτουργίες της Υπηρεσίας μας μπορεί να απαιτούν την εγγραφή σας για λογαριασμό. Όταν εγγράφεστε, συμφωνείτε να παρέχετε ακριβείς, ενημερωμένες και πλήρεις πληροφορίες για τον εαυτό σας όπως ζητείται από τη φόρμα εγγραφής. Είστε υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας των διαπιστευτηρίων του λογαριασμού σας και για όλες τις δραστηριότητες που πραγματοποιούνται στο λογαριασμό σας.',
    'terms.account.p2': 'Συμφωνείτε να ειδοποιήσετε αμέσως το Urban Greece για οποιαδήποτε μη εξουσιοδοτημένη χρήση του λογαριασμού σας ή οποιαδήποτε άλλη παραβίαση ασφαλείας. Το Urban Greece δεν θα είναι υπεύθυνο για οποιαδήποτε απώλεια ή ζημιά που προκύπτει από την αποτυχία σας να προστατεύσετε τις πληροφορίες του λογαριασμού σας.',
    'terms.usage.title': '4. Αποδεκτή Χρήση',
    'terms.usage.intro': 'Συμφωνείτε να μην χρησιμοποιείτε την Υπηρεσία για:',
    'terms.usage.laws': 'Να παραβιάζετε οποιουσδήποτε ισχύοντες νόμους ή κανονισμούς.',
    'terms.usage.ip': 'Να παραβιάζετε τα δικαιώματα πνευματικής ιδιοκτησίας άλλων.',
    'terms.usage.malware': 'Να μεταδίδετε ιούς, κακόβουλο λογισμικό ή άλλο επιβλαβή κώδικα.',
    'terms.usage.disrupt': 'Να παρεμβαίνετε ή να διαταράσσετε την Υπηρεσία ή τους διακομιστές ή τα δίκτυα που συνδέονται με την Υπηρεσία.',
    'terms.usage.data': 'Να συλλέγετε ή να αποθηκεύετε προσωπικά δεδομένα σχετικά με άλλους χρήστες χωρίς τη συγκατάθεσή τους.',
    'terms.usage.impersonate': 'Να προσποιείστε οποιοδήποτε άτομο ή οντότητα ή να δηλώνετε ψευδώς ή να παρερμηνεύετε την σχέση σας με ένα άτομο ή οντότητα.',
    'terms.usage.objectionable': 'Να δημοσιεύετε ή να μεταδίδετε οποιοδήποτε περιεχόμενο που είναι παράνομο, απειλητικό, προσβλητικό, παρενοχλητικό, συκοφαντικό, χυδαίο, άσεμνο ή με άλλο τρόπο αμφισβητήσιμο.',
    'terms.ip.title': '5. Πνευματική Ιδιοκτησία',
    'terms.ip.p1': 'Η Υπηρεσία και το πρωτότυπο περιεχόμενό της (εξαιρουμένου του Περιεχομένου Χρήστη), οι λειτουργίες και η λειτουργικότητά της ανήκουν και θα παραμείνουν αποκλειστική ιδιοκτησία του Urban Greece και των δικαιοπαρόχων του. Η Υπηρεσία προστατεύεται από πνευματικά δικαιώματα, εμπορικά σήματα και άλλους νόμους τόσο της Ελλάδας όσο και ξένων χωρών.',
    'terms.ip.p2': 'Τα εμπορικά σήματά μας και η εμπορική μας εμφάνιση δεν μπορούν να χρησιμοποιηθούν σε σχέση με οποιοδήποτε προϊόν ή υπηρεσία χωρίς την προηγούμενη γραπτή συγκατάθεση του Urban Greece.',
    'terms.ip.p3': 'Το Urban Greece σέβεται τα δικαιώματα πνευματικής ιδιοκτησίας των άλλων και αναμένει από τους χρήστες της Υπηρεσίας να κάνουν το ίδιο. Θα ανταποκριθούμε σε ειδοποιήσεις για εικαζόμενη παραβίαση πνευματικών δικαιωμάτων που συμμορφώνονται με την ισχύουσα νομοθεσία.',
    'terms.userContent.title': '6. Περιεχόμενο Χρήστη',
    'terms.userContent.p1': 'Η Υπηρεσία μας μπορεί να σας επιτρέπει να δημοσιεύετε, να συνδέετε, να αποθηκεύετε, να μοιράζεστε και να διαθέτετε με άλλο τρόπο ορισμένες πληροφορίες, κείμενο, γραφικά, βίντεο ή άλλο υλικό ("Περιεχόμενο Χρήστη"). Είστε υπεύθυνοι για το Περιεχόμενο Χρήστη που δημοσιεύετε στην Υπηρεσία, συμπεριλαμβανομένης της νομιμότητας, της αξιοπιστίας και της καταλληλότητάς του.',
    'terms.userContent.p2': 'Με τη δημοσίευση Περιεχομένου Χρήστη στην Υπηρεσία, παραχωρείτε στο Urban Greece μια παγκόσμια, μη αποκλειστική, χωρίς δικαιώματα άδεια (με το δικαίωμα υποαδειοδότησης) για χρήση, αντιγραφή, αναπαραγωγή, επεξεργασία, προσαρμογή, τροποποίηση, δημοσίευση, μετάδοση, εμφάνιση και διανομή τέτοιου περιεχομένου σε οποιοδήποτε και όλα τα μέσα ή μεθόδους διανομής που είναι γνωστά τώρα ή αναπτύσσονται αργότερα.',
    'terms.userContent.p3': 'Δηλώνετε και εγγυάστε ότι: (i) το Περιεχόμενο Χρήστη είναι δικό σας ή έχετε το δικαίωμα να το χρησιμοποιείτε και να μας παραχωρείτε τα δικαιώματα και την άδεια όπως προβλέπεται σε αυτούς τους Όρους, και (ii) η δημοσίευση του Περιεχομένου Χρήστη σας στην ή μέσω της Υπηρεσίας δεν παραβιάζει τα δικαιώματα απορρήτου, τα δικαιώματα δημοσιότητας, τα πνευματικά δικαιώματα, τα συμβατικά δικαιώματα ή οποιαδήποτε άλλα δικαιώματα οποιουδήποτε προσώπου.',
    'terms.thirdParty.title': '7. Ιστότοποι και Περιεχόμενο Τρίτων',
    'terms.thirdParty.p1': 'Η Υπηρεσία μας μπορεί να περιέχει συνδέσμους προς ιστότοπους ή υπηρεσίες τρίτων που δεν ανήκουν ή ελέγχονται από το Urban Greece. Το Urban Greece δεν έχει κανέναν έλεγχο και δεν αναλαμβάνει καμία ευθύνη για το περιεχόμενο, τις πολιτικές απορρήτου ή τις πρακτικές οποιωνδήποτε ιστότοπων ή υπηρεσιών τρίτων.',
    'terms.thirdParty.p2': 'Αναγνωρίζετε και συμφωνείτε ότι το Urban Greece δεν θα είναι υπεύθυνο ή υπόλογο, άμεσα ή έμμεσα, για οποιαδήποτε ζημιά ή απώλεια που προκαλείται ή φέρεται να προκαλείται από ή σε σχέση με τη χρήση ή την εξάρτηση από οποιοδήποτε τέτοιο περιεχόμενο, αγαθά ή υπηρεσίες που διατίθενται στον ή μέσω οποιωνδήποτε τέτοιων ιστότοπων ή υπηρεσιών.',
    'terms.termination.title': '8. Τερματισμός',
    'terms.termination.p1': 'Μπορούμε να τερματίσουμε ή να αναστείλουμε το λογαριασμό σας αμέσως, χωρίς προηγούμενη ειδοποίηση ή ευθύνη, για οποιονδήποτε λόγο, συμπεριλαμβανομένης, χωρίς περιορισμό, της παραβίασης των Όρων.',
    'terms.termination.p2': 'Με τον τερματισμό, το δικαίωμά σας να χρησιμοποιείτε την Υπηρεσία θα τερματιστεί αμέσως. Εάν επιθυμείτε να τερματίσετε το λογαριασμό σας, μπορείτε απλώς να διακόψετε τη χρήση της Υπηρεσίας ή να επικοινωνήσετε μαζί μας για να ζητήσετε διαγραφή του λογαριασμού.',
    'terms.liability.title': '9. Περιορισμός Ευθύνης',
    'terms.liability.intro': 'Σε καμία περίπτωση το Urban Greece, ούτε οι διευθυντές, οι υπάλληλοι, οι συνεργάτες, οι αντιπρόσωποι, οι προμηθευτές ή οι συνεργάτες του, δεν θα είναι υπεύθυνοι για οποιεσδήποτε έμμεσες, τυχαίες, ειδικές, επακόλουθες ή τιμωρητικές ζημιές, συμπεριλαμβανομένων, χωρίς περιορισμό, απώλειας κερδών, δεδομένων, χρήσης, υπεραξίας ή άλλων άυλων απωλειών, που προκύπτουν από:',
    'terms.liability.access': 'Την πρόσβασή σας ή τη χρήση ή την αδυναμία πρόσβασης ή χρήσης της Υπηρεσίας,',
    'terms.liability.conduct': 'Οποιαδήποτε συμπεριφορά ή περιεχόμενο οποιουδήποτε τρίτου στην Υπηρεσία,',
    'terms.liability.content': 'Οποιοδήποτε περιεχόμενο που αποκτήθηκε από την Υπηρεσία, και',
    'terms.liability.unauthorized': 'Μη εξουσιοδοτημένη πρόσβαση, χρήση ή αλλοίωση των διαβιβάσεων ή του περιεχομένου σας.',
    'terms.disclaimer.title': '10. Αποποίηση',
    'terms.disclaimer.p1': 'Η χρήση της Υπηρεσίας γίνεται με δική σας ευθύνη. Η Υπηρεσία παρέχεται σε βάση "ΩΣ ΕΧΕΙ" και "ΩΣ ΔΙΑΤΙΘΕΤΑΙ". Η Υπηρεσία παρέχεται χωρίς εγγυήσεις οποιουδήποτε είδους, είτε ρητές είτε σιωπηρές, συμπεριλαμβανομένων, ενδεικτικά, των σιωπηρών εγγυήσεων εμπορευσιμότητας, καταλληλότητας για συγκεκριμένο σκοπό, μη παραβίασης ή πορείας εκτέλεσης.',
    'terms.disclaimer.p2': 'Το Urban Greece, οι θυγατρικές, οι συνεργάτες και οι αδειοδότες του δεν εγγυώνται ότι: (α) η Υπηρεσία θα λειτουργεί αδιάλειπτα, με ασφάλεια ή θα είναι διαθέσιμη σε οποιαδήποτε συγκεκριμένη στιγμή ή τοποθεσία, (β) τυχόν σφάλματα ή ελαττώματα θα διορθωθούν, (γ) η Υπηρεσία είναι απαλλαγμένη από ιούς ή άλλα επιβλαβή στοιχεία, ή (δ) τα αποτελέσματα της χρήσης της Υπηρεσίας θα ανταποκρίνονται στις απαιτήσεις σας.',
    'terms.law.title': '11. Εφαρμοστέο Δίκαιο',
    'terms.law.text': 'Αυτοί οι Όροι διέπονται και ερμηνεύονται σύμφωνα με τους νόμους της Ελλάδας, χωρίς να λαμβάνονται υπόψη οι διατάξεις της σύγκρουσης νόμων. Η αδυναμία μας να επιβάλουμε οποιοδήποτε δικαίωμα ή διάταξη αυτών των Όρων δεν θα θεωρηθεί παραίτηση από αυτά τα δικαιώματα. Εάν οποιαδήποτε διάταξη αυτών των Όρων κριθεί άκυρη ή μη εκτελεστή από δικαστήριο, οι υπόλοιπες διατάξεις αυτών των Όρων θα παραμείνουν σε ισχύ.',
    'terms.changes.title': '12. Αλλαγές στους Όρους',
    'terms.changes.text': 'Διατηρούμε το δικαίωμα, κατά την αποκλειστική διακριτική μας ευχέρεια, να τροποποιήσουμε ή να αντικαταστήσουμε αυτούς τους Όρους ανά πάσα στιγμή. Εάν μια αναθεώρηση είναι ουσιώδης, θα προσπαθήσουμε να παρέχουμε τουλάχιστον 30 ημέρες προειδοποίηση πριν από την έναρξη ισχύος των νέων όρων. Το τι συνιστά ουσιώδη αλλαγή θα καθοριστεί κατά την αποκλειστική μας διακριτική ευχέρεια. Συνεχίζοντας να έχετε πρόσβαση ή να χρησιμοποιείτε την Υπηρεσία μας αφότου αυτές οι αναθεωρήσεις τεθούν σε ισχύ, συμφωνείτε να δεσμεύεστε από τους αναθεωρημένους όρους.',
    'terms.contact.title': '13. Επικοινωνήστε Μαζί μας',
    'terms.contact.text': 'Εάν έχετε οποιεσδήποτε ερωτήσεις σχετικά με αυτούς τους Όρους, επικοινωνήστε μαζί μας στο:',
    'terms.contact.email': 'Email: contact@urbangreece.com',
  }
};

// Create the context
type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, defaultValue?: string, ...args: any[]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get stored language or default to English
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      return savedLanguage || 'en';
    }
    return 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      
      // Update HTML lang attribute for SEO
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translate function
  const t = (key: string, defaultValue?: string, ...args: any[]): string => {
    // If translations exist for this language and key
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if key exists there
    if (language !== 'en' && translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    
    // If a default value is provided, use that
    if (defaultValue !== undefined) {
      // Check if the default value contains a placeholder pattern like {0}
      if (typeof defaultValue === 'string' && defaultValue.includes('{0}')) {
        if (args.length > 0) {
          return defaultValue.replace('{0}', args[0]);
        }
      }
      return defaultValue;
    }
    
    // Last resort: return the key itself
    return key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 
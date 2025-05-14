import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Send, MapPin, Mail, Phone, Clock } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set document title
    document.title = "Contact Us | Urban Greece";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Reset form status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Have questions or want to collaborate? Get in touch with our team.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-dark-card rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded mb-6">
                  <p>Thank you for your message! We'll get back to you soon.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
                  <p>There was an error sending your message. Please try again later.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-300 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Artist Collaboration">Artist Collaboration</option>
                    <option value="Media Request">Media Request</option>
                    <option value="Business Opportunity">Business Opportunity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-300 mb-2">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg transition-all ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-gray-300 mb-8">
                Whether you're an artist looking to collaborate, a media outlet seeking information, 
                or a fan with questions, we'd love to hear from you. Our team is ready to respond to your inquiries.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-900/30 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Our Location</h3>
                    <p className="text-gray-400 mt-1">Athens, Greece</p>
                    <p className="text-gray-400">Syntagma Square Area</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-900/30 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Us</h3>
                    <p className="text-gray-400 mt-1">contact@urbangreece.com</p>
                    <p className="text-gray-400">support@urbangreece.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-pink-900/30 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Call Us</h3>
                    <p className="text-gray-400 mt-1">+30 210 300 1551</p>
                    <p className="text-gray-400">(Monday to Friday, 9am - 5pm)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-900/30 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Office Hours</h3>
                    <p className="text-gray-400 mt-1">Monday to Friday: 9am - 5pm</p>
                    <p className="text-gray-400">Saturday: 10am - 2pm (by appointment)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl backdrop-blur-sm">
                <h3 className="font-semibold text-white mb-4">Looking for Business Opportunities?</h3>
                <p className="text-gray-400 mb-4">
                  For partnership inquiries, sponsorships, or business collaborations, 
                  please contact our business development team directly.
                </p>
                <a 
                  href="mailto:business@urbangreece.com"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  business@urbangreece.com
                  <Send className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactUs; 
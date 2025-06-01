<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact & Support - GetTutorly</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/umd/lucide.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            color: #e2e8f0;
            overflow-x: hidden;
        }

        .animated-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            z-index: -2;
        }

        .floating-shapes {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        }

        .shape {
            position: absolute;
            background: rgba(138, 43, 226, 0.15);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 70%;
            right: 10%;
            animation-delay: 2s;
        }

        .shape:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 40%;
            left: 80%;
            animation-delay: 4s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
            animation: fadeInUp 0.8s ease-out;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 800;
            color: white;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2rem;
            color: rgba(255, 255, 255, 0.9);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .contact-card, .faq-card {
            background: rgba(30, 30, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            border: 1px solid rgba(138, 43, 226, 0.2);
            animation: fadeInUp 0.8s ease-out 0.2s both;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .contact-card:hover, .faq-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 30px 60px rgba(138, 43, 226, 0.3);
        }

        .card-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .contact-methods {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .contact-method {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: rgba(138, 43, 226, 0.15);
            border-radius: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }

        .contact-method:hover {
            background: rgba(138, 43, 226, 0.25);
            border-color: rgba(138, 43, 226, 0.4);
            transform: translateY(-2px);
        }

        .contact-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #8a2be2, #9b59b6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
        }

        .contact-info h3 {
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 0.25rem;
        }

        .contact-info p {
            color: #cbd5e0;
            font-size: 0.95rem;
        }

        .contact-info a {
            color: #8a2be2;
            text-decoration: none;
            font-weight: 500;
        }

        .contact-info a:hover {
            text-decoration: underline;
            color: #9b59b6;
        }

        .faq-item {
            margin-bottom: 1.5rem;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(138, 43, 226, 0.2);
        }

        .faq-question {
            background: rgba(138, 43, 226, 0.15);
            padding: 1.25rem;
            cursor: pointer;
            display: flex;
            justify-content: between;
            align-items: center;
            transition: background 0.3s ease;
            font-weight: 600;
            color: #f8fafc;
        }

        .faq-question:hover {
            background: rgba(138, 43, 226, 0.25);
        }

        .faq-answer {
            padding: 1.25rem;
            background: rgba(30, 30, 46, 0.8);
            color: #cbd5e0;
            line-height: 1.6;
            display: none;
        }

        .faq-answer.active {
            display: block;
            animation: slideDown 0.3s ease-out;
        }

        .quick-links {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: fadeInUp 0.8s ease-out 0.4s both;
            margin-bottom: 2rem;
        }

        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .quick-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 16px;
            text-decoration: none;
            color: #2d3748;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .quick-link:hover {
            background: rgba(102, 126, 234, 0.1);
            border-color: rgba(102, 126, 234, 0.2);
            transform: translateY(-2px);
        }

        .link-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .status-indicator {
            background: rgba(30, 30, 46, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: fadeInUp 0.8s ease-out 0.6s both;
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #f8fafc;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 200px;
            }
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.5rem;
            }
            
            .main-content {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .container {
                padding: 1rem;
            }
            
            .contact-card, .faq-card, .quick-links {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="animated-bg"></div>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>

    <div class="container">
        <div class="header">
            <h1>Get Help & Support</h1>
            <p>We're here to help you make the most of your GetTutorly experience. Whether you have questions, need technical support, or want to share feedback, we've got you covered.</p>
        </div>

        <div class="main-content">
            <div class="contact-card">
                <h2 class="card-title">
                    <i data-lucide="headphones"></i>
                    Contact Us
                </h2>
                <div class="contact-methods">
                    <div class="contact-method" onclick="window.location.href='mailto:support@gettutorly.com'">
                        <div class="contact-icon">
                            <i data-lucide="mail"></i>
                        </div>
                        <div class="contact-info">
                            <h3>📧 Email Support</h3>
                            <p><a href="mailto:support@gettutorly.com">support@gettutorly.com</a></p>
                            <p>We typically respond within 24 hours</p>
                        </div>
                    </div>
                    
                    <div class="contact-method" onclick="window.open('https://www.instagram.com/gettutorly', '_blank')">
                        <div class="contact-icon">
                            <i data-lucide="instagram"></i>
                        </div>
                        <div class="contact-info">
                            <h3>📱 Follow Us</h3>
                            <p><a href="https://www.instagram.com/gettutorly" target="_blank">@gettutorly</a></p>
                            <p>Updates, tips, and community support</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="faq-card">
                <h2 class="card-title">
                    <i data-lucide="help-circle"></i>
                    Frequently Asked Questions
                </h2>
                
                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        How do I upload my study materials?
                        <i data-lucide="chevron-down" style="margin-left: auto;"></i>
                    </div>
                    <div class="faq-answer">
                        Simply drag and drop or click to upload your PDFs, lecture notes, or textbooks. GetTutorly supports multiple file formats and will process your documents to create summaries and enable Q&A features.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        What file formats are supported?
                        <i data-lucide="chevron-down" style="margin-left: auto;"></i>
                    </div>
                    <div class="faq-answer">
                        We support PDF, DOCX, TXT, and image files (JPG, PNG). Our AI can extract text from images and process various document layouts for optimal study assistance.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        How accurate are the AI summaries?
                        <i data-lucide="chevron-down" style="margin-left: auto;"></i>
                    </div>
                    <div class="faq-answer">
                        Our AI provides highly accurate summaries by analyzing the key concepts and main points in your materials. However, we always recommend reviewing the original content for critical information.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        Is my data secure and private?
                        <i data-lucide="chevron-down" style="margin-left: auto;"></i>
                    </div>
                    <div class="faq-answer">
                        Yes, we take privacy seriously. Your uploaded documents are encrypted and securely stored. We never share your content with third parties and you can delete your data at any time.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        How to Cancel Your Tutorly Subscription?
                        <i data-lucide="chevron-down" style="margin-left: auto;"></i>
                    </div>
                    <div class="faq-answer">
                        <strong>Steps to Cancel Your Subscription:</strong><br><br>
                        Follow these steps on your iPhone or iPad:<br>
                        1. <strong>Open the Settings</strong> – Locate and tap the Settings app on your device.<br>
                        2. <strong>Access Your Apple ID</strong> – Tap your name at the top of the Settings screen to open your Apple ID settings.<br>
                        3. <strong>Go to Subscriptions</strong> – Select <strong>Subscriptions</strong> from the list of options.<br>
                        4. <strong>Find Your Tutorly Subscription</strong> – Scroll through your active subscriptions and tap on Tutorly.<br>
                        5. <strong>Cancel Subscription</strong> – Tap <strong>Cancel Subscription</strong> and confirm your cancellation when prompted.<br><br>
                        We're sorry to see you go, but if you ever decide to return, we'd be happy to welcome you back!<br><br>
                        <em>Related to: Subscription Management & Cancellation</em>
                    </div>
                </div>
            </div>
        </div>

        <div class="status-indicator">
            <div class="status-dot"></div>
            <div>
                <strong>All systems operational</strong> - GetTutorly is running smoothly
            </div>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // FAQ toggle functionality
        function toggleFAQ(element) {
            const answer = element.nextElementSibling;
            const icon = element.querySelector('[data-lucide="chevron-down"]');
            
            // Close other open FAQs
            document.querySelectorAll('.faq-answer.active').forEach(activeAnswer => {
                if (activeAnswer !== answer) {
                    activeAnswer.classList.remove('active');
                    const activeIcon = activeAnswer.previousElementSibling.querySelector('[data-lucide="chevron-down"]');
                    activeIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            answer.classList.toggle('active');
            icon.style.transform = answer.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            icon.style.transition = 'transform 0.3s ease';
        }

        // Add smooth scrolling and interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            // Add hover effects to cards
            const cards = document.querySelectorAll('.contact-card, .faq-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });

            // Animate elements on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });

            document.querySelectorAll('.contact-method').forEach(el => {
                observer.observe(el);
            });
        });
    </script>
</body>
</html>

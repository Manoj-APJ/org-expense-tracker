import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="welcome-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        <span>Production Ready</span>
                    </div>

                    <h1 className="hero-title">
                        Track. Approve. Analyze.
                        <span className="gradient-text"> Organization Expenses</span> — Simplified.
                    </h1>

                    <p className="hero-subtitle">
                        A role-based expense tracking system built for real-world organizational workflows.
                    </p>

                    <div className="hero-cta">
                        <button className="cta-primary" onClick={() => navigate('/register')}>
                            Get Started
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="cta-secondary" onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <div className="card-icon">📊</div>
                        <div className="card-text">Analytics</div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-icon">✓</div>
                        <div className="card-text">Approved</div>
                    </div>
                    <div className="floating-card card-3">
                        <div className="card-icon">🔒</div>
                        <div className="card-text">Secure</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Built for Real Organizations</h2>
                    <p>Everything you need to manage expenses efficiently</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Role-Based Access</h3>
                        <p>Admin and User roles with distinct permissions and workflows</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Expense Approval Workflow</h3>
                        <p>Streamlined approval process with status tracking and notifications</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Secure Authentication</h3>
                        <p>JWT-based authentication with protected routes and sessions</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18 9L13 14L9 10L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Clear Expense Analytics</h3>
                        <p>Comprehensive insights and reporting for better decision making</p>
                    </div>
                </div>
            </section>

            {/* GitHub Section */}
            <section className="github-section">
                <div className="github-content">
                    <div className="github-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    </div>

                    <h2>Open Source & Community Driven</h2>
                    <p className="github-description">
                        This project is open-source and built as a real-world learning system.
                        Explore the code, contribute features, or use it for your own organization.
                    </p>

                    <div className="github-actions">
                        <a
                            href="https://github.com/Manoj-APJ/org-expense-tracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="github-btn primary"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>

                        <div className="github-links">
                            <a href="https://github.com/Manoj-APJ/org-expense-tracker" target="_blank" rel="noopener noreferrer">
                                ⭐ Give a Star
                            </a>
                            <a href="https://github.com/Manoj-APJ/org-expense-tracker/issues" target="_blank" rel="noopener noreferrer">
                                🛠️ Contribute / Feature Request
                            </a>
                            <a href="https://github.com/Manoj-APJ/org-expense-tracker/issues" target="_blank" rel="noopener noreferrer">
                                📝 Leave Feedback
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who This Is For Section */}
            <section className="audience-section">
                <h2>Who This Is For</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <div className="audience-emoji">🏢</div>
                        <h3>Small Organizations</h3>
                        <p>Perfect for teams that need expense tracking without enterprise complexity</p>
                    </div>

                    <div className="audience-card">
                        <div className="audience-emoji">🎓</div>
                        <h3>Student Projects</h3>
                        <p>Learn full-stack development with a production-ready codebase</p>
                    </div>

                    <div className="audience-card">
                        <div className="audience-emoji">💻</div>
                        <h3>Backend Learners</h3>
                        <p>Explore authentication, authorization, and RESTful API design</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="welcome-footer">
                <div className="footer-content">
                    <p>
                        Created by{" "}
                        <a
                            href="https://manojtalent.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Manoj's Portfolio"
                        >
                            <strong>Manoj</strong> 🔗
                        </a>{" "}
                        — with ❤️ for coding
                    </p>

                    <div className="footer-links">
                        <a
                            href="https://github.com/Manoj-APJ"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default WelcomePage;

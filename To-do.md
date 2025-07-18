Tech for Girls Registration Project
Phase 1: Planning & Setup
 Understood project requirements and goals
 Created GitHub repository TechForGirls-Registration
 Setup basic folder structure (HTML, CSS, JS folders)
 Created initial files: index.html, style.css, script.js
Phase 2: UI Design (HTML + CSS)
 Designed HTML form with fields:
Name
Phone Number
Email
College/Department
WhatsApp Share Button
Upload Screenshot
Submit Button
 Styled the form with modern UI (fonts, spacing, layout)
 Added responsive design & hover effects
Phase 3: Core Functionality (JS)
 WhatsApp Share Button opens pre-written message
 Implemented share counter (max 5 clicks)
 Handled file upload input
 Validated form inputs (basic input checks)
 Disabled form after 5/5 shares
 Submit button sends data only after 5 shares
 After submission, disabled form and showed success message
Phase 4: Data Storage & Backend (Google Apps Script)
 Created Google Sheet to store data
 Wrote & deployed Google Apps Script (Web App endpoint)
 Connected form with Apps Script using fetch() POST
 Uploaded file & stored Google Drive link in Sheet (if applicable)
Phase 5: Single Submission Logic
 Used localStorage to store submission flag
 Prevented re-submission on page reload
 Disabled form & showed message if already submitted
Bonus Features
 Added live input validation (email, phone, required fields)
 Dark mode toggle button
 Copy to clipboard button for WhatsApp message
 Success animation after submission (confetti effect)
 Micro-interactions (hover, transitions)
Phase 6: Hosting & Delivery
 Hosted website using GitHub Pages
 Tested live link functionality
 Final testing (form submission, validation, resubmission block)
 Added README.md with project description
 Shared GitHub repo & live link for submission
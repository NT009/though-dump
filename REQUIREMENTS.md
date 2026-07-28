# ADHD Thought Dump - Product Requirements Document

## 1. Overview
A Progressive Web App (PWA) designed as a "thought dump" for personal use (but capable of supporting multiple users). The primary objective is **zero-friction data entry**. Users should be able to open the app and instantly start typing their thoughts without distraction.

## 2. Tech Stack (100% Free Tier Architecture)
* **Framework:** Next.js (App Router)
* **Database:** MongoDB Atlas (M0 Free Cluster - 512MB storage, always-on)
* **Authentication:** Auth.js (NextAuth) for secure login (e.g., Google/GitHub)
* **Rich Text Editor:** TipTap (Headless, lightweight)
* **Styling & Components:** Tailwind CSS with **shadcn/ui** (Premium, accessible components, beautiful dark mode, highly customizable)
* **Hosting:** Vercel (Hobby Tier)

## 3. Core Features & User Flow

### A. Authentication
* Users must log in (initially) to use the app.
* Authentication is strictly for data association (ensuring users only see their own thoughts and preventing unauthorized access).

### B. The Home Screen (Zero-Friction Entry)
* **Immediate Focus:** The screen is dominated by a large text input area and a "Submit" button.
* **Rich Text (Constrained):** 
  * Powered by TipTap.
  * Supports text, bullet lists, and basic headings (H1, H2, H3).
  * Explicitly **no** support for media uploads (images/video) or custom text colors to keep the UI clean and fast.
  * Markdown shortcuts enabled (e.g., typing `- ` creates a bullet point).
* **Mobile Experience:**
  * A minimal "Thumb Toolbar" positioned directly above the mobile keyboard containing only the necessary formatting buttons (Bullets, Headings) so users don't have to switch to symbol keyboards.
* **Tagging System:**
  * An optional inline input to add tags to a thought.
  * Users can search/select existing tags or hit Enter to create a new one instantly.

### C. The Vault / Menu (Thought Management)
* A separate page or menu accessible via a button on the Home screen.
* Displays all previously collected thoughts.
* **Categorization:** Thoughts are automatically categorized and grouped by date.
* **Actions:** Every inputted thought in the menu has an options menu (e.g., a `...` icon) allowing the user to:
  * **Edit:** Loads the thought back into the editor to modify.
  * **Delete:** Permanently removes the thought from the database.

## 4. Non-Functional Requirements
* **Security:** Ensure robust security practices. User data must be strictly isolated (users can only access their own thoughts). API routes must be protected against unauthorized access, and inputs must be sanitized to prevent XSS (Cross-Site Scripting) attacks, especially given the rich text editor.
* **PWA:** Must be fully installable on mobile devices (iOS/Android) as a Progressive Web App.
* **Aesthetics:** Must feature a premium, dynamic design with smooth interactions, hover effects, and a curated color palette (no generic default colors).

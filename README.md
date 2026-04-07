# ✈️ Happy Journey: Premium Indian Travel Portal

**Happy Journey** is a state-of-the-art, visually stunning travel exploration platform designed to showcase the hidden gems of India. Built with a focus on premium aesthetics, the application offers an immersive experience for travelers planning their next adventure.

![Happy Journey Preview](https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200)

## ✨ Key Features

- **🌅 Immersive Destination Cards**: Rich, high-quality visuals for destinations in regions like:
  - **Arunachal Pradesh** (Tawang, Ziro Valley, Mechuka, etc.)
  - **Andaman & Nicobar Islands** (Radhanagar Beach, Cellular Jail, Indira Point, etc.)
  - **Rajasthan**, **Goa**, **Kerala**, and more.
- **🪄 Liquid UI Design**: Glassmorphism effects, dynamic gradients, and smooth micro-animations for a premium feel.
- **🗓️ Integrated Trip Planner**: A dedicated section to help users organize their itineraries.
- **🛠️ Admin Dashboard**: Secure management of destinations, bookings, and site content.
- **📱 Fully Responsive**: Optimized for seamless experiences across mobile, tablet, and desktop.
- **🗃️ Dynamic Database**: Powered by SQLite for fast, local data management with comprehensive location metadata.

## 🚀 Technical Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React), Vanilla CSS (Custom Glassmorphism system).
- **Backend/API**: Next.js Server Components and Route Handlers.
- **Database**: [SQLite](https://www.sqlite.org/) with `better-sqlite3`.
- **Assets**: High-resolution photography sourced via Unsplash.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/happy-journey.git
   cd happy-journey
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the Database**:
   The project comes with a seeding script to populate destinations.
   ```bash
   # If you need to re-seed or refresh the database
   node refresh_db.js
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [localhost:3000](http://localhost:3000) to see the result.

## 🚀 Deployment

The project is optimized for deployment on both **Netlify** and **Vercel**.

### Prerequisites for Production:
> [!IMPORTANT]
> **Set the Admin Password**: To access the `/admin` dashboard in production, you **MUST** set an environment variable named `ADMIN_PASSWORD` in your hosting provider's dashboard (Netlify/Vercel).

#### deployment on Netlify:
- The project includes a `netlify.toml` file that handles the Next.js build automatically.
- Ensure the `@netlify/plugin-nextjs` is enabled in your Netlify settings.

#### deployment on Vercel:
- The project uses Next.js Output File Tracing to bundle the SQLite database with your serverless functions.
- Simply connect your GitHub repository to Vercel for automatic deployment.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Navbar, StateCards, BookingModal).
- `lib/`: Database configuration (`db.js`) and core logic.
- `public/`: Static assets and images.

---

*Designed with ❤️ for travelers by Ayush-840*

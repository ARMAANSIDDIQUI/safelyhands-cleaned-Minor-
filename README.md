# Safely Hands - Home Service Marketplace

Safely Hands is a comprehensive home service marketplace built with the MERN stack and Next.js. It connects users with verified professionals for various household needs, including cooking, cleaning, babysitting, elderly care, and more.

## 🚀 Live Demo
Visit the live application at: [safelyhands.com](https://safelyhands.com)

## 🛠️ Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React), Tailwind CSS
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Authentication**: JWT, Google OAuth 2.0
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Email Service**: Nodemailer (Gmail)
- **Deployment**: Vercel (Frontend & Backend)

## 📁 Project Structure

```text
safelyhands/
├── backend/            # Express server, routes, controllers, and models
├── frontend/           # Next.js application (App Router)
├── ecosystem.config.js # PM2 configuration
└── .env.example        # Environment variables template
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (local or Atlas)
- Cloudinary account
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ARMAANSIDDIQUI/safelyhands-cleaned-Minor-.git
   cd safelyhands-cleaned-Minor-
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory based on `.env.example` in the root.

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Running Locally

1. **Start the Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 🔒 Environment Variables

Refer to [.env.example](.env.example) for the full list of required environment variables.

## 📄 License
This project is for educational/minor project purposes.

---
Developed by [Armaan Siddiqui](https://github.com/ARMAANSIDDIQUI)

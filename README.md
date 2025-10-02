# 🚀 FirstShift - AI-Powered Workforce Management Platform

<div align="center">

![FirstShift Banner](public/logo.svg)

**Transform how your team works with AI-powered scheduling, real-time collaboration, and enterprise security in one platform.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

[Demo](https://firstshift.vercel.app) · [Documentation](https://docs.firstshift.com) · [Report Bug](https://github.com/firstshift/firstshift/issues) · [Request Feature](https://github.com/firstshift/firstshift/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [AI Integration](#-ai-integration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

FirstShift is a next-generation workforce management platform that revolutionizes how businesses handle employee scheduling, time tracking, and team collaboration. Built with cutting-edge AI technology, FirstShift automates complex scheduling decisions, provides intelligent insights, and empowers teams to work more efficiently.

### Why FirstShift?

- **🤖 AI-Powered**: Intelligent scheduling algorithms that learn your patterns and optimize automatically
- **⚡ Lightning Fast**: Built on Next.js 15 for blazing-fast performance
- **🔒 Enterprise Security**: Bank-level encryption with role-based access control
- **📱 Fully Responsive**: Beautiful UI that works seamlessly on all devices
- **🌐 Multi-Organization**: Manage multiple organizations from a single account
- **💬 Real-time Chat**: Built-in AI chatbot for instant assistance

---

## ✨ Features

### 🧠 AI-Powered Intelligence

- **Smart Scheduling**: AI analyzes employee availability, skills, and preferences to create optimal schedules
- **Predictive Analytics**: Forecast staffing needs based on historical data
- **AI Chat Assistant**: Get instant answers and insights about your workforce
- **Coverage Gap Detection**: Automatically identifies and suggests solutions for understaffed shifts
- **Template Learning**: Dynamically creates shift templates based on your organization's patterns

### 👥 Team Management

- **Employee Profiles**: Comprehensive employee management with roles, positions, and availability
- **Real-time Updates**: Live notifications for schedule changes and updates
- **Shift Swapping**: Easy peer-to-peer shift exchange with approval workflow
- **Availability Management**: Employees can set their availability preferences
- **Role-Based Permissions**: Granular access control (Admin, Manager, Employee)

### 📅 Advanced Scheduling

- **Drag-and-Drop Interface**: Intuitive schedule builder with visual timeline
- **Recurring Shifts**: Create repeating schedules with smart templates
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Bulk Operations**: Manage multiple shifts simultaneously
- **Quick Templates**: One-click shift creation from frequently used patterns
- **Multi-location Support**: Manage schedules across multiple locations

### ⏰ Time & Attendance

- **Clock In/Out**: Simple time tracking with timestamps
- **Break Management**: Automatic break time calculations
- **Overtime Tracking**: Real-time overtime alerts and monitoring
- **Timesheet Export**: Generate detailed timesheets for payroll

### 📊 Business Intelligence

- **Real-time Dashboard**: Live metrics and KPIs at a glance
- **AI Insights**: Get personalized recommendations to improve operations
- **Custom Reports**: Generate detailed reports on labor costs, hours, and more
- **Performance Analytics**: Track team utilization and efficiency
- **Cost Forecasting**: Predict labor costs based on schedule data

### 🔐 Security & Compliance

- **End-to-End Encryption**: All data encrypted in transit and at rest
- **GDPR Compliant**: Built with privacy and compliance in mind
- **Audit Trails**: Complete logging of all actions and changes
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Role-Based Access**: Fine-grained permission controls

### 🎨 Modern UI/UX

- **Beautiful Design**: Clean, modern interface with smooth animations
- **Dark Mode Ready**: Full dark mode support (coming soon)
- **Mobile Optimized**: Native mobile experience with bottom navigation
- **Accessible**: WCAG 2.1 compliant for accessibility
- **Customizable**: Brandable with custom colors and logos

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

### Backend & Database

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Real-time**: [Supabase Realtime](https://supabase.com/realtime)
- **Storage**: [Supabase Storage](https://supabase.com/storage)
- **Row Level Security**: PostgreSQL RLS policies

### AI & Intelligence

- **AI Provider**: [OpenAI](https://openai.com/)
- **Model**: GPT-4o-mini for chat and insights
- **Features**:
  - AI-powered chatbot
  - Intelligent scheduling suggestions
  - Predictive analytics
  - Coverage gap analysis

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Deployment**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Email**: [Resend](https://resend.com/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Supabase** account ([Get one free](https://supabase.com))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/firstshift.git
cd firstshift
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then fill in your environment variables (see [Environment Variables](#-environment-variables))

4. **Set up Supabase database**

- Create a new Supabase project
- Run the migrations in the `supabase/migrations` directory
- Set up Row Level Security policies (included in migrations)

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
firstshift/
├── public/                    # Static assets
│   ├── logo.svg              # Brand logo
│   └── ...
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Dashboard routes (with layout)
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── schedule/     # Schedule management
│   │   │   ├── employees/    # Employee management
│   │   │   ├── time-off/     # Time-off requests
│   │   │   ├── availability/ # Availability management
│   │   │   ├── report/       # Analytics & reports
│   │   │   └── ...
│   │   ├── auth/             # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── ...
│   │   ├── api/              # API routes
│   │   │   ├── ai/           # AI endpoints
│   │   │   │   ├── chat/     # AI chatbot
│   │   │   │   ├── dashboard/# AI dashboard insights
│   │   │   │   └── schedule/ # AI scheduling
│   │   │   ├── schedule/     # Schedule APIs
│   │   │   └── orgs/         # Organization APIs
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── ui/               # UI components (shadcn)
│   │   ├── schedule/         # Schedule-related components
│   │   ├── providers/        # Context providers
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── DashboardTopbar.tsx
│   │   ├── OrgSwitcher.tsx   # Organization switcher
│   │   ├── GlobalAIChatbot.tsx
│   │   └── ...
│   ├── lib/                  # Utility functions
│   │   ├── supabaseClient.ts # Client-side Supabase
│   │   ├── supabaseServer.ts # Server-side Supabase
│   │   ├── openai.ts         # OpenAI integration
│   │   └── utils.ts          # Helper functions
│   └── hooks/                # Custom React hooks
├── .env.local                # Environment variables
├── .env.example              # Example env file
├── tailwind.config.ts        # Tailwind configuration
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Email Configuration (Optional - for Resend)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Site Configuration (Optional)
NEXT_PUBLIC_SITE_NAME=FirstShift
```

### Getting API Keys

1. **Supabase**:
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get keys from Settings > API

2. **OpenAI**:
   - Create account at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys
   - Create new key

3. **Resend** (Optional):
   - Create account at [resend.com](https://resend.com)
   - Get API key from dashboard

---

## 🗄️ Database Setup

FirstShift uses Supabase (PostgreSQL) with Row Level Security.

### Key Tables

- `organizations` - Organization/company data
- `organization_members` - User-organization relationships
- `employees` - Employee profiles
- `shifts` - Shift schedules
- `time_off_requests` - Time-off requests
- `availability` - Employee availability preferences
- `positions` - Job positions
- `locations` - Work locations

### RPC Functions

- `get_or_init_active_org()` - Get or initialize active organization
- `active_org_id()` - Get active organization ID

### Row Level Security

All tables use RLS policies to ensure users can only access data from their organizations.

---

## 🤖 AI Integration

FirstShift integrates OpenAI's GPT-4o-mini for intelligent features:

### AI Chat Assistant

```typescript
// API: /api/ai/chat
POST /api/ai/chat
{
  "message": "Who has the least overtime?",
  "conversationHistory": [...]
}
```

Features:
- Organization-specific context
- Real-time data analysis
- Natural language understanding
- Conversation history

### AI Dashboard Insights

```typescript
// API: /api/ai/dashboard
POST /api/ai/dashboard
{
  "action": "insights" | "recommendations" | "alerts",
  "dashboardData": { ... }
}
```

Features:
- Actionable insights
- Performance recommendations
- Coverage alerts
- Trend analysis

### Smart Shift Templates

The system learns from your scheduling patterns and creates intelligent templates automatically.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

```bash
git push origin main
```

2. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables
- Deploy!

3. **Set up custom domain** (Optional)

- Add domain in Vercel dashboard
- Update DNS records

### Alternative Deployments

- **Docker**: Dockerfile included (build and run)
- **Self-hosted**: Use `npm run build` and `npm start`
- **Other platforms**: Railway, Render, AWS, etc.

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production URL
2. Configure Supabase redirect URLs
3. Set up email templates in Supabase
4. Test authentication flow

---

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind** for styling

---

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper types
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [OpenAI](https://openai.com/) - AI capabilities
- [Vercel](https://vercel.com/) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📞 Support

- **Documentation**: [docs.firstshift.com](https://docs.firstshift.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/firstshift/issues)
- **Email**: support@firstshift.com
- **Discord**: [Join our community](https://discord.gg/firstshift)

---

## 🗺️ Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Dark mode
- [ ] Integrations (Slack, Teams, etc.)
- [ ] Advanced analytics
- [ ] Payroll integration
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Voice commands

---

<div align="center">

**Built with ❤️ by the FirstShift Team**

[Website](https://firstshift.com) · [Twitter](https://twitter.com/firstshift) · [LinkedIn](https://linkedin.com/company/firstshift)

⭐ Star us on GitHub if you find this helpful!

</div>

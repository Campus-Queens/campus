# Campus - Queen's University Student Marketplace

A student-only marketplace platform designed specifically for Queen's University students. Buy, sell, and connect with fellow students for textbooks, housing, rideshares, and more.


## Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server  
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Radix UI** - Accessible UI components

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support for real-time features
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **JWT Authentication** - Secure token-based authentication
- **Pillow** - Image processing

### Infrastructure
- **Render** - Cloud hosting platform
- **Gunicorn** - WSGI HTTP Server
- **Uvicorn** - ASGI server for WebSocket support

## 🎯 Overview

Campus is a comprehensive marketplace platform that enables Queen's University students to:
- **Buy and sell** textbooks, housing, and other student essentials
- **Find roommates** and sublets
- **Share rides** and travel arrangements
- **Connect** with other students through integrated messaging
- **Build profiles** with social media integration

## 🚀 Features

### Core Marketplace Features
- **Multi-category listings**: Books, Sublets, Roommates, Rideshare, Events, and more
- **Advanced filtering**: Search by category, price range, and keywords
- **Image uploads**: Support for listing photos and profile pictures
- **Real-time messaging**: Integrated chat system for buyers and sellers
- **User profiles**: Comprehensive profiles with social media links
- **Save listings**: Bookmark favorite items for later

### User Management
- **Email verification**: Secure account creation with email verification
- **Password reset**: Forgot password functionality
- **Profile customization**: Upload profile and cover pictures
- **Social media integration**: Instagram, LinkedIn, Snapchat links

### Category-Specific Features
- **Books**: Author, edition, condition tracking
- **Housing**: Sublet listings with detailed property information
- **Roommates**: Year of study, program, age, gender preferences
- **Rideshare**: Travel arrangements and carpooling
- **Events**: Campus events and activities

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library
- **React PDF Viewer** - PDF document viewing

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support for real-time features
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Pillow** - Image processing
- **JWT Authentication** - Secure token-based authentication
- **Django CORS Headers** - Cross-origin resource sharing

### Infrastructure
- **Render** - Cloud hosting platform
- **Gunicorn** - WSGI HTTP Server
- **Uvicorn** - ASGI server for WebSocket support
- **Whitenoise** - Static file serving

## 📁 Project Structure

```
campus/
├── campus_frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── context/         # React context providers
│   │   └── hooks/           # Custom React hooks
│   └── public/              # Static assets
├── campus_backend/          # Django backend application
│   ├── appuser/             # User management app
│   ├── listings/            # Marketplace listings app
│   ├── chats/               # Chat functionality app
│   ├── chat_messages/       # Message handling app
│   └── transactions/        # Transaction management app
└── venv/                    # Python virtual environment
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL
- Redis

### Frontend Setup
```bash
cd campus_frontend
npm install
npm run dev
```

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd campus_backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and email settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/campus_db
REDIS_URL=redis://localhost:6379
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

## 📱 Key Use Cases

### For Students
1. **Textbook Exchange**: Buy and sell course materials at affordable prices
2. **Housing Search**: Find sublets, roommates, and housing options
3. **Transportation**: Share rides for trips home or campus events
4. **Campus Events**: Discover and promote student activities
5. **Networking**: Connect with other students through profiles and messaging

### For Sellers
- Create detailed listings with images and descriptions
- Set competitive pricing and negotiate through chat
- Build reputation through user profiles and ratings
- Manage multiple listings efficiently

### For Buyers
- Browse listings with advanced search and filtering
- Save favorite items for later
- Communicate directly with sellers through integrated chat
- View seller profiles and social media links

## 🔒 Security Features

- JWT token-based authentication
- Email verification for new accounts
- Secure password reset functionality
- CORS protection for API endpoints
- Input validation and sanitization
- File upload security measures

## 🌐 Deployment

The application is configured for deployment on Render with:
- Automatic builds from Git repository
- PostgreSQL database integration
- Redis for caching and WebSocket support
- Static file serving with Whitenoise
- Environment variable management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email campus.queensuniversity@gmail.com or create an issue in the repository.

---

Built with ❤️ for Queen's University students




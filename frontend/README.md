# Bank Statement Analyzer - Frontend

A React-based frontend application for analyzing bank statements and generating financial reports.

## Features

- 📤 **File Upload**: Upload PDF bank statements with password protection support
- 📊 **AI-Powered Analysis**: Get detailed transaction insights using Claude AI
- 📈 **Interactive Charts**: Visualize spending patterns and financial trends
- 📄 **PDF Reports**: Generate professional financial reports
- 🔒 **Secure Processing**: Client-side file handling with secure API communication

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client for API communication
- **Lucide React** - Icon library

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.production.template .env
   # Edit .env file with your backend URL
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with optimizations
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

For production, use your deployed backend URL.

## Deployment

This application can be deployed to any modern hosting platform that supports Node.js and static site hosting.

### Docker Deployment

1. **Prepare environment**:
   ```bash
   cp .env.production.template .env.production
   # Update VITE_API_URL with your backend URL
   ```

2. **Test build**:
   ```bash
   npm run build
   ```

3. **Deploy to hosting platform**:
   - Build the application using `npm run build`
   - Serve the `dist` folder using a web server
   - Configure environment variables as needed
   - Ensure backend API is accessible

## Project Structure
```

For production, use your deployed backend URL.

## Deployment

This application can be deployed to any modern hosting platform that supports Node.js and static site hosting.

### Docker Deployment

1. **Prepare environment**:
   ```bash
   cp .env.production.template .env.production
   # Update VITE_API_URL with your backend URL
   ```

2. **Test build**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - Build the application using `npm run build`
   - Upload the `dist` folder to your hosting platform
   - Configure environment variables as needed

## Project Structure

```
src/
├── components/           # React components
│   ├── FileUpload.jsx   # File upload functionality
│   ├── TransactionAnalysis.jsx  # Analysis results display
│   ├── ReportDownload.jsx       # PDF report generation
│   ├── ReportFeatureShowcase.jsx # Feature highlights
│   └── Header.jsx       # Application header
├── assets/              # Static assets
├── App.jsx             # Main application component
├── App.css             # Global styles
├── index.css           # Base styles
└── main.jsx            # Application entry point
```

## API Integration

The frontend communicates with the backend through these endpoints:

- `POST /api/upload/` - Upload and analyze bank statement
- `POST /api/generate-report/` - Generate PDF report

API URL is configured through the `VITE_API_URL` environment variable.

## Component Overview

### FileUpload
- Handles PDF file upload with drag-and-drop support
- Password protection for encrypted PDFs
- Progress indication and error handling

### TransactionAnalysis
- Displays parsed transaction data
- Interactive charts and visualizations
- Spending category breakdown

### ReportDownload
- Generates and downloads PDF reports
- Customizable report templates
- Progress tracking for report generation

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

# 🌍 CarbonSight - AI-Powered Carbon Footprint Tracker

**Your personal carbon footprint coach powered by AI.**

CarbonSight helps you track, analyze, and reduce your carbon footprint through intelligent receipt scanning, CSV analysis, and personalized recommendations.

![CarbonSight Demo](https://via.placeholder.com/800x400?text=CarbonSight+Demo)

---

## ✨ Features

### 🎯 Core Functionality
- **📸 Receipt Scanning**: Upload receipt photos for item-level carbon analysis using OCR
- **📊 CSV Upload**: Quick analysis of bank transactions for spend-based estimates
- **🔍 Product Search**: Check carbon footprint before purchasing
- **📈 Analytics Dashboard**: Real-time insights with charts and breakdowns
- **🌱 Smart Recommendations**: AI-powered suggestions for lower-carbon alternatives

### 🚀 Advanced Features
- **🔗 Supply Chain Transparency**: See carbon breakdown by production stage
- **🍽️ Meal Planning**: Generate low-carbon weekly meal plans with recipes
- **🏆 Achievements**: Gamified progress tracking with unlockable badges
- **🎯 Carbon Goals**: Set and track monthly carbon budgets
- **📊 Predictions**: Forecast future carbon footprint based on patterns
- **🌙 Dark Mode**: Eye-friendly theme switching

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **SQLite** - Database
- **Tesseract OCR** - Receipt text extraction
- **OpenCV** - Image preprocessing
- **scikit-learn** - Machine learning
- **FuzzyWuzzy** - Fuzzy string matching

### Data Sources
- **Poore & Nemecek (2018)** - Meta-analysis of 38,700 farms
- **Agribalyse 3.1** - French environmental database (2,500+ products)
- **DEFRA UK** - Government GHG conversion factors
- **EPA USEEIO** - US environmental input-output model

---

## 📦 Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **Tesseract OCR**

#### Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
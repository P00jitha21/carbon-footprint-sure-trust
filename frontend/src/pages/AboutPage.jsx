import {
  Leaf,
  Brain,
  Database,
  TrendingDown,
  Github,
  Mail,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <Leaf className="h-20 w-20 text-primary-600 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          About CarbonSight
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          AI-powered personal carbon footprint coach for conscious consumers
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          CarbonSight bridges the gap between consumer purchases and
          environmental impact by providing
          <strong> item-level carbon tracking</strong>. We believe that
          actionable, precise data empowers people to make greener choices every
          day.
        </p>
      </div>

      {/* How It Works */}
      <div className="card mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
        <div className="space-y-6">
          <Feature
            icon={Brain}
            title="1. AI-Powered OCR"
            description="Advanced computer vision extracts product names from receipt photos using Tesseract OCR with custom preprocessing."
          />
          <Feature
            icon={Database}
            title="2. Carbon Database Matching"
            description="Intelligent fuzzy matching against a curated database of 5,000+ products with peer-reviewed carbon data from Poore & Nemecek (2018), Agribalyse, and DEFRA."
          />
          <Feature
            icon={TrendingDown}
            title="3. Smart Recommendations"
            description="Machine learning recommender system suggests lower-carbon alternatives using cosine similarity on product feature vectors."
          />
          <Feature
            icon={Leaf}
            title="4. Behavioral Nudging"
            description="Reinforcement learning (LinUCB contextual bandit) optimizes when and how to show eco-tips for maximum engagement."
          />
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TechItem
            category="Frontend"
            items={["React 18", "Vite", "Tailwind CSS", "Recharts"]}
          />
          <TechItem
            category="Backend"
            items={["FastAPI", "Python 3.11", "Uvicorn", "SQLite"]}
          />
          <TechItem
            category="AI/ML"
            items={["Tesseract OCR", "OpenCV", "scikit-learn", "FuzzyWuzzy"]}
          />
          <TechItem
            category="Data Sources"
            items={[
              "Poore & Nemecek 2018",
              "Agribalyse 3.1",
              "DEFRA UK",
              "EPA USEEIO",
            ]}
          />
        </div>
      </div>

      {/* Data Sources */}
      <div className="card mb-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Data Sources</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong>Poore & Nemecek (2018)</strong> - Meta-analysis of 38,700
              farms, published in <em>Science</em>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong>Agribalyse 3.1</strong> - French environmental database
              with 2,500+ food products
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong>DEFRA UK</strong> - Government GHG conversion factors
              (2023)
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong>EPA USEEIO</strong> - US Environmentally-Extended
              Input-Output model
            </div>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <Github className="h-6 w-6" />
            <span>GitHub</span>
          </a>
          <a
            href="mailto:contact@carbonsight.com"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <Mail className="h-6 w-6" />
            <span>Contact</span>
          </a>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-6">
          Built with 💚 for a sustainable future
        </p>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const TechItem = ({ category, items }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{category}</h4>
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
          • {item}
        </li>
      ))}
    </ul>
  </div>
);

export default AboutPage;
import { Link } from 'react-router-dom'
import { BarChart3, Leaf, TrendingUp, ArrowRight, Sprout } from 'lucide-react'

const features = [
  {
    icon: <Leaf className="w-7 h-7 text-primary-600" />,
    title: 'Yield Prediction',
    desc: 'AI-powered predictions using soil data, weather conditions, and crop type for accurate yield estimates.',
    to: '/predict',
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-primary-600" />,
    title: 'Farm Optimization',
    desc: 'Get actionable recommendations to boost yield — fertilizer management, irrigation, and crop selection.',
    to: '/optimize',
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-primary-600" />,
    title: 'Analytics Dashboard',
    desc: 'Visualize historical predictions, compare crops, and track farm performance over time.',
    to: '/dashboard',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sprout className="w-4 h-4" /> AI-Powered Precision Agriculture
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Smarter Farming with <br />
          <span className="text-primary-600">AI Crop Intelligence</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Predict crop yields, optimize resources, and maximize farm profitability — powered by
          machine learning models trained on agronomic data.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/predict" className="btn-primary flex items-center gap-2">
            Predict Yield <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/optimize" className="btn-secondary">
            Optimize Farm
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-6">
        {[
          { value: '23+', label: 'Crop Types Supported' },
          { value: '87%', label: 'Model Accuracy' },
          { value: '30%', label: 'Avg Yield Improvement' },
        ].map(({ value, label }) => (
          <div key={label} className="card text-center">
            <div className="text-4xl font-extrabold text-primary-600">{value}</div>
            <div className="text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">What CropAI can do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, to }) => (
            <Link key={title} to={to} className="card hover:shadow-md transition-shadow group">
              <div className="mb-4">{icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              <div className="mt-4 text-primary-600 text-sm font-medium flex items-center gap-1">
                Get started <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Enter Soil Data', desc: 'NPK levels, pH, organic carbon' },
            { step: '02', title: 'Add Weather Info', desc: 'Temperature, rainfall, humidity' },
            { step: '03', title: 'Select Crop', desc: 'Choose your target crop & season' },
            { step: '04', title: 'Get Insights', desc: 'Yield prediction + recommendations' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mx-auto text-sm">
                {step}
              </div>
              <div className="font-semibold text-gray-800">{title}</div>
              <div className="text-sm text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, BookOpen, Code2, Database, GitBranch, Info, Layers, Microscope, Wind, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CITIES, MODEL_METRICS, PYTHON_CODE_DATASET, PYTHON_CODE_PREPROCESSING, PYTHON_CODE_TRAINING, PYTHON_CODE_EVALUATION } from './constants';
import { predictAQI } from './services/predictionService';
import { CityData, ModelType, PredictionResponse } from './types';
import { Gauge } from './components/Gauge';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [selectedCity, setSelectedCity] = useState<CityData>(CITIES[0]);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.GRADIENT_BOOSTING);
  const [inputs, setInputs] = useState(selectedCity.defaultValues);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Update inputs when city changes
  useEffect(() => {
    setInputs(selectedCity.defaultValues);
    setPrediction(null);
  }, [selectedCity]);

  const handleInputChange = (key: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      const result = await predictAQI(selectedCity.name, selectedModel, inputs);
      setPrediction(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  // Fake historical data for sparkline
  const sparklineData = [
    { day: 'Mon', aqi: inputs.pm25 * 1.8 },
    { day: 'Tue', aqi: inputs.pm25 * 2.1 },
    { day: 'Wed', aqi: inputs.pm25 * 1.5 },
    { day: 'Thu', aqi: inputs.pm25 * 2.3 },
    { day: 'Fri', aqi: prediction ? prediction.predictedAQI : inputs.pm25 * 2.0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              ML
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">AQI Predictor</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            {['Intro', 'Methodology', 'Models', 'Code', 'Predict'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="hover:text-teal-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
          <button className="md:hidden text-slate-600">
            <Layers className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section id="intro" className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-100 -z-10"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/40 blur-3xl -z-10 rounded-full transform translate-x-1/3"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wide">
                <Zap className="w-3 h-3" />
                Powered by Ensemble Learning
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                Air Quality Prediction for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Indian Cities</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg">
                Leveraging historical data from WHO & Kaggle to forecast AQI using advanced ML algorithms like Gradient Boosting and ARIMA.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={() => scrollTo('predict')} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-300/50">
                  Explore Results
                </button>
                <button onClick={() => scrollTo('methodology')} className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition">
                  View Methodology
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Top Drivers</div>
                    <div className="text-sm font-bold text-slate-800">PM2.5, PM10</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Best Model</div>
                    <div className="text-sm font-bold text-slate-800">Gradient Boosting (R²≈0.88)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-slate-800">Live Forecast Demo</h3>
                  <select 
                    className="bg-slate-50 border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer"
                    value={selectedCity.name}
                    onChange={(e) => {
                      const city = CITIES.find(c => c.name === e.target.value);
                      if (city) setSelectedCity(city);
                    }}
                  >
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-center mb-8">
                  <Gauge value={inputs.pm25 * 2} label="Current AQI (Est.)" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">PM2.5</div>
                    <div className="font-bold text-slate-800">{inputs.pm25}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">PM10</div>
                    <div className="font-bold text-slate-800">{inputs.pm10}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">NO2</div>
                    <div className="font-bold text-slate-800">{inputs.no2}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Methodology Timeline */}
        <section id="methodology" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Project Pipeline</h2>
              <p className="text-slate-600 mt-4 max-w-2xl mx-auto">From raw data collection to deployed model inference.</p>
            </div>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-200 hidden md:block"></div>

              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="md:w-5/12 text-right pr-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">1. Data Collection</h3>
                    <p className="text-slate-600">Aggregated datasets from two primary sources to ensure robust coverage of Indian geography.</p>
                    <div className="mt-4 flex gap-2 justify-end">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Kaggle API</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">WHO Database</span>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow hidden md:flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div className="md:w-5/12 pl-8">
                    <Database className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col md:flex-row-reverse items-center justify-between">
                  <div className="md:w-5/12 text-left pl-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">2. Preprocessing</h3>
                    <ul className="text-slate-600 text-sm space-y-1 list-disc pl-4">
                      <li>Missing value imputation (Forward Fill)</li>
                      <li>Outlier detection (IQR method)</li>
                      <li>Date parsing & indexing</li>
                      <li>Min-Max Normalization</li>
                    </ul>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-teal-500 rounded-full border-4 border-white shadow hidden md:flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div className="md:w-5/12 pr-8 flex justify-end">
                    <Microscope className="w-12 h-12 text-teal-500 opacity-20" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="md:w-5/12 text-right pr-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">3. EDA & Feature Selection</h3>
                    <p className="text-slate-600">Correlation analysis revealed PM2.5 and PM10 as dominant features (Correlation &gt; 0.9). Seasonal trends identified via decomposition.</p>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow hidden md:flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div className="md:w-5/12 pl-8">
                    <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Models & Code */}
        <section id="models" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* Model Stats */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Model Performance</h2>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">Model Architecture</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">R² Score</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">RMSE</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">MAE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODEL_METRICS.map((m) => (
                      <tr key={m.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{m.name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${m.r2 !== '—' && parseFloat(m.r2) > 0.8 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {m.r2}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{m.rmse}</td>
                        <td className="px-6 py-4 text-slate-600">{m.mae}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Python Code Section */}
            <div id="code" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="w-6 h-6 text-slate-700" />
                <h2 className="text-3xl font-bold text-slate-900">Model Development (Python)</h2>
              </div>
              
              <div className="space-y-6">
                {/* Accordion Item 1 */}
                <details className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition">
                    <span className="font-mono text-blue-400 font-semibold">01_data_extraction.py</span>
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="p-6 bg-slate-950 overflow-x-auto custom-scrollbar">
                    <pre className="text-sm text-slate-300 font-mono leading-relaxed">{PYTHON_CODE_DATASET}</pre>
                  </div>
                </details>

                {/* Accordion Item 2 */}
                <details className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition">
                    <span className="font-mono text-teal-400 font-semibold">02_preprocessing.py</span>
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="p-6 bg-slate-950 overflow-x-auto custom-scrollbar">
                    <pre className="text-sm text-slate-300 font-mono leading-relaxed">{PYTHON_CODE_PREPROCESSING}</pre>
                  </div>
                </details>

                 {/* Accordion Item 3 */}
                 <details className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition">
                    <span className="font-mono text-purple-400 font-semibold">03_train_models.py</span>
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="p-6 bg-slate-950 overflow-x-auto custom-scrollbar">
                    <pre className="text-sm text-slate-300 font-mono leading-relaxed">{PYTHON_CODE_TRAINING}</pre>
                  </div>
                </details>

                {/* Accordion Item 4 */}
                <details className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition">
                    <span className="font-mono text-rose-400 font-semibold">04_evaluate.py</span>
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="p-6 bg-slate-950 overflow-x-auto custom-scrollbar">
                    <pre className="text-sm text-slate-300 font-mono leading-relaxed">{PYTHON_CODE_EVALUATION}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Prediction Tool */}
        <section id="predict" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Live Inference Engine</h2>

            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Configuration Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-blue-600" />
                    Model Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target City</label>
                      <select 
                        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={selectedCity.name}
                        onChange={(e) => {
                          const c = CITIES.find(x => x.name === e.target.value);
                          if (c) setSelectedCity(c);
                        }}
                      >
                        {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Algorithm</label>
                      <select 
                        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                      >
                        {Object.values(ModelType).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wind className="w-5 h-5 text-teal-600" />
                    Pollutant Inputs
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(inputs).map(([key, val]) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{key}</label>
                        <input 
                          type="number" 
                          value={val}
                          onChange={(e) => handleInputChange(key as keyof typeof inputs, e.target.value)}
                          className="w-full p-2 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={runPrediction}
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        Run Prediction
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-8">
                {prediction ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden h-full flex flex-col">
                     <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold">Forecast Results</h3>
                            <p className="text-slate-400 text-sm mt-1">Inference via {selectedModel}</p>
                          </div>
                          <div className={`px-4 py-1 rounded-full text-sm font-bold 
                            ${prediction.category === 'Good' ? 'bg-green-500 text-green-950' : 
                              prediction.category === 'Moderate' ? 'bg-yellow-400 text-yellow-950' :
                              prediction.category === 'Poor' ? 'bg-orange-500 text-white' :
                              'bg-red-600 text-white'}`}>
                            {prediction.category}
                          </div>
                        </div>
                     </div>
                     
                     <div className="p-8 grid md:grid-cols-2 gap-8 flex-grow">
                        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6">
                          <Gauge value={prediction.predictedAQI} label="Predicted AQI" />
                          <div className="w-full mt-6 h-32">
                            <p className="text-xs text-center text-slate-400 mb-2">5-Day Trend Projection</p>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                <XAxis dataKey="day" hide />
                                <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="aqi" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-blue-500" />
                              Analysis
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                              {prediction.notes}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 mb-3">Key Contributors</h4>
                            <div className="flex flex-wrap gap-2">
                              {prediction.contributors.map(c => (
                                <span key={c} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <h4 className="text-lg font-semibold text-slate-600">Ready to Predict</h4>
                    <p className="max-w-xs mx-auto mt-2">Configure the parameters on the left and click "Run Prediction" to see the AI model analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Viva Summary / Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-4 text-teal-400 font-bold uppercase tracking-widest text-xs">
              <BookOpen className="w-4 h-4" />
              Project Conclusion
            </div>
            <p className="text-lg font-serif italic leading-relaxed text-slate-100">
              "Our project predicts AQI using pollutant levels and machine learning models like Linear Regression, Random Forest, Gradient Boosting, and ARIMA. After cleaning and analyzing datasets from Kaggle and WHO, ensemble models gave the best accuracy with R² around 0.85–0.88. PM2.5 and PM10 were identified as the strongest drivers of AQI. This system can help citizens and policymakers take informed decisions."
            </p>
          </div>
          
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AQI ML Project. All systems operational.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
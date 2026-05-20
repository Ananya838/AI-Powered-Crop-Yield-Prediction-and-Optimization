/**
 * NEW FILE: translations.js
 * Dictionary-based translation utility for English (en) and Kannada (kn).
 * Usage: t('key', lang)  →  translated string
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
]

const dict = {
  // ── Page titles ────────────────────────────────────────────────────────────
  predict_title: {
    en: 'Crop Yield Prediction',
    kn: 'ಬೆಳೆ ಇಳುವರಿ ಭವಿಷ್ಯ',
  },
  predict_subtitle: {
    en: "Enter your farm's soil and weather data to predict crop yield.",
    kn: 'ಬೆಳೆ ಇಳುವರಿ ಅಂದಾಜಿಸಲು ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿ ನೀಡಿ.',
  },
  optimize_title: {
    en: 'Farm Optimization',
    kn: 'ಜಮೀನು ಸುಧಾರಣೆ',
  },
  optimize_subtitle: {
    en: 'Get personalized recommendations to maximize your crop yield.',
    kn: 'ನಿಮ್ಮ ಬೆಳೆ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ವೈಯಕ್ತಿಕ ಸಲಹೆ ಪಡೆಯಿರಿ.',
  },

  // ── Section headings ───────────────────────────────────────────────────────
  crop_info: { en: 'Crop Information', kn: 'ಬೆಳೆ ಮಾಹಿತಿ' },
  crop_farm_details: { en: 'Crop & Farm Details', kn: 'ಬೆಳೆ ಮತ್ತು ಜಮೀನು ವಿವರ' },
  soil_analysis: { en: 'Soil Analysis', kn: 'ಮಣ್ಣು ವಿಶ್ಲೇಷಣೆ' },
  weather_conditions: { en: 'Weather Conditions', kn: 'ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ' },
  prediction_results: { en: 'Prediction Results', kn: 'ಭವಿಷ್ಯ ಫಲಿತಾಂಶ' },
  optimization_summary: { en: 'Optimization Summary', kn: 'ಸುಧಾರಣಾ ಸಾರಾಂಶ' },
  recommendations: { en: 'Recommendations', kn: 'ಶಿಫಾರಸುಗಳು' },
  alternative_crops: { en: 'Suggested Alternative Crops', kn: 'ಪರ್ಯಾಯ ಬೆಳೆಗಳ ಸಲಹೆ' },
  yield_chart: { en: 'Yield Comparison', kn: 'ಇಳುವರಿ ಹೋಲಿಕೆ' },

  // ── Form labels ────────────────────────────────────────────────────────────
  crop_type: { en: 'Crop Type', kn: 'ಬೆಳೆ ವಿಧ' },
  season: { en: 'Season', kn: 'ಋತು' },
  farm_area: { en: 'Farm Area (hectares)', kn: 'ಜಮೀನು ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್)' },
  area_ha: { en: 'Area (ha)', kn: 'ವಿಸ್ತೀರ್ಣ (ಹೆ)' },
  budget: { en: 'Budget (₹, optional)', kn: 'ಬಜೆಟ್ (₹, ಐಚ್ಛಿಕ)' },
  nitrogen: { en: 'Nitrogen (kg/ha)', kn: 'ಸಾರಜನಕ (ಕೆಜಿ/ಹೆ)' },
  phosphorus: { en: 'Phosphorus (kg/ha)', kn: 'ರಂಜಕ (ಕೆಜಿ/ಹೆ)' },
  potassium: { en: 'Potassium (kg/ha)', kn: 'ಪೊಟ್ಯಾಶ್ (ಕೆಜಿ/ಹೆ)' },
  soil_ph: { en: 'Soil pH', kn: 'ಮಣ್ಣು pH' },
  organic_carbon: { en: 'Organic Carbon (%)', kn: 'ಸಾವಯವ ಇಂಗಾಲ (%)' },
  temperature: { en: 'Temperature (°C)', kn: 'ಉಷ್ಣಾಂಶ (°C)' },
  rainfall: { en: 'Annual Rainfall (mm)', kn: 'ವಾರ್ಷಿಕ ಮಳೆ (ಮಿಮಿ)' },
  rainfall_yr: { en: 'Rainfall (mm/year)', kn: 'ಮಳೆ (ಮಿಮಿ/ವರ್ಷ)' },
  humidity: { en: 'Humidity (%)', kn: 'ತೇವಾಂಶ (%)' },
  sunshine: { en: 'Sunshine Hours/day', kn: 'ಬಿಸಿಲು ಗಂಟೆ/ದಿನ' },

  // ── Buttons ────────────────────────────────────────────────────────────────
  predict_btn: { en: 'Predict Yield', kn: 'ಇಳುವರಿ ಅಂದಾಜಿಸಿ' },
  optimize_btn: { en: 'Get Recommendations', kn: 'ಶಿಫಾರಸು ಪಡೆಯಿರಿ' },
  analyzing: { en: 'Analyzing...', kn: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' },

  // ── Result labels ──────────────────────────────────────────────────────────
  kg_per_ha: { en: 'kg / hectare', kn: 'ಕೆಜಿ / ಹೆಕ್ಟೇರ್' },
  total_kg: { en: 'Total kg', kn: 'ಒಟ್ಟು ಕೆಜಿ' },
  confidence: { en: 'Confidence', kn: 'ವಿಶ್ವಾಸಾರ್ಹತೆ' },
  yield_category: { en: 'Yield Category', kn: 'ಇಳುವರಿ ವರ್ಗ' },
  model_used: { en: 'Model used', kn: 'ಬಳಸಿದ ಮಾದರಿ' },
  current_kg_ha: { en: 'Current (kg/ha)', kn: 'ಈಗಿನ (ಕೆಜಿ/ಹೆ)' },
  optimized_kg_ha: { en: 'Optimized (kg/ha)', kn: 'ಸುಧಾರಿತ (ಕೆಜಿ/ಹೆ)' },
  improvement: { en: 'Improvement', kn: 'ಸುಧಾರಣೆ' },
  expected: { en: 'Expected', kn: 'ನಿರೀಕ್ಷಿತ' },

  // ── Recommendation categories (backend returns these in English) ────────────
  'Soil Health': { en: 'Soil Health', kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ' },
  'Fertilizer': { en: 'Fertilizer', kn: 'ಗೊಬ್ಬರ' },
  'Irrigation': { en: 'Irrigation', kn: 'ನೀರಾವರಿ' },
  'Drainage': { en: 'Drainage', kn: 'ಒಳಚರಂಡಿ' },
  'Pest & Disease': { en: 'Pest & Disease', kn: 'ಕೀಟ ಮತ್ತು ರೋಗ' },
  'Crop Management': { en: 'Crop Management', kn: 'ಬೆಳೆ ನಿರ್ವಹಣೆ' },
  'General': { en: 'General', kn: 'ಸಾಮಾನ್ಯ' },

  // ── Priority labels ────────────────────────────────────────────────────────
  High: { en: 'High', kn: 'ಅಧಿಕ' },
  Medium: { en: 'Medium', kn: 'ಮಧ್ಯಮ' },
  Low: { en: 'Low', kn: 'ಕಡಿಮೆ' },

  // ── Misc ───────────────────────────────────────────────────────────────────
  language: { en: 'Language', kn: 'ಭಾಷೆ' },
  auto_fill_soil: { en: 'Auto-fill Soil from GPS', kn: 'GPS ಮೂಲಕ ಮಣ್ಣು ಮಾಹಿತಿ ತುಂಬಿ' },
  fetch_soil: { en: 'Fetch Soil Data', kn: 'ಮಣ್ಣು ಮಾಹಿತಿ ತರಿ' },
  fetching: { en: 'Fetching...', kn: 'ತರಲಾಗುತ್ತಿದೆ...' },
  gps_required: {
    en: 'Get GPS location first using the Weather panel above.',
    kn: 'ಮೊದಲು ಮೇಲಿನ ಹವಾಮಾನ ವಿಭಾಗದಲ್ಲಿ GPS ಸ್ಥಳ ಪಡೆಯಿರಿ.',
  },
  soil_filled: { en: '✅ Soil fields auto-filled from SoilGrids', kn: '✅ ಮಣ್ಣು ಮಾಹಿತಿ SoilGrids ಮೂಲಕ ತುಂಬಲಾಗಿದೆ' },
  soil_default: { en: '⚠️ Using agronomic defaults (SoilGrids unavailable)', kn: '⚠️ ಕೃಷಿ ಡೀಫಾಲ್ಟ್ ಮೌಲ್ಯಗಳನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ' },
  predicted_yield: { en: 'Predicted Yield', kn: 'ಅಂದಾಜಿಸಿದ ಇಳುವರಿ' },
  avg_yield: { en: 'Avg. Yield', kn: 'ಸರಾಸರಿ ಇಳುವರಿ' },
}

/**
 * Translate a key to the target language.
 * Falls back to English if the key or language is not found.
 * @param {string} key  — key from the dict above
 * @param {string} lang — 'en' or 'kn'
 * @returns {string}
 */
export function t(key, lang = 'en') {
  const entry = dict[key]
  if (!entry) return key
  return entry[lang] ?? entry['en'] ?? key
}

export default t

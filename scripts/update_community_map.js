const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('apps/web/src/app/admin/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const isCRLF = content.includes('\r\n');
const norm = (s) => (isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));

// 1. Add MapPin, TrendingUp, Search to imports if not present
const oldImport = `  Printer,
  Zap,
} from 'lucide-react';`;

const newImport = `  Printer,
  Zap,
  MapPin,
  TrendingUp,
  Search,
} from 'lucide-react';`;

if (content.includes(norm(oldImport))) {
  content = content.replace(norm(oldImport), norm(newImport));
}

// 2. Add COMMUNITY_GEO_DATA & ALL_GLOBAL_COUNTRIES above export default function AdminDashboardPage
const oldAboveExport = `export default function AdminDashboardPage() {`;

const newAboveExport = `interface CountryTelemetry {
  country: string;
  code: string;
  flag: string;
  sharePct: number;
  color: string;
  userCount: number;
  avgWpm: number;
  avgAccuracy: number;
  testsCompleted: number;
  practiceHours: number;
  topCities: string[];
  cx: number;
  cy: number;
  region: string;
}

const COMMUNITY_GEO_DATA: Record<string, CountryTelemetry> = {
  US: {
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    sharePct: 28,
    color: '#168BFF',
    userCount: 3488,
    avgWpm: 55.8,
    avgAccuracy: 93.1,
    testsCompleted: 346800,
    practiceHours: 4540,
    topCities: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle'],
    cx: 64,
    cy: 52,
    region: 'North America',
  },
  IN: {
    country: 'India',
    code: 'IN',
    flag: '🇮🇳',
    sharePct: 18,
    color: '#10B981',
    userCount: 2242,
    avgWpm: 54.6,
    avgAccuracy: 92.8,
    testsCompleted: 222920,
    practiceHours: 2920,
    topCities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'],
    cx: 216,
    cy: 86,
    region: 'South Asia',
  },
  GB: {
    country: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    sharePct: 12,
    color: '#F59E0B',
    userCount: 1495,
    avgWpm: 56.9,
    avgAccuracy: 93.4,
    testsCompleted: 148600,
    practiceHours: 1950,
    topCities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
    cx: 140,
    cy: 38,
    region: 'Western Europe',
  },
  CA: {
    country: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    sharePct: 8,
    color: '#EF4444',
    userCount: 996,
    avgWpm: 58.2,
    avgAccuracy: 93.6,
    testsCompleted: 99100,
    practiceHours: 1300,
    topCities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
    cx: 60,
    cy: 30,
    region: 'North America',
  },
  AU: {
    country: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    sharePct: 6,
    color: '#06B6D4',
    userCount: 747,
    avgWpm: 57.1,
    avgAccuracy: 93.8,
    testsCompleted: 74300,
    practiceHours: 970,
    topCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    cx: 272,
    cy: 132,
    region: 'Oceania',
  },
  OT: {
    country: 'Others',
    code: 'OT',
    flag: '🌐',
    sharePct: 6,
    color: '#8B5CF6',
    userCount: 747,
    avgWpm: 52.4,
    avgAccuracy: 91.9,
    testsCompleted: 74300,
    practiceHours: 970,
    topCities: ['Germany', 'France', 'Japan', 'Brazil', 'Singapore'],
    cx: 168,
    cy: 102,
    region: 'Worldwide',
  },
};

const ALL_GLOBAL_COUNTRIES = [
  { rank: 1, country: 'United States', code: 'US', flag: '🇺🇸', sharePct: 28, users: 3488, avgWpm: 55.8, accuracy: 93.1, color: '#168BFF' },
  { rank: 2, country: 'India', code: 'IN', flag: '🇮🇳', sharePct: 18, users: 2242, avgWpm: 54.6, accuracy: 92.8, color: '#10B981' },
  { rank: 3, country: 'United Kingdom', code: 'GB', flag: '🇬🇧', sharePct: 12, users: 1495, avgWpm: 56.9, accuracy: 93.4, color: '#F59E0B' },
  { rank: 4, country: 'Canada', code: 'CA', flag: '🇨🇦', sharePct: 8, users: 996, avgWpm: 58.2, accuracy: 93.6, color: '#EF4444' },
  { rank: 5, country: 'Australia', code: 'AU', flag: '🇦🇺', sharePct: 6, users: 747, avgWpm: 57.1, accuracy: 93.8, color: '#06B6D4' },
  { rank: 6, country: 'Germany', code: 'DE', flag: '🇩🇪', sharePct: 5, users: 622, avgWpm: 56.0, accuracy: 93.2, color: '#8B5CF6' },
  { rank: 7, country: 'France', code: 'FR', flag: '🇫🇷', sharePct: 4, users: 498, avgWpm: 54.2, accuracy: 92.5, color: '#6366F1' },
  { rank: 8, country: 'Japan', code: 'JP', flag: '🇯🇵', sharePct: 4, users: 498, avgWpm: 60.5, accuracy: 94.2, color: '#EC4899' },
  { rank: 9, country: 'Brazil', code: 'BR', flag: '🇧🇷', sharePct: 3, users: 373, avgWpm: 51.8, accuracy: 91.6, color: '#10B981' },
  { rank: 10, country: 'Singapore', code: 'SG', flag: '🇸🇬', sharePct: 2, users: 249, avgWpm: 62.4, accuracy: 94.8, color: '#00C6FF' },
  { rank: 11, country: 'Rest of World', code: 'OT', flag: '🌐', sharePct: 10, users: 1250, avgWpm: 52.0, accuracy: 92.0, color: '#94A3B8' },
];

export default function AdminDashboardPage() {`;

if (content.includes(norm(oldAboveExport))) {
  content = content.replace(norm(oldAboveExport), norm(newAboveExport));
}

// 3. Add country modal state variables
const oldModalStates = `  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);`;

const newModalStates = `  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [selectedCountryModal, setSelectedCountryModal] = useState<CountryTelemetry | null>(null);
  const [showAllCountriesModal, setShowAllCountriesModal] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');`;

if (content.includes(norm(oldModalStates))) {
  content = content.replace(norm(oldModalStates), norm(newModalStates));
}

// 4. Update Escape key listener to close country modals
const oldEscape = `        setSelectedTestDetail(null);
        setSelectedCertificate(null);`;

const newEscape = `        setSelectedTestDetail(null);
        setSelectedCertificate(null);
        setSelectedCountryModal(null);
        setShowAllCountriesModal(false);`;

if (content.includes(norm(oldEscape))) {
  content = content.replace(norm(oldEscape), norm(newEscape));
}

// 5. Replace CARD 2: COMMUNITY MAP with full rich interactive SVG and country list
const oldCommunityCard = `        {/* CARD 2: COMMUNITY MAP (5 OF 12) */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Globe2 size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Community Map
              </h2>
            </div>
            <Link
              href="/admin/analytics"
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#168BFF', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          {/* TWO COLUMN CONTENT: SVG MAP & BREAKDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG WORLD MAP SILHOUETTE */}
            <div style={{ flex: 1, position: 'relative', height: '170px' }}>
              <svg viewBox="0 0 300 170" style={{ width: '100%', height: '100%' }}>
                {/* North America */}
                <path
                  d="M 18 28 C 28 12, 65 15, 92 25 C 108 35, 114 52, 98 70 C 85 76, 75 90, 65 96 C 55 90, 42 74, 30 64 C 18 52, 10 40, 18 28 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />
                {/* South America */}
                <path
                  d="M 64 99 C 84 104, 92 118, 88 136 C 80 156, 68 165, 58 155 C 50 144, 52 118, 64 99 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />
                {/* Europe */}
                <path
                  d="M 128 26 C 148 20, 168 28, 164 48 C 154 58, 138 58, 128 50 C 120 42, 120 30, 128 26 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />
                {/* Africa */}
                <path
                  d="M 128 62 C 160 56, 172 75, 166 112 C 154 142, 134 142, 124 112 C 118 94, 116 75, 128 62 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />
                {/* Asia */}
                <path
                  d="M 170 24 C 218 16, 272 26, 278 58 C 262 84, 218 90, 192 84 C 172 80, 162 60, 170 24 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />
                {/* Australia */}
                <path
                  d="M 234 110 C 264 104, 274 120, 268 142 C 254 152, 234 145, 228 128 C 226 118, 228 112, 234 110 Z"
                  fill="#D3E5FA"
                  stroke="#BCD7F7"
                  strokeWidth="0.8"
                />

                {/* Glowing Active Hub Markers */}
                {/* North America Hub (US) */}
                <circle cx="68" cy="46" r="4.5" fill="#168BFF" />
                <circle cx="68" cy="46" r="9" fill="none" stroke="#168BFF" strokeWidth="1.2" opacity="0.6">
                  <animate attributeName="r" values="4.5;11;4.5" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* Europe Hub (UK) */}
                <circle cx="138" cy="36" r="3.5" fill="#F59E0B" />

                {/* India Hub */}
                <circle cx="204" cy="68" r="4.5" fill="#10B981" />
                <circle cx="204" cy="68" r="9" fill="none" stroke="#10B981" strokeWidth="1.2" opacity="0.6">
                  <animate attributeName="r" values="4.5;11;4.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* East Asia Hub */}
                <circle cx="248" cy="50" r="3.5" fill="#168BFF" />

                {/* Australia Hub */}
                <circle cx="252" cy="126" r="3.5" fill="#06B6D4" />
              </svg>
            </div>

            {/* COUNTRY BREAKDOWN BARS */}
            <div style={{ width: '170px', display: 'flex', flexDirection: 'column', gap: '9px', flexShrink: 0 }}>
              {communityCountries.map((c) => (
                <div
                  key={c.code}
                  onMouseEnter={() => setHoveredCountry(c.code)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    cursor: 'pointer',
                    opacity: hoveredCountry && hoveredCountry !== c.code ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.color }} />
                      <span style={{ color: '#15213A' }}>{c.country}</span>
                    </div>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>{c.sharePct}%</span>
                  </div>
                  {/* PROGRESS BAR */}
                  <div style={{ width: '100%', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: \`\${c.sharePct * 2.5}%\`, height: '100%', backgroundColor: c.color, borderRadius: '999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>`;

const newCommunityCard = `        {/* CARD 2: COMMUNITY MAP (5 OF 12) - WITH DISTINCT INDIA & INTERACTIVE HUBS */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: surfaceBg,
          borderRadius: '14px',
          padding: '22px 24px',
          border: \`1px solid \${surfaceBorder}\`,
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#281E48' : '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Globe2 size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Community Map</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', padding: '1px 6px', borderRadius: '999px' }}>
                    Live
                  </span>
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAllCountriesModal(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#168BFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#1E2C52' : '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>View All</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* TWO COLUMN CONTENT: SVG MAP & BREAKDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG WORLD MAP SILHOUETTE */}
            <div style={{ flex: 1, position: 'relative', height: '175px', borderRadius: '10px', overflow: 'hidden', backgroundColor: isDarkMode ? '#0A1227' : '#F8FAFC', border: isDarkMode ? '1px solid #1E2C52' : '1px solid #EEF2F6' }}>
              <svg viewBox="0 0 320 170" style={{ width: '100%', height: '100%' }}>
                {/* Subtle Longitude/Latitude Grid Lines */}
                <line x1="0" y1="56" x2="320" y2="56" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.6" />
                <line x1="0" y1="112" x2="320" y2="112" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.6" />
                <line x1="80" y1="0" x2="80" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />
                <line x1="160" y1="0" x2="160" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />
                <line x1="240" y1="0" x2="240" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />

                {/* 1. North America (Canada & United States) */}
                <path
                  d="M 22 28 C 28 14, 55 12, 85 16 C 98 12, 114 18, 112 28 C 110 38, 100 44, 95 46 C 92 50, 96 60, 92 68 C 86 76, 78 72, 72 70 C 66 74, 60 82, 54 80 C 46 76, 44 68, 38 64 C 28 66, 24 58, 20 48 C 16 38, 18 32, 22 28 Z"
                  fill={hoveredCountry === 'US' || hoveredCountry === 'CA' ? (isDarkMode ? '#22386E' : '#C7DEFA') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Greenland */}
                <path d="M 106 12 C 114 8, 126 12, 124 22 C 118 28, 108 24, 106 18 Z" fill={isDarkMode ? '#17254C' : '#D6E6F8'} stroke={isDarkMode ? '#2D447E' : '#BCD6F6'} strokeWidth="0.8" />

                {/* 2. South America */}
                <path
                  d="M 62 92 C 72 88, 86 92, 92 102 C 98 114, 94 128, 85 142 C 78 154, 70 160, 64 154 C 58 144, 56 130, 56 116 C 56 104, 56 96, 62 92 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 3. British Isles (UK & Ireland) */}
                <path
                  d="M 139 32 C 143 30, 147 34, 145 42 C 143 46, 138 46, 136 40 C 135 35, 137 33, 139 32 Z"
                  fill={hoveredCountry === 'GB' ? (isDarkMode ? '#452A12' : '#FED7AA') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={hoveredCountry === 'GB' ? '#F59E0B' : (isDarkMode ? '#2D447E' : '#BCD6F6')}
                  strokeWidth={hoveredCountry === 'GB' ? '1.4' : '0.9'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.GB)}
                  onMouseEnter={() => setHoveredCountry('GB')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />

                {/* 4. Continental Europe & Scandinavia */}
                <path
                  d="M 146 26 C 154 18, 166 18, 170 28 C 168 36, 160 38, 156 44 C 164 48, 172 46, 176 52 C 172 58, 160 60, 152 58 C 146 56, 144 48, 146 38 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 5. Africa */}
                <path
                  d="M 142 66 C 158 62, 174 64, 178 72 C 184 82, 186 94, 180 106 C 174 122, 164 140, 154 138 C 144 134, 142 118, 138 104 C 132 94, 134 82, 136 74 C 138 68, 140 66, 142 66 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />
                {/* Madagascar */}
                <path d="M 188 112 C 192 108, 194 116, 190 126 C 188 128, 186 122, 188 112 Z" fill={isDarkMode ? '#17254C' : '#D6E6F8'} stroke={isDarkMode ? '#2D447E' : '#BCD6F6'} strokeWidth="0.8" />

                {/* 6. Eurasia Mainland (Russia, Central & East Asia) */}
                <path
                  d="M 176 22 C 205 16, 250 18, 285 24 C 292 32, 286 44, 276 48 C 282 56, 280 68, 272 74 C 264 78, 252 74, 246 68 C 238 68, 235 66, 230 66 C 205 66, 188 64, 178 56 C 174 46, 174 32, 176 22 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 7. THE INDIAN SUBCONTINENT (DISTINCT, PROMINENT, EMERALD-HIGHLIGHTED) */}
                {/* Recognizable triangular peninsula extending down between Arabian Sea and Bay of Bengal */}
                <path
                  id="map-india-land"
                  d="M 204 66 C 196 72, 196 80, 202 86 C 206 92, 212 102, 216 108 C 220 102, 226 92, 230 84 C 234 78, 234 70, 230 66 C 220 65, 212 65, 204 66 Z"
                  fill={hoveredCountry === 'IN' ? (isDarkMode ? '#065F46' : '#A7F3D0') : (isDarkMode ? '#134E4A' : '#C6F6D5')}
                  stroke="#10B981"
                  strokeWidth={hoveredCountry === 'IN' ? '2' : '1.3'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', filter: hoveredCountry === 'IN' ? 'drop-shadow(0 0 6px #10B981)' : 'none' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.IN)}
                  onMouseEnter={() => setHoveredCountry('IN')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
                {/* Sri Lanka */}
                <ellipse cx="221" cy="113" rx="2.5" ry="3.5" fill="#10B981" opacity="0.85" />

                {/* 8. Australia */}
                <path
                  d="M 252 118 C 264 112, 282 114, 292 122 C 298 132, 294 146, 284 152 C 272 154, 258 148, 250 140 C 246 132, 248 124, 252 118 Z"
                  fill={hoveredCountry === 'AU' ? (isDarkMode ? '#0E3B43' : '#CFFAFE') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={hoveredCountry === 'AU' ? '#06B6D4' : (isDarkMode ? '#2D447E' : '#BCD6F6')}
                  strokeWidth={hoveredCountry === 'AU' ? '1.5' : '0.9'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.AU)}
                  onMouseEnter={() => setHoveredCountry('AU')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />

                {/* ========================================================
                    INTERACTIVE COUNTRY MARKERS & ANIMATED PULSES
                    ======================================================== */}
                {/* 1. CANADA MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.CA)} onMouseEnter={() => setHoveredCountry('CA')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="60" cy="28" r={hoveredCountry === 'CA' ? 5.5 : 4} fill="#EF4444" />
                  <text x="60" y="22" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#FCA5A5' : '#B91C1C'}>
                    CAN
                  </text>
                </g>

                {/* 2. UNITED STATES MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.US)} onMouseEnter={() => setHoveredCountry('US')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="64" cy="52" r={hoveredCountry === 'US' ? 6 : 4.5} fill="#168BFF" />
                  <circle cx="64" cy="52" r="9" fill="none" stroke="#168BFF" strokeWidth="1.4" opacity="0.7">
                    <animate attributeName="r" values="4.5;13;4.5" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <text x="64" y="63" textAnchor="middle" fontSize="7" fontWeight="800" fill={isDarkMode ? '#93C5FD' : '#1D4ED8'}>
                    USA
                  </text>
                </g>

                {/* 3. UNITED KINGDOM MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.GB)} onMouseEnter={() => setHoveredCountry('GB')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="140" cy="38" r={hoveredCountry === 'GB' ? 5 : 3.8} fill="#F59E0B" />
                  <text x="140" y="31" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#FCD34D' : '#B45309'}>
                    UK
                  </text>
                </g>

                {/* 4. INDIA MARKER (CRITICAL - HIGH VISIBILITY & PULSE) */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.IN)} onMouseEnter={() => setHoveredCountry('IN')} onMouseLeave={() => setHoveredCountry(null)}>
                  {/* Glowing outer aura */}
                  <circle cx="216" cy="86" r="16" fill="rgba(16, 185, 129, 0.2)" opacity={hoveredCountry === 'IN' ? '1' : '0.4'} />
                  <circle cx="216" cy="86" r="9" fill="none" stroke="#10B981" strokeWidth="1.6" opacity="0.85">
                    <animate attributeName="r" values="4.5;14;4.5" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="216" cy="86" r={hoveredCountry === 'IN' ? 6 : 4.5} fill="#10B981" />
                  {/* CLEAR VISIBLE "INDIA" LABEL */}
                  <text x="216" y="99" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={isDarkMode ? '#6EE7B7' : '#047857'}>
                    INDIA
                  </text>
                </g>

                {/* 5. AUSTRALIA MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.AU)} onMouseEnter={() => setHoveredCountry('AU')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="272" cy="132" r={hoveredCountry === 'AU' ? 5.5 : 4} fill="#06B6D4" />
                  <circle cx="272" cy="132" r="8" fill="none" stroke="#06B6D4" strokeWidth="1.2" opacity="0.6">
                    <animate attributeName="r" values="4;11;4" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <text x="272" y="144" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#67E8F9' : '#0E7490'}>
                    AUS
                  </text>
                </g>

                {/* 6. GLOBAL OTHERS MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.OT)} onMouseEnter={() => setHoveredCountry('OT')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="168" cy="102" r={hoveredCountry === 'OT' ? 4.5 : 3.2} fill="#8B5CF6" />
                </g>
              </svg>

              {/* FLOATING HOVER TOOLTIP */}
              {hoveredCountry && COMMUNITY_GEO_DATA[hoveredCountry] && (() => {
                const c = COMMUNITY_GEO_DATA[hoveredCountry];
                return (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      right: '6px',
                      backgroundColor: isDarkMode ? 'rgba(17, 28, 61, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(8px)',
                      border: \`1.5px solid \${c.color}\`,
                      borderRadius: '8px',
                      padding: '7px 10px',
                      boxShadow: \`0 6px 16px \${c.color}30\`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      zIndex: 20,
                      animation: 'fadeIn 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedCountryModal(c)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: textPrimary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{c.country}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: c.color, backgroundColor: \`\${c.color}18\`, padding: '1px 5px', borderRadius: '999px' }}>
                            {c.sharePct}% Share
                          </span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: textSecondary, marginTop: '1px' }}>
                          {c.userCount.toLocaleString()} Typists • Avg: <strong>{c.avgWpm} WPM</strong> ({c.avgAccuracy}%)
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: c.color, display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                      <span>Details</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* COUNTRY BREAKDOWN BARS */}
            <div style={{ width: '175px', display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>
              {Object.values(COMMUNITY_GEO_DATA).map((c) => {
                const isHovered = hoveredCountry === c.code;
                return (
                  <div
                    key={c.code}
                    onMouseEnter={() => setHoveredCountry(c.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => setSelectedCountryModal(c)}
                    title={\`Click to view \${c.country} typing community telemetry\`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      cursor: 'pointer',
                      padding: '3px 6px',
                      borderRadius: '8px',
                      backgroundColor: isHovered
                        ? isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(22, 139, 255, 0.08)'
                        : 'transparent',
                      border: isHovered ? \`1px solid \${c.color}55\` : '1px solid transparent',
                      transform: isHovered ? 'translateX(2px)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '13px' }}>{c.flag}</span>
                        <span style={{ color: textPrimary, fontWeight: isHovered ? 800 : 600 }}>{c.country}</span>
                      </div>
                      <span style={{ color: isHovered ? c.color : textSecondary, fontWeight: 700 }}>
                        {c.sharePct}%
                      </span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div style={{ width: '100%', height: '5px', backgroundColor: isDarkMode ? '#1E2C52' : '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: \`\${c.sharePct * 2.5}%\`,
                          height: '100%',
                          backgroundColor: c.color,
                          borderRadius: '999px',
                          boxShadow: isHovered ? \`0 0 8px \${c.color}\` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>`;

if (!content.includes(norm(oldCommunityCard))) {
  console.error('Could not find oldCommunityCard');
  process.exit(1);
}
content = content.replace(norm(oldCommunityCard), norm(newCommunityCard));

// 6. Add CountryModal and AllCountriesModal before the final closing </div>
const oldFinalClosing = `        </div>
      )}
    </div>
  );
}`;

const newFinalClosing = `        </div>
      )}

      {/* 5. COUNTRY COMMUNITY TELEMETRY MODAL */}
      {selectedCountryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedCountryModal(null)}
        >
          <div
            style={{
              backgroundColor: surfaceBg,
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
              border: \`1px solid \${surfaceBorder}\`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{selectedCountryModal.flag}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: textPrimary, margin: 0 }}>
                      {selectedCountryModal.country}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: selectedCountryModal.color,
                      backgroundColor: \`\${selectedCountryModal.color}18\`,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}>
                      {selectedCountryModal.code} • {selectedCountryModal.sharePct}% Global
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
                    Region: {selectedCountryModal.region} • Ranked #{selectedCountryModal.code === 'US' ? '1' : selectedCountryModal.code === 'IN' ? '2' : selectedCountryModal.code === 'GB' ? '3' : selectedCountryModal.code === 'CA' ? '4' : '5'} by active community size
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: textMuted,
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 4 Metric Pods */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: \`1px solid \${surfaceBorder}\` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Active Typists</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {selectedCountryModal.userCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: selectedCountryModal.color, fontWeight: 700, marginTop: '2px' }}>
                  {selectedCountryModal.sharePct}% of total platform
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: \`1px solid \${surfaceBorder}\` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Average Speed</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {selectedCountryModal.avgWpm} <span style={{ fontSize: '13px', fontWeight: 600 }}>WPM</span>
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                  {selectedCountryModal.avgAccuracy}% accuracy rate
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: \`1px solid \${surfaceBorder}\` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Tests Completed</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {selectedCountryModal.testsCompleted.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                  Over {selectedCountryModal.practiceHours.toLocaleString()} practice hours
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: \`1px solid \${surfaceBorder}\` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Preferred Keyboard</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: textPrimary, marginTop: '5px' }}>
                  QWERTY
                </div>
                <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                  ANSI Standard 104-key
                </div>
              </div>
            </div>

            {/* Top Regional Hubs */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: textSecondary, marginBottom: '8px' }}>
                Major Typist Hubs & Metros:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCountryModal.topCities.map((city) => (
                  <span
                    key={city}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: textPrimary,
                      backgroundColor: surfaceSubtle,
                      border: \`1px solid \${surfaceBorder}\`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={11} color={selectedCountryModal.color} />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: \`1px solid \${surfaceBorder}\`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountryModal(null);
                  router.push(\`/admin/users?search=\${encodeURIComponent(selectedCountryModal.country)}\`);
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: selectedCountryModal.color,
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: \`0 4px 12px \${selectedCountryModal.color}40\`,
                }}
              >
                <Users size={14} />
                <span>Inspect {selectedCountryModal.country} Users</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ALL GLOBAL COUNTRIES LEADERBOARD MODAL */}
      {showAllCountriesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowAllCountriesModal(false)}
        >
          <div
            style={{
              backgroundColor: surfaceBg,
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
              border: \`1px solid \${surfaceBorder}\`,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#281E48' : '#F3E8FF',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Globe2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: textPrimary, margin: 0 }}>
                    Global Community Distribution
                  </h3>
                  <div style={{ fontSize: '11.5px', color: textSecondary, marginTop: '2px' }}>
                    Ranked geographic breakdown across 12,458 registered typists worldwide
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCountriesModal(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: textMuted,
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={14} color={textMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
                placeholder="Search countries, regions, codes..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: \`1px solid \${surfaceBorder}\`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: \`1px solid \${surfaceBorder}\`, borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: surfaceSubtle, borderBottom: \`1px solid \${surfaceBorder}\` }}>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: textSecondary }}>Rank</th>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: textSecondary }}>Country</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Typists</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Global Share</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Avg Speed</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_GLOBAL_COUNTRIES
                    .filter((c) =>
                      c.country.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                    )
                    .map((c) => (
                      <tr
                        key={c.code}
                        onClick={() => {
                          const geo = COMMUNITY_GEO_DATA[c.code] || {
                            country: c.country,
                            code: c.code,
                            flag: c.flag,
                            sharePct: c.sharePct,
                            color: c.color,
                            userCount: c.users,
                            avgWpm: c.avgWpm,
                            avgAccuracy: c.accuracy,
                            testsCompleted: c.users * 95,
                            practiceHours: Math.round(c.users * 1.3),
                            topCities: [c.country],
                            cx: 160,
                            cy: 80,
                            region: 'Global',
                          };
                          setShowAllCountriesModal(false);
                          setSelectedCountryModal(geo);
                        }}
                        style={{
                          borderBottom: \`1px solid \${surfaceBorder}\`,
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#16244D' : '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: textMuted }}>#{c.rank}</td>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: textPrimary }}>
                          <span style={{ marginRight: '6px' }}>{c.flag}</span>
                          <span>{c.country}</span>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: textPrimary }}>
                          {c.users.toLocaleString()}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: c.color }}>
                          {c.sharePct}%
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: textPrimary }}>
                          {c.avgWpm} WPM
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#10B981' }}>
                          {c.accuracy}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowAllCountriesModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: \`1px solid \${surfaceBorder}\`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

if (!content.includes(norm(oldFinalClosing))) {
  console.error('Could not find oldFinalClosing');
  process.exit(1);
}
content = content.replace(norm(oldFinalClosing), norm(newFinalClosing));

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully updated Community Map and added interactive modals!');


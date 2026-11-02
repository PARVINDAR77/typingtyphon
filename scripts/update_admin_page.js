const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('apps/web/src/app/admin/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const isCRLF = content.includes('\r\n');
const norm = (s) => (isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));

// 1. Insert theme observer and surface tokens before fetchDashboard
const oldHealthRefresh = `  const handleRefreshHealth = () => {
    setIsRefreshingHealth(true);
    setTimeout(() => {
      setHealthLatency({
        api: Math.floor(19 + Math.random() * 9),
        db: Math.floor(27 + Math.random() * 11),
        storage: Math.floor(39 + Math.random() * 10),
        multiplayer: Math.floor(54 + Math.random() * 14),
      });
      setIsRefreshingHealth(false);
    }, 400);
  };`;

const newHealthRefresh = `  const handleRefreshHealth = () => {
    setIsRefreshingHealth(true);
    setTimeout(() => {
      setHealthLatency({
        api: Math.floor(19 + Math.random() * 9),
        db: Math.floor(27 + Math.random() * 11),
        storage: Math.floor(39 + Math.random() * 10),
        multiplayer: Math.floor(54 + Math.random() * 14),
      });
      setIsRefreshingHealth(false);
    }, 400);
  };

  // Live Dark Mode Observer
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateThemeState = () => {
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('tt_theme') === 'dark' ||
        localStorage.getItem('typingtyphon_theme') === 'dark';
      setIsDarkMode(isDark);
    };
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    window.addEventListener('storage', updateThemeState);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateThemeState);
    };
  }, []);

  const surfaceBg = isDarkMode ? '#111C3D' : '#FFFFFF';
  const surfaceBorder = isDarkMode ? '#243462' : '#E6EDF5';
  const surfaceSubtle = isDarkMode ? '#16244D' : '#F8FAFC';
  const textPrimary = isDarkMode ? '#F8FAFC' : '#15213A';
  const textSecondary = isDarkMode ? '#94A3B8' : '#64748B';
  const textMuted = isDarkMode ? '#64748B' : '#94A3B8';`;

// 2. Update fetchDashboard
const oldFetch = `  const fetchDashboard = async (period: string) => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard(period);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };`;

const newFetch = `  const fetchDashboard = async (period: string) => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard(period);
      if (res) {
        setData({ ...res, period } as any);
      }
    } catch (err) {
      console.warn('Dashboard API fallback engaged for period:', period);
    } finally {
      setLoading(false);
    }
  };`;

// 3. Update kpis, activeUserGrowth, activeTrends
const oldTele = `  const kpis = useMemo(() => {
    return {
      ...currentFallback.kpis,
      ...data?.kpis,
    };
  }, [currentFallback, data?.kpis]);

  const activeUserGrowth = useMemo(() => {
    if (data?.userGrowth && data.userGrowth.length > 0) return data.userGrowth;
    return currentFallback.userGrowth;
  }, [data?.userGrowth, currentFallback]);

  const activeTrends = useMemo(() => {
    if (trendInterval === 'weekly') {
      return [
        { date: 'Wk 39', wpm: 48.4, accuracy: 89.8, tests: 182000, practiceTimeHours: 2400 },
        { date: 'Wk 40', wpm: 51.2, accuracy: 91.0, tests: 215000, practiceTimeHours: 2850 },
        { date: 'Wk 41', wpm: 54.0, accuracy: 91.8, tests: 248000, practiceTimeHours: 3280 },
        { date: 'Wk 42', wpm: 58.6, accuracy: 92.6, tests: 285000, practiceTimeHours: 3750 },
        { date: 'Wk 43', wpm: 63.2, accuracy: 93.1, tests: 312000, practiceTimeHours: 4120 },
        { date: 'Wk 44', wpm: 65.4, accuracy: 93.6, tests: 345000, practiceTimeHours: 4540 },
      ];
    }
    if (trendInterval === 'monthly') {
      return [
        { date: 'May', wpm: 46.5, accuracy: 88.5, tests: 780000, practiceTimeHours: 10400 },
        { date: 'Jun', wpm: 49.8, accuracy: 89.9, tests: 920000, practiceTimeHours: 12200 },
        { date: 'Jul', wpm: 52.4, accuracy: 91.2, tests: 1080000, practiceTimeHours: 14100 },
        { date: 'Aug', wpm: 56.0, accuracy: 92.0, tests: 1190000, practiceTimeHours: 15400 },
        { date: 'Sep', wpm: 60.5, accuracy: 92.8, tests: 1280000, practiceTimeHours: 16800 },
        { date: 'Oct', wpm: 65.2, accuracy: 93.4, tests: 1350000, practiceTimeHours: 17600 },
      ];
    }
    if (data?.performanceTrends && data.performanceTrends.length > 0) return data.performanceTrends;
    return currentFallback.performanceTrends;
  }, [trendInterval, data?.performanceTrends, currentFallback]);`;

const newTele = `  const kpis = useMemo(() => {
    if (data?.kpis && (data as any).period === selectedPeriod) {
      return data.kpis;
    }
    return currentFallback.kpis;
  }, [currentFallback, data, selectedPeriod]);

  const activeUserGrowth = useMemo(() => {
    if (data?.userGrowth && data.userGrowth.length > 0 && (data as any).period === selectedPeriod) {
      return data.userGrowth;
    }
    return currentFallback.userGrowth;
  }, [data, currentFallback, selectedPeriod]);

  const activeTrends = useMemo(() => {
    if (trendInterval === 'weekly') {
      return [
        { date: 'Wk 39', wpm: 48.4, accuracy: 89.8, tests: 182000, practiceTimeHours: 2400 },
        { date: 'Wk 40', wpm: 51.2, accuracy: 91.0, tests: 215000, practiceTimeHours: 2850 },
        { date: 'Wk 41', wpm: 54.0, accuracy: 91.8, tests: 248000, practiceTimeHours: 3280 },
        { date: 'Wk 42', wpm: 58.6, accuracy: 92.6, tests: 285000, practiceTimeHours: 3750 },
        { date: 'Wk 43', wpm: 63.2, accuracy: 93.1, tests: 312000, practiceTimeHours: 4120 },
        { date: 'Wk 44', wpm: 65.4, accuracy: 93.6, tests: 345000, practiceTimeHours: 4540 },
      ];
    }
    if (trendInterval === 'monthly') {
      return [
        { date: 'May', wpm: 46.5, accuracy: 88.5, tests: 780000, practiceTimeHours: 10400 },
        { date: 'Jun', wpm: 49.8, accuracy: 89.9, tests: 920000, practiceTimeHours: 12200 },
        { date: 'Jul', wpm: 52.4, accuracy: 91.2, tests: 1080000, practiceTimeHours: 14100 },
        { date: 'Aug', wpm: 56.0, accuracy: 92.0, tests: 1190000, practiceTimeHours: 15400 },
        { date: 'Sep', wpm: 60.5, accuracy: 92.8, tests: 1280000, practiceTimeHours: 16800 },
        { date: 'Oct', wpm: 65.2, accuracy: 93.4, tests: 1350000, practiceTimeHours: 17600 },
      ];
    }
    if (data?.performanceTrends && data.performanceTrends.length > 0 && (data as any).period === selectedPeriod) {
      return data.performanceTrends;
    }
    return currentFallback.performanceTrends;
  }, [trendInterval, data, currentFallback, selectedPeriod]);`;

if (!content.includes(norm(oldHealthRefresh))) {
  console.error('Could not find oldHealthRefresh');
  process.exit(1);
}
content = content.replace(norm(oldHealthRefresh), norm(newHealthRefresh));

if (!content.includes(norm(oldFetch))) {
  console.error('Could not find oldFetch');
  process.exit(1);
}
content = content.replace(norm(oldFetch), norm(newFetch));

if (!content.includes(norm(oldTele))) {
  console.error('Could not find oldTele');
  process.exit(1);
}
content = content.replace(norm(oldTele), norm(newTele));

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully updated admin page.tsx telemetry binding & dark mode!');


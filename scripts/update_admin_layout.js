const fs = require('fs');
const path = require('path');

const layoutPath = path.resolve('apps/web/src/app/admin/layout.tsx');
let content = fs.readFileSync(layoutPath, 'utf8');

const isCRLF = content.includes('\r\n');
const norm = (s) => (isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));

const oldSnippet = `    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tt_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }`;

const newSnippet = `    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tt_theme') || localStorage.getItem('typingtyphon_theme') || 'light';
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }`;

const oldToggle = `  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('tt_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('tt_theme', 'light');
      }
    }
  };`;

const newToggle = `  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      const themeVal = next ? 'dark' : 'light';
      localStorage.setItem('tt_theme', themeVal);
      localStorage.setItem('typingtyphon_theme', themeVal);
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };`;

if (!content.includes(norm(oldSnippet))) {
  console.error('Could not find oldSnippet');
  process.exit(1);
}
content = content.replace(norm(oldSnippet), norm(newSnippet));

if (!content.includes(norm(oldToggle))) {
  console.error('Could not find oldToggle');
  process.exit(1);
}
content = content.replace(norm(oldToggle), norm(newToggle));

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('Successfully updated admin layout.tsx!');


// theme-switcher.js

const themes = {
    'dark': 'Default Dark',
    'light': 'HV Light',
    'venture-hub': 'Venture Hub'
};

function createThemeSwitcher() {
    const switcherContainer = document.createElement('div');
    switcherContainer.style.position = 'relative';
    switcherContainer.style.marginLeft = '20px';

    const select = document.createElement('select');
    select.id = 'theme-switcher';
    select.style.padding = '8px 12px';
    select.style.border = '1px solid var(--border-color)';
    select.style.borderRadius = '6px';
    select.style.backgroundColor = 'var(--card-bg)';
    select.style.color = 'var(--text-muted)';
    select.style.cursor = 'pointer';

    for (const [value, text] of Object.entries(themes)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    }

    switcherContainer.appendChild(select);

    // Event listener for changing theme
    select.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        applyTheme(newTheme);
    });

    return switcherContainer;
}

function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('hv-theme', themeName);
    document.getElementById('theme-switcher').value = themeName;
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('hv-theme') || 'dark'; // Default to 'dark'
    applyTheme(savedTheme);
}

export { createThemeSwitcher, initializeTheme };
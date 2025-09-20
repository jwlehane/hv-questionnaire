/**
 * @jest-environment jsdom
 */

import { createThemeSwitcher, initializeTheme } from './theme-switcher.js';

// Mock applyTheme since it's not exported and we can't spy on it directly.
// We will test its effects through the exported functions.
let applyTheme;

describe('Theme Switcher', () => {
    // Set up a basic HTML structure for each test
    beforeEach(() => {
        document.body.innerHTML = '<div class="nav-header"></div>';
        localStorage.clear();
    });

    describe('createThemeSwitcher', () => {
        it('should create a select element with theme options', () => {
            const switcher = createThemeSwitcher();
            const select = switcher.querySelector('select');

            expect(select).not.toBeNull();
            expect(select.id).toBe('theme-switcher');
            expect(select.options.length).toBe(3);
            expect(select.options[0].value).toBe('dark');
            expect(select.options[0].textContent).toBe('Default Dark');
            expect(select.options[1].value).toBe('light');
            expect(select.options[1].textContent).toBe('HV Light');
            expect(select.options[2].value).toBe('venture-hub');
            expect(select.options[2].textContent).toBe('Venture Hub');
        });

        it('should change theme when a new option is selected', () => {
            const navHeader = document.querySelector('.nav-header');
            navHeader.appendChild(createThemeSwitcher());

            const select = document.getElementById('theme-switcher');

            // Simulate a user changing the theme to 'light'
            select.value = 'light';
            select.dispatchEvent(new Event('change'));

            expect(document.body.getAttribute('data-theme')).toBe('light');
            expect(localStorage.getItem('hv-theme')).toBe('light');
        });
    });

    describe('initializeTheme', () => {
        beforeEach(() => {
            // We need a dummy select element for initializeTheme to work
            document.body.innerHTML += '<select id="theme-switcher"></select>';
        });

        it('should apply the theme from localStorage if it exists', () => {
            localStorage.setItem('hv-theme', 'light');
            initializeTheme();
            expect(document.body.getAttribute('data-theme')).toBe('light');
        });

        it('should apply the default dark theme if nothing is in localStorage', () => {
            initializeTheme();
            expect(document.body.getAttribute('data-theme')).toBe('dark');
        });
    });
});

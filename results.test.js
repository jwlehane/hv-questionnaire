/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock Firebase modules using the modern ESM-compatible API
const mockOnAuthStateChanged = jest.fn();
const mockSignInWithPopup = jest.fn().mockResolvedValue({}); // Resolve with empty object
const mockSignOut = jest.fn().mockResolvedValue({}); // Resolve with empty object
const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();

jest.unstable_mockModule('firebase/app', () => ({
    initializeApp: jest.fn(() => ({}))
}));

jest.unstable_mockModule('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    GoogleAuthProvider: jest.fn(() => ({})),
    onAuthStateChanged: (auth, callback) => mockOnAuthStateChanged(auth, callback),
    signInWithPopup: (auth, provider) => mockSignInWithPopup(auth, provider),
    signOut: (auth) => mockSignOut(auth)
}));

jest.unstable_mockModule('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    getDocs: (q) => mockGetDocs(q),
    addDoc: (ref, data) => mockAddDoc(ref, data),
    serverTimestamp: jest.fn()
}));

describe('Results Page Authentication', () => {
    let onAuthStateChangedCallback;

    beforeEach(async () => {
        // Reset modules to ensure results.js is re-evaluated
        jest.resetModules();

        // Load the HTML file into the DOM
        const html = fs.readFileSync(path.resolve(process.cwd(), 'results.html'), 'utf8');
        document.body.innerHTML = html;

        // Reset mocks before each test
        mockOnAuthStateChanged.mockClear();
        mockSignInWithPopup.mockClear();
        mockSignOut.mockClear();
        mockGetDocs.mockClear();
        mockAddDoc.mockClear();

        // Capture the onAuthStateChanged callback
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            onAuthStateChangedCallback = callback;
            return jest.fn(); // Return a dummy unsubscribe function
        });

        // Mock Firestore responses
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
        mockAddDoc.mockResolvedValue({});

        // Dynamically import the script to execute it in the test environment
        await import('./results.js');
    });

    test('Initial UI should be in logged-out state', () => {
        onAuthStateChangedCallback(null);

        expect(document.getElementById('login-button').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('user-info').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('logout-button').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('main-content').classList.contains('hidden')).toBe(true);
    });

    test('UI should update to logged-in state on successful login', async () => {
        const mockUser = { email: 'test@example.com' };

        onAuthStateChangedCallback(mockUser);
        await new Promise(process.nextTick); // Allow async operations to complete

        expect(document.getElementById('login-button').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('user-info').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('user-email').textContent).toBe(mockUser.email);
        expect(document.getElementById('logout-button').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('main-content').classList.contains('hidden')).toBe(false);

        expect(mockAddDoc).toHaveBeenCalled();
        expect(mockGetDocs).toHaveBeenCalledTimes(2);
    });

    test('UI should return to logged-out state on logout', () => {
        const mockUser = { email: 'test@example.com' };
        onAuthStateChangedCallback(mockUser);
        onAuthStateChangedCallback(null);

        expect(document.getElementById('login-button').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('user-info').classList.contains('hidden')).toBe(true);
        expect(document.getElementById.bind(document)('logout-button').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('main-content').classList.contains('hidden')).toBe(true);
    });

    test('Clicking login button should trigger signInWithPopup', () => {
        onAuthStateChangedCallback(null);
        document.getElementById('login-button').click();
        expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('Clicking logout button should trigger signOut', () => {
        const mockUser = { email: 'test@example.com' };
        onAuthStateChangedCallback(mockUser);
        document.getElementById('logout-button').click();
        expect(mockSignOut).toHaveBeenCalled();
    });
});

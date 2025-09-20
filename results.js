import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, getDocs, orderBy, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const mainContent = document.getElementById('main-content');
const loadingState = document.getElementById('loading-state');
const noResultsState = document.getElementById('no-results-state');
const resultsGrid = document.getElementById('results-grid');

loginButton.addEventListener('click', () => signInWithPopup(auth, provider).catch(e => console.error("Login failed:", e)));
logoutButton.addEventListener('click', () => signOut(auth).catch(e => console.error("Logout failed:", e)));

onAuthStateChanged(auth, user => {
    if (user) {
        loginButton.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = user.email;
        logoutButton.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        logLogin(user.email);
        fetchResults();
        fetchAuditLog();
    } else {
        loginButton.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userEmail.textContent = '';
        logoutButton.classList.add('hidden');
        mainContent.classList.add('hidden');
        document.getElementById('audit-log-container').classList.add('hidden');
        resultsGrid.innerHTML = '';
    }
});

async function fetchResults() {
    loadingState.classList.remove('hidden');
    noResultsState.classList.add('hidden');
    resultsGrid.innerHTML = '';

    try {
        const q = query(collection(db, "ai-questionnaire-responses"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            noResultsState.classList.remove('hidden');
        } else {
            querySnapshot.forEach(doc => {
                const card = createResponseCard(doc.data());
                resultsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error fetching results: ", error);
        resultsGrid.innerHTML = `<div class="no-results-state"><p>Could not load results. Check console for errors.</p></div>`;
    } finally {
        loadingState.classList.add('hidden');
    }
}

async function logLogin(userEmail) {
    try {
        await addDoc(collection(db, "login-audit-log"), {
            email: userEmail,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging login: ", error);
    }
}

async function fetchAuditLog() {
    const auditLogContainer = document.getElementById('audit-log-container');
    const auditLogDiv = document.getElementById('audit-log');
    auditLogContainer.classList.remove('hidden');
    auditLogDiv.innerHTML = '';

    try {
        const q = query(collection(db, "login-audit-log"), orderBy("timestamp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            auditLogDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No login events found.</p>';
        } else {
            querySnapshot.forEach(doc => {
                const log = doc.data();
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                logEntry.innerHTML = `<p><strong>${log.email}</strong> logged in at ${log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Pending...'}</p>`;
                auditLogDiv.appendChild(logEntry);
            });
        }
    } catch (error) {
        console.error("Error fetching audit log: ", error);
        auditLogDiv.innerHTML = '<p style="text-align: center; color: #e74c3c;">Could not load audit log.</p>';
    }
}

function createResponseCard(data) {
    const card = document.createElement('div');
    card.className = 'response-card';

    const barriersList = data.barriers && data.barriers.length > 0
        ? `<ul>${data.barriers.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '<p class="answer">N/A</p>';
    const otherBarrier = data.barrierOtherText ? `<p class="answer-quote"><em>${data.barrierOtherText}</em></p>` : '';

    card.innerHTML = `
        <div class="card-header">
            <h3>${data.name || 'No Name'}</h3>
            <p>${data.company || 'No Company'}</p>
            <p style="font-size: 0.8rem; opacity: 0.6;">Submitted: ${data.submittedAt ? new Date(data.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
        </div>
        <div class="card-body">
            <div class="card-section">
                <p class="question">1. Current AI Usage Type:</p>
                <p class="answer">${data.aiUsageType || 'N/A'}</p>
                ${data.usageExample ? `<p class="answer-quote"><em>${data.usageExample}</em></p>` : ''}
            </div>
            <div class="card-section">
                <p class="question">2. Scale of Adoption:</p>
                <p class="answer"><strong>${data.aiUserCount || 0} of ${data.employeeCount || 'N/A'}</strong> employees using AI.</p>
                ${data.commonTools ? `<p class="answer-quote"><em>Tools: ${data.commonTools}</em></p>` : ''}
            </div>
            <div class="card-section">
                <p class="question">3. Biggest Barriers:</p>
                <div class="answer-list">${barriersList}</div>
                ${otherBarrier}
            </div>
            <div class="card-section">
                <p class="question">4. AI 'Crystal Ball' Question:</p>
                <p class="answer-quote">${data.aiCrystalBall || 'N/A'}</p>
            </div>
        </div>
    `;
    return card;
}

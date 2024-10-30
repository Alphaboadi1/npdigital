
import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getFirestore, query, where, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import { showLoader, removeLoader } from './loader';
import DOMPurify from 'dompurify';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



export function renderLogin() {
    const element = document.createElement('div');
    element.className = 'container';
    element.innerHTML = `
    <div class="content-con d-fl pt-50">
        <div id="errorContainer" class="error-message"></div>
        <h2 class="login-form">You made it!</h2>
        <div class="underline"></div>
        <form id="loginForm" class="newlofo">   
            <div class="form-group">
                <label for="login-username"></label>
                <input type="text" id="login-username" name="login-username" placeholder="Type your Username" required>
            </div>
            <div class="form-group" style="position: relative;">
                <label for="password"></label>
                <input type="password" id="login-password" name="password" placeholder="Password" required>
                <button class="password-toggle" id="togglePassword">Show</button>
            </div>
            <div class="sub-btn">
                <button type="submit" class="login-btns large-btn">Login Now</button>
                <button type="button" class="login-btns small-btn regBtn secondary" id="regBtn">Register Now</button>
            </div>
        </form>
    </div>
    `;
    

    function togglePasswordVisibility(event) {
        event.stopPropagation();
        event.preventDefault();
        const passwordInput = document.getElementById('login-password');
        const passwordToggle = document.getElementById('togglePassword');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = 'Show';
        }
    }

    element.querySelector('#togglePassword').addEventListener('click', togglePasswordVisibility);

    function sanitizeInput(input) {
        return DOMPurify.sanitize(input);
    }

    function isValidPassword(password) {
        const passwordRegex = /^[a-zA-Z0-9]{6,9}$/;
        return passwordRegex.test(password);
    }

    function isValidLength(input, minLength, maxLength) {
        return input.length >= minLength && input.length <= maxLength;
    }

    function validateInput(username, password) {
        if (!isValidLength(username, 3, 20)) {
            return { isValid: false, message: 'Username must be between 3 and 20 characters.' };
        }

        if (!isValidPassword(password)) {
            return { isValid: false, message: 'Password must be at least 6 to 9 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.' };
        }

        return { isValid: true, message: 'All inputs are valid.' };
    }

    function setItemWithFallback(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.error('Session storage not available. Using local storage as fallback.');
            localStorage.setItem(key, value);
        }
    }

    element.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorContainer = document.getElementById('errorContainer');
        const username = sanitizeInput(document.getElementById('login-username').value);
        const password = sanitizeInput(document.getElementById('login-password').value);
        const loader = document.querySelector('.overlayLoader');
        showLoader();
        const validation = validateInput(username, password);

        if (!validation.isValid) {
            errorContainer.textContent = validation.message;
            errorContainer.style.display = 'block';
            removeLoader();
        } else {
            errorContainer.style.display = 'none';
            const usersRef = collection(db, 'admins');
            const q = query(usersRef, where('username', '==', username));
            getDocs(q)
                .then((querySnapshot) => {
                    let userDoc = null;
                    querySnapshot.forEach((doc) => {
                        if (doc.exists()) {
                            userDoc = doc;
                        }
                    });

                    if (userDoc) {
                        const userData = userDoc.data();
                        if (userData.password === password) {
                            element.querySelector('#loginForm').reset();
                            element.querySelector('#loginForm').style.display = 'none';
                            const userId = userData.username;
                            setItemWithFallback('userId', userId);
                            removeLoader();
                            window.history.pushState({}, '', '/members');
                            handleRoute();
                        } else {
                            errorContainer.style.display = "block";
                            errorContainer.textContent = "Password not correct!";
                            removeLoader();
                        }
                    } else {
                        errorContainer.style.display = "block";
                        errorContainer.textContent = "User not found!";
                        removeLoader();
                    }
                })
                .catch((error) => {
                    console.error('Error logging in:', error);
                    alert('An error occurred. Please try again.');
                    removeLoader();
                });
        }
    });

    element.querySelector('#regBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/registration');
        handleRoute();
    });

    return element;
}

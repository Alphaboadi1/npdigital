import { handleRoute } from '../index';
import { getUserIp } from '../utils/utils';
import { initializeApp } from 'firebase/app';
import { getFirestore, query, where, collection, addDoc, getDocs } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import firebaseConfig from '../firebaseConfig';
import { showLoader, removeLoader } from './loader';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function renderRegister() {
    const element = document.createElement('div');
    element.className = 'container';
    element.innerHTML = `

        <div class="content-con pt-50">
            <div id="errorContainer" class="error-message"></div>
            <h2 class="login-form">You made it!</h2>
            <div class="underline"></div>
            <form class="reg-form newlofo">
                <div class="form-group">
                    <label for="username"></label>
                    <input type="text" id="username" name="username" placeholder="Username" required>
                </div>
                <div class="form-group" style="position: relative;">
                    <label for="password"></label>
                    <input type="password" id="password" name="password" placeholder="Password" required>
                    <button class="password-toggle" id="togglePassword">Show</button>
                </div>
                <button type="submit" class="login-btns reg-btn large-btn">Register Now</button>
                <button type="button" class="login-btns small-btn regBtn secondary" id="loBtn">Login Now</button>
            </form>
        </div>
    `;
    function togglePasswordVisibility(event) {
        event.preventDefault(); // Prevent the form from submitting
        const passwordInput = document.getElementById('password');
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
        const passwordRegex = /^[a-zA-Z0-9]{8,}$/;
        return passwordRegex.test(password);
    }

    function isValidLength(input, minLength, maxLength) {
        return input.length >= minLength && input.length <= maxLength;
    }

   

    function validateInput(username, password, withdrawalP) {
        if (!isValidLength(username, 3, 20)) {
            return { isValid: false, message: 'Username must be between 3 and 20 characters.' };
        }

        if (!isValidPassword(password)) {
            return { isValid: false, message: 'Password is invalid. It must be at least 8 characters long and contain only letters and digits.' };
        }

        return { isValid: true, message: 'All inputs are valid.' };
    }

    // Function to display error messages
    function displayError(message) {
        const errorContainer = element.querySelector('#errorContainer');
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        removeLoader();
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 4000);
    }

    // Function to check if username or phone number already exists
    async function checkUsernameAndPhone(username) {
        const usernameQuery = query(collection(db, "admins"), where("username", "==", username));
        const usernameSnapshot = await getDocs(usernameQuery)
        
        if (!usernameSnapshot.empty) {
            throw new Error('Username already exists. Please use a different Username');
        }
    }

    

    // Function to generate member data
    async function generateMemberData(username, password) {
        return {
            username: username,
            password: password,
        };
    }

    // Function to add member data to Firestore
    async function addMemberToFirestore(memberData) {
        await addDoc(collection(db, "admins"), memberData);
    }

    // Function to handle successful registration
    function handleSuccessfulRegistration(errorContainer, regForm) {
        regForm.reset();
        window.history.pushState({}, '', '/login');
        handleRoute();
        displayError('User Registration Successful');
        removeLoader();
    }

    const regForm = element.querySelector('.reg-form');

    regForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showLoader();

        // Extract and sanitize form values
        const username = sanitizeInput(regForm.username.value);
        const password = sanitizeInput(regForm.password.value);

        // Validate input
        const validation = validateInput(username, password);
        if (!validation.isValid) {
            displayError(validation.message);
            return;
        }

        try {
            // Check if username or phone number already exists
            await checkUsernameAndPhone(username);


            // Generate member data
            const memberData = await generateMemberData(username, password);

            // Add member data to Firestore
            await addMemberToFirestore(memberData);

            // Registration success
            handleSuccessfulRegistration(element.querySelector('#errorContainer'), regForm);
        } catch (error) {
            displayError(error.message);
        }
    });

    element.querySelector('#loBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', '/login');
        handleRoute();
    });

    return element;
}

import data from '../utils/metadata.json'
import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, doc,deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import records from 'images/websites/records.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';

export function renderSupports() {
    const element = document.createElement('div');
    element.className = 'container d-f'
    element.innerHTML = `
    <div class="sidebar">
        <ul>
            <li><img src="${home}" alt="toggle image"/></li>
            <li class="toggle-submenu"><a href="/members"><img src="${about}" alt="toggle image"/></a>
            </li>
            <li><a href="/wallet"><img src="${wallet}" alt="toggle image"/></a></li>
            <li><a href="/withdrawal"><img src="${withdrawal}" alt="toggle image"/></a></li>
            <li><a href="/supports"><img src="${contact}" alt="toggle image"/></a></li>
            <li><a href="/products"><img src="${records}" alt="toggle image"/></a></li>
        </ul>
    </div>
    <div class="main-content">
        <div class="filter-section">
            <div class="pro-input">
                <div>
                    <button class="btn enter-btn save-btn">Add Support Numbers</button>
                </div>
            </div>
        </div>
        <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
            <input type="text" id="searchBar" placeholder="Search by Phone Number / link" style="width: 250px;">
            <span class="close-button" id="clearSearch" id="searchButton">x</span>
            <button type="button" id="searchButton" class="btn cancel-btn">Search</button>
        </div>
        <table id="phoneTable">
            <thead>
                <tr>

                    <th>Product ID</th>
                    <th>Product Title</th>
                    <th>Handle</th>
                    <th>Platform</th>
                    <th>Operate</th>
                </tr>
            </thead>
            <tbody>
                <!-- Phone number rows will be inserted here -->
            </tbody>
        </table>
        <div id="pagination"></div>
     <div>
     <div id="addProductModal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Add Phone Number</h2><br>
            <form id="addProductForm">
                <div class="input-field">
                    <label for="productTitle">Title:</label>
                    <input type="text" id="productTitle" name="productTitle" required>
                </div>
                <div class="input-field">
                    <label for="productPrice">Phone Number / link:</label>
                    <input type="text" id="productPrice" name="productPrice" required>
                </div>
                <div class="booking-input">
                    <label for="editPlatform">Platform:</label>
                    <select id="platform" name="platform">
                        <option value="telegram">Telegram</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>
                <div class="" style="margin-top:20px">
                    <button type="button" id="saveProductButton" class="btn save-btn">Save</button>
                    <button type="button" id="cancelButton" class="btn cancel-btn ">Cancel</button>
                </div>
                 
            </form>
        </div>
    </div>
    <div class="modal" id="editModal">
        <div class="modal-content">
            <span class="close-button" id="modalClose">&times;</span>
            <h2>Edit Phone Number</h2>
            <form id="editForm">
                <div class="booking-input">
                    <label for="editProductId">Product ID</label>
                    <input type="text" id="editProductId" readonly>
                </div>
                <div class="booking-input">
                    <label for="editTitle">Title:</label>
                    <input type="text" id="editTitle" name="title" required>
                </div>
                <div class="booking-input">
                    <label for="editPrice">Number:</label>
                    <input type="number" id="editPrice" name="price" required>
                </div>
                <div>
                    <button type="button" class="btn save-btn" id="update-btn">Submit</button>
                    <button type="button" class="btn cancel-btn" id="cancelEdit">Cancel</button>
                <div>
            </form>
        </div>
    </div>
    `

    // Get a reference to the storage service
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    function getSelectedPlatform() {
        const selectElement = element.querySelector("#platform");
        const selectedValue = selectElement.value;
        return selectedValue;
    }

    const addProductButton = element.querySelector('.enter-btn');
    const pageSize = 20;
    let currentPage = 1;
    let totalPages = 0;
    let allPhones = [];
    let filteredPhones = [];

    const modal = element.querySelector('#addProductModal');
    const cancelButton = modal.querySelector('#cancelButton');
    const closeButton = modal.querySelector('.close-button');
    const saveProductButton = modal.querySelector('#saveProductButton');

    addProductButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        element.querySelector('#addProductForm').reset();
    });

    saveProductButton.addEventListener('click', async () => {
        const title = element.querySelector('#productTitle').value;
        const phoneNum = element.querySelector('#productPrice').value;
        const platform = await getSelectedPlatform();

        if (title && phoneNum && platform) {
            try {
                console.log('Title:', title);
                console.log('Phone Number:', phoneNum);

                // Prepare the product details
                const phones = {
                    phone_title: title,
                    phone_number: phoneNum,
                    phone_platform: platform,
                };

               

                // Save this to Firebase
                await addDoc(collection(db, "supports"), phones);

                // Close the modal and reset the form
                modal.style.display = 'none';
                document.querySelector('#addProductForm').reset();

                // Re-render the table to include the new product
                fetchAllData();

            } catch (error) {
                console.error('Error adding product: ', error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    });

    const submenuToggle = element.querySelector('.toggle-submenu');
    if (submenuToggle) {
        console.log('Submenu toggle element found:', submenuToggle);
        submenuToggle.addEventListener('click', () => {
            const submenu = submenuToggle.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                console.log('Submenu new display style:', submenu.style.display);
            }
        });
    } else {
        console.error('Submenu toggle element not found!');
    }

    const phoneTableBody = element.querySelector('tbody');

    async function fetchAllData() {
        // Check if products are stored in local storage
            console.log('Fetching products from Firebase');
            try {
                const phoneCollection = collection(db, "supports");
                console.log(phoneCollection);

                // Set up a real-time listener
                onSnapshot(phoneCollection, (memberSnapshot) => {
                    console.log(memberSnapshot);
                    const memberList = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log(memberList);
                     // Retrieve and update local storage
                    allPhones = memberList;
                    filteredPhones = memberList;
                    renderTable(currentPage);
                    updatePaginationButtons();
                }, (error) => {
                    console.error("Error fetching members: ", error);
                });
            } catch (error) {
                console.error("Error setting up Firebase listener: ", error);
            }
    }

    function renderTable(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const phoneToShow = filteredPhones.slice(start, end);

        phoneTableBody.innerHTML = ''; // Clear previous data
        console.log(phoneToShow)
        phoneToShow.forEach((phone, index) => {
            if (phone) {
                const {id, phone_title, phone_number, phone_platform } = phone;
                const row = document.createElement('tr');
                row.dataset.id = id;
                row.innerHTML = `
                    <td>${index}</td>
                    <td>${phone_title}</td>
                    <td>${phone_number}</td>
                    <td>${phone_platform}</td>
                    <td> 
                        <button data-action="delete" data-index="${phone.id}" class="search-btn btn">Delete</button>
                    </td>
                `;
                phoneTableBody.appendChild(row);
            } else {
                console.error('Invalid product data:', phone);
            }
        });
    }

    function updatePaginationButtons() {
        const paginationContainer = element.querySelector('#pagination');
        paginationContainer.innerHTML = ''; // Clear previous buttons

        totalPages = Math.ceil(filteredPhones.length / pageSize);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = 'pagination-button';
            if (i === currentPage) {
                button.classList.add('disabled');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                renderTable(currentPage);
                updatePaginationButtons(); // Update buttons to reflect current page
            });
            paginationContainer.appendChild(button);
        }
    }

    fetchAllData();

    // Search functionality
    const searchBar = element.querySelector('#searchBar');
    const searchButton = element.querySelector('#searchButton');
    const clearSearch = element.querySelector('#clearSearch');
    const selectAllCheckbox = element.querySelector('#selectAll');

    searchButton.addEventListener('click', () => {
        const searchValue = searchBar.value.toLowerCase();
        filteredPhones = allPhones.filter(({ phone_number }) => phone_number === searchValue);
        currentPage = 1; // Reset to first page
        renderTable(currentPage);
        updatePaginationButtons();
    });

    clearSearch.addEventListener('click', () => {
        selectAllCheckbox.checked = false;
        searchBar.value = '';
        filteredPhones = allPhones;
        currentPage = 1;
        renderTable(currentPage);
        updatePaginationButtons();
    });

    const productTable = element.querySelector('#phoneTable');
    if (productTable) {
        productTable.addEventListener('click', function(event) {
            const target = event.target;
            const row = target.parentElement.parentElement;
            if (target.tagName === 'BUTTON') {
                const action = target.getAttribute('data-action');
                const phoneId = row.getAttribute('data-id');
                console.log(phoneId)
                switch(action){
                    case 'delete':
                    handleDeleteProduct(phoneId);
                    break;
                }
            }
        });
    } else {
        console.error('phone table not found in the DOM');
    }

    async function handleDeleteProduct(index) {
        try {
            // Find the row corresponding to the product
            const row = document.querySelector(`tr[data-id="${index}"]`);

            if (!row) {
                console.error(`Row with data-id="${index}" not found`);
                return;
            }
            console.log('Row found:', row);
    
            // Remove the row from the table
            row.remove();
            console.log('Row removed from the table:', index);
    
            // Remove the product from the filteredPhones array
            filteredPhones = filteredPhones.filter(phone => phone.id !== index);
            console.log('filteredPhones after deletion:', filteredPhones);
    
            // Remove the product from the allPhones array
            allPhones = allPhones.filter(phone => phone.id !== index);
            console.log('allPhones after deletion:', allPhones);
    
            // Remove the product from Firebase
            try {
                const phoneCollection = collection(db, "supports");
                const phoneDoc = doc(phoneCollection, index);
                await deleteDoc(phoneDoc);
                console.log('Product deleted from Firebase:', index);
            } catch (error) {
                console.error('Error deleting product from Firebase:', error);
            }
    
            // Re-render the table for the current page
            renderTable(currentPage);
    
            // Update the pagination buttons
            updatePaginationButtons();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
    

    const closeModal = () => {
        editModal.style.display = 'none';
        editForm.reset();
    };

    const modalCloseButton = element.querySelector('#modalClose');
    modalCloseButton.onclick = closeModal;

    return element;
}

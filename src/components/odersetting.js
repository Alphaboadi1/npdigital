import { getUserIp } from '../utils/utils';
import data from '../utils/metadata.json'
import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc,  updateDoc} from 'firebase/firestore';
import { getStorage, ref, uploadBytes,listAll, updateMetadata, getDownloadURL, getMetadata, deleteObject} from 'firebase/storage';
import { showLoader, removeLoader } from './loader';
import firebaseConfig from '../firebaseConfig';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import records from 'images/websites/records.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';




// Initialize Firebase Storage

console.log(data);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// fetch all data from dataBase
let allProducts = [];
let filteredProduct = [];
async function fetchAllProducts() {
    // Check if products are stored in local storage
    let storedProducts = JSON.parse(localStorage.getItem('adminProducts'));
    
    if (storedProducts && storedProducts.length > 0) {
        console.log('Fetching products from local storage');
        allProducts = storedProducts;
    } else {
        console.log('Fetching products from Firebase');
        try {
            const listRef = ref(storage, 'products');
            const res = await listAll(listRef);
            const productPromises = res.items.map(async (itemRef) => {
                try {
                    const metadata = await getMetadata(itemRef);
                    const downloadURL = await getDownloadURL(itemRef);
                    return {
                        id: parseInt(metadata.customMetadata.id),
                        product_title: metadata.customMetadata.product_title,
                        price: parseFloat(metadata.customMetadata.price),
                        imageUrl: downloadURL
                    };
                } catch (error) {
                    console.error('Error fetching metadata or URL for item:', itemRef.fullPath, error);
                    return null;
                }
            });
            const fetchedProducts = await Promise.all(productPromises);
            allProducts = fetchedProducts.filter(product => product !== null); // Filter out any failed fetches

            // Store the fetched products in local storage
            localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    }
    
}

fetchAllProducts()

export function renderOdersetting() {
    const element = document.createElement('div');
    element.className = 'container d-f'
    element.innerHTML = `
        <div class="sidebar">
            <ul>
                <li id="homeBtn" class="trent">
                    <div id="home">
                        <img src="${home}" alt="toggle image"/>
                    </div>
                </li>
                <li class="toggle-submenu trent">
                    <div id="members">
                        <img src="${about}" alt="toggle image"/>
                    </div>
                </li>
                <li class="trent">
                    <div id="wallet">
                        <img src="${wallet}" alt="toggle image"/>
                    </div>
                </li>
                <li class="trent">
                    <div id="withdrawal">
                        <img src="${withdrawal}" alt="toggle image"/>
                    </div>
                </li>
                <li class="trent">
                    <div id="supports">
                        <img src="${contact}" alt="toggle image"/>
                    </div>
                </li>
                <li class="trent">
                    <div id="products">
                        <img src="${records}" alt="toggle image"/>
                    </div>
                </li>
            </ul>
            
        </div>
        <div class="main-content">
        <div class="filter-section">
            <div class="or-input">
                <label for="userId">User ID: </label><input type="text" id="userId" readonly><br>
                <label for="walletAmount">Wallet Amount:</label> <input type="text" id="walletAmount" readonly readonly><br>
                <label for="comnumber">Combination Number: </label><input type="number" id="comnumber" placeholder="Enter Combination Number"><br>
                <label>Selected Product IDs:</label> <input type="text" id="productIds" readonly>
                <br>
                <div>
                    <button class="btn Enter-button save-btn" id="savecombo">Save</button>
                    <button class="btn cancel-btn or-cancel">Cancel</button>
                </div>
                
            </div>
        </div>
        <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
            <input type="text" id="searchBar" placeholder="Search by Image ID" style="width: 250px;">
            <span class="btn close-button" id="clearSearch">x</span>
            <button type="button" id="searchButton" class="btn search-btn">Search</button>
        </div>
        <table id="productTable">
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAll"></th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Image</th>
                </tr>
            </thead>
            <tbody>
                <!-- Product rows will be inserted here -->
            </tbody>
        </table>

    <div id="pagination"></div>
     <div>   
    `
    element.querySelector('#members').addEventListener('click', () => {
        showLoaderAndNavigate('/members');
    });
    element.querySelector('#wallet').addEventListener('click', () => {
        showLoaderAndNavigate('/wallet');
    });
    element.querySelector('#withdrawal').addEventListener('click', (e) => {
        showLoaderAndNavigate('/withdrawal');
    });
    element.querySelector('#supports').addEventListener('click', (e) => {
        showLoaderAndNavigate('/supports');
    });
    element.querySelector('#products').addEventListener('click', (e) => {
        showLoaderAndNavigate('/products');
    });

    function showLoaderAndNavigate(path) {
        showLoader();
        setTimeout(() => {
            window.history.pushState({}, '', path);
            handleRoute();
            removeLoader();
        }, 800); // Small delay to ensure loader is visible
    }

     const pageSize = 20;
     let currentPage = 1;
     let totalPages = 0;
    
     let filteredProducts = [];
     let selectedProductIds = new Set();

    //  function importAll(r) {
    //     return r.keys().map(r);
    //   }
      
    //   // Import all images in the directory
    //   const images = importAll(require.context('../images/products', false, /\.(png|jpe?g|svg)$/));
      
    //   // Create a mapping from file name (without extension) to the image path
    //   const imageMap = images.reduce((map, src) => {
    //     let filePath = src;
        
    //     // If src is an object, get the file path from src.default
    //     if (typeof src === 'object' && src.default) {
    //       filePath = src.default;
    //     }
        
    //     // Extract file name without extension
    //     const fileName = filePath.match(/\/([^\/]+)\.\w+$/)[1];
    //     map[fileName] = filePath;
    //     return map;
    //   }, {});

    const submenuToggle = element.querySelector('.toggle-submenu');
    const openRecords = element.querySelector('.open-records');

    if(openRecords){
        openRecords.addEventListener('click',()=>{
            window.history.pushState({}, '', '/products');
            handleRoute();
        })
        
    }

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
     const productTableBody = element.querySelector('tbody');
     let productIdsInput = element.querySelector('#productIds');
     const combinationTaskInput = element.querySelector('#comnumber');
    function fetchAllData() {
        filteredProducts = allProducts.sort((a, b) => a.id - b.id);
        updatePaginationButtons();
        renderTable(currentPage);
    }

    function renderTable(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const productsToShow = filteredProducts.slice(start, end);

        productTableBody.innerHTML = ''; // Clear previous data

        productsToShow.forEach((product) => {
            if (product) {
                const { id, product_title, price,imageUrl} = product;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="product-checkbox" value="${id}" ${selectedProductIds.has(id) ? 'checked' : ''}></td>
                    <td>${id}</td>
                    <td>${product_title}</td>
                    <td>${price}</td>
                    <td><img src="${imageUrl}" alt="${product_title}" class="img-class"></td>
                `;
                productTableBody.appendChild(row);
            } else {
                console.error('Invalid product data:', product);
            }
        });
    }

    function updatePaginationButtons() {
        const paginationContainer = element.querySelector('#pagination');
        paginationContainer.innerHTML = ''; // Clear previous buttons

        totalPages = Math.ceil(filteredProducts.length / pageSize);

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
    const searchBar = element.querySelector('#searchBar');
    const searchButton = element.querySelector('#searchButton');
    const clearSearch = element.querySelector('#clearSearch');
    const selectAllCheckbox = element.querySelector('#selectAll');
    const submitButton = element.querySelector('#submitButton');

    searchButton.addEventListener('click', () => {
      const searchValue = searchBar.value.toLowerCase();
      
      filteredProducts = allProducts.filter(({ id }) => id.toString().toLowerCase() === searchValue);
      currentPage = 1; // Reset to first page
      renderTable(currentPage);
      updatePaginationButtons();
    });

      clearSearch.addEventListener('click', () => {
       selectAllCheckbox.checked = false;
       searchBar.value = '';
       filteredProducts = allProducts;
       currentPage = 1;
       renderTable(currentPage);
       updatePaginationButtons();
     });
    
     selectAllCheckbox.addEventListener('change', (event) => {
       const checkboxes = element.querySelectorAll('.product-checkbox');
       checkboxes.forEach(checkbox => {
         checkbox.checked = event.target.checked;
         if (checkbox.checked) {
           selectedProductIds.add(checkbox.value);
         } else {
           selectedProductIds.delete(checkbox.value);
         }
       });
       updateProductIdsInput();
     });

     function getUserIdFromStorage() {
        try {
            return {
                userId: sessionStorage.getItem('userId'),
                username: sessionStorage.getItem('username'), // Corrected typo here
                wallet_amount: sessionStorage.getItem('wallet_amount'),
            };
        } catch (error) {
            // Handle error (e.g., session storage not available)
            console.error('Session storage not available. Using local storage as fallback.');
            return {
                userId: localStorage.getItem('userId'),
                username: localStorage.getItem('username'),
                wallet_amount: localStorage.getItem('wallet_amount'),
            };
        }
    }
    
    console.log(getUserIdFromStorage());
    element.querySelector("#userId").value = getUserIdFromStorage().username;
    element.querySelector("#walletAmount").value = getUserIdFromStorage().wallet_amount;
    
   
    
     function updateProductIdsInput() {
       productIdsInput.value = Array.from(selectedProductIds).join(', ');
     }


   const saveBtn = element.querySelector("#savecombo");
    saveBtn.addEventListener('click', () => {
        // Get the values from the input fields
        let combinationNumber = productIdsInput.value
        
        let productIds = combinationNumber.split(",").map(Number).filter(num => !isNaN(num));
        // get the combination number from the
        let combinationIndex = combinationTaskInput.value || 0
        
        // fetch the user data from the database
        const userId = getUserIdFromStorage().userId;

        // always fetch the array an check if there is a combination present* they may not be a combination number
        // if there is a combination remove the previous one 
        // Update the combination number // am only going to update newProductArray with combination
        updateFirestoreBooking(userId , productIds, combinationIndex)
        console.log(productIds, combinationIndex, userId);
        //Clear Input Fields NO NO NO. 
       searchBar.value = '';
       filteredProducts = allProducts;
       currentPage = 1;
       renderTable(currentPage);
       updatePaginationButtons();
       window.history.pushState({}, '', '/ordersetting');
            handleRoute();
    })

    async function fetchProductDetails(productId) {
        try {
            const itemRef = ref(storage, `products/${productId}.jpg`);
            const metadata = await getMetadata(itemRef);
            const downloadURL = await getDownloadURL(itemRef);
      
            return {
                id: metadata.customMetadata.id,
                product_title: metadata.customMetadata.product_title,
                price: metadata.customMetadata.price,
                imageUrl: downloadURL,

            };
        } catch (error) {
            console.error('Error fetching metadata or URL for item:', productId, error);
            return null;
        }
    }
    
    async function updateFirestoreBooking(docId, Combination, combinationNumber) {
        const docRef = doc(db, 'members', docId);
    
        // Fetch product details for each product in the combination array
        const productDetailsPromises = Combination.map(productId => fetchProductDetails(productId));
        const productDetailsArray = await Promise.all(productDetailsPromises);
        
        console.log(productDetailsArray);
        // Create an object with product details
        const combinationDetails = {};
        productDetailsArray.forEach(product => {
            if (product) {
                combinationDetails[product.id] = product;
            }
        });
    
        // Prepare the updates object // there may be no need to update the combo
        const updates = {
            'mission_information.combination': combinationDetails,
            'mission_information.combinationNumber': combinationNumber || 0,
            'mission_information.combination_active': productDetailsArray.length > 1 ? true : false,
        };
    
        // Update Firestore document
        updateDoc(docRef, updates)
            .then(() => {
                console.log("Document successfully updated!");
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    }
    
     // When the ordersetting Button is clicked
        
        // Update the combination number 
        // update the combination products
        
        // filteredProducts = data.filter(({ id }) => id.toString().toLowerCase() === searchValue);
        // currentPage = 1; // Reset to first page
        // renderTable(currentPage);
        // updatePaginationButtons();
    return element;

}

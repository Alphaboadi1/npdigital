import data from '../utils/metadata.json'
import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, listAll, updateMetadata, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import firebaseConfig from '../firebaseConfig';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import records from 'images/websites/records.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';
import { showLoader, removeLoader } from './loader';

export function renderProducts() {
    const element = document.createElement('div');
    element.className = 'container d-f';
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
            <div class="pro-input">
                <div>
                    <button class="btn enter-btn save-btn">Add Product</button>
                </div>
            </div>
        </div>
        <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
            <input type="text" id="searchBar" placeholder="Search by Price" style="width: 250px;">
            <span class="close-button" id="clearSearch">x</span>
            <button type="button" id="searchButton" class="btn cancel-btn">Search</button>
        </div>
        <table id="productTable">
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAll"></th>
                    <th>Product ID</th>
                    <th>Product Title</th>
                    <th>Price</th>
                    <th>Product Image</th>
                    <th>Operate</th>
                </tr>
            </thead>
            <tbody>
                <!-- Product rows will be inserted here -->
            </tbody>
        </table>
        <div id="pagination"></div>
        <div>
        <div id="addProductModal" class="modal">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Add Product</h2>
                <form id="addProductForm">
                    <div class="input-field">
                        <label for="productTitle">Title:</label>
                        <input type="text" id="productTitle" name="productTitle" required>
                    </div>
                    <div class="input-field">
                        <label for="productPrice">Price:</label>
                        <input type="number" id="productPrice" name="productPrice" required>
                    </div>
                    <div class="input-field">
                        <label for="productImage">Image URL:</label>
                        <input type="file" id="productImage" name="productImage" required>
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
                <h2>Edit Product</h2>
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
                        <label for="editPrice">Price:</label>
                        <input type="number" id="editPrice" name="price" required>
                    </div>
                    <div class="booking-input">
                        <img id="editProductImage" src="" alt="Current Image" style="max-width: 100px;">
                    </div>
                    <div class="booking-input">
                        <label for="editImage">Image:</label>
                        <input type="file" id="editImage" name="image">
                    </div>
                    <div>
                        <button type="button" class="btn save-btn" id="update-btn">Submit</button>
                        <button type="button" class="btn cancel-btn" id="cancelEdit">Cancel</button>
                    <div>
                </form>
            </div>
        </div>
    `;
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

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const addProductButton = element.querySelector('.enter-btn');
    const pageSize = 20;
    let currentPage = 1;
    let totalPages = 0;
    let allProducts = [];
    let filteredProducts = [];
    let selectedProductIds = new Set();

    const modal = element.querySelector('#addProductModal');
    const cancelButton = modal.querySelector('#cancelButton');
    const closeButton = modal.querySelector('.close-button');
    const saveProductButton = modal.querySelector('#saveProductButton');
    const editModal = element.querySelector('#editModal');
    const editForm = element.querySelector('#editForm');

    // Function to show the add product modal
    addProductButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Function to close the add product modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        element.querySelector('#addProductForm').reset();
    });

    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        element.querySelector('#addProductForm').reset();
    });

    // Save product function
    saveProductButton.addEventListener('click', async () => {
        const title = element.querySelector('#productTitle').value;
        const price = parseFloat(element.querySelector('#productPrice').value);
        const imageFile = element.querySelector('#productImage').files[0];

        if (title && price && imageFile) {
            try {
                const listRef = ref(storage, 'products');
                const listResult = await listAll(listRef);
                let productsWithMetadata = await Promise.all(listResult.items.map(async (item) => {
                    const metadata = await getMetadata(item);
                    return {
                        ref: item,
                        id: parseInt(metadata.customMetadata?.id, 10) || 0
                    };
                }));

                productsWithMetadata.sort((a, b) => a.id - b.id);
                const nextId = productsWithMetadata.length > 0 ? productsWithMetadata[productsWithMetadata.length - 1].id + 1 : 1;
                const imageRef = ref(storage, `products/${nextId}.jpg`);
                const uploadResult = await uploadBytes(imageRef, imageFile);

                const metadata = {
                    customMetadata: {
                        id: nextId.toString(),
                        product_title: title,
                        price: price.toString()
                    }
                };

                const metadataResult = await updateMetadata(imageRef, metadata);
                const downloadURL = await getDownloadURL(imageRef);

                const product = {
                    id: nextId,
                    product_title: title,
                    price: price,
                    imageUrl: downloadURL
                };

                let products = JSON.parse(localStorage.getItem('adminProducts')) || [];
                products.push(product);
                localStorage.setItem('adminProducts', JSON.stringify(products));

                modal.style.display = 'none';
                document.querySelector('#addProductForm').reset();
                fetchAllData();
            } catch (error) {
                console.error('Error adding product: ', error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    });

    async function fetchAllData() {
            try {
                const listRef = ref(storage, 'products');
                const res = await listAll(listRef);
                const productPromises = res.items.map(async (itemRef) => {
                    try {
                        const metadata = await getMetadata(itemRef);
                        const downloadURL = await getDownloadURL(itemRef);
    
                        return {
                            id: parseInt(metadata.customMetadata?.id) || 0,
                            product_title: metadata.customMetadata?.product_title || '',
                            price: parseFloat(metadata.customMetadata?.price) || 0,
                            imageUrl: downloadURL
                        };
                    } catch (error) {
                        console.error('Error fetching product data:', error);
                        return null;
                    }
                });
    
                const products = await Promise.all(productPromises);
                allProducts = products.filter(product => product !== null);
                localStorage.setItem('adminProducts', JSON.stringify(allProducts));
            } catch (error) {
                console.error('Error fetching product data from Firebase:', error);
            }
        
        allProducts.sort((a, b) => a.id - b.id);
        console.log(allProducts.map(item => item.price * 1))
        filteredProducts = allProducts;  
        renderTableData();
    }
    
    function renderTableData() {
        const productTableBody = element.querySelector('#productTable tbody');
        productTableBody.innerHTML = '';
    
        if (filteredProducts.length === 0) {
            console.log("No products to display.");
            productTableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
            return;
        }
    
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
    
        for (let i = startIndex; i < endIndex; i++) {
            const product = filteredProducts[i];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" data-id="${product.id}"></td>
                <td>${product.id}</td>
                <td>${product.product_title}</td>
                <td>${product.price}</td>
                <td><img src="${product.imageUrl}" alt="Product Image" style="max-width: 100px;"></td>
                <td>
                    <button class="btn  save-btn edit-product edit-btn" data-id="${product.id}" id="update-btn">Edit</button>
                    <button class="search-btn btn delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            productTableBody.appendChild(row);
        }
    
        totalPages = Math.ceil(filteredProducts.length / pageSize);
        renderPagination();
    }

    function handleEditProduct(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            editModal.querySelector('#editProductId').value = product.id;
            editModal.querySelector('#editTitle').value = product.product_title;
            editModal.querySelector('#editPrice').value = product.price;
            editModal.querySelector('#editProductImage').src = product.imageUrl;

            editModal.style.display = 'block';
        }
    }

    function handleUpdateProduct() {
        const productId = parseInt(editForm.querySelector('#editProductId').value);
        const title = editForm.querySelector('#editTitle').value;
        const price = parseFloat(editForm.querySelector('#editPrice').value);
        const imageFile = editForm.querySelector('#editImage').files[0];

        if (title && price) {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                product.product_title = title;
                product.price = price;

                const updateProductData = async () => {
                    try {
                        const imageRef = ref(storage, `products/${productId}.jpg`);

                        if (imageFile) {
                            await uploadBytes(imageRef, imageFile);
                        }

                        const metadata = {
                            customMetadata: {
                                id: productId.toString(),
                                product_title: title,
                                price: price.toString()
                            }
                        };

                        await updateMetadata(imageRef, metadata);

                        if (imageFile) {
                            product.imageUrl = await getDownloadURL(imageRef);
                        }

                        localStorage.setItem('adminProducts', JSON.stringify(allProducts));
                        editModal.style.display = 'none';
                        fetchAllData();
                    } catch (error) {
                        console.error('Error updating product: ', error);
                    }
                };

                updateProductData();
            }
        } else {
            alert('Please fill in all fields.');
        }
    }

    element.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const productId = parseInt(event.target.getAttribute('data-id'));
            handleEditProduct(productId);
        }

        if (event.target.classList.contains('delete-btn')) {
            const productId = parseInt(event.target.getAttribute('data-id'));
            handleDeleteProduct(productId);
        }
    });

    const updateButton = editForm.querySelector('#update-btn');
    updateButton.addEventListener('click', handleUpdateProduct);

    const modalCloseButton = editModal.querySelector('.close-button');
    modalCloseButton.addEventListener('click', () => {
        editModal.style.display = 'none';
        editForm.reset();
    });

    const cancelEditButton = editModal.querySelector('#cancelEdit');
    cancelEditButton.addEventListener('click', () => {
        editModal.style.display = 'none';
        editForm.reset();
    });

    const searchBar = element.querySelector('#searchBar');
    const searchButton = element.querySelector('#searchButton');
    const clearSearchButton = element.querySelector('#clearSearch');

    function handleSearch() {
        const searchTerm = searchBar.value.trim();
        if (searchTerm) {
            filteredProducts = allProducts.filter(product => product.price.toString().includes(searchTerm));
        } else {
            filteredProducts = allProducts;
        }
        currentPage = 1;
        renderTableData();
    }

    searchButton.addEventListener('click', handleSearch);
    clearSearchButton.addEventListener('click', () => {
        searchBar.value = '';
        filteredProducts = allProducts;
        currentPage = 1;
        renderTableData();
    });

    searchBar.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    const selectAllCheckbox = element.querySelector('#selectAll');
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = element.querySelectorAll('#productTable tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            const productId = parseInt(checkbox.getAttribute('data-id'));
            if (selectAllCheckbox.checked) {
                selectedProductIds.add(productId);
            } else {
                selectedProductIds.delete(productId);
            }
        });
    });

    element.querySelector('#productTable tbody').addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const productId = parseInt(event.target.getAttribute('data-id'));
            if (event.target.checked) {
                selectedProductIds.add(productId);
            } else {
                selectedProductIds.delete(productId);
            }
        }
    });

    function handleDeleteProduct(productId) {
        const confirmDelete = confirm('Are you sure you want to delete this product?');
        if (confirmDelete) {
            const deleteProduct = async () => {
                try {
                    const imageRef = ref(storage, `products/${productId}.jpg`);
                    await deleteObject(imageRef);

                    allProducts = allProducts.filter(p => p.id !== productId);
                    localStorage.setItem('adminProducts', JSON.stringify(allProducts));
                    fetchAllData();
                } catch (error) {
                    console.error('Error deleting product: ', error);
                }
            };

            deleteProduct();
        }
    }

    function renderPagination() {
        const pagination = element.querySelector('#pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'pagination-button';
            if (i === currentPage) {
                pageButton.classList.add('disabled');;
            }

            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderTableData();
            });

            pagination.appendChild(pageButton);
        }
    }

    fetchAllData();

    return element;
}

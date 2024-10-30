import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc,query, where, collection, onSnapshot, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import records from 'images/websites/records.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';

const app = initializeApp(firebaseConfig);
const ab = getFirestore(app); // Ensure Firestore is initialized correctly

let filteredProducts = [];
const pageSize = 20;
let currentPage = 1;
let totalPages = 0;

export function renderWallet() {
    const element = document.createElement('div');
    element.className = 'container';
    element.innerHTML = `
        <div class="d-f">
            <div class="sidebar">
                <ul>
                    <li><img src="${home}" alt="toggle image"/></li>
                    <li class="toggle-submenu"><a href="/members"><img src="${about}" alt="toggle image"/></a></li>
                    <li><a href="/wallet"><img src="${wallet}" alt="toggle image"/></a></li>
                    <li><a href="/withdrawal"><img src="${withdrawal}" alt="toggle image"/></a></li>
                    <li><a href="/supports"><img src="${contact}" alt="toggle image"/></a></li>
                    <li><a href="/products"><img src="${records}" alt="toggle image"/></a></li>
                </ul>
            </div>
            <div class="main-content">
                <div id="errorContainer" class="error-message"></div>
                <div class="filter-section">
                    <div class="filter-inputs">
                        <input type="text" placeholder="Member ID">
                        <input type="text" placeholder="Member account">
                        <input type="text" placeholder="Invitation ID">
                        <button class="btn search-btn">Search</button>
                    </div>
                </div>
                <div class="member-details">
                    <table id="table-container">
                        <thead>
                            <tr>
                                <th style="width:30px">SN</th>
                                <th>Member Information</th>
                                <th>Wallet Information</th>
                                <th>Creation Time</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody class="member-body">
                            <!-- Rows will be dynamically inserted here -->
                        </tbody>
                    </table>
                    <div id="pagination"></div>
                </div>
            </div>
        </div>
    `;

    const errorContainer = element.querySelector('#errorContainer');

    function displayError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 4000);
    }

 

  
function fetchWithdrawals() {
    const memberCollection = collection(ab, "members"); // Use the initialized Firestore instance

    // Create a query to filter documents where wallet_address_information exists
    const q = query(memberCollection, where("wallet_address_information.address", "!=", ''));

    // Set up a real-time listener
    onSnapshot(q, (querySnapshot) => {
        // Map the documents to include only necessary fields
        const memberList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const walletAddressInfo = data.wallet_address_information;
            return {
                id: doc.id,
                ...data,
                wallet_address_information: walletAddressInfo ? walletAddressInfo : []
            };
        });

        // Log the specific field for each document
        memberList.forEach(member => {
            console.log(`Member ID: ${member.id}, Wallet Address Information: `, member.wallet_address_information);
        });

        filteredProducts = memberList;
        updatePaginationButtons();
        renderTable(currentPage);
    }, (error) => {
        console.error("Error fetching members: ", error);
    });
}

    function renderTable(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const productsToShow = filteredProducts.slice(start, end);
        const tableBody = element.querySelector('.member-body');
        tableBody.innerHTML = ''; // Clear previous rows

        productsToShow.forEach((product, index) => {
            console.log(product);
            if (product) {
                const row = createTableRow(product, start + index);
                tableBody.innerHTML += row; // Append new row
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

    async function modifyEdit(index) {
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            try {
                const docId = row.getAttribute('data-id');

                // Update the reset field to false
                const walletDocRef = doc(ab, 'members', docId); // Ensure correct Firestore instance
                await updateDoc(walletDocRef, {
                    'wallet_address_information.reset': false,
                    'wallet_address_information.address': '',
                });

                displayError(`Wallet Address can now be Edit.`);
                
            } catch (error) {
              
                displayError("Error updating document.");
            }
        } else {
            console.log(`Row with data-index "${index}" not found.`);
        }
    }

    function createTableRow(data, index) {
        if (data.wallet_address_information) {
            return `
                <tr data-index="${index}" data-id="${data.id}">
                    <td>${index + 1}</td>
                    <td>
                        <span class="member_id">ID: ${data.id}</span><br>
                        <span class="member_type">Account: ${data.username}</span><br>
                    </td>
                    <td>
                        <span class="member_hsuperior">Type ${data.wallet_address_information.type} </span><br>
                        <span class="member_dsuperior">Transaction Number: ${data.wallet_address_information.address}</span><br>
                    </td>
                    <td>
                        <span class="member_vip">Date: ${data.wallet_address_information.date}</span>
                    </td>
                    <td class="buttons-container">
                       <button data-action="Edit" data-index="${index}">Reset</button>
                    </td>
                </tr>
            `;
        } else {
            return '';
        }
    }

    // Add event listener for the reset button
    element.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            const action = target.getAttribute('data-action');
            const index = target.getAttribute('data-index');
            if (action === 'Edit') {
                modifyEdit(index);
            }
        }
    });

    fetchWithdrawals();
    return element;
}

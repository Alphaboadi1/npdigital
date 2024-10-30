import { handleRoute } from '../index';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, query, where, getDoc, collection, onSnapshot, updateDoc, docRef } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import records from 'images/websites/records.svg';
import declined from 'images/websites/declined.svg';
import approved from 'images/websites/approved.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';
import { showLoader, removeLoader } from './loader';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let filteredProducts = [];
const pageSize = 20;
let currentPage = 1;
let totalPages = 0;

export function renderWithdrawal() {
    const element = document.createElement('div');
    element.className = 'container';
    element.innerHTML = `
        <div class="d-f">
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
                    </li
                </ul>
            </div>
            <div class="main-content">
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
                                <th>Withdrawal Information</th>
                                <th>Submission Time</th>
                                <th>Wallet Address</th>
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

    function fetchWithdrawals() {
        const memberCollection = collection(db, "members");
        // Create a query to filter documents where withdrawal_information.records exists
        const q = query(memberCollection, where("withdrawal_information.records", "!=", null));

        // Set up a real-time listener
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.docChanges().forEach(change => {
                const data = change.doc.data();
                console.log(data);
                const walletAddressInfo = data.withdrawal_information.records;
                console.log(walletAddressInfo);
                 const id = data.withdrawal_information.records.transaction_id
              

                if (change.type === 'added' || change.type === 'modified') {
                    if (walletAddressInfo) {
                        updateOrAddRecord(walletAddressInfo, change.doc.id);
                        console.log('added changes', walletAddressInfo, id)
                    }
                }
                if (change.type === 'removed') {
                    removeRecordById(change.doc.id);
                }
            });

            updatePaginationButtons();
            renderTable(currentPage);
        }, (error) => {
            console.error("Error fetching members: ", error);
        });
    }

    function updateOrAddRecord(walletAddressInfo, docId) {
        walletAddressInfo.forEach(record => {
            record.id = docId;
        });
        console.log(filteredProducts)
        //const index = filteredProducts.findIndex(record => record.id === docId) ;
        const index = filteredProducts.findIndex(oldrecord => oldrecord.some(record => record.id === docId));
        if (index !== -1) {
        console.log(`Found at index: ${index}`);
        } else {
        console.log(`Not found`);
        }
        console.log(index)   
        if (index > -1) {      
            // Update existing record
            filteredProducts[index] = walletAddressInfo;
        } else {
            // Add new record
            filteredProducts.push(walletAddressInfo);
        }
    }

    function removeRecordById(docId) {
        filteredProducts = filteredProducts.filter(record => record.id !== docId);
    }

    function renderTable(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        let newArray = [];
        filteredProducts.forEach(product => {
            newArray.push(...product);
        });
        newArray.sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
        const productsToShow = newArray.slice(start, end);
        const tableBody = document.querySelector('.member-body');
        tableBody.innerHTML = ''; // Clear previous rows

        productsToShow.forEach((product, memberIndex) => {
            if (product) {
                const row = createTableRow(product, memberIndex);
                tableBody.innerHTML += row; // Append new row
            }
        });
    }

    function updatePaginationButtons() {
        const paginationContainer = element.querySelector('#pagination');
        paginationContainer.innerHTML = ''; // Clear previous buttons

        totalPages = Math.ceil(filteredProducts.flat().length / pageSize);

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

    function createTableRow(record, memberIndex) {
        const status = record.status || 'Pending';
        const isPending = status === 'Pending';
        const isApproved = status === 'Approved';
        const isDeclined = status === 'Declined';

        return `
            <tr data-index="${record.id}" data-id="${record.id}">
                <td>${memberIndex + 1}</td>
                <td>
                    <span class="member_id">User ID: ${record.id}</span><br>
                    Account:<span class="member_account"> ${record.username}</span><br>
                    <span class="member_type">Account Type: Client</span><br>
                    <span class="member_invite">Agent Name: ${record.agent_username}</span><br>
                </td>
                <td>
                    Withdrawal Amount:<span class="member_wallet">${record.withdrawal_amount}</span><br>
                    Amount Received:<span class="member_wallet">${record.amount_received}</span><br>
                    <span class="member_cw">Handling Fees: ${record.handling_fees}</span><br>
                </td>
                <td>
                    <span class="member_ct">Completed: ${record.submission_time}</span><br>
                </td>
                <td>
                    Wallet Address: <span class="member_ct">${record.wallet_address}</span><br>
                </td>
                <td>
                    <input type="text" name="fee" class="freeInput" placeholder="Enter Handling Fee" required style="height:38px;font-size:12px; width:100%;background-color: #ecf0f1; border: none;border-radius: 3px;">
                    <br>
                    <div style="text-align:center;">
                        ${isPending ? 
                            `<button class="btn approve-btn" data-action="approve" data-index="${record.transaction_id}" data-record-id="${record.id}" style="padding:8px 14px; border-radius:4px;margin-right:12px;font-size: 12px;">Approve</button> | <button class="btn cancel-btn" data-action="decline" data-index="${record.transaction_id}" data-record-id="${record.id}" style="padding:8px 14px; border-radius: 4px;background:#df484d;font-size:12px; ">Decline</button>` 
                            : isApproved ? 
                            `<img src="${approved}" class="icons" alt="transaction declined">` 
                            : 
                            `<img src="${declined}" class="icons" alt="transaction declined">`
                        }
                    </div>
                </td>
            </tr>
        `;
    }

    element.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            const action = target.getAttribute('data-action');
            const recordId = target.getAttribute('data-record-id');
            const index = target.getAttribute('data-index');
            const row = document.querySelector(`tr[data-id="${recordId}"]`);

            if (action === 'approve') {
                row.querySelector('input[name="fee"]').style.display = 'block';
                target.innerText = 'Submit';
                target.setAttribute('data-action', 'Submit');
                console.log(index);
                
            } else if (action === 'Submit') {
                const handlingFee = row.querySelector('input[name="fee"]').value;
                if (handlingFee === '') {
                    return;
                }
                handleApproval(recordId, handlingFee, index);
        
            } else if (action === 'decline') {
                handleDecline(recordId, index);
            }
        }
    });

    async function handleApproval(recordId, handlingFee, index) {
        try {
            const docRef = doc(db, "members", recordId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const records = data.withdrawal_information.records;
                if (index) {
                    // Create a new array with the updated record
                    records[index].handling_fees = handlingFee;
                    records[index].status = "Approved";
                    records[index].amount_received = "Successful";
    
                    console.log("Updated Records:", records);
    
                    // Write the updated records array back to Firestore
                    await updateDoc(docRef, {
                        "withdrawal_information.records": records
                    });
    
                    console.log("Withdrawal record updated successfully.");
                } else {
                    console.error("Invalid index.");
                }
                // Check if the index is valid
               console.log(records[index], handlingFee);
            } else {
                console.error("No such document!");
            }
        } catch (error) {
            console.error("Error updating withdrawal record: ", error);
        }
            
    }

    async function handleDecline(recordId, index) {
        try {
            const docRef = doc(db, "members", recordId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const records = data.withdrawal_information.records;
                if (index) {
                    records[index].status = "Declined";
                    records[index].amount_received = "Unsuccessful";
                    console.log("Updated Records:", records);
                    // Write the updated records array back to Firestore
                    // get the money that was withdraw
                    const recieveAmount = parseFloat(records[index].withdrawal_amount);
                    const walletAmount = parseFloat(data.wallet_information.wallet_balance);

                    const newalletbalance = (recieveAmount + walletAmount);
                    console.log("New Balance:", newalletbalance)

                     await updateDoc(docRef, {
                         "withdrawal_information.records": records,
                         "wallet_information.wallet_balance":newalletbalance,
                         
                     });
                    console.log("Withdrawal record updated successfully.");
                } else {
                    console.error("Invalid index.");
                }
            
            }
   
        } catch (error) {
            console.error("Error declining withdrawal: ", error);
        }
    }

    fetchWithdrawals();
    return element;
}

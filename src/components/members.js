import { handleRoute } from '../index';
import firebaseConfig from '../firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getUserIp } from '../utils/utils.js';
import { showLoader, removeLoader } from './loader';
import { getFirestore, doc, query, orderBy, deleteDoc, where, collection, getDoc,  getDocs, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import records from 'images/websites/records.svg';
import about from 'images/websites/about.svg';
import home from 'images/websites/home.svg';
import wallet from 'images/websites/wallet.svg';
import withdrawal from 'images/websites/Withdraw.svg';
import contact from 'images/websites/contact.svg';
import { deleteUser } from 'firebase/auth';


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



export function renderMember() {
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
                    <div id="support">
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
            <div id="errorContainer" class="error-message"></div>
            <div class="filter-section">
               <div class="filter-inputs">
                    <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
                        <input type="text" placeholder="Invitation ID" name="cw-code" id="invitation-id" >
                        <span class="btn close-button" id="clearInvitation">x</span>
                    </div>
                    <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
                        <input type="number" placeholder="Phone Numbers" name="pno" id="phone-number" >
                        <span class="btn close-button" id="clearPhone">x</span>
                    </div>
                    <div style="display: inline-flex; align-items: center; gap:25px; margin-bottom:20px">
                        <input type="username" placeholder="Username" name="username" id="user-name" >
                        <span class="btn close-button" id="clearUsername">x</span>
                    </div>
                    <button class="btn search-btn" id="cw-sbtn">Search</button>
                </div>
            </div>
            <div class="member-details">
            <button class="add-member-btn">Add new member</button>
                <table id="table-container">
                    <thead>
                        <tr>
                            <th style="width:30px">SN</th>
                            <th>Member Information</th>
                            <th>Superior Information</th>
                            <th style="width:50px">VIP</th>
                            <th>Wallet Information</th>
                            <th style="width:150px">Mission Info</th>
                            <th>Registration Message</th>
                            <th>Login Information</th>
                            <th>Operate</th>
                        </tr>
                    </thead>
                    <tbody class="member-body">
                        <!-- Rows will be dynamically inserted here -->
                    </tbody>
                </table>
            </div>
            <div id="pagination"></div>
        </div>
        
        <!-- SIGN UP MODAL -->
        <div id="modal-signup" class="modal">
            <div class="modal-content">
                <h4>Sign up</h4><br />
                <form id="inreg-form">
                    <div class="input-field">
                        <label for="username">Enter Username</label>
                        <input type="text" id="username" name="username" placeholder="Username"/>
                    </div>
                    <div class="input-field">
                        <label for="pnumber">Phone Number</label>
                        <input type="number" id="pnumber" name="pnumber" placeholder="Type Phone number"/>
                    </div>
                    <div class="input-field">
                        <label for="password">Choosen password</label>
                        <input type="password" id="password" name="password" required placeholder="Type Password"/>
                    </div>
                    <div class="input-field">
                        <label for="type-select">Choose Account type:</label>
                        <select id="type-select" name="type">
                            <option value="internal">Internal</option>
                            <option value="agent" selected>Agent</option>
                        </select>
                    </div>
                    <div class="input-field" id="invitation-code-field" style="display: none;">
                        <label for="signup-invitation">Invitation Code</label>
                        <input type="text" id="signup-invitation" name="signup-invitation" placeholder="Enter Invitation Code"/>
                    </div>
                    <button type="submit" class="btn save-btn yellow darken-2 z-depth-0">Sign up</button>
                </form>
            </div>
        </div>
        <div id="vipSelectmyModal" class="vipSelectmodal">
            <div class="vipSelectmodal-content">
            <h2 class="modalh">Select VIP Level</h2>
            <select id="vipSelect">
                <option value="vip1">VIP 1</option>
                <option value="vip2">VIP 2</option>
                <option value="vip3">VIP 3</option>
                <option value="vip4">VIP 4</option>
                <option value="vip5">VIP 5</option>
                <!-- Add more options as needed -->
            </select>
            <button id="saveVipBtn" class="btn vipbutton save-btn">Save</button>
            </div>
        </div>
        <div id="SelectmyOrder" class="SelectmyOrder">
            <div class="selectorder">
                <label for="operationType">Operation Type:</label>
                <div class="walletAmount" id="walletAmount"></div>
                <select id="selectOp">
                    <option value="subtraction" name="subtraction">Subtraction</option>
                    <option value="addition" name="Addition">Addition</option>
                </select>
                <br>
                <div class="booking-input">
                    <label for="amountInput">Amount:</label><br/>
                    <input type="number" id="amountInput">
                </div>
                <button id="submitBtn" class="btn booking-button save-btn">Save</button>
                <button  class="btn cancel cancel-btn">Cancel</button>
            </div>
        </div>
        <div id="credibilityModal" class="credibilityModal">
            <div class="credibility-content">
                <h2 class="modalh">Enter Credibility Score</h2>
                <input type="text" name="credibility" placeholder="Enter Credibility Score" class="credibility" required>
                <button id="credibilityBtn" class="btn credibility save-btn">Save</button>
            </div>
        </div>
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
        element.querySelector('#support').addEventListener('click', (e) => {
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
        const modal = element.querySelector('#modal-signup');
        const addMemberBtn = element.querySelector('.add-member-btn');
    
        if(addMemberBtn){
            addMemberBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                    inRegForm.querySelectorAll('input').forEach(input => input.value = '');
                }
            });
        }
        const inRegForm = element.querySelector('#inreg-form');
        if (inRegForm) {
            const typeSelect = element.querySelector('#type-select');
            const invitationCodeField = element.querySelector('#invitation-code-field');
        
            typeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'internal') {
                    invitationCodeField.style.display = 'block';
                } else {
                    invitationCodeField.style.display = 'none';
                }
            });

            inRegForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const messageSpan = element.querySelector('#message');
               
                const phone = inRegForm.pnumber.value;
                const password = inRegForm.password.value;
                const username = inRegForm.username.value;
                const accountType = inRegForm.type.value;
                let invitationCode = '';
                let supervisorId = 0;
                let supervisorIndex = 0;
                let superiorUsername = '';
        
                // Check if username or phone number already exists
                const usernameQuery = query(collection(db, "members"), where("username", "==", username));
                const phoneQuery = query(collection(db, "members"), where("phone", "==", phone));
        
                Promise.all([getDocs(usernameQuery), getDocs(phoneQuery)])
                    .then(([usernameSnapshot, phoneSnapshot]) => {
                        if (!usernameSnapshot.empty) {
                            throw new Error('Username already exists');
                        }
                        if (!phoneSnapshot.empty) {
                            throw new Error('Phone number already exists');
                        }
        
                        if (accountType === 'internal') {
                            invitationCode = element.querySelector('#signup-invitation').value;
                            const invitationQuery = query(collection(db, "members"), where("member_information.invitation_code", "==", invitationCode), where("member_information.type", "==", "Client"),);
                            return getDocs(invitationQuery)
                                .then((invitationSnapshot) => {
                                    if (invitationSnapshot.empty) {
                                        throw new Error('Invalid invitation code');
                                    }else{
                                        invitationCode = generateInvitationCode();
                                    }
                                    const supervisorDoc = invitationSnapshot.docs[0];
                                    supervisorId = supervisorDoc.id;
                                    superiorUsername = supervisorDoc.data().username
                                    const supervisorWalletBallance = supervisorDoc.data().wallet_information.wallet_balance
                                    supervisorIndex = invitationSnapshot.docs.findIndex(doc => doc.id === supervisorDoc.id) + 1;
                                     updateClientAccountWallet(supervisorId, supervisorWalletBallance)
                                    return {supervisorId, superiorUsername};
                                   
                                });
                        } else {
                            invitationCode = generateInvitationCode();
                            
                        }
                    }).then(() => {
                      // Get user IP information after username and phone number checks
                      return getUserIp();
                    })
                    .then(({ ip, country}) => {
                    const now = new Date();
                    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                      console.log(formattedDate)
                
                        const memberData = {
                          username:username,
                          phone: phone,
                          password:password,
                            member_information: {
                                type: accountType,
                                invitation_code: invitationCode,
                                reputation_points: "100",
                                isLogin:false
                            },
                            superior_information: {
                                direct_reporting_account: "SupervisorAccount",
                                highest_superior_username: superiorUsername,
                                direct_supervisor_id: supervisorId || 0,
                                highest_level_account: supervisorIndex,
                            },
                            VIP_level: "vip2",
                            profits:1,
                            wallet_information: {
                                cumulative_recharge: 0,
                                wallet_balance: 2000.34,
                                amount_in_transit: 0,
                                frozen_amount: 0,
                                cumulative_withdrawal: 0,
                                //withdrawal_password:withdrawalP,
                                withdrawal_status: "Normal withdrawal"
                            },
                            withdrawal_information:{
                                records:[]
                            },
                            wallet_address_information:{
                                address:'',
                                date:'',
                                reset:'',
                                type:'',
                            },
                            mission_information: {
                                completed: 0,
                                total_tasks:45,
                                number_of_resets: 0,
                                records:[],
                                combination_active:false,
                                combination:[],
                                combinationNumber:0,
                                profits_earned:0,
                                todays_profits: 0,
                                profits_last_updated: formattedDate,
                                transactions:[],
                                products_to_submit:[]
                            },
                            registration_message: {
                                ip_address: ip, // Capture this separately
                                address: country,
                                date: formattedDate
                            },
                            login_information: {
                                ip_address: "", // Capture this separately
                                date: "",
                                allowed: true,
                            },
                            operate: {
                                freeze_account: true,
                                enable_invite: true,
                                limit_withdrawal: false,
                                change_login_password: false,
                                change_withdrawal_password: false,
                                reset_today_task_volume: false,
                                account_enable:true,
                            }
                        };
        
                        return addDoc(collection(db, "members"), memberData);
                        
                    })
                    .then(() => { 
                      inRegForm.reset(); 
                      inRegForm.querySelectorAll('input').forEach(input => input.value = '');
                      modal.style.display = 'none';
                        alert('User registered successfully');
                        
                    })
                    .catch((error) => {
                        alert(error.message+ "error here");
                    });
            });
        }
        
    
        function generateInvitationCode(length = 6) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let invitationCode = '';
            
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                invitationCode += characters[randomIndex];
            }
            
            return invitationCode;
        }
        
       async function updateClientAccountWallet(supervisorId, wallet){
            const userDocRef = doc(db, 'members', supervisorId);
            const newBalanceAmount = roundToTwoDecimals(parseFloat(wallet) + 28.01);
            try {
                await updateDoc(userDocRef, {
                    'wallet_information.wallet_balance': newBalanceAmount
                });
            } catch (error) {
                console.error('Error updating security PIN:', error);
            }
       }
    
    const pageSize = 20;
     let currentPage = 1;
     let totalPages = 0;
     let allProducts = [];
     let filteredMembers = [];

    function fetchMembers() {
      const memberCollection = collection(db, "members");
      const membersQuery = query(memberCollection, orderBy("login_information.date", "asc"));
      console.log(membersQuery);
      // Set up a real-time listener
      onSnapshot(membersQuery, (memberSnapshot) => {
        console.log(memberSnapshot);
        allProducts = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filteredMembers = allProducts.reverse();
        updatePaginationButtons();
        renderTable(currentPage);
      }, (error) => {
        console.error("Error fetching members: ", error);
      });
    }

  

        const invitationIdInput = element.querySelector('#invitation-id');
        const phoneNumberInput = element.querySelector('#phone-number');
        const usernameSearchInput = element.querySelector('#user-name');
        const searchButton = element.querySelector('#cw-sbtn');
        const clearInvitationButton = element.querySelector('#clearInvitation');
        const clearPhoneButton = element.querySelector('#clearPhone');
        const  clearUsernameButton = element.querySelector('#clearUsername');
    
        // Function to perform search based on the input value
        function performSearch(inputValue, field) {
            if (field === 'invitation') {
                filteredMembers = allProducts.filter((member) => 
                    member.member_information.invitation_code == inputValue
                );
            } else if (field === 'phone') {
                filteredMembers = allProducts.filter((member) => 
                    member.member_information.phone_number == inputValue
                );
            }else if(field === 'username'){
                filteredMembers = allProducts.filter((member) => 
                    member.username == inputValue
                );
            }
            currentPage = 1; // Reset to first page
            renderTable(currentPage);
            updatePaginationButtons();
        }
    
        searchButton.addEventListener('click', () => {
            const invitationValue = invitationIdInput.value;
            const phoneValue = phoneNumberInput.value;
            const usernameValue = usernameSearchInput.value;
    
            if (invitationValue) {
                performSearch(invitationValue, 'invitation');
            } else if (phoneValue) {
                performSearch(phoneValue, 'phone');
            } else if(usernameValue){
                performSearch(usernameValue, 'username');
            }else {
                // If no input, show all products
                filteredMembers = allProducts;
                currentPage = 1;
                renderTable(currentPage);
                updatePaginationButtons();
            }
        });
    
        clearInvitationButton.addEventListener('click', () => {
            invitationIdInput.value = '';
            filteredMembers = allProducts;
            currentPage = 1;
            renderTable(currentPage);
            updatePaginationButtons();
        });
    
        clearPhoneButton.addEventListener('click', () => {
            phoneNumberInput.value = '';
            filteredMembers = allProducts;
            currentPage = 1;
            renderTable(currentPage);
            updatePaginationButtons();
        });

         clearUsernameButton.addEventListener('click', () => {
            usernameSearchInput.value = '';
             filteredMembers = allProducts;
             currentPage = 1;
             renderTable(currentPage);
             updatePaginationButtons();
         });

    function updatePaginationButtons() {
        const paginationContainer = element.querySelector('#pagination');
        paginationContainer.innerHTML = ''; // Clear previous buttons

        totalPages = Math.ceil(filteredMembers.length / pageSize);

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

    function renderTable(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const productsToShow = filteredMembers.slice(start, end);
        const tableBody = element.querySelector('.member-body');
        tableBody.innerHTML = ''; // Clear previous rows
    
        productsToShow.forEach((product, index) => {
            if(tableBody){
                const row = createTableRow(product, start + index);
                tableBody.innerHTML += row;
              }
        });
    }
 
    
    function createTableRow(data, index) {
      return `
        <tr data-index="${index}" data-id="${data.id}">
          <td class="">${index + 1}</td>
          <td>
            <span class="member_id">ID: ${data.id}</span><br>
            Username:<span class="member_account"> ${data.username}</span><br>
            <span class="member_type">Account Type: ${data.member_information.type}</span><br>
            <span class="member_invite"> Invitation code: ${data.member_information.invitation_code}</span><br>
            Credibility: <span class="member_rep">${data.member_information.reputation_points}</span><br>
          </td>
          <td>
          <span class="member_hsuperior">Direct reporting account: ${data.superior_information.direct_reporting_account}</span>
           <br>
           <span class="member_dsuperior">Direct supervisor ID: ${data.superior_information.direct_supervisor_id}</span><br>
           <span class="member_hlsuperior">Highest level account: ${data.superior_information.highest_level_account}</span><br>
           <span class="member_hlsuperior">Superior Username: ${data.superior_information.highest_superior_username}</span>
          
           </td>
          <td><span class="member_vip">${data.VIP_level}</span></td>
          <td>
          <span class="member_cr">Cumulative recharge: ${data.wallet_information.cumulative_recharge}</span><br>
          Wallet balance: <span class="member_wallet">${Number(data.wallet_information.wallet_balance).toFixed(2)}</span><br>
          Amount in transit:<span class="member_wallet">${data.wallet_information.amount_in_transit}</span><br>
          Frozen amount: <span class="member_fr">${Number(data.wallet_information.frozen_amount).toFixed(2)}<br>
          <span class="member_cw">Cumulative withdrawal: ${data.wallet_information.cumulative_withdrawal}</span><br>
          <span class="member_ws">Withdrawal status: ${data.wallet_information.withdrawal_status}
          </td>
          <td>
          <span class="member_ct">Completed: ${data.mission_information.completed}</span><br>
          <span class="member_tt">Total tasks: ${data.mission_information.total_tasks}</span><br>
          <span class="member_nr">Number of resets: ${data.mission_information.number_of_resets}</span>
          </td>
          <td>
          <span class="member_rip">IP: ${data.registration_message.ip_address}</span><br>
          <span class="member_add"> Address: ${data.registration_message.address}</span><br>
          <span class="member_date"> Date: ${data.registration_message.date}</span>
          </td>
          <td>
          <span class="member_lip">IP: ${data.login_information.ip}</span><br>
          <span class="member_load">Address: ${data.login_information.ip_address}</span><br>
          <span class="member_d">Date: ${data.login_information.date}</span>
          </td>
          <td class="buttons-container">
            <button data-action="modifyVipLevel" data-index="${index}">Modify VIP Level</button>
            <button data-action="freezeAccount" class="${data.login_information.allowed ? '' : 'color-cli'}" id="fre_btn" data-index="${index}">Freeze Account</button>
            <button data-action="systemBooking" data-index="${index}">System Booking</button>
            <button data-action="enableInvite" data-index="${index}">Delete User</button>
            <button data-action="limitWithdrawal" data-index="${index}">Limit withdrawal</button>
            <button data-action="changeLoginPassword" data-index="${index}">Change login password</button>
            <button data-action="changeWithdrawalPassword" data-index="${index}">Change withdrawal password</button>
            <button data-action="orderSettings" data-index="${index}">Order settings</button>
            <button data-action="resetTaskVolume" data-index="${index}">Reset today's task volume</button>
          </td>
        </tr>
      `;
    }
    
    
    
    // Fetch and render the members when the script is loaded
    fetchMembers();
      // Function to attach event listeners to the buttons
    const tableContainer = element.querySelector('#table-container');
    if(tableContainer){
        tableContainer.addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.tagName === 'BUTTON') {
            const action = target.getAttribute('data-action');
            const index = target.getAttribute('data-index');
        
            switch(action) {
            case 'modifyVipLevel':
                modifyVipLevel(index);
                break;
            case 'systemBooking':
                systemBooking(index);
                break;
            case 'enableInvite':
                deleteUser(index);
                break;
                case 'freezeAccount':
                    freezeAccount(index);
                    break;
            case 'limitWithdrawal':
                limitWithdrawal(index);
                break;
            case 'changeLoginPassword':
                changeLoginPassword(index);
                break;
            case 'changeWithdrawalPassword':
                changeWithdrawalPassword(index);
                break;
            case 'orderSettings':
                orderSettings(index);
                break;
            case 'resetTaskVolume':
                resetTaskVolume(index);
                break;
            default:
                console.log('Unknown action:', action);
            }
        }
        });
    }
    

    function modifyVipLevel(index) {
        const row = document.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            const vipLevelCell = row.querySelector('.member_vip');
    
            const modalBtn = document.querySelector('#vipSelectmyModal');
            modalBtn.style.display = 'block';
    
            const saveBtn = modalBtn.querySelector('#saveVipBtn');
            
            // Clear any existing event listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
            newSaveBtn.addEventListener('click', function() {
                if (vipLevelCell) {
                    const selectValue = modalBtn.querySelector('#vipSelect').value;
                    modalBtn.querySelector('#vipSelect').value = 'vip1';
                    modalBtn.style.display = 'none';
                    const docId = row.getAttribute('data-id');
                    updateFirestoreVIPLevel(vipLevelCell, docId, selectValue);
                } else {
                    console.error(`VIP Level cell not found for row ${index}`);
                }
            });
        } else {
            console.error(`Row not found for index ${index}`);
        }
    }
    // Change Password
    async function changeLoginPassword(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id');
        if (row) {
                await updateSecurityPin(docId);
                displayNotification('Security PIN successfully updated', false);
        }
        
    }

    async function freezeAccount(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id');
        const button = row.querySelector('#fre_btn');
        const member = filteredMembers.find(id => id.id === docId);
        let memberallowed = member.login_information.allowed;
        memberallowed = memberallowed === true ? false : true 
        if (row) {
                await updateFrozenAccount(docId, memberallowed);
                if(memberallowed){
                    displayNotification('Account UnFreezed', false);
                }else{
                    displayNotification('Account Freezed', false);
                }
                button.classList.toggle('color-cli')
        }
    }

    async function updateFrozenAccount(userId, memberallowed) {
        const userDocRef = doc(db, 'members', userId);
        try {
            await updateDoc(userDocRef, {
                'login_information.allowed': memberallowed
            });
        } catch (error) {
            console.error('Error updating security PIN:', error);
        }
    }

    const errorContainer = element.querySelector('#errorContainer');

    function displayNotification(message, isError = true) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.style.color = isError ? 'red' : 'green';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 4000);
    }

    async function updateSecurityPin(userId) {
        const userDocRef = doc(db, 'members', userId);
        try {
            await updateDoc(userDocRef, {
                'password': "123456"
            });
        } catch (error) {
            console.error('Error updating security PIN:', error);
        }
    }
   

    // change Withdrawal Password
    async function changeWithdrawalPassword(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id');
        if (row) {
                await updateSecurityPass(docId);
                displayNotification('Security PIN successfully updated', false);
            }
        
    }
    async function updateSecurityPass(userId) {
        const userDocRef = doc(db, 'members', userId);
        try {
            await updateDoc(userDocRef, {
                'wallet_information.withdrawal_password': "123456"
            });
        } catch (error) {
            console.error('Error updating security PIN:', error);
        }
    }
    // Delete User
    async function deleteUser(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id');
        if (row) {
                await deleteUserData(docId);
                displayNotification('User Successfully Deleted!', true);
        }
    }
    async function deleteUserData(userId) {
        const userDocRef = doc(db, 'members', userId);
        try {
            await deleteDoc(userDocRef);
        } catch (error) {
            console.error('Error Deleting User:', error);
        }
    }
    // update them credibility
    function limitWithdrawal(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id');
        if (row) {
            const modalBtn = document.querySelector('#credibilityModal');
            const saveBtn = document.querySelector('#credibilityBtn');
            modalBtn.style.display = 'block';
            saveBtn.addEventListener('click',()=>{
                const credibilityContent= document.querySelector('.credibility')
                if(credibilityContent.value){
                    modalBtn.style.display = 'none';
                    updateCredibilityScore(docId, credibilityContent.value);
                }else{
                    return
                }
            })
            
            
        }
    }

    async function updateCredibilityScore(docId, credScore) {
        const userDocRef = doc(db, 'members', docId);

        try {
            await updateDoc(userDocRef, {
                'member_information.reputation_points': credScore,
            });
        } catch (error) {
            console.error('Error updating document:', error);
        }
    }
    // check if the product array length is > =0, if it is no need to update the product 
    const vipTaskMapping = {
        'vip1': [40, 0.5],
        'vip2': [45, 1],
        'vip3': [50, 1.5],
        'vip4': [55, 2],
        'vip5': [60, 2.5]
    };
    async function updateFirestoreVIPLevel(vipLevelCell, docId, newVipLevel) {
        try {

            const totalTasks = vipTaskMapping[newVipLevel][0] || 40;
            const profits = vipTaskMapping[newVipLevel][1] || 0.5;
            const docRef = doc(db, 'members', docId);
    
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                console.log("No such document!");
                return;
            }
    
            const missionInfo = docSnap.data();
            let completedTask = missionInfo.mission_information.completed || 0;
    
            if (completedTask === 0) {
                await updateDoc(docRef, {
                    VIP_level: newVipLevel,
                    profits:profits,
                    'mission_information.total_tasks': totalTasks,
                });
                vipLevelCell.textContent = newVipLevel;
            }
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    function systemBooking(index) {
        const row = element.querySelector(`tr[data-index="${index}"]`);
        if (row) {
          const vipLevelCell = row.querySelector('.member_wallet');
          const frozenAmount = row.querySelector('.member_fr');
          const frozen_amount = frozenAmount.innerText
          const currentText = vipLevelCell.textContent;
          const currentBalance = parseFloat(currentText.replace('Wallet balance: ', ''));
          const modalBtn = element.querySelector('#SelectmyOrder');
          modalBtn.style.display = 'block';
      
          const saveBtn = modalBtn.querySelector('.booking-button');
          const cancelBtn = element.querySelector('.cancel');
          // Clear any existing event listeners
          const newSaveBtn = saveBtn.cloneNode(true);
          const newCancelBtn = cancelBtn.cloneNode(true);
          saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
          cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                
          newCancelBtn.addEventListener('click', ()=>{
            modalBtn.style.display= "none";
          })
          
          newSaveBtn.addEventListener('click', function() {
            if (!isNaN(currentBalance)) {
              // Update the cell content
              const selectValue = modalBtn.querySelector('#selectOp').value;
              const amountInput = modalBtn.querySelector('#amountInput');
              const amount = parseFloat(amountInput.value);
              const amountFrozen = parseFloat(frozen_amount)
      
              if (isNaN(amount)) {
                alert('Please enter a valid number');
                return;
              }
      
              let newBalance;
              if (selectValue === 'subtraction') {
                newBalance = currentBalance - amount;
              } else if (selectValue === 'addition') {

                newBalance = amountFrozen ? (amount + amountFrozen) : (currentBalance + amount);
              } else {
                console.error('Invalid operation type');
                return;
              }
      
              vipLevelCell.textContent = `Wallet balance: ${newBalance}`;
              frozenAmount.textContent = '0'
              
              // Reset the select element value to the first option
              modalBtn.querySelector('#selectOp').value = 'addition'; // or any default value you prefer
              amountInput.value = ''; // Reset the input field
              
              modalBtn.style.display = 'none';
              const docId = row.getAttribute('data-id');
              // Update Firestore
              updateFirestoreBooking(docId, newBalance);
            } else {
              console.error(`VIP Level cell not found for row ${index}`);
            }
          });
        } else {
          console.error(`Row not found for index ${index}`);
        }
      }

      async function updateFirestoreBooking(docId, newBalance) {
            const userDocRef = doc(db, 'members', docId); 
            const updatedBalance = Number(newBalance).toFixed(2);
            try {
                await updateDoc(userDocRef, {
                    'wallet_information.wallet_balance': updatedBalance,
                    'wallet_information.frozen_amount': 0
                });
                console.log('Document successfully updated!');
            } catch (error) {
                console.error('Error updating document:', error);
            }
        }

        function roundToTwoDecimals(value) {
            return Math.round(value * 100) / 100;
        }
        
     // When the ordersetting Button is clicked
     function orderSettings(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const orderSettingUser = row.querySelector('.member_account').innerText
        const orderSettingUserAmount = row.querySelector('.member_wallet').innerText
        const docId = row.getAttribute('data-id');
        if(row){
          try {
            sessionStorage.setItem('userId', docId);
            sessionStorage.setItem('username', orderSettingUser);
            sessionStorage.setItem('wallet_amount', orderSettingUserAmount);
        } catch (error) {
            // Handle error (e.g., session storage not available)
            console.error('Session storage not available. Using local storage as fallback.');
            localStorage.setItem('userId', docId);
            localStorage.setItem('username', orderSettingUser);
            localStorage.setItem('wallet_amount', orderSettingUserAmount);
        }
            window.history.pushState({}, '', '/ordersetting');
            handleRoute();
          
        }
      }
      // When you click on the menu on the sideBar it goes to the route
      element.querySelector('#homeBtn').addEventListener(('click'),()=>{
        window.history.pushState({}, '', '/members');
        handleRoute();
      })

      function resetTaskVolume(index){
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const docId = row.getAttribute('data-id'); 

        resetTaskV(docId);
      }

      async function resetTaskV(docId){
        try {
            const docRef = doc(db, 'members', docId);
            const docSnap = await getDoc(docRef);
    
            if (!docSnap.exists()) {
                console.log("No such document!");
                return;
            }
    
            const missionInfo = docSnap.data().mission_information;
            // const vipLevel = docSnap.data().VIP_level;
            let completedReset = missionInfo.number_of_resets || 0;
            if(completedReset > 3){
                completedReset = 0
            }else{
                completedReset += 1;
            }
            
    
            await updateDoc(docRef, {
                'mission_information.completed': 0,
                'mission_information.records': [],
                'mission_information.transactions': [],
                'mission_information.profits_earned': 0,
                'mission_information.products_to_submit':[],
                //'mission_information.products_to_submit':[],
                'mission_information.number_of_resets': completedReset,
            });
    
            console.log("Document successfully updated!");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
      }

    return element;
}
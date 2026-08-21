// Interactive Javascript Logic for Atlas Flow

// Global simulated State
let billingCycle = 'monthly'; // 'monthly' or 'annually'
let activeAuthTab = 'signin';
let totalRunsCounter = 14802;

// List of interactive nodes inside the Monitor sandbox
let sandboxNodes = [
    { id: 1, type: 'Trigger', title: 'Lead Created', desc: 'New sign up', status: 'Ready', icon: 'fa-bolt', color: 'teal' },
    { id: 2, type: 'Action', title: 'Send Welcome', desc: 'SMTP Server', status: 'Idle', icon: 'fa-regular fa-envelope', color: 'indigo' },
    { id: 3, type: 'Sync', title: 'Notify Channel', desc: 'Slack Integration', status: 'Idle', icon: 'fa-brands fa-slack', color: 'amber' }
];

// Helper Function: Show interactive toast alert
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl border transition-all transform translate-y-2 opacity-0 duration-300 ${
        type === 'success' 
            ? 'bg-slate-900 border-[#2d7a8d]/40 text-slate-100' 
            : 'bg-rose-900 border-rose-800'
    }`;
    
    // Add inside custom icon
    const icon = type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 'fa-solid fa-triangle-exclamation text-rose-400';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span class="text-xs font-semibold">${message}</span>
    `;

    container.appendChild(toast);

    // Animate In
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);

    // Animate Out
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.className = 'fa-solid fa-xmark text-xl';
    } else {
        menu.classList.add('hidden');
        icon.className = 'fa-solid fa-bars text-xl';
    }
}

// Toggle Billing Interval & prices
function toggleBillingPeriod() {
    const dot = document.getElementById('billing-toggle-dot');
    const labelMonthly = document.getElementById('label-monthly');
    const labelAnnually = document.getElementById('label-annually');
    const pricePro = document.getElementById('price-pro');
    const priceEnterprise = document.getElementById('price-enterprise');

    if (billingCycle === 'monthly') {
        billingCycle = 'annually';
        dot.style.transform = 'translateX(0px)';
        labelMonthly.className = 'text-sm font-semibold text-slate-400';
        labelAnnually.className = 'text-sm font-semibold text-slate-900 flex items-center gap-1.5';
        pricePro.textContent = '$23'; // 20% off
        priceEnterprise.textContent = '$79';
        showToast('Switched to Annual Billing (Save 20%)');
    } else {
        billingCycle = 'monthly';
        dot.style.transform = 'translateX(24px)';
        labelMonthly.className = 'text-sm font-semibold text-slate-900';
        labelAnnually.className = 'text-sm font-semibold text-slate-400 flex items-center gap-1.5';
        pricePro.textContent = '$29';
        priceEnterprise.textContent = '$99';
        showToast('Switched to Monthly Billing');
    }
}

// Open Auth modal
function openAuthModal(tab = 'signin') {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.bg-white').classList.remove('scale-95');
    }, 50);
    setAuthTab(tab);
}

// Close Auth modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('.bg-white').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Switch between tab screens
function setAuthTab(tab) {
    activeAuthTab = tab;
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const submitBtnText = document.getElementById('auth-submit-btn-text');
    const signupExtraFields = document.getElementById('signup-extra-fields');

    if (tab === 'signin') {
        tabSignin.className = "flex-1 pb-3 text-center font-bold text-sm border-b-2 border-[#2d7a8d] text-[#1e2e3d]";
        tabSignup.className = "flex-1 pb-3 text-center font-bold text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-600";
        submitBtnText.textContent = "Log In";
        signupExtraFields.classList.add('hidden');
    } else {
        tabSignup.className = "flex-1 pb-3 text-center font-bold text-sm border-b-2 border-[#2d7a8d] text-[#1e2e3d]";
        tabSignin.className = "flex-1 pb-3 text-center font-bold text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-600";
        submitBtnText.textContent = "Start Free Trial";
        signupExtraFields.classList.remove('hidden');
    }
}

// Handle login / signup submission
function handleAuthSubmit(event) {
    event.preventDefault();
    closeAuthModal();
    if (activeAuthTab === 'signin') {
        showToast('Welcome back! Atlas active workspace loaded.');
    } else {
        showToast('Account initialized successfully! Enjoy your 14-day free trial.');
    }
}

// --- WORKFLOW STUDIO INTERACTIVE LOGIC ---

// Render active nodes inside Sandbox DOM container
function renderSandboxNodes() {
    const container = document.getElementById('sandbox-nodes-container');
    // Clear dynamic elements, keeping custom progression indicator background line
    container.querySelectorAll('.sandbox-node').forEach(node => node.remove());

    sandboxNodes.forEach(node => {
        const div = document.createElement('div');
        div.id = `node-${node.id}`;
        div.className = `sandbox-node bg-slate-950/90 border-2 border-slate-700 hover:border-[#2d7a8d] p-4 rounded-xl shadow-md transition-all relative z-10`;
        
        let colorClasses = '';
        if (node.color === 'teal') colorClasses = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
        else if (node.color === 'indigo') colorClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        else colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

        div.innerHTML = `
            <div class="absolute -top-3 right-3 ${colorClasses} text-[9px] font-bold px-2 py-0.5 rounded border uppercase">${node.type}</div>
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg ${colorClasses} flex items-center justify-center">
                    <i class="${node.icon}"></i>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-white">${node.title}</h4>
                    <p class="text-[10px] text-slate-400">${node.desc}</p>
                </div>
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span id="node-${node.id}-status" class="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Idle
                </span>
                <div class="flex gap-2">
                    <button onclick="editNode(${node.id})" class="text-[11px] text-slate-400 hover:text-white transition-colors"><i class="fa-solid fa-pen"></i></button>
                    ${node.id !== 1 ? `<button onclick="deleteNode(${node.id})" class="text-[11px] text-rose-400/70 hover:text-rose-400 transition-colors"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // Adjust horizontal layout column distribution based on dynamic count
    const nodeCount = sandboxNodes.length;
    container.style.gridTemplateColumns = `repeat(${nodeCount}, minmax(0, 1fr))`;
}

// Add custom dynamic action step
function addNewStep() {
    if (sandboxNodes.length >= 4) {
        showToast('Sandbox supports max 4 workflow steps for clear workspace resolution.', 'error');
        return;
    }

    const nextId = Math.max(...sandboxNodes.map(n => n.id)) + 1;
    const types = ['Action', 'Sync'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    let newNode = {
        id: nextId,
        type: selectedType,
        title: selectedType === 'Action' ? 'Process Data' : 'Sync Target',
        desc: selectedType === 'Action' ? 'Automated script' : 'Database API',
        status: 'Idle',
        icon: selectedType === 'Action' ? 'fa-solid fa-gears' : 'fa-solid fa-database',
        color: selectedType === 'Action' ? 'indigo' : 'amber'
    };

    sandboxNodes.push(newNode);
    renderSandboxNodes();
    showToast(`Added custom step: "${newNode.title}"`);
}

// Delete custom step
function deleteNode(id) {
    sandboxNodes = sandboxNodes.filter(n => n.id !== id);
    renderSandboxNodes();
    showToast('Workflow node deleted');
}

// Modal interface to modify step values
function editNode(id) {
    const node = sandboxNodes.find(n => n.id === id);
    if (!node) return;

    document.getElementById('edit-node-id').value = node.id;
    document.getElementById('edit-node-title').value = node.title;
    document.getElementById('edit-node-subtext').value = node.desc;

    const modal = document.getElementById('node-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
    }, 50);
}

function closeNodeModal() {
    const modal = document.getElementById('node-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function saveNodeChange(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-node-id').value);
    const title = document.getElementById('edit-node-title').value;
    const subtext = document.getElementById('edit-node-subtext').value;

    const index = sandboxNodes.findIndex(n => n.id === id);
    if (index !== -1) {
        sandboxNodes[index].title = title;
        sandboxNodes[index].desc = subtext;
        renderSandboxNodes();
        showToast('Node structure saved successfully.');
    }
    closeNodeModal();
}

// Run flow simulation inside the screen with visual connection line indicators
let simTimeoutId = null;
function runSimulation() {
    // Reset previous execution before initiating new sequence
    resetSimulation();
    
    const outputText = document.getElementById('simulation-output-text');
    const progressBar = document.getElementById('simulation-progress');
    
    outputText.textContent = "Starting workflow execution pipeline...";
    
    // Animate connection line loading
    progressBar.style.width = '0%';
    setTimeout(() => {
        progressBar.style.width = '100%';
        progressBar.style.transition = 'width 3s linear';
    }, 100);

    // Pulse through each node with set intervals simulating microservices
    sandboxNodes.forEach((node, index) => {
        const delay = index * 1000;
        
        setTimeout(() => {
            // Apply visual active status
            const nodeEl = document.getElementById(`node-${node.id}`);
            if (nodeEl) {
                nodeEl.classList.add('sandbox-node-active');
            }

            const statusEl = document.getElementById(`node-${node.id}-status`);
            if (statusEl) {
                statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active`;
                statusEl.className = "text-[10px] font-semibold text-emerald-400 flex items-center gap-1";
            }

            outputText.textContent = `Running Step ${index + 1}: [${node.title}] is currently processing payload data...`;
        }, delay);

        // Success state update after processing step
        setTimeout(() => {
            const statusEl = document.getElementById(`node-${node.id}-status`);
            if (statusEl) {
                statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Success`;
                statusEl.className = "text-[10px] font-semibold text-emerald-500 flex items-center gap-1";
            }
        }, delay + 800);
    });

    // Complete Simulation Metrics increments
    setTimeout(() => {
        outputText.textContent = "Workflow simulation completed with 100% data fidelity.";
        totalRunsCounter++;
        document.getElementById('metric-total-runs').textContent = totalRunsCounter.toLocaleString();
        
        // Randomize response speed slightly
        const randomSpeed = (Math.random() * 0.1 + 0.15).toFixed(2) + 's';
        document.getElementById('metric-process-time').textContent = randomSpeed;
        
        showToast('Simulation complete! Integration metrics updated.');
    }, sandboxNodes.length * 1000);
}

// Clear active states
function resetSimulation() {
    const outputText = document.getElementById('simulation-output-text');
    const progressBar = document.getElementById('simulation-progress');
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    outputText.textContent = "Ready to test flow sequence. Click 'Run Simulation' above.";

    sandboxNodes.forEach((node) => {
        const nodeEl = document.getElementById(`node-${node.id}`);
        if (nodeEl) {
            nodeEl.classList.remove('sandbox-node-active');
        }

        const statusEl = document.getElementById(`node-${node.id}-status`);
        if (statusEl) {
            if (node.id === 1) {
                statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> Ready`;
                statusEl.className = "text-[10px] font-semibold text-teal-400 flex items-center gap-1";
            } else {
                statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Idle`;
                statusEl.className = "text-[10px] font-semibold text-slate-500 flex items-center gap-1";
            }
        }
    });
}

// Initialize on viewport load
window.addEventListener('DOMContentLoaded', () => {
    renderSandboxNodes();
});

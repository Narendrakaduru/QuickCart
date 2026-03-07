const { JSDOM } = require('jsdom');

// Mocking the environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;

const verifyDOM = (isError, message) => {
    console.log(`\nVerifying DOM for state: { isError: ${isError}, message: "${message}" }`);
    
    // Simulating the rendering logic from Login.jsx
    let html = `
        <div id="login-container">
            <h1 class="text-2xl font-bold text-center mb-6">Login to QuickCart</h1>
    `;
    
    const isNoUser = isError && message?.toLowerCase().includes('no user registered');
    const isWrongPass = isError && message?.toLowerCase().includes('password');

    // Top-level error logic
    if (isError) {
        html += `<div class="bg-red-100 mb-4 text-sm" role="alert"><span>${message}</span></div>`;
    }

    // Email field logic
    const emailClass = isNoUser ? 'border-red-500' : 'border-gray-300';
    html += `
        <div class="space-y-1">
            <label>Email</label>
            <input id="email" class="${emailClass}" value="test@test.com" />
            ${isNoUser ? `<p id="email-error" class="text-red-500">${message}</p>` : ''}
        </div>
    `;

    // Password field logic
    const passClass = isWrongPass ? 'border-red-500' : 'border-gray-300';
    html += `
        <div class="space-y-1">
            <label>Password</label>
            <input id="password" class="${passClass}" value="******" />
            ${isWrongPass ? `<p id="pass-error" class="text-red-500">${message}</p>` : ''}
        </div>
    `;

    html += `</div>`;
    document.getElementById('root').innerHTML = html;

    // DOM ACTIONS / CHECKS
    console.log('--- DOM ACTIONS ---');
    
    if (isNoUser) {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        console.log(`CHECK: Email input has red border: ${emailInput.classList.contains('border-red-500')}`);
        console.log(`CHECK: Email error message visible: ${emailError !== null}`);
        console.log(`CHECK: Email error text matches: "${emailError?.textContent}"`);
    } else if (isWrongPass) {
        const passInput = document.getElementById('password');
        const passError = document.getElementById('pass-error');
        console.log(`CHECK: Password input has red border: ${passInput.classList.contains('border-red-500')}`);
        console.log(`CHECK: Password error message visible: ${passError !== null}`);
        console.log(`CHECK: Password error text matches: "${passError?.textContent}"`);
    } else {
        console.log('CHECK: No field-specific errors visible.');
    }
};

// Test Scenarios
verifyDOM(true, 'no user registered');
verifyDOM(true, 'check password');
verifyDOM(false, '');

/**
 * Logic Verification Script
 * This script verifies the logic used in Login.jsx to map backend error messages 
 * to UI states (red borders and localized error text).
 */

const verifyLogic = (isError, message) => {
    console.log(`\n--- Testing Scenario: { isError: ${isError}, message: "${message}" } ---`);
    
    // The exact logic from Login.jsx
    const isNoUser = isError && message?.toLowerCase().includes('no user registered');
    const isWrongPass = isError && message?.toLowerCase().includes('password');

    console.log(`Logic Result:`);
    console.log(`  - isNoUser (Email field should be red): ${isNoUser}`);
    console.log(`  - isWrongPass (Password field should be red): ${isWrongPass}`);

    // Verification
    if (message === 'no user registered') {
        if (isNoUser && !isWrongPass) console.log('✅ PASS: Correct field identified for unregistered user.');
        else console.log('❌ FAIL: Failed to identify field for unregistered user.');
    } else if (message === 'check password') {
        if (isWrongPass && !isNoUser) console.log('✅ PASS: Correct field identified for wrong password.');
        else console.log('❌ FAIL: Failed to identify field for wrong password.');
    } else if (isError) {
        if (!isNoUser && !isWrongPass) console.log('✅ PASS: Generic error correctly handled (not mapped to email/pass).');
        else console.log('❌ FAIL: Generic error incorrectly mapped to a specific field.');
    } else {
        console.log('✅ PASS: No error state correctly handled.');
    }
};

// Running Test Cases
verifyLogic(true, 'no user registered');
verifyLogic(true, 'check password');
verifyLogic(true, 'Server Timeout'); // Generic error
verifyLogic(false, ''); // Success state

/**
 * API Connection Testing Utilities
 * Use these functions to verify backend connectivity
 */

import { apiHealth, authAPI, menuAPI, orderAPI } from '../services/api';

export const testAPIConnection = async () => {
  console.log('🧪 Starting API Connection Tests...\n');

  const results = {
    health: null,
    apiInfo: null,
    auth: null,
    menu: null,
    overall: 'pending',
  };

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const health = await apiHealth.checkConnection();
    results.health = health;
    if (health.status === 'connected') {
      console.log('✅ Health check passed');
      console.log('   MongoDB:', health.data?.mongodb);
      console.log('   Uptime:', health.data?.uptime, 'seconds');
    } else {
      console.error('❌ Health check failed:', health.error);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    results.health = { status: 'error', error: error.message };
  }

  // Test 2: API Info
  console.log('\n2️⃣ Testing API Info Endpoint...');
  try {
    const info = await apiHealth.verifyAPI();
    results.apiInfo = info;
    if (info.status === 'ok') {
      console.log('✅ API info retrieved');
      console.log('   Version:', info.version);
      console.log('   Endpoints:', Object.keys(info.endpoints || {}).join(', '));
    } else {
      console.error('❌ API info failed:', info.error);
    }
  } catch (error) {
    console.error('❌ API info error:', error.message);
    results.apiInfo = { status: 'error', error: error.message };
  }

  // Test 3: Auth Endpoint
  console.log('\n3️⃣ Testing Auth Endpoint...');
  try {
    const auth = await apiHealth.testAuth();
    results.auth = auth;
    if (auth.status === 'ok') {
      console.log('✅ Auth endpoint working');
      console.log('   Authenticated:', auth.authenticated);
    } else {
      console.error('❌ Auth endpoint failed:', auth.error);
    }
  } catch (error) {
    console.error('❌ Auth endpoint error:', error.message);
    results.auth = { status: 'error', error: error.message };
  }

  // Test 4: Menu Endpoint
  console.log('\n4️⃣ Testing Menu Endpoint...');
  try {
    const menu = await menuAPI.getAllItems();
    results.menu = { status: 'ok', itemCount: menu.menuItems?.length || 0 };
    console.log('✅ Menu endpoint working');
    console.log('   Menu items:', menu.menuItems?.length || 0);
  } catch (error) {
    console.error('❌ Menu endpoint error:', error.message);
    results.menu = { status: 'error', error: error.message };
  }

  // Overall Result
  const allPassed = 
    results.health?.status === 'connected' &&
    results.apiInfo?.status === 'ok' &&
    results.auth?.status === 'ok' &&
    results.menu?.status === 'ok';

  results.overall = allPassed ? 'passed' : 'failed';

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All API tests passed! Backend is fully connected.');
  } else {
    console.log('⚠️  Some API tests failed. Check the errors above.');
  }
  console.log('='.repeat(50) + '\n');

  return results;
};

/**
 * Quick health check
 */
export const quickHealthCheck = async () => {
  try {
    const health = await apiHealth.checkConnection();
    return health.status === 'connected';
  } catch {
    return false;
  }
};

/**
 * Test authentication flow
 */
export const testAuthFlow = async (email, password) => {
  console.log('🔐 Testing Authentication Flow...\n');

  try {
    console.log('1. Attempting login...');
    const response = await authAPI.login(email, password);
    console.log('✅ Login successful');
    console.log('   User:', response.user?.fullName);
    console.log('   Role:', response.user?.role);
    console.log('   Token:', response.token ? 'Received' : 'Missing');

    console.log('\n2. Verifying stored credentials...');
    const isLoggedIn = authAPI.isLoggedIn();
    const storedUser = authAPI.getStoredUser();
    console.log('   Is logged in:', isLoggedIn);
    console.log('   Stored user:', storedUser?.fullName);

    console.log('\n3. Testing protected endpoint...');
    const currentUser = await authAPI.getCurrentUser();
    console.log('✅ Protected endpoint accessible');
    console.log('   Current user:', currentUser?.fullName);

    console.log('\n✅ Authentication flow working correctly!\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication flow failed:', error.message);
    return false;
  }
};

/**
 * Test menu operations
 */
export const testMenuOperations = async () => {
  console.log('🍕 Testing Menu Operations...\n');

  try {
    console.log('1. Fetching all menu items...');
    const allItems = await menuAPI.getAllItems();
    console.log('✅ Got', allItems.menuItems?.length, 'menu items');

    if (allItems.menuItems?.length > 0) {
      const firstItem = allItems.menuItems[0];
      console.log('\n2. Testing search...');
      const searchResults = await menuAPI.searchItems(firstItem.name.split(' ')[0]);
      console.log('✅ Search returned', searchResults.menuItems?.length, 'items');

      if (firstItem.canteen) {
        console.log('\n3. Testing filter by canteen...');
        const canteenItems = await menuAPI.getByCanteen(firstItem.canteen);
        console.log('✅ Canteen filter returned', canteenItems.menuItems?.length, 'items');
      }
    }

    console.log('\n✅ Menu operations working correctly!\n');
    return true;
  } catch (error) {
    console.error('❌ Menu operations failed:', error.message);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('\n' + '🚀'.repeat(25));
  console.log('Starting Complete API Test Suite');
  console.log('🚀'.repeat(25) + '\n');

  const connectionTest = await testAPIConnection();
  
  if (connectionTest.overall === 'passed') {
    console.log('\n📋 Running additional tests...\n');
    await testMenuOperations();
  }

  console.log('\n' + '✨'.repeat(25));
  console.log('Test Suite Complete');
  console.log('✨'.repeat(25) + '\n');
};

// Export to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.apiTest = {
    testAPIConnection,
    quickHealthCheck,
    testAuthFlow,
    testMenuOperations,
    runAllTests,
  };
  
  console.log('💡 API Testing tools available! Try:');
  console.log('   - window.apiTest.runAllTests()');
  console.log('   - window.apiTest.testAPIConnection()');
  console.log('   - window.apiTest.quickHealthCheck()');
}


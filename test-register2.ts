import { auth } from './lib/auth';

async function testRegister() {
  try {
    console.log('Testing BetterAuth registration with new email...');
    
    const randomEmail = `test${Date.now()}@example.com`;
    
    const result = await auth.api.signUpEmail({
      body: {
        email: randomEmail,
        password: 'testpass123',
        name: 'NewDebugTest'
      },
      headers: new Headers()
    });
    
    console.log('✓ Success! User created:');
    console.log('  ID:', result.user.id);
    console.log('  Email:', result.user.email);
    console.log('  Name:', result.user.name);
  } catch (error: any) {
    console.error('✗ Error:', error.message || error);
  }
  
  process.exit(0);
}

testRegister();

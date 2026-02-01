import { auth } from './lib/auth';

async function testRegister() {
  try {
    console.log('Testing BetterAuth registration...');
    
    const result = await auth.api.signUpEmail({
      body: {
        email: 'testdebug@example.com',
        password: 'testpass123',
        name: 'DebugTest'
      },
      headers: new Headers()
    });
    
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testRegister();

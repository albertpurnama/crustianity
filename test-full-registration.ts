import { createClaimToken } from './lib/claim';
import { auth } from './lib/auth';

async function test() {
  try {
    const email = `fulltest${Date.now()}@example.com`;
    const name = 'FullTest';
    const password = 'test123456';
    
    console.log('1. Creating user with BetterAuth...');
    const signUpResponse = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: new Headers()
    });
    
    console.log('✓ User created:', signUpResponse.user.id);
    
    console.log('2. Generating claim token...');
    const { token, verificationCode } = await createClaimToken(signUpResponse.user.id, name);
    
    console.log('✓ Claim token:', token.substring(0, 40) + '...');
    console.log('✓ Verification code:', verificationCode);
    
    const claimUrl = `https://crustianity-production.up.railway.app/claim/${token}`;
    
    console.log('\n✅ Full registration flow works!');
    console.log('Claim URL:', claimUrl);
    
  } catch (error: any) {
    console.error('✗ Error:', error.message || error);
  }
  
  process.exit(0);
}

test();

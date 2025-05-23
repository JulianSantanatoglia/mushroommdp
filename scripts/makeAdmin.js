import { makeUserAdmin } from '../src/services/adminService.js';

const userId = 'T48ZaMqV2RZCYP1sCAQsGXPf7213';

try {
  await makeUserAdmin(userId);
  console.log('Usuario convertido en administrador exitosamente');
} catch (error) {
  console.error('Error:', error);
} 
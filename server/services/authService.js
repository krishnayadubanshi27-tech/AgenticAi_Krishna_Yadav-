/**
 * In-memory / persisted authentication service.
 * Handles user registration, email validation, and authentication tokens.
 */

// Seed with default demo users
const users = [
  {
    id: 'user-demo-krishna',
    email: 'krishna.yadav@edupath.ai',
    password: 'password123',
    name: 'Krishna Yadav',
    targetRole: 'Senior Full-Stack AI Engineer',
    experienceLevel: 'Senior (5+ yrs)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-demo-1',
    email: 'alex.chen@edupath.ai',
    password: 'password123',
    name: 'Alex Chen',
    targetRole: 'Senior Full-Stack AI Engineer',
    experienceLevel: 'Mid-Level (3-5 yrs)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-demo-2',
    email: 'sarah.kim@edupath.ai',
    password: 'password123',
    name: 'Sarah Kim',
    targetRole: 'Staff Frontend Architect',
    experienceLevel: 'Senior (5+ yrs)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

/**
 * Generate an avatar URL based on the user's name
 */
function generateAvatar(name) {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  return avatars[charCode % avatars.length];
}

/**
 * Register a new user account with email
 */
export function registerUser({ email, password, name, targetRole, experienceLevel }) {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    password: password, // in production hash with bcrypt
    name: name?.trim() || normalizedEmail.split('@')[0],
    targetRole: targetRole || 'Senior Full-Stack AI Engineer',
    experienceLevel: experienceLevel || 'Mid-Level (3-5 yrs)',
    avatar: generateAvatar(name || normalizedEmail),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const token = `edupath-token-${newUser.id}-${Date.now()}`;
  const { password: _, ...safeUser } = newUser;

  return { user: safeUser, token };
}

/**
 * Authenticate existing user with email and password
 */
export function authenticateUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Please enter both your email address and password.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No account found with this email. Please check your spelling or create a new account.');
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  const token = `edupath-token-${user.id}-${Date.now()}`;
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
}

/**
 * Get user by email
 */
export function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Get all available demo accounts for 1-click preview
 */
export function getDemoAccounts() {
  return users.map(({ password: _, ...safeUser }) => safeUser);
}

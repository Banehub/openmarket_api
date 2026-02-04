/**
 * Logs meaningful user actions to the console with a consistent, readable format.
 * Use for: login, register, new/update/delete listing, profile update, password change, ratings.
 */
const LABELS = {
  login: { icon: '🔐', label: 'Login' },
  register: { icon: '📝', label: 'Register' },
  listing_added: { icon: '📦', label: 'New listing' },
  listing_updated: { icon: '✏️', label: 'Listing updated' },
  listing_removed: { icon: '🗑️', label: 'Listing removed' },
  profile_updated: { icon: '👤', label: 'Profile updated' },
  password_changed: { icon: '🔑', label: 'Password changed' },
  rating_left: { icon: '⭐', label: 'Rating left' },
};

function actionLog(actionKey, detail) {
  const ts = new Date().toISOString();
  const { icon = '•', label = actionKey } = LABELS[actionKey] || {};
  const line = `[${ts}]  ${icon}  ${label.padEnd(16)}  ${detail}`;
  console.log(line);
}

module.exports = { actionLog };

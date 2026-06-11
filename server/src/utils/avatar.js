// Random emoji avatar assigned to new users on registration.
const AVATARS = [
  '🦁', '🐯', '🐶', '🐱', '🐸', '🐵', '🐼', '🐧', '🐦', '🐤',
  '🦊', '🐻', '🐨', '🐰', '🦄', '🐮', '🐷', '🐔', '🐙', '🦉',
  '🐢', '🐍', '🐳', '🐬', '🦋', '🐝', '🐞', '🦀', '🦕', '🦖',
];

function randomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

module.exports = { AVATARS, randomAvatar };

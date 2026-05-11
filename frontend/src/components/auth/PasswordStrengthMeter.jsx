/**
 * PasswordStrengthMeter.jsx
 *
 * Displays a color-coded strength bar + requirement checklist
 * as the user types their password.
 */

const checks = [
  { label: 'At least 8 characters',    test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',      test: (p) => /[A-Z]/.test(p) },
  { label: 'One number',               test: (p) => /[0-9]/.test(p) },
  { label: 'One special character',    test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (password) => checks.filter((c) => c.test(password)).length;

const LEVELS = [
  { label: 'Too weak',  color: 'bg-red-500' },
  { label: 'Weak',      color: 'bg-orange-400' },
  { label: 'Fair',      color: 'bg-yellow-400' },
  { label: 'Good',      color: 'bg-lime-500' },
  { label: 'Strong',    color: 'bg-emerald-500' },
];

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1 h-1.5">
        {LEVELS.slice(0, 4).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i < score ? level.color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${
          score <= 1 ? 'text-red-500' :
          score === 2 ? 'text-yellow-500' :
          score === 3 ? 'text-lime-600' : 'text-emerald-500'
        }`}>
          {level.label}
        </span>
      </div>

      {/* Checklist */}
      <ul className="space-y-1 mt-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5 text-xs">
            <span className={`material-symbols-outlined text-sm ${
              c.test(password) ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'
            }`}>
              {c.test(password) ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className={c.test(password) ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;

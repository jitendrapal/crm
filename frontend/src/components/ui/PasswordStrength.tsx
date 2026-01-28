import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = useMemo<PasswordRequirement[]>(() => {
    return [
      {
        label: 'At least 6 characters',
        met: password.length >= 6,
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        met: /[0-9]/.test(password),
      },
      {
        label: 'Contains special character',
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: '', color: '', width: '0%' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-destructive', width: '33%' };
    if (metCount <= 3) return { label: 'Fair', color: 'bg-warning', width: '66%' };
    if (metCount <= 4) return { label: 'Good', color: 'bg-blue-500', width: '83%' };
    return { label: 'Strong', color: 'bg-success', width: '100%' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password strength:</span>
          {strength.label && (
            <span
              className={`font-medium ${
                strength.label === 'Weak'
                  ? 'text-destructive'
                  : strength.label === 'Fair'
                  ? 'text-warning'
                  : strength.label === 'Good'
                  ? 'text-blue-500'
                  : 'text-success'
              }`}
            >
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


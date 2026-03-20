import {
  Usb, HardDrive, HeartPulse, Phone,
  EyeOff, Mail, KeyRound, BarChart2,
  Scale, Radar, BadgeCheck, Database,
  Zap, Vault, Antenna,
} from 'lucide-react';
import type { ComponentProps } from 'react';

const ICON_MAP: Record<string, React.FC<ComponentProps<typeof Usb>>> = {
  Usb,
  HardDrive,
  HeartPulse,
  Phone,
  EyeOff,
  Mail,
  KeyRound,
  BarChart2,
  Scale,
  Radar,
  BadgeCheck,
  Database,
  Zap,
  Vault,
  Antenna,
};

interface GearIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GearIcon({ name, className, style }: GearIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} style={style} />;
}

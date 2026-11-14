import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BatteryCharging,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Compass,
  CreditCard,
  Droplets,
  FileCheck,
  FileText,
  FolderOpen,
  Glasses,
  Globe,
  HeartPulse,
  Key,
  Laptop,
  Lock,
  Luggage,
  MapPin,
  Mountain,
  PackageCheck,
  Plane,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Sun,
  Tent,
  Trees,
  Users,
  Wallet,
  Watch,
  Waves,
  Zap,
} from 'lucide-react-native';

export interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  Sun,
  Briefcase,
  Mountain,
  Tent,
  Users,
  Globe,
  Compass,
  Building2,
  Shirt,
  Droplets,
  Laptop,
  FileText,
  Watch,
  Luggage,
  HeartPulse,
  Waves,
  Trees,
  Sparkles,
  MapPin,
  Calendar,
  Check,
  CheckCircle2,
  FolderOpen,
  PackageCheck,
  Wallet,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Key,
  Smartphone,
  BatteryCharging,
  FileCheck,
  Glasses,
  CheckSquare,
  Bell,
  Lock,
  Plane,
  Zap,
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 20,
  color = '#172B4D',
  strokeWidth = 2.1,
}) => {
  const IconComp = ICON_MAP[name] ?? Luggage;
  return <IconComp size={size} color={color} strokeWidth={strokeWidth} />;
};

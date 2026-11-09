import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Droplets,
  FileText,
  FolderOpen,
  Globe,
  HeartPulse,
  Laptop,
  Luggage,
  MapPin,
  Mountain,
  PackageCheck,
  Shirt,
  Sparkles,
  Sun,
  Tent,
  Trees,
  Users,
  Watch,
  Waves,
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

export type UserRole = 'villager' | 'surveyor' | 'admin';

export interface RoleConfig {
  id: UserRole;
  title: string;
  description: string;
  badge: string;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'surveyor',
    title: 'सर्वेक्षक / ग्राम पंचायत नोडल',
    description: 'ग्राम परिचय, बुनियादी ढांचा और अंतराल मैट्रिक्स का सत्यापन करें',
    badge: 'ग्राम प्रोफ़ाइल'
  },
  {
    id: 'admin',
    title: 'व्यवस्थापक / ब्लॉक ऑडिटर',
    description: 'जिला/ब्लॉक स्तर का डैशबोर्ड, डेटा विश्लेषण और सत्यापन रिपोर्ट देखें',
    badge: 'डैशबोर्ड व रिपोर्ट'
  }
];
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowRight,
  Briefcase,
  Check,
  Compass,
  Globe,
  Luggage,
  Mail,
  MapPin,
  Mountain,
  Phone,
  Scale,
  Sparkles,
  Sun,
  User,
  Users,
} from 'lucide-react-native';
import {
  LUGGAGE_TYPES,
  POPULAR_COUNTRIES,
  PROFILE_AVATARS,
  TRAVEL_STYLES,
  WEIGHT_LIMIT_PRESETS,
} from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { AvatarView } from '../components/AvatarView';
import { BrandMark } from '../components/BrandMark';
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { LuggageType, RootStackParamList, TravelStyle } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { saveProfile } = useAppContext();

  // Personal Information State
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarId, setAvatarId] = useState(PROFILE_AVATARS[0].id);

  // Travel Preferences State
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('General Travel');
  const [luggageType, setLuggageType] = useState<LuggageType>('Backpack');
  const [weightLimit, setWeightLimit] = useState('20');

  // UI / Validation State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    country?: string;
    email?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    if (!country.trim()) {
      errs.country = 'Country is required.';
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const parsedWeight = parseFloat(weightLimit) || 20;
      await saveProfile({
        fullName: fullName.trim(),
        country: country.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar: avatarId,
        travelStyle,
        luggageType,
        weightLimit: Math.max(1, Math.min(100, parsedWeight)),
      });

      navigation.replace('MainTabs');
    } catch (err) {
      console.error('[ProfileSetup] Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Header */}
          <View style={styles.topHeader}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Sparkles size={12} color={theme.colors.secondaryBlue} />
                <Text
                  style={[
                    styles.pillText,
                    { color: theme.colors.secondaryBlue },
                  ]}
                >
                  WELCOME TO PACKMATE
                </Text>
              </View>
            </View>

            <View style={styles.brandTitleRow}>
              <BrandMark size={38} variant="navy" />
              <Text
                style={[styles.brandTitle, { color: theme.colors.primaryText }]}
              >
                Set Up Your Profile
              </Text>
            </View>

            <Text
              style={[styles.brandSub, { color: theme.colors.secondaryText }]}
            >
              Personalize your offline travel companion. All details remain
              strictly confidential on your local device.
            </Text>
          </View>

          {/* Avatar Section */}
          <View
            style={[
              styles.avatarSection,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <AvatarView
              avatarId={avatarId}
              name={fullName}
              size={88}
              showEditBadge
              onPress={() => setShowAvatarPicker(true)}
            />
            <View style={styles.avatarTextWrap}>
              <Text
                style={[
                  styles.avatarTitle,
                  { color: theme.colors.primaryText },
                ]}
              >
                Travel Avatar
              </Text>
              <Text
                style={[
                  styles.avatarSubtitle,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Choose an avatar that reflects your packing persona
              </Text>
              <Pressable
                onPress={() => setShowAvatarPicker(true)}
                style={styles.changeAvatarBtn}
              >
                <Text
                  style={[
                    styles.changeAvatarText,
                    { color: theme.colors.secondaryBlue },
                  ]}
                >
                  Select Avatar Options →
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Section 1: Personal Information */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <User size={18} color={theme.colors.secondaryBlue} />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.primaryText },
                ]}
              >
                Personal Information
              </Text>
            </View>

            {/* Full Name (Required) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Full Name
                </Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.fullName
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}
              >
                <User size={16} color={theme.colors.secondaryText} />
                <TextInput
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errors.fullName) {
                      setErrors((e) => ({ ...e, fullName: undefined }));
                    }
                  }}
                  placeholder="e.g. Maya Fernando"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                  autoCapitalize="words"
                />
              </View>
              {errors.fullName ? (
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {errors.fullName}
                </Text>
              ) : null}
            </View>

            {/* Country (Required) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Home Country
                </Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.country
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}
              >
                <MapPin size={16} color={theme.colors.secondaryText} />
                <TextInput
                  value={country}
                  onChangeText={(val) => {
                    setCountry(val);
                    if (errors.country) {
                      setErrors((e) => ({ ...e, country: undefined }));
                    }
                  }}
                  placeholder="e.g. Sri Lanka"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                  autoCapitalize="words"
                />
              </View>
              {errors.country ? (
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {errors.country}
                </Text>
              ) : null}

              {/* Quick Country Suggestions */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {POPULAR_COUNTRIES.slice(0, 8).map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setCountry(c);
                      if (errors.country) {
                        setErrors((e) => ({ ...e, country: undefined }));
                      }
                    }}
                    style={[
                      styles.countryChip,
                      {
                        backgroundColor:
                          country.toLowerCase() === c.toLowerCase()
                            ? theme.colors.infoSoft
                            : theme.colors.background,
                        borderColor:
                          country.toLowerCase() === c.toLowerCase()
                            ? theme.colors.secondaryBlue
                            : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            country.toLowerCase() === c.toLowerCase()
                              ? theme.colors.secondaryBlue
                              : theme.colors.secondaryText,
                        },
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Email (Optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Email Address
                </Text>
                <Text
                  style={[
                    styles.optionalTag,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  (Optional)
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.email
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}
              >
                <Mail size={16} color={theme.colors.secondaryText} />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) {
                      setErrors((e) => ({ ...e, email: undefined }));
                    }
                  }}
                  placeholder="e.g. maya.travels@example.com"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Phone Number (Optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Phone Number
                </Text>
                <Text
                  style={[
                    styles.optionalTag,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  (Optional)
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Phone size={16} color={theme.colors.secondaryText} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +94 77 123 4567"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Section 2: Travel Preferences */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <Compass size={18} color={theme.colors.accentMint} />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.primaryText },
                ]}
              >
                Travel Preferences
              </Text>
            </View>

            {/* Travel Style Selector */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.primaryText }]}
              >
                Preferred Travel Style
              </Text>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Tailors intelligent checklist scaling and item priorities
              </Text>

              <View style={styles.optionsStack}>
                {TRAVEL_STYLES.map((ts) => {
                  const isSelected = travelStyle === ts.value;
                  return (
                    <Pressable
                      key={ts.value}
                      onPress={() => setTravelStyle(ts.value)}
                      style={[
                        styles.styleCard,
                        {
                          backgroundColor: isSelected
                            ? `${ts.accentColor}12`
                            : theme.colors.background,
                          borderColor: isSelected
                            ? ts.accentColor
                            : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.styleIconWrap,
                          { backgroundColor: `${ts.accentColor}20` },
                        ]}
                      >
                        <DynamicIcon
                          name={ts.icon}
                          size={18}
                          color={ts.accentColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.styleLabel,
                            {
                              color: isSelected
                                ? ts.accentColor
                                : theme.colors.primaryText,
                              fontWeight: isSelected ? '800' : '700',
                            },
                          ]}
                        >
                          {ts.label}
                        </Text>
                        <Text
                          style={[
                            styles.styleDesc,
                            { color: theme.colors.secondaryText },
                          ]}
                        >
                          {ts.shortDesc}
                        </Text>
                      </View>
                      {isSelected ? (
                        <View
                          style={[
                            styles.checkCircle,
                            { backgroundColor: ts.accentColor },
                          ]}
                        >
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Luggage Type Selector */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.primaryText }]}
              >
                Preferred Luggage Type
              </Text>
              <View style={styles.luggageRow}>
                {LUGGAGE_TYPES.map((lt) => {
                  const isSelected = luggageType === lt.value;
                  return (
                    <Pressable
                      key={lt.value}
                      onPress={() => {
                        setLuggageType(lt.value);
                        setWeightLimit(String(lt.defaultWeight));
                      }}
                      style={[
                        styles.luggageCard,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.infoSoft
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.secondaryBlue
                            : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <DynamicIcon
                        name={lt.icon}
                        size={22}
                        color={
                          isSelected
                            ? theme.colors.secondaryBlue
                            : theme.colors.secondaryText
                        }
                      />
                      <Text
                        style={[
                          styles.luggageLabel,
                          {
                            color: isSelected
                              ? theme.colors.secondaryBlue
                              : theme.colors.primaryText,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {lt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Luggage Weight Limit */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Default Luggage Weight Limit (kg)
                </Text>
                <Scale size={16} color={theme.colors.secondaryBlue} />
              </View>

              <View style={styles.weightInputRow}>
                <View
                  style={[
                    styles.weightInputBox,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={weightLimit}
                    onChangeText={setWeightLimit}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={theme.colors.mutedText}
                    style={[
                      styles.weightTextInput,
                      { color: theme.colors.primaryText },
                    ]}
                    maxLength={3}
                  />
                  <Text
                    style={[
                      styles.weightUnit,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    KG
                  </Text>
                </View>

                {/* Preset Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsRow}
                >
                  {WEIGHT_LIMIT_PRESETS.map((preset) => {
                    const isSelected = weightLimit === String(preset);
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => setWeightLimit(String(preset))}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.secondaryBlue
                              : theme.colors.background,
                            borderColor: isSelected
                              ? theme.colors.secondaryBlue
                              : theme.colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.colors.secondaryText,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {preset} kg
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Submit Action */}
          <View style={styles.submitSection}>
            <PrimaryButton
              label="Complete Profile & Start Planning"
              onPress={handleSave}
              variant="mint"
              loading={saving}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AvatarPickerModal
        visible={showAvatarPicker}
        selectedAvatarId={avatarId}
        onSelect={setAvatarId}
        onClose={() => setShowAvatarPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  topHeader: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  brandSub: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  avatarTextWrap: {
    flex: 1,
  },
  avatarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatarSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  changeAvatarBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  changeAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  requiredStar: {
    color: '#E5484D',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 3,
  },
  optionalTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  countryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsStack: {
    gap: 10,
    marginTop: 6,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  styleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleLabel: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  styleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luggageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  luggageCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  luggageLabel: {
    fontSize: 12,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  weightInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    height: 46,
    width: 105,
  },
  weightTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  weightUnit: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  presetChip: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
  },
  submitSection: {
    marginTop: 10,
  },
});

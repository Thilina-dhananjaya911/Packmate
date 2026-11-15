import React, { useEffect, useState } from 'react';
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
  Briefcase,
  Check,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Scale,
  User,
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
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { LuggageType, RootStackParamList, TravelStyle } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { userProfile, updateProfile } = useAppContext();

  // Form State initialized from existing user profile
  const [fullName, setFullName] = useState(userProfile?.fullName ?? '');
  const [country, setCountry] = useState(userProfile?.country ?? '');
  const [email, setEmail] = useState(userProfile?.email ?? '');
  const [phone, setPhone] = useState(userProfile?.phone ?? '');
  const [avatarId, setAvatarId] = useState(
    userProfile?.avatar ?? PROFILE_AVATARS[0].id
  );
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(
    userProfile?.travelStyle ?? 'General Travel'
  );
  const [luggageType, setLuggageType] = useState<LuggageType>(
    userProfile?.luggageType ?? 'Backpack'
  );
  const [weightLimit, setWeightLimit] = useState(
    String(userProfile?.weightLimit ?? 20)
  );

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    country?: string;
    email?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setCountry(userProfile.country);
      setEmail(userProfile.email ?? '');
      setPhone(userProfile.phone ?? '');
      setAvatarId(userProfile.avatar);
      setTravelStyle(userProfile.travelStyle);
      setLuggageType(userProfile.luggageType);
      setWeightLimit(String(userProfile.weightLimit));
    }
  }, [userProfile]);

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
      await updateProfile({
        fullName: fullName.trim(),
        country: country.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        avatar: avatarId,
        travelStyle,
        luggageType,
        weightLimit: Math.max(1, Math.min(100, parsedWeight)),
      });

      navigation.goBack();
    } catch (err) {
      console.error('[EditProfile] Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Edit Travel Profile"
        subtitle="Update personal info and packing preferences"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View
            style={[
              styles.avatarSection,
              {
                backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <AvatarView
              avatarId={avatarId}
              name={fullName}
              size={84}
              showEditBadge
              onPress={() => setShowAvatarPicker(true)}
            />
            <View style={styles.avatarTextWrap}>
              <Text style={[styles.avatarTitle, { color: theme.colors.primaryText }]}>
                Travel Avatar
              </Text>
              <Text
                style={[
                  styles.avatarSubtitle,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Tap below or on your avatar to select another travel persona
              </Text>
              <Pressable
                onPress={() => setShowAvatarPicker(true)}
                style={styles.changeAvatarBtn}
              >
                <Text
                  style={[
                    styles.changeAvatarText,
                    { color: theme.colors.accentLime },
                  ]}
                >
                  Change Avatar
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Personal Information */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <User size={18} color={theme.colors.accentLime} />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.primaryText },
                ]}
              >
                Personal Details
              </Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : theme.colors.background,
                    borderColor: errors.fullName
                      ? theme.colors.danger
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : theme.colors.border,
                  },
                ]}
              >
                <User size={17} color={theme.colors.secondaryText} />
                <TextInput
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errors.fullName)
                      setErrors((e) => ({ ...e, fullName: undefined }));
                  }}
                  placeholder="e.g. Alex Traveler"
                  placeholderTextColor={theme.colors.secondaryText}
                  autoCapitalize="words"
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                />
              </View>
              {errors.fullName ? (
                <Text
                  style={[styles.errorText, { color: theme.colors.danger }]}
                >
                  {errors.fullName}
                </Text>
              ) : null}
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Home Country <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : theme.colors.background,
                    borderColor: errors.country
                      ? theme.colors.danger
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : theme.colors.border,
                  },
                ]}
              >
                <MapPin size={17} color={theme.colors.secondaryText} />
                <TextInput
                  value={country}
                  onChangeText={(val) => {
                    setCountry(val);
                    if (errors.country)
                      setErrors((e) => ({ ...e, country: undefined }));
                  }}
                  placeholder="e.g. Sri Lanka"
                  placeholderTextColor={theme.colors.secondaryText}
                  autoCapitalize="words"
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                />
              </View>
              {errors.country ? (
                <Text
                  style={[styles.errorText, { color: theme.colors.danger }]}
                >
                  {errors.country}
                </Text>
              ) : null}

              {/* Quick Country Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {POPULAR_COUNTRIES.slice(0, 8).map((c) => {
                  const isSelected = country.toLowerCase() === c.toLowerCase();
                  return (
                    <Pressable
                      key={c}
                      onPress={() => {
                        setCountry(c);
                        if (errors.country)
                          setErrors((e) => ({ ...e, country: undefined }));
                      }}
                      style={[
                        styles.countryChip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.accentLime
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.accentLime
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected
                              ? theme.colors.limeText
                              : theme.colors.primaryText,
                            fontWeight: isSelected ? '800' : '500',
                          },
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Email Address */}
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
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Optional
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : theme.colors.background,
                    borderColor: errors.email
                      ? theme.colors.danger
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : theme.colors.border,
                  },
                ]}
              >
                <Mail size={17} color={theme.colors.secondaryText} />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email)
                      setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  placeholder="alex@example.com"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                />
              </View>
              {errors.email ? (
                <Text
                  style={[styles.errorText, { color: theme.colors.danger }]}
                >
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Phone Number */}
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
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Optional
                </Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : theme.colors.background,
                    borderColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : theme.colors.border,
                  },
                ]}
              >
                <Phone size={17} color={theme.colors.secondaryText} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+94 77 123 4567"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="phone-pad"
                  style={[
                    styles.textInput,
                    { color: theme.colors.primaryText },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Travel Preferences */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <Briefcase size={18} color={theme.colors.accentLime} />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.primaryText },
                ]}
              >
                Travel Preferences & Packing Style
              </Text>
            </View>

            {/* Travel Style */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.primaryText }]}
              >
                Primary Travel Style
              </Text>
              <View style={styles.optionsStack}>
                {TRAVEL_STYLES.map((styleItem) => {
                  const isSelected = travelStyle === styleItem.value;
                  return (
                    <Pressable
                      key={styleItem.value}
                      onPress={() => setTravelStyle(styleItem.value)}
                      style={[
                        styles.styleCard,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.infoSoft
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.accentLime
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : theme.colors.border,
                          borderWidth: isSelected ? 1.8 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.styleIconWrap,
                          {
                            backgroundColor: `${styleItem.accentColor}25`,
                          },
                        ]}
                      >
                        <DynamicIcon
                          name={styleItem.icon}
                          size={18}
                          color={styleItem.accentColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.styleLabel,
                            {
                              color: theme.colors.primaryText,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {styleItem.label}
                        </Text>
                        <Text
                          style={[
                            styles.styleDesc,
                            { color: theme.colors.secondaryText },
                          ]}
                        >
                          {styleItem.shortDesc}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.accentLime
                              : 'transparent',
                            borderColor: isSelected
                              ? theme.colors.accentLime
                              : theme.colors.secondaryText,
                            borderWidth: isSelected ? 0 : 1.5,
                          },
                        ]}
                      >
                        {isSelected ? (
                          <Check
                            size={12}
                            color={theme.colors.limeText}
                            strokeWidth={3}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Preferred Luggage Type */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.primaryText }]}
              >
                Preferred Luggage Type
              </Text>
              <View style={styles.luggageRow}>
                {LUGGAGE_TYPES.map((l) => {
                  const isSelected = luggageType === l.value;
                  return (
                    <Pressable
                      key={l.value}
                      onPress={() => {
                        setLuggageType(l.value);
                        setWeightLimit(String(l.defaultWeight));
                      }}
                      style={[
                        styles.luggageCard,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.infoSoft
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.accentLime
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : theme.colors.border,
                          borderWidth: isSelected ? 1.8 : 1,
                        },
                      ]}
                    >
                      <DynamicIcon
                        name={l.icon}
                        size={22}
                        color={
                          isSelected
                            ? theme.isDark
                              ? theme.colors.accentLime
                              : theme.colors.secondaryBlue
                            : theme.colors.secondaryText
                        }
                      />
                      <Text
                        style={[
                          styles.luggageLabel,
                          {
                            color: isSelected
                              ? theme.isDark
                                ? theme.colors.accentLime
                                : theme.colors.secondaryBlue
                              : theme.colors.primaryText,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {l.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Default Luggage Weight Limit */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.primaryText }]}
              >
                Default Luggage Weight Limit
              </Text>
              <View style={styles.weightInputRow}>
                <View
                  style={[
                    styles.weightInputBox,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : theme.colors.background,
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : theme.colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={weightLimit}
                    onChangeText={setWeightLimit}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="20"
                    placeholderTextColor={theme.colors.secondaryText}
                    style={[
                      styles.weightTextInput,
                      { color: theme.colors.primaryText },
                    ]}
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

                {/* Presets Row */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsRow}
                >
                  {WEIGHT_LIMIT_PRESETS.map((preset) => {
                    const isSelected = String(preset) === weightLimit;
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => setWeightLimit(String(preset))}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.accentLime
                              : theme.isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : theme.colors.background,
                            borderColor: isSelected
                              ? theme.colors.accentLime
                              : theme.isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : theme.colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetText,
                            {
                              color: isSelected
                                ? theme.colors.limeText
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <PrimaryButton
              label="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              pill
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Save Changes"
              onPress={handleSave}
              variant="lime"
              pill
              loading={saving}
              rightIcon={
                <CheckCircle2
                  size={16}
                  color={theme.colors.limeText}
                  strokeWidth={2.4}
                />
              }
              style={{ flex: 1.4 }}
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

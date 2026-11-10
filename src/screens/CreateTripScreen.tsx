import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Calendar,
  Clock,
  Copy,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { DESTINATION_TYPES, TRIP_TYPES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  addPackingItemsBatchDeduplicated,
  cloneTripItemsToNewTrip,
} from '../database/queries/itemQueries';
import { getTemplateById } from '../database/queries/templateQueries';
import {
  createTrip,
  getTripByIdWithProgress,
  updateTrip,
} from '../database/queries/tripQueries';
import {
  generateIntelligentPackingList,
  inferDestinationType,
} from '../services/recommendationEngine';
import { ConfirmModal } from '../components/ConfirmModal';
import { DatePickerModal } from '../components/DatePickerModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { RecommendationPreviewModal } from '../components/RecommendationPreviewModal';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  DestinationType,
  RecommendedItem,
  RootStackParamList,
  TripStatus,
  TripType,
} from '../types';
import {
  addDaysISO,
  calculateTripDuration,
  formatDateShort,
  getTodayISO,
  isReturnAfterDeparture,
} from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTrip'>;

interface FormErrors {
  tripName?: string;
  destination?: string;
  dates?: string;
  travellers?: string;
}

export const CreateTripScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { notifyDataChanged } = useAppContext();

  const editTripId = route.params?.editTripId;
  const preselectedTemplateId = route.params?.preselectedTemplateId;
  const reuseFromTripId = route.params?.reuseFromTripId;
  const isEditMode = Boolean(editTripId);

  const defaultDep = addDaysISO(getTodayISO(), 3);
  const defaultRet = addDaysISO(defaultDep, 5);

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationType, setDestinationType] =
    useState<DestinationType>('Beach');
  const [manualDestOverride, setManualDestOverride] = useState(false);
  const [departureDate, setDepartureDate] = useState(defaultDep);
  const [returnDate, setReturnDate] = useState(defaultRet);
  const [tripType, setTripType] = useState<TripType>('Beach Vacation');
  const [travellerCount, setTravellerCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [statusOverride, setStatusOverride] = useState<TripStatus | undefined>(
    undefined
  );
  const [autoGeneratePacking, setAutoGeneratePacking] = useState(true);
  const [sourceReuseTripName, setSourceReuseTripName] = useState<string | null>(
    null
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [dateModalField, setDateModalField] = useState<
    'departure' | 'return' | null
  >(null);

  // Recommendation Preview Modal state
  const [createdTripId, setCreatedTripId] = useState<number | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>(
    []
  );
  const [recTemplateName, setRecTemplateName] = useState('');
  const [showRecModal, setShowRecModal] = useState(false);
  const [applyingRecs, setApplyingRecs] = useState(false);

  // Success Confirmation state
  const [successDialog, setSuccessDialog] = useState<{
    visible: boolean;
    tripId: number;
    title: string;
    message: string;
  } | null>(null);

  // Hydrate Edit Mode / Template Preselection / Reuse History Mode
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (editTripId) {
        const existing = await getTripByIdWithProgress(editTripId);
        if (existing && mounted) {
          setTripName(existing.trip_name);
          setDestination(existing.destination);
          setDestinationType(existing.destination_type);
          setManualDestOverride(true);
          setDepartureDate(existing.departure_date);
          setReturnDate(existing.return_date);
          setTripType(existing.trip_type);
          setTravellerCount(existing.traveller_count);
          setNotes(existing.notes);
          setStatusOverride(existing.status);
        }
      } else if (reuseFromTripId) {
        const source = await getTripByIdWithProgress(reuseFromTripId);
        if (source && mounted) {
          setSourceReuseTripName(source.trip_name);
          setTripName(`${source.trip_name} (New)`);
          setDestination(source.destination);
          setDestinationType(source.destination_type);
          setManualDestOverride(true);
          setTripType(source.trip_type);
          setTravellerCount(source.traveller_count);
          const nextDep = addDaysISO(getTodayISO(), 7);
          const nextRet = addDaysISO(nextDep, Math.max(1, source.trip_duration));
          setDepartureDate(nextDep);
          setReturnDate(nextRet);
          setNotes(source.notes);
          setAutoGeneratePacking(false);
        }
      } else if (preselectedTemplateId) {
        const tpl = await getTemplateById(preselectedTemplateId);
        if (tpl && mounted) {
          setTripType(tpl.trip_type);
          setDestinationType(tpl.destination_type);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [editTripId, preselectedTemplateId, reuseFromTripId]);

  // Smart offline environment inference when destination or tripType changes
  useEffect(() => {
    if (!manualDestOverride) {
      const inferred = inferDestinationType(destination, tripType);
      setDestinationType(inferred);
    }
  }, [destination, tripType, manualDestOverride]);

  const tripDuration = useMemo(
    () => calculateTripDuration(departureDate, returnDate),
    [departureDate, returnDate]
  );

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!tripName.trim()) {
      nextErrors.tripName = 'Please enter a trip name.';
    } else if (tripName.trim().length < 2) {
      nextErrors.tripName = 'Trip name must be at least 2 characters.';
    }

    if (!destination.trim()) {
      nextErrors.destination = 'Please enter your travel destination.';
    }

    if (!isReturnAfterDeparture(departureDate, returnDate)) {
      nextErrors.dates = 'Return date must be after the departure date.';
    }

    if (
      !Number.isInteger(travellerCount) ||
      travellerCount < 1 ||
      travellerCount > 20
    ) {
      nextErrors.travellers = 'Number of travellers must be between 1 and 20.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveTrip = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        trip_name: tripName.trim(),
        destination: destination.trim(),
        destination_type: destinationType,
        departure_date: departureDate,
        return_date: returnDate,
        trip_duration: Math.max(1, tripDuration),
        trip_type: tripType,
        traveller_count: travellerCount,
        notes: notes.trim(),
      };

      if (isEditMode && editTripId) {
        await updateTrip(editTripId, {
          ...payload,
          status: statusOverride,
        });
        await notifyDataChanged();
        setSaving(false);
        setSuccessDialog({
          visible: true,
          tripId: editTripId,
          title: 'Trip Updated',
          message: `"${payload.trip_name}" has been updated in your local database.`,
        });
        return;
      }

      const newTripId = await createTrip(payload);

      if (reuseFromTripId) {
        const clonedCount = await cloneTripItemsToNewTrip(
          reuseFromTripId,
          newTripId
        );
        await notifyDataChanged();
        setSaving(false);
        setSuccessDialog({
          visible: true,
          tripId: newTripId,
          title: 'Trip & Checklist Reused!',
          message: `Created "${payload.trip_name}" with ${clonedCount} unpacked items cloned from "${sourceReuseTripName}". Historical records remain untouched.`,
        });
        return;
      }

      await notifyDataChanged();

      if (autoGeneratePacking) {
        const generated = await generateIntelligentPackingList(
          {
            destination: payload.destination,
            destinationType: payload.destination_type,
            tripType: payload.trip_type,
            departureDate: payload.departure_date,
            returnDate: payload.return_date,
            tripDuration: payload.trip_duration,
            travellerCount: payload.traveller_count,
          },
          preselectedTemplateId
        );

        setCreatedTripId(newTripId);
        setRecTemplateName(generated.templateName);
        setRecommendedItems(generated.items);
        setSaving(false);
        setShowRecModal(true);
      } else {
        setSaving(false);
        setSuccessDialog({
          visible: true,
          tripId: newTripId,
          title: 'Trip Created Successfully!',
          message: `"${payload.trip_name}" (${payload.trip_duration} days) is saved locally and ready for packing.`,
        });
      }
    } catch (err) {
      setSaving(false);
      setErrors({
        tripName:
          err instanceof Error ? err.message : 'Failed saving trip to SQLite.',
      });
    }
  };

  const handleConfirmRecommendations = async () => {
    if (!createdTripId) return;
    setApplyingRecs(true);
    try {
      const selected = recommendedItems.filter((i) => i.selected);
      const { addedCount } = await addPackingItemsBatchDeduplicated(
        createdTripId,
        selected.map((i) => ({
          item_name: i.item_name,
          category_id: i.category_id,
          quantity: i.quantity,
          is_packed: 0,
          is_essential: i.is_essential ? 1 : 0,
          notes: '',
          is_custom: 0,
        }))
      );
      await notifyDataChanged();
      setApplyingRecs(false);
      setShowRecModal(false);
      setSuccessDialog({
        visible: true,
        tripId: createdTripId,
        title: 'Trip & Smart List Ready!',
        message: `"${tripName.trim()}" was created with ${addedCount} tailored packing items for ${tripDuration} ${
          tripDuration === 1 ? 'day' : 'days'
        } and ${travellerCount} ${
          travellerCount === 1 ? 'traveller' : 'travellers'
        }.`,
      });
    } catch (err) {
      setApplyingRecs(false);
      console.error('[PACKMATE CreateTrip] Failed saving recommendations:', err);
    }
  };

  const handleSkipRecommendations = () => {
    setShowRecModal(false);
    if (createdTripId) {
      setSuccessDialog({
        visible: true,
        tripId: createdTripId,
        title: 'Trip Saved!',
        message: `"${tripName.trim()}" has been created with an empty checklist so you can add items manually or apply templates anytime.`,
      });
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title={
          isEditMode
            ? 'Edit Trip'
            : reuseFromTripId
            ? 'New Trip from History'
            : 'Create New Trip'
        }
        subtitle={
          isEditMode
            ? 'Update dates, travellers or details'
            : 'Plan smart & generate offline packing suggestions'
        }
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {reuseFromTripId && sourceReuseTripName ? (
            <View
              style={[
                styles.reuseBanner,
                {
                  backgroundColor: theme.colors.infoSoft,
                  borderColor: theme.colors.secondaryBlue,
                },
              ]}
            >
              <Copy size={18} color={theme.colors.secondaryBlue} />
              <Text
                style={[styles.reuseBannerText, { color: theme.colors.primaryText }]}
              >
                Reusing packing list from{' '}
                <Text style={{ fontWeight: '800' }}>{sourceReuseTripName}</Text>.
                Your historical trip record will remain completely unchanged.
              </Text>
            </View>
          ) : null}

          {/* 1. Trip Name & 2. Destination */}
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
            <Text style={[styles.fieldLabel, { color: theme.colors.primaryText }]}>
              Trip Name *
            </Text>
            <TextInput
              value={tripName}
              onChangeText={(txt) => {
                setTripName(txt);
                if (errors.tripName) setErrors((e) => ({ ...e, tripName: undefined }));
              }}
              placeholder="e.g. Bali Summer Escape, Tokyo Tech Week"
              placeholderTextColor={theme.colors.mutedText}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: errors.tripName
                    ? theme.colors.danger
                    : theme.colors.border,
                  color: theme.colors.primaryText,
                },
              ]}
            />
            {errors.tripName ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {errors.tripName}
              </Text>
            ) : null}

            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.primaryText, marginTop: 16 },
              ]}
            >
              Destination *
            </Text>
            <View
              style={[
                styles.iconInputWrap,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: errors.destination
                    ? theme.colors.danger
                    : theme.colors.border,
                },
              ]}
            >
              <MapPin size={18} color={theme.colors.secondaryBlue} />
              <TextInput
                value={destination}
                onChangeText={(txt) => {
                  setDestination(txt);
                  if (errors.destination) {
                    setErrors((e) => ({ ...e, destination: undefined }));
                  }
                }}
                placeholder="e.g. Bali, Ella Highlands, Singapore"
                placeholderTextColor={theme.colors.mutedText}
                style={[styles.iconInput, { color: theme.colors.primaryText }]}
              />
            </View>
            {errors.destination ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {errors.destination}
              </Text>
            ) : null}

            {/* Destination Environment Tag Selector */}
            <Text
              style={[
                styles.helperLabel,
                { color: theme.colors.secondaryText, marginTop: 14 },
              ]}
            >
              Destination Environment (Auto-detected for smart rules):
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.envScroll}
            >
              {DESTINATION_TYPES.map((env) => {
                const selected = destinationType === env.value;
                return (
                  <Pressable
                    key={env.value}
                    onPress={() => {
                      setDestinationType(env.value);
                      setManualDestOverride(true);
                    }}
                    style={[
                      styles.envChip,
                      {
                        backgroundColor: selected
                          ? theme.colors.infoSoft
                          : theme.colors.surfaceSubtle,
                        borderColor: selected
                          ? theme.colors.secondaryBlue
                          : 'transparent',
                      },
                    ]}
                  >
                    <DynamicIcon
                      name={env.icon}
                      size={13}
                      color={
                        selected
                          ? theme.colors.secondaryBlue
                          : theme.colors.secondaryText
                      }
                    />
                    <Text
                      style={[
                        styles.envChipText,
                        {
                          color: selected
                            ? theme.colors.secondaryBlue
                            : theme.colors.secondaryText,
                        },
                      ]}
                    >
                      {env.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 3 & 4. Travel Dates & Automatic Duration */}
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
            <View style={styles.dateSectionHeader}>
              <Text style={[styles.fieldLabel, { color: theme.colors.primaryText }]}>
                Travel Dates *
              </Text>
              <View
                style={[
                  styles.durationPill,
                  {
                    backgroundColor:
                      tripDuration >= 1
                        ? theme.colors.successSoft
                        : theme.colors.dangerSoft,
                  },
                ]}
              >
                <Clock
                  size={13}
                  color={
                    tripDuration >= 1
                      ? theme.colors.accentMint
                      : theme.colors.danger
                  }
                />
                <Text
                  style={[
                    styles.durationPillText,
                    {
                      color:
                        tripDuration >= 1
                          ? theme.colors.accentMint
                          : theme.colors.danger,
                    },
                  ]}
                >
                  {tripDuration >= 1
                    ? `${tripDuration} ${tripDuration === 1 ? 'Day' : 'Days'}`
                    : 'Invalid Range'}
                </Text>
              </View>
            </View>

            <View style={styles.datesRow}>
              <Pressable
                onPress={() => setDateModalField('departure')}
                style={[
                  styles.dateBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.dateBoxSmall, { color: theme.colors.secondaryText }]}
                >
                  Departure Date
                </Text>
                <View style={styles.dateValueRow}>
                  <Calendar size={16} color={theme.colors.secondaryBlue} />
                  <Text
                    style={[styles.dateBoxValue, { color: theme.colors.primaryText }]}
                  >
                    {formatDateShort(departureDate)}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setDateModalField('return')}
                style={[
                  styles.dateBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.dates
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.dateBoxSmall, { color: theme.colors.secondaryText }]}
                >
                  Return Date
                </Text>
                <View style={styles.dateValueRow}>
                  <Calendar size={16} color={theme.colors.accentMint} />
                  <Text
                    style={[styles.dateBoxValue, { color: theme.colors.primaryText }]}
                  >
                    {formatDateShort(returnDate)}
                  </Text>
                </View>
              </Pressable>
            </View>

            {errors.dates ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {errors.dates}
              </Text>
            ) : null}
          </View>

          {/* 5. Trip Type */}
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
            <Text style={[styles.fieldLabel, { color: theme.colors.primaryText }]}>
              Trip Type *
            </Text>
            <View style={styles.tripTypeGrid}>
              {TRIP_TYPES.map((item) => {
                const active = tripType === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setTripType(item.value)}
                    style={[
                      styles.tripTypeCard,
                      {
                        backgroundColor: active
                          ? `${item.accentColor}14`
                          : theme.colors.background,
                        borderColor: active
                          ? item.accentColor
                          : theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tripTypeIcon,
                        { backgroundColor: `${item.accentColor}20` },
                      ]}
                    >
                      <DynamicIcon
                        name={item.icon}
                        size={18}
                        color={item.accentColor}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.tripTypeTitle,
                        {
                          color: active
                            ? item.accentColor
                            : theme.colors.primaryText,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 6. Travellers & 7. Optional Notes */}
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
            <View style={styles.travellerRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Users size={17} color={theme.colors.secondaryBlue} />
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: theme.colors.primaryText, marginBottom: 0 },
                    ]}
                  >
                    Number of Travellers *
                  </Text>
                </View>
                <Text
                  style={[
                    styles.helperLabel,
                    { color: theme.colors.secondaryText, marginTop: 3 },
                  ]}
                >
                  Scales individual vs. shared packing quantities
                </Text>
              </View>

              <View
                style={[
                  styles.travellerStepper,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() =>
                    setTravellerCount((c) => Math.max(1, c - 1))
                  }
                  style={styles.stepButton}
                >
                  <Minus size={16} color={theme.colors.primaryText} />
                </Pressable>
                <Text
                  style={[
                    styles.travellerValue,
                    { color: theme.colors.primaryText },
                  ]}
                >
                  {travellerCount}
                </Text>
                <Pressable
                  onPress={() =>
                    setTravellerCount((c) => Math.min(20, c + 1))
                  }
                  style={styles.stepButton}
                >
                  <Plus size={16} color={theme.colors.primaryText} />
                </Pressable>
              </View>
            </View>
            {errors.travellers ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {errors.travellers}
              </Text>
            ) : null}

            {/* Trip Status selector in Edit Mode */}
            {isEditMode ? (
              <View style={{ marginTop: 18 }}>
                <Text
                  style={[styles.fieldLabel, { color: theme.colors.primaryText }]}
                >
                  Trip Status
                </Text>
                <View style={styles.statusRow}>
                  {(['Upcoming', 'Ongoing', 'Completed'] as TripStatus[]).map(
                    (st) => {
                      const active = statusOverride === st;
                      return (
                        <Pressable
                          key={st}
                          onPress={() => setStatusOverride(st)}
                          style={[
                            styles.statusOption,
                            {
                              backgroundColor: active
                                ? theme.colors.primaryNavy
                                : theme.colors.background,
                              borderColor: active
                                ? theme.colors.primaryNavy
                                : theme.colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: '700',
                              color: active
                                ? '#FFFFFF'
                                : theme.colors.secondaryText,
                            }}
                          >
                            {st}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>
            ) : null}

            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.primaryText, marginTop: 18 },
              ]}
            >
              Optional Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Flight numbers, hotel check-in details, special reminders..."
              placeholderTextColor={theme.colors.mutedText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.primaryText,
                },
              ]}
            />
          </View>

          {/* Auto-Generate Smart Packing List Toggle (Create Mode only) */}
          {!isEditMode && !reuseFromTripId ? (
            <View
              style={[
                styles.smartToggleCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: autoGeneratePacking
                    ? theme.colors.secondaryBlue
                    : theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <View
                style={[
                  styles.smartIconWrap,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Sparkles size={20} color={theme.colors.secondaryBlue} />
              </View>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  style={[styles.smartTitle, { color: theme.colors.primaryText }]}
                >
                  Generate Smart Packing List
                </Text>
                <Text
                  style={[styles.smartDesc, { color: theme.colors.secondaryText }]}
                >
                  Uses local templates + {tripDuration || 1}-day &{' '}
                  {travellerCount}-traveller rules (customizable before saving)
                </Text>
              </View>
              <Switch
                value={autoGeneratePacking}
                onValueChange={setAutoGeneratePacking}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.secondaryBlue,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          ) : null}

          <View style={{ marginTop: 10 }}>
            <PrimaryButton
              label={
                isEditMode
                  ? 'Save Trip Changes'
                  : reuseFromTripId
                  ? 'Create Trip & Clone Checklist'
                  : autoGeneratePacking
                  ? 'Save Trip & Generate Suggestions'
                  : 'Save Trip'
              }
              onPress={handleSaveTrip}
              variant="secondary"
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Departure Date Picker */}
      <DatePickerModal
        visible={dateModalField === 'departure'}
        title="Select Departure Date"
        selectedDate={departureDate}
        onConfirm={(iso) => {
          setDepartureDate(iso);
          if (!isReturnAfterDeparture(iso, returnDate)) {
            setReturnDate(addDaysISO(iso, 3));
          }
          setErrors((e) => ({ ...e, dates: undefined }));
          setDateModalField(null);
        }}
        onClose={() => setDateModalField(null)}
      />

      {/* Return Date Picker */}
      <DatePickerModal
        visible={dateModalField === 'return'}
        title="Select Return Date"
        selectedDate={returnDate}
        minDate={addDaysISO(departureDate, 1)}
        referenceStartDate={departureDate}
        onConfirm={(iso) => {
          setReturnDate(iso);
          setErrors((e) => ({ ...e, dates: undefined }));
          setDateModalField(null);
        }}
        onClose={() => setDateModalField(null)}
      />

      {/* Smart Recommendation Customization Modal */}
      <RecommendationPreviewModal
        visible={showRecModal}
        title={`Recommended for ${tripName.trim() || tripType}`}
        subtitle={`${recTemplateName} • ${tripDuration} ${
          tripDuration === 1 ? 'Day' : 'Days'
        } • ${travellerCount} ${
          travellerCount === 1 ? 'Traveller' : 'Travellers'
        }`}
        items={recommendedItems}
        loading={applyingRecs}
        onToggleItem={(key) => {
          setRecommendedItems((prev) =>
            prev.map((item) =>
              item.key === key ? { ...item, selected: !item.selected } : item
            )
          );
        }}
        onChangeQuantity={(key, delta) => {
          setRecommendedItems((prev) =>
            prev.map((item) =>
              item.key === key
                ? {
                    ...item,
                    quantity: Math.max(1, Math.min(99, item.quantity + delta)),
                  }
                : item
            )
          );
        }}
        onToggleAllOptional={(selectOpt) => {
          setRecommendedItems((prev) =>
            prev.map((item) =>
              item.is_essential ? item : { ...item, selected: selectOpt }
            )
          );
        }}
        onConfirm={handleConfirmRecommendations}
        onSkip={handleSkipRecommendations}
      />

      {/* Success Confirmation Dialog */}
      <ConfirmModal
        visible={Boolean(successDialog?.visible)}
        tone="success"
        title={successDialog?.title ?? 'Success'}
        message={successDialog?.message ?? ''}
        confirmLabel={isEditMode ? 'View Trip Overview' : 'Open Packing Checklist'}
        cancelLabel="Done"
        onConfirm={() => {
          const targetId = successDialog?.tripId;
          setSuccessDialog(null);
          if (targetId) {
            if (isEditMode) {
              navigation.replace('TripDetails', { tripId: targetId });
            } else {
              navigation.replace('PackingChecklist', { tripId: targetId });
            }
          } else {
            navigation.goBack();
          }
        }}
        onCancel={() => {
          setSuccessDialog(null);
          navigation.goBack();
        }}
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
  reuseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  reuseBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  iconInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 9,
  },
  iconInput: {
    flex: 1,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  envScroll: {
    paddingTop: 8,
    gap: 8,
  },
  envChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  envChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  dateBoxSmall: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dateBoxValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  tripTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tripTypeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 15,
    padding: 11,
    gap: 9,
  },
  tripTypeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTypeTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  travellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travellerStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 6,
    height: 44,
  },
  stepButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travellerValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 86,
    fontSize: 14,
  },
  smartToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  smartIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  smartDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

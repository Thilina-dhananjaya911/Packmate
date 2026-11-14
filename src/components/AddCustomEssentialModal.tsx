import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ShieldAlert, Sparkles, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import {
  EssentialCategory,
  EssentialPriority,
  EssentialScope,
  TripEssentialItem,
} from '../types';
import { DynamicIcon } from './DynamicIcon';
import { PrimaryButton } from './PrimaryButton';

interface AddCustomEssentialModalProps {
  visible: boolean;
  categories: EssentialCategory[];
  editItem?: TripEssentialItem | null;
  onSave: (payload: {
    item_name: string;
    category_id: number;
    notes: string;
    is_critical: number;
    priority: EssentialPriority;
    scope: EssentialScope;
  }) => Promise<void>;
  onClose: () => void;
}

export const AddCustomEssentialModal: React.FC<AddCustomEssentialModalProps> = ({
  visible,
  categories,
  editItem,
  onSave,
  onClose,
}) => {
  const { theme } = useAppTheme();

  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [isCritical, setIsCritical] = useState(false);
  const [priority, setPriority] = useState<EssentialPriority>('High');
  const [scope, setScope] = useState<EssentialScope>('general');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editItem) {
        setItemName(editItem.item_name);
        setCategoryId(editItem.category_id);
        setIsCritical(editItem.is_critical === 1);
        setPriority(editItem.priority);
        setScope(editItem.scope);
        setNotes(editItem.notes || '');
      } else {
        setItemName('');
        setCategoryId(categories[0]?.id ?? 1);
        setIsCritical(false);
        setPriority('High');
        setScope('general');
        setNotes('');
      }
      setError(null);
    }
  }, [visible, editItem, categories]);

  const handleCriticalToggle = (val: boolean) => {
    setIsCritical(val);
    if (val) {
      setPriority('Critical');
    } else if (priority === 'Critical') {
      setPriority('High');
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      setError('Please enter an essential item name.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        item_name: itemName.trim(),
        category_id: categoryId,
        notes: notes.trim(),
        is_critical: isCritical ? 1 : 0,
        priority: isCritical ? 'Critical' : priority,
        scope,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
          onPress={onClose}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.infoSoft },
                  ]}
                >
                  <Sparkles size={18} color={theme.colors.secondaryBlue} />
                </View>
                <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>
                  {editItem ? 'Edit Essential Item' : 'Add Essential Item'}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={[
                  styles.closeCircle,
                  { backgroundColor: theme.colors.surfaceSubtle },
                ]}
              >
                <X size={17} color={theme.colors.secondaryText} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Item Name */}
              <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
                Essential Item Name *
              </Text>
              <TextInput
                value={itemName}
                onChangeText={(t) => {
                  setItemName(t);
                  if (error) setError(null);
                }}
                placeholder="e.g. Scuba Certification Card, Asthalin Inhaler, Work ID"
                placeholderTextColor={theme.colors.mutedText}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: error ? theme.colors.danger : theme.colors.border,
                    color: theme.colors.primaryText,
                  },
                ]}
              />
              {error ? (
                <Text style={[styles.errText, { color: theme.colors.danger }]}>
                  {error}
                </Text>
              ) : null}

              {/* Category Picker */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.primaryText, marginTop: 14 },
                ]}
              >
                Essential Category *
              </Text>
              <View style={styles.catGrid}>
                {categories.map((cat) => {
                  const selected = cat.id === categoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: selected
                            ? `${cat.color_hex}18`
                            : theme.colors.background,
                          borderColor: selected
                            ? cat.color_hex
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <DynamicIcon
                        name={cat.icon_name}
                        size={14}
                        color={cat.color_hex}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: selected
                            ? cat.color_hex
                            : theme.colors.primaryText,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Critical Belonging Toggle */}
              <View
                style={[
                  styles.criticalBox,
                  {
                    backgroundColor: isCritical
                      ? theme.colors.dangerSoft
                      : theme.colors.surfaceSubtle,
                    borderColor: isCritical
                      ? theme.colors.danger
                      : 'transparent',
                  },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert
                      size={17}
                      color={isCritical ? theme.colors.danger : theme.colors.secondaryText}
                    />
                    <Text
                      style={[
                        styles.criticalTitle,
                        {
                          color: isCritical
                            ? theme.colors.danger
                            : theme.colors.primaryText,
                        },
                      ]}
                    >
                      Critical Item (Requires Verification)
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.criticalSub,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Must be explicitly verified with physical confirmation before departure.
                  </Text>
                </View>
                <Switch
                  value={isCritical}
                  onValueChange={handleCriticalToggle}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.danger,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Priority Selector (if not critical) */}
              {!isCritical ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
                    Priority Level
                  </Text>
                  <View style={styles.priorityRow}>
                    {(['High', 'Standard'] as EssentialPriority[]).map((p) => {
                      const active = priority === p;
                      return (
                        <Pressable
                          key={p}
                          onPress={() => setPriority(p)}
                          style={[
                            styles.priorityBtn,
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
                              color: active ? '#FFFFFF' : theme.colors.primaryText,
                            }}
                          >
                            {p} Priority
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {/* Scope Selector */}
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
                  Applicable Scope
                </Text>
                <View style={styles.priorityRow}>
                  {[
                    { label: 'General Essential', val: 'general' as EssentialScope },
                    { label: 'Trip-Specific', val: 'trip_specific' as EssentialScope },
                  ].map((sc) => {
                    const active = scope === sc.val;
                    return (
                      <Pressable
                        key={sc.val}
                        onPress={() => setScope(sc.val)}
                        style={[
                          styles.priorityBtn,
                          {
                            backgroundColor: active
                              ? theme.colors.secondaryBlue
                              : theme.colors.background,
                            borderColor: active
                              ? theme.colors.secondaryBlue
                              : theme.colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: active ? '#FFFFFF' : theme.colors.primaryText,
                          }}
                        >
                          {sc.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Notes */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.primaryText, marginTop: 14 },
                ]}
              >
                Optional Notes & Location
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Stored in secret inner zipper of carry-on"
                placeholderTextColor={theme.colors.mutedText}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.primaryText,
                  },
                ]}
              />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <PrimaryButton
                  label="Cancel"
                  onPress={onClose}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  label={editItem ? 'Save Changes' : 'Add Item'}
                  onPress={handleSave}
                  variant="secondary"
                  loading={saving}
                  style={{ flex: 1.4 }}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
  },
  errText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  criticalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  criticalTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  criticalSub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    marginBottom: 12,
  },
});

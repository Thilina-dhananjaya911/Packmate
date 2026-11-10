import React, { useEffect, useState } from 'react';
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
  CheckCircle2,
  Circle,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  deletePackingItem,
  getPackingItemById,
  updatePackingItem,
} from '../database/queries/itemQueries';
import { ConfirmModal } from '../components/ConfirmModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { PackingItem, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetails'>;

export const ItemDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { categories, notifyDataChanged } = useAppContext();
  const { itemId } = route.params;

  const [item, setItem] = useState<PackingItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [quantity, setQuantity] = useState(1);
  const [isPacked, setIsPacked] = useState(false);
  const [isEssential, setIsEssential] = useState(true);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const row = await getPackingItemById(itemId);
      if (row && mounted) {
        setItem(row);
        setItemName(row.item_name);
        setCategoryId(row.category_id);
        setQuantity(row.quantity);
        setIsPacked(row.is_packed === 1);
        setIsEssential(row.is_essential === 1);
        setNotes(row.notes);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [itemId]);

  const handleSave = async () => {
    if (!itemName.trim()) {
      setError('Item name cannot be empty.');
      return;
    }
    if (quantity < 1 || quantity > 99) {
      setError('Quantity must be between 1 and 99.');
      return;
    }

    setSaving(true);
    try {
      await updatePackingItem(itemId, {
        item_name: itemName.trim(),
        category_id: categoryId,
        quantity,
        is_packed: isPacked ? 1 : 0,
        is_essential: isEssential ? 1 : 0,
        notes: notes.trim(),
      });
      await notifyDataChanged();
      setSaving(false);
      navigation.goBack();
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error ? err.message : 'Unable to save item changes.'
      );
    }
  };

  const handleDelete = async () => {
    await deletePackingItem(itemId);
    await notifyDataChanged();
    setShowDeleteConfirm(false);
    navigation.goBack();
  };

  if (!item) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <ScreenHeader title="Item Details" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Item Details"
        subtitle={item.is_custom === 1 ? 'Custom checklist item' : 'Recommended checklist item'}
        onBack={() => navigation.goBack()}
        rightElement={
          <Pressable
            onPress={() => setShowDeleteConfirm(true)}
            style={[
              styles.deleteTopBtn,
              { backgroundColor: theme.colors.dangerSoft },
            ]}
          >
            <Trash2 size={17} color={theme.colors.danger} />
          </Pressable>
        }
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
          {/* Packed Status Toggle Banner */}
          <Pressable
            onPress={() => setIsPacked((p) => !p)}
            style={[
              styles.packedBanner,
              {
                backgroundColor: isPacked
                  ? theme.colors.successSoft
                  : theme.colors.card,
                borderColor: isPacked
                  ? theme.colors.accentMint
                  : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            {isPacked ? (
              <CheckCircle2 size={28} color={theme.colors.accentMint} />
            ) : (
              <Circle size={28} color={theme.colors.secondaryBlue} />
            )}
            <View style={{ flex: 1, marginLeft: 13 }}>
              <Text
                style={[styles.packedTitle, { color: theme.colors.primaryText }]}
              >
                {isPacked ? 'Marked as Packed' : 'Currently Unpacked'}
              </Text>
              <Text
                style={[styles.packedSub, { color: theme.colors.secondaryText }]}
              >
                Tap to toggle packing status
              </Text>
            </View>
          </Pressable>

          {/* Main Item Editor Card */}
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
            <Text style={[styles.label, { color: theme.colors.primaryText }]}>
              Item Name *
            </Text>
            <TextInput
              value={itemName}
              onChangeText={(txt) => {
                setItemName(txt);
                if (error) setError(null);
              }}
              placeholder="Item name"
              placeholderTextColor={theme.colors.mutedText}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: error
                    ? theme.colors.danger
                    : theme.colors.border,
                  color: theme.colors.primaryText,
                },
              ]}
            />
            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}

            {/* Quantity */}
            <View style={styles.rowBetween}>
              <View>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.primaryText, marginBottom: 2 },
                  ]}
                >
                  Quantity
                </Text>
                <Text
                  style={{ fontSize: 12, color: theme.colors.secondaryText }}
                >
                  Number of units to pack
                </Text>
              </View>

              <View
                style={[
                  styles.stepper,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.stepBtn}
                >
                  <Minus size={16} color={theme.colors.primaryText} />
                </Pressable>
                <Text
                  style={[styles.qtyValue, { color: theme.colors.primaryText }]}
                >
                  {quantity}
                </Text>
                <Pressable
                  onPress={() => setQuantity((q) => Math.min(99, q + 1))}
                  style={styles.stepBtn}
                >
                  <Plus size={16} color={theme.colors.primaryText} />
                </Pressable>
              </View>
            </View>

            {/* Priority Switch */}
            <View style={styles.rowBetween}>
              <View>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.primaryText, marginBottom: 2 },
                  ]}
                >
                  Essential Priority
                </Text>
                <Text
                  style={{ fontSize: 12, color: theme.colors.secondaryText }}
                >
                  Highlight as must-pack essential
                </Text>
              </View>
              <Switch
                value={isEssential}
                onValueChange={setIsEssential}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.secondaryBlue,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Category Selector */}
            <Text
              style={[
                styles.label,
                { color: theme.colors.primaryText, marginTop: 18 },
              ]}
            >
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const active = cat.id === categoryId;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active
                          ? `${cat.color_hex}18`
                          : theme.colors.background,
                        borderColor: active
                          ? cat.color_hex
                          : theme.colors.border,
                      },
                    ]}
                  >
                    <DynamicIcon
                      name={cat.icon_name}
                      size={15}
                      color={cat.color_hex}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: active
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

            {/* Notes */}
            <Text
              style={[
                styles.label,
                { color: theme.colors.primaryText, marginTop: 18 },
              ]}
            >
              Optional Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add packing notes, bag compartment, voltage details..."
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

          <View style={styles.bottomActions}>
            <PrimaryButton
              label="Save Item Changes"
              onPress={handleSave}
              variant="secondary"
              loading={saving}
            />
            <PrimaryButton
              label="Delete Item"
              onPress={() => setShowDeleteConfirm(true)}
              variant="danger"
              icon={<Trash2 size={16} color={theme.colors.danger} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showDeleteConfirm}
        tone="danger"
        title="Delete This Item?"
        message={`Permanently remove "${item.item_name}" from your packing checklist?`}
        confirmLabel="Delete Item"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  deleteTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  packedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.4,
    padding: 16,
  },
  packedTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  packedSub: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 6,
  },
  stepBtn: {
    width: 32,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1.2,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
    fontSize: 14,
  },
  bottomActions: {
    gap: 10,
    marginTop: 4,
  },
});

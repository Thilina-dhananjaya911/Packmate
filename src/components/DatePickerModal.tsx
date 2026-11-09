import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import {
  addDaysISO,
  formatDateShort,
  getMonthYearLabel,
  getTodayISO,
  parseISODate,
  toISODateString,
} from '../utils/dateUtils';
import { PrimaryButton } from './PrimaryButton';

interface DatePickerModalProps {
  visible: boolean;
  title: string;
  selectedDate: string; // ISO YYYY-MM-DD
  minDate?: string; // ISO YYYY-MM-DD (dates strictly before minDate are disabled)
  referenceStartDate?: string; // Optional highlight start for return date picking
  onConfirm: (isoDate: string) => void;
  onClose: () => void;
}

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  selectedDate,
  minDate,
  referenceStartDate,
  onConfirm,
  onClose,
}) => {
  const { theme } = useAppTheme();
  const initialDateObj = parseISODate(selectedDate || getTodayISO());

  const [draftISO, setDraftISO] = useState(selectedDate || getTodayISO());
  const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth());

  useEffect(() => {
    if (visible) {
      const target = selectedDate || minDate || getTodayISO();
      const dt = parseISODate(target);
      setDraftISO(target);
      setViewYear(dt.getFullYear());
      setViewMonth(dt.getMonth());
    }
  }, [visible, selectedDate, minDate]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; iso: string | null }> = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISODateString(new Date(viewYear, viewMonth, d, 12, 0, 0));
      cells.push({ day: d, iso });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const applyShortcut = (iso: string) => {
    if (minDate && iso < minDate) return;
    const dt = parseISODate(iso);
    setDraftISO(iso);
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
  };

  const baseForShortcuts = referenceStartDate || getTodayISO();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            theme.shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                {title}
              </Text>
              <Text style={[styles.selectedLabel, { color: theme.colors.secondaryBlue }]}>
                {formatDateShort(draftISO)}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
            >
              <X size={18} color={theme.colors.secondaryText} />
            </Pressable>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {[
              {
                label: referenceStartDate ? '+2 Days' : 'Today',
                iso: referenceStartDate ? addDaysISO(baseForShortcuts, 2) : getTodayISO(),
              },
              {
                label: '+4 Days',
                iso: addDaysISO(baseForShortcuts, 4),
              },
              {
                label: '+7 Days',
                iso: addDaysISO(baseForShortcuts, 7),
              },
              {
                label: '+14 Days',
                iso: addDaysISO(baseForShortcuts, 14),
              },
            ].map((preset) => {
              const disabled = Boolean(minDate && preset.iso < minDate);
              return (
                <Pressable
                  key={preset.label}
                  disabled={disabled}
                  onPress={() => applyShortcut(preset.iso)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        draftISO === preset.iso
                          ? theme.colors.infoSoft
                          : theme.colors.surfaceSubtle,
                      borderColor:
                        draftISO === preset.iso
                          ? theme.colors.secondaryBlue
                          : 'transparent',
                      opacity: disabled ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color:
                          draftISO === preset.iso
                            ? theme.colors.secondaryBlue
                            : theme.colors.secondaryText,
                      },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={handlePrevMonth}
              style={[styles.navBtn, { borderColor: theme.colors.border }]}
            >
              <ChevronLeft size={18} color={theme.colors.primaryText} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: theme.colors.primaryText }]}>
              {getMonthYearLabel(viewYear, viewMonth)}
            </Text>
            <Pressable
              onPress={handleNextMonth}
              style={[styles.navBtn, { borderColor: theme.colors.border }]}
            >
              <ChevronRight size={18} color={theme.colors.primaryText} />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekHeaderRow}>
            {WEEKDAY_HEADERS.map((w) => (
              <Text
                key={w}
                style={[styles.weekHeaderText, { color: theme.colors.mutedText }]}
              >
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarCells.map((cell, idx) => {
              if (!cell.day || !cell.iso) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const isDisabled = Boolean(minDate && cell.iso < minDate);
              const isSelected = cell.iso === draftISO;
              const isInRange = Boolean(
                referenceStartDate &&
                  cell.iso >= referenceStartDate &&
                  cell.iso < draftISO
              );

              return (
                <Pressable
                  key={cell.iso}
                  disabled={isDisabled}
                  onPress={() => setDraftISO(cell.iso!)}
                  style={[
                    styles.dayCell,
                    isInRange && { backgroundColor: theme.colors.infoSoft, borderRadius: 10 },
                    isSelected && {
                      backgroundColor: theme.colors.secondaryBlue,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : isDisabled
                          ? theme.colors.mutedText
                          : theme.colors.primaryText,
                        opacity: isDisabled ? 0.35 : 1,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            <PrimaryButton
              label="Cancel"
              onPress={onClose}
              variant="outline"
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Select Date"
              onPress={() => onConfirm(draftISO)}
              variant="secondary"
              style={{ flex: 1.4 }}
            />
          </View>
        </Pressable>
      </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

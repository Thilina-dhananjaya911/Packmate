import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { RADIUS, useAppTheme } from '../context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: theme.isDark ? 'rgba(25, 17, 48, 0.75)' : theme.colors.card,
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
        },
        theme.shadows.xs,
      ]}
    >
      <Search size={18} color={theme.colors.secondaryText} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedText}
        style={[styles.input, { color: theme.colors.primaryText }]}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          style={[styles.clearBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
        >
          <X size={13} color={theme.colors.secondaryText} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
};

export interface FilterChipOption<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

interface FilterChipsProps<T extends string = string> {
  options: FilterChipOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function FilterChips<T extends string = string>({
  options,
  selectedValue,
  onSelect,
}: FilterChipsProps<T>) {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipScroll}
    >
      {options.map((opt) => {
        const active = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? theme.colors.accentLime
                  : theme.isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : theme.colors.card,
                borderColor: active
                  ? 'transparent'
                  : theme.isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : theme.colors.border,
              },
              active ? theme.shadows.limeGlow : theme.shadows.xs,
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                {
                  color: active
                    ? theme.colors.limeText
                    : theme.colors.secondaryText,
                  fontWeight: active ? '800' : '600',
                },
              ]}
            >
              {opt.label}
            </Text>
            {typeof opt.count === 'number' ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: active
                      ? 'rgba(0, 0, 0, 0.16)'
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : theme.colors.surfaceSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: active
                        ? theme.colors.limeText
                        : theme.colors.secondaryText,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}
                >
                  {opt.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 0,
    outlineWidth: 0,
  } as any,
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipScroll: {
    paddingVertical: 8,
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countText: {
    fontSize: 11,
  },
});

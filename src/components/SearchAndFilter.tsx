import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

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
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
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
                  ? theme.colors.primaryNavy
                  : theme.colors.card,
                borderColor: active
                  ? theme.colors.primaryNavy
                  : theme.colors.border,
              },
              active ? theme.shadows.xs : undefined,
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                {
                  color: active ? '#FFFFFF' : theme.colors.secondaryText,
                },
              ]}
            >
              {opt.label}
            </Text>
            {opt.count !== undefined ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: active
                      ? 'rgba(255, 255, 255, 0.22)'
                      : theme.colors.surfaceSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: active ? '#FFFFFF' : theme.colors.secondaryText,
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
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 8,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

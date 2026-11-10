import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight, Clock, Layers, Sparkles } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { FilterChipOption, FilterChips, SearchBar } from '../components/SearchAndFilter';
import {
  DestinationType,
  MainTabParamList,
  PackingTemplate,
  RootStackParamList,
} from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Templates'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TemplatesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { templates } = useAppContext();
  const targetTripId = route.params?.targetTripId;

  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<DestinationType | 'All'>('All');

  const filterOptions: FilterChipOption<DestinationType | 'All'>[] = useMemo(
    () => [
      { label: 'All Templates', value: 'All', count: templates.length },
      { label: 'Beach & Coast', value: 'Beach' },
      { label: 'Urban & Business', value: 'City' },
      { label: 'Mountain', value: 'Mountain' },
      { label: 'Nature & Camp', value: 'Nature' },
      { label: 'International', value: 'International' },
      { label: 'Family Resort', value: 'Resort' },
      { label: 'Short Getaway', value: 'General' },
    ],
    [templates.length]
  );

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((tpl) => {
      if (envFilter !== 'All' && tpl.destination_type !== envFilter) {
        return false;
      }
      if (q.length > 0) {
        return (
          tpl.template_name.toLowerCase().includes(q) ||
          tpl.description.toLowerCase().includes(q) ||
          tpl.trip_type.toLowerCase().includes(q) ||
          tpl.destination_type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [templates, searchQuery, envFilter]);

  const renderTemplateCard = ({ item }: { item: PackingTemplate }) => (
    <AnimatedPressableCard
      onPress={() =>
        navigation.navigate('TemplateDetails', {
          templateId: item.id,
          targetTripId,
        })
      }
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconSquircle,
            { backgroundColor: `${item.accent_color}18` },
          ]}
        >
          <DynamicIcon
            name={item.icon_name}
            size={24}
            color={item.accent_color}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 13 }}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[styles.tplName, { color: theme.colors.primaryText }]}
            >
              {item.template_name}
            </Text>
          </View>
          <Text style={[styles.envTag, { color: item.accent_color }]}>
            {item.destination_type} Environment • {item.trip_type}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.descText, { color: theme.colors.secondaryText }]}
      >
        {item.description}
      </Text>

      <View
        style={[
          styles.footerRow,
          { borderTopColor: theme.colors.border },
        ]}
      >
        <View style={styles.metaGroup}>
          <View
            style={[
              styles.metaPill,
              { backgroundColor: theme.colors.surfaceSubtle },
            ]}
          >
            <Layers size={13} color={theme.colors.secondaryBlue} />
            <Text style={[styles.metaPillText, { color: theme.colors.primaryText }]}>
              {item.item_count} Items ({item.essential_count} Essential)
            </Text>
          </View>

          <View
            style={[
              styles.metaPill,
              { backgroundColor: theme.colors.surfaceSubtle },
            ]}
          >
            <Clock size={12} color={theme.colors.secondaryText} />
            <Text
              style={[styles.metaPillText, { color: theme.colors.secondaryText }]}
            >
              {item.recommended_duration}
            </Text>
          </View>
        </View>

        <ArrowRight size={17} color={theme.colors.secondaryBlue} />
      </View>
    </AnimatedPressableCard>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              Packing Templates
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
              8 destination-based offline libraries with smart quantity scaling
            </Text>
          </View>
          <View
            style={[
              styles.smartBadge,
              { backgroundColor: theme.colors.infoSoft },
            ]}
          >
            <Sparkles size={16} color={theme.colors.secondaryBlue} />
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search templates (Beach, Business, Mountain...)"
        />
        <View style={{ marginTop: 10 }}>
          <FilterChips
            options={filterOptions}
            selectedValue={envFilter}
            onSelect={setEnvFilter}
          />
        </View>
      </View>

      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTemplateCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            variant="empty-search"
            title="No Templates Found"
            description="Try a different keyword or reset the category filter."
            actionLabel="Show All Templates"
            onAction={() => {
              setSearchQuery('');
              setEnvFilter('All');
            }}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  smartBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSquircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tplName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  envTag: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { getTemplateImage } from '../constants/travelImages';
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

  const renderTemplateCard = ({ item }: { item: PackingTemplate }) => {
    const img = getTemplateImage(item.trip_type).thumbnail;

    return (
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
            backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.78)' : theme.colors.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Template Photo Banner */}
        <View style={styles.cardPhotoBanner}>
          <Image
            source={{ uri: img }}
            style={styles.cardPhotoImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15, 10, 30, 0.20)', 'rgba(15, 10, 30, 0.82)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.photoOverlayTop}>
            <View
              style={[
                styles.iconSquircle,
                { backgroundColor: 'rgba(20, 14, 40, 0.85)' },
              ]}
            >
              <DynamicIcon
                name={item.icon_name}
                size={20}
                color={theme.colors.accentLime}
              />
            </View>

            <View style={styles.glassPill}>
              <Clock size={11} color="#CBD5E1" />
              <Text style={styles.glassPillText}>{item.recommended_duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text
            numberOfLines={1}
            style={[styles.tplName, { color: theme.colors.primaryText }]}
          >
            {item.template_name}
          </Text>
          <Text style={[styles.envTag, { color: theme.colors.accentLime }]}>
            {item.destination_type} Environment • {item.trip_type}
          </Text>

          <Text
            numberOfLines={2}
            style={[styles.descText, { color: theme.colors.secondaryText }]}
          >
            {item.description}
          </Text>

          <View
            style={[
              styles.footerRow,
              { borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border },
            ]}
          >
            <View style={styles.metaGroup}>
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                    borderWidth: 1,
                  },
                ]}
              >
                <Layers size={13} color={theme.colors.accentLime} />
                <Text style={[styles.metaPillText, { color: theme.colors.primaryText }]}>
                  {item.item_count} Items ({item.essential_count} Essential)
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.arrowCircle,
                { backgroundColor: theme.colors.accentLime },
                theme.shadows.limeGlow,
              ]}
            >
              <ArrowRight size={15} color={theme.colors.limeText} strokeWidth={2.8} />
            </View>
          </View>
        </View>
      </AnimatedPressableCard>
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.containerConstrained}>
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
                { backgroundColor: theme.colors.limeSoft },
              ]}
            >
              <Sparkles size={16} color={theme.colors.accentLime} />
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search templates (Beach, Business, Mountain...)"
          />
          <View style={{ marginTop: 8 }}>
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
              title="No Templates Found"
              description="No packing template matches your search criteria. Try a different search keyword or select All Templates."
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  containerConstrained: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    maxWidth: 300,
  },
  smartBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 4,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardPhotoBanner: {
    height: 105,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
    padding: 12,
  },
  cardPhotoImage: {
    ...StyleSheet.absoluteFill,
  },
  photoOverlayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20, 14, 40, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  glassPillText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
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
    marginTop: 8,
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
    alignItems: 'center',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

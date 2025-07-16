import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface FilterState {
  categories: string[];
  minPrice: string;
  maxPrice: string;
}

interface MarketplaceFiltersProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

const CATEGORIES = [
  { id: 'BOOKS', label: 'Books', icon: 'book-outline' },
  { id: 'SUBLETS', label: 'Sublets', icon: 'home-outline' },
  { id: 'ROOMMATES', label: 'Roommates', icon: 'people-outline' },
  { id: 'RIDESHARE', label: 'Rideshare', icon: 'car-outline' },
  { id: 'EVENTS', label: 'Events', icon: 'calendar-outline' },
  { id: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = filters.categories.includes(categoryId);
    const newCategories = isSelected
      ? filters.categories.filter(cat => cat !== categoryId)
      : [...filters.categories, categoryId];
    
    setFilters(prev => ({
      ...prev,
      categories: newCategories,
    }));
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      minPrice: '',
      maxPrice: '',
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const getSelectedCount = () => {
    let count = filters.categories.length;
    if (filters.minPrice || filters.maxPrice) count += 1;
    return count;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    filters.categories.includes(category.id) && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleCategoryToggle(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={filters.categories.includes(category.id) ? '#2563eb' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      filters.categories.includes(category.id) && styles.categoryLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Min Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.minPrice}
                  onChangeText={(value) => handlePriceChange('minPrice', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.priceSeparator}>
                <Text style={styles.priceSeparatorText}>to</Text>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Max Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.maxPrice}
                  onChangeText={(value) => handlePriceChange('maxPrice', value)}
                  placeholder="∞"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              getSelectedCount() === 0 && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyFilters}
            disabled={getSelectedCount() === 0}
          >
            <Text style={[
              styles.applyButtonText,
              getSelectedCount() === 0 && styles.applyButtonTextDisabled,
            ]}>
              Apply Filters {getSelectedCount() > 0 && `(${getSelectedCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: (width - 64) / 3 - 8,
    height: 80,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  priceSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  priceSeparatorText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default MarketplaceFilters; 
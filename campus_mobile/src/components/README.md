# ListingDetailDrawer Component

A React Native drawer component that displays listing details in a bottom sheet modal, converted from the web ShadCN drawer component.

## Features

- **Native Modal**: Uses React Native's built-in Modal component with slide animation
- **Responsive Design**: Adapts to different screen sizes
- **Related Listings**: Shows related listings in a horizontal scroll
- **Action Buttons**: Message, Save, and Full Details actions
- **Category Badges**: Color-coded category and condition badges
- **Seller Information**: Displays seller profile with avatar
- **Image Handling**: Supports listing images with placeholder fallback

## Usage

```tsx
import ListingDetailDrawer from '../components/ListingDetailDrawer';

const MyScreen = () => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleListingPress = (listing: Listing) => {
    setSelectedListing(listing);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedListing(null);
  };

  return (
    <View>
      {/* Your listing cards */}
      <TouchableOpacity onPress={() => handleListingPress(listing)}>
        {/* Listing card content */}
      </TouchableOpacity>

      {/* Drawer */}
      {selectedListing && (
        <ListingDetailDrawer
          listing={selectedListing}
          isVisible={isDrawerVisible}
          onClose={handleDrawerClose}
        />
      )}
    </View>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `listing` | `Listing \| null` | Yes | The listing object to display |
| `isVisible` | `boolean` | Yes | Controls drawer visibility |
| `onClose` | `() => void` | Yes | Callback when drawer is closed |

## Styling

The component uses React Native StyleSheet with a design system that matches the web version:

- **Colors**: Uses a consistent color palette for categories and conditions
- **Typography**: Responsive text sizes with proper font weights
- **Spacing**: Consistent padding and margins throughout
- **Shadows**: Subtle elevation effects for cards and buttons

## Navigation

The drawer integrates with React Navigation and provides navigation to:
- Chat detail screen (for messaging)
- Full listing detail screen
- Related listings

## Dependencies

- React Native core components
- @expo/vector-icons (Ionicons)
- @react-navigation/native
- Custom types and services from the project

## Conversion Notes

This component was converted from the web ShadCN drawer component with the following changes:

- Replaced DOM elements with React Native components
- Converted CSS classes to StyleSheet objects
- Replaced web-specific animations with React Native Modal
- Adapted touch interactions for mobile
- Maintained the same visual design and functionality 
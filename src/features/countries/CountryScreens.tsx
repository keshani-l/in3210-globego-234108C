import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HomeRoutes } from '../../app/navigation/routes';
import { FeaturePage } from '../../shared/ui/FeaturePage';

export function CountryDetailsScreen({ route }: NativeStackScreenProps<HomeRoutes, 'CountryDetails'>) {
  return (
    <FeaturePage
      belowHeader
      icon="map-pin"
      title="Country details preview"
      description={`Country ID: ${route.params.countryId}`}
    />
  );
}

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HomeRoutes } from '../../app/navigation/routes';
import { useAppSelector } from '../../app/store';
import { Button } from '../../shared/ui/controls';
import { FeaturePage } from '../../shared/ui/FeaturePage';

export function HomeScreen({ navigation }: NativeStackScreenProps<HomeRoutes, 'Home'>) {
  const auth = useAppSelector((state) => state.auth);
  if (auth.status !== 'signedIn') return null;

  return (
    <FeaturePage icon="compass" title={`Hello, ${auth.user.firstName}`} description="Country browsing will be added in the next phase.">
      <Button
        label="Open sample country details"
        icon="arrow-right"
        onPress={() => navigation.navigate('CountryDetails', { countryId: 'LKA' })}
      />
    </FeaturePage>
  );
}

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

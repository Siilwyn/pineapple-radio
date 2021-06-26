import grandButton from './grand-button';
import { fetchDatabaseEventBus } from '../lib/api';

const likeVariants = {
  'none': 'none',
  'like': 'like',
  'hype': 'hype',
};

const likeVariantMapping = {
  [likeVariants.none]: 'Like',
  [likeVariants.like]: 'Hype',
  [likeVariants.hype]: 'Hyped!',
};

export default function likeButton({
  authenticationData,
  likeVariant,
  setLikeVariant,
  ...rest
}) {
  const handleLikeSubmit = (event) => {
    event.preventDefault();

    if (likeVariant === likeVariants.none) {
      return fetchDatabaseEventBus(
        `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
        {
          [authenticationData.localId]: {
            type: likeVariants.like,
            uid: authenticationData.localId,
          },
        }
      ).then(() => setLikeVariant(likeVariants.like));
    }

    if (likeVariant === likeVariants.like) {
      return fetchDatabaseEventBus(
        `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
        {
          [authenticationData.localId]: {
            type: 'chat',
            uid: authenticationData.localId,
            data: { msg: `/${likeVariants.hype}` },
          },
        }
      ).then(() => setLikeVariant(likeVariants.hype));
    }

  };

  return grandButton(
    { ...rest, onClick: handleLikeSubmit },
    likeVariantMapping[likeVariant]
  );
}

likeButton.likeVariants = likeVariants;

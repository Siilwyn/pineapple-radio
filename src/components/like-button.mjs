import grandButton from './grand-button.mjs';
import { fetchDatabaseEventBus } from '../helpers/api.mjs';

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
  ...rest
}) {
  const handleLikeSubmit = (event) => {
    event.preventDefault();

    if (likeVariant.value === likeVariants.none) {
      return fetchDatabaseEventBus(
        `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
        {
          [authenticationData.localId]: {
            type: likeVariants.like,
            uid: authenticationData.localId,
          },
        }
      ).then(() => likeVariant.value = likeVariants.like);
    }

    if (likeVariant.value === likeVariants.like) {
      return fetchDatabaseEventBus(
        `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
        {
          [authenticationData.localId]: {
            type: 'chat',
            uid: authenticationData.localId,
            data: { msg: `/${likeVariants.hype}` },
          },
        }
      ).then(() => likeVariant.value = likeVariants.hype);
    }

  };

  return grandButton(
    { ...rest, onClick: handleLikeSubmit },
    likeVariantMapping[likeVariant.value]
  );
}

likeButton.likeVariants = likeVariants;

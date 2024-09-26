import { CredentialProvider, ExpiresIn, AuthClient } from '@gomomento/sdk';
import { reactions } from "./templates/html.mjs";
import Handlebars from 'handlebars';

const authClient = new AuthClient({ credentialProvider: CredentialProvider.fromEnvironmentVariable('MOMENTO_API_KEY') });

const emojis = [
  { name: 'heart', emoji: '❤️' },
  { name: '100', emoji: '💯' },
  { name: 'thumbsup', emoji: '👍' },
  { name: 'thumbsdown', emoji: '👎' },
  { name: 'fire', emoji: '🔥' },
  { name: 'mindblown', emoji: '🤯' }
];

export const handler = async (event) => {
  const { topic } = event.pathParameters;
  const scope = {
    permissions:
      [{
        role: 'publishonly',
        cache: process.env.CACHE_NAME,
        topic
      }]
  };

  const token = await authClient.generateDisposableToken(scope, ExpiresIn.hours(1));

  const template = Handlebars.compile(reactions);
  const html = template({
    token: token.authToken,
    cacheName: process.env.CACHE_NAME,
    emojis,
    topic
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
};

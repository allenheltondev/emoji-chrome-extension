export const reactions = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Send Reactions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              purple: '#250083',
              darkBlue: '#a238FF',
              lightBlue: '#AAE9FF'
            }
          }
        }
      }
    </script>
</head>
<body class="flex justify-center items-center bg-gradient-to-br from-purple to-darkBlue min-h-screen">
  <div class="card bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2">
    <div class="flex flex-col items-center">
      <h1 class="text-xl font-semibold text-center mb-0">How ya feelin?</h1>
      <p class="text-gray-500 italic mb-4">Sending reactions to "{{topic}}"</p>

      <!-- Emoji Container -->
      <div class="flex flex-wrap justify-center items-center">
        {{#emojis}}
        <button class="bg-transparent flex flex-col items-center justify-center text-6xl basis-1/2 drop-shadow-md hover:drop-shadow-xl mb-4" name="{{name}}" onclick="sendReaction('{{name}}')">
          {{emoji}}
        </button>
        {{/emojis}}
      </div>
    </div>
  </div>

  <script>
    async function sendReaction(reaction) {
      await fetch('https://api.cache.cell-us-east-1-1.prod.a.momentohq.com/topics/{{cacheName}}/{{topic}}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': "{{{token}}}"
            },
            body: reaction
          });
    }
  </script>
</body>
</html>`;

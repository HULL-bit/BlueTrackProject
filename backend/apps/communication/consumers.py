import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CommunicationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'communication'
        self.room_group_name = f'communication_{self.room_name}'

        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')
            
            if message_type == 'message':
                message = text_data_json.get('message', '')
                sender = text_data_json.get('sender', 'Anonymous')
                
                # Envoyer le message au groupe
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender': sender
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'sender': sender
        }))

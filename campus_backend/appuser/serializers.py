from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model() 

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    cover_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'year', 'username', 'bio', 'location', 'is_email_verified', 
                 'profile_picture', 'cover_picture', 'instagram', 'snapchat', 'linkedin']
        extra_kwargs = {
            'bio': {'required': False},
            'location': {'required': False},
            'username': {'required': False},
            'year': {'required': False, 'default': 1},
            'profile_picture': {'required': False},
            'cover_picture': {'required': False},
            'instagram': {'required': False},
            'snapchat': {'required': False},
            'linkedin': {'required': False}
        }

    def validate(self, data):
        print("\n=== Serializer Validation ===")
        print("Received data:", data)
        return data

    def create(self, validated_data):
        print("\n=== Serializer Create ===")
        print("Validated data before username generation:", validated_data)
        # Set username from name if not provided
        if 'username' not in validated_data:
            validated_data['username'] = validated_data.get('name', '').lower().replace(' ', '_')
            print("Generated username:", validated_data['username'])
        
        try:
            instance = super().create(validated_data)
            print("Successfully created user instance:", instance)
            return instance
        except Exception as e:
            print("❌ Error creating user in serializer:", str(e))
            raise

class UserCreateSerializer(UserSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['password'] 
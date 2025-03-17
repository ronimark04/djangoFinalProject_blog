from .models import Profile
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator


class ProfileSerializer(serializers.ModelSerializer):
    remove_profile_pic = serializers.BooleanField(
        write_only=True, required=False)

    class Meta:
        model = Profile
        fields = ['bio', 'profile_pic', 'remove_profile_pic', 'birth_date']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name',
                  'last_name', 'password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Create profile
        Profile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        # === 1. Update User fields ===
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        # === 2. Update Profile fields ===
        profile, _ = Profile.objects.get_or_create(user=instance)

        # 2a. Handle profile picture deletion if requested
        remove_pic = profile_data.pop('remove_profile_pic', False)
        if remove_pic and profile.profile_pic:
            profile.profile_pic.delete(save=False)
            profile.profile_pic = None

        # 2b. Update other profile fields
        for attr, value in profile_data.items():
            setattr(profile, attr, value)

        profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    # Optional fields
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    bio = serializers.CharField(required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name',
            'bio', 'birth_date', 'profile_pic'
        ]

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        # Extract optional profile info
        profile_data = {
            'bio': validated_data.pop('bio', ''),
            'birth_date': validated_data.pop('birth_date', None),
            'profile_pic': validated_data.pop('profile_pic', None),
        }

        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')

        password = validated_data.pop('password')
        validated_data.pop('password2')

        # Create user
        user = User(**validated_data)
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.save()

        # Create profile
        Profile.objects.create(user=user, **profile_data)

        return user

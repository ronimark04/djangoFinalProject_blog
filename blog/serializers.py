from .models import Profile
from django.contrib.auth.models import User
from rest_framework import serializers


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

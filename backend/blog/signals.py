from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group

# automatically assign new users to Members group
@receiver(post_save, sender=User)
def assign_member_group(sender, instance, created, **kwargs):
    if created:
        members_group, _ = Group.objects.get_or_create(name="Members")
        
        if not instance.groups.exists():
            instance.groups.add(members_group)


from django.apps import AppConfig


class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'

# when a User is created, create a Profile:


def ready(self):
    import blog.signals

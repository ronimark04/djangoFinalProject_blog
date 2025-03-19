from django.db.utils import OperationalError, ProgrammingError
from django.contrib.auth.models import User
from blog.models import Article
from blog.seed_data import run_seed

print(">>> blog.startup.py loaded <<<")


def should_seed():
    try:
        return (
            not Article.objects.exists()
            or User.objects.filter(is_superuser=True).count() == 1
        )
    except (OperationalError, ProgrammingError):
        return False


if should_seed():
    print("Seeding database...")
    run_seed()
else:
    print("Data already exists - skipping seed")

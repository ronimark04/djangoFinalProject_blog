from django.core.files import File
from blog.models import Profile
import os
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from blog.models import Article, Comment, Profile
from taggit.models import Tag
from decouple import config
from django.db.models.signals import post_save
from blog.signals import assign_member_group


def run_seed():
    post_save.disconnect(assign_member_group, sender=User)
    print("Running initial data seed...")

    group_permissions = {
        "Moderators": [
            "view_article", "add_article", "change_article", "delete_article",
            "view_comment", "add_comment", "change_comment", "delete_comment",
        ],
        "Editors": [
            "view_article", "change_article",
            "change_comment",
        ],
        "Members": [
            "view_article",
            "view_comment", "add_comment", "delete_comment",
        ]
    }

    groups = {}
    for name, permissions in group_permissions.items():
        group, _ = Group.objects.get_or_create(name=name)
        for perm_code in permissions:
            try:
                model_name = perm_code.split("_")[1]
                content_type = ContentType.objects.get(model=model_name)
                permission = Permission.objects.get(codename=perm_code, content_type=content_type)
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                print(f"Warning: Permission '{perm_code}' not found.")
        group.save()
        groups[name] = group
    print("Groups created or confirmed with permissions.")

    user_specs = [
        {
            'username': 'mod1',
            'password': config('MOD_PASS'),
            'email': 'jmarkson@email.com',
            'group': 'Moderators',
            'first_name': 'John',
            'last_name': 'Markson',
            'birth_date': '1990-03-12',
            'bio': 'Moderator who loves clean code and model structure.',
            'pic': 'profile_pic1.png'
        },
        {
            'username': 'mod2',
            'password': config('MOD_PASS'),
            'email': 'dreed@email.com',
            'group': 'Moderators',
            'first_name': 'David',
            'last_name': 'Reed',
            'birth_date': '1987-09-22',
            'bio': 'Always breaking down big problems into manageable views.',
            'pic': 'profile_pic2.png'
        },
        {
            'username': 'editor1',
            'password': config('EDITOR_PASS'),
            'email': 'cnguyen@email.com',
            'group': 'Editors',
            'first_name': 'Clara',
            'last_name': 'Nguyen',
            'birth_date': '1995-07-08',
            'bio': 'Frontend-minded editor who keeps content consistent.',
            'pic': 'profile_pic4.png'
        },
        {
            'username': 'member1',
            'password': config('MEMBER_PASS'),
            'email': 'aturner@email.com',
            'group': 'Members',
            'first_name': 'Alex',
            'last_name': 'Turner',
            'birth_date': '1992-01-15',
            'bio': 'Love reading articles and learning more each day.',
            'pic': 'profile_pic3.png'
        },
        {
            'username': 'member2',
            'password': config('MEMBER_PASS'),
            'email': 'nromero@email.com',
            'group': 'Members',
            'first_name': 'Nina',
            'last_name': 'Romero',
            'birth_date': '1996-05-30',
            'bio': 'Exploring Django, one comment at a time.',
            'pic': 'profile_pic5.png'
        },
        {
            'username': 'member3',
            'password': config('MEMBER_PASS'),
            'email': 'lbanks@email.com',
            'group': 'Members',
            'first_name': 'Leo',
            'last_name': 'Banks',
            'birth_date': '1993-12-19',
            'bio': 'API consumer, occasional contributor.',
            'pic': 'profile_pic6.png'
        },
    ]

    users = {}
    for spec in user_specs:
        user, created = User.objects.get_or_create(username=spec['username'])
        if created:
            user.set_password(spec['password'])
            user.email = spec['email']
            user.first_name = spec['first_name']
            user.last_name = spec['last_name']
            user.save()
            print(f"Created user: {spec['username']}")
        user.groups.add(groups[spec['group']])
        users[spec['username']] = user

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.bio = spec['bio']
        profile.birth_date = spec['birth_date']

        if spec['pic']:
            image_path = os.path.join(
                'blog', 'static', 'seed_images', spec['pic'])
            if os.path.exists(image_path):
                with open(image_path, 'rb') as img_file:
                    profile.profile_pic.save(
                        spec['pic'], File(img_file), save=False)
        profile.save()

    article_info = [
        {
            'title': 'Django Models and Migrations',
            'content': """Django’s ORM allows you to define your database schema entirely in Python using models. Each model represents a table and its fields map to columns. This abstraction provides a cleaner way to manage the database and helps you avoid raw SQL in most situations.

Once your models are defined, Django's migration system lets you apply changes to your database schema using simple commands. You generate migrations with `makemigrations` and apply them with `migrate`. These migrations are versioned Python files that Django uses to track changes to your schema.

In this project, we use models to define articles, comments, and user profiles. The `Article` model includes a foreign key to the user who authored it, as well as fields for the title, content, and tags. The `Comment` model supports nested replies via a self-referencing foreign key. The `Profile` model extends the user with additional fields such as bio, birth date, and profile picture.

By combining Django’s ORM with its migration system, we get a robust and maintainable way to handle data structures. Whether you’re deploying to production or collaborating with other developers, migrations ensure your database stays in sync with your models.""",
            'tags': ['django', 'models', 'migrations']
        },
        {
            'title': 'DRF ViewSets and Routers',
            'content': """Django REST Framework (DRF) offers ViewSets and Routers to reduce the boilerplate involved in building APIs. A ViewSet is a class that combines logic for multiple actions like list, retrieve, create, update, and delete. Instead of writing separate views for each of these actions, DRF lets you group them together into a ViewSet.

Routers take a ViewSet and automatically generate URL patterns. For example, registering an `ArticleViewSet` with a router will create paths like `/articles/`, `/articles/<id>/`, and so on. This drastically reduces manual URL configuration and ensures consistency across your API.

In this project, `ArticleViewSet` and `CommentViewSet` are both implemented as `ModelViewSet` classes. This means they inherit the default CRUD actions and can be extended as needed. For example, we’ve added a custom route to retrieve all comments under a specific article using DRF’s `@action` decorator.

This modular design not only makes your code more maintainable but also ensures that your API is self-documenting and consistent. Combined with DRF’s browsable API, it becomes much easier to test and explore endpoints during development. Routers and ViewSets are fundamental to keeping your API code clean and scalable.""",
            'tags': ['drf', 'viewsets', 'routers']
        },
        {
            'title': 'Authentication with JWT',
            'content': """JWT (JSON Web Token) is a stateless authentication method widely used in APIs. It allows secure, token-based user authentication where credentials are exchanged for a signed token. This token is included in every request and can be verified without storing session data on the server.

In this project, we use the `djangorestframework-simplejwt` package to implement JWT-based login and registration. When a user logs in, they receive an access token and a refresh token. The access token is short-lived and used for regular API requests. When it expires, the refresh token is used to obtain a new access token.

This approach is ideal for modern applications, especially SPAs and mobile apps, because it avoids CSRF issues and scales easily. Our `/api/token/` and `/api/token/refresh/` endpoints handle this flow. Permissions are enforced using DRF’s `IsAuthenticated` and `DjangoModelPermissions`, ensuring only authorized users can perform sensitive actions.

Additionally, we’ve built a custom `/register/` endpoint that handles creating a user along with their profile and returns a token. All this logic is handled using DRF serializers and views, keeping the code clean and testable.

JWT authentication is a modern standard, and its inclusion makes this project secure and production-ready.""",
            'tags': ['authentication', 'jwt', 'drf']
        },
        {
            'title': 'Managing Tags with Django-Taggit',
            'content': """Django-Taggit is a simple and powerful tagging library that lets you associate tags with any model in Django. Tags are stored in a separate table and linked to objects via a generic relation, allowing you to filter and query content based on tags.

In this project, we’ve added tags to the `Article` model using Taggit’s `TaggableManager`. This makes it easy to assign and retrieve tags associated with an article. To make tag handling more intuitive in the API, we customized the serializer using a subclass of `TagListSerializerField`.

The custom `TagField` class lets users submit tags as comma-separated strings in the browsable API form, and ensures they are returned as lists in JSON responses. This improves the developer experience and makes the API easier to work with, especially from frontend clients.

Taggit also supports advanced features like tag clouds, tag suggestions, and tag-based search. In a real-world app, tags improve content discovery and navigation. They can also be used for analytics or recommendation systems.

By incorporating Django-Taggit and customizing its integration, we’ve built a tagging system that’s both flexible and user-friendly.""",
            'tags': ['taggit', 'tags', 'django']
        },
        {
            'title': 'User Profiles and Serializers',
            'content': """Extending Django’s built-in User model is a common requirement in most applications. Rather than modifying the User model directly, best practice is to create a separate Profile model linked via a `OneToOneField`. This way, you can store additional user information without breaking Django’s auth system.

In this project, the `Profile` model stores a user’s bio, birth date, and profile picture. It also tracks creation and update timestamps. The `Profile` is linked to the User, and we expose both via serializers so they can be created and updated together.

DRF serializers give us full control over how profile data is presented. We’ve also used a `HiddenField` to automatically associate the profile with the authenticated user, and added logic to allow deleting the profile picture with a boolean flag.

This setup makes user data management intuitive from a frontend perspective. A single API call can fetch or update everything related to a user, and sensitive fields like passwords are protected. You can also extend this to include settings, preferences, or activity stats.

User profile management is a fundamental feature, and our implementation demonstrates how to handle it cleanly with Django and DRF.""",
            'tags': ['profiles', 'serializers', 'users']
        }
    ]

    mod_authors = [users['mod1'], users['mod2']]
    articles = []
    for i, art in enumerate(article_info):
        article, created = Article.objects.get_or_create(
            title=art['title'],
            defaults={'content': art['content'], 'author': mod_authors[i % 2]}
        )
        if created:
            article.tags.add(*art['tags'])
            print(f"Created article: {article.title}")
        articles.append(article)

    member_users = [users['member1'], users['member2'], users['member3']]
    for i, article in enumerate(articles):
        comment1, _ = Comment.objects.get_or_create(
            article=article,
            content=f"This is a great post about {article.tags.first()}!",
            author=member_users[i % 3]
        )
        comment2, _ = Comment.objects.get_or_create(
            article=article,
            content="Really insightful explanation. Thanks!",
            author=member_users[(i + 1) % 3]
        )
        Comment.objects.get_or_create(
            article=article,
            content="Agreed! This helped me a lot.",
            author=member_users[(i + 2) % 3],
            reply_to=comment1
        )
        
    post_save.connect(assign_member_group, sender=User)
    print("Seeding complete.")

from rest_framework.filters import SearchFilter
from django.contrib.auth.models import User
from rest_framework import viewsets
from blog.utils.try_parse_int import try_parse_int
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, DjangoModelPermissions, BasePermission, SAFE_METHODS, AllowAny
from blog.utils.try_parse_int import try_parse_int
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination


class IsEditorOrModerator(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.method in ['PUT', 'PATCH']:
            return request.user.groups.filter(name__in=['Moderators', 'Editors']).exists()

        if request.method in ['POST', 'DELETE']:
            return request.user.groups.filter(name='Moderators').exists()

        return False


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOnly]


class RegisterView(APIView):
    permission_classes = []
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user_id': user.id,
            'username': user.username,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)


class ArticlePagination(PageNumberPagination):
    page_size = 3


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    pagination_class = ArticlePagination
    filter_backends = [SearchFilter]
    search_fields = ['title', 'content', 'tags__name']

    def get_permissions(self):
        if self.request.user.is_superuser:
            return []

        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        elif self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticatedOrReadOnly(), IsEditorOrModerator(), DjangoModelPermissions()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_class(self):
        if self.action == 'comments':
            return CommentSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        article = self.get_object()

        if request.method == 'GET':
            comments = article.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CommentSerializer(
                data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(article=article, author=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CanManageComment(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.method == 'POST':
            return request.user and request.user.is_authenticated and (
                request.user.groups.filter(
                    name__in=['Members', 'Moderators']).exists()
            )

        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return request.user and request.user.is_authenticated

        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if request.user.groups.filter(name='Members').exists():
                return obj.author == request.user

            return request.user.groups.filter(name__in=['Moderators', 'Editors']).exists()

        return False


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


    def get_permissions(self):
        if self.request.user.is_superuser:
            return []

        return [IsAuthenticatedOrReadOnly(), CanManageComment()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def list(self, request, *args, **kwargs):
        # present comments in a tree structure:
        res = super().list(request, *args, **kwargs)
        comments = res.data
        comments_dict = {comment["id"]: comment for comment in comments}
        root_comments = []
        for comment in comments:
            parent_id = comment["reply_to"]
            if parent_id is None:
                root_comments.append(comment)
            else:
                parent = comments_dict.get(parent_id)
                if parent:
                    if "replies" not in parent:
                        parent["replies"] = []
                    parent["replies"].append(comment)
        res.data = root_comments
        return res

    def create(self, request, *args, **kwargs):
        # prevent Article and reply_to Comment mismatch
        data = request.data
        reply_to_id = data.get("reply_to")
        article_id = try_parse_int(data.get("article"))

        if reply_to_id:
            try:
                replied = Comment.objects.get(id=reply_to_id)
            except Comment.DoesNotExist:
                return Response({"error": "Reply-to comment not found."}, status=status.HTTP_400_BAD_REQUEST)

            if replied.article.id != article_id:
                return Response(
                    {"error": "Comment being replied to must be on the same article."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().create(request, *args, **kwargs)

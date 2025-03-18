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
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from blog.utils.try_parse_int import try_parse_int


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class RegisterView(APIView):
    permission_classes = []  # Open to unauthenticated users
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


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['title', 'content', 'tags__name']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from core.auth_views import ThrottledTokenObtainPairView, ThrottledUserViewSet

schema_view = get_schema_view(
    openapi.Info(
        title="CODE WAY API",
        default_version="v1",
        description="API онлайн школы программирования CODE WAY",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path("", never_cache(TemplateView.as_view(template_name="index.html")), name="frontend"),
    path("admin/", admin.site.urls),
    # троттлинг: переопределяем регистрацию и вход до подключения djoser
    path(
        "api/auth/users/",
        ThrottledUserViewSet.as_view({"get": "list", "post": "create"}),
        name="user-list-register",
    ),
    path(
        "api/auth/jwt/create/",
        ThrottledTokenObtainPairView.as_view(),
        name="jwt-create-throttled",
    ),
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.jwt")),
    path("api/users/", include("apps.users.urls")),
    path("api/courses/", include("apps.courses.urls")),
    path("api/assessments/", include("apps.assessments.urls")),
    path("api/certificates/", include("apps.certificates.urls")),
    path("api/teaching/", include("apps.teaching.urls")),
    path("api/chat/", include("apps.chat.urls")),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

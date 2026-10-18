# Django Patterns Reference

## Table of Contents
1. [Models](#models)
2. [Serializers (DRF)](#serializers)
3. [Views & ViewSets](#views)
4. [URLs](#urls)
5. [Query Optimization](#query-optimization)
6. [Permissions & Auth](#permissions)
7. [Testing](#testing)
8. [Celery Tasks](#celery)
9. [ML Integration](#ml-integration)
10. [Admin Customization](#admin)

---

## Models

```python
# Always look for a BaseModel in the project — inherit if it exists
# Common locations: core/models.py, common/models.py, users/models.py

class Product(BaseModel):  # or models.Model if no BaseModel
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        "Category",
        on_delete=models.PROTECT,  # PROTECT > CASCADE for important FK
        related_name="products",
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
        ]

    def __str__(self):
        return self.name
```

**When adding fields**: always run `python manage.py makemigrations` after model changes.
Never skip migrations — they're not optional.

---

## Serializers

```python
# ModelSerializer for standard CRUD, Serializer for custom shapes
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    
    class Meta:
        model = Product
        fields = ["id", "name", "slug", "price", "category", "category_name", "is_active"]
        read_only_fields = ["id", "slug"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value

    def validate(self, attrs):
        # Cross-field validation
        return attrs


# Separate serializers for read vs write — avoids over-exposing data
class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    class Meta:
        model = Product
        fields = ["id", "name", "price", "is_active"]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail endpoint."""
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = "__all__"
```

---

## Views

### ViewSet (preferred for full CRUD)

```python
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Owner-scoped filtering
        if self.request.user.is_authenticated and not self.request.user.is_staff:
            qs = qs.filter(owner=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
```

### Custom action on ViewSet

```python
@action(detail=True, methods=["post"], url_path="activate")
def activate(self, request, pk=None):
    product = self.get_object()
    product.is_active = True
    product.save(update_fields=["is_active"])
    return Response({"status": "activated"})
```

### APIView (for non-standard endpoints)

```python
class ProductPredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PredictRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = ml_service.predict(serializer.validated_data)
        return Response({"prediction": result}, status=status.HTTP_200_OK)
```

---

## URLs

### Cookiecutter Django pattern (versioned API)
```python
# [project]/api/v1/urls.py
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
urlpatterns = router.urls

# config/urls.py
urlpatterns = [
    path("api/v1/", include("[project].api.v1.urls")),
]
```

### Standard Django pattern
```python
# products/urls.py
router = DefaultRouter()
router.register(r"products", ProductViewSet)
urlpatterns = router.urls

# project/urls.py
urlpatterns = [
    path("api/", include("products.urls")),
]
```

---

## Query Optimization

The most common Django performance issue is the N+1 query problem. Fix it at the queryset level.

```python
# BAD — triggers N+1
products = Product.objects.all()
for p in products:
    print(p.category.name)  # 1 query per product

# GOOD — 2 queries total
products = Product.objects.select_related("category").all()

# GOOD — for ManyToMany or reverse FK
products = Product.objects.prefetch_related("tags", "reviews").all()

# GOOD — for complex prefetch with filtering
from django.db.models import Prefetch
active_reviews = Review.objects.filter(is_approved=True)
products = Product.objects.prefetch_related(
    Prefetch("reviews", queryset=active_reviews, to_attr="approved_reviews")
)

# Annotations — compute in DB instead of Python
from django.db.models import Count, Avg
products = Product.objects.annotate(
    review_count=Count("reviews"),
    avg_rating=Avg("reviews__rating"),
)

# Only fetch needed fields
products = Product.objects.only("id", "name", "price")  # defer the rest
products = Product.objects.values("id", "name")  # returns dicts, not objects
```

### Redis caching

```python
from django.core.cache import cache

def get_product_stats(product_id):
    cache_key = f"product_stats_{product_id}"
    stats = cache.get(cache_key)
    if stats is None:
        stats = compute_expensive_stats(product_id)
        cache.set(cache_key, stats, timeout=300)  # 5 minutes
    return stats

# Cache invalidation on save
class Product(models.Model):
    def save(self, *args, **kwargs):
        cache.delete(f"product_stats_{self.pk}")
        super().save(*args, **kwargs)
```

---

## Permissions

```python
# Custom permission class
from rest_framework.permissions import BasePermission

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.owner == request.user
```

```python
# JWT auth (SimpleJWT) — settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

---

## Testing

```python
# pytest-django preferred — conftest.py at project root
import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, db):
    user = User.objects.create_user(email="test@test.com", password="pass123")
    api_client.force_authenticate(user=user)
    return api_client, user


# Test file: tests/api/test_products.py
@pytest.mark.django_db
class TestProductAPI:
    def test_list_products(self, authenticated_client):
        client, user = authenticated_client
        Product.objects.create(name="Widget", price=9.99, owner=user)
        
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_create_product_invalid_price(self, authenticated_client):
        client, _ = authenticated_client
        response = client.post("/api/v1/products/", {"name": "Widget", "price": -1})
        assert response.status_code == 400
        assert "price" in response.data

    def test_update_product_wrong_owner(self, api_client, db):
        owner = User.objects.create_user(email="owner@test.com", password="pass")
        other = User.objects.create_user(email="other@test.com", password="pass")
        product = Product.objects.create(name="Widget", price=9.99, owner=owner)
        
        api_client.force_authenticate(user=other)
        response = api_client.patch(f"/api/v1/products/{product.pk}/", {"price": 5})
        assert response.status_code == 403
```

### Factory Boy
```python
# products/factories.py
import factory
from factory.django import DjangoModelFactory

class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product
    
    name = factory.Sequence(lambda n: f"Product {n}")
    price = factory.Faker("pydecimal", left_digits=3, right_digits=2, positive=True)
    owner = factory.SubFactory(UserFactory)
```

---

## Celery Tasks

```python
# products/tasks.py
from celery import shared_task
from .models import Product

@shared_task(bind=True, max_retries=3)
def process_product_async(self, product_id: int):
    try:
        product = Product.objects.get(pk=product_id)
        # ... heavy processing ...
    except Product.DoesNotExist:
        # Don't retry if object doesn't exist
        return
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


# Calling from a view
from .tasks import process_product_async

class ProductViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        product = serializer.save(owner=self.request.user)
        process_product_async.delay(product.pk)  # async
```

---

## ML Integration

```python
# products/services/ml_service.py
import joblib
import numpy as np
from pathlib import Path
from django.conf import settings

MODEL_PATH = Path(settings.BASE_DIR) / "models" / "price_predictor.pkl"

class MLService:
    _model = None  # Class-level cache — load once, reuse

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls._model = joblib.load(MODEL_PATH)
        return cls._model

    def predict(self, features: dict) -> float:
        model = self.get_model()
        feature_vector = self._extract_features(features)
        return float(model.predict([feature_vector])[0])

    def _extract_features(self, data: dict) -> list:
        return [
            data.get("weight", 0),
            data.get("size", 0),
            data.get("category_id", 0),
        ]

ml_service = MLService()  # Singleton


# Async prediction via Celery
@shared_task
def predict_async(product_id: int):
    product = Product.objects.get(pk=product_id)
    features = {"weight": product.weight, "category_id": product.category_id}
    prediction = ml_service.predict(features)
    product.predicted_price = prediction
    product.save(update_fields=["predicted_price"])
```

---

## Admin Customization

```python
from django.contrib import admin
from django.utils.html import format_html

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "category", "is_active", "created_at", "price_badge"]
    list_filter = ["is_active", "category"]
    search_fields = ["name", "description"]
    list_per_page = 50
    ordering = ["-created_at"]
    list_editable = ["is_active"]
    
    # Custom column
    def price_badge(self, obj):
        color = "green" if obj.price < 100 else "red"
        return format_html('<span style="color:{}">{}</span>', color, obj.price)
    price_badge.short_description = "Price"

    # Bulk action
    actions = ["mark_active", "mark_inactive"]

    @admin.action(description="Activate selected products")
    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} products activated.")

    @admin.action(description="Deactivate selected products")
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
```

---

## Custom Management Command

```python
# products/management/commands/seed_products.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Seed the database with sample products"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=10)

    def handle(self, *args, **options):
        count = options["count"]
        for i in range(count):
            Product.objects.create(name=f"Product {i}", price=9.99 + i)
        self.stdout.write(self.style.SUCCESS(f"Created {count} products"))
```

Run: `python manage.py seed_products --count=50`

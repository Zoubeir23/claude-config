# Django & FastAPI Reference

Framework-specific patterns for one-shot-feature implementation.

## Django — Analysis Checklist

When analyzing a Django project, look for:

- **Project layout**: Single app or multi-app? Where do apps live? (`apps/`, top-level, etc.)
- **Django REST Framework (DRF)**: Is it used? Check for `rest_framework` in INSTALLED_APPS
- **ViewSets vs APIViews vs function views**: Which pattern dominates?
- **Serializer style**: `ModelSerializer`, `Serializer`, or custom
- **Authentication**: Token, JWT, Session? Check DEFAULT_AUTHENTICATION_CLASSES
- **Permissions**: Custom permission classes? Check DEFAULT_PERMISSION_CLASSES
- **URL routing**: Router-based (DRF) or manual urlpatterns?
- **Database**: PostgreSQL, MySQL, SQLite? Check DATABASES setting
- **Existing mixins/base classes**: Custom BaseModel, BaseViewSet, etc.

## Django — Implementation Order

Always follow this sequence:

```
models.py → serializers.py → views.py → urls.py → tests.py
```

Each step explained:

### 1. Models (models.py)

```python
# Follow existing model patterns exactly
# If the project uses a BaseModel with created_at/updated_at, inherit from it
# If models use Meta class with ordering, add it
# If models have __str__, add it

class Feature(BaseModel):  # Reuse project's base if it exists
    name = models.CharField(max_length=255)
    # ... fields matching project conventions
    
    class Meta:
        ordering = ['-created_at']  # Only if other models do this
        verbose_name_plural = "features"
    
    def __str__(self):
        return self.name
```

After creating/modifying models, remind the developer to run:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. Serializers (serializers.py)

```python
# Match the serializer pattern used in the project
# If they use ModelSerializer everywhere, use ModelSerializer
# If they have nested serializers, follow the same depth pattern

class FeatureSerializer(serializers.ModelSerializer):
    # Add computed fields if the project uses them
    
    class Meta:
        model = Feature
        fields = ['id', 'name', ...]  # or '__all__' if project uses it
        read_only_fields = ['id', 'created_at']
```

### 3. Views (views.py)

```python
# Match the view pattern: ViewSet, APIView, or function-based
# Reuse existing permission classes and mixins

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [IsAuthenticated]  # Match project's auth pattern
    
    # Add custom actions with @action decorator if needed
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        ...
```

### 4. URLs (urls.py)

```python
# If using DRF Router, register the viewset
router.register(r'features', FeatureViewSet)

# If using manual urlpatterns, match existing pattern
urlpatterns = [
    path('api/features/', FeatureListView.as_view()),
    path('api/features/<int:pk>/', FeatureDetailView.as_view()),
]
```

### 5. Tests (tests.py or tests/)

```python
# Match testing framework: Django TestCase, pytest, or DRF APITestCase
# Follow existing test organization (single file vs tests/ directory)

class FeatureAPITestCase(APITestCase):
    def setUp(self):
        # Create test data matching project's fixture style
        self.user = User.objects.create_user(...)
        self.client.force_authenticate(user=self.user)
    
    def test_create_feature(self):
        response = self.client.post('/api/features/', {...})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_feature_invalid_data(self):
        response = self.client.post('/api/features/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
```

## Django — Common Patterns to Reuse

Look for and reuse these if they exist:

| Component | Where to find it | How to reuse |
|-----------|-----------------|--------------|
| BaseModel | `core/models.py` or `common/models.py` | Inherit: `class Feature(BaseModel)` |
| Custom permissions | `permissions.py` | Add to `permission_classes` |
| Pagination | settings or `pagination.py` | Usually auto-applied via DRF settings |
| Exception handler | `exception_handler.py` | Already active if in settings |
| Custom mixins | `mixins.py` | Inherit in views/serializers |
| Signal patterns | `signals.py` | Follow same pattern for new signals |
| Manager/QuerySet | model files | Extend existing managers |

## Django — Validation Patterns

```python
# Model-level validation
def clean(self):
    if self.start_date > self.end_date:
        raise ValidationError("Start date must be before end date")

# Serializer-level validation
def validate_email(self, value):
    if User.objects.filter(email=value).exists():
        raise serializers.ValidationError("Email already exists")

def validate(self, attrs):
    # Cross-field validation
    if attrs['start'] > attrs['end']:
        raise serializers.ValidationError("Invalid date range")
    return attrs
```

## Django — Error Response Patterns

Match the project's error format. Common patterns:

```python
# DRF default
{"detail": "Not found."}

# Custom format (check if project uses this)
{"error": {"code": "not_found", "message": "Resource not found"}}

# If project has custom exception handler, use its format
```

---

## FastAPI — Key Differences

FastAPI shares Python conventions with Django but has its own patterns:

- **Pydantic models** instead of serializers — check for existing `schemas.py` or `models/`
- **Dependency injection** via `Depends()` — reuse existing dependencies
- **Router organization** — check if routes use `APIRouter` and how they're included
- **Database**: SQLAlchemy or Tortoise ORM — match the existing ORM pattern
- **Async vs sync** — check if the project uses `async def` or regular `def` for endpoints

### FastAPI implementation order

```
schemas.py (Pydantic) → models.py (ORM) → services.py → routes.py → tests/
```
